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
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="border-2 border-slate-700/80 rounded-xl px-4 py-3 my-4 shadow-2xl relative z-10"
    >
      <div className="flex items-center justify-between gap-3 mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-xs font-mono tracking-widest uppercase text-cyan-400 font-extrabold">
            CORNER DIRECTORY
          </span>
        </div>
        <span className="text-xs font-mono text-slate-200 font-bold bg-slate-900 px-2.5 py-0.5 rounded border border-slate-700 hidden sm:inline">
          {cornerList.length} RECONNAISSANCE SECTORS
        </span>
      </div>

      {/* Horizontal scroll container with high-contrast buttons */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-700 focus:outline-none">
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
              className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono transition-all duration-200 border-2 cursor-pointer shadow-md ${
                isSelected
                  ? 'bg-red-950 border-red-500 text-white shadow-[0_0_16px_rgba(239,68,68,0.5)] scale-[1.03]'
                  : 'bg-[#0D121F] border-slate-700 text-white hover:border-cyan-400 hover:text-cyan-300 hover:bg-slate-800'
              }`}
            >
              <span
                className={`px-2 py-0.5 rounded text-[10.5px] font-black tracking-wide ${
                  isSelected ? 'bg-red-600 text-white' : 'bg-slate-800 text-amber-400 border border-slate-700'
                }`}
              >
                {corner.turns || corner.id.toUpperCase()}
              </span>
              <span className="font-extrabold whitespace-nowrap text-white text-[13px]">{corner.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
