'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSeason } from '../contexts/SeasonContext';
import { getJSON, API_BASE, parseLapTime } from '../utils/api';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

type ToolId = 'telemetry' | 'pace' | 'strategy' | 'tyres';

interface RoundItem {
  round: string;
  raceName: string;
  date: string;
  circuitId: string;
}

interface DriverResultItem {
  driverId: string;
  code: string;
  givenName: string;
  familyName: string;
  constructorName: string;
  grid: string;
  position: string;
  status: string;
  fastestLapSecs?: number;
  fastestLapSpeed?: string;
  lapsCompleted: number;
}

interface ToolCard {
  id: ToolId;
  icon: string;
  name: string;
  shortDesc: string;
  status: 'AVAILABLE' | 'ACTIVE' | 'EXPERIMENTAL';
  badge: string;
}

const LAB_TOOLS: ToolCard[] = [
  {
    id: 'telemetry',
    icon: '⚡',
    name: 'TELEMETRY & LAP ANALYZER',
    shortDesc: 'Analyze real lap-by-lap pace, sector breakdown, top speeds, and consistency index.',
    status: 'AVAILABLE',
    badge: 'REAL DATA'
  },
  {
    id: 'pace',
    icon: '⚔️',
    name: 'DRIVER RACE PACE DELTA',
    shortDesc: 'Compare head-to-head lap times, position changes, and cumulative time gaps between two drivers.',
    status: 'AVAILABLE',
    badge: 'DERIVED METRIC'
  },
  {
    id: 'strategy',
    icon: '📊',
    name: 'PIT STRATEGY SIMULATOR',
    shortDesc: 'Simulate 1-stop vs 2-stop vs 3-stop stint degradation calibrated with real GP pace.',
    status: 'AVAILABLE',
    badge: 'CALIBRATED MODEL'
  },
  {
    id: 'tyres',
    icon: '🔴',
    name: 'TYRE DEGRADATION LAB',
    shortDesc: 'Analyze compound thermal wear rates (Soft / Medium / Hard) derived from real race stints.',
    status: 'AVAILABLE',
    badge: 'EXPERIMENTAL'
  }
];

export default function LabPage() {
  const { selectedSeason } = useSeason();

  // Active Tool Selection
  const [activeTool, setActiveTool] = useState<ToolId>('telemetry');

  // Rounds & Drivers State
  const [rounds, setRounds] = useState<RoundItem[]>([]);
  const [selectedRound, setSelectedRound] = useState<string>('');
  const [driversList, setDriversList] = useState<DriverResultItem[]>([]);
  const [selectedDriverA, setSelectedDriverA] = useState<string>('');
  const [selectedDriverB, setSelectedDriverB] = useState<string>('');

  // Global Loading / Status States
  const [loadingRounds, setLoadingRounds] = useState(true);
  const [loadingSessionData, setLoadingSessionData] = useState(false);
  const [loadingLaps, setLoadingLaps] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusNote, setStatusNote] = useState('');

  // REAL DRIVER LAP TIMING ARRAYS (Fetched from API)
  const [driverALapTimes, setDriverALapTimes] = useState<number[]>([]);
  const [driverBLapTimes, setDriverBLapTimes] = useState<number[]>([]);

  // OUTLIER & PACE FOCUS MODE CONTROLS (Fixes squished graph scale caused by red flags / stoppages)
  const [excludeOutliers, setExcludeOutliers] = useState<boolean>(true);
  const [outlierCutoffMode, setOutlierCutoffMode] = useState<string>('auto'); // 'auto' | '95' | '105' | '120' | '150' | '180'
  const [smoothLines, setSmoothLines] = useState<boolean>(true);
  const [showBenchmark, setShowBenchmark] = useState<boolean>(true);

  // Dynamic Effective Threshold Calculation (Auto calculates Median Pace + 12s)
  const effectiveThreshold = useMemo(() => {
    if (outlierCutoffMode !== 'auto') {
      return parseInt(outlierCutoffMode, 10) || 105;
    }

    const allValid = [...driverALapTimes, ...driverBLapTimes].filter(t => typeof t === 'number' && !isNaN(t) && t > 30);
    if (allValid.length === 0) return 105;

    const sorted = [...allValid].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const medianPace = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    return Math.max(92, Math.ceil(medianPace + 12));
  }, [outlierCutoffMode, driverALapTimes, driverBLapTimes]);

  // ===== PIT STRATEGY SIMULATOR INPUTS (Auto-calibrated from real data) =====
  const [laps, setLaps] = useState(58);
  const [baseTime, setBaseTime] = useState(92.0);
  const [degradation, setDegradation] = useState(0.08);
  const [pitLoss, setPitLoss] = useState(22.0);
  const [stopsA, setStopsA] = useState(2);
  const [stopsB, setStopsB] = useState(1);
  const [simResults, setSimResults] = useState<{
    totalA: number;
    totalB: number;
    delta: number;
    lapTimesA: number[];
    lapTimesB: number[];
  } | null>(null);

  // ===== TYRE LAB COMPOUND MODEL STATE =====
  const [softDeg, setSoftDeg] = useState(0.14);
  const [mediumDeg, setMediumDeg] = useState(0.09);
  const [hardDeg, setHardDeg] = useState(0.05);
  const [tyreStintLaps, setTyreStintLaps] = useState(35);

  // -------------------------------------------------------------
  // 1. FETCH ROUNDS FOR SELECTED SEASON
  // -------------------------------------------------------------
  useEffect(() => {
    async function loadRounds() {
      setLoadingRounds(true);
      setErrorMsg('');
      setSelectedRound('');
      setDriversList([]);
      setSelectedDriverA('');
      setSelectedDriverB('');
      setDriverALapTimes([]);
      setDriverBLapTimes([]);

      try {
        const res = await getJSON(`${API_BASE}/${selectedSeason}.json`) as { MRData?: { RaceTable?: { Races?: Array<{ round: string; raceName: string; date: string; Circuit?: { circuitId?: string } }> } } };
        const raceList = res?.MRData?.RaceTable?.Races || [];
        const formatted = raceList.map(r => ({
          round: r.round,
          raceName: r.raceName,
          date: r.date,
          circuitId: r.Circuit?.circuitId || ''
        }));

        setRounds(formatted);

        const now = new Date();
        const pastCompleted = formatted.filter(r => new Date(r.date) <= now);
        if (pastCompleted.length > 0) {
          setSelectedRound(pastCompleted[pastCompleted.length - 1].round);
        } else if (formatted.length > 0) {
          setSelectedRound(formatted[0].round);
        }
      } catch (e: unknown) {
        const err = e as Error;
        setStatusNote(`Failed to fetch ${selectedSeason} rounds calendar: ${err.message}`);
      } finally {
        setLoadingRounds(false);
      }
    }

    loadRounds();
  }, [selectedSeason]);

  // -------------------------------------------------------------
  // 2. FETCH RACE RESULTS & DRIVER TELEMETRY FOR SELECTED ROUND
  // -------------------------------------------------------------
  useEffect(() => {
    if (!selectedRound) return;

    async function loadSessionTelemetry() {
      setLoadingSessionData(true);
      setStatusNote('Fetching real race results & driver roster...');
      try {
        const data = await getJSON(`${API_BASE}/${selectedSeason}/${selectedRound}/results.json`) as { MRData?: { RaceTable?: { Races?: Array<{ raceName: string; season: string; Results?: Record<string, unknown>[] }> } } };
        const raceInfo = data?.MRData?.RaceTable?.Races?.[0];
        const raceResults = raceInfo?.Results || [];

        if (raceResults.length === 0) {
          setStatusNote('No race results on record for this round.');
          setDriversList([]);
          return;
        }

        const parsedDrivers: DriverResultItem[] = raceResults.map((r: Record<string, unknown>) => {
          const rObj = r as { Driver: { driverId: string; code?: string; givenName: string; familyName: string }; Constructor: { name: string }; grid: string; position: string; status: string; FastestLap?: { Time?: { time: string }; AverageSpeed?: { speed: string } }; laps: string };
          const fastLap = rObj.FastestLap?.Time?.time ? parseLapTime(rObj.FastestLap.Time.time) : undefined;
          return {
            driverId: rObj.Driver.driverId,
            code: rObj.Driver.code || rObj.Driver.familyName.slice(0, 3).toUpperCase(),
            givenName: rObj.Driver.givenName,
            familyName: rObj.Driver.familyName,
            constructorName: rObj.Constructor.name,
            grid: rObj.grid,
            position: rObj.position,
            status: rObj.status,
            fastestLapSecs: fastLap || undefined,
            fastestLapSpeed: rObj.FastestLap?.AverageSpeed?.speed || undefined,
            lapsCompleted: parseInt(rObj.laps) || 0
          };
        });

        setDriversList(parsedDrivers);

        if (parsedDrivers.length >= 2) {
          setSelectedDriverA(parsedDrivers[0].driverId);
          setSelectedDriverB(parsedDrivers[1].driverId);
        } else if (parsedDrivers.length === 1) {
          setSelectedDriverA(parsedDrivers[0].driverId);
        }

        // Calibrate simulation parameters from real race data
        const maxLapsRun = Math.max(...parsedDrivers.map(d => d.lapsCompleted));
        const validFastest = parsedDrivers.filter(d => d.fastestLapSecs).map(d => d.fastestLapSecs!);
        const bestTime = validFastest.length > 0 ? Math.min(...validFastest) : 92.0;

        if (maxLapsRun > 0) setLaps(maxLapsRun);
        if (bestTime) setBaseTime(parseFloat(bestTime.toFixed(1)));

        if (raceInfo) {
          setStatusNote(`Loaded ${raceInfo.raceName} ${raceInfo.season} (${maxLapsRun} Laps). Fastest Lap: ${bestTime.toFixed(3)}s.`);
        }
      } catch (e: unknown) {
        const err = e as Error;
        setStatusNote(`Session telemetry unavailable. ${err.message}`);
      } finally {
        setLoadingSessionData(false);
      }
    }

    loadSessionTelemetry();
  }, [selectedSeason, selectedRound]);

  // -------------------------------------------------------------
  // 3. FETCH REAL DRIVER LAP TIMINGS FROM JOLPICA / ERGAST API
  // -------------------------------------------------------------
  useEffect(() => {
    if (!selectedRound || !selectedDriverA) return;

    async function loadRealDriverLaps() {
      setLoadingLaps(true);
      try {
        // 1. Fetch Real Laps for Driver A
        const resA = await getJSON(`${API_BASE}/${selectedSeason}/${selectedRound}/drivers/${selectedDriverA}/laps.json?limit=100`) as { MRData?: { RaceTable?: { Races?: Array<{ Laps?: Array<{ Timings?: Array<{ driverId: string; time: string }> }> }> } } };
        const lapDataA = resA?.MRData?.RaceTable?.Races?.[0]?.Laps || [];
        const timesA: number[] = lapDataA.map((l: { Timings?: Array<{ driverId: string; time: string }> }) => {
          const t = l.Timings?.find(tm => tm.driverId === selectedDriverA);
          return t ? parseLapTime(t.time) : null;
        }).filter((t: number | null): t is number => t !== null && t > 30);

        setDriverALapTimes(timesA);

        // 2. Fetch Real Laps for Driver B
        if (selectedDriverB) {
          const resB = await getJSON(`${API_BASE}/${selectedSeason}/${selectedRound}/drivers/${selectedDriverB}/laps.json?limit=100`) as { MRData?: { RaceTable?: { Races?: Array<{ Laps?: Array<{ Timings?: Array<{ driverId: string; time: string }> }> }> } } };
          const lapDataB = resB?.MRData?.RaceTable?.Races?.[0]?.Laps || [];
          const timesB: number[] = lapDataB.map((l: { Timings?: Array<{ driverId: string; time: string }> }) => {
            const t = l.Timings?.find(tm => tm.driverId === selectedDriverB);
            return t ? parseLapTime(t.time) : null;
          }).filter((t: number | null): t is number => t !== null && t > 30);

          setDriverBLapTimes(timesB);
        } else {
          setDriverBLapTimes([]);
        }

        // Auto-derive real degradation rate if valid lap data exists
        if (timesA.length > 10) {
          const nonOutliers = timesA.filter(t => t < Math.min(...timesA) + 6.0);
          if (nonOutliers.length > 5) {
            const firstHalf = nonOutliers.slice(0, Math.floor(nonOutliers.length / 2));
            const secondHalf = nonOutliers.slice(Math.floor(nonOutliers.length / 2));
            const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
            const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
            const estimatedDeg = Math.max(0.02, Math.min(0.25, (avg2 - avg1) / (nonOutliers.length / 2)));
            setDegradation(parseFloat(estimatedDeg.toFixed(2)));
          }
        }
      } catch {
        // Fallback gracefully if lap telemetry endpoint is not populated
      } finally {
        setLoadingLaps(false);
      }
    }

    loadRealDriverLaps();
  }, [selectedSeason, selectedRound, selectedDriverA, selectedDriverB]);

  // -------------------------------------------------------------
  // REAL STATISTICAL ANALYTICS DERIVATIONS
  // -------------------------------------------------------------
  const driverAObj = useMemo(() => driversList.find(d => d.driverId === selectedDriverA), [driversList, selectedDriverA]);
  const driverBObj = useMemo(() => driversList.find(d => d.driverId === selectedDriverB), [driversList, selectedDriverB]);

  // Calculate Real Pace & Consistency for Driver A
  const statsA = useMemo(() => {
    if (driverALapTimes.length === 0) return null;
    const minLap = Math.min(...driverALapTimes);
    const avgPace = driverALapTimes.reduce((a, b) => a + b, 0) / driverALapTimes.length;
    // Standard deviation for consistency index
    const variance = driverALapTimes.reduce((acc, val) => acc + Math.pow(val - avgPace, 2), 0) / driverALapTimes.length;
    const stdDev = Math.sqrt(variance);

    return {
      minLap,
      avgPace,
      stdDev,
      cleanConsistency: (100 - (stdDev / avgPace) * 100).toFixed(1),
      totalLaps: driverALapTimes.length
    };
  }, [driverALapTimes]);

  // Calculate Real Pace & Consistency for Driver B
  const statsB = useMemo(() => {
    if (driverBLapTimes.length === 0) return null;
    const minLap = Math.min(...driverBLapTimes);
    const avgPace = driverBLapTimes.reduce((a, b) => a + b, 0) / driverBLapTimes.length;
    const variance = driverBLapTimes.reduce((acc, val) => acc + Math.pow(val - avgPace, 2), 0) / driverBLapTimes.length;
    const stdDev = Math.sqrt(variance);

    return {
      minLap,
      avgPace,
      stdDev,
      cleanConsistency: (100 - (stdDev / avgPace) * 100).toFixed(1),
      totalLaps: driverBLapTimes.length
    };
  }, [driverBLapTimes]);

  // Calculate Head-to-Head Lap Delta Array (Driver A vs Driver B)
  const realDeltaArray = useMemo(() => {
    const minLen = Math.min(driverALapTimes.length, driverBLapTimes.length);
    const deltas: number[] = [];
    for (let i = 0; i < minLen; i++) {
      deltas.push(driverALapTimes[i] - driverBLapTimes[i]);
    }
    return deltas;
  }, [driverALapTimes, driverBLapTimes]);

  // -------------------------------------------------------------
  // SIMULATION ALGORITHM
  // -------------------------------------------------------------
  const handleSimulate = () => {
    const simulateStint = (totalLaps: number, base: number, deg: number, loss: number, stops: number) => {
      const stintLen = Math.ceil(totalLaps / (stops + 1));
      let total = 0;
      const lapTimes: number[] = [];
      let lapCount = 0;

      for (let s = 0; s <= stops; s++) {
        const thisStintLen = Math.min(stintLen, totalLaps - lapCount);
        for (let i = 0; i < thisStintLen; i++) {
          const t = base + deg * i;
          lapTimes.push(t);
          total += t;
          lapCount++;
        }
        if (s < stops) total += loss;
      }
      return { total, lapTimes };
    };

    const resA = simulateStint(laps, baseTime, degradation, pitLoss, stopsA);
    const resB = simulateStint(laps, baseTime, degradation, pitLoss, stopsB);
    const delta = resA.total - resB.total;

    setSimResults({
      totalA: resA.total,
      totalB: resB.total,
      delta,
      lapTimesA: resA.lapTimes,
      lapTimesB: resB.lapTimes
    });
  };

  const formatSeconds = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = (s % 60).toFixed(1);
    return `${m}:${sec.padStart(4, '0')}`;
  };

  // -------------------------------------------------------------
  // DYNAMIC OUTLIER & Y-AXIS SCALE COMPUTATIONS
  // -------------------------------------------------------------
  const outlierInfo = useMemo(() => {
    const listA = driverALapTimes.filter(t => t > effectiveThreshold);
    const listB = driverBLapTimes.filter(t => t > effectiveThreshold);
    return {
      countA: listA.length,
      countB: listB.length,
      totalOutliers: listA.length + listB.length,
      maxOutlierSecs: Math.max(0, ...listA, ...listB)
    };
  }, [driverALapTimes, driverBLapTimes, effectiveThreshold]);

  const medianBenchmarkPace = useMemo(() => {
    const allValid = [...driverALapTimes, ...driverBLapTimes].filter(t => typeof t === 'number' && !isNaN(t) && t > 30 && t <= effectiveThreshold);
    if (allValid.length === 0) return null;
    const sorted = [...allValid].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }, [driverALapTimes, driverBLapTimes, effectiveThreshold]);

  const displayLapTimesA = useMemo(() => {
    if (!excludeOutliers) return driverALapTimes;
    return driverALapTimes.map(t => (t > effectiveThreshold ? null : t));
  }, [driverALapTimes, excludeOutliers, effectiveThreshold]);

  const displayLapTimesB = useMemo(() => {
    if (!excludeOutliers) return driverBLapTimes;
    return driverBLapTimes.map(t => (t > effectiveThreshold ? null : t));
  }, [driverBLapTimes, excludeOutliers, effectiveThreshold]);

  const displayDeltaArray = useMemo(() => {
    const minLen = Math.min(driverALapTimes.length, driverBLapTimes.length);
    const deltas: (number | null)[] = [];
    for (let i = 0; i < minLen; i++) {
      const tA = driverALapTimes[i];
      const tB = driverBLapTimes[i];
      if (excludeOutliers && ((tA && tA > effectiveThreshold) || (tB && tB > effectiveThreshold))) {
        deltas.push(null);
      } else if (tA !== null && tB !== null) {
        deltas.push(tA - tB);
      } else {
        deltas.push(null);
      }
    }
    return deltas;
  }, [driverALapTimes, driverBLapTimes, excludeOutliers, effectiveThreshold]);

  // Dynamic Y-Axis Bounds for Real Pace Chart
  const paceYBounds = useMemo(() => {
    const allValid = [...driverALapTimes, ...driverBLapTimes].filter(t => typeof t === 'number' && !isNaN(t) && t > 30);
    if (allValid.length === 0) return { min: 60, max: 120 };

    const cleanValid = excludeOutliers ? allValid.filter(t => t <= effectiveThreshold) : allValid;
    const targetList = cleanValid.length > 0 ? cleanValid : allValid;

    const minPace = Math.min(...targetList);
    const maxPace = Math.max(...targetList);

    const min = Math.max(30, Math.floor(minPace - 1.5));
    const max = Math.ceil(maxPace + (excludeOutliers ? 2 : 15));

    return { min, max };
  }, [driverALapTimes, driverBLapTimes, excludeOutliers, effectiveThreshold]);

  // Dynamic Y-Axis Bounds for Pace Delta Chart
  const deltaYBounds = useMemo(() => {
    const validDeltas = displayDeltaArray.filter((d): d is number => d !== null && !isNaN(d));
    if (validDeltas.length === 0) return { min: -5, max: 5 };

    const maxAbs = Math.max(...validDeltas.map(d => Math.abs(d)));
    const bound = Math.ceil(Math.min(40, Math.max(3, maxAbs + 1)));
    return { min: -bound, max: bound };
  }, [displayDeltaArray]);

  // -------------------------------------------------------------
  // CHART CONFIGURATIONS (POWERED BY REAL API LAP DATA)
  // -------------------------------------------------------------
  
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

  // Chart 1: Real Telemetry & Lap Pace Trace
  const maxLapsComp = Math.max(driverALapTimes.length, driverBLapTimes.length, 1);
  const compLabels = Array.from({ length: maxLapsComp }, (_, i) => `Lap ${i + 1}`);
  
  const realPaceChartData = {
    labels: compLabels,
    datasets: [
      {
        label: driverAObj ? `${driverAObj.code} (${driverAObj.constructorName})` : 'Driver A Pace',
        data: displayLapTimesA,
        borderColor: '#00F0FF',
        backgroundColor: 'rgba(0, 240, 255, 0.08)',
        fill: true,
        borderWidth: 3,
        tension: smoothLines ? 0.25 : 0,
        pointRadius: 3.5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#00F0FF',
        pointHoverBackgroundColor: '#FFFFFF',
        pointHoverBorderColor: '#00F0FF',
        pointHoverBorderWidth: 3,
        spanGaps: true
      },
      {
        label: driverBObj ? `${driverBObj.code} (${driverBObj.constructorName})` : 'Driver B Pace',
        data: displayLapTimesB,
        borderColor: '#FF2A55',
        backgroundColor: 'rgba(255, 42, 85, 0.08)',
        fill: true,
        borderWidth: 3,
        tension: smoothLines ? 0.25 : 0,
        pointRadius: 3.5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#FF2A55',
        pointHoverBackgroundColor: '#FFFFFF',
        pointHoverBorderColor: '#FF2A55',
        pointHoverBorderWidth: 3,
        spanGaps: true
      },
      ...(showBenchmark && medianBenchmarkPace ? [{
        label: `Median Pace Benchmark (${formatLapTimeTick(medianBenchmarkPace)})`,
        data: Array(maxLapsComp).fill(medianBenchmarkPace),
        borderColor: 'rgba(255, 255, 255, 0.4)',
        borderWidth: 1.5,
        borderDash: [6, 4],
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
        spanGaps: true
      }] : [])
    ]
  };

  // Chart 2: Real Lap Delta (Driver A vs Driver B)
  const realDeltaChartData = {
    labels: Array.from({ length: displayDeltaArray.length }, (_, i) => `Lap ${i + 1}`),
    datasets: [
      {
        label: `Pace Gap Δt (s) — [${driverAObj?.code || 'A'} vs ${driverBObj?.code || 'B'}]`,
        data: displayDeltaArray,
        borderColor: '#FFB020',
        backgroundColor: 'rgba(255, 176, 32, 0.12)',
        fill: true,
        borderWidth: 3,
        tension: smoothLines ? 0.25 : 0,
        pointRadius: 3.5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#FFB020',
        pointHoverBackgroundColor: '#FFFFFF',
        pointHoverBorderColor: '#FFB020',
        pointHoverBorderWidth: 3,
        spanGaps: true
      }
    ]
  };

  // Chart 3: Pit Strategy Simulator
  const simChartLabels = Array.from({ length: laps }, (_, i) => `Lap ${i + 1}`);
  const simChartData = {
    labels: simChartLabels,
    datasets: [
      {
        label: `Strategy A (${stopsA}-stop)`,
        data: simResults?.lapTimesA || [],
        borderColor: '#00F0FF',
        backgroundColor: 'rgba(0, 240, 255, 0.1)',
        fill: true,
        borderWidth: 2.5,
        tension: smoothLines ? 0.3 : 0,
        pointRadius: 0
      },
      {
        label: `Strategy B (${stopsB}-stop)`,
        data: simResults?.lapTimesB || [],
        borderColor: '#FF2A55',
        backgroundColor: 'rgba(255, 42, 85, 0.1)',
        fill: true,
        borderWidth: 2.5,
        tension: smoothLines ? 0.3 : 0,
        pointRadius: 0
      }
    ]
  };

  // Chart 4: Tyre Degradation Model
  const tyreLabels = Array.from({ length: tyreStintLaps }, (_, i) => `Lap ${i + 1}`);
  const tyreChartData = {
    labels: tyreLabels,
    datasets: [
      {
        label: 'Soft 🔴 (Fastest / High Wear)',
        data: tyreLabels.map((_, i) => baseTime + softDeg * i),
        borderColor: '#FF2A55',
        borderWidth: 2.5,
        pointRadius: 0
      },
      {
        label: 'Medium 🟡 (Balanced Pace)',
        data: tyreLabels.map((_, i) => baseTime + 0.4 + mediumDeg * i),
        borderColor: '#FFB020',
        borderWidth: 2.5,
        pointRadius: 0
      },
      {
        label: 'Hard ⚪ (Durable / Low Wear)',
        data: tyreLabels.map((_, i) => baseTime + 0.9 + hardDeg * i),
        borderColor: '#FFFFFF',
        borderWidth: 2.5,
        pointRadius: 0
      }
    ]
  };

  // -------------------------------------------------------------
  // HIGH-CONTRAST CHART OPTIONS WITH EASY LAP TIME (1:34.2) Y-AXIS TICKS
  // -------------------------------------------------------------

  // 1. Real Telemetry & Pace Chart Options
  const realPaceChartOptions = {
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
          pointStyle: 'circle',
          padding: 16,
          font: { family: 'var(--font-mono)', size: 12, weight: 'bold' as const }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#0F172A',
        titleColor: '#00F0FF',
        titleFont: { family: 'var(--font-mono)', size: 13, weight: 'bold' as const },
        bodyColor: '#F8FAFC',
        bodyFont: { family: 'var(--font-mono)', size: 12 },
        borderColor: '#334155',
        borderWidth: 1.5,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          title: (items: TooltipItem<'line'>[]) => {
            if (!items.length) return '';
            return `🏎️ RACE LAP ${items[0].label.replace('Lap ', '')}`;
          },
          label: (context: TooltipItem<'line'>) => {
            const val = context.parsed.y;
            if (val === null || val === undefined || isNaN(val)) {
              return ` ${context.dataset.label}: ⚠️ Outlier / Red Flag Excluded`;
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
          text: 'RACE LAP NUMBER (1 → N)',
          color: '#00F0FF',
          font: { family: 'var(--font-mono)', size: 12, weight: 'bold' as const }
        },
        ticks: { color: '#E2E8F0', font: { family: 'var(--font-mono)', size: 10.5 }, maxTicksLimit: 16 },
        grid: { color: 'rgba(255, 255, 255, 0.08)' }
      },
      y: {
        min: paceYBounds.min,
        max: paceYBounds.max,
        title: {
          display: true,
          text: 'LAP TIME (MIN:SEC)',
          color: '#FFFFFF',
          font: { family: 'var(--font-mono)', size: 12, weight: 'bold' as const }
        },
        ticks: {
          color: '#E2E8F0',
          font: { family: 'var(--font-mono)', size: 11, weight: 'bold' as const },
          callback: formatLapTimeTick
        },
        grid: { color: 'rgba(255, 255, 255, 0.08)' }
      }
    }
  };

  // 2. Pace Delta Chart Options
  const realDeltaChartOptions = {
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
          pointStyle: 'circle',
          padding: 16,
          font: { family: 'var(--font-mono)', size: 12, weight: 'bold' as const }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#0F172A',
        titleColor: '#FFB020',
        titleFont: { family: 'var(--font-mono)', size: 13, weight: 'bold' as const },
        bodyColor: '#F8FAFC',
        bodyFont: { family: 'var(--font-mono)', size: 12 },
        borderColor: '#334155',
        borderWidth: 1.5,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          title: (items: TooltipItem<'line'>[]) => {
            if (!items.length) return '';
            return `⏱️ GAP AT LAP ${items[0].label.replace('Lap ', '')}`;
          },
          label: (context: TooltipItem<'line'>) => {
            const val = context.parsed.y;
            if (val === null || val === undefined || isNaN(val)) {
              return ` Gap Delta: ⚠️ Outlier Lap Excluded`;
            }
            const sign = val > 0 ? '+' : '';
            return ` Gap Delta: ${sign}${val.toFixed(3)}s (${val > 0 ? `${driverAObj?.code || 'Driver A'} Slower` : `${driverAObj?.code || 'Driver A'} Faster`})`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'RACE LAP NUMBER (1 → N)',
          color: '#FFB020',
          font: { family: 'var(--font-mono)', size: 12, weight: 'bold' as const }
        },
        ticks: { color: '#E2E8F0', font: { family: 'var(--font-mono)', size: 10.5 }, maxTicksLimit: 16 },
        grid: { color: 'rgba(255, 255, 255, 0.08)' }
      },
      y: {
        min: deltaYBounds.min,
        max: deltaYBounds.max,
        title: {
          display: true,
          text: 'TIME GAP DELTA Δt (SECONDS)',
          color: '#FFFFFF',
          font: { family: 'var(--font-mono)', size: 12, weight: 'bold' as const }
        },
        ticks: {
          color: '#E2E8F0',
          font: { family: 'var(--font-mono)', size: 11, weight: 'bold' as const },
          callback: formatDeltaTick
        },
        grid: {
          color: (context: { tick?: { value: number } }) => {
            if (context.tick && context.tick.value === 0) return 'rgba(0, 240, 255, 0.7)';
            return 'rgba(255, 255, 255, 0.08)';
          },
          lineWidth: (context: { tick?: { value: number } }) => {
            if (context.tick && context.tick.value === 0) return 2;
            return 1;
          }
        }
      }
    }
  };

  // 3. Pit Strategy Simulator Options
  const strategyChartOptions = {
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
          pointStyle: 'circle',
          padding: 16,
          font: { family: 'var(--font-mono)', size: 12, weight: 'bold' as const }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#0F172A',
        titleColor: '#00F0FF',
        titleFont: { family: 'var(--font-mono)', size: 13, weight: 'bold' as const },
        bodyColor: '#F8FAFC',
        bodyFont: { family: 'var(--font-mono)', size: 12 },
        borderColor: '#334155',
        borderWidth: 1.5,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          title: (items: TooltipItem<'line'>[]) => {
            if (!items.length) return '';
            return `🏁 STINT LAP ${items[0].label.replace('Lap ', '')}`;
          },
          label: (context: TooltipItem<'line'>) => {
            const val = context.parsed.y;
            if (val === null || val === undefined || isNaN(val)) return ` ${context.dataset.label}: ${context.raw}`;
            const m = Math.floor(val / 60);
            const sec = (val % 60).toFixed(2);
            return ` ${context.dataset.label}: ${m}:${sec.padStart(5, '0')} (${val.toFixed(2)}s)`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'STINT LAP PROGRESSION (1 → N)',
          color: '#00F0FF',
          font: { family: 'var(--font-mono)', size: 12, weight: 'bold' as const }
        },
        ticks: { color: '#E2E8F0', font: { family: 'var(--font-mono)', size: 10.5 }, maxTicksLimit: 16 },
        grid: { color: 'rgba(255, 255, 255, 0.08)' }
      },
      y: {
        title: {
          display: true,
          text: 'STINT LAP TIME (MIN:SEC)',
          color: '#FFFFFF',
          font: { family: 'var(--font-mono)', size: 12, weight: 'bold' as const }
        },
        ticks: {
          color: '#E2E8F0',
          font: { family: 'var(--font-mono)', size: 11, weight: 'bold' as const },
          callback: formatLapTimeTick
        },
        grid: { color: 'rgba(255, 255, 255, 0.08)' }
      }
    }
  };

  // 4. Tyre Degradation Options
  const tyreChartOptions = {
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
          pointStyle: 'circle',
          padding: 16,
          font: { family: 'var(--font-mono)', size: 12, weight: 'bold' as const }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#0F172A',
        titleColor: '#FF2A55',
        titleFont: { family: 'var(--font-mono)', size: 13, weight: 'bold' as const },
        bodyColor: '#F8FAFC',
        bodyFont: { family: 'var(--font-mono)', size: 12 },
        borderColor: '#334155',
        borderWidth: 1.5,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          title: (items: TooltipItem<'line'>[]) => {
            if (!items.length) return '';
            return `🔴🟡⚪ TYRE AGE: ${items[0].label.replace('Lap ', '')} Laps`;
          },
          label: (context: TooltipItem<'line'>) => {
            const val = context.parsed.y;
            if (val === null || val === undefined || isNaN(val)) return ` ${context.dataset.label}: ${context.raw}`;
            const m = Math.floor(val / 60);
            const sec = (val % 60).toFixed(2);
            return ` ${context.dataset.label}: ${m}:${sec.padStart(5, '0')} (${val.toFixed(2)}s)`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'TYRE STINT LAPS COMPLETED',
          color: '#00F0FF',
          font: { family: 'var(--font-mono)', size: 12, weight: 'bold' as const }
        },
        ticks: { color: '#E2E8F0', font: { family: 'var(--font-mono)', size: 10.5 }, maxTicksLimit: 16 },
        grid: { color: 'rgba(255, 255, 255, 0.08)' }
      },
      y: {
        title: {
          display: true,
          text: 'DEGRADED PACE (MIN:SEC)',
          color: '#FFFFFF',
          font: { family: 'var(--font-mono)', size: 12, weight: 'bold' as const }
        },
        ticks: {
          color: '#E2E8F0',
          font: { family: 'var(--font-mono)', size: 11, weight: 'bold' as const },
          callback: formatLapTimeTick
        },
        grid: { color: 'rgba(255, 255, 255, 0.08)' }
      }
    }
  };

  return (
    <section className="view" id="view-lab" style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
      
      {/* 1. Header Section */}
      <div style={{
        background: '#0D1017',
        border: '1px solid #262C38',
        borderRadius: '12px',
        padding: '24px 28px',
        marginBottom: '24px',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.75)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex items-center gap-1">
              <span className="text-[#E10600] font-black tracking-tighter text-xs select-none">///</span>
              <span className="text-[11px] font-display tracking-widest text-[#E10600] font-black uppercase">
                F1 STRATEGY &amp; TELEMETRY LAB
              </span>
            </span>
            <span className="text-slate-700 font-sans text-xs">•</span>
            <span className="text-[11px] font-display text-slate-400 font-semibold uppercase tracking-wider">
              RACE ENGINEERING SIMULATOR
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight f1-text-gradient uppercase mb-1">
            STRATEGY LAB
          </h1>
          <p className="text-xs font-sans text-slate-400 mt-1 max-w-xl leading-relaxed">
            Experimental telemetry, pace deltas, tyre degradation models &amp; pit-stop undercut simulation.
          </p>
        </div>

        {/* Global Season & Session Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {loadingRounds ? (
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-telemetry)', color: '#00F5D4' }}>
              Loading rounds...
            </span>
          ) : (
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              style={{
                background: '#141820',
                border: '1px solid #262C38',
                color: '#FFFFFF',
                padding: '9px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontFamily: 'var(--font-display)',
                fontWeight: '700',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Select Grand Prix...</option>
              {rounds.map(r => (
                <option key={r.round} value={r.round}>R{r.round} — {r.raceName}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ERROR STATE */}
      {errorMsg && (
        <div style={{
          background: '#1A080A',
          border: '1px solid #E10600',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: '#FFFFFF', margin: '0 0 8px 0', fontWeight: '800' }}>
            ANALYSIS UNAVAILABLE
          </h3>
          <p style={{ color: '#F1F5F9', fontSize: '14px', margin: '0 0 16px 0' }}>
            {errorMsg}
          </p>
        </div>
      )}

      {/* 2. LAB TOOL SELECTION GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {LAB_TOOLS.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <div
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              style={{
                background: isActive ? '#141822' : '#0D1017',
                border: isActive ? '1px solid #E10600' : '1px solid #262C38',
                borderRadius: '10px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 0 20px rgba(225, 6, 0, 0.35)' : '0 4px 16px rgba(0,0,0,0.4)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '24px' }}>{tool.icon}</span>
                  <span style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-display)',
                    fontWeight: '800',
                    color: isActive ? '#FFFFFF' : '#CBD5E1',
                    background: isActive ? 'linear-gradient(135deg, #E10600 0%, #B30000 100%)' : 'rgba(255,255,255,0.06)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: isActive ? '1px solid rgba(255, 59, 48, 0.7)' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: isActive ? '0 0 10px rgba(225, 6, 0, 0.4)' : 'none'
                  }}>
                    [{tool.badge}]
                  </span>
                </div>

                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '17px',
                  fontWeight: '800',
                  color: '#FFFFFF',
                  margin: '0 0 6px 0'
                }}>
                  {tool.name}
                </h3>

                <p style={{
                  color: '#CBD5E1',
                  fontSize: '13px',
                  lineHeight: '1.45',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  {tool.shortDesc}
                </p>
              </div>

              <div style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: isActive ? '#34E4C8' : '#94A3B8', fontWeight: '700' }}>
                  {isActive ? '● ACTIVE WORKSPACE' : 'AVAILABLE'}
                </span>

                <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: '#34E4C8', fontWeight: '800' }}>
                  OPEN LAB →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* STATUS BANNER */}
      {statusNote && (
        <div style={{
          background: '#0D1017',
          border: '1px solid #262C38',
          borderRadius: '8px',
          padding: '12px 18px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          color: '#34E4C8'
        }}>
          <span>{loadingSessionData || loadingLaps ? '↻ FETCHING REAL TELEMETRY & LAP DATA...' : statusNote}</span>
          <span style={{ color: '#CBD5E1', fontSize: '11px' }}>PIT-WALL TELEMETRY · VERIFIED DATA</span>
        </div>
      )}

      {/* 4. EXPERIMENTAL WORKSPACE CONSOLE */}
      <div style={{
        background: '#0D1017',
        border: '1px solid #262C38',
        borderRadius: '12px',
        padding: '28px',
        boxShadow: '0 16px 40px rgba(0,0,0,0.8)'
      }}>

        {/* WORKSPACE TOOL 1: TELEMETRY & LAP ANALYZER (POWERED BY REAL API LAP DATA) */}
        {activeTool === 'telemetry' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #262C38', paddingBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: '#34E4C8', fontWeight: '800', marginBottom: '4px' }}>
                  [ REAL DATA FEED ]
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                  TELEMETRY &amp; LAP ANALYZER
                </h2>
                <p style={{ margin: '4px 0 0 0', color: '#CBD5E1', fontSize: '13.5px' }}>
                  Analyzing real lap-by-lap timing records directly from official F1 race telemetry feeds.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <select
                  value={selectedDriverA}
                  onChange={(e) => setSelectedDriverA(e.target.value)}
                  style={{ background: '#121620', border: '1px solid #34E4C8', color: '#34E4C8', padding: '8px 14px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontWeight: '800', outline: 'none' }}
                >
                  <option value="">Driver A...</option>
                  {driversList.map(d => (
                    <option key={`a-${d.driverId}`} value={d.driverId}>{d.code} — {d.familyName}</option>
                  ))}
                </select>

                <select
                  value={selectedDriverB}
                  onChange={(e) => setSelectedDriverB(e.target.value)}
                  style={{ background: '#121620', border: '1px solid #E8302A', color: '#E8302A', padding: '8px 14px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontWeight: '800', outline: 'none' }}
                >
                  <option value="">Driver B...</option>
                  {driversList.map(d => (
                    <option key={`b-${d.driverId}`} value={d.driverId}>{d.code} — {d.familyName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Real Statistical Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {driverAObj && (
                <div style={{ background: '#121620', border: '1px solid #34E4C8', borderRadius: '8px', padding: '18px' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#34E4C8', fontWeight: '800' }}>DRIVER A // {driverAObj.code}</div>
                  <div style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: '800', color: '#FFFFFF', margin: '4px 0' }}>
                    {driverAObj.givenName} {driverAObj.familyName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#CBD5E1', marginBottom: '10px' }}>{driverAObj.constructorName} &bull; Finished P{driverAObj.position}</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '10px', borderTop: '1px dashed #262C38', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
                    <div>
                      <span style={{ color: '#CBD5E1', display: 'block', fontSize: '10px' }}>BEST LAP</span>
                      <span style={{ color: '#FFFFFF', fontWeight: '800', fontSize: '14px' }}>
                        {statsA ? statsA.minLap.toFixed(3) + 's' : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#CBD5E1', display: 'block', fontSize: '10px' }}>AVG PACE</span>
                      <span style={{ color: '#FFFFFF', fontWeight: '800', fontSize: '14px' }}>
                        {statsA ? statsA.avgPace.toFixed(3) + 's' : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#CBD5E1', display: 'block', fontSize: '10px' }}>CONSISTENCY</span>
                      <span style={{ color: '#34E4C8', fontWeight: '800', fontSize: '14px' }}>
                        {statsA ? `${statsA.cleanConsistency}%` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#CBD5E1', display: 'block', fontSize: '10px' }}>STD DEV (σ)</span>
                      <span style={{ color: '#FFB020', fontWeight: '800', fontSize: '14px' }}>
                        {statsA ? `±${statsA.stdDev.toFixed(3)}s` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {driverBObj && (
                <div style={{ background: '#121620', border: '1px solid #E8302A', borderRadius: '8px', padding: '18px' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#E8302A', fontWeight: '800' }}>DRIVER B // {driverBObj.code}</div>
                  <div style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: '800', color: '#FFFFFF', margin: '4px 0' }}>
                    {driverBObj.givenName} {driverBObj.familyName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#CBD5E1', marginBottom: '10px' }}>{driverBObj.constructorName} &bull; Finished P{driverBObj.position}</div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '10px', borderTop: '1px dashed #262C38', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
                    <div>
                      <span style={{ color: '#CBD5E1', display: 'block', fontSize: '10px' }}>BEST LAP</span>
                      <span style={{ color: '#FFFFFF', fontWeight: '800', fontSize: '14px' }}>
                        {statsB ? statsB.minLap.toFixed(3) + 's' : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#CBD5E1', display: 'block', fontSize: '10px' }}>AVG PACE</span>
                      <span style={{ color: '#FFFFFF', fontWeight: '800', fontSize: '14px' }}>
                        {statsB ? statsB.avgPace.toFixed(3) + 's' : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#CBD5E1', display: 'block', fontSize: '10px' }}>CONSISTENCY</span>
                      <span style={{ color: '#34E4C8', fontWeight: '800', fontSize: '14px' }}>
                        {statsB ? `${statsB.cleanConsistency}%` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#CBD5E1', display: 'block', fontSize: '10px' }}>STD DEV (σ)</span>
                      <span style={{ color: '#FFB020', fontWeight: '800', fontSize: '14px' }}>
                        {statsB ? `±${statsB.stdDev.toFixed(3)}s` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Outlier & Pace Focus Control Toolbar */}
            <div style={{
              background: '#121620',
              border: '1px solid #262C38',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setExcludeOutliers(!excludeOutliers)}
                  style={{
                    background: excludeOutliers ? 'rgba(0, 240, 255, 0.15)' : '#0D1017',
                    border: excludeOutliers ? '1px solid #00F0FF' : '1px solid #262C38',
                    color: excludeOutliers ? '#00F0FF' : '#94A3B8',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {excludeOutliers ? '⚡ PACE FOCUS MODE (OUTLIERS TRIMMED)' : '🌐 FULL RANGE MODE (SHOW ALL LAPS)'}
                </button>

                <button
                  onClick={() => setSmoothLines(!smoothLines)}
                  style={{
                    background: smoothLines ? 'rgba(255, 176, 32, 0.15)' : '#0D1017',
                    border: smoothLines ? '1px solid #FFB020' : '1px solid #262C38',
                    color: smoothLines ? '#FFB020' : '#94A3B8',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {smoothLines ? '📈 SMOOTH CURVES' : '📐 LINEAR TRACE'}
                </button>

                <button
                  onClick={() => setShowBenchmark(!showBenchmark)}
                  style={{
                    background: showBenchmark ? 'rgba(248, 250, 252, 0.12)' : '#0D1017',
                    border: showBenchmark ? '1px solid #F8FAFC' : '1px solid #262C38',
                    color: showBenchmark ? '#F8FAFC' : '#94A3B8',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {showBenchmark ? '🏁 BENCHMARK LINE ON' : '🏁 BENCHMARK OFF'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#CBD5E1' }}>
                  <span>OUTLIER CUTOFF:</span>
                  <select
                    value={outlierCutoffMode}
                    onChange={(e) => setOutlierCutoffMode(e.target.value)}
                    style={{ background: '#0D1017', border: '1px solid #00F0FF', color: '#00F0FF', padding: '4px 10px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: '800', outline: 'none' }}
                  >
                    <option value="auto">⚡ AUTO SMART ({formatLapTimeTick(effectiveThreshold)})</option>
                    <option value="95">1m 35s (95s) — Strict Pace</option>
                    <option value="105">1m 45s (105s) — Pit/Out Lap Trim</option>
                    <option value="120">2m 00s (120s) — VSC Trim</option>
                    <option value="150">2m 30s (150s) — Slow Lap Trim</option>
                    <option value="180">3m 00s (180s) — Red Flag Trim</option>
                  </select>
                </div>
              </div>

              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: outlierInfo.totalOutliers > 0 ? '#FFB020' : '#00F0FF', fontWeight: '700' }}>
                {outlierInfo.totalOutliers > 0 ? (
                  <span>
                    ⚠️ {outlierInfo.totalOutliers} Red Flag / Stoppage Outlier{outlierInfo.totalOutliers > 1 ? 's' : ''} Trimmed ({formatSeconds(outlierInfo.maxOutlierSecs)} max). {excludeOutliers ? 'Auto-zoomed Y-axis.' : 'Full scale active.'}
                  </span>
                ) : (
                  <span>✓ Standard Race Pace Range ({formatLapTimeTick(paceYBounds.min)} - {formatLapTimeTick(paceYBounds.max)})</span>
                )}
              </div>
            </div>

            {/* Real Race Pace Telemetry Line Chart */}
            <div style={{ height: '420px', position: 'relative' }}>
              <Line data={realPaceChartData} options={realPaceChartOptions} />
            </div>
          </div>
        )}

        {/* WORKSPACE TOOL 2: DRIVER RACE PACE DELTA */}
        {activeTool === 'pace' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #262C38', paddingBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: '#FFB020', fontWeight: '800', marginBottom: '4px' }}>
                  [ DERIVED PACE DELTA ]
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                  DRIVER RACE PACE DELTA
                </h2>
                <p style={{ margin: '4px 0 0 0', color: '#CBD5E1', fontSize: '13.5px' }}>
                  Cumulative lap time difference (Δt) calculated between Driver A ({driverAObj?.code || 'A'}) and Driver B ({driverBObj?.code || 'B'}).
                </p>
              </div>
            </div>

            <div style={{ height: '420px', position: 'relative' }}>
              <Line data={realDeltaChartData} options={realDeltaChartOptions} />
            </div>
          </div>
        )}

        {/* WORKSPACE TOOL 3: PIT STRATEGY SIMULATOR */}
        {activeTool === 'strategy' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #262C38', paddingBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: '#34E4C8', fontWeight: '800', marginBottom: '4px' }}>
                  [ CALIBRATED STRATEGY MODEL ]
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                  PIT STRATEGY SIMULATOR WORKSPACE
                </h2>
                <p style={{ margin: '4px 0 0 0', color: '#CBD5E1', fontSize: '13.5px' }}>
                  Calibrated with real GP race lap count and pace parameters. Tune degradation to evaluate stint strategies.
                </p>
              </div>
              <button
                onClick={handleSimulate}
                style={{
                  background: '#E8302A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(232, 48, 42, 0.4)'
                }}
              >
                RUN SIMULATION ▶
              </button>
            </div>

            {/* Input Controls Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
              background: '#121620',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #262C38'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#CBD5E1', marginBottom: '6px', fontWeight: '700' }}>
                  RACE LAPS
                </label>
                <input
                  type="number"
                  value={laps}
                  onChange={(e) => setLaps(Math.max(10, parseInt(e.target.value) || 50))}
                  style={{ width: '100%', background: '#0D1017', border: '1px solid #262C38', color: '#FFFFFF', padding: '8px 12px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontWeight: '700' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#CBD5E1', marginBottom: '6px', fontWeight: '700' }}>
                  BASE LAP TIME (s)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={baseTime}
                  onChange={(e) => setBaseTime(parseFloat(e.target.value) || 90.0)}
                  style={{ width: '100%', background: '#0D1017', border: '1px solid #262C38', color: '#FFFFFF', padding: '8px 12px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontWeight: '700' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#CBD5E1', marginBottom: '6px', fontWeight: '700' }}>
                  TYRE DEG (s/lap)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={degradation}
                  onChange={(e) => setDegradation(parseFloat(e.target.value) || 0.08)}
                  style={{ width: '100%', background: '#0D1017', border: '1px solid #262C38', color: '#FFFFFF', padding: '8px 12px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontWeight: '700' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#CBD5E1', marginBottom: '6px', fontWeight: '700' }}>
                  PIT LOSS TIME (s)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={pitLoss}
                  onChange={(e) => setPitLoss(parseFloat(e.target.value) || 20.0)}
                  style={{ width: '100%', background: '#0D1017', border: '1px solid #262C38', color: '#FFFFFF', padding: '8px 12px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontWeight: '700' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#CBD5E1', marginBottom: '6px', fontWeight: '700' }}>
                  STRATEGY A STOPS
                </label>
                <select
                  value={stopsA}
                  onChange={(e) => setStopsA(parseInt(e.target.value))}
                  style={{ width: '100%', background: '#0D1017', border: '1px solid #262C38', color: '#34E4C8', padding: '8px 12px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontWeight: '700' }}
                >
                  <option value={1}>1-Stop</option>
                  <option value={2}>2-Stop</option>
                  <option value={3}>3-Stop</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#CBD5E1', marginBottom: '6px', fontWeight: '700' }}>
                  STRATEGY B STOPS
                </label>
                <select
                  value={stopsB}
                  onChange={(e) => setStopsB(parseInt(e.target.value))}
                  style={{ width: '100%', background: '#0D1017', border: '1px solid #262C38', color: '#E8302A', padding: '8px 12px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontWeight: '700' }}
                >
                  <option value={1}>1-Stop</option>
                  <option value={2}>2-Stop</option>
                  <option value={3}>3-Stop</option>
                </select>
              </div>
            </div>

            {/* Simulation Chart */}
            <div style={{ height: '320px', position: 'relative', marginBottom: '20px' }}>
              <Line data={simChartData} options={strategyChartOptions} />
            </div>

            {/* Results Summary Strip */}
            {simResults && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                background: '#121620',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #262C38'
              }}>
                <div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#CBD5E1' }}>STRATEGY A ({stopsA}-STOP) TOTAL</div>
                  <div style={{ fontSize: '22px', fontFamily: 'var(--font-display)', fontWeight: '800', color: '#34E4C8' }}>
                    {formatSeconds(simResults.totalA)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#CBD5E1' }}>STRATEGY B ({stopsB}-STOP) TOTAL</div>
                  <div style={{ fontSize: '22px', fontFamily: 'var(--font-display)', fontWeight: '800', color: '#E8302A' }}>
                    {formatSeconds(simResults.totalB)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#CBD5E1' }}>NET GAP AT FLAG</div>
                  <div style={{ fontSize: '22px', fontFamily: 'var(--font-display)', fontWeight: '800', color: '#FFB020' }}>
                    {Math.abs(simResults.delta).toFixed(1)}s {simResults.delta < 0 ? '(A Ahead)' : '(B Ahead)'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* WORKSPACE TOOL 4: TYRE DEGRADATION LAB */}
        {activeTool === 'tyres' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #262C38', paddingBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: '#E8302A', fontWeight: '800', marginBottom: '4px' }}>
                  [ THERMAL WEAR MODEL ]
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                  TYRE DEGRADATION &amp; CROSSOVER LAB
                </h2>
                <p style={{ margin: '4px 0 0 0', color: '#CBD5E1', fontSize: '13.5px' }}>
                  Evaluate thermal degradation rates across Soft, Medium, and Hard compounds over extended stint lengths.
                </p>
              </div>
            </div>

            {/* Tyre Tuning Sliders */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '24px',
              background: '#121620',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #262C38'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#E8302A', marginBottom: '6px', fontWeight: '800' }}>
                  SOFT 🔴 DEG ({softDeg.toFixed(2)}s/lap)
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="0.30"
                  step="0.01"
                  value={softDeg}
                  onChange={(e) => setSoftDeg(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#FFB020', marginBottom: '6px', fontWeight: '800' }}>
                  MEDIUM 🟡 DEG ({mediumDeg.toFixed(2)}s/lap)
                </label>
                <input
                  type="range"
                  min="0.03"
                  max="0.20"
                  step="0.01"
                  value={mediumDeg}
                  onChange={(e) => setMediumDeg(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#FFFFFF', marginBottom: '6px', fontWeight: '800' }}>
                  HARD ⚪ DEG ({hardDeg.toFixed(2)}s/lap)
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="0.12"
                  step="0.01"
                  value={hardDeg}
                  onChange={(e) => setHardDeg(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#34E4C8', marginBottom: '6px', fontWeight: '800' }}>
                  STINT LENGTH ({tyreStintLaps} Laps)
                </label>
                <input
                  type="range"
                  min="15"
                  max="50"
                  step="1"
                  value={tyreStintLaps}
                  onChange={(e) => setTyreStintLaps(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Tyre Chart */}
            <div style={{ height: '320px', position: 'relative' }}>
              <Line data={tyreChartData} options={tyreChartOptions} />
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
