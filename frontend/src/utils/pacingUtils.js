/**
 * Shared candidate response pacing and interview timer rubric utilities.
 * Guides response cadence around standard 1-to-3 minute structured answers.
 */

export const DEFAULT_TARGET_MAX_SECONDS = 180;
export const DEFAULT_OPTIMAL_START_SECONDS = 60;

/**
 * Formats an elapsed duration in seconds into MM:SS.
 * Safely clamps negative or non-numeric inputs to 00:00.
 * @param {number} seconds
 * @returns {string}
 */
export function formatElapsedTime(seconds = 0) {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Evaluates response pacing stage, UI styling tokens, and progress percentage.
 * @param {number} elapsedSeconds
 * @param {number} optimalStartSeconds
 * @param {number} targetMaxSeconds
 */
export function evaluateResponsePacing(
  elapsedSeconds = 0,
  optimalStartSeconds = DEFAULT_OPTIMAL_START_SECONDS,
  targetMaxSeconds = DEFAULT_TARGET_MAX_SECONDS
) {
  const safeElapsed = Math.max(0, Math.floor(Number(elapsedSeconds) || 0));
  const safeMax = Math.max(30, Number(targetMaxSeconds) || DEFAULT_TARGET_MAX_SECONDS);
  const safeOptimalStart = Math.min(safeMax - 15, Math.max(15, Number(optimalStartSeconds) || DEFAULT_OPTIMAL_START_SECONDS));

  const progressPercent = Math.min(100, Math.round((safeElapsed / safeMax) * 100));
  const mins = Math.floor(safeElapsed / 60);
  const secs = safeElapsed % 60;

  if (safeElapsed >= safeMax) {
    return {
      stage: 'WRAP_UP',
      label: 'Wrap-up Suggested',
      badgeClass: 'text-rose-300 border-rose-500/20 bg-rose-500/10',
      barClass: 'bg-rose-400',
      progressPercent: 100,
      mins,
      secs,
    };
  }

  if (safeElapsed >= safeOptimalStart) {
    return {
      stage: 'OPTIMAL',
      label: 'Optimal Pacing',
      badgeClass: 'text-amber-300 border-amber-500/20 bg-amber-500/10',
      barClass: 'bg-amber-400',
      progressPercent,
      mins,
      secs,
    };
  }

  return {
    stage: 'INTRODUCTORY',
    label: 'Introductory',
    badgeClass: 'text-slate-300 border-white/5 bg-[#151f33]',
    barClass: 'bg-brand-400',
    progressPercent,
    mins,
    secs,
  };
}
