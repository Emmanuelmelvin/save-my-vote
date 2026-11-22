import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-google-oauth20';
import { AppConfig } from '../../config/app-config.service.js';
import { UsersService } from '../../users/users.service.js';
import type { User } from '../../users/user.entity.js';

/**
 * Google sign-in. Always registered; when GOOGLE_CLIENT_ID/SECRET aren't set it gets
 * placeholder credentials and GoogleOAuthGuard answers 503 before it runs.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: AppConfig,
    private readonly users: UsersService,
  ) {
    const google = config.google;
    super({
      clientID: google.clientId || 'google-oauth-not-configured',
      clientSecret: google.clientSecret || 'google-oauth-not-configured',
      callbackURL: google.callbackUrl,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<User> {
    const email = profile.emails?.find((entry) => entry.verified)?.value;
    if (!email) {
      throw new UnauthorizedException(
        'Your Google account has no verified email address',
      );
    }
    const fullName =
      profile.displayName?.trim() ||
      [profile.name?.givenName, profile.name?.familyName]
        .filter(Boolean)
        .join(' ') ||
      email.split('@')[0];

    return this.users.upsertFromGoogle({
      googleId: profile.id,
      email,
      fullName,
    });
  }
}
