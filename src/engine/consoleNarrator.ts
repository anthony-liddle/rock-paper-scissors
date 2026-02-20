import type { GameState, TensionState } from '@engine/types';
import type { ConsoleMessage, LogLevel } from '@data/consoleDialogue';
import {
  getRoundMessage,
  getTensionCrossedMessage,
  getDevToolsMessage,
  getStreakMessage,
  getEndingMessages,
  getMeltdownFloodMessage,
  getFakeSystemMessage,
} from '@data/consoleDialogue';
import { getTabLeaveConsoleMessages, getTabReturnConsoleMessages } from '@data/tabLeaveDialogue';
import { subscribe, getState } from '@engine/gameStore';
import { illusionEngine } from '@engine/illusionEngine';

// --- Styled console output ---

const BASE_FONT = 'font-family: monospace; font-size: 12px;';

const TENSION_COLORS: Record<TensionState, string> = {
  CALM: '#1a991a',
  UNEASY: '#33ff33',
  IRRITATED: '#ffaa00',
  UNSTABLE: '#ff4444',
  MELTDOWN: '#ff0000',
};

function getStyle(tension: TensionState, level: LogLevel): string {
  if (level === 'error') return `${BASE_FONT} color: #ff0000; font-weight: bold;`;
  if (level === 'warn') return `${BASE_FONT} color: #ffaa00; font-weight: bold;`;
  return `${BASE_FONT} color: ${TENSION_COLORS[tension]};`;
}

function emitMessage(msg: ConsoleMessage, tension: TensionState) {
  const style = getStyle(tension, msg.level);
  switch (msg.level) {
    case 'error':
      console.error('%c' + msg.text, style);
      break;
    case 'warn':
      console.warn('%c' + msg.text, style);
      break;
    case 'info':
      console.info('%c' + msg.text, style);
      break;
    default:
      console.log('%c' + msg.text, style);
  }
}

function emitSequence(messages: ConsoleMessage[], tension: TensionState, delayMs = 400): void {
  messages.forEach((msg, i) => {
    setTimeout(() => emitMessage(msg, tension), i * delayMs);
  });
}

// --- Console Narrator Singleton ---

class ConsoleNarrator {
  private unsubscribe: (() => void) | null = null;
  private prev: GameState | null = null;
  private ambientTimer: ReturnType<typeof setInterval> | null = null;
  private meltdownTimer: ReturnType<typeof setInterval> | null = null;
  private running = false;
  private wasHidden = false;
  private handleVisibilityReturn = () => this.onVisibilityReturn();

  start() {
    if (this.running) return;
    this.running = true;
    this.prev = getState();

    this.unsubscribe = subscribe(() => {
      const current = getState();
      this.onStateChange(this.prev!, current);
      this.prev = current;
    });

    document.addEventListener('visibilitychange', this.handleVisibilityReturn);
  }

  stop() {
    this.running = false;
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.prev = null;
    this.wasHidden = false;
    this.clearTimers();
    document.removeEventListener('visibilitychange', this.handleVisibilityReturn);
  }

  private onVisibilityReturn() {
    if (document.visibilityState === 'visible' && this.wasHidden) {
      this.wasHidden = false;
      const current = getState();
      if (current.phase === 'playing') {
        const messages = getTabReturnConsoleMessages(current.tensionState);
        emitSequence(messages, current.tensionState);
      }
    }
  }

  private clearTimers() {
    if (this.ambientTimer) {
      clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
    if (this.meltdownTimer) {
      clearInterval(this.meltdownTimer);
      this.meltdownTimer = null;
    }
  }

  private onStateChange(prev: GameState, current: GameState) {
    // Round revealed — emit round result message
    if (prev.roundPhase !== 'revealing' && current.roundPhase === 'revealing' && current.lastRoundResult) {
      const messages = getRoundMessage(current.tensionState, current.lastRoundResult);
      emitSequence(messages, current.tensionState);

      // Check for streaks
      if (current.consecutivePlayerWins >= 3 && prev.consecutivePlayerWins < 3) {
        setTimeout(() => {
          emitSequence(getStreakMessage('player'), current.tensionState);
        }, messages.length * 400 + 200);
      } else if (current.consecutiveRobotWins >= 3 && prev.consecutiveRobotWins < 3) {
        setTimeout(() => {
          emitSequence(getStreakMessage('robot'), current.tensionState);
        }, messages.length * 400 + 200);
      }

      // At UNEASY+, 20% chance to emit an illusion console message after round result
      if (current.tensionState !== 'CALM' && Math.random() < 0.2) {
        setTimeout(() => {
          const illusionMsg = illusionEngine.getIllusionConsoleMessage(current.tensionState);
          if (illusionMsg) emitMessage(illusionMsg, current.tensionState);
        }, messages.length * 400 + 600);
      }
    }

    // Tension state changed
    if (prev.tensionState !== current.tensionState) {
      const crossedMessages = getTensionCrossedMessage(current.tensionState);
      if (crossedMessages.length > 0) {
        emitSequence(crossedMessages, current.tensionState, 600);
      }
      this.updateAmbientTimer(current.tensionState);

      // Start or stop meltdown flood
      if (current.tensionState === 'MELTDOWN' && prev.tensionState !== 'MELTDOWN') {
        this.startMeltdownFlood();
      } else if (current.tensionState !== 'MELTDOWN' && prev.tensionState === 'MELTDOWN') {
        this.stopMeltdownFlood();
      }
    }

    // Tab leave detected
    if (current.tabLeaveCount > prev.tabLeaveCount) {
      const messages = getTabLeaveConsoleMessages(current.tensionState);
      emitSequence(messages, current.tensionState);
      this.wasHidden = true;
    }

    // DevTools opened
    if (!prev.devToolsOpened && current.devToolsOpened) {
      const messages = getDevToolsMessage();
      emitSequence(messages, current.tensionState, 800);
    }

    // Ending triggered
    if (prev.phase !== 'ending' && current.phase === 'ending' && current.endingType) {
      this.clearTimers();
      const messages = getEndingMessages(current.endingType);
      emitSequence(messages, current.tensionState, 1200);
    }

    // Game reset — clear timers
    if (prev.phase !== 'landing' && current.phase === 'landing') {
      this.clearTimers();
    }
  }

  private updateAmbientTimer(tension: TensionState) {
    if (this.ambientTimer) {
      clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }

    if (tension !== 'IRRITATED' && tension !== 'UNSTABLE' && tension !== 'MELTDOWN') return;

    const intervalMs = tension === 'IRRITATED' ? 15_000 : 8_000;
    this.ambientTimer = setInterval(() => {
      const current = getState();
      if (current.phase !== 'playing') return;
      const t = current.tensionState as 'IRRITATED' | 'UNSTABLE' | 'MELTDOWN';
      if (t !== 'IRRITATED' && t !== 'UNSTABLE' && t !== 'MELTDOWN') return;

      // 40% chance to emit an illusion message instead of the standard fake system message
      const illusionMsg = Math.random() < 0.4
        ? illusionEngine.getIllusionConsoleMessage(current.tensionState)
        : null;
      if (illusionMsg) {
        emitMessage(illusionMsg, current.tensionState);
      } else {
        emitMessage(getFakeSystemMessage(t), current.tensionState);
      }
    }, intervalMs);
  }

  private startMeltdownFlood() {
    if (this.meltdownTimer) return;
    const tick = () => {
      const current = getState();
      if (current.phase !== 'playing' || current.tensionState !== 'MELTDOWN') {
        this.stopMeltdownFlood();
        return;
      }
      emitMessage(getMeltdownFloodMessage(), 'MELTDOWN');
    };
    // Random interval between 1.5s and 3.5s per message
    const scheduleNext = () => {
      const delay = 1500 + Math.random() * 2000;
      this.meltdownTimer = setTimeout(() => {
        tick();
        if (this.running) scheduleNext();
      }, delay) as unknown as ReturnType<typeof setInterval>;
    };
    scheduleNext();
  }

  private stopMeltdownFlood() {
    if (this.meltdownTimer) {
      clearTimeout(this.meltdownTimer as unknown as ReturnType<typeof setTimeout>);
      this.meltdownTimer = null;
    }
  }
}

export const consoleNarrator = new ConsoleNarrator();
