import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  type Relation,
} from 'typeorm';
import { AbstractEntity } from '../../common/entities/abstract.entity.js';
import type { Election } from './election.entity.js';
import type { Candidate } from './candidate.entity.js';

/** A seat on the ballot (e.g. "President"); voters pick one candidate per position. */
@Entity('positions')
@Index('IDX_positions_election_order', ['electionId', 'sortOrder'])
export class Position extends AbstractEntity {
  @Column({ type: 'uuid' })
  electionId: string;

  @ManyToOne('Election', (election: Election) => election.positions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'electionId' })
  election: Relation<Election>;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @OneToMany('Candidate', (candidate: Candidate) => candidate.position)
  candidates: Relation<Candidate[]>;
}
