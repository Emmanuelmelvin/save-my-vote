import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
  type Relation,
} from 'typeorm';
import { AbstractEntity } from '../../common/entities/abstract.entity.js';
import type { Election } from './election.entity.js';

export enum EmailTemplateType {
  /** Sent before the election opens, with the voter's one-time code. */
  Invitation = 'invitation',
  /** Sent on demand while the election is open, to voters who haven't voted. */
  Reminder = 'reminder',
  /** Sent right after a voter's ballot is recorded. */
  Confirmation = 'confirmation',
}

/**
 * Organiser-written email for one election. Subject and body may use placeholders:
 * {{voterName}}, {{voterEmail}}, {{electionTitle}}, {{otp}}, {{votingLink}}, {{startAt}}, {{endAt}}.
 */
@Entity('email_templates')
@Unique('UQ_email_templates_election_type', ['electionId', 'type'])
export class EmailTemplate extends AbstractEntity {
  @Column({ type: 'uuid' })
  electionId: string;

  @ManyToOne('Election', (election: Election) => election.emailTemplates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'electionId' })
  election: Relation<Election>;

  @Column({
    type: 'enum',
    enum: EmailTemplateType,
    enumName: 'email_template_type',
  })
  type: EmailTemplateType;

  @Column({ type: 'varchar', length: 100 })
  fromName: string;

  @Column({ type: 'varchar', length: 200 })
  subject: string;

  @Column({ type: 'text' })
  body: string;
}
