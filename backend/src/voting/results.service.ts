import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BallotService } from '../elections/ballot.service.js';
import { ElectionAccessService } from '../elections/election-access.service.js';
import {
  ElectionStatsService,
  type ElectionStats,
} from '../elections/election-stats.service.js';
import {
  Election,
  ElectionPhase,
  ElectionStatus,
} from '../elections/entities/election.entity.js';
import {
  ResultsCalculator,
  type PositionResult,
} from './results-calculator.js';
import { Vote } from './entities/vote.entity.js';

export interface ElectionResults {
  election: {
    id: string;
    title: string;
    startAt: Date;
    endAt: Date;
    phase: ElectionPhase;
  };
  /** False while voting is still open: the numbers can still change. */
  isFinal: boolean;
  analytics: ReturnType<ElectionStats['toJSON']>;
  positions: PositionResult[];
}

@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(Vote) private readonly votes: Repository<Vote>,
    @InjectRepository(Election)
    private readonly elections: Repository<Election>,
    private readonly access: ElectionAccessService,
    private readonly ballot: BallotService,
    private readonly stats: ElectionStatsService,
  ) {}

  /** Organisers can watch results at any time. */
  async forOwner(
    ownerId: string,
    electionId: string,
  ): Promise<ElectionResults> {
    return this.build(await this.access.findOwned(ownerId, electionId));
  }

  /** Anyone can see results, but only once voting has closed. */
  async forPublic(electionId: string): Promise<ElectionResults> {
    const election = await this.elections.findOneBy({
      id: electionId,
      status: ElectionStatus.Launched,
    });
    if (!election) throw new NotFoundException('Election not found');
    if (!election.hasEnded())
      throw new ForbiddenException('Results are published when voting closes');
    return this.build(election);
  }

  private async build(election: Election): Promise<ElectionResults> {
    const [ballot, counts, stats] = await Promise.all([
      this.ballot.getBallot(election.id),
      this.countVotes(election.id),
      this.stats.forElection(election.id),
    ]);
    const phase = election.phaseAt();
    return {
      election: {
        id: election.id,
        title: election.title,
        startAt: election.startAt,
        endAt: election.endAt,
        phase,
      },
      isFinal: phase === ElectionPhase.Ended,
      analytics: stats.toJSON(),
      positions: ResultsCalculator.calculate(ballot, counts),
    };
  }

  private async countVotes(electionId: string): Promise<Map<string, number>> {
    const rows = await this.votes
      .createQueryBuilder('vote')
      .select('vote.candidateId', 'candidateId')
      .addSelect('COUNT(*)::int', 'votes')
      .where('vote.electionId = :electionId', { electionId })
      .groupBy('vote.candidateId')
      .getRawMany<{ candidateId: string; votes: number }>();
    return new Map(rows.map((row) => [row.candidateId, Number(row.votes)]));
  }
}
