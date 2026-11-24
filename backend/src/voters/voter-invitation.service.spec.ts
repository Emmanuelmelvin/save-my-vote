import type { Repository } from 'typeorm';
import type { AdvisoryLockService } from '../common/database/advisory-lock.service.js';
import type { AppConfig } from '../config/app-config.service.js';
import type { ElectionAccessService } from '../elections/election-access.service.js';
import { Election } from '../elections/entities/election.entity.js';
import { MailDeliveryError } from '../mail/transports/mail-transport.js';
import type { AppMetrics } from '../observability/app-metrics.js';
import type { ElectionMailer } from './election-mailer.js';
import { Voter } from './entities/voter.entity.js';
import type { OtpService } from './otp.service.js';
import { VoterInvitationService } from './voter-invitation.service.js';

const voter = (id: string) =>
  Object.assign(new Voter(), {
    id,
    email: `${id}@example.com`,
    fullName: id,
  });

describe('VoterInvitationService', () => {
  it('marks each voter by their own email outcome', async () => {
    const page = [voter('v1'), voter('v2'), voter('v3')];
    const voters = {
      find: vi.fn().mockResolvedValueOnce(page).mockResolvedValueOnce([]),
      update: vi.fn().mockResolvedValue({ affected: 1 }),
      increment: vi.fn().mockResolvedValue(undefined),
    };
    const mailer = {
      composerFor: vi.fn().mockResolvedValue({
        compose: (v: Voter, code: string) => ({
          to: v.email,
          subject: 'Vote',
          html: code,
          text: code,
        }),
      }),
      sendMany: vi.fn().mockResolvedValue([
        { delivered: true },
        {
          delivered: false,
          error: new MailDeliveryError('SendByte validation_error (422)'),
        },
        { delivered: true },
      ]),
    };
    const locks = {
      tryWithLock: vi.fn(
        async (_key: string, work: () => Promise<unknown>) => ({
          acquired: true,
          result: await work(),
        }),
      ),
    };
    const metrics = { voterEmails: vi.fn() };
    const service = new VoterInvitationService(
      voters as unknown as Repository<Voter>,
      { generate: () => 'K7P2QX', hash: () => 'hash' } as unknown as OtpService,
      mailer as unknown as ElectionMailer,
      locks as unknown as AdvisoryLockService,
      {} as ElectionAccessService,
      {} as AppConfig,
      metrics as unknown as AppMetrics,
    );

    const result = await service.dispatchPendingInvitations(
      Object.assign(new Election(), { id: 'e1' }),
    );

    expect(result).toEqual({ sent: 2, failed: 1 });
    expect(voters.increment).toHaveBeenCalledWith(
      { id: expect.objectContaining({ _value: ['v2'] }) },
      'invitationFailures',
      1,
    );
    expect(voters.update).toHaveBeenLastCalledWith(
      { id: expect.objectContaining({ _value: ['v1', 'v3'] }) },
      { invitationSentAt: expect.any(Date), invitationFailures: 0 },
    );
    expect(metrics.voterEmails).toHaveBeenCalledWith('invitation', 2, 1);
  });
});
