
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ 
    port: PORT,
    host: '0.0.0.0' // Allow connections from any host (important for Codespaces)
});

// --- Game Constants (should match frontend) ---
const BOARD_SIZE = 15;
const VOTE_DURATION_SECONDS = 90;
const PLAYER = { PROFESSOR: 1, AUDIENCE: 2 };
const GAME_STATUS = { READY: 'READY', PROFESSOR_TURN: 'PROFESSOR_TURN', VOTING: 'VOTING', FINISHED: 'FINISHED' };

// --- Game State ---
let gameState = createNewGameState();
let hostWs = null; // WebSocket connection for the professor/host
const audienceClients = new Set(); // Set of WebSocket connections for audience members
const votedClients = new Set(); // Track which clients have voted in current round
let timerInterval = null;

function createNewGameState() {
    return {
        gameId: Math.random().toString(36).substring(2, 8).toUpperCase(),
        board: Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null)),
        status: GAME_STATUS.PROFESSOR_TURN,
        winner: null,
        votes: {},
        timer: VOTE_DURATION_SECONDS,
    };
}

function checkWin(row, col, player, board) {
    if (!player) return false;
    const directions = [{ r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: -1 }];
    for (const dir of directions) {
        let count = 1;
        for (let i = 1; i < 5; i++) {
            const r = row + i * dir.r, c = col + i * dir.c;
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) count++; else break;
        }
        for (let i = 1; i < 5; i++) {
            const r = row - i * dir.r, c = col - i * dir.c;
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) count++; else break;
        }
        if (count >= 5) return true;
    }
    return false;
}

function broadcastGameState() {
    const message = JSON.stringify({
        type: 'GAME_STATE_UPDATE',
        payload: gameState,
    });
    if (hostWs) hostWs.send(message);
    audienceClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function handleAudienceMove() {
    let maxVotes = -1;
    let bestMove = null;
    const entries = Object.entries(gameState.votes);
    
    if (entries.length > 0) {
        for (const [key, count] of entries) {
            if (count > maxVotes) {
                maxVotes = count;
                bestMove = key.split(',').map(Number);
            }
        }
    }
    
    if (bestMove) {
        const [r, c] = bestMove;
        gameState.board[r][c] = PLAYER.AUDIENCE;
        if (checkWin(r, c, PLAYER.AUDIENCE, gameState.board)) {
            gameState.status = GAME_STATUS.FINISHED;
            gameState.winner = PLAYER.AUDIENCE;
        } else {
            gameState.status = GAME_STATUS.PROFESSOR_TURN;
        }
    } else {
        // No votes, turn goes back to professor
        gameState.status = GAME_STATUS.PROFESSOR_TURN;
    }
    gameState.votes = {};
    broadcastGameState();
}

function startVotingTimer() {
    clearInterval(timerInterval);
    gameState.timer = VOTE_DURATION_SECONDS;
    votedClients.clear(); // Clear voted clients for new round
    timerInterval = setInterval(() => {
        gameState.timer -= 1;
        if (gameState.timer <= 0) {
            clearInterval(timerInterval);
            handleAudienceMove();
        }
        broadcastGameState();
    }, 1000);
}


wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'HOST_JOIN':
                    console.log('Host connected.');
                    hostWs = ws;
                    gameState = createNewGameState();
                    ws.send(JSON.stringify({ type: 'GAME_CREATED', payload: { gameId: gameState.gameId }}));
                    broadcastGameState();
                    break;
                
                case 'AUDIENCE_JOIN':
                     console.log('Audience member connected.');
                     audienceClients.add(ws);
                     ws.send(JSON.stringify({ type: 'GAME_STATE_UPDATE', payload: gameState }));
                     break;

                case 'PLACE_STONE':
                    if (ws === hostWs && gameState.status === GAME_STATUS.PROFESSOR_TURN) {
                        const { row, col } = data.payload;
                        if (!gameState.board[row][col]) {
                            gameState.board[row][col] = PLAYER.PROFESSOR;
                            if (checkWin(row, col, PLAYER.PROFESSOR, gameState.board)) {
                                gameState.status = GAME_STATUS.FINISHED;
                                gameState.winner = PLAYER.PROFESSOR;
                            } else {
                                gameState.status = GAME_STATUS.VOTING;
                                startVotingTimer();
                            }
                            broadcastGameState();
                        }
                    }
                    break;
                
                case 'VOTE':
                    if (audienceClients.has(ws) && gameState.status === GAME_STATUS.VOTING) {
                        // Check if this client has already voted
                        if (votedClients.has(ws)) {
                            console.log('Client tried to vote twice - rejected');
                            break;
                        }
                        
                        const { row, col } = data.payload;
                        // Validate vote position
                        if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE && !gameState.board[row][col]) {
                            const key = `${row},${col}`;
                            gameState.votes[key] = (gameState.votes[key] || 0) + 1;
                            votedClients.add(ws); // Mark this client as voted
                            broadcastGameState();
                        }
                    }
                    break;

                case 'RESET_GAME':
                    if (ws === hostWs) {
                        console.log('Game reset by host.');
                        clearInterval(timerInterval);
                        gameState = createNewGameState();
                        hostWs.send(JSON.stringify({ type: 'GAME_CREATED', payload: { gameId: gameState.gameId } }));
                        broadcastGameState();
                    }
                    break;
            }
        } catch (error) {
            console.error('Failed to parse message or handle logic:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        if (ws === hostWs) {
            console.log('Host disconnected. Ending game.');
            hostWs = null;
            clearInterval(timerInterval);
            // Notify audience that the host left
            audienceClients.forEach(client => client.close());
            audienceClients.clear();
        } else {
            audienceClients.delete(ws);
        }
    });
});

console.log(`WebSocket server started on port ${PORT}`);
