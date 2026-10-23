package com.stark.jarvis

import com.stark.jarvis.domain.intent.IntentClassifier
import com.stark.jarvis.domain.model.AssistantIntent
import org.junit.Assert.*
import org.junit.Test

class IntentClassifierTest {

    @Test
    fun testNaturalLanguageReminderParsing_StandardTime() {
        val query = "Remind me to study GATE at 7 PM"
        val parsed = IntentClassifier.parseReminder(query)

        assertNotNull("Parsed reminder should not be null", parsed)
        assertEquals("study GATE", parsed!!.title)
        assertEquals("19:00", parsed.time)
        assertEquals("study", parsed.category)
        assertEquals("medium", parsed.priority)
    }

    @Test
    fun testNaturalLanguageReminderParsing_HighPriorityAndTomorrow() {
        val query = "Remind me urgent to submit project report tomorrow at 10 AM"
        val parsed = IntentClassifier.parseReminder(query)

        assertNotNull(parsed)
        assertTrue(parsed!!.title.contains("submit project report"))
        assertEquals("10:00", parsed.time)
        assertEquals("high", parsed.priority)
    }

    @Test
    fun testIntentClassification_TaskQuery() {
        val query = "What do I need to do today?"
        val result = IntentClassifier.classify(query)

        assertTrue(result.intent is AssistantIntent.QueryTasks)
    }

    @Test
    fun testIntentClassification_LinkedInDraft() {
        val query = "Draft a LinkedIn post about my AWS workshop"
        val result = IntentClassifier.classify(query)

        assertTrue(result.intent is AssistantIntent.DraftLinkedIn)
        val intent = result.intent as AssistantIntent.DraftLinkedIn
        assertTrue(intent.topic.contains("AWS workshop", ignoreCase = true))
    }

    @Test
    fun testIntentClassification_SystemShortcut_Dialler() {
        val query = "Open dialler"
        val result = IntentClassifier.classify(query)

        assertTrue(result.intent is AssistantIntent.SystemShortcut)
        val intent = result.intent as AssistantIntent.SystemShortcut
        assertEquals("open_dialler", intent.action)
    }

    @Test
    fun testIntentClassification_SaveNote() {
        val query = "Remember that Dijkstra complexity is O((V+E) log V)"
        val result = IntentClassifier.classify(query)

        assertTrue(result.intent is AssistantIntent.SaveNote)
        val intent = result.intent as AssistantIntent.SaveNote
        assertTrue(intent.content.contains("Dijkstra complexity"))
    }

    @Test
    fun testIntentClassification_Diagnostics() {
        val query = "Status report"
        val result = IntentClassifier.classify(query)

        assertTrue(result.intent is AssistantIntent.SystemDiagnostics)
        assertTrue(result.spokenResponse.contains("subsystems nominal", ignoreCase = true))
    }
}
