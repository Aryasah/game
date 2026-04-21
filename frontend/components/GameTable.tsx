"use client";
import { useGame } from '../context/GameContext';
import { PlayerHand } from './PlayerHand';
import { CenterPile } from './CenterPile';
import OpponentRow from './OpponentRow';
import { BluffControls } from './BluffControls';
import { BluffReveal } from './BluffReveal';
import GameOverOverlay from './GameOverOverlay';

export function GameTable() {
  const { gameState, actionLog, sessionId } = useGame();

  if (!gameState) return null;

  // Separate opponents from ourselves
  const opponents = gameState.playerSummaries.filter(p => p.sessionId !== sessionId);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden font-sans">
      
      {/* Background vignette — subtle red/cyan radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ff525c]/[0.04] via-black to-black pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,_rgba(0,219,233,0.03),transparent)] pointer-events-none" />

      {/* Top section: Opponents */}
      <div className="flex-none pt-8 px-6 relative z-10">
        <OpponentRow opponents={opponents} currentPlayerId={gameState.currentPlayerId} />
      </div>

      {/* Middle section: Center Pile & Game Info */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <div className="absolute left-8 top-1/2 -translate-y-1/2 w-64">
          <div className="px-4 py-2 bg-white/[0.03] rounded-t-lg border-b border-white/[0.06] font-mono font-bold text-white/30 text-[10px] uppercase tracking-[0.3em]">
            Action Log
          </div>
          <div className="h-48 overflow-y-auto bg-white/[0.02] rounded-b-lg p-4 space-y-2 text-sm border border-white/[0.06] shadow-inner custom-scrollbar">
            {actionLog.length === 0 ? (
              <p className="text-white/20 italic font-mono text-xs">Awaiting first protocol action...</p>
            ) : (
              actionLog.map((log, i) => (
                <p key={i} className="text-white/60 font-mono text-xs animate-fade-in-up">
                  {i === 0 && <span className="text-[#ff525c] mr-2">▶</span>}
                  <span className={i === 0 ? 'text-white/90' : 'opacity-70'}>{log}</span>
                </p>
              ))
            )}
          </div>
        </div>

        <CenterPile />
        
        {/* Pass / Bluff controls appear here when it's our turn */}
        <BluffControls />
      </div>

      {/* Bottom section: Player Hand */}
      <div className="flex-none pb-8 relative z-10">
        <PlayerHand />
      </div>

      {/* Overlays */}
      <BluffReveal />
      <GameOverOverlay 
        winnerId={gameState.winnerId || null} 
        players={gameState.playerSummaries} 
        mySessionId={sessionId} 
      />
      
      {/* Game ID Badge */}
      <div className="absolute top-4 left-4 z-0">
        <div className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/30 text-[10px] font-mono tracking-widest uppercase">
          Room: <span className="font-bold text-[#00dbe9] text-xs tracking-[0.3em]">{gameState.gameId}</span>
        </div>
      </div>
    </div>
  );
}
