package com.stark.jarvis.ui.screens.memory

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.stark.jarvis.data.local.entity.NoteEntity
import com.stark.jarvis.ui.theme.*

@Composable
fun MemoryVaultScreen(
    viewModel: MemoryViewModel = viewModel()
) {
    val context = LocalContext.current
    val currentName by viewModel.userName.collectAsState()
    val currentGoal by viewModel.primaryGoal.collectAsState()
    val currentInterests by viewModel.learningInterests.collectAsState()
    val notes by viewModel.notes.collectAsState()

    var nameInput by remember(currentName) { mutableStateOf(currentName) }
    var goalInput by remember(currentGoal) { mutableStateOf(currentGoal) }
    var interestsInput by remember(currentInterests) { mutableStateOf(currentInterests) }
    var newNoteText by remember { mutableStateOf("") }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(StarkObsidian)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Text(
                text = "PERSONAL MEMORY & COGNITIVE VAULT",
                color = TextPrimary,
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.5.sp
            )
            Text(
                text = "Approved goals, preferences, and projects stored safely on-device.",
                color = TextDim,
                fontSize = 11.sp
            )
        }

        // Identity & Core Goals Card
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
                        text = "👤 USER IDENTITY & GOALS",
                        color = StarkCyan,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )

                    OutlinedTextField(
                        value = nameInput,
                        onValueChange = { nameInput = it },
                        label = { Text("Display Name / Call Sign", color = TextDim, fontSize = 11.sp) },
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
                        value = goalInput,
                        onValueChange = { goalInput = it },
                        label = { Text("Primary Career Objective", color = TextDim, fontSize = 11.sp) },
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
                        value = interestsInput,
                        onValueChange = { interestsInput = it },
                        label = { Text("Learning Focus (comma-separated)", color = TextDim, fontSize = 11.sp) },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = StarkCyan,
                            unfocusedBorderColor = BorderDim,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        shape = RoundedCornerShape(8.dp)
                    )

                    Button(
                        onClick = {
                            viewModel.saveProfile(nameInput, goalInput, interestsInput)
                            Toast.makeText(context, "Identity profile updated in DataStore!", Toast.LENGTH_SHORT).show()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = StarkCyan, contentColor = StarkObsidian),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("SAVE IDENTITY PROFILES", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Add Knowledge Snippet Card
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
                    Text(
                        text = "📝 ADD KNOWLEDGE SNIPPET",
                        color = StarkCyan,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TextField(
                            value = newNoteText,
                            onValueChange = { newNoteText = it },
                            placeholder = { Text("Enter technical snippet or formula to save...", color = TextDim, fontSize = 12.sp) },
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = StarkNavy,
                                unfocusedContainerColor = StarkNavy,
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary,
                                focusedIndicatorColor = androidx.compose.ui.graphics.Color.Transparent,
                                unfocusedIndicatorColor = androidx.compose.ui.graphics.Color.Transparent
                            ),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f)
                        )

                        Spacer(modifier = Modifier.width(8.dp))

                        Button(
                            onClick = {
                                if (newNoteText.isNotBlank()) {
                                    viewModel.addNote(newNoteText.trim())
                                    newNoteText = ""
                                    Toast.makeText(context, "Note recorded in Room database!", Toast.LENGTH_SHORT).show()
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = StarkCyan, contentColor = StarkObsidian),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("+ ADD", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // Saved Notes List
        item {
            Text(
                text = "SAVED KNOWLEDGE SNIPPETS (${notes.size})",
                color = TextPrimary,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.5.sp
            )
        }

        items(notes) { note ->
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(StarkCard)
                    .border(1.dp, BorderDim, RoundedCornerShape(10.dp))
                    .padding(12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(text = note.content, color = TextPrimary, fontSize = 12.sp, lineHeight = 16.sp)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(text = "🏷️ ${note.category}", color = StarkCyan, fontSize = 10.sp)
                    }

                    IconButton(
                        onClick = { viewModel.deleteNote(note.id) },
                        modifier = Modifier.size(24.dp)
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = StarkRed, modifier = Modifier.size(16.dp))
                    }
                }
            }
        }
    }
}
