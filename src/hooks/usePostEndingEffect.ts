import { useEffect, useRef } from 'react';
import { useSettings } from '@hooks/useSettings';
import {
  measureGrid,
  parseFrameToParticles,
  tickBrokenRain,
  tickEscapedAscend,
} from '@engine/postEndingEffects';
import type { Particle } from '@engine/postEndingEffects';
import type { EndingType } from '@engine/types';

export function usePostEndingEffect(
  mode: 'idle' | 'playing' | 'holding' | 'ending' | 'ended',
  endingType: EndingType | null,
  preRef: React.RefObject<HTMLPreElement | null>,
  overlayRef: React.RefObject<HTMLDivElement | null>,
) {
  const { reducedMotion } = useSettings();
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const activeRef = useRef(false);

  useEffect(() => {
    // Only activate when mode is 'ended' and we have an ending type
    if (mode !== 'ended' || !endingType || reducedMotion) {
      // Cleanup if we were active
      if (activeRef.current) {
        cleanup();
      }
      return;
    }

    const pre = preRef.current;
    const overlay = overlayRef.current;
    if (!pre || !overlay) return;

    // Measure grid from the rendered pre
    const metrics = measureGrid(pre);
    if (metrics.charWidth === 0 || metrics.charHeight === 0) return;

    // Get the final frame text
    const frame = pre.textContent || '';
    if (!frame) return;

    // Build particles
    particlesRef.current = parseFrameToParticles(frame, metrics, endingType);

    // Match overlay sizing and transform to the pre so particles align
    const preStyles = getComputedStyle(pre);
    overlay.style.inset = '';
    overlay.style.width = `${pre.scrollWidth}px`;
    overlay.style.height = `${pre.scrollHeight}px`;
    overlay.style.left = `${pre.offsetLeft}px`;
    overlay.style.top = `${pre.offsetTop}px`;
    overlay.style.transform = preStyles.transform;
    overlay.style.transformOrigin = preStyles.transformOrigin;

    // Create spans in the overlay
    const fragment = document.createDocumentFragment();
    for (const p of particlesRef.current) {
      const span = document.createElement('span');
      span.textContent = p.char;
      span.style.left = `${p.x}px`;
      span.style.top = `${p.y}px`;
      fragment.appendChild(span);
    }
    overlay.appendChild(fragment);

    // Hide the pre, show the overlay
    pre.style.visibility = 'hidden';
    overlay.style.display = '';

    // Add glow class for ESCAPED
    if (endingType === 'ESCAPED') {
      overlay.classList.add('post-ending-glow');
    }

    activeRef.current = true;

    // Run rAF loop
    let lastTimestamp = 0;

    const tick = (timestamp: number) => {
      if (!activeRef.current) return;

      if (lastTimestamp === 0) {
        lastTimestamp = timestamp;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const delta = Math.min(timestamp - lastTimestamp, 50); // cap to prevent jumps
      lastTimestamp = timestamp;

      const particles = particlesRef.current;
      let stillActive: boolean;

      if (endingType === 'BROKEN') {
        const containerHeight = overlay.clientHeight || metrics.totalHeight;
        stillActive = tickBrokenRain(particles, delta, containerHeight);
      } else {
        stillActive = tickEscapedAscend(particles, delta);
      }

      // Update DOM positions
      const spans = overlay.children;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const span = spans[i] as HTMLElement;
        if (!span) continue;

        if (!p.active && p.delay > 0) {
          // Not yet started — keep at original position
          continue;
        }

        span.style.transform = `translate(${p.x - p.col * metrics.charWidth}px, ${p.y - p.row * metrics.charHeight}px)`;
        span.style.opacity = String(p.opacity);
      }

      if (stillActive) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cleanup();
    };

    function cleanup() {
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
      if (overlay) {
        overlay.replaceChildren();
        overlay.style.display = 'none';
        overlay.style.width = '';
        overlay.style.height = '';
        overlay.style.left = '';
        overlay.style.top = '';
        overlay.style.inset = '';
        overlay.style.transform = '';
        overlay.style.transformOrigin = '';
        overlay.classList.remove('post-ending-glow');
      }
      if (pre) {
        pre.style.visibility = '';
      }
      particlesRef.current = [];
    }
  }, [mode, endingType, reducedMotion, preRef, overlayRef]);
}
