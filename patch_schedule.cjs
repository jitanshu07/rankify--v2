const fs = require('fs');
let code = fs.readFileSync('src/components/ClassScheduleCard.tsx', 'utf8');

// Also import Check icon from lucide-react if needed, or we can just use simple text.
// We have Calendar from lucide-react. Let's add Save.
code = code.replace(
  /import \{ Calendar \} from 'lucide-react';/,
  "import { Calendar, Save, CheckCircle2 } from 'lucide-react';"
);

// Add state for "saved" feedback
code = code.replace(
  /const \[targetYear, setTargetYear\] = useState<string>\(\(\) => \{/,
  "const [isSaved, setIsSaved] = useState(false);\n  const [targetYear, setTargetYear] = useState<string>(() => {"
);

const saveTargetYearCode = `
  const handleSaveTargetYear = () => {
    localStorage.setItem('class_schedule_target_year', targetYear);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };
`;

code = code.replace(
  /const updateCell = \(day: string, slotId: string, subject: string\) => \{/,
  saveTargetYearCode + "\n  const updateCell = (day: string, slotId: string, subject: string) => {"
);

code = code.replace(
  /<div className="flex items-center gap-2">\n\s*<span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Year:<\/span>\n\s*<select \n\s*value=\{targetYear\}\n\s*onChange=\{\(e\) => setTargetYear\(e\.target\.value\)\}\n\s*className="px-3 py-1\.5 rounded-lg bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-amber-500 transition"\n\s*>\n\s*<option value="2025">2025<\/option>\n\s*<option value="2026">2026<\/option>\n\s*<option value="2027">2027<\/option>\n\s*<option value="2028">2028<\/option>\n\s*<\/select>\n\s*<\/div>/,
  `<div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">Target Year:</span>
          <select 
            value={targetYear}
            onChange={(e) => {
              setTargetYear(e.target.value);
              setIsSaved(false);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
          >
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
          </select>
          <button 
            onClick={handleSaveTargetYear}
            className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition \${isSaved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500 text-amber-950 hover:bg-amber-400'}\`}
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" /> Save
              </>
            )}
          </button>
        </div>`
);

fs.writeFileSync('src/components/ClassScheduleCard.tsx', code);
