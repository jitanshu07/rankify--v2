import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Binary, 
  Search, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  BookMarked, 
  Lightbulb, 
  X 
} from 'lucide-react';
import { Formula } from '../types';

export const FormulasScreen: React.FC = () => {
  const { formulas, addFormula, deleteFormula } = useApp();

  const [selectedSubject, setSelectedSubject] = useState<'All' | 'Physics' | 'Chemistry' | 'Mathematics'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics'>('Physics');
  const [newChapter, setNewChapter] = useState('');
  const [newFormulaText, setNewFormulaText] = useState('');
  const [newKeyTerms, setNewKeyTerms] = useState('');
  const [newTip, setNewTip] = useState('');

  const filteredFormulas = formulas.filter((f) => {
    if (selectedSubject !== 'All' && f.subject !== selectedSubject) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        f.title.toLowerCase().includes(q) ||
        f.chapter.toLowerCase().includes(q) ||
        f.formulaText.toLowerCase().includes(q) ||
        (f.keyTerms && f.keyTerms.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCopy = (formula: Formula) => {
    navigator.clipboard.writeText(formula.formulaText);
    setCopiedId(formula.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateFormula = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newFormulaText.trim()) return;

    addFormula({
      title: newTitle.trim(),
      subject: newSubject,
      chapter: newChapter.trim() || 'General',
      formulaText: newFormulaText.trim(),
      keyTerms: newKeyTerms.trim() || undefined,
      applicationTip: newTip.trim() || undefined,
    });

    setNewTitle('');
    setNewChapter('');
    setNewFormulaText('');
    setNewKeyTerms('');
    setNewTip('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-blue-950/40 via-[#121A27] to-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Binary className="w-6 h-6 text-blue-400" />
            Formula Vault & Rapid Recall
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            High-yield mathematical formulas, physical laws, and organic reaction reagents for active recall.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold hover:opacity-90 transition shadow-lg shadow-blue-500/20 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Formula</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#121A27] border border-slate-800 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search formulas (e.g. Leibnitz, Nernst, LCR, Skew Lines)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition"
          />
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800/80 w-fit">
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
                    : 'bg-blue-500 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Formulas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFormulas.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-[#121A27] border border-slate-800 text-slate-400 space-y-2">
            <BookMarked className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold">No formulas found</p>
            <p className="text-xs text-slate-500">Add personal formulas or search by a different term.</p>
          </div>
        ) : (
          filteredFormulas.map((formula) => {
            const isPhys = formula.subject === 'Physics';
            const isChem = formula.subject === 'Chemistry';

            const badgeColor = isPhys
              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
              : isChem
              ? 'bg-pink-500/15 text-pink-400 border-pink-500/30'
              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';

            return (
              <div
                key={formula.id}
                className="p-5 rounded-3xl bg-[#121A27] border border-slate-800 hover:border-slate-700 shadow-lg space-y-3.5 transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}>
                        {formula.subject}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 truncate max-w-[150px]">
                        {formula.chapter}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(formula)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition"
                        title="Copy formula text"
                      >
                        {copiedId === formula.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteFormula(formula.id)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition"
                        title="Delete formula"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white mt-1">{formula.title}</h3>

                  {/* Formula Code Box */}
                  <div className="mt-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 font-mono text-cyan-300 text-xs sm:text-sm tracking-wide leading-relaxed overflow-x-auto select-all">
                    {formula.formulaText}
                  </div>

                  {/* Key Terms */}
                  {formula.keyTerms && (
                    <div className="mt-2.5 text-xs text-slate-400">
                      <span className="font-semibold text-slate-300">Variables: </span>
                      {formula.keyTerms}
                    </div>
                  )}

                  {/* Application Tip */}
                  {formula.applicationTip && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>{formula.applicationTip}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Formula Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#121A27] border border-slate-700 p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              Add High-Yield Formula
            </h2>

            <form onSubmit={handleCreateFormula} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Formula / Concept Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Carnot Engine Efficiency, Shortest Distance"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Chapter</label>
                  <input
                    type="text"
                    placeholder="e.g. Thermodynamics"
                    value={newChapter}
                    onChange={(e) => setNewChapter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Formula Expression / Law *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. η = 1 - (T_c / T_h) = (W / Q_h)"
                  value={newFormulaText}
                  onChange={(e) => setNewFormulaText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Key Terms / Variables (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. T in Kelvin, Q_h is heat absorbed"
                  value={newKeyTerms}
                  onChange={(e) => setNewKeyTerms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Application Tip / Common Trap (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Watch out for Celsius to Kelvin conversions"
                  value={newTip}
                  onChange={(e) => setNewTip(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:opacity-90 transition shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Save Formula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
