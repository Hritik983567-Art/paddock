'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthGate() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [showCreds, setShowCreds] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      setError('');
    } else {
      setError('Incorrect username or password.');
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  return (
    <div id="authGate">
      <div className={`gate-box ${shake ? 'shake' : ''}`} id="gateBox">
        <div className="gate-pitch">
          <div className="gate-checkers"></div>
          <div className="gate-wordmark">
            <div className="stripe"></div>
            <h1>PAD<span>DOCK</span></h1>
            <div className="tagline">F1 Analytics &amp; Race Tracker</div>
          </div>
          <p>A final-year project built on real public race data: live standings, session replay, driver profiles, teammate head-to-heads, cross-era circuit comparisons, and a pit-strategy simulator.</p>
          <ul className="gate-features">
            <li>Live driver &amp; constructor standings</li>
            <li>Race &amp; qualifying replay</li>
            <li>Full career driver profiles</li>
            <li>Teammate battle tracker</li>
            <li>Pit strategy simulator</li>
          </ul>
        </div>
        <div className="gate-form">
          <h2>Sign in</h2>
          <p className="gate-sub">Demo access — this is a client-side gate for presentation, not a real authentication system.</p>
          <div className="gate-error" id="gateError">{error}</div>
          <form id="gateFormEl" onSubmit={handleSubmit}>
            <div className="gate-field">
              <label htmlFor="gateUser">Username</label>
              <input 
                type="text" 
                id="gateUser" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username" 
                placeholder="admin"
                required
              />
            </div>
            <div className="gate-field">
              <label htmlFor="gatePass">Password</label>
              <input 
                type="password" 
                id="gatePass" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password" 
                placeholder="••••••••"
                required
              />
            </div>
            <label className="gate-remember">
              <input type="checkbox" id="gateRemember" defaultChecked /> Remember me on this device
            </label>
            <button type="submit" className="gate-submit">Enter Dashboard</button>
          </form>
          <div className="gate-demo-note">
            <span 
              id="gateCredToggle" 
              onClick={() => setShowCreds(!showCreds)}
              style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
            >
              {showCreds ? 'Hide credentials' : 'Need the demo credentials?'}
            </span>
            {showCreds && (
              <span id="gateCredValue"> — <b>admin</b> / <b>paddock2026</b></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
