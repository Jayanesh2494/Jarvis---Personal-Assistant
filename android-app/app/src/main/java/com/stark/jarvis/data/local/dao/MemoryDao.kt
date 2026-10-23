package com.stark.jarvis.data.local.dao

import androidx.room.*
import com.stark.jarvis.data.local.entity.MemoryEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface MemoryDao {

    @Query("SELECT * FROM memory_vault")
    fun getAllMemoryEntries(): Flow<List<MemoryEntity>>

    @Query("SELECT value FROM memory_vault WHERE `key` = :key LIMIT 1")
    suspend fun getValueByKey(key: String): String?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(entry: MemoryEntity)

    @Query("DELETE FROM memory_vault WHERE `key` = :key")
    suspend fun deleteByKey(key: String)

    @Query("DELETE FROM memory_vault")
    suspend fun clearVault()
}
