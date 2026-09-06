import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Flame, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Target, 
  ArrowRight, 
  Zap, 
  Edit3,
  Brain,
  Smile
} from 'lucide-react';
import { SubjectType } from '../types';

export const DailyCheckInCard: React.FC = () => {
  const { 
    profile, 
    todaysCheckIn, 
    submitDailyCheckIn, 
    openCheckInModal,
    sessions 
  } = useApp();

  const [quickMood, setQuickMood] = useState('🚀 Laser-Focused');
  const [quickCommitment, setQuickCommitment] = useState('');
  const [quickSubject, setQuickSubject] = useState<SubjectType | 'All Subjects'>('Physics');
  const [quickHours, setQuickHours] = useState(profile.dailyHourGoal || 8);
  const [isSuccess, setIsSuccess] = useState(false);

  // Calculate today's logged hours
  const todayISO = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => {
    const sDate = new Date(s.timestamp).toISOString().split('T')[0];
    return sDate === todayISO;
  });
  const todayLoggedHours = (todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 3600).toFixed(1);

  const isAlreadyActiveToday = profile.lastActiveDate === todayISO && profile.currentStreak > 0;
  const nextStreakValue = isAlreadyActiveToday ? profile.currentStreak : profile.currentStreak + 1;

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCommitment = quickCommitment.trim() || 'Lock in full focus, solve PYQs, and maintain daily discipline.';
    
    submitDailyCheckIn({
      mood: quickMood,
      readiness: 'Focused & Steady',
      targetHours: quickHours,
      primarySubject: quickSubject,
      commitment: finalCommitment
    });

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 1500);
  };

  // State 1: Already Checked In for Today
  if (todaysCheckIn) {
    const targetHours = todaysCheckIn.targetHours || profile.dailyHourGoal || 8;
    const progressPercent = Math.min(100, Math.round((Number(todayLoggedHours) / targetHours) * 100));

    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F1D2B] via-[#0F1723] to-[#141F30] border border-cyan-500/40 p-5 sm:p-6 shadow-xl shadow-cyan-950/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Title & Badge */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-white">
                  Daily Check-In Completed
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                  Day {profile.currentStreak} Secured
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Mindset: <span className="text-amber-300 font-semibold">{todaysCheckIn.mood}</span> • Energy: <span className="text-cyan-300 font-semibold">{todaysCheckIn.readiness}</span>
              </p>
            </div>
          </div>

          {/* Action Button & Stats */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{profile.currentStreak}d Streak</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 font-mono text-xs font-bold shadow-sm">
              <Zap className="w-3.5 h-3.5 fill-yellow-400" />
              <span>{profile.exp || 0} EXP</span>
            </div>
            <button
              onClick={openCheckInModal}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Update Log</span>
            </button>
          </div>
        </div>

        {/* Today's Commitment Note */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Brain className="w-3 h-3 text-cyan-400" />
            <span>Today's Battle Cry</span>
          </div>
          <p className="italic text-slate-200 font-medium">"{todaysCheckIn.commitment}"</p>
        </div>

        {/* Progress Towards Today's Goal */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Study Progress Today: <span className="text-white font-mono font-bold">{todayLoggedHours} hrs</span> of <span className="text-emerald-400 font-mono font-bold">{targetHours} hrs target</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono text-[11px] font-bold text-cyan-400">{progressPercent}%</span>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Not Checked In Yet Today
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#161726] via-[#101421] to-[#0F1723] border border-amber-500/50 p-5 sm:p-6 shadow-2xl shadow-amber-950/20 animate-in fade-in overscroll-contain">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Header with Flame */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 flex-shrink-0 animate-pulse">
            <Flame className="w-7 h-7 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold text-white">
                Daily Check-In Pending
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[10px] font-extrabold uppercase tracking-wide">
                +1 Day Streak
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Set your energy, focus subject, and lock in Day <span className="text-amber-400 font-bold">{nextStreakValue}</span> of your streak!
            </p>
          </div>
        </div>

        {/* Modal Opener & Quick Stats */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span>{profile.currentStreak}d Streak</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 font-mono text-xs font-bold shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-yellow-400" />
            <span>{profile.exp || 0} EXP</span>
          </div>
          <button
            onClick={openCheckInModal}
            className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
          >
            <span>Full Log View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Check-In Form */}
      <form onSubmit={handleQuickSubmit} className="mt-4 pt-3 border-t border-slate-800/80 space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Mood Pill Picker */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Smile className="w-3 h-3 text-amber-400" />
              <span>Today's Vibe</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {['🚀 Laser-Focused', '⚡ High Energy', '🧘 Calm & Steady', '🔥 Grinding'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setQuickMood(m)}
                  className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold text-left transition cursor-pointer truncate ${
                    quickMood === m
                      ? 'bg-amber-500/20 border-amber-500/70 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Target Hours & Subject */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Target className="w-3 h-3 text-cyan-400" />
              <span>Target & Subject</span>
            </label>
            <div className="flex items-center gap-1.5">
              <select
                value={quickSubject}
                onChange={(e) => setQuickSubject(e.target.value as any)}
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
              >
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
                <option value="All Subjects">All Subjects</option>
              </select>
              <select
                value={quickHours}
                onChange={(e) => setQuickHours(Number(e.target.value))}
                className="w-24 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 text-xs font-mono font-bold focus:outline-none focus:border-emerald-400"
              >
                <option value={6}>6 hrs</option>
                <option value={8}>8 hrs</option>
                <option value={10}>10 hrs</option>
                <option value={12}>12 hrs</option>
                <option value={14}>14 hrs</option>
              </select>
            </div>
          </div>

          {/* Quick Commitment Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Brain className="w-3 h-3 text-purple-400" />
              <span>Today's Focus Note</span>
            </label>
            <input
              type="text"
              value={quickCommitment}
              onChange={(e) => setQuickCommitment(e.target.value)}
              placeholder="e.g. Solve 30 PYQs with 0 phone distractions"
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400 hidden sm:inline-block">
            Consistency beats genius. Claim day <span className="text-amber-400 font-bold">{nextStreakValue}</span> now.
          </span>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:opacity-95 text-white text-xs font-bold transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Streak Secured (+1 Day)!</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4 fill-white" />
                <span>Check In & Advance Streak (+1 Day)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
