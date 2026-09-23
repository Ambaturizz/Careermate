import { z } from 'zod';
import { aiProcessingConsentSchema, candidateProfileSchema, languageSchema } from './common.js';

export const jobSchema = z.object({
  id: z.string().min(1).max(200),
  title: z.string().trim().min(1).max(200),
  company: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(30_000),
  requiredSkills: z.array(z.string().trim().min(1).max(100)).max(100).default([]),
  minimumExperienceYears: z.number().min(0).max(60).optional(),
  location: z.string().trim().max(200).optional(),
  workMode: z.enum(['remote', 'hybrid', 'onsite']).optional(),
});

export const jobMatchRequestSchema = z.object({
  consentToAiProcessing: aiProcessingConsentSchema,
  profile: candidateProfileSchema,
  jobs: z.array(jobSchema).min(1).max(100),
  maxResults: z.number().int().min(1).max(25).default(10),
  language: languageSchema,
});

export const jobMatchResponseSchema = z.object({
  matches: z.array(z.object({
    jobId: z.string(),
    matchScore: z.number().min(0).max(100),
    matchedSkills: z.array(z.string()),
    missingSkills: z.array(z.string()),
    rationale: z.string(),
    recommendation: z.enum(['strong_match', 'potential_match', 'stretch']),
  })).max(25),
});

export type Job = z.infer<typeof jobSchema>;
export type JobMatchRequest = z.infer<typeof jobMatchRequestSchema>;
export type JobMatchResponse = z.infer<typeof jobMatchResponseSchema>;
