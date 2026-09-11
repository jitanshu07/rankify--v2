const d = new Date('2026-09-11'); // Friday
const diffToMon = d.getDay() === 0 ? -6 : 1 - d.getDay();
for (let i = 0; i < 7; i++) {
  const temp = new Date(d);
  temp.setDate(d.getDate() + diffToMon + i);
  console.log(temp.toISOString().split('T')[0]);
}
