import React, { useState, useEffect } from 'react';
import { Calendar, Save, CheckCircle2 } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Self-Study', 'Mock Test', 'Break'];

export const ClassScheduleCard: React.FC = () => {
  const [isSaved, setIsSaved] = useState(false);
  const [targetYear, setTargetYear] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('class_schedule_target_year');
      if (saved && ['2025', '2026', '2027', '2028'].includes(saved.trim())) {
        return saved.trim();
      }
    } catch (e) {}
    return '2025';
  });
  
  const [timeSlot1, setTimeSlot1] = useState<string>(() => {
    return localStorage.getItem('class_schedule_slot1') || '04:00 pm - 05:45 pm';
  });
  const [timeSlot2, setTimeSlot2] = useState<string>(() => {
    return localStorage.getItem('class_schedule_slot2') || '06:15 pm - 08:00 pm';
  });

  const [dateFrom, setDateFrom] = useState<string>(() => {
    return localStorage.getItem('class_schedule_date_from') || '';
  });
  const [dateTo, setDateTo] = useState<string>(() => {
    return localStorage.getItem('class_schedule_date_to') || '';
  });

  const [schedule, setSchedule] = useState<Record<string, Record<string, string>>>(() => {
    const saved = localStorage.getItem('class_schedule_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  useEffect(() => {
    if (dateTo) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const toDate = new Date(dateTo);
      toDate.setHours(0, 0, 0, 0);
      
      if (today > toDate) {
        setSchedule({});
        setTimeSlot1('');
        setTimeSlot2('');
        setDateFrom('');
        setDateTo('');
      }
    }
  }, [dateTo]);

  useEffect(() => {
    localStorage.setItem('class_schedule_v2', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('class_schedule_slot1', timeSlot1);
  }, [timeSlot1]);

  useEffect(() => {
    localStorage.setItem('class_schedule_slot2', timeSlot2);
  }, [timeSlot2]);

  useEffect(() => {
    localStorage.setItem('class_schedule_date_from', dateFrom);
  }, [dateFrom]);

  useEffect(() => {
    localStorage.setItem('class_schedule_date_to', dateTo);
  }, [dateTo]);

  

  
  const handleSaveTargetYear = () => {
    try {
      localStorage.setItem('class_schedule_target_year', targetYear.trim());
    } catch (e) {}
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const updateCell = (day: string, slotId: string, subject: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...(prev[day] || {}),
        [slotId]: subject
      }
    }));
  };

  return (
    <div className="rounded-3xl bg-[#121A27] border border-slate-800 p-4 sm:p-5 shadow-xl my-4 overflow-hidden">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Arjuna JEE</h2>
              <p className="text-xs text-slate-400">Weekly Class Routine</p>
            </div>
          </div>
          
          <div className="hidden sm:block w-px h-8 bg-slate-800 mx-2" />

          <div className="flex items-center gap-2">
            <input 
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
            />
            <span className="text-slate-500 text-xs font-semibold">to</span>
            <input 
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
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
            type="button"
            onClick={handleSaveTargetYear}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition ${isSaved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500 text-amber-950 hover:bg-amber-400'}`}
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
        </div>
      </div>

      <div className="overflow-x-auto pb-2 -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr>
              <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 bg-slate-900/50 rounded-tl-xl w-32">
                Day
              </th>
              <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 bg-slate-900/50">
                <input 
                  type="text" 
                  value={timeSlot1}
                  onChange={(e) => setTimeSlot1(e.target.value)}
                  placeholder="e.g. 04:00 pm - 05:45 pm"
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-slate-300 w-full placeholder-slate-600"
                />
              </th>
              <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 bg-slate-900/50 rounded-tr-xl">
                <input 
                  type="text" 
                  value={timeSlot2}
                  onChange={(e) => setTimeSlot2(e.target.value)}
                  placeholder="e.g. 06:15 pm - 08:00 pm"
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-slate-300 w-full placeholder-slate-600"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, idx) => (
              <tr key={day} className={`group ${idx !== DAYS.length - 1 ? 'border-b border-slate-800/50' : ''}`}>
                <td className="p-3 text-sm font-medium text-slate-300">
                  {day}
                </td>
                {['slot1', 'slot2'].map(slotId => {
                  const val = schedule[day]?.[slotId] || '';
                  return (
                    <td key={slotId} className="p-2 w-[40%]">
                      <select
                        value={val}
                        onChange={(e) => updateCell(day, slotId, e.target.value)}
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
