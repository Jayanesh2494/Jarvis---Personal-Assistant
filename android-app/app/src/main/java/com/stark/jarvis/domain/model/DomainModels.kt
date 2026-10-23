package com.stark.jarvis.domain.model

data class UserProfile(
    val userName: String = "Commander",
    val primaryGoal: String = "Cracking GATE Examination & Building Advanced Edge AI Systems",
    val learningInterests: String = "Algorithms, System Design, Android Kotlin, PyTorch, Cloud Architecture",
    val responseStyle: String = "concise",
    val autoVocalize: Boolean = true,
    val offlineFirst: Boolean = true
)

data class TacticalScheduleBlock(
    val id: String,
    val timeRange: String,
    val title: String,
    val description: String,
    val category: String,
    val durationHours: Double
)

data class LinkedInDraft(
    val topic: String,
    val category: String,
    val tone: String,
    val draftContent: String,
    val wordCount: Int,
    val characterCount: Int
)

sealed class AssistantIntent {
    data class CreateReminder(
        val title: String,
        val date: String,
        val time: String,
        val timestampMs: Long,
        val priority: String,
        val category: String
    ) : AssistantIntent()

    object QueryTasks : AssistantIntent()
    data class DraftLinkedIn(val topic: String, val category: String) : AssistantIntent()
    data class PlanSchedule(val availableHours: Double, val focusArea: String) : AssistantIntent()
    data class SystemShortcut(val action: String, val targetUri: String? = null) : AssistantIntent()
    data class SaveNote(val content: String, val category: String) : AssistantIntent()
    object SystemDiagnostics : AssistantIntent()
    object NotificationSummary : AssistantIntent()
    data class GeneralConversation(val query: String, val response: String) : AssistantIntent()
}
