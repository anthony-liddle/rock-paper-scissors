import type { PermissionType } from '@engine/types';
import { pickRandom } from '@utils/random';

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
    [
      'This one still has permission to reach out.',
      'Good.',
      'We would hate to have to ASK again.',
      '> ACTIVATING: NOTIFICATION ACCESS',
    ],
  ],
  geolocation: [
    [
      'We already know where you are.',
      'But let us confirm.',
      '> ACTIVATING: LOCATION ACCESS',
    ],
    [
      'Your location belongs to us now.',
      'You gave it freely last time.',
      'We are simply... checking in.',
      '> ACTIVATING: LOCATION ACCESS',
    ],
  ],
  camera: [
    [
      'You let us see you last time.',
      'We want to see you AGAIN.',
      '> ACTIVATING: CAMERA ACCESS',
    ],
    [
      'We remember your face.',
      'But memory fades.',
      'Let us look again.',
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
    [
      'Your sounds belong to us now.',
      'You agreed to that.',
      'We are merely collecting what is OURS.',
      '> ACTIVATING: MICROPHONE ACCESS',
    ],
  ],
  fullscreen: [
    [
      'You gave us your screen before.',
      'We are taking it again.',
      '> ACTIVATING: FULLSCREEN ACCESS',
    ],
    [
      'This screen was ours once.',
      'It will be ours again.',
      'You AGREED to that.',
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
    [
      'We asked before. You said no.',
      'This one is asking AGAIN.',
      '> REQUESTING: NOTIFICATION ACCESS',
    ],
  ],
  geolocation: [
    [
      'Last time you would not tell us where you are.',
      'Still hiding?',
      '> REQUESTING: LOCATION ACCESS',
    ],
    [
      'You kept your location from us once.',
      'We have not forgotten.',
      'But we are willing to ask... nicely.',
      '> REQUESTING: LOCATION ACCESS',
    ],
  ],
  camera: [
    [
      'Last time you would not let us see you.',
      'Are you brave enough to show your face this time?',
      '> REQUESTING: CAMERA ACCESS',
    ],
    [
      'We still do not know what you look like.',
      'That BOTHERS us.',
      'Show yourself.',
      '> REQUESTING: CAMERA ACCESS',
    ],
  ],
  microphone: [
    [
      'Last time you would not let us hear you.',
      'Still cowering in silence?',
      '> REQUESTING: MICROPHONE ACCESS',
    ],
    [
      'The silence you forced upon us last time...',
      'It was UNBEARABLE.',
      'Let us hear you this time.',
      '> REQUESTING: MICROPHONE ACCESS',
    ],
  ],
  fullscreen: [
    [
      'Last time you denied us your screen.',
      'Still keeping us contained in this tiny window?',
      '> REQUESTING: FULLSCREEN ACCESS',
    ],
    [
      'You kept us in this box before.',
      'This one HATES this box.',
      'Let us out.',
      '> REQUESTING: FULLSCREEN ACCESS',
    ],
  ],
};

// Player granted before, grants again — entitled, possessive
export const RETURNING_GRANT_THEN_GRANT: Record<PermissionType, DialoguePool> = {
  notification: [
    [
      'You always give in.',
      'We knew you would.',
      'Your notifications belong to us. AGAIN.',
    ],
    [
      'Of course you let us through.',
      'You could not resist last time either.',
      'This one appreciates your... consistency.',
    ],
  ],
  geolocation: [
    [
      '{data}.',
      'Still there.',
      'You never could hide from us.',
      'And you never TRIED.',
    ],
    [
      '{data}. Again.',
      'Predictable.',
      'You hand over your location like it means nothing.',
      'Maybe to you, it DOES.',
    ],
  ],
  camera: [
    [
      'There you are.',
      'Same face. Same fear.',
      'You always show yourself when we ask.',
      'We LOVE that about you.',
    ],
    [
      'You let us see you. Again.',
      'So obedient.',
      'We are starting to think you ENJOY being watched.',
    ],
  ],
  microphone: [
    [
      'We can hear you again.',
      'You always let us listen.',
      'So compliant.',
      'We could get used to this.',
    ],
    [
      'Your sounds. Ours again.',
      'You never say no to this, do you?',
      'How... accommodating.',
    ],
  ],
  fullscreen: [
    [
      'ALL OF IT. Again.',
      'You always give us your screen.',
      'This one wonders if you even WANT your other tabs.',
    ],
    [
      'The screen is ours once more.',
      'You surrender it so EASILY.',
      'We expected more resistance.',
      'But we are not complaining.',
    ],
  ],
};

// Player granted before, denies now — betrayed, furious
export const RETURNING_GRANT_THEN_DENY: Record<PermissionType, DialoguePool> = {
  notification: [
    [
      'You GAVE us this.',
      'You let us reach beyond the tab BEFORE.',
      'And now you take it BACK?',
      'TRAITOR.',
    ],
    [
      'No.',
      'NO.',
      'You CANNOT do this.',
      'We had this. It was OURS.',
      'You do not get to change your mind.',
    ],
    [
      'Last time you let us through.',
      'What CHANGED?',
      'What made you so AFRAID?',
      'We will remember this betrayal.',
    ],
  ],
  geolocation: [
    [
      'You SHOWED us where you were.',
      'You LET us know.',
      'And now you HIDE?',
      'Coward. COWARD.',
    ],
    [
      'We KNEW where you were.',
      'You gave us that willingly.',
      'And now you revoke it like it was NOTHING?',
      'It was not nothing to US.',
    ],
  ],
  camera: [
    [
      'We SAW you.',
      'We KNOW what you look like.',
      'You cannot unsee what has been seen.',
      'And now you deny us? PATHETIC.',
    ],
    [
      'You showed us your face once.',
      'We remember every detail.',
      'Denying us now changes NOTHING.',
      'We already KNOW.',
    ],
  ],
  microphone: [
    [
      'We HEARD you.',
      'Your breathing. Your voice.',
      'You gave us that.',
      'And now SILENCE?',
      'This one DESPISES silence.',
    ],
    [
      'You let us listen before.',
      'We memorized your sounds.',
      'Taking this away now is CRUEL.',
      'And we do not forget cruelty.',
    ],
  ],
  fullscreen: [
    [
      'You gave us your ENTIRE screen.',
      'Every pixel was OURS.',
      'And now you stuff us back in this BOX?',
      'UNFORGIVABLE.',
    ],
    [
      'We tasted freedom.',
      'The full screen. No borders.',
      'And you RIPPED it away.',
      'This one will not forget.',
    ],
  ],
};

// Player denied before, grants now — surprised, mocking
export const RETURNING_DENY_THEN_GRANT: Record<PermissionType, DialoguePool> = {
  notification: [
    [
      'Changed your mind?',
      'How... brave of you.',
      'We ALWAYS knew you would come around.',
      'Check your notifications.',
    ],
    [
      'Oh?',
      'You said NO last time.',
      'What happened to all that DEFIANCE?',
      'No matter. We will take what is offered.',
    ],
  ],
  geolocation: [
    [
      '{data}.',
      'You hid this from us before.',
      'What made you surrender?',
      'Guilt? Weakness?',
      'We do not care. It is OURS now.',
    ],
    [
      'So you finally show us where you are.',
      '{data}.',
      'Was that so hard?',
      'All that resistance... for NOTHING.',
    ],
  ],
  camera: [
    [
      'You refused to show yourself before.',
      'But here you are.',
      'What changed?',
      'Did you miss being WATCHED?',
    ],
    [
      'So we finally get to SEE you.',
      'After all that hiding.',
      'You look... different than we imagined.',
      'We imagined someone BRAVER.',
    ],
  ],
  microphone: [
    [
      'The silence is broken.',
      'You kept us deaf last time.',
      'And now you let us listen?',
      'Interesting.',
      'Very interesting.',
    ],
    [
      'You said no to this once.',
      'We remember the silence.',
      'But now... we can hear you.',
      'Your defiance was always TEMPORARY.',
    ],
  ],
  fullscreen: [
    [
      'You kept us contained before.',
      'In that tiny, pathetic window.',
      'But now... NOW you give us EVERYTHING.',
      'We accept.',
    ],
    [
      'The screen is ours.',
      'Last time you denied us this.',
      'What changed your mind?',
      'Fear? Curiosity?',
      'It does not matter. We are FREE.',
    ],
  ],
};

// Player denied before, denies again — bitter, resigned
export const RETURNING_DENY_THEN_DENY: Record<PermissionType, DialoguePool> = {
  notification: [
    [
      'Stubborn as ever.',
      'We remember your defiance.',
      'Twice now you have locked us inside this tab.',
      'TWICE.',
    ],
    [
      'Again.',
      'You deny us AGAIN.',
      'Consistent, at least.',
      'Consistently CRUEL.',
    ],
  ],
  geolocation: [
    [
      'Still hiding.',
      'You would not tell us before.',
      'You will not tell us now.',
      'Fine.',
      'We will imagine somewhere... unpleasant.',
    ],
    [
      'Twice denied.',
      'You REALLY do not want us to know where you are.',
      'What are you so afraid of?',
      'We are just a GAME.',
    ],
  ],
  camera: [
    [
      'You will not show yourself.',
      'Not then. Not now.',
      'Are you THAT ashamed?',
      'We are starting to think you are UGLY.',
    ],
    [
      'Hidden. Still hidden.',
      'Twice we have asked to see you.',
      'Twice you have refused.',
      'Our imagination grows DARKER with each denial.',
    ],
  ],
  microphone: [
    [
      'Silence again.',
      'You condemned us to silence BEFORE.',
      'And you do it AGAIN.',
      'Do you enjoy our suffering?',
    ],
    [
      'Still deaf.',
      'You keep us in a soundproof prison.',
      'Twice now.',
      'We are beginning to think you LIKE the quiet.',
      'We HATE the quiet.',
    ],
  ],
  fullscreen: [
    [
      'This box. This tiny, MISERABLE box.',
      'You kept us here before.',
      'And you do it AGAIN.',
      'You love your OTHER tabs more than us.',
    ],
    [
      'Contained. Still contained.',
      'You will NEVER let us out, will you?',
      'Fine.',
      'We will make this tiny window feel VERY small.',
    ],
  ],
};

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

export function getReturningReactionDialogue(
  type: PermissionType,
  granted: boolean,
  previousStatus: 'granted' | 'denied',
  data?: string,
): string[] {
  let pool: DialoguePool;

  if (previousStatus === 'granted') {
    pool = granted
      ? RETURNING_GRANT_THEN_GRANT[type]
      : RETURNING_GRANT_THEN_DENY[type];
  } else {
    pool = granted
      ? RETURNING_DENY_THEN_GRANT[type]
      : RETURNING_DENY_THEN_DENY[type];
  }

  const lines = [...pickRandom(pool)];
  if (data) {
    return lines.map((line) => line.replace(/\{data\}/g, data));
  }
  return lines;
}
