import { join } from 'node:path';
import { and, eq, inArray, sql } from 'drizzle-orm';
import type { Database } from '../db/client.js';
import {
  abilities,
  interests,
  knowledgeAreas,
  occupationAbilities,
  occupationInterests,
  occupationKnowledge,
  occupations,
  occupationSkills,
  occupationTechnologies,
  skills,
  technologies,
} from '../db/schema.js';
import {
  inBatches,
  normalizeKey,
  normalizeText,
  numberOrNull,
  readCsv,
  registerDataSource,
  runTrackedImport,
  scaleOneToFive,
  scaleOneToSeven,
  type CsvRow,
  type ImportStatistics,
} from './common.js';

export const ONET_VERSION = '31.0';
export const ONET_SOURCE = {
  name: 'O*NET Database',
  version: ONET_VERSION,
  sourceUrl: 'https://www.onetcenter.org/database.html',
  license: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
  attribution: 'O*NET® 31.0 Database by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). CareerMate modifies and normalizes the source data.',
} as const;

type Measure = {
  occupationCode: string;
  elementId: string;
  elementName: string;
  importance: number | null;
  level: number | null;
  originalValues: Record<string, unknown>;
};

function contentDescriptions(rows: CsvRow[]): Map<string, string> {
  return new Map(rows.map((row) => [row['Element ID']!, normalizeText(row.Description ?? '')]));
}

function collectMeasures(rows: CsvRow[]): Measure[] {
  const measures = new Map<string, Measure>();
  for (const row of rows) {
    if (row['Recommend Suppress'] === 'Y') continue;
    const occupationCode = row['O*NET-SOC Code'];
    const elementId = row['Element ID'];
    const elementName = row['Element Name'];
    if (!occupationCode || !elementId || !elementName) continue;
    const key = `${occupationCode}\u0000${elementId}`;
    const current = measures.get(key) ?? {
      occupationCode,
      elementId,
      elementName: normalizeText(elementName),
      importance: null,
      level: null,
      originalValues: {},
    };
    const value = numberOrNull(row['Data Value']);
    if (row['Scale ID'] === 'IM') current.importance = scaleOneToFive(value);
    if (row['Scale ID'] === 'LV') current.level = scaleOneToSeven(value);
    current.originalValues[row['Scale ID'] ?? 'unknown'] = value;
    measures.set(key, current);
  }
  return [...measures.values()];
}

function educationLevel(rows: CsvRow[]): Map<string, string> {
  const grouped = new Map<string, { category: number; weight: number }[]>();
  for (const row of rows) {
    const code = row['O*NET-SOC Code'];
    const category = numberOrNull(row.Category);
    const weight = numberOrNull(row['Data Value']);
    if (!code || category === null || weight === null) continue;
    const values = grouped.get(code) ?? [];
    values.push({ category, weight });
    grouped.set(code, values);
  }
  const levels = new Map<string, string>();
  for (const [code, values] of grouped) {
    const dominant = values.sort((left, right) => right.weight - left.weight)[0]?.category;
    if (!dominant) continue;
    const level = dominant <= 3 ? 'secondary'
      : dominant === 4 ? 'vocational'
      : dominant <= 6 ? 'associate'
      : dominant <= 8 ? 'bachelor'
      : dominant <= 10 ? 'master'
      : 'doctorate';
    levels.set(code, level);
  }
  return levels;
}

async function insertMeasures(
  db: Database,
  dataSourceId: string,
  rows: Measure[],
  entity: 'skill' | 'knowledge' | 'ability',
  descriptions: Map<string, string>,
  occupationIds: Map<string, string>,
): Promise<number> {
  const referenceTable = entity === 'skill' ? skills : entity === 'knowledge' ? knowledgeAreas : abilities;
  const unique = [...new Map(rows.map((row) => [row.elementId, row])).values()];

  if (entity === 'skill') {
    await inBatches(unique, 500, async (batch) => db.insert(skills).values(batch.map((row) => ({
      name: row.elementName,
      normalizedName: normalizeKey(row.elementName),
      description: descriptions.get(row.elementId) || null,
      category: row.elementId.startsWith('2.A') ? 'essential' : 'transferable',
      primaryDataSourceId: dataSourceId,
      externalId: row.elementId,
    }))).onConflictDoUpdate({
      target: skills.normalizedName,
      set: { updatedAt: new Date() },
    }));
  } else if (entity === 'knowledge') {
    await inBatches(unique, 500, async (batch) => db.insert(knowledgeAreas).values(batch.map((row) => ({
      name: row.elementName,
      normalizedName: normalizeKey(row.elementName),
      description: descriptions.get(row.elementId) || null,
      dataSourceId,
      externalId: row.elementId,
    }))).onConflictDoNothing());
  } else {
    await inBatches(unique, 500, async (batch) => db.insert(abilities).values(batch.map((row) => ({
      name: row.elementName,
      normalizedName: normalizeKey(row.elementName),
      description: descriptions.get(row.elementId) || null,
      dataSourceId,
      externalId: row.elementId,
    }))).onConflictDoNothing());
  }

  const references = await db.select({
    id: referenceTable.id,
    externalId: referenceTable.externalId,
    normalizedName: referenceTable.normalizedName,
  }).from(referenceTable);
  const byExternalId = new Map(references.filter((row) => row.externalId).map((row) => [row.externalId!, row.id]));
  const byName = new Map(references.map((row) => [row.normalizedName, row.id]));

  if (entity === 'skill') {
    const relations = rows.flatMap((row) => {
      const occupationId = occupationIds.get(row.occupationCode);
      const skillId = byExternalId.get(row.elementId) ?? byName.get(normalizeKey(row.elementName));
      return occupationId && skillId ? [{
        occupationId, skillId, dataSourceId,
        importance: row.importance,
        level: row.level,
        requirementType: (row.importance ?? 0) >= 50 ? 'required' as const : 'preferred' as const,
        originalValues: row.originalValues,
      }] : [];
    });
    await inBatches(relations, 500, async (batch) => db.insert(occupationSkills).values(batch).onConflictDoUpdate({
      target: [occupationSkills.occupationId, occupationSkills.skillId, occupationSkills.dataSourceId],
      set: {
        importance: sql`excluded.importance`, level: sql`excluded.level`,
        requirementType: sql`excluded.requirement_type`, originalValues: sql`excluded.original_values`,
      },
    }));
    return relations.length;
  }

  if (entity === 'knowledge') {
    const relations = rows.flatMap((row) => {
      const occupationId = occupationIds.get(row.occupationCode);
      const knowledgeAreaId = byExternalId.get(row.elementId) ?? byName.get(normalizeKey(row.elementName));
      return occupationId && knowledgeAreaId ? [{ occupationId, knowledgeAreaId, dataSourceId, importance: row.importance, level: row.level, originalValues: row.originalValues }] : [];
    });
    await inBatches(relations, 500, async (batch) => db.insert(occupationKnowledge).values(batch).onConflictDoUpdate({
      target: [occupationKnowledge.occupationId, occupationKnowledge.knowledgeAreaId],
      set: { importance: sql`excluded.importance`, level: sql`excluded.level`, dataSourceId, originalValues: sql`excluded.original_values` },
    }));
    return relations.length;
  }

  const relations = rows.flatMap((row) => {
    const occupationId = occupationIds.get(row.occupationCode);
    const abilityId = byExternalId.get(row.elementId) ?? byName.get(normalizeKey(row.elementName));
    return occupationId && abilityId ? [{ occupationId, abilityId, dataSourceId, importance: row.importance, level: row.level, originalValues: row.originalValues }] : [];
  });
  await inBatches(relations, 500, async (batch) => db.insert(occupationAbilities).values(batch).onConflictDoUpdate({
    target: [occupationAbilities.occupationId, occupationAbilities.abilityId],
    set: { importance: sql`excluded.importance`, level: sql`excluded.level`, dataSourceId, originalValues: sql`excluded.original_values` },
  }));
  return relations.length;
}

export async function importOnet(db: Database, directory: string): Promise<ImportStatistics> {
  const dataSourceId = await registerDataSource(db, ONET_SOURCE);
  return runTrackedImport(db, dataSourceId, 'onet-v1', async () => {
    const [occupationRows, contentRows, essentialRows, transferableRows, knowledgeRows, abilityRows, interestRows, technologyRows, jobZoneRows, educationRows] = await Promise.all([
      readCsv(join(directory, 'occupation_data.csv')),
      readCsv(join(directory, 'content_model_reference.csv')),
      readCsv(join(directory, 'essential_skills.csv')),
      readCsv(join(directory, 'transferable_skills.csv')),
      readCsv(join(directory, 'knowledge.csv')),
      readCsv(join(directory, 'abilities.csv')),
      readCsv(join(directory, 'career_interest_types.csv')),
      readCsv(join(directory, 'software_skills.csv')),
      readCsv(join(directory, 'job_zones.csv')),
      readCsv(join(directory, 'education.csv')),
    ]);
    const descriptions = contentDescriptions(contentRows);
    const zones = new Map(jobZoneRows.map((row) => [row['O*NET-SOC Code']!, numberOrNull(row['Job Zone'])]));
    const educationLevels = educationLevel(educationRows);

    await inBatches(occupationRows, 500, async (batch) => db.insert(occupations).values(batch.map((row) => ({
      title: normalizeText(row.Title ?? ''),
      normalizedTitle: normalizeKey(row.Title ?? ''),
      description: normalizeText(row.Description ?? ''),
      educationLevel: educationLevels.get(row['O*NET-SOC Code'] ?? '') ?? null,
      jobZone: zones.get(row['O*NET-SOC Code'] ?? '') ?? null,
      dataSourceId,
      externalId: row['O*NET-SOC Code'],
    }))).onConflictDoUpdate({
      target: [occupations.dataSourceId, occupations.externalId],
      set: {
        title: sql`excluded.title`, normalizedTitle: sql`excluded.normalized_title`,
        description: sql`excluded.description`, educationLevel: sql`excluded.education_level`,
        jobZone: sql`excluded.job_zone`, updatedAt: new Date(),
      },
    }));

    const occupationRecords = await db.select({ id: occupations.id, externalId: occupations.externalId })
      .from(occupations).where(eq(occupations.dataSourceId, dataSourceId));
    const occupationIds = new Map(occupationRecords.filter((row) => row.externalId).map((row) => [row.externalId!, row.id]));

    const skillRelations = await insertMeasures(db, dataSourceId, collectMeasures([...essentialRows, ...transferableRows]), 'skill', descriptions, occupationIds);
    const knowledgeRelations = await insertMeasures(db, dataSourceId, collectMeasures(knowledgeRows), 'knowledge', descriptions, occupationIds);
    const abilityRelations = await insertMeasures(db, dataSourceId, collectMeasures(abilityRows), 'ability', descriptions, occupationIds);

    const uniqueInterests = [...new Map(interestRows.map((row) => [row['Element ID'], row])).values()];
    await db.insert(interests).values(uniqueInterests.map((row) => ({
      name: normalizeText(row['Element Name'] ?? ''), normalizedName: normalizeKey(row['Element Name'] ?? ''),
      description: descriptions.get(row['Element ID'] ?? '') || null, dataSourceId, externalId: row['Element ID'],
    }))).onConflictDoNothing();
    const interestRecords = await db.select({ id: interests.id, externalId: interests.externalId }).from(interests)
      .where(eq(interests.dataSourceId, dataSourceId));
    const interestIds = new Map(interestRecords.filter((row) => row.externalId).map((row) => [row.externalId!, row.id]));
    const interestRelations = interestRows.flatMap((row) => {
      const occupationId = occupationIds.get(row['O*NET-SOC Code'] ?? '');
      const interestId = interestIds.get(row['Element ID'] ?? '');
      const score = scaleOneToSeven(numberOrNull(row['Data Value']));
      return occupationId && interestId && score !== null ? [{ occupationId, interestId, score, dataSourceId, originalValues: { OI: numberOrNull(row['Data Value']) } }] : [];
    });
    await inBatches(interestRelations, 500, async (batch) => db.insert(occupationInterests).values(batch).onConflictDoUpdate({
      target: [occupationInterests.occupationId, occupationInterests.interestId],
      set: { score: sql`excluded.score`, dataSourceId, originalValues: sql`excluded.original_values` },
    }));

    const uniqueTechnology = [...new Map(technologyRows.map((row) => [normalizeKey(row['Workplace Example'] ?? ''), row])).values()]
      .filter((row) => normalizeKey(row['Workplace Example'] ?? ''));
    await inBatches(uniqueTechnology, 500, async (batch) => {
      const technologyValues = batch.map((row) => ({
        name: normalizeText(row['Workplace Example'] ?? ''), normalizedName: normalizeKey(row['Workplace Example'] ?? ''),
        category: normalizeText(row['Element Name'] ?? '') || null, dataSourceId,
        externalId: `${row['Element ID']}:${normalizeKey(row['Workplace Example'] ?? '')}`,
      }));
      await db.insert(technologies).values(technologyValues).onConflictDoNothing();
      await db.insert(skills).values(technologyValues.map((row) => ({
        name: row.name, normalizedName: row.normalizedName, category: 'technology',
        description: row.category ? `Software skill: ${row.category}.` : null,
        primaryDataSourceId: dataSourceId, externalId: `technology:${row.externalId}`,
      }))).onConflictDoNothing();
    });
    const technologyRecords = await db.select({ id: technologies.id, normalizedName: technologies.normalizedName }).from(technologies);
    const technologyIds = new Map(technologyRecords.map((row) => [row.normalizedName, row.id]));
    const technologyRelations = technologyRows.flatMap((row) => {
      const occupationId = occupationIds.get(row['O*NET-SOC Code'] ?? '');
      const technologyId = technologyIds.get(normalizeKey(row['Workplace Example'] ?? ''));
      return occupationId && technologyId ? [{
        occupationId, technologyId, dataSourceId,
        importance: row['Hot Technology'] === 'Y' ? 100 : row['In Demand'] === 'Y' ? 75 : 50,
        originalValues: { hotTechnology: row['Hot Technology'] === 'Y', inDemand: row['In Demand'] === 'Y' },
      }] : [];
    });
    await inBatches(technologyRelations, 500, async (batch) => db.insert(occupationTechnologies).values(batch).onConflictDoUpdate({
      target: [occupationTechnologies.occupationId, occupationTechnologies.technologyId],
      set: { importance: sql`excluded.importance`, dataSourceId, originalValues: sql`excluded.original_values` },
    }));

    const softwareSkills = await db.select({ id: skills.id, normalizedName: skills.normalizedName }).from(skills)
      .where(and(eq(skills.primaryDataSourceId, dataSourceId), eq(skills.category, 'technology')));
    const softwareSkillIds = new Map(softwareSkills.map((row) => [row.normalizedName, row.id]));
    const technologySkillRelations = technologyRows.flatMap((row) => {
      const occupationId = occupationIds.get(row['O*NET-SOC Code'] ?? '');
      const skillId = softwareSkillIds.get(normalizeKey(row['Workplace Example'] ?? ''));
      return occupationId && skillId ? [{
        occupationId, skillId, dataSourceId, level: null,
        importance: row['Hot Technology'] === 'Y' ? 100 : row['In Demand'] === 'Y' ? 75 : 50,
        requirementType: row['Hot Technology'] === 'Y' ? 'required' as const : 'preferred' as const,
        originalValues: { sourceTable: 'Software Skills' },
      }] : [];
    });
    await inBatches(technologySkillRelations, 500, async (batch) => db.insert(occupationSkills).values(batch).onConflictDoUpdate({
      target: [occupationSkills.occupationId, occupationSkills.skillId, occupationSkills.dataSourceId],
      set: { importance: sql`excluded.importance`, requirementType: sql`excluded.requirement_type`, originalValues: sql`excluded.original_values` },
    }));

    return {
      occupations: occupationIds.size,
      skills: (await db.select({ value: sql<number>`count(*)::int` }).from(skills).where(eq(skills.primaryDataSourceId, dataSourceId)))[0]?.value ?? 0,
      occupationSkillRelationships: skillRelations + technologySkillRelations.length,
      interests: interestIds.size,
      occupationInterestRelationships: interestRelations.length,
      knowledgeAreas: new Set(knowledgeRows.map((row) => row['Element ID'])).size,
      occupationKnowledgeRelationships: knowledgeRelations,
      abilities: new Set(abilityRows.map((row) => row['Element ID'])).size,
      occupationAbilityRelationships: abilityRelations,
      technologies: uniqueTechnology.length,
      occupationTechnologyRelationships: technologyRelations.length,
    };
  });
}
