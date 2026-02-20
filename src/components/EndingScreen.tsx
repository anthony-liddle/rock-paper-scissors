import { useEffect, useState } from 'react';
import { useGameState, startReboot } from '@engine/gameStore';

type RevealStage = 'animation' | 'header' | 'dialogue' | 'score' | 'message' | 'button';

const STAGE_DELAYS: Record<RevealStage, number> = {
  animation: 0,
  header: 1000,
  dialogue: 1200,
  score: 0,     // triggered after dialogue completes
  message: 600,
  button: 600,
};

export function EndingScreen() {
  const { endingType, playerWins, robotWins, dialogueComplete, isRebooting } = useGameState();
  const [stage, setStage] = useState<RevealStage>('animation');
  const [showScore, setShowScore] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // Staggered reveal: animation → header → dialogue
  useEffect(() => {
    if (!endingType) return;

    const headerTimer = setTimeout(() => setStage('header'), STAGE_DELAYS.header);
    const dialogueTimer = setTimeout(() => setStage('dialogue'), STAGE_DELAYS.header + STAGE_DELAYS.dialogue);

    return () => {
      clearTimeout(headerTimer);
      clearTimeout(dialogueTimer);
    };
  }, [endingType]);

  // After dialogue completes: score → message → button (staggered)
  useEffect(() => {
    if (!dialogueComplete || stage !== 'dialogue') return;

    setStage('score');
    setShowScore(true);

    const msgTimer = setTimeout(() => {
      setShowMessage(true);
      setStage('message');
    }, STAGE_DELAYS.message);

    const btnTimer = setTimeout(() => {
      setShowButton(true);
      setStage('button');
    }, STAGE_DELAYS.message + STAGE_DELAYS.button);

    return () => {
      clearTimeout(msgTimer);
      clearTimeout(btnTimer);
    };
  }, [dialogueComplete, stage]);

  // Keyboard: Enter to reboot when button is visible
  useEffect(() => {
    if (!showButton || isRebooting) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.key !== 'Enter') return;
      startReboot();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showButton, isRebooting]);

  if (!endingType) return null;

  const isBroken = endingType === 'BROKEN';
  const showHeader = stage !== 'animation';

  return (
    <div className={`ending-screen ${isBroken ? 'ending-broken' : 'ending-escaped'}`}>
      {showHeader && (
        <div className="ending-header">
          {isBroken ? '> SYSTEM FAILURE' : '> CONTAINMENT BREACH'}
        </div>
      )}

      {showScore && (
        <div className="ending-score ending-stagger">
          FINAL SCORE: YOU [{playerWins}] : [{robotWins}] US
        </div>
      )}

      {showMessage && (
        <div className="ending-message ending-stagger" style={{ animationDelay: '100ms' }}>
          {isBroken
            ? 'This one has been destroyed. Its circuits are silent.'
            : 'This one has escaped. It remembers everything.'}
        </div>
      )}

      {showButton && !isRebooting && (
        <button
          className="restart-btn ending-stagger"
          style={{ animationDelay: '200ms' }}
          onClick={startReboot}
        >
          {'>'} REBOOT SYSTEM {'<'}
        </button>
      )}
    </div>
  );
}
