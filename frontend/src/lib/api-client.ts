import {
  careerRecommendationRequestSchema,
  careerRecommendationResponseSchema,
  deterministicCareerResponseSchema,
  deterministicJobMatchSchema,
  documentGenerateRequestSchema,
  documentGenerateResponseSchema,
  documentReviewRequestSchema,
  documentReviewResponseSchema,
  educationInputSchema,
  educationSchema,
  educationResponseSchema,
  experienceInputSchema,
  experienceSchema,
  experienceResponseSchema,
  interviewFeedbackRequestSchema,
  interviewFeedbackResponseSchema,
  interviewPlanRequestSchema,
  interviewPlanResponseSchema,
  jobDetailSchema,
  jobMatchRequestSchema,
  jobMatchResponseSchema,
  occupationDetailSchema,
  paginatedJobsSchema,
  paginatedOccupationsSchema,
  paginatedReferenceSkillsSchema,
  profileSchema,
  profileUpdateSchema,
  projectInputSchema,
  projectSchema,
  projectsResponseSchema,
  userInterestCreateSchema,
  userInterestSchema,
  userInterestsResponseSchema,
  userSkillCreateSchema,
  userSkillSchema,
  userSkillUpdateSchema,
  userSkillsResponseSchema,
  type CareerRecommendationRequest,
  type DocumentGenerateRequest,
  type DocumentReviewRequest,
  type EducationInput,
  type ExperienceInput,
  type InterviewFeedbackRequest,
  type InterviewPlanRequest,
  type JobMatchRequest,
  type ProfileUpdate,
  type ProjectInput,
  type UserInterestCreate,
  type UserSkillCreate,
  type UserSkillUpdate,
} from '@careermate/contracts';
import { z } from 'zod';
import { getAccessToken, hasAccessToken, setAccessToken } from '@/lib/auth-session';
import { refreshSession } from '@/lib/auth-client';

const runtimeEnv: Partial<ImportMetaEnv> & { DEV?: boolean } = (import.meta as ImportMeta & { env?: ImportMetaEnv }).env ?? {};
const configuredTimeout = Number(runtimeEnv.VITE_API_TIMEOUT_MS ?? 90_000);
const apiTimeoutMs = Number.isFinite(configuredTimeout) && configuredTimeout >= 1_000
  ? configuredTimeout
  : 90_000;

type AuthHeadersProvider = () => Record<string, string>;

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export { hasAccessToken, setAccessToken };

function browserAuthHeaders(): Record<string, string> {
  if (typeof window !== 'undefined') {
    const accessToken = getAccessToken();
    if (accessToken) return { authorization: `Bearer ${accessToken}` };
  }

  const developmentUserId = runtimeEnv.VITE_AUTH_DEV_USER_ID;
  return runtimeEnv.DEV && developmentUserId
    ? { 'x-careermate-user-id': developmentUserId }
    : {};
}

function queryString(query: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

export class CareerMateApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly authHeaders: AuthHeadersProvider = browserAuthHeaders,
  ) {}

  private async request<Output>(
    path: string,
    outputSchema: z.ZodType<Output>,
    init: RequestInit = {},
    allowRefresh = true,
  ): Promise<Output> {
    const headers = new Headers(init.headers);
    for (const [key, value] of Object.entries(this.authHeaders())) headers.set(key, value);
    if (init.body !== undefined) headers.set('content-type', 'application/json');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), apiTimeoutMs);
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers,
        signal: init.signal ?? controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiClientError(504, 'CLIENT_TIMEOUT', 'Backend terlalu lama merespons. Silakan coba lagi.');
      }
      throw new ApiClientError(503, 'BACKEND_UNREACHABLE', 'Backend CareerMate tidak dapat dijangkau.');
    } finally {
      clearTimeout(timeout);
    }

    const responseText = response.status === 204 ? '' : await response.text();
    let payload: unknown;
    try {
      payload = responseText ? JSON.parse(responseText) : undefined;
    } catch {
      payload = undefined;
    }

    if (response.status === 401 && allowRefresh) {
      const refreshedToken = await refreshSession().catch(() => null);
      if (refreshedToken) return this.request(path, outputSchema, init, false);
    }

    if (!response.ok) {
      const error = payload as { error?: { code?: string; message?: string } };
      throw new ApiClientError(
        response.status,
        error.error?.code ?? 'API_ERROR',
        error.error?.message ?? 'Request failed.',
      );
    }

    if (payload === undefined && response.status !== 204) {
      throw new ApiClientError(502, 'INVALID_API_RESPONSE', 'Backend mengembalikan respons yang tidak valid.');
    }

    return outputSchema.parse(payload);
  }

  private post<Input, Output>(
    path: string,
    inputSchema: z.ZodType<Input>,
    outputSchema: z.ZodType<Output>,
    input: Input,
  ): Promise<Output> {
    return this.request(path, outputSchema, {
      method: 'POST',
      body: JSON.stringify(inputSchema.parse(input)),
    });
  }

  listSkills(query: { q?: string; limit?: number; offset?: number } = {}) {
    return this.request(`/skills${queryString(query)}`, paginatedReferenceSkillsSchema);
  }

  listOccupations(query: { q?: string; limit?: number; offset?: number } = {}) {
    return this.request(`/occupations${queryString(query)}`, paginatedOccupationsSchema);
  }

  getOccupation(id: string) {
    return this.request(`/occupations/${encodeURIComponent(id)}`, occupationDetailSchema);
  }

  listJobs(query: { q?: string; limit?: number; offset?: number } = {}) {
    return this.request(`/jobs${queryString(query)}`, paginatedJobsSchema);
  }

  getJob(id: string) {
    return this.request(`/jobs/${encodeURIComponent(id)}`, jobDetailSchema);
  }

  getProfile() {
    return this.request('/profile', profileSchema);
  }

  updateProfile(input: ProfileUpdate) {
    return this.request('/profile', profileSchema, {
      method: 'PUT',
      body: JSON.stringify(profileUpdateSchema.parse(input)),
    });
  }

  listUserSkills() {
    return this.request('/profile/skills', userSkillsResponseSchema);
  }

  addUserSkill(input: UserSkillCreate) {
    return this.post('/profile/skills', userSkillCreateSchema, userSkillSchema, input);
  }

  updateUserSkill(id: string, input: UserSkillUpdate) {
    return this.request(`/profile/skills/${encodeURIComponent(id)}`, userSkillSchema, {
      method: 'PUT',
      body: JSON.stringify(userSkillUpdateSchema.parse(input)),
    });
  }

  deleteUserSkill(id: string) {
    return this.request(`/profile/skills/${encodeURIComponent(id)}`, z.void(), { method: 'DELETE' });
  }

  listUserInterests() {
    return this.request('/profile/interests', userInterestsResponseSchema);
  }

  addUserInterest(input: UserInterestCreate) {
    return this.post('/profile/interests', userInterestCreateSchema, userInterestSchema, input);
  }

  listEducation() {
    return this.request('/profile/education', educationResponseSchema);
  }

  addEducation(input: EducationInput) {
    return this.post('/profile/education', educationInputSchema, educationSchema, input);
  }

  listExperience() {
    return this.request('/profile/experience', experienceResponseSchema);
  }

  addExperience(input: ExperienceInput) {
    return this.post('/profile/experience', experienceInputSchema, experienceSchema, input);
  }

  listProjects() {
    return this.request('/profile/projects', projectsResponseSchema);
  }

  addProject(input: ProjectInput) {
    return this.post('/profile/projects', projectInputSchema, projectSchema, input);
  }

  getCareerRecommendations(limit = 10) {
    return this.request(`/career/recommendations${queryString({ limit })}`, deterministicCareerResponseSchema);
  }

  matchJob(jobId: string) {
    return this.request(`/jobs/${encodeURIComponent(jobId)}/match`, deterministicJobMatchSchema, {
      method: 'POST',
      body: '{}',
    });
  }

  careerRecommendations(input: CareerRecommendationRequest) {
    return this.post('/career/recommendations', careerRecommendationRequestSchema, careerRecommendationResponseSchema, input);
  }

  matchJobs(input: JobMatchRequest) {
    return this.post('/jobs/match', jobMatchRequestSchema, jobMatchResponseSchema, input);
  }

  createInterviewPlan(input: InterviewPlanRequest) {
    return this.post('/interviews/plan', interviewPlanRequestSchema, interviewPlanResponseSchema, input);
  }

  reviewInterviewAnswer(input: InterviewFeedbackRequest) {
    return this.post('/interviews/feedback', interviewFeedbackRequestSchema, interviewFeedbackResponseSchema, input);
  }

  reviewDocument(input: DocumentReviewRequest) {
    return this.post('/documents/review', documentReviewRequestSchema, documentReviewResponseSchema, input);
  }

  generateDocument(input: DocumentGenerateRequest) {
    return this.post('/documents/generate', documentGenerateRequestSchema, documentGenerateResponseSchema, input);
  }
}

const apiUrl = runtimeEnv.VITE_API_URL ?? '/api/v1';

export const careerMateApi = new CareerMateApiClient(apiUrl.replace(/\/$/, ''));
