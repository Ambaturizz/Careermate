import { z } from 'zod';

export const languageSchema = z.enum(['id', 'en']).default('id');

export const aiProcessingConsentSchema = z.literal(true, {
  errorMap: () => ({ message: 'Explicit consent is required before data is sent to the configured AI provider.' }),
});

export const skillSchema = z.object({
  name: z.string().trim().min(1).max(100),
  level: z.number().int().min(1).max(5),
  yearsOfExperience: z.number().min(0).max(60).optional(),
});

export const candidateProfileSchema = z.object({
  headline: z.string().trim().max(200).optional(),
  education: z.array(z.string().trim().min(1).max(300)).max(20).default([]),
  experienceYears: z.number().min(0).max(60).default(0),
  experienceSummary: z.string().trim().max(10_000).optional(),
  skills: z.array(skillSchema).max(100).default([]),
  interests: z.array(z.string().trim().min(1).max(100)).max(50).default([]),
  goals: z.array(z.string().trim().min(1).max(300)).max(20).default([]),
  preferredLocations: z.array(z.string().trim().min(1).max(120)).max(20).default([]),
  preferredWorkModes: z.array(z.enum(['remote', 'hybrid', 'onsite'])).max(3).default([]),
  languages: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
});

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string().optional(),
    details: z.unknown().optional(),
  }),
});

export type Language = z.infer<typeof languageSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type CandidateProfile = z.infer<typeof candidateProfileSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
