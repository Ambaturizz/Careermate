import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateCareerCompatibility,
  calculateJobMatchScore,
  MATCHING_CONFIG,
} from '../src/domain/matching-config.js';

test('career matching uses centralized weighted components', () => {
  assert.ok(Math.abs(MATCHING_CONFIG.career.skillWeight + MATCHING_CONFIG.career.interestWeight + MATCHING_CONFIG.career.educationWeight - 1) < Number.EPSILON);
  assert.ok(Math.abs(calculateCareerCompatibility({ skillMatch: 0.8, interestMatch: 0.5, educationAlignment: 1 }) - 0.76) < Number.EPSILON);
  assert.ok(Math.abs(calculateCareerCompatibility({ skillMatch: 2, interestMatch: -1, educationAlignment: 1 }) - 0.8) < Number.EPSILON);
});

test('job matching returns a rounded percentage', () => {
  assert.ok(Math.abs(MATCHING_CONFIG.job.requiredSkillsWeight + MATCHING_CONFIG.job.preferredSkillsWeight + MATCHING_CONFIG.job.experienceWeight - 1) < Number.EPSILON);
  assert.equal(calculateJobMatchScore({ requiredSkills: 0.8, preferredSkills: 0.5, experience: 1 }), 76);
});
