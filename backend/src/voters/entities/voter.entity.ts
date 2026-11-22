import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  Unique,
  type Relation,
} from 'typeorm';
import { AbstractEntity } from '../../common/entities/abstract.entity.js';
import type { Election } from '../../elections/entities/election.entity.js';

export interface VoterSummary {
  id: string;
  email: string;
  fullName: string | null;
  invited: boolean;
  invitationSentAt: Date | null;
  hasVoted: boolean;
  votedAt: Date | null;
  locked: boolean;
}

/**
 * A person on one election's voter roll. Each election keeps its own roll,
 * so one organiser's import never changes another election's data.
 */
@Entity('voters')
@Unique('UQ_voters_election_email', ['electionId', 'email'])
@Index('IDX_voters_election_invitation', ['electionId', 'invitationSentAt'])
export class Voter extends AbstractEntity {
  @Column({ type: 'uuid' })
  electionId: string;

  @ManyToOne('Election', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'electionId' })
  election: Relation<Election>;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fullName: string | null;

  /** HMAC of the current one-time code; the code itself is never stored. */
  @Column({ type: 'varchar', length: 64, nullable: true, select: false })
  otpHash: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  otpIssuedAt: Date | null;

  @Column({ type: 'int', default: 0 })
  failedOtpAttempts: number;

  @Column({ type: 'timestamptz', nullable: true })
  invitationSentAt: Date | null;

  @Column({ type: 'int', default: 0 })
  invitationFailures: number;

  @Column({ type: 'boolean', default: false })
  hasVoted: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  votedAt: Date | null;

  get displayName(): string {
    return this.fullName?.trim() || this.email.split('@')[0];
  }

  isLocked(maxAttempts: number): boolean {
    return this.failedOtpAttempts >= maxAttempts;
  }

  toSummary(maxAttempts: number): VoterSummary {
    return {
      id: this.id,
      email: this.email,
      fullName: this.fullName,
      invited: Boolean(this.invitationSentAt),
      invitationSentAt: this.invitationSentAt,
      hasVoted: this.hasVoted,
      votedAt: this.votedAt,
      locked: this.isLocked(maxAttempts),
    };
  }
}
