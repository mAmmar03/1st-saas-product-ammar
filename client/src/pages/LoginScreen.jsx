import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  LogOut,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AmmarDevLogo from '../components/AmmarDevLogo';

export default function LoginScreen({ brandProfile, onBackToLanding }) {
  const { login, isLocked, currentUser, unlockScreen, logout } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [unlockPass, setUnlockPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const brandName = brandProfile?.brandName || 'Stylish Collection';

  // Handle ESC key to return back to landing/overview
  useEffect(() => {
    if (!onBackToLanding) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onBackToLanding();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBackToLanding]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Access Denied.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await unlockScreen(unlockPass);
    if (!success) {
      setError('Incorrect password. System remains locked.');
    }
    setLoading(false);
  };

  // If System is in Quick Lock mode
  if (isLocked && currentUser) {
    return (
      <div className="min-h-screen w-screen bg-slate-50 flex items-center justify-center p-4 font-sans select-none animate-backdrop-in">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-modal max-w-md w-full p-8 space-y-6 text-slate-800 animate-modal-in">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center mx-auto shadow-subtle">
              <Lock className="w-5 h-5 text-slate-100" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Session Locked
            </h2>
            <p className="text-xs text-slate-500">
              AmmarDev Influencer CRM is temporarily locked for security.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Logged in as</span>
              <strong className="text-slate-900 block text-sm font-semibold">{currentUser.name}</strong>
              <span className="text-[11px] text-slate-500 capitalize">
                Role: {currentUser.role === 'super_admin' ? 'Super Admin' : 'Admin Staff'}
              </span>
            </div>
            <button
              onClick={logout}
              className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1 hover:underline"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Enter Password to Unlock
              </label>
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter account password..."
                value={unlockPass}
                onChange={(e) => setUnlockPass(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-sm transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-subtle active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Unlock System'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Full Enterprise Login Gate
  return (
    <div className="min-h-screen w-screen bg-slate-50/70 flex items-center justify-center p-4 font-sans select-none animate-backdrop-in relative">
      {/* 1. Top Fixed Back Navigation Button */}
      {onBackToLanding && (
        <div className="fixed top-5 left-5 z-50">
          <button
            type="button"
            onClick={onBackToLanding}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition shadow-subtle active:scale-[0.98]"
            title="Return to SaaS Introduction / Landing Page (Press Esc)"
          >
            <ArrowLeft className="w-4 h-4 text-slate-700" />
            <span>← Back to SaaS Overview</span>
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-modal max-w-md w-full p-8 md:p-10 space-y-6 text-slate-800 animate-modal-in">
        {/* Top In-Card Return Header */}
        {onBackToLanding && (
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <button
              type="button"
              onClick={onBackToLanding}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
              <span>Back to Intro Page</span>
            </button>
            <kbd className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              ESC
            </kbd>
          </div>
        )}

        {/* Top Dual Brand Header - AmmarDev Enterprise Exclusive (No Client Logo on Logout) */}
        <div className="text-center space-y-3 pb-2 border-b border-slate-100">
          <div className="flex items-center justify-center">
            <AmmarDevLogo className="w-12 h-12" animated={true} />
          </div>

          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Ammar<span className="text-slate-500 font-semibold">Dev</span> Influencer CRM
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Enterprise Security & Management Portal
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Username or Account ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. superadmin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter account password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-xs transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Strict Session Security
            </span>
            <span className="text-[11px] text-slate-400">
              Super Admin & Staff Gate
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-subtle active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            <ArrowRight className="w-4 h-4" />
          </button>

          {onBackToLanding && (
            <button
              type="button"
              onClick={onBackToLanding}
              className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-800 transition flex items-center justify-center gap-1.5 rounded-lg hover:bg-slate-50 border border-slate-200/80 mt-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Product Overview</span>
            </button>
          )}
        </form>

        {/* Authentic Enterprise Security Notice (No Toy Buttons) */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-center text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Secured with Bcrypt Encryption & RBAC Enterprise Protection</span>
        </div>
      </div>
    </div>
  );
}
