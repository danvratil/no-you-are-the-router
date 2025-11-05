/**
 * Central export for all game levels
 */

import level1 from './level1';
import level2 from './level2';
import level3 from './level3';
import level4 from './level4';
import level5 from './level5';
import level6 from './level6';
import level7 from './level7';
import level8 from './level8';
import level9 from './level9';

import type { LevelConfig } from '../../types';

export const levels: { [key: number]: LevelConfig } = {
  1: level1,
  2: level2,
  3: level3,
  4: level4,
  5: level5,
  6: level6,
  7: level7,
  8: level8,
  9: level9,
};

export const TOTAL_LEVELS = 9;

export function getLevel(id: number): LevelConfig | null {
  return levels[id] || null;
}

export function getAllLevels(): LevelConfig[] {
  return Object.values(levels).sort((a, b) => a.id - b.id);
}
