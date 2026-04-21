package com.bluff.game.model

/**
 * Represents a player in a Bluff game.
 *
 * @property sessionId UUID assigned on first join — survives reconnects.
 *                     This is the primary identifier for a player across connections.
 * @property displayName Human-readable name chosen by the player.
 * @property hand The player's current hand. Mutable because cards are added/removed
 *               as the game progresses.
 * @property connected Whether the player's WebSocket connection is currently active.
 *                     Set to false on disconnect; the player can rejoin using their sessionId.
 */
data class Player(
    val sessionId: String,
    var displayName: String,
    val hand: MutableList<Card> = mutableListOf(),
    var connected: Boolean = true
) {
    /** Returns a sanitized summary safe to broadcast to all players. */
    fun toSummary(): PlayerSummary = PlayerSummary(
        sessionId = sessionId,
        displayName = displayName,
        cardCount = hand.size,
        connected = connected
    )
}
