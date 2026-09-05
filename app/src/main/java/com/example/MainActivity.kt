package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ui.components.AiMotivationalDialog
import com.example.ui.components.RankifyBottomBar
import com.example.ui.components.RankifyHeader
import com.example.ui.components.SettingsDialog
import com.example.ui.components.StreakCelebrationOverlay
import com.example.ui.components.StreakDetailsDialog
import com.example.streak.StreakManager
import com.example.ui.screens.*
import com.example.ui.theme.RankifyTheme
import com.example.viewmodel.NavTab
import com.example.viewmodel.RankifyViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            val viewModel: RankifyViewModel = viewModel()

            val userProfile by viewModel.userProfile.collectAsStateWithLifecycle()
            val isDarkMode = userProfile?.isDarkMode ?: true
            val isSplashActive by viewModel.isSplashActive.collectAsStateWithLifecycle()
            val currentTab by viewModel.currentTab.collectAsStateWithLifecycle()
            val liveClockTime by viewModel.liveClockTime.collectAsStateWithLifecycle()

            val chapters by viewModel.chapters.collectAsStateWithLifecycle()
            val chapterTrackingMap by viewModel.chapterTrackingMap.collectAsStateWithLifecycle()
            val todos by viewModel.todos.collectAsStateWithLifecycle()
            val sessions by viewModel.sessions.collectAsStateWithLifecycle()
            val errorLogs by viewModel.errorLogs.collectAsStateWithLifecycle()
            val backlogs by viewModel.backlogs.collectAsStateWithLifecycle()
            val folders by viewModel.extraFolders.collectAsStateWithLifecycle()
            val documents by viewModel.extraDocuments.collectAsStateWithLifecycle()
            val streakRecords by viewModel.streakRecords.collectAsStateWithLifecycle()
            val showStreakDialog by viewModel.showStreakDialog.collectAsStateWithLifecycle()

            val showAiPopup by viewModel.showAiMotivation.collectAsStateWithLifecycle()
            val aiMessage by viewModel.aiMotivationText.collectAsStateWithLifecycle()
            val streakCelebration by viewModel.streakCelebration.collectAsStateWithLifecycle()

            // Timer, Pomodoro & Tools state
            val clockMode by viewModel.clockMode.collectAsStateWithLifecycle()
            val pomodoroSettings by viewModel.pomodoroSettings.collectAsStateWithLifecycle()
            val pomodoroPhase by viewModel.pomodoroPhase.collectAsStateWithLifecycle()
            val pomodoroCycle by viewModel.pomodoroCycle.collectAsStateWithLifecycle()
            val completedPomodorosCount by viewModel.completedPomodorosCount.collectAsStateWithLifecycle()
            val pomodoroPhaseCompletedEvent by viewModel.pomodoroPhaseCompletedEvent.collectAsStateWithLifecycle()
            val isTimerMode by viewModel.isTimerMode.collectAsStateWithLifecycle()
            val isClockRunning by viewModel.isClockRunning.collectAsStateWithLifecycle()
            val remainingSeconds by viewModel.remainingSeconds.collectAsStateWithLifecycle()
            val elapsedSeconds by viewModel.elapsedSeconds.collectAsStateWithLifecycle()
            val timerPresetSeconds by viewModel.timerDurationPreset.collectAsStateWithLifecycle()
            val showSessionLogDialog by viewModel.showSessionLogDialog.collectAsStateWithLifecycle()
            val completedSessionDuration by viewModel.completedSessionDuration.collectAsStateWithLifecycle()

            val currentToolsSubTab by viewModel.currentToolsSubTab.collectAsStateWithLifecycle()
            val calcExpression by viewModel.calcExpression.collectAsStateWithLifecycle()
            val calcResult by viewModel.calcResult.collectAsStateWithLifecycle()
            val syncMessage by viewModel.syncMessage.collectAsStateWithLifecycle()
            val formulas by viewModel.formulas.collectAsStateWithLifecycle()
            val showSettingsDialog by viewModel.showSettingsDialog.collectAsStateWithLifecycle()

            RankifyTheme(darkTheme = isDarkMode) {
                if (isSplashActive) {
                    SplashScreen(
                        onFinish = { viewModel.dismissSplash() }
                    )
                } else {
                    val pendingTodoCount = todos.count { !it.isCompleted }

                    Scaffold(
                        modifier = Modifier.fillMaxSize(),
                        topBar = {
                            RankifyHeader(
                                userName = userProfile?.userName ?: "Arjun Sharma",
                                liveClockTime = liveClockTime,
                                isDarkMode = isDarkMode,
                                streak = userProfile?.currentStreak ?: 0,
                                isTodayGoalMet = StreakManager.isTodayGoalMet(userProfile?.lastFullCompletionDate ?: ""),
                                onOpenStreak = { viewModel.openStreakDialog() },
                                onToggleTheme = { viewModel.toggleDarkMode() },
                                onUpdateName = { viewModel.updateUserName(it) },
                                onOpenSettings = { viewModel.openSettingsDialog() },
                                modifier = Modifier.statusBarsPadding()
                            )
                        },
                        bottomBar = {
                            RankifyBottomBar(
                                currentTab = currentTab,
                                onTabSelected = { viewModel.selectTab(it) },
                                pendingTodoCount = pendingTodoCount
                            )
                        }
                    ) { innerPadding ->
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(innerPadding)
                        ) {
                            AnimatedContent(
                                targetState = currentTab,
                                transitionSpec = {
                                    fadeIn() togetherWith fadeOut()
                                },
                                label = "tab_navigation"
                            ) { tab ->
                                when (tab) {
                                    NavTab.HOME -> HomeScreen(
                                        profile = userProfile,
                                        chapters = chapters,
                                        todos = todos,
                                        sessions = sessions,
                                        onNavigate = { viewModel.selectTab(it) },
                                        onNavigateToTool = { viewModel.navigateToToolsSubTab(it) },
                                        onToggleTodo = { viewModel.toggleTodo(it) },
                                        onOpenStreakDetails = { viewModel.openStreakDialog() }
                                    )
                                    NavTab.TRACKER -> TrackerScreen(
                                        chapters = chapters
                                    )
                                    NavTab.SYLLABUS -> SyllabusScreen(
                                        chapters = chapters,
                                        trackingStateMap = chapterTrackingMap,
                                        onToggleChapter = { viewModel.toggleChapterCompletion(it) },
                                        onIncrementRevision = { viewModel.incrementChapterRevision(it) },
                                        onResetRevision = { viewModel.resetChapterRevision(it) },
                                        onToggleNotes = { viewModel.toggleChapterNotes(it) },
                                        onToggleDpp = { viewModel.toggleChapterDpp(it) },
                                        onToggleTest = { viewModel.toggleChapterTest(it) }
                                    )
                                    NavTab.FORMULAS -> FormulasScreen(
                                        formulas = formulas,
                                        onAddFormula = { title, subject, chapter, formulaText, textColorHex, isDrawing, drawingData ->
                                            viewModel.addFormula(
                                                title = title,
                                                subject = subject,
                                                chapter = chapter,
                                                formulaText = formulaText,
                                                textColorHex = textColorHex,
                                                isDrawing = isDrawing,
                                                drawingData = drawingData
                                            )
                                        },
                                        onDeleteFormula = { viewModel.deleteFormula(it) }
                                    )
                                    NavTab.TODO -> TodoScreen(
                                        todos = todos,
                                        profile = userProfile,
                                        streakRecords = streakRecords,
                                        onOpenStreakDetails = { viewModel.openStreakDialog() },
                                        onToggleTodo = { viewModel.toggleTodo(it) },
                                        onAddTodo = { title, subject, priority ->
                                            viewModel.addTodo(title, subject, priority)
                                        },
                                        onDeleteTodo = { viewModel.deleteTodo(it) },
                                        onClearCompleted = { viewModel.clearCompletedTodos() },
                                        onApplyTemplate = { viewModel.applyRoutineTemplate(it) }
                                    )
                                    NavTab.TIMER -> TimerScreen(
                                        clockMode = clockMode,
                                        isClockRunning = isClockRunning,
                                        remainingSeconds = remainingSeconds,
                                        elapsedSeconds = elapsedSeconds,
                                        timerPresetSeconds = timerPresetSeconds,
                                        sessions = sessions,
                                        showLogDialog = showSessionLogDialog,
                                        completedDuration = completedSessionDuration,
                                        pomodoroSettings = pomodoroSettings,
                                        pomodoroPhase = pomodoroPhase,
                                        pomodoroCycle = pomodoroCycle,
                                        completedPomodorosCount = completedPomodorosCount,
                                        pomodoroPhaseCompletedEvent = pomodoroPhaseCompletedEvent,
                                        onSetClockMode = { viewModel.setClockMode(it) },
                                        onUpdatePomodoroSettings = { viewModel.updatePomodoroSettings(it) },
                                        onSelectPomodoroPhase = { viewModel.selectPomodoroPhase(it) },
                                        onSkipPomodoroPhase = { viewModel.skipToNextPomodoroPhase() },
                                        onDismissPomodoroPhaseEvent = { viewModel.dismissPomodoroPhaseEvent() },
                                        onStartNextPomodoroPhase = { viewModel.startNextPomodoroPhase() },
                                        isTimerMode = isTimerMode,
                                        onSetTimerMode = { viewModel.setTimerMode(it) },
                                        onSetPresetMinutes = { viewModel.setTimerPreset(it) },
                                        onStartClock = { viewModel.startClock() },
                                        onPauseClock = { viewModel.pauseClock() },
                                        onResetClock = { viewModel.resetClock() },
                                        onFinishSession = { viewModel.finishAndLogSession() },
                                        onSaveSessionLog = { category, subject, notes ->
                                            viewModel.saveSessionLog(category, subject, notes)
                                        },
                                        onDismissLogDialog = { viewModel.dismissSessionLogDialog() },
                                        onDeleteSession = { viewModel.deleteSession(it) }
                                    )
                                    NavTab.TOOLS -> ToolsScreen(
                                        currentSubTab = currentToolsSubTab,
                                        onSelectSubTab = { viewModel.selectToolsSubTab(it) },
                                        calcExpression = calcExpression,
                                        calcResult = calcResult,
                                        onCalcInput = { viewModel.onCalcInput(it) },
                                        errorLogs = errorLogs,
                                        onAddError = { title, subject, chapter, mistakeType, qNotes, sNotes ->
                                            viewModel.addErrorLog(title, subject, chapter, mistakeType, qNotes, sNotes)
                                        },
                                        onToggleErrorResolved = { viewModel.toggleErrorResolved(it) },
                                        onDeleteError = { viewModel.deleteError(it) },
                                        backlogs = backlogs,
                                        onAddBacklog = { title, subject, targetDate, urgency ->
                                            viewModel.addBacklog(title, subject, targetDate, urgency)
                                        },
                                        onToggleBacklog = { viewModel.toggleBacklog(it) },
                                        onDeleteBacklog = { viewModel.deleteBacklog(it) },
                                        folders = folders,
                                        documents = documents,
                                        onCreateFolder = { viewModel.createExtraFolder(it) },
                                        onDeleteFolder = { viewModel.deleteExtraFolder(it) },
                                        onAddDocument = { folderId, fileName, desc, type, preview ->
                                            viewModel.addExtraDocument(folderId, fileName, desc, type, preview)
                                        },
                                        onDeleteDocument = { viewModel.deleteExtraDocument(it) },
                                        profile = userProfile,
                                        syncMessage = syncMessage,
                                        onTriggerCloudSync = { viewModel.triggerCloudSync() },
                                        pendingTaskCount = pendingTodoCount,
                                        onSaveFocusSettings = { h, m, en -> viewModel.saveFocusSettings(h, m, en) },
                                        onSaveTaskReminderSetting = { en -> viewModel.saveTaskReminderSetting(en) },
                                        onTriggerTestNotification = { isFocus -> viewModel.triggerTestNotification(isFocus) }
                                    )
                                    NavTab.ANALYTICS -> AnalyticsScreen(
                                        chapters = chapters,
                                        sessions = sessions,
                                        todos = todos,
                                        errors = errorLogs,
                                        userProfile = userProfile,
                                        onToggleChapter = { viewModel.toggleChapterCompletion(it) },
                                        onQuickLogSession = { dur, subj, cat, notes ->
                                            viewModel.addQuickStudySession(dur, subj, cat, notes)
                                        },
                                        onUpdateDailyTargetStudyHours = { targetHours ->
                                            viewModel.updateDailyTargetStudyHours(targetHours)
                                        }
                                    )
                                }
                            }

                            // Settings & Notifications Dialog
                            if (showSettingsDialog) {
                                SettingsDialog(
                                    profile = userProfile,
                                    pendingTaskCount = pendingTodoCount,
                                    onDismiss = { viewModel.dismissSettingsDialog() },
                                    onSaveFocusSettings = { h, m, en -> viewModel.saveFocusSettings(h, m, en) },
                                    onSaveTaskReminderSetting = { en -> viewModel.saveTaskReminderSetting(en) },
                                    onTriggerTestNotification = { isFocus -> viewModel.triggerTestNotification(isFocus) }
                                )
                            }

                            // Comprehensive To-Do Streak Details & Goals Dialog
                            if (showStreakDialog) {
                                StreakDetailsDialog(
                                    profile = userProfile,
                                    streakRecords = streakRecords,
                                    onUpdateTarget = { viewModel.updateStreakGoalTarget(it) },
                                    onDismiss = { viewModel.dismissStreakDialog() }
                                )
                            }

                            // AI Motivational popup character (Triggered when user ticks off a task)
                            if (showAiPopup && streakCelebration == null) {
                                AiMotivationalDialog(
                                    message = aiMessage,
                                    onDismiss = { viewModel.dismissAiMotivation() }
                                )
                            }

                            // Confetti & Fire Effect Animation (Triggered specifically when daily To-Do streak increments after study goals completed)
                            streakCelebration?.let { celebration ->
                                StreakCelebrationOverlay(
                                    streakCount = celebration.streak,
                                    bestStreak = celebration.bestStreak,
                                    milestoneTitle = celebration.milestoneTitle,
                                    motivationalQuote = celebration.motivationalQuote,
                                    onDismiss = { viewModel.dismissStreakCelebration() }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
