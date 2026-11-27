import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SUPPORTED_LANGUAGES,
  parseTestCases,
  evaluateExecution,
  detectComplexityHeuristics,
  calculateRoundScore
} from './codeSandboxUtils.js';

describe('codeSandboxUtils — Execution, Complexity & Scoring Engine', () => {
  it('supplies templates for major technical interview languages', () => {
    assert.ok(SUPPORTED_LANGUAGES.length >= 5);
    const langIds = SUPPORTED_LANGUAGES.map((l) => l.id);
    assert.ok(langIds.includes('javascript'));
    assert.ok(langIds.includes('python'));
    assert.ok(langIds.includes('java'));
    assert.ok(langIds.includes('cpp'));
    assert.ok(langIds.includes('go'));
  });

  it('correctly parses default and custom test cases', () => {
    const fallback = parseTestCases(null);
    assert.equal(fallback.length, 3);
    assert.equal(fallback[0].expected, '[0, 1]');

    const custom = parseTestCases([{ input: '1, 2', expected: '3' }]);
    assert.equal(custom.length, 1);
    assert.equal(custom[0].expected, '3');
  });

  it('evaluates valid algorithmic JavaScript code against test cases', () => {
    const code = `
      function twoSum(nums, target) {
        const map = new Map();
        for (let i = 0; i < nums.length; i++) {
          const complement = target - nums[i];
          if (map.has(complement)) {
            return [map.get(complement), i];
          }
          map.set(nums[i], i);
        }
        return [];
      }
    `;
    const evalResult = evaluateExecution(code, 'javascript', [
      { input: '[2, 7, 11, 15], 9', expected: '[0, 1]' },
      { input: '[3, 2, 4], 6', expected: '[1, 2]' }
    ]);

    assert.equal(evalResult.passedCount, 2);
    assert.equal(evalResult.totalCount, 2);
    assert.equal(evalResult.allPassed, true);
    assert.ok(evalResult.durationMs > 0);
  });

  it('detects nested loops heuristic warnings for quadratic O(N²)', () => {
    const nestedCode = `
      function quadraticSearch(arr) {
        for (let i = 0; i < arr.length; i++) {
          for (let j = 0; j < arr.length; j++) {
            console.log(arr[i], arr[j]);
          }
        }
      }
    `;
    const heuristics = detectComplexityHeuristics(nestedCode);
    assert.equal(heuristics.estimatedTime, 'O(N²) or higher');
    assert.ok(heuristics.warnings.length > 0);
  });

  it('calculates round scores with hint penalties and speed modifiers', () => {
    const perfectScore = calculateRoundScore({
      passedCount: 3,
      totalCount: 3,
      hintPenalty: 0,
      timeSpentSec: 400
    });
    // 100 base + 5 speed bonus = 100 max
    assert.equal(perfectScore, 100);

    const penalizedScore = calculateRoundScore({
      passedCount: 3,
      totalCount: 3,
      hintPenalty: 15,
      timeSpentSec: 1000
    });
    // 100 base - 15 hint deduction = 85
    assert.equal(penalizedScore, 85);

    const failedScore = calculateRoundScore({
      passedCount: 1,
      totalCount: 3,
      hintPenalty: 5,
      timeSpentSec: 800
    });
    // (1/3)*100 = 33 - 5 = 28
    assert.equal(failedScore, 28);
  });
});
