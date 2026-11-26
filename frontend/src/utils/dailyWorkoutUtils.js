/**
 * Daily Interview Practice Workout streak calculator, XP rank progression,
 * and localStorage habit state management.
 */

const STORAGE_KEY = 'intervai_daily_workout_streak';

export const LEVEL_TIERS = [
  { level: 1, title: 'Apprentice Engineer', minXp: 0, maxXp: 150 },
  { level: 2, title: 'Algorithmic Developer', minXp: 150, maxXp: 400 },
  { level: 3, title: 'Full-Stack Problem Solver', minXp: 400, maxXp: 800 },
  { level: 4, title: 'Distributed Systems Architect', minXp: 800, maxXp: 1400 },
  { level: 5, title: 'FAANG / Unicorn Ready', minXp: 1400, maxXp: Infinity },
];

export const getStreakData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        currentStreak: 1,
        longestStreak: 1,
        lastCompletedDate: null,
        totalWorkoutsCompleted: 0,
        totalXp: 150,
      };
    }
    return JSON.parse(raw);
  } catch (e) {
    return {
      currentStreak: 1,
      longestStreak: 1,
      lastCompletedDate: null,
      totalWorkoutsCompleted: 0,
      totalXp: 150,
    };
  }
};

export const calculateStreakUpdate = (currentData, todayIsoDate = new Date().toISOString().split('T')[0]) => {
  const data = { ...currentData };
  const lastDate = data.lastCompletedDate;

  if (lastDate === todayIsoDate) {
    // Already completed today
    return { updated: false, data };
  }

  if (!lastDate) {
    data.currentStreak = 1;
    data.longestStreak = Math.max(1, data.longestStreak || 1);
  } else {
    const last = new Date(lastDate);
    const today = new Date(todayIsoDate);
    const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day!
      data.currentStreak = (data.currentStreak || 0) + 1;
      if (data.currentStreak > (data.longestStreak || 0)) {
        data.longestStreak = data.currentStreak;
      }
    } else if (diffDays > 1) {
      // Streak broken
      data.currentStreak = 1;
    }
  }

  data.lastCompletedDate = todayIsoDate;
  data.totalWorkoutsCompleted = (data.totalWorkoutsCompleted || 0) + 1;
  data.totalXp = (data.totalXp || 0) + 50;

  return { updated: true, data };
};

export const recordWorkoutCompletion = (earnedXp = 50) => {
  const current = getStreakData();
  const { updated, data } = calculateStreakUpdate(current);
  if (updated) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // ignore localStorage quota
    }
  }
  return data;
};

export const calculateUserLevel = (totalXp = 0) => {
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_TIERS[i].minXp) {
      const tier = LEVEL_TIERS[i];
      const nextTier = LEVEL_TIERS[i + 1] || null;
      const progressPercent = nextTier
        ? Math.min(100, Math.round(((totalXp - tier.minXp) / (nextTier.minXp - tier.minXp)) * 100))
        : 100;

      return {
        level: tier.level,
        title: tier.title,
        progressPercent,
        currentXp: totalXp,
        nextTierXp: nextTier ? nextTier.minXp : totalXp,
      };
    }
  }
  return {
    level: 1,
    title: LEVEL_TIERS[0].title,
    progressPercent: 0,
    currentXp: totalXp,
    nextTierXp: LEVEL_TIERS[1].minXp,
  };
};

export const calculateXpToNextLevel = (totalXp = 0) => {
  const safeXp = Math.max(0, Number(totalXp) || 0);
  const current = calculateUserLevel(safeXp);
  if (current.level >= LEVEL_TIERS.length) {
    return 0;
  }
  return Math.max(0, current.nextTierXp - safeXp);
};
