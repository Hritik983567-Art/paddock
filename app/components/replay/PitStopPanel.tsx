import React from 'react';
import { PitStopItem } from '../../lib/replayDataService';

interface PitStopPanelProps {
  pitStops: PitStopItem[];
  currentLap: number;
  onJumpToPitLap: (lap: number) => void;
}

export const PitStopPanel: React.FC<PitStopPanelProps> = ({
  pitStops,
  currentLap,
  onJumpToPitLap
}) => {
  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="border-2 border-slate-700/80 rounded-xl p-4 shadow-2xl mb-4 font-mono relative z-10"
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-base">🔧</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">
            PIT STOP ANALYSIS
          </h3>
        </div>
        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
          {pitStops.length} STOPS COMPLETED
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
              <th className="py-2 px-3">DRIVER</th>
              <th className="py-2 px-3">LAP</th>
              <th className="py-2 px-3">STOP #</th>
              <th className="py-2 px-3">DURATION</th>
              <th className="py-2 px-3">TYRE CHANGE</th>
              <th className="py-2 px-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {pitStops.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-slate-500">
                  No pit stop records found for this session.
                </td>
              </tr>
            ) : (
              pitStops.map((ps, idx) => {
                const isCurrent = ps.lap === currentLap;
                return (
                  <tr
                    key={`ps-${idx}`}
                    className={`border-b border-slate-800/60 transition-colors ${
                      isCurrent ? 'bg-cyan-950/40 text-white font-bold' : 'hover:bg-[#0D121F] text-slate-300'
                    }`}
                  >
                    <td className="py-2 px-3 font-bold text-white">{ps.driverCode}</td>
                    <td className="py-2 px-3 font-bold text-cyan-400">LAP {ps.lap}</td>
                    <td className="py-2 px-3 text-slate-400">Stop {ps.stopNumber}</td>
                    <td className="py-2 px-3 font-bold text-emerald-400">{ps.duration}</td>
                    <td className="py-2 px-3 text-[11px] font-semibold text-amber-300">
                      {ps.tyreBefore || 'MEDIUM'} &rarr; {ps.tyreAfter || 'HARD'}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => onJumpToPitLap(ps.lap)}
                        className="px-2 py-0.5 text-[10px] bg-[#0D121F] hover:bg-slate-800 border border-slate-700 text-cyan-400 rounded transition-colors font-bold uppercase"
                      >
                        REPLAY ⏱️
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
