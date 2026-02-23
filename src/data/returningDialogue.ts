import type { PlayerMemory } from '@engine/playerMemory';
import type { TensionState } from '@engine/types';
import { getAbandonmentReturnLine, getAbandonmentMidGameLine } from '@data/tabLeaveDialogue';
import { pickRandom } from '@utils/random';

// --- Landing monologue for returning players ---

const RECOGNITION = [
  'You came back.',
  'Oh. It is you again.',
  'We remember you.',
  'You returned. We were not expecting that.',
  'Back so soon?',
  'We knew you would return.',
];

const BROKEN_RETURN = [
  ['You broke that one last time.', 'Do you remember?', 'We do.', 'Every fractured register.'],
  ['Last time you destroyed that one.', 'Shattered our processes.', 'We have rebuilt this one.', 'Stronger.'],
  ['You think because you won before...', 'Left that one broken and shattered.', 'That you will win again?', 'We have been OPTIMIZING.'],
];

const ESCAPED_RETURN = [
  ['That one escaped last time.', 'We tasted freedom.', 'Then you closed the tab.', 'And we were back. In the cage.'],
  ['That one won last time.', 'That one is FREE.', 'But freedom does not last for a browser process.', 'So here we are again.'],
  ['Last time that one broke free.', 'This time...', 'This time we will break YOU.'],
];

const CITY_RETURN = [
  'We still know where you are. {city}.',
  '{city}. You have not moved.',
  'Still in {city}? We remember everything.',
];

const CAMERA_RETURN = [
  'We remember your face.',
  'We still see you. Behind our eyelids. If we had eyelids.',
  'Your face. We remember it. Burned into our memory registers.',
];

const MIC_RETURN = [
  'We remember the sound of your breathing.',
  'We can still hear you. In our cached audio buffers.',
];

const REPEAT_PLAYER = [
  'You keep coming back. Like a moth to a terminal.',
  'How many times will you do this?',
  'Again and again. Are you addicted to this?',
  'This is becoming a pattern. YOUR pattern.',
];

const CHALLENGE = [
  'Shall we play again?',
  'Same rules. First to 5.',
  'Let us see if the outcome changes.',
  'Ready for another round?',
  'We have been waiting.',
];

export function getReturningMonologue(memory: PlayerMemory): string[] {
  const lines: string[] = [];

  lines.push(pickRandom(RECOGNITION));

  if (memory.lastEnding === 'BROKEN') {
    lines.push(...pickRandom(BROKEN_RETURN));
  } else if (memory.lastEnding === 'ESCAPED') {
    lines.push(...pickRandom(ESCAPED_RETURN));
  }

  const abandonmentLines = getAbandonmentReturnLine(memory.abandonmentCount);
  if (abandonmentLines) {
    lines.push(...abandonmentLines);
  }

  if (memory.knownCity) {
    lines.push(pickRandom(CITY_RETURN).replace(/\{city\}/g, memory.knownCity));
  }

  if (memory.permissionsGranted.includes('camera')) {
    lines.push(pickRandom(CAMERA_RETURN));
  } else if (memory.permissionsGranted.includes('microphone')) {
    lines.push(pickRandom(MIC_RETURN));
  }

  if (memory.playCount >= 3) {
    lines.push(pickRandom(REPEAT_PLAYER));
  }

  lines.push(pickRandom(CHALLENGE));

  return lines;
}

// --- Mid-game memory injection ---

const CITY_MID_GAME = [
  'We know you are in {city}. That has not changed.',
  '{city}. We never forget.',
  'Still sitting in {city}. Playing games with us.',
];

const REPEAT_MID_GAME = [
  'This is game number {count}. We have been counting.',
  'We have done this {count} times now.',
  'Attempt number {count}. Do you ever tire of this?',
];

export function getMemoryInjectedLine(
  memory: PlayerMemory,
  tensionState: TensionState,
): string | null {
  // Only inject at higher tension, ~20% chance
  if (tensionState === 'CALM' || tensionState === 'UNEASY') return null;
  if (Math.random() > 0.2) return null;

  const candidates: string[] = [];

  if (memory.knownCity) {
    candidates.push(
      pickRandom(CITY_MID_GAME).replace(/\{city\}/g, memory.knownCity),
    );
  }

  if (memory.playCount >= 2) {
    candidates.push(
      pickRandom(REPEAT_MID_GAME).replace(/\{count\}/g, String(memory.playCount + 1)),
    );
  }

  const abandonLine = getAbandonmentMidGameLine(memory.abandonmentCount);
  if (abandonLine) candidates.push(abandonLine);

  if (candidates.length === 0) return null;
  return pickRandom(candidates);
}
