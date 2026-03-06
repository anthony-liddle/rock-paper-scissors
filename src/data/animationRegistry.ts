import { pickRandom } from '@utils/random';
import type { TensionState, Choice } from '@engine/types';

const ANIMATION_NAMES = [
  'tilting', 'backandforth', 'sidetoside',
  'jiggle', 'wobble', 'wibblewobble', 'forthandback',
  'shudder', 'shudderbackandforth', 'shudderleftlean', 'shudderrightlean',
  'flailleftlean', 'flailrightlean',
  'tiltandquiver', 'approach', 'shake', 'convulse',
  'grasp1', 'grasp2', 'grasp3', 'grasp4', 'grasp5', 'grasp6', 'grasp7', 'grasp8',
  'burst1', 'burst2', 'burst3',
  'rock', 'paper', 'scissors',
] as const;

// In-memory cache — populated by loadAnimations()
export const animations: Record<string, string[]> = {};

export const tensionAnimations: Record<TensionState, string[]> = {
  CALM: ['tilting', 'backandforth', 'sidetoside'],
  UNEASY: ['jiggle', 'wobble', 'wibblewobble', 'forthandback'],
  IRRITATED: ['flailleftlean', 'flailrightlean', 'shudder', 'shudderbackandforth', 'shudderleftlean', 'shudderrightlean'],
  UNSTABLE: ['grasp1', 'grasp2', 'grasp3', 'grasp4', 'grasp5', 'grasp6', 'grasp7', 'grasp8'],
  MELTDOWN: ['tiltandquiver', 'approach', 'shake', 'convulse', 'burst1', 'burst2', 'burst3'],
};

const choiceAnimations: Record<Choice, string> = {
  rock: 'rock',
  paper: 'paper',
  scissors: 'scissors',
};

const graspAnimations = ['grasp1', 'grasp2', 'grasp3', 'grasp4', 'grasp5', 'grasp6', 'grasp7', 'grasp8'];
const burstAnimations = ['burst1', 'burst2', 'burst3'];

export function loadAnimations(): Promise<void> {
  const base = import.meta.env.BASE_URL || '/';
  const promises = ANIMATION_NAMES.map(async (name) => {
    const res = await fetch(`${base}animations/${name}.json`);
    if (!res.ok) throw new Error(`Failed to fetch animation: ${name} (${res.status})`);
    const frames: string[] = await res.json();
    animations[name] = frames;
  });
  return Promise.all(promises).then(() => undefined);
}

export function getAnimationForTension(tension: TensionState): string[] {
  const name = pickRandom(tensionAnimations[tension]);
  return animations[name] ?? [];
}

export function getAnimationByName(name: string): string[] {
  return animations[name] ?? animations.wobble ?? [];
}

export function getChoiceAnimation(choice: Choice): string[] {
  return animations[choiceAnimations[choice]] ?? [];
}

export function getGraspAnimation(): string[] {
  return animations[pickRandom(graspAnimations)] ?? [];
}

export function getBurstAnimation(): string[] {
  return animations[pickRandom(burstAnimations)] ?? [];
}

export const tensionFrameRate: Record<TensionState, number> = {
  CALM: 84,
  UNEASY: 70,
  IRRITATED: 56,
  UNSTABLE: 42,
  MELTDOWN: 28,
};
