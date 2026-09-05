package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [
        ChapterEntity::class,
        TodoEntity::class,
        StudySessionEntity::class,
        ErrorLogEntity::class,
        BacklogEntity::class,
        ExtraFolderEntity::class,
        ExtraDocumentEntity::class,
        UserProfileEntity::class,
        FormulaEntity::class,
        DailyStreakRecordEntity::class
    ],
    version = 5,
    exportSchema = false
)
abstract class RankifyDatabase : RoomDatabase() {
    abstract fun chapterDao(): ChapterDao
    abstract fun todoDao(): TodoDao
    abstract fun studySessionDao(): StudySessionDao
    abstract fun errorBookDao(): ErrorBookDao
    abstract fun backlogDao(): BacklogDao
    abstract fun extraContentDao(): ExtraContentDao
    abstract fun userProfileDao(): UserProfileDao
    abstract fun formulaDao(): FormulaDao
    abstract fun dailyStreakDao(): DailyStreakDao

    companion object {
        @Volatile
        private var INSTANCE: RankifyDatabase? = null

        val MIGRATION_2_3 = object : androidx.room.migration.Migration(2, 3) {
            override fun migrate(db: androidx.sqlite.db.SupportSQLiteDatabase) {
                db.execSQL("ALTER TABLE user_profile ADD COLUMN focusReminderEnabled INTEGER NOT NULL DEFAULT 1")
                db.execSQL("ALTER TABLE user_profile ADD COLUMN focusReminderHour INTEGER NOT NULL DEFAULT 18")
                db.execSQL("ALTER TABLE user_profile ADD COLUMN focusReminderMinute INTEGER NOT NULL DEFAULT 0")
                db.execSQL("ALTER TABLE user_profile ADD COLUMN taskReminderEnabled INTEGER NOT NULL DEFAULT 1")
            }
        }

        val MIGRATION_3_4 = object : androidx.room.migration.Migration(3, 4) {
            override fun migrate(db: androidx.sqlite.db.SupportSQLiteDatabase) {
                db.execSQL("""
                    CREATE TABLE IF NOT EXISTS daily_streak_records (
                        date TEXT NOT NULL PRIMARY KEY,
                        tasksCompleted INTEGER NOT NULL DEFAULT 0,
                        totalTasks INTEGER NOT NULL DEFAULT 0,
                        isGoalMet INTEGER NOT NULL DEFAULT 0,
                        timestamp INTEGER NOT NULL DEFAULT 0
                    )
                """.trimIndent())
                db.execSQL("ALTER TABLE user_profile ADD COLUMN streakGoalTarget INTEGER NOT NULL DEFAULT 3")
            }
        }

        val MIGRATION_4_5 = object : androidx.room.migration.Migration(4, 5) {
            override fun migrate(db: androidx.sqlite.db.SupportSQLiteDatabase) {
                db.execSQL("ALTER TABLE user_profile ADD COLUMN dailyTargetStudyHours REAL NOT NULL DEFAULT 6.0")
            }
        }

        fun getDatabase(context: Context): RankifyDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    RankifyDatabase::class.java,
                    "rankify_database"
                )
                    .addMigrations(MIGRATION_2_3, MIGRATION_3_4, MIGRATION_4_5)
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
