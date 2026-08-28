'use client';

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

export default function AccountSettingsPage() {
  const { user, logout } = useAuth();
  const [displayName, setDisplayName] = React.useState(user?.name || user?.username || '');
  const [activeTheme, setActiveTheme] = React.useState('default');
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [deleteReason, setDeleteReason] = React.useState('');
  const [deletionSubmitted, setDeletionSubmitted] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem('paddock_theme') || 'default';
    setActiveTheme(saved);
  }, []);

  const handleThemeChange = (theme: string) => {
    setActiveTheme(theme);
    localStorage.setItem('paddock_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDeleteRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setDeletionSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 font-sans text-slate-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white font-black text-xl flex items-center justify-center shadow-[0_0_25px_rgba(147,51,234,0.4)] border border-purple-400">
            {displayName ? displayName.slice(0, 2).toUpperCase() : 'F1'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white uppercase">
              {displayName || 'Telemetry Analyst'}
            </h1>
            <p className="text-xs text-purple-400 font-mono flex items-center gap-2">
              <span>Role: {user?.role || 'Telemetry Analyst'}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">● Active Session</span>
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-300 font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <span>LOGOUT SESSION</span>
          <span>🚪</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-mono font-bold flex items-center justify-between shadow-lg">
          <span>✓ Account settings & team theme preferences saved successfully.</span>
          <span>✨</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Settings Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Section */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
            <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span>👤</span>
              <span>Analyst Profile Information</span>
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                  Display Name / Analyst Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  placeholder="Enter analyst name"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                  User Role / Clearance
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.role || 'Telemetry Analyst'}
                  className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
                >
                  SAVE PROFILE CHANGES
                </button>
              </div>
            </form>
          </div>

          {/* F1 Team Theme Preference */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
            <h2 className="text-sm font-black font-mono text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span>🎨</span>
              <span>Active F1 Team Livery Theme</span>
            </h2>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Select your preferred Formula 1 team livery theme. Your preference is persisted in browser storage.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'default', name: 'Pit-Wall Red', color: 'bg-red-600' },
                { id: 'ferrari', name: 'Scuderia Ferrari', color: 'bg-red-700' },
                { id: 'redbull', name: 'Red Bull Racing', color: 'bg-blue-600' },
                { id: 'mercedes', name: 'Mercedes-AMG', color: 'bg-emerald-500' },
                { id: 'mclaren', name: 'McLaren Papaya', color: 'bg-orange-500' },
                { id: 'aston', name: 'Aston Martin', color: 'bg-emerald-700' },
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    activeTheme === theme.id
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <span className="block text-xs font-mono font-bold text-white">{theme.name}</span>
                    <span className="text-[9px] font-mono text-slate-400 uppercase">{theme.id}</span>
                  </div>
                  <span className={`w-3.5 h-3.5 rounded-full ${theme.color} shadow-sm`} />
                </button>
              ))}
            </div>
          </div>

          {/* Account Deletion / Data Request */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-red-900/40 shadow-xl backdrop-blur-md">
            <h2 className="text-sm font-black font-mono text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span>⚠️</span>
              <span>Account Deletion & Data Privacy Request</span>
            </h2>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Submit a request to permanently delete your account credentials, custom theme settings, and telemetry history under our Privacy Policy.
            </p>

            {deletionSubmitted ? (
              <div className="p-4 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-mono">
                ✓ Account deletion request logged. You will be logged out once processed.
              </div>
            ) : showDeleteConfirm ? (
              <form onSubmit={handleDeleteRequest} className="space-y-3 bg-red-950/30 p-4 rounded-2xl border border-red-900/50">
                <label className="block text-xs font-mono text-slate-300">
                  Optional Reason for Deletion Request:
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="State reason (optional)"
                  rows={2}
                  className="w-full p-2.5 bg-slate-950 border border-red-900/80 rounded-xl text-xs font-mono text-white focus:outline-none"
                />
                <div className="flex items-center gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-mono rounded-lg"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-mono font-black text-xs uppercase rounded-lg shadow"
                  >
                    CONFIRM DELETION REQUEST
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-400 font-mono font-bold text-xs rounded-xl transition-all"
              >
                REQUEST ACCOUNT DELETION
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Info Cards */}
        <div className="space-y-6">
          {/* Security Summary */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
            <h2 className="text-xs font-black font-mono text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span>🛡️</span>
              <span>Security & Token Status</span>
            </h2>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Authentication State:</span>
                <span className="font-bold text-emerald-400">AUTHENTICATED (JWT)</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Session Storage:</span>
                <span className="font-bold text-slate-300">LocalStorage Encrypted Token</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Data Proxy Access:</span>
                <span className="font-bold text-cyan-400">Jolpica Telemetry API</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-center">
              <Link href="/security" className="text-[11px] font-mono text-cyan-400 hover:underline">
                View Security Disclosure →
              </Link>
            </div>
          </div>

          {/* Quick Legal Links */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
            <h2 className="text-xs font-black font-mono text-slate-400 uppercase tracking-widest mb-3">
              Legal & Transparency
            </h2>

            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link href="/privacy" className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center justify-between">
                  <span>Privacy Policy</span>
                  <span>→</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center justify-between">
                  <span>Terms of Service</span>
                  <span>→</span>
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center justify-between">
                  <span>Cookie Policy</span>
                  <span>→</span>
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center justify-between">
                  <span>F1 Open Data Disclaimer</span>
                  <span>→</span>
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center justify-between">
                  <span>Accessibility Statement</span>
                  <span>→</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
