import { applyTabLeave, persistAbandonment, getState } from '@engine/gameStore';

class TabLeaveDetector {
  private running = false;
  private handleVisibilityChange = () => this.onVisibilityChange();
  private handleBeforeUnload = () => this.onBeforeUnload();

  start() {
    if (this.running) return;
    this.running = true;
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  }

  stop() {
    this.running = false;
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }

  private onVisibilityChange() {
    if (document.visibilityState === 'hidden' && getState().phase === 'playing') {
      applyTabLeave();
    }
  }

  private onBeforeUnload() {
    if (getState().phase === 'playing') {
      persistAbandonment();
    }
  }
}

export const tabLeaveDetector = new TabLeaveDetector();
