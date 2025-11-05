/**
 * Level selection screen
 */

import { useProgressStore } from '../../store/progressStore';
import { getAllLevels } from '../../engine/levels';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface LevelSelectProps {
  onSelectLevel: (levelId: number) => void;
}

export function LevelSelect({ onSelectLevel }: LevelSelectProps) {
  const { progress, isLevelUnlocked } = useProgressStore();
  const levels = getAllLevels();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            No, YOU Are the Router!
          </h1>
          <p className="text-xl text-gray-600">
            Learn networking by becoming the network device
          </p>
          <div className="mt-4 flex justify-center gap-6 text-lg">
            <div>
              <span className="font-bold text-purple-600">{progress.totalStars}</span>
              <span className="text-gray-600"> / 27 Stars</span>
            </div>
            <div>
              <span className="font-bold text-blue-600">
                {Object.keys(progress.levelsCompleted).length}
              </span>
              <span className="text-gray-600"> / 9 Levels</span>
            </div>
          </div>
        </div>

        {/* Level Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level) => {
            const unlocked = isLevelUnlocked(level.id);
            const completion = progress.levelsCompleted[level.id];
            const stars = completion?.stars || 0;

            return (
              <Card key={level.id} className="relative">
                {/* Lock Overlay */}
                {!unlocked && (
                  <div className="absolute inset-0 bg-gray-900 bg-opacity-50 rounded-lg flex items-center justify-center z-10">
                    <div className="text-white text-2xl font-bold">LOCKED</div>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Level Number */}
                  <div className="flex items-start justify-between">
                    <div className="text-sm font-semibold text-gray-500">
                      Level {level.id}
                    </div>
                    {completion && (
                      <div className="flex gap-0.5">
                        {Array.from({ length: 3 }, (_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < stars ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900">{level.title}</h3>

                  {/* Subtitle */}
                  <p className="text-sm text-gray-600">{level.subtitle}</p>

                  {/* Difficulty Badge */}
                  <div>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        level.difficulty === 'beginner'
                          ? 'bg-green-100 text-green-800'
                          : level.difficulty === 'intermediate'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {level.difficulty.toUpperCase()}
                    </span>
                  </div>

                  {/* Play Button */}
                  <Button
                    onClick={() => onSelectLevel(level.id)}
                    disabled={!unlocked}
                    className="w-full"
                    variant={completion?.passed ? 'success' : 'primary'}
                  >
                    {completion?.passed ? 'Replay' : 'Play'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600 text-sm">
          <p>
            An educational game teaching networking fundamentals through hands-on simulation
          </p>
          <p className="mt-2">
            Made with React, TypeScript, and Zustand
          </p>
        </div>
      </div>
    </div>
  );
}
