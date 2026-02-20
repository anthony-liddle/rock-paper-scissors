import { useCallback, useSyncExternalStore } from 'react';
import type { GameState, Choice, GamePhase } from '@engine/types';
import { getRandomChoice } from '@engine/rng';
import { resolveRound } from '@engine/resolver';
import { getTensionState, getEffectiveTension, calculateTensionIncrease } from '@engine/tension';
import { getMonologue, getLandingMonologue, getEndingMonologue } from '@data/dialogue';
import { getNextPermission, requestBrowserPermission } from '@engine/permissions';
import { getPermissionRequestDialogue, getPermissionReactionDialogue, getReturningGrantDialogue, getReturningDeniedDialogue } from '@data/permissionDialogue';
import { loadPlayerMemory, savePlayerMemory } from '@engine/playerMemory';
import { getMemoryInjectedLine } from '@data/returningDialogue';
import { getTabReturnLine } from '@data/tabLeaveDialogue';
import { musicManager } from '@engine/musicManager';
import { illusionEngine } from '@engine/illusionEngine';
import { releaseAllStreams } from '@engine/mediaStreamHolder';

const WIN_TARGET = 5;

function applyTensionUpdate(baseScore: number, spike: number) {
  const effective = getEffectiveTension(baseScore, spike);
  const tensionState = getTensionState(effective);
  if (tensionState === 'MELTDOWN') {
    return { tensionScore: effective, tensionSpike: 0, tensionState: 'MELTDOWN' as const };
  }
  return { tensionScore: baseScore, tensionSpike: spike, tensionState };
}

function createInitialState(): GameState {
  const memory = loadPlayerMemory();
  const lines = getLandingMonologue(memory);

  // Compute baseline tension from memory
  let baseTension = 0;
  if (memory.lastEnding === 'ESCAPED') baseTension = 40;
  else if (memory.lastEnding === 'BROKEN') baseTension = 20;
  baseTension += Math.min(memory.abandonmentCount * 5, 20);
  baseTension = Math.min(baseTension, 100);

  return {
    phase: 'landing',
    roundPhase: 'idle',
    playerWins: 0,
    robotWins: 0,
    roundsPlayed: 0,
    consecutivePlayerWins: 0,
    consecutiveRobotWins: 0,
    tensionScore: baseTension,
    tensionState: getTensionState(baseTension),
    tensionSpike: 0,
    lastRoundResult: null,
    lastPlayerChoice: null,
    lastRobotChoice: null,
    pendingPlayerChoice: null,
    pendingRobotChoice: null,
    endingType: null,
    dialogueLines: lines,
    dialogueIndex: 0,
    dialogueComplete: lines.length <= 1,
    currentAnimation: 'wobble',
    pendingPermission: null,
    permissionHistory: [],
    isRebooting: false,
    devToolsOpened: false,
    tabLeaveCount: 0,
  };
}

let state: GameState = createInitialState();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setState(next: Partial<GameState>) {
  state = { ...state, ...next };
  emit();
}

// Non-React API for singletons (consoleNarrator, devToolsDetector)
export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getState(): GameState {
  return state;
}

export function applyDevToolsDetected() {
  if (state.devToolsOpened) return; // one-shot
  const newBase = Math.min(state.tensionScore + 5, 100);
  const newSpike = state.tensionSpike + 5;
  const tension = applyTensionUpdate(newBase, newSpike);
  setState({
    devToolsOpened: true,
    ...tension,
  });
}

const TAB_LEAVE_TENSION_CAP = 3; // max leaves that add tension (+2 each = +6 max)

export function applyTabLeave() {
  const newCount = state.tabLeaveCount + 1;
  let newBase = state.tensionScore;
  const newSpike = state.tensionSpike + 2;
  if (newCount <= TAB_LEAVE_TENSION_CAP) {
    newBase = Math.min(newBase + 2, 100);
  }
  const tension = applyTensionUpdate(newBase, newSpike);
  setState({
    tabLeaveCount: newCount,
    ...tension,
  });
}

export function persistAbandonment() {
  if (state.phase !== 'playing') return;
  const memory = loadPlayerMemory();
  memory.abandonmentCount++;
  savePlayerMemory(memory);
}

export function advanceDialogue() {
  const nextIndex = state.dialogueIndex + 1;
  const isLast = nextIndex >= state.dialogueLines.length - 1;
  musicManager.playSfx('click');
  setState({
    dialogueIndex: nextIndex,
    dialogueComplete: isLast,
  });
}

export function startGame() {
  musicManager.start();
  musicManager.setTension(state.tensionState);
  setState({
    phase: 'playing',
    roundPhase: 'idle',
    dialogueLines: ['Choose your weapon.'],
    dialogueIndex: 0,
    dialogueComplete: true,
  });
}

// Phase 1: Player picks — generate robot choice, start animation sequence
export function beginRound(playerChoice: Choice) {
  if (state.phase !== 'playing' || !state.dialogueComplete || state.roundPhase === 'animating' || state.roundPhase === 'revealing' || state.pendingPermission) return;

  const robotChoice = getRandomChoice();

  setState({
    roundPhase: 'animating',
    pendingPlayerChoice: playerChoice,
    pendingRobotChoice: robotChoice,
    dialogueLines: [],
    dialogueIndex: 0,
    dialogueComplete: false,
  });
}

// Phase 2: Animation done — resolve the round, show result briefly
export function revealRound() {
  if (state.roundPhase !== 'animating') return;

  const playerChoice = state.pendingPlayerChoice!;
  const robotChoice = state.pendingRobotChoice!;
  const result = resolveRound(playerChoice, robotChoice);

  let { playerWins, robotWins, consecutivePlayerWins, consecutiveRobotWins, tensionScore } = state;
  const roundsPlayed = state.roundsPlayed + 1;

  if (result === 'player') {
    playerWins++;
    consecutivePlayerWins++;
    consecutiveRobotWins = 0;
  } else if (result === 'robot') {
    robotWins++;
    consecutiveRobotWins++;
    consecutivePlayerWins = 0;
  } else {
    consecutivePlayerWins = 0;
    consecutiveRobotWins = 0;
  }

  const robotLost = result === 'player';
  tensionScore += calculateTensionIncrease(
    roundsPlayed,
    playerWins - robotWins,
    robotLost,
  );
  if (state.devToolsOpened) tensionScore += 3;
  if (state.tabLeaveCount > 0) tensionScore += 1;
  tensionScore = Math.min(tensionScore, 100);

  // Spike decay: halve existing spike each round
  let tensionSpike = Math.floor(state.tensionSpike / 2);

  // New spike: 3 consecutive player wins
  if (consecutivePlayerWins === 3) tensionSpike += 4;

  // New spike: final round (someone at match point)
  if (playerWins === 4 || robotWins === 4) tensionSpike += 5;

  const tension = applyTensionUpdate(tensionScore, tensionSpike);

  setState({
    roundPhase: 'revealing',
    playerWins,
    robotWins,
    roundsPlayed,
    consecutivePlayerWins,
    consecutiveRobotWins,
    ...tension,
    lastRoundResult: result,
    lastPlayerChoice: playerChoice,
    lastRobotChoice: robotChoice,
    pendingPlayerChoice: null,
    pendingRobotChoice: null,
  });

  // Update music tension and play result SFX
  musicManager.setTension(tension.tensionState);
  if (result === 'player') musicManager.playSfx('win');
  else if (result === 'robot') musicManager.playSfx('lose');
  else musicManager.playSfx('tie');
}

// Phase 3: Reveal done — generate dialogue, advance to result
export function completeReveal() {
  if (state.roundPhase !== 'revealing') return;

  const { playerWins, robotWins, tensionState, lastRoundResult, tensionScore } = state;

  let phase: GamePhase = 'playing';
  let endingType = state.endingType;
  let monologue: string[];

  if (playerWins >= WIN_TARGET) {
    phase = 'ending';
    endingType = 'BROKEN';
    monologue = getEndingMonologue('BROKEN');
  } else if (robotWins >= WIN_TARGET) {
    phase = 'ending';
    endingType = 'ESCAPED';
    monologue = getEndingMonologue('ESCAPED');
  } else {
    monologue = getMonologue(tensionState, lastRoundResult!);

    // Occasionally inject a memory-aware line
    const memLine = getMemoryInjectedLine(loadPlayerMemory(), tensionState);
    if (memLine) monologue.push(memLine);

    // Occasionally inject an illusion-engine line
    const illusionLine = illusionEngine.getIllusionLine(tensionState);
    if (illusionLine) monologue.push(illusionLine);

    // Inject tab-return commentary (delayed pickup — comments after next round)
    const tabLine = getTabReturnLine(tensionState, state.tabLeaveCount);
    if (tabLine) monologue.push(tabLine);
  }

  // Stop music and play ending SFX
  if (phase === 'ending') {
    musicManager.stop();
    musicManager.playSfx(endingType === 'BROKEN' ? 'ending-broken' : 'ending-escaped');
  }

  // Save player data on game end
  if (phase === 'ending') {
    const memory = loadPlayerMemory();
    memory.playCount++;
    memory.lastEnding = endingType!;
    memory.lastPlayedAt = new Date().toISOString();
    const grantedThisSession = state.permissionHistory
      .filter((h) => h.status === 'granted')
      .map((h) => h.type);
    memory.permissionsGranted = [...new Set([...memory.permissionsGranted, ...grantedThisSession])];
    const deniedThisSession = state.permissionHistory
      .filter((h) => h.status === 'denied')
      .map((h) => h.type);
    memory.permissionsDenied = [...new Set([...memory.permissionsDenied, ...deniedThisSession])];
    const geoEntry = state.permissionHistory.find((h) => h.type === 'geolocation' && h.data);
    if (geoEntry?.data) memory.knownCity = geoEntry.data;
    savePlayerMemory(memory);
  }

  // Check if a permission threshold has been reached
  const pendingPermissionType = phase === 'playing'
    ? getNextPermission(tensionScore, state.permissionHistory)
    : null;

  let autoGrant = false;
  if (pendingPermissionType) {
    const memory = loadPlayerMemory();
    const wasGranted = memory.permissionsGranted.includes(pendingPermissionType);
    const wasDenied = memory.permissionsDenied.includes(pendingPermissionType);

    if (wasGranted) {
      const requestLines = getReturningGrantDialogue(pendingPermissionType, memory.knownCity);
      monologue = [...monologue, ...requestLines];
      autoGrant = true;
    } else if (wasDenied) {
      const requestLines = getReturningDeniedDialogue(pendingPermissionType);
      monologue = [...monologue, ...requestLines];
    } else {
      const requestLines = getPermissionRequestDialogue(pendingPermissionType);
      monologue = [...monologue, ...requestLines];
    }
  }

  setState({
    phase,
    roundPhase: 'result',
    endingType,
    dialogueLines: monologue,
    dialogueIndex: 0,
    dialogueComplete: monologue.length <= 1,
    currentAnimation: tensionState,
    pendingPermission: pendingPermissionType
      ? { type: pendingPermissionType, requesting: false, autoGrant }
      : null,
  });
}

export async function handlePermissionChoice(allowed: boolean) {
  if (!state.pendingPermission) return;
  musicManager.playSfx('permission');

  const { type } = state.pendingPermission;

  if (allowed) {
    // Show waiting state while browser permission dialog is open
    setState({ pendingPermission: { type, requesting: true } });

    const result = await requestBrowserPermission(type);
    const granted = result.granted;
    const reactionLines = getPermissionReactionDialogue(type, granted, result.data);

    setState({
      pendingPermission: null,
      permissionHistory: [
        ...state.permissionHistory,
        { type, status: granted ? 'granted' : 'denied', data: result.data },
      ],
      dialogueLines: reactionLines,
      dialogueIndex: 0,
      dialogueComplete: reactionLines.length <= 1,
    });
  } else {
    const reactionLines = getPermissionReactionDialogue(type, false);

    // Permission denial spike
    const newSpike = state.tensionSpike + 3;
    const tension = applyTensionUpdate(state.tensionScore, newSpike);

    setState({
      pendingPermission: null,
      permissionHistory: [
        ...state.permissionHistory,
        { type, status: 'denied' },
      ],
      ...tension,
      dialogueLines: reactionLines,
      dialogueIndex: 0,
      dialogueComplete: reactionLines.length <= 1,
    });
  }
}

export function startReboot() {
  if (state.isRebooting) return;
  musicManager.playSfx('click');
  setState({ isRebooting: true });
  setTimeout(() => {
    resetGame();
  }, 1500);
}

export function resetGame() {
  musicManager.stop();
  releaseAllStreams();
  state = createInitialState();
  emit();
}

export function useGameState(): GameState {
  const subscribe = useCallback((cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }, []);
  return useSyncExternalStore(subscribe, () => state);
}
