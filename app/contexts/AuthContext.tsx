'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GATE_KEY = 'paddock_demo_auth';
const DEMO_USER = 'admin';
const DEMO_PASS = 'paddock2026';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const authVal = localStorage.getItem(GATE_KEY);
    if (authVal === '1') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (user: string, pass: string): boolean => {
    if (user.trim() === DEMO_USER && pass === DEMO_PASS) {
      localStorage.setItem(GATE_KEY, '1');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(GATE_KEY);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
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
