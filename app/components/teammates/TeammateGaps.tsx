import React from 'react';
import { TeammateComparisonData } from '../../lib/teammateDataService';

interface TeammateGapsProps {
  data: TeammateComparisonData;
}

export const TeammateGaps: React.FC<TeammateGapsProps> = ({ data }) => {
  const { driverA, driverB, gaps } = data;

  const ptsLeader = gaps.pointsGap > 0 ? driverA.code : gaps.pointsGap < 0 ? driverB.code : 'EVEN';
  const ptsDiff = Math.abs(gaps.pointsGap);

  const qualiLeader = gaps.avgQualiGap < 0 ? driverA.code : gaps.avgQualiGap > 0 ? driverB.code : 'EVEN';
  const qualiDiff = Math.abs(gaps.avgQualiGap);

  const raceLeader = gaps.avgRaceGap < 0 ? driverA.code : gaps.avgRaceGap > 0 ? driverB.code : 'EVEN';
  const raceDiff = Math.abs(gaps.avgRaceGap);

  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="p-6 border-2 border-slate-700/80 rounded-xl mb-4 shadow-2xl relative z-10 font-mono"
    >
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">📐</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider font-display">
            TEAMMATE MARGINS & GAPS
          </h3>
        </div>
        <span className="text-[10px] font-bold text-cyan-400">
          AVERAGE PERFORMANCE DELTAS
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        {/* POINTS GAP */}
        <div className="bg-[#0D121F] p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">POINTS GAP</span>
          <div className="text-lg font-black text-white">
            <span className={ptsLeader === driverA.code ? 'text-cyan-300' : 'text-amber-300'}>
              {ptsLeader}
            </span>
            <span className="text-emerald-400 ml-2">+{ptsDiff} pts</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">TOTAL CHAMPIONSHIP MARGIN</span>
        </div>

        {/* QUALIFYING GAP */}
        <div className="bg-[#0D121F] p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">AVG QUALIFYING GAP</span>
          <div className="text-lg font-black text-white">
            <span className={qualiLeader === driverA.code ? 'text-cyan-300' : 'text-amber-300'}>
              {qualiLeader}
            </span>
            <span className="text-cyan-400 ml-2">+{qualiDiff.toFixed(2)} pos</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">AVERAGE GRID POSITION DELTA</span>
        </div>

        {/* RACE GAP */}
        <div className="bg-[#0D121F] p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">AVG RACE FINISH GAP</span>
          <div className="text-lg font-black text-white">
            <span className={raceLeader === driverA.code ? 'text-cyan-300' : 'text-amber-300'}>
              {raceLeader}
            </span>
            <span className="text-amber-400 ml-2">+{raceDiff.toFixed(2)} pos</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">AVERAGE FINISH POSITION DELTA</span>
        </div>
      </div>
    </div>
  );
};
