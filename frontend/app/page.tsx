"use client";

import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { LobbyScreen } from "@/components/LobbyScreen";
import { GameTable } from "@/components/GameTable";
import { LandingPage } from "./LandingPage";

export default function Home() {
  const { gameState } = useGame();
  const [showLobby, setShowLobby] = useState(false);

  // Show game if game state exists and we're not waiting for players
  const inGame =
    gameState &&
    gameState.phase !== 'WAITING_FOR_PLAYERS';

  if (inGame) {
    return <GameTable />;
  }

  if (showLobby) {
    return (
      <main className="flex flex-col min-h-screen">
        <LobbyScreen />
      </main>
    );
  }

  return (
    <LandingPage 
      onJoinGame={() => setShowLobby(true)} 
      onCreateLobby={() => setShowLobby(true)} 
    />
  );
}
