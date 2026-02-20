import type { TensionState } from '@engine/types';
import type { ConsoleMessage } from '@data/consoleDialogue';
import {
  getIllusionDialogueLine,
  getIllusionConsoleMsg,
  type IllusionTemplateVars,
} from '@data/illusionDialogue';

// --- Browser detection helpers ---

function detectBrowser(ua: string): { name: string; version: string } {
  // Order matters — check more specific UA strings first
  if (ua.includes('Firefox/')) {
    const v = ua.match(/Firefox\/([\d.]+)/)?.[1] ?? '';
    return { name: 'Firefox', version: v };
  }
  if (ua.includes('Edg/')) {
    const v = ua.match(/Edg\/([\d.]+)/)?.[1] ?? '';
    return { name: 'Edge', version: v };
  }
  if (ua.includes('OPR/') || ua.includes('Opera/')) {
    const v = ua.match(/(?:OPR|Opera)\/([\d.]+)/)?.[1] ?? '';
    return { name: 'Opera', version: v };
  }
  if (ua.includes('Chrome/')) {
    const v = ua.match(/Chrome\/([\d.]+)/)?.[1] ?? '';
    return { name: 'Chrome', version: v };
  }
  if (ua.includes('Safari/') && ua.includes('Version/')) {
    const v = ua.match(/Version\/([\d.]+)/)?.[1] ?? '';
    return { name: 'Safari', version: v };
  }
  return { name: 'Unknown', version: '' };
}

function getTimeOfDay(hour: number): string {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

// --- Pseudo-fingerprint hash ---

async function computeHash(input: string): Promise<string> {
  try {
    const encoded = new TextEncoder().encode(input);
    const buffer = await crypto.subtle.digest('SHA-256', encoded);
    const arr = new Uint8Array(buffer);
    return Array.from(arr.slice(0, 4))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    // djb2 fallback for non-HTTPS or unsupported environments
    let h = 5381;
    for (let i = 0; i < input.length; i++) {
      h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
    }
    return (h >>> 0).toString(16).padStart(8, '0');
  }
}

// --- Probability gates per tension level ---

const DIALOGUE_PROBABILITY: Record<TensionState, number> = {
  CALM: 0,
  UNEASY: 0.15,
  IRRITATED: 0.25,
  UNSTABLE: 0.35,
  MELTDOWN: 0.50,
};

// --- Singleton ---

class IllusionEngine {
  private snapshot: IllusionTemplateVars | null = null;
  private stopped = false;

  async start(): Promise<void> {
    this.stopped = false;

    const now = new Date();
    const hour = now.getHours();
    const ua = navigator.userAgent;
    const { name: browser, version: browserVersion } = detectBrowser(ua);
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const lang = navigator.language;
    const cores = navigator.hardwareConcurrency ?? 4;

    // Battery — async, Chrome-only
    let battery: number | null = null;
    let charging: boolean | null = null;
    try {
      if ('getBattery' in navigator) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Chrome-only Battery API not in standard typings
        const bm = await (navigator as any).getBattery();
        battery = Math.round(bm.level * 100);
        charging = bm.charging;
      }
    } catch {
      // Graceful fallback — battery stays null
    }

    // Device memory — Chrome-only
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Chrome-only Device Memory API not in standard typings
    const deviceMemory: number | null = (navigator as any).deviceMemory ?? null;

    // Pseudo-fingerprint
    const fingerprintInput = `${ua}|${screen.width}x${screen.height}|${tz}|${lang}|${cores}`;
    const hash = await computeHash(fingerprintInput);

    if (this.stopped) return; // In case stop() was called during async work

    this.snapshot = {
      time: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      hour,
      dayOfWeek: now.toLocaleDateString([], { weekday: 'long' }),
      timeOfDay: getTimeOfDay(hour),
      browser,
      browserVersion,
      platform: navigator.platform,
      cores,
      screenW: screen.width,
      screenH: screen.height,
      battery,
      charging,
      language: lang,
      timezone: tz,
      deviceMemory,
      hash,
    };
  }

  stop(): void {
    this.stopped = true;
    // Snapshot persists for reuse on restart
  }

  /**
   * Probability-gated illusion line for the in-game dialogue box.
   * Returns null at CALM, if snapshot isn't ready, or if the random gate fails.
   */
  getIllusionLine(tensionState: TensionState): string | null {
    if (!this.snapshot) return null;
    if (tensionState === 'CALM') return null;

    const prob = DIALOGUE_PROBABILITY[tensionState];
    if (Math.random() > prob) return null;

    return getIllusionDialogueLine(tensionState, this.snapshot);
  }

  /**
   * Console message for DevTools output. No probability gate — caller manages frequency.
   */
  getIllusionConsoleMessage(tensionState: TensionState): ConsoleMessage | null {
    if (!this.snapshot) return null;
    if (tensionState === 'CALM') return null;

    return getIllusionConsoleMsg(tensionState, this.snapshot);
  }
}

export const illusionEngine = new IllusionEngine();
