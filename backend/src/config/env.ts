import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().min(1).default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  CORS_ORIGINS: z.string().default('http://localhost:8080,http://127.0.0.1:8080'),
  TRUST_PROXY: z.enum(['true', 'false']).default('false').transform((value) => value === 'true'),
  RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(10_000).default(60),
  AI_PROVIDER: z.enum(['disabled', 'gemini', 'openai-compatible']).default('disabled'),
  GEMINI_BASE_URL: z.string().url().default('https://generativelanguage.googleapis.com/v1beta'),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().min(1).default('gemini-3.5-flash-lite'),
  AI_BASE_URL: z.string().url().default('http://127.0.0.1:11434/v1'),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().min(1).default('your-career-model'),
  AI_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(300_000).default(45_000),
  AI_RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(100).default(10),
  DATABASE_MODE: z.enum(['embedded', 'postgres']).default('embedded'),
  DATABASE_URL: z.string().min(1).optional(),
  DATABASE_SSL_MODE: z.enum(['disable', 'require', 'verify-full']).default('require'),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(50).default(10),
  AUTH_MODE: z.enum(['development', 'jwks']).default('development'),
  AUTH_DEV_USER_ID: z.string().uuid().default('00000000-0000-4000-8000-000000000001'),
  AUTH_DEV_EMAIL: z.string().email().default('careermate@gmail.com'),
  AUTH_DEV_PASSWORD: z.string().min(5).max(72).default('12345'),
  AUTH_JWKS_URL: z.string().url().optional(),
  AUTH_JWT_ISSUER: z.string().url().optional(),
  AUTH_JWT_AUDIENCE: z.string().min(1).default('authenticated'),
  AUTH_SUPABASE_URL: z.string().url().transform((value) => value.replace(/\/+$/, '')).optional(),
  AUTH_SUPABASE_ANON_KEY: z.string().min(1).optional(),
}).superRefine((value, context) => {
  if (value.AI_PROVIDER === 'gemini' && !value.GEMINI_API_KEY) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['GEMINI_API_KEY'],
      message: 'GEMINI_API_KEY is required when AI_PROVIDER=gemini.',
    });
  }

  if (value.NODE_ENV === 'production' && value.AUTH_MODE === 'development') {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['AUTH_MODE'],
      message: 'AUTH_MODE=development is forbidden in production.',
    });
  }

  if (value.NODE_ENV === 'production' && value.HOST !== '0.0.0.0' && value.HOST !== '::') {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['HOST'],
      message: 'HOST must be 0.0.0.0 or :: in production so the deployment platform can reach the service.',
    });
  }

  const corsOrigins = value.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);
  if (value.NODE_ENV === 'production' && corsOrigins.length === 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['CORS_ORIGINS'],
      message: 'At least one production frontend origin is required.',
    });
  }
  for (const origin of corsOrigins) {
    try {
      const parsedOrigin = new URL(origin);
      if (parsedOrigin.origin !== origin.replace(/\/$/, '')) throw new Error('Origin must not include a path.');
      if (value.NODE_ENV === 'production' && ['localhost', '127.0.0.1'].includes(parsedOrigin.hostname)) {
        throw new Error('Localhost is not a production origin.');
      }
    } catch {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CORS_ORIGINS'],
        message: `Invalid CORS origin: ${origin}`,
      });
    }
  }

  if (value.NODE_ENV === 'production' && value.DATABASE_MODE !== 'postgres') {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['DATABASE_MODE'],
      message: 'DATABASE_MODE=postgres is required in production.',
    });
  }

  if (value.DATABASE_MODE === 'postgres' && !value.DATABASE_URL) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['DATABASE_URL'],
      message: 'DATABASE_URL is required when DATABASE_MODE=postgres.',
    });
  }

  if (value.AUTH_MODE === 'jwks' && (!value.AUTH_JWKS_URL || !value.AUTH_JWT_ISSUER)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['AUTH_JWKS_URL'],
      message: 'AUTH_JWKS_URL and AUTH_JWT_ISSUER are required for JWKS authentication.',
    });
  }

  if (value.AUTH_MODE === 'jwks' && (!value.AUTH_SUPABASE_URL || !value.AUTH_SUPABASE_ANON_KEY)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['AUTH_SUPABASE_URL'],
      message: 'AUTH_SUPABASE_URL and AUTH_SUPABASE_ANON_KEY are required for login and registration.',
    });
  }
});

export function parseEnvironment(source: NodeJS.ProcessEnv) {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid backend environment: ${parsed.error.message}`);
  }

  return {
    ...parsed.data,
    corsOrigins: parsed.data.CORS_ORIGINS
      .split(',')
      .map((origin) => origin.trim().replace(/\/$/, ''))
      .filter(Boolean),
  };
}

export const env = parseEnvironment(process.env);

export type Environment = ReturnType<typeof parseEnvironment>;
