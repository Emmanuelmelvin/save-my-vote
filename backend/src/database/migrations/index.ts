import { InitialSchema1795364809485 } from './1795364809485-InitialSchema.js';
import { AddOrganizationToUsers1795367015716 } from './1795367015716-AddOrganizationToUsers.js';

/**
 * Migrations in the order they run. Listing the classes (rather than a file glob)
 * keeps them loadable from both the compiled app and the TypeScript test runner.
 * After `npm run migration:generate --name=Something`, add the new class here.
 */
export const MIGRATIONS: Function[] = [
  InitialSchema1795364809485,
  AddOrganizationToUsers1795367015716,
];
