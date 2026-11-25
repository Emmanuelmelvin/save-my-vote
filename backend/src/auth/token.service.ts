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

/** UserJot rejects identity tokens that live longer than an hour. */
const USERJOT_TOKEN_LIFETIME = 60 * 60;

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

  /**
   * A UserJot identity token (https://feedback.userjot.com/help/articles/signed-identity):
   * HS256 with the project secret, aud "userjot", iss the project ID, at most an hour long.
   * UserJot treats every claim in it as verified, so feedback is tied to this organiser.
   * Undefined when UserJot isn't configured.
   */
  async signUserJotToken(user: User): Promise<string | undefined> {
    const userJot = this.config.userJot;
    if (!userJot) return undefined;
    const [firstName, ...rest] = user.fullName.trim().split(/\s+/);
    return this.jwt.signAsync(
      {
        email: user.email,
        firstName: firstName || undefined,
        lastName: rest.join(' ') || undefined,
        traits: {
          organizationType: user.organizationType,
          organizationName: user.organizationName,
          signedUpAt: user.createdAt.toISOString(),
        },
      },
      {
        secret: userJot.secret,
        subject: user.id,
        issuer: userJot.projectId,
        audience: 'userjot',
        expiresIn: USERJOT_TOKEN_LIFETIME,
      },
    );
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
