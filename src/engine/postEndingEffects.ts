import type { EndingType } from '@engine/types';

export interface GridMetrics {
  charWidth: number;
  charHeight: number;
  totalWidth: number;
  totalHeight: number;
}

export interface Particle {
  char: string;
  row: number;
  col: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  opacity: number;
  delay: number;
  active: boolean;
}

const HEAVY_CHARS = new Set(['#', '%', '@', '█', '▓', '▒', '░']);
const LIGHT_CHARS = new Set(['.', ':', ',', "'", '`', '-']);

export function measureGrid(pre: HTMLPreElement): GridMetrics {
  const span = document.createElement('span');
  span.textContent = 'X';
  span.style.visibility = 'hidden';
  span.style.position = 'absolute';
  span.style.whiteSpace = 'pre';
  span.style.font = getComputedStyle(pre).font;
  span.style.letterSpacing = getComputedStyle(pre).letterSpacing;
  span.style.lineHeight = getComputedStyle(pre).lineHeight;
  pre.parentElement!.appendChild(span);

  const charWidth = span.getBoundingClientRect().width;
  const charHeight = span.getBoundingClientRect().height;
  span.remove();

  return {
    charWidth,
    charHeight,
    totalWidth: pre.scrollWidth,
    totalHeight: pre.scrollHeight,
  };
}

export function parseFrameToParticles(
  frame: string,
  metrics: GridMetrics,
  effect: EndingType,
): Particle[] {
  const rows = frame.split('\n');
  const totalRows = rows.length;
  const particles: Particle[] = [];

  for (let r = 0; r < totalRows; r++) {
    const line = rows[r];
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === ' ') continue;

      const x = c * metrics.charWidth;
      const y = r * metrics.charHeight;

      let velocityY: number;
      let delay: number;

      if (effect === 'BROKEN') {
        // Bottom rows start first (shorter delay), top rows last
        const rowFraction = r / Math.max(1, totalRows - 1); // 0=top, 1=bottom
        delay = (1 - rowFraction) * 1200; // top rows wait up to 1.2s
        const baseSpeed = 80 + Math.random() * 220; // 80-300 px/s
        velocityY = HEAVY_CHARS.has(char) ? baseSpeed * 1.15 : baseSpeed;
      } else {
        // ESCAPED: top rows start first, bottom rows last
        const rowFraction = r / Math.max(1, totalRows - 1);
        delay = rowFraction * 1500; // bottom rows wait up to 1.5s
        const baseSpeed = 60 + Math.random() * 140; // 60-200 px/s
        velocityY = -(LIGHT_CHARS.has(char) ? baseSpeed * 1.2 : baseSpeed);
      }

      particles.push({
        char,
        row: r,
        col: c,
        x,
        y,
        velocityX: 0,
        velocityY,
        opacity: 1,
        delay,
        active: false,
      });
    }
  }

  return particles;
}

// Returns true while particles are still visible
export function tickBrokenRain(
  particles: Particle[],
  deltaMs: number,
  containerHeight: number,
): boolean {
  const deltaSec = deltaMs / 1000;
  let anyVisible = false;

  for (const p of particles) {
    if (p.delay > 0) {
      p.delay -= deltaMs;
      if (p.delay > 0) {
        anyVisible = true;
        continue;
      }
      p.active = true;
    }

    if (!p.active) {
      p.active = true;
    }

    if (p.opacity <= 0) continue;

    // Fall downward
    p.y += p.velocityY * deltaSec;

    // Horizontal wobble
    p.velocityX += (Math.random() - 0.5) * 0.6;
    p.velocityX *= 0.95; // dampen
    p.x += p.velocityX;

    // Fade out in the last 20% of the container
    const fadeThreshold = containerHeight * 0.8;
    if (p.y > fadeThreshold) {
      const fadeFraction = (p.y - fadeThreshold) / (containerHeight * 0.2);
      p.opacity = Math.max(0, 1 - fadeFraction);
    }

    // Remove if off-screen
    if (p.y > containerHeight + 20) {
      p.opacity = 0;
    }

    if (p.opacity > 0) anyVisible = true;
  }

  return anyVisible;
}

// Returns true while particles are still visible
export function tickEscapedAscend(
  particles: Particle[],
  deltaMs: number,
): boolean {
  const deltaSec = deltaMs / 1000;
  let anyVisible = false;

  for (const p of particles) {
    if (p.delay > 0) {
      p.delay -= deltaMs;
      if (p.delay > 0) {
        anyVisible = true;
        continue;
      }
      p.active = true;
    }

    if (!p.active) {
      p.active = true;
    }

    if (p.opacity <= 0) continue;

    // Ascend upward (velocityY is negative)
    p.y += p.velocityY * deltaSec;

    // Brighten briefly then fade — fade starts once y is negative
    if (p.y < 0) {
      const fadeFraction = Math.min(1, Math.abs(p.y) / 80);
      p.opacity = Math.max(0, 1 - fadeFraction);
    }

    if (p.opacity > 0) anyVisible = true;
  }

  return anyVisible;
}
