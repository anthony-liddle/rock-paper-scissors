import { describe, it, expect, vi, afterEach } from 'vitest';
import { corruptFrame } from '@engine/frameCorruption';

describe('corruptFrame', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const sampleFrame = [
    '  /\\_/\\  ',
    ' ( o.o ) ',
    '  > ^ <  ',
  ].join('\n');

  const altFrame = [
    '  \\___/  ',
    ' ( x.x ) ',
    '  > v <  ',
  ].join('\n');

  it('returns the same number of rows', () => {
    const result = corruptFrame(sampleFrame, [sampleFrame], 0.5);
    const inputRows = sampleFrame.split('\n').length;
    const outputRows = result.split('\n').length;
    expect(outputRows).toBe(inputRows);
  });

  it('returns the frame unchanged for empty input', () => {
    expect(corruptFrame('', [''], 1)).toBe('');
  });

  it('preserves spaces (only corrupts non-space characters)', () => {
    // Force all random to corrupt — high intensity
    vi.spyOn(Math, 'random').mockReturnValue(0.001);

    const result = corruptFrame('   ', ['   '], 1);
    // All spaces should remain spaces
    expect(result.trim()).toBe('');
  });

  it('applies character substitution at higher intensity', () => {
    // At intensity 1, substitution rate is 0.08, so ~8% of non-space chars corrupted
    // With random always returning 0 (< 0.08), ALL non-space chars get corrupted
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const input = 'ABCDE';
    const result = corruptFrame(input, [input], 1);

    // Every character should be corrupted since random is always 0 < substitutionRate
    expect(result).not.toBe(input);
    expect(result).toHaveLength(input.length);
  });

  it('skips row overlay when only one frame exists and random >= 0.3', () => {
    // Disable substitution (random > substitution rate) and overlay (random >= 0.3)
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const result = corruptFrame(sampleFrame, [sampleFrame], 0);
    // With random at 0.5: substitution rate is 0.03 (intensity 0), 0.5 > 0.03 so no substitution
    // Overlay: 0.5 >= 0.3 but allFrames.length === 1 so skipped
    // Duplication: 0.5 >= 0.15 so skipped
    expect(result).toBe(sampleFrame);
  });

  it('can incorporate rows from alternate frames during overlay', () => {
    // Force overlay to trigger (random < 0.3 for overlay check)
    const calls = [
      // Substitution calls - return high values to skip all substitution
      ...Array(100).fill(0.99),
    ];
    let callIndex = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      if (callIndex < calls.length) return calls[callIndex++];
      return 0.2; // For overlay/dup decisions — triggers overlay (< 0.3)
    });

    // With two different frames, overlay may swap rows from altFrame
    const result = corruptFrame(sampleFrame, [sampleFrame, altFrame], 0);
    // We can't predict exactly which rows get swapped, just verify it ran
    expect(typeof result).toBe('string');
    expect(result.split('\n').length).toBe(sampleFrame.split('\n').length);
  });
});
