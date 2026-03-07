# Animation Lazy Loading Design

**Date:** 2026-03-06
**Problem:** All 31 ASCII animation files are statically imported into the JS bundle, contributing ~4.3 MB of inline string data. Total bundle is 4.5 MB (611 KB gzipped), triggering Vite's chunk size warning and causing slow initial load.
**Goal:** Move animation data out of the bundle entirely, loading it as static JSON assets in the background while the user reads the landing screen dialogue.

---

## Approach

Individual JSON files in `public/animations/`, fetched in parallel on app startup.

Animation data is genuinely static data, not code. Serving it as standalone assets means the JS bundle drops to ~200 KB, each file is independently CDN-cacheable, and the existing synchronous `animationRegistry.ts` API is preserved after an async init step.

---

## Design

### 1. Data Conversion

Each of the 31 `.ts` animation files exports a `string[]` of ASCII art frames. Convert each to a `.json` file at `public/animations/<name>.json` containing that array.

A one-off script (`scripts/convert-animations.ts`) reads each source file, extracts the exported array via dynamic import, and writes the JSON. After verification, the 31 `.ts` source files and the script are deleted.

Whitespace is fully preserved — `JSON.stringify` / `JSON.parse` round-trips all spaces, newlines, and internal whitespace within strings exactly.

### 2. Async Initialization (`animationRegistry.ts`)

Replace the 31 static imports with a `loadAnimations()` async function:

- Fetches all 31 JSON files in parallel via `Promise.all`
- Populates the existing `animations` Record (same shape as today)
- All existing sync API functions (`getAnimationForTension`, `getChoiceAnimation`, etc.) remain unchanged — they just read from the populated cache

Export the Promise returned by `loadAnimations()` so callers can check or await resolution.

### 3. App Startup (`main.tsx`)

Call `loadAnimations()` immediately on startup with no `await` — fire and forget. The fetch runs in the background while the user reads the landing screen dialogue. Store the returned Promise for use by the landing screen.

### 4. Loading Gate (`LandingScreen.tsx`)

When "Initiate Match" is clicked:

- **If the Promise has resolved:** call `startGame()` immediately. No change to user experience.
- **If the Promise is still pending:** display a randomly-selected loading line in the existing dialogue typewriter display, `await` the Promise, then call `startGame()`.

The loading line is a dead end — no "next" button, no advance. It resolves automatically when the fetch completes and the game begins.

### 5. Loading Dialogue Pool (`dialogue.ts`)

Add a `getLoadingLine()` function that picks from:

```
"> DISPLAY PIPELINE INITIALIZING"
"> VISUAL PROCESSES LOADING"
"> RENDERER STARTING. STAND BY."
"> VISUAL BUFFER: NOT READY"
"> RENDER THREAD SUSPENDED. RESUMING."
"> FRAME DATA PENDING"
```

Follows the same `pickRandom()` pattern used throughout the codebase. No branching by play history — this is a system message, not dialogue.

---

## What Does Not Change

- `animationRegistry.ts` public API (all functions stay synchronous after init)
- `AsciiAnimation.tsx` (reads from cache, unaware of how it was populated)
- All animation names, tension mappings, and frame rates
- The dialogue system structure

---

## Expected Outcome

| | Before | After |
|---|---|---|
| JS bundle | 4,733 KB (611 KB gzip) | ~200 KB |
| Animation data | Bundled inline | 31 × ~10 KB JSON files |
| First load experience | Instant animations, slow page load | Fast page load, animations ready by game start |
