'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { verifyJWT } from '../lib/jwt';

interface JWTPayload {
  sub: string;
  name?: string;
  email?: string;
  role: string;
  team: string;
  picture?: string;
  provider?: string;
  iat: number;
  exp: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: JWTPayload | null;
  token: string | null;
  login: (user: string, pass: string) => Promise<boolean>;
  loginWithGoogle: (email?: string, name?: string, picture?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const JWT_TOKEN_KEY = 'paddock_jwt_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<JWTPayload | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkToken() {
      const savedToken = localStorage.getItem(JWT_TOKEN_KEY);
      if (savedToken) {
        const payload = await verifyJWT(savedToken);
        if (payload) {
          setToken(savedToken);
          setUser(payload as JWTPayload);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem(JWT_TOKEN_KEY);
        }
      }
      setIsLoading(false);
    }
    checkToken();
  }, []);

  const login = async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        localStorage.setItem(JWT_TOKEN_KEY, data.token);
        const payload = await verifyJWT(data.token);
        setToken(data.token);
        setUser(payload as JWTPayload);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const loginWithGoogle = async (email?: string, name?: string, picture?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, picture })
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        localStorage.setItem(JWT_TOKEN_KEY, data.token);
        const payload = await verifyJWT(data.token);
        setToken(data.token);
        setUser(payload as JWTPayload);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(JWT_TOKEN_KEY);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, loginWithGoogle, logout, isLoading }}>
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
