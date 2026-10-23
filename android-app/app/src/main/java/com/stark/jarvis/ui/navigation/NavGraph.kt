package com.stark.jarvis.ui.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.stark.jarvis.ui.components.HudHeader
import com.stark.jarvis.ui.screens.dashboard.DashboardScreen
import com.stark.jarvis.ui.screens.linkedin.LinkedInStudioScreen
import com.stark.jarvis.ui.screens.memory.MemoryVaultScreen
import com.stark.jarvis.ui.screens.planner.TacticalPlanScreen
import com.stark.jarvis.ui.screens.reminders.RemindersScreen
import com.stark.jarvis.ui.screens.settings.SettingsScreen
import com.stark.jarvis.ui.screens.voice.VoiceAssistantScreen
import com.stark.jarvis.ui.theme.*

@Composable
fun MainAppScaffold(
    onTriggerSpeechRecognition: () -> Unit,
    onSpeakText: (String) -> Unit,
    onStopSpeech: () -> Unit
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: Screen.Dashboard.route

    Scaffold(
        topBar = {
            HudHeader()
        },
        bottomBar = {
            NavigationBar(
                containerColor = StarkNavy,
                tonalElevation = 8.dp
            ) {
                Screen.navItems.forEach { screen ->
                    val selected = currentRoute == screen.route
                    NavigationBarItem(
                        selected = selected,
                        onClick = {
                            navController.navigate(screen.route) {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = {
                            Icon(
                                imageVector = screen.icon,
                                contentDescription = screen.title,
                                tint = if (selected) StarkCyan else TextDim
                            )
                        },
                        label = {
                            Text(
                                text = screen.title,
                                color = if (selected) StarkCyan else TextDim,
                                fontSize = 9.sp
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            indicatorColor = StarkCyanDim
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(StarkObsidian)
                .padding(innerPadding)
        ) {
            NavHost(
                navController = navController,
                startDestination = Screen.Dashboard.route
            ) {
                composable(Screen.Dashboard.route) {
                    DashboardScreen(onNavigateToTab = { route -> navController.navigate(route) })
                }
                composable(Screen.Voice.route) {
                    VoiceAssistantScreen(
                        onTriggerSpeechRecognition = onTriggerSpeechRecognition,
                        onSpeakText = onSpeakText,
                        onStopSpeech = onStopSpeech
                    )
                }
                composable(Screen.Reminders.route) {
                    RemindersScreen()
                }
                composable(Screen.Planner.route) {
                    TacticalPlanScreen()
                }
                composable(Screen.LinkedIn.route) {
                    LinkedInStudioScreen()
                }
                composable(Screen.Memory.route) {
                    MemoryVaultScreen()
                }
                composable(Screen.Settings.route) {
                    SettingsScreen()
                }
            }
        }
    }
}
