package com.example.ui.screens

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.ChapterEntity
import com.example.data.local.ChapterLocalStorage
import com.example.data.local.ChapterTrackingState
import com.example.ui.theme.ChemistryAccent
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.GoldenAmber
import com.example.ui.theme.MathAccent
import com.example.ui.theme.PhysicsAccent

@Composable
fun SyllabusScreen(
    chapters: List<ChapterEntity>,
    onToggleChapter: (ChapterEntity) -> Unit,
    trackingStateMap: Map<Int, ChapterTrackingState> = emptyMap(),
    onIncrementRevision: (Int) -> Unit = {},
    onResetRevision: (Int) -> Unit = {},
    onToggleNotes: (Int) -> Unit = {},
    onToggleDpp: (Int) -> Unit = {},
    onToggleTest: (Int) -> Unit = {},
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var selectedSubject by remember { mutableStateOf("All") }
    var selectedClass by remember { mutableStateOf("All") }
    var searchQuery by remember { mutableStateOf("") }

    val filteredChapters = remember(chapters, selectedSubject, selectedClass, searchQuery) {
        chapters.filter { ch ->
            val matchSubj = selectedSubject == "All" || ch.subject.equals(selectedSubject, ignoreCase = true)
            val matchClass = selectedClass == "All" || ch.classGrade.equals(selectedClass, ignoreCase = true)
            val matchSearch = searchQuery.isBlank() || ch.name.contains(searchQuery, ignoreCase = true)
            matchSubj && matchClass && matchSearch
        }
    }

    val completedCount = filteredChapters.count { it.isCompleted }
    val totalCount = filteredChapters.size

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .testTag("syllabus_screen"),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 24.dp)
    ) {
        // Title & Description
        item {
            Column {
                Text(
                    text = "IIT JEE Syllabus Hub",
                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Complete Class 11th & 12th PCM syllabus chapter breakdown with completion tracker.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // Search Field
        item {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search chapter (e.g. Rotational, Thermodynamics)...") },
                leadingIcon = {
                    Icon(Icons.Default.Search, contentDescription = "Search", tint = MaterialTheme.colorScheme.primary)
                },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(Icons.Default.Close, contentDescription = "Clear")
                        }
                    }
                },
                singleLine = true,
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("syllabus_search_field")
            )
        }

        // Subject Filter Tabs
        item {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                val subjects = listOf("All", "Physics", "Chemistry", "Mathematics")
                items(subjects) { subj ->
                    val isSelected = selectedSubject == subj
                    val color = when (subj) {
                        "Physics" -> PhysicsAccent
                        "Chemistry" -> ChemistryAccent
                        "Mathematics" -> MathAccent
                        else -> ElectricCyan
                    }
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedSubject = subj },
                        label = {
                            Text(
                                text = subj,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                            )
                        },
                        leadingIcon = {
                            if (isSelected) {
                                Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                            }
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = color.copy(alpha = 0.2f),
                            selectedLabelColor = color
                        )
                    )
                }
            }
        }

        // Class 11 vs Class 12 Filter
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                val classOptions = listOf("All", "Class 11", "Class 12")
                classOptions.forEach { cls ->
                    val isSelected = selectedClass == cls
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .clickable { selectedClass = cls }
                    ) {
                        Text(
                            text = cls,
                            style = MaterialTheme.typography.labelMedium.copy(
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                            ),
                            color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                        )
                    }
                }
            }
        }

        // Completion Progress Bar for Filtered View
        item {
            Surface(
                shape = RoundedCornerShape(14.dp),
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
                        Text(
                            text = "Filtered Progress",
                            style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "$completedCount of $totalCount Done",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                            color = ElectricCyan
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    val ratio = if (totalCount > 0) completedCount.toFloat() / totalCount else 0f
                    LinearProgressIndicator(
                        progress = { ratio },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp)),
                        color = ElectricCyan,
                        trackColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                }
            }
        }

        // Chapter List Items
        if (filteredChapters.isEmpty()) {
            item {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(Icons.Default.SearchOff, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(36.dp))
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "No chapters matching criteria",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        } else {
            items(filteredChapters, key = { it.id }) { chapter ->
                val subjColor = when (chapter.subject) {
                    "Physics" -> PhysicsAccent
                    "Chemistry" -> ChemistryAccent
                    "Mathematics" -> MathAccent
                    else -> ElectricCyan
                }

                val trackingState = trackingStateMap[chapter.id] ?: remember(chapter.id) {
                    ChapterLocalStorage.getTrackingState(context, chapter.id)
                }

                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = MaterialTheme.colorScheme.surface,
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (chapter.isCompleted) Color(0xFF10B981).copy(alpha = 0.5f) else MaterialTheme.colorScheme.outline.copy(alpha = 0.35f)
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .testTag("chapter_item_${chapter.id}")
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp)
                    ) {
                        // Main Chapter Header Row
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .clickable { onToggleChapter(chapter) },
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Checkbox(
                                checked = chapter.isCompleted,
                                onCheckedChange = { onToggleChapter(chapter) },
                                colors = CheckboxDefaults.colors(
                                    checkedColor = Color(0xFF10B981),
                                    uncheckedColor = MaterialTheme.colorScheme.outline
                                )
                            )

                            Spacer(modifier = Modifier.width(8.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = chapter.name,
                                    style = MaterialTheme.typography.titleMedium.copy(
                                        fontWeight = FontWeight.SemiBold,
                                        fontSize = 15.sp,
                                        textDecoration = if (chapter.isCompleted) androidx.compose.ui.text.style.TextDecoration.LineThrough else null
                                    ),
                                    color = if (chapter.isCompleted) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface
                                )

                                Spacer(modifier = Modifier.height(6.dp))

                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    // Subject Tag
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = subjColor.copy(alpha = 0.15f)
                                    ) {
                                        Text(
                                            text = chapter.subject,
                                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, fontSize = 10.sp),
                                            color = subjColor,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }

                                    // Class Tag
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = MaterialTheme.colorScheme.surfaceVariant
                                    ) {
                                        Text(
                                            text = chapter.classGrade,
                                            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }

                                    // High Weightage Tag
                                    if (chapter.weightage == "High") {
                                        Surface(
                                            shape = RoundedCornerShape(6.dp),
                                            color = GoldenAmber.copy(alpha = 0.18f),
                                            border = androidx.compose.foundation.BorderStroke(0.8.dp, GoldenAmber.copy(alpha = 0.4f))
                                        ) {
                                            Row(
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Default.Star,
                                                    contentDescription = null,
                                                    tint = GoldenAmber,
                                                    modifier = Modifier.size(10.dp)
                                                )
                                                Spacer(modifier = Modifier.width(3.dp))
                                                Text(
                                                    text = "High Weightage",
                                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.ExtraBold, fontSize = 10.sp),
                                                    color = GoldenAmber
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))
                        HorizontalDivider(
                            color = MaterialTheme.colorScheme.outline.copy(alpha = 0.15f),
                            thickness = 0.8.dp
                        )
                        Spacer(modifier = Modifier.height(10.dp))

                        // Four interactive tracking pills: Revision, Notes, DPP, Test
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // 1. Revision Counter Pill
                            ChapterRevisionPill(
                                revisionCount = trackingState.revisionCount,
                                onClick = {
                                    onIncrementRevision(chapter.id)
                                    ChapterLocalStorage.incrementRevision(context, chapter.id)
                                },
                                onReset = {
                                    onResetRevision(chapter.id)
                                    ChapterLocalStorage.resetRevision(context, chapter.id)
                                },
                                modifier = Modifier
                                    .weight(1.05f)
                                    .testTag("chapter_${chapter.id}_pill_revision")
                            )

                            // 2. Notes Status Toggle Pill
                            ChapterStatusTogglePill(
                                label = "Notes",
                                isCompleted = trackingState.notesDone,
                                onToggle = {
                                    onToggleNotes(chapter.id)
                                    ChapterLocalStorage.toggleNotes(context, chapter.id)
                                },
                                modifier = Modifier
                                    .weight(0.95f)
                                    .testTag("chapter_${chapter.id}_pill_notes")
                            )

                            // 3. DPP Status Toggle Pill
                            ChapterStatusTogglePill(
                                label = "DPP",
                                isCompleted = trackingState.dppDone,
                                onToggle = {
                                    onToggleDpp(chapter.id)
                                    ChapterLocalStorage.toggleDpp(context, chapter.id)
                                },
                                modifier = Modifier
                                    .weight(0.95f)
                                    .testTag("chapter_${chapter.id}_pill_dpp")
                            )

                            // 4. Test Status Toggle Pill
                            ChapterStatusTogglePill(
                                label = "Test",
                                isCompleted = trackingState.testDone,
                                onToggle = {
                                    onToggleTest(chapter.id)
                                    ChapterLocalStorage.toggleTest(context, chapter.id)
                                },
                                modifier = Modifier
                                    .weight(0.95f)
                                    .testTag("chapter_${chapter.id}_pill_test")
                            )
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun ChapterRevisionPill(
    revisionCount: Int,
    onClick: () -> Unit,
    onReset: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isRevised = revisionCount > 0
    val activeColor = ElectricCyan
    val backgroundColor = if (isRevised) activeColor.copy(alpha = 0.16f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)
    val borderColor = if (isRevised) activeColor.copy(alpha = 0.7f) else MaterialTheme.colorScheme.outline.copy(alpha = 0.25f)
    val contentColor = if (isRevised) activeColor else MaterialTheme.colorScheme.onSurfaceVariant

    val displayText = if (revisionCount > 0) "${revisionCount}x Rev" else "Revision"

    Surface(
        shape = RoundedCornerShape(8.dp),
        color = backgroundColor,
        border = androidx.compose.foundation.BorderStroke(1.dp, borderColor),
        modifier = modifier
            .height(34.dp)
            .clip(RoundedCornerShape(8.dp))
            .combinedClickable(
                onClick = onClick,
                onLongClick = onReset
            )
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 4.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.Autorenew,
                contentDescription = "Revision",
                tint = contentColor,
                modifier = Modifier.size(11.dp)
            )
            Spacer(modifier = Modifier.width(3.dp))
            Text(
                text = displayText,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = if (isRevised) FontWeight.Bold else FontWeight.Medium,
                    fontSize = 10.5.sp
                ),
                color = contentColor,
                maxLines = 1
            )
        }
    }
}

@Composable
private fun ChapterStatusTogglePill(
    label: String,
    isCompleted: Boolean,
    onToggle: () -> Unit,
    modifier: Modifier = Modifier
) {
    val greenColor = Color(0xFF10B981)
    val backgroundColor = if (isCompleted) greenColor.copy(alpha = 0.22f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)
    val borderColor = if (isCompleted) greenColor else MaterialTheme.colorScheme.outline.copy(alpha = 0.25f)
    val contentColor = if (isCompleted) greenColor else MaterialTheme.colorScheme.onSurfaceVariant

    Surface(
        shape = RoundedCornerShape(8.dp),
        color = backgroundColor,
        border = androidx.compose.foundation.BorderStroke(1.dp, borderColor),
        modifier = modifier
            .height(34.dp)
            .clip(RoundedCornerShape(8.dp))
            .clickable { onToggle() }
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 4.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (isCompleted) {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = "$label completed",
                    tint = greenColor,
                    modifier = Modifier.size(11.dp)
                )
                Spacer(modifier = Modifier.width(2.dp))
            }
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = if (isCompleted) FontWeight.Bold else FontWeight.Medium,
                    fontSize = 11.sp
                ),
                color = contentColor,
                maxLines = 1
            )
        }
    }
}
