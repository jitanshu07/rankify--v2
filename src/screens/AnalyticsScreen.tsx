import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw,
  Sparkles,
  BookOpen,
  Flame,
  Calendar,
  Smile
} from 'lucide-react';

export const AnalyticsScreen: React.FC = () => {
  const { chapters, trackingStateMap, sessions, errors, todos, profile } = useApp();

  // 1. Study time distribution
  const physSeconds = sessions.filter((s) => s.subject === 'Physics').reduce((a, b) => a + b.durationSeconds, 0);
  const chemSeconds = sessions.filter((s) => s.subject === 'Chemistry').reduce((a, b) => a + b.durationSeconds, 0);
  const mathSeconds = sessions.filter((s) => s.subject === 'Mathematics').reduce((a, b) => a + b.durationSeconds, 0);
  const genSeconds = sessions.filter((s) => s.subject === 'General').reduce((a, b) => a + b.durationSeconds, 0);
  const totalSeconds = physSeconds + chemSeconds + mathSeconds + genSeconds;

  const physPct = totalSeconds > 0 ? Math.round((physSeconds / totalSeconds) * 100) : 33;
  const chemPct = totalSeconds > 0 ? Math.round((chemSeconds / totalSeconds) * 100) : 33;
  const mathPct = totalSeconds > 0 ? Math.round((mathSeconds / totalSeconds) * 100) : 34;

  // 2. Syllabus Mastery
  const totalChapters = chapters.length;
  const completedChapters = chapters.filter((c) => c.isCompleted).length;
  const syllabusPct = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  // 3. Revisions distribution
  let rev0 = 0, rev1 = 0, rev2 = 0, rev3plus = 0;
  chapters.forEach((ch) => {
    const revCount = trackingStateMap[ch.id]?.revisionCount || 0;
    if (revCount === 0) rev0++;
    else if (revCount === 1) rev1++;
    else if (revCount === 2) rev2++;
    else rev3plus++;
  });

  // 4. Mistakes distribution
  const mistakeCounts: Record<string, number> = {
    Conceptual: 0,
    Calculation: 0,
    'Misread Question': 0,
    'Formula Forgotten': 0,
    'Time Pressure': 0,
  };
  errors.forEach((err) => {
    if (mistakeCounts[err.mistakeType] !== undefined) {
      mistakeCounts[err.mistakeType]++;
    }
  });

  // 5. Todo completion rate
  const completedTodos = todos.filter((t) => t.isCompleted).length;
  const todoPct = todos.length > 0 ? Math.round((completedTodos / todos.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in overscroll-contain">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#121A27] to-slate-900 border border-slate-800">
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          Prep Velocity & Advanced Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Objective diagnostic metrics to identify blind spots, subject asymmetry, and revision retention.
        </p>
      </div>

      {/* Top Level Diagnostic Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#121A27] border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Tracked Hours</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400 mt-1">
            {(totalSeconds / 3600).toFixed(1)} <span className="text-sm font-normal text-slate-400">hrs</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{sessions.length} study sessions logged</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121A27] border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Syllabus Coverage</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
            {syllabusPct}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{completedChapters} of {totalChapters} chapters</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121A27] border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Task Execution</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-purple-400 mt-1">
            {todoPct}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{completedTodos} of {todos.length} cleared</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121A27] border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Error Book Resolution</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-1">
            {errors.length > 0 ? Math.round((errors.filter((e) => e.isResolved).length / errors.length) * 100) : 100}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{errors.filter((e) => e.isResolved).length} resolved</div>
        </div>
      </div>

      {/* PCM Study Time Asymmetry */}
      <div className="p-6 rounded-3xl bg-[#121A27] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            PCM Study Time Balance
          </h2>
          <span className="text-xs text-slate-400">Aim for an equal 33% - 33% - 33% equilibrium</span>
        </div>

        {/* Stacked bar */}
        <div className="w-full h-4 rounded-full bg-slate-800 overflow-hidden flex">
          <div style={{ width: `${physPct}%` }} className="bg-blue-500 h-full transition-all" title={`Physics: ${physPct}%`} />
          <div style={{ width: `${chemPct}%` }} className="bg-pink-500 h-full transition-all" title={`Chemistry: ${chemPct}%`} />
          <div style={{ width: `${mathPct}%` }} className="bg-emerald-500 h-full transition-all" title={`Math: ${mathPct}%`} />
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2 text-center text-xs">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <span className="font-bold text-blue-400 block">Physics</span>
            <div className="text-lg font-black font-mono text-white mt-0.5">{physPct}%</div>
            <span className="text-[10px] text-slate-400">{(physSeconds / 3600).toFixed(1)} hrs</span>
          </div>

          <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20">
            <span className="font-bold text-pink-400 block">Chemistry</span>
            <div className="text-lg font-black font-mono text-white mt-0.5">{chemPct}%</div>
            <span className="text-[10px] text-slate-400">{(chemSeconds / 3600).toFixed(1)} hrs</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="font-bold text-emerald-400 block">Mathematics</span>
            <div className="text-lg font-black font-mono text-white mt-0.5">{mathPct}%</div>
            <span className="text-[10px] text-slate-400">{(mathSeconds / 3600).toFixed(1)} hrs</span>
          </div>
        </div>
      </div>

      {/* Two Column: Revision Frequency & Error Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revision Funnel */}
        <div className="p-6 rounded-3xl bg-[#121A27] border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-cyan-400" />
            Chapter Revision Velocity
          </h2>
          <p className="text-xs text-slate-400">
            To score AIR &lt; 500, every chapter must be revised at least 3 times before exam week.
          </p>

          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-semibold">3+ Revisions (Exam Ready)</span>
                <span className="font-mono text-cyan-400 font-bold">{rev3plus} Chapters</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${(rev3plus / totalChapters) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-semibold">2 Revisions (Consolidating)</span>
                <span className="font-mono text-blue-400 font-bold">{rev2} Chapters</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(rev2 / totalChapters) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-semibold">1 Revision (First Review)</span>
                <span className="font-mono text-purple-400 font-bold">{rev1} Chapters</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-purple-400 rounded-full" style={{ width: `${(rev1 / totalChapters) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-semibold">0 Revisions (Pending 1st Pass)</span>
                <span className="font-mono text-slate-500 font-bold">{rev0} Chapters</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-slate-700 rounded-full" style={{ width: `${(rev0 / totalChapters) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Error Types Breakdown */}
        <div className="p-6 rounded-3xl bg-[#121A27] border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Mock Mistake Classification
          </h2>
          <p className="text-xs text-slate-400">
            Identify which psychological and conceptual factors lose you negative marks.
          </p>

          <div className="space-y-3 pt-1">
            {Object.entries(mistakeCounts).map(([type, count]) => {
              const maxCount = Math.max(1, errors.length);
              const pct = Math.round((count / maxCount) * 100);

              return (
                <div key={type}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-semibold">{type}</span>
                    <span className="font-mono text-rose-400 font-bold">{count} Questions</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
