package com.stark.jarvis.ui.screens.reminders

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.stark.jarvis.data.local.entity.ReminderEntity
import com.stark.jarvis.ui.theme.*

@Composable
fun RemindersScreen(
    viewModel: RemindersViewModel = viewModel()
) {
    val reminders by viewModel.filteredReminders.collectAsState()
    val allReminders by viewModel.allReminders.collectAsState()
    val currentFilter by viewModel.selectedFilter.collectAsState()

    var naturalInput by remember { mutableStateOf("") }
    var parseError by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(StarkObsidian)
            .padding(16.dp)
    ) {
        Text(
            text = "TACTICAL REMINDERS & DIRECTIVES",
            color = TextPrimary,
            fontSize = 17.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.5.sp
        )
        Text(
            text = "Natural-language parsed, persistent Room database alerts.",
            color = TextDim,
            fontSize = 11.sp
        )

        Spacer(modifier = Modifier.height(14.dp))

        // Natural Language Input Card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(StarkCard)
                .border(1.dp, BorderDim, RoundedCornerShape(12.dp))
                .padding(12.dp)
        ) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextField(
                        value = naturalInput,
                        onValueChange = {
                            naturalInput = it
                            parseError = false
                        },
                        placeholder = { Text("e.g. Study GATE at 7 PM or Review code tomorrow 10 AM", color = TextDim, fontSize = 12.sp) },
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = StarkNavy,
                            unfocusedContainerColor = StarkNavy,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1f)
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    Button(
                        onClick = {
                            if (naturalInput.isNotBlank()) {
                                val success = viewModel.addNaturalLanguageReminder(naturalInput)
                                if (success) {
                                    naturalInput = ""
                                    parseError = false
                                } else {
                                    parseError = true
                                }
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = StarkCyan, contentColor = StarkObsidian),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 10.dp)
                    ) {
                        Text("SCHEDULE", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }

                if (parseError) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Could not parse time. Please specify time (e.g. at 7 PM or 16:30).",
                        color = StarkRed,
                        fontSize = 10.sp
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Filter Tabs
        val filters = listOf(
            "all" to "ALL (${allReminders.size})",
            "active" to "PENDING (${allReminders.count { !it.isCompleted }})",
            "completed" to "RESOLVED (${allReminders.count { it.isCompleted }})",
            "high" to "HIGH (${allReminders.count { it.priority == "high" && !it.isCompleted }})"
        )

        LazyRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(filters) { (key, label) ->
                val isSelected = currentFilter == key
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isSelected) StarkCyanDim else StarkCard)
                        .border(1.dp, if (isSelected) StarkCyan else BorderDim, RoundedCornerShape(8.dp))
                        .clickable { viewModel.setFilter(key) }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = label,
                        color = if (isSelected) StarkCyan else TextDim,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Reminders List
        if (reminders.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("🎯", fontSize = 32.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("No directives in this view", color = TextPrimary, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                    Text("Add a task using the bar above or voice assistant.", color = TextDim, fontSize = 11.sp)
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(reminders) { item ->
                    ReminderCard(
                        reminder = item,
                        onToggle = { viewModel.toggleComplete(item) },
                        onSnooze = { viewModel.snoozeReminder(item) },
                        onDelete = { viewModel.deleteReminder(item.id) }
                    )
                }
            }
        }
    }
}

@Composable
private fun ReminderCard(
    reminder: ReminderEntity,
    onToggle: () -> Unit,
    onSnooze: () -> Unit,
    onDelete: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(StarkCard)
            .border(
                1.dp,
                if (reminder.priority == "high") StarkRed.copy(alpha = 0.5f) else BorderDim,
                RoundedCornerShape(12.dp)
            )
            .padding(14.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Text(
                    text = reminder.title,
                    color = if (reminder.isCompleted) TextDim else TextPrimary,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    textDecoration = if (reminder.isCompleted) TextDecoration.LineThrough else null,
                    modifier = Modifier.weight(1f)
                )

                Spacer(modifier = Modifier.width(8.dp))

                val priorityColor = when (reminder.priority) {
                    "high" -> StarkRed
                    "low" -> TextDim
                    else -> StarkCyan
                }

                Text(
                    text = reminder.priority.uppercase(),
                    color = priorityColor,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier
                        .background(priorityColor.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "📅 ${reminder.targetDate} // ⏰ ${reminder.targetTime}",
                    color = TextDim,
                    fontSize = 11.sp
                )
                Text(
                    text = "🏷️ ${reminder.category.uppercase()}",
                    color = StarkCyan,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedButton(
                    onClick = onToggle,
                    shape = RoundedCornerShape(6.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = if (reminder.isCompleted) TextDim else StarkCyan)
                ) {
                    Text(if (reminder.isCompleted) "↩️ REOPEN" else "✓ DONE", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                }

                if (!reminder.isCompleted) {
                    Spacer(modifier = Modifier.width(6.dp))
                    OutlinedButton(
                        onClick = onSnooze,
                        shape = RoundedCornerShape(6.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = StarkGold)
                    ) {
                        Text("⏳ +30m", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    }
                }

                Spacer(modifier = Modifier.width(6.dp))
                IconButton(onClick = onDelete, modifier = Modifier.size(28.dp)) {
                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = StarkRed, modifier = Modifier.size(16.dp))
                }
            }
        }
    }
}
