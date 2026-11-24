import { Global, Logger, Module } from '@nestjs/common';
import { AppConfig } from '../config/app-config.service.js';
import { AccountMailer } from './account-mailer.js';
import { MailService } from './mail.service.js';
import { ConsoleMailTransport } from './transports/console-mail.transport.js';
import { MailTransport } from './transports/mail-transport.js';
import { SendByteMailTransport } from './transports/sendbyte-mail.transport.js';

@Global()
@Module({
  providers: [
    {
      provide: MailTransport,
      inject: [AppConfig],
      useFactory: (config: AppConfig): MailTransport => {
        const { apiKey } = config.mail;
        if (apiKey) return new SendByteMailTransport(apiKey);
        if (config.isProduction) {
          new Logger('Mail').warn(
            'SENDBYTE_API_KEY is not set: emails will be logged, not sent',
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
