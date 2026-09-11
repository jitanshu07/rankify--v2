const fs = require('fs');
let code = fs.readFileSync('src/components/StreakModal.tsx', 'utf8');

// Replace the inner modal div
code = code.replace(
  /className="relative w-full max-w-md max-h-\[90vh\] overflow-y-auto overscroll-contain rounded-3xl bg-\[#121A27\] border border-slate-700\/80 p-6 shadow-2xl space-y-5"/,
  'className="relative w-full max-w-md max-h-[90vh] overflow-y-auto overscroll-contain rounded-3xl bg-[#121A27] border border-slate-700/80 p-6 shadow-2xl space-y-5 animate-pop-in"'
);

fs.writeFileSync('src/components/StreakModal.tsx', code);
