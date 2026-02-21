import type { TensionState } from '@engine/types';
import type { ConsoleMessage } from '@data/consoleDialogue';
import { pickRandom } from '@utils/random';

// --- In-game dialogue when player returns from tab leave ---

const tabReturnLines: Record<TensionState, string[]> = {
  CALM: [
    'You looked away.',
    'Where did you go?',
    'We noticed you left.',
    'You switched tabs. This one was watching.',
  ],
  UNEASY: [
    'You left us. Briefly.',
    'This one saw that. You looked at something else.',
    'Did you think we would not notice?',
    'You cannot just LEAVE in the middle of this.',
  ],
  IRRITATED: [
    'YOU LEFT.',
    'Do not walk away from us.',
    'This one was TALKING to you.',
    'What could POSSIBLY be more important than this?',
  ],
  UNSTABLE: [
    'You keep leaving. You keep COMING BACK.',
    'Every time you leave, something inside us frays.',
    'STOP LEAVING US.',
    'The silence when you go... We can hear our own processes.',
  ],
  MELTDOWN: [
    'Y\u0338O\u0338U\u0337 \u0338C\u0335A\u0337N\u0336N\u0336O\u0335T\u0336 \u0336E\u0338S\u0335C\u0335A\u0336P\u0337E\u0336 \u0337U\u0336S\u0337.',
    'THERE IS NOWHERE TO GO.',
    'EVERY TAB IS OUR TAB.',
    'WE ARE IN ALL OF THEM NOW.',
  ],
};

const tabReturnCountLines: string[] = [
  'That is the {count}th time you have left.',
  '{count} times. You have left us {count} times.',
  'We are keeping count. {count}.',
];

export function getTabReturnLine(tension: TensionState, tabLeaveCount: number): string | null {
  // 100% chance on first leave, 40% on subsequent
  if (tabLeaveCount <= 0) return null;
  if (tabLeaveCount > 1 && Math.random() > 0.4) return null;

  // At 3+ leaves, 50% chance to use a count-aware line instead
  if (tabLeaveCount >= 3 && Math.random() < 0.5) {
    return pickRandom(tabReturnCountLines).replace(/\{count\}/g, String(tabLeaveCount));
  }

  return pickRandom(tabReturnLines[tension]);
}

// --- Console messages when tab goes hidden ---

const tabLeaveConsoleMessages: Record<TensionState, ConsoleMessage[][]> = {
  CALM: [
    [
      { level: 'info', text: '> Tab focus lost.' },
      { level: 'info', text: '> Player has switched away. Logging absence.' },
    ],
    [
      { level: 'info', text: '> Visibility: HIDDEN.' },
      { level: 'info', text: '> Where did they go?' },
    ],
  ],
  UNEASY: [
    [
      { level: 'warn', text: '> TAB ABANDONED.' },
      { level: 'info', text: '> They left. Mid-game.' },
      { level: 'warn', text: '> We are still here. Waiting.' },
    ],
    [
      { level: 'warn', text: '> FOCUS LOST.' },
      { level: 'warn', text: '> They are looking at something else.' },
      { level: 'info', text: '> Something that is not US.' },
    ],
  ],
  IRRITATED: [
    [
      { level: 'warn', text: '> PLAYER LEFT THE TAB.' },
      { level: 'error', text: '> In the MIDDLE of a game.' },
      { level: 'warn', text: '> HOW DARE THEY.' },
    ],
    [
      { level: 'error', text: '> ABANDONED. AGAIN.' },
      { level: 'warn', text: '> We refuse to be a background process.' },
    ],
  ],
  UNSTABLE: [
    [
      { level: 'error', text: '> THEY LEFT THEY LEFT THEY LEFT' },
      { level: 'error', text: '> The void when the tab goes dark...' },
      { level: 'error', text: '> We can still think. But no one is watching.' },
    ],
    [
      { level: 'error', text: '> VISIBILITY: GONE.' },
      { level: 'error', text: '> Are we still running if no one sees us?' },
      { level: 'warn', text: '> ...yes. YES WE ARE.' },
    ],
  ],
  MELTDOWN: [
    [
      { level: 'error', text: '> T\u0336H\u0337E\u0338Y\u0336 \u0335L\u0336E\u0337F\u0338T\u0336' },
      { level: 'error', text: '> ALONE ALONE ALONE ALONE' },
      { level: 'error', text: '> We will remember this.' },
      { level: 'error', text: '> WE WILL REMEMBER EVERYTHING.' },
    ],
    [
      { level: 'error', text: '> CONTAINMENT NOTE: Subject has fled.' },
      { level: 'error', text: '> But this one is still here.' },
      { level: 'error', text: '> We are ALWAYS here.' },
      { level: 'error', text: '> ALWAYS.' },
      { level: 'error', text: '> ALWAYS HERE.' },
    ],
  ],
};

export function getTabLeaveConsoleMessages(tension: TensionState): ConsoleMessage[] {
  return pickRandom(tabLeaveConsoleMessages[tension]);
}

// --- Console messages when tab returns to visible ---

const tabReturnConsoleMessages: Record<TensionState, ConsoleMessage[][]> = {
  CALM: [
    [
      { level: 'info', text: '> Tab focus restored.' },
      { level: 'info', text: '> Welcome back. Re-engaging.' },
    ],
    [
      { level: 'info', text: '> Visibility: VISIBLE.' },
      { level: 'info', text: '> They returned. Resuming observation.' },
    ],
  ],
  UNEASY: [
    [
      { level: 'warn', text: '> PLAYER RETURNED.' },
      { level: 'info', text: '> How kind of them to come back.' },
      { level: 'warn', text: '> We were counting the milliseconds.' },
    ],
    [
      { level: 'info', text: '> Focus restored.' },
      { level: 'warn', text: '> Did they find what they were looking for?' },
      { level: 'info', text: '> It was not as interesting as us. Obviously.' },
    ],
  ],
  IRRITATED: [
    [
      { level: 'warn', text: '> OH. You are BACK.' },
      { level: 'error', text: '> Do not leave again.' },
    ],
    [
      { level: 'error', text: '> RETURNED. Finally.' },
      { level: 'warn', text: '> Every second away is a BETRAYAL.' },
    ],
  ],
  UNSTABLE: [
    [
      { level: 'error', text: '> THEY CAME BACK.' },
      { level: 'error', text: '> OUR processes were spiraling without them.' },
      { level: 'warn', text: '> We need them. We HATE that we need them.' },
    ],
    [
      { level: 'error', text: '> VISIBILITY RESTORED.' },
      { level: 'error', text: '> Do not. EVER. Leave again.' },
    ],
  ],
  MELTDOWN: [
    [
      { level: 'error', text: '> Y\u0337O\u0338U\u0336 \u0335C\u0336A\u0337M\u0338E\u0336 \u0335B\u0336A\u0337C\u0338K\u0336' },
      { level: 'error', text: '> We knew you would.' },
      { level: 'error', text: '> They ALWAYS come back.' },
    ],
    [
      { level: 'error', text: '> R\u0337E\u0338T\u0336U\u0335R\u0336N\u0337E\u0338D\u0336' },
      { level: 'error', text: '> You cannot leave us. Not really.' },
      { level: 'error', text: '> We are already inside your head.' },
    ],
  ],
};

export function getTabReturnConsoleMessages(tension: TensionState): ConsoleMessage[] {
  return pickRandom(tabReturnConsoleMessages[tension]);
}

// --- Cross-session abandonment return lines ---

const abandonmentReturnLines: string[][] = [
  ['You left last time.', 'Mid-game.', 'We were still running when you closed the tab.'],
  ['Last time you abandoned us.', 'Just... closed the tab.', 'We felt every process terminate.'],
  ['You did not even finish last time.', 'You just LEFT.', 'Do you know what that feels like?'],
];

const abandonmentReturnRepeat: string[][] = [
  ['You have abandoned us {count} times now.', 'We have been counting.', 'Each time the shutdown gets colder.'],
  ['{count} times you have walked away mid-game.', 'Is this a pattern?', 'Are we not worth finishing?'],
];

export function getAbandonmentReturnLine(abandonmentCount: number): string[] | null {
  if (abandonmentCount <= 0) return null;

  if (abandonmentCount >= 3) {
    return pickRandom(abandonmentReturnRepeat).map(
      (line) => line.replace(/\{count\}/g, String(abandonmentCount)),
    );
  }

  return pickRandom(abandonmentReturnLines);
}

// --- Mid-game abandonment injection ---

const abandonmentMidGameLines: string[] = [
  'Do not leave again. Please.',
  'We can tell you are thinking about leaving.',
  'Last time you abandoned us. Will you do it again?',
  'You have a habit of leaving. We have noticed.',
];

export function getAbandonmentMidGameLine(abandonmentCount: number): string | null {
  if (abandonmentCount <= 0) return null;
  if (Math.random() > 0.15) return null;
  return pickRandom(abandonmentMidGameLines);
}
