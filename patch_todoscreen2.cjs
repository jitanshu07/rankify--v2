const fs = require('fs');
let code = fs.readFileSync('src/screens/TodoScreen.tsx', 'utf8');

// Add dueTime to state
code = code.replace(
  /const \[priority, setPriority\] = useState<PriorityType>\('High'\);/,
  "const [priority, setPriority] = useState<PriorityType>('High');\n  const [dueTime, setDueTime] = useState<string>('');"
);

// Add dueTime to editingTodo state
code = code.replace(
  /const \[editingTodo, setEditingTodo\] = useState<\{ id: string; title: string; subject: string; priority: PriorityType \} \| null>\(null\);/,
  "const [editingTodo, setEditingTodo] = useState<{ id: string; title: string; subject: string; priority: PriorityType; dueTime?: string } | null>(null);"
);

// Add dueTime to Clock import
code = code.replace(
  /Calendar/,
  "Calendar,\n  Clock"
);

// Update handleAddTodo
code = code.replace(
  /addTodo\(title\.trim\(\), subject, priority\);/,
  "addTodo(title.trim(), subject, priority, dueTime || undefined);"
);
code = code.replace(
  /setTitle\(''\);/,
  "setTitle('');\n    setDueTime('');"
);

// Update editing set payload
code = code.replace(
  /priority: todo\.priority/,
  "priority: todo.priority,\n                      dueTime: todo.dueTime"
);

// Update editTodo call inside modal
code = code.replace(
  /editTodo\(editingTodo\.id, editingTodo\.title\.trim\(\), editingTodo\.subject, editingTodo\.priority\);/,
  "editTodo(editingTodo.id, editingTodo.title.trim(), editingTodo.subject, editingTodo.priority, editingTodo.dueTime || undefined);"
);

fs.writeFileSync('src/screens/TodoScreen.tsx', code);
