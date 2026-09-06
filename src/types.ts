export type SubjectType = 'Physics' | 'Chemistry' | 'Mathematics' | 'General';

export type PriorityType = 'High' | 'Medium' | 'Low';

export interface ChapterTrackingState {
  revisionCount: number;
  notesDone: boolean;
  dppDone: boolean;
  testDone: boolean;
}

export interface Chapter {
  id: number;
  subject: 'Physics' | 'Chemistry' | 'Mathematics';
  classGrade: 'Class 11' | 'Class 12';
  name: string;
  weightage: 'High' | 'Medium' | 'Core';
  isCompleted: boolean;
}

export interface Formula {
  id: string;
  title: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics';
  chapter: string;
  formulaText: string;
  keyTerms?: string;
  applicationTip?: string;
  textColorHex?: string;
}

export interface TodoItem {
  id: string;
  title: string;
  subject: string;
  priority: PriorityType;
  isCompleted: boolean;
  dateCreated: string;
}

export interface StudySession {
  id: string;
  durationSeconds: number;
  timestamp: number;
  category: string;
  subject: string;
  notes: string;
}

export interface ErrorLog {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  mistakeType: 'Conceptual' | 'Calculation' | 'Misread Question' | 'Formula Forgotten' | 'Time Pressure';
  questionNotes: string;
  solutionNotes: string;
  isResolved: boolean;
  dateAdded: string;
}

export interface BacklogItem {
  id: string;
  title: string;
  subject: string;
  targetDate: string;
  urgency: 'Critical' | 'High' | 'Medium';
  isCompleted: boolean;
  lectureFrom?: number;
  lectureTo?: number;
  completedLectures?: number[];
}

export interface UserProfile {
  name: string;
  targetExam: string;
  targetYear: number;
  examGoal: string;
  targetRank: string;
  dreamCollege: string;
  dailyHourGoal: number;
  currentStreak: number;
  bestStreak: number;
  streakGoalTarget: number;
  lastActiveDate: string;
  isOnboarded?: boolean;
  exp: number;
  lastCheckedDate?: string;
  lastPenaltyReason?: string;
}

export interface DailyCheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  mood: string;
  readiness: 'Peak Energy' | 'Focused & Steady' | 'Tired but Determined' | 'Low / Struggling';
  targetHours: number;
  primarySubject: SubjectType | 'All Subjects';
  commitment: string;
  reflection?: string;
}

export interface RoutineTemplate {
  title: string;
  description: string;
  tasks: { title: string; subject: string; priority: PriorityType }[];
}

export interface AIMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  category?: 'question' | 'study_plan' | 'concept' | 'numerical';
  extractedTasks?: { title: string; subject: string; priority: PriorityType }[];
}

export interface AuthUser {
  id: string; // Unique User ID (e.g. usr_... or google_...)
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'local' | 'google';
  createdAt: string;
  lastLoginAt: string;
}

export interface UserAccountRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  provider: 'local' | 'google';
  createdAt: string;
  lastLoginAt: string;
  targetExam?: string;
  targetYear?: number;
}

export type NavTab = 
  | 'home'
  | 'ai-mentor'
  | 'syllabus'
  | 'tracker'
  | 'formulas'
  | 'todo'
  | 'timer'
  | 'tools'
  | 'analytics'
  | 'login';

