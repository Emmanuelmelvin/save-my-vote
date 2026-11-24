import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions } from 'express';
import { EnvironmentVariables, NodeEnv } from './environment.js';

export interface MailSettings {
  apiKey?: string;
  fromAddress: string;
  fromName: string;
  replyTo?: string;
}

export interface GoogleSettings {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

/** Where uploaded images are stored and served from. */
export type StorageSettings =
  | {
      driver: 'r2';
      endpoint: string;
      bucket: string;
      accessKeyId: string;
      secretAccessKey: string;
      publicUrl: string;
    }
  | { driver: 'local'; root: string; publicUrl: string };

/** Where the local upload folder is served, outside the /api prefix. */
export const LOCAL_UPLOADS_PATH = '/uploads';

/** Typed, read-only view of the validated environment. Inject this instead of reading process.env. */
@Injectable()
export class AppConfig {
  constructor(
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  private get<K extends keyof EnvironmentVariables>(
    key: K,
  ): EnvironmentVariables[K] {
    return this.config.get(key, { infer: true });
  }

  get nodeEnv(): NodeEnv {
    return this.get('NODE_ENV');
  }

  get isProduction(): boolean {
    return this.nodeEnv === NodeEnv.Production;
  }

  get port(): number {
    return this.get('PORT');
  }

  get trustProxy(): boolean {
    return this.get('TRUST_PROXY');
  }

  get swaggerEnabled(): boolean {
    return this.get('SWAGGER_ENABLED');
  }

  get throttleLimit(): number {
    return this.get('THROTTLE_LIMIT');
  }

  get schedulerEnabled(): boolean {
    return this.get('SCHEDULER_ENABLED');
  }

  get jwt() {
    return {
      accessSecret: this.get('JWT_ACCESS_SECRET'),
      accessTtlSeconds: this.get('JWT_ACCESS_TTL_MINUTES') * 60,
      emailSecret: this.get('JWT_EMAIL_SECRET'),
    };
  }

  get otp() {
    return {
      secret: this.get('OTP_SECRET'),
      leadMinutes: this.get('OTP_LEAD_MINUTES'),
      maxAttempts: this.get('OTP_MAX_ATTEMPTS'),
    };
  }

  get mail(): MailSettings {
    return {
      apiKey: this.get('SENDBYTE_API_KEY'),
      fromAddress: this.get('MAIL_FROM_ADDRESS'),
      fromName: this.get('MAIL_FROM_NAME'),
      replyTo: this.get('MAIL_REPLY_TO'),
    };
  }

  get google(): GoogleSettings {
    const clientId = this.get('GOOGLE_CLIENT_ID') ?? '';
    const clientSecret = this.get('GOOGLE_CLIENT_SECRET') ?? '';
    return {
      enabled: Boolean(clientId && clientSecret),
      clientId,
      clientSecret,
      callbackUrl:
        this.get('GOOGLE_CALLBACK_URL') ??
        this.backendUrl('/api/v1/auth/google/callback'),
    };
  }

  /** UserJot project for signing identity tokens, or undefined when not configured. */
  get userJot(): { projectId: string; secret: string } | undefined {
    const projectId = this.get('USERJOT_PROJECT_ID');
    const secret = this.get('USERJOT_PROJECT_SECRET');
    return projectId && secret ? { projectId, secret } : undefined;
  }

  /** R2 when configured (validateEnvironment makes that all or nothing), else a local folder. */
  get storage(): StorageSettings {
    const accountId = this.get('R2_ACCOUNT_ID');
    const accessKeyId = this.get('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.get('R2_SECRET_ACCESS_KEY');
    const bucket = this.get('R2_BUCKET');
    const publicUrl = this.get('R2_PUBLIC_URL');
    if (accountId && accessKeyId && secretAccessKey && bucket && publicUrl) {
      return {
        driver: 'r2',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        bucket,
        accessKeyId,
        secretAccessKey,
        // url() resolves keys against this base, so it must end in a slash.
        publicUrl: publicUrl.endsWith('/') ? publicUrl : `${publicUrl}/`,
      };
    }
    return {
      driver: 'local',
      root: this.get('LOCAL_UPLOADS_DIR'),
      publicUrl: this.backendUrl(`${LOCAL_UPLOADS_PATH}/`),
    };
  }

  get corsOrigins(): string[] {
    const extra = (this.get('CORS_ORIGINS') ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
    return [new URL(this.get('FRONTEND_URL')).origin, ...extra];
  }

  /** Options for the httpOnly cookie that carries the access token. */
  get authCookieOptions(): CookieOptions {
    const sameSite = this.get('COOKIE_SAME_SITE');
    return {
      httpOnly: true,
      // SameSite=None is only accepted by browsers on secure cookies.
      secure: this.isProduction || sameSite === 'none',
      sameSite,
      path: '/',
    };
  }

  frontendUrl(path = '/', query: Record<string, string> = {}): string {
    return AppConfig.buildUrl(this.get('FRONTEND_URL'), path, query);
  }

  backendUrl(path = '/', query: Record<string, string> = {}): string {
    return AppConfig.buildUrl(this.get('BACKEND_URL'), path, query);
  }

  private static buildUrl(
    base: string,
    path: string,
    query: Record<string, string>,
  ): string {
    const url = new URL(base);
    url.pathname = `${url.pathname.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  }
}
