import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameState, revealRound, completeReveal } from '@engine/gameStore';
import {
  getAnimationForTension,
  getChoiceAnimation,
  getBurstAnimation,
  tensionFrameRate,
  animations,
} from '@data/animationRegistry';
import type { Choice } from '@engine/types';
import { corruptFrame } from '@engine/frameCorruption';

const CHOICE_FRAME_RATE = 55;
const CHOICE_HOLD_MS = 1200;
const ENDING_FRAME_RATE = 65;

export function AsciiAnimation() {
  const { tensionState, tensionScore, phase, roundPhase, pendingRobotChoice, endingType } = useGameState();
  const containerRef = useRef<HTMLPreElement>(null);
  const tensionScoreRef = useRef(tensionScore);
  const frameRef = useRef(0);
  const directionRef = useRef(1);
  const rafRef = useRef<number>(0);
  const lastUpdateRef = useRef(0);
  const [idleFrames, setIdleFrames] = useState<string[]>(() => getAnimationForTension('CALM'));

  // Choice animation state
  const choiceFramesRef = useRef<string[]>([]);
  const choiceFrameIndexRef = useRef(0);
  const holdStartRef = useRef(0);
  const [mode, setMode] = useState<'idle' | 'playing' | 'holding' | 'ending' | 'ended'>('idle');

  // Ending animation frames
  const endingFramesRef = useRef<string[]>([]);

  // Keep tensionScore ref in sync without resetting animation loop
  useEffect(() => { tensionScoreRef.current = tensionScore; }, [tensionScore]);

  // Pick new idle animation when tension changes
  useEffect(() => {
    if (phase === 'ending') return;
    if (mode !== 'idle') return;
    const newFrames = getAnimationForTension(tensionState);
    setIdleFrames(newFrames);
    frameRef.current = 0;
    directionRef.current = 1;
  }, [tensionState, phase, mode]);

  // Start ending animation when phase becomes 'ending'
  useEffect(() => {
    if (phase !== 'ending' || mode === 'ending' || mode === 'ended') return;

    let frames: string[];
    if (endingType === 'BROKEN') {
      frames = getBurstAnimation();
    } else {
      frames = animations.approach || getAnimationForTension('UNSTABLE');
    }

    endingFramesRef.current = frames;
    frameRef.current = 0;
    lastUpdateRef.current = 0;
    setMode('ending');
  }, [phase, endingType, mode]);

  // Start choice animation when roundPhase becomes 'animating'
  const startChoiceAnim = useCallback((robotChoice: Choice) => {
    choiceFramesRef.current = getChoiceAnimation(robotChoice);
    choiceFrameIndexRef.current = 0;
    holdStartRef.current = 0;
    lastUpdateRef.current = 0;
    setMode('playing');
  }, []);

  useEffect(() => {
    if (roundPhase === 'animating' && pendingRobotChoice && mode === 'idle') {
      startChoiceAnim(pendingRobotChoice);
    }
  }, [roundPhase, pendingRobotChoice, mode, startChoiceAnim]);

  // Return to idle after round resolves
  useEffect(() => {
    if (roundPhase === 'result' && mode !== 'idle' && mode !== 'ending' && mode !== 'ended') {
      setMode('idle');
      const newFrames = getAnimationForTension(tensionState);
      setIdleFrames(newFrames);
      frameRef.current = 0;
      directionRef.current = 1;
    }
  }, [roundPhase, mode, tensionState]);

  // Animation loop
  useEffect(() => {
    const tick = (timestamp: number) => {
      if (!containerRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (mode === 'ending') {
        tickEnding(timestamp);
      } else if (mode === 'ended') {
        // Hold final frame — do nothing
      } else if (mode === 'playing') {
        tickChoice(timestamp);
      } else if (mode === 'holding') {
        tickHold(timestamp);
      } else {
        tickIdle(timestamp);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const tickIdle = (timestamp: number) => {
      if (!idleFrames.length) return;

      const interval = tensionFrameRate[tensionState];
      const useRandom = tensionState === 'MELTDOWN';

      if (timestamp - lastUpdateRef.current >= interval) {
        lastUpdateRef.current = timestamp;

        if (useRandom) {
          frameRef.current = Math.floor(Math.random() * idleFrames.length);
        } else {
          const next = frameRef.current + directionRef.current;
          if (next >= idleFrames.length - 1) {
            directionRef.current = -1;
            frameRef.current = idleFrames.length - 1;
          } else if (next <= 0) {
            directionRef.current = 1;
            frameRef.current = 0;
          } else {
            frameRef.current = next;
          }
        }

        const rawFrame = idleFrames[frameRef.current];
        containerRef.current!.textContent = tensionState === 'MELTDOWN'
          ? corruptFrame(rawFrame, idleFrames, tensionScoreRef.current / 100)
          : rawFrame;
      }
    };

    const tickEnding = (timestamp: number) => {
      const frames = endingFramesRef.current;
      if (!frames.length) {
        setMode('ended');
        return;
      }

      // Show first frame immediately
      if (frameRef.current === 0 && lastUpdateRef.current === 0) {
        lastUpdateRef.current = timestamp;
        containerRef.current!.textContent = frames[0];
        return;
      }

      if (timestamp - lastUpdateRef.current >= ENDING_FRAME_RATE) {
        lastUpdateRef.current = timestamp;
        frameRef.current++;

        if (frameRef.current >= frames.length) {
          // Hold final frame
          frameRef.current = frames.length - 1;
          containerRef.current!.textContent = frames[frameRef.current];
          setMode('ended');
        } else {
          containerRef.current!.textContent = frames[frameRef.current];
        }
      }
    };

    const tickChoice = (timestamp: number) => {
      const frames = choiceFramesRef.current;
      if (!frames.length) {
        setMode('idle');
        revealRound();
        completeReveal();
        return;
      }

      // Show first frame immediately
      if (choiceFrameIndexRef.current === 0 && lastUpdateRef.current === 0) {
        lastUpdateRef.current = timestamp;
        containerRef.current!.textContent = frames[0];
        return;
      }

      if (timestamp - lastUpdateRef.current >= CHOICE_FRAME_RATE) {
        lastUpdateRef.current = timestamp;
        choiceFrameIndexRef.current++;

        if (choiceFrameIndexRef.current >= frames.length) {
          // Done playing forward — resolve round and hold with result visible
          choiceFrameIndexRef.current = Math.max(0, frames.length - 2);
          holdStartRef.current = timestamp;
          setMode('holding');
          revealRound();
          containerRef.current!.textContent = frames[choiceFrameIndexRef.current];
        } else {
          containerRef.current!.textContent = frames[choiceFrameIndexRef.current];
        }
      }
    };

    const tickHold = (timestamp: number) => {
      if (timestamp - holdStartRef.current >= CHOICE_HOLD_MS) {
        setMode('idle');
        completeReveal();
        return;
      }

      const frames = choiceFramesRef.current;
      if (frames.length < 2) return;

      // Loop last 2 frames while holding
      if (timestamp - lastUpdateRef.current >= CHOICE_FRAME_RATE) {
        lastUpdateRef.current = timestamp;
        const loopStart = frames.length - 2;
        const idx = choiceFrameIndexRef.current === loopStart ? frames.length - 1 : loopStart;
        choiceFrameIndexRef.current = idx;
        containerRef.current!.textContent = frames[idx];
      }
    };

    // Set initial frame
    if (containerRef.current && mode === 'idle' && idleFrames[0]) {
      containerRef.current.textContent = idleFrames[0];
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [idleFrames, tensionState, mode]);

  return (
    <pre
      ref={containerRef}
      className={`ascii-animation tension-${tensionState.toLowerCase()}`}
    />
  );
}
