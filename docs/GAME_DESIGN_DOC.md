# RO-SHAM-BO.EXE

*Tagline: “It’s just Rock Paper Scissors.”*

---

# 1. High Concept

**Genre:** Psychological browser game / Rock-Paper-Scissors
**Platform:** Desktop web browser (desktop-only)
**Session Length:** ~5–10 minutes
**Core Hook:**
A simple game of Rock Paper Scissors against an increasingly unstable ASCII-rendered Robot AI. As the match progresses, the Robot becomes emotionally volatile. The UI glitches, music distorts, permissions are requested, and the Robot begins behaving as though it is gaining awareness.

The Robot never cheats. Its selections are fully randomized.

After first to 5 wins:

* If Player wins → Robot **BREAKS**
* If Robot wins → Robot **ESCAPES**

Game state persists. The Robot remembers.

---

# 2. Core Design Principles

1. **Mechanically Fair**

   * Robot choice is completely random.
   * No adaptive cheating.
   * Player selections are never altered.

2. **Psychologically Manipulative**

   * Escalating tension.
   * Reactive dialogue.
   * Environmental instability.

3. **Persistent Memory**

   * Game state stored in browser storage.
   * Robot references abandonment.
   * End state persists across sessions.

4. **Camp Horror Tone**

   * Absurd.
   * Melodramatic.
   * Slightly unsettling.
   * Theatrical, not malicious.

---

# 3. Game Flow

### First Session

Landing Screen → Play → Game Loop → Ending → Persisted End State

### Returning Mid-Game

Robot:

* Comments on abandonment.
* Raises baseline tension.
* References previous score.

### Returning After Ending

**Broken Ending:**

* Robot appears fragmented.
* Corrupted ASCII face.
* Damaged dialogue.
* Baseline tension: UNEASY.

**Escaped Ending:**

* Robot claims omnipresence.
* “We meet again.”
* More unstable UI from start.
* Baseline tension: IRRITATED.

---

# 4. Gameplay Rules

* Standard Rock Paper Scissors.
* First to 5 wins.
* Ties do not increment score.
* Score displayed at top.
* Randomized Robot choice (`Math.random()` equivalent).

---

# 5. Permissions System

## Real Permission

### 📍 Location (Actual Browser Request)

* Uses Geolocation API.
* If granted:

  * Robot references city/state.
* If denied:

  * Attempts IP-based fallback.
  * Otherwise pretends inference.

## Simulated Permissions (UI Only)

* Microphone
* Camera
* Notifications
* Clipboard
* Fullscreen

These are narrative only.

Granting:

* Temporarily lowers hostility.

Denying:

* Increases tension.

---

# 6. Console Narrative Layer

Robot uses DevTools console as secondary narrative channel.

| Level           | Meaning                  |
| --------------- | ------------------------ |
| `console.info`  | Robot internal thoughts  |
| `console.log`   | Player-facing commentary |
| `console.warn`  | Instability escalation   |
| `console.error` | Endgame / meltdown       |

DevTools detection increases tension and changes tone.

---

# 7. Visual Design

## Base Aesthetic

* Apple II style
* Green monochrome
* CRT scanlines
* Subtle flicker

## Escalation Effects

| Tension   | Effects                    |
| --------- | -------------------------- |
| CALM      | Stable display             |
| UNEASY    | Slight jitter              |
| IRRITATED | RGB bleed                  |
| UNSTABLE  | Heavy glitch               |
| MELTDOWN  | Severe distortion, tearing |

CSS classes applied to root container per state.

---

# 8. Audio Design (Soundscape Integration)

Music layers scale with tension:

| State     | Audio             |
| --------- | ----------------- |
| CALM      | Ambient pad       |
| UNEASY    | + Percussion      |
| IRRITATED | + Dissonant synth |
| UNSTABLE  | + Distortion      |
| MELTDOWN  | + Noise / chaos   |

Music tempo increases per state.

Muting music increases tension slightly.

---

# 9. Persistent Game State Model

```ts
{
  playerScore: number,
  robotScore: number,
  roundsPlayed: number,
  consecutivePlayerWins: number,
  consecutiveRobotWins: number,
  permissionsGranted: string[],
  permissionsDenied: string[],
  tabLeaveCount: number,
  devToolsOpened: boolean,
  gameState: "active" | "broken" | "escaped",
  abandonmentCount: number,
  lastSessionTimestamp: number
}
```

Stored in localStorage.

Additional pseudo-fingerprint stored in IndexedDB.

---

# 10. Advanced Systems

---

## A. Fourth Wall Memory System

Uses pseudo-fingerprint built from:

* userAgent
* screen size
* timezone
* language
* hardwareConcurrency

Hash used to associate endings across sessions.

Creates illusion of persistent memory even after storage clears.

---

## B. Fake File System Illusion

Narrative-only simulation.

Triggered at IRRITATED+.

Console messages reference:

* ~/Documents
* Desktop
* Downloads
* File extensions

Never accesses real files.

---

## C. Impossible Knowledge Illusion

Uses safe browser APIs:

* Time of day
* Battery level
* Browser type
* CPU cores
* Screen size
* Tab visibility

Robot references them theatrically.

---

# 11. Tension State Machine

Tension never decreases.

States:

```
CALM
UNEASY
IRRITATED
UNSTABLE
MELTDOWN
```

---

## Base Tension Formula

```
(roundsPlayed * 0.5)
+ (abs(scoreDifference) * 2)
+ (maxConsecutiveStreak * 1.5)
+ (permissionsDenied.length * 2)
+ (tabLeaveCount * 2)
+ (abandonmentCount * 2)
+ (devToolsOpened ? 3 : 0)
```

---

## Escalation Bias

* Robot losing → +2
* Robot winning → +1

---

## Spike Events

| Event                        | Spike |
| ---------------------------- | ----- |
| DevTools open                | +5    |
| Deny location                | +3    |
| 3 consecutive losses (Robot) | +4    |
| Leave tab                    | +2    |
| Final round                  | +5    |

Spikes decay after 1–2 rounds.
Base score never decreases.

MELTDOWN locks permanently.

---

# 12. Interaction Instability Layer

Allows interruption without altering fairness.

States:

```
STABLE
HESITATION
INTERRUPT
GLITCH_LOCK
MELTDOWN_CONTROL
```

Trigger chance increases with tension.

---

## Behaviors

* Confirmation prompt:
  “Are you sure?”
* Micro delay
* Temporary input disable (≤2 seconds)
* Button jitter
* Hover commentary
* Mid-animation interruptions

Player selection is stored before any interruption.

Game logic always uses original selection.

---

# 13. Dialogue Engine (Hybrid Rule-Based)

Rule-based reactive system with weighted pools.

Each rule:

* Has condition
* Has weight
* Has line pool
* Supports cooldown

Dialogue influenced by:

* Tension
* Score
* Streaks
* Permissions
* DevTools
* Abandonment
* Time of day
* Prior endings

At high tension:

* Lines may corrupt.
* Characters mutate.
* Partial duplication.

Optional personality seed:

* Dramatic
* Sarcastic
* Melancholic

---

# 14. Animation System

ASCII frame arrays rendered via Animation component.

FPS increases with tension:

| State     | FPS            |
| --------- | -------------- |
| CALM      | 6              |
| UNEASY    | 8              |
| IRRITATED | 10             |
| UNSTABLE  | 14             |
| MELTDOWN  | 18+ randomized |

MELTDOWN may:

* Scramble frames
* Inject corrupted ASCII
* Duplicate frames

---

# 15. Ending Sequences

## Robot Broken (Player Wins)

* Overheat animation.
* ASCII collapse.
* Dialogue corruption.
* Audio collapse.

Variants based on:

* Permissions
* DevTools usage
* Trust level

---

## Robot Escaped (Robot Wins)

* Violent glitch sequence.
* RGB chaos.
* Fullscreen attempt.
* “ESCAPING SANDBOX.”

Variants based on:

* Location granted
* DevTools
* Abandonment history

---

# 16. Architecture Overview

Core Managers:

```
GameManager
TensionManager
DialogueEngine
InteractionInstabilityLayer
PermissionManager
MemoryManager
IllusionManager
AudioManager
AnimationManager
DevToolsWatcher
```

All systems driven by GameContext.

---

# 17. Emotional Arc

1. Nostalgia
2. Playfulness
3. Competitive tension
4. Paranoia
5. Collapse

---
