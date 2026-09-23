import assert from 'node:assert/strict';
import test from 'node:test';
import { z } from 'zod';
import { OpenAiCompatibleProvider } from '../src/ai/openai-compatible-provider.js';
import { AppError } from '../src/lib/errors.js';

const outputSchema = z.object({ result: z.string().min(1) });

function provider(timeoutMs = 1_000) {
  return new OpenAiCompatibleProvider({
    baseUrl: 'http://model.test/v1/',
    apiKey: 'test-key',
    model: 'test-model',
    timeoutMs,
  });
}

test('OpenAI-compatible adapter sends a structured request and validates JSON output', async () => {
  const originalFetch = globalThis.fetch;
  let request: Request | undefined;
  globalThis.fetch = async (input, init) => {
    request = new Request(input, init);
    return new Response(JSON.stringify({ choices: [{ message: { content: '```json\n{"result":"ok"}\n```' } }] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  try {
    const result = await provider().generateJson({ operation: 'test.v1', systemPrompt: 'Test prompt.', input: { value: 'user data' }, outputSchema });
    assert.deepEqual(result, { result: 'ok' });
    assert.equal(request?.url, 'http://model.test/v1/chat/completions');
    assert.equal(request?.headers.get('authorization'), 'Bearer test-key');
    const body = await request?.json() as {
      model: string;
      temperature: number;
      response_format: {
        type: string;
        json_schema: { name: string; strict: boolean; schema: { properties?: Record<string, unknown> } };
      };
      messages: Array<{ role: string; content: string }>;
    };
    assert.equal(body.model, 'test-model');
    assert.equal(body.temperature, 0);
    assert.equal(body.response_format.type, 'json_schema');
    assert.equal(body.response_format.json_schema.name, 'test_v1');
    assert.equal(body.response_format.json_schema.strict, true);
    assert.ok(body.response_format.json_schema.schema.properties?.result);
    assert.match(body.messages[1]?.content ?? '', /"responseSchema"/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('OpenAI-compatible adapter rejects invalid JSON and schema mismatches', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response(JSON.stringify({ choices: [{ message: { content: 'not-json' } }] }), { status: 200 });
    await assert.rejects(
      provider().generateJson({ operation: 'test.v1', systemPrompt: 'Test.', input: {}, outputSchema }),
      (error: unknown) => error instanceof AppError && error.code === 'AI_INVALID_JSON',
    );

    globalThis.fetch = async () => new Response(JSON.stringify({ choices: [{ message: { content: '{"unexpected":true}' } }] }), { status: 200 });
    await assert.rejects(
      provider().generateJson({ operation: 'test.v1', systemPrompt: 'Test.', input: {}, outputSchema }),
      (error: unknown) => error instanceof AppError && error.code === 'AI_SCHEMA_MISMATCH',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('OpenAI-compatible adapter aborts requests at the configured timeout', async () => {
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
