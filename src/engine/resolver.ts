import type { Choice, RoundResult } from '@engine/types';

const WINS_AGAINST: Record<Choice, Choice> = {
  rock: 'scissors',
  paper: 'rock',
  scissors: 'paper',
};

export function resolveRound(player: Choice, robot: Choice): RoundResult {
  if (player === robot) return 'tie';
  if (WINS_AGAINST[player] === robot) return 'player';
  return 'robot';
}
