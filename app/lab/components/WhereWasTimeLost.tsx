'use client';

import React, { useState, useMemo } from 'react';
import { LapRecord, DriverResultItem } from '../types';
import { Card } from '../../components/ui/Card';
import {
  calculatePaceStatistics,
  computePaceDeltaArray
} from '../utils/lapProcessing';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TooltipItem
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WhereWasTimeLostProps {
  driverALaps: LapRecord[];
  driverBLaps: LapRecord[];
  selectedDriverA: string;
  selectedDriverB: string;
  driversList: DriverResultItem[];
  totalRaceLaps: number;
  isLoading: boolean;
}

export const WhereWasTimeLost: React.FC<WhereWasTimeLostProps> = ({
  driverALaps,
  driverBLaps,
  selectedDriverA,
  selectedDriverB,
  driversList,
  totalRaceLaps,
  isLoading
}) => {
  const [excludeOutliers, setExcludeOutliers] = useState<boolean>(true);
  const [outlierCutoffMode, setOutlierCutoffMode] = useState<string>('auto');
  const [smoothLines, setSmoothLines] = useState<boolean>(true);
  const [showBenchmark, setShowBenchmark] = useState<boolean>(true);

  const driverAObj = useMemo(
    () => driversList.find((d) => d.driverId === selectedDriverA),
    [driversList, selectedDriverA]
  );
  const driverBObj = useMemo(
    () => driversList.find((d) => d.driverId === selectedDriverB),
    [driversList, selectedDriverB]
  );

  // Dynamic Effective Outlier Threshold Calculation
  const effectiveThreshold = useMemo(() => {
    if (outlierCutoffMode !== 'auto') {
      return parseInt(outlierCutoffMode, 10) || 105;
    }

    const allValid = [...driverALaps, ...driverBLaps]
      .filter((l) => l.time !== null && l.time > 30)
      .map((l) => l.time!);

    if (allValid.length === 0) return 105;

    const sorted = [...allValid].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const medianPace =
      sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;

    return Math.max(92, Math.ceil(medianPace + 12));
  }, [outlierCutoffMode, driverALaps, driverBLaps]);

  // Tag outliers based on active threshold
  const processedLapsA = useMemo(() => {
    return driverALaps.map((l) => {
      const isOutlier =
        l.time === null ||
        l.time < 30 ||
        (excludeOutliers && l.time > effectiveThreshold);
      return { ...l, isOutlier };
    });
  }, [driverALaps, excludeOutliers, effectiveThreshold]);

  const processedLapsB = useMemo(() => {
    return driverBLaps.map((l) => {
      const isOutlier =
        l.time === null ||
        l.time < 30 ||
        (excludeOutliers && l.time > effectiveThreshold);
      return { ...l, isOutlier };
    });
  }, [driverBLaps, excludeOutliers, effectiveThreshold]);

  // Clean pace statistics
  const statsA = useMemo(
    () => calculatePaceStatistics(processedLapsA, excludeOutliers),
    [processedLapsA, excludeOutliers]
  );
  const statsB = useMemo(
    () => calculatePaceStatistics(processedLapsB, excludeOutliers),
    [processedLapsB, excludeOutliers]
  );

  // Head-to-head lap delta (strictly aligned)
  const deltasArray = useMemo(
    () => computePaceDeltaArray(processedLapsA, processedLapsB, excludeOutliers),
    [processedLapsA, processedLapsB, excludeOutliers]
  );

  // Format tick labels
  const formatLapTimeTick = (value: unknown) => {
    const val = Number(value);
    if (isNaN(val) || val <= 0) return String(value);
    const m = Math.floor(val / 60);
    const sec = (val % 60).toFixed(1);
    return `${m}:${sec.padStart(4, '0')}`;
  };

  const formatDeltaTick = (value: unknown) => {
    const val = Number(value);
    if (isNaN(val)) return String(value);
    const sign = val > 0 ? '+' : '';
    return `${sign}${val.toFixed(1)}s`;
  };

  // Fixed continuous race lap labels (Lap 1 .. Lap N)
  const chartLabels = useMemo(() => {
    const maxLaps = Math.max(totalRaceLaps, processedLapsA.length, processedLapsB.length, 1);
    return Array.from({ length: maxLaps }, (_, i) => `Lap ${i + 1}`);
  }, [totalRaceLaps, processedLapsA.length, processedLapsB.length]);

  // Pace Chart Y-Axis Bounds
  const paceYBounds = useMemo(() => {
    const validTimes = [...processedLapsA, ...processedLapsB]
      .filter((l) => l.time !== null && !l.isOutlier)
      .map((l) => l.time!);

    if (validTimes.length === 0) return { min: 60, max: 120 };

    const minPace = Math.min(...validTimes);
    const maxPace = Math.max(...validTimes);

    return {
      min: Math.max(30, Math.floor(minPace - 1.5)),
      max: Math.ceil(maxPace + 2.5)
    };
  }, [processedLapsA, processedLapsB]);

  // Delta Chart Y-Axis Bounds
  const deltaYBounds = useMemo(() => {
    const validDeltas = deltasArray.filter(
      (d): d is number => d !== null && !isNaN(d)
    );
    if (validDeltas.length === 0) return { min: -5, max: 5 };

    const maxAbs = Math.max(...validDeltas.map((d) => Math.abs(d)));
    const bound = Math.ceil(Math.min(30, Math.max(3, maxAbs + 1)));
    return { min: -bound, max: bound };
  }, [deltasArray]);

  // 1. Pace Chart Data
  const realPaceChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: driverAObj ? `${driverAObj.code} (${driverAObj.constructorName})` : 'Driver 1 Pace',
        data: processedLapsA.map((l) => (l.isOutlier ? null : l.time)),
        borderColor: '#00F0FF',
        backgroundColor: 'rgba(0, 240, 255, 0.08)',
        fill: true,
        borderWidth: 2.5,
        tension: smoothLines ? 0.25 : 0,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#00F0FF',
        spanGaps: false // P0 Correctness: Leaves clean gap when lap is missing / excluded!
      },
      {
        label: driverBObj ? `${driverBObj.code} (${driverBObj.constructorName})` : 'Driver 2 Pace',
        data: processedLapsB.map((l) => (l.isOutlier ? null : l.time)),
        borderColor: '#FF2A55',
        backgroundColor: 'rgba(255, 42, 85, 0.08)',
        fill: true,
        borderWidth: 2.5,
        tension: smoothLines ? 0.25 : 0,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#FF2A55',
        spanGaps: false // P0 Correctness: Never shifts subsequent laps!
      },
      ...(showBenchmark && statsA.avgCleanPaceSec
        ? [
            {
              label: `Driver 1 Clean Avg (${formatLapTimeTick(statsA.avgCleanPaceSec)})`,
              data: Array(chartLabels.length).fill(statsA.avgCleanPaceSec),
              borderColor: 'rgba(0, 240, 255, 0.4)',
              borderWidth: 1.5,
              borderDash: [5, 4],
              pointRadius: 0,
              fill: false,
              spanGaps: true
            }
          ]
        : [])
    ]
  };

  // 2. Head-to-Head Delta Chart Data
  const deltaChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: `Pace Gap Δt — [${driverAObj?.code || 'D1'} vs ${driverBObj?.code || 'D2'}]`,
        data: deltasArray,
        borderColor: '#FFB020',
        backgroundColor: 'rgba(255, 176, 32, 0.1)',
        fill: true,
        borderWidth: 2.5,
        tension: smoothLines ? 0.25 : 0,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#FFB020',
        spanGaps: false
      }
    ]
  };

  const paceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#FFFFFF',
          usePointStyle: true,
          font: { family: 'var(--font-mono)', size: 11, weight: 'bold' as const }
        }
      },
      tooltip: {
        backgroundColor: '#0F172A',
        titleColor: '#00F0FF',
        titleFont: { family: 'var(--font-mono)', size: 12, weight: 'bold' as const },
        bodyFont: { family: 'var(--font-mono)', size: 11 },
        borderColor: '#334155',
        borderWidth: 1,
        callbacks: {
          title: (items: TooltipItem<'line'>[]) => {
            if (!items.length) return '';
            return `🏎️ RACE LAP ${items[0].label.replace('Lap ', '')}`;
          },
          label: (context: TooltipItem<'line'>) => {
            const val = context.parsed.y;
            if (val === null || val === undefined || isNaN(val)) {
              return ` ${context.dataset.label}: ⚠️ Excluded / Missing Lap`;
            }
            const m = Math.floor(val / 60);
            const sec = (val % 60).toFixed(3);
            return ` ${context.dataset.label}: ${m}:${sec.padStart(6, '0')} (${val.toFixed(3)}s)`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'OFFICIAL RACE LAP NUMBER (1 → N)',
          color: '#00F0FF',
          font: { family: 'var(--font-mono)', size: 11, weight: 'bold' as const }
        },
        ticks: { color: '#E2E8F0', font: { family: 'var(--font-mono)', size: 10 }, maxTicksLimit: 16 },
        grid: { color: 'rgba(255, 255, 255, 0.08)' }
      },
      y: {
        min: paceYBounds.min,
        max: paceYBounds.max,
        title: {
          display: true,
          text: 'LAP TIME (MIN:SEC)',
          color: '#FFFFFF',
          font: { family: 'var(--font-mono)', size: 11, weight: 'bold' as const }
        },
        ticks: {
          color: '#E2E8F0',
          font: { family: 'var(--font-mono)', size: 10, weight: 'bold' as const },
          callback: formatLapTimeTick
        },
        grid: { color: 'rgba(255, 255, 255, 0.08)' }
      }
    }
  };

  const deltaChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#FFFFFF',
          usePointStyle: true,
          font: { family: 'var(--font-mono)', size: 11, weight: 'bold' as const }
        }
      },
      tooltip: {
        backgroundColor: '#0F172A',
        titleColor: '#FFB020',
        titleFont: { family: 'var(--font-mono)', size: 12, weight: 'bold' as const },
        bodyFont: { family: 'var(--font-mono)', size: 11 },
        borderColor: '#334155',
        borderWidth: 1,
        callbacks: {
          title: (items: TooltipItem<'line'>[]) => {
            if (!items.length) return '';
            return `⏱️ TIME GAP ON LAP ${items[0].label.replace('Lap ', '')}`;
          },
          label: (context: TooltipItem<'line'>) => {
            const val = context.parsed.y;
            if (val === null || val === undefined || isNaN(val)) {
              return ' Gap Delta: ⚠️ Lap Excluded or Incomplete';
            }
            const sign = val > 0 ? '+' : '';
            const status =
              val > 0
                ? `${driverAObj?.code || 'Driver 1'} Slower`
                : `${driverAObj?.code || 'Driver 1'} Faster`;
            return ` Gap Delta: ${sign}${val.toFixed(3)}s (${status})`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'OFFICIAL RACE LAP NUMBER (1 → N)',
          color: '#FFB020',
          font: { family: 'var(--font-mono)', size: 11, weight: 'bold' as const }
        },
        ticks: { color: '#E2E8F0', font: { family: 'var(--font-mono)', size: 10 }, maxTicksLimit: 16 },
        grid: { color: 'rgba(255, 255, 255, 0.08)' }
      },
      y: {
        min: deltaYBounds.min,
        max: deltaYBounds.max,
        title: {
          display: true,
          text: 'DELTA Δt (SECONDS)',
          color: '#FFFFFF',
          font: { family: 'var(--font-mono)', size: 11, weight: 'bold' as const }
        },
        ticks: {
          color: '#E2E8F0',
          font: { family: 'var(--font-mono)', size: 10, weight: 'bold' as const },
          callback: formatDeltaTick
        },
        grid: {
          color: (ctx: { tick?: { value: number } }) =>
            ctx.tick && ctx.tick.value === 0
              ? 'rgba(0, 240, 255, 0.6)'
              : 'rgba(255, 255, 255, 0.08)',
          lineWidth: (ctx: { tick?: { value: number } }) =>
            ctx.tick && ctx.tick.value === 0 ? 2 : 1
        }
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Cockpit Action Strip & Telemetry Controls */}
      <div className="flex flex-col gap-3 p-3 rounded-xl border border-zinc-800/80 bg-zinc-950/70 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="font-mono text-xs font-black uppercase tracking-wider text-cyan-400">
              RACE PACE &amp; GAP DELTA
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Continuous unshifted lap times, clean pace averages, and head-to-head delta progression.
          </p>
        </div>

        {/* Integrated Filter & Plot Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setExcludeOutliers(!excludeOutliers)}
            type="button"
            className={`rounded px-2.5 py-1 font-bold transition-colors ${
              excludeOutliers
                ? 'border border-cyan-500 bg-cyan-950/60 text-cyan-300'
                : 'border border-zinc-700 bg-zinc-900 text-zinc-400'
            }`}
          >
            {excludeOutliers ? '⚡ CLEAN PACE FOCUS' : '🌐 FULL SCALE'}
          </button>

          <button
            onClick={() => setSmoothLines(!smoothLines)}
            type="button"
            className={`rounded px-2.5 py-1 font-bold transition-colors ${
              smoothLines
                ? 'border border-amber-500/80 bg-amber-950/40 text-amber-300'
                : 'border border-zinc-700 bg-zinc-900 text-zinc-400'
            }`}
          >
            {smoothLines ? '📈 SMOOTH' : '📐 LINEAR'}
          </button>

          <button
            onClick={() => setShowBenchmark(!showBenchmark)}
            type="button"
            className={`rounded px-2.5 py-1 font-bold transition-colors ${
              showBenchmark
                ? 'border border-zinc-500 bg-zinc-800 text-zinc-100'
                : 'border border-zinc-700 bg-zinc-900 text-zinc-400'
            }`}
          >
            🏁 BENCHMARK
          </button>

          <div className="flex items-center gap-1.5 pl-1 text-zinc-400">
            <span className="text-[10px]">CUTOFF:</span>
            <select
              value={outlierCutoffMode}
              onChange={(e) => setOutlierCutoffMode(e.target.value)}
              aria-label="Outlier Cutoff Threshold"
              className="rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs font-bold text-cyan-400 focus:outline-none"
            >
              <option value="auto">Auto ({formatLapTimeTick(effectiveThreshold)})</option>
              <option value="95">1m35s (95s)</option>
              <option value="105">1m45s (105s)</option>
              <option value="120">2m00s (120s)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Statistical Head-to-Head KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Driver 1 Card */}
        <div className="rounded-xl border border-cyan-500/40 bg-zinc-900/80 p-3 sm:p-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span className="font-mono text-xs font-black text-cyan-400">
                {driverAObj?.code || 'D1'} &bull; {driverAObj?.givenName} {driverAObj?.familyName}
              </span>
            </div>
            <span className="font-mono text-[11px] text-zinc-400">
              {driverAObj?.constructorName} {driverAObj?.position ? `• P${driverAObj.position}` : ''}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 font-mono text-center">
            <div className="rounded bg-zinc-950/60 p-1.5">
              <span className="block text-[9px] text-zinc-400">BEST</span>
              <span className="font-bold text-zinc-100 text-xs sm:text-sm">
                {statsA.bestLapSec ? `${statsA.bestLapSec.toFixed(3)}s` : '—'}
              </span>
            </div>
            <div className="rounded bg-zinc-950/60 p-1.5">
              <span className="block text-[9px] text-zinc-400">CLEAN AVG</span>
              <span className="font-bold text-cyan-400 text-xs sm:text-sm">
                {statsA.avgCleanPaceSec ? `${statsA.avgCleanPaceSec.toFixed(3)}s` : '—'}
              </span>
            </div>
            <div className="rounded bg-zinc-950/60 p-1.5">
              <span className="block text-[9px] text-zinc-400">CONSIST</span>
              <span className="font-bold text-emerald-400 text-xs sm:text-sm">
                {statsA.consistencyScore ? `${statsA.consistencyScore.toFixed(0)}%` : '—'}
              </span>
            </div>
            <div className="rounded bg-zinc-950/60 p-1.5">
              <span className="block text-[9px] text-zinc-400">STD DEV (σ)</span>
              <span className="font-bold text-amber-400 text-xs sm:text-sm">
                {statsA.stdDevSec ? `±${statsA.stdDevSec.toFixed(2)}s` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Driver 2 Card */}
        <div className="rounded-xl border border-red-500/40 bg-zinc-900/80 p-3 sm:p-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
              <span className="font-mono text-xs font-black text-red-400">
                {driverBObj?.code || 'D2'} &bull; {driverBObj?.givenName} {driverBObj?.familyName}
              </span>
            </div>
            <span className="font-mono text-[11px] text-zinc-400">
              {driverBObj?.constructorName} {driverBObj?.position ? `• P${driverBObj.position}` : ''}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 font-mono text-center">
            <div className="rounded bg-zinc-950/60 p-1.5">
              <span className="block text-[9px] text-zinc-400">BEST</span>
              <span className="font-bold text-zinc-100 text-xs sm:text-sm">
                {statsB.bestLapSec ? `${statsB.bestLapSec.toFixed(3)}s` : '—'}
              </span>
            </div>
            <div className="rounded bg-zinc-950/60 p-1.5">
              <span className="block text-[9px] text-zinc-400">CLEAN AVG</span>
              <span className="font-bold text-red-400 text-xs sm:text-sm">
                {statsB.avgCleanPaceSec ? `${statsB.avgCleanPaceSec.toFixed(3)}s` : '—'}
              </span>
            </div>
            <div className="rounded bg-zinc-950/60 p-1.5">
              <span className="block text-[9px] text-zinc-400">CONSIST</span>
              <span className="font-bold text-emerald-400 text-xs sm:text-sm">
                {statsB.consistencyScore ? `${statsB.consistencyScore.toFixed(0)}%` : '—'}
              </span>
            </div>
            <div className="rounded bg-zinc-950/60 p-1.5">
              <span className="block text-[9px] text-zinc-400">STD DEV (σ)</span>
              <span className="font-bold text-amber-400 text-xs sm:text-sm">
                {statsB.stdDevSec ? `±${statsB.stdDevSec.toFixed(2)}s` : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Chart 1: Real Lap Pace Progression */}
      <Card variant="default" padding="md" className="bg-zinc-900/80">
        <div className="mb-3 border-b border-zinc-800 pb-2">
          <span className="font-mono text-[10px] font-black uppercase tracking-wider text-cyan-400">
            EVIDENCE: OFFICIAL LAP TIME TRACE
          </span>
          <h3 className="font-display text-base font-bold text-zinc-100 sm:text-lg">
            Discrete Lap-by-Lap Pace Progression
          </h3>
          <p className="text-xs text-zinc-400">
            Official transponder lap times. Gaps in the line represent missing laps or excluded pit stops/red flags.
          </p>
        </div>

        {isLoading ? (
          <div className="h-[380px] flex items-center justify-center font-mono text-xs text-cyan-400 animate-pulse">
            Loading official lap records...
          </div>
        ) : (
          <div className="h-[380px] w-full">
            <Line data={realPaceChartData} options={paceChartOptions} />
          </div>
        )}
      </Card>

      {/* 5. Chart 2: Head-to-Head Pace Gap Delta */}
      <Card variant="default" padding="md" className="bg-zinc-900/80">
        <div className="mb-3 border-b border-zinc-800 pb-2">
          <span className="font-mono text-[10px] font-black uppercase tracking-wider text-amber-400">
            EVIDENCE: HEAD-TO-HEAD DELTA
          </span>
          <h3 className="font-display text-base font-bold text-zinc-100 sm:text-lg">
            Time Delta &Delta;t (Driver 1 &minus; Driver 2)
          </h3>
          <p className="text-xs text-zinc-400">
            Values above 0s mean {driverAObj?.code || 'Driver 1'} was slower; values below 0s mean {driverAObj?.code || 'Driver 1'} was faster.
          </p>
        </div>

        {isLoading ? (
          <div className="h-[280px] flex items-center justify-center font-mono text-xs text-amber-400 animate-pulse">
            Calculating lap deltas...
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <Line data={deltaChartData} options={deltaChartOptions} />
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
          • <strong>Recorded Facts:</strong> Every plotted point corresponds to an authentic official FIA transponder record indexed by exact lap number.
        </p>
        <p>
          • <strong>Unshifted Index Guarantee:</strong> If a driver did not complete a lap or pitted, that lap is rendered as an empty break (`spanGaps: false`) without displacing subsequent lap numbers.
        </p>
        <p>
          • <strong>Clean Pace Filter:</strong> Laps exceeding {formatLapTimeTick(effectiveThreshold)} or flagged as pit stops are excluded from clean average and standard deviation computations to prevent squishing the pace axis.
        </p>
      </div>
    </div>
  );
};
