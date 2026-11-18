/**
 * Local storage persistence and review helpers for interview question bookmark flashcards.
 */

const STORAGE_KEY = 'intervai_question_bookmarks';

export function getStoredBookmarks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse question bookmarks', e);
    return [];
  }
}

export function saveStoredBookmarks(bookmarks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (e) {
    console.error('Failed to save question bookmarks', e);
  }
}

export function toggleBookmarkQuestion(questionObj) {
  if (!questionObj || !questionObj.id) return [];
  const list = getStoredBookmarks();
  const existingIdx = list.findIndex((q) => q.id === questionObj.id);

  if (existingIdx >= 0) {
    list.splice(existingIdx, 1);
  } else {
    list.unshift({
      ...questionObj,
      savedAt: new Date().toISOString(),
      status: 'NEEDS_REVISION', // 'NEEDS_REVISION' or 'MASTERED'
    });
  }
  saveStoredBookmarks(list);
  return list;
}

export function updateBookmarkStatus(id, newStatus) {
  const list = getStoredBookmarks();
  const item = list.find((q) => q.id === id);
  if (item) {
    item.status = newStatus;
    saveStoredBookmarks(list);
  }
  return list;
}

export function isQuestionBookmarked(id) {
  if (!id) return false;
  return getStoredBookmarks().some((q) => q.id === id);
}
