import { Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';

type Attributes = Record<string, string | number | boolean>;

/**
 * Application metrics, sent to Sentry. Names follow `area.event`; attributes are
 * low-cardinality labels (never emails, codes or other personal data).
 * Without SENTRY_DSN these calls are no-ops.
 */
@Injectable()
export class AppMetrics {
  // ---- HTTP ----
  httpRequest(
    attributes: { method: string; route: string; status: number },
    durationMs: number,
  ): void {
    const attrs = {
      ...attributes,
      status_class: `${Math.floor(attributes.status / 100)}xx`,
    };
    Sentry.metrics.count('http.requests', 1, { attributes: attrs });
    Sentry.metrics.distribution('http.request.duration', durationMs, {
      unit: 'millisecond',
      attributes: attrs,
    });
  }

  // ---- Organiser accounts ----
  signUp(): void {
    this.count('auth.signups');
  }

  login(
    outcome: 'success' | 'invalid_credentials' | 'unverified',
    method: 'password' | 'google' = 'password',
  ): void {
    this.count('auth.logins', { outcome, method });
  }

  passwordReset(): void {
    this.count('auth.password_resets');
  }

  // ---- Elections ----
  electionCreated(): void {
    this.count('elections.created');
  }

  electionLaunched(attributes: { positions: number; voters: number }): void {
    this.count('elections.launched');
    Sentry.metrics.distribution('elections.voter_roll_size', attributes.voters);
    Sentry.metrics.distribution(
      'elections.ballot_positions',
      attributes.positions,
    );
  }

  votersAdded(count: number, source: 'api' | 'csv'): void {
    this.count('voters.added', { source }, count);
  }

  // ---- Voter emails ----
  voterEmails(
    kind: 'invitation' | 'reminder' | 'confirmation',
    sent: number,
    failed: number,
  ): void {
    if (sent) this.count('voter_emails.sent', { kind }, sent);
    if (failed) this.count('voter_emails.failed', { kind }, failed);
  }

  emailDelivery(
    transport: string,
    outcome: 'sent' | 'failed',
    count = 1,
  ): void {
    this.count('mail.deliveries', { transport, outcome }, count);
  }

  // ---- Voting ----
  voterCheck(
    outcome: 'ok' | 'invalid' | 'locked' | 'already_voted',
    step: 'verify' | 'vote',
  ): void {
    this.count('voting.voter_checks', { outcome, step });
  }

  ballotCast(positions: number): void {
    this.count('voting.ballots_cast');
    this.count('voting.votes_recorded', {}, positions);
  }

  ballotRejected(reason: 'invalid_selection'): void {
    this.count('voting.ballots_rejected', { reason });
  }

  // ---- Background jobs ----
  schedulerRun(durationMs: number, electionsProcessed: number): void {
    Sentry.metrics.distribution('scheduler.invitations.duration', durationMs, {
      unit: 'millisecond',
    });
    Sentry.metrics.gauge(
      'scheduler.invitations.elections_due',
      electionsProcessed,
    );
  }

  private count(name: string, attributes: Attributes = {}, value = 1): void {
    Sentry.metrics.count(name, value, { attributes });
  }
}
