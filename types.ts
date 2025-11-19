import { PLAYER, GAME_STATUS } from './constants/projects';

export type Player = typeof PLAYER[keyof typeof PLAYER] | null;
export type CellState = Player;
export type BoardState = CellState[][];
export type GameStatus = typeof GAME_STATUS[keyof typeof GAME_STATUS];

export interface Vote {
  [key: string]: number;
}

// Player statistics
export interface PlayerStats {
  nickname: string;
  matches: number;      // 일치 횟수
  mismatches: number;   // 불일치 횟수
  totalRounds: number;  // 전체 라운드 수
  matchRate: number;    // 일치율 (%)
}

export interface VoteRecord {
  [clientId: string]: {
    nickname: string;
    votedPosition: string; // "row,col"
  };
}

// Fix: Add Language type for LanguageContext.
export type Language = 'ko' | 'en';
