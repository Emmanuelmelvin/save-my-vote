import { Logger } from '@nestjs/common';
import { MailTransport, type OutgoingEmail } from './mail-transport.js';

/**
 * Development fallback when RESEND_API_KEY isn't set: prints each email (text
 * version) to the log instead of sending it, so verification links and voting
 * codes can be copied from the terminal.
 */
export class ConsoleMailTransport extends MailTransport {
  readonly name = 'console';
  private readonly logger = new Logger('Mail');

  deliver(email: OutgoingEmail): Promise<void> {
    this.logger.log(
      `\n--- email (not sent: RESEND_API_KEY is not set) ---\nFrom: ${email.from}\nTo: ${email.to}\nSubject: ${email.subject}\n\n${email.text}\n--- end ---`,
    );
    return Promise.resolve();
  }
}
