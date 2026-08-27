'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function AuthGate() {
  const { login, register, loginWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const gsiInitializedRef = useRef(false);

  // Form State - Cleared by default on component mount / tab reload
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [team, setTeam] = useState('Scuderia Ferrari / Paddock Telemetry');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [googleClientId, setGoogleClientId] = useState<string>('');

  useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');

    // Global listener to silence Google Identity GSI FedCM console abort error overlays
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason;
      const msg = String(reason?.message || reason || '');
      if (msg.includes('FedCM') || msg.includes('GSI_LOGGER') || msg.includes('signal is aborted')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', handleRejection);

      // Clean query parameters from URL (auth_error, error, error_description)
      const urlParams = new URLSearchParams(window.location.search);
      const authError = urlParams.get('auth_error');
      const errorParam = urlParams.get('error');
      const errorDesc = urlParams.get('error_description');

      const rawMsg = authError || errorDesc || errorParam;
      if (rawMsg) {
        setError(`Authentication Notice: ${decodeURIComponent(rawMsg)}`);
        setShake(true);
        setTimeout(() => setShake(false), 450);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    async function fetchClientId() {
      if (gsiInitializedRef.current) return;
      try {
        const res = await fetch('/api/auth/google');
        const data = await res.json();
        const cid = data.clientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
        setGoogleClientId(cid);

        if (cid && typeof window !== 'undefined') {
          const initGsi = () => {
            if ((window as any).google?.accounts?.id && !gsiInitializedRef.current) {
              try {
                gsiInitializedRef.current = true;
                (window as any).google.accounts.id.initialize({
                  client_id: cid,
                  use_fedcm_for_prompt: false,
                  auto_select: false,
                  callback: async (response: any) => {
                    if (response.credential) {
                      setIsSubmitting(true);
                      const success = await loginWithGoogle(response.credential);
                      if (!success) {
                        setIsSubmitting(false);
                        setError('Google OAuth token verification failed.');
                      }
                    }
                  }
                });
              } catch {
                // Ignore GSI re-initialization errors
              }
            }
          };

          if ((window as any).google?.accounts?.id) {
            initGsi();
          } else if (!document.getElementById('google-gsi-script')) {
            const script = document.createElement('script');
            script.id = 'google-gsi-script';
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initGsi;
            document.body.appendChild(script);
          }
        }
      } catch {
        // ignore
      }
    }

    fetchClientId();

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('unhandledrejection', handleRejection);
      }
    };
  }, [loginWithGoogle]);

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setName('');
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (isSignUp) {
      // Sign Up Flow with Supabase Auth Hard Validation
      if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              team: team,
            },
          },
        });

        if (error) {
          setError(error.message);
          setIsSubmitting(false);
          setShake(true);
          setTimeout(() => setShake(false), 450);
          return; // CRITICAL: Stop execution here
        }

        // If data.session exists (Confirm Email is disabled), instantly transition user to dashboard view
        if (data.session) {
          await register(name, email, password, team);
          setIsSubmitting(false);
          return;
        }
      }

      const res = await register(name, email, password, team);
      if (!res.success) {
        setIsSubmitting(false);
        setError(res.message || 'Registration failed. Please try again.');
        setShake(true);
        setTimeout(() => setShake(false), 450);
        return;
      }
    } else {
      // Sign In Flow with Hard Guard Validation
      if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
          setIsSubmitting(false);
          setShake(true);
          setTimeout(() => setShake(false), 450);
          return; // CRITICAL: Stop execution here
        }

        if (!data.session) {
          setError("Session failed to initiate.");
          setIsSubmitting(false);
          setShake(true);
          setTimeout(() => setShake(false), 450);
          return; // CRITICAL: Stop execution here
        }
      }

      const success = await login(email, password, remember);

      if (!success) {
        setIsSubmitting(false);
        setError('Invalid credentials provided. Please try again.');
        setShake(true);
        setTimeout(() => setShake(false), 450);
        return;
      }
    }
  };

  const getURL = () => {
    let url =
      process?.env?.NEXT_PUBLIC_SITE_URL ??
      process?.env?.NEXT_PUBLIC_VERCEL_URL ??
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000/');
    url = url.includes('http') ? url : `https://${url}`;
    url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
    return url;
  };

  const triggerGoogleOAuthPopup = (clientId: string) => {
    if (typeof window === 'undefined') return;

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(window.location.origin)}&` +
      `response_type=id_token%20token&` +
      `scope=${encodeURIComponent('openid email profile')}&` +
      `prompt=select_account&` +
      `nonce=${Math.random().toString(36).substring(2)}`;

    const width = 520;
    const height = 640;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      googleAuthUrl,
      'GoogleSignInPopup',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      setIsGoogleLoading(false);
      setError('Google Sign-In popup was blocked by browser. Please allow popups for this domain.');
      setShake(true);
      setTimeout(() => setShake(false), 450);
      return;
    }

    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        setIsGoogleLoading(false);
      }
    }, 1000);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);

    try {
      const redirectUrl = `${getURL()}auth/callback`;

      // 1. Trigger Supabase OAuth flow
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account consent',
          },
        },
      });

      if (oauthError) {
        setIsGoogleLoading(false);
        setError(`Google Sign-In Error: ${oauthError.message}`);
        setShake(true);
        setTimeout(() => setShake(false), 450);
        return;
      }
    } catch (err: unknown) {
      setIsGoogleLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during Google sign-in.';
      setError(`Google Sign-In Error: ${errorMessage}`);
      setShake(true);
      setTimeout(() => setShake(false), 450);
    }
  };

  return (
    <div id="authGate" className="centered-login-screen" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflowY: 'auto'
    }}>
      <div className="login-wallpaper-wrapper">
        <div className="f1-ambient-flow-glow"></div>
        <div className="f1-entry-speed-streaks">
          <span className="streak streak-1"></span>
          <span className="streak streak-2"></span>
          <span className="streak streak-3"></span>
          <span className="streak streak-4"></span>
          <span className="streak streak-5"></span>
        </div>
        <img 
          src="/images/f1-login-car.png" 
          alt="Formula 1 Car Wallpaper" 
          className="login-wallpaper-img" 
        />
        <div className="login-wallpaper-overlay"></div>
      </div>

      <div className={`centered-login-card ${shake ? 'shake' : ''}`}>
        <div className="f1-spec-form-inner">
          <div className="f1-spec-brand">
            <div className="f1-spec-grid-icon">
              <span className="cell cell-dark"></span>
              <span className="cell cell-dark"></span>
              <span className="cell cell-green"></span>
              <span className="cell cell-dark"></span>
            </div>
            <span className="f1-spec-brand-text">PADDOCK<span className="accent-slash">//</span>ANALYTICS</span>
          </div>

          <div className="f1-spec-welcome">
            <h1>{isSignUp ? 'CREATE AN ACCOUNT' : 'WELCOME BACK'}</h1>
            <p>
              {isSignUp 
                ? 'Register your engineer profile to access live F1 telemetry' 
                : 'Please enter your details to access live F1 telemetry'}
            </p>
          </div>

          {error && <div className="f1-spec-error">{error}</div>}

          <form onSubmit={handleSubmit} className="f1-spec-form" autoComplete="off">
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
                  autoComplete="off"
                />
              </div>
            )}

            <div className="f1-spec-field">
              <label htmlFor="specEmail">EMAIL ADDRESS</label>
              <input 
                type="email" 
                id="specEmail" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@paddock.f1"
                required
                disabled={isSubmitting}
                autoComplete="off"
              />
            </div>

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
                  autoComplete="off"
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

            {!isSignUp && (
              <div className="f1-spec-options" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <label className="spec-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span>Remember for 30 days</span>
                </label>
                <Link 
                  href="/forgot-password" 
                  style={{
                    color: '#00ff9c',
                    fontSize: '12px',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 500,
                    transition: 'color 0.2s ease'
                  }}
                  className="hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
            )}

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
                disabled={isSubmitting || isGoogleLoading}
              >
                <svg className="spec-google-icon" width="20" height="20" viewBox="0 0 24 24" style={{ width: '20px', height: '20px', minWidth: '20px', maxWidth: '20px', flexShrink: 0 }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.58c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.1H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.9l3.66-2.81z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.1l3.66 2.81c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>
                  {isGoogleLoading 
                    ? (isSignUp ? 'Redirecting to Google...' : 'Redirecting...') 
                    : (isSignUp ? 'Sign up with Google' : 'Sign in with Google')}
                </span>
              </button>
            </div>
          </form>

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

          <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--dim)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
            By continuing, you agree to Paddock Telemetry&apos;s{' '}
            <a href="#" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>Terms of Service</a> and{' '}
            <a href="#" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
