import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, AudioLines, ChartNoAxesCombined, Check, ChevronRight, CircleDot, Copy, Gauge, ShieldCheck, Terminal, TimerReset } from 'lucide-react';

const prompts = {
  'Staff Backend': 'How would you evolve a single-region order service to support multi-region writes while preserving consistency guarantees?',
  'System Design': 'Design a rate limiter for a global API. How would you handle bursts, clock skew, and regional failover?',
  'Distributed Systems': 'A consumer processes the same event twice after a retry. How do you make the workflow safe and observable?'
};
const demoCredentials = { student: ['srishanth@intervai.com', 'password123'], studentFallback: ['revanth@intervai.com', 'password123'], admin: ['admin@intervai.com', 'admin123'] };
const mono = 'font-mono text-[11px] uppercase tracking-wider';

export default function LandingPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [track, setTrack] = useState('Staff Backend');
  const [visiblePrompt, setVisiblePrompt] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setVisiblePrompt('');
    let i = 0;
    const timer = window.setInterval(() => {
      i += 2;
      setVisiblePrompt(prompts[track].slice(0, i));
      if (i >= prompts[track].length) window.clearInterval(timer);
    }, 18);
    return () => window.clearInterval(timer);
  }, [track]);

  const handleQuickDemo = async (role) => {
    const credentials = role === 'admin' ? [demoCredentials.admin] : [demoCredentials.student, demoCredentials.studentFallback];
    try {
      let lastError;
      for (const [email, password] of credentials) {
        try { await login({ email, password }); lastError = null; break; } catch (error) { lastError = error; }
      }
      if (lastError) throw lastError;
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch {
      navigate('/login');
    }
  };

  const copyPrompt = async () => {
    await navigator.clipboard?.writeText(prompts[track]);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="min-h-screen text-zinc-100">
      <section className="relative border-b border-zinc-800 px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20">
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className={`${mono} mb-7 inline-flex items-center gap-2 text-orange-400`}><CircleDot size={12} /> Interview systems / 01</div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-.045em] text-white sm:text-6xl">Deterministic Technical Interview Benchmarking</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400">A focused workspace for technical practice, structured feedback, and a clear record of how each session went.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={isAuthenticated ? '/dashboard' : '/register'} className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-orange-400">{isAuthenticated ? 'Open dashboard' : 'Start a practice session'}<ArrowRight size={16} /></Link>
              <Link to={isAuthenticated ? '/create' : '/login'} className="rounded-md border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-200 transition hover:border-zinc-500">{isAuthenticated ? 'Configure interview' : 'Sign in'} <span className="ml-2 font-mono text-xs text-zinc-500">↵</span></Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              <button onClick={() => handleQuickDemo('student')} className="rounded border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-200">Open candidate demo · V Srishanth</button>
              <button onClick={() => handleQuickDemo('admin')} className="rounded border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-200">Open admin demo</button>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }} className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/90 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <div className="flex items-center gap-2"><Terminal size={15} className="text-orange-400" /><span className={mono}>Live role prompt preview</span></div>
              <span className={`${mono} flex items-center gap-2 text-zinc-500`}><i className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Preview</span>
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex flex-wrap gap-2">
                {Object.keys(prompts).map((name) => <button key={name} onClick={() => setTrack(name)} className={`rounded border px-2.5 py-1.5 text-xs transition ${track === name ? 'border-orange-500/50 bg-orange-500/10 text-orange-300' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>{name}</button>)}
              </div>
              <div className="mt-5 min-h-36 rounded-md border border-zinc-800 bg-zinc-950 p-4">
                <div className={`${mono} text-zinc-600`}><span className="text-orange-400">01</span> / interviewer prompt</div>
                <p className="mt-4 font-mono text-sm leading-7 text-zinc-200">{visiblePrompt}<span className="ml-0.5 inline-block h-4 w-1 animate-pulse bg-orange-500 align-middle" /></p>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-zinc-800 pt-3">
                <span className={`${mono} text-zinc-500`}>Illustrative prompt · no live provider call</span>
                <button onClick={copyPrompt} className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white">{copied ? <Check size={13} /> : <Copy size={13} />}{copied ? 'Copied' : 'Copy'}</button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-2 border-b border-zinc-800 py-4 sm:grid-cols-4">
          {['Browser speech input', 'Question-level feedback', 'Five score dimensions', 'Saved session history'].map((label, i) => <div key={label} className="flex items-center gap-2 py-2 text-xs text-zinc-400"><span className="font-mono text-orange-500">0{i + 1}</span>{label}</div>)}
        </div>

        <section className="py-14 sm:py-20">
          <div className="mb-7 flex items-end justify-between gap-4"><div><p className={`${mono} text-orange-400`}>System modules</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">A clear signal after every session.</h2></div><Link to={isAuthenticated ? '/create' : '/register'} className="hidden items-center gap-1 text-sm text-zinc-400 hover:text-white sm:flex">Explore the workspace <ChevronRight size={15} /></Link></div>
          <div className="grid gap-3 md:grid-cols-3">
            <article className="row-span-2 rounded-lg border border-zinc-800 bg-zinc-900/70 p-5 md:col-span-1">
              <div className="flex items-center justify-between"><AudioLines className="text-orange-400" size={19} /><span className={mono + ' text-zinc-600'}>INPUT / 01</span></div><h3 className="mt-8 text-lg font-medium text-white">Voice or text, your choice.</h3><p className="mt-2 text-sm leading-6 text-zinc-400">Use browser speech recognition when available. Your typed response stays editable and can be submitted on its own.</p>
              <div className="mt-7 flex h-12 items-end gap-1 border-b border-zinc-800 pb-2" aria-label="Illustrative audio waveform">{[15,28,19,38,24,34,13,25,39,20,30,15,28,18,34,22,12,30,19,25].map((h, i) => <span key={i} className="flex-1 rounded-t-sm bg-orange-500/70" style={{ height: `${h}px` }} />)}</div><p className={`${mono} mt-2 text-zinc-600`}>Waveform illustration · not a live meter</p>
            </article>
            <article className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5 md:col-span-2">
              <div className="flex items-center justify-between"><ChartNoAxesCombined className="text-orange-400" size={19} /><span className={mono + ' text-zinc-600'}>EVALUATION / 02</span></div><h3 className="mt-6 text-lg font-medium text-white">Five dimensions. One consistent rubric.</h3><p className="mt-2 text-sm leading-6 text-zinc-400">Provider evaluations separate technical knowledge, communication, relevance, clarity, and confidence. Fallback guidance is labeled clearly.</p>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">{['Technical knowledge', 'Communication', 'Relevance', 'Clarity', 'Confidence'].map((label, i) => <div key={label} className="border-l border-zinc-700 pl-2.5"><span className={`${mono} text-orange-400`}>0{i + 1}</span><p className="mt-1 text-xs text-zinc-300">{label}</p></div>)}</div>
            </article>
            <article className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5 md:col-span-2">
              <div className="flex items-center justify-between"><ShieldCheck className="text-orange-400" size={19} /><span className={mono + ' text-zinc-600'}>RECORD / 03</span></div><h3 className="mt-6 text-lg font-medium text-white">A reviewable practice record.</h3><p className="mt-2 text-sm leading-6 text-zinc-400">Return to saved interviews, inspect each answer, and use session feedback to choose what to practice next.</p><div className="mt-5 flex items-center gap-2 border-t border-zinc-800 pt-4 text-xs text-zinc-500"><TimerReset size={14} className="text-orange-400" /> Saved sessions and score dimensions appear when recorded.</div>
            </article>
            <article className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
              <div className="flex items-center justify-between"><Gauge className="text-orange-400" size={19} /><span className={mono + ' text-zinc-600'}>WORKFLOW / 04</span></div><h3 className="mt-6 text-lg font-medium text-white">Built for deliberate reps.</h3><p className="mt-2 text-sm leading-6 text-zinc-400">Configure a role, answer at your pace, then review what the saved feedback supports.</p><Link to={isAuthenticated ? '/create' : '/register'} className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-orange-400 hover:text-orange-300">Configure a session <ArrowRight size={14} /></Link>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
