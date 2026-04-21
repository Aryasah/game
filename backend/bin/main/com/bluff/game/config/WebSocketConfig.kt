package com.bluff.game.config

import com.bluff.game.handler.GameWebSocketHandler
import org.springframework.context.annotation.Configuration
import org.springframework.web.socket.config.annotation.EnableWebSocket
import org.springframework.web.socket.config.annotation.WebSocketConfigurer
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry

/**
 * Registers the raw WebSocket endpoint at /ws/game.
 *
 * We use raw WebSockets (not STOMP) because:
 * - The game has a custom event dictionary (PlayCards, CallBluff, etc.)
 * - We need fine-grained per-connection session tracking for reconnects
 * - STOMP's pub/sub model adds unnecessary overhead for a turn-based game
 */
@Configuration
@EnableWebSocket
class WebSocketConfig(
    private val gameWebSocketHandler: GameWebSocketHandler
) : WebSocketConfigurer {

    override fun registerWebSocketHandlers(registry: WebSocketHandlerRegistry) {
        registry
            .addHandler(gameWebSocketHandler, "/ws/game")
            .setAllowedOrigins("*") // Allow all origins in dev; restrict in production
    }
}
