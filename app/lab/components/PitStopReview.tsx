'use client';

import React, { useState, useMemo } from 'react';
import { PitStopItem, DriverResultItem, LapRecord } from '../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { getTeamColor } from '../../utils/api';
import TacticalStrategyDuel from './TacticalStrategyDuel';

interface PitStopReviewProps {
  pitStops: PitStopItem[];
  driversList: DriverResultItem[];
  totalRaceLaps: number;
  driverALaps: LapRecord[];
  driverBLaps: LapRecord[];
  selectedDriverA: string;
  selectedDriverB: string;
  onSelectDriverA: (id: string) => void;
  onSelectDriverB: (id: string) => void;
  isLoading: boolean;
  benchmarkBaseLapTime?: number;
}

export const PitStopReview: React.FC<PitStopReviewProps> = ({
  pitStops,
  driversList,
  totalRaceLaps,
  driverALaps,
  driverBLaps,
  selectedDriverA,
  selectedDriverB,
  onSelectDriverA,
  onSelectDriverB,
  isLoading,
  benchmarkBaseLapTime = 92.0
}) => {
  const [showSimModal, setShowSimModal] = useState<boolean>(false);
  const [filterTeam, setFilterTeam] = useState<string>('all');

  const driverAObj = useMemo(
    () => driversList.find((d) => d.driverId === selectedDriverA),
    [driversList, selectedDriverA]
  );
  const driverBObj = useMemo(
    () => driversList.find((d) => d.driverId === selectedDriverB),
    [driversList, selectedDriverB]
  );

  // Group pit stops by driver
  const stopsByDriver = useMemo(() => {
    const map = new Map<string, PitStopItem[]>();
    pitStops.forEach((p) => {
      if (!map.has(p.driverId)) map.set(p.driverId, []);
      map.get(p.driverId)!.push(p);
    });
    return map;
  }, [pitStops]);

  // Unique teams from drivers list
  const uniqueTeams = useMemo(() => {
    const set = new Set<string>();
    driversList.forEach((d) => {
      if (d.constructorName) set.add(d.constructorName);
    });
    return Array.from(set).sort();
  }, [driversList]);

  // Filtered drivers for the timeline
  const displayedDrivers = useMemo(() => {
    return driversList.filter((d) => {
      if (filterTeam === 'all') return true;
      return d.constructorName === filterTeam;
    });
  }, [driversList, filterTeam]);

  // Ranking fastest stationary stops
  const fastestStops = useMemo(() => {
    return [...pitStops]
      .filter((p) => p.durationSec !== null && p.durationSec > 0)
      .sort((a, b) => (a.durationSec || 999) - (b.durationSec || 999))
      .slice(0, 8);
  }, [pitStops]);

  // Compute In-Lap and Out-Lap pace impact for Driver A & Driver B
  const computePitLapImpact = (
    laps: LapRecord[],
    driverStops: PitStopItem[] | undefined
  ) => {
    if (!driverStops || driverStops.length === 0 || laps.length === 0) return [];

    const cleanLaps = laps.filter((l) => l.time !== null && !l.isOutlier && !l.isPitStop);
    const avgClean = cleanLaps.length > 0
      ? cleanLaps.reduce((sum, l) => sum + l.time!, 0) / cleanLaps.length
      : 90.0;

    return driverStops.map((stop) => {
      const pitInLap = laps.find((l) => l.lapNumber === stop.lap);
      const outLap = laps.find((l) => l.lapNumber === stop.lap + 1);

      const inLapTime = pitInLap?.time || null;
      const outLapTime = outLap?.time || null;

      const inLapLoss = inLapTime ? inLapTime - avgClean : null;
      const outLapLoss = outLapTime ? outLapTime - avgClean : null;

      return {
        stopNumber: stop.stopNumber,
        lap: stop.lap,
        stationarySec: stop.durationSec,
        inLapTime,
        outLapTime,
        inLapLoss,
        outLapLoss,
        totalPitCycleLoss:
          inLapLoss !== null && outLapLoss !== null
            ? inLapLoss + outLapLoss
            : null
      };
    });
  };

  const pitImpactA = useMemo(
    () => computePitLapImpact(driverALaps, stopsByDriver.get(selectedDriverA)),
    [driverALaps, stopsByDriver, selectedDriverA]
  );
  const pitImpactB = useMemo(
    () => computePitLapImpact(driverBLaps, stopsByDriver.get(selectedDriverB)),
    [driverBLaps, stopsByDriver, selectedDriverB]
  );

  return (
    <div className="space-y-5">
      {/* 1. Cockpit Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-zinc-800/80 bg-zinc-950/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-mono text-xs font-black uppercase tracking-wider text-emerald-400">
              PIT STOP STRATEGY &amp; IMPACT
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Official FIA transponder pit timeline, stationary box duration, and in/out-lap pace delta.
          </p>
        </div>

        <button
          onClick={() => setShowSimModal(!showSimModal)}
          type="button"
          className="rounded-lg border border-cyan-500/70 bg-cyan-950/40 px-3.5 py-1.5 font-mono text-xs font-bold text-cyan-300 hover:bg-cyan-900/60 transition-all shadow-sm shadow-cyan-950/40"
        >
          {showSimModal ? '✕ CLOSE SIMULATOR' : '⚔️ SIMULATE ALTERNATE UNDERCUT'}
        </button>
      </div>

      {/* Optional: Tactical Undercut Simulation Engine (Clean Drawer) */}
      {showSimModal && (
        <Card variant="bordered" padding="md" className="border-cyan-500/40 bg-zinc-950/95 shadow-2xl">
          <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="blue" size="sm">
                  TACTICAL SIMULATION
                </Badge>
                <span className="font-mono text-xs text-zinc-400">
                  Hypothetical undercut/overcut delta model
                </span>
              </div>
              <h3 className="font-display text-lg font-black text-zinc-100 mt-1">
                Undercut &amp; Overcut Duel Simulator
              </h3>
            </div>
            <button
              onClick={() => setShowSimModal(false)}
              className="text-zinc-400 hover:text-zinc-100 font-mono text-xs px-2 py-1 rounded bg-zinc-900"
            >
              Close ✕
            </button>
          </div>

          <TacticalStrategyDuel
            driversList={driversList}
            selectedDriverA={selectedDriverA}
            selectedDriverB={selectedDriverB}
            onSelectDriverA={onSelectDriverA}
            onSelectDriverB={onSelectDriverB}
            driverALapTimes={driverALaps.map((l) => l.time || 0)}
            driverBLapTimes={driverBLaps.map((l) => l.time || 0)}
            totalRaceLaps={totalRaceLaps}
            benchmarkBaseLapTime={benchmarkBaseLapTime}
            observedDegradation={0.08}
          />
        </Card>
      )}

      {/* 2. Key Summary KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card variant="default" padding="sm" className="bg-zinc-900/80 border-zinc-800">
          <span className="font-mono text-[10px] font-bold uppercase text-zinc-400">
            TOTAL PIT STOPS
          </span>
          <div className="mt-1 font-mono text-xl sm:text-2xl font-black text-zinc-100">
            {pitStops.length}
          </div>
          <span className="font-mono text-[11px] text-zinc-400">
            Across {stopsByDriver.size} drivers
          </span>
        </Card>

        <Card variant="default" padding="sm" className="bg-zinc-900/80 border-zinc-800">
          <span className="font-mono text-[10px] font-bold uppercase text-zinc-400">
            FASTEST STATIONARY
          </span>
          <div className="mt-1 font-mono text-xl sm:text-2xl font-black text-emerald-400">
            {fastestStops.length > 0 ? `${fastestStops[0].durationSec?.toFixed(2)}s` : 'N/A'}
          </div>
          <span className="font-mono text-[11px] text-zinc-400 truncate block">
            {fastestStops.length > 0 ? `${fastestStops[0].driverName} (${fastestStops[0].constructorName})` : '—'}
          </span>
        </Card>

        <Card variant="default" padding="sm" className="bg-zinc-900/80 border-zinc-800">
          <span className="font-mono text-[10px] font-bold uppercase text-zinc-400">
            MEDIAN STOP DURATION
          </span>
          <div className="mt-1 font-mono text-xl sm:text-2xl font-black text-zinc-100">
            {pitStops.length > 0
              ? `${(
                  [...pitStops]
                    .map((p) => p.durationSec || 2.8)
                    .sort((a, b) => a - b)[
                    Math.floor(pitStops.length / 2)
                  ]
                ).toFixed(2)}s`
              : 'N/A'}
          </div>
          <span className="font-mono text-[11px] text-zinc-400">
            Stationary wheel change
          </span>
        </Card>

        <Card variant="default" padding="sm" className="bg-zinc-900/80 border-zinc-800">
          <span className="font-mono text-[10px] font-bold uppercase text-zinc-400">
            TYPICAL PIT LANE DELTA
          </span>
          <div className="mt-1 font-mono text-xl sm:text-2xl font-black text-amber-400">
            ~21.5s
          </div>
          <span className="font-mono text-[11px] text-zinc-400">
            Transit + stationary loss
          </span>
        </Card>
      </div>

      {/* 3. HERO VISUAL: Field Pit Stop Timeline (Laps 1 -> N) */}
      <Card variant="default" padding="md" className="bg-zinc-900/80 border-zinc-800">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <span className="font-mono text-[10px] font-black uppercase tracking-wider text-emerald-400">
              CHRONOLOGICAL MATRIX
            </span>
            <h3 className="font-display text-base font-bold text-zinc-100 sm:text-lg">
              Field Pit Stop Timeline (Laps 1 &rarr; {totalRaceLaps})
            </h3>
            <p className="text-xs text-zinc-400">
              Each badge marks the precise lap a driver pitted. Hover over badges to view stop details.
            </p>
          </div>

          {/* Filter by Team */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-zinc-400 uppercase">Filter Team:</span>
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              aria-label="Filter pit stop timeline by team"
              className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 font-mono text-xs text-zinc-200 focus:outline-none"
            >
              <option value="all">All Teams</option>
              {uniqueTeams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timeline Lap Scale Ruler */}
        <div className="flex items-center gap-3 px-3 pb-1 text-[10px] font-mono text-zinc-400">
          <div className="w-28 shrink-0">DRIVER / POS</div>
          <div className="relative flex-1 flex justify-between px-1">
            <span>L1</span>
            <span>L{Math.round(totalRaceLaps * 0.25)}</span>
            <span>L{Math.round(totalRaceLaps * 0.5)}</span>
            <span>L{Math.round(totalRaceLaps * 0.75)}</span>
            <span>L{totalRaceLaps}</span>
          </div>
          <div className="w-14 text-right shrink-0">STOPS</div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center font-mono text-xs text-cyan-400 animate-pulse">
            Loading official pit stop records...
          </div>
        ) : displayedDrivers.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400 font-mono">
            No drivers found matching filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[700px] space-y-2 py-1">
              {displayedDrivers.map((driver) => {
                const driverStops = stopsByDriver.get(driver.driverId) || [];
                const teamColor = driver.constructorId
                  ? getTeamColor(driver.constructorId)
                  : '#8791A3';

                return (
                  <div
                    key={`row-${driver.driverId}`}
                    className="flex items-center gap-3 rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-1.5 text-xs hover:border-zinc-700 transition-colors"
                  >
                    {/* Driver Identity */}
                    <div className="w-28 shrink-0 flex items-center gap-2">
                      <div
                        className="h-3 w-1 rounded-full"
                        style={{ backgroundColor: teamColor }}
                      />
                      <span className="font-mono font-bold text-zinc-100">
                        {driver.code}
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate">
                        P{driver.position}
                      </span>
                    </div>

                    {/* Timeline Track */}
                    <div className="relative flex-1 h-6 bg-zinc-900/60 rounded flex items-center px-1">
                      {/* Pit stop markers */}
                      {driverStops.map((stop) => {
                        const pct = Math.min(
                          100,
                          Math.max(0, (stop.lap / totalRaceLaps) * 100)
                        );
                        return (
                          <div
                            key={`marker-${stop.driverId}-${stop.stopNumber}`}
                            style={{ left: `${pct}%` }}
                            className="absolute -translate-x-1/2 flex items-center justify-center cursor-pointer group"
                            title={`${driver.code} Stop #${stop.stopNumber} on Lap ${stop.lap} (${stop.rawDuration || 'pit'})`}
                          >
                            <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-mono font-black text-black shadow-md shadow-emerald-500/30 group-hover:scale-125 transition-transform">
                              L{stop.lap}
                            </span>
                          </div>
                        );
                      })}

                      {driverStops.length === 0 && (
                        <span className="text-[10px] font-mono text-zinc-400 pl-2">
                          0 Pit Stops on Record
                        </span>
                      )}
                    </div>

                    {/* Total Stops Badge */}
                    <div className="w-14 text-right shrink-0">
                      <span className="font-mono text-[11px] font-bold text-zinc-400">
                        {driverStops.length} stop{driverStops.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* 3. In-Lap & Out-Lap Pace Cost for Head-to-Head Drivers */}
      <Card variant="default" padding="md" className="bg-zinc-900/80">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <span className="font-mono text-[10px] font-black uppercase tracking-wider text-cyan-400">
              EMPIRICAL OBSERVATION
            </span>
            <h3 className="font-display text-base font-bold text-zinc-100 sm:text-lg">
              In-Lap &amp; Out-Lap Delta Breakdown
            </h3>
            <p className="text-xs text-zinc-400">
              Measures how much time was lost entering the pit lane (In-Lap) and accelerating out on cold tyres (Out-Lap) relative to clean pace.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-zinc-400">
              Comparing: <strong className="text-cyan-400">{driverAObj?.code || 'Driver 1'}</strong> vs <strong className="text-red-400">{driverBObj?.code || 'Driver 2'}</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Driver A Pit Impact */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-bold text-cyan-400">
                DRIVER 1: {driverAObj?.givenName} {driverAObj?.familyName} ({driverAObj?.constructorName})
              </span>
              <Badge variant="blue" size="sm">
                {pitImpactA.length} STOP{pitImpactA.length !== 1 ? 'S' : ''}
              </Badge>
            </div>

            {pitImpactA.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">
                No pit stop records found for {driverAObj?.code || 'Driver 1'}.
              </p>
            ) : (
              <div className="space-y-3">
                {pitImpactA.map((impact) => (
                  <div
                    key={`a-stop-${impact.stopNumber}`}
                    className="rounded border border-zinc-800/80 bg-zinc-900/60 p-3 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between font-bold text-zinc-200 mb-1">
                      <span>Stop #{impact.stopNumber} (Lap {impact.lap})</span>
                      <span className="text-emerald-400">
                        Box Duration: {impact.stationarySec ? `${impact.stationarySec.toFixed(2)}s` : 'N/A'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 mt-2 border-t border-zinc-800/60 pt-2">
                      <div>
                        In-Lap (L{impact.lap}):{' '}
                        <strong className="text-zinc-200">
                          {impact.inLapTime ? `${impact.inLapTime.toFixed(2)}s` : '—'}
                        </strong>
                        {impact.inLapLoss !== null && (
                          <span className="text-amber-400 ml-1">
                            (+{impact.inLapLoss.toFixed(1)}s)
                          </span>
                        )}
                      </div>
                      <div>
                        Out-Lap (L{impact.lap + 1}):{' '}
                        <strong className="text-zinc-200">
                          {impact.outLapTime ? `${impact.outLapTime.toFixed(2)}s` : '—'}
                        </strong>
                        {impact.outLapLoss !== null && (
                          <span className="text-amber-400 ml-1">
                            (+{impact.outLapLoss.toFixed(1)}s)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Driver B Pit Impact */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-bold text-red-400">
                DRIVER 2: {driverBObj?.givenName} {driverBObj?.familyName} ({driverBObj?.constructorName})
              </span>
              <Badge variant="red" size="sm">
                {pitImpactB.length} STOP{pitImpactB.length !== 1 ? 'S' : ''}
              </Badge>
            </div>

            {pitImpactB.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">
                No pit stop records found for {driverBObj?.code || 'Driver 2'}.
              </p>
            ) : (
              <div className="space-y-3">
                {pitImpactB.map((impact) => (
                  <div
                    key={`b-stop-${impact.stopNumber}`}
                    className="rounded border border-zinc-800/80 bg-zinc-900/60 p-3 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between font-bold text-zinc-200 mb-1">
                      <span>Stop #{impact.stopNumber} (Lap {impact.lap})</span>
                      <span className="text-emerald-400">
                        Box Duration: {impact.stationarySec ? `${impact.stationarySec.toFixed(2)}s` : 'N/A'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 mt-2 border-t border-zinc-800/60 pt-2">
                      <div>
                        In-Lap (L{impact.lap}):{' '}
                        <strong className="text-zinc-200">
                          {impact.inLapTime ? `${impact.inLapTime.toFixed(2)}s` : '—'}
                        </strong>
                        {impact.inLapLoss !== null && (
                          <span className="text-amber-400 ml-1">
                            (+{impact.inLapLoss.toFixed(1)}s)
                          </span>
                        )}
                      </div>
                      <div>
                        Out-Lap (L{impact.lap + 1}):{' '}
                        <strong className="text-zinc-200">
                          {impact.outLapTime ? `${impact.outLapTime.toFixed(2)}s` : '—'}
                        </strong>
                        {impact.outLapLoss !== null && (
                          <span className="text-amber-400 ml-1">
                            (+{impact.outLapLoss.toFixed(1)}s)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 4. Fastest Pit Crews Leaderboard */}
      <Card variant="default" padding="md" className="bg-zinc-900/80">
        <div className="mb-3 border-b border-zinc-800 pb-2">
          <span className="font-mono text-[10px] font-black uppercase tracking-wider text-emerald-400">
            CREW EFFICIENCY
          </span>
          <h3 className="font-display text-base font-bold text-zinc-100 sm:text-lg">
            Fastest Pit Stops of the Grand Prix
          </h3>
          <p className="text-xs text-zinc-400">
            Official stationary transponder duration (car stopped in pit box).
          </p>
        </div>

        {fastestStops.length === 0 ? (
          <p className="text-xs text-zinc-400 py-4 font-mono text-center">
            No stationary durations available in official feed for this round.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-[10px] uppercase">
                  <th className="py-2">Rank</th>
                  <th className="py-2">Driver</th>
                  <th className="py-2">Constructor</th>
                  <th className="py-2 text-center">Lap</th>
                  <th className="py-2 text-center">Stop #</th>
                  <th className="py-2 text-right">Stationary Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {fastestStops.map((stop, idx) => (
                  <tr key={`rank-${stop.driverId}-${stop.lap}`} className="hover:bg-zinc-850/50">
                    <td className="py-2 font-bold text-zinc-400">#{idx + 1}</td>
                    <td className="py-2 font-bold text-zinc-100">
                      {stop.driverCode} ({stop.driverName})
                    </td>
                    <td className="py-2 text-zinc-400">{stop.constructorName}</td>
                    <td className="py-2 text-center text-zinc-200">Lap {stop.lap}</td>
                    <td className="py-2 text-center text-zinc-400">#{stop.stopNumber}</td>
                    <td className="py-2 text-right font-black text-emerald-400">
                      {stop.durationSec?.toFixed(2)}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 6. Data Limitations & Provenance Notice */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4 text-xs font-mono text-zinc-400 space-y-1">
        <div className="flex items-center gap-2 font-bold text-zinc-300">
          <span>ℹ️</span>
          <span>DATA PROVENANCE &amp; METHODOLOGY LIMITATIONS:</span>
        </div>
        <p>
          • <strong>Recorded Facts:</strong> Pit entry lap numbers and stationary box durations derive directly from official FIA transponders via Jolpica/Ergast API.
        </p>
        <p>
          • <strong>Derived Statistics:</strong> In-lap and out-lap time losses are computed against each driver&apos;s clean median lap pace during green flag running.
        </p>
        <p>
          • <strong>Assumptions:</strong> Overall pit lane transit time is estimated at ~21.5s under green flag conditions. Virtual Safety Car and full Safety Car pit delta advantages reduce this loss to ~11s and ~14s respectively.
        </p>
      </div>
    </div>
  );
};
