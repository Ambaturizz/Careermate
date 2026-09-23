import { resolve } from 'node:path';
import { env } from '../config/env.js';
import { createDatabaseClient } from '../db/client.js';
import { importEsco } from './esco.js';
import { importKbji } from './kbji.js';
import { importOnet, ONET_VERSION } from './onet.js';

const importer = process.argv[2];
const defaultPaths: Record<string, string> = {
  onet: `data/raw/onet/${ONET_VERSION}`,
  esco: 'data/raw/esco/1.2.1',
  kbji: 'data/raw/kbji/2014',
};
if (!importer || !(importer in defaultPaths)) {
  throw new Error('Usage: npm run data:import:<onet|esco|kbji> -- [source directory or CSV path]');
}
if (env.DATABASE_MODE !== 'postgres') {
  throw new Error('Dataset imports require DATABASE_MODE=postgres and a persistent DATABASE_URL.');
}
const client = await createDatabaseClient(env);
const path = resolve(process.cwd(), process.argv[3] ?? defaultPaths[importer]!);

try {
  const statistics = importer === 'onet'
    ? await importOnet(client.db, path)
    : importer === 'esco'
      ? await importEsco(client.db, path)
      : await importKbji(client.db, path);
  process.stdout.write(`${JSON.stringify({ importer, path, statistics }, null, 2)}\n`);
} finally {
  await client.close();
}
