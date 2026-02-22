import { useState, useEffect } from 'react';
import { musicManager } from '@engine/musicManager';
import type { TensionState } from '@engine/types';
import { TENSION_BPM, TENSION_LAYERS } from '@engine/musicManager';

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
    <div style={{
      background: '#0a0a0a',
      color: '#33ff33',
      fontFamily: "'VT323', monospace",
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '24px 40px 0', flexShrink: 0 }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
          SOUND DEV PAGE
        </h1>
        <p style={{ color: '#1a991a', fontSize: '18px', margin: 0 }}>
          Test soundtrack layers and sound effects at each tension level.
        </p>
      </div>

      {!ready ? (
        <p style={{ padding: '40px' }}>Initializing audio engine...</p>
      ) : (
        <div style={{ display: 'flex', flex: 1, minHeight: 0, gap: '40px', padding: '24px 40px' }}>
          {/* Left column: Controls */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Transport */}
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>TRANSPORT</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={playing ? handleStop : handleStart}
                  style={btnStyle(playing ? '#ff3333' : '#33ff33')}
                >
                  {playing ? '[ STOP ]' : '[ PLAY ]'}
                </button>
              </div>
            </section>

            {/* Tension Selector */}
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>TENSION LEVEL</h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {TENSION_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => handleTensionChange(level)}
                    style={btnStyle(tension === level ? '#33ff33' : '#1a991a', tension === level)}
                  >
                    {tension === level ? `> ${level} <` : level}
                  </button>
                ))}
              </div>
              <p style={{ color: '#1a991a', fontSize: '16px', marginTop: '8px' }}>
                Active: {tension} | Layers change in real-time while music plays.
              </p>
            </section>

            {/* Sound Effects */}
            <section>
              <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>SOUND EFFECTS</h2>
              <p style={{ color: '#1a991a', fontSize: '16px', marginBottom: '12px' }}>
                These play independently of the soundtrack. Click to preview.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {SFX_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleSfx(type)}
                    style={btnStyle('#33ff33')}
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
              <table style={{ borderCollapse: 'collapse', fontSize: '18px', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>TENSION</th>
                    <th style={thStyle}>BPM</th>
                    <th style={thStyle}>ACTIVE LAYERS</th>
                  </tr>
                </thead>
                <tbody>
                  {TENSION_LEVELS.map((level) => {
                    const isActive = level === tension;
                    return (
                      <tr key={level} style={{
                        background: isActive ? 'rgba(51,255,51,0.1)' : 'transparent',
                      }}>
                        <td style={tdStyle}>{isActive ? `> ${level}` : level}</td>
                        <td style={tdStyle}>{TENSION_BPM[level]}</td>
                        <td style={tdStyle}>{TENSION_LAYERS[level].join(', ')}</td>
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

function btnStyle(color: string, active = false): React.CSSProperties {
  return {
    background: active ? 'rgba(51,255,51,0.15)' : 'transparent',
    border: `1px solid ${color}`,
    color,
    fontFamily: "'VT323', monospace",
    fontSize: '20px',
    padding: '10px 24px',
    cursor: 'pointer',
    textShadow: active ? `0 0 8px ${color}` : 'none',
  };
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 16px',
  borderBottom: '1px solid #1a991a',
  color: '#1a991a',
};

const tdStyle: React.CSSProperties = {
  padding: '6px 16px',
  borderBottom: '1px solid rgba(26,153,26,0.3)',
};
