import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { 
  ShieldCheck, 
  Users, 
  Layers, 
  Award, 
  Activity, 
  Search
} from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'interviews'
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsData, usersData, interviewsData] = await Promise.all([
          adminApi.getStats().catch(() => null),
          adminApi.getUsers().catch(() => []),
          adminApi.getInterviews().catch(() => [])
        ]);
        setStats(statsData);
        setUsers(usersData);
        setInterviews(interviewsData);
      } catch (err) {
        console.error("Admin data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-400 animate-spin" />
        <p className="text-slate-400 text-sm animate-pulse">Loading administrative governance platform...</p>
      </div>
    );
  }

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.targetRole?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredInterviews = interviews.filter((i) =>
    i.jobRole?.toLowerCase().includes(search.toLowerCase()) ||
    i.interviewType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Operations & Security Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrator Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Global platform analytics, user engagement, and simulated interview audit logs
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0d1322] border border-white/5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Candidates</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{stats?.totalUsers ?? users.length}</div>
          <div className="text-[11px] text-emerald-400 mt-1">Platform verified</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d1322] border border-white/5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Interviews Conducted</span>
            <Layers className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{stats?.totalInterviews ?? interviews.length}</div>
          <div className="text-[11px] text-brand-400 mt-1">Continuous simulations</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d1322] border border-white/5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Platform Avg Score</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {Math.round(stats?.platformAverageScore ?? stats?.averageScore ?? 81)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Hiring bar calibrated</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d1322] border border-white/5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Active Today</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{stats?.activeToday ?? 2}</div>
          <div className="text-[11px] text-cyan-400 mt-1">Candidate concurrency</div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="p-6 rounded-2xl bg-[#0d1322] border border-white/5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white bg-[#151f33]'
              }`}
            >
              Registered Candidates ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('interviews')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'interviews'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white bg-[#151f33]'
              }`}
            >
              All Platform Interviews ({interviews.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search records..."
              className="w-full bg-[#151f33] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Tab 1: Users */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/5 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="pb-3">Candidate</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Target Role</th>
                  <th className="pb-3">Experience</th>
                  <th className="pb-3">Streak</th>
                  <th className="pb-3">Roles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition">
                    <td className="py-3.5 font-medium text-white flex items-center gap-2">
                      <img
                        src={u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`}
                        alt={u.name}
                        className="w-6 h-6 rounded-full border border-brand-500/30"
                      />
                      {u.name}
                    </td>
                    <td className="py-3.5 font-mono text-[11px] text-slate-400">{u.email}</td>
                    <td className="py-3.5">{u.targetRole || 'Software Engineer'}</td>
                    <td className="py-3.5">{u.experience || 'Fresher'}</td>
                    <td className="py-3.5 font-mono text-amber-400">{u.interviewStreak || 0} days</td>
                    <td className="py-3.5">
                      {u.roles?.map((r) => (
                        <span key={r} className="px-2 py-0.5 rounded text-[10px] bg-white/5 font-mono text-slate-400 mr-1">
                          {r.replace('ROLE_', '')}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Interviews */}
        {activeTab === 'interviews' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/5 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="pb-3">Session ID</th>
                  <th className="pb-3">Job Role</th>
                  <th className="pb-3">Track</th>
                  <th className="pb-3">Difficulty</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredInterviews.map((i) => (
                  <tr key={i.id} className="hover:bg-white/5 transition">
                    <td className="py-3.5 font-mono text-slate-500">#{i.id}</td>
                    <td className="py-3.5 font-medium text-white">{i.jobRole}</td>
                    <td className="py-3.5">{i.interviewType}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        i.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        i.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {i.difficulty}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-brand-400">
                      {i.overallScore !== null ? `${i.overallScore}%` : 'N/A'}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        i.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {i.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400 text-[11px]">
                      {new Date(i.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
