import type { Environment } from '../config/env.js';
import type { AiProvider } from './ai-provider.js';
import { DisabledAiProvider } from './disabled-ai-provider.js';
import { GeminiProvider } from './gemini-provider.js';
import { OpenAiCompatibleProvider } from './openai-compatible-provider.js';

export function createAiProvider(config: Environment): AiProvider {
  if (config.AI_PROVIDER === 'disabled') {
    return new DisabledAiProvider();
  }

  if (config.AI_PROVIDER === 'gemini') {
    return new GeminiProvider({
      baseUrl: config.GEMINI_BASE_URL,
      apiKey: config.GEMINI_API_KEY!,
      model: config.GEMINI_MODEL,
      timeoutMs: config.AI_TIMEOUT_MS,
    });
  }

  return new OpenAiCompatibleProvider({
    baseUrl: config.AI_BASE_URL,
    ...(config.AI_API_KEY ? { apiKey: config.AI_API_KEY } : {}),
    model: config.AI_MODEL,
    timeoutMs: config.AI_TIMEOUT_MS,
  });
}
