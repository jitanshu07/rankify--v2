package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface ChapterDao {
    @Query("SELECT * FROM chapters ORDER BY id ASC")
    fun getAllChapters(): Flow<List<ChapterEntity>>

    @Query("SELECT COUNT(*) FROM chapters")
    suspend fun getChapterCount(): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(chapters: List<ChapterEntity>)

    @Update
    suspend fun updateChapter(chapter: ChapterEntity)

    @Query("UPDATE chapters SET isCompleted = :isCompleted, completionDate = :completionDate WHERE id = :id")
    suspend fun setChapterCompletion(id: Int, isCompleted: Boolean, completionDate: Long?)
}

@Dao
interface TodoDao {
    @Query("SELECT * FROM todos ORDER BY isCompleted ASC, id DESC")
    fun getAllTodos(): Flow<List<TodoEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTodo(todo: TodoEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(todos: List<TodoEntity>)

    @Update
    suspend fun updateTodo(todo: TodoEntity)

    @Query("DELETE FROM todos WHERE id = :id")
    suspend fun deleteTodo(id: Long)

    @Query("DELETE FROM todos WHERE isCompleted = 1")
    suspend fun clearCompletedTodos()

    @Query("SELECT COUNT(*) FROM todos WHERE isCompleted = 0")
    suspend fun getPendingCount(): Int

    @Query("SELECT * FROM todos WHERE isCompleted = 0")
    suspend fun getPendingTodosSync(): List<TodoEntity>
}

@Dao
interface StudySessionDao {
    @Query("SELECT * FROM study_sessions ORDER BY timestamp DESC")
    fun getAllSessions(): Flow<List<StudySessionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSession(session: StudySessionEntity)

    @Query("DELETE FROM study_sessions WHERE id = :id")
    suspend fun deleteSession(id: Long)
}

@Dao
interface ErrorBookDao {
    @Query("SELECT * FROM error_book ORDER BY timestamp DESC")
    fun getAllErrors(): Flow<List<ErrorLogEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertError(error: ErrorLogEntity)

    @Update
    suspend fun updateError(error: ErrorLogEntity)

    @Query("DELETE FROM error_book WHERE id = :id")
    suspend fun deleteError(id: Long)
}

@Dao
interface BacklogDao {
    @Query("SELECT * FROM backlogs ORDER BY isCompleted ASC, id DESC")
    fun getAllBacklogs(): Flow<List<BacklogEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBacklog(backlog: BacklogEntity)

    @Update
    suspend fun updateBacklog(backlog: BacklogEntity)

    @Query("DELETE FROM backlogs WHERE id = :id")
    suspend fun deleteBacklog(id: Long)
}

@Dao
interface ExtraContentDao {
    @Query("SELECT * FROM extra_folders ORDER BY id DESC")
    fun getAllFolders(): Flow<List<ExtraFolderEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFolder(folder: ExtraFolderEntity): Long

    @Query("DELETE FROM extra_folders WHERE id = :id")
    suspend fun deleteFolder(id: Long)

    @Query("SELECT * FROM extra_documents WHERE folderId = :folderId ORDER BY dateAdded DESC")
    fun getDocumentsForFolder(folderId: Long): Flow<List<ExtraDocumentEntity>>

    @Query("SELECT * FROM extra_documents ORDER BY dateAdded DESC")
    fun getAllDocuments(): Flow<List<ExtraDocumentEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDocument(document: ExtraDocumentEntity)

    @Query("DELETE FROM extra_documents WHERE id = :id")
    suspend fun deleteDocument(id: Long)
}

@Dao
interface UserProfileDao {
    @Query("SELECT * FROM user_profile WHERE id = 1 LIMIT 1")
    fun getProfile(): Flow<UserProfileEntity?>

    @Query("SELECT * FROM user_profile WHERE id = 1 LIMIT 1")
    suspend fun getProfileSync(): UserProfileEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateProfile(profile: UserProfileEntity)
}

@Dao
interface FormulaDao {
    @Query("SELECT * FROM formulas ORDER BY id DESC")
    fun getAllFormulas(): Flow<List<FormulaEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFormula(formula: FormulaEntity): Long

    @Update
    suspend fun updateFormula(formula: FormulaEntity)

    @Query("DELETE FROM formulas WHERE id = :id")
    suspend fun deleteFormula(id: Long)

    @Query("DELETE FROM formulas")
    suspend fun clearAllFormulas()
}

@Dao
interface DailyStreakDao {
    @Query("SELECT * FROM daily_streak_records ORDER BY date DESC")
    fun getAllStreakRecords(): Flow<List<DailyStreakRecordEntity>>

    @Query("SELECT * FROM daily_streak_records ORDER BY date DESC LIMIT 14")
    fun getRecentStreakRecords(): Flow<List<DailyStreakRecordEntity>>

    @Query("SELECT * FROM daily_streak_records WHERE date = :date LIMIT 1")
    suspend fun getRecordForDate(date: String): DailyStreakRecordEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateRecord(record: DailyStreakRecordEntity)

    @Query("SELECT COUNT(*) FROM daily_streak_records WHERE isGoalMet = 1")
    suspend fun getTotalCompletedGoalDays(): Int
}
