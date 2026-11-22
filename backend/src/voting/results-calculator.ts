import type { BallotPosition } from '../elections/ballot.service.js';

export interface CandidateResult {
  candidateId: string;
  name: string;
  photoUrl: string | null;
  votes: number;
  /** Share of this position's votes, to two decimal places. */
  percentage: number;
}

export interface PositionResult {
  positionId: string;
  title: string;
  totalVotes: number;
  /** Sorted by votes, highest first. */
  candidates: CandidateResult[];
  /** Ids of the candidate(s) with the most votes; more than one means a tie. Empty with no votes. */
  winnerIds: string[];
  isTie: boolean;
}

/** Turns raw per-candidate counts into per-position results. Percentages are per position. */
export class ResultsCalculator {
  static calculate(
    ballot: BallotPosition[],
    votesByCandidate: Map<string, number>,
  ): PositionResult[] {
    return ballot.map((position) => {
      const counted = position.candidates.map((candidate) => ({
        candidateId: candidate.id,
        name: candidate.name,
        photoUrl: candidate.photoUrl,
        votes: votesByCandidate.get(candidate.id) ?? 0,
      }));
      const totalVotes = counted.reduce(
        (sum, candidate) => sum + candidate.votes,
        0,
      );
      const candidates = counted
        .map((candidate) => ({
          ...candidate,
          percentage:
            totalVotes === 0
              ? 0
              : Math.round((candidate.votes / totalVotes) * 10_000) / 100,
        }))
        .sort((a, b) => b.votes - a.votes);

      const topVotes = candidates[0]?.votes ?? 0;
      const winnerIds =
        topVotes === 0
          ? []
          : candidates
              .filter((c) => c.votes === topVotes)
              .map((c) => c.candidateId);

      return {
        positionId: position.id,
        title: position.title,
        totalVotes,
        candidates,
        winnerIds,
        isTie: winnerIds.length > 1,
      };
    });
  }
}
