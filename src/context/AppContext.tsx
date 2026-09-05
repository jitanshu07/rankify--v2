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
  DailyCheckIn,
  AuthUser
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
  
  // Google Authentication & Data Separation
  currentUser: AuthUser | null;
  loginWithGoogle: (user: AuthUser, options?: { importGuestData?: boolean }) => void;
  logout: () => void;
  switchAccount: (userId: string) => void;
  removeAccountData: (userId: string) => void;
  knownUsers: AuthUser[];

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

const AUTH_KEYS = {
  SESSION: 'rankify_auth_session',
  ACTIVE_USER_ID: 'rankify_active_user_id',
  KNOWN_USERS: 'rankify_known_users',
  THEME: 'rankify_theme_v2',
  CHAPTERS: 'rankify_chapters_v2',
  FORMULAS: 'rankify_formulas_v2',
};

const DEFAULT_JITANSHU_USER: AuthUser = {
  id: 'google_sub_109283749102837465',
  name: 'Jitanshu Kumar',
  email: 'jitanshukumar601@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  provider: 'google',
  createdAt: '2026-09-01T00:00:00.000Z',
  lastLoginAt: new Date().toISOString(),
};

const getScopedKey = (userId: string | null | undefined, feature: string) => {
  if (userId) {
    return `rankify_u_${userId}_${feature}`;
  }
  return `rankify_guest_${feature}`;
};

const createDefaultProfile = (name: string): UserProfile => ({
  name: name || 'Jitanshu',
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
  lastPenaltyReason: '',
});

const loadUserScopedData = (userId: string | null, userName?: string) => {
  // Profile
  const profileKey = getScopedKey(userId, 'profile');
  const savedProfile = localStorage.getItem(profileKey);
  let loadedProfile: UserProfile;
  if (savedProfile) {
    try {
      loadedProfile = JSON.parse(savedProfile);
    } catch {
      loadedProfile = createDefaultProfile(userName || 'Aspirant');
    }
  } else {
    const legacy = localStorage.getItem('rankify_profile_v2');
    if (legacy && (userId === DEFAULT_JITANSHU_USER.id || userName?.toLowerCase().includes('jitanshu'))) {
      try {
        loadedProfile = JSON.parse(legacy);
      } catch {
        loadedProfile = createDefaultProfile(userName || 'Jitanshu');
      }
    } else {
      loadedProfile = createDefaultProfile(userName || (userId ? 'Google Aspirant' : 'Aspirant'));
    }
    localStorage.setItem(profileKey, JSON.stringify(loadedProfile));
  }

  // Todos
  const todosKey = getScopedKey(userId, 'todos');
  const savedTodos = localStorage.getItem(todosKey);
  let loadedTodos: TodoItem[];
  if (savedTodos) {
    try {
      loadedTodos = JSON.parse(savedTodos);
    } catch {
      loadedTodos = [];
    }
  } else {
    const legacyTodos = localStorage.getItem('rankify_todos_v2');
    if (legacyTodos && (userId === DEFAULT_JITANSHU_USER.id || userName?.toLowerCase().includes('jitanshu'))) {
      try {
        loadedTodos = JSON.parse(legacyTodos);
      } catch {
        loadedTodos = [];
      }
    } else {
      loadedTodos = [];
    }
    localStorage.setItem(todosKey, JSON.stringify(loadedTodos));
  }

  // Check-ins
  const checkinsKey = getScopedKey(userId, 'checkins');
  const savedCheckins = localStorage.getItem(checkinsKey);
  let loadedCheckins: DailyCheckIn[];
  if (savedCheckins) {
    try {
      loadedCheckins = JSON.parse(savedCheckins);
    } catch {
      loadedCheckins = [];
    }
  } else {
    const legacyCheckins = localStorage.getItem('rankify_checkins_v2');
    if (legacyCheckins && (userId === DEFAULT_JITANSHU_USER.id || userName?.toLowerCase().includes('jitanshu'))) {
      try {
        loadedCheckins = JSON.parse(legacyCheckins);
      } catch {
        loadedCheckins = [];
      }
    } else {
      loadedCheckins = [];
    }
    localStorage.setItem(checkinsKey, JSON.stringify(loadedCheckins));
  }

  // Sessions
  const sessionsKey = getScopedKey(userId, 'sessions');
  const savedSessions = localStorage.getItem(sessionsKey);
  let loadedSessions: StudySession[] = [];
  if (savedSessions) {
    try {
      loadedSessions = JSON.parse(savedSessions);
    } catch {
      loadedSessions = [];
    }
  }

  // Tracking
  const trackingKey = getScopedKey(userId, 'tracking');
  const savedTracking = localStorage.getItem(trackingKey);
  let loadedTracking: Record<number, ChapterTrackingState> = {};
  if (savedTracking) {
    try {
      loadedTracking = JSON.parse(savedTracking);
    } catch {
      loadedTracking = {};
    }
  }

  // Backlogs
  const backlogsKey = getScopedKey(userId, 'backlogs');
  const savedBacklogs = localStorage.getItem(backlogsKey);
  let loadedBacklogs: BacklogItem[] = [];
  if (savedBacklogs) {
    try {
      loadedBacklogs = JSON.parse(savedBacklogs);
    } catch {
      loadedBacklogs = [];
    }
  }

  // Errors
  const errorsKey = getScopedKey(userId, 'errors');
  const savedErrors = localStorage.getItem(errorsKey);
  let loadedErrors: ErrorLog[] = [];
  if (savedErrors) {
    try {
      loadedErrors = JSON.parse(savedErrors);
    } catch {
      loadedErrors = [];
    }
  }

  return {
    profile: loadedProfile,
    todos: loadedTodos,
    checkIns: loadedCheckins,
    sessions: loadedSessions,
    tracking: loadedTracking,
    backlogs: loadedBacklogs,
    errors: loadedErrors,
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(AUTH_KEYS.THEME);
    return saved !== null ? saved === 'true' : true;
  });

  // Known Google accounts on this device
  const [knownUsers, setKnownUsers] = useState<AuthUser[]>(() => {
    const saved = localStorage.getItem(AUTH_KEYS.KNOWN_USERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [DEFAULT_JITANSHU_USER];
  });

  // Current logged in user (defaults to Jitanshu Kumar)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(AUTH_KEYS.SESSION);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEFAULT_JITANSHU_USER;
  });

  // Initial scoped load for active user
  const initialData = loadUserScopedData(currentUser?.id || null, currentUser?.name);

  const [profile, setProfile] = useState<UserProfile>(initialData.profile);
  const [todos, setTodos] = useState<TodoItem[]>(initialData.todos);
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>(initialData.checkIns);
  const [sessions, setSessions] = useState<StudySession[]>(initialData.sessions);
  const [trackingStateMap, setTrackingStateMap] = useState<Record<number, ChapterTrackingState>>(initialData.tracking);
  const [backlogs, setBacklogs] = useState<BacklogItem[]>(initialData.backlogs);
  const [errors, setErrors] = useState<ErrorLog[]>(initialData.errors);

  const [chapters, setChapters] = useState<Chapter[]>(() => {
    const saved = localStorage.getItem(AUTH_KEYS.CHAPTERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_CHAPTERS;
  });

  const [formulas, setFormulas] = useState<Formula[]>(() => {
    const saved = localStorage.getItem(AUTH_KEYS.FORMULAS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_FORMULAS;
  });

  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);

  // Persist Theme
  useEffect(() => {
    localStorage.setItem(AUTH_KEYS.THEME, String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Persist Active User Session
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(currentUser));
      localStorage.setItem(AUTH_KEYS.ACTIVE_USER_ID, currentUser.id);
    } else {
      localStorage.removeItem(AUTH_KEYS.SESSION);
      localStorage.removeItem(AUTH_KEYS.ACTIVE_USER_ID);
    }
  }, [currentUser]);

  // Persist Known Users
  useEffect(() => {
    localStorage.setItem(AUTH_KEYS.KNOWN_USERS, JSON.stringify(knownUsers));
  }, [knownUsers]);

  // Persist Per-User Scoped Data
  useEffect(() => {
    const key = getScopedKey(currentUser?.id, 'profile');
    localStorage.setItem(key, JSON.stringify(profile));
  }, [profile, currentUser]);

  useEffect(() => {
    const key = getScopedKey(currentUser?.id, 'todos');
    localStorage.setItem(key, JSON.stringify(todos));
  }, [todos, currentUser]);

  useEffect(() => {
    const key = getScopedKey(currentUser?.id, 'checkins');
    localStorage.setItem(key, JSON.stringify(checkIns));
  }, [checkIns, currentUser]);

  useEffect(() => {
    const key = getScopedKey(currentUser?.id, 'sessions');
    localStorage.setItem(key, JSON.stringify(sessions));
  }, [sessions, currentUser]);

  useEffect(() => {
    const key = getScopedKey(currentUser?.id, 'tracking');
    localStorage.setItem(key, JSON.stringify(trackingStateMap));
  }, [trackingStateMap, currentUser]);

  useEffect(() => {
    const key = getScopedKey(currentUser?.id, 'backlogs');
    localStorage.setItem(key, JSON.stringify(backlogs));
  }, [backlogs, currentUser]);

  useEffect(() => {
    const key = getScopedKey(currentUser?.id, 'errors');
    localStorage.setItem(key, JSON.stringify(errors));
  }, [errors, currentUser]);

  useEffect(() => {
    localStorage.setItem(AUTH_KEYS.CHAPTERS, JSON.stringify(chapters));
  }, [chapters]);

  useEffect(() => {
    localStorage.setItem(AUTH_KEYS.FORMULAS, JSON.stringify(formulas));
  }, [formulas]);

  // Google Authentication Functions
  const loginWithGoogle = (user: AuthUser, options?: { importGuestData?: boolean }) => {
    // Save current active state before switching
    if (currentUser) {
      localStorage.setItem(getScopedKey(currentUser.id, 'profile'), JSON.stringify(profile));
      localStorage.setItem(getScopedKey(currentUser.id, 'todos'), JSON.stringify(todos));
      localStorage.setItem(getScopedKey(currentUser.id, 'checkins'), JSON.stringify(checkIns));
      localStorage.setItem(getScopedKey(currentUser.id, 'sessions'), JSON.stringify(sessions));
      localStorage.setItem(getScopedKey(currentUser.id, 'tracking'), JSON.stringify(trackingStateMap));
      localStorage.setItem(getScopedKey(currentUser.id, 'backlogs'), JSON.stringify(backlogs));
      localStorage.setItem(getScopedKey(currentUser.id, 'errors'), JSON.stringify(errors));
    } else if (options?.importGuestData) {
      localStorage.setItem(getScopedKey(user.id, 'profile'), JSON.stringify(profile));
      localStorage.setItem(getScopedKey(user.id, 'todos'), JSON.stringify(todos));
      localStorage.setItem(getScopedKey(user.id, 'checkins'), JSON.stringify(checkIns));
      localStorage.setItem(getScopedKey(user.id, 'sessions'), JSON.stringify(sessions));
      localStorage.setItem(getScopedKey(user.id, 'tracking'), JSON.stringify(trackingStateMap));
    }

    setKnownUsers((prev) => {
      const filtered = prev.filter((u) => u.id !== user.id);
      return [user, ...filtered];
    });

    const data = loadUserScopedData(user.id, user.name);
    setProfile(data.profile);
    setTodos(data.todos);
    setCheckIns(data.checkIns);
    setSessions(data.sessions);
    setTrackingStateMap(data.tracking);
    setBacklogs(data.backlogs);
    setErrors(data.errors);

    setCurrentUser(user);
    localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(user));
    localStorage.setItem(AUTH_KEYS.ACTIVE_USER_ID, user.id);
  };

  const logout = () => {
    if (currentUser) {
      localStorage.setItem(getScopedKey(currentUser.id, 'profile'), JSON.stringify(profile));
      localStorage.setItem(getScopedKey(currentUser.id, 'todos'), JSON.stringify(todos));
      localStorage.setItem(getScopedKey(currentUser.id, 'checkins'), JSON.stringify(checkIns));
      localStorage.setItem(getScopedKey(currentUser.id, 'sessions'), JSON.stringify(sessions));
      localStorage.setItem(getScopedKey(currentUser.id, 'tracking'), JSON.stringify(trackingStateMap));
      localStorage.setItem(getScopedKey(currentUser.id, 'backlogs'), JSON.stringify(backlogs));
      localStorage.setItem(getScopedKey(currentUser.id, 'errors'), JSON.stringify(errors));
    }

    setCurrentUser(null);
    localStorage.removeItem(AUTH_KEYS.SESSION);
    localStorage.removeItem(AUTH_KEYS.ACTIVE_USER_ID);

    const guestData = loadUserScopedData(null, 'Guest Aspirant');
    setProfile(guestData.profile);
    setTodos(guestData.todos);
    setCheckIns(guestData.checkIns);
    setSessions(guestData.sessions);
    setTrackingStateMap(guestData.tracking);
    setBacklogs(guestData.backlogs);
    setErrors(guestData.errors);
    setCurrentTab('login');
  };

  const switchAccount = (userId: string) => {
    const target = knownUsers.find((u) => u.id === userId);
    if (target) {
      loginWithGoogle(target);
    }
  };

  const removeAccountData = (userId: string) => {
    ['profile', 'todos', 'checkins', 'sessions', 'tracking', 'backlogs', 'errors'].forEach((f) => {
      localStorage.removeItem(getScopedKey(userId, f));
    });
    setKnownUsers((prev) => prev.filter((u) => u.id !== userId));
    if (currentUser?.id === userId) {
      logout();
    }
  };

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
    if (window.confirm("Are you sure you want to reset your Rankify study data back to a clean start?")) {
      if (currentUser) {
        ['profile', 'todos', 'checkins', 'sessions', 'tracking', 'backlogs', 'errors'].forEach(f => {
          localStorage.removeItem(getScopedKey(currentUser.id, f));
        });
      }
      setTrackingStateMap({});
      setTodos([]);
      setSessions([]);
      setBacklogs([]);
      setErrors([]);
      setCheckIns([]);
      setProfile(createDefaultProfile(currentUser?.name || 'Jitanshu'));
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        isDarkMode,
        toggleDarkMode,
        currentUser,
        loginWithGoogle,
        logout,
        switchAccount,
        removeAccountData,
        knownUsers,
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
