import { Injectable } from '@nestjs/common';
import { AppConfig } from '../config/app-config.service.js';
import { AppMetrics } from '../observability/app-metrics.js';
import {
  MailTransport,
  toDeliveryError,
  type DeliveryOutcome,
  type OutgoingEmail,
} from './transports/mail-transport.js';

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Display name for the From header; the address is always MAIL_FROM_ADDRESS. */
  fromName?: string;
}

/** Addresses messages (From, Reply-To) and hands them to the configured transport. */
@Injectable()
export class MailService {
  constructor(
    private readonly transport: MailTransport,
    private readonly config: AppConfig,
    private readonly metrics: AppMetrics,
  ) {}

  get transportName(): string {
    return this.transport.name;
  }

  async send(message: MailMessage): Promise<void> {
    await this.track(1, () => this.transport.deliver(this.address(message)));
  }

  /** One outcome per message, in order: a failed email doesn't stop the others. */
  async sendMany(messages: MailMessage[]): Promise<DeliveryOutcome[]> {
    if (messages.length === 0) return [];
    let outcomes: DeliveryOutcome[];
    try {
      outcomes = await this.transport.deliverMany(
        messages.map((message) => this.address(message)),
      );
    } catch (error) {
      // A transport that fails the whole call: nothing was confirmed sent.
      this.metrics.emailDelivery(
        this.transport.name,
        'failed',
        messages.length,
      );
      const failure = toDeliveryError(error);
      return messages.map(() => ({ delivered: false, error: failure }));
    }
    const sent = outcomes.filter((outcome) => outcome.delivered).length;
    if (sent) this.metrics.emailDelivery(this.transport.name, 'sent', sent);
    if (sent < outcomes.length) {
      this.metrics.emailDelivery(
        this.transport.name,
        'failed',
        outcomes.length - sent,
      );
    }
    return outcomes;
  }

  private async track(
    count: number,
    delivery: () => Promise<void>,
  ): Promise<void> {
    try {
      await delivery();
      this.metrics.emailDelivery(this.transport.name, 'sent', count);
    } catch (error) {
      this.metrics.emailDelivery(this.transport.name, 'failed', count);
      throw error;
    }
  }

  private address(message: MailMessage): OutgoingEmail {
    const { fromAddress, fromName, replyTo } = this.config.mail;
    const name = MailService.sanitizeName(message.fromName ?? fromName);
    return {
      from: `"${name}" <${fromAddress}>`,
      to: message.to,
      replyTo,
      subject: message.subject,
      html: message.html,
      text: message.text,
    };
  }

  /** Display names come from organisers; strip anything that could break the header. */
  private static sanitizeName(name: string): string {
    return (
      name
        .replace(/[\r\n<>"\\]/g, '')
        .trim()
        .slice(0, 100) || 'SaveMyVote'
    );
  }
}
