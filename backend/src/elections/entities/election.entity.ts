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
import type { User } from '../../users/user.entity.js';
import type { Position } from './position.entity.js';
import type { EmailTemplate } from './email-template.entity.js';

/** Stored lifecycle state. Draft elections can be edited; launched ones are locked. */
export enum ElectionStatus {
  Draft = 'draft',
  Launched = 'launched',
}

/** Where an election is right now, derived from its status and the clock. */
export enum ElectionPhase {
  Draft = 'draft',
  Upcoming = 'upcoming',
  Active = 'active',
  Ended = 'ended',
}

export const DEFAULT_PRIMARY_COLOR = '#1050ff';

@Entity('elections')
@Index('IDX_elections_owner_created', ['ownerId', 'createdAt'])
@Index('IDX_elections_status_start', ['status', 'startAt'])
export class Election extends AbstractEntity {
  @Column({ type: 'uuid' })
  ownerId: string;

  @ManyToOne('User', (user: User) => user.elections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: Relation<User>;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'timestamptz' })
  startAt: Date;

  @Column({ type: 'timestamptz' })
  endAt: Date;

  @Column({
    type: 'enum',
    enum: ElectionStatus,
    enumName: 'election_status',
    default: ElectionStatus.Draft,
  })
  status: ElectionStatus;

  @Column({ type: 'timestamptz', nullable: true })
  launchedAt: Date | null;

  // ---- Branding ----
  @Column({ type: 'text', nullable: true })
  logoUrl: string | null;

  @Column({ type: 'varchar', length: 7, default: DEFAULT_PRIMARY_COLOR })
  primaryColor: string;

  @Column({ type: 'text', nullable: true })
  heroImageUrl: string | null;

  @OneToMany('Position', (position: Position) => position.election)
  positions: Relation<Position[]>;

  @OneToMany('EmailTemplate', (template: EmailTemplate) => template.election)
  emailTemplates: Relation<EmailTemplate[]>;

  phaseAt(now: Date = new Date()): ElectionPhase {
    if (this.status === ElectionStatus.Draft) return ElectionPhase.Draft;
    if (now < this.startAt) return ElectionPhase.Upcoming;
    if (now < this.endAt) return ElectionPhase.Active;
    return ElectionPhase.Ended;
  }

  get isDraft(): boolean {
    return this.status === ElectionStatus.Draft;
  }

  get isLaunched(): boolean {
    return this.status === ElectionStatus.Launched;
  }

  isOpenForVoting(now: Date = new Date()): boolean {
    return this.phaseAt(now) === ElectionPhase.Active;
  }

  hasEnded(now: Date = new Date()): boolean {
    return this.phaseAt(now) === ElectionPhase.Ended;
  }

  /** Launched elections can't be deleted while voters may still be using them. */
  canBeDeleted(now: Date = new Date()): boolean {
    const phase = this.phaseAt(now);
    return phase === ElectionPhase.Draft || phase === ElectionPhase.Ended;
  }

  get branding() {
    return {
      logoUrl: this.logoUrl,
      primaryColor: this.primaryColor,
      heroImageUrl: this.heroImageUrl,
    };
  }
}
