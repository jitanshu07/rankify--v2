const fs = require('fs');
let code = fs.readFileSync('src/screens/TodoScreen.tsx', 'utf8');

// Add Edit2 to imports
code = code.replace(
  /Trash2,/,
  "Trash2,\n  Edit2,"
);

// Add editingTodo state
code = code.replace(
  /const \[showTemplateModal, setShowTemplateModal\] = useState\(false\);/,
  "const [showTemplateModal, setShowTemplateModal] = useState(false);\n  const [editingTodo, setEditingTodo] = useState<{ id: string; title: string; subject: string; priority: PriorityType } | null>(null);"
);

// Add editTodo from AppContext
code = code.replace(
  /deleteTodo,/,
  "deleteTodo,\n    editTodo,"
);

// Add Edit button next to Trash
code = code.replace(
  /<button\n\s*onClick=\{\(\) => deleteTodo\(todo\.id\)\}/,
  "<div className=\"flex items-center gap-1 ml-2\">\n                  <button\n                    onClick={() => setEditingTodo({\n                      id: todo.id,\n                      title: todo.title,\n                      subject: todo.subject,\n                      priority: todo.priority\n                    })}\n                    className=\"p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-slate-900 transition\"\n                    title=\"Edit task\"\n                  >\n                    <Edit2 className=\"w-4 h-4\" />\n                  </button>\n                  <button\n                    onClick={() => deleteTodo(todo.id)}"
);

code = code.replace(
  /title="Delete task"\n                >\n                  <Trash2 className="w-4 h-4" \/>\n                <\/button>/,
  "title=\"Delete task\"\n                  >\n                    <Trash2 className=\"w-4 h-4\" />\n                  </button>\n                </div>"
);

// Add Edit Modal at the bottom
const editModalHtml = `
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
                  editTodo(editingTodo.id, editingTodo.title.trim(), editingTodo.subject, editingTodo.priority);
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
                <div>
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
`;

code = code.replace(
  /\{showTemplateModal && \(/,
  editModalHtml + "\n\n      {/* Routine Templates Modal */}\n      {showTemplateModal && ("
);

fs.writeFileSync('src/screens/TodoScreen.tsx', code);
