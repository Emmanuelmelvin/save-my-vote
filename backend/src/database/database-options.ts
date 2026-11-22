import type { DataSourceOptions } from 'typeorm';
import type { EnvironmentVariables } from '../config/environment.js';
import { ENTITIES } from './entities.js';
import { MIGRATIONS } from './migrations/index.js';

type DatabaseEnv = Pick<
  EnvironmentVariables,
  | 'DATABASE_URL'
  | 'DB_HOST'
  | 'DB_PORT'
  | 'DB_USER'
  | 'DB_PASSWORD'
  | 'DB_NAME'
  | 'DB_SSL'
  | 'DB_RUN_MIGRATIONS'
  | 'DB_LOGGING'
>;

/**
 * Shared by the Nest app and the TypeORM CLI data source, so both see the same schema.
 * The schema is only ever changed by migrations (never `synchronize`).
 */
export function buildDataSourceOptions(env: DatabaseEnv): DataSourceOptions {
  const connection = env.DATABASE_URL
    ? { url: env.DATABASE_URL }
    : {
        host: env.DB_HOST,
        port: env.DB_PORT,
        username: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
      };

  return {
    type: 'postgres',
    ...connection,
    ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
    // gen_random_uuid() is built into PostgreSQL 13+, so no extension has to be installed.
    uuidExtension: 'pgcrypto',
    installExtensions: false,
    entities: ENTITIES,
    migrations: MIGRATIONS,
    migrationsRun: env.DB_RUN_MIGRATIONS,
    migrationsTransactionMode: 'each',
    synchronize: false,
    logging: env.DB_LOGGING ? ['query', 'error'] : ['error'],
    extra: { max: 10, connectionTimeoutMillis: 10_000 },
  };
}
