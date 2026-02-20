import { useState, useEffect, useRef } from 'react';
import { useGameState } from '@engine/gameStore';
import type { TensionState } from '@engine/types';

interface VisualEffectState {
  flashActive: boolean;
  tearStyle: React.CSSProperties | null;
  colorBleedActive: boolean;
  endingRedBleed: boolean;
}

const PROB: Record<string, Record<TensionState, number>> = {
  flash:      { CALM: 0, UNEASY: 0, IRRITATED: 0, UNSTABLE: 0,    MELTDOWN: 0.3 },
  tear:       { CALM: 0, UNEASY: 0, IRRITATED: 0, UNSTABLE: 0.2,  MELTDOWN: 0.4 },
  colorBleed: { CALM: 0, UNEASY: 0, IRRITATED: 0.1, UNSTABLE: 0.2, MELTDOWN: 0.35 },
};

export function useVisualEffects(): VisualEffectState {
  const { tensionState, phase, endingType } = useGameState();
  const [flashActive, setFlashActive] = useState(false);
  const [tearStyle, setTearStyle] = useState<React.CSSProperties | null>(null);
  const [colorBleedActive, setColorBleedActive] = useState(false);
  const [endingRedBleed, setEndingRedBleed] = useState(false);
  const tensionRef = useRef(tensionState);

  useEffect(() => {
    tensionRef.current = tensionState;
  }, [tensionState]);

  // Playing phase effects
  useEffect(() => {
    if (phase !== 'playing') return;

    const timers: ReturnType<typeof setInterval>[] = [];

    // Screen flash — brief white/invert
    timers.push(setInterval(() => {
      if (Math.random() < PROB.flash[tensionRef.current]) {
        setFlashActive(true);
        setTimeout(() => setFlashActive(false), 150);
      }
    }, 3000));

    // Screen tear — horizontal band displacement
    timers.push(setInterval(() => {
      if (Math.random() < PROB.tear[tensionRef.current]) {
        setTearStyle({
          position: 'absolute',
          top: `${20 + Math.random() * 60}%`,
          left: 0,
          right: 0,
          height: `${3 + Math.random() * 5}px`,
          background: 'linear-gradient(90deg, transparent, rgba(255,0,0,0.3), rgba(0,255,0,0.2), rgba(0,0,255,0.3), transparent)',
          transform: `translateX(${(Math.random() - 0.5) * 20}px)`,
          zIndex: 20,
          pointerEvents: 'none',
        });
        setTimeout(() => setTearStyle(null), 120 + Math.random() * 80);
      }
    }, 2000));

    // Color bleed — red tint wash
    timers.push(setInterval(() => {
      if (Math.random() < PROB.colorBleed[tensionRef.current]) {
        setColorBleedActive(true);
        setTimeout(() => setColorBleedActive(false), 400);
      }
    }, 4000));

    return () => timers.forEach(clearInterval);
  }, [phase]);

  // Ending phase effects
  useEffect(() => {
    if (phase !== 'ending') {
      setEndingRedBleed(false);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    if (endingType === 'BROKEN') {
      // Immediate screen flash
      setFlashActive(true);
      timers.push(setTimeout(() => setFlashActive(false), 150));

      // Rapid screen tears for ~2s
      for (let i = 0; i < 8; i++) {
        timers.push(setTimeout(() => {
          setTearStyle({
            position: 'absolute',
            top: `${10 + Math.random() * 80}%`,
            left: 0,
            right: 0,
            height: `${3 + Math.random() * 8}px`,
            background: 'linear-gradient(90deg, transparent, rgba(255,0,0,0.4), rgba(0,255,0,0.2), rgba(0,0,255,0.4), transparent)',
            transform: `translateX(${(Math.random() - 0.5) * 30}px)`,
            zIndex: 20,
            pointerEvents: 'none',
          });
          setTimeout(() => setTearStyle(null), 100 + Math.random() * 80);
        }, 100 + i * 250));
      }
    } else if (endingType === 'ESCAPED') {
      // Persistent red color bleed overlay
      setEndingRedBleed(true);
    }

    return () => timers.forEach(clearTimeout);
  }, [phase, endingType]);

  return { flashActive, tearStyle, colorBleedActive, endingRedBleed };
}
