const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Replace all occurrences of new Date().toISOString().split('T')[0] with getLogicalDate()
// EXCEPT in the backup file name.

code = code.replace(/new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]/g, 'getLogicalDate()');
code = code.replace(/getLogicalDate\(\)\}\.json/g, "new Date().toISOString().split('T')[0]}.json");

// Fix recordDailyActivity yesterday calculation
code = code.replace(
  /const yesterday = new Date\(\);\n\s*yesterday\.setDate\(yesterday\.getDate\(\) - 1\);\n\s*const yesterdayStr = yesterday\.toISOString\(\)\.split\('T'\)\[0\];/,
  "const yesterday = new Date(today);\n    yesterday.setDate(yesterday.getDate() - 1);\n    const yesterdayStr = yesterday.toISOString().split('T')[0];"
);

fs.writeFileSync('src/context/AppContext.tsx', code);
