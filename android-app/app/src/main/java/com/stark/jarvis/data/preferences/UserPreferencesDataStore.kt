package com.stark.jarvis.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "jarvis_preferences")

class UserPreferencesDataStore(private val context: Context) {

    companion object {
        val KEY_USER_NAME = stringPreferencesKey("user_name")
        val KEY_PRIMARY_GOAL = stringPreferencesKey("primary_goal")
        val KEY_LEARNING_INTERESTS = stringPreferencesKey("learning_interests")
        val KEY_RESPONSE_STYLE = stringPreferencesKey("response_style")
        val KEY_AUTO_VOCALIZE = booleanPreferencesKey("auto_vocalize")
        val KEY_OFFLINE_FIRST = booleanPreferencesKey("offline_first")
        val KEY_SPEECH_RATE = floatPreferencesKey("speech_rate")
        val KEY_SPEECH_PITCH = floatPreferencesKey("speech_pitch")
    }

    val userNameFlow: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[KEY_USER_NAME] ?: "Commander"
    }

    val primaryGoalFlow: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[KEY_PRIMARY_GOAL] ?: "Cracking GATE Examination & Building Advanced Edge AI Systems"
    }

    val learningInterestsFlow: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[KEY_LEARNING_INTERESTS] ?: "Algorithms, System Design, Android Kotlin, PyTorch, Cloud Architecture"
    }

    val responseStyleFlow: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[KEY_RESPONSE_STYLE] ?: "concise"
    }

    val autoVocalizeFlow: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[KEY_AUTO_VOCALIZE] ?: true
    }

    val offlineFirstFlow: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[KEY_OFFLINE_FIRST] ?: true
    }

    val speechRateFlow: Flow<Float> = context.dataStore.data.map { preferences ->
        preferences[KEY_SPEECH_RATE] ?: 1.0f
    }

    val speechPitchFlow: Flow<Float> = context.dataStore.data.map { preferences ->
        preferences[KEY_SPEECH_PITCH] ?: 1.0f
    }

    suspend fun saveProfile(name: String, goal: String, interests: String) {
        context.dataStore.edit { preferences ->
            preferences[KEY_USER_NAME] = name
            preferences[KEY_PRIMARY_GOAL] = goal
            preferences[KEY_LEARNING_INTERESTS] = interests
        }
    }

    suspend fun savePersonalityPreferences(style: String, autoVocalize: Boolean, offlineFirst: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[KEY_RESPONSE_STYLE] = style
            preferences[KEY_AUTO_VOCALIZE] = autoVocalize
            preferences[KEY_OFFLINE_FIRST] = offlineFirst
        }
    }

    suspend fun saveSpeechParams(rate: Float, pitch: Float) {
        context.dataStore.edit { preferences ->
            preferences[KEY_SPEECH_RATE] = rate
            preferences[KEY_SPEECH_PITCH] = pitch
        }
    }
}
