import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateGazeDistribution,
  computeIntegrityHealthScore,
} from './proctoringTelemetryUtils.js';

test('evaluateGazeDistribution accurately computes gaze attention percentages', () => {
  const gaze = evaluateGazeDistribution({
    centerDurationMs: 80000,
    leftDurationMs: 10000,
    rightDurationMs: 5000,
    downDurationMs: 5000,
  });

  assert.equal(gaze.centerScreenPercentage, 80);
  assert.equal(gaze.leftLookawayPercentage, 10);
  assert.equal(gaze.rightLookawayPercentage, 5);
  assert.equal(gaze.downwardLookawayPercentage, 5);
  assert.equal(gaze.primaryGazeFocus, 'CENTER');
});

test('evaluateGazeDistribution identifies off-screen and dual-monitor gaze profiles', () => {
  const dual = evaluateGazeDistribution({
    centerDurationMs: 40000,
    leftDurationMs: 30000,
    rightDurationMs: 20000,
    downDurationMs: 10000,
  });

  assert.equal(dual.primaryGazeFocus, 'DUAL_MONITOR');
  assert.ok(dual.centerScreenPercentage < 65);
});

test('computeIntegrityHealthScore calculates deduction details and clearance', () => {
  const pristine = computeIntegrityHealthScore({
    tabSwitches: 0,
    windowBlurs: 0,
    centerGazePct: 92,
  });
  assert.equal(pristine.score, 100);
  assert.equal(pristine.status, 'EXCELLENT');
  assert.equal(pristine.isCleared, true);
  assert.equal(pristine.deductionDetails.length, 0);

  const degraded = computeIntegrityHealthScore({
    tabSwitches: 3,
    windowBlurs: 2,
    centerGazePct: 60,
    anomalies: ['MULTIPLE_FACES'],
  });
  assert.ok(degraded.score < 60);
  assert.ok(['WARNING', 'BREACH'].includes(degraded.status));
  assert.equal(degraded.isCleared, false);
  assert.ok(degraded.deductionDetails.length >= 3);
});
