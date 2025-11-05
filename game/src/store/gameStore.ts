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
  applySourceNAT,
  applyDestinationNAT,
} from '../engine/routing';
import { evaluateRules } from '../engine/automation';
import { clonePacket } from '../engine/packets';

// Constants
const AUTO_ADVANCE_DELAY_MS = 2000;

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
  resetGameState: () => void;
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

    // Clone packet for potential modifications (NAT)
    let workingPacket = clonePacket(currentPacket);

    // Get device state (will be updated immutably later)
    const deviceState = level.playerDevice;
    let updatedDeviceState = deviceState;

    // Learn MAC if it's a switch (immutable update)
    if (deviceState.type === DeviceType.SWITCH && workingPacket.ingressPort) {
      const updatedTable = learnMAC(
        workingPacket,
        workingPacket.ingressPort,
        (deviceState as SwitchState).macTable
      );
      updatedDeviceState = {
        ...deviceState,
        macTable: updatedTable,
      } as SwitchState;
    }

    // Check automation rules if not manual routing
    let matchedRule: AutomationRule | null = null;
    if (!manual && level.automationEnabled && progress.rules.length > 0) {
      const { decision: autoDecision, matchedRule: rule } = evaluateRules(
        workingPacket,
        progress.rules,
        updatedDeviceState as SwitchState | RouterState
      );

      if (autoDecision && rule) {
        decision = autoDecision;
        matchedRule = rule;
      }
    }

    // Apply NAT if needed before routing (for outbound packets)
    if (deviceState.type === DeviceType.ROUTER && decision.applyNAT) {
      const routerState = updatedDeviceState as RouterState;

      if (decision.natType === 'source' || (!decision.natType && decision.port === 'WAN')) {
        const natResult = applySourceNAT(workingPacket, routerState);
        if (natResult) {
          workingPacket = natResult.packet;
          // Update NAT table immutably
          updatedDeviceState = {
            ...routerState,
            natTable: [...routerState.natTable, natResult.natEntry],
          } as RouterState;
        }
      } else if (decision.natType === 'destination') {
        const rewrittenPacket = applyDestinationNAT(workingPacket, routerState);
        if (rewrittenPacket) {
          workingPacket = rewrittenPacket;
        }
      }
    }

    // Determine correct decision (using updated device state)
    let correctResult: RoutingResult;
    if (updatedDeviceState.type === DeviceType.SWITCH) {
      correctResult = routePacketSwitch(workingPacket, updatedDeviceState as SwitchState);
    } else {
      correctResult = routePacketRouter(workingPacket, updatedDeviceState as RouterState);
    }

    // Validate player's decision (or automated decision)
    const validation = validateDecision(
      workingPacket,
      decision,
      correctResult.decision
    );

    // Record decision
    const playerDecision: PlayerDecision = {
      packetId: currentPacket.id,
      timestamp: Date.now(),
      manualRouting: manual,
      ruleUsed: matchedRule ? matchedRule.id : undefined,
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

    // Update rule match count if automation was used
    const updatedRules = matchedRule
      ? progress.rules.map(r =>
          r.id === matchedRule.id
            ? { ...r, matchCount: r.matchCount + 1 }
            : r
        )
      : progress.rules;

    // Create feedback
    const feedback: RoutingResult = {
      success: validation.correct,
      decision,
      message: validation.message,
      correctDecision: correctResult.decision,
    };

    // Update state immutably
    set((state) => ({
      progress: {
        ...state.progress,
        decisions: [...state.progress.decisions, playerDecision],
        score: newScore,
        rules: updatedRules,
      },
      feedback,
      level: {
        ...state.level,
        playerDevice: updatedDeviceState,
      },
    }));

    // Auto-advance after brief delay
    setTimeout(() => {
      get().nextPacket();
    }, AUTO_ADVANCE_DELAY_MS);
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

  resetGameState: () => {
    set({ ...initialState });
  },

  clearFeedback: () => {
    set({ feedback: null });
  },
}));
