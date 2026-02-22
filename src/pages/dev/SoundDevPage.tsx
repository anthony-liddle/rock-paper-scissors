import { useState, useEffect } from 'react';
import { musicManager } from '@engine/musicManager';
import type { TensionState } from '@engine/types';
import { TENSION_BPM, TENSION_LAYERS } from '@engine/musicManager';

import '@styles/dev-pages.css';

const TENSION_LEVELS: TensionState[] = ['CALM', 'UNEASY', 'IRRITATED', 'UNSTABLE', 'MELTDOWN'];
const SFX_TYPES = ['win', 'lose', 'tie', 'click', 'permission', 'disruption', 'ending-broken', 'ending-escaped'] as const;

export function SoundDevPage() {
  const [tension, setTension] = useState<TensionState>('CALM');
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    musicManager.initialize().then(() => setReady(true));
    return () => {
      musicManager.stop();
    };
  }, []);

  const handleStart = async () => {
    await musicManager.start();
    setPlaying(true);
  };

  const handleStop = () => {
    musicManager.stop();
    setPlaying(false);
  };

  const handleTensionChange = (newTension: TensionState) => {
    setTension(newTension);
    musicManager.setTension(newTension);
  };

  const handleSfx = (type: typeof SFX_TYPES[number]) => {
    musicManager.playSfx(type);
  };

  return (
    <div className="dev-page dev-page--flex">
      {/* Header */}
      <div className="dev-header" style={{ padding: '24px 40px 0' }}>
        <h1 style={{ fontSize: '32px' }}>
          SOUND DEV PAGE
        </h1>
        <p className="dev-subtitle" style={{ fontSize: '18px' }}>
          Test soundtrack layers and sound effects at each tension level.
        </p>
      </div>

      {!ready ? (
        <p style={{ padding: '40px' }}>Initializing audio engine...</p>
      ) : (
        <div className="dev-columns" style={{ gap: '40px', padding: '24px 40px' }}>
          {/* Left column: Controls */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Transport */}
            <section className="dev-section" style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>TRANSPORT</h2>
              <div className="dev-flex" style={{ gap: '12px' }}>
                <button
                  onClick={playing ? handleStop : handleStart}
                  className={`dev-btn ${playing ? 'dev-btn--danger' : ''}`}
                >
                  {playing ? '[ STOP ]' : '[ PLAY ]'}
                </button>
              </div>
            </section>

            {/* Tension Selector */}
            <section className="dev-section" style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>TENSION LEVEL</h2>
              <div className="dev-flex">
                {TENSION_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => handleTensionChange(level)}
                    className={`dev-btn ${tension === level ? 'dev-btn--active' : 'dev-btn--dim'}`}
                  >
                    {tension === level ? `> ${level} <` : level}
                  </button>
                ))}
              </div>
              <p className="dev-hint" style={{ fontSize: '16px', marginTop: '8px' }}>
                Active: {tension} | Layers change in real-time while music plays.
              </p>
            </section>

            {/* Sound Effects */}
            <section>
              <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>SOUND EFFECTS</h2>
              <p className="dev-hint" style={{ fontSize: '16px', marginBottom: '12px' }}>
                These play independently of the soundtrack. Click to preview.
              </p>
              <div className="dev-flex" style={{ gap: '12px' }}>
                {SFX_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleSfx(type)}
                    className="dev-btn"
                  >
                    [ {type.toUpperCase()} ]
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Right column: Layer Map */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <section>
              <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>LAYER MAP</h2>
              <table className="dev-table">
                <thead>
                  <tr>
                    <th>TENSION</th>
                    <th>BPM</th>
                    <th>ACTIVE LAYERS</th>
                  </tr>
                </thead>
                <tbody>
                  {TENSION_LEVELS.map((level) => {
                    const isActive = level === tension;
                    return (
                      <tr key={level} className={isActive ? 'active' : ''}>
                        <td>{isActive ? `> ${level}` : level}</td>
                        <td>{TENSION_BPM[level]}</td>
                        <td>{TENSION_LAYERS[level].join(', ')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
