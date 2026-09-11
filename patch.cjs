const fs = require('fs');

let code = fs.readFileSync('src/components/MotivationMusic.tsx', 'utf-8');

// 1. Add imports
code = code.replace(
  "import { Play, Pause, SkipForward, Upload, Music, Trash2, Volume2, Shuffle } from 'lucide-react';",
  "import { Play, Pause, SkipForward, Upload, Music, Trash2, Volume2, Shuffle, Clock, Bell, BellOff } from 'lucide-react';"
);

// 2. Add state hooks
const stateHooks = `
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [unplayedIds, setUnplayedIds] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [scheduledTime, setScheduledTime] = useState<string>(() => localStorage.getItem('motivation_scheduled_time') || '');
  const [isSchedulerEnabled, setIsSchedulerEnabled] = useState<boolean>(() => localStorage.getItem('motivation_scheduler_enabled') === 'true');
  const [lastPlayedSchedule, setLastPlayedSchedule] = useState<string>(() => localStorage.getItem('motivation_last_played_schedule') || '');

  useEffect(() => {
    localStorage.setItem('motivation_scheduled_time', scheduledTime);
  }, [scheduledTime]);

  useEffect(() => {
    localStorage.setItem('motivation_scheduler_enabled', String(isSchedulerEnabled));
  }, [isSchedulerEnabled]);

  useEffect(() => {
    localStorage.setItem('motivation_last_played_schedule', lastPlayedSchedule);
  }, [lastPlayedSchedule]);
`;
code = code.replace(
  /const \[tracks, setTracks\] = useState<AudioTrack\[\]>\(\[\]\);([\s\S]*?)const fileInputRef = useRef<HTMLInputElement \| null>\(null\);/,
  stateHooks
);

// 3. Add playNextRef and scheduler effect right after playNext
const effectCode = `
    const nextTrack = tracks.find(t => t.id === nextId);
    if (nextTrack) {
      setCurrentTrack(nextTrack);
      setUnplayedIds(available.filter(id => id !== nextId));
      setIsPlaying(true);
    }
  };

  const playNextRef = useRef(playNext);
  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  // Scheduler Effect
  useEffect(() => {
    if (!isSchedulerEnabled || !scheduledTime || tracks.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = \`\${hours}:\${minutes}\`;
      const today = now.toDateString();
      
      const scheduleKey = \`\${today}-\${currentTime}\`;
      
      if (currentTime === scheduledTime && lastPlayedSchedule !== scheduleKey) {
        setLastPlayedSchedule(scheduleKey);
        playNextRef.current();
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [isSchedulerEnabled, scheduledTime, tracks.length, lastPlayedSchedule]);
`;
code = code.replace(
  /const nextTrack = tracks\.find\(t => t\.id === nextId\);\s+if \(nextTrack\) {[\s\S]*?setIsPlaying\(true\);\s+}\s+};/,
  effectCode
);

// 4. Add UI
const uiCode = `
        {/* Scheduler Controls */}
        <div className="flex items-center justify-between bg-slate-900/40 rounded-2xl p-3 border border-slate-800/80 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-300">Daily Reminder</span>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="time" 
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
            />
            <button
              onClick={() => setIsSchedulerEnabled(!isSchedulerEnabled)}
              className={\`p-1.5 rounded-lg transition \${isSchedulerEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}\`}
              title={isSchedulerEnabled ? "Reminder Active" : "Reminder Muted"}
            >
              {isSchedulerEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Track List */}
`;
code = code.replace(
  /{\/\* Track List \*\/}/,
  uiCode
);

fs.writeFileSync('src/components/MotivationMusic.tsx', code);
console.log('Patched');
