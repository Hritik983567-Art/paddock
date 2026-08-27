import React from 'react';
import { TeammateComparisonData } from '../../lib/teammateDataService';

interface ReliabilityDNFsProps {
  data: TeammateComparisonData;
}

export const ReliabilityDNFs: React.FC<ReliabilityDNFsProps> = ({ data }) => {
  const { driverA, driverB, reliability, scorecard } = data;

  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="p-6 border-2 border-slate-700/80 rounded-xl mb-4 shadow-2xl relative z-10 font-mono"
    >
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">🛡️</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider font-display">
            RELIABILITY & DNF BREAKDOWN
          </h3>
        </div>
        <span className="text-[10px] font-bold text-cyan-400">
          SEASON INCIDENT LOG
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
        {/* DRIVER A DNFS */}
        <div className="p-4 bg-[#0D121F] rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-cyan-400 font-black">{driverA.name}</span>
            <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 text-[10px]">
              {scorecard.dnfsA} DNFs RECORDED
            </span>
          </div>

          {reliability.dnfDetailsA.length === 0 ? (
            <p className="text-slate-400 text-xs font-normal py-2">
              0 DNFs recorded. 100% finishing reliability across all completed rounds.
            </p>
          ) : (
            <div className="space-y-1.5 mt-2">
              {reliability.dnfDetailsA.map((d, idx) => (
                <div key={`dnfa-${idx}`} className="p-2 bg-[#050810] rounded border border-slate-800 flex justify-between text-[11px]">
                  <span className="text-slate-300">R{d.round} {d.raceName}</span>
                  <span className="text-red-400 font-black">{d.status || 'Cause unavailable'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DRIVER B DNFS */}
        <div className="p-4 bg-[#0D121F] rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-400 font-black">{driverB.name}</span>
            <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 text-[10px]">
              {scorecard.dnfsB} DNFs RECORDED
            </span>
          </div>

          {reliability.dnfDetailsB.length === 0 ? (
            <p className="text-slate-400 text-xs font-normal py-2">
              0 DNFs recorded. 100% finishing reliability across all completed rounds.
            </p>
          ) : (
            <div className="space-y-1.5 mt-2">
              {reliability.dnfDetailsB.map((d, idx) => (
                <div key={`dnfb-${idx}`} className="p-2 bg-[#050810] rounded border border-slate-800 flex justify-between text-[11px]">
                  <span className="text-slate-300">R{d.round} {d.raceName}</span>
                  <span className="text-red-400 font-black">{d.status || 'Cause unavailable'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
