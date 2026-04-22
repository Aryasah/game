package com.bluff.game.service

import com.bluff.game.model.*
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

/**
 * Core game logic for the Bluff card game.
 *
 * This service manages multiple rooms (games) concurrently.
 */
@Service
class GameService {

    private val log = LoggerFactory.getLogger(GameService::class.java)

    // Maps roomId (4 chars) to GameState
    private val games = ConcurrentHashMap<String, GameState>()

    companion object {
        const val MIN_PLAYERS = 3
        const val MAX_PLAYERS = 6
        const val MIN_CARDS_PER_PLAY = 1
        const val MAX_CARDS_PER_PLAY = 4
    }

    // ──────────────────────────────────────────────────────────────────────
    //  Lobby Management
    // ──────────────────────────────────────────────────────────────────────

    fun joinOrRejoin(playerName: String, existingSessionId: String?, requestedRoomId: String?): Pair<String, String> {
        val roomId = requestedRoomId?.uppercase()?.take(4)?.trim()?.ifEmpty { generateRoomId() } ?: generateRoomId()

        var currentGame = games[roomId]

        if (existingSessionId != null && currentGame != null) {
            val existingPlayer = currentGame.findPlayer(existingSessionId)
            if (existingPlayer != null) {
                existingPlayer.connected = true
                existingPlayer.displayName = playerName
                log.info("Player reconnected: sessionId=$existingSessionId, name=$playerName, room=$roomId")
                return Pair(existingSessionId, roomId)
            }
        }

        if (currentGame == null) {
            currentGame = GameState(
                gameId = roomId,
                players = mutableListOf()
            )
            games[roomId] = currentGame
            log.info("New room created: $roomId")
        }

        if (currentGame.phase != GamePhase.WAITING_FOR_PLAYERS) {
            throw IllegalStateException("Game in room $roomId is already in progress.")
        }
        if (currentGame.players.size >= MAX_PLAYERS) {
            throw IllegalStateException("Room $roomId is full ($MAX_PLAYERS players max).")
        }

        val sessionId = existingSessionId ?: UUID.randomUUID().toString()
        val player = Player(sessionId = sessionId, displayName = playerName)
        currentGame.players.add(player)
        log.info("New player joined: sessionId=$sessionId, name=$playerName, room=$roomId (${currentGame.players.size}/$MAX_PLAYERS)")

        return Pair(sessionId, roomId)
    }

    private fun generateRoomId(): String {
        val chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        var code: String
        do {
            code = (1..4).map { chars.random() }.joinToString("")
        } while (games.containsKey(code))
        return code
    }

    fun startGame(roomId: String, requestingSessionId: String): String? {
        val currentGame = games[roomId] ?: return "No active game in room $roomId."
        if (currentGame.phase != GamePhase.WAITING_FOR_PLAYERS) return "Game is already in progress."
        if (currentGame.players.size < MIN_PLAYERS) return "Need at least $MIN_PLAYERS players to start."
        if (currentGame.findPlayer(requestingSessionId) == null) return "You are not in the room."

        val deck = Card.createDeck().shuffled().toMutableList()
        val playerCount = currentGame.players.size

        var cardIndex = 0
        while (cardIndex < deck.size) {
            val playerIndex = cardIndex % playerCount
            currentGame.players[playerIndex].hand.add(deck[cardIndex])
            cardIndex++
        }

        currentGame.phase = GamePhase.IN_PROGRESS
        currentGame.currentPlayerIndex = 0
        currentGame.declaredRank = null
        currentGame.lastPlay = null
        currentGame.consecutivePasses = 0
        currentGame.lastPlayingPlayerIndex = null
        
        log.info("Game started in room $roomId: ${currentGame.players.size} players, ${deck.size} cards dealt")
        return null
    }

    // ──────────────────────────────────────────────────────────────────────
    //  Game Flow
    // ──────────────────────────────────────────────────────────────────────

    fun playCards(roomId: String, playerSessionId: String, cardIds: List<String>, claimedRank: Rank): String? {
        val currentGame = games[roomId] ?: return "No active game."
        if (currentGame.phase != GamePhase.IN_PROGRESS) return "Game is not in progress."

        val player = currentGame.findPlayer(playerSessionId) ?: return "Player not found."
        if (currentGame.currentPlayer().sessionId != playerSessionId) return "It's not your turn."

        if (cardIds.isEmpty() || cardIds.size > MAX_CARDS_PER_PLAY) {
            return "You must play between $MIN_CARDS_PER_PLAY and $MAX_CARDS_PER_PLAY cards."
        }

        if (currentGame.isPileEmpty()) {
            currentGame.declaredRank = claimedRank
        } else {
            if (claimedRank != currentGame.declaredRank) {
                return "You must claim rank ${currentGame.declaredRank}."
            }
        }

        val cardsToPlay = cardIds.mapNotNull { id -> player.hand.find { it.id == id } }
        if (cardsToPlay.size != cardIds.size) {
            return "You don't have all of those cards."
        }

        player.hand.removeAll(cardsToPlay.toSet())
        currentGame.centerPile.addAll(cardsToPlay)
        
        currentGame.lastPlay = LastPlay(
            playerId = playerSessionId,
            claimedRank = claimedRank,
            claimedCount = cardsToPlay.size,
            actualCards = cardsToPlay
        )
        currentGame.lastPlayingPlayerIndex = currentGame.currentPlayerIndex
        currentGame.consecutivePasses = 0

        if (player.hand.isEmpty()) {
            currentGame.phase = GamePhase.GAME_OVER
            currentGame.winnerId = playerSessionId
            log.info("Game over in room $roomId! Winner: $playerSessionId")
            return null
        }

        advanceTurnSkippingDisconnected(currentGame)
        log.info("Room $roomId: Player $playerSessionId played ${cardsToPlay.size} card(s), claimed $claimedRank")
        return null
    }

    fun passTurn(roomId: String, playerSessionId: String): Pair<String?, Boolean> {
        val currentGame = games[roomId] ?: return Pair("No active game.", false)
        if (currentGame.phase != GamePhase.IN_PROGRESS) return Pair("Game is not in progress.", false)
        if (currentGame.currentPlayer().sessionId != playerSessionId) return Pair("It's not your turn.", false)
        if (currentGame.isPileEmpty()) return Pair("You cannot pass on an empty pile. You must play.", false)

        currentGame.consecutivePasses++
        log.info("Room $roomId: Player $playerSessionId passed.")

        val activePlayers = currentGame.connectedPlayerCount()
        // If everyone else passed since the last play, the cycle is complete.
        if (currentGame.consecutivePasses >= activePlayers - 1) {
            // Pile clears
            currentGame.centerPile.clear()
            currentGame.declaredRank = null
            currentGame.lastPlay = null
            currentGame.consecutivePasses = 0
            
            // Turn goes back to the person who last played
            currentGame.currentPlayerIndex = currentGame.lastPlayingPlayerIndex ?: 0
            // Ensure they are connected
            if (!currentGame.currentPlayer().connected) {
                advanceTurnSkippingDisconnected(currentGame)
            }
            log.info("Room $roomId: Pass cycle complete. Pile cleared.")
            return Pair(null, true)
        } else {
            advanceTurnSkippingDisconnected(currentGame)
            return Pair(null, false)
        }
    }

    fun callBluff(roomId: String, callerSessionId: String): ServerMessage.BluffResolution? {
        val currentGame = games[roomId] ?: return null
        if (currentGame.phase != GamePhase.IN_PROGRESS) return null

        val lastPlay = currentGame.lastPlay ?: return null
        if (lastPlay.playerId == callerSessionId) return null 

        val caller = currentGame.findPlayer(callerSessionId) ?: return null
        val player = currentGame.findPlayer(lastPlay.playerId) ?: return null

        val wasBluff = lastPlay.actualCards.any { it.rank != lastPlay.claimedRank }

        val penaltyPlayer: Player
        val winnerPlayer: Player
        if (wasBluff) {
            penaltyPlayer = player
            winnerPlayer = caller
        } else {
            penaltyPlayer = caller
            winnerPlayer = player
        }

        val penaltyCardCount = currentGame.centerPile.size
        penaltyPlayer.hand.addAll(currentGame.centerPile)
        currentGame.centerPile.clear()
        
        currentGame.lastPlay = null
        currentGame.declaredRank = null
        currentGame.consecutivePasses = 0
        
        // Winner of the challenge gets to start the next pile
        val winnerIndex = currentGame.players.indexOf(winnerPlayer)
        currentGame.currentPlayerIndex = winnerIndex
        if (!currentGame.currentPlayer().connected) {
             advanceTurnSkippingDisconnected(currentGame)
        }

        log.info("Room $roomId: Bluff called by $callerSessionId on ${lastPlay.playerId}. wasBluff=$wasBluff")

        return ServerMessage.BluffResolution(
            wasBluff = wasBluff,
            bluffCallerId = callerSessionId,
            playerId = lastPlay.playerId,
            revealedCards = lastPlay.actualCards,
            penaltyPlayerId = penaltyPlayer.sessionId,
            penaltyCardCount = penaltyCardCount
        )
    }

    // ──────────────────────────────────────────────────────────────────────
    //  Session Management & Helpers
    // ──────────────────────────────────────────────────────────────────────

    private fun advanceTurnSkippingDisconnected(game: GameState) {
        var attempts = 0
        do {
            game.advanceTurn()
            attempts++
        } while (!game.currentPlayer().connected && attempts < game.players.size)
        
        // If everyone disconnected, end game? Handled elsewhere ideally.
    }

    fun markPlayerDisconnected(roomId: String, playerSessionId: String) {
        val currentGame = games[roomId] ?: return
        val player = currentGame.findPlayer(playerSessionId) ?: return
        
        player.connected = false
        log.info("Room $roomId: Player marked as disconnected: sessionId=$playerSessionId")

        // Clean up room if empty
        if (currentGame.connectedPlayerCount() == 0) {
            games.remove(roomId)
            log.info("Room $roomId: All players disconnected. Room destroyed.")
            return
        }
    }

    /** Returns true if an auto-pass was actually performed and the pile was cleared. Returns Pair(didAction, wasCleared) */
    fun autoPassIfDisconnected(roomId: String, playerSessionId: String): Pair<Boolean, Boolean> {
        val currentGame = games[roomId] ?: return Pair(false, false)
        val player = currentGame.findPlayer(playerSessionId) ?: return Pair(false, false)
        
        if (!player.connected && currentGame.currentPlayer().sessionId == playerSessionId && currentGame.phase == GamePhase.IN_PROGRESS) {
            if (currentGame.isPileEmpty()) {
                advanceTurnSkippingDisconnected(currentGame)
                log.info("Room $roomId: Auto-skipped disconnected player's turn.")
                return Pair(true, false)
            } else {
                // Force pass
                val (_, wasCleared) = passTurn(roomId, playerSessionId)
                log.info("Room $roomId: Auto-passed disconnected player's turn.")
                return Pair(true, wasCleared)
            }
        }
        return Pair(false, false)
    }

    fun leaveRoom(roomId: String, playerSessionId: String) {
        val currentGame = games[roomId] ?: return
        val player = currentGame.findPlayer(playerSessionId) ?: return

        if (currentGame.phase == GamePhase.WAITING_FOR_PLAYERS) {
            currentGame.players.remove(player)
            log.info("Room $roomId: Player left: sessionId=$playerSessionId")
            
            if (currentGame.players.isEmpty()) {
                games.remove(roomId)
                log.info("Room $roomId: All players left. Room destroyed.")
            }
        } else {
            // If the game is already in progress, we treat leaving as a permanent disconnect
            markPlayerDisconnected(roomId, playerSessionId)
            autoPassIfDisconnected(roomId, playerSessionId)
        }
    }

    fun getGameState(roomId: String): GameState? = games[roomId]
}
