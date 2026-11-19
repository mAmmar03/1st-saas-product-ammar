import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Purge any legacy persistent localStorage credentials on startup
  useEffect(() => {
    try {
      localStorage.removeItem('ammardev_auth_token');
      localStorage.removeItem('ammardev_current_user');
      localStorage.removeItem('ammardev_screen_locked');
    } catch (e) {
      // ignore
    }
  }, []);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ammardev_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return sessionStorage.getItem('ammardev_auth_token') || null;
  });

  const [isLocked, setIsLocked] = useState(() => {
    return sessionStorage.getItem('ammardev_screen_locked') === 'true';
  });

  const [loading, setLoading] = useState(true);
  const activityTimerRef = useRef(null);

  // Validate session on boot from sessionStorage only
  useEffect(() => {
    checkAuth();
  }, []);

  // Strict Inactivity Timeout: Auto-lock session after 15 minutes of idle
  useEffect(() => {
    if (!token || !currentUser || isLocked) return;

    const resetIdleTimer = () => {
      if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
      // 15 minutes of idle time
      activityTimerRef.current = setTimeout(() => {
        lockScreen();
      }, 15 * 60 * 1000);
    };

    resetIdleTimer();
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, resetIdleTimer, { passive: true }));

    return () => {
      if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
      events.forEach((ev) => window.removeEventListener(ev, resetIdleTimer));
    };
  }, [token, currentUser, isLocked]);

  const checkAuth = async () => {
    const savedToken = sessionStorage.getItem('ammardev_auth_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.data?.user) {
        setCurrentUser(res.data.user);
        sessionStorage.setItem('ammardev_current_user', JSON.stringify(res.data.user));
      } else {
        logout();
      }
    } catch (e) {
      console.warn('Session expired or invalid, logging out', e);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const res = await api.login({ username, password });
    const { token: newToken, user } = res.data;

    setToken(newToken);
    setCurrentUser(user);
    setIsLocked(false);

    // Strict Single-Session Storage only: Automatically destroyed when window/browser closes
    sessionStorage.setItem('ammardev_auth_token', newToken);
    sessionStorage.setItem('ammardev_current_user', JSON.stringify(user));
    sessionStorage.removeItem('ammardev_screen_locked');

    return user;
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    setIsLocked(false);

    sessionStorage.removeItem('ammardev_auth_token');
    sessionStorage.removeItem('ammardev_current_user');
    sessionStorage.removeItem('ammardev_screen_locked');
  };

  const lockScreen = () => {
    setIsLocked(true);
    sessionStorage.setItem('ammardev_screen_locked', 'true');
  };

  const unlockScreen = async (password) => {
    if (!currentUser) return false;
    try {
      await api.login({ username: currentUser.username, password });
      setIsLocked(false);
      sessionStorage.removeItem('ammardev_screen_locked');
      return true;
    } catch (e) {
      return false;
    }
  };

  const verifyMasterPinOrPassword = async (key) => {
    try {
      const res = await api.verifyMasterSecurity(key);
      return Boolean(res.data?.verified);
    } catch {
      return false;
    }
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isAuthenticated = Boolean(token && currentUser);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated,
        isSuperAdmin,
        isLocked,
        loading,
        login,
        logout,
        lockScreen,
        unlockScreen,
        verifyMasterPinOrPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
