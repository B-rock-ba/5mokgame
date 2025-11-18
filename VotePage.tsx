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
  const [timer, setTimer] = useState(90);
  const [votes, setVotes] = useState<Vote>({});
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(WEBSOCKET_URL);

    ws.current.onopen = () => {
      console.log('학생 클라이언트 연결됨');
      ws.current?.send(JSON.stringify({ type: 'AUDIENCE_JOIN' }));
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'GAME_STATE_UPDATE') {
        setBoard(message.payload.board);
        setStatus(message.payload.status);
        setTimer(message.payload.timer);
        setVotes(message.payload.votes);
        
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
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (status !== GAME_STATUS.VOTING || board[row][col] || hasVoted) return;
    
    setSelectedCell({ row, col });
  };

  const handleVoteSubmit = () => {
    if (!selectedCell || !ws.current || hasVoted) return;

    ws.current.send(JSON.stringify({
      type: 'VOTE',
      payload: { row: selectedCell.row, col: selectedCell.col }
    }));

    setHasVoted(true);
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
      <div className="w-full max-w-2xl">
        {/* 헤더 */}
        <div className="bg-slate-800/70 backdrop-blur-sm p-6 rounded-t-2xl border border-slate-700">
          <h1 className="text-3xl font-bold text-center mb-2">🎮 오목 투표</h1>
          
          {status === GAME_STATUS.VOTING ? (
            <div className="text-center">
              <div className="text-6xl font-bold text-amber-400 mb-2">{timer}</div>
              <p className="text-lg text-slate-300">
                {hasVoted ? '투표 완료! 🎉' : '돌을 놓을 위치를 선택하세요'}
              </p>
            </div>
          ) : status === GAME_STATUS.PROFESSOR_TURN ? (
            <p className="text-center text-xl text-slate-300">교수님 차례입니다... 잠시만 기다려주세요</p>
          ) : status === GAME_STATUS.FINISHED ? (
            <p className="text-center text-xl text-green-400">게임이 종료되었습니다!</p>
          ) : (
            <p className="text-center text-xl text-slate-400">게임을 기다리는 중...</p>
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
                        
                        {/* 투표 현황 */}
                        {status === GAME_STATUS.VOTING && !isOccupied && percentage > 0 && (
                          <div className="absolute z-20 bg-amber-500/80 rounded-full w-[70%] h-[70%] flex items-center justify-center">
                            <span className="text-white font-bold text-xs">{percentage}%</span>
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
              {hasVoted ? '투표 완료 ✓' : selectedCell ? 
                `${colLabels[selectedCell.col]}${selectedCell.row + 1}에 투표하기` : 
                '위치를 선택하세요'}
            </button>
          )}
          
          {selectedCell && !hasVoted && status === GAME_STATUS.VOTING && (
            <p className="text-center text-sm text-slate-400 mt-3">
              선택: <span className="text-cyan-400 font-bold">{colLabels[selectedCell.col]}-{selectedCell.row + 1}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotePage;
