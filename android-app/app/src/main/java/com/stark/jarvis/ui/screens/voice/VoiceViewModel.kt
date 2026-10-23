package com.stark.jarvis.ui.screens.voice

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.stark.jarvis.JarvisApplication
import com.stark.jarvis.data.local.entity.ReminderEntity
import com.stark.jarvis.domain.intent.IntentClassifier
import com.stark.jarvis.domain.model.AssistantIntent
import com.stark.jarvis.service.AlarmScheduler
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

data class ChatMessage(
    val sender: String, // "user" or "jarvis"
    val text: String,
    val time: String = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
)

class VoiceViewModel : ViewModel() {

    private val db = JarvisApplication.instance.database
    private val prefs = JarvisApplication.instance.preferencesDataStore

    private val _messages = MutableStateFlow<List<ChatMessage>>(
        listOf(
            ChatMessage("jarvis", "Good day, Commander. JARVIS Mark VII initialized and standing by. State your directive.")
        )
    )
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    private val _isListening = MutableStateFlow(false)
    val isListening: StateFlow<Boolean> = _isListening.asStateFlow()

    private val _statusText = MutableStateFlow("STANDBY // TAP OR TYPE")
    val statusText: StateFlow<String> = _statusText.asStateFlow()

    fun setListeningState(listening: Boolean) {
        _isListening.value = listening
        _statusText.value = if (listening) "LISTENING // SPEAK NOW..." else "STANDBY // TAP OR TYPE"
    }

    fun executeQuery(query: String, onSpeak: (String) -> Unit) {
        if (query.isBlank()) return

        // 1. Append user message
        val current = _messages.value.toMutableList()
        current.add(ChatMessage("user", query))
        _messages.value = current

        // 2. Classify intent
        val result = IntentClassifier.classify(query)

        // 3. Append Jarvis response
        current.add(ChatMessage("jarvis", result.displayResponse))
        _messages.value = current

        // 4. Handle intent execution in database
        when (val intent = result.intent) {
            is AssistantIntent.CreateReminder -> {
                viewModelScope.launch {
                    val entity = ReminderEntity(
                        id = "rem_${System.currentTimeMillis()}",
                        title = intent.title,
                        targetDate = intent.date,
                        targetTime = intent.time,
                        targetTimestampMs = intent.timestampMs,
                        priority = intent.priority,
                        category = intent.category
                    )
                    db.reminderDao().insertReminder(entity)
                    // Schedule alarm
                    AlarmScheduler.scheduleReminder(
                        JarvisApplication.instance,
                        entity.id,
                        entity.title,
                        entity.targetTimestampMs
                    )
                }
            }
            is AssistantIntent.SaveNote -> {
                viewModelScope.launch {
                    db.noteDao().insertNote(
                        com.stark.jarvis.data.local.entity.NoteEntity(
                            id = "note_${System.currentTimeMillis()}",
                            content = intent.content,
                            category = intent.category
                        )
                    )
                }
            }
            else -> {}
        }

        // 5. Trigger spoken response
        onSpeak(result.spokenResponse)
    }

    fun clearChat() {
        _messages.value = listOf(
            ChatMessage("jarvis", "Neural conversation log reset. Standing by for directives.")
        )
    }
}
