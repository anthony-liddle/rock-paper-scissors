import { useState } from 'react';
import { loadPlayerMemory, clearPlayerMemory } from '@engine/playerMemory';

import '@styles/dev-pages.css';

export function ResetDevPage() {
  const [memory, setMemory] = useState(() => loadPlayerMemory());
  const [cleared, setCleared] = useState(false);

  const handleClear = () => {
    clearPlayerMemory();
    setMemory(loadPlayerMemory());
    setCleared(true);
  };

  return (
    <div className="dev-page dev-page--padded">
      <h1 style={{ marginBottom: '24px' }}>
        {'>'} MEMORY DEV PAGE
      </h1>
      <p className="dev-subtitle" style={{ marginBottom: '16px' }}>
        Stored player memory:
      </p>
      <pre className="dev-code">
        {JSON.stringify(memory, null, 2)}
      </pre>
      {!cleared ? (
        <button
          onClick={handleClear}
          className="dev-btn"
          style={{ fontSize: '22px', padding: '12px 32px' }}
        >
          [ CLEAR MEMORY ]
        </button>
      ) : (
        <p style={{ color: '#66ff66' }}>
          Memory cleared. Reload to start fresh.
        </p>
      )}
      <p className="dev-hint" style={{ marginTop: '32px' }}>
        Access this page at /dev/reset or /dev/storage
      </p>
    </div>
  );
}
