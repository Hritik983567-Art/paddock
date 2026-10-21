'use client';

import React from 'react';
import { SUPPORTED_CIRCUITS, CALENDAR_CIRCUITS_IDS } from '../constants';

interface CircuitSelectorProps {
  selectedCircuitId: string;
  onSelectCircuit: (id: string) => void;
  filterMode: 'all' | 'calendar' | 'historic';
  onFilterModeChange: (mode: 'all' | 'calendar' | 'historic') => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export const CircuitSelector: React.FC<CircuitSelectorProps> = ({
  selectedCircuitId,
  onSelectCircuit,
  filterMode,
  onFilterModeChange,
  searchQuery,
  onSearchQueryChange,
}) => {
  const filteredCircuits = SUPPORTED_CIRCUITS.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
    if (!matchesSearch) return false;

    if (filterMode === 'calendar') return CALENDAR_CIRCUITS_IDS.has(c.id);
    if (filterMode === 'historic') return !CALENDAR_CIRCUITS_IDS.has(c.id);
    return true;
  });

  return (
    <div className="stitch-card-machined rounded-2xl p-4 sm:p-6 mb-8 shadow-2xl relative z-10">
      {/* Stitch Telemetry HUD Header Strip */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-4 text-[10px] font-mono tracking-wider text-slate-400">
        <div className="flex items-center gap-2">
          <span className="stitch-live-dot" />
          <span className="text-cyan-400 font-bold uppercase tracking-wider">Circuit Atlas</span>
          <span className="text-slate-500">•</span>
          <span className="text-white font-semibold">Global Track Directory</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="stitch-data-chip text-[9px] text-[#00F0FF] border-[#00F0FF]/30 font-bold">
            {filteredCircuits.length} CIRCUITS INDEXED
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search 78 Formula 1 circuits by track name, country or city..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full bg-[#090D14] border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/50 transition-all shadow-inner"
          />
          <svg className="w-4 h-4 text-[#00F0FF]/70 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-[#090D14] p-1.5 border border-white/10 rounded-xl self-start md:self-auto shadow-inner">
          {(['all', 'calendar', 'historic'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onFilterModeChange(mode)}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg uppercase tracking-wider transition-all duration-200 ${
                filterMode === mode
                  ? 'bg-[#00F0FF] text-black shadow-[0_0_14px_rgba(0,240,255,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {mode === 'all' && `All (${SUPPORTED_CIRCUITS.length})`}
              {mode === 'calendar' && 'F1 Calendar 🏁'}
              {mode === 'historic' && 'Heritage 🏛️'}
            </button>
          ))}
        </div>
      </div>

      {/* Circuit Pills Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
        {filteredCircuits.map((c) => {
          const isSelected = c.id === selectedCircuitId;
          const isCalendar = CALENDAR_CIRCUITS_IDS.has(c.id);
          return (
            <button
              key={c.id}
              onClick={() => onSelectCircuit(c.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white shadow-[0_0_16px_rgba(0,240,255,0.25)] scale-[1.02]'
                  : 'bg-[#101722] border-white/10 text-slate-300 hover:border-white/20 hover:bg-[#141C29]'
              }`}
            >
              <span>{c.flag}</span>
              <span className="font-mono font-semibold tracking-tight">{c.name}</span>
              {isCalendar ? (
                <span className="stitch-data-chip text-[9px] text-[#00FF9C] border-[#00FF9C]/40 font-bold">
                  2026
                </span>
              ) : (
                <span className="stitch-data-chip text-[9px] text-slate-400 border-white/10">
                  HERITAGE
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
