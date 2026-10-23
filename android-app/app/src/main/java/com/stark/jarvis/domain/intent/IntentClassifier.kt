package com.stark.jarvis.domain.intent

import com.stark.jarvis.domain.model.AssistantIntent
import java.text.SimpleDateFormat
import java.util.*
import java.util.regex.Pattern

object IntentClassifier {

    data class ClassificationResult(
        val intent: AssistantIntent,
        val spokenResponse: String,
        val displayResponse: String
    )

    fun classify(rawInput: String, userName: String = "Commander"): ClassificationResult {
        val input = rawInput.trim()
        val lower = input.lowercase()

        // 1. CREATE REMINDER INTENT
        if (lower.startsWith("remind me") || lower.startsWith("set a reminder") || lower.startsWith("schedule reminder")) {
            val parsed = parseReminder(input)
            if (parsed != null) {
                return ClassificationResult(
                    intent = parsed,
                    spokenResponse = "Directive confirmed, $userName. I have scheduled: ${parsed.title} for ${parsed.date} at ${parsed.time}.",
                    displayResponse = "Directive Scheduled: ${parsed.title}\nDate: ${parsed.date} | Time: ${parsed.time}\nPriority: ${parsed.priority.uppercase()}"
                )
            }
        }

        // 2. QUERY TASKS / AGENDA
        if (lower.contains("what do i need to do") || lower.contains("what should i focus on") ||
            lower.contains("show my tasks") || lower.contains("today's agenda") || lower.contains("what did i ask you to do")) {
            return ClassificationResult(
                intent = AssistantIntent.QueryTasks,
                spokenResponse = "Scanning your tactical directive queue, $userName.",
                displayResponse = "Accessing current active directives from the local Room database."
            )
        }

        // 3. LINKEDIN STUDIO INTENT
        if (lower.contains("linkedin") || lower.contains("draft a post") || lower.contains("write a post")) {
            var topic = "AWS Cloud Architecture & Scalability"
            val match = Regex("""(?:about|on|regarding)\s+(.*)""", RegexOption.IGNORE_CASE).find(input)
            if (match != null && match.groupValues.size > 1) {
                topic = match.groupValues[1].replace(Regex("""^(my|the)\s+""", RegexOption.IGNORE_CASE), "").trim()
            }
            return ClassificationResult(
                intent = AssistantIntent.DraftLinkedIn(topic, "workshop"),
                spokenResponse = "Opening LinkedIn Studio. Synthesizing post draft regarding $topic.",
                displayResponse = "Drafting LinkedIn post for topic: \"$topic\" with compliant hooks and takeaways."
            )
        }

        // 4. PLAN SCHEDULE / CODING PRACTICE
        if (lower.contains("plan my coding") || lower.contains("plan my study") || lower.contains("tactical plan") || lower.contains("plan my practice")) {
            return ClassificationResult(
                intent = AssistantIntent.PlanSchedule(6.0, "gate"),
                spokenResponse = "Recalculating your daily tactical plan with optimal deep-work intervals.",
                displayResponse = "Daily Tactical Schedule updated: Deep work allocated for GATE Mathematics and Coding Sprints."
            )
        }

        // 5. SYSTEM SHORTCUTS
        if (lower.startsWith("open ") || lower.startsWith("launch ") || lower.startsWith("call ") || lower.startsWith("dial")) {
            return when {
                lower.contains("linkedin") -> ClassificationResult(
                    intent = AssistantIntent.SystemShortcut("open_linkedin", "https://www.linkedin.com"),
                    spokenResponse = "Launching LinkedIn.",
                    displayResponse = "Executing intent: Open LinkedIn."
                )
                lower.contains("dial") || lower.contains("call") -> ClassificationResult(
                    intent = AssistantIntent.SystemShortcut("open_dialler", "tel:"),
                    spokenResponse = "Opening system dialler.",
                    displayResponse = "Executing intent: Open Phone Dialler."
                )
                lower.contains("camera") -> ClassificationResult(
                    intent = AssistantIntent.SystemShortcut("open_camera"),
                    spokenResponse = "Activating camera sensor.",
                    displayResponse = "Executing intent: Launch Camera."
                )
                lower.contains("email") || lower.contains("gmail") -> ClassificationResult(
                    intent = AssistantIntent.SystemShortcut("open_email", "mailto:"),
                    spokenResponse = "Opening email composer.",
                    displayResponse = "Executing intent: Open Email Client."
                )
                lower.contains("calendar") -> ClassificationResult(
                    intent = AssistantIntent.SystemShortcut("open_calendar", "https://calendar.google.com"),
                    spokenResponse = "Launching Google Calendar.",
                    displayResponse = "Executing intent: Open Calendar."
                )
                else -> ClassificationResult(
                    intent = AssistantIntent.GeneralConversation(input, "App shortcut recognized but not in whitelist."),
                    spokenResponse = "I could not resolve the target application in the system intent registry.",
                    displayResponse = "Unknown application shortcut target."
                )
            }
        }

        // 6. SAVE NOTE
        if (lower.startsWith("remember that") || lower.startsWith("note down") || lower.startsWith("save note")) {
            val content = input.replace(Regex("""^(remember that|note down|save note)\s*:?""", RegexOption.IGNORE_CASE), "").trim()
            return ClassificationResult(
                intent = AssistantIntent.SaveNote(content, "General"),
                spokenResponse = "Recorded in your cognitive memory vault, $userName.",
                displayResponse = "Knowledge snippet saved to Room database: \"$content\""
            )
        }

        // 7. DIAGNOSTICS & SYSTEM REPORT
        if (lower.contains("status report") || lower.contains("diagnostics") || lower.contains("subsystems") || lower.contains("who are you")) {
            val diag = "All subsystems nominal, $userName. On-device local AI core active, Room persistence encrypted, zero cloud exfiltration."
            return ClassificationResult(
                intent = AssistantIntent.SystemDiagnostics,
                spokenResponse = diag,
                displayResponse = "JARVIS MARK VII STATUS REPORT:\n• Neural Core: On-Device & Nominal\n• Storage: Room SQLite (Encrypted)\n• Cloud Exfiltration: 0% (Fully Private)\n• Commander: $userName"
            )
        }

        // 8. GENERAL DIALOGUE / PEDAGOGY
        val response = if (lower.contains("gate")) {
            "For GATE CS preparation, prioritize Engineering Mathematics (Linear Algebra, Calculus, Discrete Math) and Core CS (Algorithms, OS, TOC). Consistent 3-hour problem solving under mock conditions gives the highest percentile."
        } else if (lower.contains("aws") || lower.contains("cloud")) {
            "For AWS architecture: Decouple services with SQS/SNS, use least-privilege IAM roles, and leverage on-device edge caching to minimize egress costs."
        } else {
            "Directive acknowledged, $userName. I have processed: \"$input\". Standing by for your next operational instruction."
        }

        return ClassificationResult(
            intent = AssistantIntent.GeneralConversation(input, response),
            spokenResponse = response,
            displayResponse = response
        )
    }

    fun parseReminder(raw: String): AssistantIntent.CreateReminder? {
        var clean = raw.replace(Regex("""^(remind me to|remind me|set reminder for|set reminder to|please)\s+""", RegexOption.IGNORE_CASE), "").trim()
        val calendar = Calendar.getInstance()

        var priority = "medium"
        if (clean.contains("urgent", ignoreCase = true) || clean.contains("important", ignoreCase = true) || clean.contains("critical", ignoreCase = true)) {
            priority = "high"
            clean = clean.replace(Regex("""\b(urgent|important|critical)\b""", RegexOption.IGNORE_CASE), "").trim()
        }

        var category = "study"
        if (clean.contains("gate", ignoreCase = true) || clean.contains("exam", ignoreCase = true) || clean.contains("study", ignoreCase = true)) {
            category = "study"
        } else if (clean.contains("code", ignoreCase = true) || clean.contains("java", ignoreCase = true) || clean.contains("aws", ignoreCase = true)) {
            category = "coding"
        } else if (clean.contains("meeting", ignoreCase = true) || clean.contains("work", ignoreCase = true)) {
            category = "work"
        }

        // Date detection
        if (clean.contains("tomorrow", ignoreCase = true)) {
            calendar.add(Calendar.DAY_OF_YEAR, 1)
            clean = clean.replace(Regex("""\btomorrow\b""", RegexOption.IGNORE_CASE), "").trim()
        }

        // Time detection (e.g., "at 7 PM", "7:30 PM", "19:00", "at 4 PM")
        var hours = 19
        var minutes = 0
        val timePattern = Pattern.compile("""(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b""", Pattern.CASE_INSENSITIVE)
        val matcher = timePattern.matcher(clean)

        if (matcher.find()) {
            var h = matcher.group(1)?.toIntOrNull() ?: 19
            val m = matcher.group(2)?.toIntOrNull() ?: 0
            val ampm = matcher.group(3)?.lowercase()

            if (ampm == "pm" && h < 12) h += 12
            if (ampm == "am" && h == 12) h = 0

            hours = h
            minutes = m
            clean = clean.removeRange(matcher.start(), matcher.end()).replace(Regex("""\bat\b""", RegexOption.IGNORE_CASE), "").trim()
        }

        calendar.set(Calendar.HOUR_OF_DAY, hours)
        calendar.set(Calendar.MINUTE, minutes)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)

        // If time is in the past for today, schedule for tomorrow
        if (calendar.timeInMillis <= System.currentTimeMillis()) {
            calendar.add(Calendar.DAY_OF_YEAR, 1)
        }

        val title = clean.replace(Regex("""^to\s+""", RegexOption.IGNORE_CASE), "").trim().ifEmpty { "Tactical Directive" }
        val dateStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(calendar.time)
        val timeStr = String.format(Locale.getDefault(), "%02d:%02d", hours, minutes)

        return AssistantIntent.CreateReminder(
            title = title,
            date = dateStr,
            time = timeStr,
            timestampMs = calendar.timeInMillis,
            priority = priority,
            category = category
        )
    }
}
