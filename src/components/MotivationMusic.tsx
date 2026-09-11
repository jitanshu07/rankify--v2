import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, Upload, Music, Trash2, Volume2, Shuffle, Clock, Bell, BellOff } from 'lucide-react';

export interface AudioTrack {
  id: string;
  name: string;
  data: string; // base64
}

export const MotivationMusic: React.FC = () => {
  
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


  useEffect(() => {
    // Load from localStorage
    try {
      const saved = localStorage.getItem('motivation_music_tracks');
      if (saved) {
        const parsed = JSON.parse(saved);
        setTracks(parsed);
      }
    } catch (e) {
      console.error('Failed to load tracks', e);
    }
  }, []);

  useEffect(() => {
    // Save to localStorage whenever tracks change
    try {
      if (tracks.length > 0) {
         localStorage.setItem('motivation_music_tracks', JSON.stringify(tracks));
      } else {
         localStorage.removeItem('motivation_music_tracks');
      }
    } catch (e) {
      console.error('Failed to save tracks. May be exceeding localStorage quota.', e);
      // Handle quota exceeded error gracefully?
      if (e instanceof DOMException && (e.code === 22 || e.code === 1014 || e.name === 'QuotaExceededError')) {
        alert("Storage limit reached! Please delete some audio clips to add more.");
      }
    }
  }, [tracks]);

  // Shuffle Engine Logic
  const playNext = () => {
    if (tracks.length === 0) return;

    let available = [...unplayedIds];
    let didReset = false;
    
    // If we've played all tracks, reset the unplayed list
    if (available.length === 0) {
      available = tracks.map(t => t.id);
      didReset = true;
    }

    let pickable = [...available];

    // Exclude the currently playing track from being picked again immediately if there are others
    if (didReset && pickable.length > 1 && currentTrack) {
       pickable = pickable.filter(id => id !== currentTrack.id);
    }

    const randomIndex = Math.floor(Math.random() * pickable.length);
    const nextId = pickable[randomIndex];
    
    
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
      const currentTime = `${hours}:${minutes}`;
      const today = now.toDateString();
      
      const scheduleKey = `${today}-${currentTime}`;
      
      if (currentTime === scheduledTime && lastPlayedSchedule !== scheduleKey) {
        setLastPlayedSchedule(scheduleKey);
        playNextRef.current();
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [isSchedulerEnabled, scheduledTime, tracks.length, lastPlayedSchedule]);


  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.data;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('audio/')) {
        // limit to ~1MB to not kill localstorage instantly
        if (file.size > 2 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Please select a clip under 2MB (around 30-40 seconds).`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const newTrack: AudioTrack = {
              id: Date.now().toString() + Math.random().toString(36).substring(7),
              name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
              data: event.target.result as string
            };
            setTracks(prev => [...prev, newTrack]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeTrack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTracks(prev => prev.filter(t => t.id !== id));
    setUnplayedIds(prev => prev.filter(uId => uId !== id));
    
    if (currentTrack?.id === id) {
      audioRef.current?.pause();
      setIsPlaying(false);
      setCurrentTrack(null);
    }
  };

  const togglePlay = () => {
    if (!currentTrack && tracks.length > 0) {
      playNext();
    } else if (currentTrack) {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="rounded-3xl bg-[#121A27] border border-slate-800 p-5 shadow-lg w-full flex flex-col h-full min-h-[350px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Music className="w-5 h-5 text-indigo-400" />
          Motivation Audio
        </h2>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 transition flex items-center gap-1.5 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          Add Clips
        </button>
        <input 
          type="file" 
          accept="audio/*" 
          multiple 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
        />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Player Controls */}
        <div className="flex flex-col items-center bg-slate-900/60 rounded-2xl p-4 border border-slate-800/80 mb-4">
          <div className="text-sm font-semibold text-slate-200 mb-1 text-center truncate w-full px-4">
            {currentTrack ? currentTrack.name : "Upload short 30-40s clips & hit play."}
          </div>
          <div className="text-[10px] text-slate-500 mb-4 flex items-center gap-1">
            <Shuffle className="w-3 h-3" /> Smart Shuffle Engine Enabled
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={togglePlay}
              disabled={tracks.length === 0}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${tracks.length === 0 ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-indigo-500 text-white hover:bg-indigo-400 hover:scale-105 cursor-pointer'}`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
            </button>
            <button 
              onClick={playNext}
              disabled={tracks.length === 0}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition bg-slate-800 border border-slate-700 ${tracks.length === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer'}`}
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        
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
              className={`p-1.5 rounded-lg transition ${isSchedulerEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}
              title={isSchedulerEnabled ? "Reminder Active" : "Reminder Muted"}
            >
              {isSchedulerEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Track List */}

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
          {tracks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-6">
              <Volume2 className="w-8 h-8 opacity-20" />
              <p className="text-xs text-center max-w-[200px]">No motivation clips uploaded yet. Keep them short (under 2MB).</p>
            </div>
          ) : (
            tracks.map(track => (
              <div 
                key={track.id}
                onClick={() => {
                  setCurrentTrack(track);
                  setIsPlaying(true);
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition border ${
                  currentTrack?.id === track.id 
                  ? 'bg-indigo-500/10 border-indigo-500/30' 
                  : 'bg-slate-900/40 border-transparent hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${currentTrack?.id === track.id ? 'bg-indigo-400 animate-pulse' : 'bg-slate-700'}`} />
                  <span className={`text-xs truncate ${currentTrack?.id === track.id ? 'text-indigo-300 font-bold' : 'text-slate-300'}`}>
                    {track.name}
                  </span>
                </div>
                <button 
                  onClick={(e) => removeTrack(track.id, e)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <audio 
        ref={audioRef} 
        onEnded={playNext}
        className="hidden" 
      />
    </div>
  );
};
