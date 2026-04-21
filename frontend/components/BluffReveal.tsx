"use client";
import { useGame } from '../context/GameContext';
import CardComponent from './CardComponent';

export function BluffReveal() {
  const { bluffResult, clearBluffResult } = useGame();

  if (!bluffResult) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0a0a0a] border border-white/[0.08] p-8 rounded-2xl max-w-2xl w-full shadow-2xl relative overflow-hidden">
        
        {/* Decorative background glow based on result */}
        <div className={`absolute -top-32 -left-32 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none ${bluffResult.wasBluff ? 'bg-[#ff525c]' : 'bg-[#00dbe9]'}`} />
        <div className={`absolute -bottom-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none ${bluffResult.wasBluff ? 'bg-[#ff525c]' : 'bg-[#00dbe9]'}`} />

        <div className="relative z-10 flex flex-col items-center text-center">
          
          <h2 className={`text-5xl font-black mb-2 uppercase tracking-tighter ${bluffResult.wasBluff ? 'text-[#ff525c]' : 'text-[#00dbe9]'}`}>
            {bluffResult.wasBluff ? 'IT WAS A BLUFF!' : 'THEY TOLD THE TRUTH!'}
          </h2>
          
          <p className="text-white/50 text-lg mb-10 font-mono">
            Player takes the penalty of <span className="font-bold text-[#ff525c]">{bluffResult.penaltyCardCount} cards</span>.
          </p>

          <div className="mb-6">
            <h3 className="text-white/30 font-mono font-bold uppercase tracking-[0.3em] text-[10px] mb-4">Cards Revealed (Top of Pile)</h3>
            <div className="flex justify-center gap-2 flex-wrap">
              {bluffResult.revealedCards.map((card, i) => (
                <div 
                  key={card.id} 
                  className="animate-slide-up-fade"
                  style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}
                >
                  <CardComponent card={card} />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={clearBluffResult}
            className="mt-8 px-8 py-3 rounded-lg bg-white/[0.05] text-white/70 hover:bg-white/[0.08] hover:text-white font-mono font-bold uppercase tracking-[0.2em] text-sm transition-all border border-white/[0.08]"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
