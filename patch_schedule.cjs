const fs = require('fs');
let code = fs.readFileSync('src/components/ClassScheduleCard.tsx', 'utf8');

// 1. Rewrite the initial state getter
code = code.replace(
  /const \[targetYear, setTargetYear\] = useState<string>\(\(\) => \{[\s\S]*?return '2025';\n  \}\);/,
  `const [targetYear, setTargetYear] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('class_schedule_target_year');
      if (saved) {
        return saved.trim();
      }
    } catch (e) {}
    return '2026'; // Defaulting to 2026 as per new bounds
  });`
);

// 2. Add an auto-save useEffect to guarantee it never resets on refresh even if they forget the Save button
code = code.replace(
  /const handleSaveTargetYear = \(\) => \{/,
  `// Auto-save target year whenever it changes to prevent reset issues
  useEffect(() => {
    try {
      localStorage.setItem('class_schedule_target_year', targetYear.trim());
    } catch (e) {}
  }, [targetYear]);

  const handleSaveTargetYear = () => {`
);

// 3. Replace the hardcoded options with a dynamic map from 2026 to 2050
const optionsRegex = /<select [\s\S]*?<\/select>/;

const newSelect = `<select 
            value={targetYear}
            onChange={(e) => {
              setTargetYear(e.target.value);
              setIsSaved(false);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
          >
            {Array.from({ length: 25 }, (_, i) => 2026 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>`;

code = code.replace(optionsRegex, newSelect);

fs.writeFileSync('src/components/ClassScheduleCard.tsx', code);
