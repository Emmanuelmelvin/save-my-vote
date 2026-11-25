import { validateEnvironment } from './environment.js';

const secrets = {
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_EMAIL_SECRET: 'b'.repeat(32),
  OTP_SECRET: 'c'.repeat(32),
};

describe('validateEnvironment', () => {
  it('applies defaults and converts types', () => {
    const env = validateEnvironment({
      ...secrets,
      PORT: '4000',
      DB_SSL: 'false',
    });
    expect(env.PORT).toBe(4000);
    expect(env.DB_SSL).toBe(false);
    expect(env.OTP_MAX_ATTEMPTS).toBe(5);
  });

  it('reads "true"/"false" strings as booleans (not truthy strings)', () => {
    expect(
      validateEnvironment({ ...secrets, SWAGGER_ENABLED: 'false' })
        .SWAGGER_ENABLED,
    ).toBe(false);
    expect(
      validateEnvironment({ ...secrets, TRUST_PROXY: 'true' }).TRUST_PROXY,
    ).toBe(true);
  });

  it('treats empty strings as unset', () => {
    expect(
      validateEnvironment({ ...secrets, GOOGLE_CLIENT_ID: '' })
        .GOOGLE_CLIENT_ID,
    ).toBeUndefined();
  });

  it('refuses to start with missing or short secrets', () => {
    expect(() => validateEnvironment({})).toThrow(/JWT_ACCESS_SECRET/);
    expect(() =>
      validateEnvironment({ ...secrets, OTP_SECRET: 'short' }),
    ).toThrow(/OTP_SECRET/);
  });

  it('needs both UserJot settings or neither', () => {
    expect(() =>
      validateEnvironment({
        ...secrets,
        USERJOT_PROJECT_ID: 'project',
        USERJOT_PROJECT_SECRET: 'secret',
      }),
    ).not.toThrow();
    expect(() =>
      validateEnvironment({ ...secrets, USERJOT_PROJECT_ID: 'project' }),
    ).toThrow(/USERJOT_PROJECT_SECRET/);
    expect(() =>
      validateEnvironment({ ...secrets, USERJOT_PROJECT_SECRET: 'secret' }),
    ).toThrow(/USERJOT_PROJECT_ID/);
  });

  describe('R2 image storage', () => {
    const r2 = {
      R2_ACCOUNT_ID: 'a'.repeat(32),
      R2_ACCESS_KEY_ID: 'key-id',
      R2_SECRET_ACCESS_KEY: 'secret',
      R2_BUCKET: 'savemyvote-images',
      R2_PUBLIC_URL: 'https://images.example.com',
    };

    it('is optional outside production', () => {
      expect(() => validateEnvironment(secrets)).not.toThrow();
      expect(() => validateEnvironment({ ...secrets, ...r2 })).not.toThrow();
    });

    it('is required in production', () => {
      expect(() =>
        validateEnvironment({ ...secrets, NODE_ENV: 'production' }),
      ).toThrow(/R2_BUCKET/);
      expect(() =>
        validateEnvironment({ ...secrets, ...r2, NODE_ENV: 'production' }),
      ).not.toThrow();
    });

    it('refuses a partial configuration', () => {
      expect(() =>
        validateEnvironment({ ...secrets, ...r2, R2_SECRET_ACCESS_KEY: '' }),
      ).toThrow(/also set R2_SECRET_ACCESS_KEY/);
    });
  });
});
