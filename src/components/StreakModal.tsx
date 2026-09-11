import React, { useState, useEffect } from 'react';
import { useApp, getLogicalDate } from '../context/AppContext';
import { Flame, Check, Share2, X, Trophy, Target, Gift, PartyPopper } from 'lucide-react';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Flag = ({ x, y, value, isCurrent, isNext }: { x: number, y: number, value: number, isCurrent: boolean, isNext: boolean }) => (
  <div className="absolute" style={{ left: x, top: y, transform: 'translate(0, -100%)' }}>
    <div className="flex">
      {/* Pole */}
      <div className="w-1.5 h-20 bg-slate-950 rounded-t-sm shadow-[2px_0_5px_rgba(0,0,0,0.5)] z-10" />
      {/* Banner */}
      <div className={`relative flex items-center justify-center -ml-0.5 mt-1 z-0 shadow-xl
        ${isCurrent ? 'bg-orange-500 text-white' : isNext ? 'bg-slate-700/80 text-slate-300 backdrop-blur-sm' : 'bg-blue-600 text-white'}`}
        style={{ 
          clipPath: 'polygon(0% 0%, 100% 0%, 85% 50%, 100% 100%, 0% 100%)',
          width: '70px',
          height: '44px',
        }}
      >
        <span className="pr-3 font-black text-xl tracking-tighter drop-shadow-md">{value}</span>
      </div>
    </div>
  </div>
);

export const StreakModal: React.FC<StreakModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useApp();
  const [copied, setCopied] = useState(false);
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [panned, setPanned] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPanned(false);
      setShowBanner(false);
      setCopied(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 2) {
      const t1 = setTimeout(() => setPanned(true), 100);
      const t2 = setTimeout(() => setShowBanner(true), 2500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [step]);

  if (!isOpen) return null;

  // Milestone logic
  const milestonesList = [0, 3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 250, 300, 365, 500, 1000];
  const currentStreak = profile.currentStreak;
  
  const currentMilestone = currentStreak;
  const nextMilestone = milestonesList.find(m => m > currentStreak) || currentStreak + 10;
  const prevMilestones = milestonesList.filter(m => m < currentStreak);
  const prevMilestone = prevMilestones.length > 0 ? prevMilestones[prevMilestones.length - 1] : 0;

  // Calculate current week dates (Mon-Sun)
  const getWeekDates = () => {
    const logicalTodayStr = getLogicalDate();
    const logicalToday = new Date(logicalTodayStr);
    
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
      
      {/* STEP 1: Main Streak Overview */}
      {step === 1 && (
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
                
                const diffFromToday = Math.floor((new Date(todayStr).getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
                const isCheckedIn = (() => {
                   if (diffFromToday < 0) return false;
                   if (diffFromToday === 0) return profile.lastActiveDate === todayStr && profile.currentStreak > 0;
                   if (profile.lastActiveDate === todayStr) {
                       return diffFromToday < profile.currentStreak;
                   } else {
                       const lastActiveDiff = Math.floor((new Date(todayStr).getTime() - new Date(profile.lastActiveDate).getTime()) / (1000 * 60 * 60 * 24));
                       if (lastActiveDiff === 1 && diffFromToday === 1) return profile.currentStreak > 0;
                       if (lastActiveDiff === 1) return (diffFromToday - 1) < profile.currentStreak;
                       return false; // Streak lost or old
                   }
                })();

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
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-500/25 transition cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Mountain Journey Animation */}
      {step === 2 && (
        <div className="relative w-full max-w-sm h-[600px] overflow-hidden rounded-[2rem] bg-slate-900 border border-slate-700/60 shadow-2xl animate-pop-in">
          <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer z-50">
            <X className="w-5 h-5" />
          </button>
          
          <div className="absolute top-1/2 left-1/2 w-0 h-0">
            <div 
              className="absolute transition-transform duration-[2500ms] ease-in-out"
              style={{
                width: 1000,
                height: 1200,
                transform: panned ? 'translate(-500px, -450px) scale(1)' : 'translate(-200px, -750px) scale(1.15)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] to-[#1E293B]" />
              
              {/* Sun/Moon */}
              <div className="absolute top-[300px] left-[600px] w-40 h-40 rounded-full bg-orange-500/10 blur-3xl" />
              <div className="absolute top-[340px] left-[640px] w-16 h-16 rounded-full bg-orange-200/80 shadow-[0_0_40px_rgba(253,186,116,0.6)]" />

              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                {/* Mountains (Back) */}
                <polygon points="0,1200 200,600 450,900 750,400 1000,700 1000,1200" fill="#1e293b" />
                <polygon points="200,600 450,900 350,1200" fill="#0f172a" opacity="0.3" />
                
                {/* Mid */}
                <polygon points="-100,1200 250,750 500,1000 800,500 1100,1200" fill="#334155" />
                <polygon points="250,750 500,1000 400,1200" fill="#1e293b" opacity="0.4" />
                
                {/* F3 Peak (Next) - 750, 200 */}
                <polygon points="500,1200 750,200 1000,1200" fill="#475569" />
                <polygon points="750,200 1000,1200 850,1200" fill="#334155" />
                <polygon points="750,200 700,400 760,450 820,380" fill="#cbd5e1" opacity="0.9" />

                {/* F2 Peak (Current) - 500, 500 */}
                <polygon points="150,1200 500,500 850,1200" fill="#64748b" />
                <polygon points="500,500 850,1200 650,1200" fill="#475569" />
                <polygon points="500,500 430,700 520,750 590,650" fill="#f1f5f9" opacity="0.9" />
                
                {/* F1 Peak (Prev) - 200, 800 */}
                <polygon points="-100,1200 200,800 500,1200" fill="#94a3b8" />
                <polygon points="200,800 500,1200 350,1200" fill="#64748b" />
                <polygon points="200,800 140,950 220,1000 270,900" fill="#ffffff" />
              </svg>

              <Flag x={200} y={800} value={prevMilestone} isCurrent={false} isNext={false} />
              <Flag x={500} y={500} value={currentMilestone} isCurrent={true} isNext={false} />
              <Flag x={750} y={200} value={nextMilestone} isCurrent={false} isNext={true} />
            </div>
          </div>

          {/* Banner Overlay */}
          <div className={`absolute bottom-6 left-5 right-5 transition-all duration-700 ease-out z-20 ${showBanner ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-5 rounded-2xl shadow-2xl text-center flex flex-col gap-3">
              <div className="flex items-center justify-center gap-2 text-white font-bold text-lg">
                <Target className="w-5 h-5 text-cyan-400" />
                Next Milestone: {nextMilestone} Days
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Stay sharp & keep your streak alive.<br/>The next milestone is closer than you think!
              </p>
              <button
                onClick={() => setStep(3)}
                className="mt-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-slate-200 to-white text-slate-900 font-black uppercase tracking-widest shadow-lg hover:opacity-90 transition cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Final Reward Summary */}
      {step === 3 && (
        <div className="relative w-full max-w-sm rounded-[2rem] bg-[#121A27] border border-slate-700/60 p-8 shadow-2xl shadow-orange-500/10 flex flex-col items-center animate-pop-in text-center">
          <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer z-10">
            <X className="w-5 h-5" />
          </button>

          <div className="w-24 h-24 mb-6 mt-4 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/30 flex items-center justify-center border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse">
            <Gift className="w-12 h-12 text-emerald-400" />
          </div>
          
          <h2 className="text-3xl font-black text-white mb-2 tracking-wide">Reward Unlocked!</h2>
          <p className="text-slate-400 mb-8 text-sm">Your consistency has earned you a special bonus.</p>

          <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-yellow-500/5 blur-xl"></div>
            <div className="relative flex items-center justify-center gap-3">
              <PartyPopper className="w-6 h-6 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">+{profile.currentStreak * 10} EXP</span>
            </div>
            <div className="text-[10px] font-semibold text-slate-500 mt-2 uppercase tracking-widest">Milestone Bonus Added</div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-sm transition shadow-lg cursor-pointer"
          >
            Awesome!
          </button>
        </div>
      )}
    </div>
  );
};


