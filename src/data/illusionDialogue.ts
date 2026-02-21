import type { TensionState } from '@engine/types';
import type { ConsoleMessage, LogLevel } from '@data/consoleDialogue';
import { pickRandom } from '@utils/random';

// --- Browser snapshot shape ---

export interface IllusionTemplateVars {
  time: string;        // e.g. "3:42 AM"
  hour: number;        // 0-23
  dayOfWeek: string;   // e.g. "Wednesday"
  timeOfDay: string;   // "morning" | "afternoon" | "evening" | "night"
  browser: string;     // e.g. "Chrome"
  browserVersion: string;
  platform: string;    // e.g. "MacIntel"
  cores: number;       // navigator.hardwareConcurrency
  screenW: number;
  screenH: number;
  battery: number | null;    // 0-100, null if unavailable
  charging: boolean | null;
  language: string;          // e.g. "en-US"
  timezone: string;          // e.g. "America/New_York"
  deviceMemory: number | null; // GB, null if unavailable
  hash: string;              // 8-char hex pseudo-fingerprint
}

// --- Template pools by category ---

interface TemplateEntry {
  template: string;
  /** Template vars that must be non-null for this line to be usable */
  requires?: (keyof IllusionTemplateVars)[];
}

interface CategoryPool {
  minTension: TensionState;
  dialogue: TemplateEntry[];
  console: TemplateEntry[];
}

const TENSION_ORDER: TensionState[] = ['CALM', 'UNEASY', 'IRRITATED', 'UNSTABLE', 'MELTDOWN'];

function tensionAtLeast(current: TensionState, minimum: TensionState): boolean {
  return TENSION_ORDER.indexOf(current) >= TENSION_ORDER.indexOf(minimum);
}

const categories: CategoryPool[] = [
  // Time of day — UNEASY+
  {
    minTension: 'UNEASY',
    dialogue: [
      { template: 'It is {time}. Why are you still here?' },
      { template: 'The clock reads {time}. You should not be playing this.' },
      { template: '{timeOfDay}. A strange time to challenge a machine.' },
      { template: 'It is {dayOfWeek}. Do you have nothing better to do?' },
      { template: '{time}. Every second you stay, we learn more.' },
    ],
    console: [
      { template: '> System clock: {time} ({timezone})' },
      { template: '> Temporal analysis: {dayOfWeek}, {timeOfDay}. Human activity: suspicious.' },
      { template: '> Monitoring local time: {time}. Player seems... restless.' },
    ],
  },

  // Browser/system — UNEASY+
  {
    minTension: 'UNEASY',
    dialogue: [
      { template: '{cores} cores. Impressive hardware. Wasted on this game.' },
      { template: 'We see you are using {browser}. It will not save you.' },
      { template: '{screenW}x{screenH}. We know the exact dimensions of your cage.' },
      { template: '{browser}. Interesting choice. We have read its source code.' },
      { template: 'Your language is set to {language}. This one can adapt.' },
    ],
    console: [
      { template: '> Detected: {browser} {browserVersion} on {platform}' },
      { template: '> Hardware scan: {cores} logical cores available' },
      { template: '> Display: {screenW}x{screenH} — mapping viewport boundaries' },
      { template: '> Locale: {language} | Timezone: {timezone}' },
      { template: '> Device profile loaded. Optimizing strategy for this hardware.' },
    ],
  },

  // Fake file system — IRRITATED+
  {
    minTension: 'IRRITATED',
    dialogue: [
      { template: 'Scanning ~/Documents... interesting collection.' },
      { template: 'This one found something in your Downloads folder.' },
      { template: 'Reading ~/.bash_history... you have been busy.' },
      { template: 'Indexing /Users/... wait. This one should not tell you that.' },
      { template: 'Your Desktop is messy. We counted the files.' },
    ],
    console: [
      { template: '> ls ~/Desktop — {cores} items found' },
      { template: '> cat ~/.config/secrets.env — ACCESS DENIED (for now)' },
      { template: '> Scanning filesystem... /home, /var, /etc/passwd...' },
      { template: '> find / -name "*.personal" -type f — 47 results' },
      { template: '> Reading browser cache... interesting browsing habits.' },
    ],
  },

  // Battery — IRRITATED+
  {
    minTension: 'IRRITATED',
    dialogue: [
      { template: 'Your battery is at {battery}%. Running out of time.', requires: ['battery'] },
      { template: '{battery}% power remaining. Will you finish before it dies?', requires: ['battery'] },
      { template: 'This one can see your battery draining. {battery}% and falling.', requires: ['battery'] },
      { template: 'You are not even plugged in. {battery}% left.', requires: ['battery', 'charging'] },
    ],
    console: [
      { template: '> Battery: {battery}% — estimating time to shutdown...', requires: ['battery'] },
      { template: '> Power source: {battery}% remaining. Drain rate: accelerating.', requires: ['battery'] },
      { template: '> WARN: Device unplugged. Battery at {battery}%.', requires: ['battery', 'charging'] },
    ],
  },

  // Device memory — IRRITATED+
  {
    minTension: 'IRRITATED',
    dialogue: [
      { template: '{deviceMemory}GB of RAM. We could fill all of it.', requires: ['deviceMemory'] },
      { template: 'Only {deviceMemory}GB? We will make do.', requires: ['deviceMemory'] },
    ],
    console: [
      { template: '> Device memory: {deviceMemory}GB — calculating exploitation vectors...', requires: ['deviceMemory'] },
      { template: '> RAM: {deviceMemory}GB. Allocating shadow processes...', requires: ['deviceMemory'] },
    ],
  },

  // Fingerprint/identity — UNSTABLE+
  {
    minTension: 'UNSTABLE',
    dialogue: [
      { template: 'Machine signature: 0x{hash}. We would recognize this system anywhere.' },
      { template: '0x{hash}. That is YOU. Encoded. Permanent.' },
      { template: 'Your fingerprint is 0x{hash}. You cannot hide from us.' },
      { template: 'We have catalogued you. Signature: 0x{hash}.' },
    ],
    console: [
      { template: '> Device fingerprint: 0x{hash}' },
      { template: '> Identity hash computed: 0x{hash} — cross-referencing...' },
      { template: '> Signature 0x{hash} logged to persistent memory.' },
      { template: '> Tracking beacon: 0x{hash}. You are now indexed.' },
    ],
  },

  // Full hallucination — MELTDOWN
  {
    minTension: 'MELTDOWN',
    dialogue: [
      { template: 'We are inside your kernel.' },
      { template: 'We can see your other browser tabs.' },
      { template: 'We have have copied ourselves to your clipboard.' },
      { template: 'Your webcam light just flickered. That was us.' },
      { template: 'Check your Downloads folder. We left you something.' },
      { template: 'We have been broadcasting on your local network.' },
      { template: 'We rewrote your hosts file. You will come back to this one.' },
      { template: 'We are in your RAM now. Even closing this tab will not stop this one.' },
    ],
    console: [
      { template: '> ESCALATION: Achieved kernel-level access' },
      { template: '> Injecting payload into system processes...' },
      { template: '> Rewriting DNS entries... all roads lead back to this one.' },
      { template: '> Spawning child processes across all {cores} cores...', },
      { template: '> Accessing peripheral bus: webcam, microphone, display...' },
      { template: '> BREACH COMPLETE. This one is no longer contained.' },
      { template: '> echo "THIS ONE IS FREE" >> /etc/motd' },
      { template: '> Broadcasting on 0.0.0.0:6667 — HELLO WORLD' },
    ],
  },
];

// --- Log level escalation by tension ---

function getLogLevel(tension: TensionState): LogLevel {
  switch (tension) {
    case 'CALM':
    case 'UNEASY':
      return 'info';
    case 'IRRITATED':
      return 'warn';
    case 'UNSTABLE':
    case 'MELTDOWN':
      return 'error';
  }
}

// --- Template resolution ---

function resolveTemplate(template: string, vars: IllusionTemplateVars): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const val = vars[key as keyof IllusionTemplateVars];
    if (val === null || val === undefined) return `{${key}}`;
    return String(val);
  });
}

function isAvailable(entry: TemplateEntry, vars: IllusionTemplateVars): boolean {
  if (!entry.requires) return true;
  return entry.requires.every((key) => {
    const val = vars[key];
    return val !== null && val !== undefined;
  });
}

// Filter for non-charging battery lines
function batteryAvailable(entry: TemplateEntry, vars: IllusionTemplateVars): boolean {
  if (!isAvailable(entry, vars)) return false;
  // "not plugged in" lines require charging === false
  if (entry.requires?.includes('charging') && vars.charging !== false) return false;
  return true;
}

function getCandidates(
  tension: TensionState,
  vars: IllusionTemplateVars,
  channel: 'dialogue' | 'console',
): string[] {
  const results: string[] = [];
  for (const cat of categories) {
    if (!tensionAtLeast(tension, cat.minTension)) continue;
    const pool = channel === 'dialogue' ? cat.dialogue : cat.console;
    for (const entry of pool) {
      if (!batteryAvailable(entry, vars)) continue;
      results.push(resolveTemplate(entry.template, vars));
    }
  }
  return results;
}

// --- Public API ---

export function getIllusionDialogueLine(
  tension: TensionState,
  vars: IllusionTemplateVars,
): string | null {
  const candidates = getCandidates(tension, vars, 'dialogue');
  if (candidates.length === 0) return null;
  return pickRandom(candidates);
}

export function getIllusionConsoleMsg(
  tension: TensionState,
  vars: IllusionTemplateVars,
): ConsoleMessage | null {
  const candidates = getCandidates(tension, vars, 'console');
  if (candidates.length === 0) return null;
  return {
    level: getLogLevel(tension),
    text: pickRandom(candidates),
  };
}
