import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfig } from '../../config/app-config.service.js';
import { UsersService } from '../../users/users.service.js';
import type { User } from '../../users/user.entity.js';
import { AuthCookie } from '../auth-cookie.js';
import type { AccessTokenPayload } from '../token.service.js';

/**
 * Accepts the access token from the httpOnly cookie (browsers) or an
 * `Authorization: Bearer` header (other clients), then loads the user on every
 * request so a deleted user or a password change takes effect immediately.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: AppConfig,
    private readonly users: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        AuthCookie.read,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: config.jwt.accessSecret,
      algorithms: ['HS256'],
      ignoreExpiration: false,
    });
  }

  async validate(payload: AccessTokenPayload): Promise<User> {
    if (payload.typ !== 'access')
      throw new UnauthorizedException('Invalid session');

    const user = await this.users.findById(payload.sub);
    if (!user || !user.isVerified)
      throw new UnauthorizedException('Invalid session');

    // Changing the password signs out every session issued before the change.
    const changedAtSeconds = Math.floor(user.passwordVersion / 1000);
    if (payload.iat < changedAtSeconds) {
      throw new UnauthorizedException(
        'Your session has expired. Please sign in again.',
      );
    }
    return user;
  }
}
