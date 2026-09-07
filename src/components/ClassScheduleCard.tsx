import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening'];
const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Self-Study', 'Mock Test', 'Break'];

export const ClassScheduleCard: React.FC = () => {
  const [targetYear, setTargetYear] = useState<string>('2025');
  const [schedule, setSchedule] = useState<Record<string, Record<string, string>>>(() => {
    const saved = localStorage.getItem('class_schedule');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem('class_schedule', JSON.stringify(schedule));
  }, [schedule]);

  const updateCell = (day: string, slot: string, subject: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...(prev[day] || {}),
        [slot]: subject
      }
    }));
  };

  return (
    <div className="rounded-3xl bg-[#121A27] border border-slate-800 p-4 sm:p-5 shadow-xl my-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">Arjuna JEE</h2>
            <p className="text-xs text-slate-400">Weekly Class Routine</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Year:</span>
          <select 
            value={targetYear}
            onChange={(e) => setTargetYear(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-amber-500 transition"
          >
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 bg-slate-900/50 rounded-tl-xl w-32">
                Day
              </th>
              {TIME_SLOTS.map(slot => (
                <th key={slot} className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 bg-slate-900/50">
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, idx) => (
              <tr key={day} className={`group ${idx !== DAYS.length - 1 ? 'border-b border-slate-800/50' : ''}`}>
                <td className="p-3 text-sm font-medium text-slate-300">
                  {day}
                </td>
                {TIME_SLOTS.map(slot => {
                  const val = schedule[day]?.[slot] || '';
                  return (
                    <td key={slot} className="p-2">
                      <select
                        value={val}
                        onChange={(e) => updateCell(day, slot, e.target.value)}
                        className={`w-full p-2 text-xs font-bold rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-1 transition
                          ${!val ? 'bg-slate-900 border border-slate-800 text-slate-500 focus:ring-slate-600' : ''}
                          ${val === 'Physics' ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 focus:ring-rose-500' : ''}
                          ${val === 'Chemistry' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 focus:ring-emerald-500' : ''}
                          ${val === 'Mathematics' ? 'bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 focus:ring-fuchsia-500' : ''}
                          ${val && !['Physics', 'Chemistry', 'Mathematics'].includes(val) ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400 focus:ring-blue-500' : ''}
                        `}
                      >
                        <option value="" className="bg-slate-900 text-slate-500">Free Slot</option>
                        {SUBJECTS.map(subj => (
                          <option key={subj} value={subj} className="bg-slate-900 text-slate-300">
                            {subj}
                          </option>
                        ))}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
