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
  AuthUser,
  UserAccountRecord
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
  
  // Isolated Authentication & Multi-User Partitioning
  currentUser: AuthUser | null;
  signUpWithEmail: (name: string, email: string, password: string, exam?: string, year?: number) => { success: boolean; error?: string };
  loginWithEmail: (email: string, password: string) => { success: boolean; error?: string };
  loginWithGoogle: (user: AuthUser, options?: { importGuestData?: boolean }) => void;
  logout: () => void;
  switchAccount: (userId: string) => void;
  removeAccountData: (userId: string) => void;
  knownUsers: AuthUser[];
  registeredAccounts: UserAccountRecord[];

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
  addBacklog: (title: string, subject: string, targetDate: string, urgency: 'Critical' | 'High' | 'Medium', lectureFrom?: number, lectureTo?: number) => void;
  toggleBacklog: (id: string) => void;
  toggleBacklogLecture: (id: string, lectureNum: number) => void;
  deleteBacklog: (id: string) => void;
  editBacklog: (id: string, updates: Partial<BacklogItem>) => void;
  
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
  SESSION: 'rankify_auth_session_v3',
  ACTIVE_USER_ID: 'rankify_active_user_id_v3',
  KNOWN_USERS: 'rankify_known_users_v3',
  REGISTERED_ACCOUNTS: 'rankify_registered_accounts_v3',
  THEME: 'rankify_theme_v2',
  FORMULAS: 'rankify_formulas_v2',
};

const getScopedKey = (userId: string | null | undefined, feature: string) => {
  if (userId) {
    return `rankify_u_${userId}_${feature}`;
  }
  return `rankify_guest_${feature}`;
};

const createDefaultProfile = (name?: string, targetExam?: string, targetYear?: number): UserProfile => ({
  name: name?.trim() || 'Aspirant',
  targetExam: targetExam || 'JEE Advanced 2027 (AIR < 500)',
  targetYear: targetYear || 2027,
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

const loadUserScopedData = (
  userId: string | null, 
  userName?: string, 
  targetExam?: string, 
  targetYear?: number
) => {
  // Profile (strictly starts at 0 EXP & 0 streak if new)
  const profileKey = getScopedKey(userId, 'profile');
  const savedProfile = localStorage.getItem(profileKey);
  let loadedProfile: UserProfile;
  if (savedProfile) {
    try {
      loadedProfile = JSON.parse(savedProfile);
    } catch {
      loadedProfile = createDefaultProfile(userName, targetExam, targetYear);
    }
  } else {
    loadedProfile = createDefaultProfile(userName, targetExam, targetYear);
    localStorage.setItem(profileKey, JSON.stringify(loadedProfile));
  }

  // Todos (strictly empty list for new users/guests)
  const todosKey = getScopedKey(userId, 'todos');
  const savedTodos = localStorage.getItem(todosKey);
  let loadedTodos: TodoItem[] = [];
  if (savedTodos) {
    try {
      loadedTodos = JSON.parse(savedTodos);
    } catch {
      loadedTodos = [];
    }
  } else {
    loadedTodos = [];
    localStorage.setItem(todosKey, JSON.stringify(loadedTodos));
  }

  // Check-ins
  const checkinsKey = getScopedKey(userId, 'checkins');
  const savedCheckins = localStorage.getItem(checkinsKey);
  let loadedCheckins: DailyCheckIn[] = [];
  if (savedCheckins) {
    try {
      loadedCheckins = JSON.parse(savedCheckins);
    } catch {
      loadedCheckins = [];
    }
  } else {
    loadedCheckins = [];
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

  // Chapters (syllabus completion scoped per-user so new users start at 0% / false)
  const chaptersKey = getScopedKey(userId, 'chapters');
  const savedChapters = localStorage.getItem(chaptersKey);
  let loadedChapters: Chapter[];
  if (savedChapters) {
    try {
      loadedChapters = JSON.parse(savedChapters);
    } catch {
      loadedChapters = INITIAL_CHAPTERS.map((ch) => ({ ...ch, isCompleted: false }));
    }
  } else {
    loadedChapters = INITIAL_CHAPTERS.map((ch) => ({ ...ch, isCompleted: false }));
  }

  return {
    profile: loadedProfile,
    todos: loadedTodos,
    checkIns: loadedCheckins,
    sessions: loadedSessions,
    tracking: loadedTracking,
    backlogs: loadedBacklogs,
    errors: loadedErrors,
    chapters: loadedChapters,
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(AUTH_KEYS.THEME);
    return saved !== null ? saved === 'true' : true;
  });

  // Known accounts on this device (starts empty on new device/browser)
  const [knownUsers, setKnownUsers] = useState<AuthUser[]>(() => {
    const saved = localStorage.getItem(AUTH_KEYS.KNOWN_USERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  // Registered local/email accounts on this device
  const [registeredAccounts, setRegisteredAccounts] = useState<UserAccountRecord[]>(() => {
    const saved = localStorage.getItem(AUTH_KEYS.REGISTERED_ACCOUNTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  // Current logged in user (null by default on a fresh device/browser -> starts fresh at 0)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(AUTH_KEYS.SESSION);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return null;
  });

  // Initial scoped load for active user (or fresh 0 state for guest)
  const initialData = loadUserScopedData(currentUser?.id || null, currentUser?.name);

  const [profile, setProfile] = useState<UserProfile>(initialData.profile);
  const [todos, setTodos] = useState<TodoItem[]>(initialData.todos);
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>(initialData.checkIns);
  const [sessions, setSessions] = useState<StudySession[]>(initialData.sessions);
  const [trackingStateMap, setTrackingStateMap] = useState<Record<number, ChapterTrackingState>>(initialData.tracking);
  const [backlogs, setBacklogs] = useState<BacklogItem[]>(initialData.backlogs);
  const [errors, setErrors] = useState<ErrorLog[]>(initialData.errors);
  const [chapters, setChapters] = useState<Chapter[]>(initialData.chapters);

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

  // Persist Known Users & Registered Accounts
  useEffect(() => {
    localStorage.setItem(AUTH_KEYS.KNOWN_USERS, JSON.stringify(knownUsers));
  }, [knownUsers]);

  useEffect(() => {
    localStorage.setItem(AUTH_KEYS.REGISTERED_ACCOUNTS, JSON.stringify(registeredAccounts));
  }, [registeredAccounts]);

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
    const key = getScopedKey(currentUser?.id, 'chapters');
    localStorage.setItem(key, JSON.stringify(chapters));
  }, [chapters, currentUser]);

  useEffect(() => {
    localStorage.setItem(AUTH_KEYS.FORMULAS, JSON.stringify(formulas));
  }, [formulas]);

  // Helper to flush current in-memory partition to localStorage before switching accounts
  const flushCurrentUserData = () => {
    const targetId = currentUser?.id || null;
    localStorage.setItem(getScopedKey(targetId, 'profile'), JSON.stringify(profile));
    localStorage.setItem(getScopedKey(targetId, 'todos'), JSON.stringify(todos));
    localStorage.setItem(getScopedKey(targetId, 'checkins'), JSON.stringify(checkIns));
    localStorage.setItem(getScopedKey(targetId, 'sessions'), JSON.stringify(sessions));
    localStorage.setItem(getScopedKey(targetId, 'tracking'), JSON.stringify(trackingStateMap));
    localStorage.setItem(getScopedKey(targetId, 'backlogs'), JSON.stringify(backlogs));
    localStorage.setItem(getScopedKey(targetId, 'errors'), JSON.stringify(errors));
    localStorage.setItem(getScopedKey(targetId, 'chapters'), JSON.stringify(chapters));
  };

  // Sign Up with Email / Password (starts completely fresh at 0)
  const signUpWithEmail = (
    name: string,
    email: string,
    password: string,
    exam?: string,
    year?: number
  ): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanName || !password) {
      return { success: false, error: 'Name, email, and password are all required.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const existing = registeredAccounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const passwordHash = btoa(encodeURIComponent(password));

    const newAccount: UserAccountRecord = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      provider: 'local',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      targetExam: exam || 'JEE Advanced 2027 (AIR < 500)',
      targetYear: year || 2027,
    };

    flushCurrentUserData();

    // Load completely fresh clean 0 state for this new user
    const data = loadUserScopedData(userId, cleanName, newAccount.targetExam, newAccount.targetYear);
    setProfile(data.profile);
    setTodos(data.todos);
    setCheckIns(data.checkIns);
    setSessions(data.sessions);
    setTrackingStateMap(data.tracking);
    setBacklogs(data.backlogs);
    setErrors(data.errors);
    setChapters(data.chapters);

    const authUser: AuthUser = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      provider: 'local',
      createdAt: newAccount.createdAt,
      lastLoginAt: newAccount.lastLoginAt,
    };

    setRegisteredAccounts((prev) => [newAccount, ...prev.filter((a) => a.id !== userId)]);
    setKnownUsers((prev) => [authUser, ...prev.filter((u) => u.id !== userId)]);
    setCurrentUser(authUser);

    return { success: true };
  };

  // Login with Email / Password
  const loginWithEmail = (email: string, password: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { success: false, error: 'Please enter both your email and password.' };
    }

    const account = registeredAccounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (!account) {
      return { success: false, error: 'No account found with this email. Please sign up first.' };
    }

    const inputHash = btoa(encodeURIComponent(password));
    if (account.passwordHash !== inputHash) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    flushCurrentUserData();

    const updatedAccount: UserAccountRecord = {
      ...account,
      lastLoginAt: new Date().toISOString(),
    };

    const authUser: AuthUser = {
      id: account.id,
      name: account.name,
      email: account.email,
      avatarUrl: account.avatarUrl,
      provider: account.provider,
      createdAt: account.createdAt,
      lastLoginAt: updatedAccount.lastLoginAt,
    };

    const data = loadUserScopedData(account.id, account.name, account.targetExam, account.targetYear);
    setProfile(data.profile);
    setTodos(data.todos);
    setCheckIns(data.checkIns);
    setSessions(data.sessions);
    setTrackingStateMap(data.tracking);
    setBacklogs(data.backlogs);
    setErrors(data.errors);
    setChapters(data.chapters);

    setRegisteredAccounts((prev) => [updatedAccount, ...prev.filter((a) => a.id !== account.id)]);
    setKnownUsers((prev) => [authUser, ...prev.filter((u) => u.id !== account.id)]);
    setCurrentUser(authUser);

    return { success: true };
  };

  // Google Authentication Function
  const loginWithGoogle = (user: AuthUser, options?: { importGuestData?: boolean }) => {
    flushCurrentUserData();

    if (options?.importGuestData) {
      localStorage.setItem(getScopedKey(user.id, 'profile'), JSON.stringify(profile));
      localStorage.setItem(getScopedKey(user.id, 'todos'), JSON.stringify(todos));
      localStorage.setItem(getScopedKey(user.id, 'checkins'), JSON.stringify(checkIns));
      localStorage.setItem(getScopedKey(user.id, 'sessions'), JSON.stringify(sessions));
      localStorage.setItem(getScopedKey(user.id, 'tracking'), JSON.stringify(trackingStateMap));
      localStorage.setItem(getScopedKey(user.id, 'backlogs'), JSON.stringify(backlogs));
      localStorage.setItem(getScopedKey(user.id, 'errors'), JSON.stringify(errors));
      localStorage.setItem(getScopedKey(user.id, 'chapters'), JSON.stringify(chapters));
    }

    setRegisteredAccounts((prev) => {
      const existing = prev.find((a) => a.id === user.id || a.email.toLowerCase() === user.email.toLowerCase());
      if (existing) {
        return prev.map((a) =>
          a.id === existing.id
            ? { ...a, lastLoginAt: new Date().toISOString(), avatarUrl: user.avatarUrl || a.avatarUrl }
            : a
        );
      }
      const newRecord: UserAccountRecord = {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: '',
        avatarUrl: user.avatarUrl,
        provider: 'google',
        createdAt: user.createdAt,
        lastLoginAt: new Date().toISOString(),
      };
      return [newRecord, ...prev];
    });

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
    setChapters(data.chapters);

    setCurrentUser(user);
  };

  const logout = () => {
    flushCurrentUserData();

    setCurrentUser(null);
    localStorage.removeItem(AUTH_KEYS.SESSION);
    localStorage.removeItem(AUTH_KEYS.ACTIVE_USER_ID);

    // Load fresh 0-state guest partition
    const guestData = loadUserScopedData(null, 'Aspirant');
    setProfile(guestData.profile);
    setTodos(guestData.todos);
    setCheckIns(guestData.checkIns);
    setSessions(guestData.sessions);
    setTrackingStateMap(guestData.tracking);
    setBacklogs(guestData.backlogs);
    setErrors(guestData.errors);
    setChapters(guestData.chapters);
    setCurrentTab('login');
  };

  const switchAccount = (userId: string) => {
    const target = knownUsers.find((u) => u.id === userId);
    if (!target) return;

    flushCurrentUserData();

    const data = loadUserScopedData(target.id, target.name);
    setProfile(data.profile);
    setTodos(data.todos);
    setCheckIns(data.checkIns);
    setSessions(data.sessions);
    setTrackingStateMap(data.tracking);
    setBacklogs(data.backlogs);
    setErrors(data.errors);
    setChapters(data.chapters);

    setCurrentUser(target);
  };

  const removeAccountData = (userId: string) => {
    ['profile', 'todos', 'checkins', 'sessions', 'tracking', 'backlogs', 'errors', 'chapters'].forEach((f) => {
      localStorage.removeItem(getScopedKey(userId, f));
    });
    setKnownUsers((prev) => prev.filter((u) => u.id !== userId));
    setRegisteredAccounts((prev) => prev.filter((a) => a.id !== userId));
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
  const addBacklog = (title: string, subject: string, targetDate: string, urgency: 'Critical' | 'High' | 'Medium', lectureFrom?: number, lectureTo?: number) => {
    const newBacklog: BacklogItem = {
      id: 'b_' + Date.now(),
      title,
      subject,
      targetDate,
      urgency,
      isCompleted: false,
      lectureFrom,
      lectureTo,
      completedLectures: []
    };
    setBacklogs(prev => [newBacklog, ...prev]);
  };

  const toggleBacklog = (id: string) => {
    setBacklogs(prev => prev.map(b => b.id === id ? { ...b, isCompleted: !b.isCompleted } : b));
  };

  const toggleBacklogLecture = (id: string, lectureNum: number) => {
    setBacklogs(prev => {
      const target = prev.find(b => b.id === id);
      if (!target) return prev;
      
      const completed = target.completedLectures || [];
      const isCurrentlyCompleted = completed.includes(lectureNum);
      const newCompleted = isCurrentlyCompleted
        ? completed.filter(num => num !== lectureNum)
        : [...completed, lectureNum];

      // EXP logic
      setProfile(p => {
        const expDelta = isCurrentlyCompleted ? -5 : 5;
        const nextExp = Math.max(0, (p.exp || 0) + expDelta);
        return { ...p, exp: nextExp };
      });

      // Update streak if newly completed
      if (!isCurrentlyCompleted) {
        const today = new Date().toISOString().split('T')[0];
        setProfile(prevProfile => recordDailyActivity(prevProfile, today));
      }

      return prev.map(b => 
        b.id === id ? { ...b, completedLectures: newCompleted } : b
      );
    });
  };

  const deleteBacklog = (id: string) => {
    setBacklogs(prev => prev.filter(b => b.id !== id));
  };

  const editBacklog = (id: string, updates: Partial<BacklogItem>) => {
    setBacklogs(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
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
  // Runs robustly in a background interval so it triggers even if tab is minimized
  useEffect(() => {
    const checkDayChanged = () => {
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
    };

    // Run once on mount/todos change
    checkDayChanged();
    
    // Check periodically (every 1 minute) to ensure we catch midnight even if app is in background
    const interval = setInterval(checkDayChanged, 60000);

    // Check immediately when tab becomes visible after being suspended
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkDayChanged();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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
    if (window.confirm("Are you sure you want to reset your Rankify study data back to 0?")) {
      const targetId = currentUser?.id || null;
      ['profile', 'todos', 'checkins', 'sessions', 'tracking', 'backlogs', 'errors', 'chapters'].forEach((f) => {
        localStorage.removeItem(getScopedKey(targetId, f));
      });
      setTrackingStateMap({});
      setTodos([]);
      setSessions([]);
      setBacklogs([]);
      setErrors([]);
      setCheckIns([]);
      setChapters(INITIAL_CHAPTERS.map((ch) => ({ ...ch, isCompleted: false })));
      setProfile(createDefaultProfile(currentUser?.name || 'Aspirant'));
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
        signUpWithEmail,
        loginWithEmail,
        loginWithGoogle,
        logout,
        switchAccount,
        removeAccountData,
        knownUsers,
        registeredAccounts,
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
        toggleBacklogLecture,
        deleteBacklog,
        editBacklog,
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
