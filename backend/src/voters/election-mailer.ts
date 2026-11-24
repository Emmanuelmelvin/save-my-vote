import { Injectable } from '@nestjs/common';
import { AppConfig } from '../config/app-config.service.js';
import {
  EmailTemplatesService,
  type EmailTemplateContent,
} from '../elections/email-templates.service.js';
import type { Election } from '../elections/entities/election.entity.js';
import { EmailTemplateType } from '../elections/entities/email-template.entity.js';
import { MailService, type MailMessage } from '../mail/mail.service.js';
import { EmailLayout } from '../mail/templates/email-layout.js';
import type { DeliveryOutcome } from '../mail/transports/mail-transport.js';
import {
  TemplateRenderer,
  type TemplateVariables,
} from '../mail/templates/template-renderer.js';
import type { Voter } from './entities/voter.entity.js';

/** Builds one election's emails from its template; reused for every voter in a batch. */
export class ElectionEmailComposer {
  constructor(
    private readonly election: Election,
    private readonly template: EmailTemplateContent,
    private readonly votingLink: string,
  ) {}

  compose(
    voter: Pick<Voter, 'email' | 'displayName'>,
    otp?: string,
  ): MailMessage {
    const variables: TemplateVariables = {
      voterName: voter.displayName,
      voterEmail: voter.email,
      electionTitle: this.election.title,
      otp: otp ?? '',
      votingLink: this.votingLink,
      startAt: ElectionEmailComposer.formatDate(this.election.startAt),
      endAt: ElectionEmailComposer.formatDate(this.election.endAt),
    };
    const wantsBallotLink =
      this.template.type !== EmailTemplateType.Confirmation;

    const html = EmailLayout.render({
      heading: this.election.title,
      bodyHtml: TemplateRenderer.renderHtml(this.template.body, variables),
      accentColor: this.election.primaryColor,
      logoUrl: this.election.logoUrl,
      highlight: otp ? { label: 'Your one-time code', value: otp } : undefined,
      button: wantsBallotLink
        ? { label: 'Go to the ballot', url: this.votingLink }
        : undefined,
      footer: `You received this because you are on the voter list for ${this.election.title}.`,
    });

    const text = [
      TemplateRenderer.renderText(this.template.body, variables),
      otp ? `\nYour one-time code: ${otp}` : '',
      wantsBallotLink ? `\nVote here: ${this.votingLink}` : '',
    ].join('\n');

    return {
      to: voter.email,
      fromName: this.template.fromName,
      subject: TemplateRenderer.renderSubject(this.template.subject, variables),
      html,
      text,
    };
  }

  private static formatDate(date: Date): string {
    return (
      new Intl.DateTimeFormat('en-GB', {
        // dateStyle/timeStyle can't be combined with timeZoneName, so the zone is appended.
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'UTC',
      }).format(date) + ' UTC'
    );
  }
}

@Injectable()
export class ElectionMailer {
  constructor(
    private readonly templates: EmailTemplatesService,
    private readonly mail: MailService,
    private readonly config: AppConfig,
  ) {}

  async composerFor(
    election: Election,
    type: EmailTemplateType,
  ): Promise<ElectionEmailComposer> {
    const template = await this.templates.resolve(election.id, type);
    return new ElectionEmailComposer(
      election,
      template,
      this.config.frontendUrl(`/vote/${election.id}`),
    );
  }

  send(message: MailMessage): Promise<void> {
    return this.mail.send(message);
  }

  sendMany(messages: MailMessage[]): Promise<DeliveryOutcome[]> {
    return this.mail.sendMany(messages);
  }
}
