'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type F1Theme = 
  | 'default' 
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
    const savedTheme = (localStorage.getItem('paddock_theme') as F1Theme) || 'default';
    setThemeState(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const setTheme = (newTheme: F1Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('paddock_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      window.dispatchEvent(new CustomEvent('paddock_theme_changed', { detail: newTheme }));
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
