"use client";

import React from "react";
import { type Card, SUIT_SYMBOLS, RANK_DISPLAY, isRedSuit } from "@/types/game";

interface CardComponentProps {
  card?: Card;
  faceDown?: boolean;
  selected?: boolean;
  small?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  flipping?: boolean;
}

export default function CardComponent({
  card,
  faceDown = false,
  selected = false,
  small = false,
  onClick,
  disabled = false,
  flipping = false,
}: CardComponentProps) {
  const sizeClass = small
    ? "w-12 h-[4.5rem] text-xs"
    : "w-20 h-[7.5rem] text-base";

  if (faceDown || !card) {
    return (
      <div
        className={`
          ${sizeClass} rounded-lg flex-shrink-0
          bg-gradient-to-br from-[#1a0a0a] via-[#0a0a0a] to-[#1a0a0a]
          border border-[#ff525c]/20
          shadow-lg shadow-[#ff525c]/5
          flex items-center justify-center
          select-none
          ${flipping ? "animate-card-flip" : ""}
        `}
      >
        <div className="w-[70%] h-[75%] rounded border border-[#ff525c]/10 bg-[#ff525c]/[0.03] flex items-center justify-center">
          <span className="text-[#ff525c]/30 font-serif text-lg">✦</span>
        </div>
      </div>
    );
  }

  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const rankLabel = RANK_DISPLAY[card.rank];
  const isRed = isRedSuit(card.suit);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClass} rounded-lg flex-shrink-0
        bg-gradient-to-b from-[#faf8f4] to-[#e8e4dc]
        border-2 transition-all duration-200 ease-out
        flex flex-col items-center justify-between
        p-1.5 cursor-pointer select-none
        ${flipping ? "animate-card-flip" : ""}
        ${
          selected
            ? "border-[#00dbe9] shadow-lg shadow-[#00dbe9]/40 -translate-y-3 scale-105"
            : "border-white/20 shadow-md hover:shadow-lg hover:-translate-y-1 hover:border-white/40"
        }
        ${disabled ? "opacity-50 cursor-not-allowed hover:translate-y-0" : ""}
      `}
    >
      <div
        className={`self-start font-bold leading-none ${
          isRed ? "text-[#ff525c]" : "text-[#1a1a1a]"
        } ${small ? "text-[10px]" : "text-sm"}`}
      >
        {rankLabel}
        <br />
        {suitSymbol}
      </div>
      <div
        className={`${isRed ? "text-[#ff525c]" : "text-[#1a1a1a]"} ${
          small ? "text-xl" : "text-3xl"
        } leading-none`}
      >
        {suitSymbol}
      </div>
      <div
        className={`self-end rotate-180 font-bold leading-none ${
          isRed ? "text-[#ff525c]" : "text-[#1a1a1a]"
        } ${small ? "text-[10px]" : "text-sm"}`}
      >
        {rankLabel}
        <br />
        {suitSymbol}
      </div>
    </button>
  );
}
