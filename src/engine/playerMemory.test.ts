import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadPlayerMemory, savePlayerMemory, clearPlayerMemory } from '@engine/playerMemory';
import type { PlayerMemory } from '@engine/playerMemory';

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

describe('playerMemory', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  const DEFAULT_MEMORY: PlayerMemory = {
    playCount: 0,
    lastEnding: null,
    permissionsGranted: [],
    permissionsDenied: [],
    knownCity: null,
    lastPlayedAt: null,
    abandonmentCount: 0,
  };

  describe('loadPlayerMemory', () => {
    it('returns default memory when nothing is stored', () => {
      expect(loadPlayerMemory()).toEqual(DEFAULT_MEMORY);
    });

    it('loads saved memory from localStorage', () => {
      const saved: PlayerMemory = {
        ...DEFAULT_MEMORY,
        playCount: 3,
        lastEnding: 'BROKEN',
        knownCity: 'Portland',
      };
      localStorageMock.setItem('roshambo-memory', JSON.stringify(saved));

      expect(loadPlayerMemory()).toEqual(saved);
    });

    it('merges partial saved data with defaults', () => {
      localStorageMock.setItem('roshambo-memory', JSON.stringify({ playCount: 5 }));

      const result = loadPlayerMemory();
      expect(result.playCount).toBe(5);
      expect(result.lastEnding).toBeNull();
      expect(result.abandonmentCount).toBe(0);
    });

    it('returns default memory on corrupted data', () => {
      localStorageMock.setItem('roshambo-memory', 'not-json');

      // loadPlayerMemory swallows the parse error
      expect(loadPlayerMemory()).toEqual(DEFAULT_MEMORY);
    });
  });

  describe('savePlayerMemory', () => {
    it('persists memory to localStorage', () => {
      const memory: PlayerMemory = {
        ...DEFAULT_MEMORY,
        playCount: 1,
        lastEnding: 'ESCAPED',
      };

      savePlayerMemory(memory);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'roshambo-memory',
        JSON.stringify(memory),
      );
    });
  });

  describe('clearPlayerMemory', () => {
    it('removes the storage key', () => {
      localStorageMock.setItem('roshambo-memory', '{}');
      clearPlayerMemory();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('roshambo-memory');
    });
  });
});
