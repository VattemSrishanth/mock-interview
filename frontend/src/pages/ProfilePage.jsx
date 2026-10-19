import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Target, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Trophy, 
  Flame, 
  Award, 
  Sparkles,
  Layers,
  Search
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'leaderboard'
  const [formData, setFormData] = useState({
    name: user?.name || '',
    targetRole: user?.targetRole || 'Frontend Developer',
    experience: user?.experience || 'Fresher',
    careerGoal: user?.careerGoal || '',
    skills: user?.skills || ['React', 'JavaScript', 'REST APIs']
  });

  const [availableSkills, setAvailableSkills] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [leaderboardSearch, setLeaderboardSearch] = useState('');

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

  const experienceLevels = [
    'Fresher',
    'Junior (1-2 years)',
    'Mid-Level (3-5 years)',
    'Senior (5+ years)'
  ];

  useEffect(() => {
    // Fetch available skills
    authApi.getSkills()
      .then((skills) => {
        if (Array.isArray(skills) && skills.length > 0) {
          setAvailableSkills(skills);
        } else {
          setAvailableSkills([
            'React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS',
            'Java', 'Spring Boot', 'Spring Data JPA', 'Microservices', 'SQL',
            'Python', 'Docker', 'Kubernetes', 'AWS', 'REST APIs', 'System Design', 'Communication'
          ]);
        }
      })
      .catch(() => {
        setAvailableSkills([
          'React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS',
          'Java', 'Spring Boot', 'Spring Data JPA', 'Microservices', 'SQL',
          'Python', 'Docker', 'Kubernetes', 'AWS', 'REST APIs', 'System Design', 'Communication'
        ]);
      });
  }, []);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      setLoadingLeaderboard(true);
      authApi.getLeaderboard()
        .then((data) => setLeaderboard(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Leaderboard fetch failed:", err))
        .finally(() => setLoadingLeaderboard(false));
    }
  }, [activeTab]);

  const toggleSkill = (skill) => {
    setFormData((prev) => {
      const exists = prev.skills.includes(skill);
      const updated = exists ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill];
      return { ...prev, skills: updated };
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    if (formData.skills.length === 0) {
      setErrorMessage('Please select at least 1 core skill to tailor your interview question generation.');
      setIsSaving(false);
      return;
    }

    try {
      const updatedUser = await authApi.updateProfile({
        name: formData.name.trim(),
        targetRole: formData.targetRole,
        experience: formData.experience,
        careerGoal: formData.careerGoal.trim(),
        avatarUrl: user?.avatarUrl,
        skills: formData.skills
      });

      updateUserProfile(updatedUser);
      setSuccessMessage('Profile and interview preferences updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update profile settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredLeaderboard = leaderboard.filter((item) =>
    item.name?.toLowerCase().includes(leaderboardSearch.toLowerCase()) ||
    item.targetRole?.toLowerCase().includes(leaderboardSearch.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0d1322] via-[#111827] to-[#151f33] border border-white/10 relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <img
            src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'Candidate'}`}
            alt={user?.name}
            className="w-20 h-20 rounded-2xl border-2 border-brand-500/40 bg-slate-800 shadow-xl"
          />
          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {user?.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-400 text-xs font-semibold">
                {user?.targetRole || 'Candidate'}
              </span>
            </div>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{user?.interviewStreak || 0} Day Streak</span>
              </div>
              <span>&bull;</span>
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>{user?.experience || 'Fresher'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'profile'
              ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & Career Goals</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
            activeTab === 'leaderboard'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Platform Leaderboard</span>
        </button>
      </div>

      {/* Tab 1: Profile Settings Form */}
      {activeTab === 'profile' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0d1322] border border-white/10 shadow-xl space-y-6">
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#151f33] border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registered Email</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-[#151f33]/50 border border-white/5 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Job Role</label>
                <select
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  className="w-full bg-[#151f33] border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-500 transition"
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
                  className="w-full bg-[#151f33] border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-500 transition"
                >
                  {experienceLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Career Goal & Dream Role</label>
              <textarea
                rows={3}
                value={formData.careerGoal}
                onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                placeholder="e.g. Land a Senior Frontend Engineer position at a top product tech company within 3 months."
                className="w-full bg-[#151f33] border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-500 transition resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Core Competencies & Stack Skills ({formData.skills.length} selected)
              </label>
              <p className="text-[11px] text-slate-400 mb-3">
                Click badges to add or remove skills used to calibrate AI question generation.
              </p>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 rounded-xl bg-[#151f33]/60 border border-white/5">
                {availableSkills.map((skill) => {
                  const isSelected = formData.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        isSelected
                          ? 'bg-brand-500 text-slate-950 font-bold shadow-sm shadow-brand-500/30'
                          : 'bg-[#151f33] hover:bg-white/10 text-slate-300 border border-white/10'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-brand-500/25 transition active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Preferences'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Platform Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0d1322] border border-white/10 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Top Candidate Standings
              </h2>
              <p className="text-xs text-slate-400">
                Ranked by average provider score across completed mock simulations
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={leaderboardSearch}
                onChange={(e) => setLeaderboardSearch(e.target.value)}
                className="w-full bg-[#151f33] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {loadingLeaderboard ? (
            <div className="py-12 flex justify-center items-center">
              <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
            </div>
          ) : filteredLeaderboard.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No ranked candidates matching your search filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 pl-2">Rank</th>
                    <th className="pb-3">Candidate</th>
                    <th className="pb-3">Target Track</th>
                    <th className="pb-3 text-center">Streak</th>
                    <th className="pb-3 text-center">Interviews</th>
                    <th className="pb-3 text-right pr-2">Avg Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLeaderboard.map((item, idx) => {
                    const rank = idx + 1;
                    const isTop1 = rank === 1;
                    const isTop3 = rank <= 3;
                    const avg = item.averageScore != null ? Math.round(item.averageScore) : 0;

                    return (
                      <tr key={item.id} className="hover:bg-white/5 transition">
                        <td className="py-3.5 pl-2">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold font-mono text-xs ${
                            isTop1 ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30' :
                            rank === 2 ? 'bg-slate-300 text-slate-950' :
                            rank === 3 ? 'bg-amber-700 text-white' :
                            'text-slate-400 bg-white/5'
                          }`}>
                            {rank}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.name}`}
                              alt={item.name}
                              className="w-7 h-7 rounded-full bg-slate-800 border border-white/10"
                            />
                            <div>
                              <span className="font-semibold text-white">{item.name}</span>
                              {item.id === user?.id && (
                                <span className="ml-1.5 px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 text-[10px] font-bold">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-300">{item.targetRole || 'Software Engineer'}</td>
                        <td className="py-3.5 text-center">
                          <span className="inline-flex items-center gap-1 text-amber-400 font-mono">
                            <Flame className="w-3.5 h-3.5 fill-amber-400" />
                            {item.interviewStreak || 0}d
                          </span>
                        </td>
                        <td className="py-3.5 text-center text-slate-400 font-mono">
                          {item.totalInterviews || 0}
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          <span className={`font-bold font-mono px-2 py-1 rounded-lg ${
                            avg >= 85 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            avg >= 70 ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {avg}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

