import type {
  CareerCompatibility,
  DeterministicJobMatch,
  EducationInput,
  ExperienceInput,
  InterviewFeedbackRequest,
  InterviewFeedbackResponse,
  InterviewPlanRequest,
  InterviewPlanResponse,
  PaginationQuery,
  ProfileUpdate,
  ProjectInput,
  UserInterestCreate,
  UserSkillCreate,
  UserSkillUpdate,
} from '@careermate/contracts';
import { and, asc, count, desc, eq, ilike, inArray, sql } from 'drizzle-orm';
import type { VerifiedIdentity } from '../auth/auth-verifier.js';
import type { Database } from '../db/client.js';
import {
  abilities,
  education,
  experiences,
  interests,
  interviewAnswers,
  interviewQuestions,
  interviewSessions,
  jobSkills,
  jobs,
  knowledgeAreas,
  occupationAbilities,
  occupationInterests,
  occupationKnowledge,
  occupationSkills,
  occupations,
  occupationTechnologies,
  profiles,
  projects,
  projectSkills,
  skills,
  technologies,
  userInterests,
  users,
  userSkills,
} from '../db/schema.js';
import { MATCHING_CONFIG, MATCHING_DISCLAIMER } from '../domain/matching-config.js';
import type { AuthenticatedUser, CareerRepository, Paginated } from './career-repository.js';

function searchPattern(value: string): string {
  return `%${value.trim().replace(/[\\%_]/g, '\\$&')}%`;
}

function toIso(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

export class PostgresCareerRepository implements CareerRepository {
  constructor(private readonly db: Database) {}

  async ensureUser(identity: VerifiedIdentity): Promise<AuthenticatedUser> {
    const values = identity.provider === 'development'
      ? {
          id: identity.subject,
          email: identity.email.toLowerCase(),
          authProvider: identity.provider,
          authSubject: identity.subject,
        }
      : {
          email: identity.email.toLowerCase(),
          authProvider: identity.provider,
          authSubject: identity.subject,
        };

    const [user] = await this.db
      .insert(users)
      .values(values)
      .onConflictDoUpdate({
        target: [users.authProvider, users.authSubject],
        set: { email: identity.email.toLowerCase(), updatedAt: new Date() },
      })
      .returning({ id: users.id, email: users.email });

    if (!user) {
      throw new Error('Failed to resolve authenticated user.');
    }

    return user;
  }

  async createInterviewSession(
    userId: string,
    input: InterviewPlanRequest,
    plan: InterviewPlanResponse,
  ): Promise<{ sessionId: string; questionIds: string[] }> {
    const difficulty = input.seniority === 'intern' || input.seniority === 'junior'
      ? 'beginner'
      : input.seniority === 'mid'
        ? 'intermediate'
        : 'advanced';

    return this.db.transaction(async (transaction) => {
      const [session] = await transaction.insert(interviewSessions).values({
        userId,
        mode: 'practice',
        difficulty,
      }).returning({ id: interviewSessions.id });

      if (!session) throw new Error('Failed to create interview session.');

      const questions = await transaction.insert(interviewQuestions).values(
        plan.questions.map((question, position) => ({
          sessionId: session.id,
          question: question.question,
          questionType: question.type === 'case' ? 'case_study' as const : question.type,
          rubric: {
            answerOutline: question.answerOutline,
            evaluationCriteria: question.evaluationCriteria,
            targetRole: input.targetRole,
            seniority: input.seniority,
          },
          position,
        })),
      ).returning({ id: interviewQuestions.id });

      return { sessionId: session.id, questionIds: questions.map((question) => question.id) };
    });
  }

  async saveInterviewAnswer(
    userId: string,
    input: InterviewFeedbackRequest,
    feedback: InterviewFeedbackResponse,
  ): Promise<boolean> {
    if (!input.sessionId || !input.questionId) return false;

    const [ownedQuestion] = await this.db.select({ id: interviewQuestions.id })
      .from(interviewQuestions)
      .innerJoin(interviewSessions, eq(interviewQuestions.sessionId, interviewSessions.id))
      .where(and(
        eq(interviewQuestions.id, input.questionId),
        eq(interviewSessions.id, input.sessionId),
        eq(interviewSessions.userId, userId),
      ))
      .limit(1);

    if (!ownedQuestion) return false;

    await this.db.insert(interviewAnswers).values({
      questionId: input.questionId,
      answer: input.answer,
      feedback: JSON.stringify(feedback),
      score: feedback.score,
    }).onConflictDoUpdate({
      target: interviewAnswers.questionId,
      set: {
        answer: input.answer,
        feedback: JSON.stringify(feedback),
        score: feedback.score,
        updatedAt: new Date(),
      },
    });

    return true;
  }

  async listSkills(query: PaginationQuery): Promise<Paginated<unknown>> {
    const condition = query.q ? ilike(skills.name, searchPattern(query.q)) : undefined;
    const [items, totalRows] = await Promise.all([
      this.db
        .select({
          id: skills.id,
          name: skills.name,
          description: skills.description,
          category: skills.category,
          kind: skills.kind,
        })
        .from(skills)
        .where(condition)
        .orderBy(asc(skills.name))
        .limit(query.limit)
        .offset(query.offset),
      this.db.select({ value: count() }).from(skills).where(condition),
    ]);

    return { items, total: totalRows[0]?.value ?? 0, limit: query.limit, offset: query.offset };
  }

  async listOccupations(query: PaginationQuery): Promise<Paginated<unknown>> {
    const condition = query.q ? ilike(occupations.title, searchPattern(query.q)) : undefined;
    const selection = {
      id: occupations.id,
      title: occupations.title,
      description: occupations.description,
      careerCluster: occupations.careerCluster,
      educationLevel: occupations.educationLevel,
      jobZone: occupations.jobZone,
      externalId: occupations.externalId,
    };
    const [items, totalRows] = await Promise.all([
      this.db.select(selection).from(occupations).where(condition).orderBy(asc(occupations.title)).limit(query.limit).offset(query.offset),
      this.db.select({ value: count() }).from(occupations).where(condition),
    ]);

    return { items, total: totalRows[0]?.value ?? 0, limit: query.limit, offset: query.offset };
  }

  async getOccupation(occupationId: string): Promise<unknown | null> {
    const [occupation] = await this.db.select({
      id: occupations.id,
      title: occupations.title,
      description: occupations.description,
      careerCluster: occupations.careerCluster,
      educationLevel: occupations.educationLevel,
      jobZone: occupations.jobZone,
      externalId: occupations.externalId,
    }).from(occupations).where(eq(occupations.id, occupationId)).limit(1);

    if (!occupation) return null;

    const [skillRows, interestRows, knowledgeRows, abilityRows, technologyRows] = await Promise.all([
      this.db.select({
        id: skills.id,
        name: skills.name,
        importance: occupationSkills.importance,
        level: occupationSkills.level,
        requirementType: occupationSkills.requirementType,
      }).from(occupationSkills).innerJoin(skills, eq(occupationSkills.skillId, skills.id))
        .where(eq(occupationSkills.occupationId, occupationId)).orderBy(desc(occupationSkills.importance)),
      this.db.select({ id: interests.id, name: interests.name, score: occupationInterests.score })
        .from(occupationInterests).innerJoin(interests, eq(occupationInterests.interestId, interests.id))
        .where(eq(occupationInterests.occupationId, occupationId)).orderBy(desc(occupationInterests.score)),
      this.db.select({
        id: knowledgeAreas.id,
        name: knowledgeAreas.name,
        importance: occupationKnowledge.importance,
        level: occupationKnowledge.level,
      }).from(occupationKnowledge).innerJoin(knowledgeAreas, eq(occupationKnowledge.knowledgeAreaId, knowledgeAreas.id))
        .where(eq(occupationKnowledge.occupationId, occupationId)).orderBy(desc(occupationKnowledge.importance)),
      this.db.select({
        id: abilities.id,
        name: abilities.name,
        importance: occupationAbilities.importance,
        level: occupationAbilities.level,
      }).from(occupationAbilities).innerJoin(abilities, eq(occupationAbilities.abilityId, abilities.id))
        .where(eq(occupationAbilities.occupationId, occupationId)).orderBy(desc(occupationAbilities.importance)),
      this.db.select({ id: technologies.id, name: technologies.name, importance: occupationTechnologies.importance })
        .from(occupationTechnologies).innerJoin(technologies, eq(occupationTechnologies.technologyId, technologies.id))
        .where(eq(occupationTechnologies.occupationId, occupationId)).orderBy(desc(occupationTechnologies.importance)),
    ]);

    return {
      ...occupation,
      skills: skillRows,
      interests: interestRows,
      knowledge: knowledgeRows,
      abilities: abilityRows,
      technologies: technologyRows,
    };
  }

  async listJobs(query: PaginationQuery): Promise<Paginated<unknown>> {
    const condition = query.q ? ilike(jobs.title, searchPattern(query.q)) : undefined;
    const selection = {
      id: jobs.id,
      title: jobs.title,
      companyName: jobs.companyName,
      description: jobs.description,
      location: jobs.location,
      workMode: jobs.workMode,
      employmentType: jobs.employmentType,
      experienceLevel: jobs.experienceLevel,
      minimumYearsExperience: jobs.minimumYearsExperience,
      isSynthetic: jobs.isSynthetic,
      publishedAt: jobs.publishedAt,
      expiresAt: jobs.expiresAt,
    };
    const [rows, totalRows] = await Promise.all([
      this.db.select(selection).from(jobs).where(condition).orderBy(desc(jobs.publishedAt), asc(jobs.title)).limit(query.limit).offset(query.offset),
      this.db.select({ value: count() }).from(jobs).where(condition),
    ]);

    return {
      items: rows.map((row) => ({ ...row, publishedAt: toIso(row.publishedAt), expiresAt: toIso(row.expiresAt) })),
      total: totalRows[0]?.value ?? 0,
      limit: query.limit,
      offset: query.offset,
    };
  }

  async getJob(jobId: string): Promise<unknown | null> {
    const [job] = await this.db.select({
      id: jobs.id,
      title: jobs.title,
      companyName: jobs.companyName,
      description: jobs.description,
      location: jobs.location,
      workMode: jobs.workMode,
      employmentType: jobs.employmentType,
      experienceLevel: jobs.experienceLevel,
      minimumYearsExperience: jobs.minimumYearsExperience,
      isSynthetic: jobs.isSynthetic,
      publishedAt: jobs.publishedAt,
      expiresAt: jobs.expiresAt,
    }).from(jobs).where(eq(jobs.id, jobId)).limit(1);
    if (!job) return null;

    const skillRows = await this.db.select({
      id: skills.id,
      name: skills.name,
      requirementType: jobSkills.requirementType,
      importance: jobSkills.importance,
    }).from(jobSkills).innerJoin(skills, eq(jobSkills.skillId, skills.id))
      .where(eq(jobSkills.jobId, jobId)).orderBy(desc(jobSkills.importance));

    return { ...job, publishedAt: toIso(job.publishedAt), expiresAt: toIso(job.expiresAt), skills: skillRows };
  }

  async getProfile(userId: string): Promise<unknown | null> {
    return (await this.db.select({
      id: profiles.id,
      userId: profiles.userId,
      fullName: profiles.fullName,
      headline: profiles.headline,
      bio: profiles.bio,
      location: profiles.location,
      educationLevel: profiles.educationLevel,
      preferredWorkMode: profiles.preferredWorkMode,
    }).from(profiles).where(eq(profiles.userId, userId)).limit(1))[0] ?? null;
  }

  async upsertProfile(userId: string, input: ProfileUpdate): Promise<unknown> {
    const [profile] = await this.db.insert(profiles).values({
      userId,
      fullName: input.fullName,
      headline: input.headline ?? null,
      bio: input.bio ?? null,
      location: input.location ?? null,
      educationLevel: input.educationLevel ?? null,
      preferredWorkMode: input.preferredWorkMode ?? null,
    }).onConflictDoUpdate({
      target: profiles.userId,
      set: {
        fullName: input.fullName,
        headline: input.headline ?? null,
        bio: input.bio ?? null,
        location: input.location ?? null,
        educationLevel: input.educationLevel ?? null,
        preferredWorkMode: input.preferredWorkMode ?? null,
        updatedAt: new Date(),
      },
    }).returning({
      id: profiles.id,
      userId: profiles.userId,
      fullName: profiles.fullName,
      headline: profiles.headline,
      bio: profiles.bio,
      location: profiles.location,
      educationLevel: profiles.educationLevel,
      preferredWorkMode: profiles.preferredWorkMode,
    });
    return profile!;
  }

  async listUserSkills(userId: string): Promise<unknown[]> {
    return this.db.select({
      id: userSkills.id,
      skillId: userSkills.skillId,
      name: skills.name,
      proficiencyLevel: userSkills.proficiencyLevel,
      yearsExperience: userSkills.yearsExperience,
      source: userSkills.source,
    }).from(userSkills).innerJoin(skills, eq(userSkills.skillId, skills.id))
      .where(eq(userSkills.userId, userId)).orderBy(asc(skills.name));
  }

  async addUserSkill(userId: string, input: UserSkillCreate): Promise<unknown> {
    const [row] = await this.db.insert(userSkills).values({
      userId,
      skillId: input.skillId,
      proficiencyLevel: input.proficiencyLevel,
      yearsExperience: input.yearsExperience ?? null,
      source: input.source,
    }).onConflictDoUpdate({
      target: [userSkills.userId, userSkills.skillId],
      set: {
        proficiencyLevel: input.proficiencyLevel,
        yearsExperience: input.yearsExperience ?? null,
        source: input.source,
        updatedAt: new Date(),
      },
    }).returning({ id: userSkills.id });
    const list = await this.listUserSkills(userId);
    return list.find((item) => (item as { id: string }).id === row!.id)!;
  }

  async updateUserSkill(userId: string, userSkillId: string, input: UserSkillUpdate): Promise<unknown | null> {
    const changes: Partial<typeof userSkills.$inferInsert> = { updatedAt: new Date() };
    if (input.proficiencyLevel !== undefined) changes.proficiencyLevel = input.proficiencyLevel;
    if (input.yearsExperience !== undefined) changes.yearsExperience = input.yearsExperience;
    if (input.source !== undefined) changes.source = input.source;
    const [updated] = await this.db.update(userSkills).set(changes)
      .where(and(eq(userSkills.id, userSkillId), eq(userSkills.userId, userId)))
      .returning({ id: userSkills.id });
    if (!updated) return null;
    const list = await this.listUserSkills(userId);
    return list.find((item) => (item as { id: string }).id === updated.id) ?? null;
  }

  async deleteUserSkill(userId: string, userSkillId: string): Promise<boolean> {
    const deleted = await this.db.delete(userSkills)
      .where(and(eq(userSkills.id, userSkillId), eq(userSkills.userId, userId)))
      .returning({ id: userSkills.id });
    return deleted.length > 0;
  }

  async listUserInterests(userId: string): Promise<unknown[]> {
    return this.db.select({
      interestId: userInterests.interestId,
      name: interests.name,
      interestLevel: userInterests.interestLevel,
    }).from(userInterests).innerJoin(interests, eq(userInterests.interestId, interests.id))
      .where(eq(userInterests.userId, userId)).orderBy(asc(interests.name));
  }

  async addUserInterest(userId: string, input: UserInterestCreate): Promise<unknown> {
    await this.db.insert(userInterests).values({ userId, ...input }).onConflictDoUpdate({
      target: [userInterests.userId, userInterests.interestId],
      set: { interestLevel: input.interestLevel, updatedAt: new Date() },
    });
    const list = await this.listUserInterests(userId);
    return list.find((item) => (item as { interestId: string }).interestId === input.interestId)!;
  }

  async listEducation(userId: string): Promise<unknown[]> {
    return this.db.select({
      id: education.id,
      institution: education.institution,
      fieldOfStudy: education.fieldOfStudy,
      degree: education.degree,
      startDate: education.startDate,
      endDate: education.endDate,
      description: education.description,
    }).from(education).where(eq(education.userId, userId)).orderBy(desc(education.startDate));
  }

  async addEducation(userId: string, input: EducationInput): Promise<unknown> {
    const [row] = await this.db.insert(education).values({
      userId,
      institution: input.institution,
      fieldOfStudy: input.fieldOfStudy ?? null,
      degree: input.degree ?? null,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      description: input.description ?? null,
    }).returning();
    return row!;
  }

  async listExperiences(userId: string): Promise<unknown[]> {
    return this.db.select({
      id: experiences.id,
      organization: experiences.organization,
      role: experiences.role,
      startDate: experiences.startDate,
      endDate: experiences.endDate,
      description: experiences.description,
    }).from(experiences).where(eq(experiences.userId, userId)).orderBy(desc(experiences.startDate));
  }

  async addExperience(userId: string, input: ExperienceInput): Promise<unknown> {
    const [row] = await this.db.insert(experiences).values({
      userId,
      organization: input.organization,
      role: input.role,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      description: input.description ?? null,
    }).returning();
    return row!;
  }

  async listProjects(userId: string): Promise<unknown[]> {
    const rows = await this.db.select({
      id: projects.id,
      title: projects.title,
      description: projects.description,
      repositoryUrl: projects.repositoryUrl,
      projectUrl: projects.projectUrl,
      startDate: projects.startDate,
      endDate: projects.endDate,
    }).from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.startDate));
    if (rows.length === 0) return [];

    const relations = await this.db.select({ projectId: projectSkills.projectId, skillId: skills.id, name: skills.name })
      .from(projectSkills).innerJoin(skills, eq(projectSkills.skillId, skills.id))
      .where(inArray(projectSkills.projectId, rows.map((row) => row.id)));
    return rows.map((row) => ({
      ...row,
      skillIds: relations.filter((relation) => relation.projectId === row.id).map((relation) => relation.skillId),
      skills: relations.filter((relation) => relation.projectId === row.id).map((relation) => relation.name),
    }));
  }

  async addProject(userId: string, input: ProjectInput): Promise<unknown> {
    const projectId = await this.db.transaction(async (transaction) => {
      const [row] = await transaction.insert(projects).values({
        userId,
        title: input.title,
        description: input.description ?? null,
        repositoryUrl: input.repositoryUrl ?? null,
        projectUrl: input.projectUrl ?? null,
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null,
      }).returning({ id: projects.id });
      if (input.skillIds.length > 0) {
        await transaction.insert(projectSkills).values(input.skillIds.map((skillId) => ({ projectId: row!.id, skillId })));
      }
      return row!.id;
    });
    return (await this.listProjects(userId)).find((item) => (item as { id: string }).id === projectId)!;
  }

  async getCareerRecommendations(userId: string, limit: number): Promise<CareerCompatibility[]> {
    type Row = {
      occupationId: string;
      title: string;
      skillMatch: number;
      interestMatch: number;
      educationAlignment: number;
      compatibility: number;
      matchedSkills: string[] | null;
      missingSkills: string[] | null;
      matchedInterests: string[] | null;
    };

    const result = await this.db.execute<Row>(sql`
      with user_education as (
        select case lower(coalesce(p.education_level, ''))
          when 'secondary' then 1.0 when 'vocational' then 2.0 when 'associate' then 2.0
          when 'bachelor' then 3.0 when 'master' then 4.0 when 'doctorate' then 5.0
          else null end as rank
        from app.users u left join app.profiles p on p.user_id = u.id where u.id = ${userId}
      ), skill_scores as (
        select os.occupation_id,
          coalesce(sum(coalesce(os.importance, 50)) filter (where us.user_id is not null), 0)
            / nullif(sum(coalesce(os.importance, 50)), 0) as skill_match,
          array_agg(distinct s.name order by s.name) filter (where us.user_id is not null) as matched_skills,
          array_agg(distinct s.name order by s.name) filter (where us.user_id is null) as missing_skills
        from career.occupation_skills os
        join career.skills s on s.id = os.skill_id
        left join app.user_skills us on us.skill_id = os.skill_id and us.user_id = ${userId}
        group by os.occupation_id
      ), interest_scores as (
        select oi.occupation_id,
          coalesce(sum(oi.score * (ui.interest_level / 5.0)) filter (where ui.user_id is not null), 0)
            / nullif(sum(oi.score), 0) as interest_match,
          array_agg(distinct i.name order by i.name) filter (where ui.user_id is not null) as matched_interests
        from career.occupation_interests oi
        join career.interests i on i.id = oi.interest_id
        left join app.user_interests ui on ui.interest_id = oi.interest_id and ui.user_id = ${userId}
        group by oi.occupation_id
      ), ranked as (
        select o.id as occupation_id, o.title,
          least(1.0, greatest(0.0, coalesce(ss.skill_match, 0))) as skill_match,
          least(1.0, greatest(0.0, coalesce(ins.interest_match, 0))) as interest_match,
          case when ue.rank is null or o.job_zone is null then 0.5
            else least(1.0, ue.rank / greatest(o.job_zone, 1)) end as education_alignment,
          ss.matched_skills, ss.missing_skills, ins.matched_interests
        from career.occupations o
        join skill_scores ss on ss.occupation_id = o.id
        left join interest_scores ins on ins.occupation_id = o.id
        cross join user_education ue
      )
      select occupation_id as "occupationId", title,
        skill_match::float8 as "skillMatch",
        interest_match::float8 as "interestMatch",
        education_alignment::float8 as "educationAlignment",
        (skill_match * ${MATCHING_CONFIG.career.skillWeight}
          + interest_match * ${MATCHING_CONFIG.career.interestWeight}
          + education_alignment * ${MATCHING_CONFIG.career.educationWeight})::float8 as compatibility,
        matched_skills as "matchedSkills", missing_skills as "missingSkills",
        matched_interests as "matchedInterests"
      from ranked
      order by compatibility desc, title asc
      limit ${limit}
    `);

    return result.rows.map((row) => ({
      occupationId: row.occupationId,
      title: row.title,
      compatibility: row.compatibility,
      components: {
        skillMatch: row.skillMatch,
        interestMatch: row.interestMatch,
        educationAlignment: row.educationAlignment,
      },
      matchedSkills: row.matchedSkills ?? [],
      missingSkills: row.missingSkills ?? [],
      matchedInterests: row.matchedInterests ?? [],
      disclaimer: MATCHING_DISCLAIMER,
    }));
  }

  async getJobMatch(userId: string, jobId: string): Promise<DeterministicJobMatch | null> {
    type Row = {
      jobId: string;
      requiredSkills: number;
      preferredSkills: number;
      experience: number;
      matchScore: number;
      matchedRequiredSkills: string[] | null;
      missingRequiredSkills: string[] | null;
      matchedPreferredSkills: string[] | null;
    };
    const result = await this.db.execute<Row>(sql`
      with target_job as (
        select * from career.jobs where id = ${jobId}
      ), user_experience as (
        select coalesce(max(years_experience), 0) as years from app.user_skills where user_id = ${userId}
      ), skill_score as (
        select
          coalesce(sum(js.importance) filter (where js.requirement_type = 'required' and us.user_id is not null), 0)
            / nullif(sum(js.importance) filter (where js.requirement_type = 'required'), 0) as required_score,
          coalesce(sum(js.importance) filter (where js.requirement_type = 'preferred' and us.user_id is not null), 0)
            / nullif(sum(js.importance) filter (where js.requirement_type = 'preferred'), 0) as preferred_score,
          array_agg(distinct s.name order by s.name) filter (where js.requirement_type = 'required' and us.user_id is not null) as matched_required,
          array_agg(distinct s.name order by s.name) filter (where js.requirement_type = 'required' and us.user_id is null) as missing_required,
          array_agg(distinct s.name order by s.name) filter (where js.requirement_type = 'preferred' and us.user_id is not null) as matched_preferred
        from career.job_skills js join career.skills s on s.id = js.skill_id
        left join app.user_skills us on us.skill_id = js.skill_id and us.user_id = ${userId}
        where js.job_id = ${jobId}
      ), components as (
        select tj.id,
          coalesce(ss.required_score, 1.0) as required_score,
          coalesce(ss.preferred_score, 1.0) as preferred_score,
          case when tj.minimum_years_experience is null or tj.minimum_years_experience = 0 then 1.0
            else least(1.0, ue.years / tj.minimum_years_experience) end as experience_score,
          ss.matched_required, ss.missing_required, ss.matched_preferred
        from target_job tj cross join user_experience ue cross join skill_score ss
      )
      select id as "jobId", required_score::float8 as "requiredSkills",
        preferred_score::float8 as "preferredSkills", experience_score::float8 as experience,
        round((required_score * ${MATCHING_CONFIG.job.requiredSkillsWeight}
          + preferred_score * ${MATCHING_CONFIG.job.preferredSkillsWeight}
          + experience_score * ${MATCHING_CONFIG.job.experienceWeight}) * 100)::float8 as "matchScore",
        matched_required as "matchedRequiredSkills", missing_required as "missingRequiredSkills",
        matched_preferred as "matchedPreferredSkills"
      from components
    `);
    const row = result.rows[0];
    if (!row) return null;
    return {
      jobId: row.jobId,
      matchScore: row.matchScore,
      components: { requiredSkills: row.requiredSkills, preferredSkills: row.preferredSkills, experience: row.experience },
      matchedRequiredSkills: row.matchedRequiredSkills ?? [],
      missingRequiredSkills: row.missingRequiredSkills ?? [],
      matchedPreferredSkills: row.matchedPreferredSkills ?? [],
      scoringVersion: MATCHING_CONFIG.version,
      disclaimer: MATCHING_DISCLAIMER,
    };
  }

  async getUserCareerContext(userId: string): Promise<Record<string, unknown>> {
    const [profile, skillsList, interestsList, educationList, experienceList, projectList] = await Promise.all([
      this.getProfile(userId), this.listUserSkills(userId), this.listUserInterests(userId),
      this.listEducation(userId), this.listExperiences(userId), this.listProjects(userId),
    ]);
    return { profile, skills: skillsList, interests: interestsList, education: educationList, experiences: experienceList, projects: projectList };
  }

  async getOccupationContext(occupationId: string): Promise<Record<string, unknown> | null> {
    return await this.getOccupation(occupationId) as Record<string, unknown> | null;
  }

  async getJobMatchContext(userId: string, jobId: string): Promise<Record<string, unknown> | null> {
    const [user, job, match] = await Promise.all([
      this.getUserCareerContext(userId), this.getJob(jobId), this.getJobMatch(userId, jobId),
    ]);
    return job ? { user, job, match } : null;
  }

  async getUserCvContext(userId: string): Promise<Record<string, unknown>> {
    const [profile, skillsList, educationList, experienceList, projectList] = await Promise.all([
      this.getProfile(userId), this.listUserSkills(userId), this.listEducation(userId),
      this.listExperiences(userId), this.listProjects(userId),
    ]);
    return { profile, skills: skillsList, education: educationList, experiences: experienceList, projects: projectList };
  }
}
