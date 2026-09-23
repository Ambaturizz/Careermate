import type {
  CandidateProfile,
  Education,
  Experience,
  Profile,
  UserInterest,
  UserSkill,
} from '@careermate/contracts';
import { careerMateApi } from '@/lib/api-client';

export type CandidateProfileData = {
  profile: Profile;
  skills: Array<Pick<UserSkill, 'name' | 'proficiencyLevel' | 'yearsExperience'>>;
  interests: UserInterest[];
  education: Education[];
  experience: Experience[];
};

const skillLevels = {
  beginner: 1,
  intermediate: 2,
  advanced: 4,
  expert: 5,
} as const;

function experienceYears(experience: Experience[]): number {
  const starts = experience
    .map((item) => item.startDate ? new Date(item.startDate).getTime() : Number.NaN)
    .filter(Number.isFinite);
  if (starts.length === 0) return 0;

  const ends = experience.map((item) => item.endDate ? new Date(item.endDate).getTime() : Date.now());
  const elapsedYears = (Math.max(...ends) - Math.min(...starts)) / (365.25 * 24 * 60 * 60 * 1_000);
  return Math.max(0, Math.round(elapsedYears * 10) / 10);
}

export function buildCandidateProfile(data: CandidateProfileData): CandidateProfile {
  const preferredWorkMode = data.profile.preferredWorkMode;

  return {
    ...(data.profile.headline ? { headline: data.profile.headline } : {}),
    education: data.education.map((item) => [item.degree, item.fieldOfStudy, item.institution].filter(Boolean).join(' — ')),
    experienceYears: experienceYears(data.experience),
    experienceSummary: data.experience.map((item) => `${item.role} di ${item.organization}${item.description ? `: ${item.description}` : ''}`).join('\n'),
    skills: data.skills.map((skill) => ({
      name: skill.name,
      level: skillLevels[skill.proficiencyLevel],
      ...(skill.yearsExperience !== null && skill.yearsExperience !== undefined ? { yearsOfExperience: skill.yearsExperience } : {}),
    })),
    interests: data.interests.map((interest) => interest.name),
    goals: [],
    preferredLocations: data.profile.location ? [data.profile.location] : [],
    preferredWorkModes: preferredWorkMode && preferredWorkMode !== 'flexible' ? [preferredWorkMode] : [],
    languages: [],
  };
}

export async function loadCandidateProfileData(): Promise<CandidateProfileData> {
  const [profile, skills, interests, education, experience] = await Promise.all([
    careerMateApi.getProfile(),
    careerMateApi.listUserSkills(),
    careerMateApi.listUserInterests(),
    careerMateApi.listEducation(),
    careerMateApi.listExperience(),
  ]);

  return {
    profile,
    skills: skills.items,
    interests: interests.items,
    education: education.items,
    experience: experience.items,
  };
}

export async function loadCandidateProfile(): Promise<CandidateProfile> {
  return buildCandidateProfile(await loadCandidateProfileData());
}
