const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
  /deleteMultipleTodos: \(ids: string\[\]\) => void;/,
  "deleteMultipleTodos: (ids: string[]) => void;\n  reorderTodos: (startIndex: number, endIndex: number) => void;"
);

code = code.replace(
  /const deleteTodo = \(id: string\) => \{/,
  "const reorderTodos = (startIndex: number, endIndex: number) => {\n    setTodos((prev) => {\n      const result = Array.from(prev);\n      const [removed] = result.splice(startIndex, 1);\n      result.splice(endIndex, 0, removed);\n      return result;\n    });\n  };\n\n  const deleteTodo = (id: string) => {"
);

code = code.replace(
  /editTodo,\n\s*deleteTodo,/,
  "editTodo,\n        reorderTodos,\n        deleteTodo,"
);

fs.writeFileSync('src/context/AppContext.tsx', code);
