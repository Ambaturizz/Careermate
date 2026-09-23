import { readFile } from 'node:fs/promises';
import { parse } from 'csv-parse/sync';
import { eq } from 'drizzle-orm';
import type { Database } from '../db/client.js';
import { dataImportRuns, dataSources } from '../db/schema.js';

export type CsvRow = Record<string, string>;
export type ImportStatistics = Record<string, number>;

export type SourceDefinition = {
  name: string;
  version: string;
  sourceUrl: string;
  license: string;
  attribution: string;
  retrievedAt?: Date;
};

export function normalizeText(value: string): string {
  return value.normalize('NFKC').replace(/\s+/g, ' ').trim();
}

export function normalizeKey(value: string): string {
  return normalizeText(value).toLocaleLowerCase('en-US');
}

export function numberOrNull(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function scaleOneToFive(value: number | null): number | null {
  if (value === null) return null;
  return Math.max(0, Math.min(100, ((value - 1) / 4) * 100));
}

export function scaleOneToSeven(value: number | null): number | null {
  if (value === null) return null;
  return Math.max(0, Math.min(100, ((value - 1) / 6) * 100));
}

export async function readCsv(path: string): Promise<CsvRow[]> {
  const content = await readFile(path, 'utf8');
  return parse(content, {
    columns: true,
    bom: true,
    skip_empty_lines: true,
    relax_column_count: false,
    trim: true,
  }) as CsvRow[];
}

export async function inBatches<T>(
  values: T[],
  size: number,
  operation: (batch: T[]) => Promise<unknown>,
): Promise<void> {
  for (let index = 0; index < values.length; index += size) {
    await operation(values.slice(index, index + size));
  }
}

export async function registerDataSource(
  db: Database,
  source: SourceDefinition,
): Promise<string> {
  const [record] = await db.insert(dataSources).values({
    ...source,
    retrievedAt: source.retrievedAt ?? new Date(),
  }).onConflictDoUpdate({
    target: [dataSources.name, dataSources.version],
    set: {
      sourceUrl: source.sourceUrl,
      license: source.license,
      attribution: source.attribution,
      retrievedAt: source.retrievedAt ?? new Date(),
      updatedAt: new Date(),
    },
  }).returning({ id: dataSources.id });

  if (!record) throw new Error(`Could not register data source ${source.name}.`);
  return record.id;
}

export async function runTrackedImport(
  db: Database,
  dataSourceId: string,
  importer: string,
  operation: () => Promise<ImportStatistics>,
): Promise<ImportStatistics> {
  const [run] = await db.insert(dataImportRuns).values({
    dataSourceId,
    importer,
    status: 'running',
  }).returning({ id: dataImportRuns.id });
  if (!run) throw new Error('Could not create import run.');

  try {
    const statistics = await operation();
    await db.update(dataImportRuns).set({
      status: 'completed',
      statistics,
      completedAt: new Date(),
    }).where(eq(dataImportRuns.id, run.id));
    await db.update(dataSources).set({
      lastImportedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(dataSources.id, dataSourceId));
    return statistics;
  } catch (error) {
    await db.update(dataImportRuns).set({
      status: 'failed',
      errorMessage: error instanceof Error ? error.message.slice(0, 4_000) : String(error),
      completedAt: new Date(),
      statistics: {},
    }).where(eq(dataImportRuns.id, run.id));
    throw error;
  }
}
