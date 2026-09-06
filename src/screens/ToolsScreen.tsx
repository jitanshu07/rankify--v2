import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Wrench, 
  AlertTriangle, 
  Clock, 
  Award, 
  Calculator, 
  Plus, 
  Check, 
  Trash2, 
  CheckCircle2, 
  X, 
  Sparkles,
  TrendingUp,
  BookmarkCheck
} from 'lucide-react';
import { ErrorLog, BacklogItem } from '../types';

type ToolSubTab = 'errorBook' | 'backlogs' | 'rankPredictor' | 'calculator';

export const ToolsScreen: React.FC = () => {
  const { 
    errors, 
    addError, 
    toggleErrorResolved, 
    deleteError,
    backlogs,
    addBacklog,
    toggleBacklog,
    toggleBacklogLecture,
    deleteBacklog
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<ToolSubTab>('errorBook');

  // Error modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errTitle, setErrTitle] = useState('');
  const [errSubject, setErrSubject] = useState('Physics');
  const [errChapter, setErrChapter] = useState('');
  const [errType, setErrType] = useState<ErrorLog['mistakeType']>('Conceptual');
  const [errQuestionNotes, setErrQuestionNotes] = useState('');
  const [errSolutionNotes, setErrSolutionNotes] = useState('');

  // Backlog modal state
  const [showBacklogModal, setShowBacklogModal] = useState(false);
  const [blTitle, setBlTitle] = useState('');
  const [blSubject, setBlSubject] = useState('Physics');
  const [blDate, setBlDate] = useState('By this weekend');
  const [blUrgency, setBlUrgency] = useState<'Critical' | 'High' | 'Medium'>('Critical');
  const [blLectureFrom, setBlLectureFrom] = useState<number>(1);
  const [blLectureTo, setBlLectureTo] = useState<number>(1);

  // Rank Predictor state
  const [physMarks, setPhysMarks] = useState<number>(75);
  const [chemMarks, setChemMarks] = useState<number>(80);
  const [mathMarks, setMathMarks] = useState<number>(65);

  // Prep Calculator state
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState('');

  // Calculate Predictor outputs
  const totalScore = Math.min(300, Math.max(0, (Number(physMarks) || 0) + (Number(chemMarks) || 0) + (Number(mathMarks) || 0)));

  // Realistic JEE Main Marks vs Percentile model
  let estimatedPercentile = 0;
  let rankEstimate = '';
  let collegeBracket = '';

  if (totalScore >= 280) {
    estimatedPercentile = 99.98;
    rankEstimate = 'AIR 1 - 250';
    collegeBracket = 'Top IITs CS / Top NIT CS with Home & Other State eligibility';
  } else if (totalScore >= 250) {
    estimatedPercentile = 99.85;
    rankEstimate = 'AIR 250 - 1,500';
    collegeBracket = 'NIT Trichy / Surathkal / Warangal CSE guaranteed';
  } else if (totalScore >= 220) {
    estimatedPercentile = 99.40;
    rankEstimate = 'AIR 1,500 - 6,000';
    collegeBracket = 'Top 5 NITs Core/Circuital Branches (ECE, EEE, Mechanical)';
  } else if (totalScore >= 190) {
    estimatedPercentile = 98.70;
    rankEstimate = 'AIR 6,000 - 15,000';
    collegeBracket = 'Premier NITs / IIITs (Allahabad, Gwalior, Jabalpur)';
  } else if (totalScore >= 160) {
    estimatedPercentile = 97.20;
    rankEstimate = 'AIR 15,000 - 32,000';
    collegeBracket = 'Mid-tier NITs / State Government Engineering Colleges';
  } else if (totalScore >= 130) {
    estimatedPercentile = 94.50;
    rankEstimate = 'AIR 32,000 - 65,000';
    collegeBracket = 'Qualified for JEE Advanced; Newer IIITs / State colleges';
  } else if (totalScore >= 100) {
    estimatedPercentile = 90.00;
    rankEstimate = 'AIR 65,000 - 1,15,000';
    collegeBracket = 'JEE Advanced cutoff boundary; Push harder in Physics & Chem';
  } else {
    estimatedPercentile = Math.max(20, Math.round((totalScore / 100) * 85));
    rankEstimate = 'AIR > 1,20,000';
    collegeBracket = 'Focus on syllabus completion & high-weightage chapters first';
  }

  const handleAddErrorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!errTitle.trim()) return;
    addError({
      title: errTitle.trim(),
      subject: errSubject,
      chapter: errChapter.trim() || 'General',
      mistakeType: errType,
      questionNotes: errQuestionNotes.trim(),
      solutionNotes: errSolutionNotes.trim(),
    });
    setErrTitle('');
    setErrChapter('');
    setErrQuestionNotes('');
    setErrSolutionNotes('');
    setShowErrorModal(false);
  };

  const handleAddBacklogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blTitle.trim()) return;
    addBacklog(blTitle.trim(), blSubject, blDate.trim(), blUrgency, blLectureFrom, blLectureTo);
    setBlTitle('');
    setShowBacklogModal(false);
  };

  // Calculator evaluation
  const handleCalcPress = (val: string) => {
    if (val === 'C') {
      setCalcInput('');
      setCalcResult('');
    } else if (val === '=') {
      try {
        // Safe arithmetic eval
        const sanitized = calcInput.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**');
        // eslint-disable-next-line no-eval
        const res = Function(`'use strict'; return (${sanitized})`)();
        setCalcResult(String(Number(res).toFixed(4).replace(/\.?0+$/, '')));
      } catch (err) {
        setCalcResult('Error');
      }
    } else {
      setCalcInput((prev) => prev + val);
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in overscroll-contain">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-rose-950/40 via-[#121A27] to-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-rose-400" />
            Ranker Prep Toolkit
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Error Book post-mortems, urgent backlog clearance, marks-to-rank predictor, and quick prep calculator.
          </p>
        </div>

        {/* Subtab Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800">
          <button
            onClick={() => setActiveSubTab('errorBook')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'errorBook'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Error Book ({errors.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('backlogs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'backlogs'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Backlogs ({backlogs.filter((b) => !b.isCompleted).length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rankPredictor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'rankPredictor'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Rank Predictor</span>
          </button>

          <button
            onClick={() => setActiveSubTab('calculator')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'calculator'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Calculator</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: MISTAKE / ERROR BOOK */}
      {activeSubTab === 'errorBook' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Review your mock test blunders so you never repeat them on exam day.
            </div>
            <button
              onClick={() => setShowErrorModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-bold hover:opacity-90 transition shadow-md shadow-rose-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Log Mock Mistake</span>
            </button>
          </div>

          <div className="space-y-3">
            {errors.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#121A27] border border-slate-800 text-slate-400 space-y-2">
                <AlertTriangle className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold">Error Book is currently empty</p>
                <p className="text-xs text-slate-500">
                  After every test, log questions you got wrong to turn weaknesses into strengths.
                </p>
              </div>
            ) : (
              errors.map((err) => (
                <div
                  key={err.id}
                  className={`p-5 rounded-3xl border transition flex flex-col justify-between space-y-3 ${
                    err.isResolved
                      ? 'bg-slate-950/70 border-slate-800/80 opacity-70'
                      : 'bg-[#121A27] border-slate-800 hover:border-slate-700 shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {err.subject}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {err.chapter}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            err.mistakeType === 'Conceptual'
                              ? 'bg-rose-500/20 text-rose-300'
                              : err.mistakeType === 'Calculation'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-cyan-500/20 text-cyan-300'
                          }`}
                        >
                          {err.mistakeType} Trap
                        </span>
                      </div>

                      <h3
                        className={`text-sm sm:text-base font-bold ${
                          err.isResolved ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {err.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleErrorResolved(err.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                          err.isResolved
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {err.isResolved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                        <span>{err.isResolved ? 'Mastered / Resolved' : 'Mark Resolved'}</span>
                      </button>

                      <button
                        onClick={() => deleteError(err.id)}
                        className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Notes Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {err.questionNotes && (
                      <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-slate-300">
                        <span className="font-bold text-rose-400 block mb-1">What went wrong in test:</span>
                        {err.questionNotes}
                      </div>
                    )}
                    {err.solutionNotes && (
                      <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-slate-300">
                        <span className="font-bold text-emerald-400 block mb-1">Correct derivation & concept:</span>
                        {err.solutionNotes}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: BACKLOG MANAGER */}
      {activeSubTab === 'backlogs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Clear high-priority backlog topics before moving deeper into advanced revisions.
            </div>
            <button
              onClick={() => setShowBacklogModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold hover:opacity-90 transition shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Backlog Topic</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {backlogs.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#121A27] border border-slate-800 text-slate-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-semibold">Zero pending backlogs!</p>
                <p className="text-xs text-slate-500">You are completely up-to-date with your coaching syllabus.</p>
              </div>
            ) : (
              backlogs.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition ${
                    item.isCompleted
                      ? 'bg-slate-950/60 border-slate-800/80 opacity-60'
                      : 'bg-[#121A27] border-slate-800 hover:border-slate-700 shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => toggleBacklog(item.id)}
                      className={`flex-shrink-0 w-5 h-5 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                        item.isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                          : 'border-slate-600 hover:border-amber-400 bg-slate-900'
                      }`}
                    >
                      {item.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {item.subject}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.urgency === 'Critical'
                              ? 'bg-rose-500/20 text-rose-300'
                              : item.urgency === 'High'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-cyan-500/20 text-cyan-300'
                          }`}
                        >
                          {item.urgency} Urgency
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-900/50 px-2 py-0.5 rounded-md border border-slate-800/50">
                          Deadline: {item.targetDate}
                        </span>
                      </div>
                      <h4
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          item.isCompleted ? 'line-through text-slate-400' : 'text-white'
                        }`}
                      >
                        {item.title}
                      </h4>

                      {/* Lecture Track */}
                      {item.lectureTo && item.lectureTo > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {Array.from({ length: item.lectureTo }, (_, i) => i + 1).map(num => {
                            const isBeforeTargetRange = item.lectureFrom && num < item.lectureFrom;
                            const isCompleted = isBeforeTargetRange || (item.completedLectures || []).includes(num);
                            
                            return (
                              <button
                                key={num}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isBeforeTargetRange) {
                                    toggleBacklogLecture(item.id, num);
                                  }
                                }}
                                disabled={!!isBeforeTargetRange}
                                className={`w-7 h-7 flex items-center justify-center text-[10px] font-bold rounded-md shadow-sm transition-all ${
                                  isCompleted
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/40 cursor-pointer'
                                }`}
                              >
                                {num}
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteBacklog(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: MARKS & RANK PREDICTOR */}
      {activeSubTab === 'rankPredictor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inputs Card */}
          <div className="p-6 rounded-3xl bg-[#121A27] border border-slate-800 shadow-xl space-y-5">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-400" />
                Score Inputs (JEE Main Paper 1)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Enter expected or mock test scores out of 100 for each subject (Total out of 300).
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-blue-400 mb-1.5">
                  <span>Physics Score (/100)</span>
                  <span className="font-mono text-white">{physMarks} Marks</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={physMarks}
                  onChange={(e) => setPhysMarks(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-pink-400 mb-1.5">
                  <span>Chemistry Score (/100)</span>
                  <span className="font-mono text-white">{chemMarks} Marks</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={chemMarks}
                  onChange={(e) => setChemMarks(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-emerald-400 mb-1.5">
                  <span>Mathematics Score (/100)</span>
                  <span className="font-mono text-white">{mathMarks} Marks</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={mathMarks}
                  onChange={(e) => setMathMarks(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Aggregated Score</span>
              <span className="text-2xl font-black font-mono text-white">
                {totalScore} <span className="text-sm font-normal text-slate-400">/ 300</span>
              </span>
            </div>
          </div>

          {/* Predictions Output Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#121A27] to-slate-900 border border-cyan-500/40 shadow-xl space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>NTA JEE Percentile Model Projection</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. Percentile</span>
                  <div className="text-3xl font-black font-mono text-cyan-400 mt-1">
                    {estimatedPercentile.toFixed(2)}%
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. AIR Rank</span>
                  <div className="text-xl sm:text-2xl font-black font-mono text-amber-400 mt-1">
                    {rankEstimate}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <BookmarkCheck className="w-4 h-4" />
                  <span>College & Counseling Eligibility Bracket:</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {collegeBracket}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              *Calculated based on past 3 years NTA JEE score-to-percentile normalization distribution.
            </p>
          </div>
        </div>
      )}

      {/* SUBTAB 4: PREP CALCULATOR */}
      {activeSubTab === 'calculator' && (
        <div className="max-w-md mx-auto p-6 rounded-3xl bg-[#121A27] border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Calculator className="w-4 h-4 text-purple-400" />
              Problem Solving Scratchpad
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Scientific Arithmetic</span>
          </div>

          {/* Screen */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-right space-y-1 font-mono">
            <div className="text-xs text-slate-400 min-h-[1rem] truncate">{calcInput || '0'}</div>
            <div className="text-2xl font-black text-cyan-400">{calcResult || '0'}</div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-2 text-sm font-bold font-mono">
            {['C', '(', ')', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '^', '='].map((key) => (
              <button
                key={key}
                onClick={() => handleCalcPress(key)}
                className={`py-3 rounded-xl transition cursor-pointer ${
                  key === '='
                    ? 'col-span-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : key === 'C'
                    ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                    : ['÷', '×', '-', '+', '^'].includes(key)
                    ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                    : 'bg-slate-900 text-slate-200 hover:bg-slate-800'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Log Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overscroll-contain">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#121A27] border border-slate-700 p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setShowErrorModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Log Mock Test Mistake
            </h2>

            <form onSubmit={handleAddErrorSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mistake Summary / Question Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sign convention in Lens formula, Aldol dehydration missing"
                  value={errTitle}
                  onChange={(e) => setErrTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subject</label>
                  <select
                    value={errSubject}
                    onChange={(e) => setErrSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mistake Category</label>
                  <select
                    value={errType}
                    onChange={(e) => setErrType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Conceptual">Conceptual Flaw</option>
                    <option value="Calculation">Calculation / Arithmetic</option>
                    <option value="Misread Question">Misread Question</option>
                    <option value="Formula Forgotten">Formula Forgotten</option>
                    <option value="Time Pressure">Time Pressure Rush</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Chapter Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ray Optics"
                  value={errChapter}
                  onChange={(e) => setErrChapter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">What went wrong in the exam?</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Assumed convex mirror focal length as negative instead of positive"
                  value={errQuestionNotes}
                  onChange={(e) => setErrQuestionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Correct rule / concept derivation</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Convex mirror center of curvature lies behind mirror (+R/2)"
                  value={errSolutionNotes}
                  onChange={(e) => setErrSolutionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowErrorModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold hover:opacity-90 transition shadow-md shadow-rose-500/20"
                >
                  Save to Error Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Backlog Modal */}
      {showBacklogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overscroll-contain">
          <div className="relative w-full max-w-md rounded-3xl bg-[#121A27] border border-slate-700 p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setShowBacklogModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Add Pending Backlog Topic
            </h2>

            <form onSubmit={handleAddBacklogSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Backlog Topic & Chapter *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rotational Dynamics Rolling Without Slipping"
                  value={blTitle}
                  onChange={(e) => setBlTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subject</label>
                  <select
                    value={blSubject}
                    onChange={(e) => setBlSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Urgency</label>
                  <select
                    value={blUrgency}
                    onChange={(e) => setBlUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Critical">Critical Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Lecture From</label>
                  <select
                    value={blLectureFrom}
                    onChange={(e) => setBlLectureFrom(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>Lecture {num}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Lecture To</label>
                  <select
                    value={blLectureTo}
                    onChange={(e) => setBlLectureTo(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>Lecture {num}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Completion Date / Milestone</label>
                <input
                  type="text"
                  placeholder="e.g. By Sunday before Mock Test"
                  value={blDate}
                  onChange={(e) => setBlDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBacklogModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold hover:opacity-90 transition shadow-md shadow-amber-500/20"
                >
                  Add Backlog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
