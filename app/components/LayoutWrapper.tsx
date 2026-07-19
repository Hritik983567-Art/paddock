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

  const [userName, setUserName] = React.useState('User');
  const [loginMethod, setLoginMethod] = React.useState('');

  React.useEffect(() => {
    if (isAuthenticated) {
      const name = localStorage.getItem('paddock_user_name');
      const method = localStorage.getItem('paddock_user_method');
      const phone = localStorage.getItem('paddock_user_phone');
      if (name) {
        setUserName(name);
      } else if (phone) {
        setUserName(`+91 ${phone.slice(0, 5)}...`);
      } else {
        setUserName('User');
      }
      if (method) {
        setLoginMethod(method);
      }
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="loading" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Initializing systems…
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
      <div className="top-header">
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
        
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12.5px', color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>
            👤 {userName} {loginMethod === 'google' ? ' (Google)' : loginMethod === 'phone' ? ' (OTP)' : loginMethod === 'email' ? ' (Email)' : ''}
          </span>
          <button id="logoutLink" style={{ margin: 0 }} onClick={logout}>Log out</button>
        </div>
      </div>

      <aside className="side-nav">
        <div className="side-nav-head">
          <div className="side-nav-title">TIMING TOWER</div>
          <div className="side-nav-sub">LIVE TELEMETRY // SEASON</div>
        </div>
        <div className="tabs">
          {navLinks.map(link => {
            const isActive = pathname === link.path;
            return (
              <Link 
                key={link.path} 
                href={link.path} 
                className={`tab-btn ${isActive ? 'active' : ''}`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </aside>

      <div className="wrap">
        {children}
      </div>
    </>
  );
}
