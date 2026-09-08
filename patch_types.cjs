const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  /dueTime\?: string;\n\}/,
  "dueTime?: string;\n  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';\n  hasSpawnedNext?: boolean;\n}"
);

fs.writeFileSync('src/types.ts', code);
