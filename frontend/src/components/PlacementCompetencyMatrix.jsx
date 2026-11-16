import React, { useMemo } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Award, CheckCircle2, TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';

const DIMENSIONS_CONFIG = [
  { key: 'technicalKnowledgeScore', label: 'Technical Knowledge', short: 'Technical', target: 80, desc: 'Conceptual depth, language fundamentals, and algorithm mechanics' },
  { key: 'communicationScore', label: 'Communication', short: 'Communication', target: 75, desc: 'Pacing, clarity, articulate delivery, and active engagement' },
  { key: 'relevanceScore', label: 'Relevance', short: 'Relevance', target: 80, desc: 'Addressing the exact question prompt without drifting' },
  { key: 'clarityScore', label: 'Clarity & Structure', short: 'Structure', target: 75, desc: 'Structured STAR explanation, trade-off analysis, and conciseness' },
  { key: 'confidenceScore', label: 'Confidence & Poise', short: 'Confidence', target: 70, desc: 'Tone firmness, decisive answers, and composed cadence' },
];

export default function PlacementCompetencyMatrix({ result }) {
  const chartData = useMemo(() => {
    return DIMENSIONS_CONFIG.map((dim) => {
      const score = Number(result?.[dim.key]) || 0;
      return {
        subject: dim.short,
        score,
        target: dim.target,
        fullMark: 100
      };
    });
  }, [result]);

  const avgScore = useMemo(() => {
    const scores = DIMENSIONS_CONFIG.map((d) => Number(result?.[d.key]) || 0);
    const sum = scores.reduce((acc, curr) => acc + curr, 0);
    return Math.round(sum / scores.length);
  }, [result]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6 space-y-6 print:border-zinc-300 print:bg-white print:p-4 print-break-inside-avoid">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4 print:border-zinc-300">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
            <Sparkles size={12} /> Campus Placement Competency Rubric
          </span>
          <h2 className="mt-1 text-lg font-semibold text-white print:text-zinc-950">5-Axis Placement Skill Matrix</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-zinc-400">Cohort Average:</span>
          <span className="font-mono text-sm font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full">
            {avgScore}/100
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] items-center">
        {/* Radar Graphic */}
        <div className="relative h-[290px] w-full flex items-center justify-center bg-zinc-950/40 rounded-lg border border-zinc-800/80 p-2 print:border-zinc-300 print:bg-white">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} outerRadius="72%">
              <PolarGrid stroke="#3f3f46" strokeDasharray="3 3" className="print:stroke-zinc-300" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#d4d4d8', fontSize: 11, fontWeight: 600 }}
                className="print:fill-zinc-900"
              />
              <PolarRadiusAxis 
                domain={[0, 100]} 
                tick={{ fill: '#71717a', fontSize: 9 }} 
                axisLine={false} 
                tickCount={5} 
              />
              {/* Benchmark target outline */}
              <Radar 
                name="Campus Benchmark" 
                dataKey="target" 
                stroke="#6366f1" 
                strokeDasharray="4 4"
                fill="#6366f1" 
                fillOpacity={0.05} 
                strokeWidth={1.5} 
              />
              {/* Candidate live score */}
              <Radar 
                name="Candidate Score" 
                dataKey="score" 
                stroke="#ff5c00" 
                fill="#ff5c00" 
                fillOpacity={0.22} 
                strokeWidth={2.5} 
              />
            </RadarChart>
          </ResponsiveContainer>
          <div className="absolute bottom-2 right-3 flex items-center gap-3 text-[10px] font-mono text-zinc-500 print:text-zinc-600">
            <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-orange-500 inline-block"></span> Candidate</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-indigo-500 inline-block border-t border-dashed"></span> Benchmark</span>
          </div>
        </div>

        {/* Detailed Rubric Dimension List */}
        <div className="space-y-3">
          {DIMENSIONS_CONFIG.map((dim) => {
            const score = Number(result?.[dim.key]) || 0;
            const diff = score - dim.target;
            const isTargetMet = diff >= 0;

            return (
              <div 
                key={dim.key} 
                className="rounded-lg border border-zinc-800/80 bg-zinc-950/50 p-3 space-y-1.5 hover:border-zinc-700 transition print:border-zinc-300 print:bg-white"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-zinc-200 print:text-zinc-900">
                    {isTargetMet ? (
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    ) : (
                      <ShieldAlert size={13} className="text-amber-400 shrink-0" />
                    )}
                    <span>{dim.label}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-xs text-zinc-400 font-normal">Target {dim.target}</span>
                    <span className={`text-sm font-bold ${score >= 80 ? 'text-emerald-400' : score >= 65 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {score}%
                    </span>
                  </div>
                </div>

                {/* Progress bar with target indicator */}
                <div className="relative h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden print:bg-zinc-200">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${score >= 80 ? 'bg-emerald-500' : score >= 65 ? 'bg-orange-500' : 'bg-rose-500'}`}
                    style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
                  />
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed print:text-zinc-600">
                  {dim.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
