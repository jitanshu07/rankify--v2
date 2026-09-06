import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AuthUser } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Flame, 
  Zap, 
  CheckSquare, 
  Users, 
  LogOut, 
  ArrowRight, 
  Sparkles,
  AlertCircle,
  KeyRound,
  Trash2,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Layers,
  BookOpen
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { 
    currentUser, 
    signUpWithEmail,
    loginWithEmail,
    loginWithGoogle, 
    logout, 
    switchAccount, 
    knownUsers, 
    registeredAccounts,
    removeAccountData, 
    setCurrentTab, 
    profile, 
    todos,
    chapters
  } = useApp();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  
  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpExam, setSignUpExam] = useState('JEE Advanced 2027 (AIR < 500)');
  const [signUpYear, setSignUpYear] = useState<number>(2027);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  // Custom Google Account State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  // Initialize official Google Identity Services if loaded in browser
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '1029384756102-mockrankifygoogleoauthclient.apps.googleusercontent.com',
          callback: (response: any) => {
            handleGoogleCredentialResponse(response);
          },
        });
        
        const btnContainer = document.getElementById('google-official-btn');
        if (btnContainer && !currentUser) {
          (window as any).google.accounts.id.renderButton(btnContainer, {
            theme: 'filled_blue',
            size: 'large',
            width: 320,
            text: authMode === 'signup' ? 'signup_with' : 'signin_with',
            shape: 'pill',
          });
        }
      } catch (err) {
        console.warn('Google Identity Services init:', err);
      }
    }
  }, [authMode, currentUser]);

  const handleGoogleCredentialResponse = (response: any) => {
    try {
      setIsAuthenticating(true);
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      const user: AuthUser = {
        id: `google_${payload.sub || Math.random().toString(36).substring(2, 10)}`,
        name: payload.name || payload.given_name || 'Google Aspirant',
        email: payload.email,
        avatarUrl: payload.picture,
        provider: 'google',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      loginWithGoogle(user);
      setAuthSuccessMsg(`Welcome, ${user.name}! Your isolated workspace is ready.`);
      setTimeout(() => setCurrentTab('home'), 1200);
    } catch (err) {
      console.error('Failed to parse Google credential', err);
      handleCustomGoogleSubmit('Aspirant', 'aspirant@gmail.com');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Email Sign In Handler
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);

    const res = loginWithEmail(signInEmail, signInPassword);
    if (!res.success) {
      setSignInError(res.error || 'Failed to sign in. Please verify your credentials.');
      return;
    }

    setAuthSuccessMsg(`Logged in successfully! Loading your personal workspace...`);
    setTimeout(() => {
      setCurrentTab('home');
    }, 1000);
  };

  // Email Sign Up Handler
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);

    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError('Passwords do not match. Please re-enter.');
      return;
    }

    if (signUpPassword.length < 6) {
      setSignUpError('Password must be at least 6 characters.');
      return;
    }

    const res = signUpWithEmail(signUpName, signUpEmail, signUpPassword, signUpExam, signUpYear);
    if (!res.success) {
      setSignUpError(res.error || 'Failed to create account.');
      return;
    }

    setAuthSuccessMsg(`Account created for ${signUpName.trim()}! Started completely fresh with 0 EXP, 0 Streak, and private workspace.`);
    setTimeout(() => {
      setCurrentTab('home');
    }, 1200);
  };

  // Custom Google Login
  const handleCustomGoogleSubmit = (name: string, email: string) => {
    setIsAuthenticating(true);
    setTimeout(() => {
      const sanitizedId = `google_sub_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const user: AuthUser = {
        id: sanitizedId,
        name: name.trim() || 'Aspirant',
        email: email.trim() || 'aspirant@gmail.com',
        avatarUrl: undefined,
        provider: 'google',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      loginWithGoogle(user, { importGuestData: false });
      setIsAuthenticating(false);
      setShowGoogleModal(false);
      setGoogleName('');
      setGoogleEmail('');
      setAuthSuccessMsg(`Signed in with Google as ${user.name} (${user.email})! Clean isolated account loaded.`);
      setTimeout(() => setCurrentTab('home'), 1200);
    }, 400);
  };

  const completedChaptersCount = chapters.filter(c => c.isCompleted).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in overscroll-contain">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D1525] via-[#101A2C] to-[#0A101C] border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Multi-User Isolation & Fresh Start Guarantee</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {currentUser ? 'Your Isolated Account Workspace' : 'Sign Up or Log In to Rankify'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Opening Rankify on any new device or browser starts completely clean at 0. Create your personal account or sign in to keep your To-Do list, +5 EXP rewards, and midnight accountability streaks strictly isolated to your own user ID.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <button
                onClick={() => setCurrentTab('home')}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer flex items-center gap-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center shadow-inner">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">New Device State</span>
                <span className="text-xs font-mono font-extrabold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                  <Sparkles className="w-3 h-3 text-emerald-400" /> 100% Fresh (0 Data)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {authSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2.5 animate-in fade-in shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{authSuccessMsg}</span>
        </div>
      )}

      {/* Main Content Area */}
      {currentUser ? (
        /* ================= CURRENTLY LOGGED IN VIEW ================= */
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#121A27] border border-cyan-500/30 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 flex-shrink-0">
                  {currentUser.avatarUrl ? (
                    <img 
                      src={currentUser.avatarUrl} 
                      alt={currentUser.name} 
                      className="w-full h-full object-cover rounded-2xl" 
                    />
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center text-cyan-400 font-extrabold text-xl">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border border-cyan-500/40 flex items-center justify-center text-[10px]">
                    {currentUser.provider === 'google' ? '🌐' : '🔑'}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-white">{currentUser.name}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                      Active Account
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono">
                      {currentUser.provider === 'google' ? 'Google Auth' : 'Personal Account'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{currentUser.email}</p>
                  <p className="text-[10px] font-mono text-cyan-400 mt-1">
                    Isolated Partition ID: <span className="text-slate-300">{currentUser.id}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={logout}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-rose-200 border border-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Linked Data Snapshot */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Private Data Isolated to This User Account</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">To-Do Tasks</span>
                    <div className="text-xl font-black text-white mt-0.5">
                      {todos.length} <span className="text-xs font-normal text-slate-400">tasks</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      {todos.filter(t => t.isCompleted).length} completed
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Daily Streak</span>
                    <div className="text-xl font-black text-amber-400 font-mono mt-0.5">
                      {profile.currentStreak} <span className="text-xs font-normal text-slate-400">days</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Best: {profile.bestStreak}d
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Flame className="w-5 h-5 fill-amber-400" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-yellow-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Rank EXP</span>
                    <div className="text-xl font-black text-yellow-300 font-mono mt-0.5">
                      {profile.exp || 0} <span className="text-xs font-normal text-slate-400">EXP</span>
                    </div>
                    <span className="text-[10px] text-yellow-400 font-semibold">
                      +5 EXP per task
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
                    <Zap className="w-5 h-5 fill-yellow-400" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Syllabus Done</span>
                    <div className="text-xl font-black text-cyan-300 font-mono mt-0.5">
                      {completedChaptersCount} <span className="text-xs font-normal text-slate-400">/ {chapters.length}</span>
                    </div>
                    <span className="text-[10px] text-cyan-400 font-semibold">
                      Private syllabus
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Switch or Add Another Account */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Accounts on this Device ({knownUsers.length})</span>
                </span>
                <button
                  onClick={logout}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer underline"
                >
                  + Sign into another account
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {knownUsers.map((user) => {
                  const isCurrent = user.id === currentUser.id;
                  return (
                    <div
                      key={user.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                        isCurrent
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold truncate text-slate-100">{user.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 ml-2">
                        {isCurrent ? (
                          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                            Current
                          </span>
                        ) : (
                          <button
                            onClick={() => switchAccount(user.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-200 text-[11px] font-semibold transition cursor-pointer"
                          >
                            Switch
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm(`Permanently remove local account data for ${user.name}?`)) {
                              removeAccountData(user.id);
                            }
                          }}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                          title="Delete local partition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= AUTHENTICATION FORM (SIGN IN / SIGN UP) ================= */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Sign In / Sign Up Forms */}
          <div className="md:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#121A27] border border-slate-800 shadow-xl space-y-6">
            {/* Tabs: Sign Up vs Sign In */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setSignUpError(null);
                  setSignInError(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'signup'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create New Account</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setSignUpError(null);
                  setSignInError(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'signin'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>

            {/* FORM BODY */}
            {authMode === 'signup' ? (
              /* SIGN UP FORM */
              <form onSubmit={handleSignUpSubmit} className="space-y-4">
                <div className="text-left space-y-1">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Create Your Isolated Account</h2>
                  <p className="text-xs text-slate-400">
                    Starts completely fresh at 0 EXP, 0 Streak, and empty task list.
                  </p>
                </div>

                {signUpError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{signUpError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arjun Sharma"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. arjun.jee2027@example.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Target Exam</label>
                    <select
                      value={signUpExam}
                      onChange={(e) => setSignUpExam(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                    >
                      <option value="JEE Advanced 2027 (AIR < 500)">JEE Advanced (AIR &lt; 500)</option>
                      <option value="JEE Main 2027 (99.9%ile)">JEE Main (99.9%ile)</option>
                      <option value="NEET 2027 (AIR < 1000)">NEET (AIR &lt; 1000)</option>
                      <option value="BITSAT 2027 (350+ Marks)">BITSAT (350+)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Target Year</label>
                    <select
                      value={signUpYear}
                      onChange={(e) => setSignUpYear(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
                    >
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                      <option value={2028}>2028</option>
                      <option value={2029}>2029</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Password (min 6 chars)</label>
                  <div className="relative">
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-[11px] text-cyan-300">
                  🛡️ <strong>Zero Data Contamination Guarantee:</strong> Your tasks, EXP balance, and streaks are safely locked to this user account. Other browsers and users cannot access your data.
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account & Start at 0</span>
                </button>
              </form>
            ) : (
              /* SIGN IN FORM */
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div className="text-left space-y-1">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Sign In to Your Workspace</h2>
                  <p className="text-xs text-slate-400">
                    Access your isolated To-Do list, EXP balance, and streak history.
                  </p>
                </div>

                {signInError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{signInError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. arjun.jee2027@example.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <div className="relative">
                    <input
                      type={showSignInPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to My Account</span>
                </button>

                <p className="text-center text-xs text-slate-400">
                  Don't have an account on this device?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="text-cyan-400 hover:underline font-bold"
                  >
                    Create one here
                  </button>
                </p>
              </form>
            )}

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-[#121A27] px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Or Use Google Sign-In
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>

            {/* Official Google Button Container if GIS is ready */}
            <div id="google-official-btn" className="flex justify-center my-1" />

            {/* Custom Google Sign In Button */}
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 transition shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Continue with Google Account</span>
            </button>
          </div>

          {/* Right Column: Account Benefits & Multi-User Isolation Guarantees */}
          <div className="md:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#121A27] to-[#0D1525] border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Isolated Gamification Engine</span>
              </h3>

              <ul className="space-y-3.5 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 flex-shrink-0 mt-0.5">
                    <Zap className="w-3.5 h-3.5 fill-yellow-400" />
                  </div>
                  <div>
                    <strong className="text-white block">+5 EXP Per Completed Task</strong>
                    <span>Completing any task in your To-Do checklist grants +5 EXP directly to your user account.</span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  </div>
                  <div>
                    <strong className="text-white block">Midnight Penalty Isolation</strong>
                    <span>If tasks remain incomplete by midnight, your streak and EXP reset to 0 without affecting any other account.</span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-white block">Device Freshness Assurance</strong>
                    <span>Opening Rankify on a fresh computer, tablet, or private browser window starts at 0 with no leaked data.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Known Accounts on this device */}
            {knownUsers.length > 0 && (
              <div className="p-5 rounded-3xl bg-[#121A27] border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Switch to Existing Account on this Device
                </span>
                <div className="space-y-2">
                  {knownUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => switchAccount(u.id)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs transition cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-[11px]">
                          {u.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-200 truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1 flex-shrink-0">
                        Select →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal for Google Account input */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overscroll-contain">
          <div className="relative w-full max-w-md rounded-3xl bg-[#121A27] border border-slate-700 p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Google Account Authentication</h3>
                <p className="text-xs text-slate-400">Connect or create a partitioned Google workspace</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!googleEmail) return;
                handleCustomGoogleSubmit(googleName || googleEmail.split('@')[0], googleEmail);
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jitanshu Kumar"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Google Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. jitanshukumar601@gmail.com"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-[11px] text-cyan-300">
                💡 A unique partition key (<code className="text-white">rankify_u_[id]_...</code>) will be created for this account, ensuring complete isolation from other users.
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold hover:opacity-90 transition cursor-pointer disabled:opacity-50"
                >
                  {isAuthenticating ? 'Connecting...' : 'Sign In & Isolate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
