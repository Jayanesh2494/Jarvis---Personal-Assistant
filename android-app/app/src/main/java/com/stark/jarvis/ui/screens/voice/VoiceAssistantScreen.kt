package com.stark.jarvis.ui.screens.voice

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.stark.jarvis.ui.theme.*

@Composable
fun VoiceAssistantScreen(
    onTriggerSpeechRecognition: () -> Unit,
    onSpeakText: (String) -> Unit,
    onStopSpeech: () -> Unit,
    viewModel: VoiceViewModel = viewModel()
) {
    val messages by viewModel.messages.collectAsState()
    val isListening by viewModel.isListening.collectAsState()
    val statusText by viewModel.statusText.collectAsState()

    var inputText by remember { mutableStateOf("") }
    val listState = rememberLazyListState()

    LaunchedEffect(messages.size) {
        listState.animateScrollToItem(messages.size)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(StarkObsidian)
    ) {
        // 1. Voice Orb & Frequency Equalizer Stage
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(StarkNavy.copy(alpha = 0.5f))
                .border(1.dp, BorderDim, RoundedCornerShape(bottomStart = 16.dp, bottomEnd = 16.dp))
                .padding(vertical = 16.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                // Interactive Orb
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .size(80.dp)
                        .clip(CircleShape)
                        .background(if (isListening) StarkCyan else StarkCard)
                        .border(2.dp, StarkCyan, CircleShape)
                        .clickable { onTriggerSpeechRecognition() }
                ) {
                    Icon(
                        imageVector = Icons.Default.Mic,
                        contentDescription = "Voice Listening",
                        tint = if (isListening) StarkObsidian else StarkCyan,
                        modifier = Modifier.size(36.dp)
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Status Pill
                Text(
                    text = statusText,
                    color = StarkCyan,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.8.sp,
                    modifier = Modifier
                        .background(StarkCyanDim, RoundedCornerShape(12.dp))
                        .padding(horizontal = 12.dp, vertical = 4.dp)
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Animated Sound Equalizer Bars
                SoundEqualizer(isListening = isListening)
            }
        }

        // 2. Chat Messages Stream
        LazyColumn(
            state = listState,
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(messages) { msg ->
                ChatBubble(msg)
            }
        }

        // 3. Prompt Suggestion Chips
        val chips = listOf(
            "What do I need to do today?",
            "Remind me to study GATE at 7 PM",
            "Draft AWS LinkedIn post",
            "Help me plan my coding practice",
            "Status report"
        )

        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            items(chips) { chip ->
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(StarkCard)
                        .border(1.dp, BorderDim, RoundedCornerShape(12.dp))
                        .clickable {
                            viewModel.executeQuery(chip, onSpeakText)
                        }
                        .padding(horizontal = 10.dp, vertical = 5.dp)
                ) {
                    Text(text = chip, color = StarkCyan, fontSize = 11.sp)
                }
            }
        }

        // 4. Input Terminal Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(StarkNavy)
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = { onTriggerSpeechRecognition() },
                modifier = Modifier
                    .size(42.dp)
                    .background(StarkCyanDim, RoundedCornerShape(8.dp))
            ) {
                Icon(Icons.Default.Mic, contentDescription = "Mic", tint = StarkCyan)
            }

            Spacer(modifier = Modifier.width(8.dp))

            TextField(
                value = inputText,
                onValueChange = { inputText = it },
                placeholder = { Text("Type directive or ask JARVIS...", color = TextDim, fontSize = 13.sp) },
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = StarkCard,
                    unfocusedContainerColor = StarkCard,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent
                ),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.weight(1f)
            )

            Spacer(modifier = Modifier.width(8.dp))

            IconButton(
                onClick = {
                    if (inputText.isNotBlank()) {
                        viewModel.executeQuery(inputText, onSpeakText)
                        inputText = ""
                    }
                },
                modifier = Modifier
                    .size(42.dp)
                    .background(StarkCyan, RoundedCornerShape(8.dp))
            ) {
                Icon(Icons.Default.Send, contentDescription = "Send", tint = StarkObsidian)
            }
        }
    }
}

@Composable
private fun SoundEqualizer(isListening: Boolean) {
    val infiniteTransition = rememberInfiniteTransition(label = "equalizer")

    Row(
        horizontalArrangement = Arrangement.spacedBy(3.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        repeat(12) { i ->
            val height by infiniteTransition.animateFloat(
                initialValue = 4f,
                targetValue = if (isListening) (10f + (i * 3 % 20)) else 4f,
                animationSpec = infiniteRepeatable(
                    animation = tween(300 + (i * 40), easing = FastOutSlowInEasing),
                    repeatMode = RepeatMode.Reverse
                ),
                label = "bar_$i"
            )

            Box(
                modifier = Modifier
                    .width(3.dp)
                    .height(height.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(StarkCyan)
            )
        }
    }
}

@Composable
private fun ChatBubble(message: ChatMessage) {
    val isUser = message.sender == "user"

    Box(
        modifier = Modifier.fillMaxWidth(),
        contentAlignment = if (isUser) Alignment.CenterEnd else Alignment.CenterStart
    ) {
        Column(
            modifier = Modifier
                .widthIn(max = 300.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(if (isUser) StarkCyan.copy(alpha = 0.15f) else StarkCard)
                .border(1.dp, if (isUser) StarkCyan.copy(alpha = 0.4f) else BorderDim, RoundedCornerShape(12.dp))
                .padding(12.dp)
        ) {
            if (!isUser) {
                Text(
                    text = "JARVIS //",
                    color = StarkCyan,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.8.sp
                )
                Spacer(modifier = Modifier.height(2.dp))
            }

            Text(
                text = message.text,
                color = TextPrimary,
                fontSize = 13.sp,
                lineHeight = 18.sp
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = message.time,
                color = TextDim,
                fontSize = 9.sp,
                modifier = Modifier.align(Alignment.End)
            )
        }
    }
}
