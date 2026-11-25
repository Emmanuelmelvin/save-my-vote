import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AppConfig } from '../config/app-config.service.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import type { User, UserProfile } from '../users/user.entity.js';
import { AuthCookie } from './auth-cookie.js';
import { AuthService, type Session } from './auth.service.js';
import {
  EmailDto,
  LoginDto,
  ResetPasswordDto,
  SignUpDto,
} from './dto/auth.dto.js';
import { GoogleOAuthGuard } from './guards/google-oauth.guard.js';
import { TokenService } from './token.service.js';

const GENERIC_EMAIL_SENT =
  'If an account matches that email address, we have sent it a message.';

@ApiTags('Auth')
@Controller('auth')
@Throttle({ default: { limit: 10, ttl: 60_000 } })
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly cookie: AuthCookie,
    private readonly config: AppConfig,
    private readonly tokens: TokenService,
  ) {}

  @Public()
  @Post('signup')
  @ApiOperation({
    summary: 'Create an organiser account and email a verification link',
  })
  async signUp(
    @Body() dto: SignUpDto,
  ): Promise<{ user: UserProfile; message: string }> {
    const user = await this.auth.signUp(dto);
    return {
      user,
      message: 'Account created. Check your email to verify your address.',
    };
  }

  @Public()
  @Get('verify-email')
  @ApiOperation({
    summary: 'Verify an email address (the link in the verification email)',
    description:
      'Redirects to the frontend login page with ?verified=true or ?verified=false.',
  })
  @ApiQuery({ name: 'token', required: true })
  async verifyEmail(
    @Query('token') token: string,
    @Res() response: Response,
  ): Promise<void> {
    let verified = true;
    try {
      await this.auth.verifyEmail(String(token ?? ''));
    } catch {
      verified = false;
    }
    response.redirect(
      302,
      this.config.frontendUrl('/login', { verified: String(verified) }),
    );
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  async resendVerification(
    @Body() dto: EmailDto,
  ): Promise<{ message: string }> {
    await this.auth.resendVerification(dto.email);
    return { message: GENERIC_EMAIL_SENT };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Sign in; sets the access_token cookie and also returns the token',
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Session> {
    const session = await this.auth.login(dto);
    this.cookie.set(response, session.accessToken);
    return session;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  logout(@Res({ passthrough: true }) response: Response): { message: string } {
    this.cookie.clear(response);
    return { message: 'Signed out' };
  }

  @Get('me')
  @SkipThrottle()
  @ApiCookieAuth()
  me(@CurrentUser() user: User): { user: UserProfile } {
    return { user: user.toProfile() };
  }

  @Get('userjot-token')
  @ApiCookieAuth()
  @ApiOperation({
    summary:
      'A signed UserJot identity token for the feedback widget (null when UserJot is not configured)',
  })
  async userJotToken(
    @CurrentUser() user: User,
  ): Promise<{ token: string | null }> {
    return { token: (await this.tokens.signUserJotToken(user)) ?? null };
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Start Google sign-in (browser redirect)' })
  googleLogin(): void {
    // The guard redirects to Google.
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({
    summary:
      'Google redirects back here; sets the cookie and redirects to the frontend',
  })
  async googleCallback(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const session = await this.auth.completeGoogleLogin(request.user as User);
    this.cookie.set(response, session.accessToken);
    response.redirect(302, this.config.frontendUrl('/dashboard'));
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  async forgotPassword(@Body() dto: EmailDto): Promise<{ message: string }> {
    await this.auth.forgotPassword(dto.email);
    return { message: GENERIC_EMAIL_SENT };
  }

  @Public()
  @Patch('reset-password')
  @ApiOperation({
    summary:
      'Set a new password with the token from the reset email; signs you in',
  })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Session> {
    const session = await this.auth.resetPassword(dto);
    this.cookie.set(response, session.accessToken);
    return session;
  }
}
