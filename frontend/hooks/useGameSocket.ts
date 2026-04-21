import { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { 
  ServerMessage, 
  ClientMessage, 
  GameStateSync, 
  BluffResolution,
  Card,
  Rank
} from '../types/game';

const SOCKET_URL = 'ws://localhost:8081/ws/game';
const SESSION_KEY = 'bluff_session_id';
const ROOM_KEY = 'bluff_room_id';

export function useGameSocket() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameStateSync | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [bluffResult, setBluffResult] = useState<BluffResolution | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize session ID from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSession = sessionStorage.getItem(SESSION_KEY);
      const storedRoom = sessionStorage.getItem(ROOM_KEY);
      if (storedSession) setSessionId(storedSession);
      if (storedRoom) setRoomId(storedRoom);
    }
  }, []);

  const { sendJsonMessage, readyState } = useWebSocket(SOCKET_URL, {
    onOpen: () => {
      console.log('WebSocket connected');
      // Auto-rejoin if we have a session AND room
      if (sessionId && roomId) {
        sendJsonMessage({
          type: 'JoinLobby',
          playerName: 'Reconnecting...',
          sessionId: sessionId,
          roomId: roomId
        } as ClientMessage);
      }
    },
    onMessage: (event) => {
      try {
        const msg: ServerMessage = JSON.parse(event.data);
        console.log('Received:', msg);

        switch (msg.type) {
          case 'GameStateSync':
            setGameState(msg);
            // The server sends the room ID back as gameId
            if (msg.gameId !== roomId) {
              setRoomId(msg.gameId);
              sessionStorage.setItem(ROOM_KEY, msg.gameId);
            }
            break;
            
          case 'ActionBroadcast':
            setGameState(prev => {
              if (!prev) return prev;
              const player = prev.playerSummaries.find(p => p.sessionId === msg.playerId);
              const name = player?.displayName || 'Someone';
              
              let logEntry = '';
              if (msg.action === 'PLAYED_CARDS') {
                logEntry = `${name} played ${msg.claimedCount} card(s) claiming ${msg.claimedRank}`;
              } else if (msg.action === 'PASSED') {
                logEntry = `${name} passed`;
              }
              
              if (logEntry) {
                setActionLog(logs => [logEntry, ...logs].slice(0, 10));
              }
              return prev;
            });
            break;
            
          case 'BluffResolution':
            setBluffResult(msg);
            setGameState(prev => {
              if (!prev) return prev;
              const caller = prev.playerSummaries.find(p => p.sessionId === msg.bluffCallerId)?.displayName || 'Someone';
              const player = prev.playerSummaries.find(p => p.sessionId === msg.playerId)?.displayName || 'Someone';
              const logEntry = `${caller} called bluff on ${player}! ${msg.wasBluff ? 'It was a lie!' : 'They told the truth!'}`;
              setActionLog(logs => [logEntry, ...logs].slice(0, 10));
              return prev;
            });
            setTimeout(() => {
              setBluffResult(null);
            }, 5000);
            break;

          case 'PileCleared':
             setGameState(prev => {
                if (!prev) return prev;
                setActionLog(logs => ["The pile was cleared!", ...logs].slice(0, 10));
                return prev;
             });
             break;
            
          case 'Error':
            setError(msg.message);
            setTimeout(() => setError(null), 3000);
            break;
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    },
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
  });

  const joinLobby = useCallback((playerName: string, requestedRoomId?: string) => {
    const newSessionId = sessionId || crypto.randomUUID();
    
    if (!sessionId) {
      setSessionId(newSessionId);
      sessionStorage.setItem(SESSION_KEY, newSessionId);
    }
    
    sendJsonMessage({
      type: 'JoinLobby',
      playerName,
      sessionId: newSessionId,
      roomId: requestedRoomId || null
    } as ClientMessage);
  }, [sendJsonMessage, sessionId]);

  const startGame = useCallback(() => {
    sendJsonMessage({ type: 'StartGame' } as ClientMessage);
  }, [sendJsonMessage]);

  const playCards = useCallback((cardIds: string[], claimedRank: Rank) => {
    sendJsonMessage({
      type: 'PlayCards',
      cardIds,
      claimedRank
    } as ClientMessage);
  }, [sendJsonMessage]);

  const passTurn = useCallback(() => {
    sendJsonMessage({ type: 'Pass' } as ClientMessage);
  }, [sendJsonMessage]);

  const callBluff = useCallback(() => {
    sendJsonMessage({ type: 'CallBluff' } as ClientMessage);
  }, [sendJsonMessage]);

  const clearBluffResult = useCallback(() => {
    setBluffResult(null);
  }, []);

  return {
    gameState,
    actionLog,
    bluffResult,
    error,
    isConnected: readyState === ReadyState.OPEN,
    sessionId,
    joinLobby,
    startGame,
    playCards,
    passTurn,
    callBluff,
    clearBluffResult
  };
}
