package com.stark.jarvis.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "reminders")
data class ReminderEntity(
    @PrimaryKey
    val id: String,
    val title: String,
    val targetDate: String, // YYYY-MM-DD
    val targetTime: String, // HH:MM
    val targetTimestampMs: Long,
    val priority: String, // "high", "medium", "low"
    val category: String, // "study", "coding", "work", "personal"
    val isCompleted: Boolean = false,
    val isAlertFired: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)
