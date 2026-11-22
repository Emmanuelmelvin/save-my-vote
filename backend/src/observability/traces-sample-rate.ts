/**
 * Share of requests Sentry traces. SENTRY_TRACES_SAMPLE_RATE wins when set; otherwise
 * every request is traced locally (so a trace is always there when you check) and
 * 10% in production.
 */
export function tracesSampleRate(env: NodeJS.ProcessEnv): number {
  const configured = env.SENTRY_TRACES_SAMPLE_RATE?.trim();
  if (configured) return Number(configured);
  return env.NODE_ENV === 'production' ? 0.1 : 1.0;
}
