import React, { useState } from 'react';
import { TeammateComparisonData } from '../../lib/teammateDataService';

interface PointsProgressionChartProps {
  data: TeammateComparisonData;
}

export const PointsProgressionChart: React.FC<PointsProgressionChartProps> = ({ data }) => {
  const { rounds, driverA, driverB } = data;
  const [hoveredRoundIndex, setHoveredRoundIndex] = useState<number | null>(null);

  if (!rounds || rounds.length === 0) return null;

  const w = 700;
  const h = 280;
  const padL = 40;
  const padR = 24;
  const padT = 20;
  const padB = 30;

  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const totalRounds = rounds.length;

  const maxPoints = Math.max(
    ...rounds.map(r => Math.max(r.cumPointsA, r.cumPointsB)),
    25
  );

  const xFor = (idx: number) => padL + (totalRounds <= 1 ? 0 : (idx / (totalRounds - 1)) * plotW);
  const yFor = (pts: number) => padT + plotH - (pts / maxPoints) * plotH;

  const ptsA = rounds.map((r, idx) => ({ x: xFor(idx), y: yFor(r.cumPointsA), round: r, pts: r.cumPointsA, pos: r.raceA }));
  const ptsB = rounds.map((r, idx) => ({ x: xFor(idx), y: yFor(r.cumPointsB), round: r, pts: r.cumPointsB, pos: r.raceB }));

  const pathA = ptsA.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const pathB = ptsB.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const hoveredRound = hoveredRoundIndex !== null ? rounds[hoveredRoundIndex] : null;

  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="p-6 border-2 border-slate-700/80 rounded-xl mb-4 shadow-2xl relative z-10 font-mono"
    >
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">📈</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider font-display">
            CHAMPIONSHIP POINTS PROGRESSION CHART
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs font-black">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-3 h-1 bg-cyan-400 rounded"></span> {driverA.code}
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-3 h-1 bg-amber-400 rounded"></span> {driverB.code}
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        {/* Y Gridlines */}
        {[0, Math.round(maxPoints * 0.33), Math.round(maxPoints * 0.66), Math.round(maxPoints)].map((ptsVal) => {
          const y = yFor(ptsVal);
          return (
            <g key={`ygrid-${ptsVal}`}>
              <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
              <text x={padL - 6} y={y + 3} fontSize="9" fill="#64748B" fontFamily="var(--font-mono)" textAnchor="end">
                {ptsVal}
              </text>
            </g>
          );
        })}

        {/* Driver A Points Line */}
        <path d={pathA} fill="none" stroke="#38BDF8" strokeWidth="3" />
        {ptsA.map((p, idx) => (
          <circle
            key={`pa-${idx}`}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#38BDF8"
            className="cursor-pointer hover:r-6 transition-all"
            onMouseEnter={() => setHoveredRoundIndex(idx)}
          />
        ))}

        {/* Driver B Points Line */}
        <path d={pathB} fill="none" stroke="#F59E0B" strokeWidth="3" />
        {ptsB.map((p, idx) => (
          <circle
            key={`pb-${idx}`}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#F59E0B"
            className="cursor-pointer hover:r-6 transition-all"
            onMouseEnter={() => setHoveredRoundIndex(idx)}
          />
        ))}

        {/* Round Labels */}
        <text x={padL} y={h - 6} fontSize="9" fill="#64748B" fontFamily="var(--font-mono)">R1</text>
        <text x={w - padR} y={h - 6} fontSize="9" fill="#64748B" fontFamily="var(--font-mono)" textAnchor="end">R{totalRounds}</text>
      </svg>

      {/* Hover Tooltip Card */}
      {hoveredRound && (
        <div className="mt-3 p-3 bg-[#0D121F] border border-cyan-500/50 rounded-lg text-xs flex flex-wrap items-center justify-between gap-2 shadow-lg">
          <div>
            <span className="font-black text-white">R{hoveredRound.round}: {hoveredRound.raceName}</span>
            <span className="text-slate-400 text-[10px] block">DATE: {hoveredRound.date}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-bold text-cyan-300">
              {driverA.code}: {hoveredRound.cumPointsA} pts ({hoveredRound.raceA ? `P${hoveredRound.raceA}` : 'DNF'})
            </span>
            <span className="font-bold text-amber-300">
              {driverB.code}: {hoveredRound.cumPointsB} pts ({hoveredRound.raceB ? `P${hoveredRound.raceB}` : 'DNF'})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
