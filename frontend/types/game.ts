export type Suit = 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES';

export type Rank = 
  | 'ACE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE' | 'SIX' | 'SEVEN'
  | 'EIGHT' | 'NINE' | 'TEN' | 'JACK' | 'QUEEN' | 'KING';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export type GamePhase = 
  | 'WAITING_FOR_PLAYERS'
  | 'IN_PROGRESS'
  | 'GAME_OVER';

export interface PlayerSummary {
  sessionId: string;
  displayName: string;
  cardCount: Int;
  connected: boolean;
}

export interface GameStateSync {
  type: 'GameStateSync';
  gameId: string;
  yourHand: Card[];
  playerSummaries: PlayerSummary[];
  centerPileSize: Int;
  currentPlayerId: string;
  declaredRank: Rank | null;
  pileIsEmpty: boolean;
  lastPlayerId: string | null;
  phase: GamePhase;
  canStart: boolean;
  winnerId?: string | null;
}

export interface ActionBroadcast {
  type: 'ActionBroadcast';
  playerId: string;
  action: string;
  claimedCount?: Int;
  claimedRank?: Rank;
}

export interface BluffResolution {
  type: 'BluffResolution';
  wasBluff: boolean;
  bluffCallerId: string;
  playerId: string;
  revealedCards: Card[];
  penaltyPlayerId: string;
  penaltyCardCount: Int;
}

export interface PileCleared {
  type: 'PileCleared';
  clearedByPlayerId: string;
  cardCount: Int;
}

export interface ErrorMessage {
  type: 'Error';
  message: string;
}

export type ServerMessage = 
  | GameStateSync 
  | ActionBroadcast 
  | BluffResolution 
  | PileCleared
  | ErrorMessage;

export type ClientMessage =
  | { type: 'JoinLobby'; playerName: string; sessionId?: string | null; roomId?: string | null }
  | { type: 'StartGame' }
  | { type: 'PlayCards'; cardIds: string[]; claimedRank: Rank }
  | { type: 'Pass' }
  | { type: 'CallBluff' };

export const RANK_DISPLAY: Record<Rank, string> = {
  ACE: 'A', TWO: '2', THREE: '3', FOUR: '4', FIVE: '5', SIX: '6', SEVEN: '7',
  EIGHT: '8', NINE: '9', TEN: '10', JACK: 'J', QUEEN: 'Q', KING: 'K'
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  HEARTS: '♥', DIAMONDS: '♦', CLUBS: '♣', SPADES: '♠'
};

export const isRedSuit = (suit: Suit) => suit === 'HEARTS' || suit === 'DIAMONDS';

export type Int = number;
