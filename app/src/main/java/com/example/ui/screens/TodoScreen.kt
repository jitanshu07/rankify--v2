package com.example.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.DailyStreakRecordEntity
import com.example.data.local.TodoEntity
import com.example.data.local.UserProfileEntity
import com.example.data.model.JEEData
import com.example.streak.StreakManager
import com.example.streak.StreakTier
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.GoldenAmber

@Composable
fun TodoScreen(
    todos: List<TodoEntity>,
    profile: UserProfileEntity?,
    streakRecords: List<DailyStreakRecordEntity> = emptyList(),
    onToggleTodo: (TodoEntity) -> Unit,
    onAddTodo: (title: String, subject: String, priority: String) -> Unit,
    onDeleteTodo: (Long) -> Unit,
    onClearCompleted: () -> Unit,
    onApplyTemplate: (Int) -> Unit,
    onOpenStreakDetails: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    var showAddDialog by remember { mutableStateOf(false) }
    var showTemplateDialog by remember { mutableStateOf(false) }

    var newTaskTitle by remember { mutableStateOf("") }
    var newTaskSubject by remember { mutableStateOf("Physics") }
    var newTaskPriority by remember { mutableStateOf("High") }

    val completedCount = todos.count { it.isCompleted }
    val totalCount = todos.size
    val currentStreak = profile?.currentStreak ?: 0
    val bestStreak = profile?.bestStreak ?: 0
    val targetThreshold = minOf(profile?.streakGoalTarget ?: 3, if (totalCount > 0) totalCount else 1)
    val isTodayGoalAchieved = StreakManager.isTodayGoalMet(profile?.lastFullCompletionDate ?: "")
    val currentTier = StreakManager.getStreakTier(currentStreak)
    val (nextTier, daysRemaining) = StreakManager.getNextMilestone(currentStreak)
    val milestoneProgress = StreakManager.getMilestoneProgress(currentStreak)

    // Build completed dates for past 7 days trail
    val completedDates = remember(streakRecords, isTodayGoalAchieved) {
        val set = streakRecords.filter { it.isGoalMet }.map { it.date }.toMutableSet()
        if (isTodayGoalAchieved) {
            set.add(StreakManager.getTodayString())
        }
        set
    }
    val past7Days = remember(completedDates) {
        StreakManager.getPast7DaysStatus(completedDates = completedDates)
    }

    val infiniteTransition = rememberInfiniteTransition(label = "todo_fire_pulse")
    val fireScale by infiniteTransition.animateFloat(
        initialValue = 0.93f,
        targetValue = 1.07f,
        animationSpec = infiniteRepeatable(
            animation = tween(650, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "todo_fire_scale"
    )

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .testTag("todo_screen"),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 24.dp)
    ) {
        // Title & Streak Banner
        item {
            Column {
                Text(
                    text = "Daily Routine & Streak",
                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Consistent daily practice is the only differentiator. Finish your study goals to advance streak!",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // Daily Streak Tracker Card (Interactive with 7-Day Visual Feedback)
        item {
            val streakBorder = if (isTodayGoalAchieved) {
                androidx.compose.foundation.BorderStroke(
                    1.5.dp,
                    Brush.linearGradient(
                        listOf(
                            Color(0xFFFF6D00),
                            Color(0xFFFFD54F),
                            Color(0xFFFF3D00)
                        )
                    )
                )
            } else {
                androidx.compose.foundation.BorderStroke(1.dp, GoldenAmber.copy(alpha = 0.5f))
            }

            Surface(
                shape = RoundedCornerShape(22.dp),
                color = MaterialTheme.colorScheme.surface,
                border = streakBorder,
                tonalElevation = 3.dp,
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onOpenStreakDetails() }
                    .testTag("streak_tracker_card")
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Top Row: Fire Avatar, Streak Number, Badges
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        val fireBg = if (isTodayGoalAchieved) {
                            Brush.radialGradient(
                                listOf(
                                    Color(0xFFFFD54F),
                                    Color(0xFFFF6D00),
                                    Color(0xFFDD2C00)
                                )
                            )
                        } else {
                            SolidColor(GoldenAmber.copy(alpha = 0.2f))
                        }

                        Box(
                            modifier = Modifier
                                .size(54.dp)
                                .scale(if (isTodayGoalAchieved) fireScale else 1f)
                                .clip(CircleShape)
                                .background(fireBg),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.LocalFireDepartment,
                                contentDescription = "Streak",
                                tint = if (isTodayGoalAchieved) Color.White else GoldenAmber,
                                modifier = Modifier.size(32.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(14.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(
                                    text = "$currentStreak DAY STREAK",
                                    style = MaterialTheme.typography.titleMedium.copy(
                                        fontWeight = FontWeight.ExtraBold,
                                        letterSpacing = 0.5.sp
                                    ),
                                    color = GoldenAmber
                                )
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = MaterialTheme.colorScheme.surfaceVariant
                                ) {
                                    Text(
                                        text = "Best: ${bestStreak}d",
                                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold, fontSize = 10.sp),
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(3.dp))

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(
                                    text = "${currentTier.badgeIcon} ${currentTier.title}",
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                    color = GoldenAmber
                                )
                                Text(
                                    text = "•",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = if (daysRemaining > 0) "${daysRemaining}d to ${nextTier.title}" else "Max Rank!",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        // Arrow hint to open details dialog
                        Text(
                            text = "Details →",
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                            color = GoldenAmber
                        )
                    }

                    // Progress Status Bar
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = if (isTodayGoalAchieved) {
                                    "🔥 Today's Goal Achieved ($completedCount/$totalCount done)"
                                } else {
                                    "⏳ Today: $completedCount / $targetThreshold tasks completed"
                                },
                                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                                color = if (isTodayGoalAchieved) Color(0xFF10B981) else GoldenAmber
                            )
                            Text(
                                text = "${(milestoneProgress * 100).toInt()}% to next tier",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        LinearProgressIndicator(
                            progress = { milestoneProgress },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp)
                                .clip(RoundedCornerShape(3.dp)),
                            color = GoldenAmber,
                            trackColor = MaterialTheme.colorScheme.surfaceVariant
                        )
                    }

                    // 7-DAY VISUAL TRAIL ROW
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 10.dp, vertical = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            past7Days.forEach { day ->
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(2.dp)
                                ) {
                                    Text(
                                        text = day.dayOfWeekLabel.take(1),
                                        style = MaterialTheme.typography.labelSmall.copy(
                                            fontSize = 9.sp,
                                            fontWeight = if (day.isToday) FontWeight.Bold else FontWeight.Normal
                                        ),
                                        color = if (day.isToday) GoldenAmber else MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    Box(
                                        modifier = Modifier
                                            .size(24.dp)
                                            .clip(CircleShape)
                                            .background(
                                                when {
                                                    day.isGoalCompleted -> Brush.radialGradient(
                                                        listOf(Color(0xFFFFD54F), Color(0xFFFF6D00))
                                                    )
                                                    day.isToday -> Brush.radialGradient(
                                                        listOf(GoldenAmber.copy(alpha = 0.2f), Color.Transparent)
                                                    )
                                                    else -> Brush.radialGradient(
                                                        listOf(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f), Color.Transparent)
                                                    )
                                                }
                                            )
                                            .border(
                                                width = if (day.isToday) 1.5.dp else 0.5.dp,
                                                color = when {
                                                    day.isGoalCompleted -> GoldenAmber
                                                    day.isToday -> GoldenAmber
                                                    else -> MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                                                },
                                                shape = CircleShape
                                            ),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        if (day.isGoalCompleted) {
                                            Icon(
                                                imageVector = Icons.Default.LocalFireDepartment,
                                                contentDescription = "Done",
                                                tint = Color.White,
                                                modifier = Modifier.size(14.dp)
                                            )
                                        } else if (day.isToday) {
                                            Text("⏳", fontSize = 10.sp)
                                        } else {
                                            Box(
                                                modifier = Modifier
                                                    .size(4.dp)
                                                    .clip(CircleShape)
                                                    .background(MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Action Row: Add Custom Task & Load Template
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = { showAddDialog = true },
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ElectricCyan, contentColor = Color(0xFF031D33)),
                    modifier = Modifier
                        .weight(1f)
                        .height(44.dp)
                        .testTag("add_task_button")
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add Task", fontWeight = FontWeight.Bold)
                }

                OutlinedButton(
                    onClick = { showTemplateDialog = true },
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier
                        .weight(1.2f)
                        .height(44.dp)
                        .testTag("routine_template_button")
                ) {
                    Icon(Icons.Default.AutoMode, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Routine Templates", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }
        }

        // Clear completed tasks button if any completed
        if (completedCount > 0) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onClearCompleted) {
                        Icon(Icons.Default.ClearAll, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Clear Completed", fontSize = 12.sp)
                    }
                }
            }
        }

        // Tasks List
        if (todos.isEmpty()) {
            item {
                Surface(
                    shape = RoundedCornerShape(18.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(28.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(Icons.Default.AssignmentLate, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(40.dp))
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = "No active tasks in your daily routine.",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Load an intensive JEE routine template or add custom daily goals above.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        } else {
            items(todos, key = { it.id }) { todo ->
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = MaterialTheme.colorScheme.surface,
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (todo.isCompleted) Color(0xFF10B981).copy(alpha = 0.4f) else MaterialTheme.colorScheme.outline.copy(alpha = 0.35f)
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("todo_item_${todo.id}")
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(
                            checked = todo.isCompleted,
                            onCheckedChange = { onToggleTodo(todo) },
                            colors = CheckboxDefaults.colors(checkedColor = Color(0xFF10B981))
                        )

                        Spacer(modifier = Modifier.width(8.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = todo.title,
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    fontWeight = FontWeight.SemiBold,
                                    textDecoration = if (todo.isCompleted) androidx.compose.ui.text.style.TextDecoration.LineThrough else null
                                ),
                                color = if (todo.isCompleted) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface
                            )

                            Spacer(modifier = Modifier.height(4.dp))

                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = MaterialTheme.colorScheme.surfaceVariant
                                ) {
                                    Text(
                                        text = todo.subject,
                                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                                        color = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                                if (todo.priority == "High") {
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = Color(0xFFF43F5E).copy(alpha = 0.15f)
                                    ) {
                                        Text(
                                            text = "High Priority",
                                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, fontSize = 10.sp),
                                            color = Color(0xFFF43F5E),
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }
                                }
                            }
                        }

                        IconButton(
                            onClick = { onDeleteTodo(todo.id) },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.DeleteOutline,
                                contentDescription = "Delete",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }
        }
    }

    // Add Custom Task Dialog
    if (showAddDialog) {
        AlertDialog(
            onDismissRequest = { showAddDialog = false },
            title = { Text("Add Daily JEE Task", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = newTaskTitle,
                        onValueChange = { newTaskTitle = it },
                        label = { Text("Task description") },
                        placeholder = { Text("e.g. Solve 20 Rotational PYQs") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Subject Selector
                    Text("Subject:", style = MaterialTheme.typography.labelMedium)
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf("Physics", "Chemistry", "Math", "Mock", "Revision").forEach { subj ->
                            val isSel = newTaskSubject == subj
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = if (isSel) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .clickable { newTaskSubject = subj }
                            ) {
                                Text(
                                    text = subj,
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                    color = if (isSel) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 5.dp)
                                )
                            }
                        }
                    }

                    // Priority Selector
                    Text("Priority:", style = MaterialTheme.typography.labelMedium)
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf("High", "Medium", "Normal").forEach { pr ->
                            val isSel = newTaskPriority == pr
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = if (isSel) GoldenAmber else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .clickable { newTaskPriority = pr }
                            ) {
                                Text(
                                    text = pr,
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                    color = if (isSel) Color.Black else MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 5.dp)
                                )
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newTaskTitle.isNotBlank()) {
                            onAddTodo(newTaskTitle.trim(), newTaskSubject, newTaskPriority)
                            newTaskTitle = ""
                            showAddDialog = false
                        }
                    }
                ) {
                    Text("Add Task")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Routine Templates Dialog
    if (showTemplateDialog) {
        AlertDialog(
            onDismissRequest = { showTemplateDialog = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = GoldenAmber)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Saveable Routine Templates", fontWeight = FontWeight.Bold)
                }
            },
            text = {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(JEEData.routineTemplates.size) { idx ->
                        val template = JEEData.routineTemplates[idx]
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = MaterialTheme.colorScheme.surfaceVariant,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(14.dp))
                                .clickable {
                                    onApplyTemplate(idx)
                                    showTemplateDialog = false
                                }
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(
                                    text = template.title,
                                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.primary
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = template.description,
                                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = "${template.tasks.size} predefined tasks",
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                                    color = GoldenAmber
                                )
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showTemplateDialog = false }) {
                    Text("Close")
                }
            }
        )
    }
}
