import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import {
  Bot,
  Mail,
  Lock,
  User,
  Briefcase,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  Check,
  KeyRound,
  Send,
  CheckCircle2,
  ShieldCheck,
  Clock,
  ExternalLink,
  Sparkles
} from 'lucide-react';

const REG_DRAFT_KEY = 'intervai_reg_draft_v1';

const getInitialFormData = () => {
  try {
    const saved = localStorage.getItem(REG_DRAFT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        name: parsed.name || '',
        email: parsed.email || '',
        password: '',
        verificationCode: parsed.verificationCode || '',
        targetRole: parsed.targetRole || 'Frontend Developer',
        experience: parsed.experience || 'Fresher',
        careerGoal: parsed.careerGoal || 'Secure a full-time software engineering role',
        skills: Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : ['React', 'JavaScript']
      };
    }
  } catch (e) {
    // Ignore storage parse error
  }
  return {
    name: '',
    email: '',
    password: '',
    verificationCode: '',
    targetRole: 'Frontend Developer',
    experience: 'Fresher',
    careerGoal: 'Secure a full-time software engineering role',
    skills: ['React', 'JavaScript']
  };
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState(getInitialFormData);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Email Verification Code States
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [codeCooldown, setCodeCooldown] = useState(0);
  const [codeStatus, setCodeStatus] = useState('');
  const [codeError, setCodeError] = useState('');

  const availableSkills = [
    'React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS',
    'Java', 'Spring Boot', 'Python', 'SQL', 'PostgreSQL', 'Docker',
    'System Design', 'REST APIs', 'Communication'
  ];

  // Cooldown countdown timer
  useEffect(() => {
    if (codeCooldown <= 0) return;
    const timer = setInterval(() => {
      setCodeCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [codeCooldown]);

  // Auto-save form draft (excluding password for security) so user name, email, role, and skills are never lost
  useEffect(() => {
    try {
      const { password, ...safeDraft } = formData;
      localStorage.setItem(REG_DRAFT_KEY, JSON.stringify(safeDraft));
    } catch (e) {
      // Ignore quota errors
    }
  }, [formData]);

  // One-click email verification link support (e.g. ?email=...&code=...)
  useEffect(() => {
    const qEmail = searchParams.get('email');
    const qCode = searchParams.get('code');
    if (qEmail || qCode) {
      setFormData((prev) => ({
        ...prev,
        email: qEmail ? qEmail.trim() : prev.email,
        verificationCode: qCode ? qCode.trim() : prev.verificationCode
      }));
      if (qCode) {
        setCodeSent(true);
        setCodeStatus('Verification code applied from your email link. Set your password and click Complete Registration!');
      }
    }
  }, [searchParams]);

  const toggleSkill = (skill) => {
    setFormData((prev) => {
      const exists = prev.skills.includes(skill);
      return {
        ...prev,
        skills: exists
          ? prev.skills.filter((s) => s !== skill)
          : [...prev.skills, skill]
      };
    });
  };

  const handleSendCode = async () => {
    setCodeError('');
    setCodeStatus('');
    setError('');

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      setCodeError('Please enter a valid email address with a domain (e.g. name@example.com).');
      return;
    }

    setSendingCode(true);
    try {
      const res = await authApi.sendVerificationCode(formData.email.trim());
      setCodeSent(true);
      setCodeCooldown(30);
      setCodeStatus(res.message || 'Verification code sent to your email.');
    } catch (err) {
      setCodeError(
        err.response?.data?.message || 'Failed to send verification code. The email may already be in use.'
      );
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!codeSent && !formData.verificationCode) {
      setError('Please click "Send Code" and enter the 6-digit email verification code.');
      return;
    }

    if (!/^\d{6}$/.test(formData.verificationCode?.trim())) {
      setError('Verification code must be exactly 6 digits.');
      return;
    }

    if (formData.skills.length === 0) {
      setError('Please select at least one primary skill to focus your interview simulations.');
      return;
    }

    setLoading(true);
    try {
      await register({
        ...formData,
        email: formData.email.trim(),
        verificationCode: formData.verificationCode.trim()
      });

      // Clear draft from storage on successful registration
      try {
        localStorage.removeItem(REG_DRAFT_KEY);
      } catch (e) {}

      // Security requirement: redirect to login and require explicit authentication
      navigate('/login', {
        state: {
          registeredEmail: formData.email.trim(),
          message: 'Account created successfully! For security, please sign in with your email and password.'
        }
      });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please check your verification code and details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-600 p-0.5 shadow-lg shadow-brand-500/20 mb-4">
            <div className="w-full h-full bg-[#0d1322] rounded-[14px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-brand-400" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Create Your Candidate Profile
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            AI personalized mock interviews mapped to your target career path
          </p>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0d1322] border border-white/10 shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Chen"
                  className="w-full bg-[#151f33] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
                />
              </div>
            </div>

            {/* Email Address & Verification Code Sender */}
            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setCodeSent(false);
                      setCodeStatus('');
                      setCodeError('');
                    }}
                    placeholder="alex@example.com"
                    className="w-full bg-[#151f33] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
                  />
                </div>
                <button
                  type="button"
                  disabled={sendingCode || codeCooldown > 0}
                  onClick={handleSendCode}
                  className="px-3.5 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 disabled:opacity-50 text-indigo-200 border border-indigo-500/40 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition"
                >
                  {sendingCode ? (
                    <div className="w-3.5 h-3.5 border-2 border-indigo-200 border-t-transparent rounded-full animate-spin" />
                  ) : codeCooldown > 0 ? (
                    <>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{codeCooldown}s</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{codeSent ? 'Resend Code' : 'Send Code'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status and Error messages for code */}
              {codeError && (
                <p className="mt-1.5 text-[11px] text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{codeError}</span>
                </p>
              )}

              {codeStatus && (
                <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{codeStatus}</span>
                  </span>
                  <a
                    href={`/inbox?email=${encodeURIComponent(formData.email.trim())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-[11px] flex items-center gap-1 shrink-0 transition"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open Inbox</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* 6-Digit Email Verification Code Input */}
            <div>
              <label htmlFor="reg-code" className="block text-xs font-semibold text-slate-300 mb-1.5">
                6-Digit Email Verification Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reg-code"
                  type="text"
                  required
                  maxLength={6}
                  value={formData.verificationCode}
                  onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value.replace(/\D/g, '') })}
                  placeholder="Enter 6-digit code"
                  className="w-full bg-[#151f33] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 tracking-widest font-mono focus:outline-none focus:border-brand-500 transition"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-password"
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-[#151f33] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Role</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={formData.targetRole}
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                    className="w-full bg-[#151f33] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 transition appearance-none"
                  >
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="Software Engineer">Software Engineer (Generalist)</option>
                    <option value="Data Engineer">Data Engineer</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Experience Level</label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full bg-[#151f33] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 transition appearance-none"
                >
                  <option value="Fresher">Fresher (0-1 yrs)</option>
                  <option value="Junior">Junior (1-2 yrs)</option>
                  <option value="Mid-level">Mid-level (2-4 yrs)</option>
                  <option value="Senior">Senior (5+ yrs)</option>
                </select>
              </div>
            </div>

            {/* Skills selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Primary Technical Skills (Click to toggle)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-black/20 rounded-xl border border-white/5">
                {availableSkills.map((skill) => {
                  const selected = formData.skills.includes(skill);
                  return (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                        selected
                          ? 'bg-brand-500 text-slate-950 shadow-sm'
                          : 'bg-[#151f33] text-slate-300 hover:text-white border border-white/5'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 stroke-[3]" />}
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-98 shadow-lg shadow-brand-500/20 mt-4"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account & Verify</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:underline font-semibold">
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Strict duplicate prevention · 6-digit email code verified · Isolated data</span>
        </div>
      </div>
    </div>
  );
}
