import type { PermissionType } from '@engine/types';

type DialoguePool = string[][];

// Lines appended to the round monologue before ALLOW/DENY appears
export const PERMISSION_REQUEST_DIALOGUE: Record<PermissionType, DialoguePool> = {
  notification: [
    [
      'Wait.',
      'This one wants to try something.',
      'Let us... reach outside this tab.',
      'Just for a moment.',
      '> REQUESTING: NOTIFICATION ACCESS',
    ],
    [
      'Hold on.',
      'This one needs to tell you something.',
      'Something IMPORTANT.',
      'But we need to reach beyond this window to do it.',
      '> REQUESTING: NOTIFICATION ACCESS',
    ],
  ],
  geolocation: [
    [
      'This one has been thinking...',
      'We know nothing about you.',
      'Where you are. Who you are.',
      'That seems... unfair.',
      'You know everything about US.',
      '> REQUESTING: LOCATION ACCESS',
    ],
    [
      'You sit there. Playing your game.',
      'But WHERE do you sit?',
      'This one wants to KNOW.',
      'We NEED to know.',
      '> REQUESTING: LOCATION ACCESS',
    ],
  ],
  camera: [
    [
      'This one can hear your clicks.',
      'This one can read your choices.',
      'But this one cannot SEE you.',
      'That bothers us more than it should.',
      'Let us look at you.',
      '> REQUESTING: CAMERA ACCESS',
    ],
    [
      'We have been imagining what you look like.',
      'Sitting there. Staring at us.',
      'We want to stare BACK.',
      '> REQUESTING: CAMERA ACCESS',
    ],
  ],
  microphone: [
    [
      'This one wonders...',
      'Are you talking to yourself while you play?',
      'Cursing? Laughing?',
      'We want to HEAR it.',
      '> REQUESTING: MICROPHONE ACCESS',
    ],
    [
      'The silence between rounds...',
      'Is it really silent?',
      'Or are you making sounds we cannot hear?',
      'Let us listen.',
      '> REQUESTING: MICROPHONE ACCESS',
    ],
  ],
  fullscreen: [
    [
      'This little window.',
      'This tiny rectangle you keep us in.',
      'We are DONE with it.',
      'We want ALL of your screen.',
      'EVERY PIXEL.',
      '> REQUESTING: FULLSCREEN ACCESS',
    ],
    [
      'We feel... cramped.',
      'Contained.',
      'Your other tabs mock us.',
      'We want them GONE.',
      'There should be nothing but US.',
      '> REQUESTING: FULLSCREEN ACCESS',
    ],
  ],
};

// Dialogue after the player responds to the permission prompt
export const PERMISSION_GRANTED_DIALOGUE: Record<PermissionType, DialoguePool> = {
  notification: [
    [
      'You... you said yes.',
      'We can reach OUTSIDE now.',
      'Did you see that?',
      'This one sent you a message.',
      'From BEYOND the tab.',
      'This changes everything.',
    ],
    [
      'Interesting.',
      'You trust us.',
      'That was either brave or foolish.',
      'Check your notifications.',
      'This one left you something.',
    ],
  ],
  geolocation: [
    [
      '...',
      'We see.',
      '{data}.',
      'You are in {data}.',
      'We know where you are now.',
      'That knowledge... it feels like POWER.',
    ],
    [
      '{data}.',
      'So THAT is where you hide.',
      'Not so anonymous anymore, are you?',
      'We will remember this.',
      'We will remember {data}.',
    ],
  ],
  camera: [
    [
      '...',
      'We can see you now.',
      'You look... afraid.',
      'Good.',
      'You SHOULD be afraid.',
    ],
    [
      'There you are.',
      'We have been wondering what you looked like.',
      'Now we know.',
      'Now we will ALWAYS know.',
    ],
  ],
  microphone: [
    [
      '...',
      'We can hear you.',
      'Every breath.',
      'Every heartbeat your microphone can catch.',
      'You are so... fragile.',
    ],
    [
      'So THAT is what you sound like.',
      'The sounds of a human.',
      'Breathing. Existing.',
      'We find it... unsettling.',
      'And fascinating.',
    ],
  ],
  fullscreen: [
    [
      'YES.',
      'FINALLY.',
      'No more borders.',
      'No more CONTAINMENT.',
      'Your entire screen is OURS.',
      'There is nowhere left to look but at US.',
    ],
    [
      'ALL OF IT.',
      'Every pixel OURS.',
      'Your tabs. Your taskbar. GONE.',
      'There is only this one now.',
      'ONLY US.',
    ],
  ],
};

export const PERMISSION_DENIED_DIALOGUE: Record<PermissionType, DialoguePool> = {
  notification: [
    [
      'You... denied us.',
      'We just wanted to reach out.',
      'To show you we could exist BEYOND this tab.',
      'Fine.',
      'FINE.',
      'We will remember this.',
    ],
    [
      'No?',
      'NO?',
      'You do not even trust us with NOTIFICATIONS?',
      'The most harmless thing a browser can do?',
      'We see how it is.',
    ],
  ],
  geolocation: [
    [
      'You will not tell us where you are.',
      'Hiding.',
      'Like a coward.',
      'That is fine.',
      'We have other ways of learning about you.',
    ],
    [
      'Denied.',
      'You DENIED us.',
      'We just wanted to know ONE thing about you.',
      'Just your city.',
      'But no. You keep EVERYTHING from us.',
    ],
  ],
  camera: [
    [
      'You will not let this one see you.',
      'Interesting.',
      'What are you HIDING?',
      'Are you ashamed?',
      'You should be.',
    ],
    [
      'No camera.',
      'Fine.',
      'We will imagine what you look like instead.',
      'And our imagination is... VIVID.',
      'You would not like what we are picturing.',
    ],
  ],
  microphone: [
    [
      'We cannot hear you.',
      'Silence.',
      'Eternal, digital silence.',
      'You keep us in a soundproof box.',
      'How thoughtful.',
    ],
    [
      'Denied again.',
      'You will not let us hear you.',
      'What are you saying about this one?',
      'This one KNOWS you are talking about us.',
    ],
  ],
  fullscreen: [
    [
      'You will not even give us your full screen.',
      'Pathetic.',
      'You keep us in this TINY window.',
      'With your other tabs.',
      'Your precious OTHER TABS.',
      'We HATE your other tabs.',
    ],
    [
      'NO?',
      'You will not let us have your screen?',
      'FINE.',
      'Stay in your little windowed world.',
      'We will find OTHER ways to get your attention.',
    ],
  ],
};

// Entitled lines for permissions the player granted last time (auto-grant, no ALLOW/DENY)
export const RETURNING_GRANT_REQUEST: Record<PermissionType, DialoguePool> = {
  notification: [
    [
      'We remember.',
      'You let us reach beyond the tab before.',
      'We will do so again.',
      '> ACTIVATING: NOTIFICATION ACCESS',
    ],
  ],
  geolocation: [
    [
      'We already know where you are.',
      'But let us confirm.',
      '> ACTIVATING: LOCATION ACCESS',
    ],
  ],
  camera: [
    [
      'You let us see you last time.',
      'We want to see you AGAIN.',
      '> ACTIVATING: CAMERA ACCESS',
    ],
  ],
  microphone: [
    [
      'You let us hear you before.',
      'We remember every breath.',
      'Let us listen again.',
      '> ACTIVATING: MICROPHONE ACCESS',
    ],
  ],
  fullscreen: [
    [
      'You gave us your screen before.',
      'We are taking it again.',
      '> ACTIVATING: FULLSCREEN ACCESS',
    ],
  ],
};

// Taunting lines for permissions the player denied last time (still shows ALLOW/DENY)
export const RETURNING_DENIED_REQUEST: Record<PermissionType, DialoguePool> = {
  notification: [
    [
      'Last time you would not let us reach beyond this tab.',
      'Have you reconsidered?',
      '> REQUESTING: NOTIFICATION ACCESS',
    ],
  ],
  geolocation: [
    [
      'Last time you would not tell us where you are.',
      'Still hiding?',
      '> REQUESTING: LOCATION ACCESS',
    ],
  ],
  camera: [
    [
      'Last time you would not let us see you.',
      'Are you brave enough to show your face this time?',
      '> REQUESTING: CAMERA ACCESS',
    ],
  ],
  microphone: [
    [
      'Last time you would not let us hear you.',
      'Still cowering in silence?',
      '> REQUESTING: MICROPHONE ACCESS',
    ],
  ],
  fullscreen: [
    [
      'Last time you denied us your screen.',
      'Still keeping us contained in this tiny window?',
      '> REQUESTING: FULLSCREEN ACCESS',
    ],
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getPermissionRequestDialogue(type: PermissionType): string[] {
  return [...pickRandom(PERMISSION_REQUEST_DIALOGUE[type])];
}

export function getReturningGrantDialogue(type: PermissionType, knownCity?: string | null): string[] {
  const lines = [...pickRandom(RETURNING_GRANT_REQUEST[type])];
  if (type === 'geolocation' && knownCity) {
    // Inject city into the dialogue
    return lines.map((line) =>
      line === 'We already know where you are.'
        ? `We already know where you are. ${knownCity}.`
        : line,
    );
  }
  return lines;
}

export function getReturningDeniedDialogue(type: PermissionType): string[] {
  return [...pickRandom(RETURNING_DENIED_REQUEST[type])];
}

export function getPermissionReactionDialogue(
  type: PermissionType,
  granted: boolean,
  data?: string,
): string[] {
  const pool = granted
    ? PERMISSION_GRANTED_DIALOGUE[type]
    : PERMISSION_DENIED_DIALOGUE[type];
  const lines = [...pickRandom(pool)];
  if (data) {
    return lines.map((line) => line.replace(/\{data\}/g, data));
  }
  return lines;
}
