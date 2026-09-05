import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Clock, Moon, Sun, Download, Upload, RotateCcw, Quote, Sparkles, User, Target, CheckCircle2, Zap, LogOut, ShieldCheck } from 'lucide-react';
import { HARD_QUOTES } from '../data/initialData';

interface NavbarProps {
  onOpenStreak: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenStreak }) => {
  const { 
    profile, 
    isDarkMode, 
    toggleDarkMode, 
    exportData, 
    importData, 
    resetAllData, 
    openProfileModal,
    todaysCheckIn,
    openCheckInModal,
    currentUser,
    logout,
    setCurrentTab
  } = useApp();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [timeString, setTimeString] = useState('');
  const [showBackupMenu, setShowBackupMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Digital Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Quotes Rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % HARD_QUOTES.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const success = importData(text);
          if (success) {
            alert('Rankify data restored successfully!');
            setShowBackupMenu(false);
          } else {
            alert('Invalid backup file format.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0B0F17]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <span className="font-extrabold text-xl tracking-wider">R</span>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0B0F17] animate-pulse" />
          </div>
          <div 
            onClick={openProfileModal}
            className="cursor-pointer group"
            title="Click to edit Target Exam & Year"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight group-hover:text-cyan-400 transition-colors">Rankify</span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-widest">
                JEE Hub
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-[180px] group-hover:text-cyan-300 transition-colors">
              {profile.targetExam}
            </p>
          </div>
        </div>

        {/* Motivational Ticker (Medium & Large screens) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300 max-w-md mx-2 overflow-hidden shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
          <p className="truncate italic">"{HARD_QUOTES[quoteIndex]}"</p>
        </div>

        {/* Live Clock, Streak & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Aspirant Profile & Target Year Button */}
          <button
            onClick={openProfileModal}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 text-slate-200 hover:text-white transition cursor-pointer group shadow-sm"
            title="Edit Profile, Target Exam & Year"
          >
            <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center text-[10px] font-extrabold shadow-sm">
              {profile.name.charAt(0).toUpperCase() || 'J'}
            </div>
            <span className="text-xs font-semibold max-w-[80px] sm:max-w-[110px] truncate">
              {profile.name}
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold">
              {profile.targetYear || 2027}
            </span>
          </button>

          {/* Live Clock */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
            <Clock className="w-3.5 h-3.5 text-cyan-400/80" />
            <span>{timeString}</span>
          </div>

          {/* Daily Check-In Action */}
          <button
            onClick={openCheckInModal}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
              todaysCheckIn
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50 text-amber-300 hover:text-white hover:border-amber-400 animate-pulse'
            }`}
            title={todaysCheckIn ? 'Daily Check-In Completed for Today' : 'Daily Check-In Pending (+1 Streak Day)'}
          >
            {todaysCheckIn ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Checked In</span>
              </>
            ) : (
              <>
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>Check-In</span>
              </>
            )}
          </button>

          {/* Streak Flame Badge */}
          <button
            onClick={onOpenStreak}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 text-amber-400 hover:border-amber-400/60 transition-all cursor-pointer group shadow-sm hover:shadow-amber-500/20"
            title="View Daily Streak Details"
          >
            <Flame className="w-4 h-4 text-orange-400 fill-orange-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold font-mono">{profile.currentStreak}d</span>
          </button>

          {/* EXP Counter - Placed right next to Streak Counter */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-yellow-500/15 via-amber-500/15 to-yellow-500/15 border border-yellow-500/40 text-yellow-300 shadow-sm"
            title={`${profile.exp || 0} Total EXP (+5 EXP per completed task)`}
          >
            <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-black font-mono tracking-tight">{profile.exp || 0} <span className="text-[10px] text-yellow-400/80 font-bold">EXP</span></span>
          </div>

          {/* Account Status / User Pill */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 text-slate-200 transition cursor-pointer shadow-sm"
                title={`Account: ${currentUser.email} (${currentUser.id})`}
              >
                <div className="relative w-5 h-5 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center flex-shrink-0">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-cyan-300">{currentUser.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="text-xs font-semibold max-w-[65px] sm:max-w-[85px] truncate hidden xs:inline">
                  {currentUser.name.split(' ')[0]}
                </span>
                {currentUser.provider === 'google' ? (
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                )}
              </button>

              {showAccountMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#121A27] border border-cyan-500/30 shadow-2xl p-3 z-50 text-xs space-y-2 animate-in fade-in zoom-in-95">
                  <div className="pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        {currentUser.provider === 'google' ? 'Connected via Google' : 'Connected via Account'}
                      </span>
                    </div>
                    <p className="font-bold text-slate-100 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    <p className="text-[9px] font-mono text-cyan-400 mt-1 truncate">
                      Partition ID: {currentUser.id}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setShowAccountMenu(false);
                      setCurrentTab('login');
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-200 hover:bg-slate-800 transition text-left cursor-pointer"
                  >
                    <span>Account & Isolation Center</span>
                    <span className="text-[10px] text-cyan-400 font-bold">Manage →</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowAccountMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setCurrentTab('login')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white text-xs font-bold transition shadow-md shadow-cyan-500/20 cursor-pointer"
              title="Sign in or create an account to isolate your To-Dos, EXP and Streak"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In / Up</span>
            </button>
          )}

          {/* Backup & Restore Menu */}
          <div className="relative">
            <button
              onClick={() => setShowBackupMenu(!showBackupMenu)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
              title="Backup, Sync & Data Options"
            >
              <Download className="w-4 h-4 text-slate-400" />
            </button>

            {showBackupMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#121A27] border border-slate-700/80 shadow-2xl p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Data & Backup
                </div>
                <button
                  onClick={() => {
                    exportData();
                    setShowBackupMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-slate-200 hover:bg-slate-800 transition text-left"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download Backup (.json)</span>
                </button>
                <label className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-slate-200 hover:bg-slate-800 transition cursor-pointer text-left">
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Restore from Backup</span>
                  <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                </label>
                <div className="border-t border-slate-800 my-1"></div>
                <button
                  onClick={() => {
                    setShowBackupMenu(false);
                    resetAllData();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition text-left"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Data to Default</span>
                </button>
              </div>
            )}
          </div>

          {/* Dark / Light toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
