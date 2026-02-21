# RO-SHAM-BO.EXE

## Production Engineering Specification v1.0

Collaborative Engineering Edition

---

# 1. Core Vision

AGITATE.EXE is a desktop-only browser-based ASCII Rock Paper Scissors game against a Robot whose psychological stability deteriorates over time.

The game:

* Is mechanically fair (true random selection, no cheating).
* Escalates tension visually, audibly, and behaviorally.
* Requests real browser permissions (location).
* Simulates additional permissions within UI.
* Persists state across sessions.
* Ends permanently after 5 total wins or losses.
* Has branching endings (Broken vs Escaped) with modifiers based on permissions.

The player experience should feel:

* Absurd
* Camp
* Creepy
* Comedic
* Increasingly disturbing

Each session should feel semi-unique due to seeded personality variation and rule-based reactivity.

---

# 2. Core Invariants (Non-Negotiable)

These must never be violated:

1. The Robot never cheats.
2. Player selections are never modified or overridden.
3. Tension state never decreases.
4. MELTDOWN is irreversible.
5. End state is permanent across reloads.
6. RNG must be unbiased and cryptographically safe if possible.
7. Interruptions cannot change round outcome.
8. All randomness must be seeded per session for reproducibility.

---

# 3. Technical Architecture

## 3.1 Stack

* React (Vite or equivalent)
* Zustand for state
* Soundscape (client-side)
* CSS modules or Tailwind (TBD)
* Storage abstraction layer
* Feature flag system

---

# 4. High-Level System Architecture

```
App
 ├── GameEngine
 │     ├── RoundResolver
 │     ├── TensionEngine
 │     ├── DialogueEngine
 │     ├── InteractionDisruptor
 │     ├── IllusionEngine
 │     └── EndingEngine
 │
 ├── AudioEngine (Soundscape)
 ├── AnimationEngine (ASCII)
 ├── PersistenceAdapter
 ├── FeatureFlags
 └── ConsoleNarrator
```

Each subsystem must be independently testable.

---

# 5. Game State Model (Zustand)

## 5.1 Core Store Shape

```ts
{
  playerWins: number
  robotWins: number
  roundsPlayed: number

  tensionBase: number
  tensionSpike: number
  tensionState: TensionState

  personalitySeed: string
  abandonmentCount: number
  lastVisitTimestamp: number

  permissions: {
    location: 'granted' | 'denied' | 'unknown'
    simulatedMic: boolean
    simulatedCamera: boolean
  }

  ending: {
    achieved: boolean
    type: 'BROKEN' | 'ESCAPED' | null
    modifiers: string[]
  }

  ui: {
    interruptionActive: boolean
    screenGlitchLevel: number
  }

  featureFlags: {
    debugTension: boolean
    aggressiveMode: boolean
  }
}
```

---

# 6. Tension State Machine

## 6.1 Tension States

| State     | Threshold |
| --------- | --------- |
| CALM      | 0–19      |
| UNEASY    | 20–39     |
| IRRITATED | 40–59     |
| UNSTABLE  | 60–79     |
| MELTDOWN  | 80–100    |

---

## 6.2 Escalation Rules

Tension never decreases.

Tension increases by:

* Base increment per round
* Score imbalance modifier
* Player leading modifier
* Abandonment return modifier
* Permission denial modifier
* Interaction resistance modifier

---

## 6.3 Spike Modifier

Temporary spike layer for:

* Rapid consecutive wins
* Fast decision speed
* Hover hesitation
* Denying permissions

Spike decays slowly but never reduces base.

---

## 6.4 State Transition Rules

* If nextState > currentState → transition
* If nextState < currentState → ignore
* If MELTDOWN reached → lock permanently

---

# 7. Round Resolution System

## 7.1 Robot Selection

Must use:

```
crypto.getRandomValues()
```

Uniform distribution across:

* rock
* paper
* scissors

---

## 7.2 Fairness Guarantee

* Player selection stored immediately on click.
* Interruptions occur after storage.
* Outcome calculation uses stored value.
* UI distortions never affect result.

---

# 8. Dialogue Engine

Hybrid rule-based + weighted selection.

## 8.1 Inputs

* tensionState
* score delta
* personalitySeed
* permission state
* abandonmentCount
* interaction patterns

---

## 8.2 Personality Archetypes (Seeded)

* Dramatic
* Sarcastic
* Melancholic
* Paranoid
* Theatrical

Seed biases message pools and corruption rate.

---

## 8.3 Message Levels

| Console Level | Usage          |
| ------------- | -------------- |
| console.info  | Robot thoughts |
| console.log   | Robot speech   |
| console.warn  | Escalation     |
| console.error | Endgame        |

---

# 9. Interaction Disruption System

Never alters selection.

## 9.1 Probabilities

| State     | Interruption Chance |
| --------- | ------------------- |
| CALM      | 0%                  |
| UNEASY    | 10%                 |
| IRRITATED | 25%                 |
| UNSTABLE  | 40%                 |
| MELTDOWN  | 60%                 |

---

## 9.2 Behaviors

* Confirmation prompts
* Ignored input delays
* Button flicker
* Hover commentary
* Fake system errors

---

# 10. Illusion Engine

Activated progressively:

| State     | Illusions                 |
| --------- | ------------------------- |
| CALM      | none                      |
| UNEASY    | time-based comments       |
| IRRITATED | fake file access          |
| UNSTABLE  | fingerprint illusions     |
| MELTDOWN  | full system hallucination |

---

# 11. Permission System

## 11.1 Real Permission

Location via:

```
navigator.geolocation.getCurrentPosition
```

If denied:

* Use timezone
* Use locale
* Use IP fallback (optional future enhancement)

---

## 11.2 Simulated Permissions

UI toggles:

* Microphone
* Camera
* File System

These influence dialogue and ending modifiers.

---

# 12. Audio Engine (Soundscape)

Inputs:

* tensionState
* score delta
* interruption flag
* ending state

Music parameters:

* tempo
* distortion
* glitch artifacts
* harmony degradation

Must transition smoothly between states.

---

# 13. Animation System

ASCII frame arrays.

Frame corruption probability increases with tension.

At MELTDOWN:

* Frame skipping
* Character substitution
* Partial frame overlays

---

# 14. Visual Escalation

CSS class layering:

```
.tension-calm
.tension-uneasy
.tension-irritated
.tension-unstable
.tension-meltdown
```

Visual changes:

* Screen jitter
* RGB splitting
* Text flicker
* Scanline intensity
* Noise injection

---

# 15. Persistence Model

All core state stored via abstraction:

```
storage.get()
storage.set()
```

On load:

* Check abandonment duration.
* Modify baseline tension.
* Trigger return dialogue.
* If ending achieved → load ending state immediately.

---

# 16. Ending System

Game ends at:

5 total wins or losses.

## 16.1 End Types

* Robot BROKEN (player wins)
* Robot ESCAPED (robot wins)

---

## 16.2 Modifiers

Based on:

* Location granted
* Simulated permissions
* Tension at end
* Abandonment count

Each modifies final dialogue + ASCII sequence.

End state is permanent.

---

# 17. Feature Flags

```
debugTension
aggressiveMode
disableRealPermissions
skipEndingLock
```

---

# 18. Analytics & Tracking

## 18.1 Provider

**PostHog** (recommended) — open-source product analytics with a generous free tier (1M events/month). Lightweight JS SDK, no backend required. Works on GitHub Pages as a static site.

## 18.2 Events to Track

| Event | Trigger | Properties |
|---|---|---|
| `game_started` | Player clicks "play" from landing | — |
| `round_played` | Round resolves | `player_choice`, `robot_choice`, `outcome` (win/loss/draw), `round_number`, `tension_state` |
| `permission_requested` | Permission prompt shown | `permission_type` (real vs simulated), `permission_name` |
| `permission_granted` | Player grants a permission | `permission_type`, `permission_name` |
| `permission_denied` | Player denies a permission | `permission_type`, `permission_name` |
| `tension_changed` | Tension state transitions | `from_state`, `to_state`, `round_number` |
| `ending_reached` | Game reaches an ending | `ending_type` (BROKEN/ESCAPED), `total_rounds`, `final_tension`, `duration_seconds` |
| `return_visit` | Player revisits after a previous session | `previous_ending_type`, `days_since_last` |

## 18.3 Privacy Considerations

- No PII collection — PostHog anonymous mode only
- No cookies — use PostHog's cookieless tracking via `persistence: 'memory'`
- Respect Do Not Track headers
- No session replay (unnecessary for a game, and privacy-invasive)

## 18.4 Implementation Notes

- Initialize PostHog in `main.tsx` with the project API key
- Fire events from the Zustand store subscribers or directly from game logic
- Keep the analytics layer thin — a single `track(event, properties)` wrapper to avoid vendor lock-in

# 19. Open Questions

1. Should tension escalation differ if robot is losing vs winning?
2. Do we allow hidden secret endings?
3. Should personality seed persist permanently?
4. Should meltdown affect FPS?
5. Should console narrative include fake stack traces?

---
