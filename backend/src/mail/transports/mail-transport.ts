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

/** What happened to one email of a `deliverMany` call, in input order. */
export type DeliveryOutcome =
  { delivered: true } | { delivered: false; error: MailDeliveryError };

/**
 * How email leaves the app. MailService depends on this abstraction; the concrete
 * transport is chosen once at startup (SendByte in real environments, the console
 * when no API key is configured).
 */
export abstract class MailTransport {
  abstract readonly name: string;

  abstract deliver(email: OutgoingEmail): Promise<void>;

  /**
   * Many emails, one outcome each: a failed email doesn't stop the rest, so the
   * caller knows exactly who got theirs.
   */
  async deliverMany(emails: OutgoingEmail[]): Promise<DeliveryOutcome[]> {
    const outcomes: DeliveryOutcome[] = [];
    for (const email of emails) {
      try {
        await this.deliver(email);
        outcomes.push({ delivered: true });
      } catch (error) {
        outcomes.push({ delivered: false, error: toDeliveryError(error) });
      }
    }
    return outcomes;
  }
}

export function toDeliveryError(error: unknown): MailDeliveryError {
  return error instanceof MailDeliveryError
    ? error
    : new MailDeliveryError(String(error));
}
