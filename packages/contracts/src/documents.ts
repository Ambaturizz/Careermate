import { z } from 'zod';
import { aiProcessingConsentSchema, candidateProfileSchema, languageSchema } from './common.js';

export const careerDocumentTypeSchema = z.enum(['cv', 'motivation_letter']);

export const documentReviewRequestSchema = z.object({
  consentToAiProcessing: aiProcessingConsentSchema,
  documentType: careerDocumentTypeSchema,
  content: z.string().trim().min(20).max(50_000),
  targetRole: z.string().trim().max(200).optional(),
  jobDescription: z.string().trim().max(30_000).optional(),
  language: languageSchema,
});

export const documentReviewResponseSchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  issues: z.array(z.object({
    severity: z.enum(['critical', 'warning', 'suggestion']),
    section: z.string(),
    explanation: z.string(),
    suggestedRewrite: z.string().optional(),
  })),
  atsKeywords: z.object({
    present: z.array(z.string()),
    missing: z.array(z.string()),
  }),
  learningNotes: z.array(z.string()),
});

export const documentGenerateRequestSchema = z.object({
  consentToAiProcessing: aiProcessingConsentSchema,
  documentType: careerDocumentTypeSchema,
  profile: candidateProfileSchema,
  targetRole: z.string().trim().min(1).max(200),
  jobDescription: z.string().trim().max(30_000).optional(),
  tone: z.enum(['professional', 'confident', 'concise']).default('professional'),
  language: languageSchema,
});

export const documentGenerateResponseSchema = z.object({
  title: z.string(),
  content: z.string().min(1),
  sections: z.array(z.object({
    heading: z.string(),
    content: z.string(),
  })).min(1),
  checklist: z.array(z.string()),
});

export type CareerDocumentType = z.infer<typeof careerDocumentTypeSchema>;
export type DocumentReviewRequest = z.infer<typeof documentReviewRequestSchema>;
export type DocumentReviewResponse = z.infer<typeof documentReviewResponseSchema>;
export type DocumentGenerateRequest = z.infer<typeof documentGenerateRequestSchema>;
export type DocumentGenerateResponse = z.infer<typeof documentGenerateResponseSchema>;
