export interface PlayerMemory {
  playCount: number;
  lastEnding: 'BROKEN' | 'ESCAPED' | null;
  permissionsGranted: string[];
  permissionsDenied: string[];
  knownCity: string | null;
  lastPlayedAt: string | null;
  abandonmentCount: number;
}

const STORAGE_KEY = 'roshambo-memory';

const DEFAULT_MEMORY: PlayerMemory = {
  playCount: 0,
  lastEnding: null,
  permissionsGranted: [],
  permissionsDenied: [],
  knownCity: null,
  lastPlayedAt: null,
  abandonmentCount: 0,
};

export function loadPlayerMemory(): PlayerMemory {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_MEMORY, ...JSON.parse(raw) };
  } catch { /* corrupted data */ }
  return { ...DEFAULT_MEMORY };
}

export function savePlayerMemory(memory: PlayerMemory): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch { /* storage full or blocked */ }
}

export function clearPlayerMemory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* blocked */ }
}
