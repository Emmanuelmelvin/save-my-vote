import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AppConfig } from '../config/app-config.service.js';
import { PasswordHasher } from '../common/security/password-hasher.js';
import { AccountMailer } from '../mail/account-mailer.js';
import { AppMetrics } from '../observability/app-metrics.js';
import type { User, UserProfile } from '../users/user.entity.js';
import { UsersService } from '../users/users.service.js';
import type { LoginDto, ResetPasswordDto, SignUpDto } from './dto/auth.dto.js';
import { TokenService } from './token.service.js';

export interface Session {
  user: UserProfile;
  accessToken: string;
}

const VERIFICATION_RESEND_COOLDOWN_MS = 10 * 60 * 1000;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly users: UsersService,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
    private readonly mailer: AccountMailer,
    private readonly config: AppConfig,
    private readonly metrics: AppMetrics,
  ) {}

  async signUp(dto: SignUpDto): Promise<UserProfile> {
    const user = await this.users.create({
      email: dto.email,
      fullName: dto.fullName,
      passwordHash: await this.hasher.hash(dto.password),
      organizationType: dto.organizationType ?? null,
      organizationName: dto.organizationName ?? null,
    });
    this.metrics.signUp();
    // The account exists either way; a mail outage shouldn't fail sign-up (they can resend).
    await this.sendVerificationEmail(user).catch((error: unknown) =>
      this.logger.warn(
        `Verification email for user ${user.id} failed: ${String(error)}`,
      ),
    );
    return user.toProfile();
  }

  async verifyEmail(token: string): Promise<void> {
    const payload = await this.tokens.verifyEmailToken(token, 'verify-email');
    const updated = await this.users.markVerified(payload.sub);
    if (!updated)
      throw new BadRequestException(
        'This link is invalid or has expired. Please request a new one.',
      );
  }

  /**
   * Always succeeds from the caller's point of view, so it can't be used to find out
   * which emails have accounts. Sends at most once per cooldown window.
   */
  async resendVerification(email: string): Promise<void> {
    const user = await this.users.findByEmail(email);
    if (!user || user.isVerified) return;
    const lastSent = user.verificationEmailSentAt?.getTime() ?? 0;
    if (Date.now() - lastSent < VERIFICATION_RESEND_COOLDOWN_MS) return;
    await this.sendVerificationEmail(user);
  }

  async login(dto: LoginDto): Promise<Session> {
    const user = await this.users.findByEmail(dto.email, {
      withPassword: true,
    });
    // Hash check runs even when the user doesn't exist: same timing either way.
    const passwordOk = await this.hasher.verify(
      dto.password,
      user?.passwordHash,
    );
    if (!user || !passwordOk) {
      this.metrics.login('invalid_credentials');
      throw new UnauthorizedException('Incorrect email or password');
    }
    if (!user.isVerified) {
      this.metrics.login('unverified');
      throw new ForbiddenException('Please verify your email address first');
    }
    this.metrics.login('success');
    return this.createSession(user);
  }

  completeGoogleLogin(user: User): Promise<Session> {
    this.metrics.login('success', 'google');
    return this.createSession(user);
  }

  async createSession(user: User): Promise<Session> {
    return {
      user: user.toProfile(),
      accessToken: await this.tokens.signAccessToken(user),
    };
  }

  /** Same answer whether or not the account exists. */
  async forgotPassword(email: string): Promise<void> {
    const user = await this.users.findByEmail(email, { withPassword: true });
    if (!user) return;
    const token = await this.tokens.signEmailToken('reset-password', user);
    const resetUrl = this.config.frontendUrl('/reset-password', { token });
    await this.mailer
      .sendPasswordReset(user, resetUrl)
      .catch((error: unknown) =>
        this.logger.warn(
          `Reset email for user ${user.id} failed: ${String(error)}`,
        ),
      );
  }

  async resetPassword(dto: ResetPasswordDto): Promise<Session> {
    if (dto.password !== dto.passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }
    const payload = await this.tokens.verifyEmailToken(
      dto.token,
      'reset-password',
    );
    const user = await this.users.findById(payload.sub);
    // A password change bumps the version, so an already-used link no longer matches.
    if (!user || payload.pwv !== user.passwordVersion) {
      throw new BadRequestException(
        'This link is invalid or has expired. Please request a new one.',
      );
    }

    await this.users.updatePassword(
      user.id,
      await this.hasher.hash(dto.password),
    );
    // Resetting via an emailed link also proves the address.
    if (!user.isVerified) await this.users.markVerified(user.id);
    this.metrics.passwordReset();

    const refreshed = (await this.users.findById(user.id)) as User;
    return this.createSession(refreshed);
  }

  private async sendVerificationEmail(user: User): Promise<void> {
    const token = await this.tokens.signEmailToken('verify-email', user);
    const verifyUrl = this.config.backendUrl('/api/auth/verify-email', {
      token,
    });
    await this.mailer.sendVerification(user, verifyUrl);
    await this.users.recordVerificationEmailSent(user.id);
  }
}
