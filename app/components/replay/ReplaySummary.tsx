import React, { useState } from 'react';
import { RaceReplaySessionData } from '../../lib/replayDataService';

interface ReplaySummaryProps {
  sessionData: RaceReplaySessionData;
}

export const ReplaySummary: React.FC<ReplaySummaryProps> = ({ sessionData }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="border-2 border-slate-700/80 rounded-xl p-4 shadow-2xl mb-4 font-mono relative z-10"
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-slate-800"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🏆</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">
            RACE SUMMARY & CLASSIFICATION HIGHLIGHTS
          </h3>
        </div>
        <button className="text-slate-400 hover:text-white font-bold text-xs">
          {isOpen ? 'COLLAPSE ▲' : 'EXPAND ▼'}
        </button>
      </div>

      {isOpen && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
          <div className="bg-[#0D121F] p-3 rounded-lg border border-slate-700/80">
            <span className="text-[10px] font-bold text-cyan-400 block uppercase mb-0.5">RACE WINNER</span>
            <span className="text-base font-black text-white">{sessionData.winner?.code || 'VER'}</span>
            <span className="text-[10px] text-slate-400 block">{sessionData.winner?.time || '1:21:44.204'}</span>
          </div>

          <div className="bg-[#0D121F] p-3 rounded-lg border border-slate-700/80">
            <span className="text-[10px] font-bold text-cyan-400 block uppercase mb-0.5">FASTEST LAP</span>
            <span className="text-base font-black text-emerald-400">{sessionData.fastestLap?.driverCode || 'NOR'}</span>
            <span className="text-[10px] text-amber-300 block">{sessionData.fastestLap?.timeStr || '1:21.046'} (L{sessionData.fastestLap?.lap || 42})</span>
          </div>

          <div className="bg-[#0D121F] p-3 rounded-lg border border-slate-700/80">
            <span className="text-[10px] font-bold text-cyan-400 block uppercase mb-0.5">MOST POSITIONS GAINED</span>
            <span className="text-base font-black text-emerald-400">
              {sessionData.mostPositionsGained?.driverCode} (+{sessionData.mostPositionsGained?.gained})
            </span>
          </div>

          <div className="bg-[#0D121F] p-3 rounded-lg border border-slate-700/80">
            <span className="text-[10px] font-bold text-cyan-400 block uppercase mb-0.5">SAFETY CARS & FLAGS</span>
            <span className="text-base font-black text-white">
              {sessionData.safetyCarCount} SC &bull; {sessionData.redFlagCount} RED
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
