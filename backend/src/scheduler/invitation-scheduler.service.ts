import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SentryCron } from '@sentry/nestjs';
import { AppMetrics } from '../observability/app-metrics.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfig } from '../config/app-config.service.js';
import { AdvisoryLockService } from '../common/database/advisory-lock.service.js';
import {
  Election,
  ElectionStatus,
} from '../elections/entities/election.entity.js';
import {
  MAX_INVITATION_FAILURES,
  VoterInvitationService,
} from '../voters/voter-invitation.service.js';

/**
 * Every minute: for each launched election that starts within OTP_LEAD_MINUTES (or is
 * already open) and still has voters without an invitation, send them their codes.
 * Calls the service directly; no HTTP round trip, no open endpoint.
 */
@Injectable()
export class InvitationScheduler {
  private readonly logger = new Logger(InvitationScheduler.name);

  constructor(
    @InjectRepository(Election)
    private readonly elections: Repository<Election>,
    private readonly invitations: VoterInvitationService,
    private readonly locks: AdvisoryLockService,
    private readonly config: AppConfig,
    private readonly metrics: AppMetrics,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'voter-invitations',
    waitForCompletion: true,
  })
  // A Sentry cron monitor: alerts if the sweep stops running, runs long, or keeps failing.
  @SentryCron('voter-invitations', {
    schedule: { type: 'crontab', value: '* * * * *' },
    checkinMargin: 2,
    // Minutes. Emails go out one request at a time (~109 a minute), so a
    // 1,000-voter election takes about 9 minutes.
    maxRuntime: 30,
    failureIssueThreshold: 3,
  })
  async tick(): Promise<void> {
    if (!this.config.schedulerEnabled) return;
    const started = Date.now();
    try {
      // With several API instances, one runs the sweep and the others skip this minute.
      const run = await this.locks.tryWithLock(
        'scheduler:voter-invitations',
        () => this.sendDueInvitations(),
      );
      if (run.acquired)
        this.metrics.schedulerRun(Date.now() - started, run.result);
    } catch (error) {
      this.logger.error(`Invitation sweep failed: ${String(error)}`);
      throw error; // reported to the Sentry cron monitor as a failed check-in
    }
  }

  async sendDueInvitations(now: Date = new Date()): Promise<number> {
    const sendFrom = new Date(
      now.getTime() + this.config.otp.leadMinutes * 60_000,
    );
    const due = await this.elections
      .createQueryBuilder('election')
      .where('election.status = :status', { status: ElectionStatus.Launched })
      .andWhere('election.startAt <= :sendFrom', { sendFrom })
      .andWhere('election.endAt > :now', { now })
      .andWhere(
        `EXISTS (SELECT 1 FROM voters v WHERE v."electionId" = election.id
           AND v."invitationSentAt" IS NULL AND v."hasVoted" = false AND v."invitationFailures" < :maxFailures)`,
        { maxFailures: MAX_INVITATION_FAILURES },
      )
      .getMany();

    for (const election of due) {
      await this.invitations.dispatchPendingInvitations(election);
    }
    return due.length;
  }
}
