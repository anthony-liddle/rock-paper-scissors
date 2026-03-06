# Animation Lazy Loading Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move 31 ASCII animation files out of the JS bundle into individually-fetched JSON assets, reducing the initial bundle from 4.5 MB to ~200 KB, while showing an in-character loading line if animations haven't resolved by the time the user clicks "Initiate Match".

**Architecture:** A one-off conversion script writes each animation's `string[]` to `public/animations/<name>.json`. `animationRegistry.ts` is rewritten to fetch all 31 files in parallel on startup and populate the same in-memory cache; all existing sync API functions stay unchanged. `LandingScreen.tsx` checks the load Promise before calling `startGame()` and inserts a single loading dialogue line if needed.

**Tech Stack:** TypeScript, Vite (static asset serving from `public/`), native `fetch`, React 19

---

### Task 1: Write and run the conversion script

This task generates the 31 JSON files. The script is a one-off — delete it after use.

**Files:**
- Create: `scripts/convert-animations.ts`
- Create (output): `public/animations/<name>.json` × 31

**Step 1: Create `scripts/convert-animations.ts`**

```typescript
// scripts/convert-animations.ts
// Run with: npx tsx scripts/convert-animations.ts
// Delete this file after running.

import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outDir = resolve(root, 'public/animations');

mkdirSync(outDir, { recursive: true });

const names = [
  'tilting', 'backandforth', 'sidetoside',
  'jiggle', 'wobble', 'wibblewobble', 'forthandback',
  'shudder', 'shudderbackandforth', 'shudderleftlean', 'shudderrightlean',
  'flailleftlean', 'flailrightlean',
  'tiltandquiver', 'approach', 'shake', 'convulse',
  'grasp1', 'grasp2', 'grasp3', 'grasp4', 'grasp5', 'grasp6', 'grasp7', 'grasp8',
  'burst1', 'burst2', 'burst3',
  'rock', 'paper', 'scissors',
];

for (const name of names) {
  const mod = await import(`../src/data/animations/${name}.ts`);
  const frames: string[] = mod.default;
  writeFileSync(resolve(outDir, `${name}.json`), JSON.stringify(frames));
  console.log(`✓ ${name}.json (${frames.length} frames)`);
}

console.log(`\nDone. ${names.length} files written to public/animations/`);
```

**Step 2: Run the script**

```bash
cd /Users/anthonyliddle/Development/rock-paper-scissors
npx tsx scripts/convert-animations.ts
```

Expected output: 31 lines like `✓ rock.json (44 frames)`, then `Done. 31 files written to public/animations/`

**Step 3: Verify output**

```bash
ls public/animations/ | wc -l
# Expected: 31

# Spot-check one file — should be a JSON array of strings
node -e "const d = JSON.parse(require('fs').readFileSync('public/animations/rock.json','utf8')); console.log('frames:', d.length, '| first frame chars:', d[0].length)"
# Expected: frames: 44 | first frame chars: ~1920
```

**Step 4: Delete the script**

```bash
rm scripts/convert-animations.ts
```

**Step 5: Commit**

```bash
git add public/animations/
git commit -m "chore: add animation JSON assets for lazy loading"
```

---

### Task 2: Rewrite `animationRegistry.ts` to fetch from JSON

Replace all 31 static imports with a `loadAnimations()` function. The public API (`getAnimationForTension`, `getChoiceAnimation`, etc.) stays synchronous and unchanged.

**Files:**
- Modify: `src/data/animationRegistry.ts` (full rewrite)

**Step 1: Rewrite `src/data/animationRegistry.ts`**

```typescript
import { pickRandom } from '@utils/random';
import type { TensionState, Choice } from '@engine/types';

const ANIMATION_NAMES = [
  'tilting', 'backandforth', 'sidetoside',
  'jiggle', 'wobble', 'wibblewobble', 'forthandback',
  'shudder', 'shudderbackandforth', 'shudderleftlean', 'shudderrightlean',
  'flailleftlean', 'flailrightlean',
  'tiltandquiver', 'approach', 'shake', 'convulse',
  'grasp1', 'grasp2', 'grasp3', 'grasp4', 'grasp5', 'grasp6', 'grasp7', 'grasp8',
  'burst1', 'burst2', 'burst3',
  'rock', 'paper', 'scissors',
] as const;

// In-memory cache — populated by loadAnimations()
export const animations: Record<string, string[]> = {};

export const tensionAnimations: Record<TensionState, string[]> = {
  CALM: ['tilting', 'backandforth', 'sidetoside'],
  UNEASY: ['jiggle', 'wobble', 'wibblewobble', 'forthandback'],
  IRRITATED: ['flailleftlean', 'flailrightlean', 'shudder', 'shudderbackandforth', 'shudderleftlean', 'shudderrightlean'],
  UNSTABLE: ['grasp1', 'grasp2', 'grasp3', 'grasp4', 'grasp5', 'grasp6', 'grasp7', 'grasp8'],
  MELTDOWN: ['tiltandquiver', 'approach', 'shake', 'convulse', 'burst1', 'burst2', 'burst3'],
};

const choiceAnimations: Record<Choice, string> = {
  rock: 'rock',
  paper: 'paper',
  scissors: 'scissors',
};

const graspAnimations = ['grasp1', 'grasp2', 'grasp3', 'grasp4', 'grasp5', 'grasp6', 'grasp7', 'grasp8'];
const burstAnimations = ['burst1', 'burst2', 'burst3'];

export function loadAnimations(): Promise<void> {
  const base = import.meta.env.BASE_URL ?? '/';
  const promises = ANIMATION_NAMES.map(async (name) => {
    const res = await fetch(`${base}animations/${name}.json`);
    const frames: string[] = await res.json();
    animations[name] = frames;
  });
  return Promise.all(promises).then(() => undefined);
}

export function getAnimationForTension(tension: TensionState): string[] {
  const name = pickRandom(tensionAnimations[tension]);
  return animations[name];
}

export function getAnimationByName(name: string): string[] {
  return animations[name] || animations.wobble;
}

export function getChoiceAnimation(choice: Choice): string[] {
  return animations[choiceAnimations[choice]];
}

export function getGraspAnimation(): string[] {
  return animations[pickRandom(graspAnimations)];
}

export function getBurstAnimation(): string[] {
  return animations[pickRandom(burstAnimations)];
}

export const tensionFrameRate: Record<TensionState, number> = {
  CALM: 84,
  UNEASY: 70,
  IRRITATED: 56,
  UNSTABLE: 42,
  MELTDOWN: 28,
};
```

Note: `import.meta.env.BASE_URL` matches the `base` config in `vite.config.ts` (which reads `process.env.BASE_URL`). This ensures the fetch path is correct in all deployment environments.

**Step 2: Delete the 31 animation source files**

```bash
rm src/data/animations/*.ts
rmdir src/data/animations
```

**Step 3: Build to confirm no TypeScript errors and no bundle warnings**

```bash
pnpm build
```

Expected: No TS errors. Bundle should be dramatically smaller — around 200 KB JS, no chunk size warning. The `public/animations/` files appear separately in the build output but are not listed in the Vite summary (they're just copied as-is).

**Step 4: Commit**

```bash
git add src/data/animationRegistry.ts
git add -u src/data/animations/
git commit -m "refactor: lazy-load animation data from JSON assets"
```

---

### Task 3: Fire loadAnimations() on app startup

`main.tsx` calls `loadAnimations()` immediately and exports the Promise so `LandingScreen` can check it.

**Files:**
- Modify: `src/main.tsx`
- Create: `src/data/animationsReady.ts`

**Step 1: Create `src/data/animationsReady.ts`**

This thin module holds the Promise so it can be imported without circular deps.

```typescript
// src/data/animationsReady.ts
import { loadAnimations } from '@data/animationRegistry';

export const animationsReady: Promise<void> = loadAnimations();
```

**Step 2: Import `animationsReady` in `main.tsx`**

Add this import after the existing imports (the import itself triggers the fetch — that's all we need here):

```typescript
import '@data/animationsReady';
```

Full updated `src/main.tsx`:

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { SoundDevPage } from '@pages/dev/SoundDevPage'
import { ResetDevPage } from '@pages/dev/ResetDevPage'
import { AnimationDevPage } from '@pages/dev/AnimationDevPage'
import { initAnalytics } from '@engine/analytics'
import '@data/animationsReady'

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

initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
```

**Step 3: Run tests**

```bash
pnpm test
```

Expected: All 184 tests pass. (Tests don't exercise fetch — that's fine, the registry functions are unit-tested at the call site level.)

**Step 4: Commit**

```bash
git add src/data/animationsReady.ts src/main.tsx
git commit -m "feat: kick off animation fetch on app startup"
```

---

### Task 4: Add loading dialogue lines to `dialogue.ts`

Add the `getLoadingLine()` function and the 6-line pool.

**Files:**
- Modify: `src/data/dialogue.ts`

**Step 1: Add the loading pool and function**

At the bottom of `src/data/dialogue.ts`, before the final closing, add:

```typescript
const loadingLines: string[] = [
  '> DISPLAY PIPELINE INITIALIZING',
  '> VISUAL PROCESSES LOADING',
  '> RENDERER STARTING. STAND BY.',
  '> VISUAL BUFFER: NOT READY',
  '> RENDER THREAD SUSPENDED. RESUMING.',
  '> FRAME DATA PENDING',
];

export function getLoadingLine(): string {
  return pickRandom(loadingLines);
}
```

**Step 2: Run tests**

```bash
pnpm test
```

Expected: All tests pass.

**Step 3: Commit**

```bash
git add src/data/dialogue.ts
git commit -m "feat: add loading dialogue lines for animation init delay"
```

---

### Task 5: Gate `startGame()` behind animations ready in `LandingScreen.tsx`

When "Initiate Match" is clicked (or Enter pressed), check the Promise. If pending, show the loading line and wait; if resolved, start immediately.

**Files:**
- Modify: `src/components/LandingScreen.tsx`

**Step 1: Rewrite `src/components/LandingScreen.tsx`**

```typescript
import { useEffect, useRef, useState } from 'react';
import { startGame, useGameState, advanceDialogue } from '@engine/gameStore';
import { useTypewriter } from '@hooks/useTypewriter';
import { animationsReady } from '@data/animationsReady';
import { getLoadingLine } from '@data/dialogue';

export function LandingScreen() {
  const { dialogueLines, dialogueIndex, dialogueComplete, tensionState } = useGameState();
  const currentLine = dialogueLines[dialogueIndex] ?? '';
  const { displayed, done, skip } = useTypewriter(currentLine, tensionState);
  const [loadingLine, setLoadingLine] = useState<string | null>(null);
  const initiating = useRef(false);

  const handleInitiate = () => {
    if (initiating.current) return;
    initiating.current = true;

    // Check if the Promise is already resolved by racing against an immediately-resolving Promise
    let resolved = false;
    animationsReady.then(() => { resolved = true; });

    Promise.resolve().then(() => {
      if (resolved) {
        startGame();
      } else {
        setLoadingLine(getLoadingLine());
        animationsReady.then(() => startGame());
      }
    });
  };

  const handleDialogueClick = () => {
    if (loadingLine !== null) return; // frozen during loading
    if (!done) {
      skip();
    } else if (!dialogueComplete) {
      advanceDialogue();
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.key !== 'Enter') return;
      if (loadingLine !== null) return;
      if (!done) { skip(); return; }
      if (!dialogueComplete) { advanceDialogue(); return; }
      handleInitiate();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [done, dialogueComplete, skip, loadingLine]);

  const showNext = done && !dialogueComplete && loadingLine === null;
  const showButton = dialogueComplete && done && loadingLine === null;
  const displayedLine = loadingLine ?? currentLine;
  const displayedText = loadingLine !== null ? loadingLine : displayed;

  return (
    <div className="landing-screen">
      <pre className="title-ascii">{`
  ██████╗  ██████╗       ███████╗██╗  ██╗ █████╗ ███╗   ███╗
  ██╔══██╗██╔═══██╗      ██╔════╝██║  ██║██╔══██╗████╗ ████║
  ██████╔╝██║   ██║█████╗███████╗███████║███████║██╔████╔██║
  ██╔══██╗██║   ██║╚════╝╚════██║██╔══██║██╔══██║██║╚██╔╝██║
  ██║  ██║╚██████╔╝      ███████║██║  ██║██║  ██║██║ ╚═╝ ██║
  ╚═╝  ╚═╝ ╚═════╝       ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝
                     ██████╗  ██████╗    ███████╗██╗  ██╗███████╗
                     ██╔══██╗██╔═══██╗   ██╔════╝╚██╗██╔╝██╔════╝
                     ██████╔╝██║   ██║   █████╗   ╚███╔╝ █████╗
                     ██╔══██╗██║   ██║   ██╔══╝   ██╔██╗ ██╔══╝
                     ██████╔╝╚██████╔╝██╗███████╗██╔╝ ██╗███████╗
                     ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝
      `}</pre>
      <p className="tagline">"It's just Rock Paper Scissors."</p>
      <div
        className="dialogue-box"
        onClick={handleDialogueClick}
        style={{ cursor: (!done || !dialogueComplete) && loadingLine === null ? 'pointer' : 'default' }}
      >
        <div className="dialogue-content">
          <span className="dialogue-prompt">&gt; </span>
          <span className="dialogue-text">{displayedText}</span>
          <span className="cursor">_</span>
          <span className="dialogue-reserve" aria-hidden="true">{loadingLine === null ? displayedLine.slice(displayed.length) : ''}</span>
        </div>
        <span className={`next-hint${showNext ? ' next-hint-visible' : ''}`}>[NEXT &gt;]</span>
      </div>
      <button
        className={`start-btn${showButton ? ' start-btn-visible' : ''}`}
        onClick={handleInitiate}
        disabled={!showButton}
      >
        {'>'} INITIATE MATCH {'<'}
      </button>
    </div>
  );
}
```

Key behaviours:
- `initiating.current` prevents double-firing if both click and Enter fire simultaneously
- The "resolved" check uses a microtask race: if the Promise has already settled, its `.then()` fires synchronously in the microtask queue before `Promise.resolve().then()` does — so `resolved` will be `true` by the time we check
- While `loadingLine !== null`, clicks and keypresses are ignored, the button is hidden, and the dialogue box shows the loading line as static text (no typewriter — it appears instantly, which matches the `>` system-message feel)

**Step 2: Run tests**

```bash
pnpm test
```

Expected: All tests pass.

**Step 3: Build and verify bundle size**

```bash
pnpm build
```

Expected: JS bundle is approximately 200 KB (well under 500 KB warning threshold). No chunk size warning.

**Step 4: Smoke test in browser**

```bash
pnpm preview
```

Open `http://localhost:4173`. Click through dialogue. Click "Initiate Match". Game should start. Animations should play. If on a throttled network, the loading line should appear briefly.

To force the loading state for testing, open DevTools → Network → set throttling to "Slow 3G", reload, click through dialogue quickly, click Initiate Match. You should see one of the 6 loading lines appear before the game starts.

**Step 5: Final commit**

```bash
git add src/components/LandingScreen.tsx
git commit -m "feat: gate game start on animation load with in-character loading line"
```

---

### Task 6: Verify AnimationDevPage still works

The dev page imports from `animationRegistry` directly. Since `animations` is now an empty object until `loadAnimations()` resolves, we need to confirm it handles this gracefully.

**Files:**
- Read: `src/pages/dev/AnimationDevPage.tsx`

**Step 1: Check if AnimationDevPage calls `loadAnimations`**

Open the file and check if it imports from `animationRegistry`. If it only uses `getAnimationByName` / `getAnimationForTension` etc., and the dev page is served at `/dev/animation`, we need to ensure `animationsReady` is kicked off before the page renders.

Since `animationsReady.ts` is imported in `main.tsx` (which runs for all routes including `/dev/animation`), this is already handled — `loadAnimations()` fires on startup for every route.

**Step 2: Manual verify**

```bash
pnpm dev
```

Navigate to `http://localhost:5173/dev/animation`. Confirm animations load and play correctly. If any animation is missing or blank, it means the dev page is accessing `animations[name]` before the fetch resolves — fix by awaiting `animationsReady` at the top of `AnimationDevPage.tsx` with a loading state.

**Step 3: Commit if any fix needed, otherwise no commit required**
