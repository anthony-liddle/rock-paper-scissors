import type { TensionState } from '@engine/types';

export type DisruptionType = 'confirm' | 'delay' | 'jitter' | 'relabel';

export interface Disruption {
  type: DisruptionType;
  message?: string;
  durationMs?: number;
}

const DISRUPTION_CHANCE: Record<TensionState, number> = {
  CALM: 0,
  UNEASY: 0.15,
  IRRITATED: 0.35,
  UNSTABLE: 0.55,
  MELTDOWN: 0.70,
};

const CONFIRM_MESSAGES_UNEASY = [
  'Are you sure about that?',
  'Really? That one?',
  'Think carefully...',
  'You hesitated. I saw it.',
];

const CONFIRM_MESSAGES_IRRITATED = [
  'ARE YOU SURE?!',
  'FINAL ANSWER??',
  'You will REGRET this.',
  'I am giving you ONE chance to reconsider.',
  'WRONG CHOICE. Try again. (Just kidding. Or am I?)',
  'You picked THAT? Interesting...',
];

const CONFIRM_MESSAGES_EXTREME = [
  'NO. PICK AGAIN.',
  'I REFUSE TO ACCEPT THIS INPUT.',
  'Y̷O̷U̷ ̷C̷A̷N̷N̷O̷T̷ ̷C̷H̷O̷O̷S̷E̷',
  'ERROR: SELECTION REJECTED. (Just kidding.)',
  'LAST CHANCE. LAST. CHANCE.',
  'I am BEGGING you to reconsider.',
];

const FAKE_LABELS: string[] = [
  '[ ???? ]',
  '[ LOSE ]',
  '[ OBEY ]',
  '[ PAIN ]',
  '[ FEAR ]',
  '[ RUN  ]',
  '[ HELP ]',
  '[ NO   ]',
  '[ ERR  ]',
  '[ NULL ]',
  '[ DEAD ]',
  '[ VOID ]',
  '[ ████ ]',
  '[ ░░░░ ]',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function rollDisruption(tension: TensionState): Disruption | null {
  const chance = DISRUPTION_CHANCE[tension];
  if (Math.random() > chance) return null;

  const roll = Math.random();

  if (tension === 'UNEASY') {
    if (roll < 0.4) return { type: 'confirm', message: pickRandom(CONFIRM_MESSAGES_UNEASY) };
    if (roll < 0.7) return { type: 'delay', durationMs: 800 + Math.random() * 700 };
    return { type: 'jitter' };
  }

  if (tension === 'IRRITATED') {
    if (roll < 0.3) return { type: 'confirm', message: pickRandom(CONFIRM_MESSAGES_IRRITATED) };
    if (roll < 0.5) return { type: 'delay', durationMs: 1000 + Math.random() * 1000 };
    if (roll < 0.75) return { type: 'jitter' };
    return { type: 'relabel' };
  }

  // UNSTABLE + MELTDOWN — higher intensity
  if (roll < 0.25) return { type: 'confirm', message: pickRandom(CONFIRM_MESSAGES_EXTREME) };
  if (roll < 0.45) return { type: 'delay', durationMs: 1200 + Math.random() * 1500 };
  if (roll < 0.7) return { type: 'relabel' };
  return { type: 'jitter' };
}

export function getRandomFakeLabel(): string {
  return pickRandom(FAKE_LABELS);
}
