import { useEffect, useRef, useState } from 'react';
import { startGame, useGameState, advanceDialogue } from '@engine/gameStore';
import { useTypewriter } from '@hooks/useTypewriter';
import { animationsReady } from '@data/animationsReady';
import { getLoadingLine } from '@data/dialogue';

export function LandingScreen() {
  const { dialogueLines, dialogueIndex, dialogueComplete, tensionState } = useGameState();
  const currentLine = dialogueLines[dialogueIndex] ?? '';
  const { displayed, done, skip } = useTypewriter(currentLine, tensionState);
  const [loadingLine, setLoadingLine] = useState<string | null>(null);
  const initiating = useRef(false);

  const handleInitiate = () => {
    if (initiating.current) return;
    initiating.current = true;

    // Check if the Promise is already resolved by racing against an immediately-resolving Promise.
    // If animationsReady has already settled, its .then() fires synchronously in the microtask
    // queue before Promise.resolve().then() — so `resolved` will be true by the time we check.
    let resolved = false;
    animationsReady.then(() => { resolved = true; });

    Promise.resolve().then(() => {
      if (resolved) {
        startGame();
      } else {
        setLoadingLine(getLoadingLine());
        animationsReady.then(() => startGame()).catch(() => {
          initiating.current = false;
          setLoadingLine(null);
        });
      }
    });
  };

  const handleDialogueClick = () => {
    if (loadingLine !== null) return;
    if (!done) {
      skip();
    } else if (!dialogueComplete) {
      advanceDialogue();
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.key !== 'Enter') return;
      if (loadingLine !== null) return;
      if (!done) { skip(); return; }
      if (!dialogueComplete) { advanceDialogue(); return; }
      handleInitiate();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [done, dialogueComplete, skip, loadingLine]);

  const showNext = done && !dialogueComplete && loadingLine === null;
  const showButton = dialogueComplete && done && loadingLine === null;
  const displayedText = loadingLine !== null ? loadingLine : displayed;

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
        style={{ cursor: (!done || !dialogueComplete) && loadingLine === null ? 'pointer' : 'default' }}
      >
        <div className="dialogue-content">
          <span className="dialogue-prompt">&gt; </span>
          <span className="dialogue-text">{displayedText}</span>
          <span className="cursor">_</span>
          <span className="dialogue-reserve" aria-hidden="true">{loadingLine === null ? currentLine.slice(displayed.length) : ''}</span>
        </div>
        <span className={`next-hint${showNext ? ' next-hint-visible' : ''}`}>[NEXT &gt;]</span>
      </div>
      <button
        className={`start-btn${showButton ? ' start-btn-visible' : ''}`}
        onClick={handleInitiate}
        disabled={!showButton}
      >
        {'>'} INITIATE MATCH {'<'}
      </button>
    </div>
  );
}
