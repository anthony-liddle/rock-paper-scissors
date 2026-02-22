import { describe, it, expect, vi, afterEach } from 'vitest';
import { rollDisruption, getRandomFakeLabel } from '@engine/disruptions';

describe('rollDisruption', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('always returns null for CALM', () => {
    // CALM has 0% chance — no matter what Math.random returns
    const result = rollDisruption('CALM');
    expect(result).toBeNull();
  });

  it('returns null when random exceeds disruption chance', () => {
    // UNEASY has 0.15 chance. If first Math.random > 0.15, returns null
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(rollDisruption('UNEASY')).toBeNull();
  });

  describe('UNEASY disruptions', () => {
    it('returns confirm disruption for low roll', () => {
      const calls = [0.1, 0.1, 0]; // gate pass, type roll < 0.4, pickRandom index
      let callIndex = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => calls[callIndex++]);

      const result = rollDisruption('UNEASY');
      expect(result).not.toBeNull();
      expect(result!.type).toBe('confirm');
      expect(result!.message).toBeDefined();
    });

    it('returns delay disruption for mid roll', () => {
      const calls = [0.1, 0.5, 0.5]; // gate pass, 0.4 <= roll < 0.7, duration random
      let callIndex = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => calls[callIndex++]);

      const result = rollDisruption('UNEASY');
      expect(result).not.toBeNull();
      expect(result!.type).toBe('delay');
      expect(result!.durationMs).toBeGreaterThanOrEqual(800);
      expect(result!.durationMs).toBeLessThanOrEqual(1500);
    });

    it('returns jitter disruption for high roll', () => {
      const calls = [0.1, 0.8]; // gate pass, roll >= 0.7
      let callIndex = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => calls[callIndex++]);

      const result = rollDisruption('UNEASY');
      expect(result).not.toBeNull();
      expect(result!.type).toBe('jitter');
    });
  });

  describe('IRRITATED disruptions', () => {
    it('returns confirm for low roll', () => {
      const calls = [0.1, 0.1, 0]; // gate, roll < 0.3, pickRandom
      let callIndex = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => calls[callIndex++]);

      const result = rollDisruption('IRRITATED');
      expect(result!.type).toBe('confirm');
    });

    it('returns delay for mid-low roll', () => {
      const calls = [0.1, 0.4, 0.5]; // gate, 0.3 <= roll < 0.5, duration random
      let callIndex = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => calls[callIndex++]);

      const result = rollDisruption('IRRITATED');
      expect(result!.type).toBe('delay');
    });

    it('returns jitter for mid-high roll', () => {
      const calls = [0.1, 0.6]; // gate, 0.5 <= roll < 0.75
      let callIndex = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => calls[callIndex++]);

      const result = rollDisruption('IRRITATED');
      expect(result!.type).toBe('jitter');
    });

    it('returns relabel for high roll', () => {
      const calls = [0.1, 0.8, 0]; // gate, roll >= 0.75, pickRandom (unused internally but may be called)
      let callIndex = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => calls[callIndex++] ?? 0);

      const result = rollDisruption('IRRITATED');
      expect(result!.type).toBe('relabel');
    });
  });

  describe('UNSTABLE/MELTDOWN disruptions', () => {
    it('returns confirm for low roll at UNSTABLE', () => {
      const calls = [0.1, 0.1, 0]; // gate, roll < 0.25, pickRandom
      let callIndex = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => calls[callIndex++]);

      const result = rollDisruption('UNSTABLE');
      expect(result!.type).toBe('confirm');
    });

    it('returns delay for mid roll at MELTDOWN', () => {
      const calls = [0.1, 0.3, 0.5]; // gate, 0.25 <= roll < 0.45, duration random
      let callIndex = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => calls[callIndex++]);

      const result = rollDisruption('MELTDOWN');
      expect(result!.type).toBe('delay');
    });

    it('returns relabel for mid-high roll', () => {
      const calls = [0.1, 0.5]; // gate, 0.45 <= roll < 0.7
      let callIndex = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => calls[callIndex++]);

      const result = rollDisruption('UNSTABLE');
      expect(result!.type).toBe('relabel');
    });

    it('returns jitter for high roll', () => {
      const calls = [0.1, 0.8]; // gate, roll >= 0.7
      let callIndex = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => calls[callIndex++]);

      const result = rollDisruption('MELTDOWN');
      expect(result!.type).toBe('jitter');
    });
  });
});

describe('getRandomFakeLabel', () => {
  it('returns a string wrapped in brackets', () => {
    const label = getRandomFakeLabel();
    expect(label).toMatch(/^\[.+\]$/);
  });
});
