import React from 'react';
import { DriverMeta, LapLapData } from '../../lib/replayDataService';
import { getTeamColor } from '../../utils/api';

interface PositionChartProps {
  laps: LapLapData[];
  driverMeta: Record<string, DriverMeta>;
  currentLap: number;
  selectedDriverId: string | null;
  hoveredDriverId: string | null;
  onHoverDriver: (id: string | null) => void;
  onSelectDriver: (id: string) => void;
}

export const PositionChart: React.FC<PositionChartProps> = ({
  laps,
  driverMeta,
  currentLap,
  selectedDriverId,
  hoveredDriverId,
  onHoverDriver,
  onSelectDriver
}) => {
  if (!laps || laps.length === 0) return null;

  const w = 700;
  const h = 300;
  const padL = 36;
  const padR = 24;
  const padT = 16;
  const padB = 26;

  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const totalLaps = laps.length;
  const maxPos = 20;

  const xFor = (lapIdx: number) => padL + (totalLaps <= 1 ? 0 : (lapIdx / (totalLaps - 1)) * plotW);
  const yFor = (pos: number) => padT + ((pos - 1) / (maxPos - 1)) * plotH;

  // Gridlines P1 to P20
  const gridLines = [];
  for (let p = 1; p <= maxPos; p += 3) {
    const y = yFor(p);
    gridLines.push(
      <g key={`grid-${p}`}>
        <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#1E293B" strokeWidth="1" />
        <text x={padL - 8} y={y + 3} fontSize="9" fill="#64748B" fontFamily="var(--font-mono)" textAnchor="end">
          P{p}
        </text>
      </g>
    );
  }

  // Driver Position Lines
  const driverIds = Object.keys(driverMeta);
  const activeLapIdx = Math.min(Math.max(0, currentLap - 1), totalLaps - 1);

  const lines = driverIds.map((dId) => {
    const meta = driverMeta[dId];
    const color = getTeamColor(meta?.team || '');
    const pts = [];

    for (let i = 0; i <= activeLapIdx; i++) {
      const lapData = laps[i];
      if (lapData && lapData.positions[dId] !== undefined) {
        const pos = lapData.positions[dId];
        pts.push({ x: xFor(i), y: yFor(pos), pos });
      }
    }

    if (pts.length === 0) return null;

    const pointsString = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const lastPoint = pts[pts.length - 1];

    const isSelected = selectedDriverId === dId;
    const isHovered = hoveredDriverId === dId;
    const isAnyActive = selectedDriverId !== null || hoveredDriverId !== null;
    const isFocused = isSelected || isHovered;

    const opacity = isAnyActive ? (isFocused ? 1.0 : 0.15) : 0.85;
    const strokeWidth = isFocused ? 4 : 2;

    return (
      <g
        key={`chart-line-${dId}`}
        className="cursor-pointer transition-all duration-200"
        onMouseEnter={() => onHoverDriver(dId)}
        onMouseLeave={() => onHoverDriver(null)}
        onClick={() => onSelectDriver(dId)}
      >
        <polyline points={pointsString} fill="none" stroke={color} strokeWidth={strokeWidth} opacity={opacity} />
        <circle cx={lastPoint.x} cy={lastPoint.y} r={isFocused ? 5.5 : 3.5} fill={color} opacity={opacity} />
        <text
          x={lastPoint.x + 6}
          y={lastPoint.y + 3}
          fontSize={isFocused ? 11 : 9}
          fill={color}
          fontFamily="var(--font-mono)"
          fontWeight="bold"
          opacity={opacity}
        >
          {meta?.code || dId.slice(0, 3).toUpperCase()}
        </text>
      </g>
    );
  });

  return (
    <div 
      style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
      className="border-2 border-slate-700/80 rounded-xl p-4 shadow-2xl mb-4 font-mono relative z-10"
    >
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-base">📈</span>
          <h3 className="text-xs font-black text-white uppercase tracking-wider">
            LAP-BY-LAP POSITION HISTORY CHART
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">HOVER OR CLICK DRIVER TO HIGHLIGHT TRACE</span>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        {gridLines}
        {lines}
        <text x={padL} y={h - 6} fontSize="9" fill="#64748B" fontFamily="var(--font-mono)">Lap 1</text>
        <text x={w - padR} y={h - 6} fontSize="9" fill="#64748B" fontFamily="var(--font-mono)" textAnchor="end">Lap {totalLaps}</text>
      </svg>
    </div>
  );
};
