import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfig } from '../config/app-config.service.js';
import type { User } from '../users/user.entity.js';

export interface AccessTokenPayload {
  sub: string;
  typ: 'access';
  iat: number;
}

export type EmailTokenPurpose = 'verify-email' | 'reset-password';

export interface EmailTokenPayload {
  sub: string;
  typ: EmailTokenPurpose;
  /** Password version at issue time (reset links only), so a link stops working once used. */
  pwv?: number;
}

/** Lifetimes in seconds. */
const EMAIL_TOKEN_LIFETIME: Record<EmailTokenPurpose, number> = {
  'verify-email': 24 * 60 * 60,
  'reset-password': 15 * 60,
};

/**
 * Issues and checks the API's JWTs. Access tokens and emailed tokens use separate
 * secrets and carry a `typ` claim, so one kind can never be used as the other.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: AppConfig,
  ) {}

  signAccessToken(user: Pick<User, 'id'>): Promise<string> {
    const { accessSecret, accessTtlSeconds } = this.config.jwt;
    return this.jwt.signAsync(
      { sub: user.id, typ: 'access' },
      {
        secret: accessSecret,
        expiresIn: accessTtlSeconds,
      },
    );
  }

  signEmailToken(purpose: EmailTokenPurpose, user: User): Promise<string> {
    const payload: EmailTokenPayload = { sub: user.id, typ: purpose };
    if (purpose === 'reset-password') payload.pwv = user.passwordVersion;
    return this.jwt.signAsync(payload, {
      secret: this.config.jwt.emailSecret,
      expiresIn: EMAIL_TOKEN_LIFETIME[purpose],
    });
  }

  async verifyEmailToken(
    token: string,
    purpose: EmailTokenPurpose,
  ): Promise<EmailTokenPayload> {
    try {
      const payload = await this.jwt.verifyAsync<EmailTokenPayload>(token, {
        secret: this.config.jwt.emailSecret,
      });
      if (payload.typ !== purpose) throw new Error('wrong token type');
      return payload;
    } catch {
      throw new BadRequestException(
        'This link is invalid or has expired. Please request a new one.',
      );
    }
  }
}
