import test from 'node:test';
import assert from 'node:assert/strict';
import { collectFinalizedResults, combineAnswerParts } from './voiceTranscript.js';

const speechResult = (transcript, isFinal) => ({
  0: { transcript },
  isFinal
});

test('combines typed and recognized text while preserving both', () => {
  assert.equal(combineAnswerParts('Typed first.', 'Spoken second.'), 'Typed first.\nSpoken second.');
});

test('keeps interim text separate and does not append it to the answer', () => {
  const finalized = new Map();
  const result = collectFinalizedResults([speechResult('still speaking', false)], finalized);
  assert.equal(result.finalizedTranscript, '');
  assert.equal(result.interimTranscript, 'still speaking');
  assert.equal(combineAnswerParts('manual response', result.finalizedTranscript), 'manual response');
});

test('does not duplicate finalized text when the browser repeats a result event', () => {
  const finalized = new Map();
  const results = [speechResult('first phrase', true)];
  const first = collectFinalizedResults(results, finalized);
  const repeated = collectFinalizedResults(results, finalized);
  assert.equal(first.finalizedTranscript, 'first phrase');
  assert.equal(repeated.finalizedTranscript, 'first phrase');
});

test('updates cumulative result indexes once when interim speech becomes final', () => {
  const finalized = new Map();
  collectFinalizedResults([speechResult('hello', true), speechResult('world', false)], finalized);
  const result = collectFinalizedResults([speechResult('hello', true), speechResult('world', true)], finalized);
  assert.equal(result.finalizedTranscript, 'hello world');
});

test('a restarted recognition session preserves earlier speech and adds new results', () => {
  const previousSpeech = 'Earlier voice input.';
  const restartedSession = new Map();
  const { finalizedTranscript } = collectFinalizedResults([speechResult('More voice input.', true)], restartedSession);
  assert.equal(combineAnswerParts(previousSpeech, finalizedTranscript), 'Earlier voice input.\nMore voice input.');
});

test('manual-only answers remain submit-ready when there is no speech transcript', () => {
  assert.equal(combineAnswerParts('A typed answer.', ''), 'A typed answer.');
});
