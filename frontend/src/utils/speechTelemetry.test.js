import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeSpeechTelemetry, FILLER_WORDS } from './speechTelemetry.js';

test('analyzeSpeechTelemetry handles empty or null input gracefully', () => {
  const result = analyzeSpeechTelemetry('', 0);
  assert.equal(result.totalWords, 0);
  assert.equal(result.wordsPerMinute, 0);
  assert.equal(result.fillerCount, 0);
  assert.equal(result.pacingStatus, 'STANDBY');
});

test('detects single-word and multi-word filler words correctly', () => {
  const transcript = 'Um, I basically used Redis because, you know, it is like really fast and actually works well.';
  // Total words: 17
  // Fillers: 'um' (1), 'basically' (1), 'you know' (1), 'like' (1), 'actually' (1) => total 5
  const result = analyzeSpeechTelemetry(transcript, 10);
  assert.equal(result.fillerCount, 5);
  assert.equal(result.fillerBreakdown['um'], 1);
  assert.equal(result.fillerBreakdown['basically'], 1);
  assert.equal(result.fillerBreakdown['you know'], 1);
  assert.equal(result.fillerBreakdown['like'], 1);
  assert.equal(result.fillerBreakdown['actually'], 1);
  assert.ok(result.fillerPercentage > 20);
  assert.equal(result.fillerStatus, 'HIGH');
});

test('calculates correct Words Per Minute (WPM) and pacing tiers', () => {
  // 150 words in 60 seconds = 150 WPM (OPTIMAL)
  const words150 = Array.from({ length: 150 }, () => 'code').join(' ');
  const resOptimal = analyzeSpeechTelemetry(words150, 60);
  assert.equal(resOptimal.wordsPerMinute, 150);
  assert.equal(resOptimal.pacingStatus, 'OPTIMAL');

  // 70 words in 60 seconds = 70 WPM (SLOW)
  const words70 = Array.from({ length: 70 }, () => 'concept').join(' ');
  const resSlow = analyzeSpeechTelemetry(words70, 60);
  assert.equal(resSlow.wordsPerMinute, 70);
  assert.equal(resSlow.pacingStatus, 'SLOW');

  // 210 words in 60 seconds = 210 WPM (RUSHED)
  const words210 = Array.from({ length: 210 }, () => 'rapid').join(' ');
  const resRushed = analyzeSpeechTelemetry(words210, 60);
  assert.equal(resRushed.wordsPerMinute, 210);
  assert.equal(resRushed.pacingStatus, 'RUSHED');
});

test('generates constructive advice tips when pacing or fillers are problematic', () => {
  const messySpeech = 'Um like uh basically honestly you know we had issues.';
  const res = analyzeSpeechTelemetry(messySpeech, 20);
  assert.ok(res.tips.length > 0);
  assert.ok(res.tips.some((tip) => tip.includes('Frequent filler usage detected')));
});

