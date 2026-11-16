import React, { useMemo } from 'react';
import { Award, Users, TrendingUp, BarChart3, CheckCircle } from 'lucide-react';
import { calculatePercentile, formatPercentileHeadline, buildCohortBreakdown } from '../utils/peerBenchmarkUtils';

export default function PeerBenchmarkCard({ result }) {
  const overallScore = result?.overallScore;
  const percentile = useMemo(() => calculatePercentile(overallScore, 'overall'), [overallScore]);
  const headline = useMemo(() => formatPercentileHeadline(percentile, result?.jobRole || 'Engineering'), [percentile, result]);
  const cohortBreakdown = useMemo(() => buildCohortBreakdown(result), [result]);

  if (overallScore == null || percentile == null) return null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4 print:border-zinc-300 print:bg-white print-break-inside-avoid">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3 print:border-zinc-300">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Users size={16} />
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-indigo-400 block">
              Peer Cohort Analytics
            </span>
            <h3 className="text-sm font-semibold text-white print:text-zinc-950">
              Campus Percentile Ranking
            </h3>
          </div>
        </div>

        {headline && (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold font-mono ${headline.badgeColor}`}>
            <Award size={13} />
            {headline.badge}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs text-zinc-300 leading-relaxed print:text-zinc-700">
          {headline.description}
        </p>

        {/* Dimension Percentiles Grid */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5 pt-2">
          {cohortBreakdown.map((item) => (
            <div 
              key={item.dimension}
              className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-2.5 space-y-1 print:border-zinc-300 print:bg-zinc-50"
            >
              <span className="font-mono text-[10px] text-zinc-400 block truncate">
                {item.dimension}
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-base font-bold text-white print:text-zinc-950">
                  {item.percentile}th
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  {item.score}%
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono">
                &gt; {item.higherThan}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
