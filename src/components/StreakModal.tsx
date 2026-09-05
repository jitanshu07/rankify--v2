import React from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Award, ShieldCheck, X, CheckCircle2, Target, Zap, AlertTriangle } from 'lucide-react';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({ isOpen, onClose }) => {
  const { profile, todaysCheckIn, openCheckInModal } = useApp();

  if (!isOpen) return null;

  const milestones = [
    { days: 3, label: 'Bronze Ranker', desc: 'Initial momentum locked in', unlocked: profile.currentStreak >= 3 },
    { days: 7, label: 'Silver Ranker', desc: '1 Full week of relentless discipline', unlocked: profile.currentStreak >= 7 },
    { days: 21, label: 'Gold Ranker', desc: 'Habit deeply formed in subconscious', unlocked: profile.currentStreak >= 21 },
    { days: 60, label: 'Diamond IITian', desc: 'Elite top 0.1% mental conditioning', unlocked: profile.currentStreak >= 60 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-[#121A27] border border-slate-700/80 p-6 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Streak Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/30 border border-amber-500/40 text-amber-400 shadow-xl shadow-amber-500/20">
            <Flame className="w-9 h-9 fill-amber-500 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white">Daily Study Streak</h2>
          <p className="text-xs text-slate-400">Consistency beats genius. Don't break the chain.</p>
        </div>

        {/* Today's Check-In Status Pill */}
        {todaysCheckIn ? (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Today's Check-In: <strong className="text-white">{todaysCheckIn.mood}</strong></span>
            </div>
            <button
              onClick={() => {
                onClose();
                openCheckInModal();
              }}
              className="text-[11px] underline text-cyan-400 hover:text-cyan-300 cursor-pointer font-semibold"
            >
              View Log
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              onClose();
              openCheckInModal();
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/30 to-amber-500/20 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-white text-xs font-bold transition flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>Today's Check-In Pending</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/30 text-amber-200">
              Claim Day {profile.currentStreak + 1} →
            </span>
          </button>
        )}

        {/* Big Numbers Grid: Streak and EXP side by side */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-center">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider block">Current Streak</span>
            <div className="mt-1 text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">
              {profile.currentStreak} <span className="text-xs font-normal text-slate-400">d</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-yellow-500/30 text-center">
            <span className="text-[10px] sm:text-xs font-semibold text-yellow-400/90 uppercase tracking-wider block">Rank EXP</span>
            <div className="mt-1 text-2xl sm:text-3xl font-extrabold font-mono text-yellow-400">
              {profile.exp || 0} <span className="text-xs font-normal text-slate-400">EXP</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider block">Best Record</span>
            <div className="mt-1 text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
              {profile.bestStreak} <span className="text-xs font-normal text-slate-400">d</span>
            </div>
          </div>
        </div>

        {/* EXP Reward & Midnight Penalty Rule */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-[#101726] to-slate-900 border border-slate-800 text-xs space-y-2 text-slate-300">
          <div className="flex items-center gap-1.5 font-bold text-yellow-400">
            <Zap className="w-4 h-4 fill-yellow-400" />
            <span>EXP Rewards & Strict Midnight Penalty:</span>
          </div>
          <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
            <li><strong className="text-emerald-300">+5 EXP</strong> earned instantly for each completed task in your To-Do list.</li>
            <li><strong className="text-rose-400">Midnight Penalty:</strong> If ALL To-Do tasks are not completed by 11:59 PM, your Streak resets to 0 and EXP resets back to 0 as penalty!</li>
            <li>Submit your Daily Check-In every day to protect and advance your Streak.</li>
          </ul>
        </div>

        {/* Milestones */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            Streak Badges
          </span>
          <div className="space-y-2">
            {milestones.map((m) => (
              <div
                key={m.days}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs transition ${
                  m.unlocked
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                    : 'bg-slate-900/50 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Award className={`w-4 h-4 ${m.unlocked ? 'text-amber-400' : 'text-slate-600'}`} />
                  <div>
                    <div className="font-bold">{m.label} ({m.days}d)</div>
                    <div className="text-[10px] text-slate-400">{m.desc}</div>
                  </div>
                </div>
                {m.unlocked ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {m.days - profile.currentStreak > 0 ? `${m.days - profile.currentStreak}d to go` : 'Locked'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:opacity-90 transition shadow-lg shadow-cyan-500/20 cursor-pointer"
        >
          Got It, Back to Studies
        </button>
      </div>
    </div>
  );
};
