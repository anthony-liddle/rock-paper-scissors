export type Choice = 'rock' | 'paper' | 'scissors';
export type RoundResult = 'player' | 'robot' | 'tie';
export type TensionState = 'CALM' | 'UNEASY' | 'IRRITATED' | 'UNSTABLE' | 'MELTDOWN';
export type GamePhase = 'landing' | 'playing' | 'ending';
export type EndingType = 'BROKEN' | 'ESCAPED';
export type RoundPhase = 'idle' | 'animating' | 'revealing' | 'result';
export type PermissionType = 'notification' | 'geolocation' | 'camera' | 'microphone' | 'fullscreen';
export type PermissionStatus = 'granted' | 'denied';

export interface PermissionHistoryEntry {
  type: PermissionType;
  status: PermissionStatus;
  data?: string;
}

export interface PendingPermission {
  type: PermissionType;
  requesting: boolean;
  autoGrant?: boolean;
}

export interface GameState {
  phase: GamePhase;
  roundPhase: RoundPhase;
  playerWins: number;
  robotWins: number;
  roundsPlayed: number;
  consecutivePlayerWins: number;
  consecutiveRobotWins: number;
  tensionScore: number;
  tensionState: TensionState;
  tensionSpike: number;
  lastRoundResult: RoundResult | null;
  lastPlayerChoice: Choice | null;
  lastRobotChoice: Choice | null;
  pendingPlayerChoice: Choice | null;
  pendingRobotChoice: Choice | null;
  endingType: EndingType | null;
  dialogueLines: string[];
  dialogueIndex: number;
  dialogueComplete: boolean;
  currentAnimation: string;
  pendingPermission: PendingPermission | null;
  permissionHistory: PermissionHistoryEntry[];
  isRebooting: boolean;
  devToolsOpened: boolean;
  tabLeaveCount: number;
}
