/**
 * Level definition and game state types
 */

import type { Packet, RoutingResult } from './packet';
import type { Device, NetworkNode, NetworkConnection } from './device';
import type { AutomationRule, RuleBlock } from './rule';

/** Level difficulty */
export enum LevelDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

/** Tutorial trigger conditions */
export type TutorialTrigger =
  | { type: 'start' } // Show at level start
  | { type: 'packetIndex'; index: number } // Show before specific packet index
  | { type: 'packetCondition'; condition: (packet: Packet) => boolean } // Show when packet matches condition
  | { type: 'manual' }; // Show manually when requested

/** Tutorial step */
export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  highlightElement?: string; // CSS selector
  trigger: TutorialTrigger; // When to show this tutorial
  requiresAction?: boolean; // Wait for user action
  shown?: boolean; // Track if already shown (runtime state)
}

/** Level objectives */
export interface LevelObjective {
  id: string;
  description: string;
  completed: boolean;
}

/** Star rating thresholds */
export interface StarThresholds {
  oneStarAccuracy: number; // e.g., 0.90 = 90%
  twoStarAccuracy: number; // e.g., 0.95 = 95%
  threeStarAccuracy: number; // e.g., 0.98 = 98%
  maxRulesForThreeStars?: number; // For levels with automation
  speedBonusSeconds?: number; // If under this time, boost stars
}

/** Level configuration */
export interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  difficulty: LevelDifficulty;
  description: string;

  // What the player controls
  playerDevice: Device;

  // Network topology
  nodes: NetworkNode[];
  connections: NetworkConnection[];

  // Tutorial
  tutorial: TutorialStep[];

  // Packets to route
  packets: Packet[];
  guidedPacketIndices: number[]; // Which packets have guidance

  // Automation
  automationEnabled: boolean;
  availableRuleBlocks: RuleBlock[];
  maxRecommendedRules?: number;

  // Scoring
  starThresholds: StarThresholds;
  passThreshold: number; // e.g., 0.90 = 90%

  // Learning outcomes
  learningOutcomes: string[];
}

/** Player's routing decision for a packet */
export interface PlayerDecision {
  packetId: string;
  timestamp: number;
  manualRouting: boolean; // true if manual, false if automated
  ruleUsed?: string; // Rule ID if automated
  decision: {
    action: 'forward' | 'flood' | 'drop';
    port?: string;
    ports?: string[];
  };
}

/** Level progress state */
export interface LevelProgress {
  levelId: number;
  started: boolean;
  completed: boolean;
  currentPacketIndex: number;
  decisions: PlayerDecision[];
  score: {
    correctCount: number;
    incorrectCount: number;
    totalCount: number;
    accuracy: number;
  };
  rules: AutomationRule[];
  timeStarted?: number;
  timeCompleted?: number;
  stars: number; // 0-3
}

/** Complete game state for a level */
export interface GameState {
  level: LevelConfig;
  progress: LevelProgress;
  currentPacket: Packet | null;
  packetQueue: Packet[];
  feedback: RoutingResult | null;
  showTutorial: boolean;
  currentTutorialStep: number;
  paused: boolean;
}

/** Level completion result */
export interface LevelCompletion {
  levelId: number;
  passed: boolean;
  accuracy: number;
  stars: number;
  rulesUsed: number;
  timeTaken: number; // seconds
  perfectAccuracy: boolean;
  message: string;
  nextLevelUnlocked: boolean;
}

/** Overall game progress */
export interface GameProgress {
  levelsCompleted: { [levelId: number]: LevelCompletion };
  currentLevel: number;
  totalStars: number;
  lastPlayed: number; // timestamp
  version: string; // for save compatibility
}
