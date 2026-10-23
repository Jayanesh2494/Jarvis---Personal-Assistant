package com.stark.jarvis.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "notes")
data class NoteEntity(
    @PrimaryKey
    val id: String,
    val content: String,
    val category: String = "General",
    val createdAt: Long = System.currentTimeMillis()
)
