const fs = require('fs');
let code = fs.readFileSync('src/screens/TodoScreen.tsx', 'utf8');

code = code.replace(
  /const isHigh = todo\.priority === 'High';\n\s*const isMed = todo\.priority === 'Medium';/,
  "const isHigh = todo.priority === 'High';\n            const isMed = todo.priority === 'Medium';\n\n            let isApproaching = false;\n            if (!todo.isCompleted && todo.dueTime) {\n              const [dueHour, dueMinute] = todo.dueTime.split(':').map(Number);\n              const now = new Date();\n              const currentHour = now.getHours();\n              const currentMinute = now.getMinutes();\n              const dueTotalMinutes = dueHour * 60 + dueMinute;\n              const currentTotalMinutes = currentHour * 60 + currentMinute;\n              // highlight if due within next 60 minutes or overdue today\n              if (dueTotalMinutes - currentTotalMinutes <= 60) {\n                isApproaching = true;\n              }\n            }"
);

code = code.replace(
  /className=\{`flex items-center justify-between p-3\.5 rounded-2xl border transition-all \$\{/,
  "className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${"
);

code = code.replace(
  /'bg-\[#121A27\] border-slate-800 hover:border-slate-700 shadow-sm'\n\s*\}`\}/,
  "isApproaching ? 'bg-amber-950/20 border-amber-500/40 shadow-amber-500/5' : 'bg-[#121A27] border-slate-800 hover:border-slate-700 shadow-sm'\n                }`}"
);

const timeBadgeHtml = `
                      {todo.dueTime && (
                        <span className={\`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border \${isApproaching && !todo.isCompleted ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'}\`}>
                          <Clock className="w-3 h-3" />
                          {todo.dueTime}
                        </span>
                      )}`;

code = code.replace(
  /<span className="px-1\.5 py-0\.5 rounded bg-yellow-500\/10 border border-yellow-500\/30 text-yellow-400 text-\[10px\] font-mono font-bold flex items-center gap-1">\n\s*<Zap className="w-3 h-3 fill-yellow-400" \/>\n\s*\+5 EXP\n\s*<\/span>/,
  `<span className="px-1.5 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-mono font-bold flex items-center gap-1">\n                        <Zap className="w-3 h-3 fill-yellow-400" />\n                        +5 EXP\n                      </span>${timeBadgeHtml}`
);

fs.writeFileSync('src/screens/TodoScreen.tsx', code);
