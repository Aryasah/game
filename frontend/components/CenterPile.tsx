"use client";
import { useGame } from '../context/GameContext';
import { RANK_DISPLAY } from '../types/game';

export function CenterPile() {
  const { gameState } = useGame();

  if (!gameState) return null;

  const count = gameState.centerPileSize;
  const isEmpty = count === 0;

  // Create an array to map over for stacked visual effect (max 5)
  const visualCards = Array.from({ length: Math.min(count, 5) });

  return (
    <div className="flex flex-col items-center gap-8 my-12">
      {/* Target Rank Indicator */}
      <div 
        className={`
          px-8 py-2 flex justify-center items-center rounded-lg border shadow-2xl backdrop-blur-sm transition-all duration-500
          ${isEmpty 
            ? 'border-white/[0.06] bg-white/[0.02] text-white/30' 
            : 'border-[#ff525c]/30 bg-[#ff525c]/[0.05] text-[#ff525c] shadow-[0_0_30px_rgba(255,82,92,0.1)]'
          }
        `}
      >
        <span className="font-mono font-bold tracking-[0.2em] uppercase text-[10px]">
          {isEmpty ? "Pile Empty — Start New Rank" : "Declared Rank: "}
        </span>
        {!isEmpty && gameState.declaredRank && (
          <span className="text-3xl font-black ml-2">{RANK_DISPLAY[gameState.declaredRank]}</span>
        )}
      </div>

      {/* The Pile */}
      <div className="relative w-32 h-48 flex items-center justify-center">
        {isEmpty ? (
          <div className="w-full h-full rounded-lg border-2 border-dashed border-white/[0.06] flex items-center justify-center bg-white/[0.01]">
            <span className="text-white/15 font-mono font-bold uppercase tracking-[0.3em] text-[10px]">Empty</span>
          </div>
        ) : (
          <div className="relative w-full h-full animate-bounce-in">
            {visualCards.map((_, i) => {
              // Slight random rotation for messy pile effect
              const rotation = (i * 7) % 15 - 7;
              return (
                <div
                  key={i}
                  className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#1a0a0a] via-[#0a0a0a] to-[#1a0a0a] border border-[#ff525c]/20 shadow-xl flex items-center justify-center"
                  style={{
                    transform: `rotate(${rotation}deg) translateY(${i * -2}px)`,
                    zIndex: i
                  }}
                >
                  <div className="w-12 h-12 rounded-full border border-[#ff525c]/10 flex items-center justify-center opacity-30">
                    <div className="w-8 h-8 rotate-45 border border-[#ff525c]/20" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Card Count Label */}
      <div className="px-4 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/30 text-[10px] font-mono font-bold tracking-widest uppercase shadow-inner">
        {count} card{count !== 1 ? 's' : ''} in pile
      </div>
    </div>
  );
}
