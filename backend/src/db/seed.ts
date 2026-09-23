import { readFile } from 'node:fs/promises';
import { eq, sql } from 'drizzle-orm';
import { inBatches, normalizeKey, registerDataSource } from '../data-import/common.js';
import { ONET_SOURCE } from '../data-import/onet.js';
import type { Database } from './client.js';
import {
  abilities,
  interests,
  jobSkills,
  jobs,
  knowledgeAreas,
  occupationAbilities,
  occupationInterests,
  occupationKnowledge,
  occupations,
  occupationSkills,
  occupationTechnologies,
  profiles,
  skills,
  technologies,
  userInterests,
  users,
  userSkills,
} from './schema.js';

type Relation = { occupationCode: string; importance: number | null; level: number | null };
type SeedFile = {
  occupations: { code: string; title: string; description: string; careerCluster: string; educationLevel: string | null; jobZone: number | null }[];
  skills: { externalId: string; name: string; description: string | null; category: string }[];
  occupationSkills: (Relation & { skillExternalId: string; requirementType: 'required' | 'preferred' })[];
  interests: { externalId: string; name: string; description: string | null }[];
  occupationInterests: { occupationCode: string; interestExternalId: string; score: number }[];
  knowledgeAreas: { externalId: string; name: string; description: string | null }[];
  occupationKnowledge: (Relation & { knowledgeExternalId: string })[];
  abilities: { externalId: string; name: string; description: string | null }[];
  occupationAbilities: (Relation & { abilityExternalId: string })[];
  technologies: { externalId: string; name: string; category: string }[];
  occupationTechnologies: { occupationCode: string; technologyExternalId: string; importance: number }[];
  jobs: {
    externalId: string; occupationCode: string; title: string; companyName: string; description: string;
    location: string; workMode: 'onsite' | 'hybrid' | 'remote'; employmentType: 'full_time' | 'contract';
    experienceLevel: 'entry' | 'junior' | 'mid' | 'senior'; minimumYearsExperience: number;
    skills: { skillExternalId: string; requirementType: 'required' | 'preferred'; importance: number }[];
  }[];
  demoProfiles: {
    id: string; email: string; fullName: string; headline: string; educationLevel: string;
    skillExternalIds: string[]; interestExternalIds: string[];
  }[];
};

function required<T>(value: T | undefined, message: string): T {
  if (value === undefined) throw new Error(message);
  return value;
}

export async function seedDatabase(db: Database, filePath: string): Promise<Record<string, number>> {
  const seed = JSON.parse(await readFile(filePath, 'utf8')) as SeedFile;
  if (seed.occupations.length < 20 || seed.skills.length < 100 || seed.jobs.length < 20 || seed.demoProfiles.length < 5) {
    throw new Error('Seed file does not meet the documented minimum record counts.');
  }
  const dataSourceId = await registerDataSource(db, ONET_SOURCE);

  await inBatches(seed.occupations, 500, async (batch) => db.insert(occupations).values(batch.map((row) => ({
    title: row.title, normalizedTitle: normalizeKey(row.title), description: row.description,
    careerCluster: row.careerCluster, educationLevel: row.educationLevel, jobZone: row.jobZone,
    dataSourceId, externalId: row.code,
  }))).onConflictDoUpdate({
    target: [occupations.dataSourceId, occupations.externalId],
    set: { title: sql`excluded.title`, normalizedTitle: sql`excluded.normalized_title`, description: sql`excluded.description`, careerCluster: sql`excluded.career_cluster`, educationLevel: sql`excluded.education_level`, jobZone: sql`excluded.job_zone`, updatedAt: new Date() },
  }));
  await inBatches(seed.skills, 500, async (batch) => db.insert(skills).values(batch.map((row) => ({
    ...row, normalizedName: normalizeKey(row.name), primaryDataSourceId: dataSourceId,
  }))).onConflictDoUpdate({ target: skills.normalizedName, set: { updatedAt: new Date() } }));

  await inBatches(seed.interests, 500, async (batch) => db.insert(interests).values(batch.map((row) => ({
    ...row, normalizedName: normalizeKey(row.name), dataSourceId,
  }))).onConflictDoNothing());
  await inBatches(seed.knowledgeAreas, 500, async (batch) => db.insert(knowledgeAreas).values(batch.map((row) => ({
    ...row, normalizedName: normalizeKey(row.name), dataSourceId,
  }))).onConflictDoNothing());
  await inBatches(seed.abilities, 500, async (batch) => db.insert(abilities).values(batch.map((row) => ({
    ...row, normalizedName: normalizeKey(row.name), dataSourceId,
  }))).onConflictDoNothing());
  await inBatches(seed.technologies, 500, async (batch) => db.insert(technologies).values(batch.map((row) => ({
    ...row, normalizedName: normalizeKey(row.name), dataSourceId,
  }))).onConflictDoNothing());

  const [occupationRows, skillRows, interestRows, knowledgeRows, abilityRows, technologyRows] = await Promise.all([
    db.select({ id: occupations.id, externalId: occupations.externalId }).from(occupations).where(eq(occupations.dataSourceId, dataSourceId)),
    db.select({ id: skills.id, externalId: skills.externalId }).from(skills),
    db.select({ id: interests.id, externalId: interests.externalId }).from(interests).where(eq(interests.dataSourceId, dataSourceId)),
    db.select({ id: knowledgeAreas.id, externalId: knowledgeAreas.externalId }).from(knowledgeAreas).where(eq(knowledgeAreas.dataSourceId, dataSourceId)),
    db.select({ id: abilities.id, externalId: abilities.externalId }).from(abilities).where(eq(abilities.dataSourceId, dataSourceId)),
    db.select({ id: technologies.id, externalId: technologies.externalId }).from(technologies).where(eq(technologies.dataSourceId, dataSourceId)),
  ]);
  const occupationIds = new Map(occupationRows.map((row) => [row.externalId!, row.id]));
  const skillIds = new Map(skillRows.filter((row) => row.externalId).map((row) => [row.externalId!, row.id]));
  const interestIds = new Map(interestRows.map((row) => [row.externalId!, row.id]));
  const knowledgeIds = new Map(knowledgeRows.map((row) => [row.externalId!, row.id]));
  const abilityIds = new Map(abilityRows.map((row) => [row.externalId!, row.id]));
  const technologyIds = new Map(technologyRows.map((row) => [row.externalId!, row.id]));

  await inBatches(seed.occupationSkills, 500, async (batch) => db.insert(occupationSkills).values(batch.map((row) => ({
    occupationId: required(occupationIds.get(row.occupationCode), `Unknown occupation ${row.occupationCode}`),
    skillId: required(skillIds.get(row.skillExternalId), `Unknown skill ${row.skillExternalId}`),
    importance: row.importance, level: row.level, requirementType: row.requirementType, dataSourceId,
    originalValues: { seed: true },
  }))).onConflictDoUpdate({
    target: [occupationSkills.occupationId, occupationSkills.skillId, occupationSkills.dataSourceId],
    set: { importance: sql`excluded.importance`, level: sql`excluded.level`, requirementType: sql`excluded.requirement_type` },
  }));
  await inBatches(seed.occupationInterests, 500, async (batch) => db.insert(occupationInterests).values(batch.map((row) => ({
    occupationId: required(occupationIds.get(row.occupationCode), `Unknown occupation ${row.occupationCode}`),
    interestId: required(interestIds.get(row.interestExternalId), `Unknown interest ${row.interestExternalId}`),
    score: row.score, dataSourceId, originalValues: { seed: true },
  }))).onConflictDoUpdate({ target: [occupationInterests.occupationId, occupationInterests.interestId], set: { score: sql`excluded.score`, dataSourceId } }));
  await inBatches(seed.occupationKnowledge, 500, async (batch) => db.insert(occupationKnowledge).values(batch.map((row) => ({
    occupationId: required(occupationIds.get(row.occupationCode), `Unknown occupation ${row.occupationCode}`),
    knowledgeAreaId: required(knowledgeIds.get(row.knowledgeExternalId), `Unknown knowledge area ${row.knowledgeExternalId}`),
    importance: row.importance, level: row.level, dataSourceId, originalValues: { seed: true },
  }))).onConflictDoUpdate({ target: [occupationKnowledge.occupationId, occupationKnowledge.knowledgeAreaId], set: { importance: sql`excluded.importance`, level: sql`excluded.level`, dataSourceId } }));
  await inBatches(seed.occupationAbilities, 500, async (batch) => db.insert(occupationAbilities).values(batch.map((row) => ({
    occupationId: required(occupationIds.get(row.occupationCode), `Unknown occupation ${row.occupationCode}`),
    abilityId: required(abilityIds.get(row.abilityExternalId), `Unknown ability ${row.abilityExternalId}`),
    importance: row.importance, level: row.level, dataSourceId, originalValues: { seed: true },
  }))).onConflictDoUpdate({ target: [occupationAbilities.occupationId, occupationAbilities.abilityId], set: { importance: sql`excluded.importance`, level: sql`excluded.level`, dataSourceId } }));
  await inBatches(seed.occupationTechnologies, 500, async (batch) => db.insert(occupationTechnologies).values(batch.map((row) => ({
    occupationId: required(occupationIds.get(row.occupationCode), `Unknown occupation ${row.occupationCode}`),
    technologyId: required(technologyIds.get(row.technologyExternalId), `Unknown technology ${row.technologyExternalId}`),
    importance: row.importance, dataSourceId, originalValues: { seed: true },
  }))).onConflictDoUpdate({ target: [occupationTechnologies.occupationId, occupationTechnologies.technologyId], set: { importance: sql`excluded.importance`, dataSourceId } }));

  for (const job of seed.jobs) {
    const [savedJob] = await db.insert(jobs).values({
      externalId: job.externalId, source: 'careermate-seed', occupationId: occupationIds.get(job.occupationCode),
      title: job.title, companyName: job.companyName, description: job.description, location: job.location,
      workMode: job.workMode, employmentType: job.employmentType, experienceLevel: job.experienceLevel,
      minimumYearsExperience: job.minimumYearsExperience, isSynthetic: true,
      publishedAt: new Date('2026-01-15T00:00:00.000Z'), expiresAt: null,
    }).onConflictDoUpdate({
      target: [jobs.source, jobs.externalId],
      set: { occupationId: sql`excluded.occupation_id`, title: sql`excluded.title`, description: sql`excluded.description`, updatedAt: new Date() },
    }).returning({ id: jobs.id });
    if (!savedJob) throw new Error(`Could not seed job ${job.externalId}.`);
    await db.insert(jobSkills).values(job.skills.map((item) => ({
      jobId: savedJob.id,
      skillId: required(skillIds.get(item.skillExternalId), `Unknown job skill ${item.skillExternalId}`),
      requirementType: item.requirementType,
      importance: item.importance,
    }))).onConflictDoUpdate({ target: [jobSkills.jobId, jobSkills.skillId], set: { requirementType: sql`excluded.requirement_type`, importance: sql`excluded.importance` } });
  }

  for (const demo of seed.demoProfiles) {
    await db.insert(users).values({ id: demo.id, email: demo.email, authProvider: 'development', authSubject: demo.id })
      .onConflictDoUpdate({ target: users.id, set: { email: demo.email, updatedAt: new Date() } });
    await db.insert(profiles).values({ userId: demo.id, fullName: demo.fullName, headline: demo.headline, educationLevel: demo.educationLevel })
      .onConflictDoUpdate({ target: profiles.userId, set: { fullName: demo.fullName, headline: demo.headline, educationLevel: demo.educationLevel, updatedAt: new Date() } });
    await db.insert(userSkills).values(demo.skillExternalIds.map((externalId, index) => ({
      userId: demo.id, skillId: required(skillIds.get(externalId), `Unknown demo skill ${externalId}`),
      proficiencyLevel: index < 2 ? 'advanced' as const : 'intermediate' as const,
      yearsExperience: Math.max(0.5, 3 - index * 0.5), source: 'self_assessed' as const,
    }))).onConflictDoUpdate({ target: [userSkills.userId, userSkills.skillId], set: { proficiencyLevel: sql`excluded.proficiency_level`, yearsExperience: sql`excluded.years_experience` } });
    await db.insert(userInterests).values(demo.interestExternalIds.map((externalId, index) => ({
      userId: demo.id, interestId: required(interestIds.get(externalId), `Unknown demo interest ${externalId}`), interestLevel: 5 - index,
    }))).onConflictDoUpdate({ target: [userInterests.userId, userInterests.interestId], set: { interestLevel: sql`excluded.interest_level`, updatedAt: new Date() } });
  }

  return {
    occupations: seed.occupations.length,
    skills: seed.skills.length,
    occupationSkillRelationships: seed.occupationSkills.length,
    interests: seed.interests.length,
    technologies: seed.technologies.length,
    jobs: seed.jobs.length,
    demoUsers: seed.demoProfiles.length,
  };
}
