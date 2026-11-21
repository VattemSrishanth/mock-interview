import test from 'node:test';
import assert from 'node:assert/strict';
import { PeerSignalingService, calculateMutualPeerScore } from './peerSignalingService.js';

test('calculateMutualPeerScore computes average across all 4 interview pillars', () => {
  const rubric = {
    problemSolvingScore: 9,
    technicalAccuracyScore: 8,
    communicationScore: 9,
    codeQualityScore: 10,
  };
  const score = calculateMutualPeerScore(rubric);
  assert.equal(score, 9.0);

  assert.equal(calculateMutualPeerScore(null), 0);
});

test('PeerSignalingService initializes room properties and uppercase code', () => {
  const service = new PeerSignalingService();
  service.initialize({
    roomCode: 'dev89x',
    userId: 2005,
    userName: 'Tester User',
  });

  assert.equal(service.roomCode, 'DEV89X');
  assert.equal(service.userId, '2005');
  assert.equal(service.userName, 'Tester User');

  service.destroy();
  assert.equal(service.roomCode, null);
});
