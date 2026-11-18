import React from 'react';
import { Award, CheckCircle2, TrendingUp, AlertTriangle, HelpCircle } from 'lucide-react';

export default function StarEvaluationCard({ starEvaluation }) {
  if (!starEvaluation) return null;

  const {
    situationScore = 0,
    situationFeedback = '',
    taskScore = 0,
    taskFeedback = '',
    actionScore = 0,
    actionFeedback = '',
    resultScore = 0,
    resultFeedback = '',
    overallStarScore = 0,
    starVerdict = 'Structured',
    detectedStrengths = [],
    actionableImprovements = [],
  } = starEvaluation;

  const pillars = [
    { label: 'Situation (S)', score: situationScore, weight: '20%', feedback: situationFeedback, color: 'text-sky-400', bar: 'bg-sky-500' },
    { label: 'Task (T)', score: taskScore, weight: '20%', feedback: taskFeedback, color: 'text-indigo-400', bar: 'bg-indigo-500' },
    { label: 'Action (A)', score: actionScore, weight: '35%', feedback: actionFeedback, color: 'text-orange-400', bar: 'bg-orange-500' },
    { label: 'Result (R)', score: resultScore, weight: '25%', feedback: resultFeedback, color: 'text-emerald-400', bar: 'bg-emerald-500' },
  ];

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-400" />
            Behavioral STAR Technique Analysis
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Breakdown across Situation, Task, Action, and Quantifiable Results
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 font-medium">
            {starVerdict}
          </span>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block uppercase font-mono">STAR Index</span>
            <span className="text-2xl font-black font-mono text-white">{overallStarScore}<span className="text-xs text-slate-500 font-normal">/100</span></span>
          </div>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-5">
        {pillars.map((p, idx) => (
          <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-bold ${p.color}`}>{p.label}</span>
                <span className="text-xs font-mono font-semibold text-slate-300">{p.score}/10</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-2">
                <div className={`h-full rounded-full ${p.bar}`} style={{ width: `${p.score * 10}%` }}></div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{p.feedback}</p>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-3">Weight: {p.weight}</span>
          </div>
        ))}
      </div>

      {/* Strengths and Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80 text-xs">
        <div>
          <span className="font-semibold text-emerald-400 flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-4 h-4" /> Detected Narrative Strengths
          </span>
          <ul className="space-y-1.5">
            {detectedStrengths.length > 0 ? (
              detectedStrengths.map((str, i) => (
                <li key={i} className="text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-500">•</span>
                  <span>{str}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500">Provide structured STAR detail to unlock strengths.</li>
            )}
          </ul>
        </div>

        <div>
          <span className="font-semibold text-amber-400 flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-4 h-4" /> Actionable STAR Improvements
          </span>
          <ul className="space-y-1.5">
            {actionableImprovements.length > 0 ? (
              actionableImprovements.map((imp, i) => (
                <li key={i} className="text-slate-300 flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  <span>{imp}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-400">Response satisfies core STAR guidelines.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
