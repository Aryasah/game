package com.bluff.game.handler

import com.bluff.game.model.ClientMessage
import com.bluff.game.model.ServerMessage
import com.bluff.game.service.GameService
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler
import java.util.concurrent.ConcurrentHashMap

@Component
class GameWebSocketHandler(
    private val objectMapper: ObjectMapper,
    private val gameService: GameService
) : TextWebSocketHandler() {

    private val log = LoggerFactory.getLogger(GameWebSocketHandler::class.java)

    // Maps WebSocket Session ID to Player Session ID
    private val wsSessionToPlayerSession = ConcurrentHashMap<String, String>()
    // Maps Player Session ID to Room ID
    private val playerSessionToRoomId = ConcurrentHashMap<String, String>()
    // Maps Player Session ID to WebSocket Session
    val playerSessionToWsSession = ConcurrentHashMap<String, WebSocketSession>()

    override fun afterConnectionEstablished(session: WebSocketSession) {
        log.info("WebSocket connection established: ${session.id}")
    }

    override fun handleTextMessage(session: WebSocketSession, message: TextMessage) {
        try {
            val clientMessage = objectMapper.readValue<ClientMessage>(message.payload)
            log.debug("Received from {}: {}", session.id, clientMessage)

            when (clientMessage) {
                is ClientMessage.JoinLobby -> handleJoinLobby(session, clientMessage)
                is ClientMessage.StartGame -> handleStartGame(session)
                is ClientMessage.PlayCards -> handlePlayCards(session, clientMessage)
                is ClientMessage.Pass -> handlePass(session)
                is ClientMessage.CallBluff -> handleCallBluff(session)
            }
        } catch (e: Exception) {
            log.error("Error processing message from ${session.id}: ${e.message}", e)
            sendMessage(session, ServerMessage.Error("Invalid message: ${e.message}"))
        }
    }

    override fun afterConnectionClosed(session: WebSocketSession, status: CloseStatus) {
        val playerSessionId = wsSessionToPlayerSession.remove(session.id)
        if (playerSessionId != null) {
            playerSessionToWsSession.remove(playerSessionId)
            val roomId = playerSessionToRoomId[playerSessionId]
            
            if (roomId != null) {
                gameService.handleDisconnect(roomId, playerSessionId)
                log.info("Player disconnected: sessionId=$playerSessionId, room=$roomId, wsId=${session.id}, status=$status")
                broadcastGameState(roomId)
            }
        }
    }

    private fun handleJoinLobby(session: WebSocketSession, msg: ClientMessage.JoinLobby) {
        try {
            val (playerSessionId, roomId) = gameService.joinOrRejoin(msg.playerName, msg.sessionId, msg.roomId)
            
            wsSessionToPlayerSession[session.id] = playerSessionId
            playerSessionToRoomId[playerSessionId] = roomId
            playerSessionToWsSession[playerSessionId] = session
            
            broadcastGameState(roomId)
        } catch (e: Exception) {
            sendMessage(session, ServerMessage.Error(e.message ?: "Could not join lobby"))
        }
    }

    private fun handleStartGame(session: WebSocketSession) {
        val playerSessionId = wsSessionToPlayerSession[session.id] ?: return
        val roomId = playerSessionToRoomId[playerSessionId] ?: return

        val result = gameService.startGame(roomId, playerSessionId)
        if (result != null) {
            sendMessage(session, ServerMessage.Error(result))
            return
        }

        broadcastGameState(roomId)
    }

    private fun handlePlayCards(session: WebSocketSession, msg: ClientMessage.PlayCards) {
        val playerSessionId = wsSessionToPlayerSession[session.id] ?: return
        val roomId = playerSessionToRoomId[playerSessionId] ?: return

        val result = gameService.playCards(roomId, playerSessionId, msg.cardIds, msg.claimedRank)
        if (result != null) {
            sendMessage(session, ServerMessage.Error(result))
            return
        }

        broadcastAction(roomId, playerSessionId, "PLAYED_CARDS", msg.cardIds.size, msg.claimedRank)
        broadcastGameState(roomId)
    }

    private fun handlePass(session: WebSocketSession) {
        val playerSessionId = wsSessionToPlayerSession[session.id] ?: return
        val roomId = playerSessionToRoomId[playerSessionId] ?: return

        val (error, wasCleared) = gameService.passTurn(roomId, playerSessionId)
        if (error != null) {
            sendMessage(session, ServerMessage.Error(error))
            return
        }

        broadcastAction(roomId, playerSessionId, "PASSED")
        
        if (wasCleared) {
            broadcastToRoom(roomId, ServerMessage.PileCleared(playerSessionId, 0))
        }
        
        broadcastGameState(roomId)
    }

    private fun handleCallBluff(session: WebSocketSession) {
        val playerSessionId = wsSessionToPlayerSession[session.id] ?: return
        val roomId = playerSessionToRoomId[playerSessionId] ?: return

        val resolution = gameService.callBluff(roomId, playerSessionId)
        if (resolution == null) {
            sendMessage(session, ServerMessage.Error("Cannot call bluff right now."))
            return
        }

        broadcastToRoom(roomId, resolution)
        broadcastGameState(roomId)
    }

    fun broadcastGameState(roomId: String) {
        val game = gameService.getGameState(roomId) ?: return

        for (player in game.players) {
            val wsSession = playerSessionToWsSession[player.sessionId] ?: continue
            if (!wsSession.isOpen) continue

            val canStart = game.phase == com.bluff.game.model.GamePhase.WAITING_FOR_PLAYERS &&
                           game.players.size >= GameService.MIN_PLAYERS

            val sync = ServerMessage.GameStateSync(
                gameId = game.gameId, // gameId is now roomId
                yourHand = player.hand.toList(),
                playerSummaries = game.players.map { it.toSummary() },
                centerPileSize = game.centerPile.size,
                currentPlayerId = game.currentPlayer().sessionId,
                declaredRank = game.declaredRank,
                pileIsEmpty = game.isPileEmpty(),
                lastPlayerId = game.lastPlay?.playerId,
                phase = game.phase,
                canStart = canStart,
                winnerId = game.winnerId
            )
            sendMessage(wsSession, sync)
        }
    }

    private fun broadcastAction(
        roomId: String,
        playerId: String,
        action: String,
        claimedCount: Int? = null,
        claimedRank: com.bluff.game.model.Rank? = null
    ) {
        val msg = ServerMessage.ActionBroadcast(
            playerId = playerId,
            action = action,
            claimedCount = claimedCount,
            claimedRank = claimedRank
        )
        broadcastToRoom(roomId, msg)
    }

    private fun broadcastToRoom(roomId: String, message: ServerMessage) {
        val game = gameService.getGameState(roomId) ?: return
        for (player in game.players) {
            val wsSession = playerSessionToWsSession[player.sessionId]
            if (wsSession != null && wsSession.isOpen) {
                sendMessage(wsSession, message)
            }
        }
    }

    private fun sendMessage(session: WebSocketSession, message: ServerMessage) {
        try {
            val json = objectMapper.writeValueAsString(message)
            session.sendMessage(TextMessage(json))
        } catch (e: Exception) {
            log.error("Failed to send message to ${session.id}: ${e.message}", e)
        }
    }
}
