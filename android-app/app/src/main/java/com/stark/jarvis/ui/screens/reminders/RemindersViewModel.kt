package com.stark.jarvis.ui.screens.reminders

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.stark.jarvis.JarvisApplication
import com.stark.jarvis.data.local.entity.ReminderEntity
import com.stark.jarvis.domain.intent.IntentClassifier
import com.stark.jarvis.domain.model.AssistantIntent
import com.stark.jarvis.service.AlarmScheduler
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class RemindersViewModel : ViewModel() {

    private val db = JarvisApplication.instance.database

    private val _selectedFilter = MutableStateFlow("all")
    val selectedFilter: StateFlow<String> = _selectedFilter.asStateFlow()

    val allReminders: StateFlow<List<ReminderEntity>> = db.reminderDao().getAllReminders().stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        emptyList()
    )

    val filteredReminders: StateFlow<List<ReminderEntity>> = combine(allReminders, selectedFilter) { list, filter ->
        when (filter) {
            "active" -> list.filter { !it.isCompleted }
            "completed" -> list.filter { it.isCompleted }
            "high" -> list.filter { it.priority == "high" && !it.isCompleted }
            else -> list
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun setFilter(filter: String) {
        _selectedFilter.value = filter
    }

    fun addNaturalLanguageReminder(query: String): Boolean {
        val parsed = IntentClassifier.parseReminder(query) ?: return false
        viewModelScope.launch {
            val entity = ReminderEntity(
                id = "rem_${System.currentTimeMillis()}",
                title = parsed.title,
                targetDate = parsed.date,
                targetTime = parsed.time,
                targetTimestampMs = parsed.timestampMs,
                priority = parsed.priority,
                category = parsed.category
            )
            db.reminderDao().insertReminder(entity)
            AlarmScheduler.scheduleReminder(
                JarvisApplication.instance,
                entity.id,
                entity.title,
                entity.targetTimestampMs
            )
        }
        return true
    }

    fun toggleComplete(reminder: ReminderEntity) {
        viewModelScope.launch {
            db.reminderDao().updateCompletionStatus(reminder.id, !reminder.isCompleted)
        }
    }

    fun snoozeReminder(reminder: ReminderEntity) {
        viewModelScope.launch {
            val calendar = Calendar.getInstance().apply {
                timeInMillis = reminder.targetTimestampMs + (30 * 60 * 1000)
            }
            val newTime = SimpleDateFormat("HH:mm", Locale.getDefault()).format(calendar.time)
            val updated = reminder.copy(
                targetTime = newTime,
                targetTimestampMs = calendar.timeInMillis,
                isAlertFired = false
            )
            db.reminderDao().updateReminder(updated)
            AlarmScheduler.scheduleReminder(
                JarvisApplication.instance,
                updated.id,
                updated.title,
                updated.targetTimestampMs
            )
        }
    }

    fun deleteReminder(id: String) {
        viewModelScope.launch {
            AlarmScheduler.cancelReminder(JarvisApplication.instance, id)
            db.reminderDao().deleteReminderById(id)
        }
    }
}
