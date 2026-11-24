# SaveMyVote API

NestJS 12 + TypeORM 1 + PostgreSQL. Organisers create elections, upload a voter roll and launch; voters get an emailed one-time code and cast a secret ballot.

## Run it locally

```bash
# from the repo root: start PostgreSQL (host port 5433)
docker compose up -d db

cd backend
cp .env.example .env        # then fill in the three secrets (command is in the file)
npm install
npm run start:dev           # http://localhost:3000/api/v1 (health at /api/health), docs at http://localhost:3000/api/docs
```

Migrations run automatically on start-up. Without `SENDBYTE_API_KEY`, emails (verification links, voting codes) are printed to the terminal instead of being sent.

To run the API in Docker as well: `docker compose up -d --build` from the repo root (it reads `backend/.env`).

## Tests

```bash
npm test            # unit tests
npm run test:e2e    # full flow against a real database (needs `docker compose up -d db`)
```

The e2e suite uses its own `savemyvote_test` database and captures emails in memory, so it never calls SendByte or Sentry.

## Email (SendByte)

Set `SENDBYTE_API_KEY` and a `MAIL_FROM_ADDRESS` on a domain verified in SendByte (an `sk_test_` key simulates sends without delivering them).

SendByte has no batch endpoint and allows 120 requests a minute per key, so every email is its own request, spaced 550 ms apart: about 109 a minute, so a 1,000-voter election takes roughly 9 minutes. The SDK retries rate-limited, 5xx and network failures with backoff under an idempotency key, so a retry never sends twice. Each voter is marked by their own email's outcome, and failed ones are retried on a later scheduler run.

Swapping providers means writing one `MailTransport` subclass (`src/mail/transports`).

## Image storage (Cloudflare R2)

Candidate photos and election logos are uploaded to `POST /api/v1/uploads/images` (multipart, field `file`). The API checks the type from the file's bytes (JPEG, PNG, WebP or GIF; 415 otherwise), refuses files over 5 MB (413), stores the image under a random key with a one-year immutable `Cache-Control`, and returns its public URL. That URL is what elections and candidates save. The frontend shrinks images in the browser first (256px photos, 512px logos, WebP), so uploads are usually a few dozen KB.

Without the `R2_*` variables, images are saved in `LOCAL_UPLOADS_DIR` and served at `BACKEND_URL/uploads`. Production refuses to start without R2, because a Fly machine's disk is wiped on every deploy.

Setting up R2 (Cloudflare dashboard → R2):

1. Create a bucket, e.g. `savemyvote-images`. That is `R2_BUCKET`.
2. Make it publicly readable: bucket → Settings → Custom Domains → connect a domain on Cloudflare, e.g. `images.savemyvote.mblob.me`. That is `R2_PUBLIC_URL` (`https://images.savemyvote.mblob.me`). The `r2.dev` URL works for testing but is rate-limited.
3. R2 → Manage API tokens → Create API token with **Object Read & Write**, limited to that bucket. Its Access Key ID and Secret Access Key are `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` (the secret is shown once).
4. `R2_ACCOUNT_ID` is the Account ID on the R2 overview page.

The bucket needs no CORS rules: uploads go through the API, and browsers only load the images.

Older drafts may still hold base64 `data:image/...` values; the API keeps accepting them, so those drafts can still be edited.

## Feedback identity (UserJot)

The frontend's UserJot feedback widget asks `GET /api/v1/auth/userjot-token` (signed-in organisers only) for an identity token. The API signs it with HS256 using `USERJOT_PROJECT_SECRET`, with `sub` = the organiser's id, `iss` = `USERJOT_PROJECT_ID`, `aud` = `userjot`, a one-hour expiry, and the organiser's email, name and organisation as claims. UserJot trusts what's in a signed token, so each post is tied to the organiser who sent it and they can edit or delete their own posts.

Both values are under UserJot → Settings → Login → Secrets. Set both or neither (the API refuses to start with only one). Without them the endpoint returns `{ "token": null }` and the widget falls back to an unsigned identity. In production the project ID is in `fly.toml`; set the secret with `fly secrets set USERJOT_PROJECT_SECRET=...` before deploying, or the new release won't start.

## Logging, monitoring and metrics

| | Where | When |
| --- | --- | --- |
| Logs | Console (readable in dev, JSON in prod) | always |
| | `logs/app.log` (everything at `LOG_LEVEL`+) and `logs/error.log` (errors only), JSON, rotated at 10 MB | `LOG_TO_FILES`, default on outside production |
| | Sentry Logs (info and above, linked to the request's trace) | when `SENTRY_DSN` is set |
| Errors | Sentry Issues: every 5xx and unhandled exception | when `SENTRY_DSN` is set |
| Traces | Sentry Performance: HTTP, Nest handlers, SQL queries (every request locally, 10% in production; `SENTRY_TRACES_SAMPLE_RATE` overrides) | when `SENTRY_DSN` is set |
| Metrics | Sentry Metrics (see below) | when `SENTRY_DSN` is set |
| Cron | Sentry Crons monitor `voter-invitations` (alerts if the invitation job stops or fails) | when `SENTRY_DSN` is set |

**Setting up Sentry:** the Sentry project is `savemyvote-server` (platform: NestJS). Copy its DSN from *Project Settings → Client Keys*, and set `SENTRY_DSN` (plus `SENTRY_ENVIRONMENT`, e.g. `development` / `production`, and optionally `SENTRY_RELEASE`). No other account access is needed.

The production image and `npm run start:prod` run Node with `--enable-source-maps`, so Sentry stack traces point at the `.ts` source.

Personal data stays on the server: request bodies, headers, cookies, query strings, SQL parameters and stack-frame variables are not sent to Sentry, and metric labels never contain emails or codes.

Metrics sent:

- `http.requests`, `http.request.duration` by method, route template and status
- `auth.signups`, `auth.logins` (by outcome and method), `auth.password_resets`
- `elections.created`, `elections.launched`, `elections.voter_roll_size`, `elections.ballot_positions`, `voters.added` (by source)
- `voter_emails.sent` / `voter_emails.failed` (by kind), `mail.deliveries` (by transport and outcome)
- `voting.voter_checks` (by outcome), `voting.ballots_cast`, `voting.votes_recorded`, `voting.ballots_rejected`
- `scheduler.invitations.duration`, `scheduler.invitations.elections_due`
- Node runtime: CPU, memory, event-loop delay and utilisation, every 30 s

## How it's built

```
src/
  config/        validated environment (class-validator) and a typed AppConfig service
  database/      TypeORM options shared by the app and CLI, migrations
  common/        base entity, @Public/@CurrentUser decorators, global JWT guard,
                 error filter, response envelope, scrypt PasswordHasher, advisory locks
  users/         organiser accounts
  auth/          sign-up, email verification, login, Google sign-in, password reset
  elections/     elections (draft -> launched), ballot (positions + candidates),
                 email templates, turnout stats, ownership checks
  voters/        voter roll, CSV import, one-time codes, invitation and reminder emails
  voting/        public voting endpoints, ballot validation, results
  scheduler/     minute-by-minute invitation sweep
  mail/          MailService + transports (SendByte, console)
  uploads/       image uploads to Cloudflare R2 (a local folder in development)
  observability/ Winston logger, Sentry metrics, HTTP timing
```

Every response is `{ status: "success", data }`; every error is `{ status: "fail" | "error", statusCode, message, errors? }`.

### Election lifecycle

1. **Draft:** the organiser edits details, branding, the ballot (`PUT /elections/:id/ballot`), email templates and the voter roll.
2. **Launch** (`POST /elections/:id/launch`): checks the election is complete, then locks the details and ballot. Until voting closes, the organiser can still add voters or remove ones who haven't voted, extend the end (`POST /elections/:id/extend`), or close voting early (`POST /elections/:id/close`).
3. **Invitations:** `OTP_LEAD_MINUTES` before the start, the scheduler emails every voter a fresh one-time code (or the organiser sends them now).
4. **Voting:** voters use `POST /public/elections/:id/verify` and `.../vote` with their email and code.
5. **Results:** organisers see live results; anyone can see them once voting closes.

### Security choices

- **Secret ballot:** a vote row has no voter id and no timestamp; the voter row only records *that* they voted.
- **One vote per voter:** the voter row is locked (`SELECT ... FOR UPDATE`) while the ballot is recorded, so simultaneous submissions can't both count.
- **One-time codes:** 6 characters from a CSPRNG, stored as an HMAC bound to the voter, and locked after `OTP_MAX_ATTEMPTS` wrong tries.
- **Organisers only see their own elections:** ownership is part of every query, so anything else is a 404.
- **Passwords:** hashed with scrypt and checked in constant time (unknown emails take as long as wrong passwords). Changing a password signs out older sessions, and reset links work once.
- **No user enumeration:** resend-verification and forgot-password always give the same answer.
- **Rate limits:** a global limit, with stricter ones on sign-in, the code checks and email sends.
