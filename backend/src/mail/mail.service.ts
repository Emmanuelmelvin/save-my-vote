import { Injectable } from '@nestjs/common';
import { AppConfig } from '../config/app-config.service.js';
import { AppMetrics } from '../observability/app-metrics.js';
import {
  MailTransport,
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

  /** All-or-nothing per batch of 100: a thrown error means none of that batch was accepted. */
  async sendMany(messages: MailMessage[]): Promise<void> {
    if (messages.length === 0) return;
    await this.track(messages.length, () =>
      this.transport.deliverMany(
        messages.map((message) => this.address(message)),
      ),
    );
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
