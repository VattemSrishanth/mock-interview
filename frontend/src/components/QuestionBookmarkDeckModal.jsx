import React, { useState, useEffect } from 'react';
import { X, Bookmark, BookmarkCheck, CheckCircle2, RotateCw, Trash2, BookOpen, Layers } from 'lucide-react';
import { getStoredBookmarks, updateBookmarkStatus, saveStoredBookmarks } from '../utils/bookmarkDeckUtils';

export default function QuestionBookmarkDeckModal({ isOpen, onClose }) {
  const [deck, setDeck] = useState([]);
  const [flippedCards, setFlippedCards] = useState({});
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (!isOpen) return;
    setDeck(getStoredBookmarks());
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStatusChange = (id, newStatus) => {
    const updated = updateBookmarkStatus(id, newStatus);
    setDeck([...updated]);
  };

  const handleRemove = (id) => {
    const updated = deck.filter((q) => q.id !== id);
    setDeck(updated);
    saveStoredBookmarks(updated);
  };

  const filteredDeck = deck.filter((q) => {
    if (filter === 'ALL') return true;
    return q.status === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Interview Question Revision Deck
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                  {deck.length} Saved
                </span>
              </h2>
              <p className="text-xs text-slate-400">Flip cards to review optimal model answers and technical rubrics</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            {['ALL', 'NEEDS_REVISION', 'MASTERED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filter === f ? 'bg-orange-500 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f === 'ALL' ? 'All Cards' : f === 'NEEDS_REVISION' ? 'Needs Revision' : 'Mastered'}
              </button>
            ))}
          </div>
          <span className="text-slate-500 text-[11px]">Click card to flip</span>
        </div>

        {/* Deck List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 max-h-[60vh]">
          {filteredDeck.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No bookmarked questions found in this folder. Bookmark challenging questions during interview sessions to revise them here.
            </div>
          ) : (
            filteredDeck.map((q) => {
              const isFlipped = !!flippedCards[q.id];
              return (
                <div
                  key={q.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 transition-all hover:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 font-mono">
                      {q.role || 'Interview Question'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStatusChange(q.id, q.status === 'MASTERED' ? 'NEEDS_REVISION' : 'MASTERED')}
                        className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          q.status === 'MASTERED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {q.status === 'MASTERED' ? 'Mastered' : 'Needs Practice'}
                      </button>
                      <button
                        onClick={() => handleRemove(q.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Content (Click to Flip) */}
                  <div
                    onClick={() => toggleFlip(q.id)}
                    className="cursor-pointer select-none rounded-lg p-3 bg-slate-900 border border-slate-800/80 hover:bg-slate-900/90 transition-colors"
                  >
                    {!isFlipped ? (
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Question Prompt
                        </span>
                        <p className="text-sm font-semibold text-white leading-relaxed">{q.questionText || q.question}</p>
                        <div className="flex items-center gap-1 text-[11px] text-orange-400 mt-2 font-medium">
                          <RotateCw className="w-3 h-3" /> Reveal Model Answer & Architecture
                        </div>
                      </div>
                    ) : (
                      <div className="animate-fade-in">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                          Model Answer & Technical Breakdown
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {q.modelAnswer || 'Answer breakdown: Structure using STAR, focus on time/space trade-offs, and state assumptions clearly.'}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-2">
                          <RotateCw className="w-3 h-3" /> Flip back to Question
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
