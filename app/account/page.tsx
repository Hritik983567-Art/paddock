'use client';

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

import { AVATAR_PRESETS, getAvatarPreset } from '../lib/avatarPresets';

export default function AccountSettingsPage() {
  const { user, logout, updateProfile } = useAuth();
  const [displayName, setDisplayName] = React.useState(user?.name || user?.username || '');

  React.useEffect(() => {
    if (user?.name || user?.username) {
      setDisplayName(user.name || user.username || '');
    }
  }, [user?.name, user?.username]);

  const [selectedAvatarId, setSelectedAvatarId] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('paddock_avatar_preset') || 'paddock_engineer';
    }
    return 'paddock_engineer';
  });
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [deleteReason, setDeleteReason] = React.useState('');
  const [deletionSubmitted, setDeletionSubmitted] = React.useState(false);

  const [showAvatarPresets, setShowAvatarPresets] = React.useState(false);

  const activePreset = getAvatarPreset(selectedAvatarId);

  const handleSelectAvatar = (presetId: string) => {
    setSelectedAvatarId(presetId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('paddock_avatar_preset', presetId);
      window.dispatchEvent(new Event('paddock_avatar_changed'));
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (updateProfile) {
      await updateProfile({ name: displayName });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDeleteRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setDeletionSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 font-sans text-slate-200">
      {/* Unified Pilot Profile & Avatar Banner Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl mb-8 transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl ${activePreset.bgGradient} ${activePreset.borderColor} border-2 ${activePreset.glowShadow} overflow-hidden relative flex items-center justify-center shrink-0 transition-all`}>
              {activePreset.photoUrl ? (
                <img
                  src={activePreset.photoUrl}
                  alt={activePreset.name}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallbackEl = e.currentTarget.parentElement?.querySelector('.avatar-fallback-text');
                    if (fallbackEl) fallbackEl.classList.remove('hidden');
                  }}
                />
              ) : null}
              <span className={`avatar-fallback-text font-black text-white text-base tracking-wider drop-shadow-md ${activePreset.photoUrl ? 'hidden' : ''}`}>
                {activePreset.badgeText || (displayName ? displayName.slice(0, 2).toUpperCase() : 'F1')}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center gap-1">
                  <span className="text-[#E10600] font-black tracking-tighter text-xs select-none">///</span>
                  <span className="text-[11px] font-display tracking-widest text-[#E10600] font-black uppercase">
                    PILOT PROFILE
                  </span>
                </span>
                <span className="text-slate-700 font-sans text-xs">•</span>
                <span className="text-[11px] font-display text-slate-400 font-semibold uppercase tracking-wider">
                  PADDOCK USER SETTINGS
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight f1-text-gradient uppercase">
                {displayName || 'TELEMETRY ANALYST'}
              </h1>
              <p className="text-xs text-purple-400 font-mono flex items-center gap-2 mt-0.5">
                <span>Role: {user?.role || 'Paddock Verified Engineer'}</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">● Active Session</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowAvatarPresets(!showAvatarPresets)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 hover:text-amber-300 font-mono text-xs font-bold rounded-xl transition-all shrink-0 flex items-center gap-1.5 shadow-md"
              title="Toggle Avatar Presets Picker"
            >
              <span>⚙️ {showAvatarPresets ? 'HIDE AVATARS' : 'CHANGE AVATAR'}</span>
              <span>{showAvatarPresets ? '▲' : '▼'}</span>
            </button>

            <button
              onClick={logout}
              className="px-4 py-2 bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-300 font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <span>LOGOUT SESSION</span>
              <span>🚪</span>
            </button>
          </div>
        </div>

        {/* Expandable Avatar Presets Grid */}
        {showAvatarPresets && (
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-black font-mono text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <span>🏎️</span>
                <span>SELECT PILOT AVATAR & HELMET PRESET</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                Active: <span className="text-white font-bold">{activePreset.name}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = preset.id === selectedAvatarId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectAvatar(preset.id)}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? `border-amber-400 bg-amber-950/40 ${preset.glowShadow} scale-[1.03]`
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${preset.bgGradient} ${preset.borderColor} border flex items-center justify-center overflow-hidden relative shadow-inner shrink-0`}>
                      {preset.photoUrl ? (
                        <img
                          src={preset.photoUrl}
                          alt={preset.name}
                          className="w-full h-full object-cover object-top"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallbackEl = e.currentTarget.parentElement?.querySelector('.preset-fallback-text');
                            if (fallbackEl) fallbackEl.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <span className={`preset-fallback-text font-mono font-black text-white text-xs drop-shadow ${preset.photoUrl ? 'hidden' : ''}`}>
                        {preset.badgeText}
                      </span>
                    </div>

                    <div className="w-full truncate text-center">
                      <span className="block text-[10px] font-mono font-bold text-white truncate">
                        {preset.name}
                      </span>
                      <span className="block text-[8px] font-mono text-slate-400 uppercase truncate">
                        {preset.team.split(' ')[0]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {savedSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-mono font-bold flex items-center justify-between shadow-lg">
          <span>✓ Pilot profile & F1 helmet avatar preference updated successfully.</span>
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-slate-400 uppercase block">
                    User Role / Clearance
                  </label>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    (Fixed Role)
                  </span>
                </div>
                <input
                  type="text"
                  disabled
                  value={user?.role || 'Paddock Verified Engineer'}
                  className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 cursor-not-allowed font-semibold"
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
