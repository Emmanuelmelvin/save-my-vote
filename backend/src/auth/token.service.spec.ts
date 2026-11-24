import { JwtService } from '@nestjs/jwt';
import type { AppConfig } from '../config/app-config.service.js';
import type { User } from '../users/user.entity.js';
import { TokenService } from './token.service.js';

const userJot = { projectId: 'project-123', secret: 'userjot-project-secret' };

function service(config: Partial<AppConfig>) {
  return new TokenService(
    new JwtService({ signOptions: { algorithm: 'HS256' } }),
    config as AppConfig,
  );
}

const user = {
  id: 'user-1',
  email: 'ada@example.com',
  fullName: '  Ada  King Lovelace ',
  organizationType: 'organisation',
  organizationName: 'Analytical Society',
  createdAt: new Date('2026-01-02T03:04:05.000Z'),
} as User;

describe('TokenService.signUserJotToken', () => {
  it('signs the claims UserJot verifies with the project secret', async () => {
    const token = await service({ userJot }).signUserJotToken(user);

    const payload = await new JwtService().verifyAsync<Record<string, unknown>>(
      token!,
      {
        secret: userJot.secret,
        algorithms: ['HS256'],
        audience: 'userjot',
        issuer: 'project-123',
      },
    );
    expect(payload).toMatchObject({
      sub: 'user-1',
      iss: 'project-123',
      aud: 'userjot',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'King Lovelace',
      traits: {
        organizationType: 'organisation',
        organizationName: 'Analytical Society',
        signedUpAt: '2026-01-02T03:04:05.000Z',
      },
    });
    expect((payload.exp as number) - (payload.iat as number)).toBe(3600);
  });

  it('returns undefined when UserJot is not configured', async () => {
    await expect(
      service({ userJot: undefined }).signUserJotToken(user),
    ).resolves.toBeUndefined();
  });
});
