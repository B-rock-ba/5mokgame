
// This file now exports the GameInfo component for the Omok game.
import React from 'react';
import type { GameStatus, Player, Vote } from '../types';
import { PLAYER_NAME, GAME_STATUS } from '../constants/projects';

interface GameInfoProps {
  status: GameStatus;
  winner: Player;
  timer: number;
  gameId: string | null;
  votes: Vote;
  onReset: () => void;
}

const GameStatusDisplay: React.FC<{ status: GameStatus; winner: Player }> = ({ status, winner }) => {
  let message = '';
  let color = 'text-white';

  switch (status) {
    case GAME_STATUS.READY:
      message = "Click 'Start Game' to begin";
      break;
    case GAME_STATUS.PROFESSOR_TURN:
      message = "Professor's Turn";
      color = 'text-cyan-400';
      break;
    case GAME_STATUS.VOTING:
      message = "Audience is Voting...";
      color = 'text-amber-400';
      break;
    case GAME_STATUS.FINISHED:
      message = winner ? `${PLAYER_NAME[winner]} Wins!` : "It's a Draw!";
      color = 'text-green-400';
      break;
  }

  return <h2 className={`text-3xl font-bold transition-colors duration-300 ${color}`}>{message}</h2>;
};


const GameInfo: React.FC<GameInfoProps> = ({ status, winner, timer, gameId, votes, onReset }) => {
  // Get the current host for voting URL
  // Use the full URL including protocol to work in Codespaces
  const getVotingUrl = () => {
    if (typeof window === 'undefined') return 'about:blank';
    if (!gameId) return 'about:blank';
    
    const protocol = window.location.protocol; // http: or https:
    const host = window.location.host; // includes hostname and port
    
    // Use the current page's full URL format
    return `${protocol}//${host}/vote?game=${gameId}`;
  };
  
  const audienceUrl = getVotingUrl();
  
  // 투표 통계 계산
  const totalVotes = Object.values(votes).reduce((sum: number, count) => sum + (count as number), 0);
  const topVotes = Object.entries(votes)
    .map(([key, count]) => {
      const [row, col] = key.split(',').map(Number);
      const colLabel = String.fromCharCode('A'.charCodeAt(0) + col);
      const rowLabel = row + 1;
      const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
      return { position: `${colLabel}-${rowLabel}`, count, percentage };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 flex flex-col items-center justify-between text-center w-full max-w-sm mx-auto">
      <div className="w-full">
        <h1 className="text-4xl font-extrabold text-white mb-4">Interactive Omok</h1>
        <GameStatusDisplay status={status} winner={winner} />
      </div>

      {status === GAME_STATUS.VOTING && (
        <div className="my-4 w-full">
          <div className="text-6xl font-mono text-amber-400 mb-3">{timer}</div>
          
          {/* 참여자 현황 바 */}
          <div className="bg-slate-700/50 p-3 rounded-lg mb-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-cyan-300">
                👥 Participants
              </h4>
              <span className="text-lg font-bold text-cyan-400">
                {totalVotes}/26
              </span>
            </div>
            
            {/* 프로그레스 바 */}
            <div className="w-full bg-slate-600 rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out flex items-center justify-end pr-2"
                style={{ 
                  width: `${Math.min((totalVotes / 26) * 100, 100)}%`,
                }}
              >
                {totalVotes > 0 && (
                  <span className="text-xs font-bold text-white drop-shadow">
                    {Math.round((totalVotes / 26) * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* 투표 통계 */}
          {totalVotes > 0 && (
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <h4 className="text-sm font-semibold text-amber-300 mb-2">
                📊 Vote Rankings
              </h4>
              <div className="space-y-1">
                {topVotes.map((vote, idx) => (
                  <div key={vote.position} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">
                      {idx + 1}. {vote.position}
                    </span>
                    <span className="font-bold text-amber-400">
                      {vote.percentage}% ({vote.count}표)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {(status !== GAME_STATUS.VOTING) && <div className="my-6 h-[72px]"></div>}


      <div className="w-full">
        <div className="bg-slate-700 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">Audience Participation</h3>
            {gameId ? (
              <>
                <p className="text-sm text-slate-300 mb-3">Scan the QR code to vote for the next move!</p>
                <div className="bg-white p-2 rounded-md inline-block mb-3">
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(audienceUrl)}`} 
                        alt="QR code for voting"
                        width="150"
                        height="150"
                    />
                </div>
                <div className="mt-2 p-2 bg-slate-800 rounded text-xs break-all">
                  <p className="text-slate-400 mb-1">또는 직접 접속:</p>
                  <a href={audienceUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">
                    {audienceUrl}
                  </a>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400 h-[201px] flex items-center justify-center">Start a game to generate a QR code.</p>
            )}
        </div>
        
        <button
          onClick={onReset}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-400/50 transform hover:scale-105"
        >
          {status === GAME_STATUS.READY ? 'Start Game' : 'Reset Game'}
        </button>
      </div>
    </div>
  );
};

export default GameInfo;
