import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import type { TensionState } from '@engine/types';

const SPEED: Record<TensionState, number> = {
  CALM: 40,
  UNEASY: 28,
  IRRITATED: 18,
  UNSTABLE: 12,
  MELTDOWN: 8,
};

export function useTypewriter(text: string, tension: TensionState) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const indexRef = useRef(0);

  // Reset before paint when text changes — prevents one-frame stale text flash
  useLayoutEffect(() => {
    clearInterval(intervalRef.current);
    indexRef.current = 0;
    setDisplayed('');
    setDone(!text);
  }, [text]);

  useEffect(() => {
    // Start typing interval
    indexRef.current = 0;

    if (!text) return;

    const speed = SPEED[tension];
    const id = setInterval(() => {
      indexRef.current++;
      const next = text.slice(0, indexRef.current);
      setDisplayed(next);
      if (indexRef.current >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, speed);
    intervalRef.current = id;

    return () => clearInterval(id);
  }, [text, tension]);

  const skip = useCallback(() => {
    clearInterval(intervalRef.current);
    setDisplayed(text);
    setDone(true);
  }, [text]);

  return { displayed, done, skip };
}
