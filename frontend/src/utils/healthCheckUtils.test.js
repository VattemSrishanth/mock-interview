import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyLatencyTier } from './healthCheckUtils.js';

test('classifyLatencyTier categorizes network ping latencies cleanly', () => {
  assert.equal(classifyLatencyTier(45), 'EXCELLENT');
  assert.equal(classifyLatencyTier(450), 'GOOD');
  assert.equal(classifyLatencyTier(1500), 'ELEVATED');
  assert.equal(classifyLatencyTier(5000), 'COLD_START');
  assert.equal(classifyLatencyTier(-5), 'UNKNOWN');
  assert.equal(classifyLatencyTier(null), 'UNKNOWN');
});
