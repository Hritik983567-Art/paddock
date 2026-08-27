import React from 'react';
import { TeammateComparisonData } from '../../lib/teammateDataService';

interface RecentFormProps {
  data: TeammateComparisonData;
}

export const RecentForm: React.FC<RecentFormProps> = ({ data }) => {
  const { driverA, driverB, recentFormA, recentFormB } = data;

  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="p-6 border-2 border-slate-700/80 rounded-xl mb-4 shadow-2xl relative z-10 font-mono"
    >
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider font-display">
            RECENT FORM (LAST 5 RACES)
          </h3>
        </div>
        <span className="text-[10px] font-bold text-cyan-400">
          COMPACT FORM TRAJECTORY
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DRIVER A FORM */}
        <div className="p-4 bg-[#0D121F] rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-cyan-400 block">{driverA.name}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">LAST 5 FINISHES</span>
          </div>

          <div className="flex items-center gap-1.5 font-black text-xs">
            {recentFormA.map((rf, idx) => (
              <span
                key={`rfa-${idx}`}
                className={`px-2 py-1 rounded border text-[11px] ${
                  rf.isDnf
                    ? 'bg-red-950/80 text-red-400 border-red-800 font-bold'
                    : rf.label === 'P1'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                    : 'bg-cyan-950/80 text-cyan-300 border-cyan-800 font-bold'
                }`}
              >
                {rf.label}
              </span>
            ))}
          </div>
        </div>

        {/* DRIVER B FORM */}
        <div className="p-4 bg-[#0D121F] rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-amber-400 block">{driverB.name}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">LAST 5 FINISHES</span>
          </div>

          <div className="flex items-center gap-1.5 font-black text-xs">
            {recentFormB.map((rf, idx) => (
              <span
                key={`rfb-${idx}`}
                className={`px-2 py-1 rounded border text-[11px] ${
                  rf.isDnf
                    ? 'bg-red-950/80 text-red-400 border-red-800 font-bold'
                    : rf.label === 'P1'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                    : 'bg-amber-950/80 text-amber-300 border-amber-800 font-bold'
                }`}
              >
                {rf.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
