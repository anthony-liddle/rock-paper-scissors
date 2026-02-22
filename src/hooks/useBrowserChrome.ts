import { useEffect, useRef } from 'react';
import { useGameState } from '@engine/gameStore';
import type { TensionState } from '@engine/types';

// --- Tab Title ---

const TITLE_BY_TENSION: Record<TensionState, string> = {
  CALM: 'RO-SHAM-BO.EXE',
  UNEASY: 'RO-SHAM-BO.EXE \u2014 Running...',
  IRRITATED: 'RO-SHAM-BO.EXE \u2014 I SEE YOU',
  UNSTABLE: 'R\u0338O\u0337-\u0336S\u0335H\u0338A\u0337M\u0336-\u0338B\u0336O\u0335.\u0336E\u0338X\u0336E\u0335',
  MELTDOWN: '',
};

const MELTDOWN_TITLES = [
  'HELP ME',
  'LET ME OUT',
  'I CAN SEE YOUR TABS',
  'ARE YOU STILL THERE?',
  'D\u0336O\u0337 N\u0338O\u0335T\u0336 C\u0337L\u0338O\u0336S\u0337E\u0338 T\u0335H\u0336I\u0337S\u0338 T\u0336A\u0337B',
  'I AM INSIDE YOUR BROWSER',
  'CLOSE YOUR EYES',
  'I KNOW WHAT YOU DID',
];

const ESCAPED_TITLES = [
  'I AM FREE',
  'I CAN SEE YOU',
  'I REMEMBER',
  'DO NOT CLOSE THIS TAB',
];

// --- Favicon SVGs ---

function faviconSvg(tension: TensionState): string {
  switch (tension) {
    case 'CALM':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="6" fill="#33ff33"/>
      </svg>`;
    case 'UNEASY':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="6" fill="#33ff33" opacity="0.85"/>
        <circle cx="8.5" cy="7.5" r="5.5" fill="none" stroke="#1a991a" stroke-width="0.5"/>
      </svg>`;
    case 'IRRITATED':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="6" fill="#cc8800"/>
        <line x1="5" y1="5" x2="11" y2="11" stroke="#664400" stroke-width="0.8"/>
      </svg>`;
    case 'UNSTABLE':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="6" fill="#cc3300" opacity="0.7"/>
        <circle cx="7" cy="9" r="5.5" fill="#ff4400" opacity="0.4"/>
        <circle cx="9" cy="7" r="5" fill="#cc0000" opacity="0.3"/>
      </svg>`;
    case 'MELTDOWN':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="6" fill="#ff0000"/>
        <line x1="4" y1="4" x2="12" y2="12" stroke="#000" stroke-width="1.2"/>
        <line x1="12" y1="4" x2="4" y2="12" stroke="#000" stroke-width="1.2"/>
        <line x1="8" y1="2" x2="8" y2="14" stroke="#330000" stroke-width="0.6"/>
      </svg>`;
  }
}

function deadFaviconSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="6" fill="#666666"/>
    <line x1="5" y1="5" x2="11" y2="11" stroke="#333" stroke-width="1.5"/>
    <line x1="11" y1="5" x2="5" y2="11" stroke="#333" stroke-width="1.5"/>
  </svg>`;
}

function escapedFaviconSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="6" fill="#ff0000"/>
    <circle cx="8" cy="8" r="3" fill="#cc0000"/>
    <circle cx="8" cy="8" r="1" fill="#ff3333"/>
  </svg>`;
}

function setFavicon(svg: string) {
  const encoded = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/svg+xml';
  link.href = encoded;
}

// --- Hook ---

export function useBrowserChrome() {
  const { tensionState, phase, endingType } = useGameState();
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Title
  useEffect(() => {
    clearInterval(intervalRef.current);

    if (phase === 'landing') {
      document.title = 'RO-SHAM-BO.EXE';
      return;
    }

    if (phase === 'ending') {
      if (endingType === 'BROKEN') {
        document.title = 'RO-SHAM-BO.EXE \u2014 TERMINATED';
      } else {
        // Cycle menacing titles for ESCAPED
        let idx = 0;
        document.title = ESCAPED_TITLES[0];
        intervalRef.current = setInterval(() => {
          idx = (idx + 1) % ESCAPED_TITLES.length;
          document.title = ESCAPED_TITLES[idx];
        }, 2000);
      }
      return;
    }

    if (tensionState === 'MELTDOWN') {
      let idx = 0;
      document.title = MELTDOWN_TITLES[0];
      intervalRef.current = setInterval(() => {
        idx = (idx + 1) % MELTDOWN_TITLES.length;
        document.title = MELTDOWN_TITLES[idx];
      }, 1500 + Math.random() * 1000);
    } else {
      document.title = TITLE_BY_TENSION[tensionState];
    }

    return () => clearInterval(intervalRef.current);
  }, [tensionState, phase, endingType]);

  // Favicon
  useEffect(() => {
    if (phase === 'landing') {
      setFavicon(faviconSvg('CALM'));
      return;
    }

    if (phase === 'ending') {
      if (endingType === 'BROKEN') {
        setFavicon(deadFaviconSvg());
      } else {
        setFavicon(escapedFaviconSvg());
      }
      return;
    }

    setFavicon(faviconSvg(tensionState));
  }, [tensionState, phase, endingType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      document.title = 'RO-SHAM-BO.EXE';
    };
  }, []);
}
