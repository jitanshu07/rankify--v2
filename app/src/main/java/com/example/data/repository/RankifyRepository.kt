package com.example.data.repository

import android.content.Context
import com.example.data.local.*
import com.example.data.model.JEEData
import com.example.streak.StreakManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class RankifyRepository(
    private val db: RankifyDatabase,
    private val context: Context? = null
) {
    val allChapters: Flow<List<ChapterEntity>> = db.chapterDao().getAllChapters()
    val allTodos: Flow<List<TodoEntity>> = db.todoDao().getAllTodos()
    val allSessions: Flow<List<StudySessionEntity>> = db.studySessionDao().getAllSessions()
    val allErrors: Flow<List<ErrorLogEntity>> = db.errorBookDao().getAllErrors()
    val allBacklogs: Flow<List<BacklogEntity>> = db.backlogDao().getAllBacklogs()
    val allFolders: Flow<List<ExtraFolderEntity>> = db.extraContentDao().getAllFolders()
    val allDocuments: Flow<List<ExtraDocumentEntity>> = db.extraContentDao().getAllDocuments()
    val userProfile: Flow<UserProfileEntity?> = db.userProfileDao().getProfile()
    val allFormulas: Flow<List<FormulaEntity>> = db.formulaDao().getAllFormulas()
    val allStreakRecords: Flow<List<DailyStreakRecordEntity>> = db.dailyStreakDao().getAllStreakRecords()
    val recentStreakRecords: Flow<List<DailyStreakRecordEntity>> = db.dailyStreakDao().getRecentStreakRecords()

    suspend fun addFormula(
        title: String,
        subject: String,
        chapter: String,
        formulaText: String,
        textColorHex: String,
        isDrawing: Boolean,
        drawingData: String
    ): Long = withContext(Dispatchers.IO) {
        db.formulaDao().insertFormula(
            FormulaEntity(
                title = title,
                subject = subject,
                chapter = chapter,
                formulaText = formulaText,
                textColorHex = textColorHex,
                isDrawing = isDrawing,
                drawingData = drawingData
            )
        )
    }

    suspend fun deleteFormula(id: Long) = withContext(Dispatchers.IO) {
        db.formulaDao().deleteFormula(id)
    }

    suspend fun initializeDataIfEmpty() = withContext(Dispatchers.IO) {
        val chapterCount = db.chapterDao().getChapterCount()
        if (chapterCount == 0) {
            db.chapterDao().insertAll(JEEData.getInitialChapters())
        }

        val profile = db.userProfileDao().getProfileSync()
        if (profile == null) {
            db.userProfileDao().insertOrUpdateProfile(
                UserProfileEntity(
                    id = 1,
                    userName = "Arjun Sharma",
                    currentStreak = 0,
                    bestStreak = 0,
                    lastFullCompletionDate = "",
                    isDarkMode = true,
                    lastSyncedTimestamp = System.currentTimeMillis() - 86400000L,
                    streakGoalTarget = 3
                )
            )
        } else {
            // Verify consecutive streak integrity on startup
            checkDailyStreakIntegrity()
        }

        // Check if todos empty
        val todos = db.todoDao().getAllTodos().firstOrNull()
        if (todos.isNullOrEmpty()) {
            db.todoDao().insertAll(JEEData.initialTodos)
        }

        // Check if backlogs empty
        val backlogs = db.backlogDao().getAllBacklogs().firstOrNull()
        if (backlogs.isNullOrEmpty()) {
            db.backlogDao().insertBacklog(
                BacklogEntity(
                    title = "Rotational Mechanics - Rolling without slipping on inclined plane",
                    subject = "Physics",
                    targetDate = "By Sunday",
                    urgency = "Critical",
                    isCompleted = false
                )
            )
            db.backlogDao().insertBacklog(
                BacklogEntity(
                    title = "Organic Reactions: Aldol & Cannizzaro mechanisms",
                    subject = "Chemistry",
                    targetDate = "Next 3 Days",
                    urgency = "Moderate",
                    isCompleted = false
                )
            )
            db.backlogDao().insertBacklog(
                BacklogEntity(
                    title = "Differential Equations - Integrating factor & Linear types",
                    subject = "Mathematics",
                    targetDate = "This Weekend",
                    urgency = "Moderate",
                    isCompleted = false
                )
            )
        }

        // Clean up any legacy pre-filled demo errors so Error Book starts strictly at 0
        val existingErrors = db.errorBookDao().getAllErrors().firstOrNull() ?: emptyList()
        existingErrors.forEach { error ->
            if (error.title.contains("JEE Adv 2023 Paper 1 Q.14") ||
                error.title.contains("JEE Main Jan Shift 2 Q.28")
            ) {
                db.errorBookDao().deleteError(error.id)
            }
        }

        // Clean up any legacy pre-filled demo study sessions so analytics start strictly at 0
        val existingSessions = db.studySessionDao().getAllSessions().firstOrNull() ?: emptyList()
        existingSessions.forEach { session ->
            if (session.notes.contains("Photoelectric effect") ||
                session.notes.contains("Calculus definite integrals") ||
                session.notes.contains("Coordination compounds crystal field")
            ) {
                db.studySessionDao().deleteSession(session.id)
            }
        }

        // Check if extra folders empty
        val folders = db.extraContentDao().getAllFolders().firstOrNull()
        if (folders.isNullOrEmpty()) {
            val folderId = db.extraContentDao().insertFolder(
                ExtraFolderEntity(name = "Ranker Short Notes & Cheat Sheets")
            )
            db.extraContentDao().insertDocument(
                ExtraDocumentEntity(
                    folderId = folderId,
                    fileName = "Physics_Handwritten_Formulas.pdf",
                    fileDescription = "Complete 1-page high yield formulas for JEE Adv",
                    fileType = "PDF",
                    fileContentPreview = "Summary of Kinematics, Dynamics, EM induction, and Modern Physics derivations."
                )
            )
            db.extraContentDao().insertDocument(
                ExtraDocumentEntity(
                    folderId = folderId,
                    fileName = "Organic_Named_Reactions.pdf",
                    fileDescription = "Aldol, Cannizzaro, Reimer-Tiemann, Hoffman Bromamide charts",
                    fileType = "PDF",
                    fileContentPreview = "Key reagents, attacking nucleophiles, temperature requirements, and expected major products."
                )
            )
        }
    }

    suspend fun setChapterCompletion(id: Int, isCompleted: Boolean) = withContext(Dispatchers.IO) {
        val completionDate = if (isCompleted) System.currentTimeMillis() else null
        db.chapterDao().setChapterCompletion(id, isCompleted, completionDate)
    }

    suspend fun addTodo(title: String, subject: String, priority: String) = withContext(Dispatchers.IO) {
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        db.todoDao().insertTodo(
            TodoEntity(
                title = title,
                subject = subject,
                priority = priority,
                isCompleted = false,
                dateCreated = today
            )
        )
    }

    suspend fun applyRoutineTemplate(templateTitle: String, tasks: List<String>) = withContext(Dispatchers.IO) {
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        tasks.forEach { taskTitle ->
            val subj = when {
                taskTitle.contains("Physics", ignoreCase = true) -> "Physics"
                taskTitle.contains("Chemistry", ignoreCase = true) || taskTitle.contains("Organic", ignoreCase = true) -> "Chemistry"
                taskTitle.contains("Math", ignoreCase = true) || taskTitle.contains("Calculus", ignoreCase = true) -> "Math"
                taskTitle.contains("Mock", ignoreCase = true) -> "Mock"
                else -> "Revision"
            }
            db.todoDao().insertTodo(
                TodoEntity(
                    title = taskTitle,
                    subject = subj,
                    priority = "High",
                    isCompleted = false,
                    dateCreated = today
                )
            )
        }
    }

data class TodoToggleResult(
    val isCompleted: Boolean,
    val streakIncremented: Boolean,
    val newStreak: Int = 0
)

    suspend fun toggleTodo(todo: TodoEntity): TodoToggleResult = withContext(Dispatchers.IO) {
        val newStatus = !todo.isCompleted
        val updated = todo.copy(isCompleted = newStatus)
        db.todoDao().updateTodo(updated)

        val today = StreakManager.getTodayString()
        val allTodos = db.todoDao().getAllTodos().firstOrNull() ?: emptyList()
        val totalCount = allTodos.size
        val completedCount = allTodos.count { it.isCompleted }

        val profile = db.userProfileDao().getProfileSync() ?: UserProfileEntity()
        val targetThreshold = minOf(profile.streakGoalTarget, if (totalCount > 0) totalCount else 1)
        val isGoalMet = totalCount > 0 && (completedCount == totalCount || completedCount >= targetThreshold)

        var streakIncremented = false
        var newStreak = profile.currentStreak

        if (isGoalMet) {
            if (profile.lastFullCompletionDate != today) {
                val (computedStreak, newBest) = StreakManager.computeStreakOnGoalCompletion(
                    lastFullCompletionDate = profile.lastFullCompletionDate,
                    currentStreak = profile.currentStreak,
                    bestStreak = profile.bestStreak,
                    todayStr = today
                )
                db.userProfileDao().insertOrUpdateProfile(
                    profile.copy(
                        currentStreak = computedStreak,
                        bestStreak = newBest,
                        lastFullCompletionDate = today
                    )
                )
                db.dailyStreakDao().insertOrUpdateRecord(
                    DailyStreakRecordEntity(
                        date = today,
                        tasksCompleted = completedCount,
                        totalTasks = totalCount,
                        isGoalMet = true
                    )
                )
                context?.let { ctx ->
                    val totalDays = db.dailyStreakDao().getTotalCompletedGoalDays()
                    StreakManager.syncStreakToPrefs(
                        context = ctx,
                        currentStreak = computedStreak,
                        bestStreak = newBest,
                        lastCompletionDate = today,
                        totalGoalDays = totalDays,
                        todayGoalMet = true
                    )
                }
                streakIncremented = true
                newStreak = computedStreak
            } else {
                db.dailyStreakDao().insertOrUpdateRecord(
                    DailyStreakRecordEntity(
                        date = today,
                        tasksCompleted = completedCount,
                        totalTasks = totalCount,
                        isGoalMet = true
                    )
                )
            }
        } else {
            // Study goal not met
            if (profile.lastFullCompletionDate == today) {
                // Revert today's goal completion
                val yesterdayStr = StreakManager.getYesterdayString()
                val revertedStreak = maxOf(0, profile.currentStreak - 1)
                val revertedDate = if (revertedStreak > 0) yesterdayStr else ""
                db.userProfileDao().insertOrUpdateProfile(
                    profile.copy(
                        currentStreak = revertedStreak,
                        lastFullCompletionDate = revertedDate
                    )
                )
                newStreak = revertedStreak
                context?.let { ctx ->
                    val totalDays = db.dailyStreakDao().getTotalCompletedGoalDays()
                    StreakManager.syncStreakToPrefs(
                        context = ctx,
                        currentStreak = revertedStreak,
                        bestStreak = profile.bestStreak,
                        lastCompletionDate = revertedDate,
                        totalGoalDays = totalDays,
                        todayGoalMet = false
                    )
                }
            }
            db.dailyStreakDao().insertOrUpdateRecord(
                DailyStreakRecordEntity(
                    date = today,
                    tasksCompleted = completedCount,
                    totalTasks = totalCount,
                    isGoalMet = false
                )
            )
        }

        TodoToggleResult(newStatus, streakIncremented, newStreak)
    }

    suspend fun updateStreakGoalTarget(target: Int) = withContext(Dispatchers.IO) {
        val profile = db.userProfileDao().getProfileSync() ?: return@withContext
        val newTarget = target.coerceIn(1, 10)
        db.userProfileDao().insertOrUpdateProfile(profile.copy(streakGoalTarget = newTarget))
    }

    suspend fun updateDailyTargetStudyHours(targetHours: Float) = withContext(Dispatchers.IO) {
        val profile = db.userProfileDao().getProfileSync() ?: return@withContext
        val clampedTarget = targetHours.coerceIn(1.0f, 16.0f)
        db.userProfileDao().insertOrUpdateProfile(profile.copy(dailyTargetStudyHours = clampedTarget))
    }

    suspend fun checkDailyStreakIntegrity() = withContext(Dispatchers.IO) {
        val today = StreakManager.getTodayString()
        val profile = db.userProfileDao().getProfileSync() ?: return@withContext
        val activeStreak = StreakManager.computeActiveStreak(
            lastFullCompletionDate = profile.lastFullCompletionDate,
            recordedStreak = profile.currentStreak,
            todayStr = today
        )
        if (activeStreak != profile.currentStreak) {
            db.userProfileDao().insertOrUpdateProfile(profile.copy(currentStreak = activeStreak))
        }

        // Ensure record exists for today in Room
        val existingTodayRecord = db.dailyStreakDao().getRecordForDate(today)
        val allTodos = db.todoDao().getAllTodos().firstOrNull() ?: emptyList()
        val totalCount = allTodos.size
        val completedCount = allTodos.count { it.isCompleted }
        val isTodayDone = profile.lastFullCompletionDate == today

        if (existingTodayRecord == null) {
            db.dailyStreakDao().insertOrUpdateRecord(
                DailyStreakRecordEntity(
                    date = today,
                    tasksCompleted = completedCount,
                    totalTasks = totalCount,
                    isGoalMet = isTodayDone
                )
            )
        }

        // Sync with SharedPreferences
        context?.let { ctx ->
            val totalDays = db.dailyStreakDao().getTotalCompletedGoalDays()
            StreakManager.syncStreakToPrefs(
                context = ctx,
                currentStreak = activeStreak,
                bestStreak = profile.bestStreak,
                lastCompletionDate = profile.lastFullCompletionDate,
                totalGoalDays = totalDays,
                todayGoalMet = isTodayDone
            )
        }
    }

    suspend fun deleteTodo(id: Long) = withContext(Dispatchers.IO) {
        db.todoDao().deleteTodo(id)
    }

    suspend fun clearCompletedTodos() = withContext(Dispatchers.IO) {
        db.todoDao().clearCompletedTodos()
    }

    suspend fun addStudySession(durationSeconds: Long, category: String, subject: String, notes: String) = withContext(Dispatchers.IO) {
        db.studySessionDao().insertSession(
            StudySessionEntity(
                durationSeconds = durationSeconds,
                category = category,
                subject = subject,
                notes = notes,
                timestamp = System.currentTimeMillis()
            )
        )
    }

    suspend fun deleteStudySession(id: Long) = withContext(Dispatchers.IO) {
        db.studySessionDao().deleteSession(id)
    }

    suspend fun addErrorLog(
        title: String,
        subject: String,
        chapter: String,
        mistakeType: String,
        questionNotes: String,
        solutionNotes: String
    ) = withContext(Dispatchers.IO) {
        db.errorBookDao().insertError(
            ErrorLogEntity(
                title = title,
                subject = subject,
                chapter = chapter,
                mistakeType = mistakeType,
                questionNotes = questionNotes,
                solutionNotes = solutionNotes,
                isResolved = false
            )
        )
    }

    suspend fun toggleErrorResolved(error: ErrorLogEntity) = withContext(Dispatchers.IO) {
        db.errorBookDao().updateError(error.copy(isResolved = !error.isResolved))
    }

    suspend fun deleteError(id: Long) = withContext(Dispatchers.IO) {
        db.errorBookDao().deleteError(id)
    }

    suspend fun addBacklog(title: String, subject: String, targetDate: String, urgency: String) = withContext(Dispatchers.IO) {
        db.backlogDao().insertBacklog(
            BacklogEntity(
                title = title,
                subject = subject,
                targetDate = targetDate,
                urgency = urgency,
                isCompleted = false
            )
        )
    }

    suspend fun toggleBacklog(backlog: BacklogEntity) = withContext(Dispatchers.IO) {
        db.backlogDao().updateBacklog(backlog.copy(isCompleted = !backlog.isCompleted))
    }

    suspend fun deleteBacklog(id: Long) = withContext(Dispatchers.IO) {
        db.backlogDao().deleteBacklog(id)
    }

    suspend fun createFolder(name: String): Long = withContext(Dispatchers.IO) {
        db.extraContentDao().insertFolder(ExtraFolderEntity(name = name))
    }

    suspend fun deleteFolder(id: Long) = withContext(Dispatchers.IO) {
        db.extraContentDao().deleteFolder(id)
    }

    suspend fun addDocument(folderId: Long, fileName: String, description: String, fileType: String, preview: String) = withContext(Dispatchers.IO) {
        db.extraContentDao().insertDocument(
            ExtraDocumentEntity(
                folderId = folderId,
                fileName = fileName,
                fileDescription = description,
                fileType = fileType,
                fileContentPreview = preview
            )
        )
    }

    suspend fun deleteDocument(id: Long) = withContext(Dispatchers.IO) {
        db.extraContentDao().deleteDocument(id)
    }

    suspend fun updateProfile(userName: String, isDarkMode: Boolean) = withContext(Dispatchers.IO) {
        val current = db.userProfileDao().getProfileSync() ?: UserProfileEntity()
        db.userProfileDao().insertOrUpdateProfile(
            current.copy(userName = userName, isDarkMode = isDarkMode)
        )
    }

    suspend fun toggleTheme() = withContext(Dispatchers.IO) {
        val current = db.userProfileDao().getProfileSync() ?: UserProfileEntity()
        db.userProfileDao().insertOrUpdateProfile(
            current.copy(isDarkMode = !current.isDarkMode)
        )
    }

    suspend fun updateFocusSettings(hour: Int, minute: Int, enabled: Boolean) = withContext(Dispatchers.IO) {
        val current = db.userProfileDao().getProfileSync() ?: UserProfileEntity()
        db.userProfileDao().insertOrUpdateProfile(
            current.copy(
                focusReminderHour = hour,
                focusReminderMinute = minute,
                focusReminderEnabled = enabled
            )
        )
    }

    suspend fun updateTaskReminderSetting(enabled: Boolean) = withContext(Dispatchers.IO) {
        val current = db.userProfileDao().getProfileSync() ?: UserProfileEntity()
        db.userProfileDao().insertOrUpdateProfile(
            current.copy(taskReminderEnabled = enabled)
        )
    }

    suspend fun performCloudSync(): Long = withContext(Dispatchers.IO) {
        val syncTime = System.currentTimeMillis()
        val current = db.userProfileDao().getProfileSync() ?: UserProfileEntity()
        db.userProfileDao().insertOrUpdateProfile(
            current.copy(lastSyncedTimestamp = syncTime)
        )
        syncTime
    }

    suspend fun exportDataJson(): String = withContext(Dispatchers.IO) {
        val root = JSONObject()
        val profile = db.userProfileDao().getProfileSync()
        root.put("user_name", profile?.userName ?: "Arjun Sharma")
        root.put("current_streak", profile?.currentStreak ?: 0)
        root.put("export_time", System.currentTimeMillis())

        val todos = db.todoDao().getAllTodos().firstOrNull() ?: emptyList()
        val todosArray = JSONArray()
        todos.forEach {
            val obj = JSONObject()
            obj.put("title", it.title)
            obj.put("subject", it.subject)
            obj.put("isCompleted", it.isCompleted)
            todosArray.put(obj)
        }
        root.put("todos", todosArray)

        val backlogs = db.backlogDao().getAllBacklogs().firstOrNull() ?: emptyList()
        val backlogsArray = JSONArray()
        backlogs.forEach {
            val obj = JSONObject()
            obj.put("title", it.title)
            obj.put("subject", it.subject)
            obj.put("isCompleted", it.isCompleted)
            backlogsArray.put(obj)
        }
        root.put("backlogs", backlogsArray)

        val sessions = db.studySessionDao().getAllSessions().firstOrNull() ?: emptyList()
        root.put("total_sessions", sessions.size)
        root.put("total_study_seconds", sessions.sumOf { it.durationSeconds })

        root.toString(2)
    }
}
