import React, { useState } from 'react';
import { TeammateComparisonData } from '../../lib/teammateDataService';

interface CircuitPerformanceProps {
  data: TeammateComparisonData;
}

export const CircuitPerformance: React.FC<CircuitPerformanceProps> = ({ data }) => {
  const { rounds, driverA, driverB } = data;
  const [selectedRoundNum, setSelectedRoundNum] = useState<number>(rounds[0]?.round || 1);

  const selectedRound = rounds.find(r => r.round === selectedRoundNum) || rounds[0];

  if (!rounds || rounds.length === 0) return null;

  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="p-6 border-2 border-slate-700/80 rounded-xl mb-4 shadow-2xl relative z-10 font-mono"
    >
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏎️</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider font-display">
            CIRCUIT-BY-CIRCUIT HEAD-TO-HEAD PERFORMANCE
          </h3>
        </div>
        <span className="text-[10px] font-bold text-cyan-400">
          TRACK ANALYSIS
        </span>
      </div>

      {/* Circuit Selector Dropdown */}
      <div className="mb-4">
        <label className="text-[10px] font-bold text-cyan-400 block uppercase mb-1">SELECT CIRCUIT / GRAND PRIX</label>
        <select
          value={selectedRoundNum}
          onChange={(e) => setSelectedRoundNum(parseInt(e.target.value))}
          className="w-full bg-[#0D121F] border border-slate-700 text-white font-bold text-xs p-2 rounded focus:outline-none focus:border-cyan-500"
        >
          {rounds.map(r => (
            <option key={`circ-${r.round}`} value={r.round}>
              R{r.round} &bull; {r.raceName} ({r.circuitName})
            </option>
          ))}
        </select>
      </div>

      {/* Circuit H2H Comparison Card */}
      {selectedRound && (
        <div className="p-4 bg-[#050810] border border-slate-800 rounded-xl">
          <div className="text-center pb-3 mb-3 border-b border-slate-800">
            <h4 className="text-sm font-black text-white uppercase font-display">
              {selectedRound.raceName}
            </h4>
            <span className="text-[10px] text-slate-400 font-bold">{selectedRound.circuitName} &bull; {selectedRound.date}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-bold">
            {/* DRIVER A METRICS */}
            <div className="p-3 bg-[#0D121F] rounded-lg border border-cyan-500/50">
              <span className="text-cyan-400 block text-center font-black text-sm mb-2">{driverA.name}</span>
              <div className="space-y-1 text-slate-300">
                <p className="flex justify-between"><span>QUALIFYING:</span> <span className="text-white font-black">{selectedRound.qualiStrA}</span></p>
                <p className="flex justify-between"><span>RACE FINISH:</span> <span className="text-white font-black">{selectedRound.raceA ? `P${selectedRound.raceA}` : selectedRound.statusA}</span></p>
                <p className="flex justify-between"><span>POINTS SCORED:</span> <span className="text-emerald-400 font-black">{selectedRound.pointsA} pts</span></p>
                <p className="flex justify-between"><span>FASTEST LAP:</span> <span className="text-cyan-300 font-black">{selectedRound.fastestLapA ? 'YES ⚡' : 'NO'}</span></p>
              </div>
            </div>

            {/* DRIVER B METRICS */}
            <div className="p-3 bg-[#0D121F] rounded-lg border border-amber-500/50">
              <span className="text-amber-400 block text-center font-black text-sm mb-2">{driverB.name}</span>
              <div className="space-y-1 text-slate-300">
                <p className="flex justify-between"><span>QUALIFYING:</span> <span className="text-white font-black">{selectedRound.qualiStrB}</span></p>
                <p className="flex justify-between"><span>RACE FINISH:</span> <span className="text-white font-black">{selectedRound.raceB ? `P${selectedRound.raceB}` : selectedRound.statusB}</span></p>
                <p className="flex justify-between"><span>POINTS SCORED:</span> <span className="text-emerald-400 font-black">{selectedRound.pointsB} pts</span></p>
                <p className="flex justify-between"><span>FASTEST LAP:</span> <span className="text-amber-300 font-black">{selectedRound.fastestLapB ? 'YES ⚡' : 'NO'}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
