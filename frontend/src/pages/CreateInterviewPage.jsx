import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { interviewApi } from '../api/interview';
import { 
  Sparkles, 
  BrainCircuit, 
  Layers, 
  Gauge, 
  Check, 
  Volume2, 
  FileText, 
  ArrowRight, 
  AlertCircle,
  Cpu
} from 'lucide-react';

export default function CreateInterviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const preset = location.state || {};

  const [formData, setFormData] = useState({
    jobRole: preset.role || 'Frontend Developer',
    experience: 'Fresher',
    interviewType: preset.type || 'Technical',
    difficulty: preset.diff || 'Medium',
    questionCount: 5,
    mode: 'AUDIO_AND_TEXT',
    skills: preset.role === 'Backend Developer' 
      ? ['Java', 'Spring Boot', 'SQL']
      : ['React', 'JavaScript', 'CSS']
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [error, setError] = useState('');

  const jobRoles = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Data Engineer',
    'Machine Learning Engineer',
    'Software Engineer',
    'System Architect'
  ];

  const interviewTypes = [
    { id: 'Technical', label: 'Technical Core', desc: 'Syntax, language internals, patterns & frameworks' },
    { id: 'HR', label: 'Behavioral & STAR', desc: 'Conflict resolution, team leadership, culture fit' },
    { id: 'System Design', label: 'System Design', desc: 'Architecture, scalability, trade-offs & data stores' },
    { id: 'Coding', label: 'Problem Solving', desc: 'Algorithms, data structures & logic challenges' }
  ];

  const difficultyLevels = [
    { id: 'Easy', label: 'Foundational', color: 'text-emerald-400 border-emerald-500/30' },
    { id: 'Medium', label: 'Standard', color: 'text-amber-400 border-amber-500/30' },
    { id: 'Hard', label: 'Senior / Rigorous', color: 'text-rose-400 border-rose-500/30' }
  ];

  const skillOptions = [
    'React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS', 'Next.js',
    'Java', 'Spring Boot', 'Spring Data JPA', 'Microservices', 'Hibernate',
    'Python', 'Django', 'FastAPI', 'Node.js',
    'SQL', 'PostgreSQL', 'MongoDB', 'Redis',
    'Docker', 'Kubernetes', 'AWS', 'Git', 'REST APIs',
    'System Design', 'Communication', 'STAR Method'
  ];

  const toggleSkill = (skill) => {
    setFormData((prev) => {
      const exists = prev.skills.includes(skill);
      const updated = exists ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill];
      return { ...prev, skills: updated };
    });
  };

  const handleStartSimulation = async (e) => {
    e.preventDefault();
    if (formData.skills.length === 0) {
      setError('Please select at least 1 technical skill for the AI to base questions upon.');
      return;
    }

    setError('');
    setIsGenerating(true);
    setGenerationStep(1);

    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 900);

    try {
      const createdInterview = await interviewApi.create({
        jobRole: formData.jobRole,
        experience: formData.experience,
        interviewType: formData.interviewType,
        difficulty: formData.difficulty,
        numberOfQuestions: parseInt(formData.questionCount, 10),
        interviewMode: formData.mode === 'AUDIO_AND_TEXT' ? 'Voice' : 'Text',
        skills: formData.skills
      });

      clearInterval(stepInterval);
      navigate(`/interviews/${createdInterview.id}/lobby`);
    } catch (err) {
      clearInterval(stepInterval);
      setIsGenerating(false);
      setError(
        err.response?.data?.message || 'Failed to generate interview questions. Please verify your backend connection.'
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Configurable AI Interview Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Create AI Mock Interview
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
          Customize your role, seniority, and skills. Our AI will curate realistic, targeted interview questions.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-3 text-xs text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleStartSimulation} className="space-y-8">
        
        {/* Section 1: Role & Experience */}
        <div className="p-6 rounded-2xl bg-[#0d1322] border border-white/5 space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-mono">1</span>
            Target Role & Seniority
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Job Role</label>
              <select
                value={formData.jobRole}
                onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                className="w-full bg-[#151f33] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                {jobRoles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Experience Level</label>
              <select
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full bg-[#151f33] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="Fresher">Fresher (0 - 1 years)</option>
                <option value="Junior">Junior (1 - 2 years)</option>
                <option value="Mid-level">Mid-level (2 - 4 years)</option>
                <option value="Senior">Senior (5+ years)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Interview Type */}
        <div className="p-6 rounded-2xl bg-[#0d1322] border border-white/5 space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-mono">2</span>
            Interview Track / Type
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {interviewTypes.map((type) => {
              const selected = formData.interviewType === type.id;
              return (
                <button
                  type="button"
                  key={type.id}
                  onClick={() => setFormData({ ...formData, interviewType: type.id })}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                    selected
                      ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-500/10'
                      : 'bg-[#151f33] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className={`text-xs font-bold ${selected ? 'text-white' : 'text-slate-200'}`}>
                      {type.label}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {type.desc}
                    </div>
                  </div>
                  {selected && (
                    <div className="mt-3 flex items-center gap-1 text-[10px] text-indigo-400 font-semibold">
                      <Check className="w-3 h-3 stroke-[3]" /> Selected Track
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Difficulty & Question Count */}
        <div className="p-6 rounded-2xl bg-[#0d1322] border border-white/5 space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-mono">3</span>
            Difficulty & Length
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-2">
                {difficultyLevels.map((lvl) => {
                  const selected = formData.difficulty === lvl.id;
                  return (
                    <button
                      type="button"
                      key={lvl.id}
                      onClick={() => setFormData({ ...formData, difficulty: lvl.id })}
                      className={`py-2.5 rounded-xl border text-xs font-semibold transition ${
                        selected
                          ? `bg-slate-800 border-brand-500 text-brand-400 shadow-sm`
                          : 'bg-[#151f33] border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Number of Questions</label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 5, 8].map((num) => {
                  const selected = formData.questionCount === num;
                  return (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setFormData({ ...formData, questionCount: num })}
                      className={`py-2.5 rounded-xl border text-xs font-semibold transition ${
                        selected
                          ? 'bg-slate-800 border-indigo-500 text-indigo-300'
                          : 'bg-[#151f33] border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {num} Questions
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mode */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-300 mb-2">Interview Interaction Mode</label>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode: 'AUDIO_AND_TEXT' })}
                className={`p-3.5 rounded-xl border flex items-center gap-3 text-left transition ${
                  formData.mode === 'AUDIO_AND_TEXT'
                    ? 'bg-brand-500/10 border-brand-500/40 text-brand-400'
                    : 'bg-[#151f33] border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Volume2 className="w-5 h-5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Audio + Speech Recognition</div>
                  <div className="text-[11px] text-slate-400">Natural voice synthesis and speech-to-text</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, mode: 'TEXT_ONLY' })}
                className={`p-3.5 rounded-xl border flex items-center gap-3 text-left transition ${
                  formData.mode === 'TEXT_ONLY'
                    ? 'bg-brand-500/10 border-brand-500/40 text-brand-400'
                    : 'bg-[#151f33] border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-5 h-5 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Text Only</div>
                  <div className="text-[11px] text-slate-400">Silent focus mode with typed input</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Skills Checklist */}
        <div className="p-6 rounded-2xl bg-[#0d1322] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-mono">4</span>
              Focus Skills & Technologies ({formData.skills.length} Selected)
            </h2>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, skills: [] })}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Clear
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {skillOptions.map((skill) => {
              const active = formData.skills.includes(skill);
              return (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                    active
                      ? 'bg-brand-500 text-slate-950 font-semibold shadow-md shadow-brand-500/20'
                      : 'bg-[#151f33] text-slate-300 hover:text-white border border-white/5 hover:border-white/10'
                  }`}
                >
                  {active && <Check className="w-3 h-3 stroke-[3]" />}
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {isGenerating ? (
            <div className="p-6 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-center space-y-3 backdrop-blur-md">
              <div className="w-8 h-8 rounded-full border-2 border-brand-500/20 border-t-brand-400 animate-spin mx-auto" />
              <div className="text-sm font-semibold text-white">
                {generationStep === 1 && "Synthesizing job requirements and difficulty curve..."}
                {generationStep === 2 && "Formulating adaptive questions tailored to your skills..."}
                {generationStep >= 3 && "Configuring evaluation rubrics and interview lobby..."}
              </div>
              <p className="text-xs text-slate-400">This ensures your mock interview closely matches real tech bar standards.</p>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-brand-500/25 transition active:scale-98"
            >
              <Cpu className="w-5 h-5" />
              Generate & Launch Interview Simulation
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
