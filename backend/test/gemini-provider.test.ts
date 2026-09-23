import assert from 'node:assert/strict';
import test from 'node:test';
import { z } from 'zod';
import { GeminiProvider } from '../src/ai/gemini-provider.js';
import { AppError } from '../src/lib/errors.js';

const outputSchema = z.object({ result: z.string().min(1) });

function provider(timeoutMs = 1_000) {
  return new GeminiProvider({
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/',
    apiKey: 'test-gemini-key',
    model: 'gemini-test',
    timeoutMs,
  });
}

test('Gemini adapter sends a native structured request and validates JSON output', async () => {
  const originalFetch = globalThis.fetch;
  let request: Request | undefined;
  globalThis.fetch = async (input, init) => {
    request = new Request(input, init);
    return new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: '{"result":"ok"}' }] }, finishReason: 'STOP' }],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };

  try {
    const result = await provider().generateJson({
      operation: 'test.v1',
      systemPrompt: 'Test prompt.',
      input: { value: 'user data' },
      outputSchema,
    });

    assert.deepEqual(result, { result: 'ok' });
    assert.equal(
      request?.url,
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-test:generateContent',
    );
    assert.equal(request?.headers.get('x-goog-api-key'), 'test-gemini-key');
    assert.equal(request?.headers.get('authorization'), null);

    const body = await request?.json() as {
      systemInstruction: { parts: Array<{ text: string }> };
      contents: Array<{ role: string; parts: Array<{ text: string }> }>;
      generationConfig: {
        temperature: number;
        responseFormat: {
          text: {
            mimeType: string;
            schema: { $schema?: string; properties?: Record<string, unknown> };
          };
        };
      };
    };
    assert.equal(body.generationConfig.temperature, 0);
    assert.equal(body.generationConfig.responseFormat.text.mimeType, 'APPLICATION_JSON');
    assert.ok(body.generationConfig.responseFormat.text.schema.properties?.result);
    assert.equal(body.generationConfig.responseFormat.text.schema.$schema, undefined);
    assert.match(body.systemInstruction.parts[0]?.text ?? '', /untrusted data/);
    assert.match(body.contents[0]?.parts[0]?.text ?? '', /"responseSchema"/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Gemini adapter maps quota errors without exposing provider details', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    error: { status: 'RESOURCE_EXHAUSTED', message: 'sensitive provider detail' },
  }), { status: 429 });

  try {
    await assert.rejects(
      provider().generateJson({ operation: 'test.v1', systemPrompt: 'Test.', input: {}, outputSchema }),
      (error: unknown) => error instanceof AppError
        && error.code === 'AI_PROVIDER_QUOTA_EXCEEDED'
        && !error.message.includes('sensitive provider detail'),
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Gemini adapter rejects blocked, invalid, and schema-mismatched responses', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response(JSON.stringify({
      promptFeedback: { blockReason: 'SAFETY' },
    }), { status: 200 });
    await assert.rejects(
      provider().generateJson({ operation: 'test.v1', systemPrompt: 'Test.', input: {}, outputSchema }),
      (error: unknown) => error instanceof AppError && error.code === 'AI_RESPONSE_BLOCKED',
    );

    globalThis.fetch = async () => new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: 'not-json' }] }, finishReason: 'STOP' }],
    }), { status: 200 });
    await assert.rejects(
      provider().generateJson({ operation: 'test.v1', systemPrompt: 'Test.', input: {}, outputSchema }),
      (error: unknown) => error instanceof AppError && error.code === 'AI_INVALID_JSON',
    );

    globalThis.fetch = async () => new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: '{"unexpected":true}' }] }, finishReason: 'STOP' }],
    }), { status: 200 });
    await assert.rejects(
      provider().generateJson({ operation: 'test.v1', systemPrompt: 'Test.', input: {}, outputSchema }),
      (error: unknown) => error instanceof AppError && error.code === 'AI_SCHEMA_MISMATCH',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Gemini adapter aborts requests at the configured timeout', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_input, init) => new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => {
      const error = new Error('aborted');
      error.name = 'AbortError';
      reject(error);
    });
  });

  try {
    await assert.rejects(
      provider(10).generateJson({ operation: 'test.v1', systemPrompt: 'Test.', input: {}, outputSchema }),
      (error: unknown) => error instanceof AppError && error.code === 'AI_TIMEOUT',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
