import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { shareApi } from '../api/share';
import { analyzeSpeechTelemetry } from '../utils/speechTelemetry';
import {
  AlertTriangle, Award, BookOpen, Check, Clipboard, FileDown,
  Flag, ShieldCheck, Zap, Activity, Gauge, MessageSquare, Sparkles,
  ExternalLink, Lock
} from 'lucide-react';

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

function ScoreBadge({ score }) {
  if (score == null) return null;
  const color = score >= 85 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : score >= 70 ? 'text-orange-400 bg-orange-500/10 border-orange-500/20'
    : score >= 50 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    : 'text-red-400 bg-red-500/10 border-red-500/20';
  const label = score >= 85 ? 'Exceptional' : score >= 70 ? 'Strong' : score >= 50 ? 'Developing' : 'Needs Work';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${color}`}>
      <Award className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

export default function PublicInterviewReportPage() {
  const { shareToken } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    shareApi.getPublicReport(shareToken)
      .then((data) => { if (active) setResult(data); })
      .catch((err) => {
        if (active) {
          const status = err?.response?.status;
          if (status === 404) setError('This interview report was not found or is no longer publicly shared.');
          else if (status === 400) setError('This interview has not been completed yet.');
          else setError('Unable to load the shared report. Please try again later.');
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [shareToken]);

  const providerScored = result?.evaluationSource === 'AI_PROVIDER' && result?.overallScore != null;
  const chartData = useMemo(() => dimensions.map(([name, key]) => ({ subject: name, score: Number(result?.[key]) || 0 })), [result]);
  const sessionTelemetry = useMemo(() => {
    if (!result?.questions?.length) return null;
    const allAnswers = result.questions.map((q) => q.userAnswer || q.candidateAnswer || '').filter(Boolean).join(' ');
    if (!allAnswers) return null;
    const duration = result.durationSeconds || Math.max(30, result.questions.length * 60);
    return analyzeSpeechTelemetry(allAnswers, duration);
  }, [result]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-brand-500/20 border-t-brand-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading shared interview report...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7 text-zinc-500" />
          </div>
          <h1 className="text-xl font-bold text-white">Report Unavailable</h1>
          <p className="text-sm text-zinc-400">{error || 'This shared report could not be loaded.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition"
          >
            Visit IntervAI
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const questions = result.questions || [];
  const completedDate = result.completedAt ? new Date(result.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;
  const durationMin = result.durationSeconds ? Math.round(result.durationSeconds / 60) : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Public header bar */}
      <div className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-7 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm font-extrabold">
              <span className="text-white">Interv</span>
              <span className="text-brand-400">AI</span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 border-l border-zinc-700 pl-3">
              Public Performance Report
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:border-zinc-500 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
              {copied ? 'Link Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:border-zinc-500 transition print:hidden"
            >
              <FileDown className="w-3.5 h-3.5" />
              PDF / Print
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-7 py-8">
        {/* Verified badge */}
        <div className="flex items-center justify-center mb-6 print:mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified by IntervAI · AI-Evaluated Technical Interview</span>
          </div>
        </div>

        {/* Hero header */}
        <header className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
            <div>
              <p className={`${mono} flex items-center gap-2 text-brand-400`}>
                <Flag size={12} /> Interview Performance Dossier
              </p>
              <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {result.jobRole || 'Technical Interview'} Scorecard
              </h1>
              {result.candidateName && (
                <p className="mt-2 text-sm text-zinc-300">
                  Candidate: <span className="font-semibold text-white">{result.candidateName}</span>
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[11px] uppercase text-zinc-500">
                <span>{result.interviewType || 'Interview'} track</span>
                <span>{result.difficulty || 'Standard'}</span>
                <span>{result.experience || 'Not specified'}</span>
                {completedDate && <span>{completedDate}</span>}
                {durationMin && <span>{durationMin} min session</span>}
                {result.interviewSource && result.interviewSource !== 'PRESET' && (
                  <span className="text-brand-400 font-semibold">
                    • {result.interviewSource === 'RESUME' ? 'RESUME-DRIVEN' : result.interviewSource === 'JOB_DESCRIPTION' ? 'JD-TARGETED' : 'RESUME & JD MATCH'}
                  </span>
                )}
              </div>
              {result.skills?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {result.skills.map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-[#151f33] text-brand-400 text-xs font-mono border border-brand-500/20">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 text-center">
              <span className={mono + ' text-zinc-500'}>Overall Score</span>
              <div className="font-mono text-5xl font-bold tabular-nums tracking-tight text-white my-2">
                {providerScored ? `${result.overallScore}` : '—'}
                <span className="text-base text-zinc-600 font-normal ml-1">/ 100</span>
              </div>
              <ScoreBadge score={providerScored ? result.overallScore : null} />
            </div>
          </div>
        </header>

        {/* Competency radar + breakdown */}
        {providerScored && (
          <section className="mt-5 grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
            <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <p className={mono + ' text-zinc-500'}>Competency Map</p>
              <h2 className="mt-1 text-base font-medium text-white">5-Dimension AI Evaluation</h2>
              <div className="mt-2 h-[270px] w-full">
                <CompetencyRadar data={chartData} />
              </div>
            </article>
            <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <p className={mono + ' text-zinc-500'}>Dimension Detail</p>
              <h2 className="mt-1 text-base font-medium text-white">Evaluation Breakdown</h2>
              <div className="mt-5 space-y-4">
                {dimensions.map(([label, key]) => {
                  const score = Number(result[key]) || 0;
                  return (
                    <div key={key}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-zinc-300">{label}</span>
                        <span className="font-mono tabular-nums text-brand-400">{score}</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          </section>
        )}

        {/* Summary feedback */}
        {result.summaryFeedback && (
          <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className={`${mono} text-brand-400`}>AI Assessment Summary</p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">{result.summaryFeedback}</p>
          </div>
        )}

        {/* Strengths / Weaknesses / Suggestions */}
        {(result.strengths?.length || (result.weaknesses || result.improvements)?.length || (result.recommendations || result.suggestions)?.length) ? (
          <section className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              ['Observed Strengths', result.strengths, 'text-emerald-400', 'border-emerald-500/20'],
              ['Areas to Develop', result.weaknesses || result.improvements, 'text-amber-400', 'border-amber-500/20'],
              ['Recommendations', result.recommendations || result.suggestions, 'text-cyan-400', 'border-cyan-500/20']
            ].map(([title, list, accent, borderColor]) => list?.length ? (
              <article key={title} className={`rounded-xl border ${borderColor} bg-zinc-900/50 p-4`}>
                <p className={`${mono} ${accent}`}>{title}</p>
                <ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-400">
                  {list.map((entry, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="font-mono text-zinc-600">{String(index + 1).padStart(2, '0')}</span>
                      <span>{entry}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ) : null)}
          </section>
        ) : null}

        {/* Speech Telemetry */}
        {sessionTelemetry && (
          <section className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div>
                <p className={`${mono} text-indigo-400 flex items-center gap-1.5`}>
                  <Activity size={12} /> Communication & Speech Telemetry
                </p>
                <h2 className="mt-1 text-lg font-medium text-white">Delivery Pacing & Articulation</h2>
              </div>
              <span className={`${mono} px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20`}>
                {sessionTelemetry.totalWords} Words Analyzed
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
                  <MessageSquare size={12} className="text-amber-400" /> Filler Frequency
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
              </div>
            </div>
          </section>
        )}

        {/* Question-by-question */}
        <section className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <div className="border-b border-zinc-800 px-5 py-4">
            <p className={mono + ' text-zinc-500'}>Response Review</p>
            <h2 className="mt-1 text-lg font-medium text-white">Question-by-Question Record</h2>
          </div>
          <div className="divide-y divide-zinc-800">
            {questions.map((question, index) => {
              const feedback = typeof question.feedback === 'object' && question.feedback ? question.feedback : {};
              const hasScore = feedback.evaluationSource === 'AI_PROVIDER' && feedback.score != null;
              const candidate = question.userAnswer || question.candidateAnswer || '';
              const notes = [...(feedback.strengths || []), ...(feedback.weaknesses || []), ...(feedback.suggestions || [])];
              const expected = question.modelAnswer || question.expectedKeyPoints;
              const followUpQ = question.followUpQuestion || feedback.followUpQuestion;
              const followUpA = question.followUpAnswer;
              const followUpFb = question.followUpFeedback || feedback.followUpFeedback;
              const followUpSc = question.followUpScore || feedback.followUpScore;

              return (
                <article key={question.id || index} className="grid gap-4 p-5 lg:grid-cols-[150px_1fr]">
                  <div>
                    <span className={mono + ' text-zinc-500'}>Question {String(index + 1).padStart(2, '0')}</span>
                    <div className="mt-2 font-mono text-lg tabular-nums text-brand-400">
                      {hasScore ? `${feedback.score}/100` : '—'}
                    </div>
                    {question.targetSkill && (
                      <span className="mt-1 block text-[10px] font-mono uppercase text-zinc-600">{question.targetSkill}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium leading-6 text-zinc-100">{question.questionText || `Question ${index + 1}`}</h3>
                    <div className="mt-3 grid gap-2 xl:grid-cols-2">
                      <div className="rounded border border-zinc-800 bg-zinc-950/60 p-3">
                        <p className={mono + ' text-zinc-600'}>Candidate Response</p>
                        <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-zinc-300">{candidate || 'No response recorded.'}</p>
                      </div>
                      <div className="rounded border border-zinc-800 bg-zinc-950/60 p-3">
                        <p className={mono + ' text-zinc-600'}>Expected Concepts / Model Answer</p>
                        <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-zinc-400">{expected || 'No reference answer available.'}</p>
                      </div>
                    </div>
                    {notes.length > 0 && (
                      <div className="mt-2 border-l border-brand-500/50 pl-3">
                        <p className={`${mono} text-zinc-600`}>AI Feedback</p>
                        <ul className="mt-1 space-y-1 text-xs text-zinc-400">
                          {notes.map((note, i) => (
                            <li key={i} className="flex gap-2"><span className="text-brand-500">›</span>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {followUpQ && (
                      <div className="mt-3 rounded border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-bold">
                            <Zap size={12} /> Adaptive Follow-Up
                          </span>
                          {followUpSc != null && (
                            <span className="font-mono text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                              Score: {followUpSc}/100
                            </span>
                          )}
                        </div>
                        <p className="text-xs italic text-zinc-300">"{followUpQ}"</p>
                        {followUpA ? (
                          <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-xs text-zinc-300">
                            <span className="font-mono text-[10px] text-zinc-500 uppercase block mb-0.5">Candidate Defense:</span>
                            <p className="whitespace-pre-wrap">{followUpA}</p>
                          </div>
                        ) : (
                          <p className="text-[11px] text-zinc-500 italic">No defense response recorded.</p>
                        )}
                        {followUpFb && (
                          <p className="text-xs text-emerald-300/90 bg-emerald-950/30 border border-emerald-500/20 p-2 rounded">
                            <span className="font-semibold text-emerald-200">Feedback: </span>{followUpFb}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
            {questions.length === 0 && (
              <p className="px-5 py-10 text-center text-xs text-zinc-500">No question records available.</p>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 pb-8 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>This report was generated and verified by IntervAI's AI evaluation engine</span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Link to="/" className="text-xs text-zinc-400 hover:text-white transition">
              Visit IntervAI
            </Link>
            <Link to="/register" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs font-bold transition">
              Start Practicing Free
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

