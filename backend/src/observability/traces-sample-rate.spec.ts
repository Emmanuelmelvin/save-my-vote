import { describe, expect, it } from 'vitest';
import { tracesSampleRate } from './traces-sample-rate.js';

describe('tracesSampleRate', () => {
  it('traces every request outside production', () => {
    expect(tracesSampleRate({ NODE_ENV: 'development' })).toBe(1);
    expect(tracesSampleRate({})).toBe(1);
  });

  it('traces 10% of requests in production', () => {
    expect(tracesSampleRate({ NODE_ENV: 'production' })).toBe(0.1);
  });

  it('uses SENTRY_TRACES_SAMPLE_RATE when set', () => {
    expect(
      tracesSampleRate({
        NODE_ENV: 'production',
        SENTRY_TRACES_SAMPLE_RATE: '0.5',
      }),
    ).toBe(0.5);
  });

  it('ignores an empty SENTRY_TRACES_SAMPLE_RATE', () => {
    expect(
      tracesSampleRate({
        NODE_ENV: 'production',
        SENTRY_TRACES_SAMPLE_RATE: ' ',
      }),
    ).toBe(0.1);
  });
});
