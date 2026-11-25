import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateResponsePacing, formatElapsedTime } from './pacingUtils.js';

test('formatElapsedTime formats seconds to MM:SS and clamps invalid inputs', () => {
  assert.equal(formatElapsedTime(0), '00:00');
  assert.equal(formatElapsedTime(-15), '00:00');
  assert.equal(formatElapsedTime(65), '01:05');
  assert.equal(formatElapsedTime(180), '03:00');
  assert.equal(formatElapsedTime(null), '00:00');
});

test('evaluateResponsePacing classifies introductory, optimal, and wrap-up tiers', () => {
  const intro = evaluateResponsePacing(25);
  assert.equal(intro.stage, 'INTRODUCTORY');
  assert.equal(intro.label, 'Introductory');
  assert.equal(intro.mins, 0);
  assert.equal(intro.secs, 25);

  const optimal = evaluateResponsePacing(90);
  assert.equal(optimal.stage, 'OPTIMAL');
  assert.equal(optimal.label, 'Optimal Pacing');
  assert.equal(optimal.progressPercent, 50);

  const wrapUp = evaluateResponsePacing(210);
  assert.equal(wrapUp.stage, 'WRAP_UP');
  assert.equal(wrapUp.label, 'Wrap-up Suggested');
  assert.equal(wrapUp.progressPercent, 100);
});
