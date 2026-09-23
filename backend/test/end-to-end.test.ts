import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import test from 'node:test';
import {
  deterministicCareerResponseSchema,
  deterministicJobMatchSchema,
  paginatedJobsSchema,
  paginatedReferenceSkillsSchema,
  profileSchema,
} from '@careermate/contracts';
import { buildApp } from '../src/app.js';
import { seedDatabase } from '../src/db/seed.js';
import { PostgresCareerRepository } from '../src/repositories/postgres-career-repository.js';
import { createTestDatabase } from './helpers/database.js';

test('seeded dataset is exposed through authenticated HTTP routes', { timeout: 120_000 }, async () => {
  const { client, db } = await createTestDatabase();
  const app = await buildApp({
    databaseClient: null,
    repository: new PostgresCareerRepository(db),
    logger: false,
  });

  try {
    await seedDatabase(db, resolve(process.cwd(), 'data/seed/career-reference.seed.json'));
    const headers = { 'x-careermate-user-id': '00000000-0000-4000-8000-000000000001' };

    const skillsResponse = await app.inject({ method: 'GET', url: '/api/v1/skills?limit=5' });
    const jobsResponse = await app.inject({ method: 'GET', url: '/api/v1/jobs?limit=5' });
    const profileResponse = await app.inject({ method: 'GET', url: '/api/v1/profile', headers });
    const recommendationsResponse = await app.inject({ method: 'GET', url: '/api/v1/career/recommendations?limit=5', headers });

    assert.equal(skillsResponse.statusCode, 200);
    assert.equal(jobsResponse.statusCode, 200);
    assert.equal(profileResponse.statusCode, 200);
    assert.equal(recommendationsResponse.statusCode, 200);

    const skills = paginatedReferenceSkillsSchema.parse(skillsResponse.json());
    const jobs = paginatedJobsSchema.parse(jobsResponse.json());
    profileSchema.parse(profileResponse.json());
    const recommendations = deterministicCareerResponseSchema.parse(recommendationsResponse.json());

    assert.equal(skills.total, 168);
    assert.equal(jobs.total, 30);
    assert.equal(recommendations.recommendations.length, 5);

    const matchResponse = await app.inject({ method: 'POST', url: `/api/v1/jobs/${jobs.items[0]!.id}/match`, headers });
    assert.equal(matchResponse.statusCode, 200);
    deterministicJobMatchSchema.parse(matchResponse.json());
  } finally {
    await app.close();
    await client.close();
  }
});
