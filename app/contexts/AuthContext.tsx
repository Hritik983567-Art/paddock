'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (method: 'demo' | 'email' | 'phone' | 'google', payload: any) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GATE_KEY = 'paddock_demo_auth';

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

  const login = (method: 'demo' | 'email' | 'phone' | 'google', payload: any): boolean => {
    if (method === 'google') {
      localStorage.setItem(GATE_KEY, '1');
      localStorage.setItem('paddock_user_email', payload.email);
      localStorage.setItem('paddock_user_name', payload.name);
      localStorage.setItem('paddock_user_method', 'google');
      setIsAuthenticated(true);
      return true;
    }
    
    if (method === 'phone') {
      localStorage.setItem(GATE_KEY, '1');
      localStorage.setItem('paddock_user_phone', payload.phone);
      localStorage.setItem('paddock_user_method', 'phone');
      setIsAuthenticated(true);
      return true;
    }

    if (method === 'email') {
      const { email, password, isSignUp, name } = payload;
      const emailTrim = email.trim().toLowerCase();
      
      const usersRaw = localStorage.getItem('paddock_registered_users') || '[]';
      const users = JSON.parse(usersRaw);
      
      if (isSignUp) {
        if (users.find((u: any) => u.email === emailTrim)) {
          throw new Error('Email address already registered.');
        }
        users.push({ email: emailTrim, password, name });
        localStorage.setItem('paddock_registered_users', JSON.stringify(users));
        
        localStorage.setItem(GATE_KEY, '1');
        localStorage.setItem('paddock_user_email', emailTrim);
        localStorage.setItem('paddock_user_name', name);
        localStorage.setItem('paddock_user_method', 'email');
        setIsAuthenticated(true);
        return true;
      } else {
        const user = users.find((u: any) => u.email === emailTrim);
        if (!user || user.password !== password) {
          return false;
        }
        localStorage.setItem(GATE_KEY, '1');
        localStorage.setItem('paddock_user_email', user.email);
        localStorage.setItem('paddock_user_name', user.name || 'User');
        localStorage.setItem('paddock_user_method', 'email');
        setIsAuthenticated(true);
        return true;
      }
    }

    if (method === 'demo') {
      if (payload.username.trim() === 'admin' && payload.password === 'paddock2026') {
        localStorage.setItem(GATE_KEY, '1');
        localStorage.setItem('paddock_user_name', 'Administrator');
        localStorage.setItem('paddock_user_method', 'demo');
        setIsAuthenticated(true);
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(GATE_KEY);
    localStorage.removeItem('paddock_user_email');
    localStorage.removeItem('paddock_user_name');
    localStorage.removeItem('paddock_user_phone');
    localStorage.removeItem('paddock_user_method');
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
