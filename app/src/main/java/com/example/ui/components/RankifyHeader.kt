package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*

@Composable
fun RankifyHeader(
    userName: String,
    liveClockTime: String,
    isDarkMode: Boolean,
    streak: Int = 0,
    isTodayGoalMet: Boolean = false,
    onOpenStreak: () -> Unit = {},
    onToggleTheme: () -> Unit,
    onUpdateName: (String) -> Unit,
    onOpenSettings: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    var showEditDialog by remember { mutableStateOf(false) }
    var editedName by remember { mutableStateOf(userName) }

    // Initials calculation for the Bento avatar
    val initials = remember(userName) {
        val parts = userName.trim().split(" ").filter { it.isNotEmpty() }
        if (parts.size >= 2) {
            "${parts[0].take(1)}${parts[1].take(1)}".uppercase()
        } else if (parts.isNotEmpty()) {
            parts[0].take(2).uppercase()
        } else {
            "AS"
        }
    }

    Surface(
        color = MaterialTheme.colorScheme.surface,
        shape = RoundedCornerShape(bottomStart = 28.dp, bottomEnd = 28.dp),
        shadowElevation = 8.dp,
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
        modifier = modifier
            .fillMaxWidth()
            .testTag("rankify_top_header")
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // Aspirant Info Section (Clickable to edit name)
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .clip(RoundedCornerShape(16.dp))
                    .clickable {
                        editedName = userName
                        showEditDialog = true
                    }
                    .padding(vertical = 4.dp)
            ) {
                // Bento Ice Blue Avatar
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(if (isDarkMode) BentoAccentBlue else BentoSecondarySlate)
                        .border(1.dp, BentoBorderDark.copy(alpha = 0.5f), RoundedCornerShape(16.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = initials,
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 18.sp,
                            letterSpacing = (-0.5).sp
                        ),
                        color = if (isDarkMode) BentoOnAccentBlue else Color.White
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = userName,
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 15.sp
                            ),
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.85f)
                        )

                        // Golden IITian Pill Badge
                        Surface(
                            shape = CircleShape,
                            color = BentoGoldIITian,
                            modifier = Modifier.testTag("iitian_badge")
                        ) {
                            Text(
                                text = "IITIAN",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.Black,
                                    fontSize = 10.sp,
                                    letterSpacing = (-0.5).sp
                                ),
                                color = Color.Black,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(3.dp))

                    // Monospace High-Contrast Bento Clock
                    Text(
                        text = if (liveClockTime.isNotEmpty()) liveClockTime else "00:00:00",
                        style = MaterialTheme.typography.bodySmall.copy(
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.SemiBold,
                            letterSpacing = 2.sp,
                            fontSize = 12.sp
                        ),
                        color = if (isDarkMode) BentoAccentBlue else MaterialTheme.colorScheme.primary
                    )
                }
            }

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Streak Flame Pill Badge (Clickable to open Streak Details)
                Surface(
                    shape = CircleShape,
                    color = if (isTodayGoalMet) GoldenAmber.copy(alpha = 0.22f) else if (isDarkMode) BentoSecondarySlate else BentoSecondarySlateLight,
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (isTodayGoalMet) GoldenAmber else MaterialTheme.colorScheme.outline.copy(alpha = 0.4f)
                    ),
                    modifier = Modifier
                        .clip(CircleShape)
                        .clickable { onOpenStreak() }
                        .testTag("header_streak_pill")
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 9.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocalFireDepartment,
                            contentDescription = "Streak",
                            tint = GoldenAmber,
                            modifier = Modifier.size(17.dp)
                        )
                        Text(
                            text = "$streak",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Black,
                                fontSize = 12.sp
                            ),
                            color = GoldenAmber
                        )
                    }
                }

                // Settings & Focus Alerts Button
                IconButton(
                    onClick = onOpenSettings,
                    modifier = Modifier
                        .testTag("settings_button")
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(if (isDarkMode) BentoSecondarySlate else BentoSecondarySlateLight)
                        .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f), CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Default.Settings,
                        contentDescription = "Open Settings & Alerts",
                        tint = if (isDarkMode) BentoAccentBlue else MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(20.dp)
                    )
                }

                // Theme Toggle Button in Bento Slate Pill
                IconButton(
                    onClick = onToggleTheme,
                    modifier = Modifier
                        .testTag("theme_toggle_button")
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(if (isDarkMode) BentoSecondarySlate else BentoSecondarySlateLight)
                        .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f), CircleShape)
                ) {
                    Icon(
                        imageVector = if (isDarkMode) Icons.Default.LightMode else Icons.Default.DarkMode,
                        contentDescription = if (isDarkMode) "Switch to Light Mode" else "Switch to Dark Mode",
                        tint = if (isDarkMode) BentoAccentBlue else MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }

    // Name editing dialog
    if (showEditDialog) {
        AlertDialog(
            onDismissRequest = { showEditDialog = false },
            shape = RoundedCornerShape(24.dp),
            containerColor = MaterialTheme.colorScheme.surface,
            title = { Text("Update Aspirant Name", fontWeight = FontWeight.Bold) },
            text = {
                OutlinedTextField(
                    value = editedName,
                    onValueChange = { editedName = it },
                    label = { Text("Name") },
                    singleLine = true,
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                Button(
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = BentoAccentBlue,
                        contentColor = BentoOnAccentBlue
                    ),
                    onClick = {
                        if (editedName.isNotBlank()) {
                            onUpdateName(editedName.trim())
                        }
                        showEditDialog = false
                    }
                ) {
                    Text("Save", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showEditDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
