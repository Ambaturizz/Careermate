import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { importKbji } from '../src/data-import/kbji.js';
import { seedDatabase } from '../src/db/seed.js';
import { PostgresCareerRepository } from '../src/repositories/postgres-career-repository.js';
import { createTestDatabase } from './helpers/database.js';

test('migration, constraints, relationships, seed, and import idempotency', { timeout: 120_000 }, async () => {
  const { client, db } = await createTestDatabase();
  try {
    const seedPath = resolve(process.cwd(), 'data/seed/career-reference.seed.json');
    const first = await seedDatabase(db, seedPath);
    const second = await seedDatabase(db, seedPath);
    assert.deepEqual(second, first);
    assert.equal(first.occupations, 30);
    assert.equal(first.skills, 168);
    assert.equal(first.jobs, 30);
    assert.equal(first.demoUsers, 5);

    const counts = await client.query<{ occupations: number; skills: number; jobs: number; users: number }>(`
      select
        (select count(*)::int from career.occupations) occupations,
        (select count(*)::int from career.skills) skills,
        (select count(*)::int from career.jobs) jobs,
        (select count(*)::int from app.users) users
    `);
    assert.deepEqual(counts.rows[0], { occupations: 30, skills: 168, jobs: 30, users: 5 });

    await assert.rejects(
      client.query("insert into career.skills (name, normalized_name) values ('Duplicate SQL', 'reading comprehension')"),
      /duplicate key|unique constraint/i,
    );

    const occupationRelations = await client.query<{ count: number }>(`
      select count(*)::int count
      from career.occupation_skills os
      join career.occupations o on o.id = os.occupation_id
      join career.skills s on s.id = os.skill_id
      where o.external_id = '15-1252.00'
    `);
    assert.ok((occupationRelations.rows[0]?.count ?? 0) > 0);

    const profileSkills = await client.query<{ count: number }>(`
      select count(*)::int count
      from app.user_skills us
      join app.users u on u.id = us.user_id
      join career.skills s on s.id = us.skill_id
      where u.email = 'alya.pratama@example.test'
    `);
    assert.ok((profileSkills.rows[0]?.count ?? 0) > 0);

    const repository = new PostgresCareerRepository(db);
    const interviewInput = {
      consentToAiProcessing: true as const,
      targetRole: 'Frontend Engineer',
      seniority: 'junior' as const,
      focusAreas: ['STAR'],
      questionCount: 3,
      language: 'id' as const,
    };
    const interviewPlan = {
      learningObjectives: ['Explain impact.'],
      studyPlan: [{ topic: 'STAR', objective: 'Structure answers.', activities: ['Draft a story.'] }],
      questions: [1, 2, 3].map((index) => ({
        id: `model-${index}`,
        type: 'behavioral' as const,
        question: `Question ${index}`,
        answerOutline: ['Situation', 'Action', 'Result'],
        evaluationCriteria: ['Evidence'],
      })),
    };
    const persistedInterview = await repository.createInterviewSession(
      '00000000-0000-4000-8000-000000000001',
      interviewInput,
      interviewPlan,
    );
    assert.equal(persistedInterview.questionIds.length, 3);
    assert.equal(await repository.saveInterviewAnswer(
      '00000000-0000-4000-8000-000000000001',
      {
        consentToAiProcessing: true,
        sessionId: persistedInterview.sessionId,
        questionId: persistedInterview.questionIds[0],
        targetRole: 'Frontend Engineer',
        question: 'Question 1',
        answer: 'I improved performance by 30 percent.',
        language: 'id',
      },
      { score: 85, strengths: ['Evidence'], improvements: [], improvedAnswerOutline: ['Result'], nextExercise: 'Add context.' },
    ), true);
    const interviewCounts = await client.query<{ sessions: number; questions: number; answers: number }>(`
      select
        (select count(*)::int from app.interview_sessions) sessions,
        (select count(*)::int from app.interview_questions) questions,
        (select count(*)::int from app.interview_answers) answers
    `);
    assert.deepEqual(interviewCounts.rows[0], { sessions: 1, questions: 3, answers: 1 });

    const fixtureDirectory = await mkdtemp(join(tmpdir(), 'careermate-kbji-'));
    const kbjiPath = join(fixtureDirectory, 'kbji.csv');
    await writeFile(kbjiPath, 'code,title,description\n9999,Occupation Fixture,Only used by an automated test.\n', 'utf8');
    await importKbji(db, kbjiPath);
    await importKbji(db, kbjiPath);
    const kbji = await client.query<{ occupations: number; mappings: number }>(`
      select
        (select count(*)::int from career.occupations where external_id = '9999') occupations,
        (select count(*)::int from career.external_mappings where external_id = '9999') mappings
    `);
    assert.deepEqual(kbji.rows[0], { occupations: 1, mappings: 1 });
  } finally {
    await client.close();
  }
});
