import React, { useEffect, useState, useRef } from 'react';
import { DriverMarker } from './DriverMarker';
import { DriverMeta } from '../../lib/replayDataService';
import { ALL_CIRCUIT_CORNERS } from '../../lib/circuitCornersData';
import { TRACKS_REGISTRY, getTrackDefinition } from '../../lib/tracksRegistry';
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
  prevPositions?: Record<string, number>;
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
  isPlaying?: boolean;
  speed?: number;
}

export const CircuitReplay: React.FC<CircuitReplayProps> = ({
  circuitId,
  circuitName,
  currentLap,
  totalLaps,
  positions,
  prevPositions = {},
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
  onToggleFullscreen,
  isPlaying = false,
  speed = 4000
}) => {
  const [highlightedSector, setHighlightedSector] = useState<'ALL' | 'S1' | 'S2' | 'S3'>('ALL');
  const [circuitTelemetry, setCircuitTelemetry] = useState<{
    circuitId: string;
    points: FastF1Point[];
    corners: FastF1Corner[];
    rotation: number;
    coordinateSystem: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const resolvedDef = getTrackDefinition(circuitId || 'monza');
    const targetCircuit = resolvedDef.id;

    fetch(`/api/circuits/2026/${targetCircuit}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!isMounted) return;
        if (data && data.status !== 'DATA UNAVAILABLE' && data.layout?.points && data.layout.points.length > 0) {
          setCircuitTelemetry({
            circuitId: targetCircuit,
            points: data.layout.points,
            corners: data.corners || [],
            rotation: data.rotation || 0,
            coordinateSystem: data.layout.coordinateSystem || 'fastf1_xy'
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

  // High-fidelity circuit centerline and sector configuration from track registry
  const trackDef = getTrackDefinition(circuitId || 'monza');
  const fallbackPoints: FastF1Point[] = (trackDef?.path || []).map(pt => ({ x: pt[0], y: pt[1] }));

  // Fallback corners from comprehensive corner collection or track definition
  const fallbackCollection = ALL_CIRCUIT_CORNERS[trackDef.id] || ALL_CIRCUIT_CORNERS[circuitId?.toLowerCase()] || ALL_CIRCUIT_CORNERS['monza'];
  const fallbackCornersList = Object.values(fallbackCollection?.corners || {});

  // Only use fetched telemetry if it matches the active circuit
  const activeTelemetry = circuitTelemetry && circuitTelemetry.circuitId === trackDef.id
    ? circuitTelemetry
    : null;

  const rawPoints: FastF1Point[] = activeTelemetry?.points && activeTelemetry.points.length > 0
    ? activeTelemetry.points
    : fallbackPoints;

  const rawCorners: FastF1Corner[] = activeTelemetry?.corners && activeTelemetry.corners.length > 0
    ? activeTelemetry.corners
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

  const isFastF1 = activeTelemetry ? activeTelemetry.coordinateSystem === 'fastf1_xy' : false;
  const rotationDeg = activeTelemetry?.rotation || 0;

  // Compute unified SVG canvas transform bounds (viewBox: 0 0 800 500)
  // Passing isFastF1 ensures FastF1 (Y-up) is inverted, while Registry (Y-down) maintains correct upright orientation!
  const bounds = computeTransformBounds(rawPoints, rotationDeg, 800, 500, 50, isFastF1);
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

  // Split points into 3 official timing sectors based on track definition
  const totalPts = transformedPoints.length;
  let s1Ratio = 0.33;
  let s2Ratio = 0.67;

  if (trackDef && trackDef.sectors && trackDef.sectors.length >= 2 && trackDef.path.length > 0) {
    const s1Marker = trackDef.sectors.find(s => s.id === 'S1')?.markerIndex ?? Math.floor(trackDef.path.length * 0.33);
    const s2Marker = trackDef.sectors.find(s => s.id === 'S2')?.markerIndex ?? Math.floor(trackDef.path.length * 0.67);
    s1Ratio = s1Marker / trackDef.path.length;
    s2Ratio = s2Marker / trackDef.path.length;
  }

  const s1Idx = Math.max(1, Math.min(Math.floor(totalPts * s1Ratio), totalPts - 3));
  const s2Idx = Math.max(s1Idx + 1, Math.min(Math.floor(totalPts * s2Ratio), totalPts - 2));

  const sector1Points = transformedPoints.slice(0, s1Idx + 1);
  const sector2Points = transformedPoints.slice(s1Idx, s2Idx + 1);
  const sector3Points = [
    ...transformedPoints.slice(s2Idx),
    ...(transformedPoints.length > 0 ? [transformedPoints[0]] : [])
  ];

  const buildSubPath = (pts: TransformedPoint[]) => {
    if (pts.length === 0) return '';
    return pts
      .filter(p => typeof p.x === 'number' && !isNaN(p.x) && typeof p.y === 'number' && !isNaN(p.y))
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(' ');
  };

  const pathSector1 = buildSubPath(sector1Points);
  const pathSector2 = buildSubPath(sector2Points);
  const pathSector3 = buildSubPath(sector3Points);

  // Split marker points & angles
  const s1Split = transformedPoints[s1Idx] || null;
  const s1Next = transformedPoints[Math.min(s1Idx + 1, totalPts - 1)] || null;
  let s1Angle = 0;
  if (s1Split && s1Next) {
    s1Angle = Math.atan2(s1Next.y - s1Split.y, s1Next.x - s1Split.x) * (180 / Math.PI);
  }

  const s2Split = transformedPoints[s2Idx] || null;
  const s2Next = transformedPoints[Math.min(s2Idx + 1, totalPts - 1)] || null;
  let s2Angle = 0;
  if (s2Split && s2Next) {
    s2Angle = Math.atan2(s2Next.y - s2Split.y, s2Next.x - s2Split.x) * (180 / Math.PI);
  }

  // Calculate sector mid-points and perpendicular offsets for floating sector badges
  const computeMidSectorBadge = (startI: number, endI: number) => {
    if (transformedPoints.length === 0) return null;
    const midI = Math.floor(startI + (endI - startI) * 0.5);
    const midPt = transformedPoints[midI];
    const prevPt = transformedPoints[Math.max(0, midI - 2)];
    const nextPt = transformedPoints[Math.min(transformedPoints.length - 1, midI + 2)];
    if (!midPt || !prevPt || !nextPt) return null;

    // Tangent angle
    const angle = Math.atan2(nextPt.y - prevPt.y, nextPt.x - prevPt.x);
    // Perpendicular offset (42px to the outside/side of the track)
    const normX = -Math.sin(angle);
    const normY = Math.cos(angle);
    const rawBadgeX = midPt.x + normX * 42;
    const rawBadgeY = midPt.y + normY * 42;
    return {
      trackX: midPt.x,
      trackY: midPt.y,
      badgeX: Math.max(50, Math.min(750, rawBadgeX)),
      badgeY: Math.max(30, Math.min(470, rawBadgeY))
    };
  };

  const s1Badge = computeMidSectorBadge(0, s1Idx);
  const s2Badge = computeMidSectorBadge(s1Idx, s2Idx);
  const s3Badge = computeMidSectorBadge(s2Idx, totalPts);

  // Persistent progress tracking across pause and resume
  const progressRef = useRef(0);
  const [lapProgress, setLapProgress] = useState(0);
  const prevLapRef = useRef(currentLap);

  // Handle lap changes (e.g. playback timer tick or manual scrub)
  useEffect(() => {
    if (prevLapRef.current !== currentLap) {
      prevLapRef.current = currentLap;
      progressRef.current = 0;
      setLapProgress(0);
    }
  }, [currentLap]);

  // Continuous smooth intra-lap animation loop for playback (60fps)
  useEffect(() => {
    if (!isPlaying) {
      // FREEZE IN PLACE: Never reset progress on pause!
      return;
    }
    let animFrame: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;
      progressRef.current = (progressRef.current + (delta / speed)) % 1;
      setLapProgress(progressRef.current);
      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, speed]);

  // Interpolate smooth sub-pixel coordinates and angle along the circuit path
  const getPointAtProgress = (progress: number) => {
    if (transformedPoints.length === 0) return { x: 400, y: 250, angle: 0 };
    const p = ((progress % 1) + 1) % 1;
    const floatIdx = p * transformedPoints.length;
    const idx1 = Math.floor(floatIdx) % transformedPoints.length;
    const idx2 = (idx1 + 1) % transformedPoints.length;
    const t = floatIdx - Math.floor(floatIdx);

    const pt1 = transformedPoints[idx1];
    const pt2 = transformedPoints[idx2];
    if (!pt1 || !pt2) return { x: 400, y: 250, angle: 0 };

    const x = pt1.x + (pt2.x - pt1.x) * t;
    const y = pt1.y + (pt2.y - pt1.y) * t;
    const angle = Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x);

    return { x, y, angle };
  };

  // Check if we are at race start on the grid (only before launch on Lap 1)
  const isRaceStart = currentLap === 1 && lapProgress <= 0.05;

  // Compute driver positions along track path
  const driverEntries = Object.entries(positions).map(([dId, pos]) => {
    const meta = driverMeta[dId];
    if (!meta) return null;

    const currPos = pos;
    const oldPos = prevPositions && prevPositions[dId] !== undefined ? prevPositions[dId] : currPos;
    const posDelta = oldPos - currPos; // > 0 means gained positions (overtake!)

    let targetX = 400;
    let targetY = 250;

    if (transformedPoints.length > 0) {
      if (isRaceStart) {
        // RACE START / STARTING GRID FORMATION:
        // Staged cleanly along the main straight tangent right before the start/finish line in 2x2 grid boxes.
        // P1 on inside/pole, P2 staggered beside, P3 behind P1, P4 behind P2...
        const row = Math.floor((pos - 1) / 2);
        const isRightSlot = pos % 2 === 1;

        // Tangent and normal vectors of the start/finish straight
        let straightAngle = startAngle;
        if (transformedPoints.length >= 2 && startPoint && nextPoint) {
          straightAngle = Math.atan2(nextPoint.y - startPoint.y, nextPoint.x - startPoint.x) * (180 / Math.PI);
        }
        const rad = (straightAngle * Math.PI) / 180;
        const dirX = Math.cos(rad);
        const dirY = Math.sin(rad);
        const normX = -Math.sin(rad);
        const normY = Math.cos(rad);

        // Distance behind start/finish line along the straight
        const rowDistBack = 18 + row * 16; // 18px behind start line, 16px between rows
        const poleStagger = (pos % 2 === 1) ? 0 : 8; // Pole position (P1) staged 8px ahead of P2
        const lateralOffset = isRightSlot ? 7 : -7; // Staggered left/right lanes

        const gridX = (startPoint ? startPoint.x : 400) - dirX * (rowDistBack - poleStagger) + normX * lateralOffset;
        const gridY = (startPoint ? startPoint.y : 250) - dirY * (rowDistBack - poleStagger) + normY * lateralOffset;

        // Smooth launch transition off the grid between progress 0.00 and 0.05
        const launchT = Math.min(Math.max(lapProgress / 0.05, 0), 1);
        const smoothLaunchT = launchT * launchT * (3 - 2 * launchT);

        // Target racing position at early lap progress
        const racingPt = getPointAtProgress(lapProgress);
        const racingNormX = -Math.sin(racingPt.angle);
        const racingNormY = Math.cos(racingPt.angle);
        const raceX = racingPt.x + racingNormX * lateralOffset;
        const raceY = racingPt.y + racingNormY * lateralOffset;

        targetX = gridX + (raceX - gridX) * smoothLaunchT;
        targetY = gridY + (raceY - gridY) * smoothLaunchT;
      } else {
        // RACING MOTION:
        // Pack moves smoothly together around track at 60fps
        // Leader (P1) is at front, rest of pack follows based on actual race gap
        const leaderProg = lapProgress;

        // Smooth overtake transition between 20% and 70% of lap
        let effectivePos = currPos;
        let passPhase = 0;
        if (isPlaying && oldPos !== currPos) {
          const t = Math.min(Math.max((lapProgress - 0.20) / 0.50, 0), 1);
          const smoothT = t * t * (3 - 2 * t);
          effectivePos = oldPos + (currPos - oldPos) * smoothT;
          passPhase = Math.sin(t * Math.PI); // Peaks at mid-pass
        }

        // Calculate time gap in seconds behind leader
        let gapSeconds = (effectivePos - 1) * 1.5;
        const rawGap = gaps[dId];
        if (rawGap && rawGap !== 'LEADER' && rawGap !== 'N/A' && !rawGap.includes('LAP')) {
          const parsed = parseFloat(rawGap.replace(/[^\d.]/g, ''));
          if (!isNaN(parsed) && parsed > 0) {
            gapSeconds = parsed;
          }
        }

        // On an ~85s lap, gapSeconds / 85 converts time to track distance %
        // Cap maximum gap spacing so cars don't lap around backwards
        const gapProg = Math.min((gapSeconds / 85) * 0.85, 0.38);
        const driverProg = (leaderProg - gapProg + 10) % 1;

        const pt = getPointAtProgress(driverProg);
        const normX = -Math.sin(pt.angle);
        const normY = Math.cos(pt.angle);

        // Lateral lane: when battling/overtaking, car swings out into passing lane
        let sideOffset = (pos % 2 === 1 ? 5 : -5);
        if (passPhase > 0) {
          sideOffset = (posDelta > 0 ? 8 : -8) * passPhase + (currPos % 2 === 1 ? 5 : -5) * (1 - passPhase);
        }

        targetX = pt.x + normX * sideOffset;
        targetY = pt.y + normY * sideOffset;
      }
    }

    return {
      driverId: dId,
      code: meta.code,
      name: meta.name,
      team: meta.team,
      position: pos,
      posDelta,
      x: targetX,
      y: targetY,
      gap: gaps[dId],
      lapTime: lapTimes[dId]
    };
  }).filter(Boolean);

  // Sorted drivers by position for quick-select bar
  const sortedDrivers = [...driverEntries].sort((a, b) => (a?.position || 99) - (b?.position || 99));

  // Drivers who overtook someone on this lap
  const overtakingDrivers = driverEntries.filter(d => (d?.posDelta || 0) > 0);

  return (
    <div
      className={`relative bg-[#080C14] border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none border-none p-4'
          : isMiniMap
          ? 'h-[200px] sm:h-[240px]'
          : 'h-[320px] sm:h-[400px] md:h-[480px]'
      }`}
    >
      {/* Top Overlay Bar */}
      <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-3 sm:left-3 sm:right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#0D121F]/90 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-slate-700/80 pointer-events-auto">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <span className="font-mono text-[10px] sm:text-xs font-black text-white uppercase tracking-wider truncate max-w-[120px] sm:max-w-none">
            {circuitName}
          </span>
          <span className="text-slate-500 font-mono">|</span>
          <span className="font-mono text-[10px] sm:text-xs font-bold text-cyan-400">
            LAP {currentLap}/{totalLaps}
          </span>
        </div>

        {/* Official Timing Sector Legend & Interactive Filter */}
        <div className="hidden sm:flex items-center gap-1.5 pointer-events-auto bg-[#0D121F]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80">
          <button
            type="button"
            onClick={() => setHighlightedSector(highlightedSector === 'S1' ? 'ALL' : 'S1')}
            title="Click to highlight Sector 1 on circuit"
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-black transition-all ${
              highlightedSector === 'S1'
                ? 'bg-[#00FFE0] text-black shadow-[0_0_12px_#00FFE0]'
                : 'bg-[#00FFE0]/20 border border-[#00FFE0]/50 text-[#00FFE0] hover:bg-[#00FFE0]/30'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${highlightedSector === 'S1' ? 'bg-black' : 'bg-[#00FFE0]'}`}></span>
            <span>SEC 1</span>
          </button>
          <button
            type="button"
            onClick={() => setHighlightedSector(highlightedSector === 'S2' ? 'ALL' : 'S2')}
            title="Click to highlight Sector 2 on circuit"
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-black transition-all ${
              highlightedSector === 'S2'
                ? 'bg-[#FFB800] text-black shadow-[0_0_12px_#FFB800]'
                : 'bg-[#FFB800]/20 border border-[#FFB800]/50 text-[#FFB800] hover:bg-[#FFB800]/30'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${highlightedSector === 'S2' ? 'bg-black' : 'bg-[#FFB800]'}`}></span>
            <span>SEC 2</span>
          </button>
          <button
            type="button"
            onClick={() => setHighlightedSector(highlightedSector === 'S3' ? 'ALL' : 'S3')}
            title="Click to highlight Sector 3 on circuit"
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-black transition-all ${
              highlightedSector === 'S3'
                ? 'bg-[#E040FB] text-black shadow-[0_0_12px_#E040FB]'
                : 'bg-[#E040FB]/20 border border-[#E040FB]/50 text-[#E040FB] hover:bg-[#E040FB]/30'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${highlightedSector === 'S3' ? 'bg-black' : 'bg-[#E040FB]'}`}></span>
            <span>SEC 3</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          <button
            onClick={onToggleMiniMap}
            className="px-2 py-1 bg-[#0D121F]/90 hover:bg-slate-800 border border-slate-700 rounded text-[10px] sm:text-[11px] font-mono font-bold text-slate-300 transition-colors"
          >
            {isMiniMap ? 'FULL 🗖' : 'MINI 🗗'}
          </button>
          <button
            onClick={onToggleFullscreen}
            className="px-2 py-1 bg-[#0D121F]/90 hover:bg-slate-800 border border-slate-700 rounded text-[10px] sm:text-[11px] font-mono font-bold text-cyan-400 transition-colors"
          >
            {isFullscreen ? 'EXIT ❌' : 'EXPAND ⛶'}
          </button>
        </div>
      </div>

      {/* Race Start Starting Grid Indicator */}
      {isRaceStart && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-1 bg-[#050811]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_#EF4444]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_#EF4444]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_#EF4444]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_#EF4444]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_#EF4444]"></span>
          </div>
          <span className="font-mono text-[9px] font-black text-red-400 tracking-widest uppercase">
            STARTING GRID · 2x2 FORMATION
          </span>
        </div>
      )}

      {/* Live Overtake Notification Ticker */}
      {overtakingDrivers.length > 0 && !isRaceStart && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center gap-2 bg-[#050B17]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-wider">
            LAP {currentLap} OVERTAKE:
          </span>
          <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-white">
            {overtakingDrivers.map(o => (
              <span key={`ot-${o?.driverId}`} className="flex items-center gap-1">
                <span className="text-emerald-300 font-black">{o?.code}</span>
                <span className="text-emerald-400 text-[9px] font-black">▲P{o?.position} (+{o?.posDelta})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Primary SVG Track Canvas */}
      <svg
        viewBox="0 0 800 500"
        className="w-full h-full object-contain p-3 pb-8"
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

        {/* Track Outer Glow & Asphalt Base Line */}
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
          stroke="#060A14"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* SECTOR 1 Track Line (Glowing Electric Cyan) */}
        {pathSector1 && (
          <g opacity={highlightedSector === 'ALL' || highlightedSector === 'S1' ? 1 : 0.25} className="transition-opacity duration-300">
            <path
              d={pathSector1}
              fill="none"
              stroke="#00FFE0"
              strokeWidth={highlightedSector === 'S1' ? "10" : "7"}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={highlightedSector === 'S1' ? 0.75 : 0.35}
            />
            <path
              d={pathSector1}
              fill="none"
              stroke="#00FFE0"
              strokeWidth={highlightedSector === 'S1' ? "5" : "4"}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="1"
            />
          </g>
        )}

        {/* SECTOR 2 Track Line (Glowing Radiant Gold) */}
        {pathSector2 && (
          <g opacity={highlightedSector === 'ALL' || highlightedSector === 'S2' ? 1 : 0.25} className="transition-opacity duration-300">
            <path
              d={pathSector2}
              fill="none"
              stroke="#FFB800"
              strokeWidth={highlightedSector === 'S2' ? "10" : "7"}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={highlightedSector === 'S2' ? 0.75 : 0.35}
            />
            <path
              d={pathSector2}
              fill="none"
              stroke="#FFB800"
              strokeWidth={highlightedSector === 'S2' ? "5" : "4"}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="1"
            />
          </g>
        )}

        {/* SECTOR 3 Track Line (Glowing Vibrant Magenta) */}
        {pathSector3 && (
          <g opacity={highlightedSector === 'ALL' || highlightedSector === 'S3' ? 1 : 0.25} className="transition-opacity duration-300">
            <path
              d={pathSector3}
              fill="none"
              stroke="#E040FB"
              strokeWidth={highlightedSector === 'S3' ? "10" : "7"}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={highlightedSector === 'S3' ? 0.75 : 0.35}
            />
            <path
              d={pathSector3}
              fill="none"
              stroke="#E040FB"
              strokeWidth={highlightedSector === 'S3' ? "5" : "4"}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="1"
            />
          </g>
        )}

        {/* Start / Finish Line Indicator (Sector 3 to Sector 1 Transition) */}
        {startPoint && (
          <g transform={`translate(${startPoint.x}, ${startPoint.y})`}>
            {/* Checker Line across the track */}
            <g transform={`rotate(${startAngle})`}>
              <line x1="0" y1="-18" x2="0" y2="18" stroke="#FFFFFF" strokeWidth="4" />
              <line x1="3" y1="-18" x2="3" y2="18" stroke="#000000" strokeWidth="2" strokeDasharray="3 3" />
              <polygon points="12,0 4,-5 4,5" fill="#E040FB" />
            </g>
            {/* Always-upright text badge */}
            <g transform="translate(0, -28)">
              <rect x="-26" y="-8" width="52" height="16" rx="4" fill="#060A14" stroke="#E040FB" strokeWidth="1.5" />
              <text x="0" y="3" fill="#E040FB" fontSize="8.5" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="0.6">
                FINISH
              </text>
            </g>
          </g>
        )}

        {/* SECTOR 1 SPLIT GATE */}
        {s1Split && (
          <g transform={`translate(${s1Split.x}, ${s1Split.y})`}>
            <g transform={`rotate(${s1Angle})`}>
              <line x1="0" y1="-18" x2="0" y2="18" stroke="#00FFE0" strokeWidth="4" />
              <line x1="3" y1="-18" x2="3" y2="18" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 3" />
            </g>
            <g transform="translate(0, -28)">
              <rect x="-28" y="-8" width="56" height="16" rx="4" fill="#060A14" stroke="#00FFE0" strokeWidth="1.5" />
              <text x="0" y="3" fill="#00FFE0" fontSize="8.5" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="0.6">
                S1 SPLIT
              </text>
            </g>
          </g>
        )}

        {/* SECTOR 2 SPLIT GATE */}
        {s2Split && (
          <g transform={`translate(${s2Split.x}, ${s2Split.y})`}>
            <g transform={`rotate(${s2Angle})`}>
              <line x1="0" y1="-18" x2="0" y2="18" stroke="#FFB800" strokeWidth="4" />
              <line x1="3" y1="-18" x2="3" y2="18" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 3" />
            </g>
            <g transform="translate(0, -28)">
              <rect x="-28" y="-8" width="56" height="16" rx="4" fill="#060A14" stroke="#FFB800" strokeWidth="1.5" />
              <text x="0" y="3" fill="#FFB800" fontSize="8.5" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="0.6">
                S2 SPLIT
              </text>
            </g>
          </g>
        )}

        {/* Floating Sector 1 Callout */}
        {s1Badge && (
          <g className="pointer-events-none transition-opacity duration-300" opacity={highlightedSector === 'S1' ? 1 : 0}>
            <line x1={s1Badge.trackX} y1={s1Badge.trackY} x2={s1Badge.badgeX} y2={s1Badge.badgeY} stroke="#00FFE0" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
            <g transform={`translate(${s1Badge.badgeX}, ${s1Badge.badgeY})`}>
              <rect x="-40" y="-12" width="80" height="24" rx="6" fill="#030712" stroke="#00FFE0" strokeWidth="1.8" />
              <circle cx="-27" cy="0" r="3.5" fill="#00FFE0" />
              <text x="6" y="4" fill="#00FFE0" fontSize="10" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="0.6">
                SECTOR 1
              </text>
            </g>
          </g>
        )}

        {/* Floating Sector 2 Callout */}
        {s2Badge && (
          <g className="pointer-events-none transition-opacity duration-300" opacity={highlightedSector === 'S2' ? 1 : 0}>
            <line x1={s2Badge.trackX} y1={s2Badge.trackY} x2={s2Badge.badgeX} y2={s2Badge.badgeY} stroke="#FFB800" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
            <g transform={`translate(${s2Badge.badgeX}, ${s2Badge.badgeY})`}>
              <rect x="-40" y="-12" width="80" height="24" rx="6" fill="#030712" stroke="#FFB800" strokeWidth="1.8" />
              <circle cx="-27" cy="0" r="3.5" fill="#FFB800" />
              <text x="6" y="4" fill="#FFB800" fontSize="10" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="0.6">
                SECTOR 2
              </text>
            </g>
          </g>
        )}

        {/* Floating Sector 3 Callout */}
        {s3Badge && (
          <g className="pointer-events-none transition-opacity duration-300" opacity={highlightedSector === 'S3' ? 1 : 0}>
            <line x1={s3Badge.trackX} y1={s3Badge.trackY} x2={s3Badge.badgeX} y2={s3Badge.badgeY} stroke="#E040FB" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
            <g transform={`translate(${s3Badge.badgeX}, ${s3Badge.badgeY})`}>
              <rect x="-40" y="-12" width="80" height="24" rx="6" fill="#030712" stroke="#E040FB" strokeWidth="1.8" />
              <circle cx="-27" cy="0" r="3.5" fill="#E040FB" />
              <text x="6" y="4" fill="#E040FB" fontSize="10" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="0.6">
                SECTOR 3
              </text>
            </g>
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
          const isSelected = selectedDriverId === d.driverId;
          return (
            <g key={`marker-wrap-${d.driverId}`}>
              {/* Selected Driver Focus Radar Ring */}
              {isSelected && (
                <g transform={`translate(${d.x}, ${d.y})`} className="pointer-events-none">
                  <circle r="19" fill="none" stroke="#00FFE0" strokeWidth="2.5" opacity="0.9" filter="url(#glow)" />
                  <circle r="26" fill="none" stroke="#00FFE0" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
                </g>
              )}

              {/* Overtake Gain Badge above car */}
              {d.posDelta > 0 && !isRaceStart && (
                <g transform={`translate(${d.x}, ${d.y - 19})`} className="pointer-events-none">
                  <rect x="-18" y="-7" width="36" height="13" rx="3" fill="#022C22" stroke="#10B981" strokeWidth="1.2" filter="url(#glow)" />
                  <text x="0" y="2.5" fill="#34D399" fontSize="7.5" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                    ▲+{d.posDelta}
                  </text>
                </g>
              )}

              {/* Position Loss Badge above car */}
              {d.posDelta < 0 && !isRaceStart && (
                <g transform={`translate(${d.x}, ${d.y - 19})`} className="pointer-events-none opacity-80">
                  <rect x="-14" y="-7" width="28" height="13" rx="3" fill="#2E0808" stroke="#EF4444" strokeWidth="1" />
                  <text x="0" y="2.5" fill="#F87171" fontSize="7.5" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                    ▼{d.posDelta}
                  </text>
                </g>
              )}

              <DriverMarker
                driverId={d.driverId}
                code={d.code}
                name={d.name}
                team={d.team}
                position={d.position}
                x={d.x}
                y={d.y}
                isSelected={isSelected}
                isHovered={hoveredDriverId === d.driverId}
                isDriverA={driverAId === d.driverId}
                isDriverB={driverBId === d.driverId}
                gap={d.gap}
                lapTime={d.lapTime}
                onSelect={onSelectDriver}
                onHover={onHoverDriver}
              />
            </g>
          );
        })}
      </svg>

      {/* Driver Quick-Selector Strip (Always visible at bottom of map) */}
      <div className="absolute bottom-2 left-2 right-2 z-20 flex items-center gap-1.5 overflow-x-auto py-1 px-2.5 bg-[#080C14]/95 backdrop-blur-md border border-slate-800 rounded-lg scrollbar-none shadow-xl">
        <span className="text-[10px] font-mono font-black text-cyan-400 whitespace-nowrap mr-1 flex items-center gap-1">
          <span>🏎️</span>
          <span className="hidden sm:inline">SELECT DRIVER:</span>
        </span>
        {sortedDrivers.map(d => {
          if (!d) return null;
          const isSel = d.driverId === selectedDriverId;
          return (
            <button
              key={`strip-${d.driverId}`}
              type="button"
              onClick={() => onSelectDriver(d.driverId)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-black tracking-wider whitespace-nowrap transition-all flex items-center gap-1 border ${
                isSel
                  ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_10px_rgba(0,255,224,0.6)] font-black'
                  : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-cyan-400 hover:text-white'
              }`}
            >
              <span className={isSel ? 'text-black/80 font-bold' : 'text-slate-400 font-bold'}>
                {d.position}
              </span>
              <span>{d.code}</span>
              {d.posDelta > 0 && !isRaceStart && (
                <span className={`px-1 py-0.2 rounded text-[8px] font-black ${isSel ? 'bg-black text-emerald-300' : 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/40'}`}>
                  +{d.posDelta}
                </span>
              )}
              {d.posDelta < 0 && !isRaceStart && (
                <span className={`px-1 py-0.2 rounded text-[8px] font-black ${isSel ? 'bg-black text-red-300' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}>
                  {d.posDelta}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

