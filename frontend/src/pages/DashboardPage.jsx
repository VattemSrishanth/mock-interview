import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewApi } from '../api/interview';
import { analyticsApi } from '../api/analytics';
import { 
  PlayCircle, 
  BarChart3, 
  Flame, 
  Award, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  ChevronRight,
  BookOpen,
  Calendar,
  Layers
} from 'lucide-react';

export default function DashboardPage({ onOpenCoach }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [recentInterviews, userAnalytics] = await Promise.all([
          interviewApi.getRecent().catch(() => []),
          analyticsApi.getAnalytics().catch(() => null)
        ]);
        setInterviews(recentInterviews);
        setAnalytics(userAnalytics);
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalInterviews = analytics?.totalInterviews ?? interviews.length;
  const averageScore = analytics?.averageScore != null
    ? Math.round(analytics.averageScore)
    : (interviews.length > 0
        ? Math.round(interviews.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / interviews.length)
        : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-brand-950/40 via-indigo-950/30 to-purple-950/20 border border-white/10 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Target Role: {user?.targetRole || 'Software Engineer'} &bull; {user?.experience || 'Candidate'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-brand-400">{user?.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {user?.careerGoal || 'Sharpen your technical delivery with targeted AI simulations and deep metric analytics.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCoach}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs sm:text-sm font-semibold flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI Career Advisor</span>
            </button>
            <Link
              to="/create"
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-500/25 transition active:scale-95"
            >
              <PlayCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Start New Interview</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0d1322] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Completed Sessions</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{totalInterviews}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>Active learning path</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d1322] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Average Score</span>
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-brand-400">
            {averageScore > 0 ? `${averageScore}%` : 'N/A'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {averageScore >= 80 ? 'Offer Ready standard' : 'Solid foundation progressing'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d1322] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Practice Streak</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {user?.interviewStreak || 0} <span className="text-sm font-normal text-slate-400">days</span>
          </div>
          <div className="text-[11px] text-amber-400 mt-1">Keep the momentum going</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d1322] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Strongest Domain</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white truncate">
            {analytics?.skillWisePerformance?.[0]?.skill || analytics?.weakestAreas?.[0] || 'Technical Architecture'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Verified by AI evaluation</div>
        </div>
      </div>

      {/* Main Content Layout: Left recent interviews, Right Quick Launch & Coach Advice */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recent Interviews (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0d1322] border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Recent Interview Sessions</h3>
                <p className="text-xs text-slate-400">Detailed breakdowns, audio replays, and AI scores</p>
              </div>
              <Link
                to="/history"
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition"
              >
                View all history <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center items-center">
                <div className="w-8 h-8 rounded-full border-2 border-brand-500/20 border-t-brand-400 animate-spin" />
              </div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-white/10 bg-[#111827]/40">
                <PlayCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-white">No interviews conducted yet</h4>
                <p className="text-xs text-slate-400 mt-1 mb-4 max-w-sm mx-auto">
                  Take your first simulation to calibrate your baseline across technical depth and STAR communication.
                </p>
                <Link
                  to="/create"
                  className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition"
                >
                  <PlayCircle className="w-3.5 h-3.5" /> Start First Mock Interview
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {interviews.slice(0, 5).map((interview) => {
                  const score = interview.overallScore;
                  const isCompleted = interview.status === 'COMPLETED';

                  return (
                    <div
                      key={interview.id}
                      className="p-4 rounded-xl bg-[#151f33]/60 hover:bg-[#151f33] border border-white/5 hover:border-white/15 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white group-hover:text-brand-400 transition">
                            {interview.jobRole}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 font-mono">
                            {interview.interviewType}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                            interview.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            interview.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {interview.difficulty}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {interview.durationMinutes ? `${interview.durationMinutes} mins` : '5 questions'}
                          </span>
                          <span>&bull;</span>
                          <span>{new Date(interview.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        {isCompleted && score !== null ? (
                          <div className="text-right">
                            <div className="text-base font-extrabold text-brand-400">{score}%</div>
                            <div className="text-[10px] text-slate-400">Overall Score</div>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                            In Progress
                          </span>
                        )}

                        <button
                          onClick={() => {
                            if (isCompleted) {
                              navigate(`/interviews/${interview.id}/result`);
                            } else {
                              navigate(`/interviews/${interview.id}`);
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white text-xs font-semibold border border-white/10 transition flex items-center gap-1"
                        >
                          {isCompleted ? 'View Analysis' : 'Resume'}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Insights & Quick Config (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Launch Card */}
          <div className="p-6 rounded-2xl bg-[#0d1322] border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-brand-400" />
              Quick Practice Presets
            </h3>
            <p className="text-xs text-slate-400">Launch a 5-question targeted simulation with 1 click:</p>
            
            <div className="space-y-2">
              {[
                { title: 'React & Frontend Core', diff: 'Medium', role: 'Frontend Developer', type: 'Technical' },
                { title: 'Spring Boot & Microservices', diff: 'Hard', role: 'Backend Developer', type: 'Technical' },
                { title: 'STAR Behavioral Leadership', diff: 'Medium', role: 'Software Engineer', type: 'HR' },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate('/create', { state: preset })}
                  className="w-full p-3 rounded-xl bg-[#151f33] hover:bg-slate-800 border border-white/5 hover:border-brand-500/30 text-left transition flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-brand-400 transition">
                      {preset.title}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {preset.type} &bull; {preset.diff}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-0.5 transition" />
                </button>
              ))}
            </div>

            <Link
              to="/create"
              className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-brand-500/20"
            >
              Custom Configurator <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* AI Career Coach Advisory Callout */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>AI Coach Tip of the Day</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              "When answering System Design questions, establish functional and non-functional assumptions within the first 60 seconds. Mention latency percentiles (p99) and data retention early to impress senior interviewers."
            </p>
            <button
              onClick={onOpenCoach}
              className="text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-1 transition"
            >
              Ask Coach a specific question <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
