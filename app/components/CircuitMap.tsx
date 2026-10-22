'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  computeTransformBounds,
  transformTrackPath,
  transformCorners,
  enrichCornerDetails,
  calculateSimTelemetry,
  TransformedCorner,
  TransformBounds,
  TransformedPoint
} from '../lib/circuitTransform';
import { CornerDetails } from './CornerDetails';
import { CornerDirectory } from './CornerDirectory';
import { getTeamColor } from '../utils/api';
import { TRACKS_REGISTRY, getTrackDefinition } from '../lib/tracksRegistry';

export interface CircuitMapProps {
  circuit?: string;
  circuitId?: string;
  year?: number;
  showStats?: boolean;
  showCorners?: boolean;
  showCornerDirectory?: boolean;
  showCornerDetails?: boolean;
  drivers?: any[];
  activeDriverCode?: string;
  onHoverDriver?: (code: string | null) => void;
  onCornerSelect?: (corner: TransformedCorner | null) => void;
  className?: string;
  [key: string]: any;
}

interface LiveDriverOverlayProps {
  drivers: any[];
  transformedPoints: TransformedPoint[];
  activeDriverCode?: string;
  onHoverDriver?: (code: string | null) => void;
}

const LAP_DURATION_MS = 22000; // High-velocity 22s lap cycle anchored to 60FPS wall-clock time

// Subcomponent: Live Driver Overlay with wall-clock continuous time progress
const LiveDriverOverlay = React.memo(function LiveDriverOverlay({
  drivers,
  transformedPoints,
  activeDriverCode,
  onHoverDriver
}: LiveDriverOverlayProps) {
  // Initialize and track animation progress anchored directly to Date.now()
  const [animProgress, setAnimProgress] = useState<number>(
    () => (Date.now() % LAP_DURATION_MS) / LAP_DURATION_MS
  );

  useEffect(() => {
    let animId: number;

    const tick = () => {
      // Direct wall-clock calculation: immune to tab-switching pauses or resets
      const currentProgress = (Date.now() % LAP_DURATION_MS) / LAP_DURATION_MS;
      setAnimProgress(currentProgress);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  const totalTrackPoints = transformedPoints ? transformedPoints.length : 0;
  if (totalTrackPoints < 2 || !drivers || drivers.length === 0) return null;

  const driverPositions = drivers.map((driver: any) => {
    const isPit = driver.status === 'IN PIT';
    const isRetired = driver.status === 'RETIRED';

    const gapSec = typeof driver.gapToLeader === 'number' && !isNaN(driver.gapToLeader)
      ? driver.gapToLeader
      : ((driver.position || 1) - 1) * 1.5;

    const gapFraction = gapSec / 75;
    let driverProgress = (animProgress - gapFraction) % 1;
    if (driverProgress < 0) driverProgress += 1;

    const floatIdx = driverProgress * (totalTrackPoints - 1);
    const idx1 = Math.floor(floatIdx) % totalTrackPoints;
    const idx2 = (idx1 + 1) % totalTrackPoints;
    const t = floatIdx - Math.floor(floatIdx);

    const p1 = transformedPoints[idx1];
    const p2 = transformedPoints[idx2];

    let x = p1.x + (p2.x - p1.x) * t;
    let y = p1.y + (p2.y - p1.y) * t;
    let angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);

    if (isPit) {
      const pitAnchor = transformedPoints[0] || p1;
      x = pitAnchor.x + 16;
      y = pitAnchor.y + 16;
      angle = 0;
    }

    return {
      ...driver,
      x,
      y,
      angle,
      isPit,
      isRetired
    };
  });

  return (
    <g>
      {driverPositions.map((d: any) => {
        if (isNaN(d.x) || isNaN(d.y) || d.isRetired) return null;

        const teamColor = getTeamColor(d.teamId);
        const isActive = activeDriverCode && activeDriverCode.toUpperCase() === (d.code || '').toUpperCase();
        const radius = isActive ? 11 : 8.5;

        return (
          <g
            key={`driver-car-${d.driverId || d.code}`}
            transform={`translate(${d.x}, ${d.y})`}
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onHoverDriver?.(isActive ? null : d.code);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onMouseEnter={() => onHoverDriver?.(d.code)}
            onMouseLeave={() => onHoverDriver?.(null)}
          >
            {/* Outer Halo Ring for Active / Hovered Driver */}
            {isActive && (
              <circle
                r={radius + 5}
                fill="none"
                stroke={teamColor}
                strokeWidth="2.5"
                opacity="0.9"
                filter="url(#glow)"
              />
            )}

            {/* Driver Heading Direction Arrow */}
            {!d.isPit && (
              <g transform={`rotate(${isNaN(d.angle) ? 0 : d.angle})`}>
                <polygon
                  points={`${radius + 5},0 ${radius + 1}, -3.5 ${radius + 1},3.5`}
                  fill={teamColor}
                />
              </g>
            )}

            {/* Clean Team Circle Dot */}
            <circle
              r={radius}
              fill={teamColor}
              stroke="#090D16"
              strokeWidth="2"
              filter={isActive ? 'url(#glow)' : undefined}
            />

            {/* Driver Code Text inside Circle Dot */}
            <text
              x="0"
              y="3"
              fill="#FFFFFF"
              fontSize={isActive ? "9.5" : "7.5"}
              fontWeight="900"
              fontFamily="monospace"
              textAnchor="middle"
              style={{
                paintOrder: 'stroke',
                stroke: '#000000',
                strokeWidth: '1.5px',
                strokeLinejoin: 'round'
              }}
            >
              {d.isPit ? 'P' : d.code}
            </text>

            {/* Hovered / Active Extended Floating Popover Badge */}
            {isActive && (
              <g transform={`translate(0, ${-radius - 18})`} className="pointer-events-none">
                <rect
                  x="-45"
                  y="-11"
                  width="90"
                  height="22"
                  rx="6"
                  fill="#090D16"
                  stroke={teamColor}
                  strokeWidth="2"
                  filter="url(#cornerGlow)"
                />
                <text
                  x="0"
                  y="4"
                  fill="#FFFFFF"
                  fontSize="10"
                  fontWeight="900"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  P{d.position} {d.code} • {d.speedTrap || 320} KM/H
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
});

export interface ElevationPoint {
  pct: number;
  distKm: number;
  altitudeM: number;
  gradePct: number;
  speedKmh: number;
  gear: number;
  cornerLabel?: string;
}

export interface ElevationProfile {
  points: ElevationPoint[];
  minAltitude: number;
  maxAltitude: number;
  totalClimb: number;
  maxIncline: number;
}

function getCircuitElevationData(
  targetCircuit: string,
  trackLengthKm: number,
  transformedCorners: TransformedCorner[]
): ElevationProfile {
  const norm = targetCircuit.toLowerCase().replace(/[-_]/g, '');
  let baseAlt = 80;
  let altFunc = (p: number) => Math.sin(p * Math.PI * 2) * 12 + Math.sin(p * Math.PI * 4) * 6;

  if (norm.includes('spa')) {
    baseAlt = 380;
    altFunc = (p: number) => {
      if (p < 0.04) return 0;
      if (p < 0.14) return Math.sin(((p - 0.04) / 0.10) * (Math.PI / 2)) * 42;
      if (p < 0.28) return 42 + Math.sin(((p - 0.14) / 0.14) * Math.PI) * 12;
      if (p < 0.55) return 42 - ((p - 0.28) / 0.27) * 94;
      if (p < 0.80) return -52 + ((p - 0.55) / 0.25) * 44;
      return -8 + ((p - 0.80) / 0.20) * 8;
    };
  } else if (norm.includes('redbull') || norm.includes('austria') || norm.includes('spielberg')) {
    baseAlt = 670;
    altFunc = (p: number) => {
      if (p < 0.35) return Math.pow(p / 0.35, 1.3) * 65;
      if (p < 0.70) return 65 - ((p - 0.35) / 0.35) * 58;
      return 7 - ((p - 0.70) / 0.30) * 7;
    };
  } else if (norm.includes('americas') || norm.includes('cota')) {
    baseAlt = 150;
    altFunc = (p: number) => {
      if (p < 0.10) return Math.sin((p / 0.10) * (Math.PI / 2)) * 39;
      if (p < 0.35) return 39 - ((p - 0.10) / 0.25) * 44;
      if (p < 0.60) return -5 + Math.sin(((p - 0.35) / 0.25) * Math.PI) * 14;
      return 9 - ((p - 0.60) / 0.40) * 9;
    };
  } else if (norm.includes('monaco')) {
    baseAlt = 15;
    altFunc = (p: number) => {
      if (p < 0.25) return Math.sin((p / 0.25) * (Math.PI / 2)) * 42;
      if (p < 0.55) return 42 - ((p - 0.25) / 0.30) * 44;
      if (p < 0.80) return -2 + Math.sin(((p - 0.55) / 0.25) * Math.PI) * 4;
      return 2 - ((p - 0.80) / 0.20) * 2;
    };
  } else if (norm.includes('interlagos') || norm.includes('brazil')) {
    baseAlt = 780;
    altFunc = (p: number) => {
      if (p < 0.20) return -Math.sin((p / 0.20) * (Math.PI / 2)) * 38;
      if (p < 0.60) return -38 + Math.sin(((p - 0.20) / 0.40) * Math.PI) * 12;
      return -38 + ((p - 0.60) / 0.40) * 38;
    };
  } else if (norm.includes('suzuka')) {
    baseAlt = 50;
    altFunc = (p: number) => {
      if (p < 0.28) return Math.sin((p / 0.28) * (Math.PI / 2)) * 36;
      if (p < 0.55) return 36 - ((p - 0.28) / 0.27) * 42;
      if (p < 0.80) return -6 + Math.sin(((p - 0.55) / 0.25) * Math.PI) * 18;
      return 12 - ((p - 0.80) / 0.20) * 12;
    };
  } else if (norm.includes('zandvoort')) {
    baseAlt = 10;
    altFunc = (p: number) => Math.sin(p * Math.PI * 4) * 8 + Math.cos(p * Math.PI * 2) * 6;
  } else if (norm.includes('monza')) {
    baseAlt = 180;
    altFunc = (p: number) => Math.sin(p * Math.PI * 2) * 4 + Math.sin(p * Math.PI * 4) * 2;
  } else if (norm.includes('silverstone')) {
    baseAlt = 150;
    altFunc = (p: number) => Math.sin(p * Math.PI * 2) * 5 + Math.sin(p * Math.PI * 6) * 3;
  }

  const sampleCount = 60;
  const points: ElevationPoint[] = [];
  let minAlt = Infinity;
  let maxAlt = -Infinity;
  let totalClimb = 0;
  let maxIncline = 0;

  for (let i = 0; i <= sampleCount; i++) {
    const pct = (i / sampleCount) * 100;
    const ratio = i / sampleCount;
    const distKm = Number(((ratio * (trackLengthKm || 5.2))).toFixed(2));
    const alt = Math.round((baseAlt + altFunc(ratio)) * 10) / 10;

    minAlt = Math.min(minAlt, alt);
    maxAlt = Math.max(maxAlt, alt);

    let speed = 280;
    let gear = 7;
    let nearestC: TransformedCorner | undefined;
    let minCornerDist = Infinity;
    transformedCorners.forEach(c => {
      const cRatio = (c.number / Math.max(transformedCorners.length, 1));
      const distRatio = Math.abs(ratio - cRatio);
      if (distRatio < minCornerDist) {
        minCornerDist = distRatio;
        nearestC = c;
      }
    });

    if (minCornerDist < 0.05 && nearestC) {
      speed = (nearestC as any).speed_kph || 140;
      gear = (nearestC as any).gear || (speed < 100 ? 2 : speed < 160 ? 3 : 4);
    } else if (ratio < 0.08 || (ratio > 0.45 && ratio < 0.58)) {
      speed = 330;
      gear = 8;
    }

    let grade = 0;
    if (i > 0) {
      const prevAlt = points[i - 1].altitudeM;
      const prevDistM = (points[i - 1].distKm) * 1000;
      const curDistM = distKm * 1000;
      const deltaDist = Math.max(1, curDistM - prevDistM);
      const deltaAlt = alt - prevAlt;
      grade = Number(((deltaAlt / deltaDist) * 100).toFixed(1));
      if (deltaAlt > 0) totalClimb += deltaAlt;
      maxIncline = Math.max(maxIncline, Math.abs(grade));
    }

    points.push({
      pct,
      distKm,
      altitudeM: alt,
      gradePct: grade,
      speedKmh: speed,
      gear,
      cornerLabel: minCornerDist < 0.03 && nearestC ? `Turn ${(nearestC as any).number}` : undefined
    });
  }

  return {
    points,
    minAltitude: Math.round(minAlt),
    maxAltitude: Math.round(maxAlt),
    totalClimb: Math.round(totalClimb),
    maxIncline: Math.max(maxIncline, 4.5)
  };
}

function computeTrackData(rawCircuitData: any, targetCircuit: string) {
  if (!rawCircuitData || !rawCircuitData.layout || !rawCircuitData.layout.points) {
    return null;
  }

  const { circuit: circuitMeta, layout, corners: rawCorners, rotation = 0, sourceSession, telemetryDriver } = rawCircuitData;
  const isFastF1 = layout.coordinateSystem === 'fastf1_xy';
  const bounds: TransformBounds = computeTransformBounds(layout.points, rotation, 1000, 700, 75, isFastF1);
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

  const cornersDict: Record<string, any> = {};
  const circuitDisplayName = circuitMeta?.name || targetCircuit.replace(/_/g, ' ').toUpperCase();
  transformedCorners.forEach(c => {
    const key = `t${c.number}${c.letter || ''}`.toLowerCase();
    const enriched = enrichCornerDetails(c, targetCircuit, circuitDisplayName);
    cornersDict[key] = enriched;
    const parsedSpeed = parseInt(enriched.technical?.apexSpeed || '', 10);
    if (!isNaN(parsedSpeed) && parsedSpeed > 0) {
      c.speed_kph = parsedSpeed;
    }
    const parsedGear = parseInt(enriched.technical?.typicalGear || '', 10);
    if (!isNaN(parsedGear) && parsedGear > 0) {
      c.gear = parsedGear;
    }
    let closestTrackIdx = 0;
    let minD = Infinity;
    for (let i = 0; i < transformedPoints.length; i++) {
      const d = Math.hypot(transformedPoints[i].x - c.anchorX, transformedPoints[i].y - c.anchorY);
      if (d < minD) {
        minD = d;
        closestTrackIdx = i;
      }
    }
    (c as any).trackPointIndex = closestTrackIdx;
  });

  // Sector sub-paths so each track segment is color-coded by sector (S1=Cyan, S2=Amber, S3=Magenta)
  const trackMeta = TRACKS_REGISTRY[targetCircuit] || TRACKS_REGISTRY[targetCircuit.replace(/-/g, '_')] || TRACKS_REGISTRY[targetCircuit.replace(/_/g, '-')];
  let pathS1 = pathD, pathS2 = '', pathS3 = '';
  if (transformedPoints && transformedPoints.length >= 5) {
    const totalPts = transformedPoints.length;
    const refPts = trackMeta?.path?.length || totalPts;

    const getPropIdx = (rawIdx: number | undefined, defRatio: number) => {
      if (typeof rawIdx === 'number' && refPts > 0) {
        const ratio = rawIdx / refPts;
        return Math.floor(totalPts * Math.min(0.99, Math.max(0.01, ratio)));
      }
      return Math.floor(totalPts * defRatio);
    };

    const s1Idx = getPropIdx(trackMeta?.sectors?.[0]?.markerIndex, 0.33);
    const s2Idx = getPropIdx(trackMeta?.sectors?.[1]?.markerIndex, 0.66);

    // Sector 1: 0 -> s1Idx
    pathS1 = `M ${transformedPoints[0].x},${transformedPoints[0].y}`;
    for (let i = 1; i <= s1Idx && i < totalPts; i++) {
      pathS1 += ` L ${transformedPoints[i].x},${transformedPoints[i].y}`;
    }

    // Sector 2: s1Idx -> s2Idx
    pathS2 = `M ${transformedPoints[Math.min(s1Idx, totalPts - 1)].x},${transformedPoints[Math.min(s1Idx, totalPts - 1)].y}`;
    for (let i = s1Idx + 1; i <= s2Idx && i < totalPts; i++) {
      pathS2 += ` L ${transformedPoints[i].x},${transformedPoints[i].y}`;
    }

    // Sector 3: s2Idx -> end -> 0
    pathS3 = `M ${transformedPoints[Math.min(s2Idx, totalPts - 1)].x},${transformedPoints[Math.min(s2Idx, totalPts - 1)].y}`;
    for (let i = s2Idx + 1; i < totalPts; i++) {
      pathS3 += ` L ${transformedPoints[i].x},${transformedPoints[i].y}`;
    }
    pathS3 += ` L ${transformedPoints[0].x},${transformedPoints[0].y}`;
  }

  // High-velocity DRS activation zone paths along primary acceleration straights
  let pathDrs1 = '';
  let pathDrs2 = '';
  if (transformedPoints && transformedPoints.length >= 20) {
    const totalPts = transformedPoints.length;
    // DRS Zone 1: Main Straight (final turn exit through start/finish to Turn 1 braking)
    const d1Start = Math.floor(totalPts * 0.91);
    const d1End = Math.floor(totalPts * 0.08);
    let p1 = `M ${transformedPoints[d1Start].x},${transformedPoints[d1Start].y}`;
    for (let i = d1Start + 1; i < totalPts; i++) {
      p1 += ` L ${transformedPoints[i].x},${transformedPoints[i].y}`;
    }
    for (let i = 0; i <= d1End; i++) {
      p1 += ` L ${transformedPoints[i].x},${transformedPoints[i].y}`;
    }
    pathDrs1 = p1;

    // DRS Zone 2: Secondary / Back Straight
    const d2Start = Math.floor(totalPts * 0.44);
    const d2End = Math.floor(totalPts * 0.58);
    let p2 = `M ${transformedPoints[d2Start].x},${transformedPoints[d2Start].y}`;
    for (let i = d2Start + 1; i <= d2End; i++) {
      p2 += ` L ${transformedPoints[i].x},${transformedPoints[i].y}`;
    }
    pathDrs2 = p2;
  }

  // Speed Heatmap Segments calculation along entire track
  const speedSegments: Array<{ path: string; color: string; speed: number }> = [];
  if (transformedPoints && transformedPoints.length >= 6) {
    const totalPts = transformedPoints.length;
    const step = Math.max(2, Math.floor(totalPts / 65));

    const getSpeedAtIdx = (idx: number) => {
      const pt = transformedPoints[idx];
      const ratio = idx / totalPts;

      const isDrs1 = ratio >= 0.91 || ratio <= 0.08;
      const isDrs2 = ratio >= 0.44 && ratio <= 0.58;

      let closestDist = Infinity;
      let closestSpeed = 150;
      for (const c of transformedCorners) {
        const d = Math.hypot(c.anchorX - pt.x, c.anchorY - pt.y);
        if (d < closestDist) {
          closestDist = d;
          closestSpeed = (c as any).speed_kph || 135;
        }
      }

      if (closestDist < 35) {
        return closestSpeed;
      }
      if (closestDist < 85) {
        const factor = (closestDist - 35) / 50;
        const straightSpeed = isDrs1 ? 338 : isDrs2 ? 324 : 285;
        return Math.round(closestSpeed + factor * (straightSpeed - closestSpeed));
      }
      if (isDrs1) return 338;
      if (isDrs2) return 324;
      return 285;
    };

    const getSpeedColor = (spd: number) => {
      if (spd < 110) return '#0088FF'; // Heavy braking / chicane
      if (spd < 165) return '#00F5D4'; // Medium apex
      if (spd < 235) return '#FFD600'; // Mid-high load
      if (spd < 295) return '#FF6B00'; // High speed sweeper
      return '#FF0055';                // V-Max DRS Straight
    };

    for (let i = 0; i < totalPts; i += step) {
      const endI = Math.min(totalPts - 1, i + step);
      const spd = getSpeedAtIdx(Math.floor((i + endI) / 2));
      const color = getSpeedColor(spd);
      let segPath = `M ${transformedPoints[i].x},${transformedPoints[i].y}`;
      for (let j = i + 1; j <= endI; j++) {
        segPath += ` L ${transformedPoints[j].x},${transformedPoints[j].y}`;
      }
      speedSegments.push({ path: segPath, color, speed: spd });
    }
  }

  // Pit Lane Detour & Limiter Zone Geometry
  let pitLaneData: {
    path: string;
    pitIn: { x: number; y: number; angle: number };
    pitOut: { x: number; y: number; angle: number };
    limiterZonePath: string;
    lossSeconds: number;
  } | null = null;

  if (transformedPoints && transformedPoints.length >= 25 && startPoint) {
    const totalPts = transformedPoints.length;
    const entryIdx = Math.floor(totalPts * 0.93);
    const exitIdx = Math.floor(totalPts * 0.07);

    const pEntry = transformedPoints[entryIdx];
    const pExit = transformedPoints[exitIdx];
    const dx = pExit.x - pEntry.x;
    const dy = pExit.y - pEntry.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const offset = 22;

    const pitInPt = { x: pEntry.x, y: pEntry.y, angle: Math.atan2(dy, dx) * (180 / Math.PI) };
    const pitOutPt = { x: pExit.x, y: pExit.y, angle: Math.atan2(dy, dx) * (180 / Math.PI) };

    const pitMidEntry = { x: pEntry.x + (dx * 0.2) + nx * offset, y: pEntry.y + (dy * 0.2) + ny * offset };
    const pitMidExit = { x: pEntry.x + (dx * 0.8) + nx * offset, y: pEntry.y + (dy * 0.8) + ny * offset };

    const fullPitPath = `M ${pEntry.x},${pEntry.y} L ${pitMidEntry.x},${pitMidEntry.y} L ${pitMidExit.x},${pitMidExit.y} L ${pExit.x},${pExit.y}`;
    const limiterPath = `M ${pitMidEntry.x},${pitMidEntry.y} L ${pitMidExit.x},${pitMidExit.y}`;

    pitLaneData = {
      path: fullPitPath,
      pitIn: pitInPt,
      pitOut: pitOutPt,
      limiterZonePath: limiterPath,
      lossSeconds: 21.8
    };
  }

  // Circuit Topography & Elevation Profile
  const trackLengthKm = trackMeta?.length_km || 5.2;
  const elevationProfile = getCircuitElevationData(targetCircuit, trackLengthKm, transformedCorners);

  return {
    circuitMeta,
    layout,
    rotation,
    sourceSession,
    telemetryDriver,
    bounds,
    pathD,
    sectorPaths: { pathS1, pathS2, pathS3, pathDrs1, pathDrs2 },
    transformedPoints,
    transformedCorners,
    startPoint,
    startAngle,
    cornersDict,
    speedSegments,
    pitLaneData,
    elevationProfile
  };
}

interface ElevationProfilePanelProps {
  profile: ElevationProfile;
  trackLengthKm?: number;
  hoverPct: number | null;
  onHoverPct: (pct: number | null) => void;
}

function ElevationProfilePanel({
  profile,
  trackLengthKm = 5.2,
  hoverPct,
  onHoverPct
}: ElevationProfilePanelProps) {
  const { points, minAltitude, maxAltitude, totalClimb, maxIncline } = profile;
  const svgWidth = 800;
  const svgHeight = 110;
  const padX = 35;
  const padY = 22;

  const altRange = Math.max(8, maxAltitude - minAltitude);

  const getX = (pct: number) => padX + (pct / 100) * (svgWidth - padX * 2);
  const getY = (alt: number) => svgHeight - padY - ((alt - minAltitude) / altRange) * (svgHeight - padY * 2);

  let pathD = `M ${getX(points[0].pct)},${getY(points[0].altitudeM)}`;
  for (let i = 1; i < points.length; i++) {
    pathD += ` L ${getX(points[i].pct)},${getY(points[i].altitudeM)}`;
  }
  const areaD = `${pathD} L ${getX(100)},${svgHeight - padY} L ${getX(0)},${svgHeight - padY} Z`;

  let activePoint: ElevationPoint | null = null;
  if (hoverPct !== null) {
    const idx = Math.min(points.length - 1, Math.max(0, Math.round((hoverPct / 100) * (points.length - 1))));
    activePoint = points[idx];
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const relX = (x / rect.width) * svgWidth;
    const clampedX = Math.max(padX, Math.min(svgWidth - padX, relX));
    const pct = ((clampedX - padX) / (svgWidth - padX * 2)) * 100;
    onHoverPct(pct);
  };

  return (
    <div className="bg-[#090D14] border-t border-white/10 p-3 sm:p-4 flex flex-col gap-2.5 animate-in fade-in duration-200">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="stitch-live-dot" />
          <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
            Circuit Elevation &amp; Topography Contour
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px] flex-wrap">
          <span className="stitch-data-chip text-white border-white/10">
            ALTITUDE: <strong className="text-cyan-400">{minAltitude}m</strong> TO <strong className="text-cyan-400">{maxAltitude}m</strong> ({Math.round(maxAltitude - minAltitude)}m Δ)
          </span>
          <span className="stitch-data-chip text-[#00FF9C] border-[#00FF9C]/20">
            TOTAL CLIMB: <strong>+{totalClimb}m</strong>
          </span>
          <span className="stitch-data-chip text-[#FFB800] border-[#FFB800]/20">
            MAX INCLINE: <strong>+{maxIncline}%</strong>
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden select-none bg-[#05070A] rounded-xl border border-white/5 p-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-[85px] sm:h-[110px] cursor-crosshair"
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => onHoverPct(null)}
        >
          <defs>
            <linearGradient id="elevAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.30" />
              <stop offset="70%" stopColor="#00F0FF" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Reference altitude gridlines */}
          <line x1={padX} y1={getY(minAltitude)} x2={svgWidth - padX} y2={getY(minAltitude)} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <line x1={padX} y1={getY((maxAltitude + minAltitude) / 2)} x2={svgWidth - padX} y2={getY((maxAltitude + minAltitude) / 2)} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <line x1={padX} y1={getY(maxAltitude)} x2={svgWidth - padX} y2={getY(maxAltitude)} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />

          {/* Area Fill */}
          <path d={areaD} fill="url(#elevAreaGrad)" className="pointer-events-none" />

          {/* Contour Stroke */}
          <path d={pathD} fill="none" stroke="#00F0FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none" />

          {/* Apex markers along the altitude curve */}
          {points.filter(p => p.cornerLabel).map((p, idx) => (
            <g key={idx} transform={`translate(${getX(p.pct)}, ${getY(p.altitudeM)})`} className="pointer-events-none">
              <circle r="3" fill="#FF1E27" stroke="#FFFFFF" strokeWidth="1" />
              <text x="0" y="-7" fill="#94A3B8" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                {p.cornerLabel}
              </text>
            </g>
          ))}

          {/* Active Hover Scrub Needle and Beacon */}
          {activePoint && (
            <g className="pointer-events-none">
              <line
                x1={getX(activePoint.pct)}
                y1={padY - 4}
                x2={getX(activePoint.pct)}
                y2={svgHeight - padY + 4}
                stroke="#00FF9C"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(activePoint.pct)}
                cy={getY(activePoint.altitudeM)}
                r="5"
                fill="#00FF9C"
                stroke="#090D14"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Hover Telemetry Readout Strip */}
        {activePoint && (
          <div className="absolute top-2 left-2 right-2 pointer-events-none flex items-center justify-between font-mono text-[9.5px] text-slate-300 bg-[#090D14]/90 border border-[#00FF9C]/30 px-3 py-1 rounded-lg backdrop-blur-sm">
            <span className="text-[#00FF9C] font-black">
              LAP DISTANCE: {activePoint.pct.toFixed(1)}% ({activePoint.distKm} KM)
            </span>
            <span className="text-white font-bold">
              ALTITUDE: <strong className="text-[#00F0FF]">{activePoint.altitudeM > 0 ? `+${activePoint.altitudeM}` : activePoint.altitudeM}M</strong>
            </span>
            <span className={activePoint.gradePct >= 0 ? 'text-[#00FF9C]' : 'text-[#FF3366]'}>
              GRADE: {activePoint.gradePct >= 0 ? `+${activePoint.gradePct}` : activePoint.gradePct}% {activePoint.gradePct > 2 ? '▲ UPHILL' : activePoint.gradePct < -2 ? '▼ DESCENT' : 'FLAT'}
            </span>
            <span className="text-slate-400 hidden sm:inline">
              EST. SPEED: <strong className="text-white">{activePoint.speedKmh} KM/H</strong> ({activePoint.gear}th GEAR)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function CircuitMap({
  circuit,
  circuitId,
  year = 2026,
  showStats = true,
  showCornerDirectory = false,
  showCornerDetails = false,
  drivers = [],
  activeDriverCode = '',
  onHoverDriver,
  onCornerSelect,
  className = ''
}: CircuitMapProps) {
  const targetCircuit = (circuit || circuitId || 'monza').toLowerCase();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rawCircuitData, setRawCircuitData] = useState<any>(null);

  const [selectedCorner, setSelectedCorner] = useState<TransformedCorner | null>(null);
  const [viewMode, setViewMode] = useState<'SECTORS' | 'HEATMAP'>('SECTORS');
  const [showSectors, setShowSectors] = useState<boolean>(true);
  const [showDrs, setShowDrs] = useState<boolean>(true);
  const [showCornersLayer, setShowCornersLayer] = useState<boolean>(true);
  const [showSpeedTraps, setShowSpeedTraps] = useState<boolean>(true);
  const [showPitLane, setShowPitLane] = useState<boolean>(true);
  const [showElevation, setShowElevation] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [hoverElevationPct, setHoverElevationPct] = useState<number | null>(null);

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
    setRawCircuitData(null);
    setPan({ x: 0, y: 0 });
    setZoom(1.0);

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
          const trackDef = getTrackDefinition(targetCircuit);
          const points = trackDef.path.map(pt => ({ x: pt[0], y: pt[1] }));
          setRawCircuitData({
            circuit: {
              id: targetCircuit,
              name: trackDef.name || targetCircuit.replace(/_/g, ' ').toUpperCase(),
              country: trackDef.country || '',
              location: trackDef.country || '',
              year: year
            },
            sourceSession: "Heritage Circuit Registry",
            telemetryDriver: "HISTORIC",
            telemetryLap: 1,
            rotation: 0,
            layout: {
              source: "Circuit Registry Centerline",
              coordinateSystem: "registry_xy",
              pointCount: points.length,
              points: points
            },
            corners: []
          });
          setError(null);
        } else {
          setRawCircuitData(data);
          setError(null);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        const trackDef = getTrackDefinition(targetCircuit);
        const points = trackDef.path.map(pt => ({ x: pt[0], y: pt[1] }));
        setRawCircuitData({
          circuit: {
            id: targetCircuit,
            name: trackDef.name || targetCircuit.replace(/_/g, ' ').toUpperCase(),
            country: trackDef.country || '',
            location: trackDef.country || '',
            year: year
          },
          sourceSession: "Heritage Circuit Registry",
          telemetryDriver: "HISTORIC",
          telemetryLap: 1,
          rotation: 0,
          layout: {
            source: "Circuit Registry Centerline",
            coordinateSystem: "registry_xy",
            pointCount: points.length,
            points: points
          },
          corners: []
        });
        setError(null);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [targetCircuit, year]);

  // Memoize all expensive track geometry calculations to run ONLY when circuit data changes!
  const trackData = useMemo(() => {
    return computeTrackData(rawCircuitData, targetCircuit);
  }, [rawCircuitData, targetCircuit]);

  // Simulation Loop with wall-clock frame updates
  useEffect(() => {
    if (!isSimulating || !trackData || !trackData.transformedPoints || trackData.transformedPoints.length < 2) return;
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.08, (now - lastTime) / 1000);
      lastTime = now;
      const pts = trackData.transformedPoints;

      setSimProgress(prev => {
        const curIdx = Math.floor(prev * (pts.length - 1));
        const segCount = trackData.speedSegments?.length || 1;
        const segIdx = Math.floor((curIdx / Math.max(1, pts.length)) * segCount);
        const speed = trackData.speedSegments?.[segIdx]?.speed || 240;
        const speedFactor = speed / 240;
        const delta = (dt / 22) * speedFactor;
        const nextProgress = (prev + delta) % 1;

        const curPt = pts[curIdx];
        if (curPt) {
          for (const c of trackData.transformedCorners) {
            const d = Math.hypot(c.anchorX - curPt.x, c.anchorY - curPt.y);
            if (d < 16) {
              setSelectedCorner(c);
              break;
            }
          }
        }
        return nextProgress;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isSimulating, trackData]);

  const simCarPos = useMemo(() => {
    if (!trackData?.transformedPoints || trackData.transformedPoints.length < 2) return null;
    const pts = trackData.transformedPoints;
    const safeProgress = Math.max(0, Math.min(0.9999, isNaN(simProgress) ? 0 : simProgress));
    const floatIdx = safeProgress * (pts.length - 1);
    const i1 = Math.max(0, Math.min(pts.length - 1, Math.floor(floatIdx)));
    const i2 = Math.min(pts.length - 1, i1 + 1);
    const t = floatIdx - i1;
    const p1 = pts[i1];
    const p2 = pts[i2];
    if (!p1 || !p2 || typeof p1.x !== 'number' || typeof p2.x !== 'number' || isNaN(p1.x) || isNaN(p2.x)) return null;
    const x = p1.x + (p2.x - p1.x) * t;
    const y = p1.y + (p2.y - p1.y) * t;
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
    return { x, y, angle: isNaN(angle) ? 0 : angle };
  }, [simProgress, trackData]);

  const simTelemetry = useMemo(() => {
    return calculateSimTelemetry(
      simProgress,
      trackData?.transformedPoints,
      trackData?.transformedCorners,
      trackData?.speedSegments
    );
  }, [simProgress, trackData]);

  const hoverElevationPt = useMemo(() => {
    if (hoverElevationPct === null || !trackData?.transformedPoints || trackData.transformedPoints.length < 2) return null;
    const pts = trackData.transformedPoints;
    const idx = Math.min(pts.length - 1, Math.max(0, Math.floor((hoverElevationPct / 100) * pts.length)));
    const pt = pts[idx];
    if (!pt) return null;
    const altProfile = trackData.elevationProfile?.points;
    const altPt = altProfile ? altProfile[Math.min(altProfile.length - 1, Math.floor((hoverElevationPct / 100) * altProfile.length))] : null;
    return {
      x: pt.x,
      y: pt.y,
      alt: altPt?.altitudeM ?? 0
    };
  }, [hoverElevationPct, trackData]);

  const lastCornerClickTimeRef = useRef<number>(0);
  const handleCornerClick = (corner: TransformedCorner) => {
    setSelectedCorner(corner);
    if (onCornerSelect) {
      onCornerSelect(corner);
    }
  };

  const onCornerTrigger = (e: React.SyntheticEvent, corner: TransformedCorner) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastCornerClickTimeRef.current < 250) return;
    lastCornerClickTimeRef.current = now;
    handleCornerClick(corner);
  };

  const isMouseDownRef = useRef<boolean>(false);
  const startMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);
  const isTouchDownRef = useRef<boolean>(false);
  const startTouchPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [trackCursorPt, setTrackCursorPt] = useState<{
    x: number;
    y: number;
    sector: string;
    nearestCorner?: string;
  } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement | SVGElement | null;
    if (target && (target.closest?.('[data-corner="true"]') || target.closest?.('.group\\/anchor') || target.closest?.('.group\\/badge'))) {
      return;
    }
    isMouseDownRef.current = true;
    hasMovedRef.current = false;
    startMousePos.current = { x: e.clientX, y: e.clientY };
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMouseDownRef.current) {
      const dx = e.clientX - startMousePos.current.x;
      const dy = e.clientY - startMousePos.current.y;
      // 12px threshold ensures micro-movements during clicks never pan or drag the canvas
      if (!hasMovedRef.current && Math.hypot(dx, dy) < 12) return;
      hasMovedRef.current = true;
      setIsDragging(true);
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
      return;
    }

    // Keep indicator strictly locked on the track centerline when moving cursor
    if (svgRef.current && trackData && trackData.transformedPoints) {
      const rect = svgRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const rawX = ((e.clientX - rect.left) / rect.width) * 1000;
        const rawY = ((e.clientY - rect.top) / rect.height) * 700;

        const svgX = (rawX - 500 - pan.x) / zoom + 500;
        const svgY = (rawY - 350 - pan.y) / zoom + 350;

        const pts = trackData.transformedPoints;
        let minDistSq = Infinity;
        let closestPt = pts[0];
        let closestIndex = 0;

        for (let i = 0; i < pts.length; i++) {
          const dx = pts[i].x - svgX;
          const dy = pts[i].y - svgY;
          const dSq = dx * dx + dy * dy;
          if (dSq < minDistSq) {
            minDistSq = dSq;
            closestPt = pts[i];
            closestIndex = i;
          }
        }

        const dist = Math.sqrt(minDistSq);
        if (dist <= 140 && closestPt) {
          const ratio = closestIndex / (pts.length - 1);
          const sector = ratio < 0.33 ? 'S1' : ratio < 0.66 ? 'S2' : 'S3';

          let nearestCorner = '';
          let minCornerDist = Infinity;
          (trackData.transformedCorners || []).forEach(c => {
            const d = Math.hypot(c.anchorX - closestPt.x, c.anchorY - closestPt.y);
            if (d < minCornerDist) {
              minCornerDist = d;
              nearestCorner = `Turn ${c.number}${c.letter || ''}`;
            }
          });

          setTrackCursorPt({
            x: closestPt.x,
            y: closestPt.y,
            sector,
            nearestCorner: minCornerDist < 50 ? nearestCorner : undefined
          });
        } else {
          setTrackCursorPt(null);
        }
      }
    }
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    isMouseDownRef.current = false;
    setIsDragging(false);
    setTrackCursorPt(null);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement | SVGElement | null;
    if (target && (target.closest?.('[data-corner="true"]') || target.closest?.('.group\\/anchor') || target.closest?.('.group\\/badge'))) {
      return;
    }
    if (e.touches.length === 1) {
      isTouchDownRef.current = true;
      hasMovedRef.current = false;
      startTouchPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      dragStartRef.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouchDownRef.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - startTouchPos.current.x;
    const dy = e.touches[0].clientY - startTouchPos.current.y;
    if (zoom <= 1.05 && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
      isTouchDownRef.current = false;
      setIsDragging(false);
      return;
    }
    if (!hasMovedRef.current && Math.hypot(dx, dy) < 12) return;
    hasMovedRef.current = true;
    setIsDragging(true);
    setPan({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y
    });
  };

  const handleTouchEnd = () => {
    isTouchDownRef.current = false;
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
          Loading Circuit Map & Corner Data...
        </p>
        <p className="text-slate-400 font-mono text-xs mt-1">Circuit: {targetCircuit.toUpperCase()} ({year})</p>
      </div>
    );
  }

  if (error || !trackData) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[450px] bg-slate-950 border border-red-900/40 rounded-2xl p-8 text-center ${className}`}>
        <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 text-xl">
          ⚠️
        </div>
        <h3 className="text-red-400 font-bold text-lg font-mono tracking-wide">CIRCUIT DATA UNAVAILABLE</h3>
        <p className="text-slate-300 font-mono text-xs max-w-md mt-2 leading-relaxed">
          {error || `Circuit layout details are currently unavailable for "${targetCircuit.toUpperCase()}" (${year}).`}
        </p>
      </div>
    );
  }

  const {
    circuitMeta,
    layout,
    rotation,
    sourceSession,
    telemetryDriver,
    pathD,
    sectorPaths,
    transformedPoints,
    transformedCorners,
    startPoint,
    startAngle,
    cornersDict
  } = trackData;

  const trackMeta = getTrackDefinition(targetCircuit);
  const trackLengthKm = trackMeta?.length_km;

  const selectedKey = selectedCorner ? `t${selectedCorner.number}${selectedCorner.letter || ''}`.toLowerCase() : '';
  const detailedCornerObj = selectedCorner ? cornersDict[selectedKey] : null;

  const safeSectorPaths = sectorPaths || { pathS1: pathD || '', pathS2: '', pathS3: '' };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="stitch-card-machined rounded-2xl overflow-hidden shadow-2xl flex flex-col relative">
        {/* Stitch Telemetry HUD Header Strip */}
        <div className="px-4 py-2.5 bg-[#090D14] border-b border-white/10 flex items-center justify-between text-[10px] font-mono tracking-wider text-slate-400">
          <div className="flex items-center gap-2">
            <span className="stitch-live-dot" />
            <span className="text-cyan-400 font-bold uppercase tracking-wider">Track Map</span>
            <span className="text-slate-500">•</span>
            <span className="text-white font-semibold">Topology &amp; Corner Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="stitch-data-chip text-[9px] text-[#00FF9C] border-[#00FF9C]/30 font-bold">
              FASTF1 GPS VERIFIED
            </span>
            <span className="stitch-data-chip text-[9px] text-cyan-400 border-cyan-500/30 hidden sm:inline-flex">
              {transformedCorners.length} APEX VECTORS
            </span>
          </div>
        </div>

        {/* Static Header & Telemetry Layer Controls Bar */}
        {showStats && (
          <div className="px-3 py-2.5 sm:px-4 sm:py-3.5 bg-[#0D131F]/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 z-10">
            {/* Left: Circuit Identification & Clean Location Tag */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#05070A] border border-white/10 flex items-center justify-center text-base sm:text-lg shrink-0 shadow-inner">
                🏁
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h2 className="text-white font-black tracking-wide text-xs sm:text-base md:text-lg uppercase leading-tight font-display truncate max-w-[160px] sm:max-w-none">
                    {circuitMeta.name || targetCircuit}
                  </h2>
                  <span className="stitch-data-chip text-[8.5px] sm:text-[10px] text-cyan-400 border-cyan-500/30 font-bold whitespace-nowrap">
                    {circuitMeta.country || trackMeta?.country || 'Circuit'} • {circuitMeta.year || year}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-mono text-slate-400 mt-0.5">
                  {trackLengthKm && <span>{trackLengthKm} KM</span>}
                  {trackLengthKm && <span>•</span>}
                  <span>{transformedCorners.length} TURNS</span>
                  <span>•</span>
                  <span className="text-[#00FF9C] font-semibold">2 DRS</span>
                </div>
              </div>
            </div>

            {/* Right: Layer Toggles, Telemetry Modes & Canvas Zoom Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto overflow-x-auto scrollbar-none pb-1 sm:pb-0 flex-nowrap sm:flex-wrap">
              {/* Telemetry View Mode: Sectors vs Speed Heatmap */}
              <div className="flex items-center gap-1 bg-[#090D14] p-1 border border-white/10 rounded-xl shadow-inner">
                <button
                  type="button"
                  onClick={() => setViewMode('SECTORS')}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg uppercase tracking-wider transition-all duration-200 ${
                    viewMode === 'SECTORS'
                      ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="Sector 1/2/3 Split View"
                >
                  SECTORS
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('HEATMAP')}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg uppercase tracking-wider transition-all duration-200 ${
                    viewMode === 'HEATMAP'
                      ? 'bg-gradient-to-r from-[#FFD600] to-[#FF0055] text-black shadow-[0_0_10px_rgba(255,214,0,0.4)] font-black'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="Real-Time Telemetry Speed & Braking Heatmap"
                >
                  SPEED HEATMAP
                </button>
              </div>

              {/* Tactical Overlays Toggles */}
              <div className="flex items-center gap-1 bg-[#090D14] p-1 border border-white/10 rounded-xl shadow-inner">
                <button
                  type="button"
                  onClick={() => setShowDrs(!showDrs)}
                  className={`px-2 py-1 text-[10px] font-mono font-bold rounded-lg uppercase tracking-wider transition-all duration-200 ${
                    showDrs 
                      ? 'bg-[#00FF9C] text-black shadow-[0_0_10px_rgba(0,255,156,0.3)]' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="Toggle DRS Straight Zones"
                >
                  DRS
                </button>
                <button
                  type="button"
                  onClick={() => setShowCornersLayer(!showCornersLayer)}
                  className={`px-2 py-1 text-[10px] font-mono font-bold rounded-lg uppercase tracking-wider transition-all duration-200 ${
                    showCornersLayer 
                      ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="Toggle Corner Badges"
                >
                  TURNS
                </button>
                <button
                  type="button"
                  onClick={() => setShowSpeedTraps(!showSpeedTraps)}
                  className={`px-2 py-1 text-[10px] font-mono font-bold rounded-lg uppercase tracking-wider transition-all duration-200 ${
                    showSpeedTraps 
                      ? 'bg-[#FF007A] text-white shadow-[0_0_10px_rgba(255,0,122,0.3)]' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="Toggle Speed Trap Gate"
                >
                  TRAP
                </button>
                <button
                  type="button"
                  onClick={() => setShowPitLane(!showPitLane)}
                  className={`px-2 py-1 text-[10px] font-mono font-bold rounded-lg uppercase tracking-wider transition-all duration-200 ${
                    showPitLane 
                      ? 'bg-[#FFB800] text-black shadow-[0_0_10px_rgba(255,184,0,0.3)]' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="Toggle Pit Lane Detour & Limiter Zone"
                >
                  PIT
                </button>
              </div>

              {/* Telemetry Analysis: Elevation Profile & Hot Lap Simulation */}
              <div className="flex items-center gap-1 bg-[#090D14] p-1 border border-white/10 rounded-xl shadow-inner">
                <button
                  type="button"
                  onClick={() => setShowElevation(!showElevation)}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg uppercase tracking-wider transition-all duration-200 flex items-center gap-1 ${
                    showElevation 
                      ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_rgba(0,240,255,0.3)]' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="Toggle 2D Altitude & Incline Graph"
                >
                  <span>ALTITUDE 🏔️</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
                    isSimulating 
                      ? 'bg-[#00FF9C] text-black shadow-[0_0_12px_rgba(0,255,156,0.5)] font-black animate-pulse' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="Simulate Hot Lap with Live Speed and Corner Telemetry"
                >
                  <span>{isSimulating ? '⏸ PAUSE' : '▶ SIMULATE'}</span>
                </button>
              </div>

              {/* Canvas Zoom Controls */}
              <div className="flex items-center gap-1 bg-[#090D14] p-1 border border-white/10 rounded-xl shadow-inner">
                <button
                  onClick={() => setZoom(prev => Math.min(prev + 0.25, 3.0))}
                  className="w-7 h-7 rounded-lg bg-[#131A26] hover:bg-[#1A2333] border border-white/10 text-white font-mono font-bold flex items-center justify-center transition text-xs active:scale-[0.98]"
                  title="Zoom In"
                  aria-label="Zoom In"
                >
                  +
                </button>
                <button
                  onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.6))}
                  className="w-7 h-7 rounded-lg bg-[#131A26] hover:bg-[#1A2333] border border-white/10 text-white font-mono font-bold flex items-center justify-center transition text-xs active:scale-[0.98]"
                  title="Zoom Out"
                  aria-label="Zoom Out"
                >
                  -
                </button>
                <button
                  onClick={resetView}
                  className="px-2.5 h-7 rounded-lg bg-[#131A26] hover:bg-[#1A2333] border border-white/10 text-cyan-400 font-mono text-[10px] font-bold flex items-center justify-center transition shadow-sm whitespace-nowrap active:scale-[0.98]"
                  title="Reset View"
                  aria-label="Reset View"
                >
                  ↺ RESET
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fallback floating controls only if showStats is false */}
        {!showStats && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.25, 3.0))}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#090D14]/90 hover:bg-[#131A26] border border-white/10 text-white font-mono font-bold flex items-center justify-center transition backdrop-blur-md shadow-md text-xs sm:text-sm"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.6))}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#090D14]/90 hover:bg-[#131A26] border border-white/10 text-white font-mono font-bold flex items-center justify-center transition backdrop-blur-md shadow-md text-xs sm:text-sm"
              title="Zoom Out"
            >
              -
            </button>
            <button
              onClick={resetView}
              className="px-2 h-7 sm:px-2.5 sm:h-8 rounded-lg bg-[#090D14]/90 hover:bg-[#131A26] border border-white/10 text-cyan-400 font-mono text-[10px] sm:text-xs font-bold flex items-center justify-center transition backdrop-blur-md shadow-md"
              title="Reset View"
            >
              ↺ Reset
            </button>
          </div>
        )}

        {/* SVG Canvas Area: 100% unobstructed */}
        <div
          className="relative w-full h-[360px] sm:h-[440px] md:h-[540px] cursor-grab active:cursor-grabbing select-none overflow-hidden bg-[#05070A]"
          style={{ touchAction: zoom > 1.05 ? 'none' : 'pan-y' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Subtle Telemetry Grid Blueprint Pattern */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage: 'linear-gradient(to right, #00F0FF 1px, transparent 1px), linear-gradient(to bottom, #00F0FF 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />

          <svg
            ref={svgRef}
            viewBox="0 0 1000 700"
            className="w-full h-full relative z-10"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#00D2BE" floodOpacity="0.45" />
              </filter>
              <filter id="drsGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#00FF9C" floodOpacity="0.6" />
              </filter>
              <filter id="cornerGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#FF1E27" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Transform Group for Pan and Zoom */}
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} style={{ transformOrigin: '500px 350px' }}>
              {/* LAYER 0: Authentic Tarmac Roadbed Foundation */}
              <path
                d={pathD}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="24"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pointer-events-none"
              />
              <path
                d={pathD}
                fill="none"
                stroke="#090E17"
                strokeWidth="20"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pointer-events-none"
              />

              {/* LAYER 1 & 2: Dynamic Centerline (Sectors vs Telemetry Speed Heatmap) */}
              {viewMode === 'HEATMAP' ? (
                <g className="pointer-events-none select-none">
                  {/* Underlay glow */}
                  {(trackData.speedSegments || []).map((seg, idx) => (
                    <path
                      key={`h-glow-${idx}`}
                      d={seg.path}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.30"
                      filter="url(#glow)"
                    />
                  ))}
                  {/* Core speed gradient line */}
                  {(trackData.speedSegments || []).map((seg, idx) => (
                    <path
                      key={`h-core-${idx}`}
                      d={seg.path}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                </g>
              ) : showSectors ? (
                <>
                  {/* Sector Glow Paths */}
                  <path
                    d={safeSectorPaths.pathS1 || pathD}
                    fill="none"
                    stroke="#00F5D4"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.18"
                    filter="url(#glow)"
                  />
                  {safeSectorPaths.pathS2 && (
                    <path
                      d={safeSectorPaths.pathS2}
                      fill="none"
                      stroke="#FFB800"
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.18"
                      filter="url(#glow)"
                    />
                  )}
                  {safeSectorPaths.pathS3 && (
                    <path
                      d={safeSectorPaths.pathS3}
                      fill="none"
                      stroke="#D946EF"
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.18"
                      filter="url(#glow)"
                    />
                  )}
                  {/* Sector Primary Centerline */}
                  <path
                    d={safeSectorPaths.pathS1 || pathD}
                    fill="none"
                    stroke="#00F5D4"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {safeSectorPaths.pathS2 && (
                    <path
                      d={safeSectorPaths.pathS2}
                      fill="none"
                      stroke="#FFB800"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                  {safeSectorPaths.pathS3 && (
                    <path
                      d={safeSectorPaths.pathS3}
                      fill="none"
                      stroke="#D946EF"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </>
              ) : (
                <>
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#00F0FF"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.18"
                    filter="url(#glow)"
                  />
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}

              {/* LAYER 2.3: Pit Lane Detour & 80 KM/H Speed Limiter Radar */}
              {showPitLane && trackData.pitLaneData && (
                <g className="pointer-events-none select-none">
                  {/* Pit tarmac underlay */}
                  <path
                    d={trackData.pitLaneData.path}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.12)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={trackData.pitLaneData.path}
                    fill="none"
                    stroke="#090E17"
                    strokeWidth="11"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Pit 80 KM/H Speed Limiter Zone (Dashed Amber) */}
                  <path
                    d={trackData.pitLaneData.limiterZonePath}
                    fill="none"
                    stroke="#FFB800"
                    strokeWidth="3.5"
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                  />
                  {/* Pit In & Out Gate Indicators */}
                  <g transform={`translate(${trackData.pitLaneData.pitIn.x}, ${trackData.pitLaneData.pitIn.y}) rotate(${trackData.pitLaneData.pitIn.angle})`}>
                    <circle r="4" fill="#FFB800" stroke="#000" strokeWidth="1" />
                    <g transform="translate(0, -9) rotate(${-trackData.pitLaneData.pitIn.angle})">
                      <rect x="-24" y="-7" width="48" height="14" rx="3" fill="#090D14" stroke="#FFB800" strokeWidth="1" />
                      <text x="0" y="3" fill="#FFB800" fontSize="7.5" fontWeight="900" fontFamily="monospace" textAnchor="middle">PIT IN</text>
                    </g>
                  </g>
                  <g transform={`translate(${trackData.pitLaneData.pitOut.x}, ${trackData.pitLaneData.pitOut.y}) rotate(${trackData.pitLaneData.pitOut.angle})`}>
                    <circle r="4" fill="#00FF9C" stroke="#000" strokeWidth="1" />
                    <g transform="translate(0, 11) rotate(${-trackData.pitLaneData.pitOut.angle})">
                      <rect x="-26" y="-7" width="52" height="14" rx="3" fill="#090D14" stroke="#00FF9C" strokeWidth="1" />
                      <text x="0" y="3" fill="#00FF9C" fontSize="7.5" fontWeight="900" fontFamily="monospace" textAnchor="middle">PIT OUT</text>
                    </g>
                  </g>
                </g>
              )}

              {/* LAYER 2.5: High-Visibility DRS Zone Overlays */}
              {showDrs && (
                <g className="pointer-events-none select-none">
                  {safeSectorPaths.pathDrs1 && (
                    <>
                      <path
                        d={safeSectorPaths.pathDrs1}
                        fill="none"
                        stroke="#00FF9C"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.25"
                        filter="url(#drsGlow)"
                      />
                      <path
                        d={safeSectorPaths.pathDrs1}
                        fill="none"
                        stroke="#00FF9C"
                        strokeWidth="5"
                        strokeDasharray="8 5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  )}
                  {safeSectorPaths.pathDrs2 && (
                    <>
                      <path
                        d={safeSectorPaths.pathDrs2}
                        fill="none"
                        stroke="#00FF9C"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.25"
                        filter="url(#drsGlow)"
                      />
                      <path
                        d={safeSectorPaths.pathDrs2}
                        fill="none"
                        stroke="#00FF9C"
                        strokeWidth="5"
                        strokeDasharray="8 5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  )}
                </g>
              )}

              {/* LAYER 2.8: Authentic Apex Red & White Kerbs */}
              {transformedCorners.map(corner => {
                const cx = Number(corner.anchorX);
                const cy = Number(corner.anchorY);
                const lx = Number(corner.labelX);
                const ly = Number(corner.labelY);
                if (isNaN(cx) || isNaN(cy) || isNaN(lx) || isNaN(ly)) return null;

                const angle = Math.atan2(ly - cy, lx - cx) * (180 / Math.PI);
                return (
                  <g 
                    key={`kerb-${corner.number}${corner.letter}`}
                    transform={`translate(${cx}, ${cy}) rotate(${angle + 90})`}
                    className="pointer-events-none"
                  >
                    <rect x="-14" y="-3" width="7" height="4.5" rx="1" fill="#FF1E27" />
                    <rect x="-7" y="-3" width="7" height="4.5" rx="1" fill="#FFFFFF" />
                    <rect x="0" y="-3" width="7" height="4.5" rx="1" fill="#FF1E27" />
                    <rect x="7" y="-3" width="7" height="4.5" rx="1" fill="#FFFFFF" />
                  </g>
                );
              })}

              {/* LAYER 3: Start/Finish Line Gantry & Orientation Indicator */}
              {startPoint && !isNaN(Number(startPoint.x)) && !isNaN(Number(startPoint.y)) && (
                <g transform={`translate(${startPoint.x}, ${startPoint.y}) rotate(${isNaN(Number(startAngle)) ? 0 : startAngle})`}>
                  <line x1="0" y1="-16" x2="0" y2="16" stroke="#FFFFFF" strokeWidth="4.5" />
                  <line x1="4.5" y1="-16" x2="4.5" y2="16" stroke="#000000" strokeWidth="2.5" strokeDasharray="3 3" />
                  <polygon points="14,0 5,-7 5,7" fill="#00FF9C" filter="url(#glow)" />
                </g>
              )}

              {/* LAYER 3.5: Sectors (S1, S2, S3) & Speed Trap Gates */}
              {(() => {
                if (!transformedPoints || transformedPoints.length < 5) return null;
                const totalPts = transformedPoints.length;

                // Proportional sector and speed trap marker indices matching real track specifications
                const refPts = trackMeta?.path?.length || totalPts;
                const getPropIdx = (rawIdx: number | undefined, defRatio: number) => {
                  if (typeof rawIdx === 'number' && refPts > 0) {
                    const ratio = rawIdx / refPts;
                    return Math.floor(totalPts * Math.min(0.99, Math.max(0.01, ratio)));
                  }
                  return Math.floor(totalPts * defRatio);
                };

                const s1Idx = getPropIdx(trackMeta?.sectors?.[0]?.markerIndex, 0.33);
                const s2Idx = getPropIdx(trackMeta?.sectors?.[1]?.markerIndex, 0.66);
                const s3Idx = getPropIdx(trackMeta?.sectors?.[2]?.markerIndex, 0.95);
                const stIdx = getPropIdx(trackMeta?.speedTrapIndex, 0.18);

                const getPt = (idx: number) => {
                  const safeIdx = Math.max(0, Math.min(totalPts - 1, idx));
                  const p1 = transformedPoints[safeIdx];
                  const p2 = transformedPoints[(safeIdx + 1) % totalPts];
                  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
                  return { x: p1.x, y: p1.y, angle: isNaN(angle) ? 0 : angle };
                };

                const s1 = getPt(s1Idx);
                const s2 = getPt(s2Idx);
                const s3 = getPt(s3Idx);
                const st = getPt(stIdx);

                return (
                  <g className="pointer-events-none select-none">
                    {/* Sector 1 Boundary Line & Badge */}
                    {showSectors && (
                      <g transform={`translate(${s1.x}, ${s1.y}) rotate(${s1.angle})`}>
                        <line x1="0" y1="-14" x2="0" y2="14" stroke="#00F5D4" strokeWidth="3" />
                        <g transform={`translate(0, -20) rotate(${-s1.angle})`}>
                          <rect x="-14" y="-9" width="28" height="18" rx="4" fill="#090D16" stroke="#00F5D4" strokeWidth="1.5" />
                          <text x="0" y="3" fill="#00F5D4" fontSize="10" fontWeight="900" fontFamily="monospace" textAnchor="middle">S1</text>
                        </g>
                      </g>
                    )}

                    {/* Sector 2 Boundary Line & Badge */}
                    {showSectors && (
                      <g transform={`translate(${s2.x}, ${s2.y}) rotate(${s2.angle})`}>
                        <line x1="0" y1="-14" x2="0" y2="14" stroke="#FFB800" strokeWidth="3" />
                        <g transform={`translate(0, -20) rotate(${-s2.angle})`}>
                          <rect x="-14" y="-9" width="28" height="18" rx="4" fill="#090D16" stroke="#FFB800" strokeWidth="1.5" />
                          <text x="0" y="3" fill="#FFB800" fontSize="10" fontWeight="900" fontFamily="monospace" textAnchor="middle">S2</text>
                        </g>
                      </g>
                    )}

                    {/* Sector 3 Boundary Line & Badge */}
                    {showSectors && (
                      <g transform={`translate(${s3.x}, ${s3.y}) rotate(${s3.angle})`}>
                        <line x1="0" y1="-14" x2="0" y2="14" stroke="#D946EF" strokeWidth="3" />
                        <g transform={`translate(0, -20) rotate(${-s3.angle})`}>
                          <rect x="-14" y="-9" width="28" height="18" rx="4" fill="#090D16" stroke="#D946EF" strokeWidth="1.5" />
                          <text x="0" y="3" fill="#D946EF" fontSize="10" fontWeight="900" fontFamily="monospace" textAnchor="middle">S3</text>
                        </g>
                      </g>
                    )}

                    {/* Speed Trap Line & Badge */}
                    {showSpeedTraps && (
                      <g transform={`translate(${st.x}, ${st.y}) rotate(${st.angle})`}>
                        <line x1="0" y1="-16" x2="0" y2="16" stroke="#FF007A" strokeWidth="3.5" strokeDasharray="3 2" />
                        <g transform={`translate(0, 24) rotate(${-st.angle})`}>
                          <rect x="-38" y="-9" width="76" height="18" rx="4" fill="#090D16" stroke="#FF007A" strokeWidth="1.5" />
                          <text x="0" y="3" fill="#FF007A" fontSize="8.5" fontWeight="900" fontFamily="monospace" textAnchor="middle">⚡ SPEED TRAP</text>
                        </g>
                      </g>
                    )}
                  </g>
                );
              })()}

              {/* LAYER 4: Corner Leader Lines */}
              {showCornersLayer && transformedCorners.map(corner => {
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
                    className="pointer-events-none"
                  />
                );
              })}

              {/* LAYER 5: Corner Anchor Points on the Track */}
              {showCornersLayer && transformedCorners.map(corner => {
                const cx = Number(corner.anchorX);
                const cy = Number(corner.anchorY);

                if (isNaN(cx) || isNaN(cy)) return null;

                const isSelected = selectedCorner?.number === corner.number && selectedCorner?.letter === corner.letter;
                return (
                  <g 
                    key={`anchor-${corner.number}${corner.letter}`}
                    data-corner="true"
                    className="cursor-pointer group/anchor"
                    style={{ pointerEvents: 'all' }}
                    onClick={(e) => onCornerTrigger(e, corner)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    <title>{corner.name ? `${corner.name} (Apex ${corner.number}${corner.letter || ''})` : `Turn ${corner.number}${corner.letter || ''}`} • Click to inspect telemetry</title>
                    {/* Non-overlapping clean hit target */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="14"
                      fill="#FFFFFF"
                      fillOpacity="0.001"
                      style={{ pointerEvents: 'all', cursor: 'pointer' }}
                    />
                    {/* Selection outer radar ring */}
                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="12"
                        fill="none"
                        stroke="#00F0FF"
                        strokeWidth="2"
                        opacity="0.9"
                        filter="url(#glow)"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? '7' : '4.5'}
                      fill={corner.alignmentValid ? '#FF1E27' : '#EAB308'}
                      stroke={isSelected ? '#FFFFFF' : 'transparent'}
                      strokeWidth="2"
                      className="pointer-events-none transition-colors duration-150 group-hover/anchor:stroke-white"
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r="2"
                      fill="#FFFFFF"
                      className="pointer-events-none"
                    />
                  </g>
                );
              })}

              {/* LAYER 6: Corner Label Badges */}
              {showCornersLayer && transformedCorners.map(corner => {
                const lx = Number(corner.labelX);
                const ly = Number(corner.labelY);

                if (isNaN(lx) || isNaN(ly)) return null;

                const isSelected = selectedCorner?.number === corner.number && selectedCorner?.letter === corner.letter;
                const labelText = `${corner.number}${corner.letter}`;

                return (
                  <g
                    key={`badge-${corner.number}${corner.letter}`}
                    data-corner="true"
                    transform={`translate(${lx}, ${ly})`}
                    className="cursor-pointer group/badge select-none"
                    style={{ pointerEvents: 'all' }}
                    onClick={(e) => onCornerTrigger(e, corner)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    <title>{corner.name ? `${corner.name} (Turn ${labelText})` : `Turn ${labelText}`} • Click to view corner reconnaissance</title>
                    {/* Right-sized painted hit target (32x26px, never overlaps neighbor badges) */}
                    <rect
                      x="-16"
                      y="-13"
                      width="32"
                      height="26"
                      rx="6"
                      fill="#FFFFFF"
                      fillOpacity="0.001"
                      style={{ pointerEvents: 'all', cursor: 'pointer' }}
                    />
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
                      className="pointer-events-none transition-colors duration-150 group-hover/badge:stroke-white group-hover/badge:fill-red-950/80"
                    />

                    <text
                      x="0"
                      y="4"
                      fill="#FFFFFF"
                      fontSize="11"
                      fontWeight="800"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="pointer-events-none select-none transition-colors duration-150 group-hover/badge:fill-red-200"
                    >
                      {labelText}
                    </text>
                  </g>
                );
              })}

              {/* LAYER 7: Live Telemetry Driver Car Overlay (Continuous Wall-Clock Render) */}
              <LiveDriverOverlay
                drivers={drivers}
                transformedPoints={transformedPoints}
                activeDriverCode={activeDriverCode}
                onHoverDriver={onHoverDriver}
              />

              {/* LAYER 7.5: Track-Clamped Precision Telemetry Cursor */}
              {trackCursorPt && !isNaN(trackCursorPt.x) && !isNaN(trackCursorPt.y) && (
                <g
                  transform={`translate(${trackCursorPt.x}, ${trackCursorPt.y})`}
                  className="pointer-events-none select-none"
                >
                  {/* Precision Track Crosshair */}
                  <line x1="-9" y1="0" x2="9" y2="0" stroke="#00F5D4" strokeWidth="1.5" opacity="0.85" />
                  <line x1="0" y1="-9" x2="0" y2="9" stroke="#00F5D4" strokeWidth="1.5" opacity="0.85" />

                  {/* Centerline Clamped Pulse Dot */}
                  <circle r="4.5" fill="#00F5D4" stroke="#090D16" strokeWidth="2" filter="url(#glow)" />
                  <circle r="9" fill="none" stroke="#00F5D4" strokeWidth="1.5" opacity="0.6" />

                  {/* Track Telemetry Floating Readout */}
                  <g transform="translate(0, -20)">
                    <rect
                      x="-48"
                      y="-11"
                      width="96"
                      height="22"
                      rx="6"
                      fill="#090D16"
                      stroke="#00F5D4"
                      strokeWidth="1.5"
                      filter="url(#glow)"
                    />
                    <text
                      x="0"
                      y="4"
                      fill="#00F5D4"
                      fontSize="9"
                      fontWeight="900"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {trackCursorPt.sector} {trackCursorPt.nearestCorner ? `• ${trackCursorPt.nearestCorner}` : '• CENTERLINE'}
                    </text>
                  </g>
                </g>
              )}

              {/* LAYER 7.4: Synchronized Elevation Profile Scrub Cursor */}
              {hoverElevationPt && (
                <g transform={`translate(${hoverElevationPt.x}, ${hoverElevationPt.y})`} className="pointer-events-none">
                  <circle r="14" fill="none" stroke="#00F0FF" strokeWidth="2" opacity="0.85" className="animate-ping" />
                  <circle r="5.5" fill="#00F0FF" stroke="#090D14" strokeWidth="2" />
                  <g transform="translate(0, -18)">
                    <rect x="-44" y="-9" width="88" height="18" rx="4" fill="#090D14" stroke="#00F0FF" strokeWidth="1.2" />
                    <text x="0" y="3" fill="#00F0FF" fontSize="8.5" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                      ALT: {hoverElevationPt.alt >= 0 ? `+${hoverElevationPt.alt}` : hoverElevationPt.alt}M
                    </text>
                  </g>
                </g>
              )}

              {/* LAYER 7.8: Hot Lap Simulation Telemetry Car */}
              {isSimulating && simCarPos && (
                <g transform={`translate(${simCarPos.x}, ${simCarPos.y}) rotate(${simCarPos.angle})`} className="pointer-events-none">
                  {/* Wake aero trail */}
                  <line x1="-32" y1="0" x2="0" y2="0" stroke="#00F0FF" strokeWidth="7" opacity="0.35" strokeLinecap="round" />
                  <line x1="-16" y1="0" x2="0" y2="0" stroke="#00FF9C" strokeWidth="4" opacity="0.8" strokeLinecap="round" />
                  {/* Car chassis dot */}
                  <circle r="7.5" fill="#00F0FF" stroke="#FFFFFF" strokeWidth="2" filter="url(#glow)" />
                  <circle r="15" fill="none" stroke="#00F0FF" strokeWidth="1.5" className="animate-ping" opacity="0.6" />
                  {/* Vector nose cone */}
                  <polygon points="12,0 4,-5 4,5" fill="#FFFFFF" />
                </g>
              )}
            </g>

            {/* Tactical HUD Compass */}
            <g transform="translate(930, 65)" className="pointer-events-none select-none">
              <circle r="20" fill="#090D14" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              <circle r="16" fill="none" stroke="rgba(0,240,255,0.25)" strokeWidth="1" strokeDasharray="2 3" />
              <polygon points="0,-13 3.5,0 -3.5,0" fill="#FF3366" />
              <polygon points="0,13 3.5,0 -3.5,0" fill="rgba(255,255,255,0.3)" />
              <text x="0" y="-15" fill="#FF3366" fontSize="7.5" fontWeight="900" fontFamily="monospace" textAnchor="middle">N</text>
            </g>
          </svg>

          {/* Real-Time Hot Lap Simulation Floating Telemetry HUD */}
          {isSimulating && simTelemetry && (
            <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-4 sm:right-4 z-20 bg-[#090D14]/95 border border-[#00F0FF]/40 rounded-xl p-2 sm:p-2.5 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.2)] flex items-center justify-between gap-1.5 sm:gap-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#00FF9C] animate-pulse shadow-[0_0_8px_#00FF9C] shrink-0" />
                <span className="text-[9px] sm:text-[10px] font-mono font-black text-[#00F0FF] uppercase tracking-wider truncate">
                  <span className="hidden sm:inline">HOT LAP SIMULATOR</span>
                  <span className="sm:hidden">HOT LAP</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 hidden md:inline truncate">
                  LAP {simTelemetry.lapTimeStr} • {Math.round(simProgress * 100)}% DISTANCE
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 font-mono text-xs shrink-0">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-[8px] sm:text-[9px] text-slate-400 font-semibold hidden sm:inline">SPEED</span>
                  <span className="text-white font-black text-xs sm:text-sm whitespace-nowrap">
                    {simTelemetry.speed} <span className="text-[8px] sm:text-[9px] text-slate-400 font-normal">KM/H</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-[8px] sm:text-[9px] text-slate-400 font-semibold hidden sm:inline">GEAR</span>
                  <span className="text-[#00FF9C] font-black text-xs sm:text-sm">{simTelemetry.gear}</span>
                </div>
                <div className="flex items-center gap-1.5 hidden lg:flex">
                  <span className="text-[9px] text-slate-400 font-semibold">G-FORCE</span>
                  <span className="text-amber-400 font-black text-xs sm:text-sm">{simTelemetry.gForce}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-[8px] sm:text-[9px] text-slate-400 font-semibold">
                    <span className="sm:hidden">THR</span>
                    <span className="hidden sm:inline">THROTTLE</span>
                  </span>
                  <div className="w-8 sm:w-14 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-[#00FF9C] transition-all duration-75 ${simTelemetry.throttle > 50 ? 'shadow-[0_0_8px_#00FF9C]' : ''}`}
                      style={{ width: `${simTelemetry.throttle}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-[8px] sm:text-[9px] text-slate-400 font-semibold">
                    <span className="sm:hidden">BRK</span>
                    <span className="hidden sm:inline">BRAKE</span>
                  </span>
                  <div className="w-8 sm:w-12 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-[#FF3366] transition-all duration-75 ${simTelemetry.brake > 0 ? 'shadow-[0_0_10px_#FF3366]' : ''}`}
                      style={{ width: `${simTelemetry.brake}%` }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSimulating(false)}
                  className="px-2 sm:px-2.5 py-1 bg-red-600/80 hover:bg-red-500 text-white rounded-lg text-[9px] sm:text-[10px] font-mono font-bold uppercase transition active:scale-[0.98] shrink-0"
                >
                  <span className="hidden sm:inline">STOP ✕</span>
                  <span className="sm:hidden">✕</span>
                </button>
              </div>
            </div>
          )}

          {/* Floating Visual Map Legend Overlay — Desktop / Tablet ONLY */}
          <div className={`hidden sm:block absolute bottom-3 left-3 z-20 pointer-events-none glass-panel p-2 sm:p-2.5 shadow-xl text-[10px] sm:text-xs max-w-sm ${isSimulating ? 'hidden sm:block' : 'block'}`}>
            <div className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mb-1.5 flex items-center justify-between font-mono">
              <div className="flex items-center gap-1.5">
                <span className="stitch-live-dot"></span>
                <span>{viewMode === 'HEATMAP' ? 'VELOCITY SPECTRUM TELEMETRY' : 'MAP TELEMETRY SPEC'}</span>
              </div>
              {trackData.pitLaneData && (
                <span className="text-[8.5px] text-[#FFB800] hidden sm:inline">PIT LOSS: ~{trackData.pitLaneData.lossSeconds}s</span>
              )}
            </div>

            {viewMode === 'HEATMAP' ? (
              <div className="flex flex-col gap-1 font-mono text-slate-300">
                <div className="h-2 rounded-full w-full bg-gradient-to-r from-[#0088FF] via-[#00F5D4] via-[#FFD600] via-[#FF6B00] to-[#FF0055] shadow-inner" />
                <div className="flex items-center justify-between text-[8px] text-slate-400">
                  <span>🟦 75 KM/H (APEX)</span>
                  <span>🟨 200 KM/H</span>
                  <span>🟥 345 KM/H (V-MAX)</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3.5 gap-y-1.5 font-mono text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#00FF9C] rounded-full shadow-[0_0_6px_#00FF9C]"></span>
                  <span>Start / Finish</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#00F5D4] rounded-full shadow-[0_0_6px_#00F5D4]"></span>
                  <span>Sector 1</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#FFB800] rounded-full shadow-[0_0_6px_#FFB800]"></span>
                  <span>Sector 2</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#D946EF] rounded-full shadow-[0_0_6px_#D946EF]"></span>
                  <span>Sector 3</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-b border-dashed border-[#00FF9C]"></span>
                  <span className="text-[#00FF9C]">DRS Zone</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-b border-dashed border-[#FFB800]"></span>
                  <span className="text-[#FFB800]">Pit Limiter</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dedicated Mobile Track Legend Bar (< sm) — Keeps Canvas 100% Unobstructed */}
        <div className="sm:hidden px-3.5 py-2 bg-[#090D14] border-t border-white/10 flex items-center justify-between text-[9px] font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="stitch-live-dot" />
            <span className="font-bold uppercase tracking-wider text-slate-300">
              {viewMode === 'HEATMAP' ? 'VELOCITY SPECTRUM' : 'TRACK SPEC'}
            </span>
          </div>

          {viewMode === 'HEATMAP' ? (
            <div className="flex items-center gap-2 font-mono text-[8.5px]">
              <div className="h-1.5 w-20 rounded-full bg-gradient-to-r from-[#0088FF] via-[#FFD600] to-[#FF0055]" />
              <span className="text-cyan-400 font-bold">75-345 KM/H</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 font-mono text-[9px] text-slate-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-1 bg-[#00FF9C] rounded-sm"></span>S/F
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-1 bg-[#00F5D4] rounded-sm"></span>S1
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-1 bg-[#FFB800] rounded-sm"></span>S2
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-1 bg-[#D946EF] rounded-sm"></span>S3
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 border-b border-dashed border-[#00FF9C]"></span>DRS
              </span>
            </div>
          )}
        </div>

        {/* Interactive Circuit Elevation & Topography Profile Panel */}
        {showElevation && trackData?.elevationProfile && (
          <ElevationProfilePanel
            profile={trackData.elevationProfile}
            trackLengthKm={trackLengthKm}
            hoverPct={hoverElevationPct}
            onHoverPct={setHoverElevationPct}
          />
        )}

        {/* Docked Tactical Corner Reconnaissance Drawer (Opens instantly when an apex is clicked) */}
        {selectedCorner && detailedCornerObj && (
          <div className="bg-[#0B1019] border-t border-white/10 p-3.5 sm:p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 z-10">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-800 border border-red-500/80 flex items-center justify-center font-mono font-black text-white text-base shadow-[0_0_14px_rgba(239,68,68,0.4)] shrink-0">
                T{selectedCorner.number}{selectedCorner.letter || ''}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                    {detailedCornerObj.name || `Turn ${selectedCorner.number}`}
                  </h4>
                  {detailedCornerObj.type && (
                    <span className="stitch-data-chip text-[9px] text-[#00F0FF] border-[#00F0FF]/30 font-bold">
                      {detailedCornerObj.type}
                    </span>
                  )}
                  {detailedCornerObj.direction && (
                    <span className="stitch-data-chip text-[9px] text-slate-300">
                      {detailedCornerObj.direction}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-sans mt-0.5 truncate max-w-xl">
                  {detailedCornerObj.characteristics || detailedCornerObj.description?.slice(0, 110) || 'Telemetry Sector Apex'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full md:w-auto justify-between md:justify-end shrink-0">
              {detailedCornerObj.technical?.entrySpeed && (
                <div className="bg-[#05070A] border border-white/10 px-2.5 sm:px-3 py-1.5 rounded-xl text-center min-w-[65px] sm:min-w-[70px]">
                  <span className="text-[8.5px] sm:text-[9px] font-mono text-slate-400 block font-semibold">ENTRY SPEED</span>
                  <span className="text-xs font-mono font-black text-white">{detailedCornerObj.technical.entrySpeed}</span>
                </div>
              )}
              {detailedCornerObj.technical?.typicalGear && (
                <div className="bg-[#05070A] border border-white/10 px-2.5 sm:px-3 py-1.5 rounded-xl text-center min-w-[55px] sm:min-w-[60px]">
                  <span className="text-[8.5px] sm:text-[9px] font-mono text-slate-400 block font-semibold">GEAR</span>
                  <span className="text-xs font-mono font-black text-[#00FF9C]">{detailedCornerObj.technical.typicalGear}</span>
                </div>
              )}
              {detailedCornerObj.technical?.brakingIntensity && (
                <div className="bg-[#05070A] border border-white/10 px-2.5 sm:px-3 py-1.5 rounded-xl text-center min-w-[60px] sm:min-w-[65px]">
                  <span className="text-[8.5px] sm:text-[9px] font-mono text-slate-400 block font-semibold">G-FORCE</span>
                  <span className="text-xs font-mono font-black text-[#FF3366]">{detailedCornerObj.technical.brakingIntensity}</span>
                </div>
              )}
              {detailedCornerObj.technical?.drs && (
                <div className="bg-[#05070A] border border-white/10 px-2.5 sm:px-3 py-1.5 rounded-xl text-center min-w-[70px] hidden sm:block">
                  <span className="text-[8.5px] sm:text-[9px] font-mono text-slate-400 block font-semibold">AERO / DRS</span>
                  <span className="text-xs font-mono font-black text-[#00F0FF]">{detailedCornerObj.technical.drs}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 ml-auto md:ml-0">
                <button
                  type="button"
                  onClick={() => {
                    if (onCornerSelect) onCornerSelect(selectedCorner);
                  }}
                  className="px-3 py-1.5 sm:py-2 bg-[#00F0FF] hover:bg-[#33F5FF] text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_12px_rgba(0,240,255,0.25)] flex items-center gap-1 active:scale-[0.98]"
                >
                  <span>RECON 🔍</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCorner(null)}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs transition-colors"
                  title="Dismiss Inspector"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Corner Directory Navigation Bar (Hidden by default, shown via modal on photo click) */}
      {showCornerDirectory && transformedCorners.length > 0 && (
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

      {/* Full Detailed Corner Breakdown Panel (Hidden by default, shown via modal on photo click) */}
      {showCornerDetails && detailedCornerObj && (
        <CornerDetails
          corner={detailedCornerObj}
          circuitName={circuitMeta.name || targetCircuit}
        />
      )}
    </div>
  );
}

export default CircuitMap;

