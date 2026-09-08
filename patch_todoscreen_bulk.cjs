const fs = require('fs');
let code = fs.readFileSync('src/screens/TodoScreen.tsx', 'utf8');

// AppContext methods
code = code.replace(
  /deleteTodo,/,
  "deleteTodo,\n    deleteMultipleTodos,\n    completeMultipleTodos,"
);

// State
code = code.replace(
  /const \[editingTodo, setEditingTodo\] = useState/,
  "const [selectedTodos, setSelectedTodos] = useState<string[]>([]);\n  const [editingTodo, setEditingTodo] = useState"
);

// Selection checkbox
code = code.replace(
  /<div className="flex items-center gap-3 min-w-0 flex-1">/,
  `<div className="flex items-center gap-3 min-w-0 flex-1">
                  <input 
                    type="checkbox"
                    checked={selectedTodos.includes(todo.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedTodos(prev => [...prev, todo.id]);
                      else setSelectedTodos(prev => prev.filter(id => id !== todo.id));
                    }}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                  />`
);

// Toolbar
const toolbarHtml = `
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
`;

code = code.replace(
  /\{showTemplateModal && \(/,
  toolbarHtml + "\n\n      {/* Routine Templates Modal */}\n      {showTemplateModal && ("
);

// Clear selection on filter or history change? Optional, but good UX.
// To keep it simple, we can clear when 'filter' or 'historyDate' change using useEffect, or just let them stay.
// Since it's quick, let's add useEffect for clearing.

code = code.replace(
  /const dateFilteredTodos = todos\.filter\(t => t\.dateCreated === historyDate\);/,
  "React.useEffect(() => {\n    setSelectedTodos([]);\n  }, [filter, historyDate]);\n\n  const dateFilteredTodos = todos.filter(t => t.dateCreated === historyDate);"
);

fs.writeFileSync('src/screens/TodoScreen.tsx', code);
