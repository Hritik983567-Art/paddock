import React from 'react';
import { RaceEvent } from '../../lib/replayDataService';

interface JumpToMenuProps {
  events: RaceEvent[];
  totalLaps: number;
  onJumpToLap: (lap: number) => void;
}

export const JumpToMenu: React.FC<JumpToMenuProps> = ({
  events,
  totalLaps,
  onJumpToLap
}) => {
  const pitEvents = events.filter(e => e.type === 'pit_stop');
  const overtakeEvents = events.filter(e => e.type === 'overtake');
  const safetyCarEvents = events.filter(e => e.type === 'safety_car' || e.type === 'vsc');

  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="flex flex-wrap items-center gap-2 p-3 border-2 border-slate-700/80 rounded-xl mb-4 font-mono shadow-2xl relative z-10"
    >
      <span className="text-xs font-black text-cyan-400 uppercase tracking-wider mr-2">
        ⚡ JUMP TO:
      </span>

      <button
        onClick={() => onJumpToLap(1)}
        className="px-2.5 py-1 text-xs font-bold bg-[#0D121F] hover:bg-slate-800 border border-slate-700 text-white rounded transition-colors"
      >
        🏁 START (LAP 1)
      </button>

      {pitEvents.length > 0 && (
        <button
          onClick={() => onJumpToLap(pitEvents[0].lap)}
          className="px-2.5 py-1 text-xs font-bold bg-[#0D121F] hover:bg-slate-800 border border-slate-700 text-cyan-300 rounded transition-colors"
        >
          🔧 FIRST PIT STOP (L{pitEvents[0].lap})
        </button>
      )}

      {overtakeEvents.length > 0 && (
        <button
          onClick={() => onJumpToLap(overtakeEvents[0].lap)}
          className="px-2.5 py-1 text-xs font-bold bg-[#0D121F] hover:bg-slate-800 border border-slate-700 text-purple-300 rounded transition-colors"
        >
          🏎️ OVERTAKE (L{overtakeEvents[0].lap})
        </button>
      )}

      {safetyCarEvents.length > 0 && (
        <button
          onClick={() => onJumpToLap(safetyCarEvents[0].lap)}
          className="px-2.5 py-1 text-xs font-bold bg-[#0D121F] hover:bg-slate-800 border border-slate-700 text-amber-300 rounded transition-colors"
        >
          🚗 SAFETY CAR (L{safetyCarEvents[0].lap})
        </button>
      )}

      <button
        onClick={() => onJumpToLap(Math.floor(totalLaps / 2))}
        className="px-2.5 py-1 text-xs font-bold bg-[#0D121F] hover:bg-slate-800 border border-slate-700 text-slate-300 rounded transition-colors"
      >
        MID-RACE (L{Math.floor(totalLaps / 2)})
      </button>

      <button
        onClick={() => onJumpToLap(totalLaps)}
        className="px-2.5 py-1 text-xs font-bold bg-[#0D121F] hover:bg-slate-800 border border-slate-700 text-emerald-300 rounded transition-colors"
      >
        🏁 FINISH (L{totalLaps})
      </button>
    </div>
  );
};
