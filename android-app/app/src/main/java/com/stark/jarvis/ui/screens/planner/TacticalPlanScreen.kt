package com.stark.jarvis.ui.screens.planner

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.stark.jarvis.domain.model.TacticalScheduleBlock
import com.stark.jarvis.ui.theme.*

@Composable
fun TacticalPlanScreen(
    viewModel: PlannerViewModel = viewModel()
) {
    val blocks by viewModel.scheduleBlocks.collectAsState()
    val availableHours by viewModel.availableHours.collectAsState()
    val focusArea by viewModel.focusArea.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(StarkObsidian)
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "DAILY TACTICAL PLANNER",
                    color = TextPrimary,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.5.sp
                )
                Text(
                    text = "Algorithmic time allocation for exams, coding, and sprints.",
                    color = TextDim,
                    fontSize = 11.sp
                )
            }

            Button(
                onClick = { viewModel.generateSchedule() },
                colors = ButtonDefaults.buttonColors(containerColor = StarkCyan, contentColor = StarkObsidian),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Text("⚡ RECALC", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Parameters Control Card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(StarkCard)
                .border(1.dp, BorderDim, RoundedCornerShape(12.dp))
                .padding(14.dp)
        ) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Available Hours: ${availableHours.toInt()}h", color = TextPrimary, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    Slider(
                        value = availableHours.toFloat(),
                        onValueChange = { viewModel.setAvailableHours(it.toDouble()) },
                        valueRange = 2f..14f,
                        steps = 11,
                        modifier = Modifier.width(160.dp),
                        colors = SliderDefaults.colors(thumbColor = StarkCyan, activeTrackColor = StarkCyan)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FocusAreaPill("GATE Prep", focusArea == "gate", Modifier.weight(1f)) { viewModel.setFocusArea("gate") }
                    FocusAreaPill("Coding", focusArea == "coding", Modifier.weight(1f)) { viewModel.setFocusArea("coding") }
                    FocusAreaPill("AWS/AI", focusArea == "projects", Modifier.weight(1f)) { viewModel.setFocusArea("projects") }
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        Text(
            text = "TACTICAL TIMELINE // TODAY",
            color = TextPrimary,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.5.sp
        )

        Spacer(modifier = Modifier.height(8.dp))

        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(blocks) { block ->
                TimelineBlockCard(block)
            }
        }
    }
}

@Composable
private fun FocusAreaPill(
    label: String,
    isSelected: Boolean,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(6.dp))
            .background(if (isSelected) StarkCyanDim else StarkNavy)
            .border(1.dp, if (isSelected) StarkCyan else BorderDim, RoundedCornerShape(6.dp))
            .padding(vertical = 6.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            color = if (isSelected) StarkCyan else TextDim,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun TimelineBlockCard(block: TacticalScheduleBlock) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.Top
    ) {
        // Vertical timeline indicator
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.width(20.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(10.dp)
                    .clip(CircleShape)
                    .background(StarkCyan)
            )
            Box(
                modifier = Modifier
                    .width(2.dp)
                    .height(60.dp)
                    .background(BorderDim)
            )
        }

        Spacer(modifier = Modifier.width(10.dp))

        Box(
            modifier = Modifier
                .weight(1f)
                .clip(RoundedCornerShape(10.dp))
                .background(StarkCard)
                .border(1.dp, BorderDim, RoundedCornerShape(10.dp))
                .padding(12.dp)
        ) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = block.timeRange,
                        color = StarkCyan,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = block.category.uppercase(),
                        color = StarkGold,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier
                            .background(StarkGold.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = block.title,
                    color = TextPrimary,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold
                )

                Spacer(modifier = Modifier.height(2.dp))

                Text(
                    text = block.description,
                    color = TextDim,
                    fontSize = 11.sp,
                    lineHeight = 15.sp
                )
            }
        }
    }
}
