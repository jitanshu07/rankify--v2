const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Types
code = code.replace(
  /deleteTodo: \(id: string\) => void;/,
  "deleteTodo: (id: string) => void;\n  deleteMultipleTodos: (ids: string[]) => void;\n  completeMultipleTodos: (ids: string[]) => void;"
);

// Implementations
code = code.replace(
  /const deleteTodo = \(id: string\) => \{/,
  "const deleteMultipleTodos = (ids: string[]) => {\n    setTodos(prev => prev.filter(t => !ids.includes(t.id)));\n  };\n\n  const completeMultipleTodos = (ids: string[]) => {\n    setTodos(prev => prev.map(t => ids.includes(t.id) ? { ...t, isCompleted: true } : t));\n  };\n\n  const deleteTodo = (id: string) => {"
);

// Returns
code = code.replace(
  /deleteTodo,\n\s*editTodo,/,
  "deleteTodo,\n        deleteMultipleTodos,\n        completeMultipleTodos,\n        editTodo,"
);

fs.writeFileSync('src/context/AppContext.tsx', code);
