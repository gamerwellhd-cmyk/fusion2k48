import { COLS, ROWS } from './constants';

export type SpecialType = 'bomb' | 'freeze' | 'double' | 'teleport';

export type BlockValue = number | 'TNT' | SpecialType;

export type GameState = 'SPLASH' | 'PLAYING' | 'GAME_OVER' | 'LEADERBOARD';

export interface LeaderboardEntry {
  username: string;
  score: number;
  date: string;
}

export interface BlockData {
  id: string;
  value: BlockValue;
  row: number;
  col: number;
  isMerging?: boolean;
  isExploding?: boolean;
  isNew?: boolean;
  isFrozen?: number; // Number of turns frozen
}

export interface GameContextData {
  username: string;
  score: number;
  highScore: number;
  coins: number;
  restartTokens: number;
  totalScore: number;
}
