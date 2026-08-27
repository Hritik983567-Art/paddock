import React from 'react';
import { TeammateComparisonData } from '../../lib/teammateDataService';

interface TeammateBattleOverviewProps {
  data: TeammateComparisonData;
}

export const TeammateBattleOverview: React.FC<TeammateBattleOverviewProps> = ({ data }) => {
  const { driverA, driverB, qualiH2H, raceH2H, scorecard } = data;

  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="p-6 border-2 border-slate-700/80 rounded-xl mb-4 shadow-2xl relative z-10 font-mono"
    >
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚔️</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider font-display">
            TEAMMATE BATTLE OVERVIEW
          </h3>
        </div>
        <span className="text-[10px] font-bold text-amber-400">
          IMMEDIATE HEAD-TO-HEAD SUMMARY
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Qualifying Battle */}
        <div className="bg-[#0D121F] p-4 rounded-xl border-2 border-slate-700 text-center">
          <span className="text-[10px] font-bold text-cyan-400 block uppercase mb-1">QUALIFYING BATTLE</span>
          <div className="text-xl font-black text-white">
            <span className="text-cyan-300">{driverA.code} {qualiH2H.scoreA}</span>
            <span className="text-slate-500 mx-1.5">&mdash;</span>
            <span className="text-amber-300">{qualiH2H.scoreB} {driverB.code}</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">SESSIONS AHEAD</span>
        </div>

        {/* Race Battle */}
        <div className="bg-[#0D121F] p-4 rounded-xl border-2 border-slate-700 text-center">
          <span className="text-[10px] font-bold text-cyan-400 block uppercase mb-1">RACE FINISH BATTLE</span>
          <div className="text-xl font-black text-white">
            <span className="text-cyan-300">{driverA.code} {raceH2H.scoreA}</span>
            <span className="text-slate-500 mx-1.5">&mdash;</span>
            <span className="text-amber-300">{raceH2H.scoreB} {driverB.code}</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">HIGHER FINISHES</span>
        </div>

        {/* Points Battle */}
        <div className="bg-[#0D121F] p-4 rounded-xl border-2 border-slate-700 text-center">
          <span className="text-[10px] font-bold text-cyan-400 block uppercase mb-1">POINTS BATTLE</span>
          <div className="text-xl font-black text-white">
            <span className="text-cyan-300">{scorecard.pointsA}</span>
            <span className="text-slate-500 mx-1.5">&mdash;</span>
            <span className="text-amber-300">{scorecard.pointsB}</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">TOTAL POINTS</span>
        </div>

        {/* Wins Battle */}
        <div className="bg-[#0D121F] p-4 rounded-xl border-2 border-slate-700 text-center">
          <span className="text-[10px] font-bold text-cyan-400 block uppercase mb-1">VICTORY BATTLE</span>
          <div className="text-xl font-black text-white">
            <span className="text-cyan-300">{scorecard.winsA}</span>
            <span className="text-slate-500 mx-1.5">&mdash;</span>
            <span className="text-amber-300">{scorecard.winsB}</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">RACE WINS</span>
        </div>
      </div>
    </div>
  );
};
