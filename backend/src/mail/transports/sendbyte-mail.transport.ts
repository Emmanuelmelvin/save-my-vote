import { SendByte, SendByteError } from '@sendbyte/node';
import {
  MailDeliveryError,
  MailTransport,
  type OutgoingEmail,
} from './mail-transport.js';

type SendByteOptions = NonNullable<ConstructorParameters<typeof SendByte>[1]>;

/**
 * SendByte allows 120 requests a minute per API key and has no batch endpoint, so
 * every email is its own request. Spacing them 550 ms apart keeps a large election
 * (about 109 emails a minute) under the limit without tripping 429s.
 */
export const MIN_INTERVAL_MS = 550;

/** Total attempts per email; the SDK retries 429, 5xx and network errors with backoff. */
const MAX_ATTEMPTS = 4;

const EMAIL_PATTERN = /[^\s<>"@]+@[^\s<>"@]+/g;

/**
 * Sends through the SendByte HTTP API (https://docs.sendbyte.africa). The SDK adds
 * an idempotency key to each send, so its retries never deliver an email twice.
 */
export class SendByteMailTransport extends MailTransport {
  readonly name = 'sendbyte';
  private readonly client: SendByte;
  private readonly minIntervalMs: number;
  /** Earliest time the next request may start; shared by every caller in this process. */
  private nextSlotAt = 0;

  constructor(
    apiKey: string,
    options: SendByteOptions & { minIntervalMs?: number } = {},
  ) {
    super();
    const { minIntervalMs = MIN_INTERVAL_MS, ...clientOptions } = options;
    this.minIntervalMs = minIntervalMs;
    this.client = new SendByte(apiKey, {
      maxAttempts: MAX_ATTEMPTS,
      ...clientOptions,
    });
  }

  async deliver(email: OutgoingEmail): Promise<void> {
    await this.waitForSlot();
    try {
      await this.client.emails.send({
        from: email.from,
        to: email.to,
        subject: email.subject,
        html: email.html,
        text: email.text,
        ...(email.replyTo ? { reply_to: email.replyTo } : {}),
      });
    } catch (error) {
      throw SendByteMailTransport.toDeliveryError(error);
    }
  }

  /** Reserves the next free send slot and waits for it, so concurrent callers queue fairly. */
  private async waitForSlot(): Promise<void> {
    const now = Date.now();
    const slot = Math.max(now, this.nextSlotAt);
    this.nextSlotAt = slot + this.minIntervalMs;
    if (slot > now)
      await new Promise((resolve) => setTimeout(resolve, slot - now));
  }

  private static toDeliveryError(error: unknown): MailDeliveryError {
    if (!(error instanceof SendByteError)) {
      return new MailDeliveryError(
        `SendByte request failed: ${String(error)}`,
        true,
      );
    }
    // Status 0: the API was never reached. 429 and 5xx: the SDK already retried.
    const retryable =
      error.status === 0 || error.status === 429 || error.status >= 500;
    // Error messages can quote the recipient (suppressed_recipient); keep addresses out of logs.
    const message = error.message.replace(EMAIL_PATTERN, '<email>');
    return new MailDeliveryError(
      `SendByte ${error.code} (${error.status}): ${message}`,
      retryable,
    );
  }
}
