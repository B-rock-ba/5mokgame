import { PLAYER, GAME_STATUS } from './constants/projects';

export type Player = typeof PLAYER[keyof typeof PLAYER] | null;
export type CellState = Player;
export type BoardState = CellState[][];
export type GameStatus = typeof GAME_STATUS[keyof typeof GAME_STATUS];

export interface Vote {
  [key: string]: number;
}

// Fix: Add Language type for LanguageContext.
export type Language = 'ko' | 'en';
