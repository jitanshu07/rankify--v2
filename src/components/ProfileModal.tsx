import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Target, 
  Calendar, 
  Award, 
  GraduationCap, 
  Clock, 
  Sparkles, 
  Check, 
  User,
  Flame,
  ArrowRight
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXAM_GOALS = [
  { id: 'JEE Advanced', label: 'JEE Advanced', sub: 'Targeting Top IITs' },
  { id: 'JEE Main + Advanced', label: 'JEE Main + Advanced', sub: 'Dual Target Prep' },
  { id: 'JEE Main', label: 'JEE Main', sub: 'NITs, IIITs & State Top' },
  { id: 'BITSAT + JEE', label: 'BITSAT + JEE', sub: 'BITS Campuses & JEE' }
];

const TARGET_YEARS = [2026, 2027, 2028, 2029];

const RANK_OPTIONS = ['AIR < 50', 'AIR < 100', 'AIR < 500', 'AIR < 1,000', 'AIR < 2,500', 'Top 0.1% Percentile'];

const DREAM_COLLEGES = [
  'IIT Bombay',
  'IIT Delhi',
  'IIT Madras',
  'IIT Kanpur',
  'IIT Kharagpur',
  'IIT Roorkee',
  'BITS Pilani',
  'NIT Trichy'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile } = useApp();

  const [name, setName] = useState(profile.name || 'Jitanshu');
  const [targetYear, setTargetYear] = useState<number>(profile.targetYear || 2027);
  const [customYear, setCustomYear] = useState<string>('');
  const [examGoal, setExamGoal] = useState<string>(profile.examGoal || 'JEE Advanced');
  const [customExam, setCustomExam] = useState<string>('');
  const [targetRank, setTargetRank] = useState<string>(profile.targetRank || 'AIR < 500');
  const [dreamCollege, setDreamCollege] = useState<string>(profile.dreamCollege || 'IIT Bombay');
  const [dailyHourGoal, setDailyHourGoal] = useState<number>(profile.dailyHourGoal || 8);
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(profile.name || 'Jitanshu');
      setTargetYear(profile.targetYear || 2027);
      setExamGoal(profile.examGoal || 'JEE Advanced');
      setTargetRank(profile.targetRank || 'AIR < 500');
      setDreamCollege(profile.dreamCollege || 'IIT Bombay');
      setDailyHourGoal(profile.dailyHourGoal || 8);
      setSavedFeedback(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const effectiveYear = customYear.trim() ? Number(customYear) || targetYear : targetYear;
  const effectiveExam = examGoal === 'Custom' ? (customExam.trim() || 'JEE') : examGoal;
  const computedTargetExam = `${effectiveExam} ${effectiveYear} (${targetRank})`;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || 'Jitanshu';
    
    updateProfile({
      name: finalName,
      targetYear: effectiveYear,
      examGoal: effectiveExam,
      targetRank,
      dreamCollege,
      dailyHourGoal,
      targetExam: computedTargetExam,
      isOnboarded: true
    });

    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in overscroll-contain">
      <div 
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto overscroll-contain rounded-3xl bg-[#101724] border border-slate-700/90 shadow-2xl p-5 sm:p-7 space-y-6 text-slate-100"
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
        <div className="flex items-center gap-3 pr-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 flex-shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Aspirant Goal & Target Settings
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Personalize your exam year, dream score, and daily study targets.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-5">
          {/* Aspirant Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Aspirant Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jitanshu"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white font-semibold text-sm focus:outline-none focus:border-cyan-400 transition"
              required
            />
            <p className="text-[11px] text-slate-400">
              Displayed on your dashboard, study reports, and AI Mentor sessions.
            </p>
          </div>

          {/* Target Year Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Target Exam Year (e.g., 2027)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TARGET_YEARS.map((yr) => {
                const isSelected = effectiveYear === yr && !customYear;
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => {
                      setTargetYear(yr);
                      setCustomYear('');
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/70 text-amber-300 shadow-md shadow-amber-500/10'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base font-black font-mono">{yr}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {yr === 2026 ? 'Class 12 / Drop' : yr === 2027 ? 'Class 11' : yr === 2028 ? 'Class 10' : 'Foundation'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Year Input if needed */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-400">Or other year:</span>
              <input
                type="number"
                min="2025"
                max="2035"
                value={customYear}
                onChange={(e) => setCustomYear(e.target.value)}
                placeholder="Custom year (e.g. 2027)"
                className="w-32 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Target Exam Goal */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Exam Goal</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EXAM_GOALS.map((exam) => {
                const isSelected = examGoal === exam.id;
                return (
                  <button
                    key={exam.id}
                    type="button"
                    onClick={() => {
                      setExamGoal(exam.id);
                      setCustomExam('');
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/70 text-cyan-200 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{exam.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{exam.sub}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rank & Dream College Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Rank */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Target AIR Ambition</span>
              </label>
              <select
                value={targetRank}
                onChange={(e) => setTargetRank(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
              >
                {RANK_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Dream College */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                <span>Dream Campus</span>
              </label>
              <select
                value={dreamCollege}
                onChange={(e) => setDreamCollege(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
              >
                {DREAM_COLLEGES.map((col) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Daily Study Goal */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Daily Study Goal</span>
              </label>
              <span className="text-xs font-mono font-bold text-emerald-400">{dailyHourGoal} hrs/day</span>
            </div>
            <div className="flex items-center gap-2">
              {[6, 8, 10, 12, 14].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setDailyHourGoal(hours)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-bold font-mono transition cursor-pointer ${
                    dailyHourGoal === hours
                      ? 'bg-emerald-500/20 border-emerald-500/70 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {hours}h
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-purple-950/30 border border-cyan-500/30 space-y-1.5">
            <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Live Header & Countdown Preview</span>
            </div>
            <div className="text-sm font-extrabold text-white">
              {name.trim() || 'Jitanshu'} • {computedTargetExam}
            </div>
            <div className="text-xs text-slate-300">
              Dream Gateway: <span className="text-cyan-300 font-semibold">{dreamCollege}</span> • Daily Target: <span className="text-emerald-300 font-semibold">{dailyHourGoal} hrs</span>
            </div>
          </div>

          {/* Footer Submit */}
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white text-xs font-bold transition shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer"
            >
              {savedFeedback ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Goals Saved!</span>
                </>
              ) : (
                <>
                  <span>Save & Apply Goals</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
