package com.example.data.local

import android.content.Context
import android.content.SharedPreferences
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

enum class ClockMode {
    TIMER,
    POMODORO,
    STOPWATCH
}

enum class PomodoroPhase(val label: String) {
    FOCUS("Focus"),
    SHORT_BREAK("Short Break"),
    LONG_BREAK("Long Break")
}

data class PomodoroSettings(
    val focusMinutes: Int = 25,
    val shortBreakMinutes: Int = 5,
    val longBreakMinutes: Int = 15,
    val cyclesBeforeLongBreak: Int = 4,
    val autoStartNextPhase: Boolean = false
)

data class PomodoroPhaseCompletedEvent(
    val completedPhase: PomodoroPhase,
    val nextPhase: PomodoroPhase,
    val cycleNumber: Int,
    val totalCyclesInSet: Int,
    val durationSeconds: Long
)

object PomodoroPreferences {
    private const val PREFS_NAME = "rankify_pomodoro_prefs"
    private const val KEY_FOCUS_MINUTES = "focus_minutes"
    private const val KEY_SHORT_BREAK_MINUTES = "short_break_minutes"
    private const val KEY_LONG_BREAK_MINUTES = "long_break_minutes"
    private const val KEY_CYCLES_BEFORE_LONG_BREAK = "cycles_before_long_break"
    private const val KEY_AUTO_START_NEXT_PHASE = "auto_start_next_phase"
    private const val KEY_TODAY_DATE = "pomodoro_today_date"
    private const val KEY_COMPLETED_TODAY_COUNT = "pomodoro_completed_today_count"

    private fun getPrefs(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    fun loadSettings(context: Context): PomodoroSettings {
        val prefs = getPrefs(context)
        return PomodoroSettings(
            focusMinutes = prefs.getInt(KEY_FOCUS_MINUTES, 25).coerceIn(1, 120),
            shortBreakMinutes = prefs.getInt(KEY_SHORT_BREAK_MINUTES, 5).coerceIn(1, 60),
            longBreakMinutes = prefs.getInt(KEY_LONG_BREAK_MINUTES, 15).coerceIn(1, 90),
            cyclesBeforeLongBreak = prefs.getInt(KEY_CYCLES_BEFORE_LONG_BREAK, 4).coerceIn(2, 12),
            autoStartNextPhase = prefs.getBoolean(KEY_AUTO_START_NEXT_PHASE, false)
        )
    }

    fun saveSettings(context: Context, settings: PomodoroSettings) {
        getPrefs(context).edit()
            .putInt(KEY_FOCUS_MINUTES, settings.focusMinutes)
            .putInt(KEY_SHORT_BREAK_MINUTES, settings.shortBreakMinutes)
            .putInt(KEY_LONG_BREAK_MINUTES, settings.longBreakMinutes)
            .putInt(KEY_CYCLES_BEFORE_LONG_BREAK, settings.cyclesBeforeLongBreak)
            .putBoolean(KEY_AUTO_START_NEXT_PHASE, settings.autoStartNextPhase)
            .apply()
    }

    fun getCompletedToday(context: Context): Int {
        val prefs = getPrefs(context)
        val todayStr = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
        val savedDate = prefs.getString(KEY_TODAY_DATE, "")
        return if (savedDate == todayStr) {
            prefs.getInt(KEY_COMPLETED_TODAY_COUNT, 0)
        } else {
            0
        }
    }

    fun incrementCompletedToday(context: Context): Int {
        val prefs = getPrefs(context)
        val todayStr = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
        val savedDate = prefs.getString(KEY_TODAY_DATE, "")
        val currentCount = if (savedDate == todayStr) {
            prefs.getInt(KEY_COMPLETED_TODAY_COUNT, 0)
        } else {
            0
        }
        val newCount = currentCount + 1
        prefs.edit()
            .putString(KEY_TODAY_DATE, todayStr)
            .putInt(KEY_COMPLETED_TODAY_COUNT, newCount)
            .apply()
        return newCount
    }
}
