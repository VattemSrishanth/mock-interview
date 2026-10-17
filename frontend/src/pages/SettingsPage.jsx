import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, LogOut, Palette, Settings2, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authApi } from '../api/auth';

const themes = [
  { id: 'dark', label: 'Midnight', detail: 'Deep indigo', colors: ['#080c15', '#151f33', '#a855f7'] },
  { id: 'light', label: 'Daylight', detail: 'Clean and bright', colors: ['#f8fafc', '#ffffff', '#6366f1'] },
  { id: 'cyberpunk', label: 'Cyberpunk', detail: 'Neon hacker console', colors: ['#050711', '#101426', '#22d3ee', '#f472b6'] }
];

const roles = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer',
  'Data Engineer', 'Machine Learning Engineer', 'Software Engineer', 'System Architect'
];

const experienceLevels = ['Fresher', 'Junior (1-2 years)', 'Mid-Level (3-5 years)', 'Senior (5+ years)'];
const difficultyLevels = ['Easy', 'Medium', 'Hard'];

const getSavedDifficulty = () => {
  try {
    const saved = localStorage.getItem('default-interview-difficulty');
    return difficultyLevels.includes(saved) ? saved : 'Medium';
  } catch {
    return 'Medium';
  }
};

export default function SettingsPage() {
  const { user, updateUserProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Frontend Developer');
  const [experience, setExperience] = useState(user?.experience || 'Fresher');
  const [defaultDifficulty, setDefaultDifficulty] = useState(getSavedDifficulty);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [saveError, setSaveError] = useState(false);

  const saveInterviewDefaults = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setSaveError(false);
    try {
      const updatedUser = await authApi.updateProfile({
        name: user?.name || 'Candidate',
        targetRole,
        experience,
        careerGoal: user?.careerGoal || '',
        avatarUrl: user?.avatarUrl,
        skills: user?.skills || []
      });
      updateUserProfile(updatedUser);
      try {
        localStorage.setItem('default-interview-difficulty', defaultDifficulty);
      } catch {}
      setMessage('Interview defaults saved. New practice sessions will use them.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not save your interview defaults.');
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <header className="mb-2">
        <div className="inline-flex items-center gap-2 text-brand-400 text-xs font-semibold uppercase tracking-wider">
          <Settings2 className="h-4 w-4" /> Preferences
        </div>
        <h1 className="mt-2 text-3xl font-extrabold text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">Set up your workspace and interview practice defaults.</p>
      </header>

      <section className="rounded-2xl border border-white/10 bg-[#0d1322] p-5 sm:p-6" aria-labelledby="appearance-title">
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-xl bg-brand-500/10 p-2 text-brand-400"><Palette className="h-4 w-4" /></span>
          <div>
            <h2 id="appearance-title" className="font-bold text-white">Appearance</h2>
            <p className="text-xs text-slate-400">Pick a theme for your workspace.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {themes.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setTheme(option.id)}
              aria-pressed={theme === option.id}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${theme === option.id ? 'border-brand-400 bg-brand-500/10 ring-1 ring-brand-400/40' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}
            >
              <span className="flex h-10 w-12 shrink-0 overflow-hidden rounded-lg border border-white/15">
                {option.colors.map((color) => <span key={color} className="flex-1" style={{ backgroundColor: color }} />)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-white">{option.label}</span>
                <span className="block text-[11px] text-slate-400">{option.detail}</span>
              </span>
              {theme === option.id && <CheckCircle2 className="h-4 w-4 text-brand-400" />}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0d1322] p-5 sm:p-6" aria-labelledby="practice-title">
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-xl bg-indigo-500/10 p-2 text-indigo-400"><Settings2 className="h-4 w-4" /></span>
          <div>
            <h2 id="practice-title" className="font-bold text-white">Interview defaults</h2>
            <p className="text-xs text-slate-400">These values prefill your next mock interview.</p>
          </div>
        </div>
        <form onSubmit={saveInterviewDefaults} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-slate-300">
              Target role
              <select value={targetRole} onChange={(event) => setTargetRole(event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#151f33] px-3 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none">
                {roles.map((role) => <option key={role}>{role}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-300">
              Experience level
              <select value={experience} onChange={(event) => setExperience(event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#151f33] px-3 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none">
                {experienceLevels.map((level) => <option key={level}>{level}</option>)}
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-300">
              Default difficulty
              <select value={defaultDifficulty} onChange={(event) => setDefaultDifficulty(event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#151f33] px-3 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none">
                {difficultyLevels.map((level) => <option key={level}>{level}</option>)}
              </select>
            </label>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className={`min-h-4 text-xs ${saveError ? 'text-rose-400' : 'text-emerald-400'}`} role="status">{message}</p>
            <button disabled={saving} className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-brand-600 disabled:opacity-60">
              {saving ? 'Saving...' : 'Save defaults'}
            </button>
          </div>
        </form>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0d1322] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6" aria-labelledby="account-title">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-slate-500/10 p-2 text-slate-300"><UserRound className="h-4 w-4" /></span>
          <div>
            <h2 id="account-title" className="font-bold text-white">Account</h2>
            <p className="text-xs text-slate-400">Signed in as {user?.email}</p>
          </div>
        </div>
        <button type="button" onClick={handleSignOut} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-400/20 px-4 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/10">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </section>
    </div>
  );
}
