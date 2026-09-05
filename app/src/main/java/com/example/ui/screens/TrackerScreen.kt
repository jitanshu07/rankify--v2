package com.example.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
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
import com.example.ui.theme.*

@Composable
fun TrackerScreen(
    chapters: List<ChapterEntity>,
    modifier: Modifier = Modifier
) {
    val totalChapters = chapters.size.coerceAtLeast(1)
    val completedChapters = chapters.count { it.isCompleted }

    // Overall syllabus completion ratio strictly based on count of checked chapters divided by total chapters
    val totalRatio = if (chapters.isNotEmpty()) {
        (completedChapters.toFloat() / totalChapters).coerceIn(0f, 1f)
    } else 0f

    // Dynamic JEE Main and Advanced progress bars strictly tracking syllabus completion
    val mainRatio = totalRatio
    val advRatio = totalRatio

    // Animated heights for the vertical progress bars
    val animatedMainRatio by animateFloatAsState(
        targetValue = mainRatio,
        animationSpec = tween(durationMillis = 1000, easing = FastOutSlowInEasing),
        label = "mainRatioAnim"
    )
    val animatedAdvRatio by animateFloatAsState(
        targetValue = advRatio,
        animationSpec = tween(durationMillis = 1200, easing = FastOutSlowInEasing),
        label = "advRatioAnim"
    )

    // Subject breakdown
    val physicsTotal = chapters.count { it.subject == "Physics" }.coerceAtLeast(1)
    val physicsDone = chapters.count { it.subject == "Physics" && it.isCompleted }
    val physicsRatio = (physicsDone.toFloat() / physicsTotal).coerceIn(0f, 1f)

    val chemTotal = chapters.count { it.subject == "Chemistry" }.coerceAtLeast(1)
    val chemDone = chapters.count { it.subject == "Chemistry" && it.isCompleted }
    val chemRatio = (chemDone.toFloat() / chemTotal).coerceIn(0f, 1f)

    val mathTotal = chapters.count { it.subject == "Mathematics" }.coerceAtLeast(1)
    val mathDone = chapters.count { it.subject == "Mathematics" && it.isCompleted }
    val mathRatio = (mathDone.toFloat() / mathTotal).coerceIn(0f, 1f)

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .testTag("tracker_screen"),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 24.dp)
    ) {
        // Section Header
        item {
            Column {
                Text(
                    text = "Goal Target Trackers",
                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Watch the colored progress lines climb to the goal flags as you finish syllabus chapters!",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // Two Vertical Progress Bars Card (Required Feature)
        item {
            Surface(
                shape = RoundedCornerShape(24.dp),
                color = MaterialTheme.colorScheme.surface,
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f)),
                tonalElevation = 2.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "EXAM READINESS ELEVATION",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = 1.sp
                        ),
                        color = MaterialTheme.colorScheme.primary
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(280.dp),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                        verticalAlignment = Alignment.Bottom
                    ) {
                        // Left Pillar: JEE Main
                        VerticalProgressBarWithFlag(
                            title = "JEE Main",
                            targetScore = "99.5 %ile Target",
                            progressRatio = animatedMainRatio,
                            activeBrush = Brush.verticalGradient(
                                listOf(BentoAccentBlue, Color(0xFF70B0FF))
                            ),
                            flagColor = BentoAccentBlue,
                            flagSubtitle = "NIT/IIIT Flag",
                            modifier = Modifier.weight(1f)
                        )

                        // Center Divider with Milestone markers
                        Column(
                            modifier = Modifier
                                .fillMaxHeight()
                                .padding(vertical = 24.dp),
                            verticalArrangement = Arrangement.SpaceBetween,
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            MilestonePill(label = "100% Goal")
                            MilestonePill(label = "75% Mocks")
                            MilestonePill(label = "50% Core")
                            MilestonePill(label = "25% Start")
                        }

                        // Right Pillar: JEE Advanced
                        VerticalProgressBarWithFlag(
                            title = "JEE Advanced",
                            targetScore = "Top 500 AIR Target",
                            progressRatio = animatedAdvRatio,
                            activeBrush = Brush.verticalGradient(
                                listOf(BentoCoralAdv, Color(0xFFFF897D))
                            ),
                            flagColor = BentoCoralAdv,
                            flagSubtitle = "IIT Bombay Flag",
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = Color(0xFF10B981),
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "$completedChapters of $totalChapters Chapters Completed (${(totalRatio * 100).toInt()}%)",
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }
        }

        // Subject Breakdown Cards
        item {
            Text(
                text = "Subject-Wise Elevation",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onSurface
            )
        }

        item {
            SubjectProgressRow(
                subject = "Physics",
                completed = physicsDone,
                total = physicsTotal,
                ratio = physicsRatio,
                color = PhysicsAccent
            )
        }

        item {
            SubjectProgressRow(
                subject = "Chemistry",
                completed = chemDone,
                total = chemTotal,
                ratio = chemRatio,
                color = ChemistryAccent
            )
        }

        item {
            SubjectProgressRow(
                subject = "Mathematics",
                completed = mathDone,
                total = mathTotal,
                ratio = mathRatio,
                color = MathAccent
            )
        }
    }
}

@Composable
private fun VerticalProgressBarWithFlag(
    title: String,
    targetScore: String,
    progressRatio: Float,
    activeBrush: Brush,
    flagColor: Color,
    flagSubtitle: String,
    modifier: Modifier = Modifier
) {
    val barHeight = 180.dp

    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Goal Flag at the top
        Surface(
            shape = RoundedCornerShape(12.dp),
            color = flagColor.copy(alpha = 0.2f),
            border = androidx.compose.foundation.BorderStroke(1.5.dp, flagColor)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Flag,
                    contentDescription = "Flag",
                    tint = flagColor,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = flagSubtitle,
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, fontSize = 10.sp),
                    color = flagColor
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Vertical Bar Container
        Box(
            modifier = Modifier
                .width(28.dp)
                .height(barHeight)
                .clip(RoundedCornerShape(14.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant),
            contentAlignment = Alignment.BottomCenter
        ) {
            // Animated climbing colored line/fill strictly scaled to progressRatio
            val fillRatio = progressRatio.coerceIn(0f, 1f)
            if (fillRatio > 0f) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .fillMaxHeight(fillRatio)
                        .clip(RoundedCornerShape(14.dp))
                        .background(activeBrush)
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        Text(
            text = "${(progressRatio * 100).toInt()}%",
            style = MaterialTheme.typography.titleMedium.copy(
                fontWeight = FontWeight.ExtraBold,
                fontSize = 16.sp
            ),
            color = flagColor
        )

        Text(
            text = title,
            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
            color = MaterialTheme.colorScheme.onSurface
        )

        Text(
            text = targetScore,
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun MilestonePill(label: String) {
    Surface(
        shape = RoundedCornerShape(8.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.8f)
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp, fontWeight = FontWeight.SemiBold),
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
        )
    }
}

@Composable
private fun SubjectProgressRow(
    subject: String,
    completed: Int,
    total: Int,
    ratio: Float,
    color: Color
) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface,
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.35f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
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
                        text = subject,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }

                Text(
                    text = "$completed / $total Chapters (${(ratio * 100).toInt()}%)",
                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            LinearProgressIndicator(
                progress = { ratio },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp)),
                color = color,
                trackColor = MaterialTheme.colorScheme.surfaceVariant
            )
        }
    }
}
