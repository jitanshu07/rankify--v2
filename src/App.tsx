import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Navigation } from './components/Navigation';
import { StreakModal } from './components/StreakModal';
import { ProfileModal } from './components/ProfileModal';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { HomeScreen } from './screens/HomeScreen';
import { AIMentorScreen } from './screens/AIMentorScreen';
import { SyllabusScreen } from './screens/SyllabusScreen';
import { TrackerScreen } from './screens/TrackerScreen';
import { FormulasScreen } from './screens/FormulasScreen';
import { TodoScreen } from './screens/TodoScreen';
import { TimerScreen } from './screens/TimerScreen';
import { ToolsScreen } from './screens/ToolsScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';

export const App: React.FC = () => {
  const { 
    currentTab, 
    isProfileModalOpen, 
    closeProfileModal,
    isCheckInModalOpen,
    closeCheckInModal
  } = useApp();
  const [isStreakOpen, setIsStreakOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col antialiased font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar onOpenStreak={() => setIsStreakOpen(true)} />

      {/* Tabs Navigation Bar */}
      <Navigation />

      {/* Main Screen Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-6">
        {currentTab === 'home' && <HomeScreen />}
        {currentTab === 'ai-mentor' && <AIMentorScreen />}
        {currentTab === 'syllabus' && <SyllabusScreen />}
        {currentTab === 'tracker' && <TrackerScreen />}
        {currentTab === 'formulas' && <FormulasScreen />}
        {currentTab === 'todo' && <TodoScreen />}
        {currentTab === 'timer' && <TimerScreen />}
        {currentTab === 'tools' && <ToolsScreen />}
        {currentTab === 'analytics' && <AnalyticsScreen />}
      </main>

      {/* Daily Check-In Modal */}
      <DailyCheckInModal isOpen={isCheckInModalOpen} onClose={closeCheckInModal} />

      {/* Streak Modal */}
      <StreakModal isOpen={isStreakOpen} onClose={() => setIsStreakOpen(false)} />

      {/* Profile & Goal Settings Modal */}
      <ProfileModal isOpen={isProfileModalOpen} onClose={closeProfileModal} />

      {/* Minimal Footer */}
      <footer className="border-t border-slate-900 bg-[#080B10] py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Rankify JEE Companion • Crafted for serious IIT JEE Aspirants</span>
          <span className="font-mono text-[11px] text-slate-600">Netlify Ready • Offline LocalStorage Sync</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
