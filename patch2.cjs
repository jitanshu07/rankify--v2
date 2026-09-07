const fs = require('fs');
let code = fs.readFileSync('src/screens/TodoScreen.tsx', 'utf8');

code = code.replace(/import \{ useApp \} from '\.\.\/context\/AppContext';/, "import { useApp, getLogicalDate } from '../context/AppContext';");

code = code.replace(
  /const \[filter, setFilter\] = useState<'all' \| 'active' \| 'completed'>\('all'\);/,
  "const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');\n  const [historyDate, setHistoryDate] = useState<string>(getLogicalDate());\n\n  const availableDates = Array.from(new Set(todos.map(t => t.dateCreated))).sort((a, b) => b.localeCompare(a));\n  if (!availableDates.includes(getLogicalDate())) {\n    availableDates.unshift(getLogicalDate());\n  }"
);

code = code.replace(
  /const filteredTodos = todos\.filter\(\(t\) => \{/g,
  "const dateFilteredTodos = todos.filter(t => t.dateCreated === historyDate);\n\n  const filteredTodos = dateFilteredTodos.filter((t) => {"
);

code = code.replace(/const completedCount = todos\.filter\(\(t\) => t\.isCompleted\)\.length;/g, "const completedCount = dateFilteredTodos.filter((t) => t.isCompleted).length;");
code = code.replace(/const totalCount = todos\.length;/g, "const totalCount = dateFilteredTodos.length;");

code = code.replace(/All \(\{todos\.length\}\)/, "All ({dateFilteredTodos.length})");
code = code.replace(/Pending \(\{todos\.filter\(\(t\) => !t\.isCompleted\)\.length\}\)/, "Pending ({dateFilteredTodos.filter((t) => !t.isCompleted).length})");

fs.writeFileSync('src/screens/TodoScreen.tsx', code);
