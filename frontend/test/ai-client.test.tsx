import assert from 'node:assert/strict';
import test from 'node:test';
import { CareerMateApiClient } from '../src/lib/api-client.js';
import { buildCandidateProfile } from '../src/lib/candidate-profile.js';

test('frontend client calls and validates all six AI endpoints', async () => {
  const originalFetch = globalThis.fetch;
  const requests: Request[] = [];
  const fixtures: Record<string, unknown> = {
    '/api/v1/career/recommendations': {
      recommendations: [{ role: 'Engineer', matchScore: 80, rationale: 'Fit', transferableSkills: [], skillGaps: [], nextSteps: ['Practice'] }],
      summary: 'Summary',
    },
    '/api/v1/jobs/match': {
      matches: [{ jobId: 'job-1', matchScore: 75, matchedSkills: [], missingSkills: [], rationale: 'Fit', recommendation: 'potential_match' }],
    },
    '/api/v1/interviews/plan': {
      sessionId: '20000000-0000-4000-8000-000000000001',
      learningObjectives: ['STAR'],
      studyPlan: [{ topic: 'STAR', objective: 'Structure', activities: ['Practice'] }],
      questions: [1, 2, 3].map((index) => ({ id: `30000000-0000-4000-8000-00000000000${index}`, type: 'behavioral', question: `Q${index}`, answerOutline: ['S', 'A', 'R'], evaluationCriteria: ['Evidence'] })),
    },
    '/api/v1/interviews/feedback': { score: 80, strengths: [], improvements: [], improvedAnswerOutline: ['STAR'], nextExercise: 'Practice' },
    '/api/v1/documents/review': { score: 80, strengths: [], issues: [], atsKeywords: { present: [], missing: [] }, learningNotes: [] },
    '/api/v1/documents/generate': { title: 'CV', content: 'Generated content', sections: [{ heading: 'Summary', content: 'Generated content' }], checklist: ['Verify'] },
  };

  globalThis.fetch = async (input, init) => {
    const request = new Request(input, init);
    requests.push(request.clone());
    const path = new URL(request.url).pathname;
    return new Response(JSON.stringify(fixtures[path]), { status: 200, headers: { 'content-type': 'application/json' } });
  };

  try {
    const client = new CareerMateApiClient('http://backend.test/api/v1', () => ({ authorization: 'Bearer token' }));
    const profile = { experienceYears: 1, skills: [], education: [], interests: [], goals: [], preferredLocations: [], preferredWorkModes: [], languages: [] };
    await client.careerRecommendations({ consentToAiProcessing: true, profile, targetRoles: [], limit: 1, language: 'id' });
    await client.matchJobs({ consentToAiProcessing: true, profile, jobs: [{ id: 'job-1', title: 'Engineer', company: 'Acme', description: 'Build software', requiredSkills: [] }], maxResults: 1, language: 'id' });
    const plan = await client.createInterviewPlan({ consentToAiProcessing: true, targetRole: 'Engineer', seniority: 'junior', focusAreas: [], questionCount: 3, language: 'id' });
    await client.reviewInterviewAnswer({ consentToAiProcessing: true, sessionId: plan.sessionId, questionId: plan.questions[0].id, targetRole: 'Engineer', question: plan.questions[0].question, evaluationCriteria: plan.questions[0].evaluationCriteria, answer: 'A sufficiently detailed answer.', language: 'id' });
    await client.reviewDocument({ consentToAiProcessing: true, documentType: 'cv', content: 'A sufficiently long CV document.', language: 'id' });
    await client.generateDocument({ consentToAiProcessing: true, documentType: 'cv', profile, targetRole: 'Engineer', tone: 'professional', language: 'id' });

    assert.equal(requests.length, 6);
    assert.ok(requests.every((request) => request.method === 'POST'));
    assert.ok(requests.every((request) => request.headers.get('authorization') === 'Bearer token'));
    for (const request of requests) {
      const body = await request.json() as { consentToAiProcessing?: boolean };
      assert.equal(body.consentToAiProcessing, true);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('candidate profile sent to AI is derived from structured backend data', () => {
  const profile = buildCandidateProfile({
    profile: {
      id: '10000000-0000-4000-8000-000000000001',
      userId: '10000000-0000-4000-8000-000000000002',
      fullName: 'Alya',
      headline: 'Frontend Engineer',
      location: 'Jakarta',
      preferredWorkMode: 'hybrid',
    },
    skills: [{ name: 'TypeScript', proficiencyLevel: 'advanced', yearsExperience: 2 }],
    interests: [{ interestId: '10000000-0000-4000-8000-000000000003', name: 'Technology', interestLevel: 5 }],
    education: [{ id: '10000000-0000-4000-8000-000000000004', institution: 'University', degree: 'S1', fieldOfStudy: 'Informatics' }],
    experience: [{ id: '10000000-0000-4000-8000-000000000005', organization: 'Acme', role: 'Engineer', startDate: '2022-01-01', endDate: '2024-01-01', description: 'Built products' }],
  });

  assert.equal(profile.skills[0]?.level, 4);
  assert.equal(profile.experienceYears, 2);
  assert.deepEqual(profile.preferredLocations, ['Jakarta']);
  assert.deepEqual(profile.preferredWorkModes, ['hybrid']);
});
