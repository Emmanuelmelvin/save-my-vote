import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  In,
  IsNull,
  LessThan,
  MoreThan,
  Not,
  Repository,
  type FindOptionsWhere,
} from 'typeorm';
import { AppConfig } from '../config/app-config.service.js';
import { AdvisoryLockService } from '../common/database/advisory-lock.service.js';
import { ElectionAccessService } from '../elections/election-access.service.js';
import {
  Election,
  ElectionPhase,
} from '../elections/entities/election.entity.js';
import { EmailTemplateType } from '../elections/entities/email-template.entity.js';
import { AppMetrics } from '../observability/app-metrics.js';
import {
  ElectionMailer,
  type ElectionEmailComposer,
} from './election-mailer.js';
import { Voter, type VoterSummary } from './entities/voter.entity.js';
import { OtpService } from './otp.service.js';

export interface DispatchResult {
  sent: number;
  failed: number;
}

/** After this many failed sends, a voter is skipped by the scheduler (the organiser can still resend). */
export const MAX_INVITATION_FAILURES = 5;
/** Matches Resend's batch limit, so each page of voters is one API request. */
const BATCH_SIZE = 100;
const FIRST_UUID = '00000000-0000-0000-0000-000000000000';

/**
 * Issues one-time codes and emails them. Codes are generated fresh for each email
 * and only their hash is kept, so a new email always invalidates the previous code.
 *
 * One run per election at a time, across all API instances (advisory lock), so a
 * voter never gets two different codes from overlapping runs.
 */
@Injectable()
export class VoterInvitationService {
  private readonly logger = new Logger(VoterInvitationService.name);

  constructor(
    @InjectRepository(Voter) private readonly voters: Repository<Voter>,
    private readonly otp: OtpService,
    private readonly mailer: ElectionMailer,
    private readonly locks: AdvisoryLockService,
    private readonly access: ElectionAccessService,
    private readonly config: AppConfig,
    private readonly metrics: AppMetrics,
  ) {}

  /** Called by the scheduler. Returns null if another run holds this election's lock. */
  async dispatchPendingInvitations(
    election: Election,
  ): Promise<DispatchResult | null> {
    const run = await this.locks.tryWithLock(
      VoterInvitationService.lockKey(election.id),
      () => this.sendPending(election),
    );
    return run.acquired ? run.result : null;
  }

  /** Organiser's "send invitations now" button: sends to everyone not yet invited. */
  async sendInvitationsNow(
    ownerId: string,
    electionId: string,
  ): Promise<DispatchResult> {
    const election = await this.access.findOwned(ownerId, electionId);
    VoterInvitationService.assertCanEmailVoters(election);
    const run = await this.locks.tryWithLock(
      VoterInvitationService.lockKey(election.id),
      () => this.sendPending(election, { includeFailed: true }),
    );
    if (!run.acquired)
      throw new ConflictException(
        'Invitations for this election are already being sent',
      );
    return run.result;
  }

  /** Re-sends one voter's invitation with a new code (e.g. they lost the email or got locked out). */
  async resendInvitation(
    ownerId: string,
    electionId: string,
    voterId: string,
  ): Promise<VoterSummary> {
    const election = await this.access.findOwned(ownerId, electionId);
    VoterInvitationService.assertCanEmailVoters(election);
    const voter = await this.voters.findOneBy({ id: voterId, electionId });
    if (!voter) throw new NotFoundException('Voter not found');
    if (voter.hasVoted)
      throw new ConflictException('This voter has already voted');

    const run = await this.locks.tryWithLock(
      VoterInvitationService.lockKey(election.id),
      async () => {
        const composer = await this.mailer.composerFor(
          election,
          EmailTemplateType.Invitation,
        );
        return this.issueCodesAndSend(
          [voter],
          composer,
          EmailTemplateType.Invitation,
        );
      },
    );
    if (!run.acquired)
      throw new ConflictException(
        'Invitations for this election are being sent; try again shortly',
      );
    if (run.result.sent !== 1)
      throw new ConflictException(
        'The email could not be sent; please try again',
      );

    const refreshed = (await this.voters.findOneBy({ id: voterId })) as Voter;
    return refreshed.toSummary(this.config.otp.maxAttempts);
  }

  /** Emails everyone who was invited but hasn't voted, each with a fresh code. Only while voting is open. */
  async sendReminders(
    ownerId: string,
    electionId: string,
  ): Promise<DispatchResult> {
    const election = await this.access.findOwned(ownerId, electionId);
    if (election.phaseAt() !== ElectionPhase.Active) {
      throw new ConflictException(
        'Reminders can only be sent while voting is open',
      );
    }
    const run = await this.locks.tryWithLock(
      VoterInvitationService.lockKey(election.id),
      () =>
        this.sendInPages(election, EmailTemplateType.Reminder, {
          electionId,
          hasVoted: false,
          invitationSentAt: Not(IsNull()),
        }),
    );
    if (!run.acquired)
      throw new ConflictException(
        'Emails for this election are already being sent',
      );
    return run.result;
  }

  private async sendPending(
    election: Election,
    options: { includeFailed?: boolean } = {},
  ): Promise<DispatchResult> {
    const result = await this.sendInPages(
      election,
      EmailTemplateType.Invitation,
      {
        electionId: election.id,
        hasVoted: false,
        invitationSentAt: IsNull(),
        ...(options.includeFailed
          ? {}
          : { invitationFailures: LessThan(MAX_INVITATION_FAILURES) }),
      },
    );
    if (result.sent + result.failed > 0) {
      this.logger.log(
        `Election ${election.id}: ${result.sent} invitation(s) sent, ${result.failed} failed`,
      );
    }
    return result;
  }

  /** Walks the matching voters in id order, one page (= one batch email request) at a time. */
  private async sendInPages(
    election: Election,
    kind: EmailTemplateType.Invitation | EmailTemplateType.Reminder,
    where: FindOptionsWhere<Voter>,
  ): Promise<DispatchResult> {
    const composer = await this.mailer.composerFor(election, kind);
    const total: DispatchResult = { sent: 0, failed: 0 };
    let afterId = FIRST_UUID;
    for (;;) {
      const page = await this.voters.find({
        where: { ...where, id: MoreThan(afterId) },
        order: { id: 'ASC' },
        take: BATCH_SIZE,
      });
      if (page.length === 0) break;
      afterId = page[page.length - 1].id;
      const result = await this.issueCodesAndSend(page, composer, kind);
      total.sent += result.sent;
      total.failed += result.failed;
    }
    return total;
  }

  /**
   * Stores each voter's new code hash first, then emails the whole page in one
   * batch. A rejected batch counts as a failure for every voter in it; their
   * failure counter goes up and the scheduler retries on a later run.
   */
  private async issueCodesAndSend(
    voters: Voter[],
    composer: ElectionEmailComposer,
    kind: EmailTemplateType.Invitation | EmailTemplateType.Reminder,
  ): Promise<DispatchResult> {
    const issued: Array<{ voter: Voter; code: string }> = [];
    const now = new Date();
    for (const voter of voters) {
      const code = this.otp.generate();
      const update = await this.voters.update(
        { id: voter.id, hasVoted: false },
        {
          otpHash: this.otp.hash(voter.id, code),
          otpIssuedAt: now,
          failedOtpAttempts: 0,
        },
      );
      if (update.affected) issued.push({ voter, code }); // else: voted in the meantime
    }
    if (issued.length === 0) return { sent: 0, failed: 0 };

    const ids = issued.map(({ voter }) => voter.id);
    try {
      await this.mailer.sendMany(
        issued.map(({ voter, code }) => composer.compose(voter, code)),
      );
    } catch (error) {
      this.logger.error(
        `Sending ${issued.length} ${kind} email(s) failed: ${String(error)}`,
      );
      await this.voters.increment({ id: In(ids) }, 'invitationFailures', 1);
      this.metrics.voterEmails(kind, 0, issued.length);
      return { sent: 0, failed: issued.length };
    }

    if (kind === EmailTemplateType.Invitation) {
      await this.voters.update(
        { id: In(ids) },
        { invitationSentAt: new Date(), invitationFailures: 0 },
      );
    }
    this.metrics.voterEmails(kind, issued.length, 0);
    return { sent: issued.length, failed: 0 };
  }

  private static assertCanEmailVoters(election: Election): void {
    const phase = election.phaseAt();
    if (phase === ElectionPhase.Draft)
      throw new ConflictException(
        'Launch the election before sending invitations',
      );
    if (phase === ElectionPhase.Ended)
      throw new ConflictException('This election has ended');
  }

  private static lockKey(electionId: string): string {
    return `voter-emails:${electionId}`;
  }
}
