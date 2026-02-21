import { useEffect, useMemo } from 'react';
import { useGameState, advanceDialogue } from '@engine/gameStore';
import { useTypewriter } from '@engine/useTypewriter';
import { corruptDialogueText } from '@engine/textCorruption';

export function DialogueBox() {
  const { dialogueLines, dialogueIndex, dialogueComplete, tensionState, roundPhase } = useGameState();
  const currentLine = dialogueLines[dialogueIndex] ?? '';
  const isSystemLine = currentLine.startsWith('> ');
  const displayLine = isSystemLine ? currentLine.slice(2) : currentLine;
  const corruptedLine = useMemo(
    () => isSystemLine ? displayLine : corruptDialogueText(displayLine, tensionState),
    [displayLine, tensionState, isSystemLine],
  );
  const { displayed, done, skip } = useTypewriter(corruptedLine, tensionState);

  const handleClick = () => {
    if (!done) {
      skip();
    } else if (!dialogueComplete) {
      advanceDialogue();
    }
  };

  // Keyboard: Enter to skip typewriter or advance dialogue
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.key !== 'Enter') return;
      if (!done) { skip(); return; }
      if (!dialogueComplete) advanceDialogue();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [done, dialogueComplete, skip]);

  // Hide during round animation and result reveal
  if (roundPhase === 'animating' || roundPhase === 'revealing') return null;

  const showNext = done && !dialogueComplete;

  return (
    <div
      className={`dialogue-box tension-${tensionState.toLowerCase()}${isSystemLine ? ' system-line' : ''}`}
      onClick={handleClick}
      style={{ cursor: (!done || !dialogueComplete) ? 'pointer' : 'default' }}
    >
      <div className="dialogue-content">
        {!isSystemLine && <span className="dialogue-prompt">&gt; </span>}
        <span className="dialogue-text">{displayed}</span>
        <span className="cursor">_</span>
        <span className="dialogue-reserve" aria-hidden="true">{corruptedLine.slice(displayed.length)}</span>
      </div>
      <span className={`next-hint${showNext ? ' next-hint-visible' : ''}`}>[NEXT &gt;]</span>
    </div>
  );
}
