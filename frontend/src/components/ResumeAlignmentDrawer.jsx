import React, { useState } from 'react';
import { X, FileText, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { placementApi } from '../api/placement';

export default function ResumeAlignmentDrawer({ isOpen, onClose, onLaunchTrack }) {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    setAnalyzing(true);
    try {
      const data = await placementApi.alignResume(resumeText, targetRole);
      setResult(data);
    } catch (err) {
      console.error('Failed to analyze resume', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSampleResume = () => {
    setResumeText(`Vattem Srishanth
B.Tech AIML Student | Full Stack & AI Developer
Skills: Java, Spring Boot, Python, React, Tailwind CSS, PostgreSQL, REST APIs, Machine Learning, NLP, Docker, Git.
Projects:
- IntervAI: AI Mock Interview platform built with Spring Boot, PostgreSQL, React 18, and Gemini API.
- CineMatch: Recommendation engine combining Python Scikit-learn TF-IDF with Node.js/Express and React.
- Bias Alert System: Automated dataset bias detection using Python, Flask, Pandas, and React.`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="relative w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Resume ATS & Track Aligner
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-normal">
                  AI Evaluator
                </span>
              </h2>
              <p className="text-xs text-slate-400">Match your projects and skills against target interview rubrics</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-300">Target Interview Role</label>
              <button
                type="button"
                onClick={handleSampleResume}
                className="text-[11px] text-orange-400 hover:text-orange-300 underline"
              >
                Paste Sample Tech Resume
              </button>
            </div>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500/50"
            >
              <option value="Full Stack Developer">Full Stack Developer (React / Spring Boot / Node)</option>
              <option value="Backend Developer">Backend Engineer (Java / Python / PostgreSQL / REST APIs)</option>
              <option value="Frontend Developer">Frontend Engineer (React 18 / Tailwind / UI State)</option>
              <option value="AI Engineer">Applied AI & ML Engineer (Python / NLP / LLMs / Scikit-learn)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1.5">
              Resume Text or Technical Summary
            </label>
            <textarea
              rows={6}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste skills, projects, and work experience from your resume..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzing || !resumeText.trim()}
            className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            {analyzing ? 'Analyzing Match Competencies...' : 'Run ATS Track Alignment'}
          </button>

          {/* Analysis Results */}
          {result && (
            <div className="space-y-4 pt-3 border-t border-slate-800 animate-fade-in">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">ATS Track Match</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">{result.matchPercentage}%</span>
                  <span className="text-xs text-slate-300 font-medium block mt-0.5">{result.alignmentTier}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Suggested Difficulty</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold inline-block mt-1">
                    {result.suggestedInterviewDifficulty}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="font-bold text-slate-300 block mb-1">Executive Assessment</span>
                <p className="text-slate-400 leading-relaxed">{result.executiveSummary}</p>
              </div>

              {/* Identified & Missing */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Matched Skills ({result.identifiedSkills?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {result.identifiedSkills?.map((s, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20">
                  <span className="font-semibold text-rose-400 flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Skill Gaps ({result.missingKeySkills?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {result.missingKeySkills?.map((s, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommended Tracks */}
              <div>
                <span className="font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-orange-400" /> Recommended Mock Tracks
                </span>
                <div className="space-y-1.5">
                  {result.recommendedInterviewTracks?.map((track, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                      <span className="text-slate-300 font-medium">{track}</span>
                      <button
                        onClick={() => {
                          if (onLaunchTrack) onLaunchTrack(track, result.suggestedInterviewDifficulty);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-orange-500/15 hover:bg-orange-500/30 text-orange-400 text-[11px] font-bold flex items-center gap-1"
                      >
                        Launch Mock
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
