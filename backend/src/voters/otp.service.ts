import { Injectable } from '@nestjs/common';
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { AppConfig } from '../config/app-config.service.js';

/**
 * One-time voting codes.
 *
 * - Generated with a CSPRNG from an alphabet without look-alikes (no 0/O, 1/I/L).
 * - Stored as HMAC-SHA256 keyed with OTP_SECRET and bound to the voter's id, so a
 *   leaked database alone can't be brute-forced offline, and one voter's code
 *   can't be used for another.
 * - Compared in constant time. Online guessing is capped by OTP_MAX_ATTEMPTS.
 */
@Injectable()
export class OtpService {
  static readonly ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  static readonly LENGTH = 6;

  constructor(private readonly config: AppConfig) {}

  generate(): string {
    let code = '';
    for (let i = 0; i < OtpService.LENGTH; i++) {
      code += OtpService.ALPHABET[randomInt(OtpService.ALPHABET.length)];
    }
    return code;
  }

  hash(voterId: string, code: string): string {
    return createHmac('sha256', this.config.otp.secret)
      .update(`${voterId}:${OtpService.normalize(code)}`)
      .digest('hex');
  }

  verify(voterId: string, code: string, storedHash: string | null): boolean {
    if (!storedHash) return false;
    const expected = Buffer.from(storedHash, 'hex');
    const actual = Buffer.from(this.hash(voterId, code), 'hex');
    return (
      expected.length === actual.length && timingSafeEqual(expected, actual)
    );
  }

  /** Voters may type the code in lower case or with spaces. */
  static normalize(code: string): string {
    return code.replace(/\s+/g, '').toUpperCase();
  }
}
