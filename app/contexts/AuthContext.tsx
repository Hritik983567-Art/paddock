'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserState {
  username: string;
  name?: string;
  email?: string;
  role: string;
  team: string;
  picture?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserState | null;
  login: (user: string, pass: string, remember?: boolean) => Promise<boolean>;
  register: (name: string, email: string, pass: string, team?: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: (credential?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check HttpOnly Cookie session via server /api/auth/verify on startup
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/verify');
        const data = await res.json();
        if (res.ok && data.authenticated && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = async (usernameInput: string, passwordInput: string, remember?: boolean): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput, remember })
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const register = async (name: string, email: string, passwordInput: string, team?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: passwordInput, team })
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Registration failed.' };
    } catch {
      return { success: false, message: 'Server connection error during registration.' };
    }
  };

  const loginWithGoogle = async (credential?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, loginWithGoogle, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
