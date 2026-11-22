import { Column, Entity, Index, OneToMany, type Relation } from 'typeorm';
import { AbstractEntity } from '../common/entities/abstract.entity.js';
import type { Election } from '../elections/entities/election.entity.js';

export enum OrganizationType {
  Institution = 'institution',
  Organisation = 'organisation',
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  organizationType: OrganizationType | null;
  organizationName: string | null;
  isVerified: boolean;
  hasGoogleAccount: boolean;
  createdAt: Date;
}

/** An election organiser: the person who signs in and runs elections. */
@Entity('users')
export class User extends AbstractEntity {
  @Index('UQ_users_email', { unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  /** Whom the organiser runs elections for (asked at sign-up). */
  @Column({
    type: 'enum',
    enum: OrganizationType,
    enumName: 'organization_type',
    nullable: true,
  })
  organizationType: OrganizationType | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  organizationName: string | null;

  /** scrypt hash; never loaded unless explicitly selected. Null for Google-only accounts. */
  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  passwordHash: string | null;

  @Index('UQ_users_google_id', { unique: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  googleId: string | null;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  verificationEmailSentAt: Date | null;

  /** Tokens issued before this moment are rejected, and reset links can only be used once. */
  @Column({ type: 'timestamptz', nullable: true })
  passwordChangedAt: Date | null;

  @OneToMany('Election', (election: Election) => election.owner)
  elections: Relation<Election[]>;

  get firstName(): string {
    return this.fullName.trim().split(/\s+/)[0] ?? this.fullName;
  }

  /** Version stamp embedded in password-reset tokens so each link works once. */
  get passwordVersion(): number {
    return this.passwordChangedAt?.getTime() ?? 0;
  }

  toProfile(): UserProfile {
    return {
      id: this.id,
      email: this.email,
      fullName: this.fullName,
      organizationType: this.organizationType,
      organizationName: this.organizationName,
      isVerified: this.isVerified,
      hasGoogleAccount: Boolean(this.googleId),
      createdAt: this.createdAt,
    };
  }
}
