import React from 'react';
import { TeammateComparisonData } from '../../lib/teammateDataService';

interface RaceH2HProps {
  data: TeammateComparisonData;
}

export const RaceH2H: React.FC<RaceH2HProps> = ({ data }) => {
  const { driverA, driverB, raceH2H, scorecard } = data;

  const totalSess = Math.max(1, raceH2H.scoreA + raceH2H.scoreB);
  const widthA = (raceH2H.scoreA / totalSess) * 100;
  const widthB = (raceH2H.scoreB / totalSess) * 100;

  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="p-6 border-2 border-slate-700/80 rounded-xl mb-4 shadow-2xl relative z-10 font-mono"
    >
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏁</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider font-display">
            RACE FINISH HEAD-TO-HEAD
          </h3>
        </div>
        <span className="text-[10px] font-bold text-cyan-400">
          GRAND PRIX FINISHES
        </span>
      </div>

      {/* Visual Comparison Bar */}
      <div className="mb-6 bg-[#0D121F] p-4 rounded-xl border border-slate-700">
        <div className="flex justify-between text-xs font-black mb-2">
          <span className="text-cyan-400">{driverA.code}: {raceH2H.scoreA} HIGHER FINISHES</span>
          <span className="text-slate-400">RACE HEAD-TO-HEAD</span>
          <span className="text-amber-400">{driverB.code}: {raceH2H.scoreB} HIGHER FINISHES</span>
        </div>

        <div className="w-full h-5 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800 p-0.5">
          <div
            style={{ width: `${widthA}%` }}
            className="h-full bg-cyan-500 rounded-l-full flex items-center justify-start px-2 text-[10px] font-black text-slate-950"
          >
            {widthA >= 15 ? `${Math.round(widthA)}%` : ''}
          </div>
          <div
            style={{ width: `${widthB}%` }}
            className="h-full bg-amber-500 rounded-r-full flex items-center justify-end px-2 text-[10px] font-black text-slate-950"
          >
            {widthB >= 15 ? `${Math.round(widthB)}%` : ''}
          </div>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#0D121F] p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">AVERAGE FINISH POS</span>
          <div className="flex justify-between font-black">
            <span className="text-cyan-300">P{raceH2H.avgA || 'N/A'}</span>
            <span className="text-amber-300">P{raceH2H.avgB || 'N/A'}</span>
          </div>
        </div>

        <div className="bg-[#0D121F] p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">POINTS FINISHES</span>
          <div className="flex justify-between font-black">
            <span className="text-cyan-300">{raceH2H.pointsFinishesA} races</span>
            <span className="text-amber-300">{raceH2H.pointsFinishesB} races</span>
          </div>
        </div>

        <div className="bg-[#0D121F] p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">POSITIONS GAINED</span>
          <div className="flex justify-between font-black">
            <span className="text-emerald-400">+{raceH2H.positionsGainedA}</span>
            <span className="text-emerald-400">+{raceH2H.positionsGainedB}</span>
          </div>
        </div>

        <div className="bg-[#0D121F] p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">RELIABILITY / DNFs</span>
          <div className="flex justify-between font-black">
            <span className="text-red-400">{scorecard.dnfsA} DNFs</span>
            <span className="text-red-400">{scorecard.dnfsB} DNFs</span>
          </div>
        </div>
      </div>
    </div>
  );
};
