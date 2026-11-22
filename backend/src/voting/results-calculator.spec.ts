import type { BallotPosition } from '../elections/ballot.service.js';
import { ResultsCalculator } from './results-calculator.js';

const ballot: BallotPosition[] = [
  {
    id: 'p1',
    title: 'President',
    candidates: [
      { id: 'a', name: 'Ada', description: null, photoUrl: null },
      { id: 'b', name: 'Bob', description: null, photoUrl: null },
      { id: 'c', name: 'Cy', description: null, photoUrl: null },
    ],
  },
  {
    id: 'p2',
    title: 'Secretary',
    candidates: [{ id: 'd', name: 'Dee', description: null, photoUrl: null }],
  },
];

describe('ResultsCalculator', () => {
  it('computes percentages per position, not across the whole election', () => {
    const [president, secretary] = ResultsCalculator.calculate(
      ballot,
      new Map([
        ['a', 3],
        ['b', 1],
        ['d', 4],
      ]),
    );
    expect(president.totalVotes).toBe(4);
    expect(president.candidates.map((c) => [c.name, c.percentage])).toEqual([
      ['Ada', 75],
      ['Bob', 25],
      ['Cy', 0],
    ]);
    expect(president.winnerIds).toEqual(['a']);
    expect(secretary.candidates[0].percentage).toBe(100);
  });

  it('reports ties', () => {
    const [president] = ResultsCalculator.calculate(
      ballot,
      new Map([
        ['a', 2],
        ['b', 2],
      ]),
    );
    expect(president.isTie).toBe(true);
    expect(president.winnerIds.sort()).toEqual(['a', 'b']);
  });

  it('has no winner when nobody voted', () => {
    const [president] = ResultsCalculator.calculate(ballot, new Map());
    expect(president.winnerIds).toEqual([]);
    expect(president.isTie).toBe(false);
    expect(president.candidates.every((c) => c.percentage === 0)).toBe(true);
  });
});
