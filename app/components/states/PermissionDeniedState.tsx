'use client';

import React from 'react';
import Link from 'next/link';

interface PermissionDeniedStateProps {
  requiredRole?: string;
}

export default function PermissionDeniedState({
  requiredRole = 'Telemetry Analyst',
}: PermissionDeniedStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-purple-950/30 border border-purple-800/50 shadow-2xl backdrop-blur-md max-w-lg mx-auto my-8">
      <div className="w-16 h-16 rounded-full bg-purple-950 border border-purple-500/40 flex items-center justify-center text-3xl mb-4 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
        🔒
      </div>

      <span className="px-3 py-0.5 rounded-full bg-purple-900/60 border border-purple-700/80 text-purple-300 font-mono text-[10px] font-black uppercase tracking-widest mb-2">
        HTTP 403 // AUTHORIZATION RESTRICTED
      </span>

      <h3 className="text-xl font-black text-white tracking-wide font-mono uppercase mb-2">
        Access Permission Denied
      </h3>

      <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed mb-4">
        Your current session credentials do not possess the required clearance level to inspect this restricted pit-wall telemetry screen.
      </p>

      <div className="text-xs font-mono text-purple-300 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 mb-6">
        Required Role: <span className="font-bold text-white">{requiredRole}</span>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
        >
          RETURN TO PIT WALL
        </Link>
        <Link
          href="/support"
          className="px-4 py-2.5 text-xs font-mono text-slate-400 hover:text-white"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
