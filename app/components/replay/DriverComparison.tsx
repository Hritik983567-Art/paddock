import React from 'react';
import { DriverMeta, PitStopItem, TyreStint } from '../../lib/replayDataService';
import { getTeamColor } from '../../utils/api';

interface DriverComparisonProps {
  driverIds: string[];
  driverMeta: Record<string, DriverMeta>;
  driverAId: string | null;
  driverBId: string | null;
  onSelectDriverA: (id: string) => void;
  onSelectDriverB: (id: string) => void;
  currentLap: number;
  positions: Record<string, number>;
  lapTimes: Record<string, number>;
  gaps: Record<string, string>;
  pitStops: PitStopItem[];
  tyreStints: Record<string, TyreStint[]>;
  showTraces: boolean;
  onToggleTraces: () => void;
}

export const DriverComparison: React.FC<DriverComparisonProps> = ({
  driverIds,
  driverMeta,
  driverAId,
  driverBId,
  onSelectDriverA,
  onSelectDriverB,
  currentLap,
  positions,
  lapTimes,
  gaps,
  pitStops,
  tyreStints,
  showTraces,
  onToggleTraces
}) => {
  const metaA = driverAId ? driverMeta[driverAId] : null;
  const metaB = driverBId ? driverMeta[driverBId] : null;

  const posA = driverAId ? positions[driverAId] : null;
  const posB = driverBId ? positions[driverBId] : null;

  const timeA = driverAId ? lapTimes[driverAId] : null;
  const timeB = driverBId ? lapTimes[driverBId] : null;

  const gapA = driverAId ? gaps[driverAId] : 'N/A';
  const gapB = driverBId ? gaps[driverBId] : 'N/A';

  const stopsA = driverAId ? pitStops.filter(p => p.driverId === driverAId) : [];
  const stopsB = driverBId ? pitStops.filter(p => p.driverId === driverBId) : [];

  const stintA = driverAId ? (tyreStints[driverAId] || []).find(s => currentLap >= s.startLap && currentLap <= s.endLap) : null;
  const stintB = driverBId ? (tyreStints[driverBId] || []).find(s => currentLap >= s.startLap && currentLap <= s.endLap) : null;

  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="border-2 border-slate-700/80 rounded-xl p-4 shadow-2xl mb-4 font-mono relative z-10"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-base">⚔️</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">
            DRIVER HEAD-TO-HEAD COMPARISON
          </h3>
        </div>

        <button
          onClick={onToggleTraces}
          className={`px-3 py-1 text-xs font-bold rounded border transition-colors ${
            showTraces
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black'
              : 'bg-[#0D121F] text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          {showTraces ? 'TRACE ON 🟢' : 'TRACE OFF ⚪'}
        </button>
      </div>

      {/* Driver Selection Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Driver A Dropdown */}
        <div className="p-3 bg-[#0D121F] border border-cyan-500/40 rounded-lg">
          <label className="text-[10px] font-bold text-cyan-400 uppercase block mb-1">
            DRIVER A (PRIMARY)
          </label>
          <select
            value={driverAId || ''}
            onChange={(e) => onSelectDriverA(e.target.value)}
            className="w-full bg-[#050810] border border-slate-700 text-white font-bold text-xs p-2 rounded focus:outline-none focus:border-cyan-500"
          >
            <option value="">Select Driver A...</option>
            {driverIds.map(id => (
              <option key={`a-${id}`} value={id}>
                P{positions[id] || '-'} &bull; {driverMeta[id]?.code} — {driverMeta[id]?.name}
              </option>
            ))}
          </select>
        </div>

        {/* Driver B Dropdown */}
        <div className="p-3 bg-[#0D121F] border border-amber-500/40 rounded-lg">
          <label className="text-[10px] font-bold text-amber-400 uppercase block mb-1">
            DRIVER B (COMPARISON)
          </label>
          <select
            value={driverBId || ''}
            onChange={(e) => onSelectDriverB(e.target.value)}
            className="w-full bg-[#050810] border border-slate-700 text-white font-bold text-xs p-2 rounded focus:outline-none focus:border-amber-500"
          >
            <option value="">Select Driver B...</option>
            {driverIds.map(id => (
              <option key={`b-${id}`} value={id}>
                P{positions[id] || '-'} &bull; {driverMeta[id]?.code} — {driverMeta[id]?.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparative Metrics Table */}
      {metaA && metaB ? (
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-3 p-2 bg-[#0D121F] rounded font-bold border border-slate-800 text-center">
            <span className="text-cyan-400 text-left">{metaA.code} ({metaA.name.split(' ')[1]})</span>
            <span className="text-slate-400 uppercase">METRIC</span>
            <span className="text-amber-400 text-right">{metaB.code} ({metaB.name.split(' ')[1]})</span>
          </div>

          <div className="grid grid-cols-3 p-2 bg-[#050810] rounded border border-slate-800 text-center items-center">
            <span className="font-black text-white text-left">P{posA || 'N/A'}</span>
            <span className="text-slate-400 text-[11px]">RACE POSITION</span>
            <span className="font-black text-white text-right">P{posB || 'N/A'}</span>
          </div>

          <div className="grid grid-cols-3 p-2 bg-[#050810] rounded border border-slate-800 text-center items-center">
            <span className="font-mono text-cyan-300 text-left">{timeA ? `${timeA.toFixed(3)}s` : 'N/A'}</span>
            <span className="text-slate-400 text-[11px]">LAP TIME (L{currentLap})</span>
            <span className="font-mono text-amber-300 text-right">{timeB ? `${timeB.toFixed(3)}s` : 'N/A'}</span>
          </div>

          <div className="grid grid-cols-3 p-2 bg-[#050810] rounded border border-slate-800 text-center items-center">
            <span className="text-slate-200 text-left">{gapA}</span>
            <span className="text-slate-400 text-[11px]">GAP TO LEADER</span>
            <span className="text-slate-200 text-right">{gapB}</span>
          </div>

          <div className="grid grid-cols-3 p-2 bg-[#050810] rounded border border-slate-800 text-center items-center">
            <span className="text-emerald-400 font-bold text-left">{stopsA.length} Stops ({stopsA[0]?.duration || 'N/A'})</span>
            <span className="text-slate-400 text-[11px]">PIT STOPS</span>
            <span className="text-emerald-400 font-bold text-right">{stopsB.length} Stops ({stopsB[0]?.duration || 'N/A'})</span>
          </div>

          <div className="grid grid-cols-3 p-2 bg-[#050810] rounded border border-slate-800 text-center items-center">
            <span className="text-cyan-400 font-bold text-left">{stintA?.compound || 'MEDIUM'} (L{currentLap - (stintA?.startLap || 1)} old)</span>
            <span className="text-slate-400 text-[11px]">TYRE COMPOUND</span>
            <span className="text-amber-400 font-bold text-right">{stintB?.compound || 'HARD'} (L{currentLap - (stintB?.startLap || 1)} old)</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-slate-500 text-xs">
          Select Driver A and Driver B above to enable real-time head-to-head comparison telemetry.
        </div>
      )}
    </div>
  );
};
