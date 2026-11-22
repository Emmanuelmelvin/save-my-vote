import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import type { Election } from '../../elections/entities/election.entity.js';
import type { Position } from '../../elections/entities/position.entity.js';
import type { Candidate } from '../../elections/entities/candidate.entity.js';

/**
 * One choice on a cast ballot.
 *
 * Secret ballot: a vote has no link to the voter and no timestamp, so it can't be
 * traced back to who cast it. Each voter's row records only *that* they voted;
 * the row lock taken while voting is what stops anyone voting twice.
 */
@Entity('votes')
@Index('IDX_votes_election_candidate', ['electionId', 'candidateId'])
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  electionId: string;

  @ManyToOne('Election', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'electionId' })
  election: Relation<Election>;

  @Column({ type: 'uuid' })
  positionId: string;

  @ManyToOne('Position', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'positionId' })
  position: Relation<Position>;

  @Column({ type: 'uuid' })
  candidateId: string;

  @ManyToOne('Candidate', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidateId' })
  candidate: Relation<Candidate>;
}
