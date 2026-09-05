package com.example.notifications

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import com.example.MainActivity
import java.util.Calendar
import java.util.Locale

object ReminderManager {
    const val CHANNEL_ID = "rankify_reminders_channel"
    const val CHANNEL_NAME = "Rankify Study & Task Reminders"
    const val CHANNEL_DESC = "Daily reminders for scheduled JEE Focus Time and pending tasks"

    const val ACTION_FOCUS_TIME_REMINDER = "com.example.action.FOCUS_TIME_REMINDER"
    const val ACTION_PENDING_TASKS_REMINDER = "com.example.action.PENDING_TASKS_REMINDER"

    const val REQUEST_CODE_FOCUS = 1001
    const val REQUEST_CODE_TASKS = 1002

    const val NOTIFICATION_ID_FOCUS = 2001
    const val NOTIFICATION_ID_TASKS = 2002
    const val NOTIFICATION_ID_TEST = 2003

    private const val PREFS_NAME = "rankify_notification_prefs"
    const val PREF_FOCUS_ENABLED = "focus_reminder_enabled"
    const val PREF_FOCUS_HOUR = "focus_reminder_hour"
    const val PREF_FOCUS_MINUTE = "focus_reminder_minute"
    const val PREF_TASK_ENABLED = "task_reminder_enabled"

    private fun getPrefs(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    fun createNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = CHANNEL_DESC
                enableLights(true)
                enableVibration(true)
                setShowBadge(true)
            }
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    fun hasNotificationPermission(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                context,
                android.Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true
        }
    }

    fun getFocusReminderHour(context: Context): Int = getPrefs(context).getInt(PREF_FOCUS_HOUR, 18)
    fun getFocusReminderMinute(context: Context): Int = getPrefs(context).getInt(PREF_FOCUS_MINUTE, 0)
    fun isFocusReminderEnabled(context: Context): Boolean = getPrefs(context).getBoolean(PREF_FOCUS_ENABLED, true)
    fun isTaskReminderEnabled(context: Context): Boolean = getPrefs(context).getBoolean(PREF_TASK_ENABLED, true)

    fun saveFocusSettings(context: Context, hour: Int, minute: Int, enabled: Boolean) {
        getPrefs(context).edit()
            .putInt(PREF_FOCUS_HOUR, hour)
            .putInt(PREF_FOCUS_MINUTE, minute)
            .putBoolean(PREF_FOCUS_ENABLED, enabled)
            .apply()

        if (enabled) {
            scheduleFocusReminder(context, hour, minute)
        } else {
            cancelFocusReminder(context)
        }
    }

    fun saveTaskReminderSetting(context: Context, enabled: Boolean) {
        getPrefs(context).edit()
            .putBoolean(PREF_TASK_ENABLED, enabled)
            .apply()

        if (enabled) {
            scheduleTaskReminder(context, 20, 0) // Default 8:00 PM evening task check
        } else {
            cancelTaskReminder(context)
        }
    }

    fun scheduleFocusReminder(context: Context, hour: Int, minute: Int) {
        createNotificationChannel(context)
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return

        val intent = Intent(context, ReminderBroadcastReceiver::class.java).apply {
            action = ACTION_FOCUS_TIME_REMINDER
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            REQUEST_CODE_FOCUS,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val triggerCalendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, hour)
            set(Calendar.MINUTE, minute)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
            if (timeInMillis <= System.currentTimeMillis()) {
                add(Calendar.DAY_OF_YEAR, 1)
            }
        }

        scheduleAlarmCompat(alarmManager, triggerCalendar.timeInMillis, pendingIntent)
    }

    fun cancelFocusReminder(context: Context) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val intent = Intent(context, ReminderBroadcastReceiver::class.java).apply {
            action = ACTION_FOCUS_TIME_REMINDER
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            REQUEST_CODE_FOCUS,
            intent,
            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
        )
        if (pendingIntent != null) {
            alarmManager.cancel(pendingIntent)
            pendingIntent.cancel()
        }
    }

    fun scheduleTaskReminder(context: Context, hour: Int = 20, minute: Int = 0) {
        createNotificationChannel(context)
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return

        val intent = Intent(context, ReminderBroadcastReceiver::class.java).apply {
            action = ACTION_PENDING_TASKS_REMINDER
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            REQUEST_CODE_TASKS,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val triggerCalendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, hour)
            set(Calendar.MINUTE, minute)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
            if (timeInMillis <= System.currentTimeMillis()) {
                add(Calendar.DAY_OF_YEAR, 1)
            }
        }

        scheduleAlarmCompat(alarmManager, triggerCalendar.timeInMillis, pendingIntent)
    }

    fun cancelTaskReminder(context: Context) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val intent = Intent(context, ReminderBroadcastReceiver::class.java).apply {
            action = ACTION_PENDING_TASKS_REMINDER
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            REQUEST_CODE_TASKS,
            intent,
            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
        )
        if (pendingIntent != null) {
            alarmManager.cancel(pendingIntent)
            pendingIntent.cancel()
        }
    }

    private fun scheduleAlarmCompat(alarmManager: AlarmManager, triggerAtMillis: Long, pendingIntent: PendingIntent) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (alarmManager.canScheduleExactAlarms()) {
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
                } else {
                    alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
                }
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
            } else {
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
            }
        } catch (_: SecurityException) {
            // Fallback gracefully without throwing
            alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
        }
    }

    fun showFocusNotification(context: Context) {
        createNotificationChannel(context)
        val contentIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            contentIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("🔥 Scheduled Focus Time is Here!")
            .setContentText("Lock into your JEE study session now. Tap to open the timer and dive into Physics, Chemistry, or Math.")
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText("Lock into your JEE study session now. Your daily Focus Time has begun—open the timer, conquer your chapters, and keep your prep momentum soaring!")
            )
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID_FOCUS, notification)
    }

    fun showPendingTasksNotification(context: Context, pendingCount: Int) {
        createNotificationChannel(context)
        val contentIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            1,
            contentIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val text = if (pendingCount > 0) {
            "You have $pendingCount pending tasks on your JEE checklist today. Complete them before midnight to maintain your streak!"
        } else {
            "All JEE tasks cleared today! Take 15 minutes to review formulas or revise your mistake error book."
        }

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("📋 JEE Daily Tasks Update")
            .setContentText(text)
            .setStyle(NotificationCompat.BigTextStyle().bigText(text))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID_TASKS, notification)
    }

    fun showTestNotification(context: Context, isFocus: Boolean = true) {
        createNotificationChannel(context)
        val contentIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            2,
            contentIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val title = if (isFocus) "⚡ Rankify: Focus Time Test Reminder" else "📋 Rankify: Task Checklist Test"
        val body = if (isFocus) {
            "Local push notifications are fully configured! Your daily JEE Focus Time alarm is set to fire at your chosen hour."
        } else {
            "Your pending task notification is active! You'll receive daily prompts to clear your daily question targets."
        }

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID_TEST, notification)
    }

    fun formatTime12H(hour: Int, minute: Int): String {
        val amPm = if (hour >= 12) "PM" else "AM"
        val hour12 = when {
            hour == 0 -> 12
            hour > 12 -> hour - 12
            else -> hour
        }
        return String.format(Locale.US, "%02d:%02d %s", hour12, minute, amPm)
    }
}
