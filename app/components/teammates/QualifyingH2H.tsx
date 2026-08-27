import React from 'react';
import { TeammateComparisonData } from '../../lib/teammateDataService';

interface QualifyingH2HProps {
  data: TeammateComparisonData;
}

export const QualifyingH2H: React.FC<QualifyingH2HProps> = ({ data }) => {
  const { driverA, driverB, qualiH2H } = data;

  const totalSess = Math.max(1, qualiH2H.scoreA + qualiH2H.scoreB);
  const widthA = (qualiH2H.scoreA / totalSess) * 100;
  const widthB = (qualiH2H.scoreB / totalSess) * 100;

  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="p-6 border-2 border-slate-700/80 rounded-xl mb-4 shadow-2xl relative z-10 font-mono"
    >
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">⏱️</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider font-display">
            QUALIFYING HEAD-TO-HEAD
          </h3>
        </div>
        <span className="text-[10px] font-bold text-cyan-400">
          Q1 / Q2 / Q3 BREAKDOWN
        </span>
      </div>

      {/* Visual Comparison Bar */}
      <div className="mb-6 bg-[#0D121F] p-4 rounded-xl border border-slate-700">
        <div className="flex justify-between text-xs font-black mb-2">
          <span className="text-cyan-400">{driverA.code}: {qualiH2H.scoreA} WINS</span>
          <span className="text-slate-400">QUALIFYING HEAD-TO-HEAD</span>
          <span className="text-amber-400">{driverB.code}: {qualiH2H.scoreB} WINS</span>
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
          <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">BEST QUALIFYING POS</span>
          <div className="flex justify-between font-black">
            <span className="text-cyan-300">P{qualiH2H.bestA || 'N/A'}</span>
            <span className="text-amber-300">P{qualiH2H.bestB || 'N/A'}</span>
          </div>
        </div>

        <div className="bg-[#0D121F] p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">AVERAGE QUALI POS</span>
          <div className="flex justify-between font-black">
            <span className="text-cyan-300">P{qualiH2H.avgA || 'N/A'}</span>
            <span className="text-amber-300">P{qualiH2H.avgB || 'N/A'}</span>
          </div>
        </div>

        <div className="bg-[#0D121F] p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Q3 APPEARANCES</span>
          <div className="flex justify-between font-black">
            <span className="text-cyan-300">{qualiH2H.q3AppsA} times</span>
            <span className="text-amber-300">{qualiH2H.q3AppsB} times</span>
          </div>
        </div>

        <div className="bg-[#0D121F] p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Q1 EXITS</span>
          <div className="flex justify-between font-black">
            <span className="text-red-400">{qualiH2H.q1ExitsA}</span>
            <span className="text-red-400">{qualiH2H.q1ExitsB}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
