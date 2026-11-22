import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { AppConfig } from '../config/app-config.service.js';
import { AppMetrics } from '../observability/app-metrics.js';
import {
  BallotService,
  type BallotPosition,
} from '../elections/ballot.service.js';
import {
  Election,
  ElectionPhase,
  ElectionStatus,
} from '../elections/entities/election.entity.js';
import { EmailTemplateType } from '../elections/entities/email-template.entity.js';
import { ElectionMailer } from '../voters/election-mailer.js';
import { Voter } from '../voters/entities/voter.entity.js';
import { OtpService } from '../voters/otp.service.js';
import { BallotSelectionValidator } from './ballot-selection.validator.js';
import type { CastVoteDto, VoterCredentialsDto } from './dto/voting.dto.js';
import { Vote } from './entities/vote.entity.js';

export interface PublicElectionView {
  id: string;
  title: string;
  description: string;
  startAt: Date;
  endAt: Date;
  phase: ElectionPhase;
  branding: Election['branding'];
  ballot: BallotPosition[];
}

export interface VoteReceipt {
  votedAt: Date;
  positionsVoted: number;
}

/** What checking a voter's email + code found. Failures are reported after the transaction commits. */
type VoterCheck =
  | { ok: true; voter: Voter }
  | { ok: false; reason: 'invalid' | 'locked' | 'already-voted' };

@Injectable()
export class VotingService {
  private readonly logger = new Logger(VotingService.name);

  constructor(
    @InjectRepository(Election)
    private readonly elections: Repository<Election>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly ballot: BallotService,
    private readonly otp: OtpService,
    private readonly mailer: ElectionMailer,
    private readonly config: AppConfig,
    private readonly metrics: AppMetrics,
  ) {}

  /** The voter-facing page: only for launched elections. Draft elections don't exist publicly. */
  async getPublicElection(electionId: string): Promise<PublicElectionView> {
    const election = await this.findLaunched(electionId);
    return {
      id: election.id,
      title: election.title,
      description: election.description,
      startAt: election.startAt,
      endAt: election.endAt,
      phase: election.phaseAt(),
      branding: election.branding,
      ballot: await this.ballot.getBallot(election.id),
    };
  }

  /** Lets the frontend check a voter's email + code before showing the ballot. */
  async verifyVoter(electionId: string, dto: VoterCredentialsDto) {
    const election = await this.findLaunched(electionId);
    VotingService.assertOpen(election);

    const check = await this.dataSource.transaction((manager) =>
      this.checkVoter(manager, election.id, dto),
    );
    this.recordCheck(check, 'verify');
    const voter = VotingService.unwrap(check);
    return {
      voter: { email: voter.email, fullName: voter.fullName },
      hasVoted: false,
    };
  }

  /**
   * Records a ballot. Inside one transaction the voter's row is locked
   * (SELECT ... FOR UPDATE), so two simultaneous submissions can't both succeed:
   * the second waits, then sees hasVoted = true.
   */
  async castVote(electionId: string, dto: CastVoteDto): Promise<VoteReceipt> {
    const election = await this.findLaunched(electionId);
    VotingService.assertOpen(election);

    const ballot = await this.ballot.getBallot(election.id);
    const problems = BallotSelectionValidator.validate(ballot, dto.selections);
    if (problems.length > 0) {
      this.metrics.ballotRejected('invalid_selection');
      throw new UnprocessableEntityException({
        message: 'Your ballot is not valid',
        errors: problems,
      });
    }

    const votedAt = new Date();
    const outcome = await this.dataSource.transaction(async (manager) => {
      const check = await this.checkVoter(manager, election.id, dto);
      if (!check.ok) return check;

      await manager.insert(
        Vote,
        dto.selections.map((selection) => ({
          electionId: election.id,
          positionId: selection.positionId,
          candidateId: selection.candidateId,
        })),
      );
      await manager.update(
        Voter,
        { id: check.voter.id },
        { hasVoted: true, votedAt, otpHash: null },
      );
      return check;
    });

    this.recordCheck(outcome, 'vote');
    const voter = VotingService.unwrap(outcome);
    this.metrics.ballotCast(dto.selections.length);
    this.sendConfirmation(election, voter);
    return { votedAt, positionsVoted: dto.selections.length };
  }

  /**
   * Locks the voter's row and checks their code. A wrong code counts against
   * OTP_MAX_ATTEMPTS; the counter is written in this transaction, which the caller
   * commits (failures are returned, not thrown, so the count isn't rolled back).
   */
  private async checkVoter(
    manager: EntityManager,
    electionId: string,
    credentials: VoterCredentialsDto,
  ): Promise<VoterCheck> {
    const voter = await manager
      .getRepository(Voter)
      .createQueryBuilder('voter')
      .addSelect('voter.otpHash')
      .setLock('pessimistic_write')
      .where('voter.electionId = :electionId AND voter.email = :email', {
        electionId,
        email: credentials.email,
      })
      .getOne();

    if (!voter) return { ok: false, reason: 'invalid' };
    if (voter.hasVoted) return { ok: false, reason: 'already-voted' };

    const maxAttempts = this.config.otp.maxAttempts;
    if (voter.isLocked(maxAttempts)) return { ok: false, reason: 'locked' };

    if (!this.otp.verify(voter.id, credentials.otp, voter.otpHash)) {
      await manager.increment(Voter, { id: voter.id }, 'failedOtpAttempts', 1);
      return {
        ok: false,
        reason:
          voter.failedOtpAttempts + 1 >= maxAttempts ? 'locked' : 'invalid',
      };
    }
    return { ok: true, voter };
  }

  private recordCheck(check: VoterCheck, step: 'verify' | 'vote'): void {
    const outcome = check.ok
      ? 'ok'
      : check.reason === 'already-voted'
        ? 'already_voted'
        : check.reason;
    this.metrics.voterCheck(outcome, step);
  }

  private static unwrap(check: VoterCheck): Voter {
    if (check.ok) return check.voter;
    switch (check.reason) {
      case 'already-voted':
        throw new ConflictException('You have already voted in this election');
      case 'locked':
        throw new ForbiddenException(
          'Too many incorrect codes. Ask the election organiser to send you a new invitation.',
        );
      default:
        // Same message for unknown email and wrong code: no hint about who is on the roll.
        throw new UnauthorizedException(
          'That email and code do not match our voter list',
        );
    }
  }

  private async findLaunched(electionId: string): Promise<Election> {
    const election = await this.elections.findOneBy({
      id: electionId,
      status: ElectionStatus.Launched,
    });
    if (!election) throw new NotFoundException('Election not found');
    return election;
  }

  private static assertOpen(election: Election): void {
    const phase = election.phaseAt();
    if (phase === ElectionPhase.Upcoming)
      throw new ForbiddenException('Voting has not opened yet');
    if (phase === ElectionPhase.Ended)
      throw new ForbiddenException('Voting has closed');
  }

  /** Best effort, after the vote is committed: a mail problem must never undo a vote. */
  private sendConfirmation(election: Election, voter: Voter): void {
    void this.mailer
      .composerFor(election, EmailTemplateType.Confirmation)
      .then((composer) => this.mailer.send(composer.compose(voter)))
      .catch((error: unknown) =>
        this.logger.warn(`Confirmation email failed: ${String(error)}`),
      );
  }
}
