/**
 * Scoring and star rating calculation
 */

import {
  LevelProgress,
  LevelConfig,
  LevelCompletion,
  StarThresholds,
} from '../types';

/**
 * Calculate accuracy percentage
 */
export function calculateAccuracy(progress: LevelProgress): number {
  if (progress.score.totalCount === 0) return 0;
  return progress.score.correctCount / progress.score.totalCount;
}

/**
 * Calculate star rating based on accuracy and efficiency
 */
export function calculateStars(
  accuracy: number,
  rulesCount: number,
  timeTaken: number,
  thresholds: StarThresholds
): number {
  // Must meet minimum accuracy for any stars
  if (accuracy < thresholds.oneStarAccuracy) {
    return 0;
  }

  let stars = 1;

  // Check for 2 stars
  if (accuracy >= thresholds.twoStarAccuracy) {
    stars = 2;
  }

  // Check for 3 stars
  if (accuracy >= thresholds.threeStarAccuracy) {
    stars = 3;

    // Apply rule count penalty for 3-star rating
    if (
      thresholds.maxRulesForThreeStars !== undefined &&
      rulesCount > thresholds.maxRulesForThreeStars
    ) {
      stars = 2;
    }

    // Apply speed bonus check
    if (
      thresholds.speedBonusSeconds !== undefined &&
      timeTaken > thresholds.speedBonusSeconds
    ) {
      stars = 2;
    }
  }

  return stars;
}

/**
 * Check if level is passed
 */
export function isLevelPassed(
  progress: LevelProgress,
  passThreshold: number
): boolean {
  const accuracy = calculateAccuracy(progress);
  return accuracy >= passThreshold;
}

/**
 * Generate level completion result
 */
export function generateLevelCompletion(
  level: LevelConfig,
  progress: LevelProgress
): LevelCompletion {
  const accuracy = calculateAccuracy(progress);
  const passed = accuracy >= level.passThreshold;

  const timeTaken = progress.timeCompleted && progress.timeStarted
    ? (progress.timeCompleted - progress.timeStarted) / 1000
    : 0;

  const stars = calculateStars(
    accuracy,
    progress.rules.length,
    timeTaken,
    level.starThresholds
  );

  let message = '';
  if (!passed) {
    message = `Level failed. You need ${(level.passThreshold * 100).toFixed(0)}% accuracy to pass. Try again!`;
  } else if (stars === 1) {
    message = 'Level passed! Can you improve your accuracy for more stars?';
  } else if (stars === 2) {
    message = 'Great job! Try to get perfect accuracy or use fewer rules for 3 stars.';
  } else {
    message = 'Perfect! You mastered this level! 🌟';
  }

  return {
    levelId: level.id,
    passed,
    accuracy,
    stars,
    rulesUsed: progress.rules.length,
    timeTaken,
    perfectAccuracy: accuracy === 1.0,
    message,
    nextLevelUnlocked: passed,
  };
}

/**
 * Calculate efficiency score (0-100)
 */
export function calculateEfficiency(
  rulesCount: number,
  optimalRulesCount: number
): number {
  if (rulesCount === 0) return 100;
  if (rulesCount <= optimalRulesCount) return 100;

  // Penalty for extra rules
  const penalty = ((rulesCount - optimalRulesCount) / optimalRulesCount) * 20;
  return Math.max(0, 100 - penalty);
}

/**
 * Calculate speed score (0-100)
 */
export function calculateSpeedScore(
  timeTaken: number,
  targetTime: number
): number {
  if (timeTaken <= targetTime) return 100;

  // Penalty for extra time
  const penalty = ((timeTaken - targetTime) / targetTime) * 20;
  return Math.max(0, 100 - penalty);
}

/**
 * Get performance message based on scores
 */
export function getPerformanceMessage(
  accuracy: number,
  stars: number,
  rulesCount: number,
  maxRules?: number
): string {
  const messages: string[] = [];

  if (accuracy === 1.0) {
    messages.push('Perfect accuracy!');
  } else if (accuracy >= 0.95) {
    messages.push('Excellent accuracy!');
  } else if (accuracy >= 0.90) {
    messages.push('Good accuracy.');
  } else {
    messages.push('Needs improvement.');
  }

  if (maxRules !== undefined) {
    if (rulesCount <= maxRules) {
      messages.push('Efficient rule usage!');
    } else {
      messages.push(`Try using ${maxRules} or fewer rules for better efficiency.`);
    }
  }

  if (stars === 3) {
    messages.push('⭐⭐⭐ Outstanding!');
  } else if (stars === 2) {
    messages.push('⭐⭐ Great work!');
  } else if (stars === 1) {
    messages.push('⭐ You passed!');
  }

  return messages.join(' ');
}

/**
 * Calculate total game progress
 */
export function calculateTotalProgress(completions: {
  [levelId: number]: LevelCompletion;
}): {
  totalLevelsCompleted: number;
  totalStars: number;
  averageAccuracy: number;
  perfectLevels: number;
} {
  const levels = Object.values(completions);

  return {
    totalLevelsCompleted: levels.filter((l) => l.passed).length,
    totalStars: levels.reduce((sum, l) => sum + l.stars, 0),
    averageAccuracy:
      levels.reduce((sum, l) => sum + l.accuracy, 0) / levels.length || 0,
    perfectLevels: levels.filter((l) => l.perfectAccuracy).length,
  };
}

/**
 * Get next level recommendation
 */
export function getNextLevelRecommendation(
  completions: { [levelId: number]: LevelCompletion },
  totalLevels: number
): number | null {
  // Find first uncompleted level
  for (let i = 1; i <= totalLevels; i++) {
    if (!completions[i] || !completions[i].passed) {
      return i;
    }
  }

  // All levels completed - suggest replaying for better stars
  const levelWithLowStars = Object.values(completions).find((l) => l.stars < 3);
  if (levelWithLowStars) {
    return levelWithLowStars.levelId;
  }

  return null; // Everything perfect!
}
