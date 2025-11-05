/**
 * Game progress persistence using LocalStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameProgress, LevelCompletion } from '../types';

const STORAGE_KEY = 'no-you-are-the-router-progress';
const GAME_VERSION = '1.0.0';

interface ProgressStore {
  progress: GameProgress;
  saveCompletion: (completion: LevelCompletion) => void;
  getCurrentLevel: () => number;
  getTotalStars: () => number;
  isLevelUnlocked: (levelId: number) => boolean;
  resetProgress: () => void;
}

const initialProgress: GameProgress = {
  levelsCompleted: {},
  currentLevel: 1,
  totalStars: 0,
  lastPlayed: Date.now(),
  version: GAME_VERSION,
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      progress: initialProgress,

      saveCompletion: (completion: LevelCompletion) => {
        set((state) => {
          const newLevelsCompleted = {
            ...state.progress.levelsCompleted,
            [completion.levelId]: completion,
          };

          // Calculate total stars
          const totalStars = Object.values(newLevelsCompleted).reduce(
            (sum, c) => sum + c.stars,
            0
          );

          // Determine next level
          const currentLevel = completion.passed
            ? Math.max(state.progress.currentLevel, completion.levelId + 1)
            : state.progress.currentLevel;

          return {
            progress: {
              ...state.progress,
              levelsCompleted: newLevelsCompleted,
              currentLevel,
              totalStars,
              lastPlayed: Date.now(),
            },
          };
        });
      },

      getCurrentLevel: () => {
        return get().progress.currentLevel;
      },

      getTotalStars: () => {
        return get().progress.totalStars;
      },

      isLevelUnlocked: (levelId: number) => {
        const { progress } = get();

        // Level 1 is always unlocked
        if (levelId === 1) return true;

        // Check if previous level is completed
        const prevLevel = progress.levelsCompleted[levelId - 1];
        return prevLevel !== undefined && prevLevel.passed;
      },

      resetProgress: () => {
        set({ progress: initialProgress });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
    }
  )
);
