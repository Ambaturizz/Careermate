CREATE SCHEMA "app";
--> statement-breakpoint
CREATE SCHEMA "career";
--> statement-breakpoint
CREATE TYPE "app"."difficulty" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "career"."employment_type" AS ENUM('full_time', 'part_time', 'contract', 'internship', 'freelance', 'temporary');--> statement-breakpoint
CREATE TYPE "career"."experience_level" AS ENUM('entry', 'junior', 'mid', 'senior', 'lead', 'executive');--> statement-breakpoint
CREATE TYPE "career"."import_status" AS ENUM('running', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "app"."interview_mode" AS ENUM('practice', 'mock', 'assessment');--> statement-breakpoint
CREATE TYPE "career"."mapping_status" AS ENUM('exact', 'reviewed', 'manual_review', 'unresolved', 'rejected');--> statement-breakpoint
CREATE TYPE "app"."proficiency_level" AS ENUM('beginner', 'intermediate', 'advanced', 'expert');--> statement-breakpoint
CREATE TYPE "app"."question_type" AS ENUM('behavioral', 'technical', 'situational', 'case_study');--> statement-breakpoint
CREATE TYPE "career"."requirement_type" AS ENUM('required', 'preferred');--> statement-breakpoint
CREATE TYPE "career"."skill_kind" AS ENUM('skill', 'competence', 'language');--> statement-breakpoint
CREATE TYPE "app"."user_skill_source" AS ENUM('self_assessed', 'resume', 'project', 'verified', 'imported');--> statement-breakpoint
CREATE TYPE "career"."work_mode" AS ENUM('onsite', 'hybrid', 'remote', 'flexible');--> statement-breakpoint
CREATE TABLE "career"."abilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"description" text,
	"data_source_id" uuid,
	"external_id" text
);
--> statement-breakpoint
CREATE TABLE "app"."career_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"preferred_work_mode" "career"."work_mode",
	"preferred_employment_type" "career"."employment_type",
	"preferred_location" text,
	"desired_experience_level" "career"."experience_level",
	"minimum_salary" integer,
	"salary_currency" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "career_preferences_salary_check" CHECK ("app"."career_preferences"."minimum_salary" is null or "app"."career_preferences"."minimum_salary" >= 0)
);
--> statement-breakpoint
CREATE TABLE "app"."certifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"issuer" text NOT NULL,
	"issued_date" date,
	"expiration_date" date,
	"credential_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career"."data_import_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"data_source_id" uuid NOT NULL,
	"importer" text NOT NULL,
	"status" "career"."import_status" NOT NULL,
	"statistics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"error_message" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "career"."data_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"version" text NOT NULL,
	"source_url" text NOT NULL,
	"license" text NOT NULL,
	"attribution" text NOT NULL,
	"retrieved_at" timestamp with time zone,
	"last_imported_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."education" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"institution" text NOT NULL,
	"field_of_study" text,
	"degree" text,
	"start_date" date,
	"end_date" date,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."experiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization" text NOT NULL,
	"role" text NOT NULL,
	"start_date" date,
	"end_date" date,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career"."external_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"data_source_id" uuid NOT NULL,
	"external_id" text NOT NULL,
	"external_uri" text,
	"status" "career"."mapping_status" DEFAULT 'unresolved' NOT NULL,
	"confidence" real,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "external_mappings_confidence_check" CHECK ("career"."external_mappings"."confidence" is null or "career"."external_mappings"."confidence" between 0 and 1)
);
--> statement-breakpoint
CREATE TABLE "career"."interests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"description" text,
	"data_source_id" uuid,
	"external_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."interview_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"answer" text NOT NULL,
	"feedback" text,
	"score" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "interview_answers_score_check" CHECK ("app"."interview_answers"."score" is null or "app"."interview_answers"."score" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "app"."interview_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"question" text NOT NULL,
	"question_type" "app"."question_type" NOT NULL,
	"rubric" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."interview_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"target_occupation_id" uuid,
	"job_id" uuid,
	"mode" "app"."interview_mode" NOT NULL,
	"difficulty" "app"."difficulty" NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "career"."job_skills" (
	"job_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"requirement_type" "career"."requirement_type" NOT NULL,
	"importance" real DEFAULT 50 NOT NULL,
	CONSTRAINT "job_skills_job_id_skill_id_pk" PRIMARY KEY("job_id","skill_id"),
	CONSTRAINT "job_skills_importance_check" CHECK ("career"."job_skills"."importance" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "career"."jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" text,
	"source" text NOT NULL,
	"occupation_id" uuid,
	"title" text NOT NULL,
	"company_name" text NOT NULL,
	"description" text NOT NULL,
	"location" text,
	"work_mode" "career"."work_mode",
	"employment_type" "career"."employment_type",
	"experience_level" "career"."experience_level",
	"minimum_years_experience" real,
	"is_synthetic" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_minimum_experience_check" CHECK ("career"."jobs"."minimum_years_experience" is null or "career"."jobs"."minimum_years_experience" >= 0)
);
--> statement-breakpoint
CREATE TABLE "career"."knowledge_areas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"description" text,
	"data_source_id" uuid,
	"external_id" text
);
--> statement-breakpoint
CREATE TABLE "app"."motivation_letters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"target_company" text,
	"target_role" text,
	"job_id" uuid,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career"."occupation_abilities" (
	"occupation_id" uuid NOT NULL,
	"ability_id" uuid NOT NULL,
	"importance" real,
	"level" real,
	"data_source_id" uuid,
	"original_values" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "occupation_abilities_occupation_id_ability_id_pk" PRIMARY KEY("occupation_id","ability_id")
);
--> statement-breakpoint
CREATE TABLE "career"."occupation_interests" (
	"occupation_id" uuid NOT NULL,
	"interest_id" uuid NOT NULL,
	"score" real NOT NULL,
	"data_source_id" uuid,
	"original_values" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "occupation_interests_occupation_id_interest_id_pk" PRIMARY KEY("occupation_id","interest_id"),
	CONSTRAINT "occupation_interests_score_check" CHECK ("career"."occupation_interests"."score" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "career"."occupation_knowledge" (
	"occupation_id" uuid NOT NULL,
	"knowledge_area_id" uuid NOT NULL,
	"importance" real,
	"level" real,
	"data_source_id" uuid,
	"original_values" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "occupation_knowledge_occupation_id_knowledge_area_id_pk" PRIMARY KEY("occupation_id","knowledge_area_id")
);
--> statement-breakpoint
CREATE TABLE "career"."occupation_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"occupation_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"importance" real,
	"level" real,
	"requirement_type" "career"."requirement_type" DEFAULT 'required' NOT NULL,
	"data_source_id" uuid,
	"original_values" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "occupation_skills_importance_check" CHECK ("career"."occupation_skills"."importance" is null or "career"."occupation_skills"."importance" between 0 and 100),
	CONSTRAINT "occupation_skills_level_check" CHECK ("career"."occupation_skills"."level" is null or "career"."occupation_skills"."level" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "career"."occupation_technologies" (
	"occupation_id" uuid NOT NULL,
	"technology_id" uuid NOT NULL,
	"importance" real,
	"data_source_id" uuid,
	"original_values" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "occupation_technologies_occupation_id_technology_id_pk" PRIMARY KEY("occupation_id","technology_id")
);
--> statement-breakpoint
CREATE TABLE "career"."occupations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"normalized_title" text NOT NULL,
	"description" text NOT NULL,
	"career_cluster" text,
	"education_level" text,
	"job_zone" integer,
	"data_source_id" uuid,
	"external_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "occupations_job_zone_check" CHECK ("career"."occupations"."job_zone" is null or "career"."occupations"."job_zone" between 1 and 5)
);
--> statement-breakpoint
CREATE TABLE "app"."profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"headline" text,
	"bio" text,
	"location" text,
	"education_level" text,
	"preferred_work_mode" "career"."work_mode",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."project_skills" (
	"project_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	CONSTRAINT "project_skills_project_id_skill_id_pk" PRIMARY KEY("project_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "app"."projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"repository_url" text,
	"project_url" text,
	"start_date" date,
	"end_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."resume_education" (
	"resume_id" uuid NOT NULL,
	"education_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "resume_education_resume_id_education_id_pk" PRIMARY KEY("resume_id","education_id")
);
--> statement-breakpoint
CREATE TABLE "app"."resume_experiences" (
	"resume_id" uuid NOT NULL,
	"experience_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "resume_experiences_resume_id_experience_id_pk" PRIMARY KEY("resume_id","experience_id")
);
--> statement-breakpoint
CREATE TABLE "app"."resume_projects" (
	"resume_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "resume_projects_resume_id_project_id_pk" PRIMARY KEY("resume_id","project_id")
);
--> statement-breakpoint
CREATE TABLE "app"."resume_skills" (
	"resume_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"proficiency_override" "app"."proficiency_level",
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "resume_skills_resume_id_skill_id_pk" PRIMARY KEY("resume_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "app"."resumes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"summary" text,
	"target_occupation_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."saved_jobs" (
	"user_id" uuid NOT NULL,
	"job_id" uuid NOT NULL,
	"saved_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_jobs_user_id_job_id_pk" PRIMARY KEY("user_id","job_id")
);
--> statement-breakpoint
CREATE TABLE "career"."skill_aliases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"skill_id" uuid NOT NULL,
	"alias" text NOT NULL,
	"normalized_alias" text NOT NULL,
	"locale" text DEFAULT 'en' NOT NULL,
	"data_source_id" uuid,
	"external_id" text
);
--> statement-breakpoint
CREATE TABLE "career"."skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"description" text,
	"category" text,
	"kind" "career"."skill_kind" DEFAULT 'skill' NOT NULL,
	"primary_data_source_id" uuid,
	"external_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career"."technologies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"category" text,
	"data_source_id" uuid,
	"external_id" text
);
--> statement-breakpoint
CREATE TABLE "app"."user_interests" (
	"user_id" uuid NOT NULL,
	"interest_id" uuid NOT NULL,
	"interest_level" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_interests_user_id_interest_id_pk" PRIMARY KEY("user_id","interest_id"),
	CONSTRAINT "user_interests_level_check" CHECK ("app"."user_interests"."interest_level" between 1 and 5)
);
--> statement-breakpoint
CREATE TABLE "app"."user_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"proficiency_level" "app"."proficiency_level" NOT NULL,
	"years_experience" real,
	"source" "app"."user_skill_source" DEFAULT 'self_assessed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_skills_years_check" CHECK ("app"."user_skills"."years_experience" is null or "app"."user_skills"."years_experience" >= 0)
);
--> statement-breakpoint
CREATE TABLE "app"."user_target_occupations" (
	"user_id" uuid NOT NULL,
	"occupation_id" uuid NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "user_target_occupations_user_id_occupation_id_pk" PRIMARY KEY("user_id","occupation_id"),
	CONSTRAINT "user_target_occupations_priority_check" CHECK ("app"."user_target_occupations"."priority" between 1 and 5)
);
--> statement-breakpoint
CREATE TABLE "app"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"auth_provider" text NOT NULL,
	"auth_subject" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "career"."abilities" ADD CONSTRAINT "abilities_data_source_id_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "career"."data_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."career_preferences" ADD CONSTRAINT "career_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."certifications" ADD CONSTRAINT "certifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."data_import_runs" ADD CONSTRAINT "data_import_runs_data_source_id_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "career"."data_sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."education" ADD CONSTRAINT "education_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."experiences" ADD CONSTRAINT "experiences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."external_mappings" ADD CONSTRAINT "external_mappings_data_source_id_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "career"."data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."interests" ADD CONSTRAINT "interests_data_source_id_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "career"."data_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."interview_answers" ADD CONSTRAINT "interview_answers_question_id_interview_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "app"."interview_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."interview_questions" ADD CONSTRAINT "interview_questions_session_id_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "app"."interview_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."interview_sessions" ADD CONSTRAINT "interview_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."interview_sessions" ADD CONSTRAINT "interview_sessions_target_occupation_id_occupations_id_fk" FOREIGN KEY ("target_occupation_id") REFERENCES "career"."occupations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."interview_sessions" ADD CONSTRAINT "interview_sessions_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "career"."jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."job_skills" ADD CONSTRAINT "job_skills_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "career"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."job_skills" ADD CONSTRAINT "job_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "career"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."jobs" ADD CONSTRAINT "jobs_occupation_id_occupations_id_fk" FOREIGN KEY ("occupation_id") REFERENCES "career"."occupations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."knowledge_areas" ADD CONSTRAINT "knowledge_areas_data_source_id_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "career"."data_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."motivation_letters" ADD CONSTRAINT "motivation_letters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."motivation_letters" ADD CONSTRAINT "motivation_letters_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "career"."jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."occupation_abilities" ADD CONSTRAINT "occupation_abilities_occupation_id_occupations_id_fk" FOREIGN KEY ("occupation_id") REFERENCES "career"."occupations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."occupation_abilities" ADD CONSTRAINT "occupation_abilities_ability_id_abilities_id_fk" FOREIGN KEY ("ability_id") REFERENCES "career"."abilities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."occupation_abilities" ADD CONSTRAINT "occupation_abilities_data_source_id_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "career"."data_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."occupation_interests" ADD CONSTRAINT "occupation_interests_occupation_id_occupations_id_fk" FOREIGN KEY ("occupation_id") REFERENCES "career"."occupations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."occupation_interests" ADD CONSTRAINT "occupation_interests_interest_id_interests_id_fk" FOREIGN KEY ("interest_id") REFERENCES "career"."interests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."occupation_interests" ADD CONSTRAINT "occupation_interests_data_source_id_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "career"."data_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."occupation_knowledge" ADD CONSTRAINT "occupation_knowledge_occupation_id_occupations_id_fk" FOREIGN KEY ("occupation_id") REFERENCES "career"."occupations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."occupation_knowledge" ADD CONSTRAINT "occupation_knowledge_knowledge_area_id_knowledge_areas_id_fk" FOREIGN KEY ("knowledge_area_id") REFERENCES "career"."knowledge_areas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."occupation_knowledge" ADD CONSTRAINT "occupation_knowledge_data_source_id_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "career"."data_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."occupation_skills" ADD CONSTRAINT "occupation_skills_occupation_id_occupations_id_fk" FOREIGN KEY ("occupation_id") REFERENCES "career"."occupations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."occupation_skills" ADD CONSTRAINT "occupation_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "career"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."occupation_skills" ADD CONSTRAINT "occupation_skills_data_source_id_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "career"."data_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."occupation_technologies" ADD CONSTRAINT "occupation_technologies_occupation_id_occupations_id_fk" FOREIGN KEY ("occupation_id") REFERENCES "career"."occupations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."occupation_technologies" ADD CONSTRAINT "occupation_technologies_technology_id_technologies_id_fk" FOREIGN KEY ("technology_id") REFERENCES "career"."technologies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."occupation_technologies" ADD CONSTRAINT "occupation_technologies_data_source_id_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "career"."data_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."occupations" ADD CONSTRAINT "occupations_data_source_id_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "career"."data_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."project_skills" ADD CONSTRAINT "project_skills_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "app"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."project_skills" ADD CONSTRAINT "project_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "career"."skills"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."resume_education" ADD CONSTRAINT "resume_education_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "app"."resumes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."resume_education" ADD CONSTRAINT "resume_education_education_id_education_id_fk" FOREIGN KEY ("education_id") REFERENCES "app"."education"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."resume_experiences" ADD CONSTRAINT "resume_experiences_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "app"."resumes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."resume_experiences" ADD CONSTRAINT "resume_experiences_experience_id_experiences_id_fk" FOREIGN KEY ("experience_id") REFERENCES "app"."experiences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."resume_projects" ADD CONSTRAINT "resume_projects_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "app"."resumes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."resume_projects" ADD CONSTRAINT "resume_projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "app"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."resume_skills" ADD CONSTRAINT "resume_skills_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "app"."resumes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."resume_skills" ADD CONSTRAINT "resume_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "career"."skills"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."resumes" ADD CONSTRAINT "resumes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."resumes" ADD CONSTRAINT "resumes_target_occupation_id_occupations_id_fk" FOREIGN KEY ("target_occupation_id") REFERENCES "career"."occupations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."saved_jobs" ADD CONSTRAINT "saved_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."saved_jobs" ADD CONSTRAINT "saved_jobs_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "career"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."skill_aliases" ADD CONSTRAINT "skill_aliases_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "career"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."skill_aliases" ADD CONSTRAINT "skill_aliases_data_source_id_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "career"."data_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."skills" ADD CONSTRAINT "skills_primary_data_source_id_data_sources_id_fk" FOREIGN KEY ("primary_data_source_id") REFERENCES "career"."data_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career"."technologies" ADD CONSTRAINT "technologies_data_source_id_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "career"."data_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."user_interests" ADD CONSTRAINT "user_interests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."user_interests" ADD CONSTRAINT "user_interests_interest_id_interests_id_fk" FOREIGN KEY ("interest_id") REFERENCES "career"."interests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."user_skills" ADD CONSTRAINT "user_skills_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."user_skills" ADD CONSTRAINT "user_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "career"."skills"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."user_target_occupations" ADD CONSTRAINT "user_target_occupations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."user_target_occupations" ADD CONSTRAINT "user_target_occupations_occupation_id_occupations_id_fk" FOREIGN KEY ("occupation_id") REFERENCES "career"."occupations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "abilities_normalized_name_uidx" ON "career"."abilities" USING btree ("normalized_name");--> statement-breakpoint
CREATE UNIQUE INDEX "abilities_source_external_uidx" ON "career"."abilities" USING btree ("data_source_id","external_id");--> statement-breakpoint
CREATE INDEX "certifications_user_idx" ON "app"."certifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "data_import_runs_source_idx" ON "career"."data_import_runs" USING btree ("data_source_id","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "data_sources_name_version_uidx" ON "career"."data_sources" USING btree ("name","version");--> statement-breakpoint
CREATE INDEX "education_user_idx" ON "app"."education" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "experiences_user_idx" ON "app"."experiences" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "external_mappings_source_id_uidx" ON "career"."external_mappings" USING btree ("entity_type","data_source_id","external_id");--> statement-breakpoint
CREATE INDEX "external_mappings_entity_idx" ON "career"."external_mappings" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "interests_normalized_name_uidx" ON "career"."interests" USING btree ("normalized_name");--> statement-breakpoint
CREATE UNIQUE INDEX "interests_source_external_uidx" ON "career"."interests" USING btree ("data_source_id","external_id");--> statement-breakpoint
CREATE UNIQUE INDEX "interview_answers_question_uidx" ON "app"."interview_answers" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "interview_questions_session_idx" ON "app"."interview_questions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "interview_sessions_user_idx" ON "app"."interview_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "job_skills_skill_idx" ON "career"."job_skills" USING btree ("skill_id");--> statement-breakpoint
CREATE UNIQUE INDEX "jobs_source_external_uidx" ON "career"."jobs" USING btree ("source","external_id");--> statement-breakpoint
CREATE INDEX "jobs_title_idx" ON "career"."jobs" USING btree ("title");--> statement-breakpoint
CREATE INDEX "jobs_occupation_idx" ON "career"."jobs" USING btree ("occupation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "knowledge_areas_normalized_name_uidx" ON "career"."knowledge_areas" USING btree ("normalized_name");--> statement-breakpoint
CREATE UNIQUE INDEX "knowledge_areas_source_external_uidx" ON "career"."knowledge_areas" USING btree ("data_source_id","external_id");--> statement-breakpoint
CREATE INDEX "motivation_letters_user_idx" ON "app"."motivation_letters" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "occupation_abilities_ability_idx" ON "career"."occupation_abilities" USING btree ("ability_id");--> statement-breakpoint
CREATE INDEX "occupation_interests_interest_idx" ON "career"."occupation_interests" USING btree ("interest_id");--> statement-breakpoint
CREATE INDEX "occupation_knowledge_area_idx" ON "career"."occupation_knowledge" USING btree ("knowledge_area_id");--> statement-breakpoint
CREATE UNIQUE INDEX "occupation_skills_relation_uidx" ON "career"."occupation_skills" USING btree ("occupation_id","skill_id","data_source_id");--> statement-breakpoint
CREATE INDEX "occupation_skills_occupation_idx" ON "career"."occupation_skills" USING btree ("occupation_id");--> statement-breakpoint
CREATE INDEX "occupation_skills_skill_idx" ON "career"."occupation_skills" USING btree ("skill_id");--> statement-breakpoint
CREATE INDEX "occupation_technologies_technology_idx" ON "career"."occupation_technologies" USING btree ("technology_id");--> statement-breakpoint
CREATE UNIQUE INDEX "occupations_source_external_uidx" ON "career"."occupations" USING btree ("data_source_id","external_id");--> statement-breakpoint
CREATE INDEX "occupations_title_idx" ON "career"."occupations" USING btree ("title");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_user_uidx" ON "app"."profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "project_skills_skill_idx" ON "app"."project_skills" USING btree ("skill_id");--> statement-breakpoint
CREATE INDEX "projects_user_idx" ON "app"."projects" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "resumes_user_idx" ON "app"."resumes" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "skill_aliases_value_locale_uidx" ON "career"."skill_aliases" USING btree ("normalized_alias","locale");--> statement-breakpoint
CREATE INDEX "skill_aliases_skill_idx" ON "career"."skill_aliases" USING btree ("skill_id");--> statement-breakpoint
CREATE UNIQUE INDEX "skills_normalized_name_uidx" ON "career"."skills" USING btree ("normalized_name");--> statement-breakpoint
CREATE UNIQUE INDEX "skills_source_external_uidx" ON "career"."skills" USING btree ("primary_data_source_id","external_id");--> statement-breakpoint
CREATE INDEX "skills_name_idx" ON "career"."skills" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "technologies_normalized_name_uidx" ON "career"."technologies" USING btree ("normalized_name");--> statement-breakpoint
CREATE UNIQUE INDEX "technologies_source_external_uidx" ON "career"."technologies" USING btree ("data_source_id","external_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_skills_user_skill_uidx" ON "app"."user_skills" USING btree ("user_id","skill_id");--> statement-breakpoint
CREATE INDEX "user_skills_user_idx" ON "app"."user_skills" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uidx" ON "app"."users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_auth_identity_uidx" ON "app"."users" USING btree ("auth_provider","auth_subject");