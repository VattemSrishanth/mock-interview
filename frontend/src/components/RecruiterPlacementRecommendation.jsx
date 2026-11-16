import React, { useMemo } from 'react';
import { Award, Briefcase, CheckCircle2, ChevronRight, Calendar, AlertCircle } from 'lucide-react';

export default function RecruiterPlacementRecommendation({ result }) {
  const score = Number(result?.overallScore) || 0;

  const verdict = useMemo(() => {
    if (score >= 85) {
      return {
        decision: 'STRONG HIRE',
        badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        summary: 'Candidate demonstrated exceptional architectural clarity, strong code fundamentals, and structured STAR communication. Fully recommended for campus placement onboarding.',
        readinessLevel: 'Top 5% Placement Ready'
      };
    }
    if (score >= 70) {
      return {
        decision: 'HIRE / RECOMMEND',
        badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
        summary: 'Clear conceptual grasp and solid problem-solving composure. Minor opportunities exist in articulating system scale trade-offs.',
        readinessLevel: 'Competitive Engineering Candidate'
      };
    }
    if (score >= 50) {
      return {
        decision: 'LEAN HIRE / PRACTICE',
        badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        summary: 'Solid foundational baseline. Candidate requires structured practice in concise technical terminology and reducing speech hesitation.',
        readinessLevel: 'Developing Candidate'
      };
    }
    return {
      decision: 'DEVELOPING',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      summary: 'Recommend completing 3 targeted practice rounds focused on core data structures and STAR interview response delivery.',
      readinessLevel: 'Early Practice Tier'
    };
  }, [score]);

  // Generate dynamic 7-day placement preparation plan
  const studyPlan = useMemo(() => {
    const weaknesses = result?.weaknesses || result?.improvements || [];
    const focusArea = weaknesses[0] || 'Technical Fundamentals & Code Complexity';

    return [
      { day: 'Day 1-2', focus: 'Core Concept Mastery', task: `Deep dive into ${focusArea} and study model answers.` },
      { day: 'Day 3-4', focus: 'STAR Delivery Practice', task: 'Articulate technical challenges using Situation, Task, Action, and Measurable Result.' },
      { day: 'Day 5-6', focus: 'Cadence & Telemetry', task: 'Practice with timer and speech telemetry aiming for 130-150 WPM.' },
      { day: 'Day 7', focus: 'Full Mock Simulation', task: 'Retake a 5-question mock interview to verify placement readiness score above 85%.' }
    ];
  }, [result]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-5 print:border-zinc-300 print:bg-white print-break-inside-avoid">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3 print:border-zinc-300">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Briefcase size={16} />
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-orange-400 block">
              Autonomous Hiring Evaluation
            </span>
            <h3 className="text-sm font-semibold text-white print:text-zinc-950">
              Recruiter Hiring Verdict & Placement Action Plan
            </h3>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold font-mono ${verdict.badgeColor}`}>
          <Award size={13} />
          {verdict.decision}
        </span>
      </div>

      <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-4 space-y-2 print:border-zinc-300 print:bg-zinc-50">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-zinc-400 font-semibold uppercase">Assessment Summary</span>
          <span className="text-[11px] font-mono text-orange-400 font-bold">{verdict.readinessLevel}</span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed print:text-zinc-800">
          {verdict.summary}
        </p>
      </div>

      {/* 7-Day Action Plan */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 print:text-zinc-900">
          <Calendar size={14} className="text-indigo-400" />
          <span>Recommended 7-Day Placement Acceleration Roadmap</span>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {studyPlan.map((step) => (
            <div
              key={step.day}
              className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 space-y-1 print:border-zinc-300 print:bg-zinc-50"
            >
              <span className="font-mono text-[10px] font-bold text-orange-400 block uppercase">
                {step.day} · {step.focus}
              </span>
              <p className="text-[11px] text-zinc-400 leading-normal print:text-zinc-700">
                {step.task}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
