'use client';

import React from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { SeasonProvider, useSeason } from '../contexts/SeasonContext';
import AuthGate from './AuthGate';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SeasonProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </SeasonProvider>
    </AuthProvider>
  );
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { selectedSeason, setSelectedSeason } = useSeason();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeTheme, setActiveTheme] = React.useState('default');

  React.useEffect(() => {
    const saved = localStorage.getItem('paddock_theme') || 'default';
    setActiveTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const handleThemeChange = (theme: string) => {
    setActiveTheme(theme);
    localStorage.setItem('paddock_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  };

  if (isLoading) {
    return (
      <div className="loading" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Initializing telemetry systems…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthGate />;
  }

  const thisYear = new Date().getFullYear();
  const seasons: number[] = [];
  for (let y = thisYear; y >= 1950; y--) {
    seasons.push(y);
  }

  const navLinks = [
    { name: 'Overview', path: '/' },
    { name: 'Standings', path: '/standings' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Circuit Specialist', path: '/compare' },
    { name: 'Drivers', path: '/drivers' },
    { name: 'Teammates', path: '/teammates' },
    { name: 'Replay', path: '/replay' },
    { name: 'News', path: '/news' },
    { name: 'Strategy Lab', path: '/lab' },
    { name: 'Race Tracker', path: '/tracker' },
    { name: 'Live Telemetry', path: '/live' },
  ];

  return (
    <>
      {/* Translucent Team Background Wallpaper */}
      <div className="f1-theme-wallpaper"></div>

      <header className="top-header">
        <button 
          className="mobile-menu-btn"
          aria-label="Toggle Navigation Menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
        <div className="brand">
          <span className="dot"></span>PADDOCK<small>ANALYTICS &amp; RACE TRACKER</small>
        </div>
        
        <select 
          id="seasonSelect" 
          title="Season"
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
        >
          <option value="current">Current season</option>
          {seasons.map(y => (
            <option key={y} value={y.toString()}>{y}</option>
          ))}
        </select>

        <select 
          id="themeSelect" 
          title="F1 Team Theme"
          value={activeTheme}
          onChange={(e) => handleThemeChange(e.target.value)}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
        >
          <option value="default">🏎️ Theme: Pit-Wall Red</option>
          <option value="ferrari">🔴 Scuderia Ferrari</option>
          <option value="redbull">🔵 Red Bull Racing</option>
          <option value="mercedes">🟢 Mercedes Petronas</option>
          <option value="mclaren">🟠 McLaren Papaya</option>
          <option value="aston">💚 Aston Martin Green</option>
        </select>

        <button id="logoutLink" onClick={logout}>Log out</button>
      </header>

      <aside className={`side-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="side-nav-head">
          <div className="side-nav-title">TIMING TOWER</div>
          <div className="side-nav-sub">LIVE TELEMETRY // SEASON</div>
        </div>
        <nav className="tabs">
          {navLinks.map(link => {
            const isActive = pathname === link.path;
            return (
              <Link 
                key={link.path} 
                href={link.path} 
                className={`tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="wrap">
        {children}
      </main>
    </>
  );
}
