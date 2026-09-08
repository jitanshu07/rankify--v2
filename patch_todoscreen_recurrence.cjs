const fs = require('fs');
let code = fs.readFileSync('src/screens/TodoScreen.tsx', 'utf8');

// Icons
code = code.replace(
  /Calendar,/,
  "Calendar,\n  Repeat,"
);

// State vars
code = code.replace(
  /const \[dueTime, setDueTime\] = useState<string>\(''\);/,
  "const [dueTime, setDueTime] = useState<string>('');\n  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');"
);

// editingTodo state
code = code.replace(
  /const \[editingTodo, setEditingTodo\] = useState<\{ id: string; title: string; subject: string; priority: PriorityType; dueTime\?: string \} \| null>\(null\);/,
  "const [editingTodo, setEditingTodo] = useState<{ id: string; title: string; subject: string; priority: PriorityType; dueTime?: string; recurrence?: 'none' | 'daily' | 'weekly' | 'monthly' } | null>(null);"
);

// handleAddTodo
code = code.replace(
  /addTodo\(title\.trim\(\), subject, priority, dueTime \|\| undefined\);/,
  "addTodo(title.trim(), subject, priority, dueTime || undefined, recurrence);"
);
code = code.replace(
  /setDueTime\(''\);/,
  "setDueTime('');\n    setRecurrence('none');"
);

// Form in creation
code = code.replace(
  /<select\n\s*value=\{priority\}/,
  `<select
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
              value={priority}`
);

// Form edit values inside map
code = code.replace(
  /dueTime: todo\.dueTime/,
  "dueTime: todo.dueTime,\n                      recurrence: todo.recurrence"
);

// Edit Todo call
code = code.replace(
  /editTodo\(editingTodo\.id, editingTodo\.title\.trim\(\), editingTodo\.subject, editingTodo\.priority, editingTodo\.dueTime \|\| undefined\);/,
  "editTodo(editingTodo.id, editingTodo.title.trim(), editingTodo.subject, editingTodo.priority, editingTodo.dueTime || undefined, editingTodo.recurrence);"
);

// Edit Modal layout
const recurrenceSelectHtml = `
                <div className="col-span-1 sm:col-span-1">
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
                </div>`;

code = code.replace(
  /<div className="grid grid-cols-3 gap-4">/,
  `<div className="grid grid-cols-2 gap-4">
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
                </div>`
);

code = code.replace(
  /<div className="col-span-1 sm:col-span-1">\n\s*<label className="text-xs font-bold text-slate-400 mb-1\.5 block">Due Time<\/label>\n\s*<input\n\s*type="time"\n\s*value=\{editingTodo\.dueTime \|\| ''\}\n\s*onChange=\{\(e\) => setEditingTodo\(\{ \.\.\.editingTodo, dueTime: e\.target\.value \}\)\}\n\s*className="w-full px-3 py-2\.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"\n\s*\/>\n\s*<\/div>/,
  ""
);

// Add Repeat badge to Task Card
const recurrenceBadgeHtml = `
                      {todo.recurrence && todo.recurrence !== 'none' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Repeat className="w-3 h-3" />
                          {todo.recurrence.charAt(0).toUpperCase() + todo.recurrence.slice(1)}
                        </span>
                      )}`;

code = code.replace(
  /\{todo\.dueTime && \(\n\s*<span className=\{\`flex items-center gap-1 text-\[10px\] font-bold px-1\.5 py-0\.5 rounded-md border \$\{isApproaching && !todo\.isCompleted \? 'bg-amber-500\/20 text-amber-400 border-amber-500\/30' : 'bg-slate-800 text-slate-300 border-slate-700'\}\`\}>\n\s*<Clock className="w-3 h-3" \/>\n\s*\{todo\.dueTime\}\n\s*<\/span>\n\s*\)\}/,
  `{todo.dueTime && (
                        <span className={\`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border \${isApproaching && !todo.isCompleted ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'}\`}>
                          <Clock className="w-3 h-3" />
                          {todo.dueTime}
                        </span>
                      )}${recurrenceBadgeHtml}`
);

fs.writeFileSync('src/screens/TodoScreen.tsx', code);
