'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  const getURL = () => {
    let url =
      process?.env?.NEXT_PUBLIC_SITE_URL ??
      process?.env?.NEXT_PUBLIC_VERCEL_URL ??
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000/');
    url = url.includes('http') ? url : `https://${url}`;
    url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
    return url;
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!email || !email.includes('@')) {
      setIsError(true);
      setMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const redirectTo = `${getURL()}auth/callback?next=/update-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

      if (error) {
        setIsError(true);
        setMessage(error.message);
      } else {
        setIsError(false);
        setMessage('Password recovery link has been sent to your email address. Please check your inbox.');
      }
    } catch (err: unknown) {
      setIsError(true);
      const errMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centered-login-screen" style={{
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
        <div className="login-wallpaper-overlay"></div>
      </div>

      <div className="centered-login-card">
        <div className="f1-spec-form-inner">
          <div className="f1-spec-brand">
            <div className="f1-spec-grid-icon">
              <span className="cell cell-dark"></span>
              <span className="cell cell-dark"></span>
              <span className="cell cell-green"></span>
              <span className="cell cell-dark"></span>
            </div>
            <span className="f1-spec-brand-text">PADDOCK<span className="accent-slash">//</span>TELEMETRY</span>
          </div>

          <div className="f1-spec-welcome">
            <h1>RESET PASSWORD</h1>
            <p>Enter your engineer email address to receive a secure recovery link</p>
          </div>

          {message && (
            <div className={`f1-spec-error-banner ${isError ? 'error-mode' : 'success-mode'}`} style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '13px',
              fontFamily: 'var(--font-mono)',
              background: isError ? 'rgba(255, 59, 59, 0.15)' : 'rgba(0, 255, 156, 0.15)',
              border: isError ? '1px solid rgba(255, 59, 59, 0.4)' : '1px solid rgba(0, 255, 156, 0.4)',
              color: isError ? '#ff6b6b' : '#00ff9c'
            }}>
              {message}
            </div>
          )}

          <form onSubmit={handleResetRequest} className="f1-spec-form" autoComplete="off">
            <div className="f1-spec-field">
              <label htmlFor="resetEmail">EMAIL ADDRESS</label>
              <input 
                type="email" 
                id="resetEmail" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@paddock.f1"
                required
                disabled={loading}
                autoComplete="off"
              />
            </div>

            <div className="f1-spec-actions" style={{ marginTop: '24px' }}>
              <button 
                type="submit" 
                className="spec-sign-in-btn"
                disabled={loading}
              >
                {loading ? 'DISPATCHING RECOVERY LINK...' : 'SEND RECOVERY LINK'}
              </button>
            </div>
          </form>

          <p className="f1-spec-footer" style={{ marginTop: '30px', textAlign: 'center' }}>
            <Link 
              href="/"
              style={{
                color: '#00ff9c',
                fontSize: '14px',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              ← Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
