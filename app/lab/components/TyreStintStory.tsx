'use client';

import React, { useState, useMemo } from 'react';
import { PitStopItem, DriverResultItem, LapRecord } from '../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { getTeamColor } from '../../utils/api';
import {
  CIRCUIT_PIRELLI_ALLOCATIONS,
  CircuitPirelliNomination
} from './TyreDegradationLab';

interface TyreStintStoryProps {
  pitStops: PitStopItem[];
  driversList: DriverResultItem[];
  totalRaceLaps: number;
  driverALaps: LapRecord[];
  driverBLaps: LapRecord[];
  selectedDriverA: string;
  selectedDriverB: string;
  circuitId?: string;
  isLoading: boolean;
}

interface StintData {
  stintNumber: number;
  startLap: number;
  endLap: number;
  totalLaps: number;
  cleanLaps: number;
  avgPaceSec: number | null;
  wearSlopeSecPerLap: number | null;
  fuelCorrectedSlope: number | null;
  inferredCompound: 'SOFT' | 'MEDIUM' | 'HARD' | 'UNKNOWN';
}

export const TyreStintStory: React.FC<TyreStintStoryProps> = ({
  pitStops,
  driversList,
  totalRaceLaps: _totalRaceLaps,
  driverALaps,
  driverBLaps,
  selectedDriverA,
  selectedDriverB,
  circuitId = 'silverstone',
  isLoading
}) => {
  const [fuelBurnCorrection, setFuelBurnCorrection] = useState<number>(0.055);
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'position' | 'degAsc' | 'lapsDesc'>('position');

  const driverAObj = useMemo(
    () => driversList.find((d) => d.driverId === selectedDriverA),
    [driversList, selectedDriverA]
  );
  const driverBObj = useMemo(
    () => driversList.find((d) => d.driverId === selectedDriverB),
    [driversList, selectedDriverB]
  );

  // Circuit nomination
  const nomination: CircuitPirelliNomination = useMemo(() => {
    return (
      CIRCUIT_PIRELLI_ALLOCATIONS[circuitId] || {
        circuitId,
        hard: 'C2',
        medium: 'C3',
        soft: 'C4',
        asphaltSeverity: 'MEDIUM ABRASION'
      }
    );
  }, [circuitId]);

  // Group pit stops by driver
  const stopsByDriver = useMemo(() => {
    const map = new Map<string, PitStopItem[]>();
    pitStops.forEach((p) => {
      if (!map.has(p.driverId)) map.set(p.driverId, []);
      map.get(p.driverId)!.push(p);
    });
    return map;
  }, [pitStops]);

  // Segment a driver's laps into stints based on official pit stops
  const extractDriverStints = React.useCallback((
    laps: LapRecord[],
    driverStops: PitStopItem[] | undefined
  ): StintData[] => {
    if (laps.length === 0) return [];

    const sortedStops = [...(driverStops || [])].sort((a, b) => a.lap - b.lap);
    const stints: StintData[] = [];

    let currentStart = 1;
    const stopLaps = sortedStops.map((s) => s.lap);

    const boundaryLaps = [...stopLaps, laps.length];

    boundaryLaps.forEach((endLap, idx) => {
      if (endLap < currentStart) return;

      const stintLaps = laps.filter(
        (l) => l.lapNumber >= currentStart && l.lapNumber <= endLap
      );
      const cleanLaps = stintLaps.filter(
        (l) => l.time !== null && !l.isOutlier && !l.isPitStop && l.time > 30
      );

      let avgPaceSec: number | null = null;
      let rawSlope: number | null = null;
      let fuelCorrectedSlope: number | null = null;

      if (cleanLaps.length >= 2) {
        avgPaceSec =
          cleanLaps.reduce((sum, l) => sum + l.time!, 0) / cleanLaps.length;

        // Simple linear regression slope across clean laps
        const n = cleanLaps.length;
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;

        cleanLaps.forEach((l, i) => {
          sumX += i;
          sumY += l.time!;
          sumXY += i * l.time!;
          sumXX += i * i;
        });

        const denominator = n * sumXX - sumX * sumX;
        if (denominator !== 0) {
          rawSlope = (n * sumXY - sumX * sumY) / denominator;
          // Fuel burnoff correction: car gets faster by fuelBurnCorrection each lap,
          // so true tyre wear slope is rawSlope + fuelBurnCorrection
          fuelCorrectedSlope = rawSlope + fuelBurnCorrection;
        }
      }

      // Heuristic compound inference
      const length = endLap - currentStart + 1;
      let inferred: 'SOFT' | 'MEDIUM' | 'HARD' | 'UNKNOWN' = 'UNKNOWN';
      if (length <= 16) inferred = 'SOFT';
      else if (length <= 32) inferred = 'MEDIUM';
      else inferred = 'HARD';

      stints.push({
        stintNumber: idx + 1,
        startLap: currentStart,
        endLap,
        totalLaps: length,
        cleanLaps: cleanLaps.length,
        avgPaceSec,
        wearSlopeSecPerLap: rawSlope,
        fuelCorrectedSlope,
        inferredCompound: inferred
      });

      currentStart = endLap + 1;
    });

    return stints;
  }, [fuelBurnCorrection]);

  const stintsA = useMemo(
    () => extractDriverStints(driverALaps, stopsByDriver.get(selectedDriverA)),
    [driverALaps, stopsByDriver, selectedDriverA, extractDriverStints]
  );

  const stintsB = useMemo(
    () => extractDriverStints(driverBLaps, stopsByDriver.get(selectedDriverB)),
    [driverBLaps, stopsByDriver, selectedDriverB, extractDriverStints]
  );

  // Field Stint Overview
  const fieldStintsSummary = useMemo(() => {
    return driversList.map((d) => {
      const stops = stopsByDriver.get(d.driverId) || [];
      const totalStints = stops.length + 1;
      const stopLapsStr = stops.map((s) => `L${s.lap}`).join(', ') || 'No stops';

      return {
        driverId: d.driverId,
        code: d.code,
        name: `${d.givenName} ${d.familyName}`,
        constructorName: d.constructorName,
        constructorId: d.constructorId || 'unknown',
        position: parseInt(d.position, 10) || 99,
        lapsCompleted: d.lapsCompleted,
        totalStints,
        stopLapsStr,
        status: d.status
      };
    });
  }, [driversList, stopsByDriver]);

  const sortedField = useMemo(() => {
    return [...fieldStintsSummary]
      .filter((d) => {
        if (filterTeam === 'all') return true;
        return d.constructorName === filterTeam;
      })
      .sort((a, b) => {
        if (sortBy === 'position') return a.position - b.position;
        if (sortBy === 'lapsDesc') return b.lapsCompleted - a.lapsCompleted;
        return a.totalStints - b.totalStints;
      });
  }, [fieldStintsSummary, filterTeam, sortBy]);

  const uniqueTeams = useMemo(() => {
    const set = new Set<string>();
    driversList.forEach((d) => {
      if (d.constructorName) set.add(d.constructorName);
    });
    return Array.from(set).sort();
  }, [driversList]);

  return (
    <div className="space-y-5">
      {/* 1. Cockpit Action Strip */}
      <div className="flex flex-col gap-3 p-3 rounded-xl border border-zinc-800/80 bg-zinc-950/70 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="font-mono text-xs font-black uppercase tracking-wider text-amber-400">
              TYRE STINTS &amp; DEGRADATION
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Stint longevity segmentation, fuel-compensated wear slopes (&Delta;s/lap), and compound allocation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span className="text-[10px] uppercase">Fuel Correction:</span>
          <select
            value={fuelBurnCorrection}
            onChange={(e) => setFuelBurnCorrection(parseFloat(e.target.value))}
            aria-label="Fuel Burn Correction Factor"
            className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs font-bold text-cyan-400 focus:outline-none"
          >
            <option value="0.045">+0.045s/lap (Low Penalty)</option>
            <option value="0.055">+0.055s/lap (Standard Baseline)</option>
            <option value="0.065">+0.065s/lap (High Energy)</option>
          </select>
        </div>
      </div>

      {/* 2. Compact Pirelli Compound Allocation Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold uppercase text-[10px]">Pirelli Allocation:</span>
          <span className="text-zinc-400 text-[11px]">({nomination.asphaltSeverity})</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-950/80 border border-zinc-700">
            <span className="text-zinc-200">⚪ Hard:</span>
            <span className="font-bold text-white">{nomination.hard}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/30 border border-amber-600/50">
            <span className="text-amber-400">🟡 Medium:</span>
            <span className="font-bold text-amber-300">{nomination.medium}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/30 border border-red-600/50">
            <span className="text-red-400">🔴 Soft:</span>
            <span className="font-bold text-red-300">{nomination.soft}</span>
          </div>
        </div>
      </div>

      {/* 3. Head-to-Head Stint Breakdown (Driver A vs Driver B) */}
      <Card variant="default" padding="md" className="bg-zinc-900/80">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <span className="font-mono text-[10px] font-black uppercase tracking-wider text-cyan-400">
              STINT-BY-STINT TRACE
            </span>
            <h3 className="font-display text-base font-bold text-zinc-100 sm:text-lg">
              Recorded Stints: {driverAObj?.code || 'Driver 1'} vs {driverBObj?.code || 'Driver 2'}
            </h3>
            <p className="text-xs text-zinc-400">
              Fuel-corrected wear slope (&Delta;s/lap) measures true pace loss independent of car lightening as fuel burns off.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Driver A Stints */}
          <div className="rounded-lg border border-cyan-500/40 bg-zinc-950/70 p-4">
            <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
              <span className="font-mono text-xs font-bold text-cyan-400">
                DRIVER 1: {driverAObj?.code} ({driverAObj?.constructorName})
              </span>
              <span className="font-mono text-xs text-zinc-400">
                {stintsA.length} Recorded Stint{stintsA.length !== 1 ? 's' : ''}
              </span>
            </div>

            {stintsA.length === 0 ? (
              <p className="text-xs text-zinc-400 py-6 text-center font-mono">
                No stint telemetry available for {driverAObj?.code || 'Driver 1'}.
              </p>
            ) : (
              <div className="space-y-3">
                {stintsA.map((stint) => (
                  <div
                    key={`stint-a-${stint.stintNumber}`}
                    className="rounded border border-zinc-800 bg-zinc-900/60 p-3 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-zinc-200 mb-2">
                      <span>
                        STINT #{stint.stintNumber} &bull; Laps {stint.startLap} &rarr; {stint.endLap} ({stint.totalLaps} Laps)
                      </span>
                      <Badge variant="zinc" size="sm">
                        {stint.inferredCompound} (EST.)
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 border-t border-zinc-800/60 pt-2">
                      <div>
                        Clean Pace:{' '}
                        <strong className="text-zinc-100">
                          {stint.avgPaceSec ? `${stint.avgPaceSec.toFixed(3)}s` : '—'}
                        </strong>
                      </div>
                      <div>
                        Clean Laps Run:{' '}
                        <strong className="text-zinc-100">
                          {stint.cleanLaps} of {stint.totalLaps}
                        </strong>
                      </div>
                      <div>
                        Raw Wear Slope:{' '}
                        <strong className="text-zinc-100">
                          {stint.wearSlopeSecPerLap !== null
                            ? `${stint.wearSlopeSecPerLap > 0 ? '+' : ''}${stint.wearSlopeSecPerLap.toFixed(3)}s/lap`
                            : '—'}
                        </strong>
                      </div>
                      <div>
                        Fuel-Corrected Wear:{' '}
                        <strong className="text-amber-400">
                          {stint.fuelCorrectedSlope !== null
                            ? `+${stint.fuelCorrectedSlope.toFixed(3)}s/lap`
                            : '—'}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Driver B Stints */}
          <div className="rounded-lg border border-red-500/40 bg-zinc-950/70 p-4">
            <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
              <span className="font-mono text-xs font-bold text-red-400">
                DRIVER 2: {driverBObj?.code} ({driverBObj?.constructorName})
              </span>
              <span className="font-mono text-xs text-zinc-400">
                {stintsB.length} Recorded Stint{stintsB.length !== 1 ? 's' : ''}
              </span>
            </div>

            {stintsB.length === 0 ? (
              <p className="text-xs text-zinc-400 py-6 text-center font-mono">
                No stint telemetry available for {driverBObj?.code || 'Driver 2'}.
              </p>
            ) : (
              <div className="space-y-3">
                {stintsB.map((stint) => (
                  <div
                    key={`stint-b-${stint.stintNumber}`}
                    className="rounded border border-zinc-800 bg-zinc-900/60 p-3 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-zinc-200 mb-2">
                      <span>
                        STINT #{stint.stintNumber} &bull; Laps {stint.startLap} &rarr; {stint.endLap} ({stint.totalLaps} Laps)
                      </span>
                      <Badge variant="zinc" size="sm">
                        {stint.inferredCompound} (EST.)
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 border-t border-zinc-800/60 pt-2">
                      <div>
                        Clean Pace:{' '}
                        <strong className="text-zinc-100">
                          {stint.avgPaceSec ? `${stint.avgPaceSec.toFixed(3)}s` : '—'}
                        </strong>
                      </div>
                      <div>
                        Clean Laps Run:{' '}
                        <strong className="text-zinc-100">
                          {stint.cleanLaps} of {stint.totalLaps}
                        </strong>
                      </div>
                      <div>
                        Raw Wear Slope:{' '}
                        <strong className="text-zinc-100">
                          {stint.wearSlopeSecPerLap !== null
                            ? `${stint.wearSlopeSecPerLap > 0 ? '+' : ''}${stint.wearSlopeSecPerLap.toFixed(3)}s/lap`
                            : '—'}
                        </strong>
                      </div>
                      <div>
                        Fuel-Corrected Wear:{' '}
                        <strong className="text-amber-400">
                          {stint.fuelCorrectedSlope !== null
                            ? `+${stint.fuelCorrectedSlope.toFixed(3)}s/lap`
                            : '—'}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 4. Field Stint Matrix Table */}
      <Card variant="default" padding="md" className="bg-zinc-900/80">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <span className="font-mono text-[10px] font-black uppercase tracking-wider text-amber-400">
              FIELD STINT MATRIX
            </span>
            <h3 className="font-display text-base font-bold text-zinc-100 sm:text-lg">
              Stint Counts &amp; Pit Stop Laps Across the Grid
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-zinc-400">Filter Team:</span>
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-zinc-200 focus:outline-none"
              >
                <option value="all">All Teams</option>
                {uniqueTeams.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-zinc-400">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-zinc-200 focus:outline-none"
              >
                <option value="position">Finishing Position</option>
                <option value="lapsDesc">Laps Completed</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-8 text-center font-mono text-xs text-amber-400 animate-pulse">
            Analyzing stint wear and pit stop chronology...
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] uppercase text-zinc-400">
                <th className="py-2.5">Pos</th>
                <th className="py-2.5">Driver</th>
                <th className="py-2.5">Constructor</th>
                <th className="py-2.5 text-center">Completed Laps</th>
                <th className="py-2.5 text-center">Stints Executed</th>
                <th className="py-2.5">Pit Stop In-Laps</th>
                <th className="py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {sortedField.map((driver) => {
                const teamColor = driver.constructorId
                  ? getTeamColor(driver.constructorId)
                  : '#8791A3';

                return (
                  <tr key={`matrix-${driver.driverId}`} className="hover:bg-zinc-850/40">
                    <td className="py-2.5 font-bold text-zinc-300">
                      P{driver.position <= 25 ? driver.position : '—'}
                    </td>
                    <td className="py-2.5 font-bold text-zinc-100">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-1 rounded-full"
                          style={{ backgroundColor: teamColor }}
                        />
                        <span>{driver.code}</span>
                        <span className="text-zinc-400 font-normal hidden sm:inline">
                          ({driver.name})
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 text-zinc-400">{driver.constructorName}</td>
                    <td className="py-2.5 text-center text-zinc-200">
                      {driver.lapsCompleted}
                    </td>
                    <td className="py-2.5 text-center font-bold text-amber-400">
                      {driver.totalStints} Stint{driver.totalStints !== 1 ? 's' : ''}
                    </td>
                    <td className="py-2.5 text-zinc-300">{driver.stopLapsStr}</td>
                    <td className="py-2.5 text-right text-[11px] text-zinc-400">
                      {driver.status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </Card>

      {/* 5. Data Limitations & Provenance Notice */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4 text-xs font-mono text-zinc-400 space-y-1">
        <div className="flex items-center gap-2 font-bold text-zinc-300">
          <span>ℹ️</span>
          <span>DATA PROVENANCE &amp; METHODOLOGY LIMITATIONS:</span>
        </div>
        <p>
          • <strong>Recorded Facts:</strong> Stint start/end boundaries and lap records derive from official FIA pit chronology.
        </p>
        <p>
          • <strong>Inferred Compounds:</strong> Official historical Ergast/Jolpica records do not include per-lap tyre compound telemetry. Tyre compound tags are heuristic estimates inferred from stint length and circuit nominations.
        </p>
        <p>
          • <strong>Fuel Burnoff Modeling:</strong> Fuel correction uses the standard F1 engineering rate (+0.055s per lap of fuel burned). True fuel consumption varies by power unit mode and safety car periods.
        </p>
      </div>
    </div>
  );
};
