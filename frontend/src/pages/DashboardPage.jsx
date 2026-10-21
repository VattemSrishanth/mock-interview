import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewApi } from '../api/interview';
import { analyticsApi } from '../api/analytics';
import { Activity, ArrowRight, AudioLines, BarChart3, CalendarDays, ChevronRight, CircleDot, Clock3, Layers3, Play, Plus, RotateCcw, Target } from 'lucide-react';

const mono = 'font-mono text-[10px] uppercase tracking-wider';
const toDay = (date) => new Date(date).toLocaleDateString('en-CA');

export default function DashboardPage({ onOpenCoach }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([interviewApi.getAll().catch(() => []), analyticsApi.getAnalytics().catch(() => null)])
      .then(([sessions, data]) => { if (mounted) { setInterviews(Array.isArray(sessions) ? sessions : []); setAnalytics(data); } })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const activity = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 83);
    const counts = new Map();
    interviews.forEach((item) => {
      const date = item.completedAt || item.createdAt;
      if (date) { const key = toDay(date); counts.set(key, (counts.get(key) || 0) + 1); }
    });
    return Array.from({ length: 84 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      const count = counts.get(toDay(day)) || 0;
      return { day, count };
    });
  }, [interviews]);

  const completed = analytics?.completedInterviews ?? interviews.filter((item) => item.status === 'COMPLETED').length;
  const average = Number(analytics?.averageScore || 0);
  const streak = analytics?.currentStreak ?? user?.interviewStreak ?? 0;
  const sessions = useMemo(() => [...interviews]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 6), [interviews]);

  const metrics = [
    { label: 'Completed sessions', value: completed, unit: 'sessions', Icon: Layers3, note: `${analytics?.totalInterviews ?? interviews.length} total recorded` },
    { label: 'Average provider score', value: average > 0 ? Math.round(average) : '—', unit: average > 0 ? '/ 100' : 'no score', Icon: Target, note: 'Provider scores only' },
    { label: 'Practice streak', value: streak, unit: 'days', Icon: Activity, note: 'Distinct practice days' },
    { label: 'Best provider score', value: analytics?.bestScore > 0 ? analytics.bestScore : '—', unit: analytics?.bestScore > 0 ? '/ 100' : 'no score', Icon: BarChart3, note: 'Highest saved evaluation score' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-7 sm:py-10">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-zinc-800 pb-6">
        <div><p className={`${mono} flex items-center gap-2 text-orange-400`}><CircleDot size={11} /> Candidate workspace / overview</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Good to see you, {user?.name?.split(' ')[0] || 'Candidate'}.</h1><p className="mt-2 text-sm text-zinc-400">Your practice history and recorded evaluation data.</p></div>
        <div className="flex gap-2"><button onClick={onOpenCoach} className="rounded-md border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:border-zinc-500">Ask career coach</button><Link to="/create" className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-3.5 py-2 text-xs font-semibold text-zinc-950 hover:bg-orange-400"><Plus size={14} /> New interview</Link></div>
      </header>

      <section className="grid gap-3 py-5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Practice telemetry">
        {metrics.map(({ label, value, unit, Icon, note }, index) => <article key={label} className="min-w-0 rounded-md border border-zinc-800 bg-zinc-900/60 p-4"><div className="flex items-center justify-between"><span className={`${mono} text-zinc-500`}>{label}</span><Icon size={15} className="text-orange-400" /></div><div className="mt-5 flex min-h-9 items-baseline gap-2"><strong className="truncate font-mono text-2xl font-medium tabular-nums text-zinc-100">{value}</strong><span className="text-xs text-zinc-500">{unit}</span></div><div className="mt-3 border-t border-zinc-800 pt-2 font-mono text-[10px] text-zinc-600">{note}</div><div className="mt-3 h-0.5 bg-zinc-800"><div className="h-full bg-orange-500" style={{ width: `${index === 1 && average ? Math.max(2, Math.min(100, average)) : Math.min(100, Number(value) || 4)}%` }} /></div></article>)}
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-md border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3"><div><p className={`${mono} flex items-center gap-2 text-zinc-500`}><CalendarDays size={13} className="text-orange-400" /> Practice activity / 12 weeks</p><h2 className="mt-2 text-lg font-medium text-white">Consistency, by day</h2></div><span className={`${mono} text-zinc-600`}>{interviews.length} saved</span></div>
          <div className="mt-5 overflow-x-auto pb-1"><div className="grid w-max grid-flow-col grid-rows-7 gap-1" role="img" aria-label="Interview activity for the past 12 weeks">{activity.map(({ day, count }) => <span key={day.toISOString()} title={`${day.toLocaleDateString()}: ${count} interview${count === 1 ? '' : 's'}`} className={`h-3.5 w-3.5 rounded-[2px] border border-zinc-800 ${count === 0 ? 'bg-zinc-950' : count === 1 ? 'bg-orange-900' : count < 4 ? 'bg-orange-700' : 'bg-orange-500'}`} />)}</div></div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-600"><span>Older</span><div className="flex items-center gap-1.5">Less <i className="h-3 w-3 rounded-sm border border-zinc-800 bg-zinc-950" /><i className="h-3 w-3 rounded-sm bg-orange-900" /><i className="h-3 w-3 rounded-sm bg-orange-700" /><i className="h-3 w-3 rounded-sm bg-orange-500" /> More</div><span>Today</span></div>
        </section>

        <section className="rounded-md border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5"><div className="flex items-center justify-between"><div><p className={`${mono} text-zinc-500`}>Next action</p><h2 className="mt-2 text-lg font-medium text-white">Keep the loop focused.</h2></div><RotateCcw size={16} className="text-orange-400" /></div><p className="mt-3 text-sm leading-6 text-zinc-400">Choose a role and interview track. Your completed sessions and provider scores will build the record below.</p><div className="mt-5 space-y-2"><Link to="/create" className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-950/70 px-3 py-3 text-sm text-zinc-200 hover:border-zinc-600"><span className="flex items-center gap-2"><Play size={14} className="text-orange-400" /> Configure a practice interview</span><ChevronRight size={15} /></Link><Link to="/analytics" className="flex items-center justify-between rounded border border-zinc-800 px-3 py-3 text-sm text-zinc-400 hover:text-zinc-200"><span className="flex items-center gap-2"><BarChart3 size={14} /> View all recorded analytics</span><ChevronRight size={15} /></Link></div></section>
      </div>

      <section className="mt-4 rounded-md border border-zinc-800 bg-zinc-900/50">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-4 py-4 sm:px-5"><div><p className={`${mono} text-zinc-500`}>Session log</p><h2 className="mt-1 text-lg font-medium text-white">Recent interviews</h2></div><Link to="/history" className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white">Full history <ArrowRight size={13} /></Link></div>
        {loading ? <div className="px-5 py-10 text-center font-mono text-xs text-zinc-500">Loading saved sessions…</div> : sessions.length === 0 ? <div className="px-5 py-10 text-center"><AudioLines size={19} className="mx-auto text-zinc-600" /><p className="mt-3 text-sm text-zinc-300">No sessions recorded yet</p><p className="mt-1 text-xs text-zinc-500">Your interview history will appear here.</p><Link to="/create" className="mt-4 inline-flex items-center gap-2 rounded border border-zinc-700 px-3 py-2 text-xs text-zinc-200 hover:border-orange-500/60">Start first session <ArrowRight size={13} /></Link></div> : <div className="overflow-x-auto"><table className="w-full min-w-[660px] text-left text-xs"><thead className={`${mono} text-zinc-600`}><tr><th className="px-5 py-3 font-normal">Role / track</th><th className="px-3 py-3 font-normal">Level</th><th className="px-3 py-3 font-normal">Date</th><th className="px-3 py-3 font-normal">Duration</th><th className="px-3 py-3 font-normal">Status</th><th className="px-3 py-3 font-normal">Score</th><th className="px-5 py-3 text-right font-normal">Open</th></tr></thead><tbody>{sessions.map((item) => { const done = item.status === 'COMPLETED'; const score = item.overallScore; return <tr key={item.id} className="border-t border-zinc-800/80 hover:bg-zinc-800/20"><td className="px-5 py-3.5"><span className="block font-medium text-zinc-200">{item.jobRole || 'Technical interview'}</span><span className="mt-1 block text-[10px] text-zinc-500">{item.interviewType || 'General'}</span></td><td className="px-3 py-3 text-zinc-400">{item.experience || item.difficulty || '—'}</td><td className="px-3 py-3 font-mono tabular-nums text-zinc-400">{item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}</td><td className="px-3 py-3 font-mono tabular-nums text-zinc-400">{item.durationSeconds ? `${Math.round(item.durationSeconds / 60)}m` : '—'}</td><td className="px-3 py-3"><span className={`inline-flex items-center gap-1.5 font-mono text-[10px] ${done ? 'text-orange-400' : 'text-zinc-500'}`}><i className={`h-1.5 w-1.5 rounded-full ${done ? 'bg-orange-500' : 'bg-zinc-600'}`} />{done ? (score == null ? 'NEEDS REVIEW' : 'COMPLETED') : 'IN PROGRESS'}</span></td><td className="px-3 py-3"><div className="flex items-center gap-2"><span className="w-9 font-mono tabular-nums text-zinc-300">{score == null ? '—' : score}</span><div className="h-1 w-16 bg-zinc-800"><div className="h-full bg-orange-500" style={{ width: `${Math.max(0, Math.min(100, score || 0))}%` }} /></div></div></td><td className="px-5 py-3 text-right"><button onClick={() => navigate(done ? `/interviews/${item.id}/result` : `/interviews/${item.id}`)} className="rounded border border-zinc-800 px-2.5 py-1.5 text-zinc-400 hover:border-zinc-600 hover:text-white">{done ? 'Review' : 'Resume'}</button></td></tr>; })}</tbody></table></div>}
      </section>
      <p className="mt-3 flex items-center gap-1.5 text-[10px] text-zinc-600"><Clock3 size={11} /> Summary values reflect saved interview and evaluation records.</p>
    </div>
  );
}
