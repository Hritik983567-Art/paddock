'use client';

import React from 'react';

interface MaintenanceStateProps {
  reason?: string;
  estimatedCompletion?: string;
}

export default function MaintenanceState({
  reason = 'The Paddock Telemetry Grid is undergoing scheduled server updates & telemetry proxy maintenance.',
  estimatedCompletion = '30 minutes',
}: MaintenanceStateProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center text-white">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(245,158,11,0.2)]">
          🛠️
        </div>

        <div className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-mono text-[10px] font-black uppercase tracking-widest mb-3">
          SYSTEM MAINTENANCE MODE
        </div>

        <h1 className="text-2xl font-black font-mono tracking-tight text-white uppercase mb-3">
          Pit Wall Telemetry Offline
        </h1>

        <p className="text-xs text-slate-400 font-sans leading-relaxed mb-6">
          {reason}
        </p>

        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 mb-6 flex justify-between items-center">
          <span className="text-slate-500">Est. Completion:</span>
          <span className="font-bold text-amber-400">{estimatedCompletion}</span>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-700 shadow-lg flex items-center justify-center gap-2"
        >
          <span>CHECK TELEMETRY GRID STATUS</span>
          <span>🔄</span>
        </button>
      </div>
    </div>
  );
}
