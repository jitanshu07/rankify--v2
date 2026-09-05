import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Sparkles, 
  Check, 
  Filter, 
  Flame, 
  BookOpen, 
  Layers, 
  X,
  CheckCircle2,
  Zap,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { PriorityType, RoutineTemplate } from '../types';
import { ROUTINE_TEMPLATES } from '../data/initialData';

export const TodoScreen: React.FC = () => {
  const { 
    todos, 
    addTodo, 
    toggleTodo, 
    deleteTodo, 
    clearCompletedTodos, 
    applyRoutineTemplate, 
    profile,
    triggerEndOfDayCheck,
    clearPenaltyNotice
  } = useApp();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [priority, setPriority] = useState<PriorityType>('High');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [auditResult, setAuditResult] = useState<{ penalized: boolean; message: string } | null>(null);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTodo(title.trim(), subject, priority);
    setTitle('');
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.isCompleted;
    if (filter === 'completed') return t.isCompleted;
    return true;
  });

  const completedCount = todos.filter((t) => t.isCompleted).length;
  const totalCount = todos.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in">
      {/* Penalty Alert Banner if penalty occurred */}
      {profile.lastPenaltyReason && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 flex items-start justify-between gap-3 text-rose-200 text-xs animate-in fade-in shadow-lg">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rose-300 block text-sm">Accountability Penalty Applied</span>
              <p className="mt-0.5 text-rose-200">{profile.lastPenaltyReason}</p>
            </div>
          </div>
          <button 
            onClick={clearPenaltyNotice} 
            className="px-2.5 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-900 border border-rose-700/60 text-[11px] font-semibold text-rose-200 hover:text-white transition cursor-pointer flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#121A27] to-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-purple-400" />
            Daily Tasks & JEE Routine Drills
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Build discipline one daily checklist at a time. Each task grants <span className="text-yellow-400 font-bold">+5 EXP</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Paired Streak & EXP Counters */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold shadow-sm">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>{profile.currentStreak}d Streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-yellow-500/15 border border-yellow-500/40 text-yellow-300 font-mono text-xs font-bold shadow-sm">
            <Zap className="w-4 h-4 fill-yellow-400" />
            <span>{profile.exp || 0} EXP</span>
          </div>

          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold hover:opacity-90 transition shadow-lg shadow-purple-500/20 cursor-pointer w-fit"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Templates</span>
          </button>
        </div>
      </div>

      {/* High-Stakes Accountability & Penalty Rule Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-[#121A27] to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <span className="text-slate-300">
            <strong className="text-white">Midnight Penalty Rule:</strong> All tasks must be completed before the end of the day. Incomplete tasks reset <strong className="text-amber-400">Streak to 0</strong> and <strong className="text-yellow-400">EXP to 0</strong>.
          </span>
        </div>

        <button
          onClick={() => {
            const res = triggerEndOfDayCheck();
            setAuditResult(res);
            setTimeout(() => setAuditResult(null), 5000);
          }}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto flex-shrink-0"
          title="Verify your tasks against the midnight completion rule"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
          <span>Audit End-of-Day Penalty</span>
        </button>
      </div>

      {auditResult && (
        <div className={`p-3 rounded-xl text-xs font-medium border animate-in fade-in flex items-center justify-between ${
          auditResult.penalized
            ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
            : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
        }`}>
          <span>{auditResult.message}</span>
          <button onClick={() => setAuditResult(null)} className="text-xs underline ml-2 cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Task Creation Card */}
      <form onSubmit={handleAddTodo} className="p-4 rounded-2xl bg-[#121A27] border border-slate-800 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            placeholder="Add new task (e.g. Solve 30 Modern Physics PYQs, Derivation of CFT)..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
          />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Mathematics">Math</option>
              <option value="General">General</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityType)}
              className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="High">High Priority</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-purple-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </form>

      {/* Progress & Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#121A27] border border-slate-800">
        <div className="flex items-center gap-2">
          <div className="text-xs font-bold text-slate-300">
            Progress: {completedCount}/{totalCount} ({completionPercentage}%)
          </div>
          <div className="w-28 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filter === 'all' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({todos.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filter === 'active' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending ({todos.filter((t) => !t.isCompleted).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filter === 'completed' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Done ({completedCount})
            </button>
          </div>

          {completedCount > 0 && (
            <button
              onClick={clearCompletedTodos}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 text-xs transition"
            >
              Clear Done
            </button>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTodos.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#121A27] border border-slate-800 text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold">No tasks to display</p>
            <p className="text-xs text-slate-500">Add tasks above or load an AIR routine template.</p>
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const isHigh = todo.priority === 'High';
            const isMed = todo.priority === 'Medium';

            return (
              <div
                key={todo.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  todo.isCompleted
                    ? 'bg-slate-950/60 border-slate-800/80 opacity-60'
                    : 'bg-[#121A27] border-slate-800 hover:border-slate-700 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`flex-shrink-0 w-5 h-5 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                      todo.isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                        : 'border-slate-600 hover:border-purple-400 bg-slate-900'
                    }`}
                  >
                    {todo.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs sm:text-sm font-semibold truncate ${
                        todo.isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
                      }`}
                    >
                      {todo.title}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                        {todo.subject}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      >
                        {todo.priority} Priority
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-mono font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-yellow-400" />
                        +5 EXP
                      </span>
                      <span className="text-[10px] text-slate-500 hidden sm:inline">
                        Added: {todo.dateCreated}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition ml-2"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Routine Templates Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#121A27] border border-slate-700 p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowTemplateModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Ranker Routine Templates
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Choose a proven daily regiment. Applying a template will instantly append its tasks to your list.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {ROUTINE_TEMPLATES.map((tpl, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 transition flex flex-col justify-between space-y-3"
                >
                  <div>
                    <h3 className="font-bold text-white text-sm">{tpl.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tpl.description}</p>
                    <div className="mt-3 space-y-1">
                      {tpl.tasks.slice(0, 3).map((t, idx) => (
                        <div key={idx} className="text-[11px] text-slate-300 flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                          <span className="truncate">{t.title}</span>
                        </div>
                      ))}
                      {tpl.tasks.length > 3 && (
                        <div className="text-[10px] text-slate-500 italic">
                          + {tpl.tasks.length - 3} more tasks
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      applyRoutineTemplate(tpl);
                      setShowTemplateModal(false);
                    }}
                    className="w-full py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600 border border-purple-500/40 text-purple-200 hover:text-white font-bold text-xs transition cursor-pointer"
                  >
                    Apply Template ({tpl.tasks.length} Tasks)
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
