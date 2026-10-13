'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type F1Theme = 
  | 'default' 
  | 'checkered'
  | 'ferrari' 
  | 'redbull' 
  | 'mercedes' 
  | 'mclaren' 
  | 'aston' 
  | 'alpine' 
  | 'haas' 
  | 'racingbulls' 
  | 'sauber' 
  | 'williams';

interface ThemeContextType {
  theme: F1Theme;
  setTheme: (theme: F1Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<F1Theme>('default');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const raw = (localStorage.getItem('paddock_theme') as F1Theme) || 'checkered';
    const savedTheme = raw === 'default' ? 'checkered' : raw;
    setThemeState(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const setTheme = (newTheme: F1Theme) => {
    const canonicalTheme = newTheme === 'default' ? 'checkered' : newTheme;
    setThemeState(canonicalTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('paddock_theme', canonicalTheme);
      document.documentElement.setAttribute('data-theme', canonicalTheme);
      window.dispatchEvent(new CustomEvent('paddock_theme_changed', { detail: canonicalTheme }));
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
