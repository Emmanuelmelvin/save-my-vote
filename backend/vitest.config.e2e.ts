import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    setupFiles: ['./vitest.setup.ts'],
    globalSetup: ['./test/global-setup.ts'],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
    // A separate database and no outside services: no emails, no Sentry, no log files.
    env: {
      NODE_ENV: 'test',
      DB_HOST: 'localhost',
      DB_PORT: '5433',
      DB_USER: 'savemyvote',
      DB_PASSWORD: 'savemyvote',
      DB_NAME: 'savemyvote_test',
      DATABASE_URL: '',
      JWT_ACCESS_SECRET: 'e2e-access-secret-0123456789abcdefghijklmnop',
      JWT_EMAIL_SECRET: 'e2e-email-secret-0123456789abcdefghijklmnopq',
      OTP_SECRET: 'e2e-otp-secret-0123456789abcdefghijklmnopqrst',
      RESEND_API_KEY: '',
      SENTRY_DSN: '',
      LOG_TO_FILES: 'false',
      SCHEDULER_ENABLED: 'false',
      SWAGGER_ENABLED: 'false',
      FRONTEND_URL: 'http://localhost:5173',
      BACKEND_URL: 'http://localhost:3000',
    },
  },
});
