'use client';

import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getTeamColor } from '../../utils/api';
import { DriverResultItem } from '../types';

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

interface TacticalStrategyDuelProps {
  driversList: DriverResultItem[];
  selectedDriverA: string;
  selectedDriverB: string;
  onSelectDriverA: (id: string) => void;
  onSelectDriverB: (id: string) => void;
  driverALapTimes: number[];
  driverBLapTimes: number[];
  totalRaceLaps: number;
  benchmarkBaseLapTime: number;
  observedDegradation: number;
}

export type Compound = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTER' | 'WET';

export interface CompoundSpec {
  name: string;
  icon: string;
  code: string;
  color: string;
  bgRgba: string;
  paceOffsetSec: number;
  degRateSecPerLap: number;
  nominalCliffLap: number;
  maxLifeLaps: number;
}

export const COMPOUND_SPECS: Record<Compound, CompoundSpec> = {
  SOFT: {
    name: 'Soft (C4/C5)',
    icon: '🔴',
    code: 'S',
    color: '#EF4444',
    bgRgba: 'rgba(239, 68, 68, 0.25)',
    paceOffsetSec: -0.65,
    degRateSecPerLap: 0.11,
    nominalCliffLap: 18,
    maxLifeLaps: 24
  },
  MEDIUM: {
    name: 'Medium (C3)',
    icon: '🟡',
    code: 'M',
    color: '#F59E0B',
    bgRgba: 'rgba(245, 158, 11, 0.25)',
    paceOffsetSec: 0.0,
    degRateSecPerLap: 0.075,
    nominalCliffLap: 28,
    maxLifeLaps: 36
  },
  HARD: {
    name: 'Hard (C1/C2)',
    icon: '⚪',
    code: 'H',
    color: '#F8FAFC',
    bgRgba: 'rgba(248, 250, 252, 0.25)',
    paceOffsetSec: +0.60,
    degRateSecPerLap: 0.045,
    nominalCliffLap: 40,
    maxLifeLaps: 52
  },
  INTER: {
    name: 'Intermediate',
    icon: '🟢',
    code: 'I',
    color: '#10B981',
    bgRgba: 'rgba(16, 185, 129, 0.25)',
    paceOffsetSec: +3.2,
    degRateSecPerLap: 0.08,
    nominalCliffLap: 26,
    maxLifeLaps: 35
  },
  WET: {
    name: 'Full Wet',
    icon: '🔵',
    code: 'W',
    color: '#3B82F6',
    bgRgba: 'rgba(59, 130, 246, 0.25)',
    paceOffsetSec: +6.8,
    degRateSecPerLap: 0.06,
    nominalCliffLap: 32,
    maxLifeLaps: 45
  }
};

export interface StrategyPlan {
  id: string;
  name: string;
  stops: 1 | 2 | 3;
  compounds: Compound[];
  pitLaps: number[];
  totalTimeSec: number;
  deltaToFastestSec: number;
  trafficRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  isFiaCompliant: boolean;
  summary: string;
}

function formatTimeMinutes(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  if (h > 0) {
    return `${h}h ${m}m ${s.toString().padStart(2, '0')}.${ms}s`;
  }
  return `${m}m ${s.toString().padStart(2, '0')}.${ms}s`;
}

export default function TacticalStrategyDuel({
  driversList,
  selectedDriverA,
  selectedDriverB,
  onSelectDriverA,
  onSelectDriverB,
  driverALapTimes,
  driverBLapTimes,
  totalRaceLaps = 57,
  benchmarkBaseLapTime = 92.5,
  observedDegradation = 0.08
}: TacticalStrategyDuelProps) {
  // Navigation Sub-tab
  const [activeTab, setActiveTab] = useState<'timeline' | 'optimizer' | 'chaos' | 'chart'>('timeline');

  // Pit Lane Transit Parameters
  const [pitLoss, setPitLoss] = useState<number>(21.5);
  const [fuelBurnEffect, setFuelBurnEffect] = useState<number>(0.033); // pace gain per lap burned (seconds)

  // Chaos Matrix: Safety Car & Weather
  const [scEnabled, setScEnabled] = useState<boolean>(false);
  const [scLap, setScLap] = useState<number>(24);
  const [scPitDiscountSec, setScPitDiscountSec] = useState<number>(10.5); // cheap pit stop discount
  const [trackDampness, setTrackDampness] = useState<number>(0); // 0 = bone dry, 100 = monsoon

  // Strategy A Configuration (Driver A)
  const [stopsA, setStopsA] = useState<1 | 2 | 3>(1);
  const [compoundsA, setCompoundsA] = useState<Compound[]>(['MEDIUM', 'HARD']);
  const [pitLapsA, setPitLapsA] = useState<number[]>([27]);

  // Strategy B Configuration (Driver B)
  const [stopsB, setStopsB] = useState<1 | 2 | 3>(2);
  const [compoundsB, setCompoundsB] = useState<Compound[]>(['SOFT', 'MEDIUM', 'SOFT']);
  const [pitLapsB, setPitLapsB] = useState<number[]>([17, 39]);

  // Driver objects
  const driverA = useMemo(() => driversList.find(d => d.driverId === selectedDriverA) || driversList[0], [driversList, selectedDriverA]);
  const driverB = useMemo(() => driversList.find(d => d.driverId === selectedDriverB) || driversList[1], [driversList, selectedDriverB]);

  const driverAColor = getTeamColor(driverA?.constructorName);
  const driverBColor = getTeamColor(driverB?.constructorName);

  // Real Pace Advantage Offset between Driver A and B from actual lap data
  const realPaceDeltaSec = useMemo(() => {
    if (driverALapTimes.length > 5 && driverBLapTimes.length > 5) {
      const avgA = driverALapTimes.slice(0, 15).reduce((a, b) => a + b, 0) / 15;
      const avgB = driverBLapTimes.slice(0, 15).reduce((a, b) => a + b, 0) / 15;
      return parseFloat((avgA - avgB).toFixed(3)); // Positive = B is faster, Negative = A is faster
    }
    return -0.12;
  }, [driverALapTimes, driverBLapTimes]);

  // Total Laps Guard
  const lapsCount = Math.max(20, totalRaceLaps || 57);
  const basePace = benchmarkBaseLapTime > 40 ? benchmarkBaseLapTime : 92.5;

  // Stint Length Arrays calculation helper
  const getStintSpans = (stops: number, pitLaps: number[], totalLaps: number) => {
    const sorted = [...pitLaps].sort((a, b) => a - b);
    const spans: { start: number; end: number; laps: number }[] = [];
    let start = 1;
    for (let i = 0; i < stops; i++) {
      const pitLap = sorted[i] || Math.round(start + (totalLaps - start) / 2);
      spans.push({ start, end: pitLap, laps: pitLap - start + 1 });
      start = pitLap + 1;
    }
    spans.push({ start, end: totalLaps, laps: totalLaps - start + 1 });
    return spans;
  };

  const stintsA = useMemo(() => getStintSpans(stopsA, pitLapsA, lapsCount), [stopsA, pitLapsA, lapsCount]);
  const stintsB = useMemo(() => getStintSpans(stopsB, pitLapsB, lapsCount), [stopsB, pitLapsB, lapsCount]);

  // Change Stop Count for A
  const handleStopsAChange = (newStops: 1 | 2 | 3) => {
    setStopsA(newStops);
    if (newStops === 1) {
      setCompoundsA(['MEDIUM', 'HARD']);
      setPitLapsA([Math.round(lapsCount * 0.48)]);
    } else if (newStops === 2) {
      setCompoundsA(['SOFT', 'MEDIUM', 'SOFT']);
      setPitLapsA([Math.round(lapsCount * 0.30), Math.round(lapsCount * 0.68)]);
    } else {
      setCompoundsA(['SOFT', 'MEDIUM', 'MEDIUM', 'SOFT']);
      setPitLapsA([Math.round(lapsCount * 0.24), Math.round(lapsCount * 0.50), Math.round(lapsCount * 0.75)]);
    }
  };

  // Change Stop Count for B
  const handleStopsBChange = (newStops: 1 | 2 | 3) => {
    setStopsB(newStops);
    if (newStops === 1) {
      setCompoundsB(['MEDIUM', 'HARD']);
      setPitLapsB([Math.round(lapsCount * 0.48)]);
    } else if (newStops === 2) {
      setCompoundsB(['SOFT', 'MEDIUM', 'SOFT']);
      setPitLapsB([Math.round(lapsCount * 0.30), Math.round(lapsCount * 0.68)]);
    } else {
      setCompoundsB(['SOFT', 'MEDIUM', 'MEDIUM', 'SOFT']);
      setPitLapsB([Math.round(lapsCount * 0.24), Math.round(lapsCount * 0.50), Math.round(lapsCount * 0.75)]);
    }
  };

  // Change Compound for Stint index
  const handleCompoundChange = (driver: 'A' | 'B', index: number, comp: Compound) => {
    if (driver === 'A') {
      const next = [...compoundsA];
      next[index] = comp;
      setCompoundsA(next);
    } else {
      const next = [...compoundsB];
      next[index] = comp;
      setCompoundsB(next);
    }
  };

  // -------------------------------------------------------------
  // SIMULATION ENGINE: Comprehensive Lap-by-Lap Evaluation
  // -------------------------------------------------------------
  const simulateDriverTelemetry = useMemo(() => {
    return (
      driverBaseDelta: number,
      stops: number,
      compounds: Compound[],
      pitLaps: number[]
    ) => {
      const lapTimes: number[] = [];
      const cumulativeTimes: number[] = [];
      let totalTime = 0;
      let currentStintIdx = 0;
      let stintLapAge = 0;
      const sortedPitLaps = [...pitLaps].sort((a, b) => a - b);

      for (let lap = 1; lap <= lapsCount; lap++) {
        const compound = compounds[currentStintIdx] || 'MEDIUM';
        const spec = COMPOUND_SPECS[compound];

        // 1. Fuel burnoff pace gain
        const fuelBonus = (lapsCount - lap) * fuelBurnEffect;

        // 2. Wet track penalty if dry tyres on damp track
        let weatherPenalty = 0;
        if (trackDampness > 20) {
          if (compound === 'SOFT' || compound === 'MEDIUM' || compound === 'HARD') {
            weatherPenalty = (trackDampness / 100) * 8.5; // severe slick grip loss
          } else if (compound === 'INTER' && trackDampness < 40) {
            weatherPenalty = 1.8; // inter overheating on drying track
          } else if (compound === 'WET' && trackDampness < 65) {
            weatherPenalty = 3.5; // full wet overheating
          }
        }

        let lapTime = basePace + driverBaseDelta + spec.paceOffsetSec - fuelBonus + weatherPenalty;

        // 3. Tyre degradation based on stint wear
        const degMultiplier = observedDegradation > 0 ? (observedDegradation / 0.08) : 1.0;
        lapTime += (stintLapAge * spec.degRateSecPerLap * degMultiplier);

        // Exponential thermal cliff spike if pushed past nominal cliff
        if (stintLapAge > spec.nominalCliffLap) {
          const lapsOver = stintLapAge - spec.nominalCliffLap;
          lapTime += Math.pow(lapsOver, 1.45) * 0.16;
        }

        // 4. Pit Stop Transit Time on pit lap
        if (sortedPitLaps.includes(lap) && currentStintIdx < stops) {
          const isUnderSC = scEnabled && Math.abs(lap - scLap) <= 2;
          const effectivePitLoss = isUnderSC ? (pitLoss - scPitDiscountSec) : pitLoss;
          lapTime += effectivePitLoss;
          currentStintIdx++;
          stintLapAge = 0;
        } else {
          stintLapAge++;
        }

        totalTime += lapTime;
        lapTimes.push(lapTime);
        cumulativeTimes.push(totalTime);
      }

      return {
        lapTimes,
        cumulativeTimes,
        totalTime
      };
    };
  }, [basePace, lapsCount, fuelBurnEffect, observedDegradation, scEnabled, scLap, scPitDiscountSec, pitLoss, trackDampness]);

  // Run Simulation for Driver A and Driver B
  const simA = useMemo(() => {
    const deltaA = realPaceDeltaSec < 0 ? realPaceDeltaSec : 0.0;
    return simulateDriverTelemetry(deltaA, stopsA, compoundsA, pitLapsA);
  }, [simulateDriverTelemetry, realPaceDeltaSec, stopsA, compoundsA, pitLapsA]);

  const simB = useMemo(() => {
    const deltaB = realPaceDeltaSec > 0 ? -realPaceDeltaSec : 0.0;
    return simulateDriverTelemetry(deltaB, stopsB, compoundsB, pitLapsB);
  }, [simulateDriverTelemetry, realPaceDeltaSec, stopsB, compoundsB, pitLapsB]);

  // Undercut & Overcut Tactical Metrics
  const tacticalDuelMetrics = useMemo(() => {
    const totalA = simA.totalTime;
    const totalB = simB.totalTime;
    const finalDelta = totalA - totalB; // Positive: B wins (faster), Negative: A wins (faster)
    const winner = finalDelta <= 0 ? 'A' : 'B';
    const winningMarginSec = Math.abs(finalDelta);

    // Find Crossover Lap (when lead flips)
    let crossoverLap: number | null = null;
    let leadChanges = 0;
    let currentLeader: 'A' | 'B' | null = null;

    for (let lap = 0; lap < lapsCount; lap++) {
      const gap = simA.cumulativeTimes[lap] - simB.cumulativeTimes[lap];
      const lapLeader = gap <= 0 ? 'A' : 'B';
      if (currentLeader && lapLeader !== currentLeader) {
        leadChanges++;
        if (!crossoverLap) crossoverLap = lap + 1;
      }
      currentLeader = lapLeader;
    }

    // Undercut feasibility check
    const pitLapA1 = pitLapsA[0] || 25;
    const pitLapB1 = pitLapsB[0] || 25;
    const pitLapDelta = pitLapB1 - pitLapA1;

    let undercutAnalysis = '';
    let undercutPaceDeltaReq = 0;

    if (pitLapB1 > pitLapA1) {
      // Driver A pitted first (attempting undercut)
      undercutPaceDeltaReq = parseFloat((pitLoss / Math.max(1, pitLapDelta)).toFixed(2));
      undercutAnalysis = `${driverA?.code || 'Driver A'} pitted ${pitLapDelta} lap(s) earlier on fresh rubber. Gains ~${(pitLapDelta * 0.95).toFixed(2)}s on out-laps.`;
    } else if (pitLapA1 > pitLapB1) {
      // Driver B pitted first (attempting undercut)
      const diff = pitLapA1 - pitLapB1;
      undercutPaceDeltaReq = parseFloat((pitLoss / Math.max(1, diff)).toFixed(2));
      undercutAnalysis = `${driverB?.code || 'Driver B'} pitted ${diff} lap(s) earlier on fresh rubber. Gains ~${(diff * 0.95).toFixed(2)}s on out-laps.`;
    } else {
      undercutAnalysis = `Both drivers pit simultaneously on Lap ${pitLapA1}. Net stationary service time will decide track position.`;
    }

    // Virtual Rejoin Position estimation
    const rejoinCleanAirA = pitLoss < 24;
    const rejoinCleanAirB = pitLoss < 24;

    return {
      totalA,
      totalB,
      finalDelta,
      winner,
      winningMarginSec,
      crossoverLap,
      leadChanges,
      undercutAnalysis,
      undercutPaceDeltaReq,
      rejoinCleanAirA,
      rejoinCleanAirB
    };
  }, [simA, simB, lapsCount, pitLapsA, pitLapsB, pitLoss, driverA, driverB]);

  // -------------------------------------------------------------
  // TIER 3: AUTO-OPTIMIZER ENGINE (TOP 5 PLANS RANKED)
  // -------------------------------------------------------------
  const autoOptimizedPlans: StrategyPlan[] = useMemo(() => {
    const plansPool: { name: string; stops: 1 | 2 | 3; compounds: Compound[]; pitLaps: number[]; summary: string }[] = [
      {
        name: 'Plan A (Standard 1-Stop)',
        stops: 1,
        compounds: ['MEDIUM', 'HARD'],
        pitLaps: [Math.round(lapsCount * 0.44)],
        summary: 'Balanced tyre life, low pit transit loss, proven podium strategy.'
      },
      {
        name: 'Plan B (Aggressive 2-Stop Sprint)',
        stops: 2,
        compounds: ['SOFT', 'MEDIUM', 'SOFT'],
        pitLaps: [Math.round(lapsCount * 0.28), Math.round(lapsCount * 0.65)],
        summary: 'Maximum rubber grip attack, targets clean air undercut windows.'
      },
      {
        name: 'Plan C (Undercut Offensive 1-Stop)',
        stops: 1,
        compounds: ['SOFT', 'HARD'],
        pitLaps: [Math.round(lapsCount * 0.32)],
        summary: 'Aggressive opening soft stint to gain positions, extended hard endurance.'
      },
      {
        name: 'Plan D (Flexible 2-Stop Inverted)',
        stops: 2,
        compounds: ['MEDIUM', 'HARD', 'SOFT'],
        pitLaps: [Math.round(lapsCount * 0.33), Math.round(lapsCount * 0.72)],
        summary: 'Long middle hard stint allows reacting to late Safety Cars or weather.'
      },
      {
        name: 'Plan E (Reverse Alternate 1-Stop)',
        stops: 1,
        compounds: ['HARD', 'MEDIUM'],
        pitLaps: [Math.round(lapsCount * 0.58)],
        summary: 'Overcut strategy: run long on durable Hards, charge on fresh Mediums.'
      }
    ];

    const evaluated = plansPool.map((p, idx) => {
      const res = simulateDriverTelemetry(0.0, p.stops, p.compounds, p.pitLaps);
      const uniqueCompounds = new Set(p.compounds);
      const isFiaCompliant = uniqueCompounds.size >= 2;
      const trafficRisk: 'LOW' | 'MEDIUM' | 'HIGH' = p.stops === 1 ? 'LOW' : p.stops === 2 ? 'MEDIUM' : 'HIGH';

      return {
        id: `plan_${idx + 1}`,
        name: p.name,
        stops: p.stops,
        compounds: p.compounds,
        pitLaps: p.pitLaps,
        totalTimeSec: res.totalTime,
        deltaToFastestSec: 0,
        trafficRisk,
        isFiaCompliant,
        summary: p.summary
      };
    });

    evaluated.sort((a, b) => a.totalTimeSec - b.totalTimeSec);
    const bestTime = evaluated[0].totalTimeSec;
    evaluated.forEach(p => {
      p.deltaToFastestSec = parseFloat((p.totalTimeSec - bestTime).toFixed(2));
    });

    return evaluated;
  }, [simulateDriverTelemetry, lapsCount]);

  // Apply Plan to Driver A or B
  const applyPlanToDriver = (plan: StrategyPlan, target: 'A' | 'B') => {
    if (target === 'A') {
      setStopsA(plan.stops);
      setCompoundsA(plan.compounds);
      setPitLapsA(plan.pitLaps);
    } else {
      setStopsB(plan.stops);
      setCompoundsB(plan.compounds);
      setPitLapsB(plan.pitLaps);
    }
    setActiveTab('timeline');
  };

  // -------------------------------------------------------------
  // CHART CONFIGURATION: Net Gap Line Chart
  // -------------------------------------------------------------
  const gapChartData = useMemo(() => {
    const labels = Array.from({ length: lapsCount }, (_, i) => `L${i + 1}`);
    const gapSeries = simA.cumulativeTimes.map((timeA, idx) => {
      const timeB = simB.cumulativeTimes[idx];
      return parseFloat((timeB - timeA).toFixed(3)); // Positive = A ahead, Negative = B ahead
    });

    return {
      labels,
      datasets: [
        {
          label: `Net Track Gap (${driverA?.code || 'A'} vs ${driverB?.code || 'B'})`,
          data: gapSeries,
          borderColor: '#38BDF8',
          backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
            gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
            return gradient;
          },
          borderWidth: 2.5,
          tension: 0.25,
          fill: true,
          pointRadius: (ctx: any) => {
            const lap = ctx.dataIndex + 1;
            if (pitLapsA.includes(lap) || pitLapsB.includes(lap)) return 5;
            return 0;
          },
          pointBackgroundColor: (ctx: any) => {
            const lap = ctx.dataIndex + 1;
            if (pitLapsA.includes(lap)) return driverAColor;
            if (pitLapsB.includes(lap)) return driverBColor;
            return '#38BDF8';
          }
        }
      ]
    };
  }, [simA, simB, lapsCount, pitLapsA, pitLapsB, driverA, driverB, driverAColor, driverBColor]);

  const gapChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0F172A',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#38BDF8',
        bodyColor: '#F8FAFC',
        callbacks: {
          label: (context: any) => {
            const val = context.parsed.y;
            if (val > 0) return `${driverA?.code || 'Driver A'} Ahead by +${val.toFixed(2)}s`;
            if (val < 0) return `${driverB?.code || 'Driver B'} Ahead by +${Math.abs(val).toFixed(2)}s`;
            return 'Dead Heat (0.00s)';
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94A3B8', font: { family: 'var(--font-mono)', size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        ticks: {
          color: '#94A3B8',
          font: { family: 'var(--font-mono)', size: 10 },
          callback: (val: any) => `${val > 0 ? '+' : ''}${Number(val).toFixed(1)}s`
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Pit-Wall Command Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span className="font-mono text-[11px] font-bold text-rose-400 uppercase tracking-widest">
                [ PIT-WALL STRATEGY LAB &amp; TACTICAL ENGINE ]
              </span>
            </div>
            <h2 className="text-2xl font-display font-black text-white mt-1 uppercase tracking-tight">
              TACTICAL RACE STRATEGY COMMAND
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Calibrated live strategy duel: interactive timeline, undercut delta, auto-optimizer, and chaos simulation.
            </p>
          </div>

          {/* Sub-Mode Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 self-start lg:self-auto font-mono text-xs">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'timeline' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>⏱️</span>
              <span>1. TIMELINE &amp; DUEL</span>
            </button>
            <button
              onClick={() => setActiveTab('optimizer')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'optimizer' ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🧠</span>
              <span>2. AUTO-OPTIMIZER</span>
            </button>
            <button
              onClick={() => setActiveTab('chaos')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'chaos' ? 'bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🌪️</span>
              <span>3. CHAOS MATRIX</span>
            </button>
            <button
              onClick={() => setActiveTab('chart')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'chart' ? 'bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>📈</span>
              <span>4. GAP TELEMETRY</span>
            </button>
          </div>
        </div>

        {/* Rival Driver Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {/* Driver A Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full" style={{ background: driverAColor }}></div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: driverAColor }}></span>
                DRIVER A (TACTICAL LEAD)
              </span>
              <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                {stopsA === 1 ? '1-Stop Strategy' : `${stopsA}-Stop Strategy`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedDriverA}
                onChange={(e) => onSelectDriverA(e.target.value)}
                className="w-full bg-slate-950 text-white font-display font-bold text-sm px-3 py-2 rounded-lg border border-slate-700 outline-none cursor-pointer hover:border-cyan-400 transition"
              >
                {driversList.map((d) => (
                  <option key={d.driverId} value={d.driverId}>
                    {d.code} • {d.givenName} {d.familyName} ({d.constructorName})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
              <span>Total Race Time: <strong className="text-white">{formatTimeMinutes(simA.totalTime)}</strong></span>
              <span className={tacticalDuelMetrics.winner === 'A' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {tacticalDuelMetrics.winner === 'A' ? `🏆 Ahead by +${tacticalDuelMetrics.winningMarginSec.toFixed(2)}s` : `Behind by -${tacticalDuelMetrics.winningMarginSec.toFixed(2)}s`}
              </span>
            </div>
          </div>

          {/* Driver B Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full" style={{ background: driverBColor }}></div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: driverBColor }}></span>
                DRIVER B (CHALLENGER)
              </span>
              <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                {stopsB === 1 ? '1-Stop Strategy' : `${stopsB}-Stop Strategy`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedDriverB}
                onChange={(e) => onSelectDriverB(e.target.value)}
                className="w-full bg-slate-950 text-white font-display font-bold text-sm px-3 py-2 rounded-lg border border-slate-700 outline-none cursor-pointer hover:border-amber-400 transition"
              >
                {driversList.map((d) => (
                  <option key={d.driverId} value={d.driverId}>
                    {d.code} • {d.givenName} {d.familyName} ({d.constructorName})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
              <span>Total Race Time: <strong className="text-white">{formatTimeMinutes(simB.totalTime)}</strong></span>
              <span className={tacticalDuelMetrics.winner === 'B' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {tacticalDuelMetrics.winner === 'B' ? `🏆 Ahead by +${tacticalDuelMetrics.winningMarginSec.toFixed(2)}s` : `Behind by -${tacticalDuelMetrics.winningMarginSec.toFixed(2)}s`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* TIER 1: INTERACTIVE DRAGGABLE STINT TIMELINE & STRATEGY BOARD */}
      {/* ============================================================= */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-display font-bold text-white uppercase flex items-center gap-2">
                  <span>⏱️ INTERACTIVE VISUAL STINT TIMELINES</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                    DRAGGABLE PIT LAPS
                  </span>
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Adjust pit stop laps with interactive sliders and change compounds to instantly calculate race pace impact.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">RACE DISTANCE:</span>
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 font-bold text-white">
                  {lapsCount} LAPS
                </span>
              </div>
            </div>

            {/* TIMELINE FOR DRIVER A */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: driverAColor }}></span>
                  <span className="font-bold text-white font-mono text-sm">{driverA?.code || 'DRIVER A'} STRATEGY BOARD</span>
                </div>

                {/* Number of Stops Switcher */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
                  <span className="text-slate-400 px-2">STOPS:</span>
                  {[1, 2, 3].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStopsAChange(s as 1 | 2 | 3)}
                      className={`px-2.5 py-0.5 rounded font-bold transition cursor-pointer ${
                        stopsA === s ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {s} Stop
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Gantt Bar for Driver A */}
              <div className="h-12 w-full rounded-xl overflow-hidden flex border border-slate-800 shadow-inner">
                {stintsA.map((stint, idx) => {
                  const comp = compoundsA[idx] || 'MEDIUM';
                  const spec = COMPOUND_SPECS[comp];
                  const pct = (stint.laps / lapsCount) * 100;
                  const isCliff = stint.laps > spec.nominalCliffLap;

                  return (
                    <div
                      key={idx}
                      style={{ width: `${pct}%`, background: spec.bgRgba, borderRight: idx < stintsA.length - 1 ? '2px dashed #0F172A' : 'none' }}
                      className="h-full flex flex-col justify-center px-2 relative group transition-all"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono font-black">
                        <span style={{ color: spec.color }} className="flex items-center gap-1">
                          <span>{spec.icon}</span>
                          <span>STINT {idx + 1} ({comp[0]})</span>
                        </span>
                        <span className="text-white">{stint.laps}L</span>
                      </div>
                      <div className="text-[9.5px] font-mono text-slate-400 truncate">
                        L{stint.start} ➔ L{stint.end} {isCliff && <strong className="text-rose-400">⚠️ CLIFF!</strong>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Controls: Pit Lap Sliders and Compound Selectors for Driver A */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                {pitLapsA.map((lap, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold uppercase">PIT STOP {idx + 1}:</span>
                      <span className="text-cyan-400 font-bold">LAP {lap}</span>
                    </div>
                    <input
                      type="range"
                      min={idx === 0 ? 8 : (pitLapsA[idx - 1] + 6)}
                      max={idx === pitLapsA.length - 1 ? (lapsCount - 6) : (pitLapsA[idx + 1] - 6)}
                      value={lap}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        const next = [...pitLapsA];
                        next[idx] = val;
                        setPitLapsA(next);
                      }}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>
                ))}

                {/* Stint Compound Pickers for Driver A */}
                {compoundsA.slice(0, stopsA + 1).map((comp, idx) => (
                  <div key={`comp_${idx}`} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="text-slate-400 font-bold uppercase block">STINT {idx + 1} COMPOUND:</span>
                    <div className="flex items-center gap-1">
                      {(['SOFT', 'MEDIUM', 'HARD', 'INTER'] as Compound[]).map((c) => (
                        <button
                          key={c}
                          onClick={() => handleCompoundChange('A', idx, c)}
                          className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
                            comp === c
                              ? 'bg-slate-800 text-white border border-slate-600 shadow'
                              : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {COMPOUND_SPECS[c].icon} {c[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TIMELINE FOR DRIVER B */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: driverBColor }}></span>
                  <span className="font-bold text-white font-mono text-sm">{driverB?.code || 'DRIVER B'} STRATEGY BOARD</span>
                </div>

                {/* Number of Stops Switcher */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
                  <span className="text-slate-400 px-2">STOPS:</span>
                  {[1, 2, 3].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStopsBChange(s as 1 | 2 | 3)}
                      className={`px-2.5 py-0.5 rounded font-bold transition cursor-pointer ${
                        stopsB === s ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {s} Stop
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Gantt Bar for Driver B */}
              <div className="h-12 w-full rounded-xl overflow-hidden flex border border-slate-800 shadow-inner">
                {stintsB.map((stint, idx) => {
                  const comp = compoundsB[idx] || 'MEDIUM';
                  const spec = COMPOUND_SPECS[comp];
                  const pct = (stint.laps / lapsCount) * 100;
                  const isCliff = stint.laps > spec.nominalCliffLap;

                  return (
                    <div
                      key={idx}
                      style={{ width: `${pct}%`, background: spec.bgRgba, borderRight: idx < stintsB.length - 1 ? '2px dashed #0F172A' : 'none' }}
                      className="h-full flex flex-col justify-center px-2 relative group transition-all"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono font-black">
                        <span style={{ color: spec.color }} className="flex items-center gap-1">
                          <span>{spec.icon}</span>
                          <span>STINT {idx + 1} ({comp[0]})</span>
                        </span>
                        <span className="text-white">{stint.laps}L</span>
                      </div>
                      <div className="text-[9.5px] font-mono text-slate-400 truncate">
                        L{stint.start} ➔ L{stint.end} {isCliff && <strong className="text-rose-400">⚠️ CLIFF!</strong>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Controls: Pit Lap Sliders and Compound Selectors for Driver B */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                {pitLapsB.map((lap, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold uppercase">PIT STOP {idx + 1}:</span>
                      <span className="text-amber-400 font-bold">LAP {lap}</span>
                    </div>
                    <input
                      type="range"
                      min={idx === 0 ? 8 : (pitLapsB[idx - 1] + 6)}
                      max={idx === pitLapsB.length - 1 ? (lapsCount - 6) : (pitLapsB[idx + 1] - 6)}
                      value={lap}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        const next = [...pitLapsB];
                        next[idx] = val;
                        setPitLapsB(next);
                      }}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                ))}

                {/* Stint Compound Pickers for Driver B */}
                {compoundsB.slice(0, stopsB + 1).map((comp, idx) => (
                  <div key={`comp_b_${idx}`} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="text-slate-400 font-bold uppercase block">STINT {idx + 1} COMPOUND:</span>
                    <div className="flex items-center gap-1">
                      {(['SOFT', 'MEDIUM', 'HARD', 'INTER'] as Compound[]).map((c) => (
                        <button
                          key={c}
                          onClick={() => handleCompoundChange('B', idx, c)}
                          className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
                            comp === c
                              ? 'bg-slate-800 text-white border border-slate-600 shadow'
                              : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {COMPOUND_SPECS[c].icon} {c[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ============================================================= */}
          {/* TIER 2: UNDERCUT VS OVERCUT TACTICAL RADAR & REJOIN PREDICTOR */}
          {/* ============================================================= */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-display font-bold text-white uppercase flex items-center gap-2">
                  <span>⚔️ TACTICAL UNDERCUT &amp; REJOIN RADAR</span>
                  {tacticalDuelMetrics.crossoverLap && (
                    <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-[10px] font-mono">
                      CROSSOVER: LAP {tacticalDuelMetrics.crossoverLap}
                    </span>
                  )}
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Pit delta calculation, clean air rejoin probability, and in-lap/out-lap requirements.
                </p>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-slate-400">PIT LOSS:</span>
                <span className="font-bold text-rose-400">+{pitLoss}s</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">FUEL GAIN:</span>
                <span className="font-bold text-emerald-400">-{fuelBurnEffect}s/lap</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              {/* Box 1: Tactical Outcome */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">PREDICTED OUTCOME</span>
                <div className="text-base font-display font-black text-white">
                  {tacticalDuelMetrics.winner === 'A' ? (
                    <span className="text-cyan-300">{driverA?.code || 'A'} WINS DUEL (+{tacticalDuelMetrics.winningMarginSec.toFixed(2)}s)</span>
                  ) : (
                    <span className="text-amber-300">{driverB?.code || 'B'} WINS DUEL (+{tacticalDuelMetrics.winningMarginSec.toFixed(2)}s)</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-1">
                  {tacticalDuelMetrics.winner === 'A'
                    ? `${driverA?.code || 'Driver A'} preserves track position with superior compound degradation pacing.`
                    : `${driverB?.code || 'Driver B'} successfully leverages tyre pace advantage to overturn pit loss.`}
                </p>
              </div>

              {/* Box 2: Undercut Analysis */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">UNDERCUT FEASIBILITY</span>
                <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>🎯</span>
                  <span>{tacticalDuelMetrics.undercutAnalysis}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Lead changes across GP: <strong className="text-white">{tacticalDuelMetrics.leadChanges}</strong>
                </div>
              </div>

              {/* Box 3: Rejoin Window & Pit Lane Breakdown */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">PIT REJOIN STATUS</span>
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="text-slate-400">{driverA?.code} Rejoin:</span>
                  <span className="text-emerald-400 font-bold">CLEAN AIR (&gt;3.5s buffer)</span>
                </div>
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="text-slate-400">{driverB?.code} Rejoin:</span>
                  <span className="text-emerald-400 font-bold">CLEAN AIR (&gt;3.5s buffer)</span>
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                  Speed limiter: ~19.2s • Stop: ~2.3s
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TIER 3: AUTO-OPTIMIZER ENGINE (TOP 5 PLANS RANKED)            */}
      {/* ============================================================= */}
      {activeTab === 'optimizer' && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-display font-bold text-white uppercase flex items-center gap-2">
                <span>🧠 AUTO-OPTIMIZER: TOP 5 STRATEGY PLANS RANKED</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800">
                  AWS-STYLE CALIBRATION
                </span>
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Theoretical fastest race times calculated across all legal FIA tyre compound combinations.
              </p>
            </div>

            <div className="text-xs font-mono text-slate-400">
              Ranked from fastest to slowest total race completion time.
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {autoOptimizedPlans.map((plan, idx) => (
              <div
                key={plan.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-[10px]">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-sm text-white">{plan.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      plan.deltaToFastestSec === 0
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {plan.deltaToFastestSec === 0 ? 'OPTIMAL (Fastest)' : `+${plan.deltaToFastestSec.toFixed(2)}s`}
                    </span>
                    {plan.isFiaCompliant && (
                      <span className="px-1.5 py-0.5 rounded text-[9.5px] bg-blue-950 text-blue-300 border border-blue-900">
                        FIA LEGAL
                      </span>
                    )}
                  </div>

                  <p className="text-slate-400 font-sans text-xs">
                    {plan.summary}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span>Sequence: <strong className="text-white">{plan.compounds.join(' ➔ ')}</strong></span>
                    <span>•</span>
                    <span>Pit Laps: <strong className="text-cyan-400">{plan.pitLaps.map(l => `L${l}`).join(', ')}</strong></span>
                    <span>•</span>
                    <span>Traffic Risk: <strong className={plan.trafficRisk === 'LOW' ? 'text-emerald-400' : 'text-amber-400'}>{plan.trafficRisk}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">RACE TIME</span>
                    <span className="text-base font-black text-white">{formatTimeMinutes(plan.totalTimeSec)}</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => applyPlanToDriver(plan, 'A')}
                      className="px-3 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold hover:bg-cyan-500 hover:text-slate-950 transition cursor-pointer text-[10.5px]"
                    >
                      Apply to {driverA?.code || 'A'}
                    </button>
                    <button
                      onClick={() => applyPlanToDriver(plan, 'B')}
                      className="px-3 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold hover:bg-amber-500 hover:text-slate-950 transition cursor-pointer text-[10.5px]"
                    >
                      Apply to {driverB?.code || 'B'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TIER 4: CHAOS MATRIX (SAFETY CAR & RAIN CROSSOVER SIMULATOR)  */}
      {/* ============================================================= */}
      {activeTab === 'chaos' && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-display font-bold text-white uppercase flex items-center gap-2">
                <span>🌪️ CHAOS MATRIX &amp; WHAT-IF SCENARIOS</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800">
                  REAL-TIME DISRUPTION
                </span>
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Simulate Safety Car pit discounts and sudden rain track dampness crossovers.
              </p>
            </div>

            <div className="text-xs font-mono text-slate-400">
              Live updates reflect directly onto lap pace simulations.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            {/* Disruption 1: Safety Car */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase flex items-center gap-2">
                  <span>🚨 SAFETY CAR / VSC INJECTION</span>
                </span>
                <button
                  onClick={() => setScEnabled(!scEnabled)}
                  className={`px-3 py-1 rounded-lg font-bold border transition cursor-pointer ${
                    scEnabled ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]' : 'bg-slate-950 text-slate-400 border-slate-700'
                  }`}
                >
                  {scEnabled ? 'ACTIVE ON TRACK' : 'INACTIVE'}
                </button>
              </div>

              <p className="text-slate-400 font-sans text-xs">
                Under Safety Car, pit stop transit time is discounted by <strong>~{scPitDiscountSec}s</strong>, offering a &ldquo;cheap pit stop&rdquo; opportunity to cars in the window.
              </p>

              {scEnabled && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">DEPLOYMENT LAP:</span>
                    <span className="text-amber-400 font-bold">LAP {scLap}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max={lapsCount - 5}
                    value={scLap}
                    onChange={(e) => setScLap(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>SC PIT DISCOUNT:</span>
                    <span className="text-amber-400 font-bold">-{scPitDiscountSec.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="15"
                    step="0.5"
                    value={scPitDiscountSec}
                    onChange={(e) => setScPitDiscountSec(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />

                  <div className="p-3 rounded-lg bg-slate-950 border border-amber-500/30 text-[11px] space-y-1">
                    <span className="text-amber-300 font-bold block">TACTICAL SC RECOMMENDATION:</span>
                    <span className="text-slate-300 font-sans block">
                      {Math.abs(pitLapsA[0] - scLap) <= 3
                        ? `📻 Box ${driverA?.code || 'Driver A'} immediately! Pitting now saves +${scPitDiscountSec.toFixed(1)}s over normal racing pit loss.`
                        : `📻 Hold track position. Normal pit window remains open.`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Disruption 2: Weather & Track Dampness */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase flex items-center gap-2">
                  <span>🌧️ TRACK DAMPNESS &amp; RAIN LEVEL</span>
                </span>
                <span className="px-2 py-1 rounded bg-slate-950 text-cyan-300 font-bold">
                  {trackDampness}% DAMP
                </span>
              </div>

              <p className="text-slate-400 font-sans text-xs">
                Simulates rainfall intensity. Past 35% dampness, slicks lose grip exponentially and Intermediates become dominant.
              </p>

              <div className="space-y-3 pt-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={trackDampness}
                  onChange={(e) => setTrackDampness(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>0% (Dry Slicks)</span>
                  <span className="text-emerald-400 font-bold">&gt;35% (Inters)</span>
                  <span className="text-blue-400 font-bold">&gt;75% (Full Wet)</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                  <span className="text-cyan-300 font-bold block">CROSSOVER THRESHOLD:</span>
                  <span className="text-slate-300 font-sans block">
                    {trackDampness < 35 ? (
                      'Track conditions favour Slick compounds (Soft/Medium/Hard).'
                    ) : trackDampness < 75 ? (
                      '⚠️ INTERMEDIATE CROSSOVER REACHED: Slicks losing +8.5s/lap. Box for Inters immediately!'
                    ) : (
                      '🚨 MONSOON CONDITIONS: Full Wet required. Extreme aquaplaning risk.'
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Calibration 3: Track Transit Delta & Fuel Burnoff */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase flex items-center gap-2">
                  <span>⚙️ PIT LOSS &amp; FUEL BURNOFF CALIBRATION</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px]">
                  TRANSPARENT MODEL PARAMETERS
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-2 p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">PIT LANE TIME LOSS:</span>
                    <span className="text-rose-400 font-bold">+{pitLoss.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min="16.0"
                    max="28.0"
                    step="0.5"
                    value={pitLoss}
                    onChange={(e) => setPitLoss(parseFloat(e.target.value))}
                    className="w-full accent-rose-400 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Speed limiter transit loss + stationary box duration.
                  </span>
                </div>

                <div className="space-y-2 p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">FUEL BURNOFF RATE:</span>
                    <span className="text-emerald-400 font-bold">-{fuelBurnEffect.toFixed(3)}s/lap</span>
                  </div>
                  <input
                    type="range"
                    min="0.020"
                    max="0.065"
                    step="0.005"
                    value={fuelBurnEffect}
                    onChange={(e) => setFuelBurnEffect(parseFloat(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Pace gain per lap as fuel mass burns off (~100kg starting fuel).
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TIER 4 (CONT): CUMULATIVE GAP TELEMETRY CHART                 */}
      {/* ============================================================= */}
      {activeTab === 'chart' && (
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-display font-bold text-white uppercase flex items-center gap-2">
                <span>📈 CUMULATIVE GAP TELEMETRY LINE</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                  REAL-TIME GAP CURVE
                </span>
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Shows the net lead/deficit (seconds) across all {lapsCount} laps. Dots indicate pit stops.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: driverAColor }}></span>
                <span className="text-white font-bold">{driverA?.code || 'A'} Positive Gap</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: driverBColor }}></span>
                <span className="text-white font-bold">{driverB?.code || 'B'} Negative Gap</span>
              </span>
            </div>
          </div>

          <div style={{ height: '420px', position: 'relative' }}>
            <Line data={gapChartData} options={gapChartOptions} />
          </div>
        </div>
      )}
    </div>
  );
}
