import { describe, it, expect, vi, afterEach } from 'vitest';
import { pickRandom } from '@utils/random';

describe('pickRandom', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the only element from a single-element array', () => {
    expect(pickRandom([42])).toBe(42);
  });

  it('returns an element that exists in the source array', () => {
    const arr = ['a', 'b', 'c'];
    const result = pickRandom(arr);
    expect(arr).toContain(result);
  });

  it('picks the first element when Math.random returns 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(pickRandom(['a', 'b', 'c'])).toBe('a');
  });

  it('picks the last element when Math.random returns 0.999', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    expect(pickRandom(['a', 'b', 'c'])).toBe('c');
  });

  it('returns undefined for an empty array', () => {
    expect(pickRandom([])).toBeUndefined();
  });
});
