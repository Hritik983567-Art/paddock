import React from 'react';
import { TeammateComparisonData } from '../../lib/teammateDataService';

interface PositionHistoryChartsProps {
  data: TeammateComparisonData;
}

export const PositionHistoryCharts: React.FC<PositionHistoryChartsProps> = ({ data }) => {
  const { rounds, driverA, driverB } = data;

  if (!rounds || rounds.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 font-mono">
      {/* QUALIFYING POSITION CHART */}
      <div 
        style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
        className="p-5 border-2 border-slate-700/80 rounded-xl shadow-2xl relative z-10"
      >
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
          <h4 className="text-xs font-black text-white uppercase tracking-wider">
            QUALIFYING POSITION HISTORY (P1-P20)
          </h4>
          <span className="text-[10px] text-cyan-400 font-bold">RACE-BY-RACE</span>
        </div>

        <div className="overflow-x-auto space-y-1.5 text-xs">
          {rounds.map(r => (
            <div key={`qchart-${r.round}`} className="flex items-center justify-between p-2 bg-[#0D121F] rounded border border-slate-800">
              <span className="w-24 text-[11px] font-bold text-slate-300 truncate" title={r.raceName}>
                R{r.round} {r.raceName.replace(' Grand Prix', '')}
              </span>
              <div className="flex items-center gap-3 font-black">
                <span className="text-cyan-300 w-12 text-center bg-cyan-950/80 rounded border border-cyan-800 py-0.5">
                  {r.qualiStrA}
                </span>
                <span className="text-slate-500 font-normal">vs</span>
                <span className="text-amber-300 w-12 text-center bg-amber-950/80 rounded border border-amber-800 py-0.5">
                  {r.qualiStrB}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RACE FINISHING POSITION CHART */}
      <div 
        style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
        className="p-5 border-2 border-slate-700/80 rounded-xl shadow-2xl relative z-10"
      >
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
          <h4 className="text-xs font-black text-white uppercase tracking-wider">
            RACE FINISHING POSITION (FINISHED VS DNF)
          </h4>
          <span className="text-[10px] text-amber-400 font-bold">RACE-BY-RACE</span>
        </div>

        <div className="overflow-x-auto space-y-1.5 text-xs">
          {rounds.map(r => {
            const isDnfA = r.statusA !== 'Finished' && !r.statusA.includes('+') && !r.statusA.includes('Laps') && r.statusA !== 'N/A';
            const isDnfB = r.statusB !== 'Finished' && !r.statusB.includes('+') && !r.statusB.includes('Laps') && r.statusB !== 'N/A';

            return (
              <div key={`rchart-${r.round}`} className="flex items-center justify-between p-2 bg-[#0D121F] rounded border border-slate-800">
                <span className="w-24 text-[11px] font-bold text-slate-300 truncate" title={r.raceName}>
                  R{r.round} {r.raceName.replace(' Grand Prix', '')}
                </span>
                <div className="flex items-center gap-3 font-black">
                  <span className={`w-14 text-center rounded border py-0.5 ${
                    isDnfA ? 'bg-red-950/80 text-red-400 border-red-800' : 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
                  }`}>
                    {isDnfA ? 'DNF' : r.raceA ? `P${r.raceA}` : 'N/A'}
                  </span>
                  <span className="text-slate-500 font-normal">vs</span>
                  <span className={`w-14 text-center rounded border py-0.5 ${
                    isDnfB ? 'bg-red-950/80 text-red-400 border-red-800' : 'bg-amber-950/80 text-amber-300 border-amber-800'
                  }`}>
                    {isDnfB ? 'DNF' : r.raceB ? `P${r.raceB}` : 'N/A'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
