'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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

  // Check HttpOnly Cookie session via server /api/auth/verify and Supabase session on startup
  useEffect(() => {
    async function checkSession() {
      try {
        // First check Supabase session for email confirmation state
        const { data: sbData } = await supabase.auth.getSession();
        if (sbData?.session?.user && !sbData.session.user.email_confirmed_at && sbData.session.user.app_metadata?.provider === 'email') {
          // REVOKE UNCONFIRMED EMAIL SESSIONS IMMEDIATELY
          await supabase.auth.signOut({ scope: 'global' });
          await fetch('/api/auth/logout', { method: 'POST' });
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const res = await fetch('/api/auth/verify');
        const data = await res.json();
        if (res.ok && data.authenticated && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else if (sbData?.session?.user && (sbData.session.user.email_confirmed_at || sbData.session.user.app_metadata?.provider !== 'email')) {
          const u = sbData.session.user;
          const email = u.email || '';
          const name = u.user_metadata?.full_name || u.user_metadata?.name || email.split('@')[0];
          setUser({
            username: email,
            name: name,
            email: email,
            role: 'Paddock Verified Engineer',
            team: 'Scuderia Ferrari / Paddock Telemetry',
            picture: u.user_metadata?.avatar_url || u.user_metadata?.picture
          });
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

    // Real-time listener for Supabase Auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setIsAuthenticated(false);
      } else if (session?.user) {
        if (!session.user.email_confirmed_at && session.user.app_metadata?.provider === 'email') {
          // REJECT UNCONFIRMED EMAIL USER
          setUser(null);
          setIsAuthenticated(false);
          return;
        }
        const u = session.user;
        const email = u.email || '';
        const name = u.user_metadata?.full_name || u.user_metadata?.name || email.split('@')[0];
        setUser({
          username: email,
          name: name,
          email: email,
          role: 'Paddock Verified Engineer',
          team: 'Scuderia Ferrari / Paddock Telemetry',
          picture: u.user_metadata?.avatar_url || u.user_metadata?.picture
        });
        setIsAuthenticated(true);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
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
      // 1. Sign out of Supabase Auth to invalidate session and clear local storage auth tokens
      await supabase.auth.signOut({ scope: 'global' });
    } catch {
      // ignore
    }

    try {
      // 2. Clear server HttpOnly cookie
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }

    // 3. Clear browser storage to prevent auto-login on refresh
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        // ignore
      }
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
