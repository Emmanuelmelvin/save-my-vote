import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import request from 'supertest';
import type { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { PasswordHasher } from '../src/common/security/password-hasher.js';
import { Election } from '../src/elections/entities/election.entity.js';
import {
  MailTransport,
  type OutgoingEmail,
} from '../src/mail/transports/mail-transport.js';

/** Keeps emails in memory instead of sending them through SendByte. */
class CapturingMailTransport extends MailTransport {
  readonly name = 'capture';
  readonly sent: OutgoingEmail[] = [];

  deliver(email: OutgoingEmail): Promise<void> {
    this.sent.push(email);
    return Promise.resolve();
  }

  lastTo(address: string, subjectIncludes: string): OutgoingEmail {
    const email = [...this.sent]
      .reverse()
      .find((e) => e.to === address && e.subject.includes(subjectIncludes));
    if (!email)
      throw new Error(`No email to ${address} matching "${subjectIncludes}"`);
    return email;
  }
}

describe('Organiser and voter flow (e2e)', () => {
  let app: NestExpressApplication;
  let dataSource: DataSource;
  const mail = new CapturingMailTransport();
  const stamp = Date.now();
  const organiser = {
    fullName: 'Ada Lovelace',
    email: `ada-${stamp}@example.com`,
    password: 'correct horse battery',
  };
  const credentials = (
    email = organiser.email,
    password = organiser.password,
  ) => ({ email, password });
  const voterEmails = [`v1-${stamp}@example.com`, `v2-${stamp}@example.com`];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(MailTransport)
      .useValue(mail)
      .overrideProvider(PasswordHasher)
      .useValue(new PasswordHasher({ N: 1024, r: 8, p: 1 }))
      .compile();
    app = moduleRef.createNestApplication<NestExpressApplication>({
      bodyParser: false,
      logger: ['error'],
    });
    configureApp(app);
    await app.init();
    dataSource = app.get(getDataSourceToken());
  });

  afterAll(async () => {
    await app?.close();
  });

  it('serves the API under /api/v1 and the health check unversioned', async () => {
    const http = request(app.getHttpServer());
    await http.get('/api/health').expect(200);
    await http.get('/api/v1/health').expect(404);
    await http.post('/api/auth/login').send(credentials()).expect(404);
    await http.post('/api/v1/auth/login').send(credentials()).expect(401);
  });

  it('runs an election from sign-up to results', async () => {
    const http = request.agent(app.getHttpServer());

    // ---- Organiser account ----
    await http.post('/api/v1/auth/signup').send(organiser).expect(201);
    await http.post('/api/v1/auth/login').send(credentials()).expect(403); // not verified yet

    const verifyText = mail.lastTo(organiser.email, 'Verify').text;
    const verifyPath = new URL(
      verifyText.match(/https?:\/\/\S+verify-email\?token=\S+/)![0],
    );
    const verified = await http
      .get(`${verifyPath.pathname}${verifyPath.search}`)
      .expect(302);
    expect(verified.headers.location).toContain('verified=true');

    await http
      .post('/api/v1/auth/login')
      .send(credentials(organiser.email, 'wrong password!!'))
      .expect(401);
    await http.post('/api/v1/auth/login').send(credentials()).expect(200);
    const me = await http.get('/api/v1/auth/me').expect(200);
    expect(me.body).toMatchObject({
      status: 'success',
      data: { user: { email: organiser.email } },
    });

    // ---- Draft election ----
    const created = await http
      .post('/api/v1/elections')
      .send({
        title: 'Student Union 2027',
        startAt: new Date(Date.now() + 10 * 60_000),
        endAt: new Date(Date.now() + 60 * 60_000),
      })
      .expect(201);
    const electionId: string = created.body.data.id;

    const notReady = await http
      .post(`/api/v1/elections/${electionId}/launch`)
      .expect(422);
    expect(notReady.body.errors).toEqual(
      expect.arrayContaining([
        'Add at least one position to the ballot',
        'Add at least one voter',
      ]),
    );

    await http
      .put(`/api/v1/elections/${electionId}/ballot`)
      .send({
        positions: [
          {
            title: 'President',
            candidates: [{ name: 'Grace' }, { name: 'Alan' }],
          },
          { title: 'Secretary', candidates: [{ name: 'Linus' }] },
        ],
      })
      .expect(200);

    await http
      .put(`/api/v1/elections/${electionId}/email-templates`)
      .send({
        templates: [
          {
            type: 'invitation',
            fromName: 'Committee',
            subject: 'Vote: {{electionTitle}}',
            body: 'Hi {{voterName}} <b>x</b>',
          },
        ],
      })
      .expect(200);

    const added = await http
      .post(`/api/v1/elections/${electionId}/voters`)
      .send({
        voters: [
          { email: voterEmails[0], fullName: 'Voter One' },
          { email: voterEmails[0].toUpperCase() },
        ],
      })
      .expect(201);
    expect(added.body.data).toMatchObject({ added: 1, skipped: 1 });

    const imported = await http
      .post(`/api/v1/elections/${electionId}/voters/import`)
      .attach(
        'file',
        Buffer.from(
          `Email,Name\n${voterEmails[1]},Voter Two\nnot-an-email,X\n`,
        ),
        'voters.csv',
      )
      .expect(201);
    expect(imported.body.data).toMatchObject({ added: 1, totalVoters: 2 });
    expect(imported.body.data.failedRows).toHaveLength(1);

    // ---- Another organiser can't see or touch it ----
    const stranger = request.agent(app.getHttpServer());
    const strangerEmail = `eve-${stamp}@example.com`;
    await stranger
      .post('/api/v1/auth/signup')
      .send({ ...organiser, email: strangerEmail })
      .expect(201);
    await dataSource.query(
      'UPDATE users SET "isVerified" = true WHERE email = $1',
      [strangerEmail],
    );
    await stranger
      .post('/api/v1/auth/login')
      .send(credentials(strangerEmail))
      .expect(200);
    await stranger.get(`/api/v1/elections/${electionId}`).expect(404);
    await stranger.post(`/api/v1/elections/${electionId}/launch`).expect(404);

    // ---- Launch: the election is locked ----
    await http.post(`/api/v1/elections/${electionId}/launch`).expect(200);
    await http
      .put(`/api/v1/elections/${electionId}/ballot`)
      .send({ positions: [] })
      .expect(409);

    const sent = await http
      .post(`/api/v1/elections/${electionId}/invitations/send`)
      .expect(200);
    expect(sent.body.data).toEqual({ sent: 2, failed: 0 });
    const codes = voterEmails.map((email) => {
      const invitation = mail.lastTo(email, 'Vote: Student Union 2027');
      expect(invitation.html).toContain('&lt;b&gt;x&lt;/b&gt;'); // organiser HTML is escaped
      return invitation.text.match(/Your one-time code: ([A-Z0-9]{6})/)![1];
    });

    // ---- Voting ----
    const voterApi = request(app.getHttpServer());
    await voterApi
      .post(`/api/v1/public/elections/${electionId}/verify`)
      .send({ email: voterEmails[0], otp: codes[0] })
      .expect(403); // not open yet

    // Open the election now instead of waiting for the start time.
    await dataSource
      .getRepository(Election)
      .update(electionId, { startAt: new Date(Date.now() - 1000) });

    const ballot = (
      await voterApi.get(`/api/v1/public/elections/${electionId}`).expect(200)
    ).body.data.ballot;
    const [president, secretary] = ballot;
    const choices = (presidentIndex: number) => [
      {
        positionId: president.id,
        candidateId: president.candidates[presidentIndex].id,
      },
      { positionId: secretary.id, candidateId: secretary.candidates[0].id },
    ];

    await voterApi
      .post(`/api/v1/public/elections/${electionId}/verify`)
      .send({ email: voterEmails[0], otp: 'AAAAAA' })
      .expect(401);
    await voterApi
      .post(`/api/v1/public/elections/${electionId}/verify`)
      .send({ email: voterEmails[0], otp: codes[0].toLowerCase() })
      .expect(200);
    await voterApi
      .post(`/api/v1/public/elections/${electionId}/vote`)
      .send({
        email: voterEmails[0],
        otp: codes[0],
        selections: choices(0).slice(0, 1),
      })
      .expect(422); // must vote for every position

    // Two simultaneous ballots from the same voter: exactly one is accepted.
    const attempts = await Promise.all(
      [0, 1].map(() =>
        voterApi.post(`/api/v1/public/elections/${electionId}/vote`).send({
          email: voterEmails[0],
          otp: codes[0],
          selections: choices(0),
        }),
      ),
    );
    expect(attempts.map((r) => r.status).sort()).toEqual([201, 409]);

    await voterApi
      .post(`/api/v1/public/elections/${electionId}/vote`)
      .send({ email: voterEmails[1], otp: codes[1], selections: choices(1) })
      .expect(201);

    // ---- Results ----
    await voterApi
      .get(`/api/v1/public/elections/${electionId}/results`)
      .expect(403); // still open
    const results = (
      await http.get(`/api/v1/elections/${electionId}/results`).expect(200)
    ).body.data;
    expect(results.analytics).toMatchObject({
      totalVoters: 2,
      votersWhoVoted: 2,
      turnout: 100,
      totalVotes: 4,
    });
    expect(results.positions[0]).toMatchObject({
      title: 'President',
      totalVotes: 2,
      isTie: true,
    });
    expect(
      results.positions[0].candidates.map(
        (c: { percentage: number }) => c.percentage,
      ),
    ).toEqual([50, 50]);
    expect(results.positions[1]).toMatchObject({
      title: 'Secretary',
      winnerIds: [secretary.candidates[0].id],
    });

    // Secret ballot: votes carry no voter reference.
    const voteColumns = await dataSource.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'votes'`,
    );
    expect(
      voteColumns.map((c: { column_name: string }) => c.column_name).sort(),
    ).toEqual(['candidateId', 'electionId', 'id', 'positionId']);
  });

  it('locks a voter out after too many wrong codes', async () => {
    // Uses a dedicated election so the counter starts at zero.
    const http = request.agent(app.getHttpServer());
    const email = `lock-${stamp}@example.com`;
    await http
      .post('/api/v1/auth/signup')
      .send({ ...organiser, email })
      .expect(201);
    await dataSource.query(
      'UPDATE users SET "isVerified" = true WHERE email = $1',
      [email],
    );
    await http.post('/api/v1/auth/login').send(credentials(email)).expect(200);

    const { id } = (
      await http
        .post('/api/v1/elections')
        .send({
          title: 'Lockout',
          startAt: new Date(Date.now() + 5 * 60_000),
          endAt: new Date(Date.now() + 60 * 60_000),
        })
        .expect(201)
    ).body.data;
    await http
      .put(`/api/v1/elections/${id}/ballot`)
      .send({ positions: [{ title: 'P', candidates: [{ name: 'C' }] }] });
    await http
      .post(`/api/v1/elections/${id}/voters`)
      .send({ voters: [{ email: `voter-${email}` }] })
      .expect(201);
    await http.post(`/api/v1/elections/${id}/launch`).expect(200);
    await dataSource
      .getRepository(Election)
      .update(id, { startAt: new Date(Date.now() - 1000) });

    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/public/elections/${id}/verify`)
        .send({ email: `voter-${email}`, otp: 'ZZZZZZ' });
      statuses.push(res.status);
    }
    expect(statuses).toEqual([401, 401, 401, 401, 403, 403]);
  });

  it('keeps the roll and end date adjustable after launch, until the election closes', async () => {
    const http = request.agent(app.getHttpServer());
    const email = `after-${stamp}@example.com`;
    const signup = await http
      .post('/api/v1/auth/signup')
      .send({
        ...organiser,
        email,
        organizationType: 'institution',
        organizationName: 'University of Lagos',
      })
      .expect(201);
    expect(signup.body.data.user).toMatchObject({
      organizationType: 'institution',
      organizationName: 'University of Lagos',
    });
    await dataSource.query(
      'UPDATE users SET "isVerified" = true WHERE email = $1',
      [email],
    );
    await http.post('/api/v1/auth/login').send(credentials(email)).expect(200);

    const election = (
      await http
        .post('/api/v1/elections')
        .send({
          title: 'After launch',
          startAt: new Date(Date.now() + 5 * 60_000),
          endAt: new Date(Date.now() + 60 * 60_000),
        })
        .expect(201)
    ).body.data;
    const id: string = election.id;
    await http
      .put(`/api/v1/elections/${id}/ballot`)
      .send({ positions: [{ title: 'P', candidates: [{ name: 'C' }] }] })
      .expect(200);
    await http
      .post(`/api/v1/elections/${id}/voters`)
      .send({ voters: [{ email: `first-${email}` }] })
      .expect(201);
    await http.post(`/api/v1/elections/${id}/launch`).expect(200);

    // Voters can still be added and removed.
    await http
      .post(`/api/v1/elections/${id}/voters`)
      .send({ voters: [{ email: `late-${email}` }] })
      .expect(201);
    const roll = (await http.get(`/api/v1/elections/${id}/voters`).expect(200))
      .body.data;
    expect(roll.pagination.total).toBe(2);
    const late = roll.items.find(
      (v: { email: string }) => v.email === `late-${email}`,
    );
    await http.delete(`/api/v1/elections/${id}/voters/${late.id}`).expect(204);

    // The end can move later, not earlier.
    await http
      .post(`/api/v1/elections/${id}/extend`)
      .send({ endAt: new Date(Date.now() + 30 * 60_000) })
      .expect(400);
    const extended = await http
      .post(`/api/v1/elections/${id}/extend`)
      .send({ endAt: new Date(Date.now() + 2 * 60 * 60_000) })
      .expect(200);
    expect(new Date(extended.body.data.endAt).getTime()).toBeGreaterThan(
      new Date(election.endAt).getTime(),
    );

    // Closing ends voting; the roll is then frozen and results are public.
    const closed = await http.post(`/api/v1/elections/${id}/close`).expect(200);
    expect(closed.body.data.phase).toBe('ended');
    await http
      .post(`/api/v1/elections/${id}/voters`)
      .send({ voters: [{ email: `too-late-${email}` }] })
      .expect(409);
    await request(app.getHttpServer())
      .get(`/api/v1/public/elections/${id}/results`)
      .expect(200);
  });
});
