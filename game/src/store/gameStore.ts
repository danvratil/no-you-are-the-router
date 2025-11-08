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
  TutorialStep,
  Packet,
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

/**
 * Helper function to check if a tutorial should be shown for the current state
 */
function shouldShowTutorial(
  tutorial: TutorialStep,
  packet: Packet | null,
  packetIndex: number,
  tutorialsShown: Set<string>
): boolean {
  // Already shown - check runtime state
  if (tutorialsShown.has(tutorial.id)) return false;

  const { trigger } = tutorial;

  switch (trigger.type) {
    case 'start':
      // Show at the very beginning
      return packetIndex === 0 && packet !== null;

    case 'packetIndex':
      // Show when we reach a specific packet index
      return packetIndex === trigger.index;

    case 'packetCondition':
      // Show when packet matches a condition
      if (!packet) return false;
      try {
        return trigger.condition(packet);
      } catch (error) {
        console.error('Error evaluating tutorial condition:', error);
        return false;
      }

    case 'manual':
      // Never show automatically
      return false;

    default:
      return false;
  }
}

/**
 * Helper function to mark a tutorial as shown (DRY principle)
 */
function markTutorialShown(
  tutorialsShown: Set<string>,
  tutorialId: string
): Set<string> {
  const updated = new Set(tutorialsShown);
  updated.add(tutorialId);
  return updated;
}

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
    tutorialsShown: new Set<string>(),
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

    // Initialize tutorial tracking - no tutorials shown yet
    const tutorialsShown = new Set<string>();

    // Check for 'start' trigger tutorials
    const startTutorialIndex = level.tutorial.findIndex(
      t => t.trigger.type === 'start'
    );

    const shouldShowTutorial = startTutorialIndex >= 0;

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
        tutorialsShown,
        timeStarted: Date.now(),
        stars: 0,
      },
      currentPacket,
      packetQueue,
      feedback: null,
      showTutorial: shouldShowTutorial,
      currentTutorialStep: shouldShowTutorial ? startTutorialIndex : 0,
      paused: false,
    });
  },

  nextPacket: () => {
    const { progress, packetQueue, level } = get();
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

    // Check if any tutorial should be triggered for this packet
    // Optimize: find and mark in a single pass
    let tutorialToShow = -1;
    const updatedTutorialsShown = new Set(progress.tutorialsShown);

    for (let i = 0; i < level.tutorial.length; i++) {
      const tutorial = level.tutorial[i];
      if (shouldShowTutorial(tutorial, nextPacket, nextIndex, progress.tutorialsShown)) {
        tutorialToShow = i;
        updatedTutorialsShown.add(tutorial.id);
        break; // Show only one tutorial at a time
      }
    }

    set({
      progress: {
        ...progress,
        currentPacketIndex: nextIndex,
        tutorialsShown: updatedTutorialsShown,
      },
      currentPacket: nextPacket,
      feedback: null,
      showTutorial: tutorialToShow >= 0,
      currentTutorialStep: tutorialToShow >= 0 ? tutorialToShow : 0,
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
    set((state) => {
      // Mark current tutorial as shown when dismissed
      const currentTutorial = state.level.tutorial[state.currentTutorialStep];
      const updatedTutorialsShown = currentTutorial
        ? markTutorialShown(state.progress.tutorialsShown, currentTutorial.id)
        : state.progress.tutorialsShown;

      return {
        showTutorial: false,
        progress: {
          ...state.progress,
          tutorialsShown: updatedTutorialsShown,
        },
      };
    });
  },

  nextTutorialStep: () => {
    set((state) => {
      // Bounds checking: ensure we don't exceed tutorial array length
      const nextStep = state.currentTutorialStep + 1;
      if (nextStep >= state.level.tutorial.length) {
        // No more tutorials, just close
        return { showTutorial: false };
      }

      // Mark current tutorial as shown
      const currentTutorial = state.level.tutorial[state.currentTutorialStep];
      const updatedTutorialsShown = currentTutorial
        ? markTutorialShown(state.progress.tutorialsShown, currentTutorial.id)
        : state.progress.tutorialsShown;

      return {
        currentTutorialStep: nextStep,
        progress: {
          ...state.progress,
          tutorialsShown: updatedTutorialsShown,
        },
      };
    });
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
