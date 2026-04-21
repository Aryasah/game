package com.bluff.game.model

/**
 * Represents a single playing card in a standard 52-card deck.
 *
 * @property id Unique composite key, e.g. "HEARTS_ACE". Used as the stable
 *              identifier in WebSocket messages (PlayCards sends card IDs).
 * @property suit The suit of the card.
 * @property rank The rank of the card.
 */
data class Card(
    val id: String,
    val suit: Suit,
    val rank: Rank
) {
    companion object {
        /** Generates a full, unshuffled 52-card deck. */
        fun createDeck(): List<Card> =
            Suit.entries.flatMap { suit ->
                Rank.entries.map { rank ->
                    Card(
                        id = "${suit}_${rank}",
                        suit = suit,
                        rank = rank
                    )
                }
            }
    }
}

enum class Suit {
    HEARTS, DIAMONDS, CLUBS, SPADES
}

enum class Rank {
    ACE, TWO, THREE, FOUR, FIVE, SIX, SEVEN,
    EIGHT, NINE, TEN, JACK, QUEEN, KING
}
