import React from 'react';
import { TyreStint, DriverMeta } from '../../lib/replayDataService';

interface TyreStrategyProps {
  driverIds: string[];
  driverMeta: Record<string, DriverMeta>;
  tyreStints: Record<string, TyreStint[]>;
  totalLaps: number;
}

export const TyreStrategy: React.FC<TyreStrategyProps> = ({
  driverIds,
  driverMeta,
  tyreStints,
  totalLaps
}) => {
  const getCompoundColor = (compound: string) => {
    switch (compound) {
      case 'SOFT': return '#EF4444'; // Red
      case 'MEDIUM': return '#F59E0B'; // Yellow
      case 'HARD': return '#F8FAFC'; // White
      case 'INTERMEDIATE': return '#10B981'; // Green
      case 'WET': return '#3B82F6'; // Blue
      default: return '#64748B';
    }
  };

  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="border-2 border-slate-700/80 rounded-xl p-4 shadow-2xl mb-4 font-mono relative z-10"
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-base">🛞</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">
            TYRE STINT STRATEGY
          </h3>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-bold">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> SOFT</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> MEDIUM</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-white"></span> HARD</span>
        </div>
      </div>

      <div className="space-y-2 overflow-x-auto">
        {driverIds.slice(0, 10).map((dId) => {
          const meta = driverMeta[dId];
          const stints = tyreStints[dId] || [];

          return (
            <div key={`tyre-${dId}`} className="flex items-center gap-3 text-xs">
              <span className="w-10 font-black text-white">{meta?.code || dId}</span>
              <div className="flex-1 flex h-4 bg-slate-900 rounded overflow-hidden border border-slate-800">
                {stints.map((stint, idx) => {
                  const duration = Math.max(1, stint.endLap - stint.startLap + 1);
                  const widthPct = (duration / Math.max(totalLaps, 1)) * 100;
                  const color = getCompoundColor(stint.compound);

                  return (
                    <div
                      key={`stint-${idx}`}
                      style={{ width: `${widthPct}%`, backgroundColor: color }}
                      className="h-full border-r border-slate-950 flex items-center justify-center text-[9px] font-black text-slate-950"
                      title={`${stint.compound}: L${stint.startLap} - L${stint.endLap} (${duration} laps)`}
                    >
                      {duration > 4 ? stint.compound[0] : ''}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
