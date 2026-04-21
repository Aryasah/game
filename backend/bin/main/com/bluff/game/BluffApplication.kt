package com.bluff.game

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class BluffApplication

fun main(args: Array<String>) {
    runApplication<BluffApplication>(*args)
}
