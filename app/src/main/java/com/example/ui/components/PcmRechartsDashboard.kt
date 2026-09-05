package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.local.ChapterEntity
import com.example.data.local.StudySessionEntity
import com.example.data.local.UserProfileEntity
import com.example.ui.theme.*
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

enum class ChartType {
    STACKED,
    GROUPED
}

enum class TimeframeOption(val days: Int, val label: String) {
    LAST_7_DAYS(7, "7 Days"),
    LAST_14_DAYS(14, "14 Days")
}

data class DayPcmData(
    val dayLabel: String,
    val dateFull: String,
    val dayOffset: Int,
    val physicsSeconds: Long,
    val chemSeconds: Long,
    val mathSeconds: Long,
    val totalSeconds: Long
) {
    val physicsHours: Float get() = physicsSeconds / 3600f
    val chemHours: Float get() = chemSeconds / 3600f
    val mathHours: Float get() = mathSeconds / 3600f
    val totalHours: Float get() = totalSeconds / 3600f
}

data class SubjectTopicStats(
    val subject: String,
    val color: Color,
    val totalTopics: Int,
    val completedTopics: Int,
    val percent: Int,
    val class11Total: Int,
    val class11Completed: Int,
    val class12Total: Int,
    val class12Completed: Int,
    val highYieldTotal: Int,
    val highYieldCompleted: Int
)

/**
 * Recharts-inspired Dashboard View that visualizes:
 * 1. Daily study time broken down by Physics, Chemistry, and Mathematics (Stacked & Grouped views with interactive tooltips).
 * 2. Topic completion progress across Physics, Chemistry, and Mathematics (Comparative gauges, class breakdown, topic explorer).
 */
@Composable
fun PcmRechartsDashboard(
    chapters: List<ChapterEntity>,
    sessions: List<StudySessionEntity>,
    userProfile: UserProfileEntity? = null,
    onToggleChapter: (ChapterEntity) -> Unit,
    onQuickLogSession: (durationSeconds: Long, subject: String, category: String, notes: String) -> Unit,
    onUpdateDailyTargetStudyHours: (Float) -> Unit = {},
    modifier: Modifier = Modifier
) {
    var timeframe by remember { mutableStateOf(TimeframeOption.LAST_7_DAYS) }
    var chartType by remember { mutableStateOf(ChartType.STACKED) }
    var activeSubjectFilter by remember { mutableStateOf<String?>(null) } // null = All PCM
    var showQuickLogDialog by remember { mutableStateOf(false) }
    var showTargetGoalDialog by remember { mutableStateOf(false) }

    val dailyTargetHours = userProfile?.dailyTargetStudyHours ?: 6.0f

    // Aggregate daily data for the selected timeframe
    val dailyData = remember(sessions, timeframe) {
        val cal = Calendar.getInstance()
        cal.set(Calendar.HOUR_OF_DAY, 0)
        cal.set(Calendar.MINUTE, 0)
        cal.set(Calendar.SECOND, 0)
        cal.set(Calendar.MILLISECOND, 0)
        val todayMidnight = cal.timeInMillis
        val dayMillis = 86_400_000L
        val dayFmt = SimpleDateFormat("EEE", Locale.US)
        val fullFmt = SimpleDateFormat("EEEE, MMM d", Locale.US)

        (timeframe.days - 1 downTo 0).map { offset ->
            val startOfDay = todayMidnight - (offset * dayMillis)
            val endOfDay = startOfDay + dayMillis - 1L

            cal.timeInMillis = startOfDay
            val dayLabel = if (offset == 0) "Today" else dayFmt.format(cal.time)
            val dateFull = if (offset == 0) "Today (${fullFmt.format(cal.time)})" else fullFmt.format(cal.time)

            val daySessions = sessions.filter { it.timestamp in startOfDay..endOfDay }
            val physicsSec = daySessions.filter { it.subject.equals("Physics", ignoreCase = true) }.sumOf { it.durationSeconds }
            val chemSec = daySessions.filter { it.subject.equals("Chemistry", ignoreCase = true) }.sumOf { it.durationSeconds }
            val mathSec = daySessions.filter { it.subject.equals("Mathematics", ignoreCase = true) || it.subject.equals("Math", ignoreCase = true) }.sumOf { it.durationSeconds }
            val totalSec = physicsSec + chemSec + mathSec

            DayPcmData(
                dayLabel = dayLabel,
                dateFull = dateFull,
                dayOffset = offset,
                physicsSeconds = physicsSec,
                chemSeconds = chemSec,
                mathSeconds = mathSec,
                totalSeconds = totalSec
            )
        }
    }

    // Default selected day for Recharts Tooltip is Today (offset 0)
    var selectedDayIndex by remember(dailyData) {
        mutableStateOf(dailyData.indexOfLast { it.dayOffset == 0 }.coerceAtLeast(0))
    }

    val selectedDay = dailyData.getOrNull(selectedDayIndex) ?: dailyData.lastOrNull()

    // Aggregate topic statistics for Physics, Chemistry, and Mathematics
    val physicsChapters = remember(chapters) { chapters.filter { it.subject.equals("Physics", ignoreCase = true) } }
    val chemChapters = remember(chapters) { chapters.filter { it.subject.equals("Chemistry", ignoreCase = true) } }
    val mathChapters = remember(chapters) { chapters.filter { it.subject.equals("Mathematics", ignoreCase = true) || it.subject.equals("Math", ignoreCase = true) } }

    fun buildTopicStats(subject: String, color: Color, list: List<ChapterEntity>): SubjectTopicStats {
        val total = list.size.coerceAtLeast(1)
        val completed = list.count { it.isCompleted }
        val c11 = list.filter { it.classGrade.contains("11") }
        val c12 = list.filter { it.classGrade.contains("12") }
        val highYield = list.filter { it.weightage.equals("High", ignoreCase = true) }
        return SubjectTopicStats(
            subject = subject,
            color = color,
            totalTopics = list.size,
            completedTopics = completed,
            percent = ((completed.toFloat() / total) * 100).toInt(),
            class11Total = c11.size,
            class11Completed = c11.count { it.isCompleted },
            class12Total = c12.size,
            class12Completed = c12.count { it.isCompleted },
            highYieldTotal = highYield.size,
            highYieldCompleted = highYield.count { it.isCompleted }
        )
    }

    val physicsStats = remember(physicsChapters) { buildTopicStats("Physics", PhysicsAccent, physicsChapters) }
    val chemStats = remember(chemChapters) { buildTopicStats("Chemistry", ChemistryAccent, chemChapters) }
    val mathStats = remember(mathChapters) { buildTopicStats("Mathematics", MathAccent, mathChapters) }

    val totalPcmTopics = physicsChapters.size + chemChapters.size + mathChapters.size
    val totalPcmCompleted = physicsStats.completedTopics + chemStats.completedTopics + mathStats.completedTopics
    val totalPcmPercent = if (totalPcmTopics > 0) ((totalPcmCompleted.toFloat() / totalPcmTopics) * 100).toInt() else 0

    val totalStudyHoursTimeframe = dailyData.sumOf { it.totalHours.toDouble() }.toFloat()
    val physicsHoursTimeframe = dailyData.sumOf { it.physicsHours.toDouble() }.toFloat()
    val chemHoursTimeframe = dailyData.sumOf { it.chemHours.toDouble() }.toFloat()
    val mathHoursTimeframe = dailyData.sumOf { it.mathHours.toDouble() }.toFloat()
    val dailyAvgHours = totalStudyHoursTimeframe / timeframe.days

    Column(
        modifier = modifier
            .fillMaxWidth()
            .testTag("pcm_recharts_dashboard"),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // -------------------------------------------------------------
        // 1. DASHBOARD HEADER & QUICK STATS
        // -------------------------------------------------------------
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.35f)),
            tonalElevation = 2.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = MaterialTheme.colorScheme.primary.copy(alpha = 0.15f),
                                modifier = Modifier.padding(end = 8.dp)
                            ) {
                                Text(
                                    text = "RECHARTS VIEW",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        fontWeight = FontWeight.ExtraBold,
                                        letterSpacing = 0.8.sp
                                    ),
                                    color = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                            Text(
                                text = "PCM Daily & Topic Analytics",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Daily study velocity and syllabus topic progress across Physics, Chemistry, and Math.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    FilledTonalButton(
                        onClick = { showQuickLogDialog = true },
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                        modifier = Modifier.testTag("quick_log_button")
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "Log Study", style = MaterialTheme.typography.labelMedium)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // KPI Stat Badges
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    KpiStatCard(
                        title = "Avg Focus",
                        value = "${String.format(Locale.US, "%.1f", dailyAvgHours)}h/d",
                        subtext = "${timeframe.days}-day velocity",
                        color = ElectricCyan,
                        modifier = Modifier.weight(1f)
                    )
                    KpiStatCard(
                        title = "Total Time",
                        value = "${String.format(Locale.US, "%.1f", totalStudyHoursTimeframe)}h",
                        subtext = "Across PCM",
                        color = GoldenAmber,
                        modifier = Modifier.weight(1f)
                    )
                    KpiStatCard(
                        title = "Topics Done",
                        value = "$totalPcmCompleted/$totalPcmTopics",
                        subtext = "$totalPcmPercent% syllabus",
                        color = EmeraldSuccess,
                        modifier = Modifier.weight(1f)
                    )
                    KpiStatCard(
                        title = "Daily Target",
                        value = "${String.format(Locale.US, "%.1f", dailyTargetHours)}h",
                        subtext = if (dailyAvgHours >= dailyTargetHours) "Goal Achieved! \uD83C\uDFAF" else "${String.format(Locale.US, "%.1f", (dailyTargetHours - dailyAvgHours).coerceAtLeast(0f))}h to goal",
                        color = BentoAccentBlue,
                        modifier = Modifier
                            .weight(1f)
                            .clickable { showTargetGoalDialog = true }
                    )
                }
            }
        }

        // -------------------------------------------------------------
        // 2. DAILY STUDY TIME CHART (RECHARTS STYLE)
        // -------------------------------------------------------------
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.35f)),
            tonalElevation = 2.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                // Chart Title & Controls
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Daily Study Time Visualizer",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Interactive breakdown of daily hours by subject",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    // Timeframe toggle
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f))
                            .padding(2.dp)
                    ) {
                        TimeframeOption.values().forEach { opt ->
                            val isSelected = timeframe == opt
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(if (isSelected) MaterialTheme.colorScheme.primary else Color.Transparent)
                                    .clickable { timeframe = opt }
                                    .padding(horizontal = 8.dp, vertical = 4.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = opt.label,
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                    ),
                                    color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Chart View Mode Selector: Stacked vs Grouped & Subject Isolator
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        ChartModePill(
                            label = "Stacked",
                            isSelected = chartType == ChartType.STACKED,
                            onClick = { chartType = ChartType.STACKED }
                        )
                        ChartModePill(
                            label = "Grouped",
                            isSelected = chartType == ChartType.GROUPED,
                            onClick = { chartType = ChartType.GROUPED }
                        )
                    }

                    // Interactive Legend with Clickable filter
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                        LegendChip(
                            label = "Physics",
                            color = PhysicsAccent,
                            isSelected = activeSubjectFilter == null || activeSubjectFilter == "Physics",
                            onClick = {
                                activeSubjectFilter = if (activeSubjectFilter == "Physics") null else "Physics"
                            }
                        )
                        LegendChip(
                            label = "Chemistry",
                            color = ChemistryAccent,
                            isSelected = activeSubjectFilter == null || activeSubjectFilter == "Chemistry",
                            onClick = {
                                activeSubjectFilter = if (activeSubjectFilter == "Chemistry") null else "Chemistry"
                            }
                        )
                        LegendChip(
                            label = "Math",
                            color = MathAccent,
                            isSelected = activeSubjectFilter == null || activeSubjectFilter == "Mathematics",
                            onClick = {
                                activeSubjectFilter = if (activeSubjectFilter == "Mathematics") null else "Mathematics"
                            }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // -------------------------------------------------------------
                // RECHARTS INTERACTIVE TOOLTIP DISPLAY
                // -------------------------------------------------------------
                selectedDay?.let { day ->
                    RechartsInteractiveTooltip(
                        data = day,
                        onDismiss = {}
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // -------------------------------------------------------------
                // RECHARTS CANVAS / BAR CHART DRAWING
                // -------------------------------------------------------------
                RechartsDailyStudyBarChart(
                    data = dailyData,
                    chartType = chartType,
                    subjectFilter = activeSubjectFilter,
                    selectedIndex = selectedDayIndex,
                    dailyTargetHours = dailyTargetHours,
                    onSelectDay = { selectedDayIndex = it },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(190.dp)
                )

                if (totalStudyHoursTimeframe == 0f) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.Info, contentDescription = null, tint = ElectricCyan, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "No sessions logged in this timeframe. Tap 'Log Study' above or complete focus blocks with Study Timer to populate real data.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }

        // -------------------------------------------------------------
        // 3. TOPIC COMPLETION PROGRESS ACROSS PHYSICS, CHEMISTRY & MATH
        // -------------------------------------------------------------
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.35f)),
            tonalElevation = 2.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Topic Completion Progress",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Syllabus mastery comparison across Physics, Chemistry, and Mathematics",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    // Progress Pill
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = EmeraldSuccess.copy(alpha = 0.15f),
                        border = BorderStroke(1.dp, EmeraldSuccess.copy(alpha = 0.4f))
                    ) {
                        Text(
                            text = "$totalPcmPercent% Overall",
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                            color = EmeraldSuccess,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Recharts-style Horizontal Comparison Gauge Chart
                Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    SubjectTopicProgressRow(
                        stats = physicsStats,
                        icon = Icons.Default.Science
                    )
                    SubjectTopicProgressRow(
                        stats = chemStats,
                        icon = Icons.Default.Biotech
                    )
                    SubjectTopicProgressRow(
                        stats = mathStats,
                        icon = Icons.Default.Functions
                    )
                }

                Spacer(modifier = Modifier.height(18.dp))

                // Detailed Class 11 vs Class 12 & High-Yield Metric Cards
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val c11Total = physicsStats.class11Total + chemStats.class11Total + mathStats.class11Total
                    val c11Done = physicsStats.class11Completed + chemStats.class11Completed + mathStats.class11Completed
                    val c12Total = physicsStats.class12Total + chemStats.class12Total + mathStats.class12Total
                    val c12Done = physicsStats.class12Completed + chemStats.class12Completed + mathStats.class12Completed
                    val hyTotal = physicsStats.highYieldTotal + chemStats.highYieldTotal + mathStats.highYieldTotal
                    val hyDone = physicsStats.highYieldCompleted + chemStats.highYieldCompleted + mathStats.highYieldCompleted

                    SubMetricCard(
                        title = "Class 11 Topics",
                        completed = c11Done,
                        total = c11Total,
                        color = ElectricCyan,
                        modifier = Modifier.weight(1f)
                    )
                    SubMetricCard(
                        title = "Class 12 Topics",
                        completed = c12Done,
                        total = c12Total,
                        color = ChemistryAccent,
                        modifier = Modifier.weight(1f)
                    )
                    SubMetricCard(
                        title = "High-Yield Topics",
                        completed = hyDone,
                        total = hyTotal,
                        color = GoldenAmber,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // -------------------------------------------------------------
        // 4. INTERACTIVE TOPIC QUICK-EXPLORER (TOGGLE TOPICS TO SEE CHARTS UPDATE)
        // -------------------------------------------------------------
        TopicQuickExplorer(
            chapters = chapters,
            onToggleChapter = onToggleChapter
        )
    }

    // Quick Log Dialog
    if (showQuickLogDialog) {
        QuickStudyLogDialog(
            onDismiss = { showQuickLogDialog = false },
            onSave = { durationSec, subject, category, notes ->
                onQuickLogSession(durationSec, subject, category, notes)
                showQuickLogDialog = false
            }
        )
    }

    // Daily Study Target Hours Goal Dialog
    if (showTargetGoalDialog) {
        TargetSettingDialog(
            currentTargetHours = dailyTargetHours,
            onDismiss = { showTargetGoalDialog = false },
            onSaveTarget = { newTarget ->
                onUpdateDailyTargetStudyHours(newTarget)
                showTargetGoalDialog = false
            }
        )
    }
}

// -------------------------------------------------------------
// RECHARTS BAR CHART (CUSTOM DRAWN WITH CARTESIAN GRID & TOOLTIP)
// -------------------------------------------------------------
@Composable
private fun RechartsDailyStudyBarChart(
    data: List<DayPcmData>,
    chartType: ChartType,
    subjectFilter: String?,
    selectedIndex: Int,
    dailyTargetHours: Float = 6.0f,
    onSelectDay: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    val gridLineColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)
    val targetLineColor = BentoAccentBlue

    // Calculate maximum hours for scaling, accounting for dailyTargetHours so reference line remains visible
    val maxHours = remember(data, chartType, subjectFilter, dailyTargetHours) {
        val rawMax = when (chartType) {
            ChartType.STACKED -> {
                data.maxOfOrNull { day ->
                    when (subjectFilter) {
                        "Physics" -> day.physicsHours
                        "Chemistry" -> day.chemHours
                        "Mathematics" -> day.mathHours
                        else -> day.totalHours
                    }
                } ?: 0f
            }
            ChartType.GROUPED -> {
                data.maxOfOrNull { day ->
                    maxOf(day.physicsHours, day.chemHours, day.mathHours)
                } ?: 0f
            }
        }
        val effectiveMax = maxOf(rawMax, dailyTargetHours)
        // Round max up to nearest step (e.g. 2h, 4h, 6h, etc.)
        when {
            effectiveMax <= 2f -> 2f
            effectiveMax <= 4f -> 4f
            effectiveMax <= 6f -> 6f
            effectiveMax <= 8f -> 8f
            effectiveMax <= 10f -> 10f
            effectiveMax <= 12f -> 12f
            else -> kotlin.math.ceil(effectiveMax / 2f) * 2f
        }
    }

    Column(modifier = modifier) {
        // Chart plotting area with Recharts Cartesian Gridlines and Target Reference Line
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .drawBehind {
                    // Draw 4 dashed horizontal grid lines
                    val steps = 4
                    val stepHeight = size.height / steps
                    val pathEffect = PathEffect.dashPathEffect(floatArrayOf(6f, 6f), 0f)

                    for (i in 0..steps) {
                        val y = size.height - (i * stepHeight)
                        drawLine(
                            color = gridLineColor,
                            start = Offset(0f, y),
                            end = Offset(size.width, y),
                            strokeWidth = 1.dp.toPx(),
                            pathEffect = pathEffect
                        )
                    }

                    // Draw Recharts-style Target Goal Reference Line if dailyTargetHours > 0
                    if (dailyTargetHours > 0f && maxHours > 0f) {
                        val targetRatio = (dailyTargetHours / maxHours).coerceIn(0f, 1f)
                        val targetY = size.height * (1f - targetRatio)
                        val targetPathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 6f), 0f)

                        drawLine(
                            color = targetLineColor.copy(alpha = 0.85f),
                            start = Offset(0f, targetY),
                            end = Offset(size.width, targetY),
                            strokeWidth = 1.75.dp.toPx(),
                            pathEffect = targetPathEffect
                        )
                    }
                }
        ) {
            // Target Goal badge overlay on right edge
            if (dailyTargetHours > 0f && maxHours > 0f) {
                val targetRatio = (dailyTargetHours / maxHours).coerceIn(0f, 1f)
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(end = 4.dp),
                    contentAlignment = Alignment.BottomEnd
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxHeight(targetRatio)
                            .wrapContentHeight(Alignment.Top)
                    ) {
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = targetLineColor.copy(alpha = 0.9f),
                            shadowElevation = 2.dp
                        ) {
                            Text(
                                text = "Goal: ${String.format(Locale.US, "%.1f", dailyTargetHours)}h",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontSize = 8.5.sp,
                                    fontWeight = FontWeight.Bold
                                ),
                                color = Color.White,
                                modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                            )
                        }
                    }
                }
            }
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom
            ) {
                data.forEachIndexed { index, day ->
                    val isSelected = index == selectedIndex

                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxHeight()
                            .clickable { onSelectDay(index) },
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Bottom
                    ) {
                        when (chartType) {
                            ChartType.STACKED -> {
                                StackedPcmBar(
                                    day = day,
                                    maxHours = maxHours,
                                    subjectFilter = subjectFilter,
                                    isSelected = isSelected
                                )
                            }
                            ChartType.GROUPED -> {
                                GroupedPcmBar(
                                    day = day,
                                    maxHours = maxHours,
                                    subjectFilter = subjectFilter,
                                    isSelected = isSelected
                                )
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(6.dp))

        // X-Axis Labels (Day Names & Selection Dots)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            data.forEachIndexed { index, day ->
                val isSelected = index == selectedIndex
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onSelectDay(index) },
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = if (data.size > 7) day.dayLabel.take(1) else day.dayLabel,
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontSize = if (data.size > 7) 9.sp else 10.sp,
                            fontWeight = if (isSelected || day.dayLabel == "Today") FontWeight.Bold else FontWeight.Normal
                        ),
                        color = if (isSelected) MaterialTheme.colorScheme.primary
                        else if (day.dayLabel == "Today") ElectricCyan
                        else MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    // Small indicator dot for the selected day
                    Box(
                        modifier = Modifier
                            .padding(top = 2.dp)
                            .size(if (isSelected) 4.dp else 0.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primary)
                    )
                }
            }
        }
    }
}

// -------------------------------------------------------------
// STACKED BAR COMPONENT
// -------------------------------------------------------------
@Composable
private fun ColumnScope.StackedPcmBar(
    day: DayPcmData,
    maxHours: Float,
    subjectFilter: String?,
    isSelected: Boolean
) {
    val activeP = if (subjectFilter == null || subjectFilter == "Physics") day.physicsHours else 0f
    val activeC = if (subjectFilter == null || subjectFilter == "Chemistry") day.chemHours else 0f
    val activeM = if (subjectFilter == null || subjectFilter == "Mathematics") day.mathHours else 0f
    val activeTotal = activeP + activeC + activeM

    val barHeightRatio = (activeTotal / maxHours.coerceAtLeast(1f)).coerceIn(0f, 1f)
    val animatedRatio by animateFloatAsState(
        targetValue = barHeightRatio,
        animationSpec = tween(500, easing = FastOutSlowInEasing),
        label = "stacked_height"
    )

    if (activeTotal > 0f) {
        val pWeight = if (activeTotal > 0f) activeP / activeTotal else 0f
        val cWeight = if (activeTotal > 0f) activeC / activeTotal else 0f
        val mWeight = if (activeTotal > 0f) activeM / activeTotal else 0f

        Column(
            modifier = Modifier
                .width(if (isSelected) 18.dp else 14.dp)
                .fillMaxHeight(animatedRatio.coerceAtLeast(0.04f))
                .clip(RoundedCornerShape(topStart = 6.dp, topEnd = 6.dp))
                .border(
                    width = if (isSelected) 1.5.dp else 0.dp,
                    color = if (isSelected) MaterialTheme.colorScheme.onSurface else Color.Transparent,
                    shape = RoundedCornerShape(topStart = 6.dp, topEnd = 6.dp)
                )
        ) {
            // Stack order from top to bottom: Math, Chemistry, Physics
            if (mWeight > 0f) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(mWeight)
                        .background(MathAccent)
                )
            }
            if (cWeight > 0f) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(cWeight)
                        .background(ChemistryAccent)
                )
            }
            if (pWeight > 0f) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(pWeight)
                        .background(PhysicsAccent)
                )
            }
        }
    } else {
        // Subtle placeholder stub for 0 hours
        Box(
            modifier = Modifier
                .width(if (isSelected) 14.dp else 10.dp)
                .height(4.dp)
                .clip(RoundedCornerShape(2.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant)
        )
    }
}

// -------------------------------------------------------------
// GROUPED BAR COMPONENT
// -------------------------------------------------------------
@Composable
private fun ColumnScope.GroupedPcmBar(
    day: DayPcmData,
    maxHours: Float,
    subjectFilter: String?,
    isSelected: Boolean
) {
    val pRatio = (day.physicsHours / maxHours.coerceAtLeast(1f)).coerceIn(0f, 1f)
    val cRatio = (day.chemHours / maxHours.coerceAtLeast(1f)).coerceIn(0f, 1f)
    val mRatio = (day.mathHours / maxHours.coerceAtLeast(1f)).coerceIn(0f, 1f)

    Row(
        modifier = Modifier
            .fillMaxHeight()
            .padding(horizontal = 1.dp),
        horizontalArrangement = Arrangement.spacedBy(1.5.dp),
        verticalAlignment = Alignment.Bottom
    ) {
        if (subjectFilter == null || subjectFilter == "Physics") {
            Box(
                modifier = Modifier
                    .width(4.dp)
                    .fillMaxHeight(pRatio.coerceAtLeast(0.04f))
                    .clip(RoundedCornerShape(topStart = 2.dp, topEnd = 2.dp))
                    .background(if (day.physicsHours > 0f) PhysicsAccent else MaterialTheme.colorScheme.surfaceVariant)
            )
        }
        if (subjectFilter == null || subjectFilter == "Chemistry") {
            Box(
                modifier = Modifier
                    .width(4.dp)
                    .fillMaxHeight(cRatio.coerceAtLeast(0.04f))
                    .clip(RoundedCornerShape(topStart = 2.dp, topEnd = 2.dp))
                    .background(if (day.chemHours > 0f) ChemistryAccent else MaterialTheme.colorScheme.surfaceVariant)
            )
        }
        if (subjectFilter == null || subjectFilter == "Mathematics") {
            Box(
                modifier = Modifier
                    .width(4.dp)
                    .fillMaxHeight(mRatio.coerceAtLeast(0.04f))
                    .clip(RoundedCornerShape(topStart = 2.dp, topEnd = 2.dp))
                    .background(if (day.mathHours > 0f) MathAccent else MaterialTheme.colorScheme.surfaceVariant)
            )
        }
    }
}

// -------------------------------------------------------------
// RECHARTS INTERACTIVE TOOLTIP COMPONENT
// -------------------------------------------------------------
@Composable
private fun RechartsInteractiveTooltip(
    data: DayPcmData,
    onDismiss: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.9f),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Schedule,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = data.dateFull,
                        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }

                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = if (data.totalHours >= 4f) EmeraldSuccess.copy(alpha = 0.2f)
                    else if (data.totalHours >= 2f) GoldenAmber.copy(alpha = 0.2f)
                    else MaterialTheme.colorScheme.surface.copy(alpha = 0.7f)
                ) {
                    Text(
                        text = "Total: ${String.format(Locale.US, "%.1f", data.totalHours)}h",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.ExtraBold),
                        color = if (data.totalHours >= 4f) EmeraldSuccess
                        else if (data.totalHours >= 2f) GoldenAmber
                        else MaterialTheme.colorScheme.onSurface,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Tooltip Breakdown Rows (Physics, Chemistry, Math)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                TooltipSubjectValue(
                    subject = "Physics",
                    color = PhysicsAccent,
                    hours = data.physicsHours,
                    totalDayHours = data.totalHours,
                    modifier = Modifier.weight(1f)
                )
                TooltipSubjectValue(
                    subject = "Chemistry",
                    color = ChemistryAccent,
                    hours = data.chemHours,
                    totalDayHours = data.totalHours,
                    modifier = Modifier.weight(1f)
                )
                TooltipSubjectValue(
                    subject = "Math",
                    color = MathAccent,
                    hours = data.mathHours,
                    totalDayHours = data.totalHours,
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

@Composable
private fun TooltipSubjectValue(
    subject: String,
    color: Color,
    hours: Float,
    totalDayHours: Float,
    modifier: Modifier = Modifier
) {
    val pct = if (totalDayHours > 0f) ((hours / totalDayHours) * 100).toInt() else 0
    Surface(
        shape = RoundedCornerShape(8.dp),
        color = MaterialTheme.colorScheme.surface.copy(alpha = 0.65f),
        border = BorderStroke(1.dp, color.copy(alpha = 0.35f)),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(modifier = Modifier.size(6.dp).clip(CircleShape).background(color))
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = subject,
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "${String.format(Locale.US, "%.1f", hours)}h",
                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                color = color
            )
            Text(
                text = "$pct%",
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp),
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f)
            )
        }
    }
}

// -------------------------------------------------------------
// TOPIC COMPLETION PROGRESS ROW (HORIZONTAL RECHARTS STYLE)
// -------------------------------------------------------------
@Composable
private fun SubjectTopicProgressRow(
    stats: SubjectTopicStats,
    icon: androidx.compose.ui.graphics.vector.ImageVector
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(stats.color.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(icon, contentDescription = null, tint = stats.color, modifier = Modifier.size(16.dp))
                }
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = stats.subject,
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            Text(
                text = "${stats.completedTopics} / ${stats.totalTopics} Topics (${stats.percent}%)",
                style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                color = stats.color
            )
        }

        Spacer(modifier = Modifier.height(6.dp))

        // Progress track with subtle gradient fill
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(10.dp)
                .clip(RoundedCornerShape(5.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant)
        ) {
            val animatedFraction by animateFloatAsState(
                targetValue = (stats.percent / 100f).coerceIn(0f, 1f),
                animationSpec = tween(600, easing = FastOutSlowInEasing),
                label = "topic_progress"
            )

            if (animatedFraction > 0f) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth(animatedFraction)
                        .fillMaxHeight()
                        .clip(RoundedCornerShape(5.dp))
                        .background(
                            Brush.horizontalGradient(
                                listOf(stats.color.copy(alpha = 0.8f), stats.color)
                            )
                        )
                )
            }
        }

        Spacer(modifier = Modifier.height(4.dp))

        // Mini metrics row for Class 11 vs 12 and High-Yield
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = "Class 11: ${stats.class11Completed}/${stats.class11Total}  •  Class 12: ${stats.class12Completed}/${stats.class12Total}",
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Text(
                text = "High-Yield: ${stats.highYieldCompleted}/${stats.highYieldTotal}",
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, fontWeight = FontWeight.Medium),
                color = GoldenAmber
            )
        }
    }
}

// -------------------------------------------------------------
// INTERACTIVE TOPIC EXPLORER & QUICK-TOGGLE LIST
// -------------------------------------------------------------
@Composable
private fun TopicQuickExplorer(
    chapters: List<ChapterEntity>,
    onToggleChapter: (ChapterEntity) -> Unit
) {
    var selectedSubject by remember { mutableStateOf("All") }
    var filterStatus by remember { mutableStateOf("All") } // "All", "Pending", "Completed"
    var searchQuery by remember { mutableStateOf("") }

    val filteredChapters = remember(chapters, selectedSubject, filterStatus, searchQuery) {
        chapters.filter { ch ->
            val matchSubject = when (selectedSubject) {
                "Physics" -> ch.subject.equals("Physics", ignoreCase = true)
                "Chemistry" -> ch.subject.equals("Chemistry", ignoreCase = true)
                "Math" -> ch.subject.equals("Mathematics", ignoreCase = true) || ch.subject.equals("Math", ignoreCase = true)
                else -> true
            }
            val matchStatus = when (filterStatus) {
                "Completed" -> ch.isCompleted
                "Pending" -> !ch.isCompleted
                else -> true
            }
            val matchQuery = if (searchQuery.isBlank()) true else ch.name.contains(searchQuery, ignoreCase = true)

            matchSubject && matchStatus && matchQuery
        }
    }

    Surface(
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.35f)),
        tonalElevation = 2.dp,
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Topic Revision & Completion Explorer",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Mark revised topics complete to see the analytics charts update live",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.primary.copy(alpha = 0.12f)
                ) {
                    Text(
                        text = "${filteredChapters.size} topics",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Subject Filter Tabs
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                listOf("All", "Physics", "Chemistry", "Math").forEach { subj ->
                    val isSel = selectedSubject == subj
                    FilterChip(
                        selected = isSel,
                        onClick = { selectedSubject = subj },
                        label = { Text(subj) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = when (subj) {
                                "Physics" -> PhysicsAccent.copy(alpha = 0.25f)
                                "Chemistry" -> ChemistryAccent.copy(alpha = 0.25f)
                                "Math" -> MathAccent.copy(alpha = 0.25f)
                                else -> MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)
                            },
                            selectedLabelColor = MaterialTheme.colorScheme.onSurface
                        )
                    )
                }

                Spacer(modifier = Modifier.width(6.dp))

                listOf("All", "Pending", "Completed").forEach { status ->
                    val isSel = filterStatus == status
                    FilterChip(
                        selected = isSel,
                        onClick = { filterStatus = status },
                        label = { Text(status) }
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Topic Items Preview (Up to 6 displayed with instant toggle)
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                filteredChapters.take(6).forEach { chapter ->
                    val subjectColor = when {
                        chapter.subject.equals("Physics", ignoreCase = true) -> PhysicsAccent
                        chapter.subject.equals("Chemistry", ignoreCase = true) -> ChemistryAccent
                        else -> MathAccent
                    }

                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (chapter.isCompleted) MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
                        else MaterialTheme.colorScheme.surface,
                        border = BorderStroke(
                            1.dp,
                            if (chapter.isCompleted) EmeraldSuccess.copy(alpha = 0.3f)
                            else MaterialTheme.colorScheme.outline.copy(alpha = 0.25f)
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onToggleChapter(chapter) }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Checkbox(
                                checked = chapter.isCompleted,
                                onCheckedChange = { onToggleChapter(chapter) },
                                colors = CheckboxDefaults.colors(
                                    checkedColor = EmeraldSuccess,
                                    checkmarkColor = Color.Black
                                ),
                                modifier = Modifier.size(24.dp)
                            )

                            Spacer(modifier = Modifier.width(10.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = chapter.name,
                                    style = MaterialTheme.typography.bodyMedium.copy(
                                        fontWeight = if (chapter.isCompleted) FontWeight.Normal else FontWeight.Medium
                                    ),
                                    color = if (chapter.isCompleted) MaterialTheme.colorScheme.onSurfaceVariant
                                    else MaterialTheme.colorScheme.onSurface,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )

                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = chapter.subject,
                                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                                        color = subjectColor
                                    )
                                    Text(
                                        text = "•",
                                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    Text(
                                        text = chapter.classGrade,
                                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    if (chapter.weightage.equals("High", ignoreCase = true)) {
                                        Text(
                                            text = "• High Yield",
                                            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, fontWeight = FontWeight.Bold),
                                            color = GoldenAmber
                                        )
                                    }
                                }
                            }

                            if (chapter.isCompleted) {
                                Icon(
                                    Icons.Default.CheckCircle,
                                    contentDescription = null,
                                    tint = EmeraldSuccess,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }
                }

                if (filteredChapters.isEmpty()) {
                    Text(
                        text = "No topics match the selected filters.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                }
            }
        }
    }
}

// -------------------------------------------------------------
// HELPER SUBCOMPONENTS (KPI CARD, LEGEND, MODE PILL, ETC.)
// -------------------------------------------------------------
@Composable
private fun KpiStatCard(
    title: String,
    value: String,
    subtext: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
        border = BorderStroke(1.dp, color.copy(alpha = 0.3f)),
        modifier = modifier
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            Text(
                text = title,
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.ExtraBold),
                color = color
            )
            Text(
                text = subtext,
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp),
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f)
            )
        }
    }
}

@Composable
private fun SubMetricCard(
    title: String,
    completed: Int,
    total: Int,
    color: Color,
    modifier: Modifier = Modifier
) {
    val pct = if (total > 0) ((completed.toFloat() / total) * 100).toInt() else 0
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
        border = BorderStroke(1.dp, color.copy(alpha = 0.25f)),
        modifier = modifier
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            Text(
                text = title,
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "$completed / $total",
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = "$pct% complete",
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp, fontWeight = FontWeight.Bold),
                color = color
            )
        }
    }
}

@Composable
private fun ChartModePill(
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f))
            .clickable(onClick = onClick)
            .padding(horizontal = 8.dp, vertical = 4.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall.copy(
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
            ),
            color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun LegendChip(
    label: String,
    color: Color,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 4.dp, vertical = 2.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .clip(CircleShape)
                .background(if (isSelected) color else color.copy(alpha = 0.3f))
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 10.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
            ),
            color = if (isSelected) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
        )
    }
}

// -------------------------------------------------------------
// QUICK STUDY LOG DIALOG
// -------------------------------------------------------------
@Composable
private fun QuickStudyLogDialog(
    onDismiss: () -> Unit,
    onSave: (durationSeconds: Long, subject: String, category: String, notes: String) -> Unit
) {
    var selectedSubject by remember { mutableStateOf("Physics") }
    var selectedMinutes by remember { mutableStateOf(45) }
    var selectedCategory by remember { mutableStateOf("Self-Study") }
    var notes by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Quick Log Study Time",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    IconButton(onClick = onDismiss, modifier = Modifier.size(24.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Subject Selector
                Text(
                    text = "SELECT SUBJECT",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf(
                        Triple("Physics", PhysicsAccent, Icons.Default.Science),
                        Triple("Chemistry", ChemistryAccent, Icons.Default.Biotech),
                        Triple("Mathematics", MathAccent, Icons.Default.Functions)
                    ).forEach { (subj, col, icon) ->
                        val isSel = selectedSubject == subj
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (isSel) col.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                            border = BorderStroke(1.dp, if (isSel) col else Color.Transparent),
                            modifier = Modifier
                                .weight(1f)
                                .clickable { selectedSubject = subj }
                        ) {
                            Column(
                                modifier = Modifier.padding(8.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(icon, contentDescription = null, tint = col, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = if (subj == "Mathematics") "Math" else subj,
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                    color = if (isSel) col else MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Duration Presets
                Text(
                    text = "SESSION DURATION",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    listOf(30, 45, 60, 90, 120).forEach { mins ->
                        val isSel = selectedMinutes == mins
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (isSel) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f),
                            modifier = Modifier
                                .weight(1f)
                                .clickable { selectedMinutes = mins }
                        ) {
                            Box(
                                modifier = Modifier.padding(vertical = 8.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "${mins}m",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium
                                    ),
                                    color = if (isSel) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Category
                Text(
                    text = "FOCUS CATEGORY",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    listOf("Self-Study", "PYQs", "Revision").forEach { cat ->
                        val isSel = selectedCategory == cat
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (isSel) ElectricCyan.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                            border = BorderStroke(1.dp, if (isSel) ElectricCyan else Color.Transparent),
                            modifier = Modifier
                                .weight(1f)
                                .clickable { selectedCategory = cat }
                        ) {
                            Box(
                                modifier = Modifier.padding(vertical = 6.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = cat,
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium
                                    ),
                                    color = if (isSel) ElectricCyan else MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Cancel")
                    }

                    Button(
                        onClick = {
                            val durationSeconds = selectedMinutes * 60L
                            val desc = if (notes.isBlank()) "$selectedCategory on $selectedSubject ($selectedMinutes mins)" else notes
                            onSave(durationSeconds, selectedSubject, selectedCategory, desc)
                        },
                        modifier = Modifier.weight(1.2f)
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Save Session")
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// DAILY STUDY TARGET GOAL SETTING DIALOG
// -------------------------------------------------------------
@Composable
fun TargetSettingDialog(
    currentTargetHours: Float,
    onDismiss: () -> Unit,
    onSaveTarget: (Float) -> Unit
) {
    var selectedHours by remember { mutableStateOf(currentTargetHours.coerceIn(1f, 16f)) }
    val presetTargets = listOf(2f, 4f, 6f, 8f, 10f, 12f)

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)),
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
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
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(BentoAccentBlue.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.Flag,
                                contentDescription = null,
                                tint = BentoAccentBlue,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Daily Target Hours",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Set your daily PCM study goal",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close", modifier = Modifier.size(18.dp))
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // Target Hours Display Card
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                    border = BorderStroke(1.dp, BentoAccentBlue.copy(alpha = 0.3f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "${String.format(Locale.US, "%.1f", selectedHours)} Hours",
                            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.ExtraBold),
                            color = BentoAccentBlue
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "${(selectedHours * 60).toInt()} minutes target per day",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Interactive Slider
                Text(
                    text = "Adjust Hours",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(6.dp))
                Slider(
                    value = selectedHours,
                    onValueChange = { selectedHours = kotlin.math.round(it * 2f) / 2f },
                    valueRange = 1f..16f,
                    steps = 29, // 0.5h steps between 1 and 16
                    colors = SliderDefaults.colors(
                        thumbColor = BentoAccentBlue,
                        activeTrackColor = BentoAccentBlue,
                        inactiveTrackColor = MaterialTheme.colorScheme.surfaceVariant
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("1h", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("8h (Balanced)", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("16h", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Quick Preset Chips
                Text(
                    text = "Quick Select",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    presetTargets.forEach { preset ->
                        val isSel = kotlin.math.abs(selectedHours - preset) < 0.1f
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (isSel) BentoAccentBlue.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                            border = BorderStroke(
                                width = 1.dp,
                                color = if (isSel) BentoAccentBlue else Color.Transparent
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .clickable { selectedHours = preset }
                        ) {
                            Box(
                                modifier = Modifier.padding(vertical = 8.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "${preset.toInt()}h",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium
                                    ),
                                    color = if (isSel) BentoAccentBlue else MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(22.dp))

                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Cancel")
                    }

                    Button(
                        onClick = { onSaveTarget(selectedHours) },
                        colors = ButtonDefaults.buttonColors(containerColor = BentoAccentBlue),
                        modifier = Modifier.weight(1.3f)
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Save Target")
                    }
                }
            }
        }
    }
}
