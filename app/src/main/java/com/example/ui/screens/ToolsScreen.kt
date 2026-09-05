package com.example.ui.screens

import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.*
import com.example.notifications.ReminderManager
import com.example.ui.theme.*
import com.example.viewmodel.ToolsSubTab
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun ToolsScreen(
    currentSubTab: ToolsSubTab,
    onSelectSubTab: (ToolsSubTab) -> Unit,
    // Calculator
    calcExpression: String,
    calcResult: String,
    onCalcInput: (String) -> Unit,
    // Error Book
    errorLogs: List<ErrorLogEntity>,
    onAddError: (title: String, subject: String, chapter: String, mistakeType: String, qNotes: String, sNotes: String) -> Unit,
    onToggleErrorResolved: (ErrorLogEntity) -> Unit,
    onDeleteError: (Long) -> Unit,
    // Backlog
    backlogs: List<BacklogEntity>,
    onAddBacklog: (title: String, subject: String, targetDate: String, urgency: String) -> Unit,
    onToggleBacklog: (BacklogEntity) -> Unit,
    onDeleteBacklog: (Long) -> Unit,
    // Extra Something
    folders: List<ExtraFolderEntity>,
    documents: List<ExtraDocumentEntity>,
    onCreateFolder: (String) -> Unit,
    onDeleteFolder: (Long) -> Unit,
    onAddDocument: (folderId: Long, fileName: String, desc: String, type: String, preview: String) -> Unit,
    onDeleteDocument: (Long) -> Unit,
    // Cloud Sync
    profile: UserProfileEntity?,
    syncMessage: String?,
    onTriggerCloudSync: () -> Unit,
    // Settings & Study Alerts
    pendingTaskCount: Int = 0,
    onSaveFocusSettings: (hour: Int, minute: Int, enabled: Boolean) -> Unit = { _, _, _ -> },
    onSaveTaskReminderSetting: (enabled: Boolean) -> Unit = {},
    onTriggerTestNotification: (isFocus: Boolean) -> Unit = {},
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .testTag("tools_screen")
    ) {
        Spacer(modifier = Modifier.height(12.dp))

        // Sub-tool pills selector
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier
                .fillMaxWidth()
                .testTag("tools_sub_tabs")
        ) {
            items(ToolsSubTab.values()) { subTab ->
                val isSelected = currentSubTab == subTab
                FilterChip(
                    selected = isSelected,
                    onClick = { onSelectSubTab(subTab) },
                    modifier = Modifier.testTag("subtab_${subTab.name.lowercase()}"),
                    label = {
                        Text(
                            text = subTab.title,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            fontSize = 12.sp
                        )
                    },
                    leadingIcon = {
                        val icon = when (subTab) {
                            ToolsSubTab.CALCULATOR -> Icons.Default.Calculate
                            ToolsSubTab.ERROR_BOOK -> Icons.Default.MenuBook
                            ToolsSubTab.BACKLOG -> Icons.Default.PendingActions
                            ToolsSubTab.EXTRA_SOMETHING -> Icons.Default.FolderSpecial
                            ToolsSubTab.CLOUD_SYNC -> Icons.Default.CloudSync
                            ToolsSubTab.SETTINGS -> Icons.Default.NotificationsActive
                        }
                        Icon(icon, contentDescription = null, modifier = Modifier.size(16.dp))
                    },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = BentoAccentBlue.copy(alpha = 0.2f),
                        selectedLabelColor = BentoAccentBlue,
                        selectedLeadingIconColor = BentoAccentBlue
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Content based on active sub-tool
        when (currentSubTab) {
            ToolsSubTab.CALCULATOR -> CalculatorSubTool(
                expression = calcExpression,
                result = calcResult,
                onInput = onCalcInput
            )
            ToolsSubTab.ERROR_BOOK -> ErrorBookSubTool(
                errors = errorLogs,
                onAddError = onAddError,
                onToggleResolved = onToggleErrorResolved,
                onDeleteError = onDeleteError
            )
            ToolsSubTab.BACKLOG -> BacklogSubTool(
                backlogs = backlogs,
                onAddBacklog = onAddBacklog,
                onToggleBacklog = onToggleBacklog,
                onDeleteBacklog = onDeleteBacklog
            )
            ToolsSubTab.EXTRA_SOMETHING -> ExtraSomethingSubTool(
                folders = folders,
                documents = documents,
                onCreateFolder = onCreateFolder,
                onDeleteFolder = onDeleteFolder,
                onAddDocument = onAddDocument,
                onDeleteDocument = onDeleteDocument
            )
            ToolsSubTab.CLOUD_SYNC -> CloudSyncSubTool(
                profile = profile,
                syncMessage = syncMessage,
                onSyncNow = onTriggerCloudSync
            )
            ToolsSubTab.SETTINGS -> SettingsSubTool(
                profile = profile,
                pendingTaskCount = pendingTaskCount,
                onSaveFocusSettings = onSaveFocusSettings,
                onSaveTaskReminderSetting = onSaveTaskReminderSetting,
                onTriggerTestNotification = onTriggerTestNotification
            )
        }
    }
}

// -------------------------------------------------------------
// 1. CALCULATOR SUB-TOOL
// -------------------------------------------------------------
@Composable
private fun CalculatorSubTool(
    expression: String,
    result: String,
    onInput: (String) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(bottom = 16.dp)
            .testTag("calculator_sub_tool"),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // Display Screen
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            border = androidx.compose.foundation.BorderStroke(1.dp, BentoBorderDark),
            modifier = Modifier
                .fillMaxWidth()
                .weight(0.9f)
                .testTag("calc_display")
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalArrangement = Arrangement.SpaceBetween,
                horizontalAlignment = Alignment.End
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "JEE SCIENTIFIC CALCULATOR",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = 1.sp
                        ),
                        color = BentoAccentBlue
                    )
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = BentoSurfaceSubtleDark
                    ) {
                        Text(
                            text = "DEG",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Bold,
                                fontSize = 9.sp
                            ),
                            color = BentoGoldIITian,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }

                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.End
                ) {
                    Text(
                        text = if (expression.isEmpty()) "0" else expression,
                        style = MaterialTheme.typography.headlineSmall.copy(
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Medium,
                            fontSize = 20.sp
                        ),
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 2,
                        modifier = Modifier.testTag("calc_expression")
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "= $result",
                        style = MaterialTheme.typography.headlineMedium.copy(
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 30.sp
                        ),
                        color = BentoAccentBlue,
                        modifier = Modifier.testTag("calc_result")
                    )
                }
            }
        }

        // Keypad Grid - Standard 6x5 perfectly aligned grid
        val buttonRows = listOf(
            listOf("C", "DEL", "(", ")", "÷"),
            listOf("sin", "cos", "tan", "log", "×"),
            listOf("7", "8", "9", "ln", "-"),
            listOf("4", "5", "6", "√", "+"),
            listOf("1", "2", "3", "π", "^"),
            listOf("0", ".", "00", "e", "=")
        )

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .weight(2.6f)
                .testTag("calc_keypad"),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            buttonRows.forEach { row ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    row.forEach { btn ->
                        val isOp = btn in listOf("+", "-", "×", "÷", "^")
                        val isEquals = btn == "="
                        val isClear = btn in listOf("C", "DEL")
                        val isConst = btn in listOf("π", "e")
                        val isSci = btn in listOf("sin", "cos", "tan", "log", "ln", "√")
                        val isParen = btn in listOf("(", ")")
                        val isDigit = btn in listOf("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "00")

                        val btnBgColor = when {
                            isEquals -> BentoAccentBlue
                            isClear -> BentoCoralAdv.copy(alpha = 0.15f)
                            isOp -> BentoSecondarySlate.copy(alpha = 0.7f)
                            isSci || isParen || isConst -> BentoSurfaceSubtleDark
                            else -> MaterialTheme.colorScheme.surface
                        }

                        val btnTextColor = when {
                            isEquals -> BentoOnAccentBlue
                            isClear -> BentoCoralAdv
                            isOp -> BentoAccentBlue
                            isConst -> BentoGoldIITian
                            isSci -> ElectricCyan
                            isParen -> MaterialTheme.colorScheme.onSurfaceVariant
                            else -> MaterialTheme.colorScheme.onSurface
                        }

                        val btnBorderColor = when {
                            isEquals -> BentoAccentBlue
                            isClear -> BentoCoralAdv.copy(alpha = 0.4f)
                            isOp -> BentoSecondarySlate
                            else -> BentoBorderDark
                        }

                        val textSize = when {
                            btn in listOf("sin", "cos", "tan", "log", "DEL") -> 12.sp
                            btn in listOf("ln", "00") -> 14.sp
                            btn == "=" -> 20.sp
                            else -> 17.sp
                        }

                        val textWeight = when {
                            isEquals -> FontWeight.Black
                            isDigit || isOp -> FontWeight.Bold
                            else -> FontWeight.SemiBold
                        }

                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = btnBgColor,
                            border = androidx.compose.foundation.BorderStroke(1.dp, btnBorderColor),
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxHeight()
                                .clip(RoundedCornerShape(12.dp))
                                .clickable { onInput(btn) }
                                .testTag("calc_btn_$btn")
                        ) {
                            Box(
                                modifier = Modifier.fillMaxSize(),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = btn,
                                    style = MaterialTheme.typography.titleMedium.copy(
                                        fontWeight = textWeight,
                                        fontSize = textSize
                                    ),
                                    color = btnTextColor
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------
// 2. ERROR BOOK SUB-TOOL
// -------------------------------------------------------------
@Composable
private fun ErrorBookSubTool(
    errors: List<ErrorLogEntity>,
    onAddError: (String, String, String, String, String, String) -> Unit,
    onToggleResolved: (ErrorLogEntity) -> Unit,
    onDeleteError: (Long) -> Unit
) {
    var showAddDialog by remember { mutableStateOf(false) }
    var title by remember { mutableStateOf("") }
    var subject by remember { mutableStateOf("Physics") }
    var chapter by remember { mutableStateOf("") }
    var mistakeType by remember { mutableStateOf("Conceptual") }
    var questionNotes by remember { mutableStateOf("") }
    var solutionNotes by remember { mutableStateOf("") }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(bottom = 24.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "JEE Mistake Error Book",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Review past slips so you never repeat them in the exam hall.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Button(
                    onClick = { showAddDialog = true },
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ElectricCyan, contentColor = Color(0xFF031D33))
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Log Mistake", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }
        }

        if (errors.isEmpty()) {
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
                        Text(
                            text = "No mistakes logged yet. Track your incorrect test problems here!",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        } else {
            items(errors, key = { it.id }) { error ->
                val subjColor = when (error.subject) {
                    "Physics" -> PhysicsAccent
                    "Chemistry" -> ChemistryAccent
                    "Mathematics" -> MathAccent
                    else -> ElectricCyan
                }

                Surface(
                    shape = RoundedCornerShape(18.dp),
                    color = MaterialTheme.colorScheme.surface,
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (error.isResolved) Color(0xFF10B981).copy(alpha = 0.5f) else Color(0xFFF43F5E).copy(alpha = 0.4f)
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Surface(shape = RoundedCornerShape(6.dp), color = subjColor.copy(alpha = 0.15f)) {
                                    Text(
                                        text = error.subject,
                                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                        color = subjColor,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                                Surface(shape = RoundedCornerShape(6.dp), color = Color(0xFFF43F5E).copy(alpha = 0.15f)) {
                                    Text(
                                        text = error.mistakeType,
                                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                        color = Color(0xFFF43F5E),
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }

                            IconButton(onClick = { onDeleteError(error.id) }, modifier = Modifier.size(28.dp)) {
                                Icon(Icons.Default.Close, contentDescription = "Delete", tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(16.dp))
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = error.title,
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )

                        if (error.chapter.isNotBlank()) {
                            Text(
                                text = "Chapter: ${error.chapter}",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Question Note
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = MaterialTheme.colorScheme.surfaceVariant,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text(
                                    text = "Mistake Analysis:",
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                    color = Color(0xFFF43F5E)
                                )
                                Text(
                                    text = error.questionNotes,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Solution Note
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = GoldenAmber.copy(alpha = 0.12f),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text(
                                    text = "Correct Concept / Fix:",
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                    color = GoldenAmber
                                )
                                Text(
                                    text = error.solutionNotes,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Status Toggle
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            TextButton(onClick = { onToggleResolved(error) }) {
                                Icon(
                                    imageVector = if (error.isResolved) Icons.Default.CheckCircle else Icons.Default.RadioButtonUnchecked,
                                    contentDescription = null,
                                    tint = if (error.isResolved) Color(0xFF10B981) else MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = if (error.isResolved) "Mastered & Reviewed" else "Mark as Mastered",
                                    fontSize = 12.sp,
                                    color = if (error.isResolved) Color(0xFF10B981) else MaterialTheme.colorScheme.primary
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    // Add Error Dialog
    if (showAddDialog) {
        AlertDialog(
            onDismissRequest = { showAddDialog = false },
            title = { Text("Log Incorrect Question", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = { Text("Question title / Exam paper") },
                        placeholder = { Text("e.g. JEE 2024 Paper 1 Q.12") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = chapter,
                        onValueChange = { chapter = it },
                        label = { Text("Chapter name") },
                        placeholder = { Text("e.g. Thermodynamics") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Subject selector
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf("Physics", "Chemistry", "Mathematics").forEach { s ->
                            val isSel = subject == s
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = if (isSel) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .clickable { subject = s }
                            ) {
                                Text(
                                    text = s,
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                    color = if (isSel) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                                )
                            }
                        }
                    }

                    // Mistake Type selector
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        listOf("Conceptual", "Silly Error", "Formula Slip", "Time Crunch").forEach { m ->
                            val isSel = mistakeType == m
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = if (isSel) Color(0xFFF43F5E) else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .clickable { mistakeType = m }
                            ) {
                                Text(
                                    text = m,
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, fontSize = 9.sp),
                                    color = if (isSel) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }

                    OutlinedTextField(
                        value = questionNotes,
                        onValueChange = { questionNotes = it },
                        label = { Text("Where did you slip?") },
                        placeholder = { Text("e.g. Missed negative sign in work formula") },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 2
                    )

                    OutlinedTextField(
                        value = solutionNotes,
                        onValueChange = { solutionNotes = it },
                        label = { Text("Correct logic / Rule to remember") },
                        placeholder = { Text("e.g. ΔW is work done by gas") },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 2
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (title.isNotBlank() && questionNotes.isNotBlank()) {
                            onAddError(title.trim(), subject, chapter.trim(), mistakeType, questionNotes.trim(), solutionNotes.trim())
                            title = ""
                            chapter = ""
                            questionNotes = ""
                            solutionNotes = ""
                            showAddDialog = false
                        }
                    }
                ) {
                    Text("Save to Error Book")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

// -------------------------------------------------------------
// 3. BACKLOG SUB-TOOL
// -------------------------------------------------------------
@Composable
private fun BacklogSubTool(
    backlogs: List<BacklogEntity>,
    onAddBacklog: (String, String, String, String) -> Unit,
    onToggleBacklog: (BacklogEntity) -> Unit,
    onDeleteBacklog: (Long) -> Unit
) {
    var showAddDialog by remember { mutableStateOf(false) }
    var selectedSubjectFilter by remember { mutableStateOf("All") }
    var selectedStatusFilter by remember { mutableStateOf("All") } // "All", "Pending", "Resolved"

    // Dialog state
    var title by remember { mutableStateOf("") }
    var subject by remember { mutableStateOf("Physics") }
    var targetDate by remember { mutableStateOf("By Sunday") }
    var urgency by remember { mutableStateOf("Critical") }
    var titleError by remember { mutableStateOf(false) }

    val totalCount = backlogs.size
    val pendingCount = backlogs.count { !it.isCompleted }
    val resolvedCount = backlogs.count { it.isCompleted }
    val clearanceRate = if (totalCount > 0) (resolvedCount.toFloat() / totalCount * 100).toInt() else 100

    val filteredBacklogs = backlogs.filter { item ->
        val matchesSubject = (selectedSubjectFilter == "All") || (item.subject.equals(selectedSubjectFilter, ignoreCase = true))
        val matchesStatus = when (selectedStatusFilter) {
            "Pending" -> !item.isCompleted
            "Resolved" -> item.isCompleted
            else -> true
        }
        matchesSubject && matchesStatus
    }

    // Grouping by subjects in standard JEE order
    val subjectsList = listOf("Physics", "Chemistry", "Mathematics")

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("backlog_manager_section"),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(bottom = 32.dp)
    ) {
        // Top Header & Prominent Add Button
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Backlog Manager",
                                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Categorize lagging chapters by subject & eliminate them with firm targets.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Button(
                            onClick = {
                                title = ""
                                titleError = false
                                targetDate = "By Sunday"
                                urgency = "Critical"
                                showAddDialog = true
                            },
                            shape = RoundedCornerShape(14.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = GoldenAmber, contentColor = Color.Black),
                            modifier = Modifier.testTag("add_backlog_button")
                        ) {
                            Icon(Icons.Default.Add, contentDescription = "Add Backlog", modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Add Backlog", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Clearance Stats Summary Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = MaterialTheme.colorScheme.surfaceVariant,
                            modifier = Modifier.weight(1f)
                        ) {
                            Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Pending", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Text("$pendingCount", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold), color = Color(0xFFF59E0B))
                            }
                        }
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = MaterialTheme.colorScheme.surfaceVariant,
                            modifier = Modifier.weight(1f)
                        ) {
                            Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Resolved", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Text("$resolvedCount", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold), color = Color(0xFF10B981))
                            }
                        }
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = MaterialTheme.colorScheme.surfaceVariant,
                            modifier = Modifier.weight(1f)
                        ) {
                            Column(modifier = Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Cleared", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Text("$clearanceRate%", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold), color = ElectricCyan)
                            }
                        }
                    }
                }
            }
        }

        // Subject & Status Filter Pills
        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                // Subject Filter Row
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    val subjectFilters = listOf("All") + subjectsList
                    items(subjectFilters) { s ->
                        val count = if (s == "All") backlogs.size else backlogs.count { it.subject.equals(s, ignoreCase = true) }
                        val isSelected = selectedSubjectFilter == s
                        val chipColor = when (s) {
                            "Physics" -> PhysicsAccent
                            "Chemistry" -> ChemistryAccent
                            "Mathematics" -> MathAccent
                            else -> MaterialTheme.colorScheme.primary
                        }

                        FilterChip(
                            selected = isSelected,
                            onClick = { selectedSubjectFilter = s },
                            label = {
                                Text(
                                    text = "$s ($count)",
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                    fontSize = 12.sp
                                )
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = chipColor.copy(alpha = 0.2f),
                                selectedLabelColor = chipColor
                            ),
                            border = FilterChipDefaults.filterChipBorder(
                                enabled = true,
                                selected = isSelected,
                                borderColor = if (isSelected) chipColor else MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                            )
                        )
                    }
                }

                // Status Filter Row (All / Pending / Resolved)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("All", "Pending", "Resolved").forEach { status ->
                        val isSelected = selectedStatusFilter == status
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (isSelected) MaterialTheme.colorScheme.secondaryContainer else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .clickable { selectedStatusFilter = status }
                        ) {
                            Text(
                                text = status,
                                style = MaterialTheme.typography.labelSmall.copy(fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal),
                                color = if (isSelected) MaterialTheme.colorScheme.onSecondaryContainer else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                            )
                        }
                    }
                }
            }
        }

        // Categorized Subject Backlog Display
        if (filteredBacklogs.isEmpty()) {
            item {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = Color(0xFF10B981),
                            modifier = Modifier.size(44.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = if (selectedStatusFilter == "Resolved") "No resolved backlogs found." else "Zero backlogs in this category! You are on track.",
                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = {
                                title = ""
                                titleError = false
                                showAddDialog = true
                            },
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Add a Backlog", fontSize = 12.sp)
                        }
                    }
                }
            }
        } else {
            // Group by subjects
            val displaySubjects = if (selectedSubjectFilter == "All") {
                subjectsList
            } else {
                listOf(selectedSubjectFilter)
            }

            displaySubjects.forEach { subj ->
                val subjectItems = filteredBacklogs.filter { it.subject.equals(subj, ignoreCase = true) }
                if (subjectItems.isNotEmpty()) {
                    val subjColor = when (subj) {
                        "Physics" -> PhysicsAccent
                        "Chemistry" -> ChemistryAccent
                        "Mathematics" -> MathAccent
                        else -> ElectricCyan
                    }
                    val subjIcon = when (subj) {
                        "Physics" -> Icons.Default.Bolt
                        "Chemistry" -> Icons.Default.Science
                        else -> Icons.Default.Calculate
                    }
                    val pendingInSubj = subjectItems.count { !it.isCompleted }

                    // Subject Category Header
                    item(key = "header_$subj") {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 8.dp, bottom = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Surface(
                                    shape = CircleShape,
                                    color = subjColor.copy(alpha = 0.2f),
                                    modifier = Modifier.size(28.dp)
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Icon(subjIcon, contentDescription = null, tint = subjColor, modifier = Modifier.size(16.dp))
                                    }
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "$subj Backlogs",
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                    color = subjColor
                                )
                            }

                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = if (pendingInSubj > 0) Color(0xFFF59E0B).copy(alpha = 0.15f) else Color(0xFF10B981).copy(alpha = 0.15f)
                            ) {
                                Text(
                                    text = if (pendingInSubj > 0) "$pendingInSubj Pending" else "All Cleared ✓",
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, fontSize = 11.sp),
                                    color = if (pendingInSubj > 0) Color(0xFFF59E0B) else Color(0xFF10B981),
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                )
                            }
                        }
                    }

                    // Backlog Cards in this Subject Category
                    items(subjectItems, key = { it.id }) { item ->
                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            color = MaterialTheme.colorScheme.surface,
                            border = androidx.compose.foundation.BorderStroke(
                                1.dp,
                                if (item.isCompleted) Color(0xFF10B981).copy(alpha = 0.5f) else MaterialTheme.colorScheme.outline.copy(alpha = 0.25f)
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("backlog_card_${item.id}")
                        ) {
                            Row(
                                modifier = Modifier.padding(14.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                // Checkbox for marking completed / resolved
                                Checkbox(
                                    checked = item.isCompleted,
                                    onCheckedChange = { onToggleBacklog(item) },
                                    colors = CheckboxDefaults.colors(checkedColor = Color(0xFF10B981)),
                                    modifier = Modifier.testTag("backlog_checkbox_${item.id}")
                                )

                                Spacer(modifier = Modifier.width(8.dp))

                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = item.title,
                                        style = MaterialTheme.typography.titleSmall.copy(
                                            fontWeight = FontWeight.SemiBold,
                                            textDecoration = if (item.isCompleted) androidx.compose.ui.text.style.TextDecoration.LineThrough else null
                                        ),
                                        color = if (item.isCompleted) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface
                                    )

                                    Spacer(modifier = Modifier.height(6.dp))

                                    Row(
                                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        // Priority Badge
                                        val priorityColor = when (item.urgency) {
                                            "Critical" -> Color(0xFFF43F5E)
                                            "High" -> Color(0xFFFB923C)
                                            "Moderate" -> Color(0xFFF59E0B)
                                            else -> Color(0xFF10B981)
                                        }
                                        Surface(
                                            shape = RoundedCornerShape(6.dp),
                                            color = priorityColor.copy(alpha = 0.15f)
                                        ) {
                                            Text(
                                                text = item.urgency,
                                                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, fontSize = 10.sp),
                                                color = priorityColor,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }

                                        // Target Date Pill
                                        Surface(
                                            shape = RoundedCornerShape(6.dp),
                                            color = MaterialTheme.colorScheme.surfaceVariant
                                        ) {
                                            Row(
                                                verticalAlignment = Alignment.CenterVertically,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Default.Schedule,
                                                    contentDescription = null,
                                                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                                    modifier = Modifier.size(11.dp)
                                                )
                                                Spacer(modifier = Modifier.width(3.dp))
                                                Text(
                                                    text = item.targetDate,
                                                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                                )
                                            }
                                        }

                                        if (item.isCompleted) {
                                            Surface(
                                                shape = RoundedCornerShape(6.dp),
                                                color = Color(0xFF10B981).copy(alpha = 0.15f)
                                            ) {
                                                Text(
                                                    text = "Cleared ✓",
                                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, fontSize = 10.sp),
                                                    color = Color(0xFF10B981),
                                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                                )
                                            }
                                        }
                                    }
                                }

                                Spacer(modifier = Modifier.width(8.dp))

                                // Direct "Clear / Done" action button
                                if (!item.isCompleted) {
                                    OutlinedButton(
                                        onClick = { onToggleBacklog(item) },
                                        shape = RoundedCornerShape(8.dp),
                                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF10B981)),
                                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF10B981).copy(alpha = 0.6f)),
                                        modifier = Modifier
                                            .height(30.dp)
                                            .testTag("backlog_done_button_${item.id}")
                                    ) {
                                        Text("Done", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                } else {
                                    IconButton(
                                        onClick = { onToggleBacklog(item) },
                                        modifier = Modifier.size(30.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.CheckCircle,
                                            contentDescription = "Reopen",
                                            tint = Color(0xFF10B981),
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.width(4.dp))

                                // Delete Button
                                IconButton(
                                    onClick = { onDeleteBacklog(item.id) },
                                    modifier = Modifier
                                        .size(32.dp)
                                        .testTag("delete_backlog_${item.id}")
                                ) {
                                    Icon(
                                        Icons.Default.Close,
                                        contentDescription = "Delete",
                                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Modal Form: Add Backlog Dialog
    if (showAddDialog) {
        AlertDialog(
            onDismissRequest = { showAddDialog = false },
            modifier = Modifier.testTag("add_backlog_dialog"),
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Add, contentDescription = null, tint = GoldenAmber)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Add Backlog Item", fontWeight = FontWeight.Bold)
                }
            },
            text = {
                Column(
                    verticalArrangement = Arrangement.spacedBy(14.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    // Subject Selector Chips
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text = "Subject *",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            subjectsList.forEach { s ->
                                val isSel = subject == s
                                val subjColor = when (s) {
                                    "Physics" -> PhysicsAccent
                                    "Chemistry" -> ChemistryAccent
                                    else -> MathAccent
                                }
                                Surface(
                                    shape = RoundedCornerShape(10.dp),
                                    color = if (isSel) subjColor.copy(alpha = 0.25f) else MaterialTheme.colorScheme.surfaceVariant,
                                    border = androidx.compose.foundation.BorderStroke(
                                        1.dp,
                                        if (isSel) subjColor else Color.Transparent
                                    ),
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(10.dp))
                                        .clickable { subject = s }
                                        .testTag("backlog_subject_chip_$s")
                                ) {
                                    Box(
                                        modifier = Modifier.padding(vertical = 10.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = s,
                                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                            color = if (isSel) subjColor else MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Topic / Chapter Name
                    OutlinedTextField(
                        value = title,
                        onValueChange = {
                            title = it
                            if (it.isNotBlank()) titleError = false
                        },
                        isError = titleError,
                        label = { Text("Chapter / Topic Name *") },
                        placeholder = { Text("e.g. Rotational Mechanics - Moment of Inertia") },
                        supportingText = if (titleError) {
                            { Text("Topic name is required", color = MaterialTheme.colorScheme.error) }
                        } else null,
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("backlog_title_input")
                    )

                    // Target Clearance Date
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        OutlinedTextField(
                            value = targetDate,
                            onValueChange = { targetDate = it },
                            label = { Text("Target Clearance Date") },
                            placeholder = { Text("e.g. By Sunday, 15 Oct, Next 3 Days") },
                            leadingIcon = {
                                Icon(Icons.Default.Schedule, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("backlog_target_input")
                        )

                        // Quick suggestion pills for target date
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            listOf("Today", "Tomorrow", "This Weekend", "Next 7 Days").forEach { suggestion ->
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = if (targetDate == suggestion) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .clickable { targetDate = suggestion }
                                ) {
                                    Text(
                                        text = suggestion,
                                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                                        color = if (targetDate == suggestion) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurfaceVariant,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                                    )
                                }
                            }
                        }
                    }

                    // Priority / Urgency Selection
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text = "Priority Level",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            listOf("Critical", "High", "Moderate", "Normal").forEach { p ->
                                val isSel = urgency == p
                                val pColor = when (p) {
                                    "Critical" -> Color(0xFFF43F5E)
                                    "High" -> Color(0xFFFB923C)
                                    "Moderate" -> Color(0xFFF59E0B)
                                    else -> Color(0xFF10B981)
                                }
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = if (isSel) pColor.copy(alpha = 0.25f) else MaterialTheme.colorScheme.surfaceVariant,
                                    border = androidx.compose.foundation.BorderStroke(
                                        1.dp,
                                        if (isSel) pColor else Color.Transparent
                                    ),
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(8.dp))
                                        .clickable { urgency = p }
                                        .testTag("backlog_priority_chip_$p")
                                ) {
                                    Box(
                                        modifier = Modifier.padding(vertical = 8.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = p,
                                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal, fontSize = 11.sp),
                                            color = if (isSel) pColor else MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (title.isBlank()) {
                            titleError = true
                        } else {
                            onAddBacklog(
                                title.trim(),
                                subject,
                                if (targetDate.isBlank()) "By Weekend" else targetDate.trim(),
                                urgency
                            )
                            title = ""
                            showAddDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = GoldenAmber, contentColor = Color.Black),
                    modifier = Modifier.testTag("save_backlog_button")
                ) {
                    Text("Add Backlog", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

// -------------------------------------------------------------
// 4. "EXTRA SOMETHING" SUB-TOOL
// (As requested: Includes an 'Add' button. Clicking it prompts for a custom name,
// creates a folder/card with that name, and allows uploading and storing custom PDF documents locally)
// -------------------------------------------------------------
@Composable
private fun ExtraSomethingSubTool(
    folders: List<ExtraFolderEntity>,
    documents: List<ExtraDocumentEntity>,
    onCreateFolder: (String) -> Unit,
    onDeleteFolder: (Long) -> Unit,
    onAddDocument: (Long, String, String, String, String) -> Unit,
    onDeleteDocument: (Long) -> Unit
) {
    var showFolderDialog by remember { mutableStateOf(false) }
    var folderName by remember { mutableStateOf("") }

    var selectedFolderId by remember { mutableStateOf<Long?>(null) }
    var showDocDialog by remember { mutableStateOf(false) }
    var docFileName by remember { mutableStateOf("") }
    var docDescription by remember { mutableStateOf("") }
    var docPreview by remember { mutableStateOf("") }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(bottom = 24.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Extra Something • Custom Vault",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Create custom folders & store study PDF documents directly in state.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                // Required 'Add' Button that prompts for custom name
                Button(
                    onClick = { showFolderDialog = true },
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ElectricCyan, contentColor = Color(0xFF031D33)),
                    modifier = Modifier.testTag("add_custom_folder_button")
                ) {
                    Icon(Icons.Default.CreateNewFolder, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add Folder", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }
        }

        if (folders.isEmpty()) {
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
                        Icon(Icons.Default.FolderOpen, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(36.dp))
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "No custom folders created yet. Tap 'Add Folder' to create your first storage vault!",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        } else {
            items(folders, key = { it.id }) { folder ->
                val folderDocs = documents.filter { it.folderId == folder.id }

                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = MaterialTheme.colorScheme.surface,
                    border = androidx.compose.foundation.BorderStroke(1.dp, ElectricCyan.copy(alpha = 0.4f)),
                    tonalElevation = 2.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
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
                                        .background(ElectricCyan.copy(alpha = 0.2f)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(Icons.Default.Folder, contentDescription = null, tint = ElectricCyan, modifier = Modifier.size(22.dp))
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = folder.name,
                                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Text(
                                        text = "${folderDocs.size} documents saved",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }

                            Row {
                                // Add Document to this folder button
                                IconButton(
                                    onClick = {
                                        selectedFolderId = folder.id
                                        docFileName = ""
                                        docDescription = ""
                                        docPreview = ""
                                        showDocDialog = true
                                    }
                                ) {
                                    Icon(Icons.Default.UploadFile, contentDescription = "Add PDF/Document", tint = ElectricCyan)
                                }
                                IconButton(onClick = { onDeleteFolder(folder.id) }) {
                                    Icon(Icons.Default.DeleteOutline, contentDescription = "Delete Folder", tint = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            }
                        }

                        // Display documents inside this folder
                        if (folderDocs.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(12.dp))
                            folderDocs.forEach { doc ->
                                Surface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = MaterialTheme.colorScheme.surfaceVariant,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 4.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(10.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(Icons.Default.PictureAsPdf, contentDescription = "PDF", tint = Color(0xFFF43F5E), modifier = Modifier.size(20.dp))
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(
                                                text = doc.fileName,
                                                style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                                                color = MaterialTheme.colorScheme.onSurface
                                            )
                                            if (doc.fileDescription.isNotBlank()) {
                                                Text(
                                                    text = doc.fileDescription,
                                                    style = MaterialTheme.typography.bodySmall,
                                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                                )
                                            }
                                        }
                                        IconButton(onClick = { onDeleteDocument(doc.id) }, modifier = Modifier.size(24.dp)) {
                                            Icon(Icons.Default.Close, contentDescription = "Remove", tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(14.dp))
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Required: Clicking prompts for custom name and creates folder
    if (showFolderDialog) {
        AlertDialog(
            onDismissRequest = { showFolderDialog = false },
            title = { Text("Create Custom Folder", fontWeight = FontWeight.Bold) },
            text = {
                OutlinedTextField(
                    value = folderName,
                    onValueChange = { folderName = it },
                    label = { Text("Folder Name") },
                    placeholder = { Text("e.g. Kota Classroom Modules, PYQ Papers") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (folderName.isNotBlank()) {
                            onCreateFolder(folderName.trim())
                            folderName = ""
                            showFolderDialog = false
                        }
                    }
                ) {
                    Text("Create Folder")
                }
            },
            dismissButton = {
                TextButton(onClick = { showFolderDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Add Document to Folder Dialog
    if (showDocDialog && selectedFolderId != null) {
        AlertDialog(
            onDismissRequest = { showDocDialog = false },
            title = { Text("Upload Study Document / PDF", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = docFileName,
                        onValueChange = { docFileName = it },
                        label = { Text("File Name (e.g. Organic_ShortNotes.pdf)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = docDescription,
                        onValueChange = { docDescription = it },
                        label = { Text("Summary / Topic") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = docPreview,
                        onValueChange = { docPreview = it },
                        label = { Text("Key Content Notes / Excerpts") },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 3
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (docFileName.isNotBlank()) {
                            val finalName = if (!docFileName.endsWith(".pdf", ignoreCase = true)) "$docFileName.pdf" else docFileName
                            onAddDocument(selectedFolderId!!, finalName, docDescription, "PDF", docPreview)
                            showDocDialog = false
                        }
                    }
                ) {
                    Text("Save Document")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDocDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

// -------------------------------------------------------------
// 5. CLOUD BACKUP / SYNC SUB-TOOL
// -------------------------------------------------------------
@Composable
private fun CloudSyncSubTool(
    profile: UserProfileEntity?,
    syncMessage: String?,
    onSyncNow: () -> Unit
) {
    val lastSync = profile?.lastSyncedTimestamp ?: 0L
    val syncDateStr = if (lastSync > 0) SimpleDateFormat("dd MMM yyyy, hh:mm a", Locale.getDefault()).format(Date(lastSync)) else "Never"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(bottom = 24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            border = androidx.compose.foundation.BorderStroke(1.dp, ElectricCyan.copy(alpha = 0.4f)),
            tonalElevation = 2.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(ElectricCyan.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.CloudSync, contentDescription = null, tint = ElectricCyan, modifier = Modifier.size(36.dp))
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "Cloud Backup & Multi-Device Sync",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = "Safely encrypt and sync your syllabus completion, error book, timer logs, and daily streak.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )

                Spacer(modifier = Modifier.height(16.dp))

                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.History, contentDescription = null, tint = GoldenAmber, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Last synced: $syncDateStr",
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                Button(
                    onClick = onSyncNow,
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ElectricCyan, contentColor = Color(0xFF031D33)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                ) {
                    Icon(Icons.Default.Sync, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Sync & Backup Now", fontWeight = FontWeight.Bold)
                }

                if (syncMessage != null) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = syncMessage,
                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                        color = Color(0xFF10B981)
                    )
                }
            }
        }
    }
}

// -------------------------------------------------------------
// 6. SETTINGS & ALERTS SUB-TOOL
// -------------------------------------------------------------
@Composable
private fun SettingsSubTool(
    profile: UserProfileEntity?,
    pendingTaskCount: Int,
    onSaveFocusSettings: (hour: Int, minute: Int, enabled: Boolean) -> Unit,
    onSaveTaskReminderSetting: (enabled: Boolean) -> Unit,
    onTriggerTestNotification: (isFocus: Boolean) -> Unit
) {
    val context = LocalContext.current

    val initialHour = profile?.focusReminderHour ?: ReminderManager.getFocusReminderHour(context)
    val initialMinute = profile?.focusReminderMinute ?: ReminderManager.getFocusReminderMinute(context)
    val initialFocusEnabled = profile?.focusReminderEnabled ?: ReminderManager.isFocusReminderEnabled(context)
    val initialTaskEnabled = profile?.taskReminderEnabled ?: ReminderManager.isTaskReminderEnabled(context)

    var focusHour by remember { mutableIntStateOf(initialHour) }
    var focusMinute by remember { mutableIntStateOf(initialMinute) }
    var focusEnabled by remember { mutableStateOf(initialFocusEnabled) }
    var taskEnabled by remember { mutableStateOf(initialTaskEnabled) }
    var statusMessage by remember { mutableStateOf<String?>(null) }

    var hasPermission by remember {
        mutableStateOf(ReminderManager.hasNotificationPermission(context))
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasPermission = isGranted
        if (isGranted) {
            statusMessage = "Notification permissions granted!"
        }
    }

    val isPm = focusHour >= 12
    val displayHour = when {
        focusHour == 0 -> 12
        focusHour > 12 -> focusHour - 12
        else -> focusHour
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Permission Card if needed
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && !hasPermission) {
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = BentoCoralAdv.copy(alpha = 0.15f),
                border = androidx.compose.foundation.BorderStroke(1.dp, BentoCoralAdv.copy(alpha = 0.4f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = null,
                        tint = BentoCoralAdv,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Notification Permission Needed",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Enable notifications so your scheduled JEE Focus Time and task reminders trigger reliably.",
                            style = MaterialTheme.typography.bodySmall.copy(fontSize = 11.sp),
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            permissionLauncher.launch(android.Manifest.permission.POST_NOTIFICATIONS)
                        },
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = BentoAccentBlue)
                    ) {
                        Text(
                            text = "Allow",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                            color = BentoOnAccentBlue
                        )
                    }
                }
            }
        }

        // Section 1: Scheduled Focus Time
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.weight(1f)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(BentoAccentBlue.copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.AccessTime,
                                contentDescription = null,
                                tint = if (MaterialTheme.colorScheme.surface == BentoSurfaceDark) BentoAccentBlue else BentoAccentBlueLight,
                                modifier = Modifier.size(22.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Preferred 'Focus Time'",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Daily push notification to start your JEE study block",
                                style = MaterialTheme.typography.bodySmall.copy(fontSize = 12.sp),
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Switch(
                        checked = focusEnabled,
                        onCheckedChange = {
                            focusEnabled = it
                            onSaveFocusSettings(focusHour, focusMinute, it)
                            statusMessage = if (it) "Focus reminder enabled for ${ReminderManager.formatTime12H(focusHour, focusMinute)}" else "Focus reminder turned off"
                        }
                    )
                }

                if (focusEnabled) {
                    Spacer(modifier = Modifier.height(16.dp))

                    // Time display
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.6f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 14.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(
                                    text = "TARGET DAILY STUDY HOUR",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        letterSpacing = 1.sp,
                                        fontWeight = FontWeight.Bold
                                    ),
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = ReminderManager.formatTime12H(focusHour, focusMinute),
                                    style = MaterialTheme.typography.headlineMedium.copy(
                                        fontFamily = FontFamily.Monospace,
                                        fontWeight = FontWeight.ExtraBold,
                                        letterSpacing = 1.sp
                                    ),
                                    color = if (MaterialTheme.colorScheme.surface == BentoSurfaceDark) BentoAccentBlue else BentoAccentBlueLight
                                )
                            }

                            // AM/PM Switcher
                            Row(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(MaterialTheme.colorScheme.surface)
                                    .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(12.dp))
                                    .padding(3.dp)
                            ) {
                                Surface(
                                    shape = RoundedCornerShape(9.dp),
                                    color = if (!isPm) BentoAccentBlue else Color.Transparent,
                                    modifier = Modifier
                                        .clickable {
                                            if (focusHour >= 12) {
                                                focusHour -= 12
                                                onSaveFocusSettings(focusHour, focusMinute, focusEnabled)
                                            }
                                        }
                                        .padding(horizontal = 10.dp, vertical = 6.dp)
                                ) {
                                    Text(
                                        text = "AM",
                                        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                                        color = if (!isPm) BentoOnAccentBlue else MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }

                                Surface(
                                    shape = RoundedCornerShape(9.dp),
                                    color = if (isPm) BentoAccentBlue else Color.Transparent,
                                    modifier = Modifier
                                        .clickable {
                                            if (focusHour < 12) {
                                                focusHour += 12
                                                onSaveFocusSettings(focusHour, focusMinute, focusEnabled)
                                            }
                                        }
                                        .padding(horizontal = 10.dp, vertical = 6.dp)
                                ) {
                                    Text(
                                        text = "PM",
                                        style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                                        color = if (isPm) BentoOnAccentBlue else MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Preset Quick Chips
                    Text(
                        text = "Quick Presets:",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        val presets = listOf(
                            Triple("Morning", 6, 0),
                            Triple("Afternoon", 14, 0),
                            Triple("Evening", 18, 0),
                            Triple("Night", 21, 0)
                        )

                        presets.forEach { (label, h, m) ->
                            val isSelected = focusHour == h && focusMinute == m
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = if (isSelected) BentoAccentBlue else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                                border = androidx.compose.foundation.BorderStroke(
                                    1.dp,
                                    if (isSelected) BentoAccentBlue else MaterialTheme.colorScheme.outline
                                ),
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable {
                                        focusHour = h
                                        focusMinute = m
                                        onSaveFocusSettings(h, m, focusEnabled)
                                        statusMessage = "Focus Time set to $label (${ReminderManager.formatTime12H(h, m)})"
                                    }
                            ) {
                                Column(
                                    modifier = Modifier.padding(vertical = 8.dp, horizontal = 4.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Text(
                                        text = label,
                                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp),
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                        color = if (isSelected) BentoOnAccentBlue else MaterialTheme.colorScheme.onSurface
                                    )
                                    Text(
                                        text = ReminderManager.formatTime12H(h, m).replace(" ", ""),
                                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp),
                                        color = if (isSelected) BentoOnAccentBlue.copy(alpha = 0.8f) else MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Stepper controls
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                            modifier = Modifier.weight(1f)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                IconButton(
                                    onClick = {
                                        focusHour = if (focusHour == 0) 23 else focusHour - 1
                                        onSaveFocusSettings(focusHour, focusMinute, focusEnabled)
                                    },
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Icon(Icons.Default.Remove, contentDescription = "Decrease Hour", modifier = Modifier.size(16.dp))
                                }

                                Text(
                                    text = "${displayHour}h",
                                    style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold)
                                )

                                IconButton(
                                    onClick = {
                                        focusHour = (focusHour + 1) % 24
                                        onSaveFocusSettings(focusHour, focusMinute, focusEnabled)
                                    },
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Icon(Icons.Default.Add, contentDescription = "Increase Hour", modifier = Modifier.size(16.dp))
                                }
                            }
                        }

                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                            modifier = Modifier.weight(1f)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                IconButton(
                                    onClick = {
                                        focusMinute = if (focusMinute < 15) 45 else focusMinute - 15
                                        onSaveFocusSettings(focusHour, focusMinute, focusEnabled)
                                    },
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Icon(Icons.Default.Remove, contentDescription = "Decrease Minute", modifier = Modifier.size(16.dp))
                                }

                                Text(
                                    text = String.format(Locale.US, "%02dm", focusMinute),
                                    style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold)
                                )

                                IconButton(
                                    onClick = {
                                        focusMinute = (focusMinute + 15) % 60
                                        onSaveFocusSettings(focusHour, focusMinute, focusEnabled)
                                    },
                                    modifier = Modifier.size(32.dp)
                                ) {
                                    Icon(Icons.Default.Add, contentDescription = "Increase Minute", modifier = Modifier.size(16.dp))
                                }
                            }
                        }
                    }
                }
            }
        }

        // Section 2: Daily Pending Tasks Reminder
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.weight(1f)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF10B981).copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = Color(0xFF10B981),
                                modifier = Modifier.size(22.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Pending Tasks Reminder",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Nightly prompt at 08:00 PM if tasks are unchecked",
                                style = MaterialTheme.typography.bodySmall.copy(fontSize = 12.sp),
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Switch(
                        checked = taskEnabled,
                        onCheckedChange = {
                            taskEnabled = it
                            onSaveTaskReminderSetting(it)
                            statusMessage = if (it) "Nightly task reminder enabled" else "Task reminder turned off"
                        }
                    )
                }

                if (taskEnabled) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.Info, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = if (pendingTaskCount > 0) {
                                    "You have $pendingTaskCount pending tasks on your checklist today."
                                } else {
                                    "All tasks cleared for today! Reminder triggers only when tasks remain."
                                },
                                style = MaterialTheme.typography.bodySmall.copy(fontSize = 12.sp),
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }

        // Section 3: Notification Push Tester
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Text(
                    text = "Test Local Push Notification",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Verify that alerts and badges appear correctly in your system notification shade.",
                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 12.sp),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(14.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = {
                            onTriggerTestNotification(true)
                            statusMessage = "🔔 Focus Time test notification sent to your device tray!"
                        },
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Notifications, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Test Focus Alert", style = MaterialTheme.typography.labelMedium)
                    }

                    OutlinedButton(
                        onClick = {
                            onTriggerTestNotification(false)
                            statusMessage = "🔔 Task Checklist test notification sent to your device tray!"
                        },
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Checklist, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Test Task Alert", style = MaterialTheme.typography.labelMedium)
                    }
                }

                statusMessage?.let { msg ->
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = msg,
                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                        color = Color(0xFF10B981)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
    }
}

