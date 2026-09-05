import React from 'react';
import { useApp } from '../context/AppContext';
import { NavTab } from '../types';
import { 
  Home, 
  BookOpen, 
  CalendarClock, 
  Binary, 
  CheckSquare, 
  Timer, 
  Wrench, 
  BarChart3,
  Brain,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface TabItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export const Navigation: React.FC = () => {
  const { currentTab, setCurrentTab, todos, currentUser } = useApp();

  const pendingTodosCount = todos.filter((t) => !t.isCompleted).length;

  const tabs: TabItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'ai-mentor', label: 'AI Mentor', icon: Brain, badge: 'Gemini' },
    { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
    { id: 'tracker', label: 'Tracker', icon: CalendarClock },
    { id: 'formulas', label: 'Formulas', icon: Binary },
    { id: 'todo', label: 'To-Do', icon: CheckSquare, badge: pendingTodosCount > 0 ? pendingTodosCount : undefined },
    { id: 'timer', label: 'Timer', icon: Timer },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { 
      id: 'login', 
      label: currentUser ? 'Account' : 'Sign In', 
      icon: currentUser ? UserCheck : ShieldCheck, 
      badge: !currentUser ? 'New' : undefined 
    },
  ];

  return (
    <nav className="w-full bg-[#0F1624] border-b border-slate-800/80 sticky top-16 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer select-none ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-cyan-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
