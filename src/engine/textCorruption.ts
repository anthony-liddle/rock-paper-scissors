import type { TensionState } from '@engine/types';

const GLITCH_CHARS = ['\u2593', '\u2591', '\u2588', '\u2592', '\u2573', '#', '@'];

const CORRUPTION_RATE: Record<TensionState, number> = {
  CALM: 0,
  UNEASY: 0,
  IRRITATED: 0,
  UNSTABLE: 0.02,
  MELTDOWN: 0.05,
};

export function corruptDialogueText(text: string, tensionState: TensionState): string {
  const rate = CORRUPTION_RATE[tensionState];
  if (rate === 0) return text;

  const chars = text.split('');
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] !== ' ' && Math.random() < rate) {
      chars[i] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
    }
  }
  return chars.join('');
}
