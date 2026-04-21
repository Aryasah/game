"use client";

import React from "react";
import { type PlayerSummary } from "@/types/game";
import CardComponent from "./CardComponent";

interface OpponentRowProps {
  opponents: PlayerSummary[];
  currentPlayerId: string;
}

export default function OpponentRow({
  opponents,
  currentPlayerId,
}: OpponentRowProps) {
  return (
    <div className="flex justify-center gap-6 flex-wrap">
      {opponents.map((player) => {
        const isCurrentTurn = player.sessionId === currentPlayerId;
        const cardBacks = Math.min(player.cardCount, 7);

        return (
          <div
            key={player.sessionId}
            className={`
              flex flex-col items-center gap-2 p-4 rounded-lg
              transition-all duration-300
              ${
                isCurrentTurn
                  ? "bg-[#ff525c]/[0.06] border border-[#ff525c]/20 shadow-lg shadow-[#ff525c]/5"
                  : "bg-white/[0.02] border border-white/[0.04]"
              }
            `}
          >
            {/* Player info */}
            <div className="flex items-center gap-2">
              <div
                className={`
                  w-2 h-2 rounded-full
                  ${player.connected ? "bg-[#00dbe9] shadow-sm shadow-[#00dbe9]/50" : "bg-[#ff525c]/50"}
                `}
              />
              <span
                className={`
                  text-sm font-mono font-semibold tracking-wide
                  ${isCurrentTurn ? "text-[#ff525c]" : "text-white/50"}
                `}
              >
                {player.displayName}
              </span>
              {isCurrentTurn && (
                <span className="text-[#ff525c] text-xs animate-pulse">⚡</span>
              )}
            </div>

            {/* Card backs */}
            <div className="flex -space-x-6">
              {Array.from({ length: cardBacks }).map((_, i) => (
                <div key={i} style={{ zIndex: i }}>
                  <CardComponent faceDown small />
                </div>
              ))}
            </div>

            {/* Card count */}
            <span className="text-white/20 text-[10px] font-mono tracking-widest">
              {player.cardCount} card{player.cardCount !== 1 ? "s" : ""}
            </span>

            {/* Disconnected overlay */}
            {!player.connected && (
              <span className="text-[#ff525c]/60 text-[10px] font-mono italic tracking-wide">Disconnected</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
