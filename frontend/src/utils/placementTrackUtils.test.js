import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  getTierBadgeClass,
  getTierLabel,
  isCandidateEligibleForOffer,
  computeReadinessGap,
  filterCompaniesByQuery,
  COMPANY_TIER_CONFIG,
} from './placementTrackUtils.js';

describe('placementTrackUtils — Campus Placement Tracks and Rubrics', () => {
  test('returns correct badge classes and labels for known and unknown company tiers', () => {
    assert.match(getTierBadgeClass('TIER_1_PRODUCT'), /emerald/);
    assert.match(getTierBadgeClass('TIER_2_GROWTH'), /amber/);
    assert.match(getTierBadgeClass('TIER_3_ENTERPRISE'), /blue/);
    assert.match(getTierBadgeClass('UNKNOWN_TIER'), /slate/);

    assert.equal(getTierLabel('TIER_1_PRODUCT'), 'Tier-1 FAANG / Product');
    assert.equal(getTierLabel('UNKNOWN_TIER'), 'Standard Engineering Track');
  });

  test('isCandidateEligibleForOffer accurately evaluates cutoff thresholds', () => {
    assert.equal(isCandidateEligibleForOffer(85.0, 80.0), true);
    assert.equal(isCandidateEligibleForOffer(80.0, 80.0), true);
    assert.equal(isCandidateEligibleForOffer(79.9, 80.0), false);
    assert.equal(isCandidateEligibleForOffer(null, 80.0), false);
    assert.equal(isCandidateEligibleForOffer(85.0, null), false);
  });

  test('computeReadinessGap computes point deficits accurately', () => {
    assert.equal(computeReadinessGap(74.5, 80.0), 5.5);
    assert.equal(computeReadinessGap(85.0, 80.0), 0);
    assert.equal(computeReadinessGap(null, 80.0), 0);
  });

  test('filterCompaniesByQuery filters by company name, role, and topics', () => {
    const list = [
      { companyName: 'Google', targetRole: 'Software Engineer', commonTopics: ['Dynamic Programming', 'Graphs'] },
      { companyName: 'Amazon', targetRole: 'SDE-1', commonTopics: ['Trees', 'Leadership'] },
      { companyName: 'TCS', targetRole: 'Digital Cadre', commonTopics: ['Java', 'SQL'] },
    ];

    assert.equal(filterCompaniesByQuery(list, 'google').length, 1);
    assert.equal(filterCompaniesByQuery(list, 'sde').length, 1);
    assert.equal(filterCompaniesByQuery(list, 'sql').length, 1);
    assert.equal(filterCompaniesByQuery(list, '').length, 3);
    assert.equal(filterCompaniesByQuery(list, 'NonExistent').length, 0);
  });
});
