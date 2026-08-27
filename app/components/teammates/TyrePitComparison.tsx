import React from 'react';
import { TeammateComparisonData } from '../../lib/teammateDataService';

interface TyrePitComparisonProps {
  data: TeammateComparisonData;
}

export const TyrePitComparison: React.FC<TyrePitComparisonProps> = ({ data }) => {
  const { driverA, driverB } = data;

  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="p-6 border-2 border-slate-700/80 rounded-xl mb-4 shadow-2xl relative z-10 font-mono"
    >
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔧</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider font-display">
            TYRE STRATEGY & PIT STOP COMPARISON
          </h3>
        </div>
        <span className="text-[10px] font-bold text-amber-400">
          DATA AVAILABILITY STATUS
        </span>
      </div>

      <div className="p-6 bg-[#0D121F] border border-slate-800 rounded-xl text-center">
        <span className="text-2xl block mb-2">🛞</span>
        <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">
          TYRE STRATEGY DATA UNAVAILABLE
        </h4>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Season-long stint-by-stint compound tyre data is not available in historical season summary archives for <span className="text-cyan-400 font-bold">{driverA.code}</span> vs <span className="text-amber-400 font-bold">{driverB.code}</span>. Individual session pit stops can be analyzed in the <span className="text-white font-bold">Paddock Replay Workstation</span>.
        </p>
      </div>
    </div>
  );
};
