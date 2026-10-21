import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { interviewApi } from '../api/interview';
import { useAuth } from '../context/AuthContext';
import { 
  Layers, 
  Check, 
  Volume2, 
  FileText, 
  ArrowRight, 
  AlertCircle,
  Cpu,
  UploadCloud,
  FileCheck,
  Briefcase,
  Sparkles,
  Trash2,
  RefreshCw,
  Target,
  Zap
} from 'lucide-react';

const getDefaultDifficulty = () => {
  try {
    const saved = localStorage.getItem('default-interview-difficulty');
    return ['Easy', 'Medium', 'Hard'].includes(saved) ? saved : 'Medium';
  } catch {
    return 'Medium';
  }
};

const ROLE_SKILLS = {
  'Frontend Developer': ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Web Performance'],
  'Backend Developer': ['Java', 'Spring Boot', 'REST APIs', 'SQL', 'PostgreSQL', 'Redis'],
  'Full Stack Developer': ['React', 'TypeScript', 'Node.js', 'REST APIs', 'PostgreSQL', 'Docker'],
  'DevOps Engineer': ['Linux', 'Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform'],
  'Data Engineer': ['Python', 'SQL', 'PostgreSQL', 'Apache Spark', 'Kafka', 'AWS'],
  'Machine Learning Engineer': ['Python', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'MLOps', 'SQL'],
  'Software Engineer': ['Java', 'Python', 'Data Structures', 'Algorithms', 'SQL', 'Git'],
  'System Architect': ['System Design', 'Microservices', 'AWS', 'Kubernetes', 'Kafka', 'PostgreSQL']
};

const SAMPLE_JDS = {
  'Senior Backend (Java / Spring)': `We are seeking a Senior Backend Engineer to scale our distributed payment gateway.
Key Responsibilities:
- Design and maintain high-throughput microservices using Java 21, Spring Boot, and PostgreSQL.
- Implement caching patterns with Redis and distributed event streaming with Apache Kafka.
- Optimize database queries, connection pooling, and ensure 99.99% availability.
Qualifications:
- 4+ years building production backend systems with Java and Spring.
- Deep expertise in concurrency, transactions, REST API security, and Docker/Kubernetes.`,
  'Full Stack (React & Node/Java)': `Looking for a Full Stack Engineer to lead user-facing product features.
Key Responsibilities:
- Build responsive, accessible frontends using React, TypeScript, and Tailwind CSS.
- Architect REST and GraphQL APIs with robust error handling and automated testing.
- Collaborate with product designers and maintain end-to-end CI/CD deployments.
Qualifications:
- Proficiency in modern JavaScript/TypeScript, React state management, and backend web frameworks.`,
  'DevOps / Cloud Infrastructure': `Join our platform team to architect scalable AWS cloud infrastructure.
Key Responsibilities:
- Manage Kubernetes clusters (EKS) and automate provisioning with Terraform.
- Build resilient CI/CD pipelines (GitHub Actions) with automated zero-downtime rollouts.
- Maintain observability and alerting via Prometheus, Grafana, and OpenTelemetry.
Qualifications:
- Strong Linux fundamentals, container orchestration, Docker, and AWS security best practices.`
};

export default function CreateInterviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const preset = location.state || {};

  // Source selection: 'PRESET', 'RESUME', 'JOB_DESCRIPTION', 'RESUME_AND_JD'
  const [interviewSource, setInterviewSource] = useState(preset.source || 'PRESET');

  // Resume state
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [resumeInputMode, setResumeInputMode] = useState('upload'); // 'upload' or 'paste'
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [parsedResumeData, setParsedResumeData] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Job Description state
  const [jobDescription, setJobDescription] = useState('');
  const [enableAdaptiveFollowUp, setEnableAdaptiveFollowUp] = useState(true);

  const [formData, setFormData] = useState({
    jobRole: preset.role || user?.targetRole || 'Frontend Developer',
    experience: user?.experience || 'Fresher',
    interviewType: preset.type || 'Technical',
    difficulty: preset.diff || getDefaultDifficulty(),
    questionCount: 5,
    mode: 'AUDIO_AND_TEXT',
    skills: user?.skills?.length && !preset.role ? user.skills : ROLE_SKILLS[preset.role || user?.targetRole || 'Frontend Developer']
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
    'React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS', 'Next.js', 'Web Performance',
    'Java', 'Spring Boot', 'Spring Data JPA', 'Microservices', 'Hibernate',
    'Python', 'Django', 'FastAPI', 'Node.js', 'Linux', 'CI/CD', 'Terraform',
    'SQL', 'PostgreSQL', 'MongoDB', 'Redis',
    'Docker', 'Kubernetes', 'AWS', 'Git', 'REST APIs', 'Apache Spark', 'Kafka',
    'PyTorch', 'TensorFlow', 'Scikit-learn', 'MLOps', 'Data Structures', 'Algorithms',
    'System Design', 'Communication', 'STAR Method'
  ];

  const handleRoleChange = (jobRole) => {
    setFormData((prev) => ({ ...prev, jobRole, skills: ROLE_SKILLS[jobRole] || prev.skills }));
  };

  const toggleSkill = (skill) => {
    setFormData((prev) => {
      const exists = prev.skills.includes(skill);
      const updated = exists ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill];
      return { ...prev, skills: updated };
    });
  };

  // Resume File Upload & Parsing Handler
  const handleFileUpload = async (file) => {
    if (!file) return;
    setResumeFile(file);
    setError('');
    setIsParsingResume(true);

    try {
      const parsed = await interviewApi.parseResume(file);
      setParsedResumeData(parsed);
      setResumeText(parsed.rawText || '');

      // Intelligently auto-populate form fields if available
      if (parsed.suggestedRole && jobRoles.includes(parsed.suggestedRole)) {
        setFormData((prev) => ({ ...prev, jobRole: parsed.suggestedRole }));
      }
      if (parsed.experienceLevel) {
        setFormData((prev) => ({ ...prev, experience: parsed.experienceLevel }));
      }
      if (parsed.detectedSkills && parsed.detectedSkills.length > 0) {
        setFormData((prev) => ({
          ...prev,
          skills: Array.from(new Set([...prev.skills, ...parsed.detectedSkills]))
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to extract text from resume file. Please try pasting the text manually.');
    } finally {
      setIsParsingResume(false);
    }
  };

  const handlePasteResumeAnalysis = async () => {
    if (!resumeText.trim()) {
      setError('Please enter or paste your resume text first.');
      return;
    }
    setError('');
    setIsParsingResume(true);

    try {
      const parsed = await interviewApi.analyzeText(resumeText);
      setParsedResumeData(parsed);
      if (parsed.suggestedRole && jobRoles.includes(parsed.suggestedRole)) {
        setFormData((prev) => ({ ...prev, jobRole: parsed.suggestedRole }));
      }
      if (parsed.detectedSkills && parsed.detectedSkills.length > 0) {
        setFormData((prev) => ({
          ...prev,
          skills: Array.from(new Set([...prev.skills, ...parsed.detectedSkills]))
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze resume text.');
    } finally {
      setIsParsingResume(false);
    }
  };

  const handleStartSimulation = async (e) => {
    e.preventDefault();

    if (interviewSource === 'RESUME' && !resumeText.trim() && !resumeFile) {
      setError('Please upload a resume file or paste your resume text to generate a resume-based interview.');
      return;
    }

    if (interviewSource === 'JOB_DESCRIPTION' && !jobDescription.trim()) {
      setError('Please paste the target job description to generate a role-targeted interview.');
      return;
    }

    if (interviewSource === 'RESUME_AND_JD') {
      if (!resumeText.trim() && !resumeFile) {
        setError('Please provide your resume for the cross-examination match.');
        return;
      }
      if (!jobDescription.trim()) {
        setError('Please paste the target job description.');
        return;
      }
    }

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
        skills: formData.skills,
        resumeText: resumeText.trim(),
        jobDescription: jobDescription.trim(),
        interviewSource: interviewSource,
        enableAdaptiveFollowUp: enableAdaptiveFollowUp
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
          <Cpu className="w-3.5 h-3.5" />
          <span>Adaptive Interview Engine • Resume/JD Grounding + Dynamic Follow-Ups</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Create AI Mock Interview
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
          Practice using custom role presets, your actual resume, or a real target job description for authentic technical interrogation.
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
        
        {/* Step 1 Feature: Source Selection Mode */}
        <div className="p-6 rounded-2xl bg-[#0d1322] border border-white/5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-mono">1</span>
              Interview Generation Source
            </h2>
            <span className="text-[11px] font-mono text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded border border-brand-500/20">
              Personalized AI Calibration
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: 'PRESET',
                title: 'Role Preset',
                desc: 'Standard curriculum based on chosen tech role and skills.',
                icon: Layers
              },
              {
                id: 'RESUME',
                title: 'Resume-Driven',
                desc: 'Probes your actual past projects, tech stacks, and work history.',
                icon: FileCheck
              },
              {
                id: 'JOB_DESCRIPTION',
                title: 'Job Description (JD)',
                desc: 'Tailors questions directly to a specific company job posting.',
                icon: Briefcase
              },
              {
                id: 'RESUME_AND_JD',
                title: 'Resume + JD Match',
                desc: 'Cross-examines your background against target job demands.',
                icon: Target
              }
            ].map((source) => {
              const active = interviewSource === source.id;
              const Icon = source.icon;
              return (
                <button
                  type="button"
                  key={source.id}
                  onClick={() => setInterviewSource(source.id)}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                    active
                      ? 'bg-brand-500/15 border-brand-500 shadow-md shadow-brand-500/10'
                      : 'bg-[#151f33] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-5 h-5 ${active ? 'text-brand-400' : 'text-slate-400'}`} />
                      {active && <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />}
                    </div>
                    <div className={`text-xs font-bold ${active ? 'text-white' : 'text-slate-200'}`}>
                      {source.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {source.desc}
                    </div>
                  </div>
                  {active && (
                    <div className="mt-3 flex items-center gap-1 text-[10px] text-brand-400 font-semibold">
                      <Check className="w-3 h-3 stroke-[3]" /> Active Source
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Conditional Sub-panels based on Source */}

          {/* Panel A: Resume Input (Shown for RESUME and RESUME_AND_JD) */}
          {(interviewSource === 'RESUME' || interviewSource === 'RESUME_AND_JD') && (
            <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-400" />
                  Candidate Resume (PDF or Text)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setResumeInputMode('upload')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                      resumeInputMode === 'upload' ? 'bg-brand-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setResumeInputMode('paste')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                      resumeInputMode === 'paste' ? 'bg-brand-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Paste Text
                  </button>
                </div>
              </div>

              {resumeInputMode === 'upload' ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${
                    isDragging ? 'border-brand-500 bg-brand-500/10' : 'border-white/10 bg-[#151f33] hover:border-white/20'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    accept=".pdf,.txt,.md"
                    className="hidden"
                  />
                  {isParsingResume ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-4">
                      <RefreshCw className="w-6 h-6 text-brand-400 animate-spin" />
                      <p className="text-xs font-medium text-white">Extracting text & identifying technical competencies...</p>
                      <p className="text-[11px] text-slate-400">Apache PDFBox parsing candidate profile</p>
                    </div>
                  ) : resumeFile ? (
                    <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-lg border border-white/5">
                      <div className="flex items-center gap-3 text-left">
                        <FileCheck className="w-6 h-6 text-emerald-400" />
                        <div>
                          <div className="text-xs font-bold text-white">{resumeFile.name}</div>
                          <div className="text-[10px] text-slate-400">{(resumeFile.size / 1024).toFixed(1)} KB • Ready for interview generation</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setResumeFile(null);
                          setResumeText('');
                          setParsedResumeData(null);
                        }}
                        className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UploadCloud className="w-8 h-8 text-brand-400" />
                      <p className="text-xs font-semibold text-slate-200">
                        Drag & Drop your resume (PDF or TXT) here, or <span className="text-brand-400 underline">browse files</span>
                      </p>
                      <p className="text-[11px] text-slate-500">Supports PDF, TXT, Markdown up to 10MB</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    rows={5}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume content here (experience, projects, tools, education)..."
                    className="w-full bg-[#151f33] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={isParsingResume || !resumeText.trim()}
                      onClick={handlePasteResumeAnalysis}
                      className="px-3 py-1.5 rounded-lg bg-brand-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isParsingResume ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      Analyze & Extract Skills
                    </button>
                  </div>
                </div>
              )}

              {/* Parsed Resume Details Card */}
              {parsedResumeData && (
                <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-brand-400">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Resume Profile Parsed Successfully
                    </span>
                    {parsedResumeData.wordCount && (
                      <span className="font-mono text-[10px] text-slate-400">{parsedResumeData.wordCount} words analyzed</span>
                    )}
                  </div>
                  {parsedResumeData.summary && (
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      "{parsedResumeData.summary}"
                    </p>
                  )}
                  {parsedResumeData.detectedSkills?.length > 0 && (
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">Detected Core Competencies:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {parsedResumeData.detectedSkills.map((sk) => (
                          <span key={sk} className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[10px] font-mono border border-brand-500/30">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Panel B: Job Description Input (Shown for JOB_DESCRIPTION and RESUME_AND_JD) */}
          {(interviewSource === 'JOB_DESCRIPTION' || interviewSource === 'RESUME_AND_JD') && (
            <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  Target Job Description (JD)
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500">Quick Samples:</span>
                  {Object.keys(SAMPLE_JDS).map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setJobDescription(SAMPLE_JDS[name])}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    >
                      {name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                rows={5}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description or requirements from the company (e.g. responsibilities, required tech stack, seniority requirements)..."
                className="w-full bg-[#151f33] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
              <p className="text-[10px] text-slate-500">
                The AI will calibrate question difficulty, domain nuances, and system requirements to align with this JD.
              </p>
            </div>
          )}
        </div>

        {/* Section 2: Role & Experience */}
        <div className="p-6 rounded-2xl bg-[#0d1322] border border-white/5 space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-mono">2</span>
            Target Role & Seniority
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Job Role</label>
              <select
                value={formData.jobRole}
                onChange={(e) => handleRoleChange(e.target.value)}
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

        {/* Section 3: Interview Track / Type */}
        <div className="p-6 rounded-2xl bg-[#0d1322] border border-white/5 space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-mono">3</span>
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

        {/* Section 4: Difficulty & Length */}
        <div className="p-6 rounded-2xl bg-[#0d1322] border border-white/5 space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-mono">4</span>
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

          {/* Interaction Mode */}
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

          {/* Adaptive Interrogation (Dynamic Follow-Ups) Toggle */}
          <div className="pt-2">
            <div className={`p-4 rounded-xl border transition-all ${
              enableAdaptiveFollowUp
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-[#151f33] border-white/5'
            }`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    enableAdaptiveFollowUp ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-slate-500'
                  }`}>
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Dynamic Adaptive Interrogation</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        enableAdaptiveFollowUp ? 'bg-amber-400/20 text-amber-300' : 'bg-white/10 text-slate-400'
                      }`}>
                        {enableAdaptiveFollowUp ? 'ACTIVE' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      After each response, the AI interviewer dynamically asks 1 realistic follow-up question to probe trade-offs, edge cases, and architectural depth.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEnableAdaptiveFollowUp(!enableAdaptiveFollowUp)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    enableAdaptiveFollowUp ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={enableAdaptiveFollowUp}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      enableAdaptiveFollowUp ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Skills Checklist */}
        <div className="p-6 rounded-2xl bg-[#0d1322] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-mono">5</span>
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

          <p className="text-[11px] text-slate-400">
            {interviewSource === 'RESUME' || interviewSource === 'RESUME_AND_JD'
              ? 'Highlighted competencies extracted from your resume. Add or adjust focus areas as needed.'
              : `Suggested stack for ${formData.jobRole}. Add or remove skills to customize interviewer focus.`}
          </p>
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
            <div className="p-6 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-brand-500/20 border-t-brand-400 animate-spin mx-auto" />
              <div className="text-sm font-semibold text-white">
                {generationStep === 1 && (interviewSource !== 'PRESET' ? "Analyzing resume profile and target job expectations..." : "Synthesizing job requirements and difficulty curve...")}
                {generationStep === 2 && (interviewSource === 'RESUME' ? "Formulating questions tailored to your actual resume projects..." : "Formulating adaptive questions tailored to your skills...")}
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
              {interviewSource === 'RESUME' && 'Generate Resume-Driven Interview'}
              {interviewSource === 'JOB_DESCRIPTION' && 'Generate JD-Targeted Interview'}
              {interviewSource === 'RESUME_AND_JD' && 'Generate Resume vs JD Match Interview'}
              {interviewSource === 'PRESET' && 'Generate & Launch Interview Simulation'}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
