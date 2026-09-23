import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { env } from '../config/env.js';
import { createDatabaseClient } from './client.js';

if (env.DATABASE_MODE !== 'postgres') {
  throw new Error('db:migrate is only needed when DATABASE_MODE=postgres. Embedded development storage migrates automatically.');
}

const client = await createDatabaseClient(env);

try {
  const migrationsFolder = fileURLToPath(new URL('../../drizzle', import.meta.url));
  await migrate(client.db, { migrationsFolder });
  console.info('Database migrations completed.');
} finally {
  await client.close();
}
