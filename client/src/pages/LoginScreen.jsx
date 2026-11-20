import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  LogOut,
  Building2,
  ShieldCheck,
  Mail,
  Sparkles,
  Key,
  RotateCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AmmarDevLogo from '../components/AmmarDevLogo';

export default function LoginScreen({ brandProfile, onBackToLanding, initialMode = 'login' }) {
  const {
    login,
    register,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    isLocked,
    currentUser,
    unlockScreen,
    logout,
  } = useAuth();

  // 'login' | 'signup' | 'verify' | 'forgot' | 'reset'
  const [mode, setMode] = useState(initialMode);

  // Login Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [unlockPass, setUnlockPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up Fields
  const [brandName, setBrandName] = useState(brandProfile?.brandName || '');
  const [fullName, setFullName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupPin, setSignupPin] = useState('9900');

  // Email Verification Fields
  const [verifyEmailAddress, setVerifyEmailAddress] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Forgot / Reset Password Fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetEmailAddress, setResetEmailAddress] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  // Handle resend countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Sign In
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      const data = err.response?.data;
      if (data?.requiresVerification && data?.email) {
        setVerifyEmailAddress(data.email);
        setMode('verify');
        setError(data.error || 'Please verify your email address to activate your workspace.');
      } else {
        setError(data?.error || 'Invalid credentials. Access Denied.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up / Workspace Creation
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        brandName: brandName || 'Stylish Collection',
        name: fullName,
        username: signupUsername,
        email: signupEmail,
        password: signupPassword,
        masterPin: signupPin || '9900',
      });

      if (res?.requiresVerification) {
        setVerifyEmailAddress(signupEmail);
        setMode('verify');
        setSuccess(res.message || 'Workspace created! Enter the 6-digit verification code sent to your email.');
        setResendCooldown(60);
      } else {
        setSuccess('Brand Workspace created successfully! Redirecting...');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Email Verification Code Submit
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!verifyCode || verifyCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(verifyEmailAddress, verifyCode.trim());
      setSuccess('Email verified successfully! Workspace unlocked.');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend Verification Code
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await resendVerification(verifyEmailAddress);
      setSuccess(res.message || 'A new verification code has been sent to your email.');
      setResendCooldown(60);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Request
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!forgotEmail || !forgotEmail.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(forgotEmail.trim());
      setResetEmailAddress(forgotEmail.trim());
      setMode('reset');
      setSuccess(res.message || 'A 6-digit reset code has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset Password Submit
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match. Please verify your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (!resetCode || resetCode.trim().length !== 6) {
      setError('Please enter the 6-digit reset code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(resetEmailAddress, resetCode.trim(), newPassword);
      setMode('login');
      setSuccess(res.message || 'Password reset successfully! Please sign in with your new password.');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Unlock Session
  const handleUnlock = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await unlockScreen(unlockPass);
    if (!ok) {
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
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Session Locked</h2>
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

  return (
    <div className="min-h-screen w-screen bg-slate-50/70 flex items-center justify-center p-4 sm:p-6 font-sans select-none animate-backdrop-in relative">
      {/* 1. Top Fixed Back Navigation Button (Desktop & Tablet) */}
      {onBackToLanding && (
        <div className="fixed top-4 left-4 z-50 hidden sm:block">
          <button
            type="button"
            onClick={onBackToLanding}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition shadow-subtle active:scale-[0.98]"
            title="Return to SaaS Introduction / Landing Page (Press Esc)"
          >
            <ArrowLeft className="w-4 h-4 text-slate-700" />
            <span>← Back to SaaS Overview</span>
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-modal max-w-lg w-full p-6 sm:p-8 space-y-5 text-slate-800 animate-modal-in">
        {/* Top In-Card Return Header */}
        {onBackToLanding && (
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
            <button
              type="button"
              onClick={onBackToLanding}
              className="flex items-center gap-1.5 font-bold text-slate-600 hover:text-slate-900 transition hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
              <span>Back to Intro Page</span>
            </button>
            <kbd className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              ESC
            </kbd>
          </div>
        )}

        {/* Top Dual Brand Header */}
        <div className="text-center space-y-2 pb-1">
          <div className="flex items-center justify-center">
            <AmmarDevLogo className="w-11 h-11" animated={true} />
          </div>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Ammar<span className="text-slate-500 font-semibold">Dev</span> Influencer CRM
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'signup' && 'Create New Brand Workspace & Super Admin Credentials'}
              {mode === 'login' && 'Enterprise Security & Workspace Management Portal'}
              {mode === 'verify' && 'Verify Your Email Address to Activate Workspace'}
              {mode === 'forgot' && 'Reset Workspace Account Password'}
              {mode === 'reset' && 'Set a New Account Password'}
            </p>
          </div>
        </div>

        {/* Auth Mode Switcher Tab (Only on login & signup) */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-700" />
              <span>Create Workspace</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-slate-700" />
              <span>Sign In</span>
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* ===================== 1. SIGN UP FORM ===================== */}
        {mode === 'signup' && (
          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Brand / Company Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stylish Collection"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Super Admin Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Ammar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Login Username (Unique)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. ammar or admin"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Work / Contact Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="ammar@brand.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Password (Min 6 chars)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Hide Passwords' : 'Show Passwords'}</span>
              </button>

              <span className="text-[11px] text-slate-400">Master PIN Default: 9900</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-subtle active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Brand Workspace...' : 'Launch Brand Workspace'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition underline"
              >
                Already have a brand account? Sign In here →
              </button>
            </div>
          </form>
        )}

        {/* ===================== 2. SIGN IN FORM ===================== */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. superadmin or your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your account password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition"
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

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Isolated Multi-Tenant Security
              </span>
              <span className="text-[11px] text-slate-400">Super Admin & Staff Gate</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-subtle active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition underline"
              >
                Don't have a workspace? Create brand workspace here →
              </button>
            </div>
          </form>
        )}

        {/* ===================== 3. EMAIL VERIFICATION OTP FORM ===================== */}
        {mode === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-center space-y-1">
              <span className="text-[11px] text-slate-500">Verification code sent to</span>
              <div className="font-bold text-slate-900 text-sm">{verifyEmailAddress}</div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 text-center">
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                autoFocus
                maxLength={6}
                placeholder="123456"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[8px] font-mono text-xl py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition font-bold"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || loading}
                className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 disabled:opacity-40"
              >
                <RotateCw className="w-3 h-3" />
                {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Verification Code'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                Change Email / Back
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || verifyCode.length !== 6}
              className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-subtle active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? 'Verifying Code...' : 'Verify Email & Open Workspace'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ===================== 4. FORGOT PASSWORD FORM ===================== */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
            <p className="text-slate-500 text-xs leading-relaxed">
              Enter your workspace registered email address. We will send you a 6-digit verification code to reset your password.
            </p>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Registered Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="ammar@brand.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-subtle active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? 'Sending Code...' : 'Send Password Reset Code'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition underline"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* ===================== 5. RESET PASSWORD FORM ===================== */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-center space-y-1">
              <span className="text-[11px] text-slate-500">Reset code sent to</span>
              <div className="font-bold text-slate-900 text-sm">{resetEmailAddress}</div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                6-Digit Reset Code
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 tracking-widest font-mono text-center font-bold focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New Password (Min 6 chars)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Hide Passwords' : 'Show Passwords'}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-subtle active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition underline"
              >
                Cancel and return to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Authentic Enterprise Security Notice */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-center text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Secured with Bcrypt Encryption, MongoDB Atlas & Multi-Tenant Data Isolation</span>
        </div>
      </div>
    </div>
  );
}
