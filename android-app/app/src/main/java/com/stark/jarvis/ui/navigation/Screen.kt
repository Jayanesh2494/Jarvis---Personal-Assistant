package com.stark.jarvis.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Dashboard : Screen("dashboard", "Command", Icons.Default.Bolt)
    object Voice : Screen("voice", "Voice", Icons.Default.Mic)
    object Reminders : Screen("reminders", "Tasks", Icons.Default.Alarm)
    object Planner : Screen("planner", "Planner", Icons.Default.CalendarToday)
    object LinkedIn : Screen("linkedin", "LinkedIn", Icons.Default.Work)
    object Memory : Screen("memory", "Vault", Icons.Default.Psychology)
    object Settings : Screen("settings", "Core", Icons.Default.Security)

    companion object {
        val navItems = listOf(Dashboard, Voice, Reminders, Planner, LinkedIn, Memory, Settings)
    }
}
