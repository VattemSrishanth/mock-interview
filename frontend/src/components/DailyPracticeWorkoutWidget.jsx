import React, { useState, useEffect } from 'react';
import { Flame, CheckCircle, XCircle, Zap, Code2, ChevronDown, ChevronUp, Sparkles, BookOpen } from 'lucide-react';
import { getStreakData, recordWorkoutCompletion, calculateUserLevel } from '../utils/dailyWorkoutUtils';
import assessmentApi from '../api/assessment';

export default function DailyPracticeWorkoutWidget() {
  const [workout, setWorkout] = useState(null);
  const [streakData, setStreakData] = useState(getStreakData());
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showCodePrompt, setShowCodePrompt] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkout();
  }, []);

  const loadWorkout = async () => {
    try {
      const data = await assessmentApi.getDailyWorkout();
      setWorkout(data);
    } catch (e) {
      // Fallback local workout if backend is offline
      setWorkout({
        dailyFocusTopic: 'System Scalability & Database Indexing (B-Trees vs Hash Index)',
        rapidConceptQuestion: 'Why are B-Tree indexes typically preferred over Hash indexes in relational databases (PostgreSQL/MySQL)?',
        conceptOptions: [
          'Hash indexes consume more memory than B-Trees in all scenarios.',
          'B-Trees efficiently support range queries (BETWEEN, >, <) and order-by operations.',
          'Hash indexes cannot be persisted to physical disk storage.',
          'B-Trees provide O(1) worst-case lookup time compared to Hash tables.'
        ],
        correctOptionIndex: 1,
        conceptExplanation: 'B-Trees store keys in sorted sequential order, allowing log(N) seeks followed by sequential scans for ranges. Hash indexes only support exact equality (=).',
        quickCodePrompt: 'Implement an in-memory TTL Cache with get(key) and put(key, value, ttlMillis).',
        codeStarterSnippet: 'class TTLCache<K, V> {\n    // Implement your thread-safe or O(1) TTL eviction\n}',
        targetExpectedComplexity: 'O(1) Get / Put, O(1) Expiry Check',
        xpReward: 50
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    const correct = idx === workout.correctOptionIndex;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      const updated = recordWorkoutCompletion(workout.xpReward || 50);
      setStreakData(updated);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="h-6 bg-slate-800 rounded w-3/4 mb-4"></div>
        <div className="space-y-2">
          <div className="h-10 bg-slate-800 rounded"></div>
          <div className="h-10 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!workout) return null;

  const userLevel = calculateUserLevel(streakData.totalXp);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Top Banner: Streak & Level */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 flex items-center gap-1.5">
            <Flame className="w-5 h-5 fill-amber-400" />
            <span className="font-bold font-mono text-sm">{streakData.currentStreak} Day Streak</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Daily Engineering Habit
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-semibold">{userLevel.title}</span>
            <span className="text-slate-400 font-mono">({streakData.totalXp} XP)</span>
          </div>
        </div>
      </div>

      {/* Focus Topic Badge & Question */}
      <div className="mt-4">
        <div className="inline-flex items-center space-x-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md mb-2 border border-emerald-500/20">
          <BookOpen className="w-3 h-3" />
          <span>{workout.dailyFocusTopic}</span>
        </div>
        <h3 className="text-sm font-semibold text-slate-100 leading-snug">
          {workout.rapidConceptQuestion}
        </h3>
      </div>

      {/* Options List */}
      <div className="mt-4 space-y-2.5">
        {workout.conceptOptions.map((opt, idx) => {
          let btnStyle = 'border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-300';
          if (isAnswered) {
            if (idx === workout.correctOptionIndex) {
              btnStyle = 'border-emerald-500 bg-emerald-950/30 text-emerald-200 ring-1 ring-emerald-500/40';
            } else if (idx === selectedOption) {
              btnStyle = 'border-rose-500 bg-rose-950/30 text-rose-200 ring-1 ring-rose-500/40';
            } else {
              btnStyle = 'border-slate-800/40 bg-slate-950/20 text-slate-500';
            }
          }

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => handleSelectOption(idx)}
              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start space-x-2.5 ${btnStyle}`}
            >
              <span className="font-mono font-semibold text-slate-400 shrink-0">
                {String.fromCharCode(65 + idx)}.
              </span>
              <span className="flex-1 leading-relaxed">{opt}</span>
              {isAnswered && idx === workout.correctOptionIndex && (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              {isAnswered && idx === selectedOption && idx !== workout.correctOptionIndex && (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Banner */}
      {isAnswered && (
        <div className={`mt-4 p-3.5 rounded-xl border text-xs ${
          isCorrect
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
        }`}>
          <div className="flex items-center space-x-1.5 font-semibold mb-1">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{isCorrect ? '+50 XP Earned! Great architectural recall.' : 'Review Architectural Takeaway:'}</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            {workout.conceptExplanation}
          </p>
        </div>
      )}

      {/* Collapsible Quick Code Prompt */}
      {workout.quickCodePrompt && (
        <div className="mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={() => setShowCodePrompt(!showCodePrompt)}
            className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-200 transition"
          >
            <span className="flex items-center space-x-1.5">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span className="font-medium">Optional 5-Minute Micro Coding Exercise</span>
            </span>
            {showCodePrompt ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showCodePrompt && (
            <div className="mt-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <p className="font-medium text-slate-200">{workout.quickCodePrompt}</p>
              <pre className="font-mono text-[11px] text-emerald-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800 overflow-x-auto">
                {workout.codeStarterSnippet}
              </pre>
              <div className="text-[10px] text-slate-400 font-mono">
                Target Complexity: {workout.targetExpectedComplexity}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
