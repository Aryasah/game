"use client";
import { useState } from 'react';
import { useGame } from '../context/GameContext';

export function LobbyScreen() {
  const { gameState, joinLobby, startGame, isConnected, leaveRoom } = useGame();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // If game state exists, we are in the lobby
  const players = gameState?.playerSummaries || [];
  const canStart = gameState?.canStart || false;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !isConnected) return;
    
    setIsJoining(true);
    joinLobby(name.trim(), roomCode.trim() || undefined);
  };

  if (gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
        <div className="absolute top-6 left-6 px-4 py-2 bg-white/[0.03] rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
          <span className="text-white/40 text-[10px] font-mono uppercase tracking-[0.3em]">Room Code</span>
          <div className="text-2xl font-black text-[#00dbe9] tracking-[0.3em] font-mono">
            {gameState.gameId}
          </div>
        </div>

        <div className="w-full max-w-md p-8 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] shadow-2xl">
          <h1 className="text-4xl font-black text-center mb-2 tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
            LOBBY
          </h1>
          <p className="text-center text-white/30 mb-8 font-mono text-xs tracking-[0.3em] uppercase">Awaiting nodes...</p>

          <div className="space-y-3 mb-8">
            {players.map((p, i) => (
              <div 
                key={p.sessionId}
                className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] shadow-inner"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00dbe9] to-[#0088aa] flex items-center justify-center shadow-lg shadow-[#00dbe9]/20">
                    <span className="font-bold text-black text-sm font-mono">{i + 1}</span>
                  </div>
                  <span className="font-bold text-white/90 font-mono tracking-wide">{p.displayName}</span>
                </div>
                {p.connected ? (
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00dbe9] bg-[#00dbe9]/10 px-3 py-1 rounded-full font-mono border border-[#00dbe9]/20">
                    Online
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff525c] bg-[#ff525c]/10 px-3 py-1 rounded-full font-mono border border-[#ff525c]/20">
                    Offline
                  </span>
                )}
              </div>
            ))}

            {/* Empty slots (up to 6) */}
            {Array.from({ length: Math.max(0, 6 - players.length) }).map((_, i) => (
              <div 
                key={`empty-${i}`}
                className="flex items-center justify-between p-4 rounded-lg bg-white/[0.01] border border-white/[0.04] border-dashed"
              >
                <div className="flex items-center gap-3 opacity-20">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="font-bold text-white/30 text-sm font-mono">{players.length + i + 1}</span>
                  </div>
                  <span className="font-bold text-white/30 font-mono">Empty Slot</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center space-y-4">
            {canStart ? (
               <button
                 onClick={() => startGame()}
                 className="w-full py-4 rounded-lg font-mono font-bold text-black uppercase tracking-[0.2em] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] bg-white shadow-lg shadow-white/10 hover:shadow-white/25 text-sm"
               >
                 Initialize Game
               </button>
            ) : (
              <p className="text-[#ff525c]/80 font-mono text-xs flex items-center justify-center gap-2 tracking-wide">
                <span className="animate-pulse">●</span>
                Need at least 3 nodes to initialize
              </p>
            )}
            <button
              onClick={leaveRoom}
              className="w-full py-3 rounded-lg font-mono font-bold text-[#ff525c] uppercase tracking-[0.2em] transition-all duration-300 transform hover:bg-[#ff525c]/10 border border-[#ff525c]/20 text-xs"
            >
              Abort Connection (Leave Room)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Join Form
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] shadow-2xl transition-all duration-500">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black mb-2 tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
            BLUFF
          </h1>
          <p className="text-white/30 font-mono tracking-[0.3em] text-[10px] uppercase">Secure Protocol</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ALIAS"
              disabled={!isConnected || isJoining}
              className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white placeholder-white/20 font-mono font-bold tracking-widest focus:outline-none focus:ring-1 focus:ring-[#00dbe9]/50 focus:border-[#00dbe9]/30 transition-all uppercase"
              autoFocus
              maxLength={15}
            />
          </div>

          <div>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ROOM CODE (OPTIONAL)"
              disabled={!isConnected || isJoining}
              className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.08] rounded-lg text-white placeholder-white/20 font-mono font-bold tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-[#00dbe9]/50 focus:border-[#00dbe9]/30 transition-all"
              maxLength={4}
            />
            <p className="text-white/20 text-[10px] mt-2 text-center font-mono tracking-widest uppercase">Leave blank to create a new room</p>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || !isConnected || isJoining}
            className={`
              w-full py-4 mt-4 rounded-lg font-mono font-bold uppercase tracking-[0.2em] text-sm
              transition-all duration-300 transform
              ${(!name.trim() || !isConnected) 
                ? 'bg-white/5 text-white/20 opacity-50 cursor-not-allowed border border-white/5' 
                : 'bg-white text-black hover:shadow-lg hover:shadow-white/10 hover:scale-[1.02] active:scale-[0.98]'
              }
            `}
          >
            {isJoining ? 'Connecting...' : (roomCode.trim() ? 'Join Node' : 'Create Node')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className={`text-[10px] font-mono flex items-center justify-center gap-2 tracking-widest uppercase ${isConnected ? 'text-[#00dbe9]/70' : 'text-[#ff525c]/70'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#00dbe9] animate-pulse' : 'bg-[#ff525c]'}`}></span>
            {isConnected ? 'Protocol Active' : 'Establishing connection...'}
          </p>
        </div>
      </div>
    </div>
  );
}
