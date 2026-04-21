import { useGame } from '../context/GameContext';

export function BluffControls() {
  const { gameState, sessionId, passTurn, callBluff } = useGame();

  if (!gameState || !sessionId) return null;

  const isMyTurn = gameState.currentPlayerId === sessionId;
  const pileIsEmpty = gameState.pileIsEmpty;
  const canCallBluff = !pileIsEmpty && gameState.lastPlayerId !== sessionId;

  // We show these controls ONLY if it's our turn, AND the pile is not empty.
  // Wait, if it's our turn, we can Play Cards (in PlayerHand), Pass, or Call Bluff.
  // If the pile is empty, we MUST play cards, so no Pass or Call Bluff.
  
  if (!isMyTurn || pileIsEmpty) return null;

  return (
    <div className="flex flex-col items-center gap-4 mt-8 animate-fade-in-up">
      <div className="text-white/30 font-mono font-bold tracking-[0.3em] text-[10px] uppercase">
        Your Actions
      </div>
      
      <div className="flex gap-4">
        {canCallBluff && (
          <button
            onClick={callBluff}
            className="
              relative px-8 py-4 rounded-lg font-mono font-black text-xl uppercase tracking-[0.2em]
              bg-black border-2 border-[#ff525c]/50 text-[#ff525c]
              hover:bg-[#ff525c]/10 hover:border-[#ff525c] hover:scale-105
              active:scale-95
              transition-all duration-300
              shadow-[0_0_30px_rgba(255,82,92,0.15)]
              hover:shadow-[0_0_50px_rgba(255,82,92,0.3)]
              group
            "
          >
            <div className="absolute inset-0 rounded-lg bg-[#ff525c]/10 blur-md animate-pulse group-hover:bg-[#ff525c]/20 transition-all"></div>
            <span className="relative z-10 flex items-center gap-3">
              <span className="text-2xl">🚨</span> Call Bluff!
            </span>
          </button>
        )}

        <button
          onClick={passTurn}
          className="
            px-8 py-4 rounded-lg font-mono font-bold text-xl uppercase tracking-[0.2em]
            bg-white/[0.03] text-white/60 border border-white/10
            hover:bg-white/[0.06] hover:text-white hover:scale-105
            active:scale-95
            transition-all duration-300
            shadow-lg
          "
        >
          ⏭ Pass
        </button>
      </div>
    </div>
  );
}
