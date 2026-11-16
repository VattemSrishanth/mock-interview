import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSocialShareCopy } from './socialShareUtils.js';

test('buildSocialShareCopy formats share text and encoded URLs correctly', () => {
  const payload = {
    jobRole: 'Full Stack Engineer',
    overallScore: 88,
    shareUrl: 'https://intervai.app/report/test-token-123',
    interviewType: 'Technical'
  };

  const copy = buildSocialShareCopy(payload);

  assert.ok(copy.headline.includes('🏆'));
  assert.ok(copy.headline.includes('Full Stack Engineer'));
  assert.ok(copy.scoreText.includes('88%'));
  assert.ok(copy.fullText.includes('https://intervai.app/report/test-token-123'));
  assert.ok(copy.fullText.includes('#IntervAI'));
  assert.ok(copy.encodedText.includes('intervai.app'));
});

test('buildSocialShareCopy handles default fallback parameters', () => {
  const copy = buildSocialShareCopy({});
  assert.ok(copy.headline.includes('Software Engineer'));
  assert.ok(copy.fullText.includes('#IntervAI'));
});
