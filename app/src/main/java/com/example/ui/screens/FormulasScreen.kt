package com.example.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.local.FormulaEntity
import com.example.ui.components.AddFormulaDialog
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FormulasScreen(
    formulas: List<FormulaEntity> = emptyList(),
    onAddFormula: (
        title: String,
        subject: String,
        chapter: String,
        formulaText: String,
        textColorHex: String,
        isDrawing: Boolean,
        drawingData: String
    ) -> Unit = { _, _, _, _, _, _, _ -> },
    onDeleteFormula: (Long) -> Unit = {},
    modifier: Modifier = Modifier
) {
    var selectedSubject by remember { mutableStateOf("All") }
    var searchQuery by remember { mutableStateOf("") }
    val clipboardManager = LocalClipboardManager.current
    var copiedFormulaId by remember { mutableStateOf<Long?>(null) }
    var showAddDialog by remember { mutableStateOf(false) }
    var previewDrawingItem by remember { mutableStateOf<FormulaEntity?>(null) }

    val filteredFormulas = remember(formulas, selectedSubject, searchQuery) {
        formulas.filter { f ->
            val matchSubj = selectedSubject == "All" || f.subject.equals(selectedSubject, ignoreCase = true)
            val matchQuery = searchQuery.isBlank() ||
                    f.title.contains(searchQuery, ignoreCase = true) ||
                    f.chapter.contains(searchQuery, ignoreCase = true) ||
                    f.formulaText.contains(searchQuery, ignoreCase = true)
            matchSubj && matchQuery
        }
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .testTag("formulas_screen"),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 24.dp)
    ) {
        // Top Header with Prominent Add Formula Button
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Formula Sheet Hub",
                        style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "High-yield formulas, customized equations & handwritten diagrams.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                // Prominent Add Formula Button
                Button(
                    onClick = { showAddDialog = true },
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary,
                        contentColor = MaterialTheme.colorScheme.onPrimary
                    ),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 10.dp),
                    modifier = Modifier.testTag("add_formula_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Add Formula",
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Add Formula",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
            }
        }

        // Search Bar (Only shown or enabled if formulas exist or user is searching)
        if (formulas.isNotEmpty()) {
            item {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Search your formulas (title, topic, equations)...") },
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
                        .testTag("formula_search_field")
                )
            }

            // Subject Filter Chips
            item {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    val subjects = listOf("All", "Physics", "Chemistry", "Mathematics", "General")
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
                            label = { Text(subj, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = color.copy(alpha = 0.2f),
                                selectedLabelColor = color
                            )
                        )
                    }
                }
            }
        }

        // Formula Cards or Empty State
        if (filteredFormulas.isEmpty()) {
            item {
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = MaterialTheme.colorScheme.surface,
                    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f)),
                    tonalElevation = 2.dp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("formulas_empty_state")
                ) {
                    Column(
                        modifier = Modifier.padding(28.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .clip(CircleShape)
                                .background(BentoSurfaceSubtleDark),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Functions,
                                contentDescription = null,
                                tint = GoldenAmber,
                                modifier = Modifier.size(36.dp)
                            )
                        }

                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = if (formulas.isEmpty()) "Formula Sheet Hub is Clean & Empty" else "No matching formulas found",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = if (formulas.isEmpty()) {
                                    "Ready for your high-yield notes! Tap '+ Add Formula' to type color-coded equations or use the interactive canvas to handwrite chemical structures and math formulas directly."
                                } else {
                                    "Try clearing your search query or switching subject filters."
                                },
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center
                            )
                        }

                        Button(
                            onClick = {
                                if (formulas.isEmpty()) {
                                    showAddDialog = true
                                } else {
                                    searchQuery = ""
                                    selectedSubject = "All"
                                }
                            },
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier.testTag("empty_state_add_formula_button")
                        ) {
                            Icon(
                                imageVector = if (formulas.isEmpty()) Icons.Default.Add else Icons.Default.Refresh,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(if (formulas.isEmpty()) "Add Your First Formula" else "Reset Filters")
                        }
                    }
                }
            }
        } else {
            items(filteredFormulas, key = { it.id }) { item ->
                FormulaCard(
                    formula = item,
                    isCopied = copiedFormulaId == item.id,
                    onCopy = {
                        clipboardManager.setText(AnnotatedString(item.formulaText))
                        copiedFormulaId = item.id
                    },
                    onDelete = { onDeleteFormula(item.id) },
                    onExpandDrawing = { previewDrawingItem = item }
                )
            }
        }
    }

    // Add Formula Dialog Modal
    if (showAddDialog) {
        AddFormulaDialog(
            onDismiss = { showAddDialog = false },
            onSaveFormula = { title, subject, chapter, formulaText, textColorHex, isDrawing, drawingData ->
                onAddFormula(title, subject, chapter, formulaText, textColorHex, isDrawing, drawingData)
                showAddDialog = false
            }
        )
    }

    // Fullscreen / Zoom Preview for Handwritten Drawing
    previewDrawingItem?.let { item ->
        Dialog(onDismissRequest = { previewDrawingItem = null }) {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color(0xFF0B1120),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155)),
                modifier = Modifier
                    .fillMaxWidth(0.95f)
                    .fillMaxHeight(0.8f)
                    .testTag("drawing_zoom_dialog")
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = item.title,
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = Color.White
                            )
                            if (item.chapter.isNotBlank()) {
                                Text(
                                    text = item.chapter,
                                    style = MaterialTheme.typography.labelSmall,
                                    color = GoldenAmber
                                )
                            }
                        }
                        IconButton(onClick = { previewDrawingItem = null }) {
                            Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White)
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f)
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color(0xFF0F172A))
                            .border(1.dp, Color(0xFF1E293B), RoundedCornerShape(14.dp))
                    ) {
                        DrawingViewerCanvas(
                            drawingData = item.drawingData,
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun FormulaCard(
    formula: FormulaEntity,
    isCopied: Boolean,
    onCopy: () -> Unit,
    onDelete: () -> Unit,
    onExpandDrawing: () -> Unit
) {
    val subjColor = when (formula.subject) {
        "Physics" -> PhysicsAccent
        "Chemistry" -> ChemistryAccent
        "Mathematics" -> MathAccent
        else -> ElectricCyan
    }

    Surface(
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surface,
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.35f)),
        tonalElevation = 2.dp,
        modifier = Modifier
            .fillMaxWidth()
            .testTag("formula_card_${formula.id}")
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Header Row: Subject, Chapter & Delete
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Subject Pill
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = subjColor.copy(alpha = 0.15f),
                        border = androidx.compose.foundation.BorderStroke(0.8.dp, subjColor.copy(alpha = 0.4f))
                    ) {
                        Text(
                            text = formula.subject.uppercase(),
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                            color = subjColor,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }

                    // Mode Badge
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant
                    ) {
                        Text(
                            text = if (formula.isDrawing) "✍️ Handwritten" else "✏️ Text",
                            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                        )
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (!formula.isDrawing) {
                        IconButton(
                            onClick = onCopy,
                            modifier = Modifier
                                .size(34.dp)
                                .testTag("copy_formula_button_${formula.id}")
                        ) {
                            Icon(
                                imageVector = if (isCopied) Icons.Default.Check else Icons.Default.ContentCopy,
                                contentDescription = "Copy formula",
                                tint = if (isCopied) Color(0xFF10B981) else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(17.dp)
                            )
                        }
                    }

                    IconButton(
                        onClick = onDelete,
                        modifier = Modifier
                            .size(34.dp)
                            .testTag("delete_formula_button_${formula.id}")
                    ) {
                        Icon(
                            imageVector = Icons.Default.DeleteOutline,
                            contentDescription = "Delete formula",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }

            // Title & Chapter
            Column {
                Text(
                    text = formula.title,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                if (formula.chapter.isNotBlank()) {
                    Text(
                        text = formula.chapter,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            // Formula Body: Custom Styled Text OR Scaled Drawing Canvas
            if (formula.isDrawing) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(170.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(Color(0xFF0F172A))
                        .border(1.dp, Color(0xFF1E293B), RoundedCornerShape(14.dp))
                        .clickable { onExpandDrawing() }
                ) {
                    DrawingViewerCanvas(
                        drawingData = formula.drawingData,
                        modifier = Modifier.fillMaxSize()
                    )

                    // Zoom / Expand Hint Pill
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = Color(0xAA000000),
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .padding(8.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.ZoomIn, contentDescription = null, tint = Color.White, modifier = Modifier.size(12.dp))
                            Spacer(modifier = Modifier.width(3.dp))
                            Text("Tap to zoom", color = Color.White, fontSize = 10.sp)
                        }
                    }
                }
            } else {
                val textColor = DrawingSerializer.parseColor(formula.textColorHex)
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = Color(0xFF0F172A),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1E293B)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = formula.formulaText,
                        style = MaterialTheme.typography.bodyLarge.copy(
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Medium,
                            fontSize = 15.sp,
                            lineHeight = 22.sp
                        ),
                        color = textColor,
                        modifier = Modifier.padding(14.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun DrawingViewerCanvas(
    drawingData: String,
    modifier: Modifier = Modifier
) {
    val (strokes, dimensions) = remember(drawingData) {
        DrawingSerializer.deserialize(drawingData)
    }

    Canvas(modifier = modifier) {
        val origW = dimensions.first.coerceAtLeast(1f)
        val origH = dimensions.second.coerceAtLeast(1f)
        val scale = minOf(size.width / origW, size.height / origH)
        val offsetX = (size.width - origW * scale) / 2f
        val offsetY = (size.height - origH * scale) / 2f

        strokes.forEach { stroke ->
            val strokeColor = DrawingSerializer.parseColor(stroke.colorHex)
            val strokeW = (stroke.strokeWidth * scale).coerceAtLeast(1.5f)

            if (stroke.points.size >= 2) {
                val path = Path().apply {
                    val p0 = stroke.points[0]
                    moveTo(offsetX + p0.x * scale, offsetY + p0.y * scale)
                    for (i in 1 until stroke.points.size) {
                        val p = stroke.points[i]
                        lineTo(offsetX + p.x * scale, offsetY + p.y * scale)
                    }
                }
                drawPath(
                    path = path,
                    color = strokeColor,
                    style = Stroke(
                        width = strokeW,
                        cap = StrokeCap.Round,
                        join = StrokeJoin.Round
                    )
                )
            } else if (stroke.points.isNotEmpty()) {
                val p = stroke.points[0]
                drawCircle(
                    color = strokeColor,
                    radius = strokeW / 2f,
                    center = Offset(offsetX + p.x * scale, offsetY + p.y * scale)
                )
            }
        }
    }
}
