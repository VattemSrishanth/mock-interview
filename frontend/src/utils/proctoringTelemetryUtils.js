/**
 * Proctoring Attention & Gaze Telemetry Engine
 * Tracks window blur, tab switching, and simulated webcam gaze orientation.
 */

export function evaluateGazeDistribution({
  centerDurationMs = 85000,
  leftDurationMs = 5000,
  rightDurationMs = 6000,
  downDurationMs = 4000,
} = {}) {
  const total = Math.max(1, centerDurationMs + leftDurationMs + rightDurationMs + downDurationMs);

  const centerScreenPercentage = Math.round((centerDurationMs / total) * 100 * 10) / 10;
  const leftLookawayPercentage = Math.round((leftDurationMs / total) * 100 * 10) / 10;
  const rightLookawayPercentage = Math.round((rightDurationMs / total) * 100 * 10) / 10;
  const downwardLookawayPercentage = Math.round((downDurationMs / total) * 100 * 10) / 10;

  let primaryGazeFocus = 'CENTER';
  if (centerScreenPercentage < 65) {
    if (leftLookawayPercentage > 25 || rightLookawayPercentage > 25) {
      primaryGazeFocus = 'DUAL_MONITOR';
    } else {
      primaryGazeFocus = 'OFF_SCREEN';
    }
  }

  return {
    centerScreenPercentage,
    leftLookawayPercentage,
    rightLookawayPercentage,
    downwardLookawayPercentage,
    primaryGazeFocus,
  };
}

export function computeIntegrityHealthScore({
  tabSwitches = 0,
  windowBlurs = 0,
  centerGazePct = 90,
  anomalies = [],
} = {}) {
  let score = 100;
  const deductionDetails = [];

  // Tab switch penalty (-6 per occurrence)
  if (tabSwitches > 0) {
    const tabPenalty = Math.min(30, tabSwitches * 6);
    score -= tabPenalty;
    deductionDetails.push(`${tabSwitches} tab switch(es) detected (-${tabPenalty} pts)`);
  }

  // Window blur penalty (-4 per occurrence)
  if (windowBlurs > 0) {
    const blurPenalty = Math.min(20, windowBlurs * 4);
    score -= blurPenalty;
    deductionDetails.push(`${windowBlurs} window unfocus event(s) (-${blurPenalty} pts)`);
  }

  // Gaze penalty
  if (centerGazePct < 75) {
    const gazePenalty = Math.min(20, Math.round((75 - centerGazePct) * 0.6));
    score -= gazePenalty;
    deductionDetails.push(`Reduced center screen gaze: ${centerGazePct}% (-${gazePenalty} pts)`);
  }

  // Anomalies
  for (const a of anomalies) {
    if (a === 'MULTIPLE_FACES') {
      score -= 25;
      deductionDetails.push('Multiple faces detected in camera frame (-25 pts)');
    } else if (a === 'NO_FACE_DETECTED') {
      score -= 15;
      deductionDetails.push('Candidate absent from camera frame (-15 pts)');
    }
  }

  const finalScore = Math.max(10, Math.min(100, Math.round(score)));

  let status = 'EXCELLENT';
  let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

  if (finalScore >= 85) {
    status = 'EXCELLENT';
    badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  } else if (finalScore >= 70) {
    status = 'MONITORED';
    badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  } else if (finalScore >= 50) {
    status = 'WARNING';
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  } else {
    status = 'BREACH';
    badgeColor = 'bg-red-500/10 text-red-400 border-red-500/20';
  }

  return {
    score: finalScore,
    status,
    badgeColor,
    isCleared: finalScore >= 75 && tabSwitches <= 2,
    deductionDetails,
  };
}
