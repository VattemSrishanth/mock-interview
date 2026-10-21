import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { interviewApi } from '../api/interview';
import { 
  History, 
  Search, 
  Filter, 
  Trash2, 
  PlayCircle, 
  Clock, 
  ChevronRight
} from 'lucide-react';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('ALL');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await interviewApi.getAll();
      setInterviews(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this interview record?')) {
      try {
        await interviewApi.delete(id);
        setInterviews((prev) => prev.filter((i) => i.id !== id));
      } catch (err) {
        alert('Failed to delete interview record.');
      }
    }
  };

  const filteredInterviews = interviews.filter((item) => {
    const matchesSearch = item.jobRole?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.interviewType?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = filterDifficulty === 'ALL' || item.difficulty === filterDifficulty;
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-brand-400" />
            Interview History & Archive
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review past scores, question breakdowns, and trajectory progression
          </p>
        </div>

        <Link
          to="/create"
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-brand-500/20 transition self-start"
        >
          <PlayCircle className="w-4 h-4 stroke-[2.5]" /> Start New Interview
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0d1322] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role or category..."
            className="w-full bg-[#151f33] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="bg-[#151f33] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 w-full sm:w-auto"
          >
            <option value="ALL">All Difficulties</option>
            <option value="Easy">Easy / Foundational</option>
            <option value="Medium">Medium / Standard</option>
            <option value="Hard">Hard / Senior</option>
          </select>
        </div>
      </div>

      {/* Interviews Table / List */}
      <div className="p-6 rounded-2xl bg-[#0d1322] border border-white/5">
        {loading ? (
          <div className="py-16 flex justify-center items-center">
            <div className="w-8 h-8 rounded-full border-2 border-brand-500/20 border-t-brand-400 animate-spin" />
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No interview records found matching your filters.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredInterviews.map((item) => {
              const isCompleted = item.status === 'COMPLETED';
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isCompleted) navigate(`/interviews/${item.id}/result`);
                    else navigate(`/interviews/${item.id}`);
                  }}
                  className="p-4 rounded-xl bg-[#151f33]/60 hover:bg-[#151f33] border border-white/5 hover:border-brand-500/30 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white group-hover:text-brand-400 transition">
                        {item.jobRole}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 font-mono">
                        {item.interviewType}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        item.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        item.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {item.difficulty}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span>&bull;</span>
                      <span>{item.questions?.length || 5} questions</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    {isCompleted && item.overallScore !== null ? (
                      <div className="text-right">
                        <div className="text-base font-extrabold text-brand-400">{item.overallScore}%</div>
                        <div className="text-[10px] text-slate-400">Scorecard</div>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Incomplete
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        title="Delete Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
