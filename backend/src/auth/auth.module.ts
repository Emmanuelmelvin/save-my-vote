import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module.js';
import { AuthCookie } from './auth-cookie.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { GoogleOAuthGuard } from './guards/google-oauth.guard.js';
import { GoogleStrategy } from './strategies/google.strategy.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { TokenService } from './token.service.js';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ session: false }),
    // Secrets are passed per call by TokenService (access and email tokens use different ones).
    JwtModule.register({ signOptions: { algorithm: 'HS256' } }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    AuthCookie,
    JwtStrategy,
    GoogleStrategy,
    GoogleOAuthGuard,
  ],
})
export class AuthModule {}
