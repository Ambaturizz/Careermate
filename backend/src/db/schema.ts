import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgSchema,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const appSchema = pgSchema('app');
export const careerSchema = pgSchema('career');

export const proficiencyLevelEnum = appSchema.enum('proficiency_level', [
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]);
export const userSkillSourceEnum = appSchema.enum('user_skill_source', [
  'self_assessed',
  'resume',
  'project',
  'verified',
  'imported',
]);
export const interviewModeEnum = appSchema.enum('interview_mode', [
  'practice',
  'mock',
  'assessment',
]);
export const difficultyEnum = appSchema.enum('difficulty', ['beginner', 'intermediate', 'advanced']);
export const questionTypeEnum = appSchema.enum('question_type', [
  'behavioral',
  'technical',
  'situational',
  'case_study',
]);

export const workModeEnum = careerSchema.enum('work_mode', ['onsite', 'hybrid', 'remote', 'flexible']);
export const employmentTypeEnum = careerSchema.enum('employment_type', [
  'full_time',
  'part_time',
  'contract',
  'internship',
  'freelance',
  'temporary',
]);
export const experienceLevelEnum = careerSchema.enum('experience_level', [
  'entry',
  'junior',
  'mid',
  'senior',
  'lead',
  'executive',
]);
export const requirementTypeEnum = careerSchema.enum('requirement_type', ['required', 'preferred']);
export const skillKindEnum = careerSchema.enum('skill_kind', [
  'skill',
  'competence',
  'language',
]);
export const mappingStatusEnum = careerSchema.enum('mapping_status', [
  'exact',
  'reviewed',
  'manual_review',
  'unresolved',
  'rejected',
]);
export const importStatusEnum = careerSchema.enum('import_status', [
  'running',
  'completed',
  'failed',
]);

export const dataSources = careerSchema.table('data_sources', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  version: text('version').notNull(),
  sourceUrl: text('source_url').notNull(),
  license: text('license').notNull(),
  attribution: text('attribution').notNull(),
  retrievedAt: timestamp('retrieved_at', { withTimezone: true }),
  lastImportedAt: timestamp('last_imported_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('data_sources_name_version_uidx').on(table.name, table.version),
]);

export const dataImportRuns = careerSchema.table('data_import_runs', {
  id: uuid('id').defaultRandom().primaryKey(),
  dataSourceId: uuid('data_source_id').notNull().references(() => dataSources.id, { onDelete: 'restrict' }),
  importer: text('importer').notNull(),
  status: importStatusEnum('status').notNull(),
  statistics: jsonb('statistics').$type<Record<string, number>>().default({}).notNull(),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
}, (table) => [
  index('data_import_runs_source_idx').on(table.dataSourceId, table.startedAt),
]);

export const skills = careerSchema.table('skills', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  normalizedName: text('normalized_name').notNull(),
  description: text('description'),
  category: text('category'),
  kind: skillKindEnum('kind').default('skill').notNull(),
  primaryDataSourceId: uuid('primary_data_source_id').references(() => dataSources.id, { onDelete: 'set null' }),
  externalId: text('external_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('skills_normalized_name_uidx').on(table.normalizedName),
  uniqueIndex('skills_source_external_uidx').on(table.primaryDataSourceId, table.externalId),
  index('skills_name_idx').on(table.name),
]);

export const skillAliases = careerSchema.table('skill_aliases', {
  id: uuid('id').defaultRandom().primaryKey(),
  skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  alias: text('alias').notNull(),
  normalizedAlias: text('normalized_alias').notNull(),
  locale: text('locale').default('en').notNull(),
  dataSourceId: uuid('data_source_id').references(() => dataSources.id, { onDelete: 'set null' }),
  externalId: text('external_id'),
}, (table) => [
  uniqueIndex('skill_aliases_value_locale_uidx').on(table.normalizedAlias, table.locale),
  index('skill_aliases_skill_idx').on(table.skillId),
]);

export const interests = careerSchema.table('interests', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  normalizedName: text('normalized_name').notNull(),
  description: text('description'),
  dataSourceId: uuid('data_source_id').references(() => dataSources.id, { onDelete: 'set null' }),
  externalId: text('external_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('interests_normalized_name_uidx').on(table.normalizedName),
  uniqueIndex('interests_source_external_uidx').on(table.dataSourceId, table.externalId),
]);

export const knowledgeAreas = careerSchema.table('knowledge_areas', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  normalizedName: text('normalized_name').notNull(),
  description: text('description'),
  dataSourceId: uuid('data_source_id').references(() => dataSources.id, { onDelete: 'set null' }),
  externalId: text('external_id'),
}, (table) => [
  uniqueIndex('knowledge_areas_normalized_name_uidx').on(table.normalizedName),
  uniqueIndex('knowledge_areas_source_external_uidx').on(table.dataSourceId, table.externalId),
]);

export const abilities = careerSchema.table('abilities', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  normalizedName: text('normalized_name').notNull(),
  description: text('description'),
  dataSourceId: uuid('data_source_id').references(() => dataSources.id, { onDelete: 'set null' }),
  externalId: text('external_id'),
}, (table) => [
  uniqueIndex('abilities_normalized_name_uidx').on(table.normalizedName),
  uniqueIndex('abilities_source_external_uidx').on(table.dataSourceId, table.externalId),
]);

export const technologies = careerSchema.table('technologies', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  normalizedName: text('normalized_name').notNull(),
  category: text('category'),
  dataSourceId: uuid('data_source_id').references(() => dataSources.id, { onDelete: 'set null' }),
  externalId: text('external_id'),
}, (table) => [
  uniqueIndex('technologies_normalized_name_uidx').on(table.normalizedName),
  uniqueIndex('technologies_source_external_uidx').on(table.dataSourceId, table.externalId),
]);

export const occupations = careerSchema.table('occupations', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  normalizedTitle: text('normalized_title').notNull(),
  description: text('description').notNull(),
  careerCluster: text('career_cluster'),
  educationLevel: text('education_level'),
  jobZone: integer('job_zone'),
  dataSourceId: uuid('data_source_id').references(() => dataSources.id, { onDelete: 'set null' }),
  externalId: text('external_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('occupations_source_external_uidx').on(table.dataSourceId, table.externalId),
  index('occupations_title_idx').on(table.title),
  check('occupations_job_zone_check', sql`${table.jobZone} is null or ${table.jobZone} between 1 and 5`),
]);

export const occupationSkills = careerSchema.table('occupation_skills', {
  id: uuid('id').defaultRandom().primaryKey(),
  occupationId: uuid('occupation_id').notNull().references(() => occupations.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  importance: real('importance'),
  level: real('level'),
  requirementType: requirementTypeEnum('requirement_type').default('required').notNull(),
  dataSourceId: uuid('data_source_id').references(() => dataSources.id, { onDelete: 'set null' }),
  originalValues: jsonb('original_values').$type<Record<string, unknown>>().default({}).notNull(),
}, (table) => [
  uniqueIndex('occupation_skills_relation_uidx').on(table.occupationId, table.skillId, table.dataSourceId),
  index('occupation_skills_occupation_idx').on(table.occupationId),
  index('occupation_skills_skill_idx').on(table.skillId),
  check('occupation_skills_importance_check', sql`${table.importance} is null or ${table.importance} between 0 and 100`),
  check('occupation_skills_level_check', sql`${table.level} is null or ${table.level} between 0 and 100`),
]);

export const occupationInterests = careerSchema.table('occupation_interests', {
  occupationId: uuid('occupation_id').notNull().references(() => occupations.id, { onDelete: 'cascade' }),
  interestId: uuid('interest_id').notNull().references(() => interests.id, { onDelete: 'cascade' }),
  score: real('score').notNull(),
  dataSourceId: uuid('data_source_id').references(() => dataSources.id, { onDelete: 'set null' }),
  originalValues: jsonb('original_values').$type<Record<string, unknown>>().default({}).notNull(),
}, (table) => [
  primaryKey({ columns: [table.occupationId, table.interestId] }),
  index('occupation_interests_interest_idx').on(table.interestId),
  check('occupation_interests_score_check', sql`${table.score} between 0 and 100`),
]);

export const occupationKnowledge = careerSchema.table('occupation_knowledge', {
  occupationId: uuid('occupation_id').notNull().references(() => occupations.id, { onDelete: 'cascade' }),
  knowledgeAreaId: uuid('knowledge_area_id').notNull().references(() => knowledgeAreas.id, { onDelete: 'cascade' }),
  importance: real('importance'),
  level: real('level'),
  dataSourceId: uuid('data_source_id').references(() => dataSources.id, { onDelete: 'set null' }),
  originalValues: jsonb('original_values').$type<Record<string, unknown>>().default({}).notNull(),
}, (table) => [
  primaryKey({ columns: [table.occupationId, table.knowledgeAreaId] }),
  index('occupation_knowledge_area_idx').on(table.knowledgeAreaId),
]);

export const occupationAbilities = careerSchema.table('occupation_abilities', {
  occupationId: uuid('occupation_id').notNull().references(() => occupations.id, { onDelete: 'cascade' }),
  abilityId: uuid('ability_id').notNull().references(() => abilities.id, { onDelete: 'cascade' }),
  importance: real('importance'),
  level: real('level'),
  dataSourceId: uuid('data_source_id').references(() => dataSources.id, { onDelete: 'set null' }),
  originalValues: jsonb('original_values').$type<Record<string, unknown>>().default({}).notNull(),
}, (table) => [
  primaryKey({ columns: [table.occupationId, table.abilityId] }),
  index('occupation_abilities_ability_idx').on(table.abilityId),
]);

export const occupationTechnologies = careerSchema.table('occupation_technologies', {
  occupationId: uuid('occupation_id').notNull().references(() => occupations.id, { onDelete: 'cascade' }),
  technologyId: uuid('technology_id').notNull().references(() => technologies.id, { onDelete: 'cascade' }),
  importance: real('importance'),
  dataSourceId: uuid('data_source_id').references(() => dataSources.id, { onDelete: 'set null' }),
  originalValues: jsonb('original_values').$type<Record<string, unknown>>().default({}).notNull(),
}, (table) => [
  primaryKey({ columns: [table.occupationId, table.technologyId] }),
  index('occupation_technologies_technology_idx').on(table.technologyId),
]);

export const externalMappings = careerSchema.table('external_mappings', {
  id: uuid('id').defaultRandom().primaryKey(),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  dataSourceId: uuid('data_source_id').notNull().references(() => dataSources.id, { onDelete: 'cascade' }),
  externalId: text('external_id').notNull(),
  externalUri: text('external_uri'),
  status: mappingStatusEnum('status').default('unresolved').notNull(),
  confidence: real('confidence'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('external_mappings_source_id_uidx').on(table.entityType, table.dataSourceId, table.externalId),
  index('external_mappings_entity_idx').on(table.entityType, table.entityId),
  check('external_mappings_confidence_check', sql`${table.confidence} is null or ${table.confidence} between 0 and 1`),
]);

export const jobs = careerSchema.table('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  externalId: text('external_id'),
  source: text('source').notNull(),
  occupationId: uuid('occupation_id').references(() => occupations.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  companyName: text('company_name').notNull(),
  description: text('description').notNull(),
  location: text('location'),
  workMode: workModeEnum('work_mode'),
  employmentType: employmentTypeEnum('employment_type'),
  experienceLevel: experienceLevelEnum('experience_level'),
  minimumYearsExperience: real('minimum_years_experience'),
  isSynthetic: boolean('is_synthetic').default(false).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('jobs_source_external_uidx').on(table.source, table.externalId),
  index('jobs_title_idx').on(table.title),
  index('jobs_occupation_idx').on(table.occupationId),
  check('jobs_minimum_experience_check', sql`${table.minimumYearsExperience} is null or ${table.minimumYearsExperience} >= 0`),
]);

export const jobSkills = careerSchema.table('job_skills', {
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  requirementType: requirementTypeEnum('requirement_type').notNull(),
  importance: real('importance').default(50).notNull(),
}, (table) => [
  primaryKey({ columns: [table.jobId, table.skillId] }),
  index('job_skills_skill_idx').on(table.skillId),
  check('job_skills_importance_check', sql`${table.importance} between 0 and 100`),
]);

export const users = appSchema.table('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull(),
  authProvider: text('auth_provider').notNull(),
  authSubject: text('auth_subject').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('users_email_uidx').on(table.email),
  uniqueIndex('users_auth_identity_uidx').on(table.authProvider, table.authSubject),
]);

export const profiles = appSchema.table('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  headline: text('headline'),
  bio: text('bio'),
  location: text('location'),
  educationLevel: text('education_level'),
  preferredWorkMode: workModeEnum('preferred_work_mode'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('profiles_user_uidx').on(table.userId),
]);

export const careerPreferences = appSchema.table('career_preferences', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  preferredWorkMode: workModeEnum('preferred_work_mode'),
  preferredEmploymentType: employmentTypeEnum('preferred_employment_type'),
  preferredLocation: text('preferred_location'),
  desiredExperienceLevel: experienceLevelEnum('desired_experience_level'),
  minimumSalary: integer('minimum_salary'),
  salaryCurrency: text('salary_currency'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  check('career_preferences_salary_check', sql`${table.minimumSalary} is null or ${table.minimumSalary} >= 0`),
]);

export const userTargetOccupations = appSchema.table('user_target_occupations', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  occupationId: uuid('occupation_id').notNull().references(() => occupations.id, { onDelete: 'cascade' }),
  priority: integer('priority').default(1).notNull(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.occupationId] }),
  check('user_target_occupations_priority_check', sql`${table.priority} between 1 and 5`),
]);

export const userSkills = appSchema.table('user_skills', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'restrict' }),
  proficiencyLevel: proficiencyLevelEnum('proficiency_level').notNull(),
  yearsExperience: real('years_experience'),
  source: userSkillSourceEnum('source').default('self_assessed').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('user_skills_user_skill_uidx').on(table.userId, table.skillId),
  index('user_skills_user_idx').on(table.userId),
  check('user_skills_years_check', sql`${table.yearsExperience} is null or ${table.yearsExperience} >= 0`),
]);

export const userInterests = appSchema.table('user_interests', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  interestId: uuid('interest_id').notNull().references(() => interests.id, { onDelete: 'restrict' }),
  interestLevel: integer('interest_level').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.interestId] }),
  check('user_interests_level_check', sql`${table.interestLevel} between 1 and 5`),
]);

export const education = appSchema.table('education', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  institution: text('institution').notNull(),
  fieldOfStudy: text('field_of_study'),
  degree: text('degree'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index('education_user_idx').on(table.userId)]);

export const experiences = appSchema.table('experiences', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organization: text('organization').notNull(),
  role: text('role').notNull(),
  startDate: date('start_date'),
  endDate: date('end_date'),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index('experiences_user_idx').on(table.userId)]);

export const projects = appSchema.table('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  repositoryUrl: text('repository_url'),
  projectUrl: text('project_url'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index('projects_user_idx').on(table.userId)]);

export const projectSkills = appSchema.table('project_skills', {
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'restrict' }),
}, (table) => [
  primaryKey({ columns: [table.projectId, table.skillId] }),
  index('project_skills_skill_idx').on(table.skillId),
]);

export const certifications = appSchema.table('certifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  issuer: text('issuer').notNull(),
  issuedDate: date('issued_date'),
  expirationDate: date('expiration_date'),
  credentialUrl: text('credential_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index('certifications_user_idx').on(table.userId)]);

export const savedJobs = appSchema.table('saved_jobs', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  savedAt: timestamp('saved_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [primaryKey({ columns: [table.userId, table.jobId] })]);

export const resumes = appSchema.table('resumes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  summary: text('summary'),
  targetOccupationId: uuid('target_occupation_id').references(() => occupations.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index('resumes_user_idx').on(table.userId)]);

export const resumeEducation = appSchema.table('resume_education', {
  resumeId: uuid('resume_id').notNull().references(() => resumes.id, { onDelete: 'cascade' }),
  educationId: uuid('education_id').notNull().references(() => education.id, { onDelete: 'cascade' }),
  position: integer('position').default(0).notNull(),
}, (table) => [primaryKey({ columns: [table.resumeId, table.educationId] })]);

export const resumeExperiences = appSchema.table('resume_experiences', {
  resumeId: uuid('resume_id').notNull().references(() => resumes.id, { onDelete: 'cascade' }),
  experienceId: uuid('experience_id').notNull().references(() => experiences.id, { onDelete: 'cascade' }),
  position: integer('position').default(0).notNull(),
}, (table) => [primaryKey({ columns: [table.resumeId, table.experienceId] })]);

export const resumeProjects = appSchema.table('resume_projects', {
  resumeId: uuid('resume_id').notNull().references(() => resumes.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  position: integer('position').default(0).notNull(),
}, (table) => [primaryKey({ columns: [table.resumeId, table.projectId] })]);

export const resumeSkills = appSchema.table('resume_skills', {
  resumeId: uuid('resume_id').notNull().references(() => resumes.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'restrict' }),
  proficiencyOverride: proficiencyLevelEnum('proficiency_override'),
  position: integer('position').default(0).notNull(),
}, (table) => [primaryKey({ columns: [table.resumeId, table.skillId] })]);

export const motivationLetters = appSchema.table('motivation_letters', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  targetCompany: text('target_company'),
  targetRole: text('target_role'),
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index('motivation_letters_user_idx').on(table.userId)]);

export const interviewSessions = appSchema.table('interview_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetOccupationId: uuid('target_occupation_id').references(() => occupations.id, { onDelete: 'set null' }),
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'set null' }),
  mode: interviewModeEnum('mode').notNull(),
  difficulty: difficultyEnum('difficulty').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
}, (table) => [index('interview_sessions_user_idx').on(table.userId)]);

export const interviewQuestions = appSchema.table('interview_questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => interviewSessions.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  questionType: questionTypeEnum('question_type').notNull(),
  rubric: jsonb('rubric').$type<Record<string, unknown>>().default({}).notNull(),
  position: integer('position').default(0).notNull(),
}, (table) => [index('interview_questions_session_idx').on(table.sessionId)]);

export const interviewAnswers = appSchema.table('interview_answers', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id').notNull().references(() => interviewQuestions.id, { onDelete: 'cascade' }),
  answer: text('answer').notNull(),
  feedback: text('feedback'),
  score: real('score'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('interview_answers_question_uidx').on(table.questionId),
  check('interview_answers_score_check', sql`${table.score} is null or ${table.score} between 0 and 100`),
]);

