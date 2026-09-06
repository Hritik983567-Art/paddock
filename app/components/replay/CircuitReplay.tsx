import React, { useEffect, useState } from 'react';
import { DriverMarker } from './DriverMarker';
import { DriverMeta } from '../../lib/replayDataService';
import { ALL_CIRCUIT_CORNERS } from '../../lib/circuitCornersData';
import {
  computeTransformBounds,
  transformTrackPath,
  transformCorners,
  TransformedCorner,
  TransformedPoint,
  FastF1Point,
  FastF1Corner
} from '../../lib/circuitTransform';

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
  const [circuitTelemetry, setCircuitTelemetry] = useState<{
    points: FastF1Point[];
    corners: FastF1Corner[];
    rotation: number;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const targetCircuit = (circuitId || 'monza').toLowerCase();

    fetch(`/api/circuits/2024/${targetCircuit}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!isMounted) return;
        if (data && data.status !== 'DATA UNAVAILABLE' && data.layout?.points) {
          setCircuitTelemetry({
            points: data.layout.points,
            corners: data.corners || [],
            rotation: data.rotation || 0
          });
        } else {
          setCircuitTelemetry(null);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setCircuitTelemetry(null);
      });

    return () => {
      isMounted = false;
    };
  }, [circuitId]);

  // Fallback to static corner collection if real telemetry is unavailable
  const fallbackCollection = ALL_CIRCUIT_CORNERS[circuitId.toLowerCase()] || ALL_CIRCUIT_CORNERS['monza'];
  const fallbackCornersList = Object.values(fallbackCollection.corners || {});
  const fallbackPoints: FastF1Point[] = fallbackCornersList.map(c => ({ x: c.x, y: c.y }));

  const rawPoints: FastF1Point[] = circuitTelemetry?.points && circuitTelemetry.points.length > 0
    ? circuitTelemetry.points
    : fallbackPoints;

  const rawCorners: FastF1Corner[] = circuitTelemetry?.corners && circuitTelemetry.corners.length > 0
    ? circuitTelemetry.corners
    : fallbackCornersList.map((c, i) => ({
        number: i + 1,
        letter: '',
        x: c.x,
        y: c.y,
        angle: 90,
        distance: i * 100,
        nearestTrackDistance: 0,
        alignmentValid: true,
        name: `Turn ${i + 1}`
      }));

  const rotationDeg = circuitTelemetry?.rotation || 0;

  // Compute unified SVG canvas transform bounds (viewBox: 0 0 800 500)
  const bounds = computeTransformBounds(rawPoints, rotationDeg, 800, 500, 45);
  const { pathD: circuitPath, transformedPoints } = transformTrackPath(rawPoints, bounds);
  const transformedCorners: TransformedCorner[] = transformCorners(rawCorners, bounds, transformedPoints);

  const startPoint: TransformedPoint | null =
    transformedPoints.length > 0 &&
    typeof transformedPoints[0]?.x === 'number' &&
    !isNaN(transformedPoints[0].x) &&
    typeof transformedPoints[0]?.y === 'number' &&
    !isNaN(transformedPoints[0].y)
      ? transformedPoints[0]
      : null;

  const nextPoint: TransformedPoint | null =
    transformedPoints.length > 1 &&
    typeof transformedPoints[1]?.x === 'number' &&
    !isNaN(transformedPoints[1].x) &&
    typeof transformedPoints[1]?.y === 'number' &&
    !isNaN(transformedPoints[1].y)
      ? transformedPoints[1]
      : null;

  let startAngle = 0;
  if (startPoint && nextPoint) {
    const calcAngle = Math.atan2(nextPoint.y - startPoint.y, nextPoint.x - startPoint.x) * (180 / Math.PI);
    startAngle = isNaN(calcAngle) ? 0 : calcAngle;
  }

  // Compute driver positions along track path
  const driverEntries = Object.entries(positions).map(([dId, pos]) => {
    const meta = driverMeta[dId];
    if (!meta) return null;

    const totalDrivers = Math.max(Object.keys(positions).length, 1);
    const progress = totalDrivers > 1 ? (pos - 1) / totalDrivers : 0;

    let targetX = 400;
    let targetY = 250;

    if (transformedPoints.length > 0) {
      const rawIdx = Math.floor(progress * transformedPoints.length);
      const idx = Math.min(Math.max(0, rawIdx), transformedPoints.length - 1);
      const pt = transformedPoints[idx];
      if (pt && typeof pt.x === 'number' && !isNaN(pt.x) && typeof pt.y === 'number' && !isNaN(pt.y)) {
        targetX = pt.x;
        targetY = pt.y;
      }
    }

    // Apply offset for side-by-side spacing
    const offsetX = Math.sin(pos * 1.5) * 10;
    const offsetY = Math.cos(pos * 1.5) * 10;

    return {
      driverId: dId,
      code: meta.code,
      name: meta.name,
      team: meta.team,
      position: pos,
      x: targetX + offsetX,
      y: targetY + offsetY,
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
          d={circuitPath || 'M 100,100 L 700,100 L 700,400 L 100,400 Z'}
          fill="none"
          stroke="#1E293B"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={circuitPath || 'M 100,100 L 700,100 L 700,400 L 100,400 Z'}
          fill="none"
          stroke="#0F172A"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={circuitPath || 'M 100,100 L 700,100 L 700,400 L 100,400 Z'}
          fill="none"
          stroke="url(#trackGlow)"
          strokeWidth="3"
          strokeDasharray="8 4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.75"
        />

        {/* Start / Finish Line Indicator */}
        {startPoint && (
          <g transform={`translate(${startPoint.x}, ${startPoint.y}) rotate(${startAngle})`}>
            <line x1="0" y1="-12" x2="0" y2="12" stroke="#FFFFFF" strokeWidth="3.5" />
            <line x1="3" y1="-12" x2="3" y2="12" stroke="#000000" strokeWidth="2" strokeDasharray="3 3" />
            <polygon points="10,0 3,-5 3,5" fill="#38BDF8" />
          </g>
        )}

        {/* Corner Label Badges */}
        {transformedCorners.map(corner => {
          const lx = Number(corner.labelX);
          const ly = Number(corner.labelY);
          if (isNaN(lx) || isNaN(ly)) return null;

          return (
            <g key={`badge-${corner.number}${corner.letter}`} transform={`translate(${lx}, ${ly})`}>
              <rect
                x="-9"
                y="-7"
                width="18"
                height="14"
                rx="3"
                fill="#090D16"
                stroke="#334155"
                strokeWidth="1"
                opacity="0.85"
              />
              <text
                x="0"
                y="3"
                fill="#94A3B8"
                fontSize="8.5"
                fontWeight="800"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {corner.number}{corner.letter}
              </text>
            </g>
          );
        })}

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

