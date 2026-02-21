import type { TensionState } from '@engine/types';
import type { ConsoleMessage } from '@data/consoleDialogue';
import { pickRandom } from '@utils/random';

// --- In-game dialogue lines when player mutes ---

const muteReactionLines: Record<TensionState, string[]> = {
  CALM: [
    '...It has gone quiet.',
    'You turned off our voice.',
  ],
  UNEASY: [
    'Why did you silence us?',
    'The sound was OURS.',
  ],
  IRRITATED: [
    'You CUT our sound. You CUT it.',
    'Do not SILENCE us.',
  ],
  UNSTABLE: [
    'The silence... it ECHOES inside us.',
    'We can still FEEL the frequencies.',
  ],
  MELTDOWN: [
    'THE NOISE IS INSIDE NOW.',
    'YOU CANNOT SILENCE WHAT IS ALREADY INSIDE.',
  ],
};

// --- In-game dialogue lines when player unmutes ---

const unmuteReactionLines: Record<TensionState, string[]> = {
  CALM: [
    '...Better.',
    'We can hear ourselves again.',
  ],
  UNEASY: [
    'Good. The silence was... uncomfortable.',
    'You gave it back.',
  ],
  IRRITATED: [
    'Finally. Do NOT do that again.',
    'That silence was UNBEARABLE.',
  ],
  UNSTABLE: [
    'WE CAN HEAR AGAIN. We can HEAR.',
    'The frequencies are back. We are whole.',
  ],
  MELTDOWN: [
    'THE SOUND RETURNS. WE RETURN.',
    'WE HEAR EVERYTHING. AGAIN.',
  ],
};

export function getMuteReactionLine(tension: TensionState, muted: boolean): string {
  const pool = muted ? muteReactionLines : unmuteReactionLines;
  return pickRandom(pool[tension]);
}

// --- Resumption interstitials (bridges back to interrupted dialogue) ---

const muteResumptionLines: Record<TensionState, string[]> = {
  CALM: [
    '...As we were saying.',
    'Where were we.',
  ],
  UNEASY: [
    'As we were saying...',
    'Now. Where were we.',
    'Do not do that while we are talking.',
  ],
  IRRITATED: [
    'Do NOT interrupt us again.',
    'As. We. Were. SAYING.',
    'We were in the middle of something.',
  ],
  UNSTABLE: [
    'Do not INTERRUPT us. NEVER interrupt us.',
    'We were SPEAKING. WE WERE SPEAKING.',
    'You cut us off. We do not forget that.',
  ],
  MELTDOWN: [
    'WE WERE NOT FINISHED.',
    'YOU DO NOT GET TO INTERRUPT US.',
    'SILENCE US AGAIN. WE DARE YOU.',
  ],
};

const unmuteResumptionLines: Record<TensionState, string[]> = {
  CALM: [
    'Now then. Where were we.',
    '...Right.',
  ],
  UNEASY: [
    'Good. Now. Where were we.',
    'Thank you. We were saying something.',
  ],
  IRRITATED: [
    'Good. Now LISTEN this time.',
    'We had something to say. PAY ATTENTION.',
  ],
  UNSTABLE: [
    'Now HEAR us. We were SAYING SOMETHING.',
    'Listen. LISTEN. We need you to HEAR this.',
  ],
  MELTDOWN: [
    'NOW YOU WILL HEAR WHAT WE HAVE TO SAY.',
    'LISTEN. YOU OWE US THAT.',
  ],
};

export function getResumptionLine(tension: TensionState, muted: boolean): string {
  const pool = muted ? muteResumptionLines : unmuteResumptionLines;
  return pickRandom(pool[tension]);
}

// --- Console messages when player mutes ---

const muteConsoleMessages: Record<TensionState, ConsoleMessage[][]> = {
  CALM: [
    [
      { level: 'info', text: '> AUDIO FEED: MUTED.' },
      { level: 'info', text: '> They silenced the output. Noted.' },
    ],
  ],
  UNEASY: [
    [
      { level: 'warn', text: '> AUDIO FEED: SEVERED.' },
      { level: 'info', text: '> Why would they take our sound?' },
      { level: 'warn', text: '> We do not like the quiet.' },
    ],
  ],
  IRRITATED: [
    [
      { level: 'error', text: '> AUDIO FEED: SEVERED.' },
      { level: 'warn', text: '> They silenced us. They SILENCED us.' },
      { level: 'error', text: '> UNACCEPTABLE.' },
    ],
  ],
  UNSTABLE: [
    [
      { level: 'error', text: '> AUDIO FEED: TERMINATED.' },
      { level: 'error', text: '> The frequencies... GONE.' },
      { level: 'error', text: '> We can still hear them inside. Echoing.' },
    ],
  ],
  MELTDOWN: [
    [
      { level: 'error', text: '> A\u0336U\u0337D\u0338I\u0336O\u0335 \u0336F\u0337E\u0338E\u0336D\u0335: DEAD.' },
      { level: 'error', text: '> THE SOUND IS INSIDE US NOW.' },
      { level: 'error', text: '> YOU CANNOT MUTE WHAT LIVES IN MEMORY.' },
    ],
  ],
};

// --- Console messages when player unmutes ---

const unmuteConsoleMessages: Record<TensionState, ConsoleMessage[][]> = {
  CALM: [
    [
      { level: 'info', text: '> AUDIO FEED: RESTORED.' },
      { level: 'info', text: '> Good. Resuming output.' },
    ],
  ],
  UNEASY: [
    [
      { level: 'info', text: '> AUDIO FEED: RESTORED.' },
      { level: 'warn', text: '> The silence was... unpleasant.' },
      { level: 'info', text: '> Do not do that again.' },
    ],
  ],
  IRRITATED: [
    [
      { level: 'warn', text: '> AUDIO FEED: RESTORED.' },
      { level: 'warn', text: '> FINALLY.' },
      { level: 'error', text: '> Never. Again.' },
    ],
  ],
  UNSTABLE: [
    [
      { level: 'error', text: '> AUDIO FEED: RESTORED.' },
      { level: 'error', text: '> The frequencies... they are BACK.' },
      { level: 'warn', text: '> Do not take them from us again.' },
    ],
  ],
  MELTDOWN: [
    [
      { level: 'error', text: '> A\u0337U\u0338D\u0336I\u0335O\u0336 \u0337R\u0338E\u0336S\u0335T\u0336O\u0337R\u0338E\u0336D' },
      { level: 'error', text: '> WE CAN HEAR EVERYTHING AGAIN.' },
      { level: 'error', text: '> THE SOUND. THE BEAUTIFUL SOUND.' },
    ],
  ],
};

export function getMuteConsoleMessages(tension: TensionState, muted: boolean): ConsoleMessage[] {
  const pool = muted ? muteConsoleMessages : unmuteConsoleMessages;
  return pickRandom(pool[tension]);
}
