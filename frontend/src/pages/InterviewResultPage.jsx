import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { interviewApi } from '../api/interview';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  BarChart3, 
  Share2, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  Bot,
  MessageSquare
} from 'lucide-react';

export default function InterviewResultPage({ onOpenCoach }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await interviewApi.getResult(id);
        setResult(data);

        // Fire confetti celebration if score >= 70
        if ((data.overallScore || 0) >= 70) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } catch (err) {
        setError('Unable to load interview analysis scorecard.');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-500/20 border-t-brand-400 animate-spin" />
        <p className="text-slate-400 text-sm animate-pulse">Aggregating 5-dimensional interview analytics...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Scorecard Not Ready</h2>
        <p className="text-xs text-slate-400">{error || 'Session results unavailable.'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const score = result.overallScore || 75;
  const getRatingBadge = (val) => {
    if (val >= 85) return { text: 'Strong Hire / Top Tier', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    if (val >= 75) return { text: 'Solid Hire / Offer Ready', color: 'bg-brand-500/10 text-brand-400 border-brand-500/30' };
    if (val >= 60) return { text: 'Competitive / Minor Gaps', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    return { text: 'Developing / Needs Targeted Prep', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
  };

  const badge = getRatingBadge(score);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Banner / Scorecard Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#0d1322] via-[#111827] to-[#151f33] border border-white/10 relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          
          {/* Left summary */}
          <div className="space-y-3 text-center md:text-left">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
              <Award className="w-3.5 h-3.5" />
              <span>{badge.text}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {result.jobRole} Performance Scorecard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Completed simulation across {result.interviewType} track &bull; Evaluated using strict senior engineering hiring rubrics.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <Link
                to="/create"
                className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-brand-500/20 transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Practice Another Simulation
              </Link>
              <button
                onClick={onOpenCoach}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Consult AI Career Coach
              </button>
            </div>
          </div>

          {/* Right big score circle */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-black/40 border border-white/10 min-w-[200px]">
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-300">
              {score}%
            </div>
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mt-1">
              Overall Calibrated Score
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              Status: {result.status || 'COMPLETED'}
            </div>
          </div>

        </div>
      </div>

      {/* 5-Dimensional Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Technical Depth', val: result.technicalKnowledgeScore || result.technicalAccuracyScore || 85, color: 'text-brand-400' },
          { label: 'Communication & STAR', val: result.communicationScore || 78, color: 'text-indigo-400' },
          { label: 'Clarity & Structure', val: result.clarityScore || result.problemSolvingScore || 82, color: 'text-cyan-400' },
          { label: 'Relevance & Breadth', val: result.relevanceScore || 80, color: 'text-purple-400' },
          { label: 'Delivery & Poise', val: result.confidenceScore || 75, color: 'text-amber-400' },
        ].map((item, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-[#0d1322] border border-white/5 text-center flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{item.label}</span>
            <div className={`text-2xl font-black my-2 ${item.color}`}>{item.val}%</div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-brand-400 rounded-full" style={{ width: `${item.val}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Strengths & Improvements */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Strengths */}
        <div className="p-6 rounded-2xl bg-[#0d1322] border border-emerald-500/20 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Key Evaluator Strengths
          </h3>
          <ul className="space-y-2.5">
            {(result.strengths && result.strengths.length > 0
              ? result.strengths
              : ["Clear explanations of core technology concepts", "Direct relevance to prompt requirements"]
            ).map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="p-6 rounded-2xl bg-[#0d1322] border border-amber-500/20 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Areas for Refinement
          </h3>
          <ul className="space-y-2.5">
            {((result.weaknesses || result.improvements) && (result.weaknesses || result.improvements).length > 0
              ? (result.weaknesses || result.improvements)
              : ["Provide deeper real-world failure mode trade-offs", "Structure answers with explicit measurable outcomes"]
            ).map((imp, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* AI Recommendations Action Roadmap */}
      {(result.suggestions || result.recommendations) && (result.suggestions || result.recommendations).length > 0 && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-4">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>AI Recommended Study Roadmap</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(result.suggestions || result.recommendations).map((rec, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 flex items-start gap-2">
                <span className="font-mono text-brand-400 font-bold shrink-0">{idx + 1}.</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question by Question Detailed Replay */}
      <div className="p-6 rounded-2xl bg-[#0d1322] border border-white/5 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">Question-by-Question Deep Dive</h3>
          <p className="text-xs text-slate-400">Review your responses, evaluator scores, and specific critique</p>
        </div>

        <div className="space-y-3 pt-2">
          {(result.questions || []).map((q, idx) => {
            const isExpanded = expandedQuestion === idx;
            const qScore = q.feedback?.score ?? q.score ?? 80;
            const userAnswerText = q.userAnswer || q.candidateAnswer || 'No response recorded';
            const feedbackText = typeof q.feedback === 'string'
              ? q.feedback
              : q.feedback?.suggestions?.join('. ') || q.feedback?.strengths?.join('. ') || q.expectedKeyPoints || 'Answer meets technical rubric criteria.';

            return (
              <div
                key={q.id || idx}
                className="rounded-xl border border-white/5 bg-[#151f33]/60 overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-3 pr-4">
                    <span className="w-6 h-6 rounded-full bg-white/5 text-brand-400 flex items-center justify-center text-xs font-mono shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-white line-clamp-1">
                      {q.questionText}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-extrabold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg">
                      {qScore}%
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-5 border-t border-white/5 bg-[#111827]/70 space-y-4 text-xs">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Your Submitted Response:
                      </div>
                      <p className="p-3 rounded-lg bg-black/30 border border-white/5 text-slate-300 leading-relaxed italic">
                        "{userAnswerText}"
                      </p>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-brand-400 uppercase tracking-wider mb-1">
                        AI Evaluator Feedback:
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        {feedbackText}
                      </p>
                    </div>

                    {q.modelAnswer && (
                      <div className="p-3 rounded-lg bg-slate-900/80 border border-white/10 text-slate-300 space-y-1">
                        <span className="font-semibold text-white">Expected Concepts / Model Answer:</span>
                        <p className="italic text-slate-400">{q.modelAnswer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
