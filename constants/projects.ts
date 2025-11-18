export const BOARD_SIZE = 15;
export const VOTE_DURATION_SECONDS = 90;

export const PLAYER = {
  PROFESSOR: 1,
  AUDIENCE: 2,
} as const;

export const GAME_STATUS = {
  READY: 'READY',
  PROFESSOR_TURN: 'PROFESSOR_TURN',
  VOTING: 'VOTING',
  FINISHED: 'FINISHED',
} as const;

export const PLAYER_NAME = {
  [PLAYER.PROFESSOR]: 'Professor',
  [PLAYER.AUDIENCE]: 'Audience',
};