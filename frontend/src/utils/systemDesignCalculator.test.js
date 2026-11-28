import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCapacityMetrics,
  classifyTrafficTier,
  ARCHITECTURE_PRESETS,
  estimateShardCount,
} from './systemDesignCalculator.js';

test('calculateCapacityMetrics calculates accurate QPS, bandwidth, and storage accumulation', () => {
  // 1 Million DAU, 10:1 Read-to-Write ratio, 20 interactions/user, 2 KB payload
  const metrics = calculateCapacityMetrics({
    dau: 1000000,
    readWriteRatio: 10,
    avgPayloadKb: 2,
    dailyInteractionsPerUser: 20,
  });

  assert.equal(metrics.totalDailyRequests, 20000000);
  assert.ok(metrics.avgQps > 230 && metrics.avgQps < 235); // ~231.5 QPS
  assert.ok(metrics.readQps > metrics.writeQps * 9); // Read is 10x write
  assert.ok(metrics.peakQps > metrics.avgQps * 2); // Peak is 2.5x
  assert.ok(metrics.ingressBandwidthMbps > 0);
  assert.ok(metrics.egressBandwidthMbps > 0);
  assert.ok(metrics.annualStorageTb > 0);
  assert.ok(metrics.recommendedCacheMemoryGb > 0);
});

test('calculateCapacityMetrics handles fallback bounds safely', () => {
  const fallback = calculateCapacityMetrics({
    dau: -500,
    readWriteRatio: 0,
    avgPayloadKb: 0,
  });

  assert.ok(fallback.totalDailyRequests >= 20000);
  assert.ok(fallback.avgQps > 0);
  assert.ok(fallback.peakQps > 0);
});

test('classifyTrafficTier correctly segments volume bands', () => {
  assert.equal(classifyTrafficTier(250).tier, 'LOW_TRAFFIC');
  assert.equal(classifyTrafficTier(2500).tier, 'MODERATE_TRAFFIC');
  assert.equal(classifyTrafficTier(25000).tier, 'HIGH_TRAFFIC');
  assert.equal(classifyTrafficTier(100000).tier, 'HYPERSCALE');
});

test('ARCHITECTURE_PRESETS provides verified node topologies', () => {
  assert.ok(ARCHITECTURE_PRESETS.tinyurl);
  assert.ok(ARCHITECTURE_PRESETS.tinyurl.nodes.length >= 5);
  assert.ok(ARCHITECTURE_PRESETS.tinyurl.edges.length >= 4);

  assert.ok(ARCHITECTURE_PRESETS.uber);
  assert.ok(ARCHITECTURE_PRESETS.uber.nodes.length >= 5);

  assert.ok(ARCHITECTURE_PRESETS.whatsapp);
  assert.ok(ARCHITECTURE_PRESETS.whatsapp.nodes.length >= 5);
  assert.ok(ARCHITECTURE_PRESETS.whatsapp.edges.length >= 4);
});

test('estimateShardCount computes partition counts cleanly', () => {
  assert.equal(estimateShardCount(0, 500), 1);
  assert.equal(estimateShardCount(450, 500), 1);
  assert.equal(estimateShardCount(1200, 500), 3);
  assert.equal(estimateShardCount(-10, 500), 1);
});
