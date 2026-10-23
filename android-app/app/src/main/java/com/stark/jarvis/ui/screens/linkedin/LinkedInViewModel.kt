package com.stark.jarvis.ui.screens.linkedin

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.lifecycle.ViewModel
import com.stark.jarvis.JarvisApplication
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class LinkedInViewModel : ViewModel() {

    private val _topic = MutableStateFlow("AWS Cloud Architecture & Serverless Workshop")
    val topic: StateFlow<String> = _topic.asStateFlow()

    private val _category = MutableStateFlow("workshop")
    val category: StateFlow<String> = _category.asStateFlow()

    private val _tone = MutableStateFlow("professional")
    val tone: StateFlow<String> = _tone.asStateFlow()

    private val _keyFacts = MutableStateFlow("Explored multi-AZ decoupled architectures, serverless event-driven design, and reduced egress latency with on-device caching.")
    val keyFacts: StateFlow<String> = _keyFacts.asStateFlow()

    private val _generatedDraft = MutableStateFlow("")
    val generatedDraft: StateFlow<String> = _generatedDraft.asStateFlow()

    init {
        generateDraft()
    }

    fun updateTopic(newTopic: String) { _topic.value = newTopic }
    fun updateCategory(newCat: String) { _category.value = newCat }
    fun updateKeyFacts(newFacts: String) { _keyFacts.value = newFacts }

    fun generateDraft() {
        val t = _topic.value
        val cat = _category.value
        val facts = _keyFacts.value

        val hook = when (cat) {
            "workshop" -> "🚀 Just concluded an intensive deep-dive into $t!\n\nHere are 3 core architectural takeaways that changed how I build scalable systems:"
            "project" -> "💡 Excited to unveil what I've been engineering: $t.\n\nThe core mission? Solving latency and privacy bottlenecks with an on-device first architecture."
            "learning" -> "🎯 Consistent preparation compounds. Sharing key reflections from my preparation for $t:"
            else -> "⚡ Milestone update: Deepening expertise in $t.\n\nSharing key architectural insights learned along the way:"
        }

        val body = if (facts.isNotBlank()) {
            facts.split(".").filter { it.trim().length > 3 }.mapIndexed { i, s ->
                "🔹 Takeaway ${i + 1}: ${s.trim()}"
            }.joinToString("\n\n")
        } else {
            "🔹 Key Point 1: Decoupling architecture with event-driven pipelines yields immense fault tolerance.\n\n🔹 Key Point 2: On-device processing minimizes cloud egress costs while shielding private user telemetry.\n\n🔹 Key Point 3: Rigorous performance profiling under synthetic load is non-negotiable."
        }

        val cta = "How are you approaching edge computing in your current engineering roadmap? Would love to hear your perspectives below! 👇"
        val hashtags = "#CloudComputing #AWS #SystemDesign #EdgeAI #SoftwareEngineering #TechInnovation"

        _generatedDraft.value = "$hook\n\n$body\n\n$cta\n\n$hashtags"
    }

    fun copyToClipboard(context: Context): Boolean {
        val draft = _generatedDraft.value
        if (draft.isBlank()) return false
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        val clip = ClipData.newPlainText("LinkedIn Post", draft)
        clipboard.setPrimaryClip(clip)
        return true
    }

    fun openLinkedIn(context: Context) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.linkedin.com/feed/")).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }
}
