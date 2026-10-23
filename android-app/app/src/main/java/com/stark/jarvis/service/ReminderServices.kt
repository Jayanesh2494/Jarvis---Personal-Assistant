package com.stark.jarvis.service

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.stark.jarvis.JarvisApplication
import com.stark.jarvis.MainActivity
import com.stark.jarvis.R

class ReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val reminderId = intent.getStringExtra("EXTRA_REMINDER_ID") ?: return
        val title = intent.getStringExtra("EXTRA_TITLE") ?: "Scheduled Directive"
        showNotification(context, reminderId, title)
    }

    companion object {
        fun showNotification(context: Context, reminderId: String, title: String) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            val openAppIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("NAV_TARGET", "reminders")
            }

            val pendingIntent = PendingIntent.getActivity(
                context,
                reminderId.hashCode(),
                openAppIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val notification = NotificationCompat.Builder(context, JarvisApplication.CHANNEL_REMINDERS_ID)
                .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                .setContentTitle("JARVIS // Tactical Alert")
                .setContentText(title)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_REMINDER)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .setVibrate(longArrayOf(0, 300, 200, 300))
                .build()

            notificationManager.notify(reminderId.hashCode(), notification)
        }
    }
}

class ReminderWorker(
    private val context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        val reminderId = inputData.getString("EXTRA_REMINDER_ID") ?: return Result.failure()
        val title = inputData.getString("EXTRA_TITLE") ?: "Scheduled Directive"

        ReminderReceiver.showNotification(context, reminderId, title)
        return Result.success()
    }
}
