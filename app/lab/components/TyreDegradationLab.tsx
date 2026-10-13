'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { getJSON, API_BASE, getTeamColor, parseLapTime } from '../../utils/api';
import { DriverResultItem } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TyreDegradationLabProps {
  selectedSeason: string;
  selectedRound: string;
  roundName?: string;
  circuitId?: string;
  driversList: DriverResultItem[];
}

interface PitStopEntry {
  driverId: string;
  lap: number;
  stop: number;
  duration?: string;
}

interface StintLapData {
  lapNumber: number;
  timeSec: number;
  isOutlier: boolean;
  deltaToMedian: number;
}

export interface DriverStintAnalysis {
  driverId: string;
  code: string;
  name: string;
  position?: string;
  constructorId: string;
  constructorName: string;
  stintNumber: number;
  startLap: number;
  endLap: number;
  totalLaps: number;
  cleanLaps: number;
  compoundInferred: 'SOFT' | 'MEDIUM' | 'HARD';
  basePaceSec: number;
  rawDegSecPerLap: number;
  fuelCorrectedDegSecPerLap: number;
  consistencyStdSec: number;
  whispererScore: number;
  whispererTier: 'ELITE' | 'BALANCED' | 'COOKER';
  cliffLapDetected: number | null;
  cliffSeveritySec: number | null;
  laps: StintLapData[];
}

export type PirelliCompoundId = 'C1' | 'C2' | 'C3' | 'C4' | 'C5';

export interface PirelliCompoundDetail {
  id: PirelliCompoundId;
  name: string;
  badgeColor: string;
  borderColor: string;
  hardnessGrade: 'HARDEST' | 'HARD-MEDIUM' | 'NEUTRAL' | 'SOFT-MEDIUM' | 'SOFTEST';
  paceDeltaSec: number; // Delta to C3 (0.0s)
  linearDegRate: number; // Seconds per lap during plateau
  nominalCliffLap: number; // Lap where thermal cliff begins
  cliffSeverityMultiplier: number;
  workingTempMinC: number;
  workingTempMaxC: number;
  optimalStintLaps: [number, number];
  blisteringSensitivity: 'LOW' | 'MEDIUM' | 'HIGH';
  grainingSensitivity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

export const PIRELLI_COMPOUNDS_MASTER: Record<PirelliCompoundId, PirelliCompoundDetail> = {
  C1: {
    id: 'C1',
    name: 'Pirelli C1 (Hardest)',
    badgeColor: '#E2E8F0',
    borderColor: '#94A3B8',
    hardnessGrade: 'HARDEST',
    paceDeltaSec: +1.10,
    linearDegRate: 0.038,
    nominalCliffLap: 48,
    cliffSeverityMultiplier: 0.12,
    workingTempMinC: 115,
    workingTempMaxC: 130,
    optimalStintLaps: [35, 52],
    blisteringSensitivity: 'LOW',
    grainingSensitivity: 'HIGH',
    description: 'Designed for the highest energy load circuits (e.g. Silverstone, Suzuka). Maximum thermal resistance, slower warm-up.'
  },
  C2: {
    id: 'C2',
    name: 'Pirelli C2 (Hard-Medium)',
    badgeColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    hardnessGrade: 'HARD-MEDIUM',
    paceDeltaSec: +0.55,
    linearDegRate: 0.052,
    nominalCliffLap: 40,
    cliffSeverityMultiplier: 0.15,
    workingTempMinC: 110,
    workingTempMaxC: 125,
    optimalStintLaps: [28, 44],
    blisteringSensitivity: 'LOW',
    grainingSensitivity: 'MEDIUM',
    description: 'Versatile hard/medium tire for fast, abrasive asphalt. Provides extended plateau stability on high-downforce circuits.'
  },
  C3: {
    id: 'C3',
    name: 'Pirelli C3 (Neutral Baseline)',
    badgeColor: '#FBBF24',
    borderColor: '#F59E0B',
    hardnessGrade: 'NEUTRAL',
    paceDeltaSec: 0.00,
    linearDegRate: 0.075,
    nominalCliffLap: 32,
    cliffSeverityMultiplier: 0.18,
    workingTempMinC: 105,
    workingTempMaxC: 120,
    optimalStintLaps: [20, 36],
    blisteringSensitivity: 'MEDIUM',
    grainingSensitivity: 'LOW',
    description: 'The universal F1 baseline compound. Used at every race on the calendar as either Soft, Medium, or Hard.'
  },
  C4: {
    id: 'C4',
    name: 'Pirelli C4 (Soft-Medium)',
    badgeColor: '#FB7185',
    borderColor: '#F43F5E',
    hardnessGrade: 'SOFT-MEDIUM',
    paceDeltaSec: -0.65,
    linearDegRate: 0.115,
    nominalCliffLap: 22,
    cliffSeverityMultiplier: 0.24,
    workingTempMinC: 90,
    workingTempMaxC: 110,
    optimalStintLaps: [14, 26],
    blisteringSensitivity: 'HIGH',
    grainingSensitivity: 'LOW',
    description: 'High-grip compound for street circuits and smooth surfaces. Fast warm-up with steep thermal degradation.'
  },
  C5: {
    id: 'C5',
    name: 'Pirelli C5 (Softest)',
    badgeColor: '#EF4444',
    borderColor: '#DC2626',
    hardnessGrade: 'SOFTEST',
    paceDeltaSec: -1.25,
    linearDegRate: 0.180,
    nominalCliffLap: 15,
    cliffSeverityMultiplier: 0.32,
    workingTempMinC: 85,
    workingTempMaxC: 100,
    optimalStintLaps: [10, 18],
    blisteringSensitivity: 'HIGH',
    grainingSensitivity: 'LOW',
    description: 'Pirelli’s softest slick compound. Extreme mechanical grip for Monaco and Singapore; sudden thermal cliff.'
  }
};

export interface CircuitPirelliNomination {
  circuitId: string;
  hard: PirelliCompoundId;
  medium: PirelliCompoundId;
  soft: PirelliCompoundId;
  asphaltSeverity: 'HIGH ABRASION' | 'MEDIUM ABRASION' | 'LOW ABRASION STREET';
}

export const CIRCUIT_PIRELLI_ALLOCATIONS: Record<string, CircuitPirelliNomination> = {
  silverstone: { circuitId: 'silverstone', hard: 'C1', medium: 'C2', soft: 'C3', asphaltSeverity: 'HIGH ABRASION' },
  suzuka: { circuitId: 'suzuka', hard: 'C1', medium: 'C2', soft: 'C3', asphaltSeverity: 'HIGH ABRASION' },
  catalunya: { circuitId: 'catalunya', hard: 'C1', medium: 'C2', soft: 'C3', asphaltSeverity: 'HIGH ABRASION' },
  bahrain: { circuitId: 'bahrain', hard: 'C1', medium: 'C2', soft: 'C3', asphaltSeverity: 'HIGH ABRASION' },
  spa: { circuitId: 'spa', hard: 'C1', medium: 'C2', soft: 'C3', asphaltSeverity: 'HIGH ABRASION' },
  zandvoort: { circuitId: 'zandvoort', hard: 'C1', medium: 'C2', soft: 'C3', asphaltSeverity: 'HIGH ABRASION' },
  losail: { circuitId: 'losail', hard: 'C1', medium: 'C2', soft: 'C3', asphaltSeverity: 'HIGH ABRASION' },

  monaco: { circuitId: 'monaco', hard: 'C3', medium: 'C4', soft: 'C5', asphaltSeverity: 'LOW ABRASION STREET' },
  marina_bay: { circuitId: 'marina_bay', hard: 'C3', medium: 'C4', soft: 'C5', asphaltSeverity: 'LOW ABRASION STREET' },
  villeneuve: { circuitId: 'villeneuve', hard: 'C3', medium: 'C4', soft: 'C5', asphaltSeverity: 'LOW ABRASION STREET' },
  baku: { circuitId: 'baku', hard: 'C3', medium: 'C4', soft: 'C5', asphaltSeverity: 'LOW ABRASION STREET' },
  vegas: { circuitId: 'vegas', hard: 'C3', medium: 'C4', soft: 'C5', asphaltSeverity: 'LOW ABRASION STREET' },

  americas: { circuitId: 'americas', hard: 'C2', medium: 'C3', soft: 'C4', asphaltSeverity: 'MEDIUM ABRASION' },
  monza: { circuitId: 'monza', hard: 'C2', medium: 'C3', soft: 'C4', asphaltSeverity: 'MEDIUM ABRASION' },
  red_bull_ring: { circuitId: 'red_bull_ring', hard: 'C2', medium: 'C3', soft: 'C4', asphaltSeverity: 'MEDIUM ABRASION' },
  interlagos: { circuitId: 'interlagos', hard: 'C2', medium: 'C3', soft: 'C4', asphaltSeverity: 'MEDIUM ABRASION' },
  hungaroring: { circuitId: 'hungaroring', hard: 'C2', medium: 'C3', soft: 'C4', asphaltSeverity: 'MEDIUM ABRASION' },
  shanghai: { circuitId: 'shanghai', hard: 'C2', medium: 'C3', soft: 'C4', asphaltSeverity: 'MEDIUM ABRASION' },
  jeddah: { circuitId: 'jeddah', hard: 'C2', medium: 'C3', soft: 'C4', asphaltSeverity: 'MEDIUM ABRASION' },
  miami: { circuitId: 'miami', hard: 'C2', medium: 'C3', soft: 'C4', asphaltSeverity: 'MEDIUM ABRASION' },
  albert_park: { circuitId: 'albert_park', hard: 'C2', medium: 'C3', soft: 'C4', asphaltSeverity: 'MEDIUM ABRASION' },
  mexico: { circuitId: 'mexico', hard: 'C2', medium: 'C3', soft: 'C4', asphaltSeverity: 'MEDIUM ABRASION' },
  yas_marina: { circuitId: 'yas_marina', hard: 'C2', medium: 'C3', soft: 'C4', asphaltSeverity: 'MEDIUM ABRASION' }
};

const DEFAULT_ALLOCATION: CircuitPirelliNomination = {
  circuitId: 'generic',
  hard: 'C2',
  medium: 'C3',
  soft: 'C4',
  asphaltSeverity: 'MEDIUM ABRASION'
};

export default function TyreDegradationLab({
  selectedSeason,
  selectedRound,
  roundName,
  circuitId,
  driversList
}: TyreDegradationLabProps) {
  // Stint selection: 1 (Stint 1), 2 (Stint 2), 3 (Stint 3)
  const [selectedStintNumber, setSelectedStintNumber] = useState<number>(1);
  // Fuel burnoff pace gain per lap (seconds)
  const [fuelBurnEffect, setFuelBurnEffect] = useState<number>(0.055);
  // Track Surface Temperature (°C)
  const [trackTempC, setTrackTempC] = useState<number>(38);
  // Active View Tab: 'pirelli' | 'duel' | 'thermal'
  const [activeTab, setActiveTab] = useState<'pirelli' | 'duel' | 'thermal'>('pirelli');

  // Pirelli Simulator Specific State
  const [pirelliDrivingStyle, setPirelliDrivingStyle] = useState<'whisperer' | 'balanced' | 'attack'>('balanced');
  const [simHorizonLaps, setSimHorizonLaps] = useState<number>(45);

  // Selected Drivers for Chart / Duel comparison
  const [compareDriverA, setCompareDriverA] = useState<string>('');
  const [compareDriverB, setCompareDriverB] = useState<string>('');

  // Duel Sub-Mode: 'allDrivers' (All Drivers & All Stints Matrix) vs 'duel' (1-on-1 Duel)
  const [duelSubMode, setDuelSubMode] = useState<'allDrivers' | 'duel'>('allDrivers');
  const [matrixSortBy, setMatrixSortBy] = useState<'position' | 'degAsc' | 'scoreDesc'>('position');
  const [matrixFilterTeam, setMatrixFilterTeam] = useState<string>('all');

  // Loading & Data State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusText, setStatusText] = useState<string>('');
  const [stintAnalyses, setStintAnalyses] = useState<DriverStintAnalysis[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Official Pirelli Allocation for Current Circuit
  const activeNomination = useMemo(() => {
    if (!circuitId) return DEFAULT_ALLOCATION;
    return CIRCUIT_PIRELLI_ALLOCATIONS[circuitId] || DEFAULT_ALLOCATION;
  }, [circuitId]);

  // 1. Fetch Pit Stops and Lap-by-Lap Data for Drivers
  useEffect(() => {
    if (!selectedSeason || !selectedRound || driversList.length === 0) return;

    let isMounted = true;

    async function processRaceStints() {
      setIsLoading(true);
      setErrorMsg('');
      setStatusText('Fetching pit stop chronology and telemetry stints...');

      try {
        // Step A: Fetch Pit Stops
        const pitRes = await getJSON<{ MRData?: { RaceTable?: { Races?: Array<{ PitStops?: Array<{ driverId: string; lap: string; stop: string; duration?: string }> }> } } }>(
          `${API_BASE}/${selectedSeason}/${selectedRound}/pitstops.json`
        ).catch(() => null);

        const rawPitStops = pitRes?.MRData?.RaceTable?.Races?.[0]?.PitStops || [];
        const pitStopsMap: Record<string, PitStopEntry[]> = {};

        rawPitStops.forEach(p => {
          if (!pitStopsMap[p.driverId]) pitStopsMap[p.driverId] = [];
          pitStopsMap[p.driverId].push({
            driverId: p.driverId,
            lap: parseInt(p.lap, 10),
            stop: parseInt(p.stop, 10),
            duration: p.duration
          });
        });

        // Step B: Include ALL active drivers from the race
        const sortedDrivers = [...driversList]
          .filter(d => d.lapsCompleted >= 3);

        if (sortedDrivers.length === 0) {
          throw new Error('Insufficient lap records available to extract stints for this round.');
        }

        setStatusText(`Extracting telemetry stints across all ${sortedDrivers.length} drivers...`);

        // Step C: Fetch Lap Data for all drivers in parallel batches of 6
        const batchSize = 6;
        const driverLapResults: Array<{ driver: DriverResultItem; laps: Array<{ lapNumber: number; timeSec: number }> }> = [];

        for (let i = 0; i < sortedDrivers.length; i += batchSize) {
          const chunk = sortedDrivers.slice(i, i + batchSize);
          const chunkResults = await Promise.all(
            chunk.map(async (d) => {
              try {
                const res = await getJSON<{ MRData?: { RaceTable?: { Races?: Array<{ Laps?: Array<{ Timings?: Array<{ driverId: string; time: string }> }> }> } } }>(
                  `${API_BASE}/${selectedSeason}/${selectedRound}/drivers/${d.driverId}/laps.json?limit=100`
                );
                const laps = res?.MRData?.RaceTable?.Races?.[0]?.Laps || [];
                const parsed = laps.map((l, index) => {
                  const t = l.Timings?.find(tm => tm.driverId === d.driverId);
                  const timeSec = t ? parseLapTime(t.time) : null;
                  return {
                    lapNumber: index + 1,
                    timeSec: timeSec || 0
                  };
                }).filter(l => l.timeSec > 35);
                return { driver: d, laps: parsed };
              } catch {
                return { driver: d, laps: [] };
              }
            })
          );
          driverLapResults.push(...chunkResults);
        }

        if (!isMounted) return;

        // Step D: Segment Laps into Stints & Run Telemetry Analysis
        const analyses: DriverStintAnalysis[] = [];

        driverLapResults.forEach(({ driver, laps }) => {
          if (laps.length < 3) return;

          const stops = (pitStopsMap[driver.driverId] || []).sort((a, b) => a.lap - b.lap);
          const stopLaps = stops.map(s => s.lap);

          // Build Stints boundaries: [1, stop1], [stop1+1, stop2], [stop2+1, finish]
          const stintRanges: Array<{ stintNumber: number; start: number; end: number }> = [];
          if (stopLaps.length === 0) {
            stintRanges.push({ stintNumber: 1, start: 1, end: laps.length });
          } else {
            stintRanges.push({ stintNumber: 1, start: 1, end: stopLaps[0] });
            for (let i = 0; i < stopLaps.length - 1; i++) {
              stintRanges.push({ stintNumber: i + 2, start: stopLaps[i] + 1, end: stopLaps[i + 1] });
            }
            const lastStop = stopLaps[stopLaps.length - 1];
            if (lastStop < laps.length) {
              stintRanges.push({ stintNumber: stopLaps.length + 1, start: lastStop + 1, end: laps.length });
            }
          }

          stintRanges.forEach(range => {
            const stintRawLaps = laps.filter(l => l.lapNumber >= range.start && l.lapNumber <= range.end);
            if (stintRawLaps.length < 3) return;

            const times = stintRawLaps.map(l => l.timeSec).sort((a, b) => a - b);
            const mid = Math.floor(times.length / 2);
            const medianPace = times.length % 2 !== 0 ? times[mid] : (times[mid - 1] + times[mid]) / 2;

            const labeledLaps: StintLapData[] = stintRawLaps.map((l, idx) => {
              const isInOutLap = idx === 0 || idx === stintRawLaps.length - 1;
              const isSpike = l.timeSec > medianPace + 3.2;
              return {
                lapNumber: l.lapNumber,
                timeSec: l.timeSec,
                isOutlier: isInOutLap || isSpike,
                deltaToMedian: parseFloat((l.timeSec - medianPace).toFixed(3))
              };
            });

            const clean = labeledLaps.filter(l => !l.isOutlier);
            const usableLaps = clean.length >= 2 ? clean : labeledLaps;
            if (usableLaps.length < 2) return;

            const n = usableLaps.length;
            const xVals = usableLaps.map(l => l.lapNumber);
            const yVals = usableLaps.map(l => l.timeSec);
            const sumX = xVals.reduce((a, b) => a + b, 0);
            const sumY = yVals.reduce((a, b) => a + b, 0);
            const sumXY = usableLaps.reduce((sum, l) => sum + (l.lapNumber * l.timeSec), 0);
            const sumXX = usableLaps.reduce((sum, l) => sum + (l.lapNumber * l.lapNumber), 0);

            const denom = (n * sumXX) - (sumX * sumX);
            let slope = denom !== 0 ? ((n * sumXY) - (sumX * sumY)) / denom : 0.05;
            slope = Math.max(-0.02, Math.min(0.28, slope));

            const meanY = sumY / n;
            const variance = usableLaps.reduce((acc, l) => acc + Math.pow(l.timeSec - meanY, 2), 0) / n;
            const stdDev = Math.sqrt(variance);

            const fuelCorrected = slope + fuelBurnEffect;

            let cliffLap: number | null = null;
            let cliffSeverity: number | null = null;
            for (let i = usableLaps.length - 3; i < usableLaps.length; i++) {
              if (i >= 0) {
                const lap = usableLaps[i];
                const expectedTime = (sumY / n) + slope * (lap.lapNumber - (sumX / n));
                if (lap.timeSec - expectedTime > 1.15) {
                  cliffLap = lap.lapNumber;
                  cliffSeverity = parseFloat((lap.timeSec - expectedTime).toFixed(2));
                  break;
                }
              }
            }

            const baseScore = 100 - (fuelCorrected * 360) - (stdDev * 12);
            const score = Math.max(35, Math.min(99, Math.round(baseScore)));

            let tier: 'ELITE' | 'BALANCED' | 'COOKER' = 'BALANCED';
            if (score >= 90) tier = 'ELITE';
            else if (score < 75) tier = 'COOKER';

            const totalStintLaps = range.end - range.start + 1;
            let compound: 'SOFT' | 'MEDIUM' | 'HARD' = 'MEDIUM';
            if (totalStintLaps <= 18) compound = 'SOFT';
            else if (totalStintLaps >= 32) compound = 'HARD';

            analyses.push({
              driverId: driver.driverId,
              code: driver.code,
              name: `${driver.givenName} ${driver.familyName}`,
              position: driver.position,
              constructorId: driver.constructorName.toLowerCase().replace(/\s+/g, '_'),
              constructorName: driver.constructorName,
              stintNumber: range.stintNumber,
              startLap: range.start,
              endLap: range.end,
              totalLaps: totalStintLaps,
              cleanLaps: usableLaps.length,
              compoundInferred: compound,
              basePaceSec: parseFloat(Math.min(...usableLaps.map(l => l.timeSec)).toFixed(3)),
              rawDegSecPerLap: parseFloat(slope.toFixed(3)),
              fuelCorrectedDegSecPerLap: parseFloat(fuelCorrected.toFixed(3)),
              consistencyStdSec: parseFloat(stdDev.toFixed(3)),
              whispererScore: score,
              whispererTier: tier,
              cliffLapDetected: cliffLap,
              cliffSeveritySec: cliffSeverity,
              laps: labeledLaps
            });
          });
        });

        if (analyses.length > 0) {
          setStintAnalyses(analyses);
          const s1Drivers = analyses.filter(a => a.stintNumber === 1);
          if (s1Drivers.length >= 2) {
            setCompareDriverA(s1Drivers[0].driverId);
            setCompareDriverB(s1Drivers[1].driverId);
          } else if (analyses.length >= 2) {
            setCompareDriverA(analyses[0].driverId);
            setCompareDriverB(analyses[1].driverId);
          }
        } else {
          throw new Error('Could not parse clean race stints for the current round.');
        }
      } catch (err: any) {
        if (isMounted) setErrorMsg(err.message || 'Failed to process race stints.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    processRaceStints();

    return () => {
      isMounted = false;
    };
  }, [selectedSeason, selectedRound, driversList, fuelBurnEffect]);

  // Current Filtered Stint Records - sorted by race classification order
  const currentStintDrivers = useMemo(() => {
    return stintAnalyses
      .filter(a => selectedStintNumber === 0 ? a.stintNumber === 1 : a.stintNumber === selectedStintNumber)
      .sort((a, b) => {
        const posA = parseInt(a.position || '99', 10);
        const posB = parseInt(b.position || '99', 10);
        if (!isNaN(posA) && !isNaN(posB) && posA !== posB) return posA - posB;
        return b.whispererScore - a.whispererScore;
      });
  }, [stintAnalyses, selectedStintNumber]);

  // Comparison Driver Objects
  const driverAData = useMemo(() => {
    return currentStintDrivers.find(d => d.driverId === compareDriverA) || currentStintDrivers[0];
  }, [currentStintDrivers, compareDriverA]);

  const driverBData = useMemo(() => {
    return currentStintDrivers.find(d => d.driverId === compareDriverB) || (currentStintDrivers[1] || currentStintDrivers[0]);
  }, [currentStintDrivers, compareDriverB]);

  // Keep driver comparison selections in sync with active stint
  useEffect(() => {
    if (currentStintDrivers.length >= 2) {
      if (!currentStintDrivers.some(d => d.driverId === compareDriverA)) {
        setCompareDriverA(currentStintDrivers[0].driverId);
      }
      if (!currentStintDrivers.some(d => d.driverId === compareDriverB) || compareDriverB === currentStintDrivers[0].driverId) {
        setCompareDriverB(currentStintDrivers[1].driverId);
      }
    } else if (currentStintDrivers.length === 1) {
      setCompareDriverA(currentStintDrivers[0].driverId);
      setCompareDriverB(currentStintDrivers[0].driverId);
    }
  }, [currentStintDrivers, compareDriverA, compareDriverB]);

  // Multi-stint data grouped by driver across Stint 1, Stint 2, Stint 3, etc.
  const allDriversMultiStint = useMemo(() => {
    const map = new Map<string, {
      driverId: string;
      code: string;
      name: string;
      position: string;
      constructorId: string;
      constructorName: string;
      stints: DriverStintAnalysis[];
      stint1?: DriverStintAnalysis;
      stint2?: DriverStintAnalysis;
      stint3?: DriverStintAnalysis;
      stint4?: DriverStintAnalysis;
      totalRaceLaps: number;
      totalPitStops: number;
      avgFuelCorrectedDeg: number;
      bestBasePace: number;
      overallWhispererScore: number;
    }>();

    stintAnalyses.forEach(analysis => {
      let rec = map.get(analysis.driverId);
      if (!rec) {
        rec = {
          driverId: analysis.driverId,
          code: analysis.code,
          name: analysis.name,
          position: analysis.position || '99',
          constructorId: analysis.constructorId,
          constructorName: analysis.constructorName,
          stints: [],
          totalRaceLaps: 0,
          totalPitStops: 0,
          avgFuelCorrectedDeg: 0,
          bestBasePace: 999,
          overallWhispererScore: 0
        };
        map.set(analysis.driverId, rec);
      }

      rec.stints.push(analysis);
      if (analysis.stintNumber === 1) rec.stint1 = analysis;
      if (analysis.stintNumber === 2) rec.stint2 = analysis;
      if (analysis.stintNumber === 3) rec.stint3 = analysis;
      if (analysis.stintNumber === 4) rec.stint4 = analysis;
      rec.totalRaceLaps += analysis.totalLaps;
      if (analysis.basePaceSec < rec.bestBasePace) rec.bestBasePace = analysis.basePaceSec;
    });

    const list = Array.from(map.values()).map(rec => {
      rec.stints.sort((a, b) => a.stintNumber - b.stintNumber);
      rec.totalPitStops = Math.max(0, rec.stints.length - 1);
      const sumDeg = rec.stints.reduce((sum, s) => sum + s.fuelCorrectedDegSecPerLap, 0);
      rec.avgFuelCorrectedDeg = rec.stints.length > 0 ? parseFloat((sumDeg / rec.stints.length).toFixed(3)) : 0;
      const sumScore = rec.stints.reduce((sum, s) => sum + s.whispererScore, 0);
      rec.overallWhispererScore = rec.stints.length > 0 ? Math.round(sumScore / rec.stints.length) : 50;
      return rec;
    });

    return list.sort((a, b) => {
      if (matrixSortBy === 'degAsc') {
        return a.avgFuelCorrectedDeg - b.avgFuelCorrectedDeg;
      }
      if (matrixSortBy === 'scoreDesc') {
        return b.overallWhispererScore - a.overallWhispererScore;
      }
      const posA = parseInt(a.position, 10);
      const posB = parseInt(b.position, 10);
      if (!isNaN(posA) && !isNaN(posB) && posA !== posB) return posA - posB;
      return a.avgFuelCorrectedDeg - b.avgFuelCorrectedDeg;
    });
  }, [stintAnalyses, matrixSortBy]);

  const availableConstructors = useMemo(() => {
    const set = new Set<string>();
    allDriversMultiStint.forEach(d => set.add(d.constructorName));
    return Array.from(set).sort();
  }, [allDriversMultiStint]);

  const filteredMultiStintDrivers = useMemo(() => {
    if (matrixFilterTeam === 'all') return allDriversMultiStint;
    return allDriversMultiStint.filter(d => d.constructorName === matrixFilterTeam);
  }, [allDriversMultiStint, matrixFilterTeam]);

  // Grouped Bar Chart comparing Stint 1, Stint 2, and Stint 3 degradation across all drivers
  const allDriversChartData = useMemo(() => {
    if (filteredMultiStintDrivers.length === 0) return null;

    const labels = filteredMultiStintDrivers.map(d => `${d.position ? `P${d.position} ` : ''}${d.code}`);
    const s1Degs = filteredMultiStintDrivers.map(d => d.stint1 ? d.stint1.fuelCorrectedDegSecPerLap : null);
    const s2Degs = filteredMultiStintDrivers.map(d => d.stint2 ? d.stint2.fuelCorrectedDegSecPerLap : null);
    const s3Degs = filteredMultiStintDrivers.map(d => d.stint3 ? d.stint3.fuelCorrectedDegSecPerLap : null);

    return {
      labels,
      datasets: [
        {
          label: '🔴 Stint 1 Deg (+s/lap)',
          data: s1Degs,
          backgroundColor: 'rgba(239, 68, 68, 0.75)',
          borderColor: '#EF4444',
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: '🟡 Stint 2 Deg (+s/lap)',
          data: s2Degs,
          backgroundColor: 'rgba(245, 158, 11, 0.75)',
          borderColor: '#F59E0B',
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: '⚪ Stint 3 Deg (+s/lap)',
          data: s3Degs,
          backgroundColor: 'rgba(56, 189, 248, 0.75)',
          borderColor: '#38BDF8',
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    };
  }, [filteredMultiStintDrivers]);

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#E2E8F0',
          font: { family: 'var(--font-mono)', size: 11, weight: 'bold' as const }
        }
      },
      tooltip: {
        backgroundColor: '#0F172A',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#38BDF8',
        bodyColor: '#F8FAFC',
        titleFont: { family: 'var(--font-mono)', size: 12 },
        bodyFont: { family: 'var(--font-mono)', size: 12 },
        callbacks: {
          label: function (context: any) {
            const val = context.parsed.y;
            if (val === null || val === undefined) return '';
            return `${context.dataset.label}: +${Number(val).toFixed(3)}s/lap`;
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
          callback: function (val: any) {
            return `+${Number(val).toFixed(2)}s`;
          }
        }
      }
    }
  };

  // Thermal Surface Impact Calculations
  const thermalAnalysis = useMemo(() => {
    const deltaTemp = trackTempC - 38;
    const grainingRisk = Math.max(0, Math.min(100, Math.round(50 - (deltaTemp * 4.5))));
    const blisteringRisk = Math.max(0, Math.min(100, Math.round(45 + (deltaTemp * 4.2))));
    const cliffShiftLaps = parseFloat((-deltaTemp * 0.38).toFixed(1));

    return {
      grainingRisk,
      blisteringRisk,
      cliffShiftLaps
    };
  }, [trackTempC]);

  // -------------------------------------------------------------
  // PIRELLI 3-PHASE DEGRADATION & CLIFF SIMULATION LOGIC
  // -------------------------------------------------------------
  const pirelliSimulation = useMemo(() => {
    const hardSpec = PIRELLI_COMPOUNDS_MASTER[activeNomination.hard];
    const medSpec = PIRELLI_COMPOUNDS_MASTER[activeNomination.medium];
    const softSpec = PIRELLI_COMPOUNDS_MASTER[activeNomination.soft];

    const benchmarkBase = currentStintDrivers.length > 0 ? currentStintDrivers[0].basePaceSec : 92.0;

    // Driving style multipliers
    let cliffOffset = 0;
    let degMultiplier = 1.0;
    if (pirelliDrivingStyle === 'whisperer') {
      cliffOffset = +4;
      degMultiplier = 0.82;
    } else if (pirelliDrivingStyle === 'attack') {
      cliffOffset = -4;
      degMultiplier = 1.28;
    }

    // Function to calculate lap time on lap L for a compound spec
    const calcLapTime = (spec: PirelliCompoundDetail, lap: number) => {
      const cliffLap = Math.max(8, spec.nominalCliffLap + cliffOffset);
      const effectiveDeg = spec.linearDegRate * degMultiplier;

      // Phase 1: Scrub-in (Laps 1-3)
      if (lap === 1) return benchmarkBase + spec.paceDeltaSec + 0.32;
      if (lap === 2) return benchmarkBase + spec.paceDeltaSec;
      if (lap === 3) return benchmarkBase + spec.paceDeltaSec + 0.05;

      // Phase 2: Plateau (Laps 4 to cliffLap)
      if (lap <= cliffLap) {
        return benchmarkBase + spec.paceDeltaSec + (effectiveDeg * (lap - 2));
      }

      // Phase 3: The Critical Thermal Cliff (exponential drop)
      const lapsOver = lap - cliffLap;
      const cliffSpike = spec.cliffSeverityMultiplier * Math.pow(lapsOver, 1.55);
      const plateauExit = benchmarkBase + spec.paceDeltaSec + (effectiveDeg * (cliffLap - 2));
      return plateauExit + cliffSpike;
    };

    const labels: string[] = [];
    const softTimes: number[] = [];
    const medTimes: number[] = [];
    const hardTimes: number[] = [];

    let softToMedCrossover: number | null = null;
    let medToHardCrossover: number | null = null;

    for (let l = 1; l <= simHorizonLaps; l++) {
      labels.push(`L${l}`);
      const sT = parseFloat(calcLapTime(softSpec, l).toFixed(3));
      const mT = parseFloat(calcLapTime(medSpec, l).toFixed(3));
      const hT = parseFloat(calcLapTime(hardSpec, l).toFixed(3));

      softTimes.push(sT);
      medTimes.push(mT);
      hardTimes.push(hT);

      // Crossover detection
      if (softToMedCrossover === null && sT >= mT && l > 5) {
        softToMedCrossover = l;
      }
      if (medToHardCrossover === null && mT >= hT && l > 10) {
        medToHardCrossover = l;
      }
    }

    const chartData = {
      labels,
      datasets: [
        {
          label: `🔴 SOFT (${softSpec.name})`,
          data: softTimes,
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2.5,
          pointRadius: 2,
          pointHoverRadius: 5,
          tension: 0.15
        },
        {
          label: `🟡 MEDIUM (${medSpec.name})`,
          data: medTimes,
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 2.5,
          pointRadius: 2,
          pointHoverRadius: 5,
          tension: 0.15
        },
        {
          label: `⚪ HARD (${hardSpec.name})`,
          data: hardTimes,
          borderColor: '#FFFFFF',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 2.5,
          pointRadius: 2,
          pointHoverRadius: 5,
          tension: 0.15
        }
      ]
    };

    return {
      softSpec,
      medSpec,
      hardSpec,
      chartData,
      softToMedCrossover: softToMedCrossover || Math.round(softSpec.nominalCliffLap * 0.75),
      medToHardCrossover: medToHardCrossover || Math.round(medSpec.nominalCliffLap * 0.85),
      benchmarkBase
    };
  }, [activeNomination, currentStintDrivers, pirelliDrivingStyle, simHorizonLaps]);

  // Helper to format lap time seconds to m:ss.sss
  const formatLapTime = (sec: number | null | undefined): string => {
    if (!sec || isNaN(sec) || sec <= 0) return '—';
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toFixed(3);
    return `${m}:${s.padStart(6, '0')}`;
  };

  // Lap-by-lap head-to-head stint telemetry comparison for table
  const stintLapComparison = useMemo(() => {
    if (!driverAData) return [];
    const lapsA = driverAData.laps || [];
    const lapsB = driverBData?.laps || [];

    const mapA = new Map(lapsA.map(l => [l.lapNumber, l]));
    const mapB = new Map(lapsB.map(l => [l.lapNumber, l]));

    const allLapNumbers = Array.from(new Set([...lapsA.map(l => l.lapNumber), ...lapsB.map(l => l.lapNumber)]))
      .sort((a, b) => a - b);

    let runningCumDelta = 0;

    return allLapNumbers.map(lapNum => {
      const lapA = mapA.get(lapNum);
      const lapB = mapB.get(lapNum);

      let deltaSec: number | null = null;
      if (lapA && lapB && !lapA.isOutlier && !lapB.isOutlier) {
        deltaSec = parseFloat((lapB.timeSec - lapA.timeSec).toFixed(3));
        runningCumDelta += deltaSec;
      }

      return {
        lapNumber: lapNum,
        timeSecA: lapA?.timeSec ?? null,
        isOutlierA: lapA?.isOutlier ?? false,
        timeSecB: lapB?.timeSec ?? null,
        isOutlierB: lapB?.isOutlier ?? false,
        deltaSec,
        cumulativeDelta: parseFloat(runningCumDelta.toFixed(3))
      };
    });
  }, [driverAData, driverBData]);

  // Chart Data: Scatter Lap Times & Degradation Slopes for Telemetry Stints
  const stintChartData = useMemo(() => {
    if (!driverAData) return null;

    const allLapsA = (driverAData.laps || []).filter(l => !l.isOutlier);
    const allLapsB = driverBData ? (driverBData.laps || []).filter(l => !l.isOutlier) : [];

    const allLapNums = [...allLapsA.map(l => l.lapNumber), ...allLapsB.map(l => l.lapNumber)];
    if (allLapNums.length === 0) return null;

    const minLap = Math.min(...allLapNums);
    const maxLap = Math.max(...allLapNums);

    const labels: string[] = [];
    const pointsA: (number | null)[] = [];
    const trendA: (number | null)[] = [];
    const pointsB: (number | null)[] = [];
    const trendB: (number | null)[] = [];

    const colorA = getTeamColor(driverAData.constructorId);
    const colorB = driverBData ? getTeamColor(driverBData.constructorId) : '#94A3B8';

    for (let lap = minLap; lap <= maxLap; lap++) {
      labels.push(`L${lap}`);

      const lapA = allLapsA.find(l => l.lapNumber === lap);
      pointsA.push(lapA ? lapA.timeSec : null);

      if (allLapsA.length > 0) {
        const offset = lap - driverAData.startLap;
        const projected = driverAData.basePaceSec + (driverAData.rawDegSecPerLap * offset);
        trendA.push(parseFloat(projected.toFixed(3)));
      } else {
        trendA.push(null);
      }

      if (driverBData && allLapsB.length > 0) {
        const lapB = allLapsB.find(l => l.lapNumber === lap);
        pointsB.push(lapB ? lapB.timeSec : null);
        const offsetB = lap - driverBData.startLap;
        const projectedB = driverBData.basePaceSec + (driverBData.rawDegSecPerLap * offsetB);
        trendB.push(parseFloat(projectedB.toFixed(3)));
      } else {
        pointsB.push(null);
        trendB.push(null);
      }
    }

    return {
      labels,
      datasets: [
        {
          label: `${driverAData.code} Race Pace`,
          data: pointsA,
          borderColor: colorA,
          backgroundColor: colorA,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
          showLine: true,
          tension: 0.15
        },
        {
          label: `${driverAData.code} Deg Trend (+${driverAData.fuelCorrectedDegSecPerLap}s/lap)`,
          data: trendA,
          borderColor: colorA,
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
          tension: 0
        },
        ...(driverBData ? [
          {
            label: `${driverBData.code} Race Pace`,
            data: pointsB,
            borderColor: colorB,
            backgroundColor: colorB,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2,
            showLine: true,
            tension: 0.15
          },
          {
            label: `${driverBData.code} Deg Trend (+${driverBData.fuelCorrectedDegSecPerLap}s/lap)`,
            data: trendB,
            borderColor: colorB,
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
            tension: 0
          }
        ] : [])
      ]
    };
  }, [driverAData, driverBData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#E2E8F0',
          font: { family: 'var(--font-mono)', size: 11, weight: 'bold' as const }
        }
      },
      tooltip: {
        backgroundColor: '#0F172A',
        borderColor: '#334155',
        borderWidth: 1,
        titleColor: '#38BDF8',
        bodyColor: '#F8FAFC',
        titleFont: { family: 'var(--font-mono)', size: 12 },
        bodyFont: { family: 'var(--font-mono)', size: 12 },
        callbacks: {
          label: function (context: any) {
            const val = context.parsed.y;
            if (val === null) return '';
            const m = Math.floor(val / 60);
            const s = (val % 60).toFixed(3);
            return `${context.dataset.label}: ${m}:${s.padStart(6, '0')}`;
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
          callback: function (val: any) {
            const m = Math.floor(val / 60);
            const s = (val % 60).toFixed(1);
            return `${m}:${s.padStart(4, '0')}`;
          }
        }
      }
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Header & Stint Mode Bar */}
      <div className="space-y-4 pb-4 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5 font-mono text-xs font-bold">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                PIRELLI C1–C5 ALLOCATION &amp; THERMAL CLIFFS
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-slate-300 font-display font-bold uppercase tracking-wider whitespace-nowrap">
                {roundName || `R${selectedRound} GRAND PRIX`}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white uppercase whitespace-normal sm:whitespace-nowrap">
              TYRE DEGRADATION &amp; STINT WHISPERER LAB
            </h2>
            <p className="text-xs font-sans text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Official Pirelli track compound allocations (C1 to C5), 3-phase thermal cliff progression curves, and real telemetry stint degradation rates.
            </p>
          </div>

          {/* Stint Selector */}
          <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
            <div className="flex items-center gap-2 bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800 shadow-md">
              <label htmlFor="stint-selector" className="text-xs font-mono text-slate-400 font-bold uppercase whitespace-nowrap">
                STINT:
              </label>
              <select
                id="stint-selector"
                value={selectedStintNumber}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setSelectedStintNumber(val);
                  if (val === 0) {
                    setDuelSubMode('allDrivers');
                  }
                }}
                className="bg-transparent text-white text-xs font-display font-bold cursor-pointer hover:text-rose-400 transition outline-none pr-1"
              >
                <option value={0} className="bg-slate-900 text-white">ALL STINTS (Full Grid Matrix)</option>
                <option value={1} className="bg-slate-900 text-white">STINT 1 (Opening Stint)</option>
                <option value={2} className="bg-slate-900 text-white">STINT 2 (Middle Stint)</option>
                <option value={3} className="bg-slate-900 text-white">STINT 3 (Closing Stint)</option>
              </select>
            </div>
          </div>
        </div>

        {/* View Mode Tabs - Full Width Responsive Grid/Flex Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80 text-xs font-mono w-full">
          <button
            type="button"
            onClick={() => setActiveTab('pirelli')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg cursor-pointer transition font-bold flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'pirelli' ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🔴</span>
            <span>PIRELLI C1–C5 &amp; CLIFFS</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('duel')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg cursor-pointer transition font-bold flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'duel' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md shadow-amber-950/40' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>⚔️</span>
            <span>ALL DRIVERS &amp; STINT DUEL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('thermal')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg cursor-pointer transition font-bold flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'thermal' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-md shadow-purple-950/40' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🌡️</span>
            <span>THERMAL RISKS</span>
          </button>
        </div>
      </div>

      {/* Loading Banner */}
      {isLoading && (
        <div className="p-6 rounded-xl bg-slate-900/90 border border-rose-500/40 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-rose-400 font-bold">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span>{statusText}</span>
            </span>
            <span className="animate-pulse">PROCESSING TELEMETRY...</span>
          </div>
        </div>
      )}

      {errorMsg && !isLoading && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500 text-red-300 text-xs font-mono">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* 2. OFFICIAL PIRELLI NOMINATION BANNER */}
      {!isLoading && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-rose-500/40 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-rose-400">
              <span className="text-base">🏁</span>
              <span className="uppercase">OFFICIAL PIRELLI TYRE ALLOCATION: {roundName || 'THIS VENUE'}</span>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[10.5px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
              ASPHALT: {activeNomination.asphaltSeverity}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {/* HARD NOMINATION */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-white bg-slate-950 flex items-center justify-center font-black text-white text-xs shadow-lg shrink-0">
                ⚪
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">NOMINATED HARD</span>
                <span className="text-sm font-black text-white truncate block">{pirelliSimulation.hardSpec.name}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                  Working Window: {pirelliSimulation.hardSpec.workingTempMinC}°C–{pirelliSimulation.hardSpec.workingTempMaxC}°C
                </span>
              </div>
            </div>

            {/* MEDIUM NOMINATION */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-amber-400 bg-slate-950 flex items-center justify-center font-black text-amber-400 text-xs shadow-lg shrink-0">
                🟡
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-amber-400 uppercase block font-bold">NOMINATED MEDIUM</span>
                <span className="text-sm font-black text-white truncate block">{pirelliSimulation.medSpec.name}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                  Working Window: {pirelliSimulation.medSpec.workingTempMinC}°C–{pirelliSimulation.medSpec.workingTempMaxC}°C
                </span>
              </div>
            </div>

            {/* SOFT NOMINATION */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-rose-500/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-rose-500 bg-slate-950 flex items-center justify-center font-black text-rose-500 text-xs shadow-lg shrink-0">
                🔴
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-rose-400 uppercase block font-bold">NOMINATED SOFT</span>
                <span className="text-sm font-black text-white truncate block">{pirelliSimulation.softSpec.name}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                  Working Window: {pirelliSimulation.softSpec.workingTempMinC}°C–{pirelliSimulation.softSpec.workingTempMaxC}°C
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB 1: PIRELLI 3-PHASE DEGRADATION & THERMAL CLIFF MATRIX */}
      {!isLoading && activeTab === 'pirelli' && (
        <div className="space-y-6">
          {/* Controls Bar for Simulation */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-display font-black text-base text-white uppercase">
                  3-PHASE COMPOUND DEGRADATION &amp; THERMAL CLIFF SIMULATOR
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Phase 1: Scrub-in Peak (Laps 1–3) ➔ Phase 2: Management Plateau ➔ Phase 3: Exponential Thermal Cliff.
                </p>
              </div>

              {/* Driving Style Selection */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-slate-400 uppercase">Driving Style:</span>
                <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPirelliDrivingStyle('whisperer')}
                    className={`px-2.5 py-1 rounded cursor-pointer font-bold transition ${
                      pirelliDrivingStyle === 'whisperer' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🛡️ Whisperer (+4 Laps)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPirelliDrivingStyle('balanced')}
                    className={`px-2.5 py-1 rounded cursor-pointer font-bold transition ${
                      pirelliDrivingStyle === 'balanced' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ⚖️ Balanced
                  </button>
                  <button
                    type="button"
                    onClick={() => setPirelliDrivingStyle('attack')}
                    className={`px-2.5 py-1 rounded cursor-pointer font-bold transition ${
                      pirelliDrivingStyle === 'attack' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ⚠️ Attack / Dirty Air
                  </button>
                </div>
              </div>
            </div>

            {/* Stint Horizon Slider */}
            <div className="flex items-center justify-between gap-4 font-mono text-xs">
              <span className="text-slate-300">Simulation Stint Horizon: <strong className="text-rose-400">{simHorizonLaps} Laps</strong></span>
              <input
                type="range"
                min="20"
                max="55"
                step="1"
                value={simHorizonLaps}
                onChange={(e) => setSimHorizonLaps(parseInt(e.target.value, 10))}
                className="w-64 accent-rose-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Multi-Compound 3-Phase Progression Chart */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-mono text-xs text-white font-bold uppercase">
                COMPOUND PACE DEGRADATION TRAJECTORY (NON-LINEAR CLIFF MODEL):
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Vertical spacing reflects true pace delta between C-compounds
              </span>
            </div>

            <div className="h-80 w-full relative">
              <Line data={pirelliSimulation.chartData} options={chartOptions} />
            </div>

            {/* Crossover & Pit Window Callout Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs pt-2 border-t border-slate-800">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 uppercase text-[10px] font-bold">CROSSOVER 1 (SOFT ➔ MEDIUM)</span>
                  <span className="text-amber-400">Lap {pirelliSimulation.softToMedCrossover}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Soft compound loses its raw pace advantage around <strong className="text-white">Lap {pirelliSimulation.softToMedCrossover}</strong> due to surface overheating.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 uppercase text-[10px] font-bold">CROSSOVER 2 (MEDIUM ➔ HARD)</span>
                  <span className="text-cyan-400">Lap {pirelliSimulation.medToHardCrossover}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Mediums enter the degradation plateau cliff around <strong className="text-white">Lap {pirelliSimulation.medToHardCrossover}</strong>; Hards become the faster tire.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 uppercase text-[10px] font-bold">RECOMMENDED PIT WINDOW</span>
                  <span className="text-emerald-400">Laps {pirelliSimulation.softToMedCrossover - 2}–{pirelliSimulation.softToMedCrossover + 3}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Optimal stop window for 2-stop strategies to maximize undercut delta without hitting the thermal cliff.
                </p>
              </div>
            </div>
          </div>

          {/* Full Pirelli C1 to C5 Technical Specifications Table */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-white uppercase">PIRELLI C1–C5 COMPLETE TECHNICAL SPECIFICATION MATRIX:</span>
              <span className="text-slate-400">Official Pirelli Formula 1 Compound Range</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-900/40 text-[11px] font-mono text-slate-400 uppercase">
                    <th className="py-3 px-4">COMPOUND</th>
                    <th className="py-3 px-4">HARDNESS GRADE</th>
                    <th className="py-3 px-4 text-center">PACE DELTA</th>
                    <th className="py-3 px-4 text-center">BASE DEG RATE</th>
                    <th className="py-3 px-4 text-center">CLIFF ONSET LAP</th>
                    <th className="py-3 px-4 text-center">WORKING TEMP</th>
                    <th className="py-3 px-4 text-center">OPTIMAL STINT</th>
                    <th className="py-3 px-4">NOMINATION STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 font-mono">
                  {(['C1', 'C2', 'C3', 'C4', 'C5'] as PirelliCompoundId[]).map((cId) => {
                    const spec = PIRELLI_COMPOUNDS_MASTER[cId];
                    const isNominatedHard = activeNomination.hard === cId;
                    const isNominatedMed = activeNomination.medium === cId;
                    const isNominatedSoft = activeNomination.soft === cId;
                    const isNominated = isNominatedHard || isNominatedMed || isNominatedSoft;

                    return (
                      <tr key={cId} className={`hover:bg-slate-900/60 transition-colors ${isNominated ? 'bg-slate-900/30' : ''}`}>
                        <td className="py-3 px-4 font-bold">
                          <div className="flex items-center gap-2 font-mono">
                            <span className="w-3 h-3 rounded-full" style={{ background: spec.badgeColor }}></span>
                            <span className="text-white text-xs">{spec.name}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-300 text-[11px]">
                          {spec.hardnessGrade}
                        </td>

                        <td className="py-3 px-4 text-center font-bold">
                          <span className={spec.paceDeltaSec < 0 ? 'text-rose-400' : spec.paceDeltaSec > 0 ? 'text-slate-400' : 'text-amber-400'}>
                            {spec.paceDeltaSec === 0 ? 'BASELINE (0.0s)' : spec.paceDeltaSec < 0 ? `${spec.paceDeltaSec}s` : `+${spec.paceDeltaSec}s`}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center text-slate-300">
                          +{spec.linearDegRate}s / lap
                        </td>

                        <td className="py-3 px-4 text-center font-bold text-rose-300">
                          Lap ~{spec.nominalCliffLap}
                        </td>

                        <td className="py-3 px-4 text-center text-slate-300 text-[11px]">
                          {spec.workingTempMinC}°C – {spec.workingTempMaxC}°C
                        </td>

                        <td className="py-3 px-4 text-center text-slate-300">
                          {spec.optimalStintLaps[0]}–{spec.optimalStintLaps[1]} Laps
                        </td>

                        <td className="py-3 px-4 text-[11px]">
                          {isNominatedHard && (
                            <span className="px-2 py-0.5 rounded font-bold bg-white/20 text-white border border-white/40">
                              ⚪ NOMINATED HARD
                            </span>
                          )}
                          {isNominatedMed && (
                            <span className="px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              🟡 NOMINATED MEDIUM
                            </span>
                          )}
                          {isNominatedSoft && (
                            <span className="px-2 py-0.5 rounded font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              🔴 NOMINATED SOFT
                            </span>
                          )}
                          {!isNominated && (
                            <span className="text-slate-500">Not Nominated</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}



      {/* 6. TAB 2: ALL DRIVERS MULTI-STINT MATRIX & 1-ON-1 TELEMETRY DUEL */}
      {!isLoading && activeTab === 'duel' && (
        <div className="space-y-6">
          {/* Sub-Mode Navigation Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setDuelSubMode('allDrivers')}
                className={`px-4 py-2 rounded-xl cursor-pointer transition font-mono text-xs font-bold flex items-center gap-2 ${
                  duelSubMode === 'allDrivers'
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-950/50'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-850'
                }`}
              >
                <span>📊</span>
                <span>ALL DRIVERS &amp; ALL STINTS MATRIX ({allDriversMultiStint.length} Drivers)</span>
              </button>
              <button
                type="button"
                onClick={() => setDuelSubMode('duel')}
                className={`px-4 py-2 rounded-xl cursor-pointer transition font-mono text-xs font-bold flex items-center gap-2 ${
                  duelSubMode === 'duel'
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-950/50'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-850'
                }`}
              >
                <span>⚔️</span>
                <span>1-ON-1 HEAD-TO-HEAD DUEL</span>
              </button>
            </div>

            <div className="text-xs font-mono text-slate-400 hidden md:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{duelSubMode === 'allDrivers' ? 'Comparing all stints across the entire grid' : `Stint ${selectedStintNumber === 0 ? 1 : selectedStintNumber} lap-by-lap telemetry comparison`}</span>
            </div>
          </div>

          {/* VIEW MODE A: FULL GRID ALL DRIVERS & ALL STINTS MATRIX */}
          {duelSubMode === 'allDrivers' && (
            <div className="space-y-6">
              {/* Matrix Control & Summary Bar */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="font-display font-black text-xl text-white uppercase flex items-center gap-2">
                      <span>📊</span>
                      <span>ALL DRIVERS MULTI-STINT TYRE DEGRADATION MATRIX</span>
                    </h3>
                    <p className="text-xs font-mono text-slate-400 mt-1 max-w-2xl leading-relaxed">
                      Complete Grand Prix telemetry comparison across Stint 1, Stint 2, and Stint 3. Normalized fuel-corrected tyre wear rates (+0.055s/lap) and compound stints.
                    </p>
                  </div>

                  {/* Filter & Sort Controls */}
                  <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
                    {/* Sort By Dropdown */}
                    <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 shadow-inner">
                      <label htmlFor="matrix-sort" className="text-slate-400 text-[11px] font-bold uppercase whitespace-nowrap">
                        SORT:
                      </label>
                      <select
                        id="matrix-sort"
                        value={matrixSortBy}
                        onChange={(e) => setMatrixSortBy(e.target.value as any)}
                        className="bg-transparent text-white font-display font-bold text-xs cursor-pointer hover:text-amber-400 transition outline-none pr-1"
                      >
                        <option value="position" className="bg-slate-900 text-white">Race Finish Order (P1–P20)</option>
                        <option value="degAsc" className="bg-slate-900 text-white">Lowest Tyre Deg (Best Preservers)</option>
                        <option value="scoreDesc" className="bg-slate-900 text-white">Highest Whisperer Score</option>
                      </select>
                    </div>

                    {/* Team Filter Dropdown */}
                    <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 shadow-inner">
                      <label htmlFor="matrix-team-filter" className="text-slate-400 text-[11px] font-bold uppercase whitespace-nowrap">
                        TEAM:
                      </label>
                      <select
                        id="matrix-team-filter"
                        value={matrixFilterTeam}
                        onChange={(e) => setMatrixFilterTeam(e.target.value)}
                        className="bg-transparent text-white font-display font-bold text-xs cursor-pointer hover:text-amber-400 transition outline-none pr-1"
                      >
                        <option value="all" className="bg-slate-900 text-white">All Teams ({allDriversMultiStint.length} Drivers)</option>
                        {availableConstructors.map(c => (
                          <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Key Summary Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs pt-1">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">GRID PARTICIPATION</span>
                    <span className="text-base font-black text-white block mt-0.5">{filteredMultiStintDrivers.length} Drivers</span>
                    <span className="text-[10.5px] text-slate-400 block mt-0.5">Across all completed stints</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold block">BEST TYRE PRESERVER</span>
                    {filteredMultiStintDrivers.length > 0 && (
                      <>
                        <span className="text-base font-black text-emerald-300 block mt-0.5">
                          {([...filteredMultiStintDrivers].sort((a, b) => a.avgFuelCorrectedDeg - b.avgFuelCorrectedDeg)[0]?.code)}
                        </span>
                        <span className="text-[10.5px] text-emerald-400/90 block mt-0.5">
                          +{([...filteredMultiStintDrivers].sort((a, b) => a.avgFuelCorrectedDeg - b.avgFuelCorrectedDeg)[0]?.avgFuelCorrectedDeg.toFixed(3))}s/lap avg
                        </span>
                      </>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-rose-400 uppercase font-bold block">HIGHEST TYRE WEAR</span>
                    {filteredMultiStintDrivers.length > 0 && (
                      <>
                        <span className="text-base font-black text-rose-300 block mt-0.5">
                          {([...filteredMultiStintDrivers].sort((a, b) => b.avgFuelCorrectedDeg - a.avgFuelCorrectedDeg)[0]?.code)}
                        </span>
                        <span className="text-[10.5px] text-rose-400/90 block mt-0.5">
                          +{([...filteredMultiStintDrivers].sort((a, b) => b.avgFuelCorrectedDeg - a.avgFuelCorrectedDeg)[0]?.avgFuelCorrectedDeg.toFixed(3))}s/lap avg
                        </span>
                      </>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-amber-400 uppercase font-bold block">FIELD AVERAGE DEG</span>
                    {filteredMultiStintDrivers.length > 0 && (
                      <>
                        <span className="text-base font-black text-amber-300 block mt-0.5">
                          +{(filteredMultiStintDrivers.reduce((sum, d) => sum + d.avgFuelCorrectedDeg, 0) / filteredMultiStintDrivers.length).toFixed(3)}s
                        </span>
                        <span className="text-[10.5px] text-slate-400 block mt-0.5">Per lap rubber pace loss</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Grouped Bar Chart: Stint 1 vs Stint 2 vs Stint 3 Degradation */}
              {allDriversChartData && (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="font-display font-black text-base text-white uppercase">
                        MULTI-STINT TYRE DEGRADATION COMPARISON ACROSS ALL DRIVERS
                      </h4>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">
                        Fuel-corrected tire degradation rate (+s/lap) for Stint 1, Stint 2, and Stint 3. Shorter bars indicate superior tyre conservation.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                      <span className="text-slate-500 hidden sm:inline">• Lower is better</span>
                    </div>
                  </div>

                  <div className="h-80 w-full relative">
                    <Bar data={allDriversChartData} options={barChartOptions} />
                  </div>
                </div>
              )}

              {/* Full Multi-Stint Grid Comparison Matrix Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 font-bold uppercase">ALL DRIVERS MULTI-STINT TELEMETRY MATRIX:</span>
                    <span className="text-slate-400">Stint-by-stint degradation, compound strategy, and pace</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span> &lt;0.080s (Elite)
                    </span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span> 0.080–0.120s (Balanced)
                    </span>
                    <span className="flex items-center gap-1 text-rose-400">
                      <span className="w-2 h-2 rounded-full bg-rose-400"></span> &gt;0.120s (High Deg)
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800/80 bg-slate-900/40 text-[11px] text-slate-400 uppercase">
                        <th className="py-3 px-3.5 text-center w-12">POS</th>
                        <th className="py-3 px-3.5 min-w-[150px]">DRIVER</th>
                        <th className="py-3 px-3.5 text-center min-w-[130px]">STRATEGY</th>
                        <th className="py-3 px-3.5 min-w-[160px]">STINT 1 (OPENING)</th>
                        <th className="py-3 px-3.5 min-w-[160px]">STINT 2 (MIDDLE)</th>
                        <th className="py-3 px-3.5 min-w-[160px]">STINT 3 (CLOSING)</th>
                        <th className="py-3 px-3.5 text-center min-w-[100px]">RACE AVG DEG</th>
                        <th className="py-3 px-3.5 text-center min-w-[110px]">WHISPERER</th>
                        <th className="py-3 px-3.5 text-center w-20">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {filteredMultiStintDrivers.map((row) => {
                        const teamColor = getTeamColor(row.constructorId);

                        return (
                          <tr key={row.driverId} className="hover:bg-slate-900/60 transition-colors group">
                            {/* POS */}
                            <td className="py-3 px-3.5 text-center font-bold text-slate-300">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
                                {row.position ? `P${row.position}` : '—'}
                              </span>
                            </td>

                            {/* DRIVER */}
                            <td className="py-3 px-3.5 font-sans">
                              <div className="flex items-center gap-2.5">
                                <span className="w-1 h-7 rounded-sm shrink-0" style={{ background: teamColor }}></span>
                                <div>
                                  <div className="flex items-center gap-1.5 font-mono">
                                    <span className="font-bold text-white text-xs">{row.code}</span>
                                    <span className="font-display font-semibold text-slate-200 text-xs truncate max-w-[120px]">
                                      {row.name}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate">{row.constructorName}</div>
                                </div>
                              </div>
                            </td>

                            {/* STRATEGY SEQUENCE */}
                            <td className="py-3 px-3.5 text-center font-mono">
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10.5px] text-slate-300 font-bold block mb-1">
                                {row.totalPitStops === 1 ? '1 Stop' : `${row.totalPitStops} Stops`} ({row.totalRaceLaps}L)
                              </span>
                              <div className="flex items-center justify-center gap-1 text-[10px]">
                                {row.stints.map((s, idx) => (
                                  <React.Fragment key={s.stintNumber}>
                                    <span className={`px-1 rounded font-bold ${
                                      s.compoundInferred === 'SOFT'
                                        ? 'text-rose-400 bg-rose-950/40'
                                        : s.compoundInferred === 'HARD'
                                          ? 'text-slate-200 bg-slate-800'
                                          : 'text-amber-400 bg-amber-950/40'
                                    }`}>
                                      {s.compoundInferred[0]}
                                    </span>
                                    {idx < row.stints.length - 1 && <span className="text-slate-600">➔</span>}
                                  </React.Fragment>
                                ))}
                              </div>
                            </td>

                            {/* STINT 1 */}
                            <td className="py-3 px-3.5">
                              {row.stint1 ? (
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 text-[11px]">
                                    <span className={`w-2 h-2 rounded-full ${
                                      row.stint1.compoundInferred === 'SOFT' ? 'bg-rose-500' : row.stint1.compoundInferred === 'HARD' ? 'bg-white' : 'bg-amber-400'
                                    }`}></span>
                                    <span className="text-white font-bold">{row.stint1.compoundInferred}</span>
                                    <span className="text-slate-400 text-[10px]">({row.stint1.totalLaps}L)</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10.5px]">
                                    <span className={`font-bold ${
                                      row.stint1.fuelCorrectedDegSecPerLap < 0.08
                                        ? 'text-emerald-400'
                                        : row.stint1.fuelCorrectedDegSecPerLap < 0.12
                                          ? 'text-amber-400'
                                          : 'text-rose-400'
                                    }`}>
                                      +{row.stint1.fuelCorrectedDegSecPerLap.toFixed(3)}s/l
                                    </span>
                                    <span className="text-slate-500">•</span>
                                    <span className="text-slate-300">{formatLapTime(row.stint1.basePaceSec)}</span>
                                  </div>
                                  {row.stint1.cliffLapDetected && (
                                    <span className="text-[9.5px] text-rose-400 font-bold block">
                                      ⚠️ Cliff L{row.stint1.cliffLapDetected}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-600 text-[11px]">—</span>
                              )}
                            </td>

                            {/* STINT 2 */}
                            <td className="py-3 px-3.5">
                              {row.stint2 ? (
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 text-[11px]">
                                    <span className={`w-2 h-2 rounded-full ${
                                      row.stint2.compoundInferred === 'SOFT' ? 'bg-rose-500' : row.stint2.compoundInferred === 'HARD' ? 'bg-white' : 'bg-amber-400'
                                    }`}></span>
                                    <span className="text-white font-bold">{row.stint2.compoundInferred}</span>
                                    <span className="text-slate-400 text-[10px]">({row.stint2.totalLaps}L)</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10.5px]">
                                    <span className={`font-bold ${
                                      row.stint2.fuelCorrectedDegSecPerLap < 0.08
                                        ? 'text-emerald-400'
                                        : row.stint2.fuelCorrectedDegSecPerLap < 0.12
                                          ? 'text-amber-400'
                                          : 'text-rose-400'
                                    }`}>
                                      +{row.stint2.fuelCorrectedDegSecPerLap.toFixed(3)}s/l
                                    </span>
                                    <span className="text-slate-500">•</span>
                                    <span className="text-slate-300">{formatLapTime(row.stint2.basePaceSec)}</span>
                                  </div>
                                  {row.stint2.cliffLapDetected && (
                                    <span className="text-[9.5px] text-rose-400 font-bold block">
                                      ⚠️ Cliff L{row.stint2.cliffLapDetected}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-600 text-[11px]">—</span>
                              )}
                            </td>

                            {/* STINT 3 */}
                            <td className="py-3 px-3.5">
                              {row.stint3 ? (
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 text-[11px]">
                                    <span className={`w-2 h-2 rounded-full ${
                                      row.stint3.compoundInferred === 'SOFT' ? 'bg-rose-500' : row.stint3.compoundInferred === 'HARD' ? 'bg-white' : 'bg-amber-400'
                                    }`}></span>
                                    <span className="text-white font-bold">{row.stint3.compoundInferred}</span>
                                    <span className="text-slate-400 text-[10px]">({row.stint3.totalLaps}L)</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10.5px]">
                                    <span className={`font-bold ${
                                      row.stint3.fuelCorrectedDegSecPerLap < 0.08
                                        ? 'text-emerald-400'
                                        : row.stint3.fuelCorrectedDegSecPerLap < 0.12
                                          ? 'text-amber-400'
                                          : 'text-rose-400'
                                    }`}>
                                      +{row.stint3.fuelCorrectedDegSecPerLap.toFixed(3)}s/l
                                    </span>
                                    <span className="text-slate-500">•</span>
                                    <span className="text-slate-300">{formatLapTime(row.stint3.basePaceSec)}</span>
                                  </div>
                                  {row.stint3.cliffLapDetected && (
                                    <span className="text-[9.5px] text-rose-400 font-bold block">
                                      ⚠️ Cliff L{row.stint3.cliffLapDetected}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-600 text-[10.5px]">No Stint 3 (1-Stop)</span>
                              )}
                            </td>

                            {/* RACE AVG DEG */}
                            <td className="py-3 px-3.5 text-center">
                              <span className={`font-black text-xs ${
                                row.avgFuelCorrectedDeg < 0.08
                                  ? 'text-emerald-400'
                                  : row.avgFuelCorrectedDeg < 0.12
                                    ? 'text-amber-400'
                                    : 'text-rose-400'
                              }`}>
                                +{row.avgFuelCorrectedDeg.toFixed(3)}s
                              </span>
                              <span className="text-[10px] text-slate-500 block">/ lap</span>
                            </td>

                            {/* WHISPERER INDEX */}
                            <td className="py-3 px-3.5 text-center">
                              <span className={`font-black text-xs ${
                                row.overallWhispererScore >= 90
                                  ? 'text-emerald-400'
                                  : row.overallWhispererScore >= 75
                                    ? 'text-amber-400'
                                    : 'text-rose-400'
                              }`}>
                                {row.overallWhispererScore}
                              </span>
                              <div className="w-14 mx-auto h-1 rounded-full bg-slate-800 overflow-hidden mt-1">
                                <div
                                  className={`h-full ${
                                    row.overallWhispererScore >= 90
                                      ? 'bg-emerald-400'
                                      : row.overallWhispererScore >= 75
                                        ? 'bg-amber-400'
                                        : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${row.overallWhispererScore}%` }}
                                ></div>
                              </div>
                            </td>

                            {/* ACTION BUTTON */}
                            <td className="py-3 px-3.5 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setCompareDriverA(row.driverId);
                                  setDuelSubMode('duel');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/40 text-[10.5px] font-bold transition cursor-pointer"
                              >
                                ⚔️ Duel
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE B: 1-ON-1 TELEMETRY DUEL */}
          {duelSubMode === 'duel' && driverAData && (
            <div className="space-y-6">
              {/* Back to All Drivers Matrix Button */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setDuelSubMode('allDrivers')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-amber-400 hover:text-white transition font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>←</span>
                  <span>Back to All Drivers &amp; All Stints Matrix</span>
                </button>
              </div>

              {/* Driver Pickers & Controls Bar */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                      <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                        STINT {selectedStintNumber === 0 ? 1 : selectedStintNumber} TELEMETRY DUEL
                      </span>
                    </div>
                    <h3 className="font-display font-black text-xl text-white uppercase">
                      HEAD-TO-HEAD RACE PACE &amp; TYRE DEGRADATION
                    </h3>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">
                      Real race lap times, fuel-corrected tire wear slopes (+0.055s/lap fuel burnoff gain), and cumulative pace bleed.
                    </p>
                  </div>

                  {/* Driver Selectors */}
                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                    {/* Driver A Selector */}
                    <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 shadow-inner">
                      <span
                        className="w-2.5 h-6 rounded-sm shrink-0 shadow-sm"
                        style={{ background: getTeamColor(driverAData.constructorId) }}
                      ></span>
                      <label htmlFor="driver-a-select" className="text-slate-400 text-[11px] font-mono font-bold uppercase whitespace-nowrap">
                        DRIVER A:
                      </label>
                      <select
                        id="driver-a-select"
                        value={driverAData.driverId}
                        onChange={(e) => setCompareDriverA(e.target.value)}
                        className="bg-transparent text-white font-display font-bold text-xs cursor-pointer hover:text-amber-400 transition outline-none pr-1"
                      >
                        {currentStintDrivers.map(d => (
                          <option key={d.driverId} value={d.driverId} className="bg-slate-900 text-white">
                            {d.position ? `P${d.position} • ` : ''}{d.code} — {d.name} ({d.constructorName})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Swap Drivers Button */}
                    {driverBData && (
                      <button
                        type="button"
                        onClick={() => {
                          const tempA = driverAData.driverId;
                          const tempB = driverBData.driverId;
                          setCompareDriverA(tempB);
                          setCompareDriverB(tempA);
                        }}
                        title="Swap Driver A and Driver B"
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 text-amber-400 hover:text-white transition cursor-pointer text-sm shadow-sm"
                      >
                        ⇄
                      </button>
                    )}

                    {/* Driver B Selector */}
                    {driverBData && (
                      <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 shadow-inner">
                        <span
                          className="w-2.5 h-6 rounded-sm shrink-0 shadow-sm"
                          style={{ background: getTeamColor(driverBData.constructorId) }}
                        ></span>
                        <label htmlFor="driver-b-select" className="text-slate-400 text-[11px] font-mono font-bold uppercase whitespace-nowrap">
                          DRIVER B:
                        </label>
                        <select
                          id="driver-b-select"
                          value={driverBData.driverId}
                          onChange={(e) => setCompareDriverB(e.target.value)}
                          className="bg-transparent text-white font-display font-bold text-xs cursor-pointer hover:text-amber-400 transition outline-none pr-1"
                        >
                          {currentStintDrivers.map(d => (
                            <option key={d.driverId} value={d.driverId} className="bg-slate-900 text-white">
                              {d.position ? `P${d.position} • ` : ''}{d.code} — {d.name} ({d.constructorName})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Duel Advantage Callout Banner */}
                {driverBData && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-white text-sm">
                        <span>🏆</span>
                        <span>
                          {driverAData.fuelCorrectedDegSecPerLap < driverBData.fuelCorrectedDegSecPerLap
                            ? `${driverAData.name} preserves tyres +${(driverBData.fuelCorrectedDegSecPerLap - driverAData.fuelCorrectedDegSecPerLap).toFixed(3)}s/lap better`
                            : `${driverBData.name} preserves tyres +${(driverAData.fuelCorrectedDegSecPerLap - driverBData.fuelCorrectedDegSecPerLap).toFixed(3)}s/lap better`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Over a {Math.min(driverAData.totalLaps, driverBData.totalLaps)}-lap stint, this tyre wear difference yields ~
                        <strong className="text-amber-400">
                          {(Math.abs(driverBData.fuelCorrectedDegSecPerLap - driverAData.fuelCorrectedDegSecPerLap) * Math.min(driverAData.totalLaps, driverBData.totalLaps)).toFixed(2)}s
                        </strong>{' '}
                        cumulative race time delta from rubber conservation alone.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-[11px]">
                      <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                        Base Pace: <strong className="text-white">{formatLapTime(driverAData.basePaceSec)}</strong> vs{' '}
                        <strong className="text-white">{formatLapTime(driverBData.basePaceSec)}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Side-by-Side Detailed Stint Profiles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
                {/* Driver A Card */}
                <div
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl"
                  style={{ borderLeftWidth: '6px', borderLeftColor: getTeamColor(driverAData.constructorId) }}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black font-display text-white">{driverAData.name}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-rose-300 font-bold text-xs">
                          {driverAData.code}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{driverAData.constructorName}</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 inline-block">
                        {driverAData.whispererScore} / 100 WHISPERER
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        L{driverAData.startLap}–L{driverAData.endLap} ({driverAData.totalLaps} Laps)
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 text-[10.5px] uppercase block font-bold">FASTEST STINT PACE</span>
                      <span className="text-sm font-black text-white block mt-0.5">{formatLapTime(driverAData.basePaceSec)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 text-[10.5px] uppercase block font-bold">FUEL-CORRECTED DEG</span>
                      <span className="text-sm font-black text-rose-400 block mt-0.5">+{driverAData.fuelCorrectedDegSecPerLap.toFixed(3)}s/lap</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 text-[10.5px] uppercase block font-bold">RAW TELEMETRY DEG</span>
                      <span className="text-sm font-black text-cyan-300 block mt-0.5">+{driverAData.rawDegSecPerLap.toFixed(3)}s/lap</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 text-[10.5px] uppercase block font-bold">CONSISTENCY (STD DEV)</span>
                      <span className="text-sm font-black text-slate-300 block mt-0.5">±{driverAData.consistencyStdSec.toFixed(3)}s</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-bold">THERMAL CLIFF STATUS:</span>
                    <span className={driverAData.cliffLapDetected ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {driverAData.cliffLapDetected ? `⚠️ Hit at Lap ${driverAData.cliffLapDetected} (+${driverAData.cliffSeveritySec}s)` : '✓ Controlled Plateau (No Cliff)'}
                    </span>
                  </div>
                </div>

                {/* Driver B Card */}
                {driverBData && (
                  <div
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl"
                    style={{ borderLeftWidth: '6px', borderLeftColor: getTeamColor(driverBData.constructorId) }}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black font-display text-white">{driverBData.name}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-rose-300 font-bold text-xs">
                            {driverBData.code}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{driverBData.constructorName}</div>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 inline-block">
                          {driverBData.whispererScore} / 100 WHISPERER
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          L{driverBData.startLap}–L{driverBData.endLap} ({driverBData.totalLaps} Laps)
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 text-[10.5px] uppercase block font-bold">FASTEST STINT PACE</span>
                        <span className="text-sm font-black text-white block mt-0.5">{formatLapTime(driverBData.basePaceSec)}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 text-[10.5px] uppercase block font-bold">FUEL-CORRECTED DEG</span>
                        <span className="text-sm font-black text-rose-400 block mt-0.5">+{driverBData.fuelCorrectedDegSecPerLap.toFixed(3)}s/lap</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 text-[10.5px] uppercase block font-bold">RAW TELEMETRY DEG</span>
                        <span className="text-sm font-black text-cyan-300 block mt-0.5">+{driverBData.rawDegSecPerLap.toFixed(3)}s/lap</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 text-[10.5px] uppercase block font-bold">CONSISTENCY (STD DEV)</span>
                        <span className="text-sm font-black text-slate-300 block mt-0.5">±{driverBData.consistencyStdSec.toFixed(3)}s</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-bold">THERMAL CLIFF STATUS:</span>
                      <span className={driverBData.cliffLapDetected ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {driverBData.cliffLapDetected ? `⚠️ Hit at Lap ${driverBData.cliffLapDetected} (+${driverBData.cliffSeveritySec}s)` : '✓ Controlled Plateau (No Cliff)'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Real Telemetry Pace & Tyre Degradation Chart */}
              {stintChartData && (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="font-display font-black text-base text-white uppercase">
                        STINT {selectedStintNumber === 0 ? 1 : selectedStintNumber} REAL TELEMETRY PACE &amp; TYRE DEGRADATION TRAJECTORY
                      </h4>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">
                        Solid lines &amp; points indicate observed race lap times. Dashed lines plot the fuel-corrected tyre wear degradation slope.
                      </p>
                    </div>
                    <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-1 rounded-full" style={{ background: getTeamColor(driverAData.constructorId) }}></span>
                        <strong className="text-white">{driverAData.code}</strong>
                      </span>
                      {driverBData && (
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-1 rounded-full" style={{ background: getTeamColor(driverBData.constructorId) }}></span>
                          <strong className="text-white">{driverBData.code}</strong>
                        </span>
                      )}
                      <span className="text-slate-500 hidden md:inline">• Baseline Deg Fuel Weight Offset: -0.055s/lap</span>
                    </div>
                  </div>

                  <div className="h-84 w-full relative">
                    <Line data={stintChartData} options={chartOptions} />
                  </div>
                </div>
              )}

              {/* Lap-by-Lap Telemetry Stint Comparison Table */}
              {stintLapComparison.length > 0 && (
                <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl space-y-0">
                  <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-rose-400 font-bold uppercase">LAP-BY-LAP STINT TELEMETRY COMPARISON:</span>
                      <span className="text-slate-400">Recorded lap times and instantaneous deltas</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Showing {stintLapComparison.length} Stint Laps
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-72 overflow-y-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="sticky top-0 z-10">
                        <tr className="border-b border-slate-800 bg-slate-900 text-[11px] text-slate-400 uppercase">
                          <th className="py-2.5 px-4 w-16 text-center">LAP</th>
                          <th className="py-2.5 px-4">
                            <span className="text-rose-300 font-bold">{driverAData.code}</span> TIME
                          </th>
                          {driverBData && (
                            <th className="py-2.5 px-4">
                              <span className="text-cyan-300 font-bold">{driverBData.code}</span> TIME
                            </th>
                          )}
                          {driverBData && <th className="py-2.5 px-4 text-center">LAP DELTA</th>}
                          {driverBData && <th className="py-2.5 px-4 text-center">CUMULATIVE GAP</th>}
                          <th className="py-2.5 px-4">DEGRADATION STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {stintLapComparison.map((row) => {
                          const isFastestA = row.timeSecA && row.timeSecA === driverAData.basePaceSec;
                          const isFastestB = driverBData && row.timeSecB && row.timeSecB === driverBData.basePaceSec;

                          return (
                            <tr key={row.lapNumber} className="hover:bg-slate-900/60 transition-colors">
                              <td className="py-2 px-4 text-center text-slate-400 font-bold">
                                L{row.lapNumber}
                              </td>

                              <td className="py-2 px-4">
                                <span className={isFastestA ? 'text-emerald-400 font-bold' : row.isOutlierA ? 'text-slate-500' : 'text-slate-200'}>
                                  {formatLapTime(row.timeSecA)}
                                </span>
                                {isFastestA && <span className="ml-1.5 text-[10px] text-emerald-400 uppercase font-bold">PB</span>}
                                {row.isOutlierA && <span className="ml-1.5 text-[10px] text-slate-500">(In/Out)</span>}
                              </td>

                              {driverBData && (
                                <td className="py-2 px-4">
                                  <span className={isFastestB ? 'text-emerald-400 font-bold' : row.isOutlierB ? 'text-slate-500' : 'text-slate-200'}>
                                    {formatLapTime(row.timeSecB)}
                                  </span>
                                  {isFastestB && <span className="ml-1.5 text-[10px] text-emerald-400 uppercase font-bold">PB</span>}
                                  {row.isOutlierB && <span className="ml-1.5 text-[10px] text-slate-500">(In/Out)</span>}
                                </td>
                              )}

                              {driverBData && (
                                <td className="py-2 px-4 text-center">
                                  {row.deltaSec !== null ? (
                                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                      row.deltaSec > 0
                                        ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                                        : row.deltaSec < 0
                                          ? 'bg-rose-950/50 text-rose-300 border border-rose-500/30'
                                          : 'text-slate-400'
                                    }`}>
                                      {row.deltaSec > 0 ? `${driverAData.code} -${row.deltaSec.toFixed(3)}s` : row.deltaSec < 0 ? `${driverBData.code} -${Math.abs(row.deltaSec).toFixed(3)}s` : 'LEVEL'}
                                    </span>
                                  ) : (
                                    <span className="text-slate-600">—</span>
                                  )}
                                </td>
                              )}

                              {driverBData && (
                                <td className="py-2 px-4 text-center font-bold">
                                  {row.cumulativeDelta !== 0 ? (
                                    <span className={row.cumulativeDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                      {row.cumulativeDelta > 0 ? `+${row.cumulativeDelta.toFixed(3)}s` : `${row.cumulativeDelta.toFixed(3)}s`}
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">0.000s</span>
                                  )}
                                </td>
                              )}

                              <td className="py-2 px-4 text-[11px]">
                                {driverAData.cliffLapDetected && row.lapNumber >= driverAData.cliffLapDetected ? (
                                  <span className="text-rose-400 font-semibold">⚠️ {driverAData.code} in Thermal Cliff</span>
                                ) : driverBData && driverBData.cliffLapDetected && row.lapNumber >= driverBData.cliffLapDetected ? (
                                  <span className="text-rose-400 font-semibold">⚠️ {driverBData.code} in Thermal Cliff</span>
                                ) : (
                                  <span className="text-slate-400">Nominal Wear Plateau</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 7. TAB 5: THERMAL SURFACE SENSITIVITY */}
      {!isLoading && activeTab === 'thermal' && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-2xl">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="font-display font-black text-lg text-white uppercase">
              ASPHALT TEMPERATURE &amp; THERMAL ANOMALY SENSITIVITY
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Simulate how track temperature changes trigger front graining or rear thermal blistering.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-white font-bold">Track Surface Temperature:</span>
              <span className="text-rose-400 font-bold text-sm">{trackTempC}°C</span>
            </div>
            <input
              type="range"
              min="20"
              max="55"
              step="1"
              value={trackTempC}
              onChange={(e) => setTrackTempC(parseInt(e.target.value, 10))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>20°C (Cold / Graining Hazard)</span>
              <span>38°C (Nominal Window)</span>
              <span>55°C (Extreme Blistering Hazard)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">FRONT COLD GRAINING RISK</span>
              <div className="text-lg font-black text-cyan-300">{thermalAnalysis.grainingRisk}%</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {thermalAnalysis.grainingRisk >= 50
                  ? 'Cold asphalt causes rubber tear & graining on front-left tire during high lateral loading.'
                  : 'Surface temp provides sufficient bulk thermal adhesion; minimal graining.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">REAR BLISTERING RISK</span>
              <div className="text-lg font-black text-rose-400">{thermalAnalysis.blisteringRisk}%</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {thermalAnalysis.blisteringRisk >= 60
                  ? 'High thermal energy causes carcass boiling and localized rubber blisters on rear traction zones.'
                  : 'Tread core remains inside nominal operating thermal window.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">THERMAL CLIFF SHIFT</span>
              <div className="text-lg font-black text-amber-300">
                {thermalAnalysis.cliffShiftLaps > 0 ? `+${thermalAnalysis.cliffShiftLaps}` : thermalAnalysis.cliffShiftLaps} Laps
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {thermalAnalysis.cliffShiftLaps < 0
                  ? `Thermal degradation advances the pit window ${Math.abs(thermalAnalysis.cliffShiftLaps)} laps earlier.`
                  : 'Low track temperature extends tire plateau longevity.'}
              </p>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
