import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { sql } from 'drizzle-orm';
import type { Database } from '../db/client.js';
import { externalMappings, occupations } from '../db/schema.js';
import {
  inBatches,
  normalizeKey,
  normalizeText,
  readCsv,
  registerDataSource,
  runTrackedImport,
  type ImportStatistics,
} from './common.js';

export const KBJI_VERSION = '2014';
export const KBJI_SOURCE = {
  name: 'Klasifikasi Baku Jabatan Indonesia (KBJI)',
  version: KBJI_VERSION,
  sourceUrl: 'https://ppid.bps.go.id/app/konten/3302/Unduh.html',
  license: 'BPS Terms of Use; reuse permitted with source attribution',
  attribution: 'Badan Pusat Statistik, Klasifikasi Baku Jabatan Indonesia 2014. Accessed from the official BPS publication/download service. CareerMate modifies and normalizes the source data.',
} as const;

export async function importKbji(db: Database, path: string): Promise<ImportStatistics> {
  const metadata = await stat(path);
  const csvPath = metadata.isDirectory() ? join(path, 'kbji_2014.csv') : path;
  const dataSourceId = await registerDataSource(db, KBJI_SOURCE);
  return runTrackedImport(db, dataSourceId, 'kbji-v1', async () => {
    const rows = await readCsv(csvPath);
    const current = await db.select({ id: occupations.id, normalizedTitle: occupations.normalizedTitle }).from(occupations);
    const byTitle = new Map(current.map((row) => [row.normalizedTitle, row.id]));
    const parsed = rows.map((row) => ({
      code: normalizeText(row.code ?? row.Code ?? row.kode ?? row.Kode ?? ''),
      title: normalizeText(row.title ?? row.Title ?? row.judul ?? row.Judul ?? ''),
      description: normalizeText(row.description ?? row.Description ?? row.deskripsi ?? row.Deskripsi ?? ''),
    })).filter((row) => row.code && row.title);
    if (parsed.length === 0) throw new Error('KBJI CSV must contain code and title columns.');

    const newRows = parsed.filter((row) => !byTitle.has(normalizeKey(row.title)));
    await inBatches(newRows, 500, async (batch) => db.insert(occupations).values(batch.map((row) => ({
      title: row.title,
      normalizedTitle: normalizeKey(row.title),
      description: row.description || 'No description supplied in the prepared KBJI CSV.',
      careerCluster: 'KBJI localization',
      dataSourceId,
      externalId: row.code,
    }))).onConflictDoUpdate({
      target: [occupations.dataSourceId, occupations.externalId],
      set: { title: sql`excluded.title`, normalizedTitle: sql`excluded.normalized_title`, description: sql`excluded.description`, updatedAt: new Date() },
    }));

    const all = await db.select({ id: occupations.id, normalizedTitle: occupations.normalizedTitle }).from(occupations);
    for (const row of all) byTitle.set(row.normalizedTitle, row.id);
    const mappings = parsed.flatMap((row) => {
      const entityId = byTitle.get(normalizeKey(row.title));
      if (!entityId) return [];
      const existed = current.some((item) => item.id === entityId);
      return [{
        entityType: 'occupation', entityId, dataSourceId, externalId: row.code,
        status: existed ? 'manual_review' as const : 'exact' as const,
        confidence: existed ? 0.7 : 1,
        notes: existed ? 'Exact normalized-title candidate only; O*NET/ESCO/KBJI equivalence requires review.' : 'Canonical record created from this KBJI code.',
      }];
    });
    await inBatches(mappings, 500, async (batch) => db.insert(externalMappings).values(batch).onConflictDoUpdate({
      target: [externalMappings.entityType, externalMappings.dataSourceId, externalMappings.externalId],
      set: { entityId: sql`excluded.entity_id`, status: sql`excluded.status`, confidence: sql`excluded.confidence`, notes: sql`excluded.notes`, updatedAt: new Date() },
    }));

    return {
      occupations: parsed.length,
      mappingsPendingReview: mappings.filter((mapping) => mapping.status === 'manual_review').length,
    };
  });
}
