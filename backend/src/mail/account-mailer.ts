import { Injectable } from '@nestjs/common';
import { MailService } from './mail.service.js';
import { EmailLayout } from './templates/email-layout.js';
import { TemplateRenderer } from './templates/template-renderer.js';

interface Recipient {
  email: string;
  firstName: string;
}

/** Account emails for organisers: verification and password reset. */
@Injectable()
export class AccountMailer {
  constructor(private readonly mail: MailService) {}

  sendVerification(user: Recipient, verifyUrl: string): Promise<void> {
    const name = TemplateRenderer.escapeHtml(user.firstName);
    return this.mail.send({
      to: user.email,
      subject: 'Verify your SaveMyVote email address',
      html: EmailLayout.render({
        heading: `Welcome, ${user.firstName}!`,
        bodyHtml: `Hi ${name}, please confirm your email address to start creating elections. This link expires in 24 hours.`,
        button: { label: 'Verify email', url: verifyUrl },
      }),
      text: `Hi ${user.firstName},\n\nConfirm your email address (link expires in 24 hours):\n${verifyUrl}\n`,
    });
  }

  sendPasswordReset(user: Recipient, resetUrl: string): Promise<void> {
    const name = TemplateRenderer.escapeHtml(user.firstName);
    return this.mail.send({
      to: user.email,
      subject: 'Reset your SaveMyVote password',
      html: EmailLayout.render({
        heading: 'Password reset',
        bodyHtml: `Hi ${name}, we received a request to reset your password. This link expires in 15 minutes and works once. If you didn't ask for this, ignore this email.`,
        button: { label: 'Choose a new password', url: resetUrl },
      }),
      text: `Hi ${user.firstName},\n\nReset your password (link expires in 15 minutes):\n${resetUrl}\n\nIf you didn't ask for this, ignore this email.\n`,
    });
  }
}
