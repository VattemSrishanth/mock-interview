import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  ArrowRight, 
  Bot, 
  Mic, 
  CheckCircle2, 
  BarChart3, 
  BrainCircuit, 
  Award, 
  ShieldCheck, 
  Cpu, 
  Terminal,
  Zap,
  Users
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async (role) => {
    try {
      if (role === 'student') {
        await login({ email: 'revanth@intervai.com', password: 'password123' });
        navigate('/dashboard');
      } else {
        await login({ email: 'admin@intervai.com', password: 'admin123' });
        navigate('/admin');
      }
    } catch (err) {
      console.error(err);
      navigate('/login');
    }
  };

  const featureCards = [
    {
      icon: BrainCircuit,
      title: "Adaptive AI Questioning",
      desc: "Dynamically formulates contextual follow-up questions tailored to your responses, just like an experienced engineering Interrviewer.",
      color: "from-brand-500/20 to-emerald-500/20",
      accent: "text-brand-400"
    },
    {
      icon: Mic,
      title: "Speech & Audio Interaction",
      desc: "Practice with realistic verbal communication using browser speech-to-text recognition and natural AI voice synthesis.",
      color: "from-indigo-500/20 to-blue-500/20",
      accent: "text-indigo-400"
    },
    {
      icon: BarChart3,
      title: "5-Dimensional Evaluation",
      desc: "Instant breakdown across Technical Depth, STAR Structure, Communication Clarity, Problem Solving, and Executive Delivery.",
      color: "from-purple-500/20 to-pink-500/20",
      accent: "text-purple-400"
    },
    {
      icon: Award,
      title: "Tailored Skill Roadmaps",
      desc: "Receive actionable personalized study topics, documentation references, and concrete tips to close your technical gaps.",
      color: "from-amber-500/20 to-orange-500/20",
      accent: "text-amber-400"
    }
  ];

  const popularRoles = [
    { name: "Frontend Developer", skills: "React, TypeScript, CSS, System Design", diff: "Medium" },
    { name: "Backend Engineer", skills: "Java, Spring Boot, PostgreSQL, Microservices", diff: "Hard" },
    { name: "Full Stack Engineer", skills: "React, Node.js, REST APIs, Docker", diff: "Hard" },
    { name: "DevOps & Cloud", skills: "Kubernetes, CI/CD, AWS, Terraform", diff: "Medium" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Glow ambient background lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-500/15 via-indigo-500/15 to-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-medium text-slate-300">
              Next-Gen AI Mock Interview Platform 2.0
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            Master Tech Interviews with Real-Time{' '}
            <span className="bg-gradient-to-r from-brand-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
              Adaptive AI
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
            Practice live technical, behavioral, and system design interviews tailored to your exact stack. Receive immediate multi-metric scoring, actionable feedback, and dynamic follow-ups.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-brand-500/25 transition active:scale-95"
              >
                Go to Candidate Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-brand-500/25 transition active:scale-95"
                >
                  Start Practicing for Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm sm:text-base border border-white/10 flex items-center justify-center gap-2 transition"
                >
                  Sign In to Account
                </Link>
              </>
            )}
          </div>

          {/* Quick Demo Instant Access Bar */}
          <div className="mt-8 max-w-xl mx-auto p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-indigo-300">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              <span className="font-semibold">Instant Demo Access:</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleQuickDemo('student')}
                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 font-medium transition"
              >
                Demo Student (Revanth)
              </button>
              <button
                onClick={() => handleQuickDemo('admin')}
                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-medium transition"
              >
                Demo Admin
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Mock Platform Terminal Preview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="rounded-2xl border border-white/10 bg-[#0d1322] shadow-2xl shadow-indigo-500/5 overflow-hidden">
          {/* Mock Window Top Bar */}
          <div className="px-4 py-3 bg-[#111827] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-3 text-xs font-mono text-slate-400">
                intervai-session://live-technical-eval-react-fresher
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              AI Evaluator Connected
            </div>
          </div>

          {/* Mock Window Content */}
          <div className="p-6 md:p-8 grid md:grid-cols-12 gap-6 bg-gradient-to-b from-[#0d1322] to-[#090d16]">
            {/* Left: AI Question */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-wider">
                <Bot className="w-4 h-4" />
                IntervAI Technical Question 02 / 05 &bull; React Internal Architecture
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-white leading-snug">
                "Explain how React's reconciliation algorithm works with the Virtual DOM, and why key props are crucial when rendering dynamic lists?"
              </h3>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-slate-300 font-mono space-y-1">
                <div className="text-slate-500">// Expected core competencies</div>
                <div>&bull; Diffing heuristic O(n) assumption</div>
                <div>&bull; Fiber node tree traversal & work loops</div>
                <div>&bull; Key stability preventing index re-mounting bugs</div>
              </div>
            </div>

            {/* Right: Instant AI Scoring breakdown preview */}
            <div className="md:col-span-5 p-5 rounded-xl bg-[#151f33]/90 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Instant AI Evaluation
                  </span>
                  <span className="text-base font-bold text-brand-400">88 / 100</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Technical Accuracy</span>
                      <span className="text-brand-400">92%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="w-[92%] h-full bg-brand-400 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>STAR Clarity & Delivery</span>
                      <span className="text-indigo-400">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="w-[85%] h-full bg-indigo-400 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Edge Case Reasoning</span>
                      <span className="text-cyan-400">86%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="w-[86%] h-full bg-cyan-400 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Personalized follow-up question automatically queued</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-bold text-white">
            Designed for Real High-Stakes Career Growth
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base">
            Everything you need to transform interview anxiety into confident, offer-winning technical delivery.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureCards.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0d1322]/80 border border-white/5 hover:border-white/15 transition duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} p-0.5 mb-5 flex items-center justify-center`}>
                    <div className="w-full h-full bg-[#111827] rounded-[10px] flex items-center justify-center">
                      <Icon className={`w-6 h-6 ${feat.accent}`} />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Popular Tracks Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready-to-Practice Roles</h2>
            <p className="text-slate-400 text-sm mt-1">Select any domain and jump into tailored simulations</p>
          </div>
          <Link
            to={isAuthenticated ? "/create" : "/register"}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1.5 transition"
          >
            Explore all custom configurations <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularRoles.map((role, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-[#0d1322] border border-white/5 hover:border-brand-500/30 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-white group-hover:text-brand-400 transition">
                    {role.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10 font-mono">
                    {role.diff}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">{role.skills}</p>
              </div>
              <Link
                to={isAuthenticated ? "/create" : "/register"}
                className="text-xs font-medium text-slate-300 group-hover:text-white flex items-center gap-1 pt-2 border-t border-white/5"
              >
                Launch Simulation <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
