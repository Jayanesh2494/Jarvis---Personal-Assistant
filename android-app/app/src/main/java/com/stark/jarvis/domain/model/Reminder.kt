package com.stark.jarvis.domain.model

data class Reminder(
    val id: String,
    val title: String,
    val targetDate: String,
    val targetTime: String,
    val targetTimestampMs: Long,
    val priority: Priority,
    val category: Category,
    val isCompleted: Boolean = false,
    val isAlertFired: Boolean = false
) {
    enum class Priority {
        HIGH, MEDIUM, LOW;

        companion object {
            fun fromString(str: String): Priority = when (str.lowercase()) {
                "high" -> HIGH
                "low" -> LOW
                else -> MEDIUM
            }
        }
    }

    enum class Category {
        STUDY, CODING, WORK, PERSONAL;

        companion object {
            fun fromString(str: String): Category = when (str.lowercase()) {
                "coding" -> CODING
                "work" -> WORK
                "personal" -> PERSONAL
                else -> STUDY
            }
        }
    }
}
