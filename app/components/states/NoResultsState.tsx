'use client';

import React from 'react';

interface NoResultsStateProps {
  searchTerm?: string;
  onResetSearch?: () => void;
  suggestions?: string[];
}

export default function NoResultsState({
  searchTerm,
  onResetSearch,
  suggestions = ['Check spelling or driver name', 'Try searching by permanent racing number', 'Filter by team name or nationality'],
}: NoResultsStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-slate-950/80 border border-amber-500/30 shadow-2xl backdrop-blur-md max-w-lg mx-auto my-8">
      <div className="w-16 h-16 rounded-full bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-3xl mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
        🔍
      </div>

      <h3 className="text-lg sm:text-xl font-black text-white tracking-wide font-mono uppercase mb-1">
        No Matching Telemetry Results
      </h3>

      {searchTerm && (
        <p className="text-xs font-mono text-amber-400 mb-4 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-800/50">
          Query: &quot;<span className="font-bold text-white">{searchTerm}</span>&quot;
        </p>
      )}

      <div className="text-left w-full bg-slate-900/90 rounded-xl p-4 border border-slate-800 mb-6 text-xs text-slate-300 font-sans">
        <span className="font-mono font-bold text-cyan-400 block mb-2 uppercase text-[11px] tracking-wider">
          Suggested Actions:
        </span>
        <ul className="space-y-1.5 list-disc list-inside text-slate-400">
          {suggestions.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      {onResetSearch && (
        <button
          onClick={onResetSearch}
          className="px-5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <span>CLEAR SEARCH FILTER</span>
          <span>✕</span>
        </button>
      )}
    </div>
  );
}
