import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import type { Database } from '../../src/db/client.js';
import * as schema from '../../src/db/schema.js';

export async function createTestDatabase(): Promise<{ client: PGlite; db: Database }> {
  const client = new PGlite();
  const migration = await readFile(resolve(process.cwd(), 'drizzle/0000_initial_database.sql'), 'utf8');
  for (const statement of migration.split('--> statement-breakpoint').map((item) => item.trim()).filter(Boolean)) {
    await client.exec(statement);
  }
  const db = drizzle(client, { schema }) as unknown as Database;
  return { client, db };
}
