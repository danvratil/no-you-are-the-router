/**
 * Main game state management using Zustand
 */

import { create } from 'zustand';
import type {
  GameState,
  RoutingResult,
  RoutingDecision,
  AutomationRule,
  PlayerDecision,
  SwitchState,
  RouterState,
} from '../types';
import { DeviceType } from '../types';
import { getLevel } from '../engine/levels';
import {
  routePacketSwitch,
  routePacketRouter,
  learnMAC,
  validateDecision,
} from '../engine/routing';

interface GameStore extends GameState {
  // Actions
  startLevel: (levelId: number) => void;
  nextPacket: () => void;
  routePacket: (decision: RoutingDecision, manual: boolean) => void;
  addRule: (rule: AutomationRule) => void;
  removeRule: (ruleId: string) => void;
  updateRule: (ruleId: string, updates: Partial<AutomationRule>) => void;
  reorderRules: (rules: AutomationRule[]) => void;
  toggleTutorial: () => void;
  nextTutorialStep: () => void;
  resetLevel: () => void;
  clearFeedback: () => void;
}

const initialState: GameState = {
  level: getLevel(1)!,
  progress: {
    levelId: 1,
    started: false,
    completed: false,
    currentPacketIndex: 0,
    decisions: [],
    score: {
      correctCount: 0,
      incorrectCount: 0,
      totalCount: 0,
      accuracy: 0,
    },
    rules: [],
    stars: 0,
  },
  currentPacket: null,
  packetQueue: [],
  feedback: null,
  showTutorial: true,
  currentTutorialStep: 0,
  paused: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  startLevel: (levelId: number) => {
    const level = getLevel(levelId);
    if (!level) return;

    // Initialize packet queue
    const packetQueue = [...level.packets];
    const currentPacket = packetQueue[0] || null;

    set({
      level,
      progress: {
        levelId,
        started: true,
        completed: false,
        currentPacketIndex: 0,
        decisions: [],
        score: {
          correctCount: 0,
          incorrectCount: 0,
          totalCount: 0,
          accuracy: 0,
        },
        rules: [],
        timeStarted: Date.now(),
        stars: 0,
      },
      currentPacket,
      packetQueue,
      feedback: null,
      showTutorial: level.tutorial.length > 0,
      currentTutorialStep: 0,
      paused: false,
    });
  },

  nextPacket: () => {
    const { progress, packetQueue } = get();
    const nextIndex = progress.currentPacketIndex + 1;

    if (nextIndex >= packetQueue.length) {
      // Level completed
      set((state) => ({
        progress: {
          ...state.progress,
          completed: true,
          timeCompleted: Date.now(),
        },
        currentPacket: null,
      }));
      return;
    }

    const nextPacket = packetQueue[nextIndex];

    set({
      progress: {
        ...progress,
        currentPacketIndex: nextIndex,
      },
      currentPacket: nextPacket,
      feedback: null,
    });
  },

  routePacket: (decision: RoutingDecision, manual: boolean) => {
    const { currentPacket, level, progress } = get();
    if (!currentPacket) return;

    // Get device state
    const deviceState = level.playerDevice;

    // Learn MAC if it's a switch
    if (deviceState.type === DeviceType.SWITCH && currentPacket.ingressPort) {
      const updatedTable = learnMAC(
        currentPacket,
        currentPacket.ingressPort,
        deviceState.macTable
      );
      deviceState.macTable = updatedTable;
    }

    // Determine correct decision
    let correctResult: RoutingResult;
    if (deviceState.type === DeviceType.SWITCH) {
      correctResult = routePacketSwitch(currentPacket, deviceState as SwitchState);
    } else {
      correctResult = routePacketRouter(currentPacket, deviceState as RouterState);
    }

    // Validate player's decision
    const validation = validateDecision(
      currentPacket,
      decision,
      correctResult.decision
    );

    // Record decision
    const playerDecision: PlayerDecision = {
      packetId: currentPacket.id,
      timestamp: Date.now(),
      manualRouting: manual,
      ruleUsed: manual ? undefined : 'auto',
      decision,
    };

    // Update score
    const newScore = {
      correctCount: progress.score.correctCount + (validation.correct ? 1 : 0),
      incorrectCount: progress.score.incorrectCount + (validation.correct ? 0 : 1),
      totalCount: progress.score.totalCount + 1,
      accuracy: 0,
    };
    newScore.accuracy = newScore.correctCount / newScore.totalCount;

    // Create feedback
    const feedback: RoutingResult = {
      success: validation.correct,
      decision,
      message: validation.message,
      correctDecision: correctResult.decision,
    };

    set((state) => ({
      progress: {
        ...state.progress,
        decisions: [...state.progress.decisions, playerDecision],
        score: newScore,
      },
      feedback,
      level: {
        ...state.level,
        playerDevice: deviceState,
      },
    }));

    // Auto-advance after brief delay
    setTimeout(() => {
      get().nextPacket();
    }, 2000);
  },

  addRule: (rule: AutomationRule) => {
    set((state) => ({
      progress: {
        ...state.progress,
        rules: [...state.progress.rules, rule],
      },
    }));
  },

  removeRule: (ruleId: string) => {
    set((state) => ({
      progress: {
        ...state.progress,
        rules: state.progress.rules.filter((r) => r.id !== ruleId),
      },
    }));
  },

  updateRule: (ruleId: string, updates: Partial<AutomationRule>) => {
    set((state) => ({
      progress: {
        ...state.progress,
        rules: state.progress.rules.map((r) =>
          r.id === ruleId ? { ...r, ...updates } : r
        ),
      },
    }));
  },

  reorderRules: (rules: AutomationRule[]) => {
    set((state) => ({
      progress: {
        ...state.progress,
        rules,
      },
    }));
  },

  toggleTutorial: () => {
    set((state) => ({
      showTutorial: !state.showTutorial,
    }));
  },

  nextTutorialStep: () => {
    set((state) => ({
      currentTutorialStep: state.currentTutorialStep + 1,
    }));
  },

  resetLevel: () => {
    const { level } = get();
    get().startLevel(level.id);
  },

  clearFeedback: () => {
    set({ feedback: null });
  },
}));
