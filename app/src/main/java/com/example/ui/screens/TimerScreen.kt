package com.example.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.*
import com.example.ui.components.*
import com.example.ui.theme.ChemistryAccent
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.GoldenAmber
import com.example.ui.theme.MathAccent
import com.example.ui.theme.PhysicsAccent
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun TimerScreen(
    clockMode: ClockMode = ClockMode.POMODORO,
    isClockRunning: Boolean,
    remainingSeconds: Long,
    elapsedSeconds: Long,
    timerPresetSeconds: Long,
    sessions: List<StudySessionEntity>,
    showLogDialog: Boolean,
    completedDuration: Long,
    pomodoroSettings: PomodoroSettings = PomodoroSettings(),
    pomodoroPhase: PomodoroPhase = PomodoroPhase.FOCUS,
    pomodoroCycle: Int = 1,
    completedPomodorosCount: Int = 0,
    pomodoroPhaseCompletedEvent: PomodoroPhaseCompletedEvent? = null,
    onSetClockMode: (ClockMode) -> Unit = {},
    onUpdatePomodoroSettings: (PomodoroSettings) -> Unit = {},
    onSelectPomodoroPhase: (PomodoroPhase) -> Unit = {},
    onSkipPomodoroPhase: () -> Unit = {},
    onDismissPomodoroPhaseEvent: () -> Unit = {},
    onStartNextPomodoroPhase: () -> Unit = {},
    isTimerMode: Boolean = (clockMode != ClockMode.STOPWATCH),
    onSetTimerMode: (Boolean) -> Unit = { if (it) onSetClockMode(ClockMode.TIMER) else onSetClockMode(ClockMode.STOPWATCH) },
    onSetPresetMinutes: (Int) -> Unit,
    onStartClock: () -> Unit,
    onPauseClock: () -> Unit,
    onResetClock: () -> Unit,
    onFinishSession: () -> Unit,
    onSaveSessionLog: (category: String, subject: String, notes: String) -> Unit,
    onDismissLogDialog: () -> Unit,
    onDeleteSession: (Long) -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedCategory by remember { mutableStateOf("Self-Study") }
    var selectedSubject by remember { mutableStateOf("Physics") }
    var sessionNotes by remember { mutableStateOf("") }
    var showPomodoroSettingsDialog by remember { mutableStateOf(false) }

    val isPomodoro = clockMode == ClockMode.POMODORO
    val isTimer = clockMode == ClockMode.TIMER
    val isStopwatch = clockMode == ClockMode.STOPWATCH

    val targetSeconds = when (clockMode) {
        ClockMode.POMODORO -> when (pomodoroPhase) {
            PomodoroPhase.FOCUS -> pomodoroSettings.focusMinutes * 60L
            PomodoroPhase.SHORT_BREAK -> pomodoroSettings.shortBreakMinutes * 60L
            PomodoroPhase.LONG_BREAK -> pomodoroSettings.longBreakMinutes * 60L
        }
        ClockMode.TIMER -> timerPresetSeconds
        ClockMode.STOPWATCH -> 0L
    }

    val displaySeconds = if (isStopwatch) elapsedSeconds else remainingSeconds
    val hours = displaySeconds / 3600
    val minutes = (displaySeconds % 3600) / 60
    val seconds = displaySeconds % 60
    val timeFormatted = if (hours > 0) {
        String.format(Locale.US, "%02d:%02d:%02d", hours, minutes, seconds)
    } else {
        String.format(Locale.US, "%02d:%02d", minutes, seconds)
    }

    val progressRatio = if (isStopwatch) {
        1f
    } else if (targetSeconds > 0) {
        (remainingSeconds.toFloat() / targetSeconds).coerceIn(0f, 1f)
    } else {
        1f
    }

    val phaseAccentColor = when (clockMode) {
        ClockMode.POMODORO -> when (pomodoroPhase) {
            PomodoroPhase.FOCUS -> PomodoroFocusColor
            PomodoroPhase.SHORT_BREAK -> PomodoroShortBreakColor
            PomodoroPhase.LONG_BREAK -> PomodoroLongBreakColor
        }
        ClockMode.TIMER -> if (isClockRunning) ElectricCyan else GoldenAmber
        ClockMode.STOPWATCH -> if (isClockRunning) GoldenAmber else ElectricCyan
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .testTag("timer_screen"),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 24.dp)
    ) {
        // Title & Description
        item {
            Column {
                Text(
                    text = "Study Timer & Pomodoro",
                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Structured focus sprints, custom intervals, and detailed study logging.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // 3-Mode Segmented Selector (Pomodoro / Timer / Stopwatch)
        item {
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = MaterialTheme.colorScheme.surfaceVariant,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(modifier = Modifier.padding(4.dp)) {
                    // Mode 1: Pomodoro
                    val pomodoroSelected = clockMode == ClockMode.POMODORO
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (pomodoroSelected) PomodoroFocusColor else Color.Transparent,
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(12.dp))
                            .clickable { onSetClockMode(ClockMode.POMODORO) }
                    ) {
                        Row(
                            modifier = Modifier.padding(vertical = 10.dp),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "🍅",
                                fontSize = 14.sp
                            )
                            Spacer(modifier = Modifier.width(5.dp))
                            Text(
                                text = "Pomodoro",
                                fontWeight = FontWeight.Bold,
                                style = MaterialTheme.typography.labelMedium,
                                color = if (pomodoroSelected) Color(0xFF031D33) else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    // Mode 2: Custom Countdown Timer
                    val timerSelected = clockMode == ClockMode.TIMER
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (timerSelected) MaterialTheme.colorScheme.primary else Color.Transparent,
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(12.dp))
                            .clickable { onSetClockMode(ClockMode.TIMER) }
                    ) {
                        Row(
                            modifier = Modifier.padding(vertical = 10.dp),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.HourglassBottom,
                                contentDescription = null,
                                tint = if (timerSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Timer",
                                fontWeight = FontWeight.Bold,
                                style = MaterialTheme.typography.labelMedium,
                                color = if (timerSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    // Mode 3: Stopwatch
                    val stopwatchSelected = clockMode == ClockMode.STOPWATCH
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (stopwatchSelected) MaterialTheme.colorScheme.primary else Color.Transparent,
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(12.dp))
                            .clickable { onSetClockMode(ClockMode.STOPWATCH) }
                    ) {
                        Row(
                            modifier = Modifier.padding(vertical = 10.dp),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.Timer,
                                contentDescription = null,
                                tint = if (stopwatchSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Stopwatch",
                                fontWeight = FontWeight.Bold,
                                style = MaterialTheme.typography.labelMedium,
                                color = if (stopwatchSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }

        // Pomodoro Cycle Status & Interval Settings Trigger
        if (isPomodoro) {
            item {
                Surface(
                    shape = RoundedCornerShape(18.dp),
                    color = MaterialTheme.colorScheme.surface,
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = "Pomodoro #$pomodoroCycle",
                                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "of ${pomodoroSettings.cyclesBeforeLongBreak}",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                                Text(
                                    text = if (pomodoroCycle % pomodoroSettings.cyclesBeforeLongBreak == 0) {
                                        "Followed by Long Break (${pomodoroSettings.longBreakMinutes}m)"
                                    } else {
                                        "Followed by Short Break (${pomodoroSettings.shortBreakMinutes}m)"
                                    },
                                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                // Completed badge
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = PomodoroFocusColor.copy(alpha = 0.15f)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(text = "🍅", fontSize = 12.sp)
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            text = "$completedPomodorosCount Today",
                                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                            color = PomodoroFocusColor
                                        )
                                    }
                                }

                                // Settings button
                                IconButton(
                                    onClick = { showPomodoroSettingsDialog = true },
                                    modifier = Modifier
                                        .size(34.dp)
                                        .clip(CircleShape)
                                        .background(MaterialTheme.colorScheme.surfaceVariant)
                                ) {
                                    Icon(
                                        Icons.Default.Tune,
                                        contentDescription = "Pomodoro Settings",
                                        tint = MaterialTheme.colorScheme.onSurface,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Segmented Cycle Progress Bar
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            for (i in 1..pomodoroSettings.cyclesBeforeLongBreak) {
                                val isPast = i < pomodoroCycle
                                val isCurrent = i == pomodoroCycle
                                val barColor = when {
                                    isPast -> PomodoroFocusColor
                                    isCurrent -> phaseAccentColor
                                    else -> MaterialTheme.colorScheme.outline.copy(alpha = 0.25f)
                                }
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = barColor,
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(6.dp)
                                ) {}
                            }
                        }
                    }
                }
            }

            // Pomodoro Phase Quick Selectors (Focus, Short Break, Long Break)
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Focus Chip
                    val isFocus = pomodoroPhase == PomodoroPhase.FOCUS
                    PhaseChip(
                        title = "Focus",
                        duration = "${pomodoroSettings.focusMinutes}m",
                        isSelected = isFocus,
                        color = PomodoroFocusColor,
                        modifier = Modifier.weight(1f),
                        onClick = { onSelectPomodoroPhase(PomodoroPhase.FOCUS) }
                    )

                    // Short Break Chip
                    val isShortBreak = pomodoroPhase == PomodoroPhase.SHORT_BREAK
                    PhaseChip(
                        title = "Short Break",
                        duration = "${pomodoroSettings.shortBreakMinutes}m",
                        isSelected = isShortBreak,
                        color = PomodoroShortBreakColor,
                        modifier = Modifier.weight(1f),
                        onClick = { onSelectPomodoroPhase(PomodoroPhase.SHORT_BREAK) }
                    )

                    // Long Break Chip
                    val isLongBreak = pomodoroPhase == PomodoroPhase.LONG_BREAK
                    PhaseChip(
                        title = "Long Break",
                        duration = "${pomodoroSettings.longBreakMinutes}m",
                        isSelected = isLongBreak,
                        color = PomodoroLongBreakColor,
                        modifier = Modifier.weight(1f),
                        onClick = { onSelectPomodoroPhase(PomodoroPhase.LONG_BREAK) }
                    )
                }
            }
        }

        // Timer Duration Presets (if custom timer mode)
        if (isTimer) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val presets = listOf(25, 45, 60, 90)
                    presets.forEach { mins ->
                        val isPresetActive = timerPresetSeconds == mins * 60L
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (isPresetActive) ElectricCyan.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surface,
                            border = BorderStroke(
                                1.dp,
                                if (isPresetActive) ElectricCyan else MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(10.dp))
                                .clickable { onSetPresetMinutes(mins) }
                        ) {
                            Text(
                                text = "${mins}m",
                                style = MaterialTheme.typography.labelMedium.copy(
                                    fontWeight = if (isPresetActive) FontWeight.Bold else FontWeight.Medium
                                ),
                                color = if (isPresetActive) ElectricCyan else MaterialTheme.colorScheme.onSurface,
                                modifier = Modifier.padding(vertical = 8.dp),
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center
                            )
                        }
                    }
                }
            }
        }

        // Animated Radial Timer Visual Display
        item {
            Surface(
                shape = RoundedCornerShape(24.dp),
                color = MaterialTheme.colorScheme.surface,
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f)),
                tonalElevation = 2.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier.size(208.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(
                            progress = { progressRatio },
                            modifier = Modifier.fillMaxSize(),
                            strokeWidth = 11.dp,
                            color = phaseAccentColor,
                            trackColor = MaterialTheme.colorScheme.surfaceVariant
                        )

                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            if (isPomodoro) {
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = phaseAccentColor.copy(alpha = 0.18f),
                                    modifier = Modifier.padding(bottom = 6.dp)
                                ) {
                                    Text(
                                        text = pomodoroPhase.label.uppercase(),
                                        style = MaterialTheme.typography.labelSmall.copy(
                                            fontWeight = FontWeight.Bold,
                                            letterSpacing = 1.sp,
                                            fontSize = 9.sp
                                        ),
                                        color = phaseAccentColor,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                                    )
                                }
                            }

                            Text(
                                text = timeFormatted,
                                style = MaterialTheme.typography.headlineLarge.copy(
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.ExtraBold,
                                    fontSize = 38.sp
                                ),
                                color = MaterialTheme.colorScheme.onSurface
                            )

                            val statusText = when {
                                isPomodoro -> when (pomodoroPhase) {
                                    PomodoroPhase.FOCUS -> if (isClockRunning) "FOCUS SPRINT ACTIVE" else "READY TO FOCUS"
                                    PomodoroPhase.SHORT_BREAK -> if (isClockRunning) "SHORT BREAK ACTIVE" else "REST & HYDRATE"
                                    PomodoroPhase.LONG_BREAK -> if (isClockRunning) "LONG BREAK ACTIVE" else "DEEP RECHARGE"
                                }
                                isTimer -> if (isClockRunning) "COUNTDOWN ACTIVE" else "READY TO START"
                                else -> if (isClockRunning) "STOPWATCH RUNNING" else "READY TO START"
                            }

                            Text(
                                text = statusText,
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    letterSpacing = 1.sp,
                                    fontSize = 10.sp
                                ),
                                color = if (isClockRunning) phaseAccentColor else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Controls: Reset, Play/Pause, Skip (Pomodoro), Finish & Log
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Reset Button
                        IconButton(
                            onClick = onResetClock,
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.surfaceVariant)
                        ) {
                            Icon(Icons.Default.Refresh, contentDescription = "Reset")
                        }

                        // Play / Pause Main Action
                        Button(
                            onClick = {
                                if (isClockRunning) onPauseClock() else onStartClock()
                            },
                            shape = CircleShape,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = phaseAccentColor,
                                contentColor = Color(0xFF031D33)
                            ),
                            modifier = Modifier
                                .size(64.dp)
                                .testTag("timer_toggle_button")
                        ) {
                            Icon(
                                imageVector = if (isClockRunning) Icons.Default.Pause else Icons.Default.PlayArrow,
                                contentDescription = if (isClockRunning) "Pause" else "Start",
                                modifier = Modifier.size(32.dp)
                            )
                        }

                        // Skip Next Phase (Available in Pomodoro mode)
                        if (isPomodoro) {
                            IconButton(
                                onClick = onSkipPomodoroPhase,
                                modifier = Modifier
                                    .size(48.dp)
                                    .clip(CircleShape)
                                    .background(MaterialTheme.colorScheme.surfaceVariant)
                            ) {
                                Icon(
                                    Icons.Default.SkipNext,
                                    contentDescription = "Skip Phase",
                                    tint = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }

                        // Finish & Log Session
                        IconButton(
                            onClick = onFinishSession,
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF10B981).copy(alpha = 0.2f))
                        ) {
                            Icon(
                                Icons.Default.Done,
                                contentDescription = "Finish and Log",
                                tint = Color(0xFF10B981)
                            )
                        }
                    }
                }
            }
        }

        // Session History Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Study Session History",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "${sessions.size} sessions",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // Sessions List
        if (sessions.isEmpty()) {
            item {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier
                            .padding(24.dp)
                            .fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            Icons.Default.HistoryEdu,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(36.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "No study sessions recorded yet",
                            style = MaterialTheme.typography.titleSmall,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Complete a focus block or use Finish & Log to add notes.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        } else {
            items(sessions.take(15), key = { it.id }) { session ->
                SessionItemCard(session = session, onDelete = { onDeleteSession(session.id) })
            }
        }
    }

    // Pomodoro Interval Settings Dialog
    if (showPomodoroSettingsDialog) {
        PomodoroSettingsDialog(
            currentSettings = pomodoroSettings,
            onDismiss = { showPomodoroSettingsDialog = false },
            onSave = {
                onUpdatePomodoroSettings(it)
                showPomodoroSettingsDialog = false
            }
        )
    }

    // Pomodoro Phase Completion Event Dialog
    if (pomodoroPhaseCompletedEvent != null) {
        PomodoroCompletionDialog(
            event = pomodoroPhaseCompletedEvent,
            onDismiss = onDismissPomodoroPhaseEvent,
            onStartNextPhase = onStartNextPomodoroPhase,
            onLogNotes = {
                onDismissPomodoroPhaseEvent()
                onFinishSession()
            }
        )
    }

    // Session Log Dialog (Manual Log or Timer Complete)
    if (showLogDialog) {
        val durationMins = (completedDuration / 60).coerceAtLeast(1)
        val categories = listOf("Self-Study", "Question Practice", "Lecture Revision", "Mock Test Analysis", "Pomodoro Focus")
        val subjects = listOf("Physics", "Chemistry", "Mathematics", "All Subjects")

        AlertDialog(
            onDismissRequest = onDismissLogDialog,
            title = {
                Text(
                    text = "Log Study Session ($durationMins min)",
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                )
            },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Great job finishing your study block! Record your subject and notes to track your progress.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    // Category Selection
                    Text(
                        text = "Session Category",
                        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold)
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        categories.take(3).forEach { cat ->
                            val isSel = selectedCategory == cat
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = if (isSel) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(8.dp))
                                    .clickable { selectedCategory = cat }
                            ) {
                                Text(
                                    text = cat,
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, fontSize = 9.sp),
                                    color = if (isSel) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 6.dp),
                                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                )
                            }
                        }
                    }

                    // Subject Selection
                    Text(
                        text = "Subject",
                        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold)
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        subjects.forEach { subj ->
                            val isSel = selectedSubject == subj
                            val color = when (subj) {
                                "Physics" -> PhysicsAccent
                                "Chemistry" -> ChemistryAccent
                                "Mathematics" -> MathAccent
                                else -> GoldenAmber
                            }
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = if (isSel) color else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(8.dp))
                                    .clickable { selectedSubject = subj }
                            ) {
                                Text(
                                    text = subj,
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, fontSize = 10.sp),
                                    color = if (isSel) Color.Black else MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 6.dp),
                                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                )
                            }
                        }
                    }

                    // Comment / Notes Section
                    OutlinedTextField(
                        value = sessionNotes,
                        onValueChange = { sessionNotes = it },
                        label = { Text("Session notes / chapters covered") },
                        placeholder = { Text("e.g. Solved 15 Rotational PYQs, revised angular momentum") },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 3
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        onSaveSessionLog(selectedCategory, selectedSubject, sessionNotes.trim())
                        sessionNotes = ""
                    }
                ) {
                    Text("Save to Log")
                }
            },
            dismissButton = {
                TextButton(onClick = onDismissLogDialog) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
private fun PhaseChip(
    title: String,
    duration: String,
    isSelected: Boolean,
    color: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = if (isSelected) color.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, if (isSelected) color else MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)),
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .clickable(onClick = onClick)
    ) {
        Column(
            modifier = Modifier.padding(vertical = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                    fontSize = 11.sp
                ),
                color = if (isSelected) color else MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = duration,
                style = MaterialTheme.typography.labelMedium.copy(
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 12.sp
                ),
                color = if (isSelected) color else MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun SessionItemCard(
    session: StudySessionEntity,
    onDelete: () -> Unit
) {
    val durationMin = session.durationSeconds / 60
    val durationSec = session.durationSeconds % 60
    val durationText = if (durationMin > 0) "${durationMin}m ${durationSec}s" else "${durationSec}s"
    val dateFormat = SimpleDateFormat("MMM dd, hh:mm a", Locale.getDefault())
    val dateText = dateFormat.format(Date(session.timestamp))

    val subjectColor = when (session.subject) {
        "Physics" -> PhysicsAccent
        "Chemistry" -> ChemistryAccent
        "Mathematics" -> MathAccent
        else -> GoldenAmber
    }

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
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
            Row(
                modifier = Modifier.weight(1f),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .clip(CircleShape)
                        .background(subjectColor)
                )
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = session.subject,
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "• ${session.category}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    if (session.notes.isNotBlank()) {
                        Text(
                            text = session.notes,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 1
                        )
                    }
                    Text(
                        text = dateText,
                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                    )
                }
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = subjectColor.copy(alpha = 0.15f)
                ) {
                    Text(
                        text = durationText,
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = subjectColor,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                    )
                }
                IconButton(
                    onClick = onDelete,
                    modifier = Modifier.size(28.dp)
                ) {
                    Icon(
                        Icons.Default.DeleteOutline,
                        contentDescription = "Delete Session",
                        tint = MaterialTheme.colorScheme.error.copy(alpha = 0.7f),
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}
