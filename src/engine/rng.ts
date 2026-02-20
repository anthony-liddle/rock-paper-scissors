import type { Choice } from '@engine/types';

const CHOICES: Choice[] = ['rock', 'paper', 'scissors'];

export function getRandomChoice(): Choice {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return CHOICES[array[0] % 3];
}
