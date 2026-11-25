import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePercentile, formatPercentileHeadline, buildCohortBreakdown, buildReadinessActionPlan } from './peerBenchmarkUtils.js';

test('calculatePercentile returns null for invalid scores', () => {
  assert.equal(calculatePercentile(null), null);
  assert.equal(calculatePercentile(undefined), null);
  assert.equal(calculatePercentile('not-a-number'), null);
});

test('calculatePercentile calculates clamped percentiles between 1 and 99', () => {
  const low = calculatePercentile(10, 'overall');
  const mid = calculatePercentile(68, 'overall');
  const high = calculatePercentile(95, 'overall');

  assert.ok(low >= 1 && low <= 20, `Low score 10 should be low percentile, got: ${low}`);
  assert.ok(mid >= 45 && mid <= 55, `Median score 68 should be ~50th percentile, got: ${mid}`);
  assert.ok(high >= 90 && high <= 99, `High score 95 should be top percentile, got: ${high}`);
});

test('formatPercentileHeadline returns appropriate tier badges and descriptions', () => {
  const topTier = formatPercentileHeadline(94, 'Frontend Engineer');
  assert.ok(topTier.badge.includes('Top 6%'));
  assert.ok(topTier.description.includes('Frontend Engineer'));

  const midTier = formatPercentileHeadline(55, 'Backend Engineer');
  assert.ok(midTier.badge.includes('Above Median'));

  const lowTier = formatPercentileHeadline(35, 'DevOps');
  assert.ok(lowTier.badge.includes('Foundation'));
});

test('buildCohortBreakdown maps all 5 dimensions safely', () => {
  const mockResult = {
    technicalKnowledgeScore: 85,
    communicationScore: 78,
    relevanceScore: 90,
    clarityScore: 72,
    confidenceScore: 65
  };

  const breakdown = buildCohortBreakdown(mockResult);
  assert.equal(breakdown.length, 5);
  
  const tech = breakdown.find(b => b.dimension === 'Technical Depth');
  assert.ok(tech);
  assert.equal(tech.score, 85);
  assert.ok(tech.percentile > 70);
  assert.ok(tech.higherThan.includes('%'));
});

test('buildCohortBreakdown handles null result safely', () => {
  assert.deepEqual(buildCohortBreakdown(null), []);
});

test('buildReadinessActionPlan orders weakest dimensions first and respects limit', () => {
  assert.deepEqual(buildReadinessActionPlan(null), []);

  const plan = buildReadinessActionPlan({
    technicalKnowledgeScore: 90,
    communicationScore: 82,
    relevanceScore: 88,
    clarityScore: 60,
    confidenceScore: 55
  }, 2);

  assert.equal(plan.length, 2);
  assert.equal(plan[0].key, 'confidenceScore');
  assert.equal(plan[1].key, 'clarityScore');
});
