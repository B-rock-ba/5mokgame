
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ 
    port: PORT,
    host: '0.0.0.0' // Allow connections from any host (important for Codespaces)
});

// --- Game Constants (should match frontend) ---
const BOARD_SIZE = 15;
const VOTE_DURATION_SECONDS = 44;
const PLAYER = { PROFESSOR: 1, AUDIENCE: 2 };
const GAME_STATUS = { READY: 'READY', PROFESSOR_TURN: 'PROFESSOR_TURN', VOTING: 'VOTING', FINISHED: 'FINISHED' };

// --- Game State ---
let gameState = createNewGameState();
let hostWs = null; // WebSocket connection for the professor/host
const audienceClients = new Map(); // Map of clientId -> { ws, nickname }
const votedClients = new Set(); // Track which clients have voted in current round
const playerStats = new Map(); // Map of clientId -> { nickname, votes: [positions], matches: [], mismatches: [] }
const voteHistory = []; // Array of { round, winningPosition, votes: Map<clientId, position> }
let timerInterval = null;

function createNewGameState() {
    return {
        gameId: Math.random().toString(36).substring(2, 8).toUpperCase(),
        board: Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null)),
        status: GAME_STATUS.PROFESSOR_TURN,
        winner: null,
        votes: {},
        timer: VOTE_DURATION_SECONDS,
        currentRound: 0,
        topPlayers: null, // { best, worst }
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
    if (hostWs && hostWs.readyState === WebSocket.OPEN) hostWs.send(message);
    
    // Send personalized stats to each audience member
    audienceClients.forEach((clientData, clientId) => {
        if (clientData.ws.readyState === WebSocket.OPEN) {
            const personalizedState = { ...gameState };
            
            // Add personal stats if game is finished
            if (gameState.status === GAME_STATUS.FINISHED && playerStats.has(clientId)) {
                const stats = playerStats.get(clientId);
                const matches = stats.matches.length;
                const mismatches = stats.mismatches.length;
                const total = matches + mismatches;
                
                personalizedState.myStats = {
                    matches,
                    mismatches,
                    total,
                    matchRate: total > 0 ? Math.round((matches / total) * 100) : 0
                };
            }
            
            clientData.ws.send(JSON.stringify({
                type: 'GAME_STATE_UPDATE',
                payload: personalizedState
            }));
        }
    });
}

function calculatePlayerStats() {
    const stats = [];
    
    playerStats.forEach((data, clientId) => {
        const matches = data.matches.length;
        const mismatches = data.mismatches.length;
        const total = matches + mismatches;
        const matchRate = total > 0 ? Math.round((matches / total) * 100) : 0;
        
        stats.push({
            nickname: data.nickname,
            matches,
            mismatches,
            totalRounds: total,
            matchRate
        });
    });
    
    // Sort by match rate
    stats.sort((a, b) => b.matchRate - a.matchRate);
    
    if (stats.length > 0) {
        return {
            best: stats[0],  // 명예의 빅데이터인
            worst: stats[stats.length - 1]  // 뛰어난 아이덴티티인
        };
    }
    
    return null;
}

function handleAudienceMove() {
    let maxVotes = -1;
    let bestMove = null;
    const entries = Object.entries(gameState.votes);
    
    if (entries.length > 0) {
        for (const [key, count] of entries) {
            if (count > maxVotes) {
                maxVotes = count;
                bestMove = key;
            }
        }
    }
    
    // Record this round's voting data
    const currentRoundVotes = new Map();
    voteHistory.forEach(record => {
        if (record.round === gameState.currentRound) {
            currentRoundVotes.set(record.clientId, record.position);
        }
    });
    
    // Update player stats based on winning position
    if (bestMove) {
        playerStats.forEach((data, clientId) => {
            const roundRecords = voteHistory.filter(r => r.clientId === clientId && r.round === gameState.currentRound);
            if (roundRecords.length > 0) {
                const voted= roundRecords[0].position;
                if (voted === bestMove) {
                    data.matches.push(gameState.currentRound);
                } else {
                    data.mismatches.push(gameState.currentRound);
                }
            }
        });
        
        const [r, c] = bestMove.split(',').map(Number);
        gameState.board[r][c] = PLAYER.AUDIENCE;
        
        if (checkWin(r, c, PLAYER.AUDIENCE, gameState.board)) {
            gameState.status = GAME_STATUS.FINISHED;
            gameState.winner = PLAYER.AUDIENCE;
            gameState.topPlayers = calculatePlayerStats();
        } else {
            gameState.status = GAME_STATUS.PROFESSOR_TURN;
        }
    } else {
        gameState.status = GAME_STATUS.PROFESSOR_TURN;
    }
    
    gameState.votes = {};
    gameState.currentRound++;
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
                     const clientId = data.payload?.clientId || Math.random().toString(36).substring(7);
                     const nickname = data.payload?.nickname || `Player${audienceClients.size + 1}`;
                     
                     audienceClients.set(clientId, { ws, nickname });
                     
                     // Initialize player stats
                     if (!playerStats.has(clientId)) {
                         playerStats.set(clientId, {
                             nickname,
                             matches: [],
                             mismatches: []
                         });
                     }
                     
                     // Send clientId back to client
                     ws.send(JSON.stringify({ 
                         type: 'CLIENT_REGISTERED', 
                         payload: { clientId, nickname } 
                     }));
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
                                gameState.topPlayers = calculatePlayerStats();
                            } else {
                                gameState.status = GAME_STATUS.VOTING;
                                startVotingTimer();
                            }
                            broadcastGameState();
                        }
                    }
                    break;
                
                case 'VOTE':
                    const votingClientId = data.payload?.clientId;
                    if (votingClientId && audienceClients.has(votingClientId) && gameState.status === GAME_STATUS.VOTING) {
                        // Check if this client has already voted
                        if (votedClients.has(votingClientId)) {
                            console.log('Client tried to vote twice - rejected');
                            break;
                        }
                        
                        const { row, col } = data.payload;
                        // Validate vote position
                        if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE && !gameState.board[row][col]) {
                            const key = `${row},${col}`;
                            gameState.votes[key] = (gameState.votes[key] || 0) + 1;
                            votedClients.add(votingClientId); // Mark this client as voted
                            
                            // Record this vote
                            voteHistory.push({
                                round: gameState.currentRound,
                                clientId: votingClientId,
                                position: key
                            });
                            
                            broadcastGameState();
                        }
                    }
                    break;

                case 'RESET_GAME':
                    if (ws === hostWs) {
                        console.log('Game reset by host.');
                        clearInterval(timerInterval);
                        gameState = createNewGameState();
                        // Clear stats but keep players
                        playerStats.clear();
                        voteHistory.length = 0;
                        votedClients.clear();
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
            audienceClients.forEach(clientData => {
                if (clientData.ws.readyState === WebSocket.OPEN) {
                    clientData.ws.close();
                }
            });
            audienceClients.clear();
        } else {
            // Find and remove from audience clients
            for (const [clientId, clientData] of audienceClients.entries()) {
                if (clientData.ws === ws) {
                    audienceClients.delete(clientId);
                    break;
                }
            }
        }
    });
});

console.log(`WebSocket server started on port ${PORT}`);
