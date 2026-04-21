package com.bluff.game.model

/**
 * The complete server-side state of a single Bluff game.
 *
 * This is the authoritative source of truth. Clients never receive a raw GameState;
 * they receive a sanitized [ServerMessage.GameStateSync] tailored to their perspective.
 *
 * @property gameId Unique identifier for this game session.
 * @property players Ordered list of players. Turn order follows list index.
 * @property centerPile All cards currently in the face-down center pile.
 * @property currentPlayerIndex Index into [players] for whose turn it is.
 * @property declaredRank The rank declared for the current pile. Null when pile is empty.
 * @property lastPlay Details of the most recent card play — used for bluff resolution.
 * @property consecutivePasses Count of consecutive passes since the last card play.
 * @property lastPlayingPlayerIndex Index of the last player who actually played cards.
 * @property phase Current phase of the game state machine.
 * @property winnerId SessionId of the winner, if [phase] is [GamePhase.GAME_OVER].
 */
data class GameState(
    val gameId: String,
    val players: MutableList<Player>,
    val centerPile: MutableList<Card> = mutableListOf(),
    var currentPlayerIndex: Int = 0,
    var declaredRank: Rank? = null,
    var lastPlay: LastPlay? = null,
    var consecutivePasses: Int = 0,
    var lastPlayingPlayerIndex: Int? = null,
    var phase: GamePhase = GamePhase.WAITING_FOR_PLAYERS,
    var winnerId: String? = null
) {
    /** Returns the player whose turn it currently is. */
    fun currentPlayer(): Player = players[currentPlayerIndex]

    /**
     * Advances the turn to the next connected player.
     * Skips disconnected players.
     */
    fun advanceTurn() {
        do {
            currentPlayerIndex = (currentPlayerIndex + 1) % players.size
        } while (!players[currentPlayerIndex].connected && players.any { it.connected })
    }

    /** Returns the number of currently connected players. */
    fun connectedPlayerCount(): Int = players.count { it.connected }

    /** Finds a player by their sessionId, or null if not found. */
    fun findPlayer(sessionId: String): Player? =
        players.find { it.sessionId == sessionId }

    /** Whether the pile is empty (next player must start a new pile). */
    fun isPileEmpty(): Boolean = centerPile.isEmpty()
}

/**
 * Records the details of the most recent card play for bluff resolution.
 *
 * SECURITY: [actualCards] must NEVER be serialized or sent to any client.
 * It is used exclusively by the server to determine the truth when a bluff is called.
 */
data class LastPlay(
    val playerId: String,
    val claimedRank: Rank,
    val claimedCount: Int,
    val actualCards: List<Card>
)

/**
 * State machine phases for a Bluff game.
 */
enum class GamePhase {
    /** Lobby is open, waiting for 3-6 players to join. */
    WAITING_FOR_PLAYERS,

    /** Game is actively being played. Players Play/Pass/Call Bluff on their turn. */
    IN_PROGRESS,

    /** A player has emptied their hand — game is over. */
    GAME_OVER
}
