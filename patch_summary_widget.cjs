const fs = require('fs');
let code = fs.readFileSync('src/screens/TodoScreen.tsx', 'utf8');

const summaryWidgetHtml = `
      {/* Daily Summary Widget */}
      <div className="p-4 rounded-2xl bg-[#121A27] border border-slate-800 flex items-center justify-between shadow-sm relative overflow-hidden">
        {totalCount > 0 && completionPercentage === 100 && (
           <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>
        )}
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-slate-900 shadow-inner shrink-0">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="24" className="stroke-slate-800 fill-none" strokeWidth="4" />
              <circle 
                cx="28" cy="28" r="24" 
                className="stroke-emerald-400 fill-none transition-all duration-1000 ease-out" 
                strokeWidth="4" 
                strokeDasharray="150.796" 
                strokeDashoffset={150.796 - (150.796 * completionPercentage) / 100}
                strokeLinecap="round" 
              />
            </svg>
            <span className="text-xs font-black text-white z-10">{completionPercentage}%</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white mb-0.5">Daily Summary</h3>
            {totalCount > 0 && completionPercentage === 100 ? (
              <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
                <Sparkles className="w-3.5 h-3.5" /> Incredible! All tasks are finished for today.
              </p>
            ) : totalCount > 0 ? (
              <p className="text-xs text-slate-400">
                You have completed <strong className="text-slate-200">{completedCount}</strong> out of <strong className="text-slate-200">{totalCount}</strong> tasks. Keep pushing!
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                No tasks for today. Add some below to get started!
              </p>
            )}
          </div>
        </div>
      </div>
`;

code = code.replace(
  /\{\/\* Task Creation Card \*\/\}/,
  summaryWidgetHtml + "\n\n      {/* Task Creation Card */}"
);

fs.writeFileSync('src/screens/TodoScreen.tsx', code);
