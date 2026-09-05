package com.example.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.example.data.local.RankifyDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class ReminderBroadcastReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        val action = intent?.action ?: return

        when (action) {
            ReminderManager.ACTION_FOCUS_TIME_REMINDER -> {
                if (ReminderManager.isFocusReminderEnabled(context)) {
                    ReminderManager.showFocusNotification(context)
                }
                // Reschedule for next day
                val hour = ReminderManager.getFocusReminderHour(context)
                val minute = ReminderManager.getFocusReminderMinute(context)
                if (ReminderManager.isFocusReminderEnabled(context)) {
                    ReminderManager.scheduleFocusReminder(context, hour, minute)
                }
            }
            ReminderManager.ACTION_PENDING_TASKS_REMINDER -> {
                if (ReminderManager.isTaskReminderEnabled(context)) {
                    CoroutineScope(Dispatchers.IO).launch {
                        try {
                            val db = RankifyDatabase.getDatabase(context)
                            val pendingCount = db.todoDao().getPendingCount()
                            ReminderManager.showPendingTasksNotification(context, pendingCount)
                        } catch (_: Exception) {
                            ReminderManager.showPendingTasksNotification(context, 1)
                        }
                    }
                }
                // Reschedule for next day
                if (ReminderManager.isTaskReminderEnabled(context)) {
                    ReminderManager.scheduleTaskReminder(context, 20, 0)
                }
            }
            Intent.ACTION_BOOT_COMPLETED -> {
                // Re-register alarms after device restart
                if (ReminderManager.isFocusReminderEnabled(context)) {
                    val hour = ReminderManager.getFocusReminderHour(context)
                    val minute = ReminderManager.getFocusReminderMinute(context)
                    ReminderManager.scheduleFocusReminder(context, hour, minute)
                }
                if (ReminderManager.isTaskReminderEnabled(context)) {
                    ReminderManager.scheduleTaskReminder(context, 20, 0)
                }
            }
        }
    }
}
