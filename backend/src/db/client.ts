import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { Pool } from 'pg';
import type { Environment } from '../config/env.js';
import { seedDatabase } from './seed.js';
import * as schema from './schema.js';

export type Database = NodePgDatabase<typeof schema>;

export type DatabaseClient = {
  db: Database;
  mode: 'embedded' | 'postgres';
  check: () => Promise<void>;
  close: () => Promise<void>;
};

async function createEmbeddedClient(): Promise<DatabaseClient> {
  const client = new PGlite();
  const migrationPath = fileURLToPath(new URL('../../drizzle/0000_initial_database.sql', import.meta.url));
  const migration = await readFile(migrationPath, 'utf8');
  for (const statement of migration.split('--> statement-breakpoint').map((item) => item.trim()).filter(Boolean)) {
    await client.exec(statement);
  }

  const db = drizzlePglite(client, { schema }) as unknown as Database;
  const seedPath = fileURLToPath(new URL('../../data/seed/career-reference.seed.json', import.meta.url));
  await seedDatabase(db, seedPath);

  return {
    db,
    mode: 'embedded',
    check: async () => { await client.query('select 1 as ok'); },
    close: () => client.close(),
  };
}

export async function createDatabaseClient(environment: Environment): Promise<DatabaseClient> {
  if (environment.DATABASE_MODE === 'embedded') {
    return createEmbeddedClient();
  }

  const ssl = environment.DATABASE_SSL_MODE === 'disable'
    ? false
    : { rejectUnauthorized: environment.DATABASE_SSL_MODE === 'verify-full' };

  const pool = new Pool({
    connectionString: environment.DATABASE_URL,
    max: environment.DATABASE_POOL_MAX,
    ssl,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    application_name: 'careermate-backend',
  });

  return {
    db: drizzle(pool, { schema }),
    mode: 'postgres',
    check: async () => { await pool.query('select 1 as ok'); },
    close: () => pool.end(),
  };
}

export async function checkDatabaseConnection(client: DatabaseClient): Promise<void> {
  await client.check();
}
