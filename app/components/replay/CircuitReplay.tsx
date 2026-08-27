import React from 'react';
import { DriverMarker } from './DriverMarker';
import { DriverMeta } from '../../lib/replayDataService';
import { ALL_CIRCUIT_CORNERS } from '../../lib/circuitCornersData';

interface CircuitReplayProps {
  circuitId: string;
  circuitName: string;
  currentLap: number;
  totalLaps: number;
  positions: Record<string, number>;
  lapTimes: Record<string, number>;
  gaps: Record<string, string>;
  driverMeta: Record<string, DriverMeta>;
  selectedDriverId: string | null;
  driverAId: string | null;
  driverBId: string | null;
  showTraces: boolean;
  hoveredDriverId: string | null;
  onSelectDriver: (id: string) => void;
  onHoverDriver: (id: string | null) => void;
  isMiniMap: boolean;
  onToggleMiniMap: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const CircuitReplay: React.FC<CircuitReplayProps> = ({
  circuitId,
  circuitName,
  currentLap,
  totalLaps,
  positions,
  lapTimes,
  gaps,
  driverMeta,
  selectedDriverId,
  driverAId,
  driverBId,
  showTraces,
  hoveredDriverId,
  onSelectDriver,
  onHoverDriver,
  isMiniMap,
  onToggleMiniMap,
  isFullscreen,
  onToggleFullscreen
}) => {
  // Retrieve corner points for circuit layout SVG
  const cornerCollection = ALL_CIRCUIT_CORNERS[circuitId] || ALL_CIRCUIT_CORNERS['monza'];
  const cornerList = Object.values(cornerCollection.corners || {});

  // Generate SVG path for circuit layout
  const points = cornerList.map(c => `${c.x},${c.y}`).join(' L ');
  const circuitPath = points ? `M ${points} Z` : 'M 100,100 L 700,100 L 700,400 L 100,400 Z';

  // Compute driver positions along track path
  const driverEntries = Object.entries(positions).map(([dId, pos]) => {
    const meta = driverMeta[dId];
    if (!meta) return null;

    const totalDrivers = Math.max(Object.keys(positions).length, 1);
    const progress = (pos - 1) / totalDrivers; // Spread drivers along circuit
    const cornerIndex = Math.floor(progress * (cornerList.length || 1));
    const targetCorner = cornerList[cornerIndex] || { x: 400, y: 250 };

    // Apply offset for side-by-side spacing
    const offsetX = Math.sin(pos * 1.5) * 12;
    const offsetY = Math.cos(pos * 1.5) * 12;

    return {
      driverId: dId,
      code: meta.code,
      name: meta.name,
      team: meta.team,
      position: pos,
      x: targetCorner.x + offsetX,
      y: targetCorner.y + offsetY,
      gap: gaps[dId],
      lapTime: lapTimes[dId]
    };
  }).filter(Boolean);

  return (
    <div
      className={`relative bg-[#080C14] border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none border-none p-4'
          : isMiniMap
          ? 'h-[240px]'
          : 'h-[460px]'
      }`}
    >
      {/* Top Overlay Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-[#0D121F]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <span className="font-mono text-xs font-black text-white uppercase tracking-wider">
            {circuitName}
          </span>
          <span className="text-slate-500 font-mono">|</span>
          <span className="font-mono text-xs font-bold text-cyan-400">
            LAP {currentLap} / {totalLaps}
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onToggleMiniMap}
            className="px-2.5 py-1 bg-[#0D121F]/90 hover:bg-slate-800 border border-slate-700 rounded text-[11px] font-mono font-bold text-slate-300 transition-colors"
          >
            {isMiniMap ? 'FULL MAP 🗖' : 'MINI MAP 🗗'}
          </button>
          <button
            onClick={onToggleFullscreen}
            className="px-2.5 py-1 bg-[#0D121F]/90 hover:bg-slate-800 border border-slate-700 rounded text-[11px] font-mono font-bold text-cyan-400 transition-colors"
          >
            {isFullscreen ? 'EXIT FULLSCREEN ❌' : 'FULLSCREEN ⛶'}
          </button>
        </div>
      </div>

      {/* Primary SVG Track Canvas */}
      <svg
        viewBox="0 0 800 500"
        className="w-full h-full object-contain p-6"
      >
        <defs>
          <linearGradient id="trackGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#34D399" stopOpacity="0.8" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Track Outer Glow & Asphalt Line */}
        <path
          d={circuitPath}
          fill="none"
          stroke="#1E293B"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={circuitPath}
          fill="none"
          stroke="#0F172A"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={circuitPath}
          fill="none"
          stroke="url(#trackGlow)"
          strokeWidth="3"
          strokeDasharray="8 4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.75"
        />

        {/* DRS Sector Lines */}
        <circle cx={cornerList[0]?.x || 400} cy={cornerList[0]?.y || 250} r="6" fill="#38BDF8" />
        <text x={(cornerList[0]?.x || 400) + 10} y={(cornerList[0]?.y || 250) + 4} fontSize="9" fontWeight="900" fill="#38BDF8" fontFamily="var(--font-mono)">
          START / FINISH 🏁
        </text>

        {/* Trace Lines for Selected / Comparative Drivers */}
        {showTraces && driverEntries.map(d => {
          if (!d) return null;
          const isTarget = d.driverId === selectedDriverId || d.driverId === driverAId || d.driverId === driverBId;
          if (!isTarget) return null;
          const color = d.driverId === driverAId ? '#38BDF8' : d.driverId === driverBId ? '#F59E0B' : '#34D399';
          return (
            <path
              key={`trace-${d.driverId}`}
              d={circuitPath}
              fill="none"
              stroke={color}
              strokeWidth="4"
              opacity="0.8"
              filter="url(#glow)"
            />
          );
        })}

        {/* Driver Position Markers */}
        {driverEntries.map(d => {
          if (!d) return null;
          return (
            <DriverMarker
              key={d.driverId}
              driverId={d.driverId}
              code={d.code}
              name={d.name}
              team={d.team}
              position={d.position}
              x={d.x}
              y={d.y}
              isSelected={selectedDriverId === d.driverId}
              isHovered={hoveredDriverId === d.driverId}
              isDriverA={driverAId === d.driverId}
              isDriverB={driverBId === d.driverId}
              gap={d.gap}
              lapTime={d.lapTime}
              onSelect={onSelectDriver}
              onHover={onHoverDriver}
            />
          );
        })}
      </svg>
    </div>
  );
};
