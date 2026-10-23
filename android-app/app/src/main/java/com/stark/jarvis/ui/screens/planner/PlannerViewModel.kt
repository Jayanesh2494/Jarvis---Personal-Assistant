package com.stark.jarvis.ui.screens.planner

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.stark.jarvis.JarvisApplication
import com.stark.jarvis.domain.model.TacticalScheduleBlock
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class PlannerViewModel : ViewModel() {

    private val db = JarvisApplication.instance.database

    private val _availableHours = MutableStateFlow(6.0)
    val availableHours: StateFlow<Double> = _availableHours.asStateFlow()

    private val _focusArea = MutableStateFlow("gate")
    val focusArea: StateFlow<String> = _focusArea.asStateFlow()

    private val _scheduleBlocks = MutableStateFlow<List<TacticalScheduleBlock>>(emptyList())
    val scheduleBlocks: StateFlow<List<TacticalScheduleBlock>> = _scheduleBlocks.asStateFlow()

    init {
        generateSchedule()
    }

    fun setAvailableHours(hours: Double) {
        _availableHours.value = hours
        generateSchedule()
    }

    fun setFocusArea(area: String) {
        _focusArea.value = area
        generateSchedule()
    }

    fun generateSchedule() {
        viewModelScope.launch {
            val pending = db.reminderDao().getActiveReminders().firstOrNull() ?: emptyList()
            val totalH = _availableHours.value
            val focus = _focusArea.value

            val blocks = mutableListOf<TacticalScheduleBlock>()
            var currentHour = 9

            val formatTime = { h: Int, m: Int ->
                val ampm = if (h >= 12) "PM" else "AM"
                val displayH = if (h % 12 == 0) 12 else h % 12
                String.format("%d:%02d %s", displayH, m, ampm)
            }

            // 1. Morning Deep Work Session (2 hours)
            val deepWorkTitle = when (focus) {
                "gate" -> "Deep Work: GATE Mathematics & Algorithms"
                "coding" -> "Deep Work: System Design & LeetCode Sprints"
                "projects" -> "Deep Work: AWS Cloud & Edge AI Architecture"
                else -> "Deep Work: Core Engineering Priorities"
            }
            blocks.add(
                TacticalScheduleBlock(
                    id = "block_1",
                    timeRange = "${formatTime(currentHour, 0)} - ${formatTime(currentHour + 2, 0)}",
                    title = deepWorkTitle,
                    description = "Peak cognitive capacity period. Focus on challenging problems without multitasking.",
                    category = "Deep Work",
                    durationHours = 2.0
                )
            )
            currentHour += 2

            // 2. Cognitive Reset (30 mins)
            blocks.add(
                TacticalScheduleBlock(
                    id = "block_2",
                    timeRange = "${formatTime(currentHour, 0)} - ${formatTime(currentHour, 30)}",
                    title = "Cognitive Reset & Review",
                    description = "Hydration, physical movement, and consolidating notes from morning session.",
                    category = "Rest & Reset",
                    durationHours = 0.5
                )
            )

            // 3. Pending Directives Integration
            if (pending.isNotEmpty()) {
                val topTask = pending.first()
                blocks.add(
                    TacticalScheduleBlock(
                        id = "block_task",
                        timeRange = "${formatTime(currentHour + 1, 0)} - ${formatTime(currentHour + 2, 0)}",
                        title = "Scheduled Directive: ${topTask.title}",
                        description = "Directly scheduled from your active reminder queue (Target: ${topTask.targetTime}).",
                        category = "Directive",
                        durationHours = 1.0
                    )
                )
                currentHour += 2
            } else {
                currentHour += 1
            }

            // 4. Practical Implementation Block
            val remainingH = (totalH - 3.5).coerceAtLeast(1.0)
            val endH = currentHour + remainingH.toInt()
            blocks.add(
                TacticalScheduleBlock(
                    id = "block_3",
                    timeRange = "${formatTime(currentHour, 0)} - ${formatTime(endH, 0)}",
                    title = if (focus == "gate") "Applied Coding Lab: PyTorch & Python Systems" else "Theory Review: GATE CS Fundamentals",
                    description = "Synergizing theory and hands-on system execution.",
                    category = "Application",
                    durationHours = remainingH
                )
            )

            // 5. Evening Synthesis & LinkedIn Review
            blocks.add(
                TacticalScheduleBlock(
                    id = "block_4",
                    timeRange = "7:00 PM - 7:45 PM",
                    title = "Professional Visibility & LinkedIn Studio",
                    description = "Synthesize daily workshop or project learnings into high-impact professional updates.",
                    category = "Career Growth",
                    durationHours = 0.75
                )
            )

            _scheduleBlocks.value = blocks
        }
    }
}
