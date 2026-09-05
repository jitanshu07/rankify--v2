package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

  @Test
  fun `read string from context`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val appName = context.getString(R.string.app_name)
    assertEquals("Rankify", appName)
  }

  @Test
  fun `formula drawing serialization and deserialization with Robolectric`() {
    val strokes = listOf(
      com.example.ui.screens.DrawStroke(
        points = listOf(
          com.example.ui.screens.CanvasPoint(10f, 20f),
          com.example.ui.screens.CanvasPoint(30f, 40f)
        ),
        colorHex = "#38BDF8",
        strokeWidth = 5f
      )
    )
    val serialized = com.example.ui.screens.DrawingSerializer.serialize(strokes, 300f, 200f)
    org.junit.Assert.assertTrue(serialized.contains("#38BDF8"))

    val (deserializedStrokes, dims) = com.example.ui.screens.DrawingSerializer.deserialize(serialized)
    assertEquals(1, deserializedStrokes.size)
    assertEquals("#38BDF8", deserializedStrokes[0].colorHex)
    assertEquals(2, deserializedStrokes[0].points.size)
    assertEquals(300f, dims.first, 0.01f)
    assertEquals(200f, dims.second, 0.01f)
  }

  @Test
  fun `pomodoro preferences persists and retrieves configurable interval settings`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val customSettings = com.example.data.local.PomodoroSettings(
      focusMinutes = 35,
      shortBreakMinutes = 7,
      longBreakMinutes = 22,
      cyclesBeforeLongBreak = 3,
      autoStartNextPhase = false
    )

    com.example.data.local.PomodoroPreferences.saveSettings(context, customSettings)
    val loaded = com.example.data.local.PomodoroPreferences.loadSettings(context)

    assertEquals(35, loaded.focusMinutes)
    assertEquals(7, loaded.shortBreakMinutes)
    assertEquals(22, loaded.longBreakMinutes)
    assertEquals(3, loaded.cyclesBeforeLongBreak)
    assertEquals(false, loaded.autoStartNextPhase)

    val count1 = com.example.data.local.PomodoroPreferences.incrementCompletedToday(context)
    val count2 = com.example.data.local.PomodoroPreferences.incrementCompletedToday(context)
    assertEquals(count1 + 1, count2)
    assertEquals(count2, com.example.data.local.PomodoroPreferences.getCompletedToday(context))
  }

  @Test
  fun `chapter local storage tracks revision counter and status toggles for notes, dpp, test`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val chapterId = 101

    // Initial state
    val initial = com.example.data.local.ChapterLocalStorage.getTrackingState(context, chapterId)
    assertEquals(0, initial.revisionCount)
    assertEquals(false, initial.notesDone)
    assertEquals(false, initial.dppDone)
    assertEquals(false, initial.testDone)

    // Increment revision
    val rev1 = com.example.data.local.ChapterLocalStorage.incrementRevision(context, chapterId)
    assertEquals(1, rev1)
    val rev2 = com.example.data.local.ChapterLocalStorage.incrementRevision(context, chapterId)
    assertEquals(2, rev2)

    // Toggle Notes
    val notes1 = com.example.data.local.ChapterLocalStorage.toggleNotes(context, chapterId)
    assertEquals(true, notes1)

    // Toggle DPP
    val dpp1 = com.example.data.local.ChapterLocalStorage.toggleDpp(context, chapterId)
    assertEquals(true, dpp1)

    // Toggle Test
    val test1 = com.example.data.local.ChapterLocalStorage.toggleTest(context, chapterId)
    assertEquals(true, test1)

    // Check retrieved state
    val updated = com.example.data.local.ChapterLocalStorage.getTrackingState(context, chapterId)
    assertEquals(2, updated.revisionCount)
    assertEquals(true, updated.notesDone)
    assertEquals(true, updated.dppDone)
    assertEquals(true, updated.testDone)

    // Toggle Notes back to false
    val notes2 = com.example.data.local.ChapterLocalStorage.toggleNotes(context, chapterId)
    assertEquals(false, notes2)
    assertEquals(false, com.example.data.local.ChapterLocalStorage.getTrackingState(context, chapterId).notesDone)

    // Reset revision
    com.example.data.local.ChapterLocalStorage.resetRevision(context, chapterId)
    assertEquals(0, com.example.data.local.ChapterLocalStorage.getTrackingState(context, chapterId).revisionCount)
  }
}
