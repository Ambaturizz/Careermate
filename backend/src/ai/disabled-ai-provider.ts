import { AppError } from '../lib/errors.js';
import type { AiProvider, StructuredGenerationRequest } from './ai-provider.js';

export class DisabledAiProvider implements AiProvider {
  async generateJson<T>(_request: StructuredGenerationRequest<T>): Promise<T> {
    throw new AppError(
      503,
      'AI_PROVIDER_NOT_CONFIGURED',
      'AI provider is disabled. Configure backend/.env before using AI endpoints.',
    );
  }
}
