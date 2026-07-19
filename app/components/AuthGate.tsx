'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthGate() {
  const { login } = useAuth();
  
  // Unified flow step: 1 = Identifier, 2 = Verification (Password or OTP)
  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState<'email' | 'phone' | 'admin' | null>(null);

  // Form values for Step 2
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // OTP State
  const [otpTimer, setOtpTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Google OAuth popup modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleConnecting, setGoogleConnecting] = useState(false);

  // UI feedback
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  // Countdown timer logic for phone OTP
  useEffect(() => {
    if (otpTimer > 0) {
      timerRef.current = setTimeout(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [otpTimer]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const value = identifier.trim();
    if (!value) {
      setError('Please enter your email, phone number, or admin username.');
      triggerShake();
      return;
    }

    // 1. Detect Admin
    if (value.toLowerCase() === 'admin') {
      setIdentifierType('admin');
      setStep(2);
      return;
    }

    // 2. Detect Email
    if (value.includes('@')) {
      if (value.length < 5) {
        setError('Please enter a valid email address.');
        triggerShake();
        return;
      }
      setIdentifierType('email');
      setStep(2);
      return;
    }

    // 3. Detect Phone (contains mostly digits)
    const cleanPhone = value.replace(/\D/g, '');
    if (cleanPhone.length >= 10) {
      setIdentifierType('phone');
      setStep(2);
      setOtpTimer(30); // Send OTP simulation
      return;
    }

    // 4. Unrecognized format fallback
    setError('Enter a valid email address or 10-digit phone number.');
    triggerShake();
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (identifierType === 'admin') {
      const success = login('demo', { username: 'admin', password });
      if (!success) {
        setError('Incorrect admin password.');
        triggerShake();
      }
    } 
    
    else if (identifierType === 'email') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        triggerShake();
        return;
      }
      if (isSignUp && !name.trim()) {
        setError('Please enter your name.');
        triggerShake();
        return;
      }
      try {
        const success = login('email', { email: identifier, password, isSignUp, name });
        if (!success) {
          setError('Incorrect password.');
          triggerShake();
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred during registration.');
        triggerShake();
      }
    } 
    
    else if (identifierType === 'phone') {
      const cleanPhone = identifier.replace(/\D/g, '');
      if (otp === '123456' || otp.length === 6) {
        login('phone', { phone: cleanPhone });
      } else {
        setError('Invalid OTP code. Enter "123456" for demo access.');
        triggerShake();
      }
    }
  };

  const handleBack = () => {
    setError('');
    setStep(1);
    setIdentifierType(null);
    setPassword('');
    setOtp('');
    setName('');
  };

  const startGoogleLogin = () => {
    setError('');
    setShowGoogleModal(true);
    setGoogleConnecting(true);

    setTimeout(() => {
      setGoogleConnecting(false);
    }, 1500);
  };

  const selectGoogleAccount = (profile: { email: string; name: string }) => {
    login('google', profile);
    setShowGoogleModal(false);
  };

  return (
    <div id="authGate">
      <style>{`
        /* Self-contained style rules for the unified merged login screen */
        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #FFFFFF;
          color: #1F2937;
          border: 1px solid #E5E7EB;
          border-radius: 6px;
          padding: 11px 0;
          font-family: var(--font-body);
          font-weight: 500;
          font-size: 13.5px;
          cursor: pointer;
          margin-top: 14px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.06);
          transition: all 0.15s ease;
        }
        .google-btn:hover {
          background: #F9FAFB;
          box-shadow: 0 4px 6px rgba(0,0,0,0.09);
        }
        .auth-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 20px 0 10px;
          font-size: 11px;
          color: var(--dim);
          font-family: var(--font-mono);
          text-transform: uppercase;
        }
        .auth-divider::before, .auth-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--line);
        }
        .auth-divider:not(:empty)::before {
          margin-right: .75em;
        }
        .auth-divider:not(:empty)::after {
          margin-left: .75em;
        }
        .mode-toggle-link {
          font-size: 12px;
          color: var(--cyan);
          cursor: pointer;
          text-decoration: underline dotted;
          margin-bottom: 15px;
          display: inline-block;
        }
        .mode-toggle-link:hover {
          color: var(--paper);
        }
        .otp-hint {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--amber);
          margin-top: 6px;
          opacity: 0.85;
        }
        .resend-btn {
          background: transparent;
          border: none;
          color: var(--cyan);
          font-family: var(--font-mono);
          font-size: 11px;
          text-decoration: underline;
          cursor: pointer;
        }
        .resend-btn:disabled {
          color: var(--dim);
          text-decoration: none;
          cursor: not-allowed;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--dim);
          cursor: pointer;
          margin-bottom: 16px;
          transition: color 0.15s ease;
        }
        .back-link:hover {
          color: var(--paper);
        }

        /* Google Accounts Chooser Overlay style rules */
        .oauth-overlay {
          position: fixed;
          inset: 0;
          z-index: 1100;
          background: rgba(4, 5, 8, 0.85);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .oauth-modal {
          background: #FFFFFF;
          color: #111827;
          width: 100%;
          max-width: 380px;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
          font-family: var(--font-body);
        }
        .oauth-hdr {
          text-align: center;
          margin-bottom: 20px;
        }
        .oauth-hdr h3 {
          margin: 6px 0 2px;
          font-size: 18px;
          font-weight: 600;
        }
        .oauth-hdr p {
          color: #6B7280;
          font-size: 12px;
          margin: 0;
        }
        .oauth-accounts {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .oauth-account {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          background: transparent;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .oauth-account:hover {
          background: #F3F4F6;
        }
        .oauth-avatar {
          width: 32px;
          height: 32px;
          background: #DEE2E6;
          color: #495057;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        .oauth-info div {
          font-weight: 600;
          font-size: 13px;
        }
        .oauth-info small {
          color: #6B7280;
          font-size: 11px;
        }
        .oauth-spinner {
          border: 3px solid #E5E7EB;
          border-top: 3px solid var(--red);
          border-radius: 50%;
          width: 28px;
          height: 28px;
          animation: spin 800ms linear infinite;
          margin: 20px auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

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
          <p className="gate-sub">Enter your email or phone number to continue to Paddock.</p>
          
          <div className="gate-error" id="gateError">{error}</div>

          {/* STEP 1: Enter Identifier */}
          {step === 1 && (
            <form onSubmit={handleContinue}>
              <div className="gate-field">
                <label htmlFor="gateIdentifier">Email or Phone number</label>
                <input 
                  type="text" 
                  id="gateIdentifier" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com or 9876543210"
                  autoFocus
                  required
                />
              </div>
              <button type="submit" className="gate-submit">Continue</button>
            </form>
          )}

          {/* STEP 2: Verification Password / OTP */}
          {step === 2 && (
            <form onSubmit={handleVerify}>
              <div className="back-link" onClick={handleBack}>
                ← Edit {identifierType === 'email' ? 'email' : identifierType === 'phone' ? 'phone' : 'identifier'}
              </div>

              {/* Step 2 Subform: Email (Password) */}
              {identifierType === 'email' && (
                <>
                  <div 
                    className="mode-toggle-link"
                    onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                  >
                    {isSignUp ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
                  </div>

                  {isSignUp && (
                    <div className="gate-field">
                      <label htmlFor="gateName">Full Name</label>
                      <input 
                        type="text" 
                        id="gateName" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Hritik Kumar"
                        required
                      />
                    </div>
                  )}

                  <div className="gate-field">
                    <label htmlFor="gatePass">Password</label>
                    <input 
                      type="password" 
                      id="gatePass" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      autoFocus
                      required
                    />
                  </div>
                </>
              )}

              {/* Step 2 Subform: Phone (OTP) */}
              {identifierType === 'phone' && (
                <div className="gate-field">
                  <label htmlFor="gateOtp">Verification Code (OTP)</label>
                  <input 
                    type="text" 
                    id="gateOtp" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    autoFocus
                    required
                  />
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button 
                      type="button" 
                      className="resend-btn"
                      disabled={otpTimer > 0}
                      onClick={() => { setOtpTimer(30); setError(''); }}
                    >
                      Resend OTP
                    </button>
                    {otpTimer > 0 && (
                      <span style={{ fontSize: '11px', color: 'var(--dim)', fontFamily: 'var(--font-mono)' }}>
                        Retry in {otpTimer}s
                      </span>
                    )}
                  </div>
                  <div className="otp-hint">Hint: Simulated OTP code is <b>123456</b></div>
                </div>
              )}

              {/* Step 2 Subform: Admin (Password) */}
              {identifierType === 'admin' && (
                <div className="gate-field">
                  <label htmlFor="gatePass">Admin Password</label>
                  <input 
                    type="password" 
                    id="gatePass" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoFocus
                    required
                  />
                </div>
              )}

              <button type="submit" className="gate-submit">
                {identifierType === 'phone' 
                  ? 'Verify OTP & Enter' 
                  : isSignUp 
                  ? 'Create Account & Enter' 
                  : 'Enter Dashboard'}
              </button>
            </form>
          )}

          {/* Google OAuth Section */}
          <div className="auth-divider">Or continue with</div>
          
          <button 
            type="button" 
            className="google-btn"
            onClick={startGoogleLogin}
          >
            {/* Google official SVG G-Logo */}
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.25h2.9c1.69-1.55 2.69-3.85 2.69-6.58z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.2l-2.9-2.25c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.58-5.05-3.71H.96v2.33C2.44 15.93 5.48 18 9 18z"/>
              <path fill="#FBBC05" d="M3.95 10.7c-.18-.54-.28-1.12-.28-1.7s.1-1.16.28-1.7V4.97H.96C.35 6.18 0 7.55 0 9s.35 2.82.96 4.03l2.99-2.33z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4C13.46.97 11.43 0 9 0 5.48 0 2.44 2.07.96 4.97L3.95 7.3c.71-2.13 2.7-3.72 5.05-3.72z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>

      {/* Google Accounts Chooser Popup */}
      {showGoogleModal && (
        <div className="oauth-overlay">
          <div className="oauth-modal">
            <div className="oauth-hdr">
              <svg width="32" height="32" viewBox="0 0 24 24" style={{ margin: '0 auto' }}>
                <path fill="#4285F4" d="M21.35 11.1h-9.17v2.73h6.51c-.3 1.56-1.17 2.88-2.5 3.75v3.1h4.03c2.36-2.17 3.73-5.37 3.73-9.13 0-.87-.08-1.72-.25-2.45z"/>
                <path fill="#34A853" d="M12.18 20.5c2.6 0 4.78-.86 6.37-2.33l-4.03-3.1c-1.12.75-2.55 1.2-4.04 1.2-3.11 0-5.74-2.1-6.68-4.93H1.28v3.22C2.92 17.8 6.9 20.5 12.18 20.5z"/>
                <path fill="#FBBC05" d="M5.5 11.34c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31V3.48H1.28C.46 5.12 0 6.96 0 9.03s.46 3.91 1.28 5.55L5.5 11.34z"/>
                <path fill="#EA4335" d="M12.18 5.83c1.43 0 2.7.49 3.7 1.45l2.78-2.77C16.96 2.91 14.78 2 12.18 2 6.9 2 2.92 4.7 1.28 7.92L5.5 11.14c.94-2.83 3.57-4.93 6.68-4.93z"/>
              </svg>
              <h3>Sign in with Google</h3>
              <p>to continue to Paddock Analytics</p>
            </div>

            {googleConnecting ? (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div className="oauth-spinner"></div>
                <div style={{ fontSize: '13px', color: '#4B5563', fontWeight: 500 }}>
                  Connecting to Google Accounts...
                </div>
              </div>
            ) : (
              <div className="oauth-accounts">
                <button 
                  className="oauth-account"
                  onClick={() => selectGoogleAccount({ email: 'hritik.kumar@gmail.com', name: 'Hritik Kumar' })}
                >
                  <div className="oauth-avatar" style={{ background: '#3F51B5', color: '#FFF' }}>H</div>
                  <div className="oauth-info">
                    <div>Hritik Kumar</div>
                    <small>hritik.kumar@gmail.com</small>
                  </div>
                </button>
                
                <button 
                  className="oauth-account"
                  onClick={() => selectGoogleAccount({ email: 'guest.paddock@gmail.com', name: 'Guest User' })}
                >
                  <div className="oauth-avatar" style={{ background: '#E0E0E0', color: '#666' }}>G</div>
                  <div className="oauth-info">
                    <div>Guest User</div>
                    <small>guest.paddock@gmail.com</small>
                  </div>
                </button>

                <button 
                  className="oauth-account"
                  style={{ justifyContent: 'center', borderStyle: 'dashed', borderColor: '#D1D5DB' }}
                  onClick={() => setShowGoogleModal(false)}
                >
                  <div style={{ fontSize: '12.5px', color: '#4B5563', fontWeight: 500 }}>
                    Cancel
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
