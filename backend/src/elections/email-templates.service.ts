import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { ReplaceEmailTemplatesDto } from './dto/email-template.dto.js';
import {
  EmailTemplate,
  EmailTemplateType,
} from './entities/email-template.entity.js';
import { ElectionAccessService } from './election-access.service.js';

export interface EmailTemplateContent {
  type: EmailTemplateType;
  fromName: string;
  subject: string;
  body: string;
  /** True when the organiser hasn't written one and the built-in default is used. */
  isDefault: boolean;
}

/** Used for any type the organiser leaves out, so every election can send all three emails. */
export const DEFAULT_EMAIL_TEMPLATES: Record<
  EmailTemplateType,
  Omit<EmailTemplateContent, 'isDefault'>
> = {
  [EmailTemplateType.Invitation]: {
    type: EmailTemplateType.Invitation,
    fromName: 'Electoral Committee',
    subject: 'You are invited to vote: {{electionTitle}}',
    body:
      'Hi {{voterName}},\n\nYou are on the voter list for {{electionTitle}}.\n' +
      'Voting opens {{startAt}} and closes {{endAt}}.\n\n' +
      'Sign in with your email address and the one-time code below. Keep it private.',
  },
  [EmailTemplateType.Reminder]: {
    type: EmailTemplateType.Reminder,
    fromName: 'Electoral Committee',
    subject: 'Reminder: voting closes {{endAt}}',
    body:
      "Hi {{voterName}},\n\nYou haven't voted in {{electionTitle}} yet. Voting closes {{endAt}}.\n\n" +
      'Here is a fresh one-time code (any earlier code no longer works).',
  },
  [EmailTemplateType.Confirmation]: {
    type: EmailTemplateType.Confirmation,
    fromName: 'Electoral Committee',
    subject: 'Your vote in {{electionTitle}} was recorded',
    body: 'Hi {{voterName}},\n\nThank you. Your ballot for {{electionTitle}} has been recorded.',
  },
};

@Injectable()
export class EmailTemplatesService {
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly templates: Repository<EmailTemplate>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly access: ElectionAccessService,
  ) {}

  /** All three types: the organiser's own where written, defaults for the rest. */
  async list(electionId: string): Promise<EmailTemplateContent[]> {
    const stored = await this.templates.findBy({ electionId });
    return Object.values(EmailTemplateType).map((type) => {
      const own = stored.find((template) => template.type === type);
      return own
        ? {
            type,
            fromName: own.fromName,
            subject: own.subject,
            body: own.body,
            isDefault: false,
          }
        : { ...DEFAULT_EMAIL_TEMPLATES[type], isDefault: true };
    });
  }

  async listOwned(
    ownerId: string,
    electionId: string,
  ): Promise<EmailTemplateContent[]> {
    await this.access.findOwned(ownerId, electionId);
    return this.list(electionId);
  }

  async resolve(
    electionId: string,
    type: EmailTemplateType,
  ): Promise<EmailTemplateContent> {
    const own = await this.templates.findOneBy({ electionId, type });
    return own
      ? {
          type,
          fromName: own.fromName,
          subject: own.subject,
          body: own.body,
          isDefault: false,
        }
      : { ...DEFAULT_EMAIL_TEMPLATES[type], isDefault: true };
  }

  async replace(
    ownerId: string,
    electionId: string,
    dto: ReplaceEmailTemplatesDto,
  ): Promise<EmailTemplateContent[]> {
    const types = dto.templates.map((template) => template.type);
    if (new Set(types).size !== types.length) {
      throw new BadRequestException(
        'Each email type (invitation, reminder, confirmation) may appear only once',
      );
    }
    await this.dataSource.transaction(async (manager) => {
      await this.access.lockEditable(manager, ownerId, electionId);
      await manager.delete(EmailTemplate, { electionId });
      if (dto.templates.length > 0) {
        await manager.save(
          dto.templates.map((input) =>
            manager.create(EmailTemplate, { ...input, electionId }),
          ),
        );
      }
    });
    return this.list(electionId);
  }
}
