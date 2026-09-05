package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.local.PomodoroPhase
import com.example.data.local.PomodoroPhaseCompletedEvent
import com.example.data.local.PomodoroSettings
import com.example.ui.theme.BentoAccentBlue
import com.example.ui.theme.EmeraldSuccess
import com.example.ui.theme.GoldenAmber

// Color constants for Pomodoro phases
val PomodoroFocusColor = Color(0xFF38BDF8) // Bright Sky / Cyan Focus
val PomodoroShortBreakColor = Color(0xFF10B981) // Emerald Refresh
val PomodoroLongBreakColor = Color(0xFF8B5CF6) // Royal Purple Deep Rest

@Composable
fun PomodoroSettingsDialog(
    currentSettings: PomodoroSettings,
    onDismiss: () -> Unit,
    onSave: (PomodoroSettings) -> Unit
) {
    var focusMinutes by remember { mutableStateOf(currentSettings.focusMinutes) }
    var shortBreakMinutes by remember { mutableStateOf(currentSettings.shortBreakMinutes) }
    var longBreakMinutes by remember { mutableStateOf(currentSettings.longBreakMinutes) }
    var cyclesBeforeLongBreak by remember { mutableStateOf(currentSettings.cyclesBeforeLongBreak) }
    var autoStartNextPhase by remember { mutableStateOf(currentSettings.autoStartNextPhase) }

    val focusPresets = listOf(20, 25, 30, 45, 50, 60)
    val shortBreakPresets = listOf(3, 5, 8, 10, 15)
    val longBreakPresets = listOf(15, 20, 25, 30)
    val cycleOptions = listOf(2, 3, 4, 5, 6)

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = MaterialTheme.colorScheme.surface,
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)),
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(PomodoroFocusColor.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.Tune,
                                contentDescription = null,
                                tint = PomodoroFocusColor,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Pomodoro Intervals",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Configure focus and break durations",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    IconButton(onClick = onDismiss, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close", modifier = Modifier.size(20.dp))
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Column(
                    modifier = Modifier
                        .weight(1f, fill = false)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // 1. FOCUS INTERVAL
                    IntervalConfigSection(
                        title = "Focus Interval",
                        currentValue = "$focusMinutes min",
                        subtitle = "Intense JEE study & problem-solving sprint",
                        color = PomodoroFocusColor,
                        sliderValue = focusMinutes.toFloat(),
                        valueRange = 5f..90f,
                        steps = 16, // 5 min increments
                        onSliderChange = { focusMinutes = (kotlin.math.round(it / 5f) * 5f).toInt().coerceIn(5, 90) },
                        presets = focusPresets,
                        selectedPreset = focusMinutes,
                        onSelectPreset = { focusMinutes = it }
                    )

                    // 2. SHORT BREAK INTERVAL
                    IntervalConfigSection(
                        title = "Short Break Interval",
                        currentValue = "$shortBreakMinutes min",
                        subtitle = "Quick mental reset, hydration & eye rest",
                        color = PomodoroShortBreakColor,
                        sliderValue = shortBreakMinutes.toFloat(),
                        valueRange = 1f..20f,
                        steps = 18, // 1 min increments
                        onSliderChange = { shortBreakMinutes = it.toInt().coerceIn(1, 20) },
                        presets = shortBreakPresets,
                        selectedPreset = shortBreakMinutes,
                        onSelectPreset = { shortBreakMinutes = it }
                    )

                    // 3. LONG BREAK INTERVAL
                    IntervalConfigSection(
                        title = "Long Break Interval",
                        currentValue = "$longBreakMinutes min",
                        subtitle = "Deep recharge before starting the next block",
                        color = PomodoroLongBreakColor,
                        sliderValue = longBreakMinutes.toFloat(),
                        valueRange = 5f..45f,
                        steps = 7, // 5 min increments
                        onSliderChange = { longBreakMinutes = (kotlin.math.round(it / 5f) * 5f).toInt().coerceIn(5, 45) },
                        presets = longBreakPresets,
                        selectedPreset = longBreakMinutes,
                        onSelectPreset = { longBreakMinutes = it }
                    )

                    // 4. LONG BREAK FREQUENCY (CYCLES)
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Long Break Frequency",
                                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "Every $cyclesBeforeLongBreak cycles",
                                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                                    color = PomodoroLongBreakColor
                                )
                            }
                            Text(
                                text = "Number of focus intervals before taking a long break",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                cycleOptions.forEach { opt ->
                                    val isSel = cyclesBeforeLongBreak == opt
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = if (isSel) PomodoroLongBreakColor.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surface,
                                        border = BorderStroke(1.dp, if (isSel) PomodoroLongBreakColor else MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)),
                                        modifier = Modifier
                                            .weight(1f)
                                            .clip(RoundedCornerShape(8.dp))
                                            .clickable { cyclesBeforeLongBreak = opt }
                                    ) {
                                        Box(
                                            modifier = Modifier.padding(vertical = 6.dp),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(
                                                text = "$opt",
                                                style = MaterialTheme.typography.labelSmall.copy(
                                                    fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium
                                                ),
                                                color = if (isSel) PomodoroLongBreakColor else MaterialTheme.colorScheme.onSurface
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // 5. AUTO-START TOGGLE
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Auto-Start Intervals",
                                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "Automatically begin break & focus timers without manual tap",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            Switch(
                                checked = autoStartNextPhase,
                                onCheckedChange = { autoStartNextPhase = it },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color.White,
                                    checkedTrackColor = PomodoroFocusColor
                                )
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Actions
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Cancel")
                    }

                    Button(
                        onClick = {
                            onSave(
                                PomodoroSettings(
                                    focusMinutes = focusMinutes,
                                    shortBreakMinutes = shortBreakMinutes,
                                    longBreakMinutes = longBreakMinutes,
                                    cyclesBeforeLongBreak = cyclesBeforeLongBreak,
                                    autoStartNextPhase = autoStartNextPhase
                                )
                            )
                            onDismiss()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = PomodoroFocusColor),
                        modifier = Modifier.weight(1.3f)
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Apply Settings", color = Color(0xFF031D33), fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
private fun IntervalConfigSection(
    title: String,
    currentValue: String,
    subtitle: String,
    color: Color,
    sliderValue: Float,
    valueRange: ClosedFloatingPointRange<Float>,
    steps: Int,
    onSliderChange: (Float) -> Unit,
    presets: List<Int>,
    selectedPreset: Int,
    onSelectPreset: (Int) -> Unit
) {
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
        border = BorderStroke(1.dp, color.copy(alpha = 0.3f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = color.copy(alpha = 0.18f)
                ) {
                    Text(
                        text = currentValue,
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = color,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(4.dp))

            Slider(
                value = sliderValue,
                onValueChange = onSliderChange,
                valueRange = valueRange,
                steps = steps,
                colors = SliderDefaults.colors(
                    thumbColor = color,
                    activeTrackColor = color,
                    inactiveTrackColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)
                ),
                modifier = Modifier.fillMaxWidth()
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                presets.forEach { preset ->
                    val isSel = selectedPreset == preset
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = if (isSel) color.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surface,
                        border = BorderStroke(1.dp, if (isSel) color else MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)),
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .clickable { onSelectPreset(preset) }
                    ) {
                        Box(
                            modifier = Modifier.padding(vertical = 5.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "${preset}m",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium,
                                    fontSize = 10.sp
                                ),
                                color = if (isSel) color else MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// POMODORO PHASE COMPLETION CELEBRATION DIALOG
// -------------------------------------------------------------
@Composable
fun PomodoroCompletionDialog(
    event: PomodoroPhaseCompletedEvent,
    onDismiss: () -> Unit,
    onStartNextPhase: () -> Unit,
    onLogNotes: () -> Unit
) {
    val isFocusCompleted = event.completedPhase == PomodoroPhase.FOCUS
    val themeColor = if (isFocusCompleted) PomodoroShortBreakColor else PomodoroFocusColor
    val icon = if (isFocusCompleted) Icons.Default.Celebration else Icons.Default.Timer

    AlertDialog(
        onDismissRequest = onDismiss,
        icon = {
            Box(
                modifier = Modifier
                    .size(54.dp)
                    .clip(CircleShape)
                    .background(themeColor.copy(alpha = 0.18f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    icon,
                    contentDescription = null,
                    tint = themeColor,
                    modifier = Modifier.size(28.dp)
                )
            }
        },
        title = {
            Text(
                text = if (isFocusCompleted) "Focus Sprint Completed! 🍅" else "Break Finished! ⚡",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                if (isFocusCompleted) {
                    Text(
                        text = "Great job! You crushed ${event.durationSeconds / 60} minutes of locked-in study.",
                        style = MaterialTheme.typography.bodyMedium,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Cycle ${event.cycleNumber} of ${event.totalCyclesInSet} completed. Up next: ${event.nextPhase.label}.",
                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                        color = themeColor
                    )
                } else {
                    Text(
                        text = "Rest period is complete! Your brain is refreshed and primed for deep focus.",
                        style = MaterialTheme.typography.bodyMedium,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Starting Focus Cycle #${event.cycleNumber}.",
                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                        color = themeColor
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onStartNextPhase,
                colors = ButtonDefaults.buttonColors(containerColor = themeColor)
            ) {
                Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = if (isFocusCompleted) "Start ${event.nextPhase.label}" else "Start Focus",
                    fontWeight = FontWeight.Bold
                )
            }
        },
        dismissButton = {
            if (isFocusCompleted) {
                OutlinedButton(onClick = onLogNotes) {
                    Icon(Icons.Default.EditNote, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add Notes")
                }
            } else {
                TextButton(onClick = onDismiss) {
                    Text("Dismiss")
                }
            }
        }
    )
}
