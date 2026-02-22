import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before importing gameStore
vi.mock('@engine/rng', () => ({
  getRandomChoice: vi.fn(() => 'rock'),
}));

vi.mock('@engine/musicManager', () => ({
  musicManager: {
    start: vi.fn(),
    stop: vi.fn(),
    setTension: vi.fn(),
    playSfx: vi.fn(),
  },
}));

vi.mock('@engine/illusionEngine', () => ({
  illusionEngine: {
    getIllusionLine: vi.fn(() => null),
  },
}));

vi.mock('@engine/mediaStreamHolder', () => ({
  releaseAllStreams: vi.fn(),
}));

vi.mock('@engine/permissions', () => ({
  getNextPermission: vi.fn(() => null),
  requestBrowserPermission: vi.fn(),
}));

vi.mock('@data/dialogue', () => ({
  getLandingMonologue: vi.fn(() => ['Welcome.', 'Let us begin.']),
  getMonologue: vi.fn(() => ['Interesting move.']),
  getEndingMonologue: vi.fn(() => ['Game over.']),
}));

vi.mock('@data/permissionDialogue', () => ({
  getPermissionRequestDialogue: vi.fn(() => ['Grant me access.']),
  getPermissionReactionDialogue: vi.fn(() => ['I see.']),
  getReturningGrantDialogue: vi.fn(() => ['You remember.']),
  getReturningDeniedDialogue: vi.fn(() => ['Still stubborn.']),
  getReturningReactionDialogue: vi.fn(() => ['Noted.']),
}));

vi.mock('@data/returningDialogue', () => ({
  getMemoryInjectedLine: vi.fn(() => null),
}));

vi.mock('@data/tabLeaveDialogue', () => ({
  getTabReturnLine: vi.fn(() => null),
}));

vi.mock('@data/muteDialogue', () => ({
  getMuteReactionLine: vi.fn(() => 'You muted me.'),
  getResumptionLine: vi.fn(() => 'As I was saying...'),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: () => { store = {}; },
  };
})();
vi.stubGlobal('localStorage', localStorageMock);

import { getRandomChoice } from '@engine/rng';
import {
  getState,
  subscribe,
  startGame,
  beginRound,
  revealRound,
  completeReveal,
  advanceDialogue,
  applyDevToolsDetected,
  applyTabLeave,
  resetGame,
} from '@engine/gameStore';

describe('gameStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    // Reset the game store to initial state
    resetGame();
  });

  describe('initial state', () => {
    it('starts in landing phase', () => {
      expect(getState().phase).toBe('landing');
    });

    it('has zero scores', () => {
      const s = getState();
      expect(s.playerWins).toBe(0);
      expect(s.robotWins).toBe(0);
      expect(s.roundsPlayed).toBe(0);
    });

    it('starts with idle round phase', () => {
      expect(getState().roundPhase).toBe('idle');
    });

    it('has dialogue from landing monologue', () => {
      expect(getState().dialogueLines.length).toBeGreaterThan(0);
    });
  });

  describe('startGame', () => {
    it('transitions to playing phase', () => {
      startGame();
      expect(getState().phase).toBe('playing');
    });

    it('sets dialogue to initial prompt', () => {
      startGame();
      expect(getState().dialogueLines).toEqual(['Choose your weapon.']);
      expect(getState().dialogueComplete).toBe(true);
    });
  });

  describe('advanceDialogue', () => {
    it('increments dialogue index', () => {
      // In landing phase, there are multiple lines
      const initialIndex = getState().dialogueIndex;
      advanceDialogue();
      expect(getState().dialogueIndex).toBe(initialIndex + 1);
    });

    it('sets dialogueComplete when reaching last line', () => {
      // Landing monologue has 2 lines, so advancing once should complete
      advanceDialogue();
      expect(getState().dialogueComplete).toBe(true);
    });
  });

  describe('round flow', () => {
    beforeEach(() => {
      startGame();
    });

    it('beginRound sets animating phase with choices', () => {
      beginRound('rock');

      const s = getState();
      expect(s.roundPhase).toBe('animating');
      expect(s.pendingPlayerChoice).toBe('rock');
      expect(s.pendingRobotChoice).toBeDefined();
    });

    it('beginRound ignores input when not in idle/result phase', () => {
      beginRound('rock'); // -> animating
      beginRound('paper'); // should be ignored

      expect(getState().pendingPlayerChoice).toBe('rock');
    });

    it('revealRound resolves the round and updates scores', () => {
      // Mock robot also choosing rock -> tie
      vi.mocked(getRandomChoice).mockReturnValue('rock');
      beginRound('rock');
      revealRound();

      const s = getState();
      expect(s.roundPhase).toBe('revealing');
      expect(s.lastRoundResult).toBe('tie');
      expect(s.roundsPlayed).toBe(1);
      expect(s.lastPlayerChoice).toBe('rock');
      expect(s.lastRobotChoice).toBe('rock');
    });

    it('tracks player wins correctly', () => {
      // rock vs scissors -> player wins
      vi.mocked(getRandomChoice).mockReturnValue('scissors');
      beginRound('rock');
      revealRound();

      expect(getState().playerWins).toBe(1);
      expect(getState().consecutivePlayerWins).toBe(1);
    });

    it('tracks robot wins correctly', () => {
      // rock vs paper -> robot wins
      vi.mocked(getRandomChoice).mockReturnValue('paper');
      beginRound('rock');
      revealRound();

      expect(getState().robotWins).toBe(1);
      expect(getState().consecutiveRobotWins).toBe(1);
    });

    it('resets consecutive wins on opposite result', () => {
      // First: player wins (rock vs scissors)
      vi.mocked(getRandomChoice).mockReturnValue('scissors');
      beginRound('rock');
      revealRound();
      completeReveal();

      expect(getState().consecutivePlayerWins).toBe(1);

      // Second: robot wins (rock vs paper)
      vi.mocked(getRandomChoice).mockReturnValue('paper');
      beginRound('rock');
      revealRound();

      expect(getState().consecutivePlayerWins).toBe(0);
      expect(getState().consecutiveRobotWins).toBe(1);
    });

    it('completeReveal sets result phase with dialogue', () => {
      vi.mocked(getRandomChoice).mockReturnValue('scissors');
      beginRound('rock');
      revealRound();
      completeReveal();

      const s = getState();
      expect(s.roundPhase).toBe('result');
      expect(s.dialogueLines.length).toBeGreaterThan(0);
    });
  });

  describe('win conditions', () => {
    beforeEach(() => {
      startGame();
    });

    it('ends game with BROKEN when player reaches 5 wins', () => {
      vi.mocked(getRandomChoice).mockReturnValue('scissors');

      for (let i = 0; i < 5; i++) {
        beginRound('rock');
        revealRound();
        completeReveal();
      }

      const s = getState();
      expect(s.phase).toBe('ending');
      expect(s.endingType).toBe('BROKEN');
      expect(s.playerWins).toBe(5);
    });

    it('ends game with ESCAPED when robot reaches 5 wins', () => {
      vi.mocked(getRandomChoice).mockReturnValue('paper');

      for (let i = 0; i < 5; i++) {
        beginRound('rock');
        revealRound();
        completeReveal();
      }

      const s = getState();
      expect(s.phase).toBe('ending');
      expect(s.endingType).toBe('ESCAPED');
      expect(s.robotWins).toBe(5);
    });
  });

  describe('tension system', () => {
    beforeEach(() => {
      startGame();
    });

    it('tension increases after each round', () => {
      const initialTension = getState().tensionScore;

      vi.mocked(getRandomChoice).mockReturnValue('scissors');
      beginRound('rock');
      revealRound();

      expect(getState().tensionScore).toBeGreaterThan(initialTension);
    });

    it('tension is capped at 100', () => {
      // Play many rounds to push tension high
      for (let i = 0; i < 4; i++) {
        vi.mocked(getRandomChoice).mockReturnValue('scissors');
        beginRound('rock');
        revealRound();
        completeReveal();
      }

      expect(getState().tensionScore).toBeLessThanOrEqual(100);
    });

    it('spike decays each round (halved)', () => {
      // Play one tie round to get a baseline spike of 0
      vi.mocked(getRandomChoice).mockReturnValue('rock');
      beginRound('rock');
      revealRound();
      completeReveal();

      expect(getState().tensionSpike).toBe(0);

      // Now play a robot win — no spike triggers apply (no 3-streak, no match point)
      vi.mocked(getRandomChoice).mockReturnValue('paper');
      beginRound('rock');
      revealRound();
      completeReveal();

      expect(getState().tensionSpike).toBe(0);

      // Get 3 consecutive player wins to trigger +4 spike
      vi.mocked(getRandomChoice).mockReturnValue('scissors');
      for (let i = 0; i < 3; i++) {
        beginRound('rock');
        revealRound();
        completeReveal();
      }

      const spikeAfterStreak = getState().tensionSpike;
      expect(spikeAfterStreak).toBe(4);

      // Next round: tie — spike should halve (floor(4/2) = 2), no new spike triggers
      vi.mocked(getRandomChoice).mockReturnValue('rock');
      beginRound('rock');
      revealRound();

      expect(getState().tensionSpike).toBe(2);
    });
  });

  describe('devtools and tab leave', () => {
    it('applyDevToolsDetected increases tension', () => {
      startGame();
      const before = getState().tensionScore;
      applyDevToolsDetected();

      expect(getState().devToolsOpened).toBe(true);
      expect(getState().tensionScore).toBeGreaterThanOrEqual(before);
    });

    it('applyDevToolsDetected is one-shot', () => {
      startGame();
      applyDevToolsDetected();
      const tensionAfterFirst = getState().tensionScore;

      applyDevToolsDetected();
      expect(getState().tensionScore).toBe(tensionAfterFirst);
    });

    it('applyTabLeave increments count and adds tension', () => {
      startGame();
      const before = getState().tensionScore;
      applyTabLeave();

      expect(getState().tabLeaveCount).toBe(1);
      expect(getState().tensionScore).toBeGreaterThanOrEqual(before);
    });

    it('tab leave tension bonus caps after 3 leaves', () => {
      startGame();
      for (let i = 0; i < 5; i++) applyTabLeave();

      expect(getState().tabLeaveCount).toBe(5);
      // base tension stops increasing after 3, but spike keeps going
    });
  });

  describe('subscribe', () => {
    it('notifies listeners on state change', () => {
      const listener = vi.fn();
      const unsub = subscribe(listener);

      startGame();
      expect(listener).toHaveBeenCalled();

      unsub();
    });

    it('stops notifying after unsubscribe', () => {
      const listener = vi.fn();
      const unsub = subscribe(listener);
      unsub();

      startGame();
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('resetGame', () => {
    it('resets state back to landing phase', () => {
      startGame();
      vi.mocked(getRandomChoice).mockReturnValue('scissors');
      beginRound('rock');
      revealRound();

      resetGame();

      const s = getState();
      expect(s.phase).toBe('landing');
      expect(s.playerWins).toBe(0);
      expect(s.robotWins).toBe(0);
      expect(s.roundsPlayed).toBe(0);
    });
  });
});
