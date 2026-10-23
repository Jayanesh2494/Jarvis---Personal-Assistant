package com.stark.jarvis.service

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class NotificationSummaryItem(
    val packageName: String,
    val appTitle: String,
    val messageSnippet: String,
    val timestamp: Long
)

class JarvisNotificationListenerService : NotificationListenerService() {

    override fun onListenerConnected() {
        super.onListenerConnected()
        _isServiceActive.value = true
    }

    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        _isServiceActive.value = false
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        if (sbn == null) return

        val pkg = sbn.packageName ?: return
        // Ignore self-notifications or system low-priority chatter
        if (pkg == packageName || pkg == "android") return

        val extras = sbn.notification?.extras ?: return
        val title = extras.getCharSequence("android.title")?.toString() ?: ""
        val text = extras.getCharSequence("android.text")?.toString() ?: ""

        if (title.isNotEmpty() || text.isNotEmpty()) {
            val item = NotificationSummaryItem(
                packageName = pkg,
                appTitle = title,
                messageSnippet = text,
                timestamp = sbn.postTime
            )

            val current = _recentNotifications.value.toMutableList()
            // Keep at most 20 recent notifications in memory only
            if (current.size >= 20) current.removeAt(0)
            current.add(item)
            _recentNotifications.value = current
        }
    }

    companion object {
        private val _isServiceActive = MutableStateFlow(false)
        val isServiceActive: StateFlow<Boolean> = _isServiceActive.asStateFlow()

        private val _recentNotifications = MutableStateFlow<List<NotificationSummaryItem>>(emptyList())
        val recentNotifications: StateFlow<List<NotificationSummaryItem>> = _recentNotifications.asStateFlow()

        fun clearNotifications() {
            _recentNotifications.value = emptyList()
        }
    }
}
