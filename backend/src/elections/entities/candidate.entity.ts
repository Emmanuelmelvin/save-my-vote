import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  type Relation,
} from 'typeorm';
import { AbstractEntity } from '../../common/entities/abstract.entity.js';
import type { Election } from './election.entity.js';
import type { Position } from './position.entity.js';

@Entity('candidates')
@Index('IDX_candidates_position_order', ['positionId', 'sortOrder'])
@Index('IDX_candidates_election', ['electionId'])
export class Candidate extends AbstractEntity {
  /** Kept alongside positionId so ballot and result queries stay scoped to one election. */
  @Column({ type: 'uuid' })
  electionId: string;

  @ManyToOne('Election', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'electionId' })
  election: Relation<Election>;

  @Column({ type: 'uuid' })
  positionId: string;

  @ManyToOne('Position', (position: Position) => position.candidates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'positionId' })
  position: Relation<Position>;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  photoUrl: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;
}
