import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Sparkles, BookOpen, Layers, Lightbulb, Copy, Check } from 'lucide-react';

export default function ModelAnswerComparisonModal({ isOpen, onClose, question, questionIndex }) {
  const [copiedSection, setCopiedSection] = useState(null);

  if (!isOpen || !question) return null;

  const candidateAnswer = question.userAnswer || question.candidateAnswer || '';
  const modelAnswer = question.modelAnswer || question.expectedAnswer || 'Model answer not available for this question.';
  const feedback = question.feedback || {};
  const score = feedback.score ?? question.score ?? null;

  const handleCopy = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 font-mono text-sm font-bold border border-orange-500/20">
              Q{questionIndex + 1}
            </span>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Sparkles size={11} className="text-orange-400" /> Deep Comparative Answer Analysis
              </span>
              <h3 className="text-sm font-semibold text-white truncate max-w-xl">
                {question.questionText}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Question Summary Bar */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-zinc-400">Target Skill: <strong className="text-zinc-200">{question.targetSkill || 'Core Engineering'}</strong></span>
              {score != null && (
                <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : score >= 60 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  Score: {score}/100
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-200 font-medium leading-relaxed">
              {question.questionText}
            </p>
          </div>

          {/* Side-by-Side Comparison Columns */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Candidate Submission */}
            <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/60 text-xs">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-orange-400" /> Your Recorded Answer
                </span>
                {candidateAnswer && (
                  <button 
                    onClick={() => handleCopy(candidateAnswer, 'candidate')}
                    className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition"
                  >
                    {copiedSection === 'candidate' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {copiedSection === 'candidate' ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              <div className="p-4 flex-1 text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">
                {candidateAnswer || (
                  <p className="text-zinc-500 italic">No verbal or written answer was submitted for this question.</p>
                )}
              </div>
            </div>

            {/* Model Gold-Standard Answer */}
            <div className="flex flex-col rounded-xl border border-indigo-500/30 bg-indigo-950/10 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-indigo-500/20 bg-indigo-950/30 text-xs">
                <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" /> Model Reference Answer
                </span>
                <button 
                  onClick={() => handleCopy(modelAnswer, 'model')}
                  className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition"
                >
                  {copiedSection === 'model' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  {copiedSection === 'model' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="p-4 flex-1 text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">
                {modelAnswer}
              </div>
            </div>
          </div>

          {/* STAR & Placement Refinement Tips */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <Lightbulb size={14} className="text-amber-400" />
              <span>Placement Coaching & STAR Technique Refinement</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 text-xs text-zinc-300">
              <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3">
                <span className="font-mono text-[10px] text-zinc-500 uppercase block mb-1">Key Conceptual Strengths:</span>
                <p className="text-zinc-400">
                  {feedback.strengths?.length 
                    ? feedback.strengths.join(' · ') 
                    : 'Clear direct response structure and identifiable core terminology.'}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3">
                <span className="font-mono text-[10px] text-zinc-500 uppercase block mb-1">Recommended Enhancement:</span>
                <p className="text-amber-200/90">
                  {feedback.suggestions?.length 
                    ? feedback.suggestions.join(' · ') 
                    : 'Quantify metrics or architectural trade-offs to stand out to senior technical interviewers.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-800 bg-zinc-900/60 text-xs text-zinc-400">
          <span className="font-mono text-[11px]">IntervAI Diagnostic Engine v2.4</span>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white transition font-medium"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
