/**
 * Data source for the TypeORM CLI (migrations). Run against the compiled output:
 *   npm run build && npm run migration:generate --name=AddSomething
 * then add the new class to src/database/migrations/index.ts.
 */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { validateEnvironment } from '../config/environment.js';
import { buildDataSourceOptions } from './database-options.js';

try {
  process.loadEnvFile();
} catch {
  // No .env file: rely on the real environment.
}

const env = validateEnvironment(process.env);

// The CLI requires exactly one exported DataSource.
export default new DataSource({
  ...buildDataSourceOptions(env),
  migrationsRun: false,
});
