package com.example.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.local.*
import com.example.data.model.FormulaItem
import com.example.data.model.JEEData
import com.example.data.repository.RankifyRepository
import com.example.notifications.ReminderManager
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.*

enum class NavTab(val title: String) {
    HOME("Home"),
    TRACKER("Tracker"),
    SYLLABUS("IIT Syllabus"),
    FORMULAS("Formulas"),
    TODO("To-Do"),
    TIMER("Timer"),
    TOOLS("Tools"),
    ANALYTICS("Analytics")
}

data class StreakCelebrationData(
    val streak: Int,
    val bestStreak: Int = 0,
    val milestoneTitle: String? = null,
    val motivationalQuote: String = ""
)

enum class ToolsSubTab(val title: String) {
    CALCULATOR("Calculator"),
    ERROR_BOOK("Error Book"),
    BACKLOG("Backlog Manager"),
    EXTRA_SOMETHING("Extra Something"),
    CLOUD_SYNC("Cloud Sync"),
    SETTINGS("Settings & Alerts")
}

class RankifyViewModel(application: Application) : AndroidViewModel(application) {
    private val app: Application = application
    private val database = RankifyDatabase.getDatabase(application)
    val repository = RankifyRepository(database, application)

    // Splash Screen State
    private val _isSplashActive = MutableStateFlow(true)
    val isSplashActive = _isSplashActive.asStateFlow()

    // Navigation State
    private val _currentTab = MutableStateFlow(NavTab.HOME)
    val currentTab = _currentTab.asStateFlow()

    private val _currentToolsSubTab = MutableStateFlow(ToolsSubTab.CALCULATOR)
    val currentToolsSubTab = _currentToolsSubTab.asStateFlow()

    // Real-Time Live Clock State
    private val _liveClockTime = MutableStateFlow("")
    val liveClockTime = _liveClockTime.asStateFlow()

    // Data from Repository
    val chapters = repository.allChapters.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    val todos = repository.allTodos.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    val sessions = repository.allSessions.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    val errorLogs = repository.allErrors.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    val backlogs = repository.allBacklogs.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    val extraFolders = repository.allFolders.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    val extraDocuments = repository.allDocuments.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    val userProfile = repository.userProfile.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)
    val formulas = repository.allFormulas.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    val streakRecords = repository.recentStreakRecords.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Chapter Local Storage Micro-Tracking State (Revision, Notes, DPP, Test)
    private val _chapterTrackingMap = MutableStateFlow<Map<Int, ChapterTrackingState>>(ChapterLocalStorage.loadAllTrackingStates(application))
    val chapterTrackingMap = _chapterTrackingMap.asStateFlow()

    // Streak Details Dialog State
    private val _showStreakDialog = MutableStateFlow(false)
    val showStreakDialog = _showStreakDialog.asStateFlow()

    fun openStreakDialog() {
        _showStreakDialog.value = true
    }

    fun dismissStreakDialog() {
        _showStreakDialog.value = false
    }

    fun updateStreakGoalTarget(target: Int) {
        viewModelScope.launch {
            repository.updateStreakGoalTarget(target)
        }
    }

    fun updateDailyTargetStudyHours(targetHours: Float) {
        viewModelScope.launch {
            repository.updateDailyTargetStudyHours(targetHours)
        }
    }

    // AI Motivational Assistant Popup State
    private val _showAiMotivation = MutableStateFlow(false)
    val showAiMotivation = _showAiMotivation.asStateFlow()

    private val _aiMotivationText = MutableStateFlow("Keep going, if you are consistent your IIT journey will be easy!")
    val aiMotivationText = _aiMotivationText.asStateFlow()

    // Streak increment celebration state (confetti + fire animation)
    private val _streakCelebration = MutableStateFlow<StreakCelebrationData?>(null)
    val streakCelebration = _streakCelebration.asStateFlow()

    // Timer, Pomodoro & Stopwatch State
    private val _clockMode = MutableStateFlow(ClockMode.POMODORO)
    val clockMode = _clockMode.asStateFlow()

    private val _isTimerMode = MutableStateFlow(true) // true = countdown timer, false = count-up stopwatch
    val isTimerMode = _isTimerMode.asStateFlow()

    // Pomodoro Structured Settings & State
    private val _pomodoroSettings = MutableStateFlow(PomodoroPreferences.loadSettings(application))
    val pomodoroSettings = _pomodoroSettings.asStateFlow()

    private val _pomodoroPhase = MutableStateFlow(PomodoroPhase.FOCUS)
    val pomodoroPhase = _pomodoroPhase.asStateFlow()

    private val _pomodoroCycle = MutableStateFlow(1)
    val pomodoroCycle = _pomodoroCycle.asStateFlow()

    private val _completedPomodorosCount = MutableStateFlow(PomodoroPreferences.getCompletedToday(application))
    val completedPomodorosCount = _completedPomodorosCount.asStateFlow()

    private val _pomodoroTargetSeconds = MutableStateFlow(PomodoroPreferences.loadSettings(application).focusMinutes * 60L)
    val pomodoroTargetSeconds = _pomodoroTargetSeconds.asStateFlow()

    private val _pomodoroPhaseCompletedEvent = MutableStateFlow<PomodoroPhaseCompletedEvent?>(null)
    val pomodoroPhaseCompletedEvent = _pomodoroPhaseCompletedEvent.asStateFlow()

    private val _timerDurationPreset = MutableStateFlow(45 * 60L) // default 45 mins
    val timerDurationPreset = _timerDurationPreset.asStateFlow()

    private val _elapsedSeconds = MutableStateFlow(0L)
    val elapsedSeconds = _elapsedSeconds.asStateFlow()

    private val _remainingSeconds = MutableStateFlow(PomodoroPreferences.loadSettings(application).focusMinutes * 60L)
    val remainingSeconds = _remainingSeconds.asStateFlow()

    private val _isClockRunning = MutableStateFlow(false)
    val isClockRunning = _isClockRunning.asStateFlow()

    private var clockJob: Job? = null

    // Session log popup dialog
    private val _showSessionLogDialog = MutableStateFlow(false)
    val showSessionLogDialog = _showSessionLogDialog.asStateFlow()
    private val _completedSessionDuration = MutableStateFlow(0L)
    val completedSessionDuration = _completedSessionDuration.asStateFlow()

    // Calculator State
    private val _calcExpression = MutableStateFlow("")
    val calcExpression = _calcExpression.asStateFlow()
    private val _calcResult = MutableStateFlow("0")
    val calcResult = _calcResult.asStateFlow()

    // Sync notification banner
    private val _syncMessage = MutableStateFlow<String?>(null)
    val syncMessage = _syncMessage.asStateFlow()

    // Settings & Notification Dialog State
    private val _showSettingsDialog = MutableStateFlow(false)
    val showSettingsDialog = _showSettingsDialog.asStateFlow()

    init {
        viewModelScope.launch {
            repository.initializeDataIfEmpty()
        }
        startLiveClock()
        ReminderManager.createNotificationChannel(application)
        val focusHour = ReminderManager.getFocusReminderHour(application)
        val focusMin = ReminderManager.getFocusReminderMinute(application)
        if (ReminderManager.isFocusReminderEnabled(application)) {
            ReminderManager.scheduleFocusReminder(application, focusHour, focusMin)
        }
        if (ReminderManager.isTaskReminderEnabled(application)) {
            ReminderManager.scheduleTaskReminder(application, 20, 0)
        }
    }

    private fun startLiveClock() {
        viewModelScope.launch {
            val formatter = SimpleDateFormat("hh:mm:ss a", Locale.getDefault())
            while (isActive) {
                _liveClockTime.value = formatter.format(Date())
                delay(1000L)
            }
        }
    }

    fun dismissSplash() {
        _isSplashActive.value = false
    }

    fun selectTab(tab: NavTab) {
        _currentTab.value = tab
    }

    fun selectToolsSubTab(subTab: ToolsSubTab) {
        _currentToolsSubTab.value = subTab
    }

    fun navigateToToolsSubTab(subTab: ToolsSubTab) {
        _currentToolsSubTab.value = subTab
        _currentTab.value = NavTab.TOOLS
    }

    fun toggleDarkMode() {
        viewModelScope.launch {
            repository.toggleTheme()
        }
    }

    fun updateUserName(newName: String) {
        viewModelScope.launch {
            val currentDark = userProfile.value?.isDarkMode ?: true
            repository.updateProfile(newName, currentDark)
        }
    }

    // --- SYLLABUS ACTIONS ---
    fun toggleChapterCompletion(chapter: ChapterEntity) {
        viewModelScope.launch {
            repository.setChapterCompletion(chapter.id, !chapter.isCompleted)
        }
    }

    fun incrementChapterRevision(chapterId: Int) {
        val nextCount = ChapterLocalStorage.incrementRevision(app, chapterId)
        _chapterTrackingMap.update { current ->
            val currentState = current[chapterId] ?: ChapterLocalStorage.getTrackingState(app, chapterId)
            current + (chapterId to currentState.copy(revisionCount = nextCount))
        }
    }

    fun resetChapterRevision(chapterId: Int) {
        ChapterLocalStorage.resetRevision(app, chapterId)
        _chapterTrackingMap.update { current ->
            val currentState = current[chapterId] ?: ChapterLocalStorage.getTrackingState(app, chapterId)
            current + (chapterId to currentState.copy(revisionCount = 0))
        }
    }

    fun toggleChapterNotes(chapterId: Int) {
        val nextStatus = ChapterLocalStorage.toggleNotes(app, chapterId)
        _chapterTrackingMap.update { current ->
            val currentState = current[chapterId] ?: ChapterLocalStorage.getTrackingState(app, chapterId)
            current + (chapterId to currentState.copy(notesDone = nextStatus))
        }
    }

    fun toggleChapterDpp(chapterId: Int) {
        val nextStatus = ChapterLocalStorage.toggleDpp(app, chapterId)
        _chapterTrackingMap.update { current ->
            val currentState = current[chapterId] ?: ChapterLocalStorage.getTrackingState(app, chapterId)
            current + (chapterId to currentState.copy(dppDone = nextStatus))
        }
    }

    fun toggleChapterTest(chapterId: Int) {
        val nextStatus = ChapterLocalStorage.toggleTest(app, chapterId)
        _chapterTrackingMap.update { current ->
            val currentState = current[chapterId] ?: ChapterLocalStorage.getTrackingState(app, chapterId)
            current + (chapterId to currentState.copy(testDone = nextStatus))
        }
    }

    // --- TODO ACTIONS ---
    fun addTodo(title: String, subject: String, priority: String) {
        viewModelScope.launch {
            repository.addTodo(title, subject, priority)
        }
    }

    fun toggleTodo(todo: TodoEntity) {
        viewModelScope.launch {
            val result = repository.toggleTodo(todo)
            if (result.streakIncremented) {
                // Streak incremented after meeting today's study goals! Trigger fire & confetti celebration
                val profile = repository.userProfile.firstOrNull()
                val best = maxOf(profile?.bestStreak ?: result.newStreak, result.newStreak)
                val tier = com.example.streak.StreakManager.getStreakTier(result.newStreak)
                val quote = com.example.streak.StreakManager.getMotivationalQuote(result.newStreak)
                _streakCelebration.value = StreakCelebrationData(
                    streak = result.newStreak,
                    bestStreak = best,
                    milestoneTitle = if (tier.minDays == result.newStreak) tier.title else null,
                    motivationalQuote = quote
                )
            } else if (result.isCompleted) {
                // Trigger AI Character popup with exact speech requested by user!
                _aiMotivationText.value = "Keep going, if you are consistent your IIT journey will be easy!"
                _showAiMotivation.value = true
            }
        }
    }

    fun dismissStreakCelebration() {
        _streakCelebration.value = null
    }

    fun dismissAiMotivation() {
        _showAiMotivation.value = false
    }

    fun deleteTodo(id: Long) {
        viewModelScope.launch {
            repository.deleteTodo(id)
        }
    }

    fun clearCompletedTodos() {
        viewModelScope.launch {
            repository.clearCompletedTodos()
        }
    }

    fun applyRoutineTemplate(templateIndex: Int) {
        viewModelScope.launch {
            val template = JEEData.routineTemplates.getOrNull(templateIndex) ?: return@launch
            repository.applyRoutineTemplate(template.title, template.tasks)
        }
    }

    // --- FORMULA ACTIONS ---
    fun addFormula(
        title: String,
        subject: String,
        chapter: String,
        formulaText: String,
        textColorHex: String,
        isDrawing: Boolean,
        drawingData: String
    ) {
        viewModelScope.launch {
            repository.addFormula(
                title = title,
                subject = subject,
                chapter = chapter,
                formulaText = formulaText,
                textColorHex = textColorHex,
                isDrawing = isDrawing,
                drawingData = drawingData
            )
        }
    }

    fun deleteFormula(id: Long) {
        viewModelScope.launch {
            repository.deleteFormula(id)
        }
    }

    // --- TIMER, POMODORO & STOPWATCH ACTIONS ---
    fun setClockMode(mode: ClockMode) {
        pauseClock()
        _clockMode.value = mode
        _isTimerMode.value = (mode != ClockMode.STOPWATCH)
        when (mode) {
            ClockMode.TIMER -> {
                _remainingSeconds.value = _timerDurationPreset.value
            }
            ClockMode.POMODORO -> {
                val target = when (_pomodoroPhase.value) {
                    PomodoroPhase.FOCUS -> _pomodoroSettings.value.focusMinutes * 60L
                    PomodoroPhase.SHORT_BREAK -> _pomodoroSettings.value.shortBreakMinutes * 60L
                    PomodoroPhase.LONG_BREAK -> _pomodoroSettings.value.longBreakMinutes * 60L
                }
                _pomodoroTargetSeconds.value = target
                _remainingSeconds.value = target
            }
            ClockMode.STOPWATCH -> {
                _elapsedSeconds.value = 0L
            }
        }
    }

    fun setTimerMode(isTimer: Boolean) {
        if (isTimer) {
            setClockMode(ClockMode.TIMER)
        } else {
            setClockMode(ClockMode.STOPWATCH)
        }
    }

    fun setTimerPreset(minutes: Int) {
        val seconds = minutes * 60L
        _timerDurationPreset.value = seconds
        _remainingSeconds.value = seconds
        pauseClock()
    }

    fun updatePomodoroSettings(newSettings: PomodoroSettings) {
        _pomodoroSettings.value = newSettings
        PomodoroPreferences.saveSettings(app, newSettings)
        if (!_isClockRunning.value && _clockMode.value == ClockMode.POMODORO) {
            val target = when (_pomodoroPhase.value) {
                PomodoroPhase.FOCUS -> newSettings.focusMinutes * 60L
                PomodoroPhase.SHORT_BREAK -> newSettings.shortBreakMinutes * 60L
                PomodoroPhase.LONG_BREAK -> newSettings.longBreakMinutes * 60L
            }
            _pomodoroTargetSeconds.value = target
            _remainingSeconds.value = target
        }
    }

    fun selectPomodoroPhase(phase: PomodoroPhase) {
        pauseClock()
        _pomodoroPhase.value = phase
        val target = when (phase) {
            PomodoroPhase.FOCUS -> _pomodoroSettings.value.focusMinutes * 60L
            PomodoroPhase.SHORT_BREAK -> _pomodoroSettings.value.shortBreakMinutes * 60L
            PomodoroPhase.LONG_BREAK -> _pomodoroSettings.value.longBreakMinutes * 60L
        }
        _pomodoroTargetSeconds.value = target
        _remainingSeconds.value = target
    }

    fun skipToNextPomodoroPhase() {
        pauseClock()
        val settings = _pomodoroSettings.value
        val currentPhase = _pomodoroPhase.value
        val currentCycle = _pomodoroCycle.value
        val totalCycles = settings.cyclesBeforeLongBreak

        when (currentPhase) {
            PomodoroPhase.FOCUS -> {
                val isLongBreak = (currentCycle % totalCycles == 0)
                val nextPhase = if (isLongBreak) PomodoroPhase.LONG_BREAK else PomodoroPhase.SHORT_BREAK
                val nextTarget = (if (isLongBreak) settings.longBreakMinutes else settings.shortBreakMinutes) * 60L
                _pomodoroPhase.value = nextPhase
                _pomodoroTargetSeconds.value = nextTarget
                _remainingSeconds.value = nextTarget
            }
            PomodoroPhase.SHORT_BREAK -> {
                _pomodoroCycle.value = currentCycle + 1
                _pomodoroPhase.value = PomodoroPhase.FOCUS
                val nextTarget = settings.focusMinutes * 60L
                _pomodoroTargetSeconds.value = nextTarget
                _remainingSeconds.value = nextTarget
            }
            PomodoroPhase.LONG_BREAK -> {
                _pomodoroCycle.value = 1
                _pomodoroPhase.value = PomodoroPhase.FOCUS
                val nextTarget = settings.focusMinutes * 60L
                _pomodoroTargetSeconds.value = nextTarget
                _remainingSeconds.value = nextTarget
            }
        }
    }

    fun dismissPomodoroPhaseEvent() {
        _pomodoroPhaseCompletedEvent.value = null
    }

    fun startNextPomodoroPhase() {
        dismissPomodoroPhaseEvent()
        startClock()
    }

    private fun handlePomodoroPhaseCompleted() {
        val settings = _pomodoroSettings.value
        val currentPhase = _pomodoroPhase.value
        val currentCycleNum = _pomodoroCycle.value
        val totalCycles = settings.cyclesBeforeLongBreak

        when (currentPhase) {
            PomodoroPhase.FOCUS -> {
                val newCount = PomodoroPreferences.incrementCompletedToday(app)
                _completedPomodorosCount.value = newCount
                val focusDuration = _pomodoroTargetSeconds.value
                _completedSessionDuration.value = focusDuration

                // Auto-record focus block to study sessions
                viewModelScope.launch {
                    repository.addStudySession(
                        durationSeconds = focusDuration,
                        category = "Pomodoro Focus",
                        subject = "Physics",
                        notes = "Completed Pomodoro block #$currentCycleNum"
                    )
                }

                val isLongBreak = (currentCycleNum % totalCycles == 0)
                val nextPhase = if (isLongBreak) PomodoroPhase.LONG_BREAK else PomodoroPhase.SHORT_BREAK
                val nextDurationMinutes = if (isLongBreak) settings.longBreakMinutes else settings.shortBreakMinutes

                _pomodoroPhaseCompletedEvent.value = PomodoroPhaseCompletedEvent(
                    completedPhase = PomodoroPhase.FOCUS,
                    nextPhase = nextPhase,
                    cycleNumber = currentCycleNum,
                    totalCyclesInSet = totalCycles,
                    durationSeconds = focusDuration
                )

                _pomodoroPhase.value = nextPhase
                val nextSeconds = nextDurationMinutes * 60L
                _pomodoroTargetSeconds.value = nextSeconds
                _remainingSeconds.value = nextSeconds

                if (settings.autoStartNextPhase) {
                    startClock()
                } else {
                    _isClockRunning.value = false
                }
            }
            PomodoroPhase.SHORT_BREAK, PomodoroPhase.LONG_BREAK -> {
                val nextCycleNum = if (currentPhase == PomodoroPhase.LONG_BREAK) 1 else (currentCycleNum + 1)
                _pomodoroCycle.value = nextCycleNum
                val nextPhase = PomodoroPhase.FOCUS
                val duration = _pomodoroTargetSeconds.value

                _pomodoroPhaseCompletedEvent.value = PomodoroPhaseCompletedEvent(
                    completedPhase = currentPhase,
                    nextPhase = nextPhase,
                    cycleNumber = nextCycleNum,
                    totalCyclesInSet = totalCycles,
                    durationSeconds = duration
                )

                _pomodoroPhase.value = nextPhase
                val nextSeconds = settings.focusMinutes * 60L
                _pomodoroTargetSeconds.value = nextSeconds
                _remainingSeconds.value = nextSeconds

                if (settings.autoStartNextPhase) {
                    startClock()
                } else {
                    _isClockRunning.value = false
                }
            }
        }
    }

    fun startClock() {
        if (_isClockRunning.value) return
        _isClockRunning.value = true
        clockJob = viewModelScope.launch {
            while (_isClockRunning.value) {
                delay(1000L)
                when (_clockMode.value) {
                    ClockMode.TIMER -> {
                        if (_remainingSeconds.value > 0) {
                            _remainingSeconds.value -= 1
                        } else {
                            _isClockRunning.value = false
                            _completedSessionDuration.value = _timerDurationPreset.value
                            _showSessionLogDialog.value = true
                            break
                        }
                    }
                    ClockMode.POMODORO -> {
                        if (_remainingSeconds.value > 0) {
                            _remainingSeconds.value -= 1
                        } else {
                            handlePomodoroPhaseCompleted()
                            break
                        }
                    }
                    ClockMode.STOPWATCH -> {
                        _elapsedSeconds.value += 1
                    }
                }
            }
        }
    }

    fun pauseClock() {
        _isClockRunning.value = false
        clockJob?.cancel()
    }

    fun resetClock() {
        pauseClock()
        when (_clockMode.value) {
            ClockMode.TIMER -> {
                _remainingSeconds.value = _timerDurationPreset.value
            }
            ClockMode.POMODORO -> {
                val target = when (_pomodoroPhase.value) {
                    PomodoroPhase.FOCUS -> _pomodoroSettings.value.focusMinutes * 60L
                    PomodoroPhase.SHORT_BREAK -> _pomodoroSettings.value.shortBreakMinutes * 60L
                    PomodoroPhase.LONG_BREAK -> _pomodoroSettings.value.longBreakMinutes * 60L
                }
                _pomodoroTargetSeconds.value = target
                _remainingSeconds.value = target
            }
            ClockMode.STOPWATCH -> {
                _elapsedSeconds.value = 0L
            }
        }
    }

    fun finishAndLogSession() {
        pauseClock()
        val duration = when (_clockMode.value) {
            ClockMode.TIMER -> _timerDurationPreset.value - _remainingSeconds.value
            ClockMode.POMODORO -> _pomodoroTargetSeconds.value - _remainingSeconds.value
            ClockMode.STOPWATCH -> _elapsedSeconds.value
        }
        if (duration > 5L) {
            _completedSessionDuration.value = duration
            _showSessionLogDialog.value = true
        }
        resetClock()
    }

    fun saveSessionLog(category: String, subject: String, notes: String) {
        viewModelScope.launch {
            repository.addStudySession(_completedSessionDuration.value, category, subject, notes)
            _showSessionLogDialog.value = false
        }
    }

    fun addQuickStudySession(durationSeconds: Long, subject: String, category: String = "Self-Study", notes: String = "") {
        viewModelScope.launch {
            val finalNotes = if (notes.isBlank()) "$category on $subject" else notes
            repository.addStudySession(durationSeconds, category, subject, finalNotes)
        }
    }

    fun dismissSessionLogDialog() {
        _showSessionLogDialog.value = false
    }

    fun deleteSession(id: Long) {
        viewModelScope.launch {
            repository.deleteStudySession(id)
        }
    }

    // --- CALCULATOR ACTIONS ---
    fun onCalcInput(input: String) {
        when (input) {
            "C" -> {
                _calcExpression.value = ""
                _calcResult.value = "0"
            }
            "DEL" -> {
                if (_calcExpression.value.isNotEmpty()) {
                    _calcExpression.value = _calcExpression.value.dropLast(1)
                }
            }
            "=" -> {
                evaluateCalc()
            }
            "sin", "cos", "tan", "log", "ln", "√" -> {
                _calcExpression.value += "$input("
            }
            "π" -> _calcExpression.value += "3.14159"
            "e" -> _calcExpression.value += "2.71828"
            else -> {
                _calcExpression.value += input
            }
        }
    }

    private fun evaluateCalc() {
        val expr = _calcExpression.value
        if (expr.isBlank()) return
        try {
            val res = evaluateMath(expr)
            _calcResult.value = if (res % 1.0 == 0.0) {
                res.toLong().toString()
            } else {
                String.format(Locale.US, "%.4f", res).trimEnd('0').trimEnd('.')
            }
        } catch (e: Exception) {
            _calcResult.value = "Error"
        }
    }

    private fun evaluateMath(expression: String): Double {
        val clean = expression.replace("×", "*").replace("÷", "/")
        return ExpressionParser(clean).parse()
    }

    // --- ERROR BOOK ACTIONS ---
    fun addErrorLog(title: String, subject: String, chapter: String, mistakeType: String, question: String, solution: String) {
        viewModelScope.launch {
            repository.addErrorLog(title, subject, chapter, mistakeType, question, solution)
        }
    }

    fun toggleErrorResolved(error: ErrorLogEntity) {
        viewModelScope.launch {
            repository.toggleErrorResolved(error)
        }
    }

    fun deleteError(id: Long) {
        viewModelScope.launch {
            repository.deleteError(id)
        }
    }

    // --- BACKLOG ACTIONS ---
    fun addBacklog(title: String, subject: String, targetDate: String, urgency: String) {
        viewModelScope.launch {
            repository.addBacklog(title, subject, targetDate, urgency)
        }
    }

    fun toggleBacklog(backlog: BacklogEntity) {
        viewModelScope.launch {
            repository.toggleBacklog(backlog)
        }
    }

    fun deleteBacklog(id: Long) {
        viewModelScope.launch {
            repository.deleteBacklog(id)
        }
    }

    // --- EXTRA SOMETHING ACTIONS ---
    fun createExtraFolder(name: String) {
        viewModelScope.launch {
            repository.createFolder(name)
        }
    }

    fun deleteExtraFolder(id: Long) {
        viewModelScope.launch {
            repository.deleteFolder(id)
        }
    }

    fun addExtraDocument(folderId: Long, fileName: String, description: String, fileType: String, preview: String) {
        viewModelScope.launch {
            repository.addDocument(folderId, fileName, description, fileType, preview)
        }
    }

    fun deleteExtraDocument(id: Long) {
        viewModelScope.launch {
            repository.deleteDocument(id)
        }
    }

    // --- CLOUD SYNC ACTIONS ---
    fun triggerCloudSync() {
        viewModelScope.launch {
            val syncTime = repository.performCloudSync()
            val timeStr = SimpleDateFormat("hh:mm a", Locale.getDefault()).format(Date(syncTime))
            _syncMessage.value = "All progress & notes synced safely to cloud at $timeStr!"
            delay(3000L)
            _syncMessage.value = null
        }
    }

    // --- SETTINGS & NOTIFICATION ACTIONS ---
    fun openSettingsDialog() {
        _showSettingsDialog.value = true
    }

    fun dismissSettingsDialog() {
        _showSettingsDialog.value = false
    }

    fun saveFocusSettings(hour: Int, minute: Int, enabled: Boolean) {
        ReminderManager.saveFocusSettings(getApplication(), hour, minute, enabled)
        viewModelScope.launch {
            repository.updateFocusSettings(hour, minute, enabled)
        }
    }

    fun saveTaskReminderSetting(enabled: Boolean) {
        ReminderManager.saveTaskReminderSetting(getApplication(), enabled)
        viewModelScope.launch {
            repository.updateTaskReminderSetting(enabled)
        }
    }

    fun triggerTestNotification(isFocus: Boolean) {
        ReminderManager.showTestNotification(getApplication(), isFocus)
    }
}

private class ExpressionParser(private val input: String) {
    private var pos = 0

    fun parse(): Double {
        return parseExpression()
    }

    private fun peek(): Char = if (pos < input.length) input[pos] else '\u0000'
    private fun get(): Char = if (pos < input.length) input[pos++] else '\u0000'
    private fun skipWhitespace() {
        while (pos < input.length && input[pos].isWhitespace()) pos++
    }

    // Expression = Term { ('+' | '-') Term }
    private fun parseExpression(): Double {
        skipWhitespace()
        var value = parseTerm()
        while (true) {
            skipWhitespace()
            when (peek()) {
                '+' -> { get(); value += parseTerm() }
                '-' -> { get(); value -= parseTerm() }
                else -> return value
            }
        }
    }

    // Term = Factor { ('*' | '/') Factor }
    private fun parseTerm(): Double {
        skipWhitespace()
        var value = parseFactor()
        while (true) {
            skipWhitespace()
            when (peek()) {
                '*' -> { get(); value *= parseFactor() }
                '/' -> {
                    get()
                    val divisor = parseFactor()
                    if (divisor == 0.0) return Double.NaN
                    value /= divisor
                }
                else -> return value
            }
        }
    }

    // Factor = Primary [ '^' Factor ]
    private fun parseFactor(): Double {
        skipWhitespace()
        val base = parsePrimary()
        skipWhitespace()
        if (peek() == '^') {
            get()
            val exponent = parseFactor()
            return base.pow(exponent)
        }
        return base
    }

    // Primary = ['+'|'-'] ( Number | '(' Expression ')' | Function '(' Expression ')' )
    private fun parsePrimary(): Double {
        skipWhitespace()
        if (peek() == '+') {
            get()
            return parsePrimary()
        }
        if (peek() == '-') {
            get()
            return -parsePrimary()
        }
        if (peek() == '(') {
            get() // consume '('
            val value = parseExpression()
            skipWhitespace()
            if (peek() == ')') get()
            return value
        }

        // Functions: sin, cos, tan, log, ln, √
        val functions = listOf("sin", "cos", "tan", "log", "ln", "√")
        for (func in functions) {
            if (input.startsWith(func, pos)) {
                pos += func.length
                skipWhitespace()
                val arg = if (peek() == '(') {
                    get()
                    val v = parseExpression()
                    skipWhitespace()
                    if (peek() == ')') get()
                    v
                } else {
                    parsePrimary()
                }
                return when (func) {
                    "sin" -> sin(Math.toRadians(arg))
                    "cos" -> cos(Math.toRadians(arg))
                    "tan" -> tan(Math.toRadians(arg))
                    "log" -> log10(arg)
                    "ln" -> ln(arg)
                    "√" -> sqrt(arg)
                    else -> arg
                }
            }
        }

        // Number
        val start = pos
        while (pos < input.length && (input[pos].isDigit() || input[pos] == '.')) {
            pos++
        }
        if (pos > start) {
            val numStr = input.substring(start, pos)
            return numStr.toDoubleOrNull() ?: 0.0
        }

        return 0.0
    }
}
