'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (password.length < 6) {
      setIsError(true);
      setMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setIsError(true);
      setMessage('Password confirmation does not match.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setIsError(true);
        setMessage(error.message);
      } else {
        setIsError(false);
        setMessage('Success: Password updated successfully! Redirecting to paddock dashboard...');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (err: unknown) {
      setIsError(true);
      const errMsg = err instanceof Error ? err.message : 'An unexpected error occurred while updating password.';
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
      width: '100%',
      minHeight: '100dvh',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflowY: 'auto'
    }}>
      <div className="login-wallpaper-wrapper">
        <div className="f1-ambient-flow-glow"></div>
        <img 
          src="/images/f1-login-car.png" 
          alt="Formula 1 Car Wallpaper" 
          className="login-wallpaper-img" 
        />
        <div className="login-wallpaper-overlay"></div>
      </div>

      <div className="centered-login-card">
        <div className="f1-spec-form-inner">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E10600] to-[#8A0B00] flex items-center justify-center text-white font-black text-xs shadow-[0_0_12px_rgba(225,6,0,0.5)] border border-red-500/30">
                F1
              </div>
              <div>
                <div className="text-xs font-mono font-black text-white tracking-widest uppercase">
                  PADDOCK TELEMETRY
                </div>
                <div className="text-[9.5px] font-mono text-cyan-400 tracking-wider">
                  SECURITY KEY UPDATE
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30">
              SECURITY
            </span>
          </div>

          <div className="f1-spec-welcome">
            <h1>UPDATE PASSWORD</h1>
            <p>Enter your new password to secure your telemetry workstation profile</p>
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

          <form onSubmit={handleUpdatePassword} className="f1-spec-form" autoComplete="off">
            <div className="f1-spec-field">
              <label htmlFor="newPass">NEW PASSWORD</label>
              <div className="spec-password-wrapper">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="newPass" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  minLength={6}
                  disabled={loading}
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

            <div className="f1-spec-field" style={{ marginTop: '16px' }}>
              <label htmlFor="confirmPass">CONFIRM NEW PASSWORD</label>
              <div className="spec-password-wrapper">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="confirmPass" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  minLength={6}
                  disabled={loading}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="f1-spec-actions" style={{ marginTop: '24px' }}>
              <button 
                type="submit" 
                className="spec-sign-in-btn"
                disabled={loading}
              >
                {loading ? 'SAVING NEW PASSWORD...' : 'UPDATE PASSWORD & SIGN IN'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
