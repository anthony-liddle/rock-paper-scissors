import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { SoundDevPage } from '@pages/dev/SoundDevPage'
import { ResetDevPage } from '@pages/dev/ResetDevPage'
import { AnimationDevPage } from '@pages/dev/AnimationDevPage'

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

const path = window.location.pathname;

function Router() {
  switch (path) {
    case '/dev/sound':
      return <SoundDevPage />;
    case '/dev/reset':
    case '/dev/storage':
      return <ResetDevPage />;
    case '/dev/animation':
      return <AnimationDevPage />;
    default: return <App />;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
