package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.ChapterEntity
import com.example.data.local.StudySessionEntity
import com.example.data.local.TodoEntity
import com.example.data.local.UserProfileEntity
import com.example.streak.StreakManager
import com.example.streak.StreakTier
import com.example.ui.theme.*
import com.example.viewmodel.NavTab
import com.example.viewmodel.ToolsSubTab

@Composable
fun HomeScreen(
    profile: UserProfileEntity?,
    chapters: List<ChapterEntity>,
    todos: List<TodoEntity>,
    sessions: List<StudySessionEntity>,
    onNavigate: (NavTab) -> Unit,
    onNavigateToTool: (ToolsSubTab) -> Unit = {},
    onToggleTodo: (TodoEntity) -> Unit,
    onOpenStreakDetails: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val totalChapters = chapters.size.coerceAtLeast(1)
    val completedChapters = chapters.count { it.isCompleted }
    val syllabusPercent = if (chapters.isNotEmpty()) {
        ((completedChapters.toFloat() / totalChapters) * 100).toInt()
    } else 0

    // Main and Advanced progress strictly based on checked chapters in the PCM syllabus hub
    val mainPercent = syllabusPercent
    val advPercent = syllabusPercent

    val totalStudySeconds = sessions.sumOf { it.durationSeconds }
    val totalHours = totalStudySeconds / 3600
    val totalMinutes = (totalStudySeconds % 3600) / 60

    val pendingTodos = todos.filter { !it.isCompleted }
    val completedTodos = todos.filter { it.isCompleted }
    val todoCompletionRate = if (todos.isNotEmpty()) {
        (completedTodos.size.toFloat() / todos.size * 100).toInt()
    } else 0

    val streak = profile?.currentStreak ?: 0
    val nextTodo = pendingTodos.firstOrNull()

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(horizontal = 14.dp)
            .testTag("home_screen"),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(top = 14.dp, bottom = 24.dp)
    ) {
        // -------------------------------------------------------------
        // ROW 1: BENTO MAIN GRID (Tracker Pillar + Streak Hero & To-Do)
        // -------------------------------------------------------------
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(IntrinsicSize.Min),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Bento 1: Vertical Dual JEE Tracker Pillar (col-span-1)
                Surface(
                    shape = RoundedCornerShape(24.dp),
                    color = MaterialTheme.colorScheme.surface,
                    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                    modifier = Modifier
                        .width(106.dp)
                        .fillMaxHeight()
                        .clip(RoundedCornerShape(24.dp))
                        .clickable { onNavigate(NavTab.TRACKER) }
                        .testTag("bento_tracker_pillar")
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(10.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "JEE TRACKER",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Black,
                                fontSize = 10.sp,
                                letterSpacing = 0.5.sp
                            ),
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )

                        // Dual vertical progress tubes
                        Row(
                            modifier = Modifier
                                .height(130.dp)
                                .padding(vertical = 8.dp),
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            verticalAlignment = Alignment.Bottom
                        ) {
                            // Tube 1: Main (Ice Blue)
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Bottom,
                                modifier = Modifier.fillMaxHeight()
                            ) {
                                Text(
                                    text = "🚩",
                                    fontSize = 10.sp
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Box(
                                    modifier = Modifier
                                        .width(14.dp)
                                        .height(100.dp)
                                        .clip(RoundedCornerShape(percent = 50))
                                        .background(MaterialTheme.colorScheme.outline.copy(alpha = 0.4f)),
                                    contentAlignment = Alignment.BottomCenter
                                ) {
                                    val mainFillRatio = (mainPercent / 100f).coerceIn(0f, 1f)
                                    if (mainFillRatio > 0f) {
                                        Box(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .fillMaxHeight(mainFillRatio)
                                                .clip(RoundedCornerShape(percent = 50))
                                                .background(BentoAccentBlue)
                                        )
                                    }
                                }
                            }

                            // Tube 2: Advanced (Coral)
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Bottom,
                                modifier = Modifier.fillMaxHeight()
                            ) {
                                Text(
                                    text = "🚩",
                                    fontSize = 10.sp
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Box(
                                    modifier = Modifier
                                        .width(14.dp)
                                        .height(100.dp)
                                        .clip(RoundedCornerShape(percent = 50))
                                        .background(MaterialTheme.colorScheme.outline.copy(alpha = 0.4f)),
                                    contentAlignment = Alignment.BottomCenter
                                ) {
                                    val advFillRatio = (advPercent / 100f).coerceIn(0f, 1f)
                                    if (advFillRatio > 0f) {
                                        Box(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .fillMaxHeight(advFillRatio)
                                                .clip(RoundedCornerShape(percent = 50))
                                                .background(BentoCoralAdv)
                                        )
                                    }
                                }
                            }
                        }

                        // Tube Legend
                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(7.dp)
                                        .clip(CircleShape)
                                        .background(BentoAccentBlue)
                                )
                                Text(
                                    text = "Main $mainPercent%",
                                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp),
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                                )
                            }
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(7.dp)
                                        .clip(CircleShape)
                                        .background(BentoCoralAdv)
                                )
                                Text(
                                    text = "Adv $advPercent%",
                                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp),
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                                )
                            }
                        }
                    }
                }

                // Bento Right Column (Streak Hero Card + To-Do Progress Card)
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight(),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Bento 2: Hero Current Streak Card (Ice Blue Tile with Streak Details)
                    val isTodayMet = StreakManager.isTodayGoalMet(profile?.lastFullCompletionDate ?: "")
                    val streakTier = StreakManager.getStreakTier(streak)
                    val streakQuote = StreakManager.getMotivationalQuote(streak)

                    Surface(
                        shape = RoundedCornerShape(24.dp),
                        color = BentoAccentBlue,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(24.dp))
                            .clickable { onOpenStreakDetails() }
                            .testTag("bento_streak_hero")
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp)
                        ) {
                            // Subtle decorative translucent orb in corner
                            Box(
                                modifier = Modifier
                                    .size(70.dp)
                                    .offset(x = 24.dp, y = (-24).dp)
                                    .align(Alignment.TopEnd)
                                    .clip(CircleShape)
                                    .background(Color.White.copy(alpha = 0.25f))
                            )

                            Column {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "CURRENT STREAK",
                                        style = MaterialTheme.typography.labelSmall.copy(
                                            fontWeight = FontWeight.Black,
                                            letterSpacing = 1.sp,
                                            fontSize = 10.sp
                                        ),
                                        color = BentoOnAccentBlue.copy(alpha = 0.8f)
                                    )
                                    Text(
                                        text = if (isTodayMet) "🔥 Locked In" else "⏳ Pending",
                                        style = MaterialTheme.typography.labelSmall.copy(
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 9.sp
                                        ),
                                        color = BentoOnAccentBlue
                                    )
                                }

                                Spacer(modifier = Modifier.height(2.dp))

                                Row(
                                    verticalAlignment = Alignment.Bottom,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text(
                                        text = "$streak",
                                        style = MaterialTheme.typography.displaySmall.copy(
                                            fontWeight = FontWeight.Black,
                                            fontSize = 38.sp,
                                            lineHeight = 40.sp
                                        ),
                                        color = BentoOnAccentBlue
                                    )
                                    Column(modifier = Modifier.padding(bottom = 4.dp)) {
                                        Text(
                                            text = "Days 🔥",
                                            style = MaterialTheme.typography.titleMedium.copy(
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 15.sp
                                            ),
                                            color = BentoOnAccentBlue.copy(alpha = 0.9f)
                                        )
                                        Text(
                                            text = "${streakTier.badgeIcon} ${streakTier.title}",
                                            style = MaterialTheme.typography.labelSmall.copy(
                                                fontWeight = FontWeight.SemiBold,
                                                fontSize = 9.sp
                                            ),
                                            color = BentoOnAccentBlue.copy(alpha = 0.8f)
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(6.dp))

                                // Quote pill container
                                Surface(
                                    shape = RoundedCornerShape(10.dp),
                                    color = Color.White.copy(alpha = 0.35f),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text(
                                        text = "\"$streakQuote\"",
                                        style = MaterialTheme.typography.bodySmall.copy(
                                            fontWeight = FontWeight.SemiBold,
                                            fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
                                            fontSize = 10.sp
                                        ),
                                        color = BentoOnAccentBlue,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 5.dp),
                                        maxLines = 1
                                    )
                                }
                            }
                        }
                    }

                    // Bento 3: To-Do Progress Card
                    Surface(
                        shape = RoundedCornerShape(24.dp),
                        color = MaterialTheme.colorScheme.surface,
                        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(24.dp))
                            .clickable { onNavigate(NavTab.TODO) }
                            .testTag("bento_todo_progress")
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "To-Do Progress",
                                    style = MaterialTheme.typography.labelMedium.copy(
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp
                                    ),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "$todoCompletionRate%",
                                    style = MaterialTheme.typography.labelMedium.copy(
                                        fontFamily = FontFamily.Monospace,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp
                                    ),
                                    color = BentoAccentBlue
                                )
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            // Bento Progress Tube
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(8.dp)
                                    .clip(RoundedCornerShape(percent = 50))
                                    .background(MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))
                            ) {
                                val todoRatio = if (todoCompletionRate > 0) (todoCompletionRate / 100f).coerceIn(0.04f, 1f) else 0f
                                if (todoRatio > 0f) {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth(fraction = todoRatio)
                                            .fillMaxHeight()
                                            .clip(RoundedCornerShape(percent = 50))
                                            .background(BentoAccentBlue)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            // Next task snippet
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(28.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(BentoSecondarySlate),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.CheckCircle,
                                        contentDescription = "Next Task",
                                        tint = BentoAccentBlue,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }

                                Column {
                                    Text(
                                        text = nextTodo?.title ?: "All routine tasks done!",
                                        style = MaterialTheme.typography.bodySmall.copy(
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 11.sp
                                        ),
                                        color = MaterialTheme.colorScheme.onSurface,
                                        maxLines = 1
                                    )
                                    Text(
                                        text = if (nextTodo != null) "${nextTodo.subject} • Priority: ${nextTodo.priority}" else "Great discipline! Tap to add more",
                                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp),
                                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                                        maxLines = 1
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // -------------------------------------------------------------
        // ROW 2: FOCUS TIMER BENTO + SYLLABUS & FORMULAS COMPARTMENTS
        // -------------------------------------------------------------
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(IntrinsicSize.Min),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Focus Timer Bento (bg-[#33495F] rounded-3xl)
                Surface(
                    shape = RoundedCornerShape(24.dp),
                    color = BentoSecondarySlate,
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .clip(RoundedCornerShape(24.dp))
                        .testTag("bento_focus_timer")
                ) {
                    Column(
                        modifier = Modifier
                            .padding(14.dp)
                            .fillMaxHeight(),
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "FOCUS TIMER",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Bold,
                                fontSize = 10.sp,
                                letterSpacing = 1.sp
                            ),
                            color = Color.White.copy(alpha = 0.7f)
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        // Clock time display
                        Text(
                            text = "${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}:${(totalStudySeconds % 60).toString().padStart(2, '0')}",
                            style = MaterialTheme.typography.headlineSmall.copy(
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Black,
                                fontSize = 22.sp,
                                letterSpacing = (-0.5).sp
                            ),
                            color = Color.White,
                            modifier = Modifier.align(Alignment.CenterHorizontally)
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Button(
                            onClick = { onNavigate(NavTab.TIMER) },
                            shape = RoundedCornerShape(14.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = BentoAccentBlue,
                                contentColor = BentoOnAccentBlue
                            ),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(36.dp)
                        ) {
                            Text(
                                text = "START SESSION",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.ExtraBold,
                                    fontSize = 10.sp,
                                    letterSpacing = 0.5.sp
                                )
                            )
                        }
                    }
                }

                // Right stacked bento tiles: Syllabus Hub & Formulae
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Syllabus Hub Bento Tile
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = MaterialTheme.colorScheme.surface,
                        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f)
                            .clip(RoundedCornerShape(20.dp))
                            .clickable { onNavigate(NavTab.SYLLABUS) }
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(horizontal = 12.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(BentoSurfaceSubtleDark),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(text = "⚛️", fontSize = 16.sp)
                            }
                            Column {
                                Text(
                                    text = "Syllabus Hub",
                                    style = MaterialTheme.typography.titleSmall.copy(
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp
                                    ),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "$syllabusPercent% Complete",
                                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                                    color = BentoAccentBlue
                                )
                            }
                        }
                    }

                    // Formulae Bento Tile
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = MaterialTheme.colorScheme.surface,
                        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f)
                            .clip(RoundedCornerShape(20.dp))
                            .clickable { onNavigate(NavTab.FORMULAS) }
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(horizontal = 12.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(BentoSurfaceSubtleDark),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(text = "📐", fontSize = 16.sp)
                            }
                            Column {
                                Text(
                                    text = "Formulae",
                                    style = MaterialTheme.typography.titleSmall.copy(
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp
                                    ),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "PCM Reference",
                                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                                    color = BentoGoldIITian
                                )
                            }
                        }
                    }
                }
            }
        }

        // -------------------------------------------------------------
        // ROW 3: HORIZONTAL BENTO SHORTCUT TILES (CALC, ERROR BOOK, BACKLOG, EXTRA)
        // -------------------------------------------------------------
        item {
            val scrollState = rememberScrollState()
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(scrollState),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                BentoQuickToolChip(
                    emoji = "🧮",
                    label = "CALCULATOR",
                    modifier = Modifier.testTag("quick_tool_calculator"),
                    onClick = { onNavigateToTool(ToolsSubTab.CALCULATOR) }
                )
                BentoQuickToolChip(
                    emoji = "⚠️",
                    label = "ERROR BOOK",
                    modifier = Modifier.testTag("quick_tool_error_book"),
                    onClick = { onNavigateToTool(ToolsSubTab.ERROR_BOOK) }
                )
                BentoQuickToolChip(
                    emoji = "🗓️",
                    label = "BACKLOG",
                    modifier = Modifier.testTag("quick_tool_backlog"),
                    onClick = { onNavigateToTool(ToolsSubTab.BACKLOG) }
                )
                BentoQuickToolChip(
                    emoji = "➕",
                    label = "EXTRA",
                    modifier = Modifier.testTag("quick_tool_extra"),
                    onClick = { onNavigateToTool(ToolsSubTab.EXTRA_SOMETHING) }
                )
                BentoQuickToolChip(
                    emoji = "📊",
                    label = "ANALYTICS",
                    modifier = Modifier.testTag("quick_tool_analytics"),
                    onClick = { onNavigate(NavTab.ANALYTICS) }
                )
            }
        }

        // -------------------------------------------------------------
        // ROW 4: TODAY'S ROUTINE LIST IN BENTO MODULAR CARDS
        // -------------------------------------------------------------
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Today's Routine Focus",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    ),
                    color = MaterialTheme.colorScheme.onSurface
                )
                TextButton(onClick = { onNavigate(NavTab.TODO) }) {
                    Text(
                        "Manage Routine (${todos.size})",
                        color = BentoAccentBlue,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 12.sp
                    )
                }
            }
        }

        if (todos.isEmpty()) {
            item {
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = MaterialTheme.colorScheme.surface,
                    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "No tasks planned for today. Tap Manage Routine to apply pre-configured JEE drill templates!",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        } else {
            items(todos.take(4)) { todo ->
                Surface(
                    shape = RoundedCornerShape(18.dp),
                    color = MaterialTheme.colorScheme.surface,
                    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(18.dp))
                        .clickable { onToggleTodo(todo) }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(
                            checked = todo.isCompleted,
                            onCheckedChange = { onToggleTodo(todo) },
                            colors = CheckboxDefaults.colors(
                                checkedColor = BentoAccentBlue,
                                checkmarkColor = BentoOnAccentBlue
                            )
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
                            Row(
                                modifier = Modifier.padding(top = 4.dp),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = BentoSurfaceSubtleDark
                                ) {
                                    Text(
                                        text = todo.subject,
                                        style = MaterialTheme.typography.labelSmall.copy(
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 9.sp
                                        ),
                                        color = BentoAccentBlue,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = when (todo.priority) {
                                        "High" -> BentoCoralAdv.copy(alpha = 0.2f)
                                        "Medium" -> BentoGoldIITian.copy(alpha = 0.2f)
                                        else -> BentoSecondarySlate
                                    }
                                ) {
                                    Text(
                                        text = todo.priority,
                                        style = MaterialTheme.typography.labelSmall.copy(
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 9.sp
                                        ),
                                        color = when (todo.priority) {
                                            "High" -> BentoCoralAdv
                                            "Medium" -> BentoGoldIITian
                                            else -> Color.White
                                        },
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
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

@Composable
private fun BentoQuickToolChip(
    emoji: String,
    label: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(18.dp),
        color = BentoSurfaceSubtleDark,
        border = androidx.compose.foundation.BorderStroke(1.dp, BentoBorderDark),
        modifier = modifier
            .widthIn(min = 96.dp)
            .clip(RoundedCornerShape(18.dp))
            .clickable { onClick() }
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(text = emoji, fontSize = 20.sp)
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 9.sp,
                    letterSpacing = 0.5.sp
                ),
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
            )
        }
    }
}
