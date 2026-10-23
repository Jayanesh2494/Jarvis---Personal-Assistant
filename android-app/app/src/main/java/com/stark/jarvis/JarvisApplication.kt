package com.stark.jarvis

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import com.stark.jarvis.data.local.JarvisDatabase
import com.stark.jarvis.data.preferences.UserPreferencesDataStore

class JarvisApplication : Application() {

    lateinit var database: JarvisDatabase
        private set

    lateinit var preferencesDataStore: UserPreferencesDataStore
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this

        // Initialize local Room database
        database = JarvisDatabase.getInstance(this)

        // Initialize DataStore
        preferencesDataStore = UserPreferencesDataStore(this)

        // Create notification channels for reminders and alerts
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_REMINDERS_ID,
                getString(R.string.channel_reminders_name),
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = getString(R.string.channel_reminders_desc)
                enableVibration(true)
                enableLights(true)
            }

            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    companion object {
        const val CHANNEL_REMINDERS_ID = "jarvis_tactical_reminders"
        lateinit var instance: JarvisApplication
            private set
    }
}
