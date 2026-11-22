import { Injectable } from '@nestjs/common';
import {
  randomBytes,
  scrypt,
  timingSafeEqual,
  type ScryptOptions,
} from 'node:crypto';

const scryptAsync = (
  password: string,
  salt: Buffer,
  keyLength: number,
  options: ScryptOptions,
) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, keyLength, options, (error, key) =>
      error ? reject(error) : resolve(key),
    ),
  );

/**
 * Hashes passwords with scrypt (built into Node, no native add-on).
 * Stored format: `scrypt$N$r$p$saltBase64$hashBase64`, so the cost can be raised later
 * without breaking existing hashes.
 */
@Injectable()
export class PasswordHasher {
  private static readonly KEY_LENGTH = 64;
  private readonly cost: { N: number; r: number; p: number };
  private dummyHash?: Promise<string>;

  constructor(
    cost: { N: number; r: number; p: number } = { N: 16384, r: 8, p: 1 },
  ) {
    this.cost = cost;
  }

  async hash(password: string): Promise<string> {
    const salt = randomBytes(16);
    const { N, r, p } = this.cost;
    const key = await scryptAsync(password, salt, PasswordHasher.KEY_LENGTH, {
      N,
      r,
      p,
      maxmem: 256 * N * r,
    });
    return [
      'scrypt',
      N,
      r,
      p,
      salt.toString('base64'),
      key.toString('base64'),
    ].join('$');
  }

  /**
   * Compares in constant time. With no stored hash it still checks against a dummy
   * one, so "no such user" takes as long as "wrong password".
   */
  async verify(
    password: string,
    stored: string | null | undefined,
  ): Promise<boolean> {
    const target = stored ?? (await this.getDummyHash());
    const parts = target.split('$');
    if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
    const [, n, r, p, saltB64, hashB64] = parts;
    const expected = Buffer.from(hashB64, 'base64');
    const N = Number(n);
    const actual = await scryptAsync(
      password,
      Buffer.from(saltB64, 'base64'),
      expected.length,
      {
        N,
        r: Number(r),
        p: Number(p),
        maxmem: 256 * N * Number(r),
      },
    );
    return timingSafeEqual(actual, expected) && stored != null;
  }

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= this.hash(randomBytes(16).toString('hex'));
    return this.dummyHash;
  }
}
