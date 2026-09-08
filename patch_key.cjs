const fs = require('fs');
let code = fs.readFileSync('src/components/ClassScheduleCard.tsx', 'utf8');

code = code.replace(/class_schedule_target_year/g, 'arjuna_target_year');

fs.writeFileSync('src/components/ClassScheduleCard.tsx', code);
