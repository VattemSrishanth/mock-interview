import test from 'node:test';
import assert from 'node:assert/strict';
import { INTERVIEWER_PERSONAS, voiceInterviewerService } from './voiceInterviewerService.js';

test('voiceInterviewerService provides 4 distinct interviewer personas', () => {
  const personas = voiceInterviewerService.getPersonas();
  assert.equal(personas.length, 4);
  const ids = personas.map(p => p.id);
  assert.deepEqual(ids, ['sarah', 'james', 'elena', 'alex']);
});

test('voiceInterviewerService returns correct persona metadata and calibrated voice parameters', () => {
  const sarah = INTERVIEWER_PERSONAS.find(p => p.id === 'sarah');
  assert.equal(sarah.name, 'Sarah');
  assert.equal(sarah.title, 'Senior Tech Lead');
  assert.equal(sarah.accent, 'US / American');
  assert.equal(sarah.cloudVoice, 'nova');

  const james = INTERVIEWER_PERSONAS.find(p => p.id === 'james');
  assert.equal(james.name, 'James');
  assert.equal(james.title, 'Staff Architect');
  assert.equal(james.accent, 'UK / British');
  assert.equal(james.cloudVoice, 'onyx');
  assert.equal(james.rate, 0.92);
});

test('voiceInterviewerService allows switching persona and persists choice', () => {
  voiceInterviewerService.setSelectedPersona('james');
  assert.equal(voiceInterviewerService.getSelectedPersona().id, 'james');

  voiceInterviewerService.setSelectedPersona('sarah');
  assert.equal(voiceInterviewerService.getSelectedPersona().id, 'sarah');
});

