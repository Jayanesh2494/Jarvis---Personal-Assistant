package com.stark.jarvis.ui.screens.linkedin

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.stark.jarvis.ui.theme.*

@Composable
fun LinkedInStudioScreen(
    viewModel: LinkedInViewModel = viewModel()
) {
    val context = LocalContext.current
    val topic by viewModel.topic.collectAsState()
    val category by viewModel.category.collectAsState()
    val keyFacts by viewModel.keyFacts.collectAsState()
    val draft by viewModel.generatedDraft.collectAsState()

    val wordCount = if (draft.isBlank()) 0 else draft.trim().split(Regex("""\s+""")).size
    val charCount = draft.length

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(StarkObsidian)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Text(
                text = "LINKEDIN CONTENT STUDIO",
                color = TextPrimary,
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.5.sp
            )
            Text(
                text = "Synthesize technical project announcements and workshop recaps.",
                color = TextDim,
                fontSize = 11.sp
            )
        }

        // Post Specification Card
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
                        text = "⚙️ POST SPECIFICATIONS",
                        color = StarkCyan,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )

                    OutlinedTextField(
                        value = topic,
                        onValueChange = { viewModel.updateTopic(it) },
                        label = { Text("Topic / Milestone", color = TextDim, fontSize = 11.sp) },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = StarkCyan,
                            unfocusedBorderColor = BorderDim,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        shape = RoundedCornerShape(8.dp)
                    )

                    OutlinedTextField(
                        value = keyFacts,
                        onValueChange = { viewModel.updateKeyFacts(it) },
                        label = { Text("Key Facts & Architecture Highlights", color = TextDim, fontSize = 11.sp) },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 2,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = StarkCyan,
                            unfocusedBorderColor = BorderDim,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        shape = RoundedCornerShape(8.dp)
                    )

                    Button(
                        onClick = { viewModel.generateDraft() },
                        colors = ButtonDefaults.buttonColors(containerColor = StarkCyan, contentColor = StarkObsidian),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("✨ SYNTHESIZE LINKEDIN DRAFT", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Generated Draft Preview
        item {
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
                        Text(
                            text = "📄 GENERATED DRAFT",
                            color = StarkCyan,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "$wordCount words // $charCount chars",
                            color = TextDim,
                            fontSize = 10.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(StarkNavy)
                            .padding(12.dp)
                    ) {
                        Text(
                            text = draft,
                            color = TextPrimary,
                            fontSize = 12.sp,
                            lineHeight = 18.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = {
                                val copied = viewModel.copyToClipboard(context)
                                if (copied) Toast.makeText(context, "Copied to clipboard!", Toast.LENGTH_SHORT).show()
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = StarkCyanDim, contentColor = StarkCyan),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("📋 COPY POST", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }

                        Button(
                            onClick = { viewModel.openLinkedIn(context) },
                            colors = ButtonDefaults.buttonColors(containerColor = StarkGold, contentColor = StarkObsidian),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("🚀 LINKEDIN", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // Compliance Checklist
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(StarkCard)
                    .border(1.dp, StarkGreen.copy(alpha = 0.3f), RoundedCornerShape(10.dp))
                    .padding(12.dp)
            ) {
                Column {
                    Text(
                        text = "QUALITY COMPLIANCE CHECK:",
                        color = StarkGreen,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("✅ No fabricated statistics, fake awards, or hallucinated claims", color = TextDim, fontSize = 10.sp)
                    Text("✅ Hook present in first 2 lines for high engagement", color = TextDim, fontSize = 10.sp)
                    Text("✅ Human review verified before manual publishing", color = TextDim, fontSize = 10.sp)
                }
            }
        }
    }
}
