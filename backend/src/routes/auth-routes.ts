import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { AuthService } from '../auth/auth-service.js';
import type { AuthVerifier } from '../auth/auth-verifier.js';
import { parseRequest } from '../lib/validation.js';
import type { CareerRepository } from '../repositories/career-repository.js';
import { authenticate } from './data-routes.js';

const emailSchema = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const passwordSchema = z.string().min(8).max(72);
const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: emailSchema,
  password: passwordSchema,
}).strict();
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(5).max(72),
}).strict();
const refreshSchema = z.object({
  refreshToken: z.string().min(1).max(4096),
}).strict();

export async function registerAuthRoutes(
  app: FastifyInstance,
  authService: AuthService,
  repository: CareerRepository | null,
  authVerifier: AuthVerifier,
): Promise<void> {
  const provisionUser = async (result: Awaited<ReturnType<AuthService['login']>>, fallbackName?: string) => {
    if (!repository) return;
    const user = await repository.ensureUser({
      provider: result.user.provider,
      subject: result.user.id,
      email: result.user.email,
    });
    const profile = await repository.getProfile(user.id);
    if (!profile) {
      const emailName = result.user.email.split('@')[0]?.replace(/[._-]+/g, ' ') || 'Pengguna CareerMate';
      await repository.upsertProfile(user.id, {
        fullName: fallbackName ?? result.user.fullName ?? emailName,
      });
    }
  };

  app.get('/auth/config', async () => ({
    registrationEnabled: authService.registrationEnabled,
  }));

  app.post('/auth/register', {
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const input = parseRequest(registerSchema, request.body);
    const result = await authService.register(input);
    if (result.status === 'authenticated') await provisionUser(result, input.fullName);
    reply.header('cache-control', 'no-store');
    return reply.status(201).send(result);
  });

  app.post('/auth/login', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const input = parseRequest(loginSchema, request.body);
    const result = await authService.login(input);
    await provisionUser(result);
    reply.header('cache-control', 'no-store');
    return result;
  });

  app.post('/auth/refresh', {
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const input = parseRequest(refreshSchema, request.body);
    const result = await authService.refresh(input.refreshToken);
    await provisionUser(result);
    reply.header('cache-control', 'no-store');
    return result;
  });

  app.get('/auth/me', async (request, reply) => {
    const { user } = await authenticate(request, repository, authVerifier);
    reply.header('cache-control', 'no-store');
    return user;
  });
}
