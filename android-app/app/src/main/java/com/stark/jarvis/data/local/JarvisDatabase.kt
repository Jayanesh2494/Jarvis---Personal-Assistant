package com.stark.jarvis.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.stark.jarvis.data.local.dao.MemoryDao
import com.stark.jarvis.data.local.dao.NoteDao
import com.stark.jarvis.data.local.dao.ReminderDao
import com.stark.jarvis.data.local.entity.MemoryEntity
import com.stark.jarvis.data.local.entity.NoteEntity
import com.stark.jarvis.data.local.entity.ReminderEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

@Database(
    entities = [ReminderEntity::class, NoteEntity::class, MemoryEntity::class],
    version = 1,
    exportSchema = false
)
abstract class JarvisDatabase : RoomDatabase() {

    abstract fun reminderDao(): ReminderDao
    abstract fun noteDao(): NoteDao
    abstract fun memoryDao(): MemoryDao

    companion object {
        @Volatile
        private var INSTANCE: JarvisDatabase? = null

        fun getInstance(context: Context): JarvisDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    JarvisDatabase::class.java,
                    "jarvis.db"
                )
                .addCallback(DatabaseCallback())
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }

        private class DatabaseCallback : Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                INSTANCE?.let { database ->
                    CoroutineScope(Dispatchers.IO).launch {
                        populateInitialData(database)
                    }
                }
            }

            private suspend fun populateInitialData(database: JarvisDatabase) {
                val todayStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
                
                // Pre-populate initial starter reminders
                database.reminderDao().insertReminder(
                    ReminderEntity(
                        id = "rem_1",
                        title = "Study GATE: Engineering Mathematics & Discrete Structures",
                        targetDate = todayStr,
                        targetTime = "19:00",
                        targetTimestampMs = System.currentTimeMillis() + 3600000,
                        priority = "high",
                        category = "study"
                    )
                )

                database.reminderDao().insertReminder(
                    ReminderEntity(
                        id = "rem_2",
                        title = "Review AWS Serverless Architecture & Docker Containers",
                        targetDate = todayStr,
                        targetTime = "21:30",
                        targetTimestampMs = System.currentTimeMillis() + 7200000,
                        priority = "medium",
                        category = "coding"
                    )
                )

                // Pre-populate initial note
                database.noteDao().insertNote(
                    NoteEntity(
                        id = "note_1",
                        content = "GATE Priority: Time Complexity of Dijkstra with Min-Heap is O((V + E) log V). Optimal substructure & overlapping subproblems define DP.",
                        category = "GATE Prep"
                    )
                )
            }
        }
    }
}
