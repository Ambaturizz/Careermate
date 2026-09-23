import { z } from 'zod';
import { aiProcessingConsentSchema, languageSchema } from './common.js';
import { uuidSchema } from './database.js';

export const interviewPlanRequestSchema = z.object({
  consentToAiProcessing: aiProcessingConsentSchema,
  targetRole: z.string().trim().min(1).max(200),
  seniority: z.enum(['intern', 'junior', 'mid', 'senior', 'lead']),
  focusAreas: z.array(z.string().trim().min(1).max(100)).max(20).default([]),
  jobDescription: z.string().trim().max(30_000).optional(),
  questionCount: z.number().int().min(3).max(20).default(8),
  language: languageSchema,
});

export const interviewPlanModelResponseSchema = z.object({
  learningObjectives: z.array(z.string()).min(1),
  studyPlan: z.array(z.object({
    topic: z.string(),
    objective: z.string(),
    activities: z.array(z.string()).min(1),
  })).min(1),
  questions: z.array(z.object({
    id: z.string(),
    type: z.enum(['behavioral', 'technical', 'case', 'situational']),
    question: z.string(),
    answerOutline: z.array(z.string()).min(1),
    evaluationCriteria: z.array(z.string()).min(1),
  })).min(3).max(20),
});

export const interviewPlanResponseSchema = interviewPlanModelResponseSchema.extend({
  sessionId: uuidSchema.optional(),
});

export const interviewFeedbackRequestSchema = z.object({
  consentToAiProcessing: aiProcessingConsentSchema,
  sessionId: uuidSchema.optional(),
  questionId: uuidSchema.optional(),
  targetRole: z.string().trim().min(1).max(200),
  targetCompany: z.string().trim().min(1).max(150).optional(),
  seniority: z.enum(['intern', 'junior', 'mid', 'senior', 'lead']).optional(),
  jobDescription: z.string().trim().max(30_000).optional(),
  question: z.string().trim().min(1).max(5_000),
  evaluationCriteria: z.array(z.string().trim().min(1).max(500)).min(1).max(20).optional(),
  answer: z.string().trim().min(1).max(20_000),
  language: languageSchema,
});

export const interviewFeedbackResponseSchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  improvedAnswerOutline: z.array(z.string()).min(1),
  nextExercise: z.string(),
});

export type InterviewPlanRequest = z.infer<typeof interviewPlanRequestSchema>;
export type InterviewPlanResponse = z.infer<typeof interviewPlanResponseSchema>;
export type InterviewFeedbackRequest = z.infer<typeof interviewFeedbackRequestSchema>;
export type InterviewFeedbackResponse = z.infer<typeof interviewFeedbackResponseSchema>;
