/**
 * Main game layout component
 */

import { LevelHeader } from './LevelHeader';
import { NetworkTopology } from '../game/NetworkTopology';
import { PacketInspector } from '../game/PacketInspector';
import { DeviceState } from '../game/DeviceState';
import { ControlPanel } from '../game/ControlPanel';
import { AutomationPanel } from '../game/AutomationPanel';
import { useGameStore } from '../../store/gameStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { generateLevelCompletion } from '../../engine/scoring';
import { useProgressStore } from '../../store/progressStore';

interface GameLayoutProps {
  onBackToLevelSelect: () => void;
}

export function GameLayout({ onBackToLevelSelect }: GameLayoutProps) {
  const { level, progress, showTutorial, currentTutorialStep, toggleTutorial, nextTutorialStep } =
    useGameStore();
  const { saveCompletion } = useProgressStore();

  const currentTutorial = level.tutorial[currentTutorialStep];
  const hasMoreTutorial = currentTutorialStep < level.tutorial.length - 1;

  // Check if level is completed
  const levelCompleted = progress.completed;
  const completion = levelCompleted ? generateLevelCompletion(level, progress) : null;

  const handleTutorialNext = () => {
    if (hasMoreTutorial) {
      nextTutorialStep();
    } else {
      toggleTutorial();
    }
  };

  const handleLevelComplete = () => {
    if (completion) {
      saveCompletion(completion);
      // Reload to level select or next level
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <LevelHeader onBackToLevelSelect={onBackToLevelSelect} />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 max-w-7xl mx-auto p-4 w-full overflow-hidden flex flex-col">
          {/* Top Section: Topology + Side Panels */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden mb-4">
            {/* Left: Network Topology */}
            <div className="flex flex-col overflow-auto">
              <NetworkTopology />
            </div>

            {/* Right: Packet Inspector + Device State */}
            <div className="flex flex-col gap-4 overflow-auto">
              <PacketInspector />
              <DeviceState />
            </div>
          </div>

          {/* Bottom Section: Control Panel */}
          <div className="flex flex-col gap-4 overflow-auto max-h-[30vh]">
            <ControlPanel />
            {level.automationEnabled && <AutomationPanel />}
          </div>
        </div>
      </div>

      {/* Tutorial Modal */}
      {showTutorial && currentTutorial && (
        <Modal
          isOpen={true}
          onClose={toggleTutorial}
          title={currentTutorial.title}
          actions={
            <>
              <Button onClick={toggleTutorial} variant="secondary">
                Skip Tutorial
              </Button>
              <Button onClick={handleTutorialNext}>
                {hasMoreTutorial ? 'Next' : 'Got it!'}
              </Button>
            </>
          }
        >
          <div className="prose prose-sm max-w-none">
            <p>{currentTutorial.content}</p>
          </div>
        </Modal>
      )}

      {/* Level Complete Modal */}
      {levelCompleted && completion && (
        <Modal
          isOpen={true}
          onClose={() => {}}
          title={completion.passed ? 'Level Complete!' : 'Level Failed'}
          actions={
            <>
              <Button onClick={() => window.location.reload()} variant="secondary">
                Retry
              </Button>
              {completion.passed && (
                <Button onClick={handleLevelComplete} variant="success">
                  Continue
                </Button>
              )}
            </>
          }
        >
          <div className="space-y-4">
            {/* Stars */}
            <div className="flex justify-center gap-2">
              {Array.from({ length: 3 }, (_, i) => (
                <span
                  key={i}
                  className={`text-4xl ${
                    i < completion.stars ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {(completion.accuracy * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {completion.rulesUsed}
                </div>
                <div className="text-sm text-gray-600">Rules Used</div>
              </div>
            </div>

            {/* Message */}
            <div className="text-center text-gray-700">{completion.message}</div>

            {/* Learning Outcomes */}
            {completion.passed && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="font-semibold text-sm mb-2">What you learned:</div>
                <ul className="text-sm text-gray-700 space-y-1">
                  {level.learningOutcomes.map((outcome, i) => (
                    <li key={i}>✓ {outcome}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
