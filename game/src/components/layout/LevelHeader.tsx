/**
 * Level header showing title, progress, and stats
 */

import { useGameStore } from '../../store/gameStore';
import { Button } from '../ui/Button';

export function LevelHeader() {
  const { level, progress, resetLevel } = useGameStore();

  const accuracy = progress.score.totalCount > 0
    ? (progress.score.correctCount / progress.score.totalCount) * 100
    : 0;

  const stars = Array.from({ length: 3 }, (_, i) => i < progress.stars);

  return (
    <div className="bg-white shadow-md p-4 border-b-2 border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Level Info */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Level {level.id}: {level.title}
            </h1>
            <p className="text-sm text-gray-600">{level.subtitle}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            {/* Stars */}
            <div className="flex items-center gap-1">
              {stars.map((filled, i) => (
                <span
                  key={i}
                  className={`text-2xl ${
                    filled ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ⭐
                </span>
              ))}
            </div>

            {/* Packet Progress */}
            <div className="text-sm">
              <div className="font-semibold">Packets</div>
              <div className="text-gray-600">
                {progress.currentPacketIndex} / {level.packets.length}
              </div>
            </div>

            {/* Accuracy */}
            <div className="text-sm">
              <div className="font-semibold">Accuracy</div>
              <div
                className={`${
                  accuracy >= 90
                    ? 'text-green-600'
                    : accuracy >= 70
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {accuracy.toFixed(1)}%
              </div>
            </div>

            {/* Rules (if automation enabled) */}
            {level.automationEnabled && (
              <div className="text-sm">
                <div className="font-semibold">Rules</div>
                <div className="text-gray-600">{progress.rules.length}</div>
              </div>
            )}

            {/* Reset Button */}
            <Button onClick={resetLevel} variant="secondary" size="sm">
              🔄 Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
