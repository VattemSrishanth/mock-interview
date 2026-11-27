import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getStoredBookmarks,
  saveStoredBookmarks,
  toggleBookmarkQuestion,
  updateBookmarkStatus,
  isQuestionBookmarked,
  countBookmarksByStatus,
} from './bookmarkDeckUtils.js';

// Polyfill minimal localStorage for Node test runner
const memoryStore = {};
global.localStorage = {
  getItem: (k) => memoryStore[k] || null,
  setItem: (k, v) => { memoryStore[k] = String(v); },
  removeItem: (k) => { delete memoryStore[k]; },
  clear: () => { Object.keys(memoryStore).forEach((k) => delete memoryStore[k]); },
};

describe('bookmarkDeckUtils — Revision Deck Persistence', () => {
  beforeEach(() => {
    global.localStorage.clear();
  });

  test('toggles bookmarks into localStorage correctly', () => {
    const q1 = { id: 'q_101', questionText: 'Explain virtual DOM in React 18' };
    
    assert.equal(isQuestionBookmarked('q_101'), false);
    const afterAdd = toggleBookmarkQuestion(q1);
    assert.equal(afterAdd.length, 1);
    assert.equal(isQuestionBookmarked('q_101'), true);
    assert.equal(afterAdd[0].status, 'NEEDS_REVISION');

    // Toggle off
    const afterRemove = toggleBookmarkQuestion(q1);
    assert.equal(afterRemove.length, 0);
    assert.equal(isQuestionBookmarked('q_101'), false);
  });

  test('updates bookmark status between NEEDS_REVISION and MASTERED', () => {
    const q2 = { id: 'q_102', questionText: 'Explain B-Tree indexing in PostgreSQL' };
    toggleBookmarkQuestion(q2);

    const updated = updateBookmarkStatus('q_102', 'MASTERED');
    assert.equal(updated.find((q) => q.id === 'q_102').status, 'MASTERED');
  });

  test('handles null and invalid parameters gracefully', () => {
    assert.equal(isQuestionBookmarked(null), false);
    assert.deepEqual(toggleBookmarkQuestion(null), []);
  });

  test('counts bookmarked questions grouped by mastery status', () => {
    toggleBookmarkQuestion({ id: 'q_201', questionText: 'CAP theorem trade-offs' });
    toggleBookmarkQuestion({ id: 'q_202', questionText: 'Consistent hashing' });
    updateBookmarkStatus('q_202', 'MASTERED');

    assert.deepEqual(countBookmarksByStatus(), {
      total: 2,
      needsRevision: 1,
      mastered: 1,
    });
  });
});
