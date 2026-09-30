'use client';

import React from 'react';
import { CircuitInfo, SUPPORTED_CIRCUITS, CALENDAR_CIRCUITS_IDS } from '../constants';
import { Badge } from '../../components/ui/Badge';

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
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-6 mb-8 backdrop-blur-md">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search 78 Formula 1 circuits by track name, country or city..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 pl-10 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
          />
          <svg className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 border border-zinc-800 rounded-xl self-start md:self-auto">
          {(['all', 'calendar', 'historic'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onFilterModeChange(mode)}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg uppercase tracking-wider transition-all ${
                filterMode === mode
                  ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {mode === 'all' && `All (${SUPPORTED_CIRCUITS.length})`}
              {mode === 'calendar' && 'F1 Calendar'}
              {mode === 'historic' && 'Heritage / Retro'}
            </button>
          ))}
        </div>
      </div>

      {/* Circuit Pills Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800">
        {filteredCircuits.map((c) => {
          const isSelected = c.id === selectedCircuitId;
          const isCalendar = CALENDAR_CIRCUITS_IDS.has(c.id);
          return (
            <button
              key={c.id}
              onClick={() => onSelectCircuit(c.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-red-950/70 border-red-500 text-white shadow-lg shadow-red-950/50 scale-[1.02]'
                  : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-850'
              }`}
            >
              <span>{c.flag}</span>
              <span className="font-mono">{c.name}</span>
              {isCalendar ? (
                <Badge variant="red" size="sm">2026</Badge>
              ) : (
                <Badge variant="zinc" size="sm">HERITAGE</Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
