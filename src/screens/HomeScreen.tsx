import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Flame, 
  BookOpen, 
  Timer, 
  CheckSquare, 
  AlertTriangle, 
  Binary, 
  TrendingUp, 
  ChevronRight, 
  Award, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Brain, 
  HelpCircle, 
  Lightbulb,
  Target,
  ArrowRight,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { HARD_QUOTES } from '../data/initialData';
import { DailyCheckInCard } from '../components/DailyCheckInCard';

export const HomeScreen: React.FC = () => {
  const { 
    profile, 
    chapters, 
    todos, 
    toggleTodo, 
    sessions, 
    setCurrentTab,
    openProfileModal,
    triggerEndOfDayCheck,
    clearPenaltyNotice
  } = useApp();

  const [auditResult, setAuditResult] = useState<{ penalized: boolean; message: string } | null>(null);

  // Calculate stats
  const totalChapters = chapters.length;
  const completedChapters = chapters.filter((c) => c.isCompleted).length;
  const overallProgress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  const physicsChapters = chapters.filter((c) => c.subject === 'Physics');
  const physicsCompleted = physicsChapters.filter((c) => c.isCompleted).length;
  const physicsProgress = physicsChapters.length > 0 ? Math.round((physicsCompleted / physicsChapters.length) * 100) : 0;

  const chemChapters = chapters.filter((c) => c.subject === 'Chemistry');
  const chemCompleted = chemChapters.filter((c) => c.isCompleted).length;
  const chemProgress = chemChapters.length > 0 ? Math.round((chemCompleted / chemChapters.length) * 100) : 0;

  const mathChapters = chapters.filter((c) => c.subject === 'Mathematics');
  const mathCompleted = mathChapters.filter((c) => c.isCompleted).length;
  const mathProgress = mathChapters.length > 0 ? Math.round((mathCompleted / mathChapters.length) * 100) : 0;

  // Study hours today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todaySessions = sessions.filter((s) => s.timestamp >= todayStart.getTime());
  const todaySeconds = todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const todayHours = (todaySeconds / 3600).toFixed(1);

  // JEE Countdown based on target year
  const [daysToMain, setDaysToMain] = useState(142);
  const [daysToAdv, setDaysToAdv] = useState(258);

  useEffect(() => {
    const targetYear = profile.targetYear || 2027;
    const now = new Date();
    // JEE Main Session 1 is late January of targetYear
    const targetMain = new Date(targetYear, 0, 24, 9, 0, 0);
    // JEE Advanced is late May of targetYear
    const targetAdv = new Date(targetYear, 4, 25, 9, 0, 0);
    
    const diffMain = Math.max(0, Math.ceil((targetMain.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const diffAdv = Math.max(0, Math.ceil((targetAdv.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    setDaysToMain(diffMain);
    setDaysToAdv(diffAdv);
  }, [profile.targetYear]);

  const pendingTodos = todos.filter((t) => !t.isCompleted).slice(0, 4);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Onboarding Welcome Banner for Jitanshu if not onboarded yet */}
      {!profile.isOnboarded && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-cyan-950/70 via-[#121E30] to-blue-950/60 border border-cyan-500/50 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black flex-shrink-0 shadow-lg shadow-cyan-500/10">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white">
                Welcome, {profile.name}! Clean Slate Setup
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Ready for <span className="text-cyan-300 font-semibold">{profile.targetExam}</span>? Customize your target year (e.g. 2027) and dream campus anytime.
              </p>
            </div>
          </div>
          <button
            onClick={openProfileModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex-shrink-0 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <span>Personalize Exam & Year</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hero Welcome & Target Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-950/50 via-[#121A27] to-slate-900 border border-cyan-500/30 p-5 sm:p-7 shadow-2xl shadow-cyan-950/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={openProfileModal}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/25 transition cursor-pointer group"
                title="Click to customize target year or exam"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Target: {profile.targetExam}</span>
                <span className="text-[10px] text-cyan-300 underline ml-1">Change Goal</span>
              </button>
              <span className="text-[11px] text-slate-400">
                Aiming for: <span className="text-white font-semibold">{profile.dreamCollege || 'IIT Bombay'}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{profile.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Consistency is your highest leverage. Complete today's targets and take one step closer to your dream IIT campus.
            </p>
          </div>

          {/* Exam Countdowns */}
          <div className="flex items-center gap-3">
            <div 
              onClick={openProfileModal}
              className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 text-center min-w-[110px] shadow-lg hover:border-cyan-400/60 transition cursor-pointer"
              title="Click to adjust Target Year"
            >
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">JEE Main {profile.targetYear || 2027}</span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-0.5">{daysToMain}</div>
              <span className="text-[10px] text-slate-400">Days Remaining</span>
            </div>
            <div 
              onClick={openProfileModal}
              className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-center min-w-[110px] shadow-lg hover:border-amber-400/60 transition cursor-pointer"
              title="Click to adjust Target Year"
            >
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">JEE Adv {profile.targetYear || 2027}</span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-0.5">{daysToAdv}</div>
              <span className="text-[10px] text-slate-400">Days Remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* Penalty Alert Banner if penalty occurred */}
      {profile.lastPenaltyReason && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 flex items-start justify-between gap-3 text-rose-200 text-xs animate-in fade-in shadow-lg">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rose-300 block text-sm">Accountability Penalty Applied</span>
              <p className="mt-0.5 text-rose-200">{profile.lastPenaltyReason}</p>
            </div>
          </div>
          <button 
            onClick={clearPenaltyNotice} 
            className="px-2.5 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-900 border border-rose-700/60 text-[11px] font-semibold text-rose-200 hover:text-white transition cursor-pointer flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Daily Check-In & Streak Lock-In Card */}
      <DailyCheckInCard />

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Syllabus % */}
        <div 
          onClick={() => setCurrentTab('syllabus')} 
          className="p-4 rounded-2xl bg-[#121A27] border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Syllabus Done</span>
            <BookOpen className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            {overallProgress}%
          </div>
          <div className="mt-2 w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500" 
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-1.5 block">
            {completedChapters} of {totalChapters} chapters done
          </span>
        </div>

        {/* Study Time Today */}
        <div 
          onClick={() => setCurrentTab('timer')} 
          className="p-4 rounded-2xl bg-[#121A27] border border-slate-800 hover:border-emerald-500/40 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Study</span>
            <Clock className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            {todayHours} <span className="text-sm font-normal text-slate-400">hrs</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{todaySessions.length} recorded session(s)</span>
          </div>
        </div>

        {/* Pending Tasks */}
        <div 
          onClick={() => setCurrentTab('todo')} 
          className="p-4 rounded-2xl bg-[#121A27] border border-slate-800 hover:border-purple-500/40 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Tasks</span>
            <CheckSquare className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
            {todos.filter((t) => !t.isCompleted).length}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {todos.filter((t) => t.isCompleted).length} completed today
          </div>
        </div>

        {/* Streak */}
        <div 
          onClick={() => setCurrentTab('todo')} 
          className="p-4 rounded-2xl bg-[#121A27] border border-slate-800 hover:border-amber-500/40 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Daily Streak</span>
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">
            {profile.currentStreak} <span className="text-sm font-normal text-slate-400">Days</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Best streak: {profile.bestStreak} days
          </div>
        </div>

        {/* EXP Counter - Placed right next to Streak */}
        <div 
          onClick={() => setCurrentTab('todo')} 
          className="p-4 rounded-2xl bg-[#121A27] border border-yellow-500/30 hover:border-yellow-400/60 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-yellow-400/90">Rank EXP</span>
            <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-yellow-400">
            {profile.exp || 0} <span className="text-sm font-normal text-slate-400">EXP</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">+5 EXP</span>
            <span>per completed task</span>
          </div>
        </div>
      </div>

      {/* End-of-Day Task Accountability & Penalty Monitor */}
      <div className="rounded-3xl bg-gradient-to-r from-[#141A28] via-[#101726] to-[#121A27] border border-slate-800 p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-orange-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 flex-shrink-0">
              <Zap className="w-5 h-5 fill-yellow-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">Daily Task Accountability & EXP System</h3>
                <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-extrabold font-mono">
                  +5 EXP / Task
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Rule: Complete all To-Do tasks by 11:59 PM. Incomplete tasks reset Streak to 0 & EXP to 0 as penalty.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const res = triggerEndOfDayCheck();
                setAuditResult(res);
                setTimeout(() => setAuditResult(null), 5000);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-yellow-500/50 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Test or enforce end-of-day task completion check"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
              <span>Audit End-of-Day</span>
            </button>
            <button
              onClick={() => setCurrentTab('todo')}
              className="px-3 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/40 hover:bg-purple-600/30 text-purple-300 text-xs font-bold transition cursor-pointer flex items-center gap-1"
            >
              <span>To-Do List</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Audit feedback message if clicked */}
        {auditResult && (
          <div className={`p-3 rounded-xl text-xs font-medium border animate-in fade-in flex items-center justify-between ${
            auditResult.penalized
              ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
              : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
          }`}>
            <span>{auditResult.message}</span>
            <button onClick={() => setAuditResult(null)} className="text-xs underline ml-2 cursor-pointer">Dismiss</button>
          </div>
        )}

        {/* Task completion status bar */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            {todos.length === 0 ? (
              <span className="text-slate-400">No tasks added for today. Add tasks in To-Do list to earn +5 EXP each.</span>
            ) : todos.every(t => t.isCompleted) ? (
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>All {todos.length} tasks completed! Streak ({profile.currentStreak}d) and EXP ({profile.exp} EXP) are safe.</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>
                  {todos.filter(t => !t.isCompleted).length} of {todos.length} tasks incomplete. Finish them before midnight to prevent penalty!
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Today:</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-purple-300 font-bold">
              {todos.filter(t => t.isCompleted).length}/{todos.length} Done
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-bold">
              {profile.currentStreak}d Streak
            </span>
            <span className="px-2 py-0.5 rounded bg-yellow-500/15 text-yellow-400 font-bold">
              {profile.exp || 0} EXP
            </span>
          </div>
        </div>
      </div>

      {/* PCM Subject Progress Breakdown */}
      <div className="rounded-3xl bg-[#121A27] border border-slate-800 p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              PCM Syllabus Mastery
            </h2>
            <p className="text-xs text-slate-400">Track balance across Physics, Chemistry, and Mathematics</p>
          </div>
          <button
            onClick={() => setCurrentTab('syllabus')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
          >
            Full Syllabus <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Physics */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-blue-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Physics</span>
              <span className="text-xs font-mono font-bold text-slate-200">{physicsProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                style={{ width: `${physicsProgress}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400">
              {physicsCompleted} / {physicsChapters.length} Chapters done
            </div>
          </div>

          {/* Chemistry */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-pink-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">Chemistry</span>
              <span className="text-xs font-mono font-bold text-slate-200">{chemProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-pink-500 rounded-full transition-all duration-500" 
                style={{ width: `${chemProgress}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400">
              {chemCompleted} / {chemChapters.length} Chapters done
            </div>
          </div>

          {/* Mathematics */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Mathematics</span>
              <span className="text-xs font-mono font-bold text-slate-200">{mathProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${mathProgress}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400">
              {mathCompleted} / {mathChapters.length} Chapters done
            </div>
          </div>
        </div>
      </div>

      {/* Rankify AI Study Mentor Spotlight Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-[#121A27] to-purple-950/40 border border-cyan-500/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Google Gemini 3.5 Flash Powered</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Brain className="w-6 h-6 text-cyan-400" />
              Rankify AI Study Mentor & Doubt Solver
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Ask tricky physics derivations, organic reaction mechanisms, or generate a tailored study plan synced directly with your {completedChapters} completed chapters and pending backlogs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => setCurrentTab('ai-mentor')}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Ask AI Doubts</span>
            </button>
            <button
              onClick={() => setCurrentTab('ai-mentor')}
              className="px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Generate Study Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Today's High Priority Tasks + Quick Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Tasks Card */}
        <div className="rounded-3xl bg-[#121A27] border border-slate-800 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-purple-400" />
              Today's Priority Drill
            </h2>
            <button
              onClick={() => setCurrentTab('todo')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
            >
              All Tasks <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingTodos.length === 0 ? (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-xs sm:text-sm">All primary tasks cleared! Great discipline.</p>
              <button
                onClick={() => setCurrentTab('todo')}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition"
              >
                + Add New Tasks or Load Routine
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingTodos.map((todo) => (
                <div
                  key={todo.id}
                  onClick={() => toggleTodo(todo.id)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-lg border-2 border-slate-600 group-hover:border-cyan-400 transition flex items-center justify-center" />
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white">
                        {todo.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {todo.subject}
                        </span>
                        <span className={`text-[10px] font-bold ${
                          todo.priority === 'High' ? 'text-rose-400' : todo.priority === 'Medium' ? 'text-amber-400' : 'text-slate-400'
                        }`}>
                          {todo.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Study Launcher Shortcuts */}
        <div className="rounded-3xl bg-[#121A27] border border-slate-800 p-5 shadow-lg space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Prep Command Center
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setCurrentTab('timer')}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition text-left space-y-2 group cursor-pointer"
            >
              <div className="p-2 w-fit rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Pomodoro Timer</div>
                <div className="text-[10px] text-slate-400">Deep study sprints</div>
              </div>
            </button>

            <button
              onClick={() => setCurrentTab('formulas')}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/5 transition text-left space-y-2 group cursor-pointer"
            >
              <div className="p-2 w-fit rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                <Binary className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Formula Hub</div>
                <div className="text-[10px] text-slate-400">High-yield recall</div>
              </div>
            </button>

            <button
              onClick={() => setCurrentTab('tools')}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 hover:bg-rose-500/5 transition text-left space-y-2 group cursor-pointer"
            >
              <div className="p-2 w-fit rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Error Book</div>
                <div className="text-[10px] text-slate-400">Mistake post-mortem</div>
              </div>
            </button>

            <button
              onClick={() => setCurrentTab('tracker')}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition text-left space-y-2 group cursor-pointer"
            >
              <div className="p-2 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Exam Tracker</div>
                <div className="text-[10px] text-slate-400">High-weightage list</div>
              </div>
            </button>

            <button
              onClick={() => setCurrentTab('tools')}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 hover:bg-purple-500/5 transition text-left space-y-2 group cursor-pointer"
            >
              <div className="p-2 w-fit rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Rank Predictor</div>
                <div className="text-[10px] text-slate-400">Marks vs Percentile</div>
              </div>
            </button>

            <button
              onClick={() => setCurrentTab('analytics')}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 hover:bg-amber-500/5 transition text-left space-y-2 group cursor-pointer"
            >
              <div className="p-2 w-fit rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Analytics</div>
                <div className="text-[10px] text-slate-400">Prep metrics</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
