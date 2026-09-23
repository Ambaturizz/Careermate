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
import type { VerifiedIdentity } from '../auth/auth-verifier.js';

export type AuthenticatedUser = {
  id: string;
  email: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

export interface CareerRepository {
  ensureUser(identity: VerifiedIdentity): Promise<AuthenticatedUser>;
  listSkills(query: PaginationQuery): Promise<Paginated<unknown>>;
  listOccupations(query: PaginationQuery): Promise<Paginated<unknown>>;
  getOccupation(occupationId: string): Promise<unknown | null>;
  listJobs(query: PaginationQuery): Promise<Paginated<unknown>>;
  getJob(jobId: string): Promise<unknown | null>;
  getProfile(userId: string): Promise<unknown | null>;
  upsertProfile(userId: string, input: ProfileUpdate): Promise<unknown>;
  listUserSkills(userId: string): Promise<unknown[]>;
  addUserSkill(userId: string, input: UserSkillCreate): Promise<unknown>;
  updateUserSkill(userId: string, userSkillId: string, input: UserSkillUpdate): Promise<unknown | null>;
  deleteUserSkill(userId: string, userSkillId: string): Promise<boolean>;
  listUserInterests(userId: string): Promise<unknown[]>;
  addUserInterest(userId: string, input: UserInterestCreate): Promise<unknown>;
  listEducation(userId: string): Promise<unknown[]>;
  addEducation(userId: string, input: EducationInput): Promise<unknown>;
  listExperiences(userId: string): Promise<unknown[]>;
  addExperience(userId: string, input: ExperienceInput): Promise<unknown>;
  listProjects(userId: string): Promise<unknown[]>;
  addProject(userId: string, input: ProjectInput): Promise<unknown>;
  getCareerRecommendations(userId: string, limit: number): Promise<CareerCompatibility[]>;
  getJobMatch(userId: string, jobId: string): Promise<DeterministicJobMatch | null>;
  getUserCareerContext(userId: string): Promise<Record<string, unknown>>;
  getOccupationContext(occupationId: string): Promise<Record<string, unknown> | null>;
  getJobMatchContext(userId: string, jobId: string): Promise<Record<string, unknown> | null>;
  getUserCvContext(userId: string): Promise<Record<string, unknown>>;
  createInterviewSession(
    userId: string,
    input: InterviewPlanRequest,
    plan: InterviewPlanResponse,
  ): Promise<{ sessionId: string; questionIds: string[] }>;
  saveInterviewAnswer(
    userId: string,
    input: InterviewFeedbackRequest,
    feedback: InterviewFeedbackResponse,
  ): Promise<boolean>;
}
