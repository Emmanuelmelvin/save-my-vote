import pg from 'pg';

/**
 * Creates the e2e database once (migrations run when the app boots).
 * Needs the Postgres from docker-compose: `docker compose up -d db`.
 */
export default async function setup(): Promise<void> {
  const database = process.env.DB_NAME ?? 'savemyvote_test';
  const client = new pg.Client({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5433),
    user: process.env.DB_USER ?? 'savemyvote',
    password: process.env.DB_PASSWORD ?? 'savemyvote',
    database: 'postgres',
  });
  await client.connect();
  try {
    const { rowCount } = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [database],
    );
    if (!rowCount)
      await client.query(`CREATE DATABASE "${database.replace(/"/g, '')}"`);
  } finally {
    await client.end();
  }
}
