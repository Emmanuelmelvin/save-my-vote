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
