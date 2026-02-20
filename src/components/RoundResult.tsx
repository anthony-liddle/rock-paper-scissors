import { useGameState } from '@engine/gameStore';

export function RoundResult() {
  const { lastRoundResult, phase, roundPhase } = useGameState();

  if (phase !== 'playing' || roundPhase !== 'revealing') return null;

  const resultLabel =
    lastRoundResult === 'player' ? 'YOU WIN' :
    lastRoundResult === 'robot' ? 'THIS ONE WINS' :
    'TIE';

  return (
    <div className="round-result">
      <div className="result-label">{resultLabel}</div>
    </div>
  );
}
