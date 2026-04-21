package com.bluff.game.config

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

/**
 * Provides an explicit Jackson ObjectMapper bean configured with the Kotlin module.
 *
 * This ensures proper (de)serialization of Kotlin data classes, sealed classes,
 * and data objects used in the WebSocket message protocol.
 */
@Configuration
class JacksonConfig {

    @Bean
    fun objectMapper(): ObjectMapper = jacksonObjectMapper()
}
