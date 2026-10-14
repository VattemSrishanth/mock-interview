import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../api/analytics';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  CartesianGrid 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Target, 
  Award, 
  Zap,
  PlayCircle 
} from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getAnalytics()
      .then((res) => setData(res))
      .catch((err) => console.error("Analytics fetch failed:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-brand-500/20 border-t-brand-400 animate-spin" />
        <p className="text-slate-400 text-sm animate-pulse">Calculating performance metrics...</p>
      </div>
    );
  }

  const totalInterviews = data?.totalInterviews || 0;
  const completedInterviews = data?.completedInterviews || 0;
  const avgScore = data?.averageScore ? Math.round(data.averageScore) : 0;
  const totalQuestions = data?.skillWisePerformance?.reduce((acc, s) => acc + (s.evaluated || 0), 0) || (completedInterviews * 5);

  const skillChartData = (data?.skillWisePerformance && data.skillWisePerformance.length > 0)
    ? data.skillWisePerformance.map((item) => ({
        skill: item.skill || item.name || 'Skill',
        score: Math.round(item.score ?? 0)
      }))
    : [];

  const trendData = (data?.performanceOverTime && data.performanceOverTime.length > 0)
    ? data.performanceOverTime.map((item, idx) => ({
        session: item.date || `S${idx + 1}`,
        score: Math.round(item.score ?? 0),
        technical: Math.round(item.technical ?? 0),
        communication: Math.round(item.communication ?? 0)
      }))
    : [];

  const topStrengths = (data?.topStrengths && data.topStrengths.length > 0)
    ? data.topStrengths
    : (data?.skillWisePerformance || [])
        .filter((s) => (s.score || 0) >= 75)
        .slice(0, 3)
        .map((s) => `Demonstrated technical strength in ${s.skill} (${s.score}% competency score)`);

  const weakestAreas = (data?.weakestAreas && data.weakestAreas.length > 0)
    ? data.weakestAreas
    : (data?.recommendedPractice && data.recommendedPractice.length > 0)
        ? data.recommendedPractice
        : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-brand-400" />
          Performance & Readiness Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          In-depth skill proficiency, score trajectory, and hiring bar benchmarks
        </p>
      </div>

      {completedInterviews === 0 ? (
        <div className="p-10 rounded-2xl bg-[#0d1322] border border-white/10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto">
            <BarChart3 className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-white">No Completed Mock Interviews Yet</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Complete your first AI mock interview simulation to unlock calibrated 5-dimensional scores, skill competency charts, and trajectory analytics.
          </p>
          <div className="pt-2">
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 transition active:scale-95"
            >
              <PlayCircle className="w-4 h-4" /> Start First Mock Simulation
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0d1322] border border-white/5">
              <div className="text-xs text-slate-400 mb-1">Average Score</div>
              <div className="text-3xl font-black text-brand-400">{avgScore}%</div>
              <div className="text-[11px] text-emerald-400 mt-1">
                {avgScore >= 80 ? 'Tier 1 Strong Hire' : 'Solid progress'}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d1322] border border-white/5">
              <div className="text-xs text-slate-400 mb-1">Total Evaluated Questions</div>
              <div className="text-3xl font-black text-white">{totalQuestions}</div>
              <div className="text-[11px] text-indigo-400 mt-1">Evaluated across rubrics</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d1322] border border-white/5">
              <div className="text-xs text-slate-400 mb-1">Completed Interviews</div>
              <div className="text-3xl font-black text-white">{completedInterviews}</div>
              <div className="text-[11px] text-slate-400 mt-1">Simulations recorded</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0d1322] border border-white/5">
              <div className="text-xs text-slate-400 mb-1">Current Readiness Index</div>
              <div className="text-3xl font-black text-indigo-400">
                {avgScore >= 80 ? 'Tier 1 Hire' : avgScore >= 65 ? 'Tier 2 Ready' : 'Developing'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Product Tech Company Bar</div>
            </div>
          </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Skill Proficiency Bar Chart */}
        <div className="p-6 rounded-2xl bg-[#0d1322] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Skill Proficiency Scores</h3>
              <p className="text-[11px] text-slate-400">Evaluated average score by technical area</p>
            </div>
            <Zap className="w-4 h-4 text-brand-400" />
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="skill" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" domain={[0, 100]} fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1322', borderColor: '#1f293d', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="score" fill="#a855f7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progression Over Time Area Chart */}
        <div className="p-6 rounded-2xl bg-[#0d1322] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Score Trajectory Progression</h3>
              <p className="text-[11px] text-slate-400">Score improvement across chronological sessions</p>
            </div>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="session" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" domain={[40, 100]} fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1322', borderColor: '#1f293d', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Strengths & Focus Areas Matrix */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#0d1322] border border-emerald-500/20 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Top Validated Strengths
          </h3>
          <div className="space-y-2 text-xs text-slate-300">
            {topStrengths.map((s, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0d1322] border border-amber-500/20 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Priority Focus Areas
          </h3>
          <div className="space-y-2 text-xs text-slate-300">
            {weakestAreas.map((w, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
