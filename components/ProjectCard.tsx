// This file now exports the GameBoard component for the Omok game.
import React from 'react';
import type { BoardState, Player, Vote, GameStatus } from '../types';
import { BOARD_SIZE, PLAYER, GAME_STATUS } from '../constants/projects';

interface GameBoardProps {
  board: BoardState;
  votes: Vote;
  status: GameStatus;
  onCellClick: (row: number, col: number) => void;
}

const Stone: React.FC<{ player: Player }> = ({ player }) => {
  if (!player) return null;
  const stoneColor = player === PLAYER.PROFESSOR ? 'bg-black' : 'bg-white';
  return (
    <div className={`absolute w-full h-full rounded-full ${stoneColor} shadow-md transform scale-90`}></div>
  );
};

const VoteOverlay: React.FC<{ count: number, maxVotes: number }> = ({ count, maxVotes }) => {
  if (count === 0 || maxVotes === 0) return null;
  const opacity = Math.min(0.7, (count / maxVotes) * 0.7);
  const scale = 0.5 + (count / maxVotes) * 0.5;
  return (
    <div 
        className="absolute w-full h-full flex items-center justify-center transition-opacity duration-300"
        style={{ opacity: opacity }}
    >
        <div 
            className="bg-amber-500 rounded-full"
            style={{ width: `${scale * 100}%`, height: `${scale * 100}%`}}
        />
        <span className="absolute text-white font-bold text-xs drop-shadow-md">{count}</span>
    </div>
  );
};


const GameBoard: React.FC<GameBoardProps> = ({ board, votes, status, onCellClick }) => {
  const cells = [];
  // Fix: Cast result of Object.values(votes) to number[] to satisfy Math.max.
  const maxVotes = Math.max(1, ...Object.values(votes) as number[]);

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const isClickable = status === GAME_STATUS.PROFESSOR_TURN && !board[row][col];
      const voteKey = `${row},${col}`;
      
      cells.push(
        <div
          key={`${row}-${col}`}
          className="relative flex items-center justify-center"
          onClick={() => isClickable && onCellClick(row, col)}
        >
          {/* Grid lines - Using 1px for consistency */}
          <div className="absolute w-full h-[1px] bg-black/40 top-1/2"></div>
          <div className="absolute h-full w-[1px] bg-black/40 left-1/2"></div>
          {/* Stone & Overlays Container */}
          <div className="relative w-full h-full z-10 flex items-center justify-center">
            {isClickable && <div className="w-4 h-4 rounded-full bg-transparent group-hover:bg-cyan-400/50 transition-colors duration-200"></div>}
            <Stone player={board[row][col]} />
            {status === GAME_STATUS.VOTING && <VoteOverlay count={votes[voteKey] || 0} maxVotes={maxVotes}/>}
          </div>
        </div>
      );
    }
  }

  const colLabels = Array.from({ length: BOARD_SIZE }, (_, i) => String.fromCharCode('A'.charCodeAt(0) + i));
  const rowLabels = Array.from({ length: BOARD_SIZE }, (_, i) => i + 1);

  return (
    <div className="aspect-square w-full max-w-[80vh] max-h-[80vh]">
        <div className="grid h-full w-full" style={{
            gridTemplateColumns: '2rem 1fr', // Row labels, Board
            gridTemplateRows: '2rem 1fr',    // Col labels, Board
            gap: '0.25rem'
        }}>
            {/* Empty Corner */}
            <div></div>

            {/* Column Labels */}
            <div className="grid" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}>
                {colLabels.map(label => (
                    <div key={label} className="flex items-center justify-center text-sm font-semibold text-slate-400">
                        {label}
                    </div>
                ))}
            </div>

            {/* Row Labels */}
            <div className="grid" style={{ gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)` }}>
                {rowLabels.map(label => (
                    <div key={label} className="flex items-center justify-center text-sm font-semibold text-slate-400">
                        {label}
                    </div>
                ))}
            </div>
            
            {/* Board */}
            <div className="bg-[#d2b48c] shadow-2xl rounded-lg p-2">
                <div
                className="group grid w-full h-full wood-board"
                style={{
                    gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                    gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
                }}
                >
                {cells}
                </div>
            </div>
        </div>
    </div>
  );
};

export default GameBoard;