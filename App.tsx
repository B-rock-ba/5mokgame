
import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameBoard from './components/ProjectCard'; // Was ProjectCard.tsx
import GameInfo from './components/Header'; // Was Header.tsx
import type { BoardState, Player, GameStatus, Vote } from './types';
import { BOARD_SIZE, PLAYER, GAME_STATUS, VOTE_DURATION_SECONDS } from './constants/projects';

// --- WebSocket Server URL ---
// In a real deployment, you would use wss:// for secure connections.
// For local development, this points to the server.js backend.
const WEBSOCKET_URL = `ws://localhost:8080`;

const createEmptyBoard = (): BoardState =>
  Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(null)
  );

const App: React.FC = () => {
  const [board, setBoard] = useState<BoardState>(createEmptyBoard());
  const [status, setStatus] = useState<GameStatus>(GAME_STATUS.READY);
  const [winner, setWinner] = useState<Player>(null);
  const [timer, setTimer] = useState(VOTE_DURATION_SECONDS);
  const [votes, setVotes] = useState<Vote>({});
  const [gameId, setGameId] = useState<string | null>(null);

  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // This effect handles the WebSocket connection lifecycle.
    // It connects on component mount and disconnects on unmount.
    
    // Do not connect when in READY state
    if (status === GAME_STATUS.READY) {
        if(ws.current) {
            ws.current.close();
            ws.current = null;
        }
        return;
    }

    ws.current = new WebSocket(WEBSOCKET_URL);

    ws.current.onopen = () => {
      console.log('WebSocket connection established.');
      // Identify this client as the host/professor
      ws.current?.send(JSON.stringify({ type: 'HOST_JOIN' }));
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'GAME_STATE_UPDATE':
          setBoard(message.payload.board);
          setStatus(message.payload.status);
          setWinner(message.payload.winner);
          setTimer(message.payload.timer);
          setVotes(message.payload.votes);
          break;
        case 'GAME_CREATED':
          setGameId(message.payload.gameId);
          setStatus(GAME_STATUS.PROFESSOR_TURN); // Game is ready to start
          setBoard(createEmptyBoard());
          setWinner(null);
          setVotes({});
          setTimer(VOTE_DURATION_SECONDS);
          break;
        default:
          console.warn('Received unknown message type:', message.type);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed.');
      setStatus(GAME_STATUS.READY);
      setGameId(null);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatus(GAME_STATUS.READY);
      setGameId(null);
    };

    // Cleanup function to close the connection when the component unmounts
    return () => {
      ws.current?.close();
    };
  }, [status === GAME_STATUS.READY]); // Re-connect only when starting a game


  const handleCellClick = (row: number, col: number) => {
    if (status !== GAME_STATUS.PROFESSOR_TURN || board[row][col] || !ws.current) return;
    
    // Instead of updating state directly, send a message to the server.
    ws.current.send(JSON.stringify({
      type: 'PLACE_STONE',
      payload: { row, col }
    }));
  };
  
  const resetGame = () => {
    // Send a reset message to the server
    if (ws.current) {
        ws.current.send(JSON.stringify({ type: 'RESET_GAME' }));
    } else {
        // If not connected, just reset local state
        setBoard(createEmptyBoard());
        setWinner(null);
        setVotes({});
        setTimer(VOTE_DURATION_SECONDS);
        setStatus(GAME_STATUS.READY);
        setGameId(null);
    }
  };
  
  const startGame = () => {
     // Setting status will trigger the useEffect to connect to WebSocket
     setStatus(GAME_STATUS.PROFESSOR_TURN); 
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col lg:flex-row items-center justify-center p-4 gap-8">
      <main className="flex-grow flex items-center justify-center">
        <GameBoard board={board} votes={votes} status={status} onCellClick={handleCellClick} />
      </main>
      <aside className="flex-shrink-0 w-full lg:w-auto">
        <GameInfo status={status} winner={winner} timer={timer} gameId={gameId} onReset={status === GAME_STATUS.READY ? startGame : resetGame} />
      </aside>
    </div>
  );
};

export default App;
