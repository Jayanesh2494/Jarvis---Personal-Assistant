package com.stark.jarvis.ui.screens.settings

import android.content.Context
import android.content.Intent
import android.provider.Settings
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.stark.jarvis.JarvisApplication
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class SettingsViewModel : ViewModel() {

    private val prefs = JarvisApplication.instance.preferencesDataStore

    val autoVocalize: StateFlow<Boolean> = prefs.autoVocalizeFlow.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        true
    )

    val offlineFirst: StateFlow<Boolean> = prefs.offlineFirstFlow.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        true
    )

    fun toggleAutoVocalize(enabled: Boolean) {
        viewModelScope.launch {
            prefs.savePersonalityPreferences("concise", enabled, offlineFirst.value)
        }
    }

    fun toggleOfflineFirst(enabled: Boolean) {
        viewModelScope.launch {
            prefs.savePersonalityPreferences("concise", autoVocalize.value, enabled)
        }
    }

    fun openNotificationListenerSettings(context: Context) {
        val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }
}
