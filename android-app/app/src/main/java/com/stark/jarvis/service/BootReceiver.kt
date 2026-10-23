package com.stark.jarvis.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.stark.jarvis.data.local.JarvisDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            val database = JarvisDatabase.getInstance(context)
            CoroutineScope(Dispatchers.IO).launch {
                val active = database.reminderDao().getActiveReminders().firstOrNull() ?: emptyList()
                val now = System.currentTimeMillis()

                active.forEach { reminder ->
                    if (reminder.targetTimestampMs > now && !reminder.isCompleted) {
                        AlarmScheduler.scheduleReminder(
                            context = context,
                            reminderId = reminder.id,
                            title = reminder.title,
                            triggerAtMs = reminder.targetTimestampMs
                        )
                    }
                }
            }
        }
    }
}
