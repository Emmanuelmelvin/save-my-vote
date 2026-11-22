/** A fully addressed email, ready for a transport to deliver. */
export interface OutgoingEmail {
  /** RFC 5322 From header, e.g. `"Electoral Committee" <no-reply@example.com>`. */
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}

export class MailDeliveryError extends Error {
  constructor(
    message: string,
    readonly retryable = false,
  ) {
    super(message);
    this.name = 'MailDeliveryError';
  }
}

/**
 * How email leaves the app. MailService depends on this abstraction; the concrete
 * transport is chosen once at startup (Resend in real environments, the console
 * when no API key is configured).
 */
export abstract class MailTransport {
  abstract readonly name: string;

  abstract deliver(email: OutgoingEmail): Promise<void>;

  /** Many emails at once. Transports with a batch API override this. */
  async deliverMany(emails: OutgoingEmail[]): Promise<void> {
    for (const email of emails) await this.deliver(email);
  }
}
