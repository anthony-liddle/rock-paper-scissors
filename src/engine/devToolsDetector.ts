import { applyDevToolsDetected, getState } from '@engine/gameStore';

const POLL_INTERVAL = 2000;
const THRESHOLD = 160;

class DevToolsDetector {
  private timer: ReturnType<typeof setInterval> | null = null;
  private running = false;

  start() {
    if (this.running) return;
    this.running = true;

    this.timer = setInterval(() => {
      if (getState().devToolsOpened) return; // already detected
      if (this.isDevToolsOpen()) {
        applyDevToolsDetected();
      }
    }, POLL_INTERVAL);
  }

  stop() {
    this.running = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private isDevToolsOpen(): boolean {
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    return widthDiff > THRESHOLD || heightDiff > THRESHOLD;
  }
}

export const devToolsDetector = new DevToolsDetector();
