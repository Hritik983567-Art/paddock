'use client';

import React, { useState, useMemo } from 'react';
import { GrandPrixSummary, DriverResultItem, PitStopItem, LapRecord } from '../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { calculatePaceStatistics } from '../utils/lapProcessing';

interface StrategyDebriefProps {
  grandPrixSummary: GrandPrixSummary | null;
  driversList: DriverResultItem[];
  selectedDriverA: string;
  selectedDriverB: string;
  pitStops: PitStopItem[];
  driverALaps: LapRecord[];
  driverBLaps: LapRecord[];
  totalRaceLaps: number;
}

export const StrategyDebrief: React.FC<StrategyDebriefProps> = ({
  grandPrixSummary,
  driversList,
  selectedDriverA,
  selectedDriverB,
  pitStops,
  driverALaps,
  driverBLaps,
  totalRaceLaps
}) => {
  const [copied, setCopied] = useState(false);

  const driverA = useMemo(
    () => driversList.find((d) => d.driverId === selectedDriverA),
    [driversList, selectedDriverA]
  );
  const driverB = useMemo(
    () => driversList.find((d) => d.driverId === selectedDriverB),
    [driversList, selectedDriverB]
  );

  const stopsA = useMemo(
    () => pitStops.filter((p) => p.driverId === selectedDriverA),
    [pitStops, selectedDriverA]
  );
  const stopsB = useMemo(
    () => pitStops.filter((p) => p.driverId === selectedDriverB),
    [pitStops, selectedDriverB]
  );

  const statsA = useMemo(
    () => calculatePaceStatistics(driverALaps, true),
    [driverALaps]
  );
  const statsB = useMemo(
    () => calculatePaceStatistics(driverBLaps, true),
    [driverBLaps]
  );

  // Generate formatted markdown debrief for clipboard
  const debriefMarkdown = useMemo(() => {
    const raceTitle = grandPrixSummary
      ? `${grandPrixSummary.season} ${grandPrixSummary.raceName}`
      : 'Grand Prix Strategy Debrief';

    return `### PADDOCK STRATEGY DEBRIEF — ${raceTitle.toUpperCase()}
Venue: ${grandPrixSummary?.circuitName || 'Grand Prix Circuit'} | Total Laps: ${totalRaceLaps}

#### HEAD-TO-HEAD TACTICAL COMPARISON
- ${driverA?.code || 'Driver A'} (${driverA?.constructorName}):
  * Finish: P${driverA?.position || '—'}
  * Strategy: ${stopsA.length} stop(s) (Laps: ${stopsA.map((s) => s.lap).join(', ') || 'None'})
  * Clean Pace Avg: ${statsA.avgCleanPaceSec ? `${statsA.avgCleanPaceSec.toFixed(3)}s` : 'N/A'}
  * Best Lap: ${statsA.bestLapSec ? `${statsA.bestLapSec.toFixed(3)}s` : 'N/A'}
  * Consistency: ${statsA.consistencyScore ? `${statsA.consistencyScore.toFixed(1)}%` : 'N/A'}

- ${driverB?.code || 'Driver B'} (${driverB?.constructorName}):
  * Finish: P${driverB?.position || '—'}
  * Strategy: ${stopsB.length} stop(s) (Laps: ${stopsB.map((s) => s.lap).join(', ') || 'None'})
  * Clean Pace Avg: ${statsB.avgCleanPaceSec ? `${statsB.avgCleanPaceSec.toFixed(3)}s` : 'N/A'}
  * Best Lap: ${statsB.bestLapSec ? `${statsB.bestLapSec.toFixed(3)}s` : 'N/A'}
  * Consistency: ${statsB.consistencyScore ? `${statsB.consistencyScore.toFixed(1)}%` : 'N/A'}

#### KEY STRATEGY OBSERVATIONS
1. Pit Strategy: ${stopsA.length === stopsB.length ? `Both drivers adopted a ${stopsA.length}-stop approach.` : `${driverA?.code} executed ${stopsA.length} stop(s) vs ${driverB?.code}'s ${stopsB.length} stop(s).`}
2. Net Pace Delta: ${statsA.avgCleanPaceSec && statsB.avgCleanPaceSec ? `${statsA.avgCleanPaceSec < statsB.avgCleanPaceSec ? driverA?.code : driverB?.code} held an average clean lap pace advantage of ${Math.abs(statsA.avgCleanPaceSec - statsB.avgCleanPaceSec).toFixed(3)}s/lap.` : 'Pace delta pending representative clean laps.'}

*Data Provenance: Official FIA transponder records via Jolpica F1 API. Simulation outputs represent mathematical approximations.*`;
  }, [grandPrixSummary, totalRaceLaps, driverA, driverB, stopsA, stopsB, statsA, statsB]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(debriefMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Strip */}
      <div className="flex flex-col gap-3 p-3 rounded-xl border border-zinc-800/80 bg-zinc-950/70 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="font-mono text-xs font-black uppercase tracking-wider text-cyan-400">
              FEATURE F • EXECUTIVE STRATEGY DEBRIEF
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Verified factual summary of race decisions, tyre strategy execution, and empirical pace takeaways.
          </p>
        </div>

        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-2 rounded-lg border border-cyan-500/60 bg-cyan-950/40 px-3.5 py-1.5 font-mono text-xs font-bold text-cyan-300 hover:bg-cyan-900/60 transition-colors shadow-sm cursor-pointer shrink-0"
        >
          <span>{copied ? '✓ COPIED TO CLIPBOARD' : '📋 COPY EXECUTIVE DEBRIEF'}</span>
        </button>
      </div>

      {/* 2. Key Takeaways Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Driver A Card */}
        <Card variant="default" padding="md" className="bg-zinc-900/80 border-cyan-500/30">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                DRIVER 1 STRATEGY EXECUTION
              </span>
              <h3 className="text-lg font-display font-black text-zinc-100">
                {driverA?.givenName} {driverA?.familyName} ({driverA?.code})
              </h3>
            </div>
            <Badge variant="blue" size="md">
              P{driverA?.position || '—'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 font-mono text-xs">
            <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/60">
              <span className="text-[10px] text-zinc-400 block uppercase">Pit Strategy</span>
              <span className="text-sm font-bold text-zinc-200 mt-0.5 block">
                {stopsA.length} Stop{stopsA.length !== 1 ? 's' : ''}
              </span>
              <span className="text-[11px] text-zinc-400 truncate block">
                {stopsA.map((s) => `L${s.lap}`).join(', ') || 'Zero stops'}
              </span>
            </div>

            <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/60">
              <span className="text-[10px] text-zinc-400 block uppercase">Clean Avg Pace</span>
              <span className="text-sm font-bold text-cyan-300 mt-0.5 block">
                {statsA.avgCleanPaceSec ? `${statsA.avgCleanPaceSec.toFixed(3)}s` : 'N/A'}
              </span>
              <span className="text-[11px] text-zinc-400 truncate block">
                {statsA.cleanLapsCount} clean laps
              </span>
            </div>

            <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/60">
              <span className="text-[10px] text-zinc-400 block uppercase">Personal Best</span>
              <span className="text-sm font-bold text-zinc-200 mt-0.5 block">
                {statsA.bestLapSec ? `${statsA.bestLapSec.toFixed(3)}s` : 'N/A'}
              </span>
              <span className="text-[11px] text-zinc-400 block">
                Fastest clean lap
              </span>
            </div>

            <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/60">
              <span className="text-[10px] text-zinc-400 block uppercase">Pace Consistency</span>
              <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                {statsA.consistencyScore ? `${statsA.consistencyScore.toFixed(1)}%` : 'N/A'}
              </span>
              <span className="text-[11px] text-zinc-400 block">
                Std Dev: &plusmn;{statsA.stdDevSec ? `${statsA.stdDevSec.toFixed(2)}s` : '—'}
              </span>
            </div>
          </div>
        </Card>

        {/* Driver B Card */}
        <Card variant="default" padding="md" className="bg-zinc-900/80 border-red-500/30">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <span className="text-[10px] font-mono uppercase text-red-400 font-bold">
                DRIVER 2 STRATEGY EXECUTION
              </span>
              <h3 className="text-lg font-display font-black text-zinc-100">
                {driverB?.givenName} {driverB?.familyName} ({driverB?.code})
              </h3>
            </div>
            <Badge variant="red" size="md">
              P{driverB?.position || '—'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 font-mono text-xs">
            <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/60">
              <span className="text-[10px] text-zinc-400 block uppercase">Pit Strategy</span>
              <span className="text-sm font-bold text-zinc-200 mt-0.5 block">
                {stopsB.length} Stop{stopsB.length !== 1 ? 's' : ''}
              </span>
              <span className="text-[11px] text-zinc-400 truncate block">
                {stopsB.map((s) => `L${s.lap}`).join(', ') || 'Zero stops'}
              </span>
            </div>

            <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/60">
              <span className="text-[10px] text-zinc-400 block uppercase">Clean Avg Pace</span>
              <span className="text-sm font-bold text-red-300 mt-0.5 block">
                {statsB.avgCleanPaceSec ? `${statsB.avgCleanPaceSec.toFixed(3)}s` : 'N/A'}
              </span>
              <span className="text-[11px] text-zinc-400 truncate block">
                {statsB.cleanLapsCount} clean laps
              </span>
            </div>

            <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/60">
              <span className="text-[10px] text-zinc-400 block uppercase">Personal Best</span>
              <span className="text-sm font-bold text-zinc-200 mt-0.5 block">
                {statsB.bestLapSec ? `${statsB.bestLapSec.toFixed(3)}s` : 'N/A'}
              </span>
              <span className="text-[11px] text-zinc-400 block">
                Fastest clean lap
              </span>
            </div>

            <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/60">
              <span className="text-[10px] text-zinc-400 block uppercase">Pace Consistency</span>
              <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                {statsB.consistencyScore ? `${statsB.consistencyScore.toFixed(1)}%` : 'N/A'}
              </span>
              <span className="text-[11px] text-zinc-400 block">
                Std Dev: &plusmn;{statsB.stdDevSec ? `${statsB.stdDevSec.toFixed(2)}s` : '—'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Methodology & Uncertainty Disclosure */}
      <Card variant="default" padding="md" className="bg-zinc-950/70 border-zinc-800">
        <h4 className="font-mono text-xs font-bold uppercase text-zinc-300 mb-2 flex items-center gap-2">
          <span>⚖️ DATA METHODOLOGY, PROVENANCE &amp; UNCERTAINTY</span>
        </h4>
        <div className="space-y-2 text-xs text-zinc-400 leading-relaxed font-sans">
          <p>
            &bull; <strong>Recorded Telemetry:</strong> Lap times, pit stops, and classification results are verified from official FIA transponder timing feeds through Jolpica / Ergast API.
          </p>
          <p>
            &bull; <strong>Outlier Filtering:</strong> Slow in/out laps, safety car windows, and red flags are identified via adaptive 107% cutoff models to prevent distorting baseline race pace statistics.
          </p>
          <p>
            &bull; <strong>Simulation Disclosures:</strong> What-if strategy duel models are deterministic mathematical approximations based on empirical fuel burnoff slopes (~0.033-0.055s/lap) and nominal tyre wear rates. They do not simulate unpredictable aerodynamic dirty air turbulence or mechanical failures.
          </p>
        </div>
      </Card>
    </div>
  );
};
