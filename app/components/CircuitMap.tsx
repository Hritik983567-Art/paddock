'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  computeTransformBounds,
  transformTrackPath,
  transformCorners,
  enrichCornerDetails,
  TransformedCorner,
  TransformBounds,
  TransformedPoint
} from '../lib/circuitTransform';
import { CornerDetails } from './CornerDetails';
import { CornerDirectory } from './CornerDirectory';

export interface CircuitMapProps {
  circuit?: string;
  circuitId?: string;
  year?: number;
  showStats?: boolean;
  showCorners?: boolean;
  drivers?: any[];
  activeDriverCode?: string;
  onHoverDriver?: (code: string | null) => void;
  onCornerSelect?: (corner: TransformedCorner | null) => void;
  className?: string;
  [key: string]: any;
}

export function CircuitMap({
  circuit,
  circuitId,
  year = 2024,
  showStats = true,
  onCornerSelect,
  className = ''
}: CircuitMapProps) {
  const targetCircuit = (circuit || circuitId || 'monza').toLowerCase();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rawCircuitData, setRawCircuitData] = useState<any>(null);

  const [selectedCorner, setSelectedCorner] = useState<TransformedCorner | null>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setSelectedCorner(null);

    // Fetch real circuit telemetry and corner data from Next.js API
    fetch(`/api/circuits/${year}/${targetCircuit}`)
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.reason || `DATA UNAVAILABLE: No FastF1 telemetry for circuit "${targetCircuit}" in year ${year}.`);
          });
        }
        return res.json();
      })
      .then(data => {
        if (!isMounted) return;
        if (data.status === 'DATA UNAVAILABLE') {
          setError(data.reason || 'DATA UNAVAILABLE');
          setRawCircuitData(null);
        } else {
          setRawCircuitData(data);
          setError(null);
        }
        setLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load circuit telemetry data.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [targetCircuit, year]);

  const handleCornerClick = (corner: TransformedCorner) => {
    setSelectedCorner(corner);
    if (onCornerSelect) {
      onCornerSelect(corner);
    }
  };

  // Drag Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setSelectedCorner(null);
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[450px] bg-slate-950/80 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-md ${className}`}>
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
        </div>
        <p className="text-cyan-400 font-mono text-sm tracking-wider uppercase animate-pulse">
          Loading FastF1 Circuit Telemetry & Corner Details...
        </p>
        <p className="text-slate-400 font-mono text-xs mt-1">Circuit: {targetCircuit.toUpperCase()} ({year})</p>
      </div>
    );
  }

  if (error || !rawCircuitData || !rawCircuitData.layout || !rawCircuitData.layout.points) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[450px] bg-slate-950 border border-red-900/40 rounded-2xl p-8 text-center ${className}`}>
        <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 text-xl">
          ⚠️
        </div>
        <h3 className="text-red-400 font-bold text-lg font-mono tracking-wide">DATA UNAVAILABLE</h3>
        <p className="text-slate-300 font-mono text-xs max-w-md mt-2 leading-relaxed">
          {error || `No valid FastF1 telemetry or corner coordinates available for circuit "${targetCircuit.toUpperCase()}" (${year}).`}
        </p>
        <div className="mt-6 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 font-mono text-xs">
          Source Strategy: Race → Qualifying → FP3 → FP2 → FP1
        </div>
      </div>
    );
  }

  const { circuit: circuitMeta, layout, corners: rawCorners, rotation = 0, sourceSession, telemetryDriver } = rawCircuitData;

  // Single unified transform computation
  const bounds: TransformBounds = computeTransformBounds(layout.points, rotation, 1000, 700, 60);
  const { pathD, transformedPoints } = transformTrackPath(layout.points, bounds);
  const transformedCorners: TransformedCorner[] = transformCorners(rawCorners || [], bounds, transformedPoints).filter(
    c =>
      c &&
      typeof c.anchorX === 'number' &&
      !isNaN(c.anchorX) &&
      typeof c.anchorY === 'number' &&
      !isNaN(c.anchorY) &&
      typeof c.labelX === 'number' &&
      !isNaN(c.labelX) &&
      typeof c.labelY === 'number' &&
      !isNaN(c.labelY)
  );

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

  // Build enriched corner dictionary for CornerDirectory and CornerDetails components
  const cornersDict: Record<string, any> = {};
  const circuitDisplayName = circuitMeta?.name || targetCircuit.replace(/_/g, ' ').toUpperCase();
  transformedCorners.forEach(c => {
    const key = `t${c.number}${c.letter || ''}`.toLowerCase();
    cornersDict[key] = enrichCornerDetails(c, targetCircuit, circuitDisplayName);
  });

  const selectedKey = selectedCorner ? `t${selectedCorner.number}${selectedCorner.letter || ''}`.toLowerCase() : '';

  // Format corner object for full CornerDetails component
  const detailedCornerObj = selectedCorner ? cornersDict[selectedKey] : null;

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="relative bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header Info Panel */}
        {showStats && (
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl backdrop-blur-md shadow-lg pointer-events-auto">
              <span className="text-2xl">🏁</span>
              <div>
                <h2 className="text-white font-black tracking-wide text-base uppercase leading-tight font-sans">
                  {circuitMeta.name || targetCircuit}
                </h2>
                <p className="text-cyan-400 font-mono text-[11px] font-medium">
                  {circuitMeta.country} • {circuitMeta.year} • FastF1 {sourceSession ? `${sourceSession} (${telemetryDriver || 'TELEMETRY'})` : 'DATA'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-900/80 border border-slate-800/80 px-3 py-1.5 rounded-lg backdrop-blur-md">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Centerline Points: <strong className="text-white">{layout.pointCount}</strong></span>
              <span>•</span>
              <span>Corners: <strong className="text-white">{transformedCorners.length}</strong></span>
              <span>•</span>
              <span>Rotation: <strong className="text-white">{rotation}°</strong></span>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={() => setZoom(prev => Math.min(prev + 0.25, 3.0))}
            className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-mono font-bold flex items-center justify-center transition backdrop-blur-md shadow-md"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.6))}
            className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-mono font-bold flex items-center justify-center transition backdrop-blur-md shadow-md"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={resetView}
            className="px-2.5 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center transition backdrop-blur-md shadow-md"
            title="Reset View"
          >
            ↺ Reset
          </button>
        </div>

        {/* SVG Canvas Area */}
        <div
          className="w-full h-[520px] cursor-grab active:cursor-grabbing select-none overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            ref={svgRef}
            viewBox="0 0 1000 700"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#00D2BE" floodOpacity="0.4" />
              </filter>
              <filter id="cornerGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#FF1E27" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Transform Group for Pan and Zoom */}
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} style={{ transformOrigin: '500px 350px' }}>
              {/* LAYER 1: Background Glow Path */}
              <path
                d={pathD}
                fill="none"
                stroke="#00D2BE"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.12"
                filter="url(#glow)"
              />

              {/* LAYER 2: Primary Track Centerline */}
              <path
                d={pathD}
                fill="none"
                stroke="#00D2BE"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* LAYER 3: Start/Finish Line & Orientation Indicator */}
              {startPoint && !isNaN(Number(startPoint.x)) && !isNaN(Number(startPoint.y)) && (
                <g transform={`translate(${startPoint.x}, ${startPoint.y}) rotate(${isNaN(Number(startAngle)) ? 0 : startAngle})`}>
                  <line x1="0" y1="-14" x2="0" y2="14" stroke="#FFFFFF" strokeWidth="4" />
                  <line x1="4" y1="-14" x2="4" y2="14" stroke="#000000" strokeWidth="2" strokeDasharray="3 3" />
                  <polygon points="12,0 4,-6 4,6" fill="#00FF66" />
                </g>
              )}

              {/* LAYER 4: Corner Leader Lines */}
              {transformedCorners.map(corner => {
                const x1 = Number(corner.anchorX);
                const y1 = Number(corner.anchorY);
                const x2 = Number(corner.labelX);
                const y2 = Number(corner.labelY);

                if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) return null;

                return (
                  <line
                    key={`leader-${corner.number}${corner.letter}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={corner.alignmentValid ? '#FF1E27' : '#EAB308'}
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    opacity="0.7"
                  />
                );
              })}

              {/* LAYER 5: Corner Anchor Points on the Track */}
              {transformedCorners.map(corner => {
                const cx = Number(corner.anchorX);
                const cy = Number(corner.anchorY);

                if (isNaN(cx) || isNaN(cy)) return null;

                const isSelected = selectedCorner?.number === corner.number && selectedCorner?.letter === corner.letter;
                return (
                  <g key={`anchor-${corner.number}${corner.letter}`}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? '7' : '4.5'}
                      fill={corner.alignmentValid ? '#FF1E27' : '#EAB308'}
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r="2"
                      fill="#FFFFFF"
                    />
                  </g>
                );
              })}

              {/* LAYER 6: Corner Label Badges */}
              {transformedCorners.map(corner => {
                const lx = Number(corner.labelX);
                const ly = Number(corner.labelY);

                if (isNaN(lx) || isNaN(ly)) return null;

                const isSelected = selectedCorner?.number === corner.number && selectedCorner?.letter === corner.letter;
                const labelText = `${corner.number}${corner.letter}`;

                return (
                  <g
                    key={`badge-${corner.number}${corner.letter}`}
                    transform={`translate(${lx}, ${ly})`}
                    className="cursor-pointer transition-transform duration-150"
                    onClick={() => handleCornerClick(corner)}
                  >
                    {/* Badge Background Rect */}
                    <rect
                      x="-14"
                      y="-11"
                      width="28"
                      height="22"
                      rx="5"
                      fill={isSelected ? '#FF1E27' : '#090D16'}
                      stroke={isSelected ? '#FFFFFF' : corner.alignmentValid ? '#FF1E27' : '#EAB308'}
                      strokeWidth={isSelected ? '2' : '1.5'}
                      filter={isSelected ? 'url(#cornerGlow)' : undefined}
                    />

                    {/* Corner Number Text */}
                    <text
                      x="0"
                      y="4"
                      fill="#FFFFFF"
                      fontSize="11"
                      fontWeight="800"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {labelText}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* Interactive Corner Directory Navigation Bar */}
      {transformedCorners.length > 0 && (
        <CornerDirectory
          corners={cornersDict}
          selectedCornerId={selectedKey}
          onSelectCorner={(cornerId) => {
            const match = transformedCorners.find(c => `t${c.number}${c.letter || ''}`.toLowerCase() === cornerId.toLowerCase());
            if (match) {
              handleCornerClick(match);
            }
          }}
        />
      )}

      {/* Full Detailed Corner Breakdown Panel */}
      {detailedCornerObj && (
        <CornerDetails
          corner={detailedCornerObj}
          circuitName={circuitMeta.name || targetCircuit}
        />
      )}
    </div>
  );
}

export default CircuitMap;
