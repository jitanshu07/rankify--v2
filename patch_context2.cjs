const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
  /addTodo: \(title: string, subject: string, priority: PriorityType\) => void;/,
  "addTodo: (title: string, subject: string, priority: PriorityType, dueTime?: string) => void;"
);

code = code.replace(
  /editTodo: \(id: string, title: string, subject: string, priority: PriorityType\) => void;/,
  "editTodo: (id: string, title: string, subject: string, priority: PriorityType, dueTime?: string) => void;"
);

code = code.replace(
  /const addTodo = \(title: string, subject: string, priority: PriorityType\) => \{/,
  "const addTodo = (title: string, subject: string, priority: PriorityType, dueTime?: string) => {"
);

code = code.replace(
  /priority,\n\s*isCompleted: false,\n\s*dateCreated: getLogicalDate\(\)\n\s*\};\n\s*setTodos\(prev => \[newTodo, \.\.\.prev\]\);\n\s*\};/,
  "priority,\n      isCompleted: false,\n      dateCreated: getLogicalDate(),\n      dueTime\n    };\n    setTodos(prev => [newTodo, ...prev]);\n  };"
);

code = code.replace(
  /const editTodo = \(id: string, title: string, subject: string, priority: PriorityType\) => \{/,
  "const editTodo = (id: string, title: string, subject: string, priority: PriorityType, dueTime?: string) => {"
);

code = code.replace(
  /setTodos\(prev => prev\.map\(t => t\.id === id \? \{ \.\.\.t, title, subject, priority \} : t\)\);/,
  "setTodos(prev => prev.map(t => t.id === id ? { ...t, title, subject, priority, dueTime } : t));"
);

fs.writeFileSync('src/context/AppContext.tsx', code);
