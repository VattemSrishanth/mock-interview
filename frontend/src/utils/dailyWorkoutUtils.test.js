import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStreakUpdate,
  calculateUserLevel,
  calculateXpToNextLevel,
  LEVEL_TIERS
} from './dailyWorkoutUtils.js';

describe('dailyWorkoutUtils — Streak Calculation & User XP Ranking', () => {
  it('initializes streak on first completion', () => {
    const initial = {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      totalWorkoutsCompleted: 0,
      totalXp: 0,
    };
    const { updated, data } = calculateStreakUpdate(initial, '2026-11-19');
    assert.equal(updated, true);
    assert.equal(data.currentStreak, 1);
    assert.equal(data.longestStreak, 1);
    assert.equal(data.totalWorkoutsCompleted, 1);
    assert.equal(data.totalXp, 50);
  });

  it('increments streak on consecutive day completion', () => {
    const existing = {
      currentStreak: 4,
      longestStreak: 4,
      lastCompletedDate: '2026-11-18',
      totalWorkoutsCompleted: 4,
      totalXp: 200,
    };
    const { updated, data } = calculateStreakUpdate(existing, '2026-11-19');
    assert.equal(updated, true);
    assert.equal(data.currentStreak, 5);
    assert.equal(data.longestStreak, 5);
    assert.equal(data.totalWorkoutsCompleted, 5);
    assert.equal(data.totalXp, 250);
  });

  it('does not re-increment if already completed on the same date', () => {
    const sameDay = {
      currentStreak: 3,
      longestStreak: 3,
      lastCompletedDate: '2026-11-19',
      totalWorkoutsCompleted: 3,
      totalXp: 150,
    };
    const { updated, data } = calculateStreakUpdate(sameDay, '2026-11-19');
    assert.equal(updated, false);
    assert.equal(data.currentStreak, 3);
    assert.equal(data.totalXp, 150);
  });

  it('resets streak to 1 if consecutive day was missed', () => {
    const broken = {
      currentStreak: 8,
      longestStreak: 8,
      lastCompletedDate: '2026-11-10',
      totalWorkoutsCompleted: 8,
      totalXp: 400,
    };
    const { updated, data } = calculateStreakUpdate(broken, '2026-11-19');
    assert.equal(updated, true);
    assert.equal(data.currentStreak, 1);
    assert.equal(data.longestStreak, 8); // longest streak preserved!
    assert.equal(data.totalWorkoutsCompleted, 9);
    assert.equal(data.totalXp, 450);
  });

  it('evaluates user ranking tiers based on accumulated XP', () => {
    const apprentice = calculateUserLevel(50);
    assert.equal(apprentice.level, 1);
    assert.equal(apprentice.title, 'Apprentice Engineer');

    const solver = calculateUserLevel(450);
    assert.equal(solver.level, 3);
    assert.equal(solver.title, 'Full-Stack Problem Solver');

    const faangReady = calculateUserLevel(1500);
    assert.equal(faangReady.level, 5);
    assert.equal(faangReady.title, 'FAANG / Unicorn Ready');
    assert.equal(faangReady.progressPercent, 100);
  });

  it('calculates remaining XP required for the next tier cleanly', () => {
    assert.equal(calculateXpToNextLevel(0), 150);
    assert.equal(calculateXpToNextLevel(100), 50);
    assert.equal(calculateXpToNextLevel(200), 200);
    assert.equal(calculateXpToNextLevel(1500), 0);
    assert.equal(calculateXpToNextLevel(-20), 150);
  });
});
