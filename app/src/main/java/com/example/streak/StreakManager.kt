package com.example.streak

import android.content.Context
import android.content.SharedPreferences
import androidx.compose.ui.graphics.Color
import java.text.SimpleDateFormat
import java.util.*

enum class StreakTier(
    val minDays: Int,
    val title: String,
    val badgeIcon: String,
    val description: String,
    val colorHex: String,
    val glowColor: Color
) {
    STARTER(1, "Daily Spark", "✨", "The journey begins with 1 day of disciplined study", "#38BDF8", Color(0xFF38BDF8)),
    BRONZE(3, "Bronze Spark", "🥉", "3 consecutive days of focused problem solving", "#CD7F32", Color(0xFFCD7F32)),
    SILVER(7, "Silver Flame", "🥈", "1 full week of uninterrupted daily preparation", "#E2E8F0", Color(0xFFE2E8F0)),
    GOLD(14, "Golden Blaze", "🥇", "2 weeks of relentless dedication to the syllabus", "#FFD700", Color(0xFFFFD700)),
    EMERALD(30, "Emerald Inferno", "💎", "30 days of unbreakable habit mastery", "#10B981", Color(0xFF10B981)),
    TITAN(60, "Titan Dominance", "👑", "60 consecutive days of JEE excellence", "#A855F7", Color(0xFFA855F7)),
    LEGEND(100, "IITian Legend", "🏆", "100 days of absolute mastery. IIT Bombay awaits!", "#FF5722", Color(0xFFFF5722))
}

data class StreakDayStatus(
    val date: String, // "yyyy-MM-dd"
    val dayOfWeekLabel: String, // "Mon", "Tue", etc.
    val dayNumber: String, // "3", "4", etc.
    val isToday: Boolean,
    val isGoalCompleted: Boolean,
    val isFuture: Boolean
)

object StreakManager {
    private const val PREFS_NAME = "rankify_streak_prefs"
    private const val KEY_CURRENT_STREAK = "key_current_streak"
    private const val KEY_BEST_STREAK = "key_best_streak"
    private const val KEY_LAST_COMPLETION_DATE = "key_last_completion_date"
    private const val KEY_TOTAL_GOAL_DAYS = "key_total_goal_days"
    private const val KEY_TODAY_GOAL_MET = "key_today_goal_met"

    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.US)
    private val dayOfWeekFormat = SimpleDateFormat("EEE", Locale.US)
    private val dayNumberFormat = SimpleDateFormat("d", Locale.US)

    fun getTodayString(): String {
        return dateFormat.format(Date())
    }

    fun getYesterdayString(): String {
        val cal = Calendar.getInstance()
        cal.add(Calendar.DAY_OF_YEAR, -1)
        return dateFormat.format(cal.time)
    }

    /**
     * Checks if date1 was the calendar day immediately preceding date2.
     */
    fun isConsecutiveDay(date1Str: String, date2Str: String): Boolean {
        if (date1Str.isBlank() || date2Str.isBlank()) return false
        return try {
            val d1 = dateFormat.parse(date1Str) ?: return false
            val d2 = dateFormat.parse(date2Str) ?: return false

            val cal1 = Calendar.getInstance().apply { time = d1 }
            val cal2 = Calendar.getInstance().apply { time = d2 }

            // Check if cal1 + 1 day equals cal2
            cal1.add(Calendar.DAY_OF_YEAR, 1)
            cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR) &&
                    cal1.get(Calendar.DAY_OF_YEAR) == cal2.get(Calendar.DAY_OF_YEAR)
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Evaluates new streak when user finishes today's study goals.
     * If completed today previously, returns unchanged.
     * If yesterday was completed, increments streak (consecutive!).
     * If broken or first time, starts at 1.
     */
    fun computeStreakOnGoalCompletion(
        lastFullCompletionDate: String,
        currentStreak: Int,
        bestStreak: Int,
        todayStr: String = getTodayString()
    ): Pair<Int, Int> {
        if (lastFullCompletionDate == todayStr) {
            // Already counted today
            return Pair(currentStreak, bestStreak)
        }

        val newStreak = if (isConsecutiveDay(lastFullCompletionDate, todayStr)) {
            currentStreak + 1
        } else {
            1
        }
        val newBest = maxOf(bestStreak, newStreak)
        return Pair(newStreak, newBest)
    }

    /**
     * Returns the active streak. If the user missed yesterday and has not
     * completed today yet, the consecutive chain is broken, so active streak is 0.
     */
    fun computeActiveStreak(
        lastFullCompletionDate: String,
        recordedStreak: Int,
        todayStr: String = getTodayString()
    ): Int {
        if (recordedStreak <= 0 || lastFullCompletionDate.isBlank()) return 0
        if (lastFullCompletionDate == todayStr) {
            return recordedStreak
        }
        val yesterdayStr = getYesterdayString()
        if (lastFullCompletionDate == yesterdayStr) {
            // Still active from yesterday, waiting for today's tasks
            return recordedStreak
        }
        // Missed yesterday or older
        return 0
    }

    fun isTodayGoalMet(lastFullCompletionDate: String, todayStr: String = getTodayString()): Boolean {
        return lastFullCompletionDate == todayStr
    }

    /**
     * Finds the highest tier unlocked by the current streak.
     */
    fun getStreakTier(streak: Int): StreakTier {
        val sortedTiers = StreakTier.values().sortedByDescending { it.minDays }
        return sortedTiers.firstOrNull { streak >= it.minDays } ?: StreakTier.STARTER
    }

    /**
     * Finds the next milestone tier and number of days left to reach it.
     */
    fun getNextMilestone(streak: Int): Pair<StreakTier, Int> {
        val sortedTiers = StreakTier.values().sortedBy { it.minDays }
        val nextTier = sortedTiers.firstOrNull { it.minDays > streak } ?: StreakTier.LEGEND
        val daysRemaining = maxOf(0, nextTier.minDays - streak)
        return Pair(nextTier, daysRemaining)
    }

    /**
     * Computes 0.0f..1.0f progress toward the next milestone.
     */
    fun getMilestoneProgress(streak: Int): Float {
        val (nextTier, _) = getNextMilestone(streak)
        val prevMilestoneDays = StreakTier.values()
            .filter { it.minDays <= streak }
            .maxOfOrNull { it.minDays } ?: 0

        val range = nextTier.minDays - prevMilestoneDays
        if (range <= 0) return 1f
        val currentProgressInRange = streak - prevMilestoneDays
        return (currentProgressInRange.toFloat() / range.toFloat()).coerceIn(0f, 1f)
    }

    /**
     * Builds the last 7 calendar days status (ending in today) for visual feedback.
     */
    fun getPast7DaysStatus(
        todayStr: String = getTodayString(),
        completedDates: Set<String>
    ): List<StreakDayStatus> {
        val result = mutableListOf<StreakDayStatus>()
        val cal = Calendar.getInstance()

        // Start from 6 days ago up to today
        for (offset in -6..0) {
            val dayCal = Calendar.getInstance().apply {
                time = cal.time
                add(Calendar.DAY_OF_YEAR, offset)
            }
            val dateStr = dateFormat.format(dayCal.time)
            val dayLabel = dayOfWeekFormat.format(dayCal.time)
            val dayNum = dayNumberFormat.format(dayCal.time)
            val isToday = (offset == 0)
            val isCompleted = completedDates.contains(dateStr)

            result.add(
                StreakDayStatus(
                    date = dateStr,
                    dayOfWeekLabel = dayLabel,
                    dayNumber = dayNum,
                    isToday = isToday,
                    isGoalCompleted = isCompleted,
                    isFuture = false
                )
            )
        }
        return result
    }

    /**
     * Returns an inspiring JEE motivational quote tailored to the current streak.
     */
    fun getMotivationalQuote(streak: Int): String {
        return when {
            streak >= 100 -> "\"100 days of unbroken grit! AIR top 100 is forged in this exact consistency.\""
            streak >= 60 -> "\"60-day titan! Your problem-solving reflexes are at their peak.\""
            streak >= 30 -> "\"A full month of daily momentum. What seemed difficult is now second nature.\""
            streak >= 14 -> "\"2 solid weeks! Consistency separates the top 1% from the rest.\""
            streak >= 7 -> "\"One full week in the books! Keep this flame burning bright.\""
            streak >= 3 -> "\"3 days strong! The hardest part is starting; now keep pushing!\""
            streak == 1 -> "\"Day 1 locked in! Small daily disciplines compound into massive ranks.\""
            else -> "\"Zero regrets tomorrow means 100% effort today. Start your streak now!\""
        }
    }

    // --- SHAREDPREFERENCES SYNCHRONIZATION ---

    private fun getPrefs(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    fun syncStreakToPrefs(
        context: Context,
        currentStreak: Int,
        bestStreak: Int,
        lastCompletionDate: String,
        totalGoalDays: Int,
        todayGoalMet: Boolean
    ) {
        getPrefs(context).edit().apply {
            putInt(KEY_CURRENT_STREAK, currentStreak)
            putInt(KEY_BEST_STREAK, bestStreak)
            putString(KEY_LAST_COMPLETION_DATE, lastCompletionDate)
            putInt(KEY_TOTAL_GOAL_DAYS, totalGoalDays)
            putBoolean(KEY_TODAY_GOAL_MET, todayGoalMet)
            apply()
        }
    }

    fun getCachedStreak(context: Context): Triple<Int, Int, String> {
        val prefs = getPrefs(context)
        val current = prefs.getInt(KEY_CURRENT_STREAK, 0)
        val best = prefs.getInt(KEY_BEST_STREAK, 0)
        val lastDate = prefs.getString(KEY_LAST_COMPLETION_DATE, "") ?: ""
        return Triple(current, best, lastDate)
    }

    fun isCachedTodayGoalMet(context: Context): Boolean {
        return getPrefs(context).getBoolean(KEY_TODAY_GOAL_MET, false)
    }
}
