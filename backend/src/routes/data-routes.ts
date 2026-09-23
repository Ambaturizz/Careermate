import {
  educationInputSchema,
  experienceInputSchema,
  paginationQuerySchema,
  profileUpdateSchema,
  projectInputSchema,
  userInterestCreateSchema,
  userSkillCreateSchema,
  userSkillUpdateSchema,
  uuidSchema,
} from '@careermate/contracts';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type { AuthVerifier } from '../auth/auth-verifier.js';
import { MATCHING_CONFIG } from '../domain/matching-config.js';
import { AppError } from '../lib/errors.js';
import { parseRequest } from '../lib/validation.js';
import type { AuthenticatedUser, CareerRepository } from '../repositories/career-repository.js';

const idParamsSchema = z.object({ id: uuidSchema });
const recommendationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

function requireRepository(repository: CareerRepository | null): CareerRepository {
  if (!repository) {
    throw new AppError(
      503,
      'DATABASE_NOT_CONFIGURED',
      'Database access is unavailable. Configure DATABASE_URL and run the migrations.',
    );
  }
  return repository;
}

export async function authenticate(
  request: FastifyRequest,
  repository: CareerRepository | null,
  verifier: AuthVerifier,
): Promise<{ repository: CareerRepository; user: AuthenticatedUser }> {
  const availableRepository = requireRepository(repository);
  const identity = await verifier.verify(request);
  const user = await availableRepository.ensureUser(identity);
  return { repository: availableRepository, user };
}

function notFound(entity: string): never {
  throw new AppError(404, 'NOT_FOUND', `${entity} was not found.`);
}

export async function registerDataRoutes(
  app: FastifyInstance,
  repository: CareerRepository | null,
  authVerifier: AuthVerifier,
): Promise<void> {
  app.get('/skills', async (request) => {
    const query = parseRequest(paginationQuerySchema, request.query);
    return requireRepository(repository).listSkills(query);
  });

  app.get('/skills/search', async (request) => {
    const query = parseRequest(paginationQuerySchema.extend({ q: z.string().trim().min(1).max(100) }), request.query);
    return requireRepository(repository).listSkills(query);
  });

  app.get('/occupations', async (request) => {
    const query = parseRequest(paginationQuerySchema, request.query);
    return requireRepository(repository).listOccupations(query);
  });

  app.get('/occupations/search', async (request) => {
    const query = parseRequest(paginationQuerySchema.extend({ q: z.string().trim().min(1).max(100) }), request.query);
    return requireRepository(repository).listOccupations(query);
  });

  app.get('/occupations/:id', async (request) => {
    const { id } = parseRequest(idParamsSchema, request.params);
    return await requireRepository(repository).getOccupation(id) ?? notFound('Occupation');
  });

  app.get('/jobs', async (request) => {
    const query = parseRequest(paginationQuerySchema, request.query);
    return requireRepository(repository).listJobs(query);
  });

  app.get('/jobs/:id', async (request) => {
    const { id } = parseRequest(idParamsSchema, request.params);
    return await requireRepository(repository).getJob(id) ?? notFound('Job');
  });

  app.get('/profile', async (request) => {
    const { repository: db, user } = await authenticate(request, repository, authVerifier);
    return await db.getProfile(user.id) ?? notFound('Profile');
  });

  app.put('/profile', async (request) => {
    const input = parseRequest(profileUpdateSchema, request.body);
    const { repository: db, user } = await authenticate(request, repository, authVerifier);
    return db.upsertProfile(user.id, input);
  });

  app.get('/profile/skills', async (request) => {
    const { repository: db, user } = await authenticate(request, repository, authVerifier);
    return { items: await db.listUserSkills(user.id) };
  });

  app.post('/profile/skills', async (request, reply) => {
    const input = parseRequest(userSkillCreateSchema, request.body);
    const { repository: db, user } = await authenticate(request, repository, authVerifier);
    return reply.status(201).send(await db.addUserSkill(user.id, input));
  });

  app.put('/profile/skills/:id', async (request) => {
    const { id } = parseRequest(idParamsSchema, request.params);
    const input = parseRequest(userSkillUpdateSchema, request.body);
    const { repository: db, user } = await authenticate(request, repository, authVerifier);
    return await db.updateUserSkill(user.id, id, input) ?? notFound('Profile skill');
  });

  app.delete('/profile/skills/:id', async (request, reply) => {
    const { id } = parseRequest(idParamsSchema, request.params);
    const { repository: db, user } = await authenticate(request, repository, authVerifier);
    if (!await db.deleteUserSkill(user.id, id)) notFound('Profile skill');
    return reply.status(204).send();
  });

  app.get('/profile/interests', async (request) => {
    const { repository: db, user } = await authenticate(request, repository, authVerifier);
    return { items: await db.listUserInterests(user.id) };
  });

  app.post('/profile/interests', async (request, reply) => {
    const input = parseRequest(userInterestCreateSchema, request.body);
    const { repository: db, user } = await authenticate(request, repository, authVerifier);
    return reply.status(201).send(await db.addUserInterest(user.id, input));
  });

  app.get('/profile/education', async (request) => {
    const { repository: db, user } = await authenticate(request, repository, authVerifier);
    return { items: await db.listEducation(user.id) };
  });

  app.post('/profile/education', async (request, reply) => {
    const input = parseRequest(educationInputSchema, request.body);
    const { repository: db, user } = await authenticate(request, repository, authVerifier);
    return reply.status(201).send(await db.addEducation(user.id, input));
  });

  app.get('/profile/experience', async (request) => {
    const { repository: db, user } = await authenticate(request, repository, authVerifier);
    return { items: await db.listExperiences(user.id) };
  });

  app.post('/profile/experience', async (request, reply) => {
    const input = parseRequest(experienceInputSchema, request.body);
    const { repository: db, user } = await authenticate(request, repository, authVerifier);
    return reply.status(201).send(await db.addExperience(user.id, input));
  });

  app.get('/profile/projects', async (request) => {
    const { repository: db, user } = await authenticate(request, repository, authVerifier);
    return { items: await db.listProjects(user.id) };
  });

  app.post('/profile/projects', async (request, reply) => {
    const input = parseRequest(projectInputSchema, request.body);
    const { repository: db, user } = await authenticate(request, repository, authVerifier);
    return reply.status(201).send(await db.addProject(user.id, input));
  });

  app.get('/career/recommendations', async (request) => {
    const query = parseRequest(recommendationQuerySchema, request.query);
    const { repository: db, user } = await authenticate(request, repository, authVerifier);
    return {
      recommendations: await db.getCareerRecommendations(user.id, query.limit),
      scoringVersion: MATCHING_CONFIG.version,
    };
  });

  app.post('/jobs/:id/match', async (request) => {
    const { id } = parseRequest(idParamsSchema, request.params);
    const { repository: db, user } = await authenticate(request, repository, authVerifier);
    return await db.getJobMatch(user.id, id) ?? notFound('Job');
  });
}
