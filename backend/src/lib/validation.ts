import type { z } from 'zod';
import { AppError } from './errors.js';

export function parseRequest<Schema extends z.ZodTypeAny>(
  schema: Schema,
  value: unknown,
): z.output<Schema> {
  const parsed = schema.safeParse(value);

  if (!parsed.success) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'Request payload is invalid.',
      parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        code: issue.code,
        message: issue.message,
      })),
    );
  }

  return parsed.data;
}
