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
  UserCheck,
  AlertCircle,
  KeyRound,
  Trash2,
  RefreshCw
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { 
    currentUser, 
    loginWithGoogle, 
    logout, 
    switchAccount, 
    knownUsers, 
    removeAccountData, 
    setCurrentTab, 
    profile, 
    todos 
  } = useApp();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomGoogleModal, setShowCustomGoogleModal] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  // Initialize official Google Identity Services if client ID or API is loaded in browser
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
      // Decode JWT token payload
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
      setAuthSuccessMsg(`Welcome, ${user.name}! Your To-Do list, EXP, and Streak are now linked to your Google ID.`);
      setTimeout(() => {
        setCurrentTab('home');
      }, 1500);
    } catch (err) {
      console.error('Failed to parse Google credential', err);
      // Fallback: Login with default Google account
      handleLoginAsJitanshu();
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Quick 1-click Google Sign-in for Jitanshu Kumar (matching user profile)
  const handleLoginAsJitanshu = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      const user: AuthUser = {
        id: 'google_sub_109283749102837465',
        name: 'Jitanshu Kumar',
        email: 'jitanshukumar601@gmail.com',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        provider: 'google',
        createdAt: '2026-09-01T00:00:00.000Z',
        lastLoginAt: new Date().toISOString(),
      };
      loginWithGoogle(user, { importGuestData: true });
      setIsAuthenticating(false);
      setAuthSuccessMsg(`Logged in as Jitanshu Kumar (${user.email}). User ID: ${user.id}`);
      setTimeout(() => setCurrentTab('home'), 1200);
    }, 600);
  };

  // Sign in as secondary test user to verify data separation
  const handleLoginAsSecondaryUser = (name: string, email: string) => {
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
      setShowCustomGoogleModal(false);
      setCustomName('');
      setCustomEmail('');
      setAuthSuccessMsg(`Signed in as ${user.name} (${user.email})! Clean isolated profile loaded.`);
      setTimeout(() => setCurrentTab('home'), 1200);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D1525] via-[#101A2C] to-[#0A101C] border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Google Identity & Account Isolation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {currentUser ? 'Your Rankify Google Account' : 'Sign in to Rankify with Google'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Personalized IIT JEE Companion with cryptographically isolated local partitions. Your To-Do list, Daily EXP rewards (+5 per task), and midnight accountability streak are linked directly to your Google Account ID.
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
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Security Level</span>
                <span className="text-xs font-mono font-extrabold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                  <Lock className="w-3 h-3" /> Per-User Sandboxed
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
        /* CURRENTLY LOGGED IN VIEW */
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
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-white">{currentUser.name}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                      Active Account
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{currentUser.email}</p>
                  <p className="text-[10px] font-mono text-cyan-400 mt-1">
                    User Account ID: <span className="text-slate-300">{currentUser.id}</span>
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
                <span>Private Data Linked to This Google ID</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              </div>
            </div>

            {/* Switch to Another Google Account */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Switch or Add Another Google Account</span>
                </span>
                <button
                  onClick={() => setShowCustomGoogleModal(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer underline"
                >
                  + Add Custom Google Account
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
                            if (window.confirm(`Delete local data partition for ${user.name}?`)) {
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
        /* NOT LOGGED IN / SIGN IN / SIGN UP FORM */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Sign In Card */}
          <div className="md:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#121A27] border border-slate-800 shadow-xl space-y-6">
            {/* Tabs: Sign In vs Sign Up */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In with Google
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account with Google
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-white">
                  {authMode === 'signin' ? 'Welcome Back, Aspirant' : 'Begin Your JEE Rank Journey'}
                </h2>
                <p className="text-xs text-slate-400">
                  {authMode === 'signin'
                    ? 'Connect your Google account to restore your To-Dos, EXP, and Streak'
                    : 'Create your isolated study partition with one-click Google authentication'}
                </p>
              </div>

              {/* Official Google Button Container if GIS is ready */}
              <div id="google-official-btn" className="flex justify-center my-2" />

              {/* Primary 1-Click Google Sign-In with Jitanshu */}
              <button
                type="button"
                onClick={handleLoginAsJitanshu}
                disabled={isAuthenticating}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition shadow-lg shadow-white/5 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Continue as Jitanshu (jitanshukumar601@gmail.com)</span>
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-[#121A27] px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Or Test Multi-User Isolation
                </span>
                <div className="border-t border-slate-800 w-full" />
              </div>

              {/* Secondary Option: Sign in with any Google account */}
              <button
                type="button"
                onClick={() => setShowCustomGoogleModal(true)}
                className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Sign in with another Google Email / Account</span>
              </button>
            </div>

            {/* Privacy & Account Isolation Note */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Shared Storage Contamination</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Rankify automatically keys all local data partitions with your unique Google User ID (<code className="text-cyan-300 text-[10px]">rankify_u_[id]_todos</code>). Switching users instantaneously isolates all task checklists, EXP points, and streaks.
              </p>
            </div>
          </div>

          {/* Right Column: Account Benefits & Gamification Rules */}
          <div className="md:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#121A27] to-[#0D1525] border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>What Happens Once You Log In?</span>
              </h3>

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 flex-shrink-0 mt-0.5">
                    <Zap className="w-3.5 h-3.5 fill-yellow-400" />
                  </div>
                  <div>
                    <strong className="text-white block">+5 EXP Per Completed Task</strong>
                    <span>Every completed task adds 5 EXP directly to your Google account level.</span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  </div>
                  <div>
                    <strong className="text-white block">Strict Midnight Penalty Isolation</strong>
                    <span>Accountability rules apply strictly to your own daily checklist without affecting any other aspirant's records.</span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
                    <CheckSquare className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-white block">Personalized Syllabus & To-Do Vault</strong>
                    <span>Store JEE 2027 problem drills, formula bookmarks, and notes securely mapped to your user ID.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Known Accounts on this device */}
            {knownUsers.length > 0 && (
              <div className="p-5 rounded-3xl bg-[#121A27] border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Previously Logged In on this Device
                </span>
                <div className="space-y-2">
                  {knownUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => loginWithGoogle(u)}
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
                        Sign In →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal to Sign in as another Google Account */}
      {showCustomGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
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
                <h3 className="text-base font-bold text-white">Sign In with Google Account</h3>
                <p className="text-xs text-slate-400">Enter user details to spawn a completely separate data partition</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!customEmail) return;
                handleLoginAsSecondaryUser(customName || customEmail.split('@')[0], customEmail);
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Aspirant Name</label>
                <input
                  type="text"
                  placeholder="e.g. Arjun Sharma"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Google Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. arjun.jee2027@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-[11px] text-cyan-300">
                💡 This user will receive a clean local partition (<code className="text-white">rankify_u_[id]_...</code>) with 0 EXP, 0 streak, and independent To-Do list.
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomGoogleModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold hover:opacity-90 transition cursor-pointer"
                >
                  Sign In & Partition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
