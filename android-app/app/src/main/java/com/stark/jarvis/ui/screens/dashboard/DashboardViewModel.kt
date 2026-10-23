package com.stark.jarvis.ui.screens.dashboard

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.stark.jarvis.JarvisApplication
import com.stark.jarvis.data.local.entity.ReminderEntity
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class DashboardViewModel : ViewModel() {

    private val db = JarvisApplication.instance.database
    private val prefs = JarvisApplication.instance.preferencesDataStore

    val userName: StateFlow<String> = prefs.userNameFlow.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        "Commander"
    )

    val activeReminders: StateFlow<List<ReminderEntity>> = db.reminderDao().getActiveReminders().stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        emptyList()
    )

    val allReminders: StateFlow<List<ReminderEntity>> = db.reminderDao().getAllReminders().stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        emptyList()
    )

    val completionRate: StateFlow<Int> = allReminders.map { list ->
        if (list.isEmpty()) 100
        else {
            val completed = list.count { it.isCompleted }
            ((completed.toDouble() / list.size) * 100).toInt()
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 100)

    fun markReminderCompleted(id: String) {
        viewModelScope.launch {
            db.reminderDao().updateCompletionStatus(id, true)
        }
    }

    fun launchDialler(context: Context) {
        val intent = Intent(Intent.ACTION_DIAL)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
    }

    fun launchEmail(context: Context) {
        val intent = Intent(Intent.ACTION_SENDTO).apply {
            data = Uri.parse("mailto:")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }

    fun launchCalendar(context: Context) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://calendar.google.com")).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }

    fun launchLinkedIn(context: Context) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.linkedin.com")).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }
}
