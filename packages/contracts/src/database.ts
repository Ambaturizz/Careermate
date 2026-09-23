import { z } from 'zod';

export const uuidSchema = z.string().uuid();
export const isoDateSchema = z.string().date();
export const nullableIsoDateSchema = isoDateSchema.nullable();
export const paginationQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const workModeSchema = z.enum(['onsite', 'hybrid', 'remote', 'flexible']);
export const employmentTypeSchema = z.enum([
  'full_time',
  'part_time',
  'contract',
  'internship',
  'freelance',
  'temporary',
]);
export const experienceLevelSchema = z.enum(['entry', 'junior', 'mid', 'senior', 'lead', 'executive']);
export const proficiencyLevelSchema = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);
export const educationLevelSchema = z.enum([
  'secondary',
  'vocational',
  'associate',
  'bachelor',
  'master',
  'doctorate',
]);

export const referenceSkillSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  kind: z.enum(['skill', 'competence', 'language']),
});

export const occupationSummarySchema = z.object({
  id: uuidSchema,
  title: z.string(),
  description: z.string(),
  careerCluster: z.string().nullable(),
  educationLevel: z.string().nullable(),
  jobZone: z.number().int().nullable(),
  externalId: z.string().nullable(),
});

const scoredRelationSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  importance: z.number().nullable(),
  level: z.number().nullable().optional(),
});

export const occupationDetailSchema = occupationSummarySchema.extend({
  skills: z.array(scoredRelationSchema.extend({ requirementType: z.enum(['required', 'preferred']) })),
  interests: z.array(z.object({ id: uuidSchema, name: z.string(), score: z.number() })),
  knowledge: z.array(scoredRelationSchema),
  abilities: z.array(scoredRelationSchema),
  technologies: z.array(z.object({ id: uuidSchema, name: z.string(), importance: z.number().nullable() })),
});

export const jobSummarySchema = z.object({
  id: uuidSchema,
  title: z.string(),
  companyName: z.string(),
  description: z.string(),
  location: z.string().nullable(),
  workMode: workModeSchema.nullable(),
  employmentType: employmentTypeSchema.nullable(),
  experienceLevel: experienceLevelSchema.nullable(),
  minimumYearsExperience: z.number().nullable(),
  isSynthetic: z.boolean(),
  publishedAt: z.string().datetime().nullable(),
  expiresAt: z.string().datetime().nullable(),
});

export const jobDetailSchema = jobSummarySchema.extend({
  skills: z.array(z.object({
    id: uuidSchema,
    name: z.string(),
    requirementType: z.enum(['required', 'preferred']),
    importance: z.number(),
  })),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(1).max(150),
  headline: z.string().trim().max(200).nullable().optional(),
  bio: z.string().trim().max(2_000).nullable().optional(),
  location: z.string().trim().max(150).nullable().optional(),
  educationLevel: educationLevelSchema.nullable().optional(),
  preferredWorkMode: workModeSchema.nullable().optional(),
});

export const profileSchema = profileUpdateSchema.extend({
  id: uuidSchema,
  userId: uuidSchema,
});

export const userSkillCreateSchema = z.object({
  skillId: uuidSchema,
  proficiencyLevel: proficiencyLevelSchema,
  yearsExperience: z.number().min(0).max(80).nullable().optional(),
  source: z.enum(['self_assessed', 'resume', 'project', 'verified', 'imported']).default('self_assessed'),
});
export const userSkillUpdateSchema = userSkillCreateSchema.omit({ skillId: true }).partial().refine(
  (value) => Object.keys(value).length > 0,
  'At least one field must be supplied.',
);
export const userSkillSchema = userSkillCreateSchema.extend({
  id: uuidSchema,
  name: z.string(),
});

export const userInterestCreateSchema = z.object({
  interestId: uuidSchema,
  interestLevel: z.number().int().min(1).max(5),
});
export const userInterestSchema = userInterestCreateSchema.extend({ name: z.string() });

export const educationInputSchema = z.object({
  institution: z.string().trim().min(1).max(200),
  fieldOfStudy: z.string().trim().max(200).nullable().optional(),
  degree: z.string().trim().max(150).nullable().optional(),
  startDate: nullableIsoDateSchema.optional(),
  endDate: nullableIsoDateSchema.optional(),
  description: z.string().trim().max(2_000).nullable().optional(),
});
export const educationSchema = educationInputSchema.extend({ id: uuidSchema });

export const experienceInputSchema = z.object({
  organization: z.string().trim().min(1).max(200),
  role: z.string().trim().min(1).max(200),
  startDate: nullableIsoDateSchema.optional(),
  endDate: nullableIsoDateSchema.optional(),
  description: z.string().trim().max(4_000).nullable().optional(),
});
export const experienceSchema = experienceInputSchema.extend({ id: uuidSchema });

export const projectInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4_000).nullable().optional(),
  repositoryUrl: z.string().url().max(2_000).nullable().optional(),
  projectUrl: z.string().url().max(2_000).nullable().optional(),
  startDate: nullableIsoDateSchema.optional(),
  endDate: nullableIsoDateSchema.optional(),
  skillIds: z.array(uuidSchema).max(50).default([]),
});
export const projectSchema = projectInputSchema.extend({ id: uuidSchema });

export const careerCompatibilitySchema = z.object({
  occupationId: uuidSchema,
  title: z.string(),
  compatibility: z.number().min(0).max(1),
  components: z.object({
    skillMatch: z.number().min(0).max(1),
    interestMatch: z.number().min(0).max(1),
    educationAlignment: z.number().min(0).max(1),
  }),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  matchedInterests: z.array(z.string()),
  disclaimer: z.string(),
});

export const deterministicCareerResponseSchema = z.object({
  recommendations: z.array(careerCompatibilitySchema),
  scoringVersion: z.string(),
});

export const deterministicJobMatchSchema = z.object({
  jobId: uuidSchema,
  matchScore: z.number().min(0).max(100),
  components: z.object({
    requiredSkills: z.number().min(0).max(1),
    preferredSkills: z.number().min(0).max(1),
    experience: z.number().min(0).max(1),
  }),
  matchedRequiredSkills: z.array(z.string()),
  missingRequiredSkills: z.array(z.string()),
  matchedPreferredSkills: z.array(z.string()),
  scoringVersion: z.string(),
  disclaimer: z.string(),
});

function paginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    offset: z.number().int().nonnegative(),
  });
}

export const paginatedReferenceSkillsSchema = paginatedSchema(referenceSkillSchema);
export const paginatedOccupationsSchema = paginatedSchema(occupationSummarySchema);
export const paginatedJobsSchema = paginatedSchema(jobSummarySchema);
export const userSkillsResponseSchema = z.object({ items: z.array(userSkillSchema) });
export const userInterestsResponseSchema = z.object({ items: z.array(userInterestSchema) });
export const educationResponseSchema = z.object({ items: z.array(educationSchema) });
export const experienceResponseSchema = z.object({ items: z.array(experienceSchema) });
export const projectsResponseSchema = z.object({ items: z.array(projectSchema) });

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type ReferenceSkill = z.infer<typeof referenceSkillSchema>;
export type OccupationSummary = z.infer<typeof occupationSummarySchema>;
export type OccupationDetail = z.infer<typeof occupationDetailSchema>;
export type JobSummary = z.infer<typeof jobSummarySchema>;
export type JobDetail = z.infer<typeof jobDetailSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type UserSkillCreate = z.infer<typeof userSkillCreateSchema>;
export type UserSkillUpdate = z.infer<typeof userSkillUpdateSchema>;
export type UserSkill = z.infer<typeof userSkillSchema>;
export type UserInterestCreate = z.infer<typeof userInterestCreateSchema>;
export type UserInterest = z.infer<typeof userInterestSchema>;
export type EducationInput = z.infer<typeof educationInputSchema>;
export type Education = z.infer<typeof educationSchema>;
export type ExperienceInput = z.infer<typeof experienceInputSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type ProjectInput = z.infer<typeof projectInputSchema>;
export type Project = z.infer<typeof projectSchema>;
export type CareerCompatibility = z.infer<typeof careerCompatibilitySchema>;
export type DeterministicCareerResponse = z.infer<typeof deterministicCareerResponseSchema>;
export type DeterministicJobMatch = z.infer<typeof deterministicJobMatchSchema>;
export type PaginatedReferenceSkills = z.infer<typeof paginatedReferenceSkillsSchema>;
export type PaginatedOccupations = z.infer<typeof paginatedOccupationsSchema>;
export type PaginatedJobs = z.infer<typeof paginatedJobsSchema>;
