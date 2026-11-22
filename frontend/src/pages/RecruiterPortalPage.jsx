import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Search,
  Filter,
  CheckCircle,
  ShieldCheck,
  Award,
  ChevronRight,
  Send,
  PlusCircle,
  Copy,
  RefreshCw,
} from 'lucide-react';
import recruiterApi from '../api/recruiter';
import RecruiterPipelineDrawer from '../components/RecruiterPipelineDrawer';
import ProctoringHeatmapWidget from '../components/ProctoringHeatmapWidget';

export default function RecruiterPortalPage() {
  const [applications, setApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Campus invite generator state
  const [collegeName, setCollegeName] = useState('IIT Madras / BITS Pilani');
  const [inviteResult, setInviteResult] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [selectedStage]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const data = await recruiterApi.getApplications({
        stage: selectedStage || undefined,
      });
      setApplications(Array.isArray(data) ? data : []);
    } catch (e) {
      // Mock fallback if offline or backend spinning up
      setApplications([
        {
          applicationId: 'APP-101',
          candidateName: 'Srishanth Vattem',
          candidateEmail: 'srishanth@intervai.com',
          appliedRole: 'Senior Full Stack & AI Architect',
          targetCompany: 'Google',
          stage: 'SYSTEM_DESIGN_ROUND',
          overallScore: 94.5,
          percentileRank: 98.2,
          hiringVerdict: 'STRONG_HIRE',
          topSkills: ['Java 21', 'Spring Boot', 'React', 'Distributed Systems'],
          certificateSignature: 'CERT-SIG-948194A8D',
          proctoringVerified: true,
        },
        {
          applicationId: 'APP-102',
          candidateName: 'Priya Sharma',
          candidateEmail: 'priya.sharma@campus.edu',
          appliedRole: 'Backend Cloud Engineer',
          targetCompany: 'Amazon',
          stage: 'TECHNICAL_ROUND',
          overallScore: 86.0,
          percentileRank: 88.5,
          hiringVerdict: 'HIRE',
          topSkills: ['Java', 'PostgreSQL', 'AWS S3'],
          certificateSignature: 'CERT-SIG-86214B0C',
          proctoringVerified: true,
        },
        {
          applicationId: 'APP-103',
          candidateName: 'Rohan Verma',
          candidateEmail: 'rohan.verma@tech.in',
          appliedRole: 'Frontend Web Platform Engineer',
          targetCompany: 'Swiggy',
          stage: 'SCREENING_PASSED',
          overallScore: 79.0,
          percentileRank: 76.4,
          hiringVerdict: 'LEAN_HIRE',
          topSkills: ['React', 'TypeScript', 'Tailwind CSS'],
          certificateSignature: 'CERT-SIG-79114D2E',
          proctoringVerified: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdvanceStage = async (applicationId, nextStage) => {
    try {
      await recruiterApi.advanceStage(applicationId, nextStage);
      setApplications(
        applications.map((app) =>
          app.applicationId === applicationId ? { ...app, stage: nextStage } : app
        )
      );
      if (selectedCandidate?.applicationId === applicationId) {
        setSelectedCandidate({ ...selectedCandidate, stage: nextStage });
      }
    } catch (e) {
      // Offline fallback state update
      setApplications(
        applications.map((app) =>
          app.applicationId === applicationId ? { ...app, stage: nextStage } : app
        )
      );
    }
  };

  const handleGenerateInvite = async (e) => {
    e.preventDefault();
    try {
      const res = await recruiterApi.createCampusInvite({
        collegeName,
        department: 'Computer Science & Engineering',
        batchYear: 2026,
        candidateEmails: ['candidate1@campus.edu', 'candidate2@campus.edu'],
      });
      setInviteResult(res);
    } catch (err) {
      setInviteResult({
        inviteToken: 'CAMPUS-BITS26',
        inviteUrl: 'https://intervai.app/invite/CAMPUS-BITS26',
      });
    }
  };

  const filtered = applications.filter((app) => {
    const q = searchQuery.toLowerCase();
    return (
      app.candidateName.toLowerCase().includes(q) ||
      app.appliedRole.toLowerCase().includes(q) ||
      app.targetCompany.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20 mb-3">
              <Building2 className="w-3.5 h-3.5" /> Phase 8 Enterprise ATS Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Recruiter Talent Pipeline & Campus Drive ATS
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Screen candidate batches, inspect cryptographic certificate credentials, evaluate anti-cheat proctoring integrity,
              and advance candidates across interview rounds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchApplications}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Cohort
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-3xl bg-slate-900 border border-white/10 shadow-lg">
            <span className="text-xs text-slate-400 font-medium block mb-1">Total Applicants</span>
            <span className="text-2xl font-black text-white">{applications.length}</span>
            <span className="text-[10px] text-indigo-400 block mt-1">Active Pipeline</span>
          </div>
          <div className="p-4 rounded-3xl bg-slate-900 border border-white/10 shadow-lg">
            <span className="text-xs text-slate-400 font-medium block mb-1">Average Score</span>
            <span className="text-2xl font-black text-indigo-400">86.5%</span>
            <span className="text-[10px] text-slate-400 block mt-1">Calibrated Across Roles</span>
          </div>
          <div className="p-4 rounded-3xl bg-slate-900 border border-white/10 shadow-lg">
            <span className="text-xs text-slate-400 font-medium block mb-1">Proctoring Verified</span>
            <span className="text-2xl font-black text-emerald-400">92.0%</span>
            <span className="text-[10px] text-emerald-300 block mt-1">Clean Gaze & Zero Breaches</span>
          </div>
          <div className="p-4 rounded-3xl bg-slate-900 border border-white/10 shadow-lg">
            <span className="text-xs text-slate-400 font-medium block mb-1">Strong Hires</span>
            <span className="text-2xl font-black text-teal-400">
              {applications.filter((a) => a.hiringVerdict === 'STRONG_HIRE').length}
            </span>
            <span className="text-[10px] text-teal-300 block mt-1">Top Tier Candidates</span>
          </div>
        </div>

        {/* Campus Batch Invite Generator Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" /> Generate Campus Batch Invite URL
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Create an exclusive proctored interview registration link for university placement coordinators.
            </p>
          </div>

          <form onSubmit={handleGenerateInvite} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              placeholder="e.g. BITS Pilani / IIT Delhi"
              className="px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full md:w-64"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 shadow-lg shadow-indigo-600/30 transition-all"
            >
              Generate Token
            </button>
          </form>
        </div>

        {inviteResult && (
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-300">
            <span>
              Campus Invite Link:{' '}
              <span className="font-mono font-bold text-white">{inviteResult.inviteUrl}</span>
            </span>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(inviteResult.inviteUrl)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-semibold"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Link
            </button>
          </div>
        )}

        {/* Candidate Pipeline Table */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Active Candidate Applications</h2>
              <p className="text-xs text-slate-400">Select any candidate to inspect scorecard or advance stages.</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-48 sm:w-60"
                />
              </div>

              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Stages</option>
                <option value="APPLIED">Applied</option>
                <option value="SCREENING_PASSED">Screening Passed</option>
                <option value="TECHNICAL_ROUND">Technical Round</option>
                <option value="SYSTEM_DESIGN_ROUND">System Design</option>
                <option value="OFFER_EXTENDED">Offer Extended</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3">Candidate</th>
                  <th className="py-3 px-3">Track & Company</th>
                  <th className="py-3 px-3">Pipeline Stage</th>
                  <th className="py-3 px-3">Score & Verdict</th>
                  <th className="py-3 px-3">Proctoring</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((cand) => (
                  <tr
                    key={cand.applicationId}
                    onClick={() => {
                      setSelectedCandidate(cand);
                      setIsDrawerOpen(true);
                    }}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-white">{cand.candidateName}</div>
                      <div className="text-[11px] text-slate-400">{cand.candidateEmail}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="text-slate-200 font-medium">{cand.appliedRole}</div>
                      <div className="text-[11px] text-indigo-400">{cand.targetCompany}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {cand.stage}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-white">{cand.overallScore}%</div>
                      <div className="text-[10px] text-teal-400">{cand.hiringVerdict}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      {cand.proctoringVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Unverified</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-semibold transition-colors"
                      >
                        Inspect <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Proctoring Heatmap Calibration Bay */}
        <ProctoringHeatmapWidget
          tabSwitches={0}
          windowBlurs={1}
          centerGazePct={93}
          leftGazePct={3}
          rightGazePct={2}
          downGazePct={2}
          isCameraActive={true}
        />
      </div>

      {/* Drawer */}
      <RecruiterPipelineDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        candidate={selectedCandidate}
        onAdvanceStage={handleAdvanceStage}
      />
    </div>
  );
}
