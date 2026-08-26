'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthGate() {
  const { login, register, loginWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [team, setTeam] = useState('Scuderia Ferrari / Paddock Telemetry');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const handleAutofill = () => {
    setEmail('admin@paddock.f1');
    setPassword('paddock2026');
    setError('');
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (isSignUp) {
      // Handle Sign Up
      const res = await register(name, email, password, team);
      if (!res.success) {
        setIsSubmitting(false);
        setError(res.message || 'Registration failed. Try again.');
        setShake(true);
        setTimeout(() => setShake(false), 450);
      }
    } else {
      // Handle Sign In
      const usernameInput = email.includes('@') ? email.split('@')[0] : email;
      const success = await login(usernameInput, password);

      if (!success) {
        setIsSubmitting(false);
        setError('Invalid credentials. Try admin@paddock.f1 / paddock2026');
        setShake(true);
        setTimeout(() => setShake(false), 450);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsSubmitting(true);
    const success = await loginWithGoogle('engineer.f1@gmail.com', 'F1 Telemetry User');

    if (!success) {
      setIsSubmitting(false);
      setError('Google Sign-In failed. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 450);
    }
  };

  return (
    <div id="authGate" className="centered-login-screen">
      {/* Full-Screen 3D F1 Car Wallpaper */}
      <div className="login-wallpaper-wrapper">
        <img 
          src="/images/f1-login-car.png" 
          alt="Formula 1 Car Wallpaper" 
          className="login-wallpaper-img" 
        />
        <div className="login-wallpaper-overlay"></div>
      </div>

      {/* Centered Login / Sign Up Form Card */}
      <div className={`centered-login-card ${shake ? 'shake' : ''}`}>
        <div className="f1-spec-form-inner">
          
          {/* Brand Header */}
          <div className="f1-spec-brand">
            <div className="f1-spec-grid-icon">
              <span className="cell cell-dark"></span>
              <span className="cell cell-dark"></span>
              <span className="cell cell-green"></span>
              <span className="cell cell-dark"></span>
            </div>
            <span className="f1-spec-brand-text">PADDOCK<span className="accent-slash">//</span>ANALYTICS</span>
          </div>

          {/* Welcome Header Text */}
          <div className="f1-spec-welcome">
            <h1>{isSignUp ? 'CREATE AN ACCOUNT' : 'WELCOME BACK'}</h1>
            <p>
              {isSignUp 
                ? 'Register your engineer profile to access live F1 telemetry' 
                : 'Please enter your details to access live F1 telemetry'}
            </p>
          </div>

          {error && <div className="f1-spec-error">{error}</div>}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="f1-spec-form">
            
            {/* Full Name Field (Sign Up Mode Only) */}
            {isSignUp && (
              <div className="f1-spec-field">
                <label htmlFor="specName">FULL NAME</label>
                <input 
                  type="text" 
                  id="specName" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Charles Leclerc"
                  required={isSignUp}
                  disabled={isSubmitting}
                  autoComplete="name"
                />
              </div>
            )}

            {/* Email Address Field */}
            <div className="f1-spec-field">
              <label htmlFor="specEmail">EMAIL ADDRESS</label>
              <input 
                type="email" 
                id="specEmail" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isSignUp ? 'engineer@ferrari.f1' : 'admin@paddock.f1'}
                required
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>

            {/* Team Selection Dropdown (Sign Up Mode Only) */}
            {isSignUp && (
              <div className="f1-spec-field">
                <label htmlFor="specTeam">PREFERRED CONSTRUCTOR TEAM</label>
                <select
                  id="specTeam"
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    height: '46px',
                    background: 'var(--carbon-2)',
                    border: '1px solid var(--line)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    padding: '0 12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px'
                  }}
                >
                  <option value="Scuderia Ferrari / Paddock Telemetry">🔴 Scuderia Ferrari HP</option>
                  <option value="Oracle Red Bull Racing / Paddock Telemetry">🔵 Oracle Red Bull Racing</option>
                  <option value="Mercedes-AMG PETRONAS / Paddock Telemetry">🟢 Mercedes-AMG Petronas</option>
                  <option value="McLaren Formula 1 Team / Paddock Telemetry">🟠 McLaren Formula 1 Team</option>
                  <option value="Aston Martin Aramco / Paddock Telemetry">💚 Aston Martin Aramco</option>
                </select>
              </div>
            )}

            {/* Password Field */}
            <div className="f1-spec-field">
              <label htmlFor="specPass">PASSWORD</label>
              <div className="spec-password-wrapper">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="specPass" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={isSubmitting}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
                <button 
                  type="button" 
                  className="spec-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Sign In Options */}
            {!isSignUp && (
              <div className="f1-spec-options">
                <label className="spec-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span>Remember for 30 days</span>
                </label>
                <button 
                  type="button" 
                  className="spec-forgot-btn"
                  onClick={handleAutofill}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="f1-spec-actions">
              <button 
                type="submit" 
                className="spec-sign-in-btn"
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? (isSignUp ? 'CREATING ACCOUNT...' : 'AUTHENTICATING...') 
                  : (isSignUp ? 'SIGN UP & ENTER PADDOCK' : 'SIGN IN')}
              </button>

              <button 
                type="button" 
                className="spec-google-btn"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
              >
                <svg className="spec-google-icon" width="20" height="20" viewBox="0 0 24 24" style={{ width: '20px', height: '20px', minWidth: '20px', maxWidth: '20px', flexShrink: 0 }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.58c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.1H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.9l3.66-2.81z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.1l3.66 2.81c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{isSignUp ? 'Sign up with Google' : 'Sign in with Google'}</span>
              </button>
            </div>
          </form>

          {/* Footer Switcher */}
          <p className="f1-spec-footer">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button 
                  type="button" 
                  className="spec-signup-btn"
                  onClick={handleToggleMode}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button 
                  type="button" 
                  className="spec-signup-btn"
                  onClick={handleToggleMode}
                >
                  Sign up
                </button>
              </>
            )}
          </p>

        </div>
      </div>
    </div>
  );
}
