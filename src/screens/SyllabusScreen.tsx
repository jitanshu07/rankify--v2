import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Filter, 
  Star, 
  RotateCcw, 
  Check, 
  BookOpen, 
  Sparkles,
  Layers,
  FileCheck2
} from 'lucide-react';

export const SyllabusScreen: React.FC = () => {
  const { 
    chapters, 
    trackingStateMap, 
    toggleChapterCompletion, 
    incrementChapterRevision, 
    resetChapterRevision, 
    toggleChapterNotes, 
    toggleChapterDpp, 
    toggleChapterTest 
  } = useApp();

  const [selectedSubject, setSelectedSubject] = useState<'All' | 'Physics' | 'Chemistry' | 'Mathematics'>('All');
  const [selectedClass, setSelectedClass] = useState<'All' | 'Class 11' | 'Class 12'>('All');
  const [selectedWeightage, setSelectedWeightage] = useState<'All' | 'High'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic
  const filteredChapters = chapters.filter((chapter) => {
    if (selectedSubject !== 'All' && chapter.subject !== selectedSubject) return false;
    if (selectedClass !== 'All' && chapter.classGrade !== selectedClass) return false;
    if (selectedWeightage === 'High' && chapter.weightage !== 'High') return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        chapter.name.toLowerCase().includes(q) ||
        chapter.subject.toLowerCase().includes(q) ||
        chapter.classGrade.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalFiltered = filteredChapters.length;
  const completedFiltered = filteredChapters.filter((c) => c.isCompleted).length;
  const filterProgress = totalFiltered > 0 ? Math.round((completedFiltered / totalFiltered) * 100) : 0;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in overscroll-contain">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#121A27] to-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            IIT JEE Syllabus Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete PCM official curriculum with 4-pillar chapter tracking: Revision, Notes, DPP & Tests.
          </p>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/30">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Current View Progress</div>
            <div className="text-xl font-mono font-black text-cyan-400">
              {filterProgress}% <span className="text-xs font-normal text-slate-400">({completedFiltered}/{totalFiltered})</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-cyan-400 flex items-center justify-center font-bold text-xs font-mono text-white">
            {filterProgress}%
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#121A27] border border-slate-800 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search chapters (e.g., Rotational Motion, Thermodynamics, Calculus)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800/80">
            {(['All', 'Physics', 'Chemistry', 'Mathematics'] as const).map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedSubject === subj
                    ? subj === 'Physics'
                      ? 'bg-blue-600 text-white'
                      : subj === 'Chemistry'
                      ? 'bg-pink-600 text-white'
                      : subj === 'Mathematics'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>

          {/* Class Grade Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800/80">
            {(['All', 'Class 11', 'Class 12'] as const).map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedClass === cls
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>

          {/* Weightage Toggle */}
          <button
            onClick={() => setSelectedWeightage(selectedWeightage === 'All' ? 'High' : 'All')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              selectedWeightage === 'High'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/10'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${selectedWeightage === 'High' ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>High Weightage Only</span>
          </button>
        </div>
      </div>

      {/* Chapter Cards List */}
      <div className="space-y-3">
        {filteredChapters.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#121A27] border border-slate-800 text-slate-400 space-y-2">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold">No chapters found matching your filters</p>
            <p className="text-xs text-slate-500">Try clearing the search query or changing filters.</p>
          </div>
        ) : (
          filteredChapters.map((chapter) => {
            const tracking = trackingStateMap[chapter.id] || {
              revisionCount: 0,
              notesDone: false,
              dppDone: false,
              testDone: false,
            };

            const isPhys = chapter.subject === 'Physics';
            const isChem = chapter.subject === 'Chemistry';
            const isMath = chapter.subject === 'Mathematics';

            const subjectBadgeColor = isPhys
              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
              : isChem
              ? 'bg-pink-500/15 text-pink-400 border-pink-500/30'
              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';

            return (
              <div
                key={chapter.id}
                className={`rounded-2xl border transition-all p-4 ${
                  chapter.isCompleted
                    ? 'bg-[#121A27]/80 border-slate-800/80 opacity-90'
                    : 'bg-[#121A27] border-slate-800 hover:border-slate-700 shadow-md'
                }`}
              >
                {/* Header Row: Checkbox + Name + Badges */}
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleChapterCompletion(chapter.id)}
                    className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                      chapter.isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                        : 'border-slate-600 hover:border-cyan-400 bg-slate-900/80'
                    }`}
                  >
                    {chapter.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${subjectBadgeColor}`}>
                        {chapter.subject}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                        {chapter.classGrade}
                      </span>
                      {chapter.weightage === 'High' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          High Weightage
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-sm sm:text-base font-semibold transition ${
                        chapter.isCompleted ? 'text-slate-400 line-through' : 'text-slate-100'
                      }`}
                    >
                      {chapter.name}
                    </h3>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-800/80 my-3" />

                {/* 4 Interactive Tracking Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {/* Revision Pill */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => incrementChapterRevision(chapter.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer select-none ${
                        tracking.revisionCount > 0
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                      title="Click to increment revision count"
                    >
                      <RotateCcw className="w-3 h-3 text-cyan-400" />
                      <span>{tracking.revisionCount > 0 ? `${tracking.revisionCount}x Rev` : 'Revision'}</span>
                    </button>
                    {tracking.revisionCount > 0 && (
                      <button
                        onClick={() => resetChapterRevision(chapter.id)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition"
                        title="Reset revision count"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>

                  {/* Notes Pill */}
                  <button
                    onClick={() => toggleChapterNotes(chapter.id)}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer select-none ${
                      tracking.notesDone
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {tracking.notesDone && <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />}
                    <span>Notes</span>
                  </button>

                  {/* DPP Pill */}
                  <button
                    onClick={() => toggleChapterDpp(chapter.id)}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer select-none ${
                      tracking.dppDone
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {tracking.dppDone && <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />}
                    <span>DPP</span>
                  </button>

                  {/* Test Pill */}
                  <button
                    onClick={() => toggleChapterTest(chapter.id)}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer select-none ${
                      tracking.testDone
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {tracking.testDone && <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />}
                    <span>Test</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
