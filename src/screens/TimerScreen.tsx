import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Timer as TimerIcon, 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Save, 
  Clock, 
  CheckCircle2, 
  Volume2, 
  Trash2,
  X,
  Settings
} from 'lucide-react';

type TimerMode = 'pomodoro' | 'stopwatch';
type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak';

export const TimerScreen: React.FC = () => {
  const { sessions, logSession, deleteSession } = useApp();

  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [isRunning, setIsRunning] = useState(false);

  // Configurable Pomodoro intervals (in minutes)
  const [workDurationMins, setWorkDurationMins] = useState(25);
  const [shortBreakMins, setShortBreakMins] = useState(5);
  const [longBreakMins, setLongBreakMins] = useState(15);
  const [cyclesBeforeLongBreak, setCyclesBeforeLongBreak] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);

  // Current Phase
  const [currentPhase, setCurrentPhase] = useState<PomodoroPhase>('work');
  const [secondsRemaining, setSecondsRemaining] = useState(workDurationMins * 60);

  // Stopwatch state
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);

  // Settings drawer
  const [showSettings, setShowSettings] = useState(false);

  // Log session modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [sessionSubject, setSessionSubject] = useState('Physics');
  const [sessionCategory, setSessionCategory] = useState('Problem Practice');
  const [sessionNotes, setSessionNotes] = useState('');
  const [lastCompletedDuration, setLastCompletedDuration] = useState(0);

  // Web Audio Synth chime
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  // Timer Tick
  const lastTickTime = useRef<number>(0);

  useEffect(() => {
    let interval: any = null;

    if (isRunning) {
      lastTickTime.current = Date.now();
      // Run interval more frequently (500ms) to ensure smooth UI updates and quick catch-up when returning to tab
      interval = setInterval(() => {
        const now = Date.now();
        const deltaSecs = Math.floor((now - lastTickTime.current) / 1000);
        
        if (deltaSecs >= 1) {
          lastTickTime.current += deltaSecs * 1000;
          
          if (mode === 'pomodoro') {
            setSecondsRemaining((prev) => {
              const next = Math.max(0, prev - deltaSecs);
              return next;
            });
          } else {
            setStopwatchSeconds((prev) => prev + deltaSecs);
          }
        }
      }, 500);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRunning, mode]);

  // Handle phase end separately to avoid side-effects inside state updaters
  useEffect(() => {
    if (isRunning && mode === 'pomodoro' && secondsRemaining === 0) {
      playChime();
      handlePhaseEnd();
    }
  }, [secondsRemaining, isRunning, mode, currentPhase, completedCycles, workDurationMins, shortBreakMins, longBreakMins]);

  const handlePhaseEnd = () => {
    setIsRunning(false);
    if (currentPhase === 'work') {
      const newCycles = completedCycles + 1;
      setCompletedCycles(newCycles);
      setLastCompletedDuration(workDurationMins * 60);

      // Trigger session log prompt
      setShowLogModal(true);

      if (newCycles % cyclesBeforeLongBreak === 0) {
        setCurrentPhase('longBreak');
        setSecondsRemaining(longBreakMins * 60);
      } else {
        setCurrentPhase('shortBreak');
        setSecondsRemaining(shortBreakMins * 60);
      }
    } else {
      setCurrentPhase('work');
      setSecondsRemaining(workDurationMins * 60);
    }
  };

  const applyPreset = (work: number, shortB: number, longB: number) => {
    setIsRunning(false);
    setWorkDurationMins(work);
    setShortBreakMins(shortB);
    setLongBreakMins(longB);
    setCurrentPhase('work');
    setSecondsRemaining(work * 60);
    setShowSettings(false);
  };

  const handleSkipPhase = () => {
    setIsRunning(false);
    if (currentPhase === 'work') {
      setCurrentPhase('shortBreak');
      setSecondsRemaining(shortBreakMins * 60);
    } else {
      setCurrentPhase('work');
      setSecondsRemaining(workDurationMins * 60);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'pomodoro') {
      if (currentPhase === 'work') setSecondsRemaining(workDurationMins * 60);
      else if (currentPhase === 'shortBreak') setSecondsRemaining(shortBreakMins * 60);
      else setSecondsRemaining(longBreakMins * 60);
    } else {
      setStopwatchSeconds(0);
    }
  };

  const handleSaveStopwatch = () => {
    if (stopwatchSeconds < 60) {
      alert("Study for at least 1 minute before logging session.");
      return;
    }
    setLastCompletedDuration(stopwatchSeconds);
    setShowLogModal(true);
  };

  const handleConfirmLogSession = (e: React.FormEvent) => {
    e.preventDefault();
    logSession({
      durationSeconds: lastCompletedDuration,
      category: sessionCategory,
      subject: sessionSubject,
      notes: sessionNotes.trim() || 'Focused study session.',
    });
    setShowLogModal(false);
    setSessionNotes('');
    if (mode === 'stopwatch') {
      setStopwatchSeconds(0);
      setIsRunning(false);
    }
  };

  // Format MM:SS or HH:MM:SS
  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Ring Progress Calculation
  const totalPhaseDuration = currentPhase === 'work'
    ? workDurationMins * 60
    : currentPhase === 'shortBreak'
    ? shortBreakMins * 60
    : longBreakMins * 60;
  
  const progressRatio = mode === 'pomodoro' ? 1 - secondsRemaining / totalPhaseDuration : 0;
  const strokeDashoffset = 754 - 754 * progressRatio;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#121A27] to-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <TimerIcon className="w-6 h-6 text-cyan-400" />
            JEE Study Sprint & Pomodoro Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Structured focus intervals, break enforcement, and automatic study time logging.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 w-fit">
          <button
            onClick={() => {
              setIsRunning(false);
              setMode('pomodoro');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === 'pomodoro'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pomodoro Mode
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setMode('stopwatch');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === 'stopwatch'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Stopwatch Count-Up
          </button>
        </div>
      </div>

      {/* Main Timer Display Card */}
      <div className="relative overflow-hidden p-8 sm:p-10 rounded-3xl bg-[#121A27] border border-slate-800 shadow-2xl flex flex-col items-center justify-center space-y-6 text-center">
        {/* Settings button */}
        {mode === 'pomodoro' && (
          <button
            onClick={() => setShowSettings(true)}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition"
            title="Configure intervals"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}

        {/* Phase Badge (Pomodoro) */}
        {mode === 'pomodoro' ? (
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${
                currentPhase === 'work'
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              }`}
            >
              {currentPhase === 'work'
                ? 'Deep Focus Work'
                : currentPhase === 'shortBreak'
                ? 'Short Break'
                : 'Long Break Refresh'}
            </span>
            <span className="text-xs font-mono font-semibold text-slate-400">
              Cycle {(completedCycles % cyclesBeforeLongBreak) + 1} of {cyclesBeforeLongBreak}
            </span>
          </div>
        ) : (
          <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border bg-blue-500/15 border-blue-500/40 text-blue-400">
            Open Study Stopwatch
          </span>
        )}

        {/* Circular SVG Ring & Time Counter */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 260 260">
            {/* Background circle */}
            <circle
              cx="130"
              cy="130"
              r="120"
              stroke="#1E293B"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated progress circle */}
            {mode === 'pomodoro' && (
              <circle
                cx="130"
                cy="130"
                r="120"
                stroke={currentPhase === 'work' ? '#06B6D4' : '#10B981'}
                strokeWidth="10"
                strokeDasharray="754"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-linear"
              />
            )}
          </svg>

          {/* Time text centered */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow-md">
              {formatTime(mode === 'pomodoro' ? secondsRemaining : stopwatchSeconds)}
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-widest mt-2 font-semibold">
              {isRunning ? 'Session in Progress' : 'Paused / Ready'}
            </span>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-8 py-3.5 rounded-2xl font-bold text-base flex items-center gap-2 transition cursor-pointer shadow-xl ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white shadow-cyan-500/25'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          {mode === 'pomodoro' ? (
            <button
              onClick={handleSkipPhase}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
              title="Skip Phase"
            >
              <FastForward className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSaveStopwatch}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition"
              title="Log Study Session"
            >
              <Save className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Pomodoro Presets */}
        {mode === 'pomodoro' && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-slate-500 mr-1">Presets:</span>
            <button
              onClick={() => applyPreset(25, 5, 15)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition ${
                workDurationMins === 25
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              25 / 5m (Standard)
            </button>
            <button
              onClick={() => applyPreset(50, 10, 20)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition ${
                workDurationMins === 50
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              50 / 10m (Deep Study)
            </button>
            <button
              onClick={() => applyPreset(90, 15, 30)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition ${
                workDurationMins === 90
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              90 / 15m (Mock Exam Block)
            </button>
          </div>
        )}
      </div>

      {/* Study Session History */}
      <div className="p-5 rounded-3xl bg-[#121A27] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            Logged Study Sessions ({sessions.length})
          </h2>
          <span className="text-xs text-slate-400">
            Total Hours: {(sessions.reduce((a, s) => a + s.durationSeconds, 0) / 3600).toFixed(1)} hrs
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No study sessions logged yet. Complete a Pomodoro sprint or save a stopwatch session to record history.
          </div>
        ) : (
          <div className="space-y-2.5">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    {Math.round(sess.durationSeconds / 60)}m
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-white">
                      {sess.subject} • <span className="text-cyan-400">{sess.category}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{sess.notes}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(sess.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                      {new Date(sess.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteSession(sess.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Delete log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interval Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#121A27] border border-slate-700 p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              Configure Pomodoro Intervals
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Focus Duration (Minutes)</label>
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={workDurationMins}
                  onChange={(e) => setWorkDurationMins(Math.max(1, parseInt(e.target.value) || 25))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Short Break (Minutes)</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={shortBreakMins}
                  onChange={(e) => setShortBreakMins(Math.max(1, parseInt(e.target.value) || 5))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Long Break (Minutes)</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={longBreakMins}
                  onChange={(e) => setLongBreakMins(Math.max(1, parseInt(e.target.value) || 15))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cycles Before Long Break</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={cyclesBeforeLongBreak}
                  onChange={(e) => setCyclesBeforeLongBreak(Math.max(1, parseInt(e.target.value) || 4))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  setSecondsRemaining(workDurationMins * 60);
                  setIsRunning(false);
                  setShowSettings(false);
                }}
                className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition"
              >
                Save Interval Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Session Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#121A27] border border-slate-700 p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setShowLogModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Session Completed!
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                You focused for {Math.round(lastCompletedDuration / 60)} minutes. Log your study breakdown below.
              </p>
            </div>

            <form onSubmit={handleConfirmLogSession} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subject</label>
                <select
                  value={sessionSubject}
                  onChange={(e) => setSessionSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="General">General Mock / Revision</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category / Activity</label>
                <select
                  value={sessionCategory}
                  onChange={(e) => setSessionCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Problem Practice">Problem Practice (PYQs / DPP)</option>
                  <option value="Theory & Derivations">Theory & Derivations</option>
                  <option value="Formula Recall">Formula Sheet Recall</option>
                  <option value="Full Mock Test">Full Mock Test</option>
                  <option value="Error Book Review">Error Book Review</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Session Notes (Chapters/Topics Covered)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Solved 15 Rotational Dynamics questions from 2023 papers"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold hover:opacity-90 transition shadow-md shadow-emerald-500/20"
                >
                  Save to History
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
