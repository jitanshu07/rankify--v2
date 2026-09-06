import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CalendarClock, 
  Target, 
  Star, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Check 
} from 'lucide-react';

export const TrackerScreen: React.FC = () => {
  const { chapters, toggleChapterCompletion, profile } = useApp();

  // Countdown timer state
  const [timeLeftMain, setTimeLeftMain] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [timeLeftAdv, setTimeLeftAdv] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const targetYear = profile.targetYear || 2027;
      
      // Estimated dates
      const mainTarget = new Date(targetYear, 0, 24, 9, 0, 0); // Jan 24 9:00 AM of Target Year
      const advTarget = new Date(targetYear, 4, 25, 9, 0, 0);  // May 25 9:00 AM of Target Year

      const diffM = Math.max(0, mainTarget.getTime() - now.getTime());
      const diffA = Math.max(0, advTarget.getTime() - now.getTime());

      setTimeLeftMain({
        days: Math.floor(diffM / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diffM / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diffM / (1000 * 60)) % 60),
        seconds: Math.floor((diffM / 1000) % 60),
      });

      setTimeLeftAdv({
        days: Math.floor(diffA / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diffA / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diffA / (1000 * 60)) % 60),
        seconds: Math.floor((diffA / 1000) % 60),
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // High weightage chapters
  const highWeightageChapters = chapters.filter((c) => c.weightage === 'High');
  const highCompleted = highWeightageChapters.filter((c) => c.isCompleted).length;
  const highProgress = highWeightageChapters.length > 0
    ? Math.round((highCompleted / highWeightageChapters.length) * 100)
    : 0;

  // Class 11 vs 12
  const c11 = chapters.filter((c) => c.classGrade === 'Class 11');
  const c11Done = c11.filter((c) => c.isCompleted).length;
  const c11Pct = c11.length > 0 ? Math.round((c11Done / c11.length) * 100) : 0;

  const c12 = chapters.filter((c) => c.classGrade === 'Class 12');
  const c12Done = c12.filter((c) => c.isCompleted).length;
  const c12Pct = c12.length > 0 ? Math.round((c12Done / c12.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#121A27] to-slate-900 border border-slate-800">
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <CalendarClock className="w-6 h-6 text-cyan-400" />
          Exam Milestones & Countdown Tracker
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Real-time countdown to JEE Main Session 1 and JEE Advanced, alongside high-yield chapter velocity.
        </p>
      </div>

      {/* Countdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* JEE Main */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-[#121A27] to-slate-900/90 border border-cyan-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              Target Milestone 1
            </span>
            <span className="text-xs text-slate-400">January Session (Tentative)</span>
          </div>

          <h2 className="text-xl font-bold text-white">JEE Main Session 1</h2>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">{timeLeftMain.days}</div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Days</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">{timeLeftMain.hours}</div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Hours</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">{timeLeftMain.minutes}</div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Mins</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">{timeLeftMain.seconds}</div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Secs</span>
            </div>
          </div>
        </div>

        {/* JEE Advanced */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-[#121A27] to-slate-900/90 border border-amber-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              Target Milestone 2
            </span>
            <span className="text-xs text-slate-400">May (Final Gateway to IITs)</span>
          </div>

          <h2 className="text-xl font-bold text-white">JEE Advanced</h2>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">{timeLeftAdv.days}</div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Days</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">{timeLeftAdv.hours}</div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Hours</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">{timeLeftAdv.minutes}</div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Mins</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">{timeLeftAdv.seconds}</div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Secs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Class 11 vs Class 12 Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Class 11 */}
        <div className="p-5 rounded-2xl bg-[#121A27] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">Class 11 Foundation Mastery</h3>
            </div>
            <span className="font-mono font-bold text-cyan-400 text-sm">{c11Pct}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: `${c11Pct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{c11Done} of {c11.length} Chapters Mastered</span>
            <span>{c11.length - c11Done} Pending</span>
          </div>
        </div>

        {/* Class 12 */}
        <div className="p-5 rounded-2xl bg-[#121A27] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-white text-sm">Class 12 Boards & Advanced</h3>
            </div>
            <span className="font-mono font-bold text-purple-400 text-sm">{c12Pct}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${c12Pct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{c12Done} of {c12.length} Chapters Mastered</span>
            <span>{c12.length - c12Done} Pending</span>
          </div>
        </div>
      </div>

      {/* High-Weightage Chapters Mastery Checklist */}
      <div className="p-5 rounded-3xl bg-[#121A27] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              High-Weightage Chapters Checklist
            </h2>
            <p className="text-xs text-slate-400">
              These {highWeightageChapters.length} chapters make up over 70% of the JEE Main question paper.
            </p>
          </div>
          <div className="text-xs font-mono font-bold text-amber-400 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 w-fit">
            {highCompleted} / {highWeightageChapters.length} Done ({highProgress}%)
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {highWeightageChapters.map((ch) => (
            <div
              key={ch.id}
              onClick={() => toggleChapterCompletion(ch.id)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border transition cursor-pointer select-none ${
                ch.isCompleted
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-300'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-100'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-md border flex items-center justify-center transition flex-shrink-0 ${
                  ch.isCompleted ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600'
                }`}
              >
                {ch.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate">{ch.name}</div>
                <div className="text-[10px] text-slate-400">{ch.subject} • {ch.classGrade}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
