const fs = require('fs');
let code = fs.readFileSync('src/screens/TodoScreen.tsx', 'utf8');

code = code.replace(/onClick=\{clearCompletedTodos\}/, "onClick={() => clearCompletedTodos(historyDate)}");

fs.writeFileSync('src/screens/TodoScreen.tsx', code);
