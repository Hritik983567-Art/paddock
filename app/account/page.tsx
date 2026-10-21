'use client';

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, F1Theme } from '../contexts/ThemeContext';
import Link from 'next/link';

import { AVATAR_PRESETS, getAvatarPreset } from '../lib/avatarPresets';
import ConstructorLogo from '../components/ConstructorLogo';

export interface ThemeOptionItem {
  id: F1Theme;
  name: string;
  symbolName: string;
  sub: string;
  accentColor: string;
}

const THEME_OPTIONS: ThemeOptionItem[] = [
  { id: 'checkered', name: 'Checkered Flag', symbolName: 'Carbon Apex Roundel', sub: 'F1 Race Atmosphere', accentColor: '#00FFE0' },
  { id: 'ferrari', name: 'Scuderia Ferrari', symbolName: 'Cavallino Shield & Tricolore', sub: 'Rosso Corsa', accentColor: '#E8002D' },
  { id: 'redbull', name: 'Red Bull Racing', symbolName: 'Charging Bulls & Sun', sub: 'Midnight Blue', accentColor: '#1434CB' },
  { id: 'mercedes', name: 'Mercedes-AMG', symbolName: 'Three-Pointed Silver Star', sub: 'Silver Arrows', accentColor: '#00D2BE' },
  { id: 'mclaren', name: 'McLaren F1', symbolName: 'Papaya Speedmark Chevron', sub: 'Papaya Orange', accentColor: '#FF8000' },
  { id: 'aston', name: 'Aston Martin', symbolName: 'British Green Winged Emblem', sub: 'Racing Green', accentColor: '#00594F' },
  { id: 'alpine', name: 'BWT Alpine', symbolName: 'Arrow A Monogram & Flag', sub: 'French Blue', accentColor: '#0078D0' },
  { id: 'haas', name: 'Haas F1', symbolName: 'Circular Red H Badge', sub: 'Monochrome', accentColor: '#E10600' },
  { id: 'racingbulls', name: 'Racing Bulls', symbolName: 'VCARB Bull Shield', sub: 'Electric Blue', accentColor: '#2B63FF' },
  { id: 'sauber', name: 'Stake Sauber', symbolName: 'Neon Green Hex Monogram', sub: 'Neon Green', accentColor: '#00E700' },
  { id: 'williams', name: 'Williams Racing', symbolName: 'Heritage Chevron W Badge', sub: 'Heritage Blue', accentColor: '#00A0DE' },
];

export default function AccountSettingsPage() {
  const { user, logout, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
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
  const currentThemeId = theme === 'default' ? 'checkered' : theme;
  const activeThemeObj = THEME_OPTIONS.find(t => t.id === currentThemeId) || THEME_OPTIONS[0];

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
      <div className="stitch-card-machined rounded-3xl p-6 sm:p-7 shadow-2xl mb-8 relative z-10">
        {/* Stitch Telemetry HUD Header Strip */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-5 text-[10px] font-mono tracking-wider text-slate-400">
          <div className="flex items-center gap-2">
            <span className="stitch-live-dot" />
            <span className="text-cyan-400 font-bold uppercase tracking-wider">Pilot Profile</span>
            <span className="text-slate-500">•</span>
            <span className="text-white font-semibold">Account &amp; Security Credentials</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="stitch-data-chip text-[9px] text-[#00FF9C] border-[#00FF9C]/30 font-bold">
              SESSION ACTIVE
            </span>
            <span className="stitch-data-chip text-[9px] text-cyan-400 border-cyan-500/30 hidden sm:inline-flex">
              JWT 256-BIT SECURE
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl ${activePreset.bgGradient} ${activePreset.borderColor} border-2 ${activePreset.glowShadow} overflow-hidden relative flex items-center justify-center shrink-0 transition-all shadow-xl`}>
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
                  <span className="text-[11px] font-mono tracking-widest text-[#E10600] font-black uppercase">
                    PILOT PROFILE
                  </span>
                </span>
                <span className="text-slate-600 font-sans text-xs">•</span>
                <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
                  TELEMETRY SECTOR
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight f1-text-gradient uppercase">
                {displayName || 'TELEMETRY ANALYST'}
              </h1>
              <p className="text-xs text-slate-300 font-mono flex items-center gap-2 mt-0.5">
                <span className="text-cyan-400 font-bold">{user?.role || 'Paddock Verified Engineer'}</span>
                <span>•</span>
                <span className="text-[#00FF9C] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9C] animate-pulse" />
                  Authenticated
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowAvatarPresets(!showAvatarPresets)}
              className="px-4 py-2.5 bg-[#131A26] hover:bg-[#1A2333] border border-white/10 hover:border-amber-400/50 text-amber-400 hover:text-amber-300 font-mono text-xs font-bold rounded-xl transition-all shrink-0 flex items-center gap-1.5 shadow-md active:scale-[0.98]"
              title="Toggle Avatar Presets Picker"
            >
              <span>⚙️ {showAvatarPresets ? 'HIDE AVATARS' : 'CHANGE AVATAR'}</span>
              <span>{showAvatarPresets ? '▲' : '▼'}</span>
            </button>

            <button
              onClick={logout}
              className="px-4 py-2.5 bg-[#FF3366]/15 hover:bg-[#FF3366]/25 border border-[#FF3366]/40 text-[#FF3366] font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_12px_rgba(255,51,102,0.15)] flex items-center gap-2 active:scale-[0.98]"
            >
              <span>LOGOUT SESSION</span>
              <span>🚪</span>
            </button>
          </div>
        </div>

        {/* Expandable Avatar Presets Grid */}
        {showAvatarPresets && (
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-black font-mono text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <span>🏎️</span>
                <span>SELECT PILOT AVATAR &amp; HELMET PRESET</span>
              </h2>
              <span className="stitch-data-chip text-[10px] text-slate-300">
                Active: <span className="text-amber-300 font-bold ml-1">{activePreset.name}</span>
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
                        : 'border-white/10 bg-[#0A0E15]/80 hover:border-white/20 hover:bg-[#131A26]'
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
        <div className="mb-6 p-4 rounded-2xl bg-[#00FF9C]/10 border border-[#00FF9C]/40 text-[#00FF9C] text-xs font-mono font-bold flex items-center justify-between shadow-[0_0_20px_rgba(0,255,156,0.15)]">
          <span>✓ Pilot profile &amp; F1 helmet avatar preference updated successfully.</span>
          <span>✨</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Settings Form */}
        <div className="md:col-span-2 space-y-6">

          {/* Profile Section */}
          <div className="stitch-card-machined rounded-3xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-4 text-[10px] font-mono tracking-wider text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
                <span className="text-cyan-400 font-bold uppercase tracking-wider">Identity</span>
                <span className="text-slate-500">•</span>
                <span className="text-white font-semibold">Pilot Profile Settings</span>
              </div>
            </div>

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
                  className="w-full px-4 py-2.5 bg-[#090D14] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#00F0FF] transition-colors"
                  placeholder="Enter analyst name"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-slate-400 uppercase block">
                    User Role / Clearance
                  </label>
                  <span className="stitch-data-chip text-[9px] text-slate-500">
                    FIXED ROLE
                  </span>
                </div>
                <input
                  type="text"
                  disabled
                  value={user?.role || 'Paddock Verified Engineer'}
                  className="w-full px-4 py-2.5 bg-[#090D14]/50 border border-white/5 rounded-xl text-xs font-mono text-slate-400 cursor-not-allowed font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#00F0FF] hover:bg-[#33F5FF] text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_16px_rgba(0,240,255,0.3)] transition-all active:scale-[0.98]"
                >
                  SAVE PROFILE CHANGES
                </button>
              </div>
            </form>
          </div>

          {/* F1 Constructor Theme & Livery Section */}
          <div className="stitch-card-machined rounded-3xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-4 text-[10px] font-mono tracking-wider text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00FF9C]" />
                <span className="text-[#00FF9C] font-bold uppercase tracking-wider">Team Livery</span>
                <span className="text-slate-500">•</span>
                <span className="text-white font-semibold">Constructor Themes &amp; Emblem</span>
              </div>
              <span className="stitch-data-chip text-[10px] text-cyan-300 font-bold uppercase">
                {theme === 'default' ? 'CHECKERED' : theme.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-black font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <span>🎨</span>
                <span>F1 Constructor &amp; Checkered Flag Theme</span>
              </h2>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-5 font-sans">
              Select your favorite Formula 1 constructor livery or the signature Checkered Flag race atmosphere. The team company symbol and high-resolution telemetry wallpaper will update instantly across all pages.
            </p>

            {/* Active Livery & Company Symbol Spotlight Banner */}
            <div 
              className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#070A10] via-[#0C121D] to-[#070A10] border shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all"
              style={{ borderColor: `${activeThemeObj.accentColor}70` }}
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div 
                  className="w-16 h-16 rounded-2xl bg-[#05070A] border-2 flex items-center justify-center p-2 shadow-xl shrink-0 transition-transform hover:scale-105"
                  style={{ 
                    borderColor: activeThemeObj.accentColor, 
                    boxShadow: `0 0 24px ${activeThemeObj.accentColor}35` 
                  }}
                >
                  <ConstructorLogo themeId={theme} size={44} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="stitch-data-chip text-[10px] text-emerald-300 border-emerald-500/40 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                      ACTIVE CONSTRUCTOR THEME
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Wallpaper: <span className="text-cyan-300 font-bold">100% Loaded</span>
                    </span>
                  </div>
                  <h3 className="text-base font-black font-mono text-white tracking-wide mt-1 truncate">
                    {activeThemeObj.name}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 flex items-center gap-2 flex-wrap mt-0.5">
                    <span>Symbol: <span className="text-slate-200 font-bold">{activeThemeObj.symbolName}</span></span>
                    <span>•</span>
                    <span style={{ color: activeThemeObj.accentColor }} className="font-bold">{activeThemeObj.sub}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <div 
                  className="px-3.5 py-1.5 rounded-xl border font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 shadow"
                  style={{ 
                    borderColor: `${activeThemeObj.accentColor}80`,
                    backgroundColor: `${activeThemeObj.accentColor}18`,
                    color: activeThemeObj.accentColor 
                  }}
                >
                  <span className="w-2.5 h-2.5 rounded-full shadow" style={{ backgroundColor: activeThemeObj.accentColor }} />
                  <span>{theme === 'default' ? 'CHECKERED' : theme.toUpperCase()} ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Constructor Theme Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {THEME_OPTIONS.map((t) => {
                const isActive = theme === t.id || (theme === 'default' && t.id === 'checkered');
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    aria-label={`Select ${t.name} livery theme`}
                    className={`group relative flex items-center gap-3.5 p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                      isActive
                        ? 'border-cyan-400 bg-[#0E1B2A] shadow-[0_0_24px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400/60'
                        : 'border-white/10 bg-[#0A0E15]/80 hover:border-white/20 hover:bg-[#131A26] active:scale-[0.99]'
                    }`}
                  >
                    {/* Official Company Symbol Badge */}
                    <div 
                      className="w-13 h-13 rounded-2xl bg-[#05070A] border flex items-center justify-center shrink-0 p-2 shadow-inner transition-transform group-hover:scale-105"
                      style={{ 
                        borderColor: isActive ? t.accentColor : 'rgba(255, 255, 255, 0.1)',
                        boxShadow: isActive ? `0 0 16px ${t.accentColor}40` : undefined
                      }}
                    >
                      <ConstructorLogo themeId={t.id} size={34} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-mono font-black text-white tracking-wide truncate group-hover:text-cyan-200">
                          {t.name}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800 shrink-0 shadow-sm">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-300 font-semibold truncate mt-0.5">
                        {t.symbolName}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span 
                          className="w-2 h-2 rounded-full inline-block shrink-0 shadow-sm"
                          style={{ backgroundColor: t.accentColor }}
                        />
                        <span className="text-[10px] font-mono text-slate-400 truncate">
                          {t.sub}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Deletion / Data Request */}
          <div className="stitch-card-machined border-[#FF3366]/30 rounded-3xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3 text-[10px] font-mono tracking-wider text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF3366]" />
                <span className="text-[#FF3366] font-bold uppercase tracking-wider">Data Privacy</span>
                <span className="text-slate-500">•</span>
                <span className="text-white font-semibold">Account Deletion &amp; Data Erasure</span>
              </div>
            </div>

            <h2 className="text-sm font-black font-mono text-[#FF3366] uppercase tracking-widest mb-2 flex items-center gap-2">
              <span>⚠️</span>
              <span>Account Deletion &amp; Data Privacy Request</span>
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed mb-4 font-sans">
              Submit a request to permanently delete your account credentials, custom theme settings, and telemetry history under our Privacy Policy.
            </p>

            {deletionSubmitted ? (
              <div className="p-4 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-mono">
                ✓ Account deletion request logged. You will be logged out once processed.
              </div>
            ) : showDeleteConfirm ? (
              <form onSubmit={handleDeleteRequest} className="space-y-3 bg-[#FF3366]/10 p-4 rounded-2xl border border-[#FF3366]/30">
                <label className="block text-xs font-mono text-slate-300">
                  Optional Reason for Deletion Request:
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="State reason (optional)"
                  rows={2}
                  className="w-full p-2.5 bg-[#090D14] border border-[#FF3366]/40 rounded-xl text-xs font-mono text-white focus:outline-none"
                />
                <div className="flex items-center gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3.5 py-1.5 bg-[#131A26] text-slate-300 text-xs font-mono rounded-lg"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#FF3366] hover:bg-[#FF4D7A] text-white font-mono font-black text-xs uppercase rounded-lg shadow"
                  >
                    CONFIRM DELETION REQUEST
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-[#FF3366]/15 hover:bg-[#FF3366]/25 border border-[#FF3366]/40 text-[#FF3366] font-mono font-bold text-xs rounded-xl transition-all"
              >
                REQUEST ACCOUNT DELETION
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Info Cards */}
        <div className="space-y-6">
          {/* Quick Legal Links */}
          <div className="stitch-card-machined rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-3 text-[10px] font-mono tracking-wider text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-cyan-400 font-bold uppercase tracking-wider">Documentation</span>
            </div>

            <h2 className="text-xs font-black font-mono text-slate-400 uppercase tracking-widest mb-3">
              Legal &amp; Transparency
            </h2>

            <ul className="space-y-2.5 text-xs font-mono">
              <li>
                <Link href="/privacy" className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5">
                  <span>Privacy Policy</span>
                  <span>→</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5">
                  <span>Terms of Service</span>
                  <span>→</span>
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5">
                  <span>Cookie Policy</span>
                  <span>→</span>
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5">
                  <span>F1 Open Data Disclaimer</span>
                  <span>→</span>
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5">
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
