import { PasswordHasher } from './password-hasher.js';

describe('PasswordHasher', () => {
  // Low cost keeps the test fast; production uses N=16384.
  const hasher = new PasswordHasher({ N: 1024, r: 8, p: 1 });

  it('verifies the right password and rejects a wrong one', async () => {
    const hash = await hasher.hash('correct horse battery');
    expect(hash).toMatch(/^scrypt\$1024\$8\$1\$/);
    expect(await hasher.verify('correct horse battery', hash)).toBe(true);
    expect(await hasher.verify('Correct horse battery', hash)).toBe(false);
  });

  it('salts every hash', async () => {
    expect(await hasher.hash('same')).not.toBe(await hasher.hash('same'));
  });

  it('returns false (after doing the work) when there is no stored hash', async () => {
    expect(await hasher.verify('anything', null)).toBe(false);
    expect(await hasher.verify('anything', undefined)).toBe(false);
  });

  it('rejects malformed hashes', async () => {
    expect(await hasher.verify('x', 'bcrypt$whatever')).toBe(false);
  });
});
