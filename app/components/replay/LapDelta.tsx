import React, { useState } from 'react';
import { DriverMeta, LapLapData } from '../../lib/replayDataService';

interface LapDeltaProps {
  driverId: string | null;
  driverMeta: Record<string, DriverMeta>;
  laps: LapLapData[];
  totalLaps: number;
}

export const LapDelta: React.FC<LapDeltaProps> = ({
  driverId,
  driverMeta,
  laps,
  totalLaps
}) => {
  const [lapA, setLapA] = useState(1);
  const [lapB, setLapB] = useState(2);

  const meta = driverId ? driverMeta[driverId] : null;

  const dataA = laps.find(l => l.lapNumber === lapA);
  const dataB = laps.find(l => l.lapNumber === lapB);

  const timeA = driverId && dataA ? dataA.lapTimes[driverId] : null;
  const timeB = driverId && dataB ? dataB.lapTimes[driverId] : null;

  const delta = (timeA !== null && timeB !== null && timeA > 0 && timeB > 0) ? timeB - timeA : null;

  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="border-2 border-slate-700/80 rounded-xl p-4 shadow-2xl mb-4 font-mono relative z-10"
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-base">⏱️</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">
            LAP TIME DELTA COMPARISON
          </h3>
        </div>
        <span className="text-[10px] font-bold text-cyan-400">
          {meta ? `DRIVER: ${meta.code}` : 'SELECT A DRIVER'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">COMPARE LAP A</label>
          <select
            value={lapA}
            onChange={(e) => setLapA(parseInt(e.target.value))}
            className="w-full bg-[#0D121F] border border-slate-700 text-white font-bold text-xs p-2 rounded"
          >
            {laps.map(l => (
              <option key={`a-${l.lapNumber}`} value={l.lapNumber}>
                Lap {l.lapNumber} {driverId && l.lapTimes[driverId] ? `(${l.lapTimes[driverId].toFixed(3)}s)` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">COMPARE LAP B</label>
          <select
            value={lapB}
            onChange={(e) => setLapB(parseInt(e.target.value))}
            className="w-full bg-[#0D121F] border border-slate-700 text-white font-bold text-xs p-2 rounded"
          >
            {laps.map(l => (
              <option key={`b-${l.lapNumber}`} value={l.lapNumber}>
                Lap {l.lapNumber} {driverId && l.lapTimes[driverId] ? `(${l.lapTimes[driverId].toFixed(3)}s)` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Delta Result Readout */}
      <div className="p-4 bg-[#050810] border border-slate-800 rounded-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 block uppercase">LAP {lapA} TIME</span>
          <span className="text-base font-black text-cyan-400">{timeA ? `${timeA.toFixed(3)}s` : 'N/A'}</span>
        </div>

        <div className="text-center px-4 py-1.5 bg-[#0D121F] border border-slate-700 rounded">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">DELTA (LAP B - LAP A)</span>
          {delta !== null ? (
            <span className={`text-lg font-black ${delta <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {delta <= 0 ? `${delta.toFixed(3)}s 🚀` : `+${delta.toFixed(3)}s ⚠️`}
            </span>
          ) : (
            <span className="text-slate-500 text-xs font-bold">N/A</span>
          )}
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">LAP {lapB} TIME</span>
          <span className="text-base font-black text-amber-400">{timeB ? `${timeB.toFixed(3)}s` : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};
