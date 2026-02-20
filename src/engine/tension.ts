import type { TensionState } from '@engine/types';

const THRESHOLDS: { state: TensionState; min: number }[] = [
  { state: 'MELTDOWN', min: 80 },
  { state: 'UNSTABLE', min: 60 },
  { state: 'IRRITATED', min: 40 },
  { state: 'UNEASY', min: 20 },
  { state: 'CALM', min: 0 },
];

export function getTensionState(score: number): TensionState {
  for (const { state, min } of THRESHOLDS) {
    if (score >= min) return state;
  }
  return 'CALM';
}

export function getEffectiveTension(baseScore: number, spike: number): number {
  return Math.min(baseScore + spike, 100);
}

export function calculateTensionIncrease(
  _roundsPlayed: number,
  scoreDiff: number,
  robotLost: boolean,
): number {
  let increase = 3;
  increase += Math.abs(scoreDiff) * 2;
  if (robotLost) increase += 2;
  else increase += 1;
  increase += Math.floor(Math.random() * 3);
  return increase;
}
