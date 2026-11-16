/**
 * Dynamic Peer Percentile & Cohort Benchmark Calculator
 * Computes realistic percentile rankings and cohort comparisons based on candidate evaluation dimensions.
 */

// Normalized distribution parameters for candidate engineering interviews
const BENCHMARK_DISTRIBUTIONS = {
  overall: { mean: 68, stdDev: 14 },
  technicalKnowledgeScore: { mean: 65, stdDev: 15 },
  communicationScore: { mean: 70, stdDev: 13 },
  relevanceScore: { mean: 72, stdDev: 12 },
  clarityScore: { mean: 66, stdDev: 14 },
  confidenceScore: { mean: 64, stdDev: 16 }
};

/**
 * Standard normal cumulative distribution approximation (error function)
 */
function normalCdf(x, mean, stdDev) {
  const z = (x - mean) / (stdDev * Math.SQRT2);
  const t = 1 / (1 + 0.3275911 * Math.abs(z));
  const poly = ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t;
  const erf = 1 - poly * Math.exp(-z * z);
  const sign = z >= 0 ? 1 : -1;
  return 0.5 * (1 + sign * erf);
}

/**
 * Calculates a dynamic percentile ranking (1 - 99) for a given score.
 */
export function calculatePercentile(score, dimensionKey = 'overall') {
  if (score == null || Number.isNaN(Number(score))) return null;
  const numScore = Math.max(0, Math.min(100, Number(score)));
  const { mean, stdDev } = BENCHMARK_DISTRIBUTIONS[dimensionKey] || BENCHMARK_DISTRIBUTIONS.overall;
  
  const cdf = normalCdf(numScore, mean, stdDev);
  const percentile = Math.max(1, Math.min(99, Math.round(cdf * 100)));
  return percentile;
}

/**
 * Formats a descriptive percentile ranking text.
 * e.g. "Scored higher than 84% of campus engineering candidates"
 */
export function formatPercentileHeadline(percentile, roleName = 'Engineering') {
  if (percentile == null) return null;
  const topPercent = Math.max(1, 100 - percentile);
  
  if (percentile >= 90) {
    return {
      badge: `Top ${topPercent}% Candidate`,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      description: `Your responses placed you in the Top ${topPercent}% of all candidates evaluated for ${roleName}. Outstanding interview performance.`
    };
  }
  if (percentile >= 75) {
    return {
      badge: `Top ${topPercent}% Placement Ready`,
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      description: `Scored higher than ${percentile}% of campus candidates. Strong competitiveness for tier-1 & tier-2 placements.`
    };
  }
  if (percentile >= 50) {
    return {
      badge: `Above Median (${percentile}th Percentile)`,
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      description: `Solid performance outperforming ${percentile}% of peer candidates. Refining edge-cases will unlock top placement brackets.`
    };
  }
  return {
    badge: `${percentile}th Percentile Foundation`,
    badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    description: `Foundational performance. Focus on structured model answer study and key conceptual points to accelerate your placement rank.`
  };
}

/**
 * Generates benchmark breakdown comparisons for each evaluation dimension.
 */
export function buildCohortBreakdown(result) {
  if (!result) return [];

  const dims = [
    { key: 'technicalKnowledgeScore', label: 'Technical Depth' },
    { key: 'communicationScore', label: 'Communication' },
    { key: 'relevanceScore', label: 'Problem Relevance' },
    { key: 'clarityScore', label: 'STAR Structure' },
    { key: 'confidenceScore', label: 'Cadence & Poise' }
  ];

  return dims.map((d) => {
    const rawScore = Number(result[d.key]) || 0;
    const percentile = calculatePercentile(rawScore, d.key);
    return {
      dimension: d.label,
      score: rawScore,
      percentile: percentile,
      higherThan: `${percentile}% of peers`
    };
  });
}
