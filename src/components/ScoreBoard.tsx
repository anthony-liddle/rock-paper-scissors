import { useGameState } from '@engine/gameStore';

// TODO: Update spacing

export function ScoreBoard() {
  const { playerWins, robotWins, tensionState } = useGameState();

  return (
    <div className={`scoreboard tension-${tensionState.toLowerCase()}`}>
      <span className="score-label">YOU</span>
      <span className="score-value">[{playerWins}]</span>
      <span className="score-separator">:</span>
      <span className="score-value">[{robotWins}]</span>
      <span className="score-label">US</span>
    </div>
  );
}
