/**
 * Sentry for the browser: errors, tracing, logs and Session Replay. main.tsx imports
 * this file first so Sentry is ready before the app renders.
 *
 * With no VITE_SENTRY_DSN nothing is initialised and every Sentry call is a no-op.
 */
import * as Sentry from '@sentry/react'

const dsn = import.meta.env.VITE_SENTRY_DSN?.trim()

/** VITE_SENTRY_TRACES_SAMPLE_RATE wins; otherwise every page load in dev, 10% in production builds. */
function tracesSampleRate(): number {
  const configured = import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE?.trim()
  if (configured) return Number(configured)
  return import.meta.env.PROD ? 0.1 : 1.0
}

/** Requests to our API carry trace headers, so a page load and its API calls form one trace. */
function apiOrigins(): (string | RegExp)[] {
  const apiUrl = import.meta.env.VITE_API_URL ?? '/api'
  const targets: (string | RegExp)[] = [/^\/api(\/|$)/]
  if (/^https?:\/\//.test(apiUrl)) targets.push(apiUrl.replace(/\/+$/, ''))
  return targets
}

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
    release: import.meta.env.VITE_SENTRY_RELEASE || undefined,
    // Voters and organisers type passwords, one-time codes and reset tokens, so no
    // user, cookie, header, body or query data leaves the browser by default.
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
    },
    integrations: [
      // Page loads, navigations and fetch calls as spans.
      Sentry.browserTracingIntegration(),
      // All text and inputs are masked and media blocked: replays show layout and clicks only.
      Sentry.replayIntegration({ maskAllText: true, maskAllInputs: true, blockAllMedia: true }),
      // console.warn / console.error become Sentry Logs, linked to the current trace.
      Sentry.consoleLoggingIntegration({ levels: ['warn', 'error'] }),
    ],
    tracesSampleRate: tracesSampleRate(),
    tracePropagationTargets: apiOrigins(),
    // Replay 10% of sessions, and every session that hits an error.
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  })
}
