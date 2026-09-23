export const MATCHING_CONFIG = {
  version: 'deterministic-v1',
  career: {
    skillWeight: 0.7,
    interestWeight: 0.2,
    educationWeight: 0.1,
  },
  job: {
    requiredSkillsWeight: 0.7,
    preferredSkillsWeight: 0.2,
    experienceWeight: 0.1,
  },
} as const;

export const MATCHING_DISCLAIMER =
  "This score is an informational compatibility metric based only on supplied career data. It does not determine a person's ideal career or hiring suitability.";

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function calculateCareerCompatibility(input: {
  skillMatch: number;
  interestMatch: number;
  educationAlignment: number;
}): number {
  return clamp(input.skillMatch) * MATCHING_CONFIG.career.skillWeight
    + clamp(input.interestMatch) * MATCHING_CONFIG.career.interestWeight
    + clamp(input.educationAlignment) * MATCHING_CONFIG.career.educationWeight;
}

export function calculateJobMatchScore(input: {
  requiredSkills: number;
  preferredSkills: number;
  experience: number;
}): number {
  return Math.round((
    clamp(input.requiredSkills) * MATCHING_CONFIG.job.requiredSkillsWeight
    + clamp(input.preferredSkills) * MATCHING_CONFIG.job.preferredSkillsWeight
    + clamp(input.experience) * MATCHING_CONFIG.job.experienceWeight
  ) * 100);
}
