import type { BallotPosition } from '../elections/ballot.service.js';
import { BallotSelectionValidator } from './ballot-selection.validator.js';

const ballot: BallotPosition[] = [
  {
    id: 'p1',
    title: 'President',
    candidates: [
      { id: 'a', name: 'Ada', description: null, photoUrl: null },
      { id: 'b', name: 'Bob', description: null, photoUrl: null },
    ],
  },
  {
    id: 'p2',
    title: 'Secretary',
    candidates: [{ id: 'c', name: 'Cy', description: null, photoUrl: null }],
  },
];

describe('BallotSelectionValidator', () => {
  it('accepts one valid choice per position', () => {
    expect(
      BallotSelectionValidator.validate(ballot, [
        { positionId: 'p1', candidateId: 'b' },
        { positionId: 'p2', candidateId: 'c' },
      ]),
    ).toEqual([]);
  });

  it('reports missing positions', () => {
    expect(
      BallotSelectionValidator.validate(ballot, [
        { positionId: 'p1', candidateId: 'a' },
      ]),
    ).toEqual(['No choice made for "Secretary"']);
  });

  it('rejects two choices for one position', () => {
    const problems = BallotSelectionValidator.validate(ballot, [
      { positionId: 'p1', candidateId: 'a' },
      { positionId: 'p1', candidateId: 'b' },
      { positionId: 'p2', candidateId: 'c' },
    ]);
    expect(problems).toEqual(['More than one choice for "President"']);
  });

  it('rejects a candidate from another position and unknown positions', () => {
    const problems = BallotSelectionValidator.validate(ballot, [
      { positionId: 'p1', candidateId: 'c' },
      { positionId: 'p2', candidateId: 'c' },
      { positionId: 'zzz', candidateId: 'a' },
    ]);
    expect(problems).toEqual([
      'That candidate is not running for "President"',
      'Unknown position zzz',
    ]);
  });
});
