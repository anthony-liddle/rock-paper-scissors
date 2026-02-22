import { describe, it, expect, vi, afterEach } from 'vitest';
import { getTensionState, getEffectiveTension, calculateTensionIncrease } from '@engine/tension';

describe('getTensionState', () => {
  it('returns CALM for score 0', () => {
    expect(getTensionState(0)).toBe('CALM');
  });

  it('returns CALM for score 19', () => {
    expect(getTensionState(19)).toBe('CALM');
  });

  it('returns UNEASY at threshold 20', () => {
    expect(getTensionState(20)).toBe('UNEASY');
  });

  it('returns UNEASY for score 39', () => {
    expect(getTensionState(39)).toBe('UNEASY');
  });

  it('returns IRRITATED at threshold 40', () => {
    expect(getTensionState(40)).toBe('IRRITATED');
  });

  it('returns UNSTABLE at threshold 60', () => {
    expect(getTensionState(60)).toBe('UNSTABLE');
  });

  it('returns MELTDOWN at threshold 80', () => {
    expect(getTensionState(80)).toBe('MELTDOWN');
  });

  it('returns MELTDOWN at 100', () => {
    expect(getTensionState(100)).toBe('MELTDOWN');
  });

  it('returns CALM for negative scores', () => {
    expect(getTensionState(-5)).toBe('CALM');
  });
});

describe('getEffectiveTension', () => {
  it('adds base and spike', () => {
    expect(getEffectiveTension(30, 10)).toBe(40);
  });

  it('caps at 100', () => {
    expect(getEffectiveTension(90, 20)).toBe(100);
  });

  it('returns base when spike is 0', () => {
    expect(getEffectiveTension(50, 0)).toBe(50);
  });

  it('returns spike when base is 0', () => {
    expect(getEffectiveTension(0, 15)).toBe(15);
  });
});

describe('calculateTensionIncrease', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('has a minimum increase of 6 when robot wins with no score diff', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    // base 3 + abs(0)*2 + 1 (robot won = false, so +1) + 0 random = 4
    // Wait — robotLost=false means robot did NOT lose (robot won or tie)
    const result = calculateTensionIncrease(1, 0, false);
    expect(result).toBe(4); // 3 + 0 + 1 + 0
  });

  it('adds extra when robot lost', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = calculateTensionIncrease(1, 0, true);
    expect(result).toBe(5); // 3 + 0 + 2 + 0
  });

  it('scales with score difference', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = calculateTensionIncrease(1, 3, true);
    expect(result).toBe(11); // 3 + 6 + 2 + 0
  });

  it('uses absolute value of negative score diff', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = calculateTensionIncrease(1, -2, false);
    expect(result).toBe(8); // 3 + 4 + 1 + 0
  });

  it('includes random component up to 2', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    const result = calculateTensionIncrease(1, 0, false);
    expect(result).toBe(6); // 3 + 0 + 1 + 2
  });
});
