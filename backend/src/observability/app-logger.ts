import type { LoggerService } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { WinstonModule, utilities as nestWinston } from 'nest-winston';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import winston from 'winston';
import Transport from 'winston-transport';
import { NodeEnv, type EnvironmentVariables } from '../config/environment.js';

/** Nest's own start-up chatter: kept in the console and files, not sent to Sentry. */
const FRAMEWORK_CONTEXTS = new Set([
  'NestFactory',
  'InstanceLoader',
  'RoutesResolver',
  'RouterExplorer',
  'NestApplication',
]);
/** Per-request access logs: Sentry already gets these as traces and metrics. */
const SENTRY_SKIPPED_CONTEXTS = new Set([...FRAMEWORK_CONTEXTS, 'HTTP']);

const MAX_FILE_BYTES = 10 * 1024 * 1024;

type LoggerEnv = Pick<
  EnvironmentVariables,
  'NODE_ENV' | 'LOG_LEVEL' | 'LOG_TO_FILES' | 'LOG_DIR' | 'SENTRY_DSN'
>;

/**
 * The application logger (Winston, via nest-winston), used for everything that
 * goes through Nest's Logger:
 *
 * - console: readable in development, JSON in production
 * - files (on by default outside production): `logs/app.log` with everything at
 *   LOG_LEVEL and above, `logs/error.log` with errors only. Each rotates at 10 MB.
 * - Sentry (when SENTRY_DSN is set, e.g. dev and prod deployments): info and above,
 *   as Sentry Logs, linked to the trace of the request that wrote them.
 */
export class AppLoggerFactory {
  static create(env: LoggerEnv): LoggerService {
    const isProduction = env.NODE_ENV === NodeEnv.Production;
    const logToFiles = env.LOG_TO_FILES ?? !isProduction;
    const transports: Transport[] = [AppLoggerFactory.console(isProduction)];

    if (logToFiles) transports.push(...AppLoggerFactory.files(env.LOG_DIR));
    if (env.SENTRY_DSN) transports.push(AppLoggerFactory.sentry());

    return WinstonModule.createLogger({
      level: env.LOG_LEVEL,
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp(),
      ),
      transports,
    });
  }

  private static console(isProduction: boolean): Transport {
    return new winston.transports.Console({
      format: isProduction
        ? winston.format.json()
        : nestWinston.format.nestLike('SaveMyVote', {
            colors: true,
            prettyPrint: true,
          }),
    });
  }

  private static files(directory: string): Transport[] {
    mkdirSync(directory, { recursive: true });
    const json = winston.format.json();
    return [
      new winston.transports.File({
        filename: join(directory, 'app.log'),
        format: json,
        maxsize: MAX_FILE_BYTES,
        maxFiles: 5,
        tailable: true,
      }),
      new winston.transports.File({
        filename: join(directory, 'error.log'),
        level: 'error',
        format: json,
        maxsize: MAX_FILE_BYTES,
        maxFiles: 5,
        tailable: true,
      }),
    ];
  }

  private static sentry(): Transport {
    const SentryTransport = Sentry.createSentryWinstonTransport(Transport, {
      levels: ['info', 'warn', 'error', 'fatal'],
    });
    const dropNoise = winston.format((info) =>
      SENTRY_SKIPPED_CONTEXTS.has(String(info.context)) ? false : info,
    );
    return new SentryTransport({ format: dropNoise() });
  }
}
