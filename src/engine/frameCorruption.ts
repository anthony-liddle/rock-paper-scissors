import { pickRandom } from '@utils/random';

const GLITCH_CHARS = ['▓', '░', '█', '▒', '╳', '#', '@'];

// Apply visual corruption effects to an ASCII animation frame.
// Pure function — no side effects.
//
// Effects:
// 1. Character substitution — replace random non-whitespace chars with glitch chars
// 2. Row overlay — swap rows from a random alternate frame
// 3. Row duplication — duplicate a row, shifting content down (screen tear)
export function corruptFrame(
  frame: string,
  allFrames: string[],
  intensity: number,
): string {
  const rows = frame.split('\n');
  if (rows.length === 0) return frame;

  // Effect 1: Character substitution (3-8% of non-space chars, scaled by intensity)
  const substitutionRate = (0.03 + 0.05 * intensity);
  for (let r = 0; r < rows.length; r++) {
    const chars = rows[r].split('');
    for (let c = 0; c < chars.length; c++) {
      if (chars[c] !== ' ' && Math.random() < substitutionRate) {
        chars[c] = pickRandom(GLITCH_CHARS);
      }
    }
    rows[r] = chars.join('');
  }

  // Effect 2: Row overlay — swap 1-3 contiguous rows from a random alternate frame (~30% chance)
  if (Math.random() < 0.3 && allFrames.length > 1) {
    const altIndex = Math.floor(Math.random() * allFrames.length);
    const altRows = allFrames[altIndex].split('\n');
    const count = 1 + Math.floor(Math.random() * 3); // 1-3 rows
    const startRow = Math.floor(Math.random() * Math.max(1, rows.length - count));
    for (let i = 0; i < count && startRow + i < rows.length && startRow + i < altRows.length; i++) {
      rows[startRow + i] = altRows[startRow + i];
    }
  }

  // Effect 3: Row duplication — duplicate a random row, push content down (~15% chance)
  if (Math.random() < 0.15 && rows.length > 1) {
    const dupIndex = Math.floor(Math.random() * rows.length);
    rows.splice(dupIndex, 0, rows[dupIndex]);
    // Maintain original line count by removing the last row
    rows.pop();
  }

  return rows.join('\n');
}
