package com.stark.jarvis.ui.screens.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.stark.jarvis.ui.components.ArcReactor
import com.stark.jarvis.ui.components.MetricCard
import com.stark.jarvis.ui.theme.*

@Composable
fun DashboardScreen(
    onNavigateToTab: (String) -> Unit,
    viewModel: DashboardViewModel = viewModel()
) {
    val context = LocalContext.current
    val userName by viewModel.userName.collectAsState()
    val activeReminders by viewModel.activeReminders.collectAsState()
    val completionRate by viewModel.completionRate.collectAsState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(StarkObsidian)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Hero Banner with Arc Reactor
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(StarkCard)
                    .border(1.dp, BorderDim, RoundedCornerShape(16.dp))
                    .padding(20.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "STARK TACTICAL INTERFACE",
                            color = StarkCyan,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Good day, $userName.",
                            color = TextPrimary,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "All subsystems nominal. Neural core synchronized and standing by for commands.",
                            color = TextDim,
                            fontSize = 12.sp,
                            lineHeight = 16.sp
                        )
                    }

                    Spacer(modifier = Modifier.width(16.dp))
                    ArcReactor(size = 90.dp)
                }
            }
        }

        // 2. Metrics 2x2 Grid
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    MetricCard(
                        icon = "⏰",
                        value = "${activeReminders.size}",
                        label = "UPCOMING TASKS",
                        trendText = "ACTIVE",
                        trendColor = StarkCyan,
                        modifier = Modifier.weight(1f)
                    )
                    MetricCard(
                        icon = "🎯",
                        value = "$completionRate%",
                        label = "COMPLETION RATE",
                        trendText = if (completionRate >= 75) "OPTIMAL" else "IN PROGRESS",
                        trendColor = if (completionRate >= 75) StarkGreen else StarkGold,
                        modifier = Modifier.weight(1f)
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    MetricCard(
                        icon = "⚡",
                        value = "4.5h",
                        label = "RECOMMENDED FOCUS",
                        trendText = "PLAN READY",
                        trendColor = StarkGold,
                        modifier = Modifier.weight(1f)
                    )
                    MetricCard(
                        icon = "🛡️",
                        value = "ON-DEVICE",
                        label = "PRIVACY MODE",
                        trendText = "100% PRIVATE",
                        trendColor = StarkGreen,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // 3. Primary Directives Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "🎯 PRIMARY DIRECTIVES",
                    color = TextPrimary,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.5.sp
                )
                Text(
                    text = "VIEW ALL ➤",
                    color = StarkCyan,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.clickable { onNavigateToTab("reminders") }
                )
            }
        }

        // Directives list
        if (activeReminders.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(StarkCard, RoundedCornerShape(10.dp))
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No pending directives for today. Systems clear.",
                        color = TextDim,
                        fontSize = 12.sp
                    )
                }
            }
        } else {
            items(activeReminders.take(3)) { reminder ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(StarkCard)
                        .border(
                            1.dp,
                            if (reminder.priority == "high") StarkRed.copy(alpha = 0.5f) else BorderDim,
                            RoundedCornerShape(10.dp)
                        )
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = reminder.title,
                            color = TextPrimary,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "⏰ Due: ${reminder.targetDate} at ${reminder.targetTime} (${reminder.category.uppercase()})",
                            color = TextDim,
                            fontSize = 11.sp
                        )
                    }

                    Button(
                        onClick = { viewModel.markReminderCompleted(reminder.id) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = StarkCyan.copy(alpha = 0.15f),
                            contentColor = StarkCyan
                        ),
                        shape = RoundedCornerShape(6.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text("DONE ✓", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // 4. System Shortcuts Header & Grid
        item {
            Text(
                text = "⚡ SYSTEM SHORTCUTS",
                color = TextPrimary,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.5.sp
            )
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                ShortcutTile("📞", "Dialler", Modifier.weight(1f)) { viewModel.launchDialler(context) }
                ShortcutTile("✉️", "Email", Modifier.weight(1f)) { viewModel.launchEmail(context) }
                ShortcutTile("📅", "Calendar", Modifier.weight(1f)) { viewModel.launchCalendar(context) }
                ShortcutTile("💼", "LinkedIn", Modifier.weight(1f)) { viewModel.launchLinkedIn(context) }
            }
        }

        item {
            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}

@Composable
private fun ShortcutTile(
    icon: String,
    label: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .background(StarkCard)
            .border(1.dp, BorderDim, RoundedCornerShape(10.dp))
            .clickable(onClick = onClick)
            .padding(vertical = 12.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(text = icon, fontSize = 22.sp)
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = label,
            color = TextPrimary,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium
        )
    }
}
