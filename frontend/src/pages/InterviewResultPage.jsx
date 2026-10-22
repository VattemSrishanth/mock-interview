import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { interviewApi } from '../api/interview';
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Check, Clipboard, FileDown, Flag, RotateCcw, Zap, Activity, Gauge, MessageSquare, Sparkles, Share2 } from 'lucide-react';
import ShareInterviewModal from '../components/ShareInterviewModal';
import { analyzeSpeechTelemetry } from '../utils/speechTelemetry';

const mono = 'font-mono text-[10px] uppercase tracking-wider';
const dimensions = [
  ['Technical knowledge', 'technicalKnowledgeScore'],
  ['Communication', 'communicationScore'],
  ['Relevance', 'relevanceScore'],
  ['Clarity', 'clarityScore'],
  ['Confidence', 'confidenceScore'],
];

const CompetencyRadar = React.memo(function CompetencyRadar({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid stroke="currentColor" className="text-zinc-800" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 9 }} axisLine={false} tickCount={5} />
        <Radar dataKey="score" stroke="#ff5c00" fill="#ff5c00" fillOpacity={0.16} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
});

export default function InterviewResultPage({ onOpenCoach }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    interviewApi.getResult(id).then((data) => { if (active) setResult(data); }).catch(() => { if (active) setError('Unable to load the saved interview report.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const providerScored = result?.evaluationSource === 'AI_PROVIDER' && result.overallScore != null;
  const chartData = useMemo(() => dimensions.map(([name, key]) => ({ subject: name, score: Number(result?.[key]) || 0 })), [result]);
  const sessionTelemetry = useMemo(() => {
    if (!result?.questions?.length) return null;
    const allAnswers = result.questions.map((q) => q.userAnswer || q.candidateAnswer || '').filter(Boolean).join(' ');
    if (!allAnswers) return null;
    const duration = result.durationSeconds || Math.max(30, result.questions.length * 60);
    return analyzeSpeechTelemetry(allAnswers, duration);
  }, [result]);
  const summaryText = useMemo(() => {
    if (!result) return '';
    const score = providerScored ? `${result.overallScore}/100` : 'No provider score';
    return [`Interview assessment: ${result.jobRole || 'Technical interview'}`, `Track: ${result.interviewType || '—'} · ${result.difficulty || '—'}`, `Provider score: ${score}`, `Evaluation source: ${result.evaluationSource || 'Not recorded'}`, ...dimensions.map(([label, key]) => `${label}: ${providerScored && result[key] != null ? `${result[key]}/100` : 'Not scored'}`)].join('\n');
  }, [providerScored, result]);

  const copySummary = async () => {
    try { await navigator.clipboard.writeText(summaryText); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { setError('Clipboard access is unavailable. You can still print or save this report.'); }
  };

  if (loading) return <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center"><p className={`${mono} text-zinc-500`}>Loading saved assessment…</p></div>;
  if (error && !result) return <div className="mx-auto max-w-lg px-5 py-20 text-center"><AlertTriangle size={23} className="mx-auto text-orange-400" /><h1 className="mt-4 text-lg font-medium text-white">Report unavailable</h1><p className="mt-2 text-sm text-zinc-400">{error}</p><button onClick={() => navigate('/dashboard')} className="mt-5 rounded border border-zinc-700 px-3 py-2 text-xs text-zinc-200">Return to dashboard</button></div>;

  const questions = result.questions || [];
  return <div className="mx-auto max-w-6xl px-4 py-7 sm:px-7 sm:py-10">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden"><Link to="/history" className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white"><ArrowLeft size={14} /> Session history</Link><div className="flex gap-2"><button onClick={() => setIsShareModalOpen(true)} className="inline-flex items-center gap-1.5 rounded border border-brand-500/30 bg-brand-500/10 px-3 py-2 text-xs font-semibold text-brand-300 hover:bg-brand-500/20 hover:text-white transition"><Share2 size={13} /> Share Report</button><button onClick={copySummary} className="inline-flex items-center gap-1.5 rounded border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:text-white">{copied ? <Check size={13} /> : <Clipboard size={13} />}{copied ? 'Copied' : 'Copy summary'}</button><button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:text-white"><FileDown size={13} /> Export / PDF</button></div></div>
    {error && result && <p role="status" className="mb-3 text-xs text-orange-400">{error}</p>}

    <header className="grid gap-6 rounded-md border border-zinc-800 bg-zinc-900/60 p-5 sm:p-7 lg:grid-cols-[1fr_260px]">
      <div><p className={`${mono} flex items-center gap-2 text-orange-400`}><Flag size={12} /> Interview assessment dossier</p><h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-4xl">{result.jobRole || 'Technical interview'} Performance Scorecard</h1><div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] uppercase text-zinc-500"><span>{result.interviewType || 'Interview'} track</span><span>{result.difficulty || 'Level not recorded'}</span><span>{result.status || 'COMPLETED'}</span>{result.interviewSource && result.interviewSource !== 'PRESET' && <span className="text-orange-400 font-semibold">• {result.interviewSource === 'RESUME' ? 'RESUME-DRIVEN' : result.interviewSource === 'JOB_DESCRIPTION' ? 'JD-TARGETED' : 'RESUME & JD MATCH'}</span>}</div><p className="mt-5 max-w-2xl text-sm leading-6 text-zinc-400">Assessment values shown here reflect the saved interview response. Provider scores and practice guidance are identified separately.</p>
        <div className="mt-5 flex flex-wrap gap-2 print:hidden"><Link to="/create" className="inline-flex items-center gap-2 rounded bg-orange-500 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-orange-400"><RotateCcw size={13} /> Practice another</Link><button onClick={onOpenCoach} className="rounded border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:text-white">Open career coach</button></div>
      </div>
      <div className="flex min-h-36 flex-col justify-between rounded border border-zinc-800 bg-zinc-950/60 p-4"><span className={mono + ' text-zinc-500'}>Overall provider score</span><div className="font-mono text-5xl font-medium tabular-nums tracking-tight text-white">{providerScored ? `${result.overallScore}%` : '—'}<span className="ml-2 text-base text-zinc-600">/ 100</span></div><span className={`${mono} text-orange-400`}>{providerScored ? 'AI_PROVIDER · SCORED' : result.evaluationSource === 'HEURISTIC' ? 'HEURISTIC · GUIDANCE ONLY' : 'NO PROVIDER SCORE'}</span></div>
    </header>

    {!providerScored && <div className="mt-3 border border-orange-500/20 bg-orange-500/5 px-4 py-3 text-xs leading-5 text-zinc-300"><span className="font-mono text-orange-400">Guidance only</span><span className="ml-2">{result.evaluationSource === 'HEURISTIC' ? 'A provider evaluation was unavailable. This session has qualitative practice guidance and no answer quality score.' : 'No provider evaluation score was saved for this session.'}</span></div>}

    {providerScored && <section className="mt-4 grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
      <article className="rounded-md border border-zinc-800 bg-zinc-900/50 p-4"><div className="flex items-center justify-between"><div><p className={mono + ' text-zinc-500'}>Competency map</p><h2 className="mt-1 text-base font-medium text-white">Saved rubric scores</h2></div><span className={mono + ' text-orange-400'}>5 dimensions</span></div><div className="mt-2 h-[270px] w-full"><CompetencyRadar data={chartData} /></div></article>
      <article className="rounded-md border border-zinc-800 bg-zinc-900/50 p-4"><p className={mono + ' text-zinc-500'}>Dimension detail</p><h2 className="mt-1 text-base font-medium text-white">Evaluation breakdown</h2><div className="mt-5 space-y-4">{dimensions.map(([label, key]) => { const score = Number(result[key]) || 0; return <div key={key}><div className="mb-1.5 flex items-center justify-between text-xs"><span className="text-zinc-300">{label}</span><span className="font-mono tabular-nums text-orange-400">{score}</span></div><div className="h-1 bg-zinc-800"><div className="h-full bg-orange-500" style={{ width: `${Math.max(0, Math.min(100, score))}%` }} /></div></div>; })}</div></article>
    </section>}

    {(result.strengths?.length || (result.weaknesses || result.improvements)?.length || (result.recommendations || result.suggestions)?.length) ? <section className="mt-4 grid gap-3 md:grid-cols-3">{[["Observed strengths", result.strengths, 'text-orange-400'], ['Areas to develop', result.weaknesses || result.improvements, 'text-zinc-300'], ['Next practice', result.recommendations || result.suggestions, 'text-zinc-300']].map(([title, list, accent]) => list?.length ? <article key={title} className="rounded-md border border-zinc-800 bg-zinc-900/50 p-4"><p className={`${mono} ${accent}`}>{title}</p><ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-400">{list.map((entry, index) => <li key={`${title}-${index}`} className="flex gap-2"><span className="font-mono text-zinc-600">{String(index + 1).padStart(2, '0')}</span><span>{entry}</span></li>)}</ul></article> : null)}</section> : null}

    {/* Speech & Communication Telemetry Dossier */}
    {sessionTelemetry && (
      <section className="mt-4 rounded-md border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <div>
            <p className={`${mono} text-indigo-400 flex items-center gap-1.5`}>
              <Activity size={12} /> Communication & Speech Telemetry
            </p>
            <h2 className="mt-1 text-lg font-medium text-white">Delivery Pacing & Articulation Breakdown</h2>
          </div>
          <span className={`${mono} px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20`}>
            {sessionTelemetry.totalWords} Total Words Analyzed
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-1">
            <span className={`${mono} text-zinc-500 flex items-center gap-1`}>
              <Gauge size={12} className="text-indigo-400" /> Average Pacing
            </span>
            <div className="font-mono text-2xl font-bold text-white">
              {sessionTelemetry.wordsPerMinute} <span className="text-xs text-zinc-500 font-normal">WPM</span>
            </div>
            <p className="text-xs text-emerald-400 font-medium">{sessionTelemetry.pacingLabel}</p>
          </div>

          <div className="rounded border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-1">
            <span className={`${mono} text-zinc-500 flex items-center gap-1`}>
              <MessageSquare size={12} className="text-amber-400" /> Filler Word Frequency
            </span>
            <div className="font-mono text-2xl font-bold text-white">
              {sessionTelemetry.fillerCount} <span className="text-xs text-zinc-500 font-normal">({sessionTelemetry.fillerPercentage}%)</span>
            </div>
            <p className="text-xs text-amber-300 font-medium">{sessionTelemetry.fillerLabel}</p>
          </div>

          <div className="rounded border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-1">
            <span className={`${mono} text-zinc-500 flex items-center gap-1`}>
              <Sparkles size={12} className="text-cyan-400" /> Delivery Time
            </span>
            <div className="font-mono text-2xl font-bold text-white">
              {sessionTelemetry.durationSeconds} <span className="text-xs text-zinc-500 font-normal">seconds</span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              {(sessionTelemetry.durationSeconds / Math.max(1, sessionTelemetry.totalWords)).toFixed(2)}s per word
            </p>
          </div>
        </div>

        {sessionTelemetry.fillerCount > 0 && (
          <div className="rounded border border-zinc-800/80 bg-zinc-950/40 p-3">
            <p className={`${mono} text-zinc-500 mb-2`}>Detected Verbal Filler Instances</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(sessionTelemetry.fillerBreakdown).map(([word, count]) => (
                <span key={word} className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-mono">
                  "{word}" <strong className="text-amber-400">×{count}</strong>
                </span>
              ))}
            </div>
          </div>
        )}

        {sessionTelemetry.tips?.length > 0 && (
          <div className="rounded border border-indigo-500/20 bg-indigo-950/20 p-3 space-y-1">
            <p className={`${mono} text-indigo-300 font-semibold mb-1`}>Communication Coach Observations</p>
            {sessionTelemetry.tips.map((tip, idx) => (
              <p key={idx} className="text-xs text-indigo-200 leading-relaxed flex items-start gap-1.5">
                <span className="text-indigo-400 font-bold">•</span>
                <span>{tip}</span>
              </p>
            ))}
          </div>
        )}
      </section>
    )}

    <section className="mt-4 rounded-md border border-zinc-800 bg-zinc-900/50"><div className="border-b border-zinc-800 px-4 py-4 sm:px-5"><p className={mono + ' text-zinc-500'}>Response review</p><h2 className="mt-1 text-lg font-medium text-white">Question-by-question record</h2></div><div className="divide-y divide-zinc-800">{questions.map((question, index) => { const feedback = typeof question.feedback === 'object' && question.feedback ? question.feedback : {}; const hasScore = feedback.evaluationSource === 'AI_PROVIDER' && feedback.score != null; const candidate = question.userAnswer || question.candidateAnswer || ''; const notes = [...(feedback.strengths || []), ...(feedback.weaknesses || []), ...(feedback.suggestions || [])]; const expected = question.modelAnswer || question.expectedKeyPoints; const followUpQ = question.followUpQuestion || feedback.followUpQuestion; const followUpA = question.followUpAnswer; const followUpFb = question.followUpFeedback || feedback.followUpFeedback; const followUpSc = question.followUpScore || feedback.followUpScore; return <article key={question.id || index} className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[150px_1fr]"><div><span className={mono + ' text-zinc-500'}>Question {String(index + 1).padStart(2, '0')}</span><div className="mt-2 font-mono text-lg tabular-nums text-orange-400">{hasScore ? `${feedback.score}/100` : '—'}</div><span className={`${mono} mt-1 block text-zinc-600`}>{feedback.evaluationSource === 'HEURISTIC' ? 'Guidance only' : feedback.evaluationSource === 'AI_PROVIDER' ? 'Provider score' : 'Not scored'}</span></div><div className="min-w-0"><h3 className="text-sm font-medium leading-6 text-zinc-100">{question.questionText || `Question ${index + 1}`}</h3><div className="mt-3 grid gap-2 xl:grid-cols-2"><div className="rounded border border-zinc-800 bg-zinc-950/60 p-3"><p className={mono + ' text-zinc-600'}>Candidate response</p><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-zinc-300">{candidate || 'No response recorded.'}</p></div><div className="rounded border border-zinc-800 bg-zinc-950/60 p-3"><p className={mono + ' text-zinc-600'}>Expected concepts / model response</p><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-zinc-400">{expected || 'No reference answer was saved for this question.'}</p></div></div>{notes.length > 0 && <div className="mt-2 border-l border-orange-500/50 pl-3"><p className={`${mono} text-zinc-600`}>Saved feedback</p><ul className="mt-1 space-y-1 text-xs text-zinc-400">{notes.map((note, noteIndex) => <li key={noteIndex} className="flex gap-2"><span className="text-orange-500">›</span>{note}</li>)}</ul></div>}{followUpQ && <div className="mt-3 rounded border border-amber-500/30 bg-amber-500/5 p-3 space-y-2"><div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-bold"><Zap size={12} /> Adaptive Interrogation Follow-Up</span>{followUpSc != null && <span className="font-mono text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">Defense Score: {followUpSc}/100</span>}</div><p className="text-xs italic text-zinc-300">"{followUpQ}"</p>{followUpA ? <div className="mt-1.5 rounded border border-zinc-800 bg-zinc-950/70 p-2 text-xs text-zinc-300"><span className="font-mono text-[10px] text-zinc-500 uppercase block mb-0.5">Candidate Defense:</span><p className="whitespace-pre-wrap">{followUpA}</p></div> : <p className="text-[11px] text-zinc-500 italic">No defense response recorded for follow-up.</p>}{followUpFb && <p className="text-xs text-emerald-300/90 bg-emerald-950/30 border border-emerald-500/20 p-2 rounded"><span className="font-semibold text-emerald-200">Interrogation feedback: </span>{followUpFb}</p>}</div>}</div></article>; })}{questions.length === 0 && <p className="px-5 py-10 text-center text-xs text-zinc-500">No question records were saved.</p>}</div></section>
    <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500"><span className="inline-flex items-center gap-2"><BookOpen size={13} /> Source: saved interview evaluation</span><Link to="/dashboard" className="inline-flex items-center gap-1 text-zinc-400 hover:text-white">Dashboard <ArrowRight size={13} /></Link></footer>
    <ShareInterviewModal
      interviewId={id}
      isOpen={isShareModalOpen}
      onClose={() => setIsShareModalOpen(false)}
    />
  </div>;
}
