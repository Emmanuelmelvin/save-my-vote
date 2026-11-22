# SaveMyVote frontend

React 19 + Vite + Tailwind. Talks to the NestJS API in `../backend`.

```bash
npm install
npm run dev      # http://localhost:5173 (proxies /api to http://localhost:3000)
npm run build
```

Point the dev proxy elsewhere with `VITE_API_PROXY_TARGET`. For a production build served from a different domain than the API, set `VITE_API_URL` (see `.env.example`).

## How data flows

- `src/lib/api/client.ts`: `ApiClient` (fetch with the auth cookie, unwraps `{ status, data }`, throws `ApiError`).
- `src/lib/api/services.ts`: one class per API area (`AuthApi`, `ElectionsApi`, `VotersApi`, `VotingApi`).
- `src/lib/api/hooks.ts`: TanStack Query hooks and query keys (`useSession`, `useElections`, `useResults`...).
- `src/store/createElection.ts`: the create-election wizard's draft (Zustand); `src/lib/election-draft.ts` saves each step to the API.

## Pages

| Route | Who | What |
| --- | --- | --- |
| `/signup`, `/login`, `/check-email`, `/forgot-password`, `/reset-password` | organisers | account flows |
| `/dashboard` | organisers (signed in) | elections list, create wizard, manage a launched election, results |
| `/preview/:id` | organisers (signed in) | the ballot as voters see it; nothing is recorded |
| `/vote/:id` | voters | sign in with email + one-time code, vote, see final results after closing |

## Monitoring (Sentry)

`src/instrument.ts` sets up Sentry (project `savemyvote-frontend`) when `VITE_SENTRY_DSN` is set:

- **Errors:** uncaught errors and React rendering errors (via React 19's root error hooks).
- **Tracing:** page loads, navigations and API calls. Requests to the API carry trace headers, so a page and the backend work it caused show up as one trace. Every page load is traced in dev, 10% in production builds (`VITE_SENTRY_TRACES_SAMPLE_RATE` overrides).
- **Logs:** `console.warn` and `console.error` become Sentry Logs.
- **Session Replay:** 10% of sessions plus every session with an error. All text and inputs are masked and media is blocked, so passwords and one-time codes are never recorded.
- No user, cookie, header, body or query-string data is sent.

**Production (Vercel / Netlify):** set these build environment variables:

| Variable | Value |
| --- | --- |
| `VITE_SENTRY_DSN` | the `savemyvote-frontend` DSN (Sentry → Project Settings → Client Keys) |
| `VITE_SENTRY_ENVIRONMENT` | `production` (defaults to the Vite mode, which is already `production` for `vite build`) |
| `SENTRY_AUTH_TOKEN` | an organization auth token (Sentry → Settings → Auth Tokens). **Secret: never commit it.** |

With `SENTRY_AUTH_TOKEN` set, `npm run build` creates a Sentry release named after the git commit and uploads source maps, then deletes the `.map` files from `dist/` so your source isn't served publicly. Without it, the build skips source maps entirely.

## Feedback (UserJot)

`src/lib/userjot.ts` adds the [UserJot](https://userjot.com) feedback widget for organisers when `VITE_USERJOT_PROJECT_ID` is set (UserJot → Settings → Login → Secrets, or the Share page; it's public, not a secret):

- The SDK (`https://cdn.userjot.com/sdk/v3/uj.js`) loads only when the dashboard opens, so voters on `/vote` never download it.
- No floating button: the dashboard sidebar's **Send Feedback** item opens the widget on the feedback tab.
- The signed-in organiser is identified by id, email, name and organisation, so their posts are attributed to them. Signing out logs them out of UserJot too.
- Identity is unsigned (browser-supplied). To stop impersonation, or to let organisers edit and delete their own posts, the backend would need to sign a UserJot identity token with the project secret.

Set `VITE_USERJOT_PROJECT_ID` as a build variable in production. Leave it empty to turn the widget off.
