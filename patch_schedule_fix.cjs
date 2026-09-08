const fs = require('fs');
let code = fs.readFileSync('src/components/ClassScheduleCard.tsx', 'utf8');

code = code.replace(
  /const \[targetYear, setTargetYear\] = useState<string>\(\(\) => \{\n\s*return localStorage\.getItem\('class_schedule_target_year'\) \|\| '2025';\n\s*\}\);/,
  `const [targetYear, setTargetYear] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('class_schedule_target_year');
      if (saved && ['2025', '2026', '2027', '2028'].includes(saved.trim())) {
        return saved.trim();
      }
    } catch (e) {}
    return '2025';
  });`
);

code = code.replace(
  /const handleSaveTargetYear = \(\) => \{\n\s*localStorage\.setItem\('class_schedule_target_year', targetYear\);/,
  `const handleSaveTargetYear = () => {
    try {
      localStorage.setItem('class_schedule_target_year', targetYear.trim());
    } catch (e) {}`
);

code = code.replace(
  /<button \n\s*onClick=\{handleSaveTargetYear\}/,
  `<button 
            type="button"
            onClick={handleSaveTargetYear}`
);

fs.writeFileSync('src/components/ClassScheduleCard.tsx', code);
