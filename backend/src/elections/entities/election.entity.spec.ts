import { Election, ElectionPhase, ElectionStatus } from './election.entity.js';

function election(status: ElectionStatus): Election {
  return Object.assign(new Election(), {
    status,
    startAt: new Date('2027-01-01T10:00:00Z'),
    endAt: new Date('2027-01-01T18:00:00Z'),
  });
}

describe('Election', () => {
  it('is always a draft until launched, whatever the clock says', () => {
    const draft = election(ElectionStatus.Draft);
    expect(draft.phaseAt(new Date('2027-01-01T12:00:00Z'))).toBe(
      ElectionPhase.Draft,
    );
    expect(draft.isOpenForVoting(new Date('2027-01-01T12:00:00Z'))).toBe(false);
  });

  it('moves through upcoming, active and ended once launched', () => {
    const launched = election(ElectionStatus.Launched);
    expect(launched.phaseAt(new Date('2027-01-01T09:59:59Z'))).toBe(
      ElectionPhase.Upcoming,
    );
    expect(launched.phaseAt(new Date('2027-01-01T10:00:00Z'))).toBe(
      ElectionPhase.Active,
    );
    expect(launched.phaseAt(new Date('2027-01-01T18:00:00Z'))).toBe(
      ElectionPhase.Ended,
    );
  });

  it('can be deleted as a draft or after it ends, not while it is scheduled or open', () => {
    const launched = election(ElectionStatus.Launched);
    expect(election(ElectionStatus.Draft).canBeDeleted()).toBe(true);
    expect(launched.canBeDeleted(new Date('2027-01-01T09:00:00Z'))).toBe(false);
    expect(launched.canBeDeleted(new Date('2027-01-01T12:00:00Z'))).toBe(false);
    expect(launched.canBeDeleted(new Date('2027-01-02T00:00:00Z'))).toBe(true);
  });
});
