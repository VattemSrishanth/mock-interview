import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildInterviewReportMarkdown,
  buildInterviewReportPayload,
  buildReportFilename
} from './reportExportUtils.js';

const sampleResult = {
  id: 42,
  jobRole: 'Senior Backend Developer',
  interviewType: 'System Design',
  difficulty: 'Hard',
  overallScore: 88,
  evaluationSource: 'AI_PROVIDER',
  technicalKnowledgeScore: 91,
  communicationScore: 85,
  relevanceScore: 89,
  clarityScore: 86,
  confidenceScore: 87,
  strengths: ['Clear database sharding strategy', 'Well-reasoned cache eviction analysis'],
  improvements: ['Discuss backpressure on consumer lag'],
  suggestions: ['Compare Kafka partitioning keys under skew'],
  questions: [
    {
      questionText: 'Design a rate limiter for an API gateway.',
      userAnswer: 'Use a Redis token bucket with Lua scripts for atomicity.',
      expectedKeyPoints: 'Token bucket vs sliding window log, Redis Lua atomicity, cluster replication trade-offs.',
      feedback: {
        score: 90,
        strengths: ['Identified race conditions and proposed atomic Lua execution']
      }
    }
  ]
};

test('buildReportFilename normalizes roles and handles missing values', () => {
  assert.equal(
    buildReportFilename('C++ / Systems Engineer!', 'json', '2026-11-10'),
    'intervai-report-c-systems-engineer-2026-11-10.json'
  );
  assert.equal(
    buildReportFilename('', 'md', '2026-11-10'),
    'intervai-scorecard-interview-2026-11-10.md'
  );
  assert.equal(
    buildReportFilename('???', 'json', '2026-11-10'),
    'intervai-report-interview-2026-11-10.json'
  );
});

test('buildInterviewReportPayload returns null for missing result and maps fields safely', () => {
  assert.equal(buildInterviewReportPayload(null), null);

  const payload = buildInterviewReportPayload(sampleResult, { label: 'Senior Placement Ready' }, '2026-11-10T10:00:00.000Z');
  assert.equal(payload.exportDate, '2026-11-10T10:00:00.000Z');
  assert.deepEqual(payload.session, {
    id: 42,
    jobRole: 'Senior Backend Developer',
    interviewType: 'System Design',
    difficulty: 'Hard',
    overallScore: 88,
    readinessTier: 'Senior Placement Ready',
    evaluationSource: 'AI_PROVIDER'
  });
  assert.equal(payload.competencyScores.technicalKnowledge, 91);
  assert.deepEqual(payload.observations.areasToDevelop, ['Discuss backpressure on consumer lag']);
  assert.deepEqual(payload.observations.recommendations, ['Compare Kafka partitioning keys under skew']);
  assert.equal(payload.questions.length, 1);
  assert.equal(payload.questions[0].index, 1);
  assert.equal(payload.questions[0].score, 90);
  assert.equal(payload.questions[0].expectedModelAnswer, sampleResult.questions[0].expectedKeyPoints);
});

test('buildInterviewReportPayload handles minimal partial payloads without throwing', () => {
  const payload = buildInterviewReportPayload({ id: 7 }, null, '2026-11-10T10:00:00.000Z');
  assert.equal(payload.session.jobRole, 'Technical Interview');
  assert.equal(payload.session.overallScore, null);
  assert.equal(payload.competencyScores.communication, null);
  assert.deepEqual(payload.questions, []);
});

test('buildInterviewReportMarkdown renders scorecard sections, rubric table, and question transcripts', () => {
  assert.equal(buildInterviewReportMarkdown(null), '');

  const md = buildInterviewReportMarkdown(sampleResult, { label: 'Senior Placement Ready' }, 'Nov 10, 2026');
  assert.ok(md.includes('# IntervAI Performance Scorecard — Senior Backend Developer'));
  assert.ok(md.includes('> **Assessment Date**: Nov 10, 2026'));
  assert.ok(md.includes('> **Overall Score**: 88%'));
  assert.ok(md.includes('> **Readiness Tier**: Senior Placement Ready'));
  assert.ok(md.includes('| Technical Knowledge | 91 | / 100 |'));
  assert.ok(md.includes('1. Clear database sharding strategy'));
  assert.ok(md.includes('### Question 1: Design a rate limiter for an API gateway.'));
  assert.ok(md.includes('> Use a Redis token bucket with Lua scripts for atomicity.'));
  assert.ok(md.includes('- Identified race conditions and proposed atomic Lua execution'));
});
