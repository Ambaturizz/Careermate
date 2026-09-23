import type { z } from 'zod';

export type StructuredGenerationRequest<T> = {
  operation: string;
  systemPrompt: string;
  input: unknown;
  outputSchema: z.ZodType<T>;
};

export interface AiProvider {
  generateJson<T>(request: StructuredGenerationRequest<T>): Promise<T>;
}
