package com.bluff.game.model

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Client → Server Messages
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Messages sent from the client to the server over WebSocket.
 *
 * Example JSON:
 * ```json
 * { "type": "JoinLobby", "playerName": "Alice", "sessionId": null }
 * { "type": "StartGame" }
 * { "type": "PlayCards", "cardIds": ["HEARTS_ACE", "SPADES_ACE"], "claimedRank": "ACE" }
 * { "type": "Pass" }
 * { "type": "CallBluff" }
 * ```
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes(
    JsonSubTypes.Type(value = ClientMessage.JoinLobby::class, name = "JoinLobby"),
    JsonSubTypes.Type(value = ClientMessage.StartGame::class, name = "StartGame"),
    JsonSubTypes.Type(value = ClientMessage.PlayCards::class, name = "PlayCards"),
    JsonSubTypes.Type(value = ClientMessage.Pass::class, name = "Pass"),
    JsonSubTypes.Type(value = ClientMessage.CallBluff::class, name = "CallBluff")
)
sealed class ClientMessage {

    /** Player wants to join (or rejoin) a game lobby. */
    data class JoinLobby(
        val playerName: String,
        val sessionId: String?,
        val roomId: String?
    ) : ClientMessage()

    /** Host wants to start the game (requires 3+ players). */
    data object StartGame : ClientMessage()

    /** Player plays cards face-down, claiming they are of [claimedRank]. */
    data class PlayCards(
        val cardIds: List<String>,
        val claimedRank: Rank
    ) : ClientMessage()

    /** Player passes their turn (does not play or call bluff). */
    data object Pass : ClientMessage()

    /** Player challenges the last play as a bluff. */
    data object CallBluff : ClientMessage()
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Server → Client Messages
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes(
    JsonSubTypes.Type(value = ServerMessage.GameStateSync::class, name = "GameStateSync"),
    JsonSubTypes.Type(value = ServerMessage.ActionBroadcast::class, name = "ActionBroadcast"),
    JsonSubTypes.Type(value = ServerMessage.BluffResolution::class, name = "BluffResolution"),
    JsonSubTypes.Type(value = ServerMessage.PileCleared::class, name = "PileCleared"),
    JsonSubTypes.Type(value = ServerMessage.Error::class, name = "Error")
)
sealed class ServerMessage {

    /**
     * Full game state sync, personalized per player.
     *
     * SECURITY: [yourHand] contains ONLY the receiving player's cards.
     * Opponents' hands are represented as [PlayerSummary] with only card counts.
     */
    data class GameStateSync(
        val gameId: String,
        val yourHand: List<Card>,
        val playerSummaries: List<PlayerSummary>,
        val centerPileSize: Int,
        val currentPlayerId: String,
        val declaredRank: Rank?,
        val pileIsEmpty: Boolean,
        val lastPlayerId: String?,
        val phase: GamePhase,
        val canStart: Boolean = false,
        val winnerId: String? = null
    ) : ServerMessage()

    /** Broadcast notification of a player action to all clients. */
    data class ActionBroadcast(
        val playerId: String,
        val action: String,
        val claimedCount: Int? = null,
        val claimedRank: Rank? = null
    ) : ServerMessage()

    /**
     * Result of a bluff challenge, sent to all clients.
     *
     * [revealedCards] are the actual cards from the last play — only revealed
     * after a bluff is called, as per game rules.
     */
    data class BluffResolution(
        val wasBluff: Boolean,
        val bluffCallerId: String,
        val playerId: String,
        val revealedCards: List<Card>,
        val penaltyPlayerId: String,
        val penaltyCardCount: Int
    ) : ServerMessage()

    /** Broadcast when the pile is cleared after a full pass cycle. */
    data class PileCleared(
        val clearedByPlayerId: String,
        val cardCount: Int
    ) : ServerMessage()

    /** Error message sent to a specific client. */
    data class Error(val message: String) : ServerMessage()
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Shared View Models
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * A sanitized player view safe to broadcast to all clients.
 * Exposes card COUNT but never card CONTENTS.
 */
data class PlayerSummary(
    val sessionId: String,
    val displayName: String,
    val cardCount: Int,
    val connected: Boolean
)
