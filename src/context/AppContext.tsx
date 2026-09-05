import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Chapter, 
  ChapterTrackingState, 
  Formula, 
  TodoItem, 
  StudySession, 
  ErrorLog, 
  BacklogItem, 
  UserProfile, 
  NavTab, 
  PriorityType, 
  RoutineTemplate,
  DailyCheckIn
} from '../types';
import { 
  INITIAL_CHAPTERS, 
  INITIAL_FORMULAS, 
  INITIAL_TODOS, 
  INITIAL_BACKLOGS, 
  INITIAL_ERRORS 
} from '../data/initialData';

interface AppContextType {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Profile
  profile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => void;
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  
  // Syllabus & Chapters
  chapters: Chapter[];
  trackingStateMap: Record<number, ChapterTrackingState>;
  toggleChapterCompletion: (id: number) => void;
  incrementChapterRevision: (id: number) => void;
  resetChapterRevision: (id: number) => void;
  toggleChapterNotes: (id: number) => void;
  toggleChapterDpp: (id: number) => void;
  toggleChapterTest: (id: number) => void;
  
  // Todos
  todos: TodoItem[];
  addTodo: (title: string, subject: string, priority: PriorityType) => void;
  addMultipleTodos: (items: { title: string; subject: string; priority: PriorityType }[]) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  clearCompletedTodos: () => void;
  applyRoutineTemplate: (template: RoutineTemplate) => void;
  
  // Formulas
  formulas: Formula[];
  addFormula: (formula: Omit<Formula, 'id'>) => void;
  deleteFormula: (id: string) => void;
  
  // Timer & Sessions
  sessions: StudySession[];
  logSession: (session: Omit<StudySession, 'id' | 'timestamp'>) => void;
  deleteSession: (id: string) => void;
  
  // Backlogs
  backlogs: BacklogItem[];
  addBacklog: (title: string, subject: string, targetDate: string, urgency: 'Critical' | 'High' | 'Medium') => void;
  toggleBacklog: (id: string) => void;
  deleteBacklog: (id: string) => void;
  
  // Error Book
  errors: ErrorLog[];
  addError: (error: Omit<ErrorLog, 'id' | 'isResolved' | 'dateAdded'>) => void;
  toggleErrorResolved: (id: string) => void;
  deleteError: (id: string) => void;

  // Daily Check-In & Streak Rewards
  checkIns: DailyCheckIn[];
  todaysCheckIn: DailyCheckIn | undefined;
  submitDailyCheckIn: (data: Omit<DailyCheckIn, 'id' | 'date' | 'timestamp'>) => void;
  deleteCheckIn: (id: string) => void;
  isCheckInModalOpen: boolean;
  openCheckInModal: () => void;
  closeCheckInModal: () => void;
  
  // End of Day & EXP Penalty
  triggerEndOfDayCheck: () => { penalized: boolean; message: string };
  clearPenaltyNotice: () => void;

  // Backup & Restore
  exportData: () => void;
  importData: (jsonData: string) => boolean;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CHAPTERS: 'rankify_chapters_v2',
  TRACKING: 'rankify_tracking_v2',
  TODOS: 'rankify_todos_v2',
  FORMULAS: 'rankify_formulas_v2',
  SESSIONS: 'rankify_sessions_v2',
  BACKLOGS: 'rankify_backlogs_v2',
  ERRORS: 'rankify_errors_v2',
  PROFILE: 'rankify_profile_v2',
  THEME: 'rankify_theme_v2',
  CHECK_INS: 'rankify_checkins_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved !== null ? saved === 'true' : true;
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || 'Jitanshu',
          targetExam: parsed.targetExam || 'JEE Advanced 2027 (AIR < 500)',
          targetYear: Number(parsed.targetYear) || 2027,
          examGoal: parsed.examGoal || 'JEE Advanced',
          targetRank: parsed.targetRank || 'AIR < 500',
          dreamCollege: parsed.dreamCollege || 'IIT Bombay',
          dailyHourGoal: Number(parsed.dailyHourGoal) || 8,
          currentStreak: Number(parsed.currentStreak) || 0,
          bestStreak: Number(parsed.bestStreak) || 0,
          streakGoalTarget: Number(parsed.streakGoalTarget) || 3,
          lastActiveDate: parsed.lastActiveDate || new Date().toISOString().split('T')[0],
          isOnboarded: Boolean(parsed.isOnboarded),
          exp: Number(parsed.exp) || 0,
          lastCheckedDate: parsed.lastCheckedDate || new Date().toISOString().split('T')[0],
          lastPenaltyReason: parsed.lastPenaltyReason || ''
        };
      } catch (e) { /* ignore */ }
    }
    return {
      name: 'Jitanshu',
      targetExam: 'JEE Advanced 2027 (AIR < 500)',
      targetYear: 2027,
      examGoal: 'JEE Advanced',
      targetRank: 'AIR < 500',
      dreamCollege: 'IIT Bombay',
      dailyHourGoal: 8,
      currentStreak: 0,
      bestStreak: 0,
      streakGoalTarget: 3,
      lastActiveDate: new Date().toISOString().split('T')[0],
      isOnboarded: false,
      exp: 0,
      lastCheckedDate: new Date().toISOString().split('T')[0],
      lastPenaltyReason: ''
    };
  });

  const [chapters, setChapters] = useState<Chapter[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_CHAPTERS;
  });

  const [trackingStateMap, setTrackingStateMap] = useState<Record<number, ChapterTrackingState>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRACKING);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {};
  });

  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TODOS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_TODOS;
  });

  const [formulas, setFormulas] = useState<Formula[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FORMULAS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_FORMULAS;
  });

  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  const [backlogs, setBacklogs] = useState<BacklogItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BACKLOGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_BACKLOGS;
  });

  const [errors, setErrors] = useState<ErrorLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ERRORS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_ERRORS;
  });

  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHECK_INS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);

  // Persist whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters));
  }, [chapters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRACKING, JSON.stringify(trackingStateMap));
  }, [trackingStateMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FORMULAS, JSON.stringify(formulas));
  }, [formulas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BACKLOGS, JSON.stringify(backlogs));
  }, [backlogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ERRORS, JSON.stringify(errors));
  }, [errors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(checkIns));
  }, [checkIns]);

  const todayDateStr = new Date().toISOString().split('T')[0];
  const todaysCheckIn = checkIns.find(c => c.date === todayDateStr);

  const openCheckInModal = () => setIsCheckInModalOpen(true);
  const closeCheckInModal = () => setIsCheckInModalOpen(false);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  // Syllabus
  const toggleChapterCompletion = (id: number) => {
    setChapters(prev => prev.map(ch => ch.id === id ? { ...ch, isCompleted: !ch.isCompleted } : ch));
  };

  const getChapterTracking = (id: number): ChapterTrackingState => {
    return trackingStateMap[id] || { revisionCount: 0, notesDone: false, dppDone: false, testDone: false };
  };

  const incrementChapterRevision = (id: number) => {
    setTrackingStateMap(prev => {
      const current = prev[id] || { revisionCount: 0, notesDone: false, dppDone: false, testDone: false };
      return {
        ...prev,
        [id]: { ...current, revisionCount: current.revisionCount + 1 }
      };
    });
  };

  const resetChapterRevision = (id: number) => {
    setTrackingStateMap(prev => {
      const current = prev[id] || { revisionCount: 0, notesDone: false, dppDone: false, testDone: false };
      return {
        ...prev,
        [id]: { ...current, revisionCount: 0 }
      };
    });
  };

  const toggleChapterNotes = (id: number) => {
    setTrackingStateMap(prev => {
      const current = prev[id] || { revisionCount: 0, notesDone: false, dppDone: false, testDone: false };
      return {
        ...prev,
        [id]: { ...current, notesDone: !current.notesDone }
      };
    });
  };

  const toggleChapterDpp = (id: number) => {
    setTrackingStateMap(prev => {
      const current = prev[id] || { revisionCount: 0, notesDone: false, dppDone: false, testDone: false };
      return {
        ...prev,
        [id]: { ...current, dppDone: !current.dppDone }
      };
    });
  };

  const toggleChapterTest = (id: number) => {
    setTrackingStateMap(prev => {
      const current = prev[id] || { revisionCount: 0, notesDone: false, dppDone: false, testDone: false };
      return {
        ...prev,
        [id]: { ...current, testDone: !current.testDone }
      };
    });
  };

  // Todos
  const addTodo = (title: string, subject: string, priority: PriorityType) => {
    const newTodo: TodoItem = {
      id: 't_' + Date.now(),
      title,
      subject,
      priority,
      isCompleted: false,
      dateCreated: new Date().toISOString().split('T')[0]
    };
    setTodos(prev => [newTodo, ...prev]);
  };

  const addMultipleTodos = (items: { title: string; subject: string; priority: PriorityType }[]) => {
    const today = new Date().toISOString().split('T')[0];
    const newItems: TodoItem[] = items.map((item, idx) => ({
      id: 't_ai_' + Date.now() + '_' + idx,
      title: item.title,
      subject: item.subject,
      priority: item.priority,
      isCompleted: false,
      dateCreated: today
    }));
    setTodos(prev => [...newItems, ...prev]);
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => {
      const target = prev.find(t => t.id === id);
      if (!target) return prev;
      const willBeCompleted = !target.isCompleted;

      // Give +5 EXP for every task completed in the To-Do list; deduct 5 if unchecked (min 0)
      setProfile(p => {
        const expDelta = willBeCompleted ? 5 : -5;
        const nextExp = Math.max(0, (p.exp || 0) + expDelta);
        return { ...p, exp: nextExp };
      });

      return prev.map(t => t.id === id ? { ...t, isCompleted: willBeCompleted } : t);
    });
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const clearCompletedTodos = () => {
    setTodos(prev => prev.filter(t => !t.isCompleted));
  };

  const applyRoutineTemplate = (template: RoutineTemplate) => {
    const today = new Date().toISOString().split('T')[0];
    const newTodos: TodoItem[] = template.tasks.map((task, idx) => ({
      id: 'template_' + Date.now() + '_' + idx,
      title: task.title,
      subject: task.subject,
      priority: task.priority,
      isCompleted: false,
      dateCreated: today
    }));
    setTodos(prev => [...newTodos, ...prev]);
  };

  // Formulas
  const addFormula = (formulaData: Omit<Formula, 'id'>) => {
    const newFormula: Formula = {
      ...formulaData,
      id: 'f_' + Date.now()
    };
    setFormulas(prev => [newFormula, ...prev]);
  };

  const deleteFormula = (id: string) => {
    setFormulas(prev => prev.filter(f => f.id !== id));
  };

  const recordDailyActivity = (prev: UserProfile, today: string): UserProfile => {
    if (prev.lastActiveDate === today && prev.currentStreak > 0) {
      return prev;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let nextStreak = 1;
    if (prev.lastActiveDate === yesterdayStr) {
      nextStreak = prev.currentStreak + 1;
    } else if (prev.lastActiveDate === today && prev.currentStreak === 0) {
      nextStreak = 1;
    }

    const nextBest = Math.max(prev.bestStreak, nextStreak);

    return {
      ...prev,
      currentStreak: nextStreak,
      bestStreak: nextBest,
      lastActiveDate: today
    };
  };

  // Sessions
  const logSession = (sessionData: Omit<StudySession, 'id' | 'timestamp'>) => {
    const newSession: StudySession = {
      ...sessionData,
      id: 's_' + Date.now(),
      timestamp: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);

    // Update streak if active today
    const today = new Date().toISOString().split('T')[0];
    setProfile(prev => recordDailyActivity(prev, today));
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  // Daily Check-In
  const submitDailyCheckIn = (data: Omit<DailyCheckIn, 'id' | 'date' | 'timestamp'>) => {
    const today = new Date().toISOString().split('T')[0];
    const now = Date.now();
    
    const newCheckIn: DailyCheckIn = {
      ...data,
      id: 'ci_' + today,
      date: today,
      timestamp: now
    };

    setCheckIns(prev => {
      const filtered = prev.filter(c => c.date !== today);
      return [newCheckIn, ...filtered];
    });

    // Reward daily consistency via streak advancement
    setProfile(prev => recordDailyActivity(prev, today));
  };

  const deleteCheckIn = (id: string) => {
    setCheckIns(prev => prev.filter(c => c.id !== id));
  };

  // Backlogs
  const addBacklog = (title: string, subject: string, targetDate: string, urgency: 'Critical' | 'High' | 'Medium') => {
    const newBacklog: BacklogItem = {
      id: 'b_' + Date.now(),
      title,
      subject,
      targetDate,
      urgency,
      isCompleted: false
    };
    setBacklogs(prev => [newBacklog, ...prev]);
  };

  const toggleBacklog = (id: string) => {
    setBacklogs(prev => prev.map(b => b.id === id ? { ...b, isCompleted: !b.isCompleted } : b));
  };

  const deleteBacklog = (id: string) => {
    setBacklogs(prev => prev.filter(b => b.id !== id));
  };

  // Errors
  const addError = (errorData: Omit<ErrorLog, 'id' | 'isResolved' | 'dateAdded'>) => {
    const newError: ErrorLog = {
      ...errorData,
      id: 'e_' + Date.now(),
      isResolved: false,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    setErrors(prev => [newError, ...prev]);
  };

  const toggleErrorResolved = (id: string) => {
    setErrors(prev => prev.map(e => e.id === id ? { ...e, isResolved: !e.isResolved } : e));
  };

  const deleteError = (id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id));
  };

  // End of Day Penalty Logic:
  // If day changed and there were incomplete tasks, reset streak and EXP to 0
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setProfile(prev => {
      const lastCheck = prev.lastCheckedDate;
      if (!lastCheck) {
        return { ...prev, lastCheckedDate: today };
      }
      if (lastCheck < today) {
        const hadIncompleteTasks = todos.length > 0 && todos.some(t => !t.isCompleted);
        if (hadIncompleteTasks) {
          const incompleteCount = todos.filter(t => !t.isCompleted).length;
          return {
            ...prev,
            currentStreak: 0,
            exp: 0,
            lastCheckedDate: today,
            lastPenaltyReason: `End-of-day penalty applied: ${incompleteCount} task(s) were left incomplete on ${lastCheck}. Streak and EXP have been reset to 0.`
          };
        }
        return { ...prev, lastCheckedDate: today };
      }
      return prev;
    });
  }, [todos]);

  const triggerEndOfDayCheck = (): { penalized: boolean; message: string } => {
    if (todos.length === 0) {
      return {
        penalized: false,
        message: 'No tasks active in your To-Do list. Add tasks and complete them to earn +5 EXP each!'
      };
    }

    const hasIncomplete = todos.some(t => !t.isCompleted);
    const incompleteCount = todos.filter(t => !t.isCompleted).length;

    if (hasIncomplete) {
      setProfile(prev => ({
        ...prev,
        currentStreak: 0,
        exp: 0,
        lastPenaltyReason: `End-of-day penalty applied: ${incompleteCount} of ${todos.length} tasks were left incomplete. Streak and EXP have been reset to 0.`
      }));
      return {
        penalized: true,
        message: `Penalty applied! ${incompleteCount} task(s) were not completed by the end of the day. Streak and EXP have been reset to 0.`
      };
    } else {
      return {
        penalized: false,
        message: `Outstanding! All ${todos.length} tasks are 100% completed. Your streak and EXP are completely protected!`
      };
    }
  };

  const clearPenaltyNotice = () => {
    setProfile(p => ({ ...p, lastPenaltyReason: '' }));
  };

  // Backup & Restore
  const exportData = () => {
    const fullData = {
      profile,
      chapters,
      trackingStateMap,
      todos,
      formulas,
      sessions,
      backlogs,
      errors,
      checkIns,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rankify-jee-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.chapters) setChapters(data.chapters);
      if (data.trackingStateMap) setTrackingStateMap(data.trackingStateMap);
      if (data.todos) setTodos(data.todos);
      if (data.formulas) setFormulas(data.formulas);
      if (data.sessions) setSessions(data.sessions);
      if (data.backlogs) setBacklogs(data.backlogs);
      if (data.errors) setErrors(data.errors);
      if (data.checkIns) setCheckIns(data.checkIns);
      if (data.profile) setProfile(data.profile);
      return true;
    } catch (e) {
      console.error("Failed to parse JSON backup:", e);
      return false;
    }
  };

  const closeProfileModal = () => setIsProfileModalOpen(false);
  const openProfileModal = () => setIsProfileModalOpen(true);

  const resetAllData = () => {
    if (window.confirm("Are you sure you want to reset all Rankify data back to a completely clean fresh start?")) {
      localStorage.clear();
      setChapters(INITIAL_CHAPTERS.map(ch => ({ ...ch, isCompleted: false })));
      setTrackingStateMap({});
      setTodos([]);
      setFormulas(INITIAL_FORMULAS);
      setSessions([]);
      setBacklogs([]);
      setErrors([]);
      setCheckIns([]);
      setProfile({
        name: 'Jitanshu',
        targetExam: 'JEE Advanced 2027 (AIR < 500)',
        targetYear: 2027,
        examGoal: 'JEE Advanced',
        targetRank: 'AIR < 500',
        dreamCollege: 'IIT Bombay',
        dailyHourGoal: 8,
        currentStreak: 0,
        bestStreak: 0,
        streakGoalTarget: 3,
        lastActiveDate: new Date().toISOString().split('T')[0],
        isOnboarded: false
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        isDarkMode,
        toggleDarkMode,
        profile,
        updateProfile,
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal,
        chapters,
        trackingStateMap,
        toggleChapterCompletion,
        incrementChapterRevision,
        resetChapterRevision,
        toggleChapterNotes,
        toggleChapterDpp,
        toggleChapterTest,
        todos,
        addTodo,
        addMultipleTodos,
        toggleTodo,
        deleteTodo,
        clearCompletedTodos,
        applyRoutineTemplate,
        formulas,
        addFormula,
        deleteFormula,
        sessions,
        logSession,
        deleteSession,
        backlogs,
        addBacklog,
        toggleBacklog,
        deleteBacklog,
        errors,
        addError,
        toggleErrorResolved,
        deleteError,
        checkIns,
        todaysCheckIn,
        submitDailyCheckIn,
        deleteCheckIn,
        isCheckInModalOpen,
        openCheckInModal,
        closeCheckInModal,
        triggerEndOfDayCheck,
        clearPenaltyNotice,
        exportData,
        importData,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
