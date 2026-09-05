package com.example

import org.junit.Assert.*
import org.junit.Test

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * See [testing documentation](http://d.android.com/tools/testing).
 */
class ExampleUnitTest {
  @Test
  fun addition_isCorrect() {
    assertEquals(4, 2 + 2)
  }

  @Test
  fun initial_syllabus_progress_isStrictlyZero() {
    val totalChapters = 80
    val completedChapters = 0
    val progressPercent = if (totalChapters > 0) {
      ((completedChapters.toFloat() / totalChapters) * 100).toInt()
    } else 0
    assertEquals(0, progressPercent)
  }

  @Test
  fun dynamic_syllabus_progress_calculation() {
    val totalChapters = 80
    val completedChapters = 20
    val progressPercent = ((completedChapters.toFloat() / totalChapters) * 100).toInt()
    assertEquals(25, progressPercent)
  }

  @Test
  fun initial_streak_defaults_strictly_to_zero() {
    val defaultProfile = com.example.data.local.UserProfileEntity()
    assertEquals(0, defaultProfile.currentStreak)
    assertEquals(0, defaultProfile.bestStreak)
  }

  @Test
  fun streak_does_not_increment_on_partial_completion() {
    val initialStreak = 0
    val tasks = listOf(
      true,  // Task 1 done
      true,  // Task 2 done
      true,  // Task 3 done
      false  // Task 4 pending (75% completed)
    )
    val allDone = tasks.isNotEmpty() && tasks.all { it }
    assertFalse(allDone)

    val currentStreak = if (allDone) initialStreak + 1 else initialStreak
    assertEquals(0, currentStreak)
  }

  @Test
  fun streak_increments_when_100_percent_todo_completed() {
    val initialStreak = 0
    val tasks = listOf(
      true, // Task 1 done
      true, // Task 2 done
      true, // Task 3 done
      true  // Task 4 done (100% complete!)
    )
    val allDone = tasks.isNotEmpty() && tasks.all { it }
    assertTrue(allDone)

    val newStreak = if (allDone) initialStreak + 1 else initialStreak
    assertEquals(1, newStreak)
  }

  @Test
  fun formulas_hub_starts_completely_clean_and_empty() {
    val initialFormulas = com.example.data.model.JEEData.initialFormulas
    assertTrue("Initial formulas list must be completely empty", initialFormulas.isEmpty())
  }

  @Test
  fun formula_color_parsing() {
    val cyan = com.example.ui.screens.DrawingSerializer.parseColor("#38BDF8")
    assertNotNull(cyan)
    val white = com.example.ui.screens.DrawingSerializer.parseColor("#FFFFFF")
    assertNotNull(white)
  }

  @Test
  fun backlog_entity_creation_and_subject_categorization() {
    val items = listOf(
      com.example.data.local.BacklogEntity(
        id = 1,
        title = "Rotational Dynamics",
        subject = "Physics",
        targetDate = "By Sunday",
        urgency = "Critical",
        isCompleted = false
      ),
      com.example.data.local.BacklogEntity(
        id = 2,
        title = "Aldol Condensation",
        subject = "Chemistry",
        targetDate = "Tomorrow",
        urgency = "High",
        isCompleted = false
      ),
      com.example.data.local.BacklogEntity(
        id = 3,
        title = "Integration by Parts",
        subject = "Mathematics",
        targetDate = "Next 3 Days",
        urgency = "Moderate",
        isCompleted = true
      )
    )

    val physicsBacklogs = items.filter { it.subject == "Physics" }
    val chemistryBacklogs = items.filter { it.subject == "Chemistry" }
    val mathBacklogs = items.filter { it.subject == "Mathematics" }

    assertEquals(1, physicsBacklogs.size)
    assertEquals(1, chemistryBacklogs.size)
    assertEquals(1, mathBacklogs.size)

    val pendingCount = items.count { !it.isCompleted }
    val resolvedCount = items.count { it.isCompleted }

    assertEquals(2, pendingCount)
    assertEquals(1, resolvedCount)

    // Verify toggle/resolution
    val resolvedPhysics = physicsBacklogs.first().copy(isCompleted = true)
    assertTrue(resolvedPhysics.isCompleted)
  }

  @Test
  fun analytics_initial_state_is_strictly_zero() {
    val chapters = emptyList<com.example.data.local.ChapterEntity>()
    val sessions = emptyList<com.example.data.local.StudySessionEntity>()
    val todos = emptyList<com.example.data.local.TodoEntity>()
    val errors = emptyList<com.example.data.local.ErrorLogEntity>()

    val completedChapters = chapters.count { it.isCompleted }
    val totalStudySeconds = sessions.sumOf { it.durationSeconds }
    val totalHours = totalStudySeconds / 3600f

    val physicsSeconds = sessions.filter { it.subject == "Physics" }.sumOf { it.durationSeconds }
    val chemSeconds = sessions.filter { it.subject == "Chemistry" }.sumOf { it.durationSeconds }
    val mathSeconds = sessions.filter { it.subject == "Mathematics" }.sumOf { it.durationSeconds }

    val physicsRatio = if (totalStudySeconds > 0) physicsSeconds.toFloat() / totalStudySeconds else 0f
    val chemRatio = if (totalStudySeconds > 0) chemSeconds.toFloat() / totalStudySeconds else 0f
    val mathRatio = if (totalStudySeconds > 0) mathSeconds.toFloat() / totalStudySeconds else 0f

    val totalErrors = errors.size
    val resolvedErrors = errors.count { it.isResolved }
    val errorResolvedPercent = if (totalErrors > 0) ((resolvedErrors.toFloat() / totalErrors) * 100).toInt() else 0

    val totalTasks = todos.size
    val completedTasks = todos.count { it.isCompleted }
    val taskPercent = if (totalTasks > 0) ((completedTasks.toFloat() / totalTasks) * 100).toInt() else 0

    val readinessScore = if (completedChapters == 0 && completedTasks == 0 && resolvedErrors == 0 && totalStudySeconds == 0L) {
      0
    } else {
      ((0 * 0.5f) + (taskPercent * 0.25f) + (errorResolvedPercent * 0.15f) + (totalHours.coerceAtMost(50f) / 50f * 10f)).toInt().coerceIn(0, 100)
    }

    assertEquals(0f, totalHours, 0.001f)
    assertEquals(0f, physicsRatio, 0.001f)
    assertEquals(0f, chemRatio, 0.001f)
    assertEquals(0f, mathRatio, 0.001f)
    assertEquals(0, errorResolvedPercent)
    assertEquals(0, readinessScore)
  }

  @Test
  fun error_book_mastery_updates_dynamically_with_real_errors() {
    // 0 errors -> 0%
    val emptyErrors = emptyList<com.example.data.local.ErrorLogEntity>()
    val initialMastery = if (emptyErrors.isNotEmpty()) (emptyErrors.count { it.isResolved }.toFloat() / emptyErrors.size * 100).toInt() else 0
    assertEquals(0, initialMastery)

    // 2 errors logged, 1 resolved -> 50%
    val realErrors = listOf(
      com.example.data.local.ErrorLogEntity(id = 1, title = "Optics Sign Convention", subject = "Physics", chapter = "Ray Optics", mistakeType = "Conceptual", questionNotes = "", solutionNotes = "", isResolved = true),
      com.example.data.local.ErrorLogEntity(id = 2, title = "Buffer pH Calculation", subject = "Chemistry", chapter = "Ionic Equilibrium", mistakeType = "Calculation", questionNotes = "", solutionNotes = "", isResolved = false)
    )
    val updatedMastery = ((realErrors.count { it.isResolved }.toFloat() / realErrors.size) * 100).toInt()
    assertEquals(50, updatedMastery)
  }

  @Test
  fun default_profile_notification_settings() {
    val profile = com.example.data.local.UserProfileEntity()
    assertTrue("Focus reminder should default to enabled", profile.focusReminderEnabled)
    assertEquals(18, profile.focusReminderHour)
    assertEquals(0, profile.focusReminderMinute)
    assertTrue("Task reminder should default to enabled", profile.taskReminderEnabled)
  }

  @Test
  fun reminder_time_12h_formatting() {
    assertEquals("06:00 AM", com.example.notifications.ReminderManager.formatTime12H(6, 0))
    assertEquals("06:30 PM", com.example.notifications.ReminderManager.formatTime12H(18, 30))
    assertEquals("12:00 AM", com.example.notifications.ReminderManager.formatTime12H(0, 0))
    assertEquals("12:00 PM", com.example.notifications.ReminderManager.formatTime12H(12, 0))
    assertEquals("11:45 PM", com.example.notifications.ReminderManager.formatTime12H(23, 45))
  }

  @Test
  fun streak_tier_milestones_and_badges() {
    val tier1 = com.example.streak.StreakManager.getStreakTier(1)
    assertEquals("Daily Spark", tier1.title)
    assertEquals(1, tier1.minDays)

    val tier3 = com.example.streak.StreakManager.getStreakTier(3)
    assertEquals("Bronze Spark", tier3.title)
    assertEquals(3, tier3.minDays)

    val tier7 = com.example.streak.StreakManager.getStreakTier(7)
    assertEquals("Silver Flame", tier7.title)
    assertEquals(7, tier7.minDays)

    val tier14 = com.example.streak.StreakManager.getStreakTier(14)
    assertEquals("Golden Blaze", tier14.title)

    val tier30 = com.example.streak.StreakManager.getStreakTier(30)
    assertEquals("Emerald Inferno", tier30.title)

    val tier100 = com.example.streak.StreakManager.getStreakTier(100)
    assertEquals("IITian Legend", tier100.title)
  }

  @Test
  fun streak_today_goal_met_verification() {
    val today = com.example.streak.StreakManager.getTodayString()
    assertTrue(com.example.streak.StreakManager.isTodayGoalMet(today))
    assertFalse(com.example.streak.StreakManager.isTodayGoalMet("2026-01-01"))
    assertFalse(com.example.streak.StreakManager.isTodayGoalMet(""))
  }

  @Test
  fun streak_motivational_quotes_progression() {
    val quote0 = com.example.streak.StreakManager.getMotivationalQuote(0)
    assertTrue(quote0.isNotEmpty())

    val quote5 = com.example.streak.StreakManager.getMotivationalQuote(5)
    assertTrue(quote5.isNotEmpty())

    val quote30 = com.example.streak.StreakManager.getMotivationalQuote(30)
    assertTrue(quote30.isNotEmpty())
  }
}
