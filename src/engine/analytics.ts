import type { GameState } from '@engine/types';
import { subscribe, getState } from '@engine/gameStore';
import { loadPlayerMemory } from '@engine/playerMemory';

type PostHogInstance = { capture: (event: string, properties?: Record<string, unknown>) => void };

let posthog: PostHogInstance | null = null;

function track(event: string, properties?: Record<string, unknown>) {
  posthog?.capture(event, properties);
}

let gameStartedAt: number | null = null;

function startAnalyticsListener() {
  let prev = getState();

  subscribe(() => {
    const current = getState();
    detectEvents(prev, current);
    prev = current;
  });
}

function detectEvents(prev: GameState, current: GameState) {
  // game_started: phase 'landing' → 'playing'
  if (prev.phase === 'landing' && current.phase === 'playing') {
    gameStartedAt = Date.now();
    track('game_started');
  }

  // round_played: roundPhase → 'revealing'
  if (prev.roundPhase !== 'revealing' && current.roundPhase === 'revealing') {
    track('round_played', {
      player_choice: current.lastPlayerChoice,
      robot_choice: current.lastRobotChoice,
      outcome: current.lastRoundResult,
      round_number: current.roundsPlayed,
      tension_state: current.tensionState,
    });
  }

  // permission_requested: pendingPermission null → non-null
  if (prev.pendingPermission === null && current.pendingPermission !== null) {
    track('permission_requested', {
      permission_name: current.pendingPermission.type,
    });
  }

  // permission_granted / permission_denied: permissionHistory grows
  if (current.permissionHistory.length > prev.permissionHistory.length) {
    const entry = current.permissionHistory[current.permissionHistory.length - 1];
    track(entry.status === 'granted' ? 'permission_granted' : 'permission_denied', {
      permission_name: entry.type,
    });
  }

  // tension_changed: tensionState changes
  if (prev.tensionState !== current.tensionState) {
    track('tension_changed', {
      from_state: prev.tensionState,
      to_state: current.tensionState,
      round_number: current.roundsPlayed,
    });
  }

  // ending_reached: phase 'playing' → 'ending'
  if (prev.phase === 'playing' && current.phase === 'ending') {
    const durationSeconds = gameStartedAt
      ? Math.round((Date.now() - gameStartedAt) / 1000)
      : null;

    track('ending_reached', {
      ending_type: current.endingType,
      total_rounds: current.roundsPlayed,
      final_tension: current.tensionState,
      duration_seconds: durationSeconds,
    });

    gameStartedAt = null;
  }
}

export async function initAnalytics() {
  if (navigator.doNotTrack === '1') return;

  const apiKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  if (!apiKey) return;

  const { default: ph } = await import('posthog-js');

  ph.init(apiKey, {
    api_host: 'https://us.i.posthog.com',
    persistence: 'memory',
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
  });

  posthog = ph;

  // Fire return_visit if player has a previous session
  const memory = loadPlayerMemory();
  if (memory.lastPlayedAt) {
    const daysSinceLast = Math.floor(
      (Date.now() - new Date(memory.lastPlayedAt).getTime()) / (1000 * 60 * 60 * 24),
    );
    track('return_visit', {
      previous_ending_type: memory.lastEnding,
      days_since_last: daysSinceLast,
    });
  }

  startAnalyticsListener();
}
