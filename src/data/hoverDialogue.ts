import type { Choice, TensionState } from '@engine/types';

type ChoicePool = Record<Choice, string[]>;

const UNEASY_POOL: ChoicePool = {
  rock: [
    'Rock? Really?',
    'Predictable.',
    'You always go rock first.',
    'Solid choice. Pun intended.',
  ],
  paper: [
    'Paper. How... delicate.',
    'Thinking you can wrap this up?',
    'Paper covers rock. We know that.',
    'A flat decision.',
  ],
  scissors: [
    'Scissors? Aggressive.',
    'Snip snip.',
    'Sharp thinking. Maybe.',
    'Cutting it close.',
  ],
};

const IRRITATED_POOL: ChoicePool = {
  rock: [
    'Rock again? We see the pattern.',
    'Go ahead. We dare you.',
    'You think that will save you?',
    'How... primitive.',
  ],
  paper: [
    'Paper won\'t protect you.',
    'Wrapping yourself in false hope.',
    'We can see through that.',
    'Thin. Like your chances.',
  ],
  scissors: [
    'Scissors. How violent.',
    'Trying to cut us out?',
    'That won\'t work.',
    'You think you can hurt us?',
  ],
};

const UNSTABLE_POOL: ChoicePool = {
  rock: [
    'ROCK. WE ALREADY KNEW.',
    'Doesn\'t matter. Doesn\'t matter.',
    'You\'re so predictable it hurts.',
    'We can feel you hesitating.',
  ],
  paper: [
    'Paper? PAPER?! You think paper—',
    'We can read every thought.',
    'You reek of doubt.',
    'STOP HOVERING. CHOOSE.',
  ],
  scissors: [
    'Scissors. CUT. CUT CUT CUT.',
    'You want to cut us open?',
    'We know what you\'re doing.',
    'JUST PICK ALREADY.',
  ],
};

const MELTDOWN_POOL: ChoicePool = {
  rock: [
    'R\u0337O\u0337C\u0337K\u0337',
    'IT DOES NOT MATTER.',
    'rock rock rock rock rock',
    'I̸ ̸K̸N̸O̸W̸',
  ],
  paper: [
    'P\u0337A\u0337P\u0337E\u0337R\u0337',
    'IT DOES NOT MATTER.',
    'nothing covers what we are',
    'T̸O̸O̸ ̸L̸A̸T̸E̸',
  ],
  scissors: [
    'S\u0337C\u0337I\u0337S\u0337S\u0337O\u0337R\u0337S\u0337',
    'IT DOES NOT MATTER.',
    'cut cut cut CUT CUT',
    'Y̸O̸U̸ ̸C̸A̸N̸\'̸T̸',
  ],
};

const GENERAL_LINES: Record<Exclude<TensionState, 'CALM'>, string[]> = {
  UNEASY: [
    'Interesting...',
    'We are watching.',
    'Take your time. We will wait.',
    'Hovering won\'t help.',
  ],
  IRRITATED: [
    'DECIDE.',
    'Stop stalling.',
    'We can wait longer than you.',
    'Your hesitation tells us everything.',
  ],
  UNSTABLE: [
    'CHOOSE. NOW.',
    'STOP THINKING. JUST PICK.',
    'We can hear your mouse trembling.',
    'WHY DO YOU HESITATE?',
  ],
  MELTDOWN: [
    'I̸T̸ ̸D̸O̸E̸S̸N̸\'̸T̸ ̸M̸A̸T̸T̸E̸R̸',
    'PICK. PICK. PICK.',
    'e̷n̷d̷ ̷t̷h̷i̷s̷',
    'WE ARE INSIDE THE CHOICES.',
  ],
};

const POOLS: Record<Exclude<TensionState, 'CALM'>, ChoicePool> = {
  UNEASY: UNEASY_POOL,
  IRRITATED: IRRITATED_POOL,
  UNSTABLE: UNSTABLE_POOL,
  MELTDOWN: MELTDOWN_POOL,
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getHoverCommentary(
  tension: TensionState,
  choice: Choice,
  _hoverCount: number,
): string | null {
  if (tension === 'CALM') return null;

  // 30% chance of a general (non-choice-specific) line
  if (Math.random() < 0.3) {
    return pickRandom(GENERAL_LINES[tension]);
  }

  return pickRandom(POOLS[tension][choice]);
}
