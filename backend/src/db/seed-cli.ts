import { resolve } from 'node:path';
import { env } from '../config/env.js';
import { createDatabaseClient } from './client.js';
import { seedDatabase } from './seed.js';

if (env.DATABASE_MODE !== 'postgres') {
  throw new Error('db:seed is only needed when DATABASE_MODE=postgres. Embedded development storage seeds automatically.');
}
const client = await createDatabaseClient(env);
try {
  const filePath = resolve(process.cwd(), process.argv[2] ?? 'data/seed/career-reference.seed.json');
  const statistics = await seedDatabase(client.db, filePath);
  process.stdout.write(`${JSON.stringify({ filePath, statistics }, null, 2)}\n`);
} finally {
  await client.close();
}
