import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Voter } from '../voters/entities/voter.entity.js';
import { Vote } from '../voting/entities/vote.entity.js';

export class ElectionStats {
  constructor(
    readonly totalVoters: number,
    readonly votersWhoVoted: number,
    readonly totalVotes: number,
  ) {}

  static empty(): ElectionStats {
    return new ElectionStats(0, 0, 0);
  }

  /** Percentage of the roll that has voted, to one decimal place. */
  get turnout(): number {
    return this.totalVoters === 0
      ? 0
      : Math.round((this.votersWhoVoted / this.totalVoters) * 1000) / 10;
  }

  toJSON() {
    return {
      totalVoters: this.totalVoters,
      votersWhoVoted: this.votersWhoVoted,
      turnout: this.turnout,
      totalVotes: this.totalVotes,
    };
  }
}

/** Turnout numbers for many elections in two grouped queries (no per-election N+1). */
@Injectable()
export class ElectionStatsService {
  constructor(
    @InjectRepository(Voter) private readonly voters: Repository<Voter>,
    @InjectRepository(Vote) private readonly votes: Repository<Vote>,
  ) {}

  async forElection(electionId: string): Promise<ElectionStats> {
    return (
      (await this.forElections([electionId])).get(electionId) ??
      ElectionStats.empty()
    );
  }

  async forElections(
    electionIds: string[],
  ): Promise<Map<string, ElectionStats>> {
    const stats = new Map<string, ElectionStats>();
    if (electionIds.length === 0) return stats;

    const voterRows = await this.voters
      .createQueryBuilder('voter')
      .select('voter.electionId', 'electionId')
      .addSelect('COUNT(*)::int', 'total')
      .addSelect('COUNT(*) FILTER (WHERE voter."hasVoted")::int', 'voted')
      .where({ electionId: In(electionIds) })
      .groupBy('voter.electionId')
      .getRawMany<{ electionId: string; total: number; voted: number }>();

    const voteRows = await this.votes
      .createQueryBuilder('vote')
      .select('vote.electionId', 'electionId')
      .addSelect('COUNT(*)::int', 'total')
      .where({ electionId: In(electionIds) })
      .groupBy('vote.electionId')
      .getRawMany<{ electionId: string; total: number }>();

    const voteTotals = new Map(
      voteRows.map((row) => [row.electionId, Number(row.total)]),
    );
    for (const id of electionIds) stats.set(id, ElectionStats.empty());
    for (const row of voterRows) {
      stats.set(
        row.electionId,
        new ElectionStats(
          Number(row.total),
          Number(row.voted),
          voteTotals.get(row.electionId) ?? 0,
        ),
      );
    }
    for (const [id, total] of voteTotals) {
      const current = stats.get(id) ?? ElectionStats.empty();
      stats.set(
        id,
        new ElectionStats(current.totalVoters, current.votersWhoVoted, total),
      );
    }
    return stats;
  }
}
