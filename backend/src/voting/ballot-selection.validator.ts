import type { BallotPosition } from '../elections/ballot.service.js';

export interface Selection {
  positionId: string;
  candidateId: string;
}

/**
 * Checks a submitted ballot against the election's ballot: exactly one valid
 * candidate for every position, nothing else. Returns every problem found
 * (empty when the ballot is valid).
 */
export class BallotSelectionValidator {
  static validate(ballot: BallotPosition[], selections: Selection[]): string[] {
    const problems: string[] = [];
    const positions = new Map(
      ballot.map((position) => [position.id, position]),
    );
    const chosen = new Set<string>();

    for (const selection of selections) {
      const position = positions.get(selection.positionId);
      if (!position) {
        problems.push(`Unknown position ${selection.positionId}`);
        continue;
      }
      if (chosen.has(position.id)) {
        problems.push(`More than one choice for "${position.title}"`);
        continue;
      }
      chosen.add(position.id);
      if (
        !position.candidates.some(
          (candidate) => candidate.id === selection.candidateId,
        )
      ) {
        problems.push(`That candidate is not running for "${position.title}"`);
      }
    }

    for (const position of ballot) {
      if (!chosen.has(position.id))
        problems.push(`No choice made for "${position.title}"`);
    }
    return problems;
  }
}
