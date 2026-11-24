import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/** Reads the raw env string, so "false" stays false (implicit conversion would make it true). */
const BooleanFlag = () =>
  Transform(({ obj, key }: { obj: Record<string, unknown>; key: string }) => {
    const raw = obj[key];
    if (raw === undefined || raw === null || raw === '') return undefined;
    if (typeof raw === 'boolean') return raw;
    return ['true', '1', 'yes', 'on'].includes(String(raw).toLowerCase());
  });

const URL_OPTIONS = { require_tld: false, require_protocol: true } as const;

/**
 * Every environment variable the API reads, validated once at startup.
 * A missing or malformed value stops the app before it serves a request.
 */
export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT = 3000;

  @BooleanFlag()
  @IsBoolean()
  TRUST_PROXY = false;

  // ---- Database ----
  @IsOptional()
  @IsString()
  DATABASE_URL?: string;

  @IsString()
  DB_HOST = 'localhost';

  @Type(() => Number)
  @IsInt()
  DB_PORT = 5433;

  @IsString()
  DB_USER = 'savemyvote';

  @IsString()
  DB_PASSWORD = 'savemyvote';

  @IsString()
  DB_NAME = 'savemyvote';

  @BooleanFlag()
  @IsBoolean()
  DB_SSL = false;

  @BooleanFlag()
  @IsBoolean()
  DB_RUN_MIGRATIONS = true;

  @BooleanFlag()
  @IsBoolean()
  DB_LOGGING = false;

  // ---- Secrets (each at least 32 characters; generate with `openssl rand -base64 48`) ----
  @IsString()
  @MinLength(32)
  JWT_ACCESS_SECRET: string;

  /** Access-token (and cookie) lifetime in minutes. Default: 7 days. */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  JWT_ACCESS_TTL_MINUTES = 10080;

  @IsString()
  @MinLength(32)
  JWT_EMAIL_SECRET: string;

  @IsString()
  @MinLength(32)
  OTP_SECRET: string;

  // ---- URLs ----
  @IsUrl(URL_OPTIONS)
  FRONTEND_URL = 'http://localhost:5173';

  @IsUrl(URL_OPTIONS)
  BACKEND_URL = 'http://localhost:3000';

  /** Extra allowed CORS origins, comma separated. FRONTEND_URL is always allowed. */
  @IsOptional()
  @IsString()
  CORS_ORIGINS?: string;

  @IsIn(['lax', 'strict', 'none'])
  COOKIE_SAME_SITE: 'lax' | 'strict' | 'none' = 'lax';

  // ---- Mail (SendByte) ----
  /** SendByte API key (sk_live_... or sk_test_...). Leave empty to print emails to the log instead of sending them. */
  @IsOptional()
  @Matches(/^sk_(live|test)_\S+$/, {
    message: 'SENDBYTE_API_KEY must start with sk_live_ or sk_test_',
  })
  SENDBYTE_API_KEY?: string;

  /** Must be on a domain verified in SendByte (test keys can send from any address). */
  @IsEmail({ require_tld: false })
  MAIL_FROM_ADDRESS = 'no-reply@savemyvote.local';

  @IsString()
  MAIL_FROM_NAME = 'SaveMyVote';

  @IsOptional()
  @IsEmail()
  MAIL_REPLY_TO?: string;

  // ---- Logging (Winston) ----
  @IsIn(['error', 'warn', 'info', 'http', 'verbose', 'debug'])
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' = 'info';

  /** Write logs/app.log and logs/error.log. Defaults to on outside production. */
  @IsOptional()
  @BooleanFlag()
  @IsBoolean()
  LOG_TO_FILES?: boolean;

  @IsString()
  LOG_DIR = 'logs';

  // ---- Sentry (read by src/instrument.ts before the app starts) ----
  /** Leave empty to disable Sentry (errors, traces, logs and metrics). */
  @IsOptional()
  @IsUrl({ require_tld: false, protocols: ['https', 'http'] })
  SENTRY_DSN?: string;

  @IsOptional()
  @IsString()
  SENTRY_ENVIRONMENT?: string;

  @IsOptional()
  @IsString()
  SENTRY_RELEASE?: string;

  /** Unset: 1.0 outside production, 0.1 in production (see src/instrument.ts). */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  SENTRY_TRACES_SAMPLE_RATE?: number;

  // ---- Google OAuth (optional) ----
  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_SECRET?: string;

  @IsOptional()
  @IsUrl(URL_OPTIONS)
  GOOGLE_CALLBACK_URL?: string;

  // ---- Voting ----
  /** How many minutes before an election starts its invitations (with OTPs) go out. */
  @Type(() => Number)
  @IsInt()
  @Min(0)
  OTP_LEAD_MINUTES = 60;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  OTP_MAX_ATTEMPTS = 5;

  @BooleanFlag()
  @IsBoolean()
  SCHEDULER_ENABLED = true;

  // ---- HTTP ----
  @Type(() => Number)
  @IsInt()
  @Min(1)
  THROTTLE_LIMIT = 120;

  @BooleanFlag()
  @IsBoolean()
  SWAGGER_ENABLED = true;
}

/** Used by ConfigModule: empty strings count as "not set", then defaults and validation apply. */
export function validateEnvironment(
  raw: Record<string, unknown>,
): EnvironmentVariables {
  const cleaned = Object.fromEntries(
    Object.entries(raw).filter(([, value]) => value !== ''),
  );
  const env = plainToInstance(EnvironmentVariables, cleaned, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
  });
  const errors = validateSync(env, { whitelist: false });
  if (errors.length > 0) {
    const details = errors
      .map(
        (error) =>
          `  - ${error.property}: ${Object.values(error.constraints ?? {}).join(', ')}`,
      )
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }
  return env;
}
