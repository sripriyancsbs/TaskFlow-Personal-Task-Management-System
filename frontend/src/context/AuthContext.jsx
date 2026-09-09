import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/taskService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('taskflow_token'));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('taskflow_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(true);

  // Validate stored session on initial mount
  useEffect(() => {
    async function verifySession() {
      const savedToken = localStorage.getItem('taskflow_token');
      if (!savedToken) {
        setAuthLoading(false);
        return;
      }

      try {
        const currentUser = await authService.getMe();
        setUser(currentUser);
        localStorage.setItem('taskflow_user', JSON.stringify(currentUser));
      } catch (err) {
        console.warn('Session expired or invalid:', err.message);
        localStorage.removeItem('taskflow_token');
        localStorage.removeItem('taskflow_user');
        setToken(null);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }

    verifySession();

    // Listen to token expiration events from api interceptor
    function handleAuthExpired() {
      setToken(null);
      setUser(null);
    }

    window.addEventListener('taskflow_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('taskflow_auth_expired', handleAuthExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    if (res?.token && res?.user) {
      localStorage.setItem('taskflow_token', res.token);
      localStorage.setItem('taskflow_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error('Invalid login response from server.');
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await authService.register({ name, email, password });
    if (res?.token && res?.user) {
      localStorage.setItem('taskflow_token', res.token);
      localStorage.setItem('taskflow_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error('Invalid registration response from server.');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    authLoading,
    isAuthenticated: Boolean(user && token),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
