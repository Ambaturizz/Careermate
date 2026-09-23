import assert from 'node:assert/strict';
import test from 'node:test';
import type { AiProvider, StructuredGenerationRequest } from '../src/ai/ai-provider.js';
import type { VerifiedIdentity } from '../src/auth/auth-verifier.js';
import type { AuthService } from '../src/auth/auth-service.js';
import { buildApp } from '../src/app.js';
import { AppError } from '../src/lib/errors.js';
import type { CareerRepository } from '../src/repositories/career-repository.js';

class FixtureAiProvider implements AiProvider {
  async generateJson<T>(request: StructuredGenerationRequest<T>): Promise<T> {
    const fixtures: Record<string, unknown> = {
      'career.recommendations.v1': {
        recommendations: [{
          role: 'Frontend Engineer',
          matchScore: 88,
          rationale: 'Strong alignment with the supplied React skills.',
          transferableSkills: ['React'],
          skillGaps: [{ skill: 'Testing', priority: 'medium', learningSuggestion: 'Build a tested portfolio project.' }],
          nextSteps: ['Complete a testing course.'],
        }],
        summary: 'A realistic next role based on the supplied profile.',
      },
      'jobs.match.v1': {
        matches: [{
          jobId: 'job-1',
          matchScore: 82,
          matchedSkills: ['TypeScript'],
          missingSkills: ['Testing'],
          rationale: 'The supplied profile matches the core requirement.',
          recommendation: 'strong_match',
        }],
      },
      'interviews.plan.v1': {
        learningObjectives: ['Communicate impact clearly.'],
        studyPlan: [{ topic: 'STAR', objective: 'Structure evidence.', activities: ['Draft one STAR story.'] }],
        questions: [1, 2, 3].map((index) => ({
          id: `model-question-${index}`,
          type: 'behavioral',
          question: `Question ${index}`,
          answerOutline: ['Situation', 'Action', 'Result'],
          evaluationCriteria: ['Specific evidence'],
        })),
      },
      'interviews.feedback.v1': {
        score: 84,
        strengths: ['Specific example'],
        improvements: ['Quantify the result'],
        improvedAnswerOutline: ['Situation', 'Task', 'Action', 'Result'],
        nextExercise: 'Add one metric.',
      },
      'documents.review.v1': {
        score: 80,
        strengths: ['Clear structure'],
        issues: [],
        atsKeywords: { present: ['TypeScript'], missing: ['Testing'] },
        learningNotes: ['Use measurable outcomes.'],
      },
      'documents.generate.v1': {
        title: 'Frontend Engineer CV',
        content: 'Candidate profile content.',
        sections: [{ heading: 'Summary', content: 'Candidate profile content.' }],
        checklist: ['Verify every fact.'],
      },
    };
    return request.outputSchema.parse(fixtures[request.operation]);
  }
}

const sessionId = '20000000-0000-4000-8000-000000000001';
const questionIds = [
  '30000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000003',
];
const authenticatedRepository = {
  ensureUser: async (identity: VerifiedIdentity) => ({ id: identity.subject, email: identity.email }),
  createInterviewSession: async () => ({ sessionId, questionIds }),
  saveInterviewAnswer: async () => true,
} as unknown as CareerRepository;

const fixtureAuthService: AuthService = {
  registrationEnabled: true,
  register: async (input) => ({
    status: 'verification_required',
    user: { id: 'auth-user-1', email: input.email, provider: 'supabase' },
    accessToken: null,
    refreshToken: null,
    expiresIn: null,
  }),
  login: async (input) => ({
    status: 'authenticated',
    user: { id: 'auth-user-1', email: input.email, provider: 'supabase' },
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 3600,
  }),
  refresh: async () => ({
    status: 'authenticated',
    user: { id: 'auth-user-1', email: 'user@example.com', provider: 'supabase' },
    accessToken: 'refreshed-access-token',
    refreshToken: 'rotated-refresh-token',
    expiresIn: 3600,
  }),
};

test('GET /health reports service status', async () => {
  const app = await buildApp({ databaseClient: null, logger: false });
  const response = await app.inject({ method: 'GET', url: '/health' });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().status, 'ok');
  await app.close();
});

test('development login accepts the hardcoded demo account', async () => {
  const app = await buildApp({ databaseClient: null, logger: false });
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    payload: { email: 'careermate@gmail.com', password: '12345' },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().status, 'authenticated');
  assert.equal(response.json().user.email, 'careermate@gmail.com');
  assert.equal(response.json().user.provider, 'development');
  assert.equal(response.json().accessToken, 'development-session');
  await app.close();
});

test('auth routes expose configuration and keep login behind the backend contract', async () => {
  const app = await buildApp({ databaseClient: null, authService: fixtureAuthService, logger: false });

  const configResponse = await app.inject({ method: 'GET', url: '/api/v1/auth/config' });
  assert.equal(configResponse.statusCode, 200);
  assert.equal(configResponse.json().registrationEnabled, true);

  const loginResponse = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    payload: { email: 'USER@EXAMPLE.COM', password: 'password-secure' },
  });
  assert.equal(loginResponse.statusCode, 200);
  assert.equal(loginResponse.headers['cache-control'], 'no-store');
  assert.equal(loginResponse.json().status, 'authenticated');
  assert.equal(loginResponse.json().user.email, 'user@example.com');

  const refreshResponse = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/refresh',
    payload: { refreshToken: 'refresh-token' },
  });
  assert.equal(refreshResponse.statusCode, 200);
  assert.equal(refreshResponse.headers['cache-control'], 'no-store');
  assert.equal(refreshResponse.json().accessToken, 'refreshed-access-token');
  assert.equal(loginResponse.json().accessToken, 'access-token');

  await app.close();
});

test('registration validates account fields before calling the auth provider', async () => {
  let calls = 0;
  const app = await buildApp({
    databaseClient: null,
    authService: {
      ...fixtureAuthService,
      register: async (input) => {
        calls += 1;
        return fixtureAuthService.register(input);
      },
    },
    logger: false,
  });
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/register',
    payload: { fullName: 'A', email: 'not-an-email', password: 'short' },
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.code, 'VALIDATION_ERROR');
  assert.equal(calls, 0);
  await app.close();
});

test('registration provisions the CareerMate user and initial profile', async () => {
  const calls: string[] = [];
  const repository = {
    ensureUser: async (identity: VerifiedIdentity) => {
      calls.push(`user:${identity.provider}:${identity.email}`);
      return { id: '00000000-0000-4000-8000-000000000090', email: identity.email };
    },
    getProfile: async () => null,
    upsertProfile: async (_userId: string, input: { fullName: string }) => {
      calls.push(`profile:${input.fullName}`);
      return input;
    },
  } as unknown as CareerRepository;
  const app = await buildApp({
    databaseClient: null,
    repository,
    authService: {
      ...fixtureAuthService,
      register: async (input) => ({
        ...(await fixtureAuthService.register(input)),
        status: 'authenticated' as const,
        accessToken: 'access-token',
      }),
    },
    logger: false,
  });
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/register',
    payload: { fullName: 'Nadia Putri', email: 'nadia@example.com', password: 'password-secure' },
  });

  assert.equal(response.statusCode, 201);
  assert.deepEqual(calls, ['user:supabase:nadia@example.com', 'profile:Nadia Putri']);
  await app.close();
});

test('AI routes reject invalid input and missing consent before calling a provider', async () => {
  const app = await buildApp({ aiProvider: new FixtureAiProvider(), databaseClient: null, repository: authenticatedRepository, logger: false });
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/career/recommendations',
    payload: { profile: { experienceYears: -1 } },
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.code, 'VALIDATION_ERROR');
  await app.close();
});

test('AI routes validate provider output against shared contracts', async () => {
  const app = await buildApp({ aiProvider: new FixtureAiProvider(), databaseClient: null, repository: authenticatedRepository, logger: false });
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/career/recommendations',
    payload: {
      consentToAiProcessing: true,
      profile: {
        experienceYears: 2,
        skills: [{ name: 'React', level: 4 }],
        interests: ['Web development'],
      },
      limit: 3,
      language: 'id',
    },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().recommendations[0].role, 'Frontend Engineer');
  await app.close();
});

test('AI routes require authentication before invoking the provider', async () => {
  const app = await buildApp({
    aiProvider: new FixtureAiProvider(),
    databaseClient: null,
    repository: authenticatedRepository,
    authVerifier: {
      verify: async () => { throw new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication required.'); },
    },
    logger: false,
  });
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/career/recommendations',
    payload: {
      consentToAiProcessing: true,
      profile: { experienceYears: 2, skills: [] },
      language: 'id',
    },
  });
  assert.equal(response.statusCode, 401);
  assert.equal(response.json().error.code, 'AUTHENTICATION_REQUIRED');
  await app.close();
});

test('every AI route validates and returns its feature-specific contract', async () => {
  const app = await buildApp({ aiProvider: new FixtureAiProvider(), databaseClient: null, repository: authenticatedRepository, logger: false });
  const requests = [
    {
      url: '/api/v1/jobs/match',
      payload: {
        consentToAiProcessing: true,
        profile: { experienceYears: 1, skills: [{ name: 'TypeScript', level: 3 }] },
        jobs: [{ id: 'job-1', title: 'Frontend Engineer', company: 'Acme', description: 'Build web applications.' }],
        language: 'id',
      },
      assertion: (body: Record<string, any>) => assert.equal(body.matches[0].jobId, 'job-1'),
    },
    {
      url: '/api/v1/interviews/plan',
      payload: { consentToAiProcessing: true, targetRole: 'Frontend Engineer', seniority: 'junior', questionCount: 3, language: 'id' },
      assertion: (body: Record<string, any>) => {
        assert.equal(body.sessionId, sessionId);
        assert.equal(body.questions[0].id, questionIds[0]);
      },
    },
    {
      url: '/api/v1/interviews/feedback',
      payload: {
        consentToAiProcessing: true,
        sessionId,
        questionId: questionIds[0],
        targetRole: 'Frontend Engineer',
        targetCompany: 'Acme',
        seniority: 'junior',
        question: 'Tell me about a difficult project.',
        evaluationCriteria: ['Specific evidence'],
        answer: 'I improved page performance by 30 percent.',
        language: 'id',
      },
      assertion: (body: Record<string, any>) => assert.equal(body.score, 84),
    },
    {
      url: '/api/v1/documents/review',
      payload: { consentToAiProcessing: true, documentType: 'cv', content: 'TypeScript developer with project experience.', language: 'id' },
      assertion: (body: Record<string, any>) => assert.equal(body.score, 80),
    },
    {
      url: '/api/v1/documents/generate',
      payload: { consentToAiProcessing: true, documentType: 'cv', profile: { experienceYears: 1 }, targetRole: 'Frontend Engineer', language: 'id' },
      assertion: (body: Record<string, any>) => assert.equal(body.title, 'Frontend Engineer CV'),
    },
  ];

  for (const item of requests) {
    const response = await app.inject({ method: 'POST', url: item.url, payload: item.payload });
    assert.equal(response.statusCode, 200, `${item.url}: ${response.body}`);
    item.assertion(response.json());
  }

  await app.close();
});

test('database routes fail explicitly when DATABASE_URL is absent', async () => {
  const app = await buildApp({ databaseClient: null, logger: false });
  const response = await app.inject({ method: 'GET', url: '/api/v1/skills' });
  assert.equal(response.statusCode, 503);
  assert.equal(response.json().error.code, 'DATABASE_NOT_CONFIGURED');
  await app.close();
});

test('user-owned routes always scope repository access to the authenticated user', async () => {
  const calls: string[] = [];
  const repository = {
    ensureUser: async (identity) => ({ id: identity.subject, email: identity.email }),
    deleteUserSkill: async (userId, skillId) => {
      calls.push(`${userId}:${skillId}`);
      return false;
    },
  } as CareerRepository;
  const app = await buildApp({ databaseClient: null, repository, logger: false });
  const otherUserId = '00000000-0000-4000-8000-000000000002';
  const skillRecordId = '10000000-0000-4000-8000-000000000001';
  const response = await app.inject({
    method: 'DELETE',
    url: `/api/v1/profile/skills/${skillRecordId}`,
    headers: { 'x-careermate-user-id': otherUserId },
  });
  assert.equal(response.statusCode, 404);
  assert.deepEqual(calls, [`${otherUserId}:${skillRecordId}`]);
  await app.close();
});
