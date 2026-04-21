# Bluff — Multiplayer Card Game

A real-time, 2-to-4 player web-based **Bluff** card game (also known as BS/Cheat).

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Backend  | Kotlin · Spring Boot 4 · WebSockets |
| Frontend | Next.js · React · TypeScript · Tailwind CSS |
| Protocol | JSON over raw WebSockets          |

## Project Structure

```
game/
├── backend/    # Kotlin Spring Boot server
├── frontend/   # Next.js client (coming soon)
```

## Running the Backend

```bash
cd backend
./gradlew bootRun
```

The server starts on `http://localhost:8080` with a WebSocket endpoint at `ws://localhost:8080/ws/game`.

## Game Rules

1. A 52-card deck is shuffled and dealt evenly among 2–4 players.
2. Players take turns claiming to play 1–4 cards of the current target rank face-down.
3. Any opponent can call **"Bluff!"** immediately after a play.
4. If the player lied → they pick up the entire center pile.
5. If the player was truthful → the challenger picks up the pile.
6. First player to empty their hand wins.
