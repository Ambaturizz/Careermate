import { z } from 'zod';
import { aiProcessingConsentSchema, candidateProfileSchema, languageSchema } from './common.js';

export const careerRecommendationRequestSchema = z.object({
  consentToAiProcessing: aiProcessingConsentSchema,
  profile: candidateProfileSchema,
  targetRoles: z.array(z.string().trim().min(1).max(120)).max(20).default([]),
  limit: z.number().int().min(1).max(10).default(5),
  language: languageSchema,
});

export const careerRecommendationResponseSchema = z.object({
  recommendations: z.array(z.object({
    role: z.string().min(1),
    matchScore: z.number().min(0).max(100),
    rationale: z.string().min(1),
    transferableSkills: z.array(z.string()),
    skillGaps: z.array(z.object({
      skill: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
      learningSuggestion: z.string(),
    })),
    nextSteps: z.array(z.string()).min(1),
  })).min(1).max(10),
  summary: z.string().min(1),
});

export type CareerRecommendationRequest = z.infer<typeof careerRecommendationRequestSchema>;
export type CareerRecommendationResponse = z.infer<typeof careerRecommendationResponseSchema>;
