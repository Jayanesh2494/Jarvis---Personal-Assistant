package com.stark.jarvis.ui.screens.memory

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.stark.jarvis.JarvisApplication
import com.stark.jarvis.data.local.entity.NoteEntity
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class MemoryViewModel : ViewModel() {

    private val db = JarvisApplication.instance.database
    private val prefs = JarvisApplication.instance.preferencesDataStore

    val userName: StateFlow<String> = prefs.userNameFlow.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        "Commander"
    )

    val primaryGoal: StateFlow<String> = prefs.primaryGoalFlow.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        ""
    )

    val learningInterests: StateFlow<String> = prefs.learningInterestsFlow.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        ""
    )

    val notes: StateFlow<List<NoteEntity>> = db.noteDao().getAllNotes().stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        emptyList()
    )

    fun saveProfile(name: String, goal: String, interests: String) {
        viewModelScope.launch {
            prefs.saveProfile(name, goal, interests)
        }
    }

    fun addNote(content: String, category: String = "General") {
        viewModelScope.launch {
            db.noteDao().insertNote(
                NoteEntity(
                    id = "note_${System.currentTimeMillis()}",
                    content = content,
                    category = category
                )
            )
        }
    }

    fun deleteNote(id: String) {
        viewModelScope.launch {
            db.noteDao().deleteNoteById(id)
        }
    }

    fun wipeAllData() {
        viewModelScope.launch {
            db.reminderDao().deleteAllReminders()
            db.noteDao().deleteAllNotes()
            db.memoryDao().clearVault()
        }
    }
}
