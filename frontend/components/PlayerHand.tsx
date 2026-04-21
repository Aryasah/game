"use client";
import { useState, useMemo, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import CardComponent from './CardComponent';
import { RANK_DISPLAY, Rank } from '../types/game';

const ALL_RANKS: Rank[] = [
  'ACE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN',
  'EIGHT', 'NINE', 'TEN', 'JACK', 'QUEEN', 'KING'
];

export function PlayerHand() {
  const { gameState, sessionId, playCards } = useGame();
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [selectedRank, setSelectedRank] = useState<Rank>('ACE');

  // If the pile is not empty, we MUST claim the declared rank.
  useEffect(() => {
    if (gameState && !gameState.pileIsEmpty && gameState.declaredRank) {
      setSelectedRank(gameState.declaredRank);
    }
  }, [gameState?.declaredRank, gameState?.pileIsEmpty]);

  if (!gameState || !sessionId) return null;

  const isMyTurn = gameState.currentPlayerId === sessionId;
  const cards = gameState.yourHand;

  // Sort cards
  const sortedCards = useMemo(() => {
    const rankOrder = Object.keys(RANK_DISPLAY);
    return [...cards].sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));
  }, [cards]);

  const onToggleCard = (cardId: string) => {
    setSelectedCardIds((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      }
      if (prev.length >= 4) return prev;
      return [...prev, cardId];
    });
  };

  const onPlayCards = () => {
    if (selectedCardIds.length === 0) return;
    playCards(selectedCardIds, selectedRank);
    setSelectedCardIds([]);
  };

  const hasSelection = selectedCardIds.length > 0;
  const canPlay = isMyTurn && hasSelection;
  const isPileEmpty = gameState.pileIsEmpty;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-end px-8">
        <div className="flex items-center gap-4">
          <div 
            className={`
              px-4 py-1.5 rounded-full font-mono font-bold text-[10px] uppercase tracking-[0.2em] shadow-inner
              ${isMyTurn 
                ? 'bg-[#00dbe9]/10 text-[#00dbe9] border border-[#00dbe9]/30 shadow-[#00dbe9]/20' 
                : 'bg-white/[0.03] text-white/40 border border-white/10'
              }
            `}
          >
            {isMyTurn ? "⚡ Protocol Active" : "Waiting..."}
          </div>

          {isMyTurn && (
            <div className="flex items-center gap-2">
              <span className="text-white/40 font-mono text-[10px] uppercase tracking-widest">Claim As:</span>
              {isPileEmpty ? (
                <select 
                  value={selectedRank}
                  onChange={(e) => setSelectedRank(e.target.value as Rank)}
                  className="bg-black border border-white/20 text-[#00dbe9] font-mono font-bold tracking-widest uppercase rounded px-2 py-1 outline-none text-xs"
                >
                  {ALL_RANKS.map(rank => (
                    <option key={rank} value={rank}>{RANK_DISPLAY[rank]}s</option>
                  ))}
                </select>
              ) : (
                <span className="bg-black border border-white/10 text-white/50 font-mono font-bold tracking-widest uppercase rounded px-3 py-1 cursor-not-allowed text-xs">
                  {RANK_DISPLAY[gameState.declaredRank!]}s
                </span>
              )}
            </div>
          )}
        </div>

        {canPlay && (
          <button
            onClick={onPlayCards}
            className="
              px-6 py-2 rounded-lg font-mono font-bold text-xs uppercase tracking-[0.2em]
              bg-white text-black
              shadow-[0_0_15px_rgba(255,255,255,0.2)]
              hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:scale-105
              active:scale-95
              transition-all duration-200
            "
          >
            Execute {selectedCardIds.length} Card{selectedCardIds.length > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* Card fan */}
      <div className="flex justify-center gap-1 flex-wrap px-4 pb-4">
        {sortedCards.map((card) => (
          <CardComponent
            key={card.id}
            card={card}
            selected={selectedCardIds.includes(card.id)}
            onClick={() => isMyTurn && onToggleCard(card.id)}
            disabled={!isMyTurn}
          />
        ))}
      </div>

      {/* Card count */}
      <div className="text-center text-white/30 font-mono text-[10px] tracking-widest uppercase">
        {cards.length} card{cards.length !== 1 ? "s" : ""} in hand
        {hasSelection && (
          <span className="text-[#00dbe9]/60 ml-2">
            • {selectedCardIds.length} selected
          </span>
        )}
      </div>
    </div>
  );
}
