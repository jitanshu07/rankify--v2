const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(/const clearCompletedTodos = \(\) => \{/, "const clearCompletedTodos = (dateToClear?: string) => {");
code = code.replace(
  /setTodos\(prev => prev\.filter\(t => !t\.isCompleted\)\);/,
  "setTodos(prev => prev.filter(t => {\n      if (dateToClear) {\n        return !(t.isCompleted && t.dateCreated === dateToClear);\n      }\n      return !t.isCompleted;\n    }));"
);

code = code.replace(
  /clearCompletedTodos: \(\) => void;/,
  "clearCompletedTodos: (dateToClear?: string) => void;"
);

fs.writeFileSync('src/context/AppContext.tsx', code);
