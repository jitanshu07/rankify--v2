package com.example.data.local

import android.content.Context
import android.content.SharedPreferences

data class ChapterTrackingState(
    val revisionCount: Int = 0,
    val notesDone: Boolean = false,
    val dppDone: Boolean = false,
    val testDone: Boolean = false
)

object ChapterLocalStorage {
    private const val PREFS_NAME = "rankify_chapter_local_storage"
    private const val PREFIX_REV = "rev_"
    private const val PREFIX_NOTES = "notes_"
    private const val PREFIX_DPP = "dpp_"
    private const val PREFIX_TEST = "test_"

    private fun getPrefs(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    fun getTrackingState(context: Context, chapterId: Int): ChapterTrackingState {
        val prefs = getPrefs(context)
        return ChapterTrackingState(
            revisionCount = prefs.getInt("$PREFIX_REV$chapterId", 0),
            notesDone = prefs.getBoolean("$PREFIX_NOTES$chapterId", false),
            dppDone = prefs.getBoolean("$PREFIX_DPP$chapterId", false),
            testDone = prefs.getBoolean("$PREFIX_TEST$chapterId", false)
        )
    }

    fun loadAllTrackingStates(context: Context): Map<Int, ChapterTrackingState> {
        val prefs = getPrefs(context)
        val allKeys = prefs.all.keys
        val chapterIds = mutableSetOf<Int>()

        for (key in allKeys) {
            val idStr = when {
                key.startsWith(PREFIX_REV) -> key.removePrefix(PREFIX_REV)
                key.startsWith(PREFIX_NOTES) -> key.removePrefix(PREFIX_NOTES)
                key.startsWith(PREFIX_DPP) -> key.removePrefix(PREFIX_DPP)
                key.startsWith(PREFIX_TEST) -> key.removePrefix(PREFIX_TEST)
                else -> null
            }
            idStr?.toIntOrNull()?.let { chapterIds.add(it) }
        }

        val map = mutableMapOf<Int, ChapterTrackingState>()
        for (id in chapterIds) {
            map[id] = ChapterTrackingState(
                revisionCount = prefs.getInt("$PREFIX_REV$id", 0),
                notesDone = prefs.getBoolean("$PREFIX_NOTES$id", false),
                dppDone = prefs.getBoolean("$PREFIX_DPP$id", false),
                testDone = prefs.getBoolean("$PREFIX_TEST$id", false)
            )
        }
        return map
    }

    fun incrementRevision(context: Context, chapterId: Int): Int {
        val prefs = getPrefs(context)
        val current = prefs.getInt("$PREFIX_REV$chapterId", 0)
        val next = current + 1
        prefs.edit().putInt("$PREFIX_REV$chapterId", next).apply()
        return next
    }

    fun resetRevision(context: Context, chapterId: Int) {
        val prefs = getPrefs(context)
        prefs.edit().putInt("$PREFIX_REV$chapterId", 0).apply()
    }

    fun toggleNotes(context: Context, chapterId: Int): Boolean {
        val prefs = getPrefs(context)
        val current = prefs.getBoolean("$PREFIX_NOTES$chapterId", false)
        val next = !current
        prefs.edit().putBoolean("$PREFIX_NOTES$chapterId", next).apply()
        return next
    }

    fun toggleDpp(context: Context, chapterId: Int): Boolean {
        val prefs = getPrefs(context)
        val current = prefs.getBoolean("$PREFIX_DPP$chapterId", false)
        val next = !current
        prefs.edit().putBoolean("$PREFIX_DPP$chapterId", next).apply()
        return next
    }

    fun toggleTest(context: Context, chapterId: Int): Boolean {
        val prefs = getPrefs(context)
        val current = prefs.getBoolean("$PREFIX_TEST$chapterId", false)
        val next = !current
        prefs.edit().putBoolean("$PREFIX_TEST$chapterId", next).apply()
        return next
    }
}
