package com.example.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.runtime.mutableStateOf
import java.util.Calendar
import java.util.Locale
import java.text.SimpleDateFormat
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.ChapterEntity
import com.example.data.local.ErrorLogEntity
import com.example.data.local.StudySessionEntity
import com.example.data.local.TodoEntity
import com.example.data.local.UserProfileEntity
import com.example.ui.components.PcmRechartsDashboard
import com.example.ui.theme.ChemistryAccent
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.GoldenAmber
import com.example.ui.theme.MathAccent
import com.example.ui.theme.PhysicsAccent

enum class AnalyticsViewTab {
    PCM_DASHBOARD,
    DIAGNOSTICS
}

@Composable
fun AnalyticsScreen(
    chapters: List<ChapterEntity>,
    sessions: List<StudySessionEntity>,
    todos: List<TodoEntity>,
    errors: List<ErrorLogEntity>,
    userProfile: UserProfileEntity? = null,
    onToggleChapter: (ChapterEntity) -> Unit = {},
    onQuickLogSession: (durationSeconds: Long, subject: String, category: String, notes: String) -> Unit = { _, _, _, _ -> },
    onUpdateDailyTargetStudyHours: (Float) -> Unit = {},
    modifier: Modifier = Modifier
) {
    var currentTab by remember { mutableStateOf(AnalyticsViewTab.PCM_DASHBOARD) }

    val totalChapters = chapters.size.coerceAtLeast(1)
    val completedChapters = chapters.count { it.isCompleted }
    val syllabusPercent = ((completedChapters.toFloat() / totalChapters) * 100).toInt()

    val totalStudySeconds = sessions.sumOf { it.durationSeconds }
    val totalHours = totalStudySeconds / 3600f

    // Subject breakdown (strictly 0 if no study sessions)
    val physicsSeconds = sessions.filter { it.subject.equals("Physics", ignoreCase = true) }.sumOf { it.durationSeconds }
    val chemSeconds = sessions.filter { it.subject.equals("Chemistry", ignoreCase = true) }.sumOf { it.durationSeconds }
    val mathSeconds = sessions.filter { it.subject.equals("Mathematics", ignoreCase = true) || it.subject.equals("Math", ignoreCase = true) }.sumOf { it.durationSeconds }
    val otherSeconds = (totalStudySeconds - (physicsSeconds + chemSeconds + mathSeconds)).coerceAtLeast(0)

    val physicsRatio = if (totalStudySeconds > 0) physicsSeconds.toFloat() / totalStudySeconds else 0f
    val chemRatio = if (totalStudySeconds > 0) chemSeconds.toFloat() / totalStudySeconds else 0f
    val mathRatio = if (totalStudySeconds > 0) mathSeconds.toFloat() / totalStudySeconds else 0f
    val otherRatio = if (totalStudySeconds > 0) otherSeconds.toFloat() / totalStudySeconds else 0f

    // Error resolution (strictly 0% if no errors logged)
    val totalErrors = errors.size
    val resolvedErrors = errors.count { it.isResolved }
    val errorResolvedPercent = if (totalErrors > 0) ((resolvedErrors.toFloat() / totalErrors) * 100).toInt() else 0

    // Task consistency
    val totalTasks = todos.size
    val completedTasks = todos.count { it.isCompleted }
    val taskPercent = if (totalTasks > 0) ((completedTasks.toFloat() / totalTasks) * 100).toInt() else 0

    // JEE Readiness Index (Composite formula 0-100; strictly 0 when no progress has been made)
    val readinessScore = if (completedChapters == 0 && completedTasks == 0 && resolvedErrors == 0 && totalStudySeconds == 0L) {
        0
    } else {
        ((syllabusPercent * 0.5f) + (taskPercent * 0.25f) + (errorResolvedPercent * 0.15f) + (totalHours.coerceAtMost(50f) / 50f * 10f)).toInt().coerceIn(0, 100)
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .testTag("analytics_screen"),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 24.dp)
    ) {
        // Section Header with Sub-tabs
        item {
            Column {
                Text(
                    text = "Performance & Prep Analytics",
                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Comprehensive diagnostic insights based on your study velocity and retention.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Primary Mode Switcher Tab: Recharts PCM Dashboard vs Diagnostics
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                        .padding(4.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = if (currentTab == AnalyticsViewTab.PCM_DASHBOARD) MaterialTheme.colorScheme.surface else Color.Transparent,
                        border = if (currentTab == AnalyticsViewTab.PCM_DASHBOARD) BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)) else null,
                        modifier = Modifier
                            .weight(1f)
                            .clickable { currentTab = AnalyticsViewTab.PCM_DASHBOARD }
                            .testTag("tab_pcm_dashboard")
                    ) {
                        Row(
                            modifier = Modifier.padding(vertical = 8.dp),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.BarChart,
                                contentDescription = null,
                                tint = if (currentTab == AnalyticsViewTab.PCM_DASHBOARD) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "PCM Visual Dashboard",
                                style = MaterialTheme.typography.labelMedium.copy(
                                    fontWeight = if (currentTab == AnalyticsViewTab.PCM_DASHBOARD) FontWeight.Bold else FontWeight.Medium
                                ),
                                color = if (currentTab == AnalyticsViewTab.PCM_DASHBOARD) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = if (currentTab == AnalyticsViewTab.DIAGNOSTICS) MaterialTheme.colorScheme.surface else Color.Transparent,
                        border = if (currentTab == AnalyticsViewTab.DIAGNOSTICS) BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)) else null,
                        modifier = Modifier
                            .weight(1f)
                            .clickable { currentTab = AnalyticsViewTab.DIAGNOSTICS }
                            .testTag("tab_diagnostics")
                    ) {
                        Row(
                            modifier = Modifier.padding(vertical = 8.dp),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.Speed,
                                contentDescription = null,
                                tint = if (currentTab == AnalyticsViewTab.DIAGNOSTICS) GoldenAmber else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "JEE Diagnostics",
                                style = MaterialTheme.typography.labelMedium.copy(
                                    fontWeight = if (currentTab == AnalyticsViewTab.DIAGNOSTICS) FontWeight.Bold else FontWeight.Medium
                                ),
                                color = if (currentTab == AnalyticsViewTab.DIAGNOSTICS) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }

        // View Rendering based on selected tab
        if (currentTab == AnalyticsViewTab.PCM_DASHBOARD) {
            item {
                PcmRechartsDashboard(
                    chapters = chapters,
                    sessions = sessions,
                    userProfile = userProfile,
                    onToggleChapter = onToggleChapter,
                    onQuickLogSession = onQuickLogSession,
                    onUpdateDailyTargetStudyHours = onUpdateDailyTargetStudyHours
                )
            }
        } else {

        // 1. JEE Readiness Score Card (Hero Gauge)
        item {
            Surface(
                shape = RoundedCornerShape(24.dp),
                color = MaterialTheme.colorScheme.surface,
                border = androidx.compose.foundation.BorderStroke(1.dp, GoldenAmber.copy(alpha = 0.4f)),
                tonalElevation = 3.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "ESTIMATED JEE READINESS INDEX",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = 1.sp
                        ),
                        color = GoldenAmber
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Box(
                        modifier = Modifier.size(140.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(
                            progress = { readinessScore / 100f },
                            modifier = Modifier.fillMaxSize(),
                            strokeWidth = 12.dp,
                            color = GoldenAmber,
                            trackColor = MaterialTheme.colorScheme.surfaceVariant
                        )

                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "$readinessScore",
                                style = MaterialTheme.typography.headlineLarge.copy(
                                    fontWeight = FontWeight.ExtraBold,
                                    fontSize = 42.sp
                                ),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "/ 100 PTS",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 10.sp
                                ),
                                color = GoldenAmber
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = GoldenAmber.copy(alpha = 0.12f),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Icon(Icons.Default.TrendingUp, contentDescription = null, tint = GoldenAmber, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (readinessScore == 0) "Initial Diagnostic State • 0% Progress Across All Pillars"
                                else if (readinessScore > 75) "Predicted AIR Band: Top 1,000 (IIT Core Branches)"
                                else if (readinessScore > 50) "Predicted AIR Band: Top 5,000 (IITs / Top NITs)"
                                else "Foundation Building Phase • Accelerate Revision",
                                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }
        }

        // 2. Study Time Distribution by Subject (Visual Chart)
        item {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = MaterialTheme.colorScheme.surface,
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.35f)),
                tonalElevation = 2.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = "Subject Study Distribution",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Track whether you are balancing Physics, Chemistry, and Mathematics equally.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    // Multi-segmented bar
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(16.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        if (totalStudySeconds > 0) {
                            if (physicsRatio > 0) {
                                Box(
                                    modifier = Modifier
                                        .weight(physicsRatio)
                                        .fillMaxHeight()
                                        .background(PhysicsAccent)
                                )
                            }
                            if (chemRatio > 0) {
                                Box(
                                    modifier = Modifier
                                        .weight(chemRatio)
                                        .fillMaxHeight()
                                        .background(ChemistryAccent)
                                )
                            }
                            if (mathRatio > 0) {
                                Box(
                                    modifier = Modifier
                                        .weight(mathRatio)
                                        .fillMaxHeight()
                                        .background(MathAccent)
                                )
                            }
                            if (otherRatio > 0) {
                                Box(
                                    modifier = Modifier
                                        .weight(otherRatio)
                                        .fillMaxHeight()
                                        .background(ElectricCyan)
                                )
                            }
                        } else {
                            Box(modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.surfaceVariant))
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Subject Legend with Hours
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        SubjectLegendItem(
                            title = "Physics",
                            color = PhysicsAccent,
                            hours = physicsSeconds / 3600f,
                            percentage = (physicsRatio * 100).toInt()
                        )
                        SubjectLegendItem(
                            title = "Chemistry",
                            color = ChemistryAccent,
                            hours = chemSeconds / 3600f,
                            percentage = (chemRatio * 100).toInt()
                        )
                        SubjectLegendItem(
                            title = "Mathematics",
                            color = MathAccent,
                            hours = mathSeconds / 3600f,
                            percentage = (mathRatio * 100).toInt()
                        )
                    }

                    if (totalStudySeconds == 0L) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "0.0 hrs total study logged. Focus sessions completed with the Study Timer will populate your subject distribution.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                            )
                        }
                    }
                }
            }
        }

        // 3. 7-Day Consistency Velocity Chart
        item {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = MaterialTheme.colorScheme.surface,
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.35f)),
                tonalElevation = 2.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = "Weekly Study Rhythm",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Daily logged focus hours over the past 7 days.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(18.dp))

                    // 7-day Bar chart dynamically calculated from real study sessions
                    val dayData = remember(sessions) {
                        val cal = Calendar.getInstance()
                        cal.set(Calendar.HOUR_OF_DAY, 0)
                        cal.set(Calendar.MINUTE, 0)
                        cal.set(Calendar.SECOND, 0)
                        cal.set(Calendar.MILLISECOND, 0)
                        val todayMidnight = cal.timeInMillis
                        val dayMillis = 86_400_000L
                        val dayFmt = SimpleDateFormat("EEE", Locale.getDefault())

                        (6 downTo 0).map { dayOffset ->
                            val startOfDay = todayMidnight - (dayOffset * dayMillis)
                            val endOfDay = startOfDay + dayMillis - 1L
                            val label = if (dayOffset == 0) "Today" else {
                                cal.timeInMillis = startOfDay
                                dayFmt.format(cal.time)
                            }
                            val daySeconds = sessions
                                .filter { it.timestamp in startOfDay..endOfDay }
                                .sumOf { it.durationSeconds }
                            val hours = daySeconds / 3600f
                            Pair(label, hours)
                        }
                    }
                    val maxDayHours = dayData.maxOfOrNull { it.second } ?: 0f
                    val totalWeekHours = dayData.sumOf { it.second.toDouble() }.toFloat()

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(130.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Bottom
                    ) {
                        dayData.forEach { (day, hours) ->
                            val barRatio = if (maxDayHours > 0f) {
                                (hours / maxDayHours.coerceAtLeast(6f)).coerceIn(0.04f, 1f)
                            } else {
                                0f
                            }

                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Bottom,
                                modifier = Modifier.weight(1f)
                            ) {
                                Text(
                                    text = "${String.format(Locale.US, "%.1f", hours)}h",
                                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp),
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )

                                Spacer(modifier = Modifier.height(4.dp))

                                Box(
                                    modifier = Modifier
                                        .width(18.dp)
                                        .height(if (barRatio > 0f) (100 * barRatio).dp else 4.dp)
                                        .clip(RoundedCornerShape(topStart = 4.dp, topEnd = 4.dp))
                                        .background(
                                            if (barRatio == 0f) {
                                                MaterialTheme.colorScheme.surfaceVariant
                                            } else if (day == "Today") {
                                                ElectricCyan
                                            } else {
                                                MaterialTheme.colorScheme.primary.copy(alpha = 0.6f)
                                            }
                                        )
                                )

                                Spacer(modifier = Modifier.height(6.dp))

                                Text(
                                    text = day,
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        fontSize = 10.sp,
                                        fontWeight = if (day == "Today") FontWeight.Bold else FontWeight.Normal
                                    ),
                                    color = if (day == "Today" && hours > 0f) ElectricCyan else MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }

                    if (totalWeekHours == 0f) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "0.0 total hours logged over the past 7 days. Complete a study session to build your weekly rhythm graph.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                            )
                        }
                    }
                }
            }
        }

        // 4. Mistake Review & Mastery Stats
        item {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = MaterialTheme.colorScheme.surface,
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.35f)),
                tonalElevation = 2.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(18.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(50.dp)
                            .clip(CircleShape)
                            .background(
                                if (totalErrors > 0 && errorResolvedPercent > 0) Color(0xFF10B981).copy(alpha = 0.15f)
                                else MaterialTheme.colorScheme.surfaceVariant
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.Verified,
                            contentDescription = null,
                            tint = if (totalErrors > 0 && errorResolvedPercent > 0) Color(0xFF10B981) else MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(28.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(14.dp))

                    Column {
                        Text(
                            text = "Error Book Mastery: $errorResolvedPercent%",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = if (totalErrors == 0) {
                                "0 errors logged. Log questions to your Error Book to begin tracking mistake resolution."
                            } else {
                                "$resolvedErrors of $totalErrors logged test errors thoroughly analyzed and mastered."
                            },
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
        }
    }
}

@Composable
private fun SubjectLegendItem(
    title: String,
    color: Color,
    hours: Float,
    percentage: Int
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(10.dp)
                    .clip(CircleShape)
                    .background(color)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                color = MaterialTheme.colorScheme.onSurface
            )
        }

        Text(
            text = "${String.format("%.1f", hours)} hrs ($percentage%)",
            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
