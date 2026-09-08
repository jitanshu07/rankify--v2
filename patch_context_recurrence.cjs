const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Add helper
const helper = `
function getNextRecurrenceDate(baseDateStr: string, recurrence: string) {
  const d = new Date(baseDateStr);
  if (recurrence === 'daily') d.setDate(d.getDate() + 1);
  else if (recurrence === 'weekly') d.setDate(d.getDate() + 7);
  else if (recurrence === 'monthly') d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
}
`;

code = code.replace(/export const AppProvider: React.FC<\{ children: React.ReactNode \}> = \(\{ children \}\) => \{/, helper + '\nexport const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {');

// Interface signatures
code = code.replace(
  /addTodo: \(title: string, subject: string, priority: PriorityType, dueTime\?: string\) => void;/,
  "addTodo: (title: string, subject: string, priority: PriorityType, dueTime?: string, recurrence?: 'none' | 'daily' | 'weekly' | 'monthly') => void;"
);

code = code.replace(
  /editTodo: \(id: string, title: string, subject: string, priority: PriorityType, dueTime\?: string\) => void;/,
  "editTodo: (id: string, title: string, subject: string, priority: PriorityType, dueTime?: string, recurrence?: 'none' | 'daily' | 'weekly' | 'monthly') => void;"
);

// Implementations
code = code.replace(
  /const addTodo = \(title: string, subject: string, priority: PriorityType, dueTime\?: string\) => \{/,
  "const addTodo = (title: string, subject: string, priority: PriorityType, dueTime?: string, recurrence?: 'none' | 'daily' | 'weekly' | 'monthly') => {"
);

code = code.replace(
  /dueTime\n\s*\};\n\s*setTodos\(prev => \[newTodo, \.\.\.prev\]\);/,
  "dueTime,\n      recurrence: recurrence || 'none',\n      hasSpawnedNext: false\n    };\n    setTodos(prev => [newTodo, ...prev]);"
);

code = code.replace(
  /const editTodo = \(id: string, title: string, subject: string, priority: PriorityType, dueTime\?: string\) => \{/,
  "const editTodo = (id: string, title: string, subject: string, priority: PriorityType, dueTime?: string, recurrence?: 'none' | 'daily' | 'weekly' | 'monthly') => {"
);

code = code.replace(
  /setTodos\(prev => prev\.map\(t => t\.id === id \? \{ \.\.\.t, title, subject, priority, dueTime \} : t\)\);/,
  "setTodos(prev => prev.map(t => t.id === id ? { ...t, title, subject, priority, dueTime, recurrence: recurrence || 'none' } : t));"
);

const toggleTodoNew = `const toggleTodo = (id: string) => {
    setTodos(prev => {
      const target = prev.find(t => t.id === id);
      if (!target) return prev;
      const willBeCompleted = !target.isCompleted;

      // Give +5 EXP for every task completed in the To-Do list; deduct 5 if unchecked (min 0)
      setProfile(p => {
        const expDelta = willBeCompleted ? 5 : -5;
        const nextExp = Math.max(0, (p.exp || 0) + expDelta);
        return { ...p, exp: nextExp };
      });

      let newSpawned: TodoItem | null = null;
      if (willBeCompleted && target.recurrence && target.recurrence !== 'none' && !target.hasSpawnedNext) {
         newSpawned = {
            ...target,
            id: 't_' + Date.now() + Math.random().toString(36).substr(2, 9),
            isCompleted: false,
            dateCreated: getNextRecurrenceDate(target.dateCreated, target.recurrence),
            hasSpawnedNext: false
         };
      }

      const mappedPrev = prev.map(t => {
         if (t.id === id) {
           return { ...t, isCompleted: willBeCompleted, hasSpawnedNext: newSpawned ? true : t.hasSpawnedNext };
         }
         return t;
      });
      
      return newSpawned ? [newSpawned, ...mappedPrev] : mappedPrev;
    });
  };`;

code = code.replace(/const toggleTodo = \(id: string\) => \{[\s\S]*?return prev\.map\(t => t\.id === id \? \{ \.\.\.t, isCompleted: willBeCompleted \} : t\);\n\s*\};\n\s*\};/, toggleTodoNew);

const completeMultipleNew = `const completeMultipleTodos = (ids: string[]) => {
    setTodos(prev => {
      const newSpawned: TodoItem[] = [];
      const mappedPrev = prev.map(t => {
        if (ids.includes(t.id) && !t.isCompleted) {
          let hasSpawned = t.hasSpawnedNext;
          if (t.recurrence && t.recurrence !== 'none' && !hasSpawned) {
             hasSpawned = true;
             newSpawned.push({
                ...t,
                id: 't_' + Date.now() + Math.random().toString(36).substr(2, 9),
                isCompleted: false,
                dateCreated: getNextRecurrenceDate(t.dateCreated, t.recurrence),
                hasSpawnedNext: false
             });
          }
          return { ...t, isCompleted: true, hasSpawnedNext: hasSpawned };
        }
        return t;
      });
      
      return [...newSpawned, ...mappedPrev];
    });
  };`;

code = code.replace(/const completeMultipleTodos = \(ids: string\[\]\) => \{[\s\S]*?setTodos\(prev => prev\.map\(t => ids\.includes\(t\.id\) \? \{ \.\.\.t, isCompleted: true \} : t\)\);\n\s*\};/, completeMultipleNew);

fs.writeFileSync('src/context/AppContext.tsx', code);
