'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center text-white">
      <div className="max-w-lg w-full p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-red-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(0,240,255,0.25)] animate-pulse">
          🚩
        </div>

        <div className="inline-block px-3 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 rounded-full font-mono text-[11px] font-black uppercase tracking-widest mb-3">
          ERROR 404 // ROUTE OFF-TRACK
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white uppercase mb-3">
          Track Sector Not Found
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed mb-8">
          The pit-wall navigation system could not locate the requested telemetry route or sector address. It may have been moved, renamed, or offline.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <Link
            href="/"
            className="px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all text-center flex items-center justify-center gap-1.5"
          >
            <span>PIT WALL OVERVIEW</span>
            <span>🏎️</span>
          </Link>

          <Link
            href="/standings"
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all text-center flex items-center justify-center gap-1.5"
          >
            <span>VIEW STANDINGS</span>
            <span>📊</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-[11px] font-mono text-slate-500">
          <span>PADDOCK ROUTER // v0.1.0</span>
          <Link href="/support" className="text-cyan-400 hover:underline">
            Help Center →
          </Link>
        </div>
      </div>
    </div>
  );
}
