import { Global, Logger, Module } from '@nestjs/common';
import { AppConfig } from '../config/app-config.service.js';
import { AccountMailer } from './account-mailer.js';
import { MailService } from './mail.service.js';
import { ConsoleMailTransport } from './transports/console-mail.transport.js';
import { MailTransport } from './transports/mail-transport.js';
import { ResendMailTransport } from './transports/resend-mail.transport.js';

@Global()
@Module({
  providers: [
    {
      provide: MailTransport,
      inject: [AppConfig],
      useFactory: (config: AppConfig): MailTransport => {
        const { resendApiKey } = config.mail;
        if (resendApiKey) return new ResendMailTransport(resendApiKey);
        if (config.isProduction) {
          new Logger('Mail').warn(
            'RESEND_API_KEY is not set: emails will be logged, not sent',
          );
        }
        return new ConsoleMailTransport();
      },
    },
    MailService,
    AccountMailer,
  ],
  exports: [MailService, AccountMailer],
})
export class MailModule {}
