import type { AppConfig } from '../config/app-config.service.js';
import { OtpService } from './otp.service.js';

const config = {
  otp: { secret: 'x'.repeat(48), leadMinutes: 60, maxAttempts: 5 },
} as AppConfig;

describe('OtpService', () => {
  const otp = new OtpService(config);

  it('generates 6-character codes without look-alike characters', () => {
    for (let i = 0; i < 200; i++) {
      expect(otp.generate()).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{6}$/);
    }
  });

  it('verifies a code case- and space-insensitively', () => {
    const hash = otp.hash('voter-1', 'K7P2QX');
    expect(otp.verify('voter-1', 'k7p 2qx', hash)).toBe(true);
    expect(otp.verify('voter-1', 'K7P2QY', hash)).toBe(false);
  });

  it("binds the code to the voter, so one voter's code fails for another", () => {
    const hash = otp.hash('voter-1', 'K7P2QX');
    expect(otp.verify('voter-2', 'K7P2QX', hash)).toBe(false);
  });

  it('fails closed when no code has been issued', () => {
    expect(otp.verify('voter-1', 'K7P2QX', null)).toBe(false);
  });

  it('depends on the server secret', () => {
    const other = new OtpService({
      otp: { ...config.otp, secret: 'y'.repeat(48) },
    } as AppConfig);
    expect(
      other.verify('voter-1', 'K7P2QX', otp.hash('voter-1', 'K7P2QX')),
    ).toBe(false);
  });
});
