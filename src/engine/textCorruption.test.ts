import { describe, it, expect, vi, afterEach } from 'vitest';
import { corruptDialogueText } from '@engine/textCorruption';

describe('corruptDialogueText', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns text unchanged for CALM', () => {
    expect(corruptDialogueText('Hello world', 'CALM')).toBe('Hello world');
  });

  it('returns text unchanged for UNEASY', () => {
    expect(corruptDialogueText('Hello world', 'UNEASY')).toBe('Hello world');
  });

  it('returns text unchanged for IRRITATED', () => {
    expect(corruptDialogueText('Hello world', 'IRRITATED')).toBe('Hello world');
  });

  it('can corrupt text at UNSTABLE (2% rate)', () => {
    // Force all non-space chars to corrupt
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = corruptDialogueText('Hello', 'UNSTABLE');
    expect(result).not.toBe('Hello');
    expect(result).toHaveLength(5);
  });

  it('can corrupt text at MELTDOWN (5% rate)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = corruptDialogueText('Test', 'MELTDOWN');
    expect(result).not.toBe('Test');
    expect(result).toHaveLength(4);
  });

  it('preserves spaces during corruption', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const result = corruptDialogueText('A B C', 'MELTDOWN');
    expect(result[1]).toBe(' ');
    expect(result[3]).toBe(' ');
  });

  it('returns empty string unchanged', () => {
    expect(corruptDialogueText('', 'MELTDOWN')).toBe('');
  });

  it('does not corrupt when random exceeds rate', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const text = 'No corruption here';
    expect(corruptDialogueText(text, 'UNSTABLE')).toBe(text);
    expect(corruptDialogueText(text, 'MELTDOWN')).toBe(text);
  });
});
