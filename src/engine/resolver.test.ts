import { describe, it, expect } from 'vitest';
import { resolveRound } from '@engine/resolver';
import type { Choice } from '@engine/types';

describe('resolveRound', () => {
  const choices: Choice[] = ['rock', 'paper', 'scissors'];

  it('returns tie when both players choose the same', () => {
    for (const choice of choices) {
      expect(resolveRound(choice, choice)).toBe('tie');
    }
  });

  describe('player wins', () => {
    it('rock beats scissors', () => {
      expect(resolveRound('rock', 'scissors')).toBe('player');
    });

    it('scissors beats paper', () => {
      expect(resolveRound('scissors', 'paper')).toBe('player');
    });

    it('paper beats rock', () => {
      expect(resolveRound('paper', 'rock')).toBe('player');
    });
  });

  describe('robot wins', () => {
    it('scissors beats rock (robot)', () => {
      expect(resolveRound('rock', 'paper')).toBe('robot');
    });

    it('rock beats scissors (robot)', () => {
      expect(resolveRound('scissors', 'rock')).toBe('robot');
    });

    it('paper beats rock (robot)', () => {
      expect(resolveRound('paper', 'scissors')).toBe('robot');
    });
  });

  it('covers all 9 combinations', () => {
    const results: string[] = [];
    for (const p of choices) {
      for (const r of choices) {
        results.push(resolveRound(p, r));
      }
    }
    expect(results).toHaveLength(9);
    expect(results.filter((r) => r === 'tie')).toHaveLength(3);
    expect(results.filter((r) => r === 'player')).toHaveLength(3);
    expect(results.filter((r) => r === 'robot')).toHaveLength(3);
  });
});
