import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computePitchAutocorrelation,
  evaluatePitchStability,
  computeSpeechPacing,
  extractFillerCrutches,
  computeVocalDeliveryScore,
} from './voiceAcousticTelemetry.js';

test('computePitchAutocorrelation handles empty and silent audio buffers', () => {
  const emptyRes = computePitchAutocorrelation(new Float32Array([]), 44100);
  assert.equal(emptyRes.pitchHz, 0);
  assert.equal(emptyRes.isVoiced, false);

  const silentBuffer = new Float32Array(1024).fill(0.001);
  const silentRes = computePitchAutocorrelation(silentBuffer, 44100);
  assert.equal(silentRes.pitchHz, 0);
  assert.equal(silentRes.isVoiced, false);
});

test('computePitchAutocorrelation detects fundamental frequency of a periodic sine wave', () => {
  const sampleRate = 44100;
  const targetHz = 220; // A3 pitch
  const buffer = new Float32Array(2048);
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = 0.5 * Math.sin((2 * Math.PI * targetHz * i) / sampleRate);
  }

  const result = computePitchAutocorrelation(buffer, sampleRate);
  assert.equal(result.isVoiced, true);
  // Allow ±5 Hz tolerance due to discrete autocorrelation discretization
  assert.ok(Math.abs(result.pitchHz - targetHz) <= 5);
});

test('evaluatePitchStability correctly categorizes steadiness and calculates stability score', () => {
  // Test fallback on sparse samples
  const sparse = evaluatePitchStability([120]);
  assert.equal(sparse.voiceSteadiness, 'BALANCED');
  assert.equal(sparse.stabilityScore, 80);

  // Test steady human speech pitch (140-150 Hz)
  const steadySamples = [142, 145, 144, 146, 143, 145, 144, 147];
  const steadyResult = evaluatePitchStability(steadySamples);
  assert.ok(steadyResult.averagePitchHz >= 140 && steadyResult.averagePitchHz <= 150);
  assert.ok(steadyResult.stabilityScore >= 80);
  assert.ok(['MONOTONIC', 'BALANCED'].includes(steadyResult.voiceSteadiness));

  // Test volatile pitch jumps
  const volatileSamples = [90, 280, 110, 340, 85, 390, 120];
  const volatileResult = evaluatePitchStability(volatileSamples);
  assert.equal(volatileResult.voiceSteadiness, 'VOLATILE');
  assert.ok(volatileResult.stabilityScore < 70);
});

test('computeSpeechPacing calculates accurate WPM and maps pacing tiers', () => {
  // Edge cases
  assert.equal(computeSpeechPacing(0, 30).wpm, 0);
  assert.equal(computeSpeechPacing(50, 0).wpm, 0);

  // Optimal pacing: 140 words in 60s -> 140 WPM
  const optimal = computeSpeechPacing(140, 60);
  assert.equal(optimal.wpm, 140);
  assert.equal(optimal.pacingTier, 'OPTIMAL');
  assert.equal(optimal.isOptimal, true);

  // Too slow: 60 words in 60s -> 60 WPM
  const slow = computeSpeechPacing(60, 60);
  assert.equal(slow.wpm, 60);
  assert.equal(slow.pacingTier, 'TOO_SLOW');
  assert.equal(slow.isOptimal, false);

  // Rushed: 220 words in 60s -> 220 WPM
  const rushed = computeSpeechPacing(220, 60);
  assert.equal(rushed.wpm, 220);
  assert.equal(rushed.pacingTier, 'RUSHED');
  assert.equal(rushed.isOptimal, false);
});

test('extractFillerCrutches detects single and multi-word verbal crutches', () => {
  const transcript =
    'Um, basically I designed the backend with Spring Boot, and like, you know, it handled high traffic.';
  const res = extractFillerCrutches(transcript);

  assert.ok(res.totalFillers >= 4);
  assert.equal(res.fillerBreakdown.um, 1);
  assert.equal(res.fillerBreakdown.basically, 1);
  assert.equal(res.fillerBreakdown.like, 1);
  assert.equal(res.fillerBreakdown['you know'], 1);
  assert.ok(res.fillerDensityPct > 0);
});

test('computeVocalDeliveryScore calculates composite delivery rating', () => {
  const highQuality = computeVocalDeliveryScore({
    wpm: 145,
    stabilityScore: 90,
    fillerDensityPct: 0.5,
  });
  assert.ok(highQuality >= 90);

  const degraded = computeVocalDeliveryScore({
    wpm: 210,
    stabilityScore: 50,
    fillerDensityPct: 8.0,
  });
  assert.ok(degraded <= 70);
});
