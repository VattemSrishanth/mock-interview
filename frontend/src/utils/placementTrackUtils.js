/**
 * Utility helpers for campus placement company tracks, tier badges, and cutoff checks.
 */

export const COMPANY_TIER_CONFIG = {
  TIER_1_PRODUCT: {
    label: 'Tier-1 FAANG / Product',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    icon: 'Building2',
  },
  TIER_2_GROWTH: {
    label: 'Tier-2 High-Growth Unicorn',
    color: 'amber',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    icon: 'Zap',
  },
  TIER_3_ENTERPRISE: {
    label: 'Tier-3 IT Services / Enterprise',
    color: 'blue',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    icon: 'Layers',
  },
};

export function getTierBadgeClass(tier) {
  return COMPANY_TIER_CONFIG[tier]?.badgeClass || 'bg-slate-800 text-slate-300 border-slate-700';
}

export function getTierLabel(tier) {
  return COMPANY_TIER_CONFIG[tier]?.label || 'Standard Engineering Track';
}

export function isCandidateEligibleForOffer(candidateScore, cutOffPercentage) {
  if (typeof candidateScore !== 'number' || typeof cutOffPercentage !== 'number') return false;
  return candidateScore >= cutOffPercentage;
}

export function computeReadinessGap(candidateScore, cutOffPercentage) {
  if (typeof candidateScore !== 'number' || typeof cutOffPercentage !== 'number') return 0;
  const gap = cutOffPercentage - candidateScore;
  return gap > 0 ? Math.round(gap * 10) / 10 : 0;
}

export function filterCompaniesByQuery(companies, query) {
  if (!Array.isArray(companies)) return [];
  if (!query || !query.trim()) return companies;
  const q = query.toLowerCase().trim();
  return companies.filter(
    (c) =>
      c.companyName?.toLowerCase().includes(q) ||
      c.targetRole?.toLowerCase().includes(q) ||
      c.primaryFocus?.toLowerCase().includes(q) ||
      (c.commonTopics && c.commonTopics.some((t) => t.toLowerCase().includes(q)))
  );
}
