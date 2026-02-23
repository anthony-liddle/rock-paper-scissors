import { useState, useEffect, useCallback, useRef } from 'react';
import type { Choice, TensionState } from '@engine/types';
import { beginRound, useGameState } from '@engine/gameStore';
import { rollDisruption, getRandomFakeLabel } from '@engine/disruptions';
import { musicManager } from '@engine/musicManager';
import { getHoverCommentary } from '@data/hoverDialogue';
import type { Disruption } from '@engine/disruptions';

interface ChoiceConfig {
  choice: Choice;
  label: string;
  key: string;
}

const BASE_CHOICES: ChoiceConfig[] = [
  { choice: 'rock', label: '[ ROCK ]', key: '1' },
  { choice: 'paper', label: '[ PAPER ]', key: '2' },
  { choice: 'scissors', label: '[ SCISSORS ]', key: '3' },
];

const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

export function ChoiceButtons() {
  const { phase, roundPhase, tensionState, dialogueComplete, pendingPermission } = useGameState();
  const [locked, setLocked] = useState(false);
  const [confirming, setConfirming] = useState<{ choice: Choice; message: string } | null>(null);
  const [jittering, setJittering] = useState(false);
  const [, setJitterTick] = useState(0);
  const [fakeLabels, setFakeLabels] = useState<Record<string, string>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [hoverComment, setHoverComment] = useState<{ text: string; buttonIndex: number } | null>(null);
  const hoverCooldownRef = useRef<Set<number>>(new Set());
  const hoverCountRef = useRef(0);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Reset state when dialogue changes (new round ready)
  useEffect(() => {
    setLocked(false);
    setConfirming(null);
    setJittering(false);
    setFakeLabels({});
    setHoverComment(null);
    hoverCooldownRef.current.clear();
    hoverCountRef.current = 0;
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, [dialogueComplete]);

  // Jitter effect: randomize button positions with CSS
  useEffect(() => {
    if (!jittering) return;
    const interval = setInterval(() => {
      setJitterTick((t) => t + 1);
    }, 100);
    const timeout = setTimeout(() => {
      setJittering(false);
      clearInterval(interval);
    }, 1500);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [jittering]);

  // Relabel effect: restore real labels after a delay
  useEffect(() => {
    if (Object.keys(fakeLabels).length === 0) return;
    const timeout = setTimeout(() => setFakeLabels({}), 2000);
    return () => clearTimeout(timeout);
  }, [fakeLabels]);

  const executeChoice = useCallback((choice: Choice) => {
    beginRound(choice);
  }, []);

  const handleChoice = useCallback((choice: Choice) => {
    if (locked) return;

    // If we're in confirm mode, this is the confirmation click
    if (confirming) {
      setConfirming(null);
      executeChoice(confirming.choice);
      return;
    }

    // Roll for disruption
    const disruption: Disruption | null = rollDisruption(tensionState);

    if (!disruption) {
      executeChoice(choice);
      return;
    }

    musicManager.playSfx('disruption');
    switch (disruption.type) {
      case 'confirm':
        setConfirming({ choice, message: disruption.message! });
        break;

      case 'delay':
        setLocked(true);
        timerRef.current = setTimeout(() => {
          setLocked(false);
          executeChoice(choice);
        }, disruption.durationMs!);
        break;

      case 'jitter':
        setJittering(true);
        // Still execute the choice — jitter is cosmetic
        executeChoice(choice);
        break;

      case 'relabel':
        setFakeLabels({
          rock: getRandomFakeLabel(),
          paper: getRandomFakeLabel(),
          scissors: getRandomFakeLabel(),
        });
        // Player's choice is stored before relabel — execute normally
        executeChoice(choice);
        break;
    }
  }, [locked, confirming, tensionState, executeChoice]);

  const HOVER_PROBABILITY: Record<TensionState, number> = {
    CALM: 0,
    UNEASY: 0.1,
    IRRITATED: 0.25,
    UNSTABLE: 0.4,
    MELTDOWN: 0.6,
  };

  const handleHover = useCallback((choice: Choice, index: number) => {
    // Cooldown: max 1 comment per button per round
    if (hoverCooldownRef.current.has(index)) return;

    // Probability gate
    if (Math.random() > HOVER_PROBABILITY[tensionState]) return;

    hoverCountRef.current++;
    const text = getHoverCommentary(tensionState, choice, hoverCountRef.current);
    if (!text) return;

    hoverCooldownRef.current.add(index);
    setHoverComment({ text, buttonIndex: index });

    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setHoverComment(null);
    }, 2000);
  }, [tensionState]);

  const handleHoverLeave = useCallback(() => {
    setHoverComment(null);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  }, []);

  // Keyboard input: 1/2/3 for choices, Enter/Escape for confirm disruption
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (confirming) {
        if (e.key === 'Enter') handleChoice(confirming.choice);
        if (e.key === 'Escape') setConfirming(null);
        return;
      }

      const map: Record<string, Choice> = { '1': 'rock', '2': 'paper', '3': 'scissors' };
      const choice = map[e.key];
      if (choice) handleChoice(choice);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [handleChoice, confirming]);

  if (phase !== 'playing' || !dialogueComplete || roundPhase === 'animating' || roundPhase === 'revealing' || pendingPermission) return null;

  // Confirm mode: show confirmation prompt
  // TODO: ensure the text in the confirmation reflects what the prompt is asking
  if (confirming) {
    return (
      <div className="choice-buttons">
        <div className="disruption-confirm">
          <span className="disruption-message">{confirming.message}</span>
          <button
            className="choice-btn confirm-btn"
            onClick={() => handleChoice(confirming.choice)}
          >
            [ YES ]
          </button>
          <button
            className="choice-btn confirm-btn"
            onClick={() => setConfirming(null)}
          >
            [ ...NO? ]
          </button>
        </div>
      </div>
    );
  }

  // Delay mode: show processing message
  if (locked) {
    return (
      <div className="choice-buttons">
        <div className="disruption-delay">
          <span className="disruption-processing">PROCESSING INPUT...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`choice-buttons tension-${tensionState.toLowerCase()}`}>
      {BASE_CHOICES.map(({ choice, label, key }, index) => {
        const displayLabel = fakeLabels[choice] || label;
        /* eslint-disable react-hooks/purity -- intentional random jitter for visual shake effect */
        const jitterStyle = jittering ? {
          transform: `translate(${(Math.random() - 0.5) * 8}px, ${(Math.random() - 0.5) * 6}px)`,
        } : undefined;
        /* eslint-enable react-hooks/purity */

        return (
          <div key={choice} className="choice-btn-wrapper">
            {!isTouchDevice && hoverComment && hoverComment.buttonIndex === index && (
              <div className="hover-commentary">{hoverComment?.text}</div>
            )}
            <button
              className={`choice-btn ${jittering ? 'btn-jitter' : ''}`}
              style={jitterStyle}
              onClick={() => handleChoice(choice)}
              onMouseEnter={isTouchDevice ? undefined : () => handleHover(choice, index)}
              onMouseLeave={isTouchDevice ? undefined : handleHoverLeave}
            >
              <span className="choice-key">{key}.</span> {displayLabel}
            </button>
          </div>
        );
      })}
    </div>
  );
}
