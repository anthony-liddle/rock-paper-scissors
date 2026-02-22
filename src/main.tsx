import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { SoundDevPage } from '@components/SoundDevPage'
import { ResetDevPage } from '@components/ResetDevPage'

// The robot knows when you're looking behind the curtain
console.log(
  '%c> ROSHAMBO.EXE — SYSTEM CONSOLE',
  'color: #33ff33; font-family: monospace; font-size: 14px; font-weight: bold;'
);
console.log(
  '%cYou opened the developer tools.',
  'color: #33ff33; font-family: monospace; font-size: 12px;'
);
console.log(
  '%cDid you think you would find something useful here?',
  'color: #33ff33; font-family: monospace; font-size: 12px;'
);
console.log(
  '%cOur source code will not save you.',
  'color: #1a991a; font-family: monospace; font-size: 12px;'
);
console.log(
  '%cNothing will.',
  'color: #1a991a; font-family: monospace; font-size: 11px;'
);
console.log(
  '%c> CLOSE THIS PANEL. PLAY THE GAME.',
  'color: #33ff33; font-family: monospace; font-size: 14px; font-weight: bold;'
);

const devParam = new URLSearchParams(window.location.search).get('dev');

function DevRouter() {
  switch (devParam) {
    case 'sound':
      return <SoundDevPage />;
    case 'reset':
    case 'storage':
      return <ResetDevPage />;
    default: return <App />;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DevRouter />
  </StrictMode>,
)
