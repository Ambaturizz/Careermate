import {
  careerRecommendationResponseSchema,
  documentGenerateResponseSchema,
  documentReviewResponseSchema,
  interviewFeedbackResponseSchema,
  interviewPlanModelResponseSchema,
  jobMatchResponseSchema,
  type CareerRecommendationRequest,
  type CareerRecommendationResponse,
  type DocumentGenerateRequest,
  type DocumentGenerateResponse,
  type DocumentReviewRequest,
  type DocumentReviewResponse,
  type InterviewFeedbackRequest,
  type InterviewFeedbackResponse,
  type InterviewPlanRequest,
  type InterviewPlanResponse,
  type JobMatchRequest,
  type JobMatchResponse,
} from '@careermate/contracts';
import type { AiProvider } from './ai-provider.js';
import { prompts } from './prompts.js';

export class AiOrchestrator {
  constructor(private readonly provider: AiProvider) {}

  careerRecommendations(input: CareerRecommendationRequest): Promise<CareerRecommendationResponse> {
    return this.provider.generateJson({
      operation: 'career.recommendations.v1',
      systemPrompt: prompts.careerRecommendation,
      input,
      outputSchema: careerRecommendationResponseSchema,
    });
  }

  matchJobs(input: JobMatchRequest): Promise<JobMatchResponse> {
    return this.provider.generateJson({
      operation: 'jobs.match.v1',
      systemPrompt: prompts.jobMatch,
      input,
      outputSchema: jobMatchResponseSchema,
    });
  }

  createInterviewPlan(input: InterviewPlanRequest): Promise<InterviewPlanResponse> {
    return this.provider.generateJson({
      operation: 'interviews.plan.v1',
      systemPrompt: prompts.interviewPlan,
      input,
      outputSchema: interviewPlanModelResponseSchema,
    });
  }

  reviewInterviewAnswer(input: InterviewFeedbackRequest): Promise<InterviewFeedbackResponse> {
    const { sessionId: _sessionId, questionId: _questionId, ...modelInput } = input;
    return this.provider.generateJson({
      operation: 'interviews.feedback.v1',
      systemPrompt: prompts.interviewFeedback,
      input: modelInput,
      outputSchema: interviewFeedbackResponseSchema,
    });
  }

  reviewDocument(input: DocumentReviewRequest): Promise<DocumentReviewResponse> {
    return this.provider.generateJson({
      operation: 'documents.review.v1',
      systemPrompt: prompts.documentReview,
      input,
      outputSchema: documentReviewResponseSchema,
    });
  }

  generateDocument(input: DocumentGenerateRequest): Promise<DocumentGenerateResponse> {
    return this.provider.generateJson({
      operation: 'documents.generate.v1',
      systemPrompt: prompts.documentGenerate,
      input,
      outputSchema: documentGenerateResponseSchema,
    });
  }
}
