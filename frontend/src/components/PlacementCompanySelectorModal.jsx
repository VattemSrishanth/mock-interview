import React, { useState, useEffect } from 'react';
import { X, Building2, Search, Award, CheckCircle2, ChevronRight, Zap, Target, BookOpen, AlertCircle } from 'lucide-react';
import { placementApi } from '../api/placement';
import { getTierBadgeClass, filterCompaniesByQuery } from '../utils/placementTrackUtils';

export default function PlacementCompanySelectorModal({ isOpen, onClose, onSelectCompany }) {
  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [activeCompany, setActiveCompany] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    placementApi
      .getCompanies()
      .then((data) => {
        setCompanies(data);
        if (data.length > 0) setActiveCompany(data[0]);
      })
      .catch((err) => {
        console.error('Failed to load placement companies', err);
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = filterCompaniesByQuery(companies, searchQuery).filter((c) => {
    if (selectedTier === 'ALL') return true;
    return c.tier === selectedTier;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Campus Placement Drives & Company Mocks
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
                  2026 Batch Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Calibrated against real interview rubrics, technical cutoffs, and question patterns
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by company, role (e.g. Google, Amazon, Backend)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {['ALL', 'TIER_1_PRODUCT', 'TIER_2_GROWTH', 'TIER_3_ENTERPRISE'].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  selectedTier === tier
                    ? 'bg-orange-500 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tier === 'ALL'
                  ? 'All Companies'
                  : tier === 'TIER_1_PRODUCT'
                  ? 'Tier-1 FAANG'
                  : tier === 'TIER_2_GROWTH'
                  ? 'Unicorns'
                  : 'Mass Recruiters'}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Split List and Preview */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* List */}
          <div className="md:col-span-5 border-r border-slate-800 overflow-y-auto p-3 space-y-2 max-h-[55vh]">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading placement drive catalogs...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No companies found matching "{searchQuery}".</div>
            ) : (
              filtered.map((company) => {
                const isActive = activeCompany?.slug === company.slug;
                return (
                  <div
                    key={company.slug}
                    onClick={() => setActiveCompany(company)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-orange-500/10 border-orange-500/40'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{company.companyName}</span>
                          {company.isFeatured && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold">
                              HOT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{company.targetRole}</p>
                      </div>
                      <span className="text-xs font-mono font-medium text-emerald-400">{company.averagePackageLpa}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getTierBadgeClass(company.tier)}`}>
                        {company.tier === 'TIER_1_PRODUCT'
                          ? 'Tier-1'
                          : company.tier === 'TIER_2_GROWTH'
                          ? 'Unicorn'
                          : 'IT Enterprise'}
                      </span>
                      <span className="text-[10px] text-slate-500">{company.roundsCount} Rounds</span>
                      <span className="text-[10px] text-slate-500 font-mono ml-auto">
                        Cutoff: {company.cutOffPercentage}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Company Details Pane */}
          <div className="md:col-span-7 p-5 overflow-y-auto max-h-[55vh] bg-slate-950/20 flex flex-col justify-between">
            {activeCompany ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {activeCompany.companyName}
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border ${getTierBadgeClass(activeCompany.tier)}`}>
                        {activeCompany.tier === 'TIER_1_PRODUCT'
                          ? 'Tier-1 FAANG'
                          : activeCompany.tier === 'TIER_2_GROWTH'
                          ? 'Unicorn Growth'
                          : 'Enterprise Cadre'}
                      </span>
                    </h3>
                    <p className="text-xs text-orange-400 font-medium mt-0.5">{activeCompany.targetRole}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Target CTC</span>
                    <span className="text-base font-bold font-mono text-emerald-400">{activeCompany.averagePackageLpa}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <span className="text-[11px] font-semibold text-slate-300 block mb-1">Primary Technical Focus</span>
                  <p className="text-slate-400 leading-relaxed">{activeCompany.primaryFocus}</p>
                </div>

                {/* Round Breakdown */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-orange-400" />
                    Round Structure ({activeCompany.roundsCount} Rounds)
                  </h4>
                  <div className="space-y-1.5">
                    {activeCompany.roundNames?.map((round, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs"
                      >
                        <span className="w-4 h-4 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="text-slate-300">{round}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Topics & Pro Tip */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">High-Frequency Topics</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCompany.commonTopics?.map((topic, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/50">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-start gap-2 text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Recruiter Insider Tip:</span> {activeCompany.recruiterProTip}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                Select a company to review round requirements.
              </div>
            )}

            {/* Launch Action Footer */}
            {activeCompany && (
              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Pass Cutoff Threshold: <span className="text-white font-mono font-bold">{activeCompany.cutOffPercentage}%</span>
                </div>
                <button
                  onClick={() => {
                    onSelectCompany(activeCompany);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-colors"
                >
                  Start {activeCompany.companyName} Mock Drive
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
