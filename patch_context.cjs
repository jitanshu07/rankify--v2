const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
  /deleteTodo: \(id: string\) => void;/,
  "deleteTodo: (id: string) => void;\n  editTodo: (id: string, title: string, subject: string, priority: PriorityType) => void;"
);

code = code.replace(
  /const deleteTodo = \(id: string\) => \{/,
  "const editTodo = (id: string, title: string, subject: string, priority: PriorityType) => {\n    setTodos(prev => prev.map(t => t.id === id ? { ...t, title, subject, priority } : t));\n  };\n\n  const deleteTodo = (id: string) => {"
);

code = code.replace(
  /deleteTodo,\n\s*clearCompletedTodos,/,
  "deleteTodo,\n        editTodo,\n        clearCompletedTodos,"
);

fs.writeFileSync('src/context/AppContext.tsx', code);
