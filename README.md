# SaveMyVote

Online elections: organisers build a ballot and voter roll; voters receive a one-time code by email and cast a secret ballot.

| Folder | What |
| --- | --- |
| [`frontend/`](frontend) | React + Vite + Tailwind dashboard and voting pages ([README](frontend/README.md)) |
| [`backend/`](backend) | NestJS + TypeORM + PostgreSQL API ([README](backend/README.md)) |
| `docker-compose.yml` | PostgreSQL for local development, plus the API image |

## Quick start

```bash
docker compose up -d db                         # PostgreSQL on localhost:5433

cd backend && cp .env.example .env              # fill in the three secrets
npm install && npm run start:dev                # API on http://localhost:3000/api

cd ../frontend && npm install && npm run dev    # UI on http://localhost:5173
```

The Vite dev server proxies `/api` to the API, so the sign-in cookie works without any CORS setup. Without `RESEND_API_KEY`, verification links and voting codes are printed in the API's terminal.
