import React, { useState } from 'react';
import { useApp, getLogicalDate } from '../context/AppContext';
import { Flame, Check, Share2, X, Trophy } from 'lucide-react';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({ isOpen, onClose }) => {
  const { profile, checkIns } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Calculate current week dates (Mon-Sun)
  const getWeekDates = () => {
    const logicalTodayStr = getLogicalDate();
    const logicalToday = new Date(logicalTodayStr);
    
    // getDay() is 0 for Sun, 1 for Mon, etc.
    const diffToMon = logicalToday.getDay() === 0 ? -6 : 1 - logicalToday.getDay();
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(logicalToday);
      d.setDate(logicalToday.getDate() + diffToMon + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const todayStr = getLogicalDate();

  const handleShare = () => {
    const text = `🔥 I'm on a ${profile.currentStreak}-day study streak on Rankify! Building consistency for IIT JEE.`;
    if (navigator.share) {
      navigator.share({
        title: 'My Rankify Streak',
        text: text,
      }).catch(() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const xpBonus = profile.currentStreak > 0 ? profile.currentStreak * 5 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overscroll-contain">
      <div className="relative w-full max-w-sm rounded-[2rem] bg-[#121A27] border border-slate-700/60 p-8 shadow-2xl shadow-orange-500/10 flex flex-col items-center animate-pop-in">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Milestone Header */}
        <div className="text-center mb-6 mt-2">
          <h2 className="text-2xl font-bold text-white tracking-wide">Streak Milestone!</h2>
          <p className="text-sm text-slate-400 mt-1">Consistency is the ultimate weapon.</p>
        </div>

        {/* Big Flame & Counter */}
        <div className="relative flex flex-col items-center justify-center mb-8">
          <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full w-48 h-48 -z-10"></div>
          
          <div className="relative">
            <Flame className="w-32 h-32 text-orange-500 fill-orange-500 animate-pulse drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-6">
              <span className="text-4xl font-black text-white drop-shadow-md">{profile.currentStreak}</span>
            </div>
          </div>
          <span className="text-lg font-bold text-orange-400 mt-2 tracking-widest uppercase">Day Streak</span>
        </div>

        {/* Weekly Consistency Tracker */}
        <div className="w-full mb-8">
          <div className="flex justify-between items-center w-full px-1">
            {weekDates.map((dateStr) => {
              const dateObj = new Date(dateStr);
              const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
              const isCheckedIn = checkIns.some(c => c.date === dateStr);
              const isToday = dateStr === todayStr;
              const isPast = dateStr < todayStr;
              
              let circleClasses = "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300";
              let textClasses = "text-xs font-semibold mt-2";
              
              if (isCheckedIn) {
                circleClasses += " bg-orange-500 border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]";
                textClasses += " text-orange-400";
              } else if (isToday) {
                circleClasses += " bg-slate-800 border-orange-500/50 border-dashed animate-pulse";
                textClasses += " text-slate-300";
              } else if (isPast) {
                circleClasses += " bg-slate-800 border-slate-700/50";
                textClasses += " text-slate-600";
              } else {
                circleClasses += " bg-transparent border-slate-700/50";
                textClasses += " text-slate-500";
              }

              return (
                <div key={dateStr} className="flex flex-col items-center">
                  <div className={circleClasses}>
                    {isCheckedIn ? (
                      <Check className="w-5 h-5 text-white" strokeWidth={3} />
                    ) : isToday && !isCheckedIn ? (
                      <div className="w-2 h-2 rounded-full bg-orange-500/50"></div>
                    ) : null}
                  </div>
                  <span className={textClasses}>{dayName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* XP Bonus Notice */}
        {profile.currentStreak > 0 && (
          <div className="w-full p-3 rounded-2xl bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 border border-yellow-500/30 flex items-center justify-center gap-2 mb-8">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-bold text-yellow-400">+{xpBonus} EXP for your consistency!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <button
            onClick={handleShare}
            className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            {copied ? 'Copied to Clipboard!' : 'Share Milestone'}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition cursor-pointer"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

