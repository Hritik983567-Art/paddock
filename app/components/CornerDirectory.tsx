'use client';

import React from 'react';
import { CircuitCorner } from '../lib/circuitCornersData';

interface CornerDirectoryProps {
  corners: Record<string, CircuitCorner>;
  selectedCornerId: string;
  onSelectCorner: (cornerId: string) => void;
}

export const CornerDirectory: React.FC<CornerDirectoryProps> = ({
  corners,
  selectedCornerId,
  onSelectCorner
}) => {
  const cornerList = Object.values(corners || {});

  if (cornerList.length === 0) return null;

  return (
    <nav 
      aria-label="F1 Corner Directory Navigation"
      className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 my-5 shadow-2xl relative z-10"
    >
      <div className="flex items-center justify-between gap-3 mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-xs font-mono tracking-widest uppercase text-cyan-400 font-extrabold">
            CORNER DIRECTORY
          </span>
        </div>
        <span className="text-xs font-mono text-slate-300 font-bold bg-slate-900/90 px-3 py-1 rounded-full border border-slate-700/80 hidden sm:inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          {cornerList.length} RECONNAISSANCE SECTORS
        </span>
      </div>

      {/* Horizontal scroll container with high-contrast glassmorphic buttons */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 focus:outline-none">
        {cornerList.map((corner) => {
          const isSelected = corner.id === selectedCornerId;

          return (
            <button
              key={corner.id}
              onClick={() => onSelectCorner(corner.id)}
              aria-selected={isSelected}
              role="tab"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectCorner(corner.id);
                }
              }}
              className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-mono transition-all duration-200 cursor-pointer shadow-lg border ${
                isSelected
                  ? 'bg-gradient-to-r from-red-950/90 to-slate-900 border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] scale-[1.03]'
                  : 'bg-slate-900/70 border-slate-800 text-slate-200 hover:border-cyan-500/60 hover:text-cyan-300 hover:bg-slate-800/80 hover:scale-[1.02]'
              }`}
            >
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-black tracking-wide ${
                  isSelected 
                    ? 'bg-red-600 text-white shadow' 
                    : 'bg-slate-800 text-amber-400 border border-slate-700/80'
                }`}
              >
                {corner.turns || corner.id.toUpperCase()}
              </span>
              <span className="font-extrabold whitespace-nowrap text-white text-[13.5px]">{corner.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
