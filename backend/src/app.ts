import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import Fastify, { type FastifyInstance } from 'fastify';
import type { AiProvider } from './ai/ai-provider.js';
import { AiOrchestrator } from './ai/ai-orchestrator.js';
import { createAiProvider } from './ai/create-ai-provider.js';
import type { AuthVerifier } from './auth/auth-verifier.js';
import { createAuthVerifier } from './auth/auth-verifier.js';
import type { AuthService } from './auth/auth-service.js';
import { createAuthService } from './auth/auth-service.js';
import { env } from './config/env.js';
import type { DatabaseClient } from './db/client.js';
import { checkDatabaseConnection, createDatabaseClient } from './db/client.js';
import { AppError } from './lib/errors.js';
import type { CareerRepository } from './repositories/career-repository.js';
import { PostgresCareerRepository } from './repositories/postgres-career-repository.js';
import { registerAiRoutes } from './routes/ai-routes.js';
import { registerDataRoutes } from './routes/data-routes.js';
import { registerAuthRoutes } from './routes/auth-routes.js';

type BuildAppOptions = {
  aiProvider?: AiProvider;
  databaseClient?: DatabaseClient | null;
  repository?: CareerRepository;
  authVerifier?: AuthVerifier;
  authService?: AuthService;
  logger?: boolean;
};

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.logger ?? env.NODE_ENV !== 'test',
    bodyLimit: 1_048_576,
    requestIdHeader: 'x-request-id',
    trustProxy: env.TRUST_PROXY,
  });

  await app.register(helmet);
  await app.register(cors, {
    origin: env.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['content-type', 'authorization', 'x-careermate-user-id', 'x-request-id'],
  });
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: '1 minute',
  });

  const aiProvider = options.aiProvider ?? createAiProvider(env);
  const orchestrator = new AiOrchestrator(aiProvider);
  const databaseClient = options.databaseClient === undefined
    ? await createDatabaseClient(env)
    : options.databaseClient;
  const repository = options.repository
    ?? (databaseClient ? new PostgresCareerRepository(databaseClient.db) : null);
  const authVerifier = options.authVerifier ?? createAuthVerifier(env);
  const authService = options.authService ?? createAuthService(env);

  if (databaseClient) {
    app.addHook('onClose', async () => databaseClient.close());
  }

  app.get('/health', async () => ({
    status: 'ok',
    service: 'careermate-backend',
    version: '0.1.0',
    ai: {
      configured: env.AI_PROVIDER !== 'disabled',
      provider: env.AI_PROVIDER,
      model: env.AI_PROVIDER === 'disabled'
        ? null
        : env.AI_PROVIDER === 'gemini' ? env.GEMINI_MODEL : env.AI_MODEL,
    },
    database: {
      configured: databaseClient !== null,
      mode: databaseClient?.mode ?? null,
    },
    auth: {
      mode: env.AUTH_MODE,
      registrationEnabled: authService.registrationEnabled,
    },
  }));

  app.get('/ready', async () => {
    if (!databaseClient) {
      throw new AppError(503, 'DATABASE_NOT_CONFIGURED', 'DATABASE_URL is not configured.');
    }
    await checkDatabaseConnection(databaseClient);
    return { status: 'ready' };
  });

  app.setNotFoundHandler((request, reply) => {
    return reply.status(404).send({
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found.',
        requestId: request.id,
      },
    });
  });

  app.setErrorHandler((error, request, reply) => {
    const isAppError = error instanceof AppError;
    const frameworkStatusCode =
      typeof error === 'object'
      && error !== null
      && 'statusCode' in error
      && typeof error.statusCode === 'number'
        ? error.statusCode
        : 500;
    const statusCode = isAppError
      ? error.statusCode
      : frameworkStatusCode;

    if (statusCode >= 500) {
      request.log.error({ err: error }, 'Request failed');
    }

    return reply.status(statusCode).send({
      error: {
        code: isAppError ? error.code : 'INTERNAL_SERVER_ERROR',
        message: isAppError ? error.message : 'An unexpected error occurred.',
        requestId: request.id,
        ...(isAppError && error.details !== undefined ? { details: error.details } : {}),
      },
    });
  });

  await app.register(async (api) => {
    await registerAuthRoutes(api, authService, repository, authVerifier);
    await registerDataRoutes(api, repository, authVerifier);
    await registerAiRoutes(api, orchestrator, repository, authVerifier);
  }, { prefix: '/api/v1' });

  return app;
}
