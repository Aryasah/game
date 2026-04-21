"use client";

import React, { useEffect, useState } from "react";
import { type PlayerSummary } from "@/types/game";

interface GameOverOverlayProps {
  winnerId: string | null;
  players: PlayerSummary[];
  mySessionId: string | null;
}

export default function GameOverOverlay({
  winnerId,
  players,
  mySessionId,
}: GameOverOverlayProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const winner = players.find((p) => p.sessionId === winnerId);
  const isMe = winnerId === mySessionId;

  useEffect(() => {
    if (!winnerId) return;
    const timer = setTimeout(() => setShowConfetti(true), 300);
    return () => clearTimeout(timer);
  }, [winnerId]);

  if (!winnerId) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-black/90 backdrop-blur-xl
        flex items-center justify-center
        animate-fade-in
      "
    >
      {/* Background Glow */}
      <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${isMe ? 'from-[#00dbe9]/20' : 'from-[#ff525c]/20'} via-transparent to-transparent pointer-events-none opacity-50`} />

      {/* Tech Particles */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-5%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            >
              <div
                className="w-1 h-3 rounded-full opacity-60"
                style={{
                  backgroundColor: [
                    "#00dbe9",
                    "#ff525c",
                    "#ffffff",
                  ][i % 3],
                  boxShadow: `0 0 8px ${["#00dbe9", "#ff525c", "#ffffff"][i % 3]}`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="text-center z-10 relative">
        {/* Crown/Icon */}
        <div className="text-6xl mb-6 animate-bounce-slow drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          {isMe ? "🏆" : "💀"}
        </div>

        {/* Winner text */}
        <h1
          className={`
            text-6xl font-black mb-4 tracking-tighter uppercase
            bg-gradient-to-b from-white to-white/40
            bg-clip-text text-transparent
          `}
        >
          {isMe ? "VICTORY" : `${winner?.displayName || "UNKNOWN"} SURVIVED`}
        </h1>

        <p className="text-white/40 text-sm mb-10 font-mono tracking-widest uppercase">
          {isMe
            ? "Protocol Complete. Hand Emptied."
            : `Protocol Failed. ${winner?.displayName} emptied their hand.`}
        </p>

        {/* Play again */}
        <button
          onClick={() => {
            sessionStorage.removeItem("bluff_session_id");
            sessionStorage.removeItem("bluff_player_name");
            sessionStorage.removeItem("bluff_room_id");
            window.location.reload();
          }}
          className="
            px-8 py-4 rounded-lg
            font-mono font-bold text-sm uppercase tracking-[0.2em]
            bg-white text-black
            shadow-[0_0_20px_rgba(255,255,255,0.2)]
            hover:shadow-[0_0_35px_rgba(255,255,255,0.4)] hover:scale-105
            active:scale-95
            transition-all duration-300
          "
        >
          Re-Initialize
        </button>
      </div>
    </div>
  );
}
