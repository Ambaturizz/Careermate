import { readdir } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { eq, sql } from 'drizzle-orm';
import type { Database } from '../db/client.js';
import {
  externalMappings,
  occupationSkills,
  occupations,
  skillAliases,
  skills,
} from '../db/schema.js';
import {
  inBatches,
  normalizeKey,
  normalizeText,
  readCsv,
  registerDataSource,
  runTrackedImport,
  type CsvRow,
  type ImportStatistics,
} from './common.js';

export const ESCO_VERSION = '1.2.1';
export const ESCO_SOURCE = {
  name: 'ESCO',
  version: ESCO_VERSION,
  sourceUrl: 'https://esco.ec.europa.eu/en/use-esco/download',
  license: 'European Commission reuse policy (Commission Decision 2011/833/EU)',
  attribution: 'European Union, ESCO version 1.2.1. CareerMate modifies and normalizes the source data. The European Commission is not liable for this adaptation.',
} as const;

function field(row: CsvRow, names: string[]): string {
  const entries = new Map(Object.entries(row).map(([key, value]) => [normalizeKey(key).replace(/[^a-z0-9]/g, ''), value]));
  for (const name of names) {
    const value = entries.get(normalizeKey(name).replace(/[^a-z0-9]/g, ''));
    if (value) return normalizeText(value);
  }
  return '';
}

async function csvFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.csv'))
    .map((entry) => join(entry.parentPath, entry.name));
}

function selectFile(files: string[], pattern: RegExp, label: string): string {
  const match = files.find((path) => pattern.test(basename(path)));
  if (!match) throw new Error(`ESCO ${label} CSV was not found in the supplied directory.`);
  return match;
}

export async function importEsco(db: Database, directory: string): Promise<ImportStatistics> {
  const dataSourceId = await registerDataSource(db, ESCO_SOURCE);
  return runTrackedImport(db, dataSourceId, 'esco-v1', async () => {
    const files = await csvFiles(directory);
    const occupationPath = selectFile(files, /^occupations.*\.csv$/i, 'occupations');
    const skillPath = selectFile(files, /^skills.*\.csv$/i, 'skills');
    const relationPath = selectFile(files, /occupation.*skill.*relations.*\.csv$/i, 'occupation-skill relations');
    const [occupationRows, skillRows, relationRows] = await Promise.all([
      readCsv(occupationPath), readCsv(skillPath), readCsv(relationPath),
    ]);

    const existingOccupations = await db.select({ id: occupations.id, normalizedTitle: occupations.normalizedTitle }).from(occupations);
    const occupationByTitle = new Map(existingOccupations.map((row) => [row.normalizedTitle, row.id]));
    const newOccupationRows = occupationRows.filter((row) => {
      const title = field(row, ['preferredLabel', 'preferred label']);
      return title && !occupationByTitle.has(normalizeKey(title));
    });
    await inBatches(newOccupationRows, 500, async (batch) => db.insert(occupations).values(batch.map((row) => {
      const title = field(row, ['preferredLabel', 'preferred label']);
      return {
        title,
        normalizedTitle: normalizeKey(title),
        description: field(row, ['description', 'scopeNote']) || 'No description supplied by ESCO.',
        careerCluster: field(row, ['conceptType', 'concept type']) || null,
        dataSourceId,
        externalId: field(row, ['conceptUri', 'concept URI', 'URI']),
      };
    })).onConflictDoNothing());

    const allOccupations = await db.select({ id: occupations.id, normalizedTitle: occupations.normalizedTitle }).from(occupations);
    for (const row of allOccupations) occupationByTitle.set(row.normalizedTitle, row.id);
    const occupationByExternal = new Map<string, string>();
    const occupationMappingValues = occupationRows.flatMap((row) => {
      const title = field(row, ['preferredLabel', 'preferred label']);
      const externalId = field(row, ['conceptUri', 'concept URI', 'URI']);
      const entityId = occupationByTitle.get(normalizeKey(title));
      if (!title || !externalId || !entityId) return [];
      occupationByExternal.set(externalId, entityId);
      const exactExisting = existingOccupations.some((item) => item.id === entityId);
      return [{
        entityType: 'occupation', entityId, dataSourceId, externalId, externalUri: externalId,
        status: exactExisting ? 'manual_review' as const : 'exact' as const,
        confidence: exactExisting ? 0.75 : 1,
        notes: exactExisting ? 'Exact normalized-title candidate; requires human review before claiming taxonomy equivalence.' : 'Canonical record created from this ESCO concept.',
      }];
    });
    await inBatches(occupationMappingValues, 500, async (batch) => db.insert(externalMappings).values(batch).onConflictDoUpdate({
      target: [externalMappings.entityType, externalMappings.dataSourceId, externalMappings.externalId],
      set: { entityId: sql`excluded.entity_id`, externalUri: sql`excluded.external_uri`, status: sql`excluded.status`, confidence: sql`excluded.confidence`, notes: sql`excluded.notes`, updatedAt: new Date() },
    }));

    const existingSkills = await db.select({ id: skills.id, normalizedName: skills.normalizedName }).from(skills);
    const skillByName = new Map(existingSkills.map((row) => [row.normalizedName, row.id]));
    const newSkillRows = skillRows.filter((row) => {
      const name = field(row, ['preferredLabel', 'preferred label']);
      return name && !skillByName.has(normalizeKey(name));
    });
    await inBatches(newSkillRows, 500, async (batch) => db.insert(skills).values(batch.map((row) => {
      const name = field(row, ['preferredLabel', 'preferred label']);
      return {
        name,
        normalizedName: normalizeKey(name),
        description: field(row, ['description', 'scopeNote']) || null,
        category: field(row, ['skillType', 'skill type', 'conceptType']) || null,
        kind: field(row, ['conceptType']).toLowerCase().includes('language') ? 'language' as const : 'skill' as const,
        primaryDataSourceId: dataSourceId,
        externalId: field(row, ['conceptUri', 'concept URI', 'URI']),
      };
    })).onConflictDoNothing());

    const allSkills = await db.select({ id: skills.id, normalizedName: skills.normalizedName }).from(skills);
    for (const row of allSkills) skillByName.set(row.normalizedName, row.id);
    const skillByExternal = new Map<string, string>();
    const skillMappingValues = skillRows.flatMap((row) => {
      const name = field(row, ['preferredLabel', 'preferred label']);
      const externalId = field(row, ['conceptUri', 'concept URI', 'URI']);
      const entityId = skillByName.get(normalizeKey(name));
      if (!name || !externalId || !entityId) return [];
      skillByExternal.set(externalId, entityId);
      const exactExisting = existingSkills.some((item) => item.id === entityId);
      return [{
        entityType: 'skill', entityId, dataSourceId, externalId, externalUri: externalId,
        status: exactExisting ? 'manual_review' as const : 'exact' as const,
        confidence: exactExisting ? 0.75 : 1,
        notes: exactExisting ? 'Exact normalized-label candidate; semantic equivalence is not assumed.' : 'Canonical record created from this ESCO concept.',
      }];
    });
    await inBatches(skillMappingValues, 500, async (batch) => db.insert(externalMappings).values(batch).onConflictDoUpdate({
      target: [externalMappings.entityType, externalMappings.dataSourceId, externalMappings.externalId],
      set: { entityId: sql`excluded.entity_id`, externalUri: sql`excluded.external_uri`, status: sql`excluded.status`, confidence: sql`excluded.confidence`, notes: sql`excluded.notes`, updatedAt: new Date() },
    }));

    const aliases = skillRows.flatMap((row) => {
      const externalId = field(row, ['conceptUri', 'concept URI', 'URI']);
      const skillId = skillByExternal.get(externalId);
      const raw = field(row, ['altLabels', 'alternative labels', 'alternativeLabel']);
      if (!skillId || !raw) return [];
      return raw.split(/\r?\n|\|/).map(normalizeText).filter(Boolean).map((alias) => ({
        skillId, alias, normalizedAlias: normalizeKey(alias), locale: 'en', dataSourceId, externalId,
      }));
    });
    await inBatches(aliases, 500, async (batch) => db.insert(skillAliases).values(batch).onConflictDoNothing());

    const parsedRelations = relationRows.flatMap((row) => {
      const occupationId = occupationByExternal.get(field(row, ['occupationUri', 'occupation URI']));
      const skillId = skillByExternal.get(field(row, ['skillUri', 'skill URI']));
      if (!occupationId || !skillId) return [];
      const relationType = field(row, ['relationType', 'relation type']).toLowerCase();
      const required = relationType.includes('essential');
      return [{
        occupationId, skillId, dataSourceId,
        importance: required ? 100 : 60,
        level: null,
        requirementType: required ? 'required' as const : 'preferred' as const,
        originalValues: { relationType },
      }];
    });
    const relationsByPair = new Map<string, (typeof parsedRelations)[number]>();
    for (const relation of parsedRelations) {
      const key = `${relation.occupationId}\u0000${relation.skillId}`;
      const existing = relationsByPair.get(key);
      if (!existing || relation.requirementType === 'required') relationsByPair.set(key, relation);
    }
    const relations = [...relationsByPair.values()];
    await inBatches(relations, 500, async (batch) => db.insert(occupationSkills).values(batch).onConflictDoUpdate({
      target: [occupationSkills.occupationId, occupationSkills.skillId, occupationSkills.dataSourceId],
      set: { importance: sql`excluded.importance`, requirementType: sql`excluded.requirement_type`, originalValues: sql`excluded.original_values` },
    }));

    return {
      occupations: occupationRows.length,
      skills: skillRows.length,
      skillAliases: aliases.length,
      occupationSkillRelationships: relations.length,
      mappingsPendingReview: [...occupationMappingValues, ...skillMappingValues].filter((mapping) => mapping.status === 'manual_review').length,
    };
  });
}
