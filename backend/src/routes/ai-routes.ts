import {
  careerRecommendationRequestSchema,
  documentGenerateRequestSchema,
  documentReviewRequestSchema,
  interviewFeedbackRequestSchema,
  interviewPlanRequestSchema,
  jobMatchRequestSchema,
} from '@careermate/contracts';
import { createHash } from 'node:crypto';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { AiOrchestrator } from '../ai/ai-orchestrator.js';
import type { AuthVerifier } from '../auth/auth-verifier.js';
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';
import { parseRequest } from '../lib/validation.js';
import type { CareerRepository } from '../repositories/career-repository.js';
import { authenticate } from './data-routes.js';

export async function registerAiRoutes(
  app: FastifyInstance,
  orchestrator: AiOrchestrator,
  repository: CareerRepository | null,
  authVerifier: AuthVerifier,
): Promise<void> {
  const rateLimitKey = (request: FastifyRequest) => {
    const bearerToken = request.headers.authorization;
    const developmentUser = request.headers['x-careermate-user-id'];
    const identity = bearerToken ?? (typeof developmentUser === 'string' ? developmentUser : request.ip);
    return createHash('sha256').update(identity).digest('hex');
  };
  const authenticatedRequests = new WeakMap<FastifyRequest, Awaited<ReturnType<typeof authenticate>>>();
  const protectedAiRoute = {
    config: {
      rateLimit: {
        max: env.AI_RATE_LIMIT_MAX,
        timeWindow: '1 minute',
        keyGenerator: rateLimitKey,
      },
    },
    preHandler: async (request: FastifyRequest) => {
      authenticatedRequests.set(request, await authenticate(request, repository, authVerifier));
    },
  };

  const authFor = (request: FastifyRequest) => {
    const authenticated = authenticatedRequests.get(request);
    if (!authenticated) throw new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication required.');
    return authenticated;
  };

  app.post('/career/recommendations', protectedAiRoute, async (request) => {
    const input = parseRequest(careerRecommendationRequestSchema, request.body);
    return orchestrator.careerRecommendations(input);
  });

  app.post('/jobs/match', protectedAiRoute, async (request) => {
    const input = parseRequest(jobMatchRequestSchema, request.body);
    return orchestrator.matchJobs(input);
  });

  app.post('/interviews/plan', protectedAiRoute, async (request) => {
    const input = parseRequest(interviewPlanRequestSchema, request.body);
    const plan = await orchestrator.createInterviewPlan(input);
    const { repository: db, user } = authFor(request);
    const persisted = await db.createInterviewSession(user.id, input, plan);
    return {
      ...plan,
      sessionId: persisted.sessionId,
      questions: plan.questions.map((question, index) => ({
        ...question,
        id: persisted.questionIds[index] ?? question.id,
      })),
    };
  });

  app.post('/interviews/feedback', protectedAiRoute, async (request) => {
    const input = parseRequest(interviewFeedbackRequestSchema, request.body);
    const feedback = await orchestrator.reviewInterviewAnswer(input);
    if (input.sessionId && input.questionId) {
      const { repository: db, user } = authFor(request);
      if (!await db.saveInterviewAnswer(user.id, input, feedback)) {
        throw new AppError(404, 'INTERVIEW_QUESTION_NOT_FOUND', 'Interview question was not found for this user.');
      }
    }
    return feedback;
  });

  app.post('/documents/review', protectedAiRoute, async (request) => {
    const input = parseRequest(documentReviewRequestSchema, request.body);
    return orchestrator.reviewDocument(input);
  });

  app.post('/documents/generate', protectedAiRoute, async (request) => {
    const input = parseRequest(documentGenerateRequestSchema, request.body);
    return orchestrator.generateDocument(input);
  });
}
