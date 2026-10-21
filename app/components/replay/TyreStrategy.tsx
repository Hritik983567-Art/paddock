import React, { useState } from 'react';
import { TyreStint, DriverMeta } from '../../lib/replayDataService';

interface TyreStrategyProps {
  driverIds: string[];
  driverMeta: Record<string, DriverMeta>;
  tyreStints: Record<string, TyreStint[]>;
  totalLaps: number;
  currentLap?: number;
  selectedDriverId?: string | null;
  onSelectDriver?: (id: string) => void;
}

export const TyreStrategy: React.FC<TyreStrategyProps> = ({
  driverIds,
  driverMeta,
  tyreStints,
  totalLaps,
  currentLap = 1,
  selectedDriverId = null,
  onSelectDriver
}) => {
  const [showAllDrivers, setShowAllDrivers] = useState(false);

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

  const getCompoundTextColor = (compound: string) => {
    switch (compound) {
      case 'HARD': return '#0F172A';
      default: return '#05070A';
    }
  };

  const displayDrivers = showAllDrivers ? driverIds : driverIds.slice(0, 10);
  const currentLapPct = Math.min(100, Math.max(0, (currentLap / Math.max(totalLaps, 1)) * 100));

  // Generate 5-6 milestone ticks along the race distance
  const tickStep = totalLaps > 50 ? 10 : 5;
  const lapTicks: number[] = [];
  for (let l = 0; l <= totalLaps; l += tickStep) {
    lapTicks.push(l === 0 ? 1 : l);
  }
  if (!lapTicks.includes(totalLaps)) lapTicks.push(totalLaps);

  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="border-2 border-slate-700/80 rounded-xl p-4 shadow-2xl mb-4 font-mono relative z-10"
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">🛞</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">
            TYRE STINT STRATEGY
          </h3>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            LAP {currentLap}/{totalLaps}
          </span>
        </div>

        {/* Legend & Grid Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> SOFT</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> MEDIUM</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-white"></span> HARD</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAllDrivers(!showAllDrivers)}
            className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-[10px] font-bold text-cyan-300 transition-colors"
          >
            {showAllDrivers ? 'SHOW TOP 10' : `SHOW ALL (${driverIds.length})`}
          </button>
        </div>
      </div>

      {/* Timeline Ruler */}
      <div className="flex items-center gap-3 text-[9px] text-slate-500 font-bold mb-2 pl-12 pr-2">
        <div className="flex-1 relative h-3 border-b border-slate-800">
          {lapTicks.map(t => {
            const pct = (t / Math.max(totalLaps, 1)) * 100;
            return (
              <span
                key={`tick-${t}`}
                style={{ left: `${pct}%` }}
                className="absolute -bottom-1 -translate-x-1/2 whitespace-nowrap"
              >
                L{t}
              </span>
            );
          })}
        </div>
      </div>

      {/* Driver Stint Bars Container */}
      <div className="relative space-y-2 overflow-x-auto pb-1">
        {/* Live Current Lap Cursor Line */}
        <div 
          style={{ left: `calc(48px + (100% - 56px) * ${currentLapPct / 100})` }}
          className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_#00FFE0]"
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-400 text-black font-black text-[8px] px-1 rounded-sm whitespace-nowrap shadow-sm">
            NOW L{currentLap}
          </div>
        </div>

        {displayDrivers.map((dId) => {
          const meta = driverMeta[dId];
          const stints = tyreStints[dId] || [];
          const isSelected = selectedDriverId === dId;

          // Find which stint driver is on at currentLap
          const activeStint = stints.find(s => currentLap >= s.startLap && currentLap <= s.endLap);
          const tyreAge = activeStint ? currentLap - activeStint.startLap + 1 : 1;

          return (
            <div 
              key={`tyre-${dId}`} 
              onClick={() => onSelectDriver?.(dId)}
              className={`flex items-center gap-3 text-xs p-1 rounded-md transition-colors cursor-pointer ${
                isSelected 
                  ? 'bg-cyan-950/40 border border-cyan-500/60 shadow-[0_0_10px_rgba(0,255,224,0.2)]' 
                  : 'hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <div className="w-10 flex items-center justify-between">
                <span className={`font-black ${isSelected ? 'text-cyan-400 font-extrabold' : 'text-white'}`}>
                  {meta?.code || dId}
                </span>
              </div>

              {/* Stint Progress Bar */}
              <div className="flex-1 flex h-5 bg-slate-900 rounded overflow-hidden border border-slate-800 relative">
                {stints.map((stint, idx) => {
                  const duration = Math.max(1, stint.endLap - stint.startLap + 1);
                  const widthPct = (duration / Math.max(totalLaps, 1)) * 100;
                  const color = getCompoundColor(stint.compound);
                  const textColor = getCompoundTextColor(stint.compound);
                  const isCurrentStint = currentLap >= stint.startLap && currentLap <= stint.endLap;

                  return (
                    <div
                      key={`stint-${idx}`}
                      style={{ width: `${widthPct}%`, backgroundColor: color }}
                      className={`h-full border-r border-slate-950 flex items-center justify-center text-[10px] font-black transition-all ${
                        isCurrentStint ? 'brightness-110 ring-1 ring-white/50' : 'opacity-85'
                      }`}
                      title={`${stint.compound}: L${stint.startLap} - L${stint.endLap} (${duration} laps total)`}
                    >
                      <span style={{ color: textColor }}>
                        {duration >= 6 ? `${stint.compound[0]} (${duration}L)` : stint.compound[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Current Compound & Tyre Age Callout */}
              <span className="w-16 text-[10px] text-right font-mono text-slate-400 font-bold whitespace-nowrap">
                {activeStint ? `${activeStint.compound[0]} · ${tyreAge}L` : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

