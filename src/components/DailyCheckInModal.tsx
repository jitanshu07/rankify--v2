import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Flame, 
  Sparkles, 
  Check, 
  Calendar, 
  Clock, 
  Target, 
  Zap, 
  Brain, 
  Smile, 
  ChevronRight,
  ShieldCheck,
  Award,
  History
} from 'lucide-react';
import { SubjectType } from '../types';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOOD_OPTIONS = [
  { id: '🚀 Laser-Focused', label: 'Laser-Focused', icon: '🚀', desc: 'Distraction-free deep work' },
  { id: '⚡ High Energy', label: 'High Energy', icon: '⚡', desc: 'Ready to crush hard numericals' },
  { id: '🧘 Calm & Steady', label: 'Calm & Steady', icon: '🧘', desc: 'Systematic revision & derivations' },
  { id: '🔥 Relentless Grind', label: 'Relentless Grind', icon: '🔥', desc: 'Pushing past mental barriers' },
  { id: '🧠 Analytical', label: 'Analytical', icon: '🧠', desc: 'Dissecting tricky mock questions' },
  { id: '🛡️ Resilient', label: 'Resilient', icon: '🛡️', desc: 'Bouncing back from low marks' },
];

const READINESS_LEVELS: { id: 'Peak Energy' | 'Focused & Steady' | 'Tired but Determined' | 'Low / Struggling'; label: string; pct: string; color: string }[] = [
  { id: 'Peak Energy', label: 'Peak Energy', pct: '100%', color: 'border-emerald-500/80 text-emerald-400 bg-emerald-500/10' },
  { id: 'Focused & Steady', label: 'Focused & Steady', pct: '85%', color: 'border-cyan-500/80 text-cyan-400 bg-cyan-500/10' },
  { id: 'Tired but Determined', label: 'Tired but Determined', pct: '65%', color: 'border-amber-500/80 text-amber-400 bg-amber-500/10' },
  { id: 'Low / Struggling', label: 'Low / Need Momentum', pct: '40%', color: 'border-rose-500/80 text-rose-400 bg-rose-500/10' },
];

const SUBJECT_CHOICES: (SubjectType | 'All Subjects')[] = ['Physics', 'Chemistry', 'Mathematics', 'All Subjects'];

const COMMITMENT_SUGGESTIONS = [
  'Solve 30 PYQs with strict 2-minute timer',
  'Master Rotation & Center of Mass concepts',
  'Revise Organic reaction mechanisms & reagents',
  'Complete 1 Full 3-hour Mock Test analysis',
  'Zero social media, 8 hours deep focus'
];

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({ isOpen, onClose }) => {
  const { profile, todaysCheckIn, submitDailyCheckIn, checkIns } = useApp();

  const [mood, setMood] = useState('🚀 Laser-Focused');
  const [readiness, setReadiness] = useState<'Peak Energy' | 'Focused & Steady' | 'Tired but Determined' | 'Low / Struggling'>('Focused & Steady');
  const [targetHours, setTargetHours] = useState(profile.dailyHourGoal || 8);
  const [primarySubject, setPrimarySubject] = useState<SubjectType | 'All Subjects'>('Physics');
  const [commitment, setCommitment] = useState('');
  const [reflection, setReflection] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (todaysCheckIn) {
        setMood(todaysCheckIn.mood || '🚀 Laser-Focused');
        setReadiness(todaysCheckIn.readiness || 'Focused & Steady');
        setTargetHours(todaysCheckIn.targetHours || profile.dailyHourGoal || 8);
        setPrimarySubject(todaysCheckIn.primarySubject || 'Physics');
        setCommitment(todaysCheckIn.commitment || '');
        setReflection(todaysCheckIn.reflection || '');
      } else {
        setMood('🚀 Laser-Focused');
        setReadiness('Focused & Steady');
        setTargetHours(profile.dailyHourGoal || 8);
        setPrimarySubject('Physics');
        setCommitment('');
        setReflection('');
      }
      setIsSuccess(false);
    }
  }, [isOpen, todaysCheckIn, profile.dailyHourGoal]);

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const todayISO = new Date().toISOString().split('T')[0];
  const isAlreadyActiveToday = profile.lastActiveDate === todayISO && profile.currentStreak > 0;
  const nextStreakValue = isAlreadyActiveToday ? profile.currentStreak : profile.currentStreak + 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCommitment = commitment.trim() || 'Complete today\'s study goal and maintain consistency.';

    submitDailyCheckIn({
      mood,
      readiness,
      targetHours,
      primarySubject,
      commitment: finalCommitment,
      reflection: reflection.trim() || undefined
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in overscroll-contain">
      <div 
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto overscroll-contain rounded-3xl bg-[#0F1723] border border-slate-700/80 shadow-2xl p-5 sm:p-7 space-y-6 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start justify-between pr-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25 flex-shrink-0">
              <Flame className="w-6 h-6 fill-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Daily Check-In
                </h2>
                {todaysCheckIn && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                    Logged Today
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>{todayStr}</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400 font-semibold">{profile.name}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Streak Reward Callout */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-orange-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base">
              🔥
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300">
                {todaysCheckIn ? 'Today\'s Consistency Secured!' : 'Unlock Today\'s Streak Progress'}
              </div>
              <div className="text-[11px] text-slate-300">
                {isAlreadyActiveToday
                  ? `Streak Active: ${profile.currentStreak} Day${profile.currentStreak === 1 ? '' : 's'}`
                  : `Check in now to advance to Day ${nextStreakValue}!`}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black font-mono text-amber-400">
              {todaysCheckIn ? profile.currentStreak : nextStreakValue}
            </span>
            <span className="text-[10px] text-slate-400 block font-semibold">DAYS</span>
          </div>
        </div>

        {/* Tab Toggle: Check-In Form vs Past History */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setShowHistory(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              !showHistory
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Today's Log
          </button>
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              showHistory
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Past Check-Ins ({checkIns.length})</span>
          </button>
        </div>

        {showHistory ? (
          /* Past Check-Ins View */
          <div className="space-y-3">
            {checkIns.length === 0 ? (
              <div className="py-10 text-center text-slate-400 space-y-2">
                <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No check-ins recorded yet</p>
                <p className="text-xs text-slate-500">Log today's check-in to begin your daily streak history!</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto overscroll-contain pr-1">
                {checkIns.map((ci) => (
                  <div
                    key={ci.id}
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-mono">{ci.date}</span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-semibold text-[10px]">
                          {ci.mood}
                        </span>
                      </div>
                      <span className="text-cyan-400 font-mono font-bold">
                        {ci.targetHours} hrs • {ci.primarySubject}
                      </span>
                    </div>
                    <div className="text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 italic">
                      "{ci.commitment}"
                    </div>
                    {ci.reflection && (
                      <div className="text-[11px] text-slate-400 pl-1 border-l-2 border-emerald-500">
                        <span className="text-emerald-400 font-semibold">Reflection:</span> {ci.reflection}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Check-In Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Mindset / Mood */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Today's Mindset & Mood</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {MOOD_OPTIONS.map((opt) => {
                  const isSelected = mood === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setMood(opt.id)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500/70 text-amber-200 shadow-md shadow-amber-500/10'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-lg">{opt.icon}</span>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold truncate">{opt.label}</div>
                        <div className="text-[10px] text-slate-400 truncate">{opt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Readiness & Energy */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>2. Energy & Readiness Level</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {READINESS_LEVELS.map((level) => {
                  const isSelected = readiness === level.id;
                  return (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setReadiness(level.id)}
                      className={`py-2 px-2.5 rounded-xl border text-center transition cursor-pointer ${
                        isSelected
                          ? level.color
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{level.label}</div>
                      <div className="text-[10px] font-mono mt-0.5">{level.pct}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Target Hours & Focus Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Target Hours */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Target Study Hours</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-400">{targetHours} hrs</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[6, 8, 10, 12, 14].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setTargetHours(h)}
                      className={`py-1.5 rounded-lg border text-xs font-bold font-mono transition cursor-pointer ${
                        targetHours === h
                          ? 'bg-emerald-500/20 border-emerald-500/70 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-purple-400" />
                  <span>Main Focus Subject</span>
                </label>
                <select
                  value={primarySubject}
                  onChange={(e) => setPrimarySubject(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                >
                  {SUBJECT_CHOICES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Non-Negotiable Commitment */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-cyan-400" />
                  <span>3. Today's Non-Negotiable Commitment</span>
                </span>
                <span className="text-[10px] text-slate-500 font-normal">Your daily battle cry</span>
              </label>
              <textarea
                rows={2}
                value={commitment}
                onChange={(e) => setCommitment(e.target.value)}
                placeholder="e.g., Solve 30 Mechanics PYQs & revise Electrochemistry formulas with 0 distractions."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition"
              />

              {/* Suggestions */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {COMMITMENT_SUGGESTIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCommitment(sug)}
                    className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Evening Reflection (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Evening Reflection / Notes (Optional)</span>
                </span>
              </label>
              <input
                type="text"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="e.g., Accuracy improved in Rotational dynamics; need more speed in calculus."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:opacity-95 text-white text-xs font-bold transition shadow-lg shadow-amber-500/25 flex items-center gap-2 cursor-pointer"
              >
                {isSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Check-In Recorded!</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 fill-white" />
                    <span>{todaysCheckIn ? 'Update Check-In' : 'Lock In & Claim Streak 🔥'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
