import { cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const frontendDist = fileURLToPath(new URL('../dist/', import.meta.url));
const repositoryDist = fileURLToPath(new URL('../../dist/', import.meta.url));

await rm(repositoryDist, { recursive: true, force: true });
await cp(frontendDist, repositoryDist, { recursive: true });

console.log('Copied frontend/dist to dist for repository-root deployments.');
