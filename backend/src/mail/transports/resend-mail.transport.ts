import { Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { chunk } from '../../common/utils/concurrency.js';
import {
  MailDeliveryError,
  MailTransport,
  type OutgoingEmail,
} from './mail-transport.js';

type ResendError = { name: string; message: string; statusCode: number | null };

/** Resend accepts at most this many emails per batch request. */
const BATCH_LIMIT = 100;
const MAX_ATTEMPTS = 4;
const RETRYABLE = new Set([
  'rate_limit_exceeded',
  'internal_server_error',
  'application_error',
]);

/**
 * Sends through the Resend HTTP API. Voter invitations go through the batch
 * endpoint (100 per request), which keeps large elections well inside Resend's
 * request rate limit; rate-limited or 5xx responses are retried with backoff.
 */
export class ResendMailTransport extends MailTransport {
  readonly name = 'resend';
  private readonly logger = new Logger(ResendMailTransport.name);
  private readonly client: Resend;

  constructor(apiKey: string) {
    super();
    this.client = new Resend(apiKey);
  }

  async deliver(email: OutgoingEmail): Promise<void> {
    await this.withRetry(() =>
      this.client.emails.send(ResendMailTransport.toPayload(email)),
    );
  }

  override async deliverMany(emails: OutgoingEmail[]): Promise<void> {
    for (const group of chunk(emails, BATCH_LIMIT)) {
      await this.withRetry(() =>
        this.client.batch.send(group.map(ResendMailTransport.toPayload)),
      );
    }
  }

  private async withRetry(
    request: () => Promise<{ error: ResendError | null }>,
  ): Promise<void> {
    for (let attempt = 1; ; attempt++) {
      let error: ResendError | null;
      try {
        ({ error } = await request());
      } catch (thrown) {
        // Network failure before Resend answered.
        error = {
          name: 'network_error',
          message: String(thrown),
          statusCode: null,
        };
      }
      if (!error) return;

      const retryable =
        RETRYABLE.has(error.name) || error.name === 'network_error';
      if (!retryable || attempt >= MAX_ATTEMPTS) {
        throw new MailDeliveryError(
          `Resend ${error.name}: ${error.message}`,
          retryable,
        );
      }
      const delayMs =
        500 * 2 ** (attempt - 1) + Math.floor(Math.random() * 250);
      this.logger.warn(
        `Resend ${error.name}; retrying in ${delayMs} ms (attempt ${attempt}/${MAX_ATTEMPTS})`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  private static toPayload(email: OutgoingEmail) {
    return {
      from: email.from,
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      ...(email.replyTo ? { replyTo: email.replyTo } : {}),
    };
  }
}
