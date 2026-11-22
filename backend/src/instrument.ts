/**
 * Sentry must initialise before anything else is imported, so its instrumentation
 * can hook into http, express and pg. main.ts imports this file first.
 *
 * With no SENTRY_DSN nothing is initialised and every Sentry call is a no-op.
 */
import * as Sentry from '@sentry/nestjs';

try {
  process.loadEnvFile();
} catch {
  // No .env file: rely on the real environment.
}

const dsn = process.env.SENTRY_DSN?.trim();

if (dsn) {
  Sentry.init({
    dsn,
    environment:
      process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE || undefined,
    // Share of requests traced end to end (HTTP -> Nest handler -> SQL queries).
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.2),
    // A voting system handles passwords, one-time codes and reset tokens, so none of
    // the request/user data Sentry collects by default leaves the server.
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      databaseQueryData: false,
      stackFrameVariables: false,
    },
    integrations: [
      // CPU, memory and event-loop metrics for the whole process.
      Sentry.nodeRuntimeMetricsIntegration({ collectionIntervalMs: 30_000 }),
    ],
  });
}

export const sentryEnabled = Boolean(dsn);
