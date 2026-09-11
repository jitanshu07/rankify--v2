const fs = require('fs');
let code = fs.readFileSync('src/components/StreakModal.tsx', 'utf8');

code = code.replace(
  /className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black\/75 backdrop-blur-sm animate-in fade-in overscroll-contain"/,
  'className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overscroll-contain"'
);

fs.writeFileSync('src/components/StreakModal.tsx', code);
