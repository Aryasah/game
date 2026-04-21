"use client";
import React, { createContext, useContext } from 'react';
import { useGameSocket } from '../hooks/useGameSocket';

type GameContextType = ReturnType<typeof useGameSocket>;

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const socketState = useGameSocket();

  return (
    <GameContext.Provider value={socketState}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
