import { AppError } from '../lib/errors.js';

export function parseStructuredJson(content: string): unknown {
  const withoutFence = content
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '');
  const firstBrace = withoutFence.indexOf('{');
  const lastBrace = withoutFence.lastIndexOf('}');
  const candidate = firstBrace >= 0 && lastBrace > firstBrace
    ? withoutFence.slice(firstBrace, lastBrace + 1)
    : withoutFence;

  try {
    return JSON.parse(candidate);
  } catch {
    throw new AppError(502, 'AI_INVALID_JSON', 'The AI provider returned invalid JSON.');
  }
}
