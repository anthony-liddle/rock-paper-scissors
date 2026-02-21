import { useState } from 'react';
import { loadPlayerMemory, clearPlayerMemory } from '@engine/playerMemory';

export function ResetDevPage() {
  const [memory, setMemory] = useState(() => loadPlayerMemory());
  const [cleared, setCleared] = useState(false);

  const handleClear = () => {
    clearPlayerMemory();
    setMemory(loadPlayerMemory());
    setCleared(true);
  };

  return (
    <div style={{
      background: '#0a0a0a',
      color: '#33ff33',
      fontFamily: "'VT323', monospace",
      fontSize: '18px',
      padding: '40px',
      minHeight: '100vh',
    }}>
      <h1 style={{ fontSize: '28px', marginBottom: '24px' }}>
        {'>'} MEMORY DEV PAGE
      </h1>
      <p style={{ color: '#1a991a', marginBottom: '16px' }}>
        Stored player memory:
      </p>
      <pre style={{
        background: '#0d1a0d',
        border: '1px solid #1a991a',
        padding: '16px',
        marginBottom: '24px',
        fontSize: '16px',
        lineHeight: '1.5',
      }}>
        {JSON.stringify(memory, null, 2)}
      </pre>
      {!cleared ? (
        <button
          onClick={handleClear}
          style={{
            background: 'transparent',
            border: '1px solid #33ff33',
            color: '#33ff33',
            fontFamily: "'VT323', monospace",
            fontSize: '22px',
            padding: '12px 32px',
            cursor: 'pointer',
          }}
        >
          [ CLEAR MEMORY ]
        </button>
      ) : (
        <p style={{ color: '#66ff66' }}>
          Memory cleared. Reload to start fresh.
        </p>
      )}
      <p style={{ color: '#1a991a', marginTop: '32px', fontSize: '14px' }}>
        Access this page at ?dev=reset || ?dev=storage
      </p>
    </div>
  );
}
