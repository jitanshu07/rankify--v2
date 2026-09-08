import React, { useState } from 'react';
import { useApp, getLogicalDate } from '../context/AppContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  GripVertical,
  CheckSquare, 
  Plus, 
  Trash2,
  Edit2, 
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
  AlertTriangle,
  Calendar,
  Repeat,
  Clock
} from 'lucide-react';
import { PriorityType, RoutineTemplate } from '../types';
import { ROUTINE_TEMPLATES } from '../data/initialData';

export const TodoScreen: React.FC = () => {
  const { 
    todos, 
    addTodo, 
    toggleTodo, 
    deleteTodo,
    deleteMultipleTodos,
    completeMultipleTodos,
    editTodo, 
    clearCompletedTodos, 
    applyRoutineTemplate, 
    profile,
    triggerEndOfDayCheck,
    clearPenaltyNotice,
    currentUser,
    setCurrentTab
  } = useApp();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [priority, setPriority] = useState<PriorityType>('High');
  const [dueTime, setDueTime] = useState<string>('');
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [historyDate, setHistoryDate] = useState<string>(getLogicalDate());

  const availableDates = Array.from(new Set(todos.map(t => t.dateCreated))).sort((a, b) => b.localeCompare(a));
  if (!availableDates.includes(getLogicalDate())) {
    availableDates.unshift(getLogicalDate());
  }
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTodos, setSelectedTodos] = useState<string[]>([]);
  const [editingTodo, setEditingTodo] = useState<{ id: string; title: string; subject: string; priority: PriorityType; dueTime?: string; recurrence?: 'none' | 'daily' | 'weekly' | 'monthly' } | null>(null);
  const [auditResult, setAuditResult] = useState<{ penalized: boolean; message: string } | null>(null);

  
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    reorderTodos(result.source.index, result.destination.index);
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTodo(title.trim(), subject, priority, dueTime || undefined, recurrence);
    setTitle('');
    setDueTime('');
    setRecurrence('none');
  };

  React.useEffect(() => {
    setSelectedTodos([]);
  }, [filter, historyDate]);

  const dateFilteredTodos = todos.filter(t => t.dateCreated === historyDate);

  const filteredTodos = dateFilteredTodos.filter((t) => {
    if (filter === 'active') return !t.isCompleted;
    if (filter === 'completed') return t.isCompleted;
    return true;
  });

  const completedCount = dateFilteredTodos.filter((t) => t.isCompleted).length;
  const totalCount = dateFilteredTodos.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in overscroll-contain">
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

      {/* User Account Link & Isolation Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-[#0F1726] border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          {currentUser ? (
            <span className="text-slate-300">
              Account-Linked: <strong className="text-white">{currentUser.name}</strong> ({currentUser.email}) • Tasks, EXP & Streak mapped to <code className="text-cyan-400 text-[11px] font-mono">{currentUser.id}</code>
            </span>
          ) : (
            <span className="text-slate-400">
              Using Guest Partition. <span className="text-amber-400 font-semibold">Sign in or create an account</span> to isolate your To-Dos, EXP, and Streak on your personal user ID.
            </span>
          )}
        </div>
        {!currentUser ? (
          <button
            type="button"
            onClick={() => setCurrentTab('login')}
            className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer text-[11px] self-start sm:self-auto"
          >
            Sign In / Sign Up →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentTab('login')}
            className="text-slate-400 hover:text-slate-200 text-[11px] cursor-pointer self-start sm:self-auto"
          >
            Switch Account →
          </button>
        )}
      </div>

      
      {/* Daily Summary Widget */}
      <div className="p-4 rounded-2xl bg-[#121A27] border border-slate-800 flex items-center justify-between shadow-sm relative overflow-hidden">
        {totalCount > 0 && completionPercentage === 100 && (
           <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>
        )}
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-slate-900 shadow-inner shrink-0">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="24" className="stroke-slate-800 fill-none" strokeWidth="4" />
              <circle 
                cx="28" cy="28" r="24" 
                className="stroke-emerald-400 fill-none transition-all duration-1000 ease-out" 
                strokeWidth="4" 
                strokeDasharray="150.796" 
                strokeDashoffset={150.796 - (150.796 * completionPercentage) / 100}
                strokeLinecap="round" 
              />
            </svg>
            <span className="text-xs font-black text-white z-10">{completionPercentage}%</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-0.5">Daily Summary</h3>
            {totalCount > 0 && completionPercentage === 100 ? (
              <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
                <Sparkles className="w-3.5 h-3.5" /> Incredible! All tasks are finished for today.
              </p>
            ) : totalCount > 0 ? (
              <p className="text-xs text-slate-400">
                You have completed <strong className="text-slate-200">{completedCount}</strong> out of <strong className="text-slate-200">{totalCount}</strong> tasks. Keep pushing!
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                No tasks for today. Add some below to get started!
              </p>
            )}
          </div>
        </div>
      </div>


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
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              title="Optional Due Time"
            />
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
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
              title="Repeat"
            >
              <option value="none">No Repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
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
          
          {/* History Date Selector */}
          <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={historyDate}
              onChange={(e) => setHistoryDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-300 focus:outline-none cursor-pointer"
            >
              {availableDates.map(date => (
                <option key={date} value={date} className="bg-slate-900">
                  {date === getLogicalDate() ? 'Today' : date}
                </option>
              ))}
            </select>
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
              All ({dateFilteredTodos.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filter === 'active' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending ({dateFilteredTodos.filter((t) => !t.isCompleted).length})
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
              onClick={() => clearCompletedTodos(historyDate)}
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
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="todos-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {filteredTodos.map((todo, index) => {
            const isHigh = todo.priority === 'High';
            const isMed = todo.priority === 'Medium';

            let isApproaching = false;
            if (!todo.isCompleted && todo.dueTime) {
              const [dueHour, dueMinute] = todo.dueTime.split(':').map(Number);
              const now = new Date();
              const currentHour = now.getHours();
              const currentMinute = now.getMinutes();
              const dueTotalMinutes = dueHour * 60 + dueMinute;
              const currentTotalMinutes = currentHour * 60 + currentMinute;
              // highlight if due within next 60 minutes or overdue today
              if (dueTotalMinutes - currentTotalMinutes <= 60) {
                isApproaching = true;
              }
            }

            return (
                    <Draggable key={todo.id} draggableId={todo.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                            snapshot.isDragging ? 'shadow-2xl shadow-blue-500/20 z-50 ring-2 ring-blue-500 scale-[1.02]' : ''
                          } ${
                  todo.isCompleted
                    ? 'bg-slate-950/60 border-slate-800/80 opacity-60'
                    : isApproaching ? 'bg-amber-950/20 border-amber-500/40 shadow-amber-500/5' : 'bg-[#121A27] border-slate-800 hover:border-slate-700 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div {...provided.dragHandleProps} className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <input 
                    type="checkbox"
                    checked={selectedTodos.includes(todo.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedTodos(prev => [...prev, todo.id]);
                      else setSelectedTodos(prev => prev.filter(id => id !== todo.id));
                    }}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                  />
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
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          isHigh 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                            : isMed 
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {todo.priority} Priority
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-mono font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-yellow-400" />
                        +5 EXP
                      </span>
                      {todo.dueTime && (
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${isApproaching && !todo.isCompleted ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                          <Clock className="w-3 h-3" />
                          {todo.dueTime}
                        </span>
                      )}
                      {todo.recurrence && todo.recurrence !== 'none' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Repeat className="w-3 h-3" />
                          {todo.recurrence.charAt(0).toUpperCase() + todo.recurrence.slice(1)}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 hidden sm:inline">
                        Added: {todo.dateCreated}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => setEditingTodo({
                      id: todo.id,
                      title: todo.title,
                      subject: todo.subject,
                      priority: todo.priority,
                      dueTime: todo.dueTime,
                      recurrence: todo.recurrence
                    })}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-slate-900 transition"
                    title="Edit task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition ml-2"
                  title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>

      {/* Routine Templates Modal */}
      
      {/* Edit Task Modal */}
      {editingTodo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overscroll-contain">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#121A27] border border-slate-700 p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setEditingTodo(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <Edit2 className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-black text-white">Edit Task</h2>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (editingTodo.title.trim()) {
                  editTodo(editingTodo.id, editingTodo.title.trim(), editingTodo.subject, editingTodo.priority, editingTodo.dueTime || undefined, editingTodo.recurrence);
                  setEditingTodo(null);
                }
              }}
              className="space-y-4 pt-2"
            >
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block">Task Title</label>
                <input
                  type="text"
                  value={editingTodo.title}
                  onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500/60"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block">Due Time</label>
                    <input
                      type="time"
                      value={editingTodo.dueTime || ''}
                      onChange={(e) => setEditingTodo({ ...editingTodo, dueTime: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block">Repeat</label>
                    <select
                      value={editingTodo.recurrence || 'none'}
                      onChange={(e) => setEditingTodo({ ...editingTodo, recurrence: e.target.value as any })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="none">None</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                
                
                <div className="col-span-1 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">Subject</label>
                  <select
                    value={editingTodo.subject}
                    onChange={(e) => setEditingTodo({ ...editingTodo, subject: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Math</option>
                    <option value="General">General</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">Priority</label>
                  <select
                    value={editingTodo.priority}
                    onChange={(e) => setEditingTodo({ ...editingTodo, priority: e.target.value as PriorityType })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingTodo(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition shadow-lg shadow-blue-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Routine Templates Modal */}
      
      {/* Floating Bulk Action Toolbar */}
      {selectedTodos.length > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-slate-800 border border-slate-700 shadow-2xl rounded-full px-4 py-2.5 flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-bold text-slate-200">
            {selectedTodos.length} selected
          </span>
          <div className="flex items-center gap-2 border-l border-slate-600 pl-4">
            <button
              onClick={() => {
                completeMultipleTodos(selectedTodos);
                setSelectedTodos([]);
              }}
              className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-bold text-xs transition"
            >
              Mark Done
            </button>
            <button
              onClick={() => {
                deleteMultipleTodos(selectedTodos);
                setSelectedTodos([]);
              }}
              className="px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 font-bold text-xs transition"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedTodos([])}
              className="p-1.5 rounded-full hover:bg-slate-700 text-slate-400 transition"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}


      {/* Routine Templates Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overscroll-contain">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#121A27] border border-slate-700 p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto overscroll-contain">
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
