import assert from 'node:assert/strict';
import test from 'node:test';
import {
  careerRecommendationResponseSchema,
  deterministicCareerResponseSchema,
  deterministicJobMatchSchema,
  documentGenerateResponseSchema,
  documentReviewResponseSchema,
  interviewFeedbackResponseSchema,
  interviewPlanResponseSchema,
  jobDetailSchema,
  jobMatchResponseSchema,
  paginatedJobsSchema,
  profileSchema,
} from '@careermate/contracts';
import { demoApiRequest } from '../src/lib/demo-api.js';

const jobId = '50000000-0000-4000-8000-000000000001';

test('frontend demo fixtures satisfy every page contract without network access', async () => {
  const [profile, jobs, job, deterministicCareers, deterministicMatch] = await Promise.all([
    demoApiRequest('/profile'),
    demoApiRequest('/jobs?limit=5'),
    demoApiRequest(`/jobs/${jobId}`),
    demoApiRequest('/career/recommendations?limit=4'),
    demoApiRequest(`/jobs/${jobId}/match`, { method: 'POST', body: '{}' }),
  ]);

  assert.equal(profileSchema.parse(profile).fullName, 'CareerMate Demo');
  assert.equal(paginatedJobsSchema.parse(jobs).items.length, 4);
  assert.equal(jobDetailSchema.parse(job).id, jobId);
  assert.equal(deterministicCareerResponseSchema.parse(deterministicCareers).recommendations.length, 4);
  assert.equal(deterministicJobMatchSchema.parse(deterministicMatch).jobId, jobId);
});

test('all hardcoded AI flows return contract-valid simulation results', async () => {
  const career = await demoApiRequest('/career/recommendations', {
    method: 'POST',
    body: JSON.stringify({ targetRoles: ['Frontend Developer'], limit: 1 }),
  });
  const match = await demoApiRequest('/jobs/match', {
    method: 'POST',
    body: JSON.stringify({ jobs: [{ id: jobId }], maxResults: 1 }),
  });
  const plan = await demoApiRequest('/interviews/plan', {
    method: 'POST',
    body: JSON.stringify({ targetRole: 'Frontend Developer', questionCount: 5 }),
  });
  const feedback = await demoApiRequest('/interviews/feedback', { method: 'POST', body: '{}' });
  const review = await demoApiRequest('/documents/review', { method: 'POST', body: '{}' });
  const generated = await demoApiRequest('/documents/generate', {
    method: 'POST',
    body: JSON.stringify({ targetRole: 'Frontend Developer', documentType: 'cv' }),
  });

  assert.equal(careerRecommendationResponseSchema.parse(career).recommendations.length, 1);
  assert.equal(jobMatchResponseSchema.parse(match).matches.length, 1);
  assert.equal(interviewPlanResponseSchema.parse(plan).questions.length, 5);
  assert.equal(interviewFeedbackResponseSchema.parse(feedback).score, 78);
  assert.equal(documentReviewResponseSchema.parse(review).score, 79);
  assert.match(documentGenerateResponseSchema.parse(generated).title, /Frontend Developer/);
});
