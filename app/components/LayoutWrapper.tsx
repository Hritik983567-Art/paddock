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
  const { isAuthenticated, user, isLoading, logout } = useAuth();
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

  const thisYear = Math.max(2026, new Date().getFullYear());
  const seasons: number[] = [];
  for (let y = thisYear; y >= 1950; y--) {
    seasons.push(y);
  }

  const navLinks = [
    { name: 'Overview', path: '/' },
    { name: 'Gallery', path: '/gallery' },
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

      {/* Mobile Drawer Overlay Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="mobile-backdrop-overlay" 
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <header className="top-header">
        <div className="top-header-brand-row">
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
        </div>

        <div className="header-controls">
          <label htmlFor="seasonSelect" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>Select F1 Season</label>
          <select 
            id="seasonSelect" 
            title="Season"
            aria-label="Select F1 Season"
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
          >
            <option value="current">Current season</option>
            {seasons.map(y => (
              <option key={y} value={y.toString()}>{y}</option>
            ))}
          </select>

          <label htmlFor="themeSelect" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>Select F1 Team Theme</label>
          <select 
            id="themeSelect" 
            title="F1 Team Theme"
            aria-label="Select F1 Team Theme"
            value={activeTheme}
            onChange={(e) => handleThemeChange(e.target.value)}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
          >
            <option value="default">🏎️ Pit-Wall Red</option>
            <option value="ferrari">🔴 Ferrari</option>
            <option value="redbull">🔵 Red Bull</option>
            <option value="mercedes">🟢 Mercedes</option>
            <option value="mclaren">🟠 McLaren</option>
            <option value="aston">💚 Aston Martin</option>
          </select>

          {user && (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-[#0D121F] border border-slate-700 rounded-lg text-xs font-mono">
              <span className="w-6 h-6 rounded-full bg-[#6542A5] text-white flex items-center justify-center font-black text-[10px]">
                {user.name ? user.name.slice(0, 2).toUpperCase() : user.username ? user.username.slice(0, 2).toUpperCase() : 'F1'}
              </span>
              <div className="hidden sm:block text-left">
                <span className="font-black text-white block text-[11px] leading-tight">{user.name || user.username}</span>
                <span className="text-[9px] text-purple-400 font-bold block">{user.role || 'Telemetry Analyst'}</span>
              </div>
            </div>
          )}

          <button 
            id="logoutLink" 
            onClick={logout} 
            aria-label="Log out of Paddock"
            className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-300 font-mono font-black text-xs rounded-lg transition-all shadow-md flex items-center gap-1"
          >
            <span>LOGOUT</span>
            <span>🚪</span>
          </button>
        </div>
      </header>

      {/* Mobile Quick Navigation Strip (visible on mobile web & tablets) */}
      <div className="mobile-subnav-strip">
        {navLinks.map(link => {
          const isActive = pathname === link.path;
          return (
            <Link 
              key={link.path} 
              href={link.path} 
              className={`mobile-subnav-pill ${isActive ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

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

        {/* Data Source & Freshness Attribution Footer (P-11 / R-07) */}
        <footer style={{ marginTop: '40px', paddingTop: '16px', borderTop: '1px solid var(--line)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--dim)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>Data Sources: FIA Formula 1 Telemetry • Jolpica / Ergast F1 Open Data Proxy • Server Cached</div>
          <div>Status: <span style={{ color: 'var(--green)' }}>● LIVE (240 FPS)</span> • Refresh: Real-time</div>
        </footer>
      </main>
    </>
  );
}
