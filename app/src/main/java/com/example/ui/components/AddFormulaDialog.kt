package com.example.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Undo
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
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.ui.screens.CanvasPoint
import com.example.ui.screens.DrawStroke
import com.example.ui.screens.DrawingSerializer
import com.example.ui.theme.*

private enum class FormulaInputMode {
    TEXT,
    DRAWING
}

private val COLOR_PALETTE = listOf(
    Pair("#38BDF8", "Electric Cyan"),
    Pair("#F59E0B", "Solar Gold"),
    Pair("#10B981", "Emerald Green"),
    Pair("#FF5722", "Fiery Coral"),
    Pair("#EC4899", "Neon Pink"),
    Pair("#FACC15", "Vivid Yellow"),
    Pair("#FFFFFF", "Pure White"),
    Pair("#A855F7", "Royal Violet"),
    Pair("#2DD4BF", "Aqua Mint")
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddFormulaDialog(
    onDismiss: () -> Unit,
    onSaveFormula: (
        title: String,
        subject: String,
        chapter: String,
        formulaText: String,
        textColorHex: String,
        isDrawing: Boolean,
        drawingData: String
    ) -> Unit
) {
    var mode by remember { mutableStateOf(FormulaInputMode.TEXT) }
    var title by remember { mutableStateOf("") }
    var subject by remember { mutableStateOf("Physics") }
    var chapter by remember { mutableStateOf("") }
    var formulaText by remember { mutableStateOf("") }
    var selectedTextColorHex by remember { mutableStateOf("#38BDF8") }

    // Canvas Drawing State
    var selectedPenColorHex by remember { mutableStateOf("#FFFFFF") }
    var selectedStrokeWidth by remember { mutableStateOf(5f) }
    var completedStrokes by remember { mutableStateOf<List<DrawStroke>>(emptyList()) }
    var currentPoints by remember { mutableStateOf<List<CanvasPoint>>(emptyList()) }
    var canvasSize by remember { mutableStateOf(IntSize(1, 1)) }

    val canSave = title.isNotBlank() && when (mode) {
        FormulaInputMode.TEXT -> formulaText.isNotBlank()
        FormulaInputMode.DRAWING -> completedStrokes.isNotEmpty() || currentPoints.isNotEmpty()
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 8.dp,
            modifier = Modifier
                .fillMaxWidth(0.94f)
                .fillMaxHeight(0.92f)
                .testTag("add_formula_dialog")
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(20.dp)
            ) {
                // Header with Title & Close
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Add Formula",
                            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Type equations or handwrite chemical/math diagrams",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier.testTag("close_formula_dialog")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Mode Selector Tabs (Text & Color vs Draw / Handwrite)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f))
                        .padding(4.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    val textSelected = mode == FormulaInputMode.TEXT
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = if (textSelected) MaterialTheme.colorScheme.primary else Color.Transparent,
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .clickable { mode = FormulaInputMode.TEXT }
                            .testTag("mode_text_tab")
                    ) {
                        Row(
                            modifier = Modifier.padding(vertical = 10.dp),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.TextFields,
                                contentDescription = null,
                                tint = if (textSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Text & Color",
                                style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                                color = if (textSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    val drawSelected = mode == FormulaInputMode.DRAWING
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = if (drawSelected) MaterialTheme.colorScheme.primary else Color.Transparent,
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .clickable { mode = FormulaInputMode.DRAWING }
                            .testTag("mode_draw_tab")
                    ) {
                        Row(
                            modifier = Modifier.padding(vertical = 10.dp),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Draw,
                                contentDescription = null,
                                tint = if (drawSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Draw / Handwrite",
                                style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                                color = if (drawSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Scrollable Form Content
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Title Input
                    OutlinedTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = { Text("Formula Title *") },
                        placeholder = {
                            Text(
                                if (mode == FormulaInputMode.TEXT) "e.g. Carnot Engine Efficiency"
                                else "e.g. Benzene Ring & Resonance / Parabola"
                            )
                        },
                        singleLine = true,
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("formula_title_input")
                    )

                    // Subject Selector Chips
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text = "Subject",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            listOf("Physics", "Chemistry", "Mathematics", "General").forEach { s ->
                                val isSelected = subject == s
                                val chipColor = when (s) {
                                    "Physics" -> PhysicsAccent
                                    "Chemistry" -> ChemistryAccent
                                    "Mathematics" -> MathAccent
                                    else -> GoldenAmber
                                }
                                FilterChip(
                                    selected = isSelected,
                                    onClick = { subject = s },
                                    label = { Text(s, fontSize = 12.sp) },
                                    colors = FilterChipDefaults.filterChipColors(
                                        selectedContainerColor = chipColor.copy(alpha = 0.25f),
                                        selectedLabelColor = chipColor
                                    ),
                                    modifier = Modifier.testTag("subject_chip_$s")
                                )
                            }
                        }
                    }

                    // Chapter / Topic Input
                    OutlinedTextField(
                        value = chapter,
                        onValueChange = { chapter = it },
                        label = { Text("Chapter / Topic (Optional)") },
                        placeholder = { Text("e.g. Thermodynamics, Coordinate Geometry") },
                        singleLine = true,
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Mode Specific Sections
                    if (mode == FormulaInputMode.TEXT) {
                        // Formula Text Area
                        OutlinedTextField(
                            value = formulaText,
                            onValueChange = { formulaText = it },
                            label = { Text("Formula Text / Equation *") },
                            placeholder = { Text("e.g. η = 1 - T_c / T_h = W / Q_in\nΔG = ΔH - TΔS") },
                            minLines = 3,
                            maxLines = 5,
                            textStyle = MaterialTheme.typography.bodyMedium.copy(
                                fontFamily = FontFamily.Monospace,
                                color = DrawingSerializer.parseColor(selectedTextColorHex)
                            ),
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("formula_text_input")
                        )

                        // Color Picker
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text(
                                    text = "Text Color:",
                                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Box(
                                    modifier = Modifier
                                        .size(16.dp)
                                        .clip(CircleShape)
                                        .background(DrawingSerializer.parseColor(selectedTextColorHex))
                                )
                                Text(
                                    text = COLOR_PALETTE.find { it.first.equals(selectedTextColorHex, ignoreCase = true) }?.second ?: selectedTextColorHex,
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                COLOR_PALETTE.forEach { (hex, name) ->
                                    val isSelected = selectedTextColorHex.equals(hex, ignoreCase = true)
                                    val color = DrawingSerializer.parseColor(hex)
                                    Box(
                                        modifier = Modifier
                                            .size(32.dp)
                                            .clip(CircleShape)
                                            .background(color)
                                            .then(
                                                if (isSelected) {
                                                    Modifier.border(2.5.dp, MaterialTheme.colorScheme.onSurface, CircleShape)
                                                } else {
                                                    Modifier.border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.5f), CircleShape)
                                                }
                                            )
                                            .clickable { selectedTextColorHex = hex }
                                            .testTag("color_picker_$hex"),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        if (isSelected) {
                                            Icon(
                                                imageVector = Icons.Default.Check,
                                                contentDescription = name,
                                                tint = if (hex == "#FFFFFF" || hex == "#FACC15") Color.Black else Color.White,
                                                modifier = Modifier.size(18.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }

                        // Live Card Preview
                        if (formulaText.isNotBlank()) {
                            Surface(
                                shape = RoundedCornerShape(14.dp),
                                color = Color(0xFF0F172A),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155)),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Text(
                                        text = "LIVE PREVIEW",
                                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                                        color = GoldenAmber
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = formulaText,
                                        style = MaterialTheme.typography.bodyLarge.copy(
                                            fontFamily = FontFamily.Monospace,
                                            fontWeight = FontWeight.Medium
                                        ),
                                        color = DrawingSerializer.parseColor(selectedTextColorHex)
                                    )
                                }
                            }
                        }
                    } else {
                        // Drawing / Handwritten Canvas Mode
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Touch Drawing Canvas",
                                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.onSurface
                                )

                                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                    // Undo Button
                                    IconButton(
                                        onClick = {
                                            if (completedStrokes.isNotEmpty()) {
                                                completedStrokes = completedStrokes.dropLast(1)
                                            }
                                        },
                                        enabled = completedStrokes.isNotEmpty(),
                                        modifier = Modifier.size(32.dp).testTag("canvas_undo_button")
                                    ) {
                                        Icon(
                                            imageVector = Icons.AutoMirrored.Filled.Undo,
                                            contentDescription = "Undo",
                                            tint = if (completedStrokes.isNotEmpty()) MaterialTheme.colorScheme.primary else Color.Gray,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }

                                    // Clear Canvas Button
                                    IconButton(
                                        onClick = {
                                            completedStrokes = emptyList()
                                            currentPoints = emptyList()
                                        },
                                        enabled = completedStrokes.isNotEmpty() || currentPoints.isNotEmpty(),
                                        modifier = Modifier.size(32.dp).testTag("canvas_clear_button")
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.DeleteOutline,
                                            contentDescription = "Clear",
                                            tint = if (completedStrokes.isNotEmpty()) Color(0xFFEF4444) else Color.Gray,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                }
                            }

                            // Pen Colors Palette for Drawing
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                COLOR_PALETTE.take(7).forEach { (hex, name) ->
                                    val isSelected = selectedPenColorHex.equals(hex, ignoreCase = true)
                                    val color = DrawingSerializer.parseColor(hex)
                                    Box(
                                        modifier = Modifier
                                            .size(28.dp)
                                            .clip(CircleShape)
                                            .background(color)
                                            .then(
                                                if (isSelected) {
                                                    Modifier.border(2.5.dp, MaterialTheme.colorScheme.onSurface, CircleShape)
                                                } else {
                                                    Modifier.border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f), CircleShape)
                                                }
                                            )
                                            .clickable { selectedPenColorHex = hex },
                                        contentAlignment = Alignment.Center
                                    ) {
                                        if (isSelected) {
                                            Icon(
                                                imageVector = Icons.Default.Check,
                                                contentDescription = name,
                                                tint = if (hex == "#FFFFFF" || hex == "#FACC15") Color.Black else Color.White,
                                                modifier = Modifier.size(14.dp)
                                            )
                                        }
                                    }
                                }

                                // Stroke width picker
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    listOf(3f to "Fine", 6f to "Med", 10f to "Thick").forEach { (width, label) ->
                                        val isSel = selectedStrokeWidth == width
                                        Surface(
                                            shape = RoundedCornerShape(8.dp),
                                            color = if (isSel) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(8.dp))
                                                .clickable { selectedStrokeWidth = width }
                                        ) {
                                            Text(
                                                text = label,
                                                style = MaterialTheme.typography.labelSmall.copy(
                                                    fontSize = 10.sp,
                                                    fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal
                                                ),
                                                color = if (isSel) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 4.dp)
                                            )
                                        }
                                    }
                                }
                            }

                            // Interactive Drawing Canvas Element
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(230.dp)
                                    .clip(RoundedCornerShape(16.dp))
                                    .background(Color(0xFF0F172A))
                                    .border(1.5.dp, Color(0xFF334155), RoundedCornerShape(16.dp))
                                    .onSizeChanged { size ->
                                        if (size.width > 0 && size.height > 0) {
                                            canvasSize = size
                                        }
                                    }
                                    .pointerInput(selectedPenColorHex, selectedStrokeWidth) {
                                        detectTapGestures { offset ->
                                            // Handle tap/dot gesture (e.g. chemical Lewis dot or math dot)
                                            val pt = CanvasPoint(offset.x, offset.y)
                                            completedStrokes = completedStrokes + DrawStroke(
                                                points = listOf(pt, CanvasPoint(offset.x + 0.5f, offset.y + 0.5f)),
                                                colorHex = selectedPenColorHex,
                                                strokeWidth = selectedStrokeWidth
                                            )
                                        }
                                    }
                                    .pointerInput(selectedPenColorHex, selectedStrokeWidth) {
                                        detectDragGestures(
                                            onDragStart = { offset ->
                                                currentPoints = listOf(CanvasPoint(offset.x, offset.y))
                                            },
                                            onDrag = { change, _ ->
                                                change.consume()
                                                currentPoints = currentPoints + CanvasPoint(change.position.x, change.position.y)
                                            },
                                            onDragEnd = {
                                                if (currentPoints.isNotEmpty()) {
                                                    completedStrokes = completedStrokes + DrawStroke(
                                                        points = currentPoints,
                                                        colorHex = selectedPenColorHex,
                                                        strokeWidth = selectedStrokeWidth
                                                    )
                                                    currentPoints = emptyList()
                                                }
                                            },
                                            onDragCancel = {
                                                currentPoints = emptyList()
                                            }
                                        )
                                    }
                                    .testTag("interactive_drawing_canvas")
                            ) {
                                Canvas(modifier = Modifier.fillMaxSize()) {
                                    // Draw subtle background grid dots for guidance
                                    val step = 32.dp.toPx()
                                    val dotRadius = 1.2.dp.toPx()
                                    var x = step
                                    while (x < size.width) {
                                        var y = step
                                        while (y < size.height) {
                                            drawCircle(
                                                color = Color(0x2294A3B8),
                                                radius = dotRadius,
                                                center = Offset(x, y)
                                            )
                                            y += step
                                        }
                                        x += step
                                    }

                                    // Render completed strokes
                                    completedStrokes.forEach { stroke ->
                                        if (stroke.points.size >= 2) {
                                            val path = Path().apply {
                                                moveTo(stroke.points[0].x, stroke.points[0].y)
                                                for (i in 1 until stroke.points.size) {
                                                    lineTo(stroke.points[i].x, stroke.points[i].y)
                                                }
                                            }
                                            drawPath(
                                                path = path,
                                                color = DrawingSerializer.parseColor(stroke.colorHex),
                                                style = Stroke(
                                                    width = stroke.strokeWidth,
                                                    cap = StrokeCap.Round,
                                                    join = StrokeJoin.Round
                                                )
                                            )
                                        } else if (stroke.points.isNotEmpty()) {
                                            val p = stroke.points[0]
                                            drawCircle(
                                                color = DrawingSerializer.parseColor(stroke.colorHex),
                                                radius = stroke.strokeWidth / 2f,
                                                center = Offset(p.x, p.y)
                                            )
                                        }
                                    }

                                    // Render active in-progress stroke
                                    if (currentPoints.size >= 2) {
                                        val path = Path().apply {
                                            moveTo(currentPoints[0].x, currentPoints[0].y)
                                            for (i in 1 until currentPoints.size) {
                                                lineTo(currentPoints[i].x, currentPoints[i].y)
                                            }
                                        }
                                        drawPath(
                                            path = path,
                                            color = DrawingSerializer.parseColor(selectedPenColorHex),
                                            style = Stroke(
                                                width = selectedStrokeWidth,
                                                cap = StrokeCap.Round,
                                                join = StrokeJoin.Round
                                            )
                                        )
                                    }
                                }

                                if (completedStrokes.isEmpty() && currentPoints.isEmpty()) {
                                    Text(
                                        text = "Touch and drag to draw chemical structures, equations, or graphs...",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = Color(0xFF64748B),
                                        modifier = Modifier
                                            .align(Alignment.Center)
                                            .padding(16.dp)
                                    )
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Bottom Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("cancel_formula_button")
                    ) {
                        Text("Cancel")
                    }

                    Button(
                        onClick = {
                            val isDrawing = mode == FormulaInputMode.DRAWING
                            val serializedDrawing = if (isDrawing) {
                                val allStrokes = if (currentPoints.isNotEmpty()) {
                                    completedStrokes + DrawStroke(currentPoints, selectedPenColorHex, selectedStrokeWidth)
                                } else {
                                    completedStrokes
                                }
                                DrawingSerializer.serialize(
                                    allStrokes,
                                    canvasSize.width.toFloat(),
                                    canvasSize.height.toFloat()
                                )
                            } else ""

                            onSaveFormula(
                                title.trim(),
                                subject,
                                chapter.trim(),
                                formulaText.trim(),
                                selectedTextColorHex,
                                isDrawing,
                                serializedDrawing
                            )
                        },
                        enabled = canSave,
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier
                            .weight(1.3f)
                            .testTag("save_formula_button")
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Save Formula")
                    }
                }
            }
        }
    }
}
