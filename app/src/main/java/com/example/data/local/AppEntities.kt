package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "chapters")
data class ChapterEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val subject: String, // Physics, Chemistry, Mathematics
    val classGrade: String, // Class 11, Class 12
    val name: String,
    val weightage: String, // High, Medium, Core
    val isCompleted: Boolean = false,
    val completionDate: Long? = null
)

@Entity(tableName = "todos")
data class TodoEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val subject: String = "Physics", // Physics, Chemistry, Math, Revision, Mock
    val priority: String = "High", // High, Medium, Normal
    val isCompleted: Boolean = false,
    val dateCreated: String = "" // YYYY-MM-DD
)

@Entity(tableName = "study_sessions")
data class StudySessionEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val durationSeconds: Long,
    val category: String, // Self-Study, Online Class, Revision, Mock Test
    val subject: String, // Physics, Chemistry, Mathematics, General
    val notes: String = "",
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "error_book")
data class ErrorLogEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val subject: String,
    val chapter: String,
    val mistakeType: String, // Conceptual, Silly Error, Formula Slip, Time Crunch
    val questionNotes: String,
    val solutionNotes: String,
    val isResolved: Boolean = false,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "backlogs")
data class BacklogEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val subject: String,
    val targetDate: String,
    val urgency: String = "Critical", // Critical, Moderate, Normal
    val isCompleted: Boolean = false
)

@Entity(tableName = "extra_folders")
data class ExtraFolderEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val createdDate: Long = System.currentTimeMillis()
)

@Entity(tableName = "extra_documents")
data class ExtraDocumentEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val folderId: Long,
    val fileName: String,
    val fileDescription: String,
    val fileType: String = "PDF",
    val fileContentPreview: String = "",
    val dateAdded: Long = System.currentTimeMillis()
)

@Entity(tableName = "user_profile")
data class UserProfileEntity(
    @PrimaryKey val id: Int = 1,
    val userName: String = "Arjun Sharma",
    val currentStreak: Int = 0,
    val bestStreak: Int = 0,
    val lastFullCompletionDate: String = "",
    val isDarkMode: Boolean = true,
    val lastSyncedTimestamp: Long = 0L,
    val focusReminderEnabled: Boolean = true,
    val focusReminderHour: Int = 18,
    val focusReminderMinute: Int = 0,
    val taskReminderEnabled: Boolean = true,
    val streakGoalTarget: Int = 3,
    val dailyTargetStudyHours: Float = 6.0f
)

@Entity(tableName = "daily_streak_records")
data class DailyStreakRecordEntity(
    @PrimaryKey val date: String, // "yyyy-MM-dd"
    val tasksCompleted: Int = 0,
    val totalTasks: Int = 0,
    val isGoalMet: Boolean = false,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "formulas")
data class FormulaEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val subject: String = "Physics", // Physics, Chemistry, Math, General
    val chapter: String = "",
    val formulaText: String = "",
    val textColorHex: String = "#38BDF8",
    val isDrawing: Boolean = false,
    val drawingData: String = "", // serialized stroke vectors
    val dateAdded: Long = System.currentTimeMillis()
)
