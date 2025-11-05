/**
 * Main application component
 */

import { useState, useEffect } from 'react';
import { GameLayout } from './components/layout/GameLayout';
import { LevelSelect } from './components/layout/LevelSelect';
import { useGameStore } from './store/gameStore';

function App() {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const { startLevel } = useGameStore();

  const handleSelectLevel = (levelId: number) => {
    setSelectedLevel(levelId);
    startLevel(levelId);
  };

  const handleBackToLevelSelect = () => {
    setSelectedLevel(null);
  };

  // Auto-start level 1 for first-time players (optional)
  useEffect(() => {
    // Could check localStorage here to see if this is first visit
    // For now, always start at level select
  }, []);

  if (selectedLevel === null) {
    return <LevelSelect onSelectLevel={handleSelectLevel} />;
  }

  return <GameLayout onBackToLevelSelect={handleBackToLevelSelect} />;
}

export default App;
