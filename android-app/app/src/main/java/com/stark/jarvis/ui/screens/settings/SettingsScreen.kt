package com.stark.jarvis.ui.screens.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import com.stark.jarvis.service.JarvisNotificationListenerService
import com.stark.jarvis.ui.theme.*

@Composable
fun SettingsScreen(
    viewModel: SettingsViewModel = viewModel()
) {
    val context = LocalContext.current
    val autoVocalize by viewModel.autoVocalize.collectAsState()
    val offlineFirst by viewModel.offlineFirst.collectAsState()
    val notifListenerActive by JarvisNotificationListenerService.isServiceActive.collectAsState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(StarkObsidian)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Text(
                text = "SYSTEM CORE & SECURITY ARCHITECTURE",
                color = TextPrimary,
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.5.sp
            )
            Text(
                text = "Hardware telemetry, permission scopes, and local AI model status.",
                color = TextDim,
                fontSize = 11.sp
            )
        }

        // Local AI Engine Status
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(StarkCard)
                    .border(1.dp, BorderDim, RoundedCornerShape(12.dp))
                    .padding(14.dp)
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "🤖 LOCAL AI INFERENCE ENGINE",
                        color = StarkCyan,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )

                    SpecRow("Inference Engine:", "Autonomous Regex Intent Classifier")
                    SpecRow("Mobile LLM Target:", "Gemma 2B (int4) / MediaPipe GenAI")
                    SpecRow("Inference Location:", "100% On-Device (Zero Cloud Leak)")
                    SpecRow("Execution Pipeline:", "Room SQLite + AlarmManager RTC")
                }
            }
        }

        // Privacy & Personality Toggles
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(StarkCard)
                    .border(1.dp, BorderDim, RoundedCornerShape(12.dp))
                    .padding(14.dp)
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "⚙️ PRIVACY & AUDIO PREFERENCES",
                        color = StarkCyan,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Auto-vocalize Responses", color = TextPrimary, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                            Text("Speak answers aloud via Android TextToSpeech", color = TextDim, fontSize = 10.sp)
                        }
                        Switch(
                            checked = autoVocalize,
                            onCheckedChange = { viewModel.toggleAutoVocalize(it) },
                            colors = SwitchDefaults.colors(checkedThumbColor = StarkCyan, checkedTrackColor = StarkNavy)
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Offline-First Protection", color = TextPrimary, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                            Text("Keep private directives strictly on phone storage", color = TextDim, fontSize = 10.sp)
                        }
                        Switch(
                            checked = offlineFirst,
                            onCheckedChange = { viewModel.toggleOfflineFirst(it) },
                            colors = SwitchDefaults.colors(checkedThumbColor = StarkGreen, checkedTrackColor = StarkNavy)
                        )
                    }
                }
            }
        }

        // Notification Listener Permission Setup
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(StarkCard)
                    .border(1.dp, BorderDim, RoundedCornerShape(12.dp))
                    .padding(14.dp)
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "🔔 NOTIFICATION LISTENER ACCESS",
                            color = StarkCyan,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = if (notifListenerActive) "GRANTED" else "NOT CONNECTED",
                            color = if (notifListenerActive) StarkGreen else StarkGold,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier
                                .background(
                                    (if (notifListenerActive) StarkGreen else StarkGold).copy(alpha = 0.15f),
                                    RoundedCornerShape(4.dp)
                                )
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }

                    Text(
                        text = "Allows JARVIS to summarize incoming message alerts without storing content indefinitely.",
                        color = TextDim,
                        fontSize = 11.sp
                    )

                    Button(
                        onClick = { viewModel.openNotificationListenerSettings(context) },
                        colors = ButtonDefaults.buttonColors(containerColor = StarkCyanDim, contentColor = StarkCyan),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("CONFIGURE NOTIFICATION ACCESS", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
private fun SpecRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, color = TextDim, fontSize = 11.sp)
        Text(text = value, color = TextPrimary, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
    }
}
