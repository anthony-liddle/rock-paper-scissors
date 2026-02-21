import { useSyncExternalStore } from 'react';
import { musicManager } from '@engine/musicManager';
import { applyMusicMuteReaction } from '@engine/gameStore';
import { consoleNarrator } from '@engine/consoleNarrator';

export interface Settings {
  isMusicMuted: boolean;
  reducedMotion: boolean;
}

const STORAGE_KEY_MUTED = 'roshambo_muted';
const STORAGE_KEY_REDUCED_MOTION = 'roshambo_reduced_motion';

function loadInitialSettings(): Settings {
  const storedMuted = localStorage.getItem(STORAGE_KEY_MUTED);
  const storedReduced = localStorage.getItem(STORAGE_KEY_REDUCED_MOTION);

  return {
    isMusicMuted: storedMuted === 'true',
    reducedMotion: storedReduced !== null
      ? storedReduced === 'true'
      : window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
}

let settings: Settings = loadInitialSettings();

// Sync persisted mute state into musicManager on load
if (settings.isMusicMuted) {
  musicManager.setMuted(true);
}

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getSettings(): Settings {
  return settings;
}

export function useSettings(): Settings {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => settings,
  );
}

export function toggleMusicMute(): void {
  const muted = !settings.isMusicMuted;
  settings = { ...settings, isMusicMuted: muted };
  localStorage.setItem(STORAGE_KEY_MUTED, String(muted));

  musicManager.setMuted(muted);
  applyMusicMuteReaction(muted);
  consoleNarrator.onMusicMuteChanged(muted);

  emit();
}

export function toggleReducedMotion(): void {
  const reduced = !settings.reducedMotion;
  settings = { ...settings, reducedMotion: reduced };
  localStorage.setItem(STORAGE_KEY_REDUCED_MOTION, String(reduced));
  emit();
}
