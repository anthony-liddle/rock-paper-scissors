import { useEffect } from 'react';
import { startGame, useGameState, advanceDialogue } from '@engine/gameStore';
import { useTypewriter } from '@hooks/useTypewriter';

export function LandingScreen() {
  const { dialogueLines, dialogueIndex, dialogueComplete, tensionState } = useGameState();
  const currentLine = dialogueLines[dialogueIndex] ?? '';
  const { displayed, done, skip } = useTypewriter(currentLine, tensionState);

  const handleDialogueClick = () => {
    if (!done) {
      skip();
    } else if (!dialogueComplete) {
      advanceDialogue();
    }
  };

  // Keyboard: Enter to skip/advance/start
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.key !== 'Enter') return;
      if (!done) { skip(); return; }
      if (!dialogueComplete) { advanceDialogue(); return; }
      startGame();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [done, dialogueComplete, skip]);

  const showNext = done && !dialogueComplete;

  return (
    <div className="landing-screen">
      <pre className="title-ascii">{`
  ██████╗  ██████╗       ███████╗██╗  ██╗ █████╗ ███╗   ███╗
  ██╔══██╗██╔═══██╗      ██╔════╝██║  ██║██╔══██╗████╗ ████║
  ██████╔╝██║   ██║█████╗███████╗███████║███████║██╔████╔██║
  ██╔══██╗██║   ██║╚════╝╚════██║██╔══██║██╔══██║██║╚██╔╝██║
  ██║  ██║╚██████╔╝      ███████║██║  ██║██║  ██║██║ ╚═╝ ██║
  ╚═╝  ╚═╝ ╚═════╝       ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝
                     ██████╗  ██████╗    ███████╗██╗  ██╗███████╗
                     ██╔══██╗██╔═══██╗   ██╔════╝╚██╗██╔╝██╔════╝
                     ██████╔╝██║   ██║   █████╗   ╚███╔╝ █████╗
                     ██╔══██╗██║   ██║   ██╔══╝   ██╔██╗ ██╔══╝
                     ██████╔╝╚██████╔╝██╗███████╗██╔╝ ██╗███████╗
                     ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝
      `}</pre>
      <p className="tagline">"It's just Rock Paper Scissors."</p>
      <div
        className="dialogue-box"
        onClick={handleDialogueClick}
        style={{ cursor: (!done || !dialogueComplete) ? 'pointer' : 'default' }}
      >
        <div className="dialogue-content">
          <span className="dialogue-prompt">&gt; </span>
          <span className="dialogue-text">{displayed}</span>
          <span className="cursor">_</span>
          <span className="dialogue-reserve" aria-hidden="true">{currentLine.slice(displayed.length)}</span>
        </div>
        <span className={`next-hint${showNext ? ' next-hint-visible' : ''}`}>[NEXT &gt;]</span>
      </div>
      <button
        className={`start-btn${dialogueComplete && done ? ' start-btn-visible' : ''}`}
        onClick={startGame}
        disabled={!dialogueComplete || !done}
      >
        {'>'} INITIATE MATCH {'<'}
      </button>
    </div>
  );
}
