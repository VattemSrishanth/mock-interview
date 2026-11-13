import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INTERVIEWER_PERSONAS,
  classifyVoice,
  resolveDedicatedVoices,
  voiceInterviewerService
} from './voiceInterviewerService.js';

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

test('classifyVoice accurately identifies gender and accent across platforms', () => {
  const zira = classifyVoice({ name: 'Microsoft Zira Desktop - English (United States)', lang: 'en-US' });
  assert.equal(zira.gender, 'female');
  assert.equal(zira.isUs, true);

  const david = classifyVoice({ name: 'Microsoft David Desktop - English (United States)', lang: 'en-US' });
  assert.equal(david.gender, 'male');
  assert.equal(david.isUs, true);

  const jenny = classifyVoice({ name: 'Microsoft Jenny Online (Natural) - English (United States)', lang: 'en-US' });
  assert.equal(jenny.gender, 'female');

  const ryan = classifyVoice({ name: 'Microsoft Ryan Online (Natural) - English (United Kingdom)', lang: 'en-GB' });
  assert.equal(ryan.gender, 'male');
  assert.equal(ryan.isUk, true);

  const samantha = classifyVoice({ name: 'Samantha', lang: 'en-US' });
  assert.equal(samantha.gender, 'female');

  const googleUkMale = classifyVoice({ name: 'Google UK English Male', lang: 'en-GB' });
  assert.equal(googleUkMale.gender, 'male');
  assert.equal(googleUkMale.isUk, true);

  const googleUs = classifyVoice({ name: 'Google US English', lang: 'en-US' });
  assert.equal(googleUs.gender, 'female');
});

test('resolveDedicatedVoices guarantees dedicated female voices for female personas and male for male on Windows 11', () => {
  const win11Voices = [
    { name: 'Microsoft David Desktop - English (United States)', lang: 'en-US' },
    { name: 'Microsoft Zira Desktop - English (United States)', lang: 'en-US' }
  ];

  const assigned = resolveDedicatedVoices(win11Voices);
  assert.equal(assigned.sarah.name, 'Microsoft Zira Desktop - English (United States)');
  assert.equal(assigned.elena.name, 'Microsoft Zira Desktop - English (United States)');
  assert.equal(assigned.james.name, 'Microsoft David Desktop - English (United States)');
  assert.equal(assigned.alex.name, 'Microsoft David Desktop - English (United States)');

  // Female personas receive a verified female voice (Zira), never male David
  assert.notEqual(assigned.sarah.name, assigned.alex.name);
  assert.notEqual(assigned.elena.name, assigned.james.name);
});

test('resolveDedicatedVoices gives distinct voices when multiple voices exist', () => {
  const edgeVoices = [
    { name: 'Microsoft Jenny Online (Natural) - English (United States)', lang: 'en-US' },
    { name: 'Microsoft Guy Online (Natural) - English (United States)', lang: 'en-US' },
    { name: 'Microsoft Aria Online (Natural) - English (United States)', lang: 'en-US' },
    { name: 'Microsoft Ryan Online (Natural) - English (United Kingdom)', lang: 'en-GB' }
  ];

  const assigned = resolveDedicatedVoices(edgeVoices);
  assert.equal(assigned.sarah.name, 'Microsoft Jenny Online (Natural) - English (United States)');
  assert.equal(assigned.elena.name, 'Microsoft Aria Online (Natural) - English (United States)');
  assert.equal(assigned.james.name, 'Microsoft Ryan Online (Natural) - English (United Kingdom)');
  assert.equal(assigned.alex.name, 'Microsoft Guy Online (Natural) - English (United States)');

  const uniqueNames = new Set([assigned.sarah.name, assigned.elena.name, assigned.james.name, assigned.alex.name]);
  assert.equal(uniqueNames.size, 4, 'All 4 personas must have unique dedicated voices');
});

test('getAudioConfigForPersona provides acoustic differentiation when voices are shared', () => {
  voiceInterviewerService.availableVoices = [
    { name: 'Microsoft David Desktop - English (United States)', lang: 'en-US' },
    { name: 'Microsoft Zira Desktop - English (United States)', lang: 'en-US' }
  ];

  const sarahConfig = voiceInterviewerService.getAudioConfigForPersona({ id: 'sarah' });
  const elenaConfig = voiceInterviewerService.getAudioConfigForPersona({ id: 'elena' });
  const jamesConfig = voiceInterviewerService.getAudioConfigForPersona({ id: 'james' });
  const alexConfig = voiceInterviewerService.getAudioConfigForPersona({ id: 'alex' });

  // Female voices
  assert.equal(sarahConfig.voice.name, 'Microsoft Zira Desktop - English (United States)');
  assert.equal(elenaConfig.voice.name, 'Microsoft Zira Desktop - English (United States)');
  assert.notEqual(sarahConfig.pitch, elenaConfig.pitch, 'Elena and Sarah must have distinct pitch');
  assert.ok(elenaConfig.pitch > sarahConfig.pitch, 'Elena has higher pitch than Sarah');

  // Male voices
  assert.equal(jamesConfig.voice.name, 'Microsoft David Desktop - English (United States)');
  assert.equal(alexConfig.voice.name, 'Microsoft David Desktop - English (United States)');
  assert.notEqual(jamesConfig.pitch, alexConfig.pitch, 'James and Alex must have distinct pitch');
  assert.ok(jamesConfig.pitch < alexConfig.pitch, 'James has deeper British cadence pitch');
});
