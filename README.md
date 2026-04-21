# Bluff — Real-Time Multiplayer Card Game

A real-time web-based "Bluff" (also known as Cheat or BS) card game designed for 3 to 6 players. 

## 🛠️ Tech Stack

* **Backend:** Kotlin (Spring Boot) using WebSockets for real-time bidirectional communication.
* **Frontend:** Next.js (React) with TypeScript and Tailwind CSS.
* **Communication:** JSON payloads over WebSockets.

## 🃏 Core Game Mechanics

1. **Setup:** A standard 52-card deck is shuffled and distributed as evenly as possible among 3 to 6 connected players.
2. **Initiating a Pile:** When the center pile is empty, the starting player selects 1 to 4 cards from their hand, places them face-down in the center, and explicitly chooses and declares a rank (e.g., "I am playing two Kings"). 
3. **Turn Actions:** The turn moves to the next player. They have three options:
   * **Play:** Add 1 to 4 cards face-down to the center pile, claiming they match the *currently declared rank*.
   * **Pass:** Choose not to play any cards. Turn passes to the next player. 
   * **Call Bluff:** Challenge the play of the *immediately preceding* player who put cards down.
4. **The Pass Cycle (Clearing the Pile):** If a player plays cards, and every subsequent player consecutively chooses to "Pass" so that the turn comes back to the last player who played, the center pile is permanently removed/discarded from the game. The player who successfully got away with their play starts a new pile by playing cards and declaring a new rank.
5. **Bluff Resolution:** If "Bluff" is called, only the cards *most recently played* by the challenged player are revealed.
   * **Liar:** If the revealed cards do not exactly match the declared rank, the challenged player picks up the entire center pile.
   * **Truth:** If the revealed cards match the declared rank, the challenger picks up the entire center pile.
   * After a bluff is resolved, the center pile is cleared into the loser's hand, and the winner of the challenge starts a new pile by declaring any rank.
6. **Win Condition:** The first player to empty their hand wins.

## 🏗️ Architecture & State Management

### Server-Authoritative Security
The Kotlin backend holds the absolute source of truth. The client only receives data it is permitted to see. The server **NEVER** transmits an opponent's hidden cards to a client to prevent cheating via client-side code inspection.

### State Tracking
The backend meticulously tracks:
* Current turn index.
* The currently declared rank of the active pile.
* The "last player to play cards" (essential for the pass cycle and resolving bluff targets).
* A sequential counter of consecutive passes to trigger a pile wipe.

### WebSocket Event Dictionary
* **Client ➡️ Server:**
  * `JoinLobby`: Join the game room.
  * `InitiatePile`: Start a pile with card IDs and a chosen rank.
  * `PlayCards`: Play card IDs matching the current rank.
  * `PassTurn`: Pass the turn to the next player.
  * `CallBluff`: Challenge the previous play.
* **Server ➡️ Client:**
  * `GameStateSync`: Syncs public state (hand size of all players, center pile size, current declared rank, active turn).
  * `ActionBroadcast`: A log of who did what.
  * `BluffResolution`: Outcome of a bluff (who won/lost, cards revealed).
  * `PileCleared`: Notification that the pile was discarded.

## 📁 Repository Structure

* `/backend` - Kotlin Spring Boot server housing the game engine, state management, and WebSocket handlers.
* `/frontend` - Next.js React client featuring a responsive, custom dark tech-noir UI aesthetic.
