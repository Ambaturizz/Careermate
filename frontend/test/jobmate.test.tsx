import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { JobSummary } from '@careermate/contracts';
import { JobResultCard } from '../src/pages/JobMate.js';
import { CareerMateApiClient } from '../src/lib/api-client.js';

const datasetJob: JobSummary = {
  id: '00000000-0000-4000-8000-000000000100',
  title: 'Software Developers',
  companyName: 'CareerMate Demo Company 01',
  description: 'Synthetic dataset job used by the integration test.',
  location: 'Jakarta, Indonesia',
  workMode: 'remote',
  employmentType: 'full_time',
  experienceLevel: 'junior',
  minimumYearsExperience: 1,
  isSynthetic: true,
  publishedAt: null,
  expiresAt: null,
};

test('API client sends auth headers and validates dataset responses', async () => {
  const originalFetch = globalThis.fetch;
  let request: Request | undefined;
  globalThis.fetch = async (input, init) => {
    request = new Request(input, init);
    if (request.url.endsWith('/match')) {
      return new Response(JSON.stringify({
        jobId: datasetJob.id,
        matchScore: 75,
        components: { requiredSkills: 0.75, preferredSkills: 0.5, experience: 1 },
        matchedRequiredSkills: ['Communication'],
        missingRequiredSkills: [],
        matchedPreferredSkills: [],
        scoringVersion: 'deterministic-v1',
        disclaimer: 'Deterministic test fixture.',
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return new Response(JSON.stringify({ items: [datasetJob], total: 1, limit: 20, offset: 0 }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  try {
    const client = new CareerMateApiClient('http://backend.test/api/v1', () => ({ authorization: 'Bearer test-token' }));
    const response = await client.listJobs({ limit: 20 });
    assert.equal(response.items[0]?.title, datasetJob.title);
    assert.equal(request?.headers.get('authorization'), 'Bearer test-token');
    assert.equal(request?.url, 'http://backend.test/api/v1/jobs?limit=20');

    const match = await client.matchJob(datasetJob.id);
    assert.equal(match.matchScore, 75);
    assert.equal(request?.method, 'POST');
    assert.equal(request?.headers.get('content-type'), 'application/json');
    assert.equal(await request?.text(), '{}');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('JobMate renders fields returned by the dataset API and labels synthetic records', () => {
  const html = renderToStaticMarkup(<JobResultCard job={datasetJob} onOpen={() => undefined} />);
  assert.match(html, /Software Developers/);
  assert.match(html, /CareerMate Demo Company 01/);
  assert.match(html, /Jakarta, Indonesia/);
  assert.match(html, /Data demo/);
});
