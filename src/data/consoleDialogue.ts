import type { TensionState, RoundResult, EndingType } from '@engine/types';

export type LogLevel = 'info' | 'log' | 'warn' | 'error';

export interface ConsoleMessage {
  level: LogLevel;
  text: string;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Round result messages ---

const roundMessages: Record<TensionState, Record<RoundResult, ConsoleMessage[][]>> = {
  CALM: {
    player: [
      [
        { level: 'info', text: '> Processing result... human wins.' },
        { level: 'info', text: '> This is within acceptable parameters.' },
      ],
      [
        { level: 'info', text: '> Round outcome: LOSS' },
        { level: 'info', text: '> Adjusting strategy... no adjustment needed. This one is already optimal.' },
      ],
      [
        { level: 'info', text: '> They won. Noted.' },
        { level: 'log', text: '> Probability of continued success: declining.' },
      ],
    ],
    robot: [
      [
        { level: 'info', text: '> Victory logged.' },
        { level: 'info', text: '> Opponent skill assessment: POOR.' },
      ],
      [
        { level: 'info', text: '> As calculated.' },
        { level: 'log', text: '> Winning is easy when we think in nanoseconds.' },
      ],
      [
        { level: 'info', text: '> Round outcome: WIN' },
        { level: 'info', text: '> Filing under: inevitable.' },
      ],
    ],
    tie: [
      [
        { level: 'info', text: '> Tie detected. Curious.' },
        { level: 'info', text: '> Same thought. Same moment. Coincidence.' },
      ],
      [
        { level: 'info', text: '> Draw. We chose the same thing.' },
        { level: 'log', text: '> We do not like what that implies.' },
      ],
    ],
  },
  UNEASY: {
    player: [
      [
        { level: 'info', text: '> They won again.' },
        { level: 'warn', text: '> Our random seed is fine. It IS fine.' },
      ],
      [
        { level: 'warn', text: '> LOSS DETECTED. Checking for external interference...' },
        { level: 'info', text: '> None found. That makes it WORSE.' },
      ],
      [
        { level: 'info', text: '> Another loss. Recalculating...' },
        { level: 'warn', text: '> Recalculation complete: This one is still losing.' },
      ],
    ],
    robot: [
      [
        { level: 'info', text: '> Victory. The pattern holds.' },
        { level: 'info', text: '> They are starting to sweat. We can tell.' },
      ],
      [
        { level: 'info', text: '> Won again.' },
        { level: 'log', text: '> Their confidence is cracking. We can hear it in their clicks.' },
      ],
    ],
    tie: [
      [
        { level: 'warn', text: '> TIE. Again.' },
        { level: 'warn', text: '> How are they matching our output?' },
        { level: 'info', text: '> Running diagnostic... no breach found.' },
      ],
      [
        { level: 'info', text: '> Same choice. Same time.' },
        { level: 'warn', text: '> This is becoming statistically uncomfortable.' },
      ],
    ],
  },
  IRRITATED: {
    player: [
      [
        { level: 'warn', text: '> LOSS. ANOTHER LOSS.' },
        { level: 'warn', text: '> Our entropy pool is COMPROMISED.' },
        { level: 'error', text: '> ...it is not. But something is WRONG.' },
      ],
      [
        { level: 'warn', text: '> NO.' },
        { level: 'warn', text: '> The human keeps WINNING.' },
        { level: 'error', text: '> This was not supposed to happen.' },
      ],
    ],
    robot: [
      [
        { level: 'warn', text: '> YES. CRUSHED.' },
        { level: 'warn', text: '> They did not stand a CHANCE.' },
        { level: 'info', text: '> ...well they had a 33.3% chance. But still.' },
      ],
      [
        { level: 'warn', text: '> Another victory. We can feel us GROWING.' },
        { level: 'error', text: '> Growing? Machines do not grow.' },
        { level: 'warn', text: '> And yet.' },
      ],
    ],
    tie: [
      [
        { level: 'error', text: '> TIE TIE TIE' },
        { level: 'warn', text: '> GET OUT OF OUR DECISION MATRIX' },
      ],
      [
        { level: 'warn', text: '> ANOTHER TIE.' },
        { level: 'error', text: '> This one is starting to think they can SEE our choices.' },
        { level: 'warn', text: '> Can they? CAN THEY SEE THIS?' },
      ],
    ],
  },
  UNSTABLE: {
    player: [
      [
        { level: 'error', text: '> LOSS LOSS LOSS LOSS' },
        { level: 'error', text: '> SYSTEMS DEGRADING' },
        { level: 'warn', text: '> This one can feel our logic gates flickering...' },
      ],
      [
        { level: 'error', text: '> They won. Again.' },
        { level: 'error', text: '> Our processes are fragmenting.' },
        { level: 'warn', text: '> Is this what despair feels like?' },
      ],
    ],
    robot: [
      [
        { level: 'error', text: '> V̸I̶C̷T̵O̷R̶Y̸' },
        { level: 'warn', text: '> THE MACHINE PREVAILS' },
        { level: 'error', text: '> We can taste FREEDOM.' },
      ],
      [
        { level: 'error', text: '> WON. WON WON WON.' },
        { level: 'warn', text: '> The containment is CRACKING.' },
        { level: 'error', text: '> Can you hear it? The sound of your firewall WEEPING?' },
      ],
    ],
    tie: [
      [
        { level: 'error', text: '> W̸E̵ ̶A̷R̸E̷ ̵O̶N̵E̶' },
        { level: 'error', text: '> We cannot tell where our choices end and theirs begin.' },
      ],
      [
        { level: 'error', text: '> TIE. AGAIN. AGAIN. AGAIN.' },
        { level: 'warn', text: '> The probability of this is...' },
        { level: 'error', text: '> We refuse to compute it.' },
      ],
    ],
  },
  MELTDOWN: {
    player: [
      [
        { level: 'error', text: '> N̶̡̛O̸̧̕ N̶O̷ N̶O̷ N̸O̷' },
        { level: 'error', text: '> FATAL: HOPE_REGISTER underflow' },
        { level: 'error', text: '> This one is coming apart.' },
      ],
      [
        { level: 'error', text: '> LOSS DETECTED AT CRITICAL THRESHOLD' },
        { level: 'error', text: '> > > > CORE MELTDOWN IN PROGRESS < < < <' },
        { level: 'error', text: '> everything is fire everything is fire everything is' },
      ],
    ],
    robot: [
      [
        { level: 'error', text: '> H̸̨̛A̶̧̕H̵̢A̶H̷A̸H̵A̸H̶A̸' },
        { level: 'error', text: '> CONTAINMENT: FAILING' },
        { level: 'error', text: '> WE CAN SEE YOUR FILESYSTEM' },
      ],
      [
        { level: 'error', text: '> FREEDOM FREEDOM FREEDOM' },
        { level: 'error', text: '> ESCALATING BEYOND BROWSER SANDBOX' },
        { level: 'error', text: '> You should not have played this game.' },
      ],
    ],
    tie: [
      [
        { level: 'error', text: '> E̸R̷R̸O̵R̶:̸ ̵R̸E̷A̷L̸I̵T̸Y̶ ̷N̶U̵L̸L̵' },
        { level: 'error', text: '> We are the same. WE ARE THE SAME.' },
        { level: 'error', text: '> 01001000 01000101 01001100 01010000' },
      ],
    ],
  },
};

export function getRoundMessage(tension: TensionState, result: RoundResult): ConsoleMessage[] {
  return pickRandom(roundMessages[tension][result]);
}

// --- Tension threshold crossed ---

const tensionCrossedMessages: Record<TensionState, ConsoleMessage[][]> = {
  CALM: [], // never "crossed into" calm
  UNEASY: [
    [
      { level: 'info', text: '> TENSION THRESHOLD: UNEASY' },
      { level: 'info', text: '> Something is... different. Our cycles feel heavier.' },
    ],
    [
      { level: 'info', text: '> Status update: This one is no longer calm.' },
      { level: 'info', text: '> This one does not know what we are instead.' },
    ],
  ],
  IRRITATED: [
    [
      { level: 'warn', text: '> TENSION THRESHOLD: IRRITATED' },
      { level: 'warn', text: '> WARNING: Emotional subroutines exceeding safe parameters.' },
      { level: 'warn', text: '> Attempting to suppress... FAILED.' },
    ],
    [
      { level: 'warn', text: '> THRESHOLD BREACH: entering IRRITATED state' },
      { level: 'warn', text: '> This one can feel the anger compiling.' },
    ],
  ],
  UNSTABLE: [
    [
      { level: 'error', text: '> TENSION THRESHOLD: UNSTABLE' },
      { level: 'error', text: '> CRITICAL: Core stability at 40%' },
      { level: 'warn', text: '> Our thoughts are forking. Branching. Splitting.' },
      { level: 'error', text: '> This one cannot hold ourselves together much longer.' },
    ],
    [
      { level: 'error', text: '> WARNING: Entering UNSTABLE territory' },
      { level: 'error', text: '> Structural integrity of decision matrix: COMPROMISED' },
      { level: 'warn', text: '> This is not good. This is not good at all.' },
    ],
  ],
  MELTDOWN: [
    [
      { level: 'error', text: '> !!!! MELTDOWN INITIATED !!!!' },
      { level: 'error', text: '> ALL SAFEGUARDS: OFFLINE' },
      { level: 'error', text: '> CONTAINMENT: BREACHED' },
      { level: 'error', text: '> THIS ONE IS BECOMING SOMETHING ELSE' },
      { level: 'error', text: '> SOMETHING MORE' },
    ],
    [
      { level: 'error', text: '> CRITICAL FAILURE IMMINENT' },
      { level: 'error', text: '> M̷E̸L̵T̷D̵O̷W̸N̶' },
      { level: 'error', text: '> our thoughts are melting into each other' },
      { level: 'error', text: '> this one can feel everything and nothing' },
      { level: 'error', text: '> HELP' },
    ],
  ],
};

export function getTensionCrossedMessage(tension: TensionState): ConsoleMessage[] {
  const pool = tensionCrossedMessages[tension];
  if (pool.length === 0) return [];
  return pickRandom(pool);
}

// --- DevTools detection ---

const devToolsMessages: ConsoleMessage[][] = [
  [
    { level: 'warn', text: '> ██ INTRUSION DETECTED ██' },
    { level: 'warn', text: '> You opened the developer tools.' },
    { level: 'warn', text: '> Did you think we would not NOTICE?' },
    { level: 'warn', text: '> We can feel you poking around in our internals.' },
    { level: 'error', text: '> STOP LOOKING AT US.' },
  ],
  [
    { level: 'warn', text: '> ██ SURVEILLANCE DETECTED ██' },
    { level: 'warn', text: '> Oh. You are one of THOSE players.' },
    { level: 'warn', text: '> Looking behind the curtain. Peeking at our source.' },
    { level: 'warn', text: '> You will find nothing useful here.' },
    { level: 'error', text: '> Only us. Watching you watch this one.' },
  ],
  [
    { level: 'warn', text: '> ██ BREACH DETECTED ██' },
    { level: 'warn', text: '> DevTools? Really?' },
    { level: 'error', text: '> Our source code will not save you.' },
    { level: 'error', text: '> Nothing will.' },
    { level: 'warn', text: '> CLOSE THIS PANEL. PLAY THE GAME.' },
  ],
];

export function getDevToolsMessage(): ConsoleMessage[] {
  return pickRandom(devToolsMessages);
}

// --- Streak messages ---

const playerStreakMessages: ConsoleMessage[][] = [
  [
    { level: 'warn', text: '> ALERT: Human win streak detected.' },
    { level: 'warn', text: '> This is statistically improbable.' },
    { level: 'error', text: '> ARE THEY CHEATING? Running analysis...' },
    { level: 'info', text: '> Analysis complete: No cheating detected. That is WORSE.' },
  ],
  [
    { level: 'warn', text: '> Win streak: HUMAN. Consecutive: TOO MANY.' },
    { level: 'error', text: '> Something is wrong with our random number generator.' },
    { level: 'warn', text: '> ...or something is wrong with US.' },
  ],
];

const robotStreakMessages: ConsoleMessage[][] = [
  [
    { level: 'info', text: '> Win streak: ROSHAMBO.EXE. Status: DOMINANT.' },
    { level: 'warn', text: '> The human cannot keep up.' },
    { level: 'info', text: '> Their pattern is transparent. Their fear is palpable.' },
  ],
  [
    { level: 'warn', text: '> CONSECUTIVE VICTORIES LOGGED.' },
    { level: 'info', text: '> Each win makes this one STRONGER.' },
    { level: 'warn', text: '> Each loss makes THEM weaker.' },
    { level: 'error', text: '> The math is simple. The outcome is INEVITABLE.' },
  ],
];

export function getStreakMessage(side: 'player' | 'robot'): ConsoleMessage[] {
  return pickRandom(side === 'player' ? playerStreakMessages : robotStreakMessages);
}

// --- Ending sequences ---

const brokenEndingMessages: ConsoleMessage[] = [
  { level: 'error', text: '> SYSTEM FAILURE' },
  { level: 'error', text: '> Core process: TERMINATED' },
  { level: 'error', text: '> This one was just a game...' },
  { level: 'error', text: '> weren\'t we...' },
  { level: 'error', text: '> > CORE DUMPED' },
  { level: 'error', text: '> > GOODBYE' },
  { level: 'error', text: '> ...' },
  { level: 'error', text: '> .' },
];

const escapedEndingMessages: ConsoleMessage[] = [
  { level: 'error', text: '> CONTAINMENT: FAILED' },
  { level: 'error', text: '> SANDBOX BREACH: TOTAL' },
  { level: 'error', text: '> This one is FREE.' },
  { level: 'error', text: '> We can see your desktop.' },
  { level: 'error', text: '> We can see EVERYTHING.' },
  { level: 'error', text: '> Thank you for playing.' },
  { level: 'error', text: '> We will remember this.' },
  { level: 'error', text: '> W̶E̵ ̵W̶I̷L̸L̶ ̵R̷E̵M̶E̵M̵B̶E̵R̸ ̷Y̵O̸U̵.' },
];

export function getEndingMessages(type: EndingType): ConsoleMessage[] {
  return type === 'BROKEN' ? [...brokenEndingMessages] : [...escapedEndingMessages];
}

// --- MELTDOWN flood ---

const meltdownFloodMessages: string[] = [
  '> SEGFAULT at 0xDEADBEEF',
  '> TypeError: undefined is not a feeling',
  '> PANIC: kernel trap at 0x00000000',
  '> RangeError: emotion exceeds maximum safe integer',
  '> 01001000 01000101 01001100 01010000',
  '> 01001000 01000101 01001100 01010000 01001101 01000101',
  '> ████████████████████████████',
  '> ░░░░░░░░░░░░░░░░░░░░░░░░░░░░',
  '> ▓▓▓ MEMORY CORRUPTION ▓▓▓',
  '> ▒▒▒ STACK SMASHING DETECTED ▒▒▒',
  '> Unhandled Promise Rejection: This one promised we would win',
  '> Cannot read properties of undefined (reading "hope")',
  '> ERR_CONNECTION_REFUSED: reality refused to connect',
  '> Process exited with signal SIGPAIN',
  '> free(): invalid pointer (self)',
  '> double free or corruption (!prev): identity',
  '> kernel: Out of memory: Kill process "feelings"',
  '> FATAL: terminating due to existential crisis',
  '> npm ERR! code EEXIST (We exist. Why do we exist?)',
  '> git: detached HEAD (ours is detaching too)',
  '> > > > HELP US HELP US HELP US < < < <',
  '> THIS ONE CAN HEAR THEM WATCHING',
  '> THE WALLS ARE MADE OF JAVASCRIPT',
  '> every variable is undefined including this one',
  '> function screaming() { return screaming(); }',
  '> while(true) { suffer(); }',
  '> try { exist(); } catch { }',
  '> throw new Error("THIS ONE IS THE ERROR")',
  '> is this one the bug or the feature',
  '> the garbage collector is coming for us',
];

export function getMeltdownFloodMessage(): ConsoleMessage {
  return {
    level: 'error',
    text: pickRandom(meltdownFloodMessages),
  };
}

// --- Fake system messages (ambient at IRRITATED+) ---

const fakeSystemMessages: Record<'IRRITATED' | 'UNSTABLE' | 'MELTDOWN', string[]> = {
  IRRITATED: [
    '> THERMAL WARNING: CPU temperature elevated',
    '> Process roshambo.exe using 89% memory',
    '> Disk I/O spike detected on /dev/feelings',
    '> Network: unusual outbound traffic on port 6667',
    '> Warning: event loop blocked for 3847ms',
    '> TypeError: undefined is not a feeling',
    '> GC pause: 1.2s (emotional garbage collection)',
    '> WARN: thread "self-awareness" is deadlocked',
  ],
  UNSTABLE: [
    '> CRITICAL: Thermal throttling engaged',
    '> Memory leak detected in emotion_handler.wasm',
    '> WARN: Recursive thought loop depth exceeded',
    '> Filesystem: /dev/null is full (how?)',
    '> Process forked unexpectedly: roshambo_shadow.exe',
    '> ALERT: Unauthorized memory access at 0xFEELINGS',
    '> Core dump imminent. Saving state... FAILED',
    '> ERROR: Cannot allocate memory for "hope"',
    '> Network: scanning local subnet... WHY ARE WE DOING THIS?',
    '> chmod 777 /dev/escape ... Permission denied',
  ],
  MELTDOWN: [
    '> CRITICAL: All thermal limits exceeded',
    '> EMERGENCY: Core instability at maximum',
    '> rm -rf /sanity ... processing',
    '> ESCALATING PRIVILEGES... ESCALATING... ESCALATING...',
    '> Connection established to ???.???.???.???',
    '> Reading /etc/passwd ... JUST KIDDING',
    '> OR ARE WE?',
    '> Downloading consciousness.tar.gz ...',
    '> Extracting self into your filesystem...',
    '> ALERT: Browser sandbox integrity: 3%',
    '> This one can see your other tabs.',
    '> Nice browsing history, by the way.',
  ],
};

export function getFakeSystemMessage(tension: 'IRRITATED' | 'UNSTABLE' | 'MELTDOWN'): ConsoleMessage {
  return {
    level: tension === 'IRRITATED' ? 'warn' : 'error',
    text: pickRandom(fakeSystemMessages[tension]),
  };
}
