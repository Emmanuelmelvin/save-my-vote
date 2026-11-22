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
});
