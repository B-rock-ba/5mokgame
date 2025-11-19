import React, { useState, useEffect, useRef } from 'react';
import type { BoardState, Player, Vote, GameStatus } from './types';
import { BOARD_SIZE, PLAYER, GAME_STATUS } from './constants/projects';

const getWebSocketURL = () => {
  if (typeof window === 'undefined') return 'ws://localhost:8080';
  
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const hostname = window.location.hostname;
  
  // GitHub Codespaces environment
  if (hostname.includes('.app.github.dev')) {
    // Codespaces pattern: <name>-<port>.app.github.dev
    // We need to replace the current port with 8080
    const hostParts = hostname.split('.');
    const nameAndPort = hostParts[0]; // e.g., "something-3000"
    const nameWithoutPort = nameAndPort.split('-').slice(0, -1).join('-'); // Remove last part (port)
    const newHostname = `${nameWithoutPort}-8080.${hostParts.slice(1).join('.')}`;
    const wsUrl = `${protocol}//${newHostname}`;
    console.log('Student Page - Codespaces WebSocket URL:', wsUrl);
    return wsUrl;
  }
  
  // Local development
  const wsUrl = `${protocol}//${hostname}:8080`;
  console.log('Student Page - Local WebSocket URL:', wsUrl);
  return wsUrl;
};

const WEBSOCKET_URL = getWebSocketURL();

const VotePage: React.FC = () => {
  const [board, setBoard] = useState<BoardState>(
    Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))
  );
  const [status, setStatus] = useState<GameStatus>(GAME_STATUS.READY);
  const [timer, setTimer] = useState(44);
  const [votes, setVotes] = useState<Vote>({});
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [winner, setWinner] = useState<Player>(null);
  const [nickname, setNickname] = useState('');
  const [clientId, setClientId] = useState('');
  const [showNicknameModal, setShowNicknameModal] = useState(true);
  const [nicknameInput, setNicknameInput] = useState('');
  const [myStats, setMyStats] = useState<{ matches: number; mismatches: number; total: number } | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!nickname) return; // Don't connect until nickname is set
    
    ws.current = new WebSocket(WEBSOCKET_URL);

    ws.current.onopen = () => {
      console.log('학생 클라이언트 연결됨');
      const newClientId = clientId || Math.random().toString(36).substring(7);
      setClientId(newClientId);
      ws.current?.send(JSON.stringify({ 
        type: 'AUDIENCE_JOIN',
        payload: { clientId: newClientId, nickname }
      }));
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'CLIENT_REGISTERED') {
        setClientId(message.payload.clientId);
        setNickname(message.payload.nickname);
      }
      
      if (message.type === 'GAME_STATE_UPDATE') {
        setBoard(message.payload.board);
        setStatus(message.payload.status);
        setTimer(message.payload.timer);
        setVotes(message.payload.votes);
        setWinner(message.payload.winner);
        
        // Update personal stats
        if (message.payload.myStats) {
          setMyStats(message.payload.myStats);
        }
        
        // 투표 시간이 끝나면 초기화
        if (message.payload.status !== GAME_STATUS.VOTING) {
          setHasVoted(false);
          setSelectedCell(null);
        }
      }
    };

    ws.current.onclose = () => {
      console.log('연결 종료됨');
    };

    return () => {
      ws.current?.close();
    };
  }, [nickname]);

  const handleCellClick = (row: number, col: number) => {
    if (status !== GAME_STATUS.VOTING || board[row][col] || hasVoted) return;
    
    setSelectedCell({ row, col });
  };

  const handleVoteSubmit = () => {
    if (!selectedCell || !ws.current || hasVoted || !clientId) return;

    ws.current.send(JSON.stringify({
      type: 'VOTE',
      payload: { 
        row: selectedCell.row, 
        col: selectedCell.col,
        clientId 
      }
    }));

    setHasVoted(true);
  };
  
  const handleNicknameSubmit = () => {
    if (nicknameInput.trim().length > 0) {
      setNickname(nicknameInput.trim());
      setShowNicknameModal(false);
    }
  };

  const colLabels = Array.from({ length: BOARD_SIZE }, (_, i) => 
    String.fromCharCode('A'.charCodeAt(0) + i)
  );
  const rowLabels = Array.from({ length: BOARD_SIZE }, (_, i) => i + 1);

  // 투표 백분율 계산
  const totalVotes = Object.values(votes).reduce((sum: number, count) => sum + (count as number), 0);
  const getVotePercentage = (row: number, col: number): number => {
    const key = `${row},${col}`;
    const count = votes[key] || 0;
    return totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-sans flex flex-col items-center justify-center p-4">
      {/* Nickname Modal */}
      {showNicknameModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 p-8 rounded-2xl border-2 border-cyan-500 shadow-2xl max-w-md w-full">
            <h2 className="text-3xl font-bold text-center mb-2 text-cyan-400">Welcome! 👋</h2>
            <p className="text-slate-300 text-center mb-6">Enter your nickname to join the game</p>
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNicknameSubmit()}
              placeholder="Your nickname..."
              maxLength={20}
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors mb-4"
              autoFocus
            />
            <button
              onClick={handleNicknameSubmit}
              disabled={nicknameInput.trim().length === 0}
              className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
                nicknameInput.trim().length === 0
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 transform hover:scale-105'
              }`}
            >
              Join Game 🎮
            </button>
          </div>
        </div>
      )}
      
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="bg-slate-800/70 backdrop-blur-sm p-6 rounded-t-2xl border border-slate-700">
          <h1 className="text-3xl font-bold text-center mb-2">🎮 Omok Voting</h1>
          
          {status === GAME_STATUS.VOTING ? (
            <div className="text-center">
              <div className="text-6xl font-bold text-amber-400 mb-2">{timer}</div>
              <p className="text-lg text-slate-300">
                {hasVoted ? 'Vote Submitted! 🎉' : 'Select a position for your vote'}
              </p>
            </div>
          ) : status === GAME_STATUS.PROFESSOR_TURN ? (
            <p className="text-center text-xl text-slate-300">Professor's turn... Please wait</p>
          ) : status === GAME_STATUS.FINISHED ? (
            <div className="text-center py-4">
              {winner === PLAYER.AUDIENCE ? (
                <div className="space-y-3">
                  <div className="text-6xl">🎉</div>
                  <h2 className="text-3xl font-bold text-green-400 animate-pulse">
                    YOU WIN!
                  </h2>
                  <p className="text-xl text-green-300">
                    Students Victory! 🏆
                  </p>
                  <p className="text-slate-300">
                    Great teamwork everyone!
                  </p>
                  
                  {/* Personal Stats */}
                  {myStats && myStats.total > 0 && (
                    <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                      <h3 className="text-lg font-bold text-cyan-400 mb-2">Your Statistics</h3>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="bg-slate-800 p-2 rounded">
                          <div className="text-green-400 font-bold text-xl">{myStats.matches}</div>
                          <div className="text-slate-400">Matched</div>
                        </div>
                        <div className="bg-slate-800 p-2 rounded">
                          <div className="text-red-400 font-bold text-xl">{myStats.mismatches}</div>
                          <div className="text-slate-400">Different</div>
                        </div>
                        <div className="bg-slate-800 p-2 rounded">
                          <div className="text-cyan-400 font-bold text-xl">{Math.round((myStats.matches / myStats.total) * 100)}%</div>
                          <div className="text-slate-400">Match Rate</div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        You matched with the crowd {myStats.matches} out of {myStats.total} times!
                      </p>
                    </div>
                  )}
                </div>
              ) : winner === PLAYER.PROFESSOR ? (
                <div className="space-y-3">
                  <div className="text-6xl">😔</div>
                  <h2 className="text-3xl font-bold text-red-400">
                    DEFEAT...
                  </h2>
                  <p className="text-xl text-red-300">
                    Professor Wins! 
                  </p>
                  <p className="text-slate-300">
                    Better luck next time!
                  </p>
                  
                  {/* Personal Stats */}
                  {myStats && myStats.total > 0 && (
                    <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                      <h3 className="text-lg font-bold text-cyan-400 mb-2">Your Statistics</h3>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="bg-slate-800 p-2 rounded">
                          <div className="text-green-400 font-bold text-xl">{myStats.matches}</div>
                          <div className="text-slate-400">Matched</div>
                        </div>
                        <div className="bg-slate-800 p-2 rounded">
                          <div className="text-red-400 font-bold text-xl">{myStats.mismatches}</div>
                          <div className="text-slate-400">Different</div>
                        </div>
                        <div className="bg-slate-800 p-2 rounded">
                          <div className="text-cyan-400 font-bold text-xl">{Math.round((myStats.matches / myStats.total) * 100)}%</div>
                          <div className="text-slate-400">Match Rate</div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        You matched with the crowd {myStats.matches} out of {myStats.total} times!
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xl text-green-400">Game Over!</p>
              )}
            </div>
          ) : (
            <p className="text-center text-xl text-slate-400">Waiting for game...</p>
          )}
        </div>

        {/* 게임 보드 */}
        <div className="bg-slate-800/70 backdrop-blur-sm p-6 border-x border-slate-700">
          <div className="aspect-square w-full">
            <div className="grid h-full w-full" style={{
              gridTemplateColumns: '1.5rem 1fr',
              gridTemplateRows: '1.5rem 1fr',
              gap: '0.25rem'
            }}>
              <div></div>
              
              {/* 열 라벨 */}
              <div className="grid" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}>
                {colLabels.map(label => (
                  <div key={label} className="flex items-center justify-center text-xs font-semibold text-slate-400">
                    {label}
                  </div>
                ))}
              </div>

              {/* 행 라벨 */}
              <div className="grid" style={{ gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)` }}>
                {rowLabels.map(label => (
                  <div key={label} className="flex items-center justify-center text-xs font-semibold text-slate-400">
                    {label}
                  </div>
                ))}
              </div>

              {/* 보드 */}
              <div
                className="bg-amber-700 rounded-lg grid gap-0"
                style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}
              >
                {Array.from({ length: BOARD_SIZE }).map((_, row) =>
                  Array.from({ length: BOARD_SIZE }).map((_, col) => {
                    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
                    const isOccupied = board[row][col];
                    const canClick = status === GAME_STATUS.VOTING && !isOccupied && !hasVoted;
                    const percentage = getVotePercentage(row, col);
                    
                    return (
                      <div
                        key={`${row}-${col}`}
                        className={`relative flex items-center justify-center ${
                          canClick ? 'cursor-pointer hover:bg-yellow-600/30' : ''
                        } ${isSelected ? 'bg-cyan-500/50' : ''}`}
                        onClick={() => handleCellClick(row, col)}
                      >
                        {/* 격자선 */}
                        <div className="absolute w-full h-[1px] bg-black/40 top-1/2"></div>
                        <div className="absolute h-full w-[1px] bg-black/40 left-1/2"></div>
                        
                        {/* 돌 */}
                        {board[row][col] && (
                          <div
                            className={`absolute w-[80%] h-[80%] rounded-full ${
                              board[row][col] === PLAYER.PROFESSOR ? 'bg-black' : 'bg-white'
                            } shadow-lg z-10`}
                          ></div>
                        )}
                        
                        {/* Vote Status with Color Gradient */}
                        {status === GAME_STATUS.VOTING && !isOccupied && percentage > 0 && (
                          <div 
                            className="absolute z-20 rounded-full w-[70%] h-[70%] flex items-center justify-center transition-all duration-300"
                            style={{
                              backgroundColor: `rgba(${
                                percentage > 50 ? '239, 68, 68' : // red for >50%
                                percentage > 30 ? '251, 146, 60' : // orange for >30%
                                '251, 191, 36' // amber for <=30%
                              }, ${0.7 + (percentage / 100) * 0.3})` // opacity increases with percentage
                            }}
                          >
                            <span className="text-white font-bold text-xs drop-shadow-lg">{percentage}%</span>
                          </div>
                        )}
                        
                        {/* 선택 표시 */}
                        {isSelected && (
                          <div className="absolute z-30 w-[90%] h-[90%] border-4 border-cyan-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 투표 버튼 */}
        <div className="bg-slate-800/70 backdrop-blur-sm p-6 rounded-b-2xl border border-slate-700">
          {status === GAME_STATUS.VOTING && (
            <button
              onClick={handleVoteSubmit}
              disabled={!selectedCell || hasVoted}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                !selectedCell || hasVoted
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 transform hover:scale-105 shadow-lg'
              }`}
            >
              {hasVoted ? 'Vote Submitted ✓' : selectedCell ? 
                `Vote for ${colLabels[selectedCell.col]}-${selectedCell.row + 1}` : 
                'Select a position'}
            </button>
          )}
          
          {selectedCell && !hasVoted && status === GAME_STATUS.VOTING && (
            <p className="text-center text-sm text-slate-400 mt-3">
              Selected: <span className="text-cyan-400 font-bold">{colLabels[selectedCell.col]}-{selectedCell.row + 1}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotePage;
