import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  animations,
  tensionAnimations,
  tensionFrameRate,
} from '@data/animationRegistry';
import { corruptFrame } from '@engine/frameCorruption';
import type { TensionState } from '@engine/types';

import '@styles/base.css';
import '@styles/tension.css';
import '@styles/ascii-animation.css';
import '@styles/crt-screen.css';
import '@styles/dev-pages.css';

const TENSION_LEVELS: TensionState[] = ['CALM', 'UNEASY', 'IRRITATED', 'UNSTABLE', 'MELTDOWN'];
const animationNames = Object.keys(animations);

type PlaybackDirection = 'forward' | 'reverse' | 'pingpong';

function getAnimationCategory(name: string): string {
  for (const [tension, pool] of Object.entries(tensionAnimations)) {
    if (pool.includes(name)) return `${tension} pool`;
  }
  if (name.startsWith('grasp')) return 'Grasp sequence';
  if (name.startsWith('burst')) return 'Burst';
  if (name === 'rock') return 'Choice reveal (rock)';
  if (name === 'paper') return 'Choice reveal (paper)';
  if (name === 'scissors') return 'Choice reveal (scissors)';
  return 'Uncategorized';
}

export function AnimationDevPage() {
  // Primary animation state
  const [selectedAnim, setSelectedAnim] = useState(animationNames[0]);
  const [playing, setPlaying] = useState(true);
  const [frameRate, setFrameRate] = useState(84);
  const [direction, setDirection] = useState<PlaybackDirection>('pingpong');

  // Corruption
  const [corruptionEnabled, setCorruptionEnabled] = useState(false);
  const [corruptionIntensity, setCorruptionIntensity] = useState(0.5);

  // Tension
  const [selectedTension, setSelectedTension] = useState<TensionState | null>(null);
  const [lockToTension, setLockToTension] = useState(true);
  const [showTensionCss, setShowTensionCss] = useState(false);

  // Comparison
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [comparisonAnim, setComparisonAnim] = useState(animationNames[1] || animationNames[0]);

  // Frame inspector
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorFrame, setInspectorFrame] = useState('');

  // Refs for direct DOM updates
  const preRef = useRef<HTMLPreElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef(0);
  const directionRef = useRef(1); // 1 or -1 for pingpong
  const rafRef = useRef(0);
  const lastUpdateRef = useRef(0);
  const playingRef = useRef(playing);
  const frameRateRef = useRef(frameRate);
  const directionModeRef = useRef(direction);
  const corruptionEnabledRef = useRef(corruptionEnabled);
  const corruptionIntensityRef = useRef(corruptionIntensity);

  // Container refs for scale-to-fit
  const containerRef = useRef<HTMLDivElement>(null);
  const containerRef2 = useRef<HTMLDivElement>(null);

  // Comparison refs
  const preRef2 = useRef<HTMLPreElement>(null);
  const counterRef2 = useRef<HTMLSpanElement>(null);
  const frameRef2 = useRef(0);
  const directionRef2 = useRef(1);
  const lastUpdateRef2 = useRef(0);
  const comparisonEnabledRef = useRef(comparisonEnabled);

  // Keep refs in sync
  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { frameRateRef.current = frameRate; }, [frameRate]);
  useEffect(() => { directionModeRef.current = direction; }, [direction]);
  useEffect(() => { corruptionEnabledRef.current = corruptionEnabled; }, [corruptionEnabled]);
  useEffect(() => { corruptionIntensityRef.current = corruptionIntensity; }, [corruptionIntensity]);
  useEffect(() => { comparisonEnabledRef.current = comparisonEnabled; }, [comparisonEnabled]);

  const frames = useMemo(() => animations[selectedAnim] || [], [selectedAnim]);
  const framesRef = useRef(frames);
  useEffect(() => { framesRef.current = frames; }, [frames]);

  const compFrames = useMemo(() => animations[comparisonAnim] || [], [comparisonAnim]);
  const compFramesRef = useRef(compFrames);
  useEffect(() => { compFramesRef.current = compFrames; }, [compFrames]);

  // Reset frame on animation change
  useEffect(() => {
    frameRef.current = 0;
    directionRef.current = 1;
    lastUpdateRef.current = 0;
  }, [selectedAnim]);

  useEffect(() => {
    frameRef2.current = 0;
    directionRef2.current = 1;
    lastUpdateRef2.current = 0;
  }, [comparisonAnim]);

  // Scale a <pre> to fit inside its container
  const scaleToFit = useCallback((pre: HTMLPreElement, container: HTMLDivElement) => {
    // Reset transform so we measure natural size
    pre.style.transform = '';
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const pw = pre.scrollWidth;
    const ph = pre.scrollHeight;
    if (pw === 0 || ph === 0) return;
    const scale = Math.min(cw / pw, ch / ph, 1);
    pre.style.transform = `scale(${scale})`;
  }, []);

  // Render a frame to a pre element
  const renderFrame = useCallback((
    pre: HTMLPreElement | null,
    container: HTMLDivElement | null,
    currentFrames: string[],
    frameIndex: number,
  ) => {
    if (!pre || !currentFrames.length) return;
    let frame = currentFrames[frameIndex];
    if (corruptionEnabledRef.current) {
      frame = corruptFrame(frame, currentFrames, corruptionIntensityRef.current);
    }
    pre.textContent = frame;
    if (container) scaleToFit(pre, container);
  }, [scaleToFit]);

  // Advance frame index based on direction mode
  const advanceFrame = useCallback((
    currentFrame: number,
    dir: number,
    totalFrames: number,
    dirMode: PlaybackDirection,
  ): [number, number] => {
    if (totalFrames <= 1) return [0, dir];

    if (dirMode === 'forward') {
      const next = currentFrame + 1;
      return [next >= totalFrames ? 0 : next, 1];
    }
    if (dirMode === 'reverse') {
      const next = currentFrame - 1;
      return [next < 0 ? totalFrames - 1 : next, -1];
    }
    // pingpong
    const next = currentFrame + dir;
    if (next >= totalFrames - 1) return [totalFrames - 1, -1];
    if (next <= 0) return [0, 1];
    return [next, dir];
  }, []);

  // Animation loop
  useEffect(() => {
    const tick = (timestamp: number) => {
      const cf = framesRef.current;

      if (playingRef.current && cf.length > 0) {
        if (timestamp - lastUpdateRef.current >= frameRateRef.current) {
          lastUpdateRef.current = timestamp;
          const [nextFrame, nextDir] = advanceFrame(
            frameRef.current, directionRef.current, cf.length, directionModeRef.current,
          );
          frameRef.current = nextFrame;
          directionRef.current = nextDir;
          renderFrame(preRef.current, containerRef.current, cf, frameRef.current);
          if (counterRef.current) {
            counterRef.current.textContent = `${frameRef.current + 1} / ${cf.length}`;
          }
        }
      }

      // Comparison animation
      if (comparisonEnabledRef.current) {
        const cf2 = compFramesRef.current;
        if (playingRef.current && cf2.length > 0) {
          if (timestamp - lastUpdateRef2.current >= frameRateRef.current) {
            lastUpdateRef2.current = timestamp;
            const [nextFrame2, nextDir2] = advanceFrame(
              frameRef2.current, directionRef2.current, cf2.length, directionModeRef.current,
            );
            frameRef2.current = nextFrame2;
            directionRef2.current = nextDir2;
            renderFrame(preRef2.current, containerRef2.current, cf2, frameRef2.current);
            if (counterRef2.current) {
              counterRef2.current.textContent = `${frameRef2.current + 1} / ${cf2.length}`;
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    // Show initial frame
    if (preRef.current && frames.length) {
      renderFrame(preRef.current, containerRef.current, frames, frameRef.current);
      if (counterRef.current) {
        counterRef.current.textContent = `${frameRef.current + 1} / ${frames.length}`;
      }
    }
    if (preRef2.current && compFrames.length && comparisonEnabled) {
      renderFrame(preRef2.current, containerRef2.current, compFrames, frameRef2.current);
      if (counterRef2.current) {
        counterRef2.current.textContent = `${frameRef2.current + 1} / ${compFrames.length}`;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [frames, compFrames, comparisonEnabled, renderFrame, advanceFrame]);

  // Manual step
  const step = (delta: number) => {
    if (playing) setPlaying(false);
    const total = frames.length;
    if (!total) return;
    let next = frameRef.current + delta;
    if (next >= total) next = 0;
    if (next < 0) next = total - 1;
    frameRef.current = next;
    renderFrame(preRef.current, containerRef.current, frames, next);
    if (counterRef.current) {
      counterRef.current.textContent = `${next + 1} / ${total}`;
    }
  };

  const resetFrame = () => {
    frameRef.current = 0;
    directionRef.current = 1;
    renderFrame(preRef.current, containerRef.current, frames, 0);
    if (counterRef.current) {
      counterRef.current.textContent = `1 / ${frames.length}`;
    }
  };

  // Tension browser
  const handleTensionSelect = (tension: TensionState) => {
    setSelectedTension(tension);
    const pool = tensionAnimations[tension];
    if (pool.length > 0) {
      setSelectedAnim(pool[0]);
    }
    if (lockToTension) {
      setFrameRate(tensionFrameRate[tension]);
    }
  };

  // Update inspector frame when inspector is opened or animation changes
  useEffect(() => {
    if (inspectorOpen) {
      setInspectorFrame(frames[frameRef.current] || frames[0] || '');
    }
  }, [inspectorOpen, frames]);

  const handleInspectorToggle = () => {
    if (!inspectorOpen) {
      setInspectorFrame(frames[frameRef.current] || frames[0] || '');
    }
    setInspectorOpen(!inspectorOpen);
  };

  // Frame inspector data
  const frameLines = inspectorFrame.split('\n');
  const frameDimensions = frameLines.length > 0 && inspectorFrame
    ? `${frameLines.length} rows × ${Math.max(...frameLines.map(l => l.length))} cols`
    : '0 rows × 0 cols';
  const uniqueChars = [...new Set(inspectorFrame.replace(/\n/g, ''))].sort().join('');
  const nonSpaceCount = inspectorFrame.replace(/[\s\n]/g, '').length;

  const tensionCssClass = showTensionCss && selectedTension
    ? `tension-${selectedTension.toLowerCase()}`
    : '';

  return (
    <div className="dev-page dev-page--flex">
      {/* Header */}
      <div className="dev-header" style={{ padding: '16px 24px 0' }}>
        <h1 style={{ margin: '0 0 4px' }}>
          ANIMATION DEV PAGE
        </h1>
        <p className="dev-subtitle">
          Preview, step through, and inspect all {animationNames.length} animations.
        </p>
      </div>

      {/* Two-column layout: controls left, preview right */}
      <div className="dev-columns" style={{ gap: '24px', padding: '16px 24px' }}>
        {/* Left column: Controls (scrollable) */}
        <div style={{ width: '480px', flexShrink: 0, overflowY: 'auto', paddingRight: '8px' }}>
          {/* Animation Selector */}
          <section className="dev-section">
            <h2>ANIMATION</h2>
            <div className="dev-flex" style={{ gap: '12px', alignItems: 'center' }}>
              <select
                value={selectedAnim}
                onChange={(e) => setSelectedAnim(e.target.value)}
                className="dev-select"
              >
                {animationNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <span className="dev-hint" style={{ fontSize: '16px' }}>
                {getAnimationCategory(selectedAnim)} | {frames.length} frames
              </span>
            </div>
          </section>

          {/* Playback Controls */}
          <section className="dev-section">
            <h2>PLAYBACK</h2>
            <div className="dev-flex" style={{ alignItems: 'center', marginBottom: '8px' }}>
              <button
                onClick={() => setPlaying(!playing)}
                className={`dev-btn dev-btn--sm ${playing ? 'dev-btn--danger' : ''}`}
              >
                {playing ? 'PAUSE' : 'PLAY'}
              </button>
              <button onClick={() => step(-1)} className="dev-btn dev-btn--sm">&lt; STEP</button>
              <button onClick={() => step(1)} className="dev-btn dev-btn--sm">STEP &gt;</button>
              <button onClick={resetFrame} className="dev-btn dev-btn--sm">RESET</button>
              <span style={{ fontSize: '16px', marginLeft: '8px' }}>
                Frame: <span ref={counterRef} />
              </span>
            </div>
            <div className="dev-flex" style={{ alignItems: 'center', marginBottom: '8px' }}>
              {(['forward', 'reverse', 'pingpong'] as PlaybackDirection[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDirection(d)}
                  className={`dev-btn dev-btn--sm ${direction === d ? 'dev-btn--active' : 'dev-btn--dim'}`}
                >
                  {d === 'pingpong' ? 'P-PONG' : d.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="dev-flex" style={{ alignItems: 'center' }}>
              <span style={{ fontSize: '14px' }}>Rate:</span>
              <input
                type="range"
                min={10}
                max={200}
                value={frameRate}
                onChange={(e) => setFrameRate(Number(e.target.value))}
                style={{ width: '120px', accentColor: '#33ff33' }}
              />
              <span className="dev-hint">
                {frameRate}ms ({Math.round(1000 / frameRate)} FPS)
              </span>
              <label className="dev-label">
                <input
                  type="checkbox"
                  checked={lockToTension}
                  onChange={(e) => setLockToTension(e.target.checked)}
                  style={{ accentColor: '#33ff33' }}
                />
                Lock
              </label>
            </div>
          </section>

          {/* Tension Browser */}
          <section className="dev-section">
            <h2>TENSION BROWSER</h2>
            <div className="dev-flex" style={{ marginBottom: '8px' }}>
              {TENSION_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => handleTensionSelect(level)}
                  className={`dev-btn dev-btn--sm ${selectedTension === level ? 'dev-btn--active' : 'dev-btn--dim'}`}
                >
                  {selectedTension === level ? `> ${level} <` : level}
                </button>
              ))}
            </div>
            {selectedTension && (
              <div>
                <p className="dev-hint" style={{ marginBottom: '6px' }}>
                  Pool: {tensionAnimations[selectedTension].join(', ')} |
                  {' '}{tensionFrameRate[selectedTension]}ms ({Math.round(1000 / tensionFrameRate[selectedTension])} FPS)
                </p>
                <div className="dev-flex" style={{ gap: '6px' }}>
                  {tensionAnimations[selectedTension].map((name) => (
                    <button
                      key={name}
                      onClick={() => setSelectedAnim(name)}
                      className={`dev-btn dev-btn--sm ${selectedAnim === name ? 'dev-btn--active' : 'dev-btn--dim'}`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Corruption Controls */}
          <section className="dev-section">
            <h2>CORRUPTION</h2>
            <div className="dev-flex" style={{ gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => setCorruptionEnabled(!corruptionEnabled)}
                className={`dev-btn dev-btn--sm ${corruptionEnabled ? 'dev-btn--danger dev-btn--active' : ''}`}
              >
                {corruptionEnabled ? 'ON' : 'OFF'}
              </button>
              {corruptionEnabled && (
                <>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(corruptionIntensity * 100)}
                    onChange={(e) => setCorruptionIntensity(Number(e.target.value) / 100)}
                    style={{ width: '120px', accentColor: '#ff3333' }}
                  />
                  <span className="dev-hint">
                    {Math.round(corruptionIntensity * 100)}%
                  </span>
                  <span className="dev-hint" style={{ fontSize: '12px' }}>
                    (Sub: {Math.round((3 + 5 * corruptionIntensity) * 100) / 100}% | Overlay: 30% | Tear: 15%)
                  </span>
                </>
              )}
            </div>
          </section>

          {/* Visual Tools */}
          <section className="dev-section">
            <h2>VISUAL TOOLS</h2>
            <div className="dev-flex" style={{ gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => setShowTensionCss(!showTensionCss)}
                className={`dev-btn dev-btn--sm ${showTensionCss ? 'dev-btn--active' : 'dev-btn--dim'}`}
              >
                {showTensionCss ? 'TENSION CSS ON' : 'TENSION CSS OFF'}
              </button>
              {showTensionCss && !selectedTension && (
                <span className="dev-hint" style={{ fontSize: '12px' }}>
                  Select a tension level to preview
                </span>
              )}
              <button
                onClick={() => setComparisonEnabled(!comparisonEnabled)}
                className={`dev-btn dev-btn--sm ${comparisonEnabled ? 'dev-btn--active' : 'dev-btn--dim'}`}
              >
                {comparisonEnabled ? 'COMPARISON ON' : 'COMPARISON OFF'}
              </button>
              {comparisonEnabled && (
                <select
                  value={comparisonAnim}
                  onChange={(e) => setComparisonAnim(e.target.value)}
                  className="dev-select"
                  style={{ fontSize: '16px', padding: '4px 8px' }}
                >
                  {animationNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              )}
            </div>
          </section>

          {/* Frame Inspector */}
          <section className="dev-section">
            <h2
              style={{ cursor: 'pointer' }}
              onClick={handleInspectorToggle}
            >
              {inspectorOpen ? '▼' : '▶'} FRAME INSPECTOR
            </h2>
            {inspectorOpen && (
              <div style={{ border: '1px solid #1a991a', padding: '12px', background: '#050505' }}>
                <div className="dev-flex" style={{ gap: '16px', marginBottom: '12px' }}>
                  <div>
                    <span className="dev-hint" style={{ fontSize: '12px' }}>Dimensions: </span>
                    <span style={{ fontSize: '14px' }}>{frameDimensions}</span>
                  </div>
                  <div>
                    <span className="dev-hint" style={{ fontSize: '12px' }}>Unique chars: </span>
                    <span style={{ fontSize: '14px' }}>{uniqueChars}</span>
                  </div>
                  <div>
                    <span className="dev-hint" style={{ fontSize: '12px' }}>Non-space chars: </span>
                    <span style={{ fontSize: '14px' }}>{nonSpaceCount}</span>
                  </div>
                </div>
                <p className="dev-hint" style={{ fontSize: '12px', marginBottom: '6px' }}>Raw frame (with line numbers):</p>
                <pre style={{
                  margin: 0,
                  fontSize: '10px',
                  lineHeight: 1.3,
                  color: '#1a991a',
                  whiteSpace: 'pre',
                  fontFamily: "'VT323', monospace",
                  maxHeight: '200px',
                  overflow: 'auto',
                }}>
                  {frameLines.map((line, i) => `${String(i + 1).padStart(3, ' ')} | ${line}`).join('\n')}
                </pre>
              </div>
            )}
          </section>
        </div>

        {/* Right column: Preview (fills remaining space, scales to fit) */}
        <div style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: comparisonEnabled ? 'row' : 'column',
          gap: comparisonEnabled ? '12px' : '0',
        }}>
          {/* Primary preview */}
          <div style={{
            flex: comparisonEnabled ? 1 : undefined,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            minWidth: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '4px', flexShrink: 0 }}>
              <span style={{ fontSize: '18px' }}>{selectedAnim}</span>
              <span className="dev-hint">
                {getAnimationCategory(selectedAnim)}
              </span>
            </div>
            <div
              ref={containerRef}
              className={`dev-preview ${tensionCssClass}`}
            >
              <pre
                ref={preRef}
                className="ascii-animation"
                style={{
                  margin: 0,
                  transformOrigin: 'center center',
                }}
              />
            </div>
          </div>

          {/* Comparison preview */}
          {comparisonEnabled && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              minWidth: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '4px', flexShrink: 0 }}>
                <span style={{ fontSize: '18px' }}>{comparisonAnim}</span>
                <span ref={counterRef2} style={{ fontSize: '14px' }} />
              </div>
              <div
                ref={containerRef2}
                className={`dev-preview ${tensionCssClass}`}
              >
                <pre
                  ref={preRef2}
                  className="ascii-animation"
                  style={{
                    margin: 0,
                    transformOrigin: 'center center',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
