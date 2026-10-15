import { LapRecord, PitStopItem } from '../types';
import { parseLapTime } from '../../utils/api';

/**
 * Raw lap item shape from Jolpica / Ergast API
 * e.g. { number: "1", Timings: [{ driverId: "hamilton", time: "1:32.405", position: "1" }] }
 */
export interface RawLapItem {
  number: string | number;
  Timings?: Array<{
    driverId: string;
    time: string;
    position?: string;
  }>;
}

/**
 * Processes raw API lap records into a strictly indexed array of LapRecords
 * spanning Lap 1 to totalLaps.
 *
 * CRITICAL INVARIANT:
 * Lap numbers are NEVER shifted when laps are missing, filtered, or flagged as outliers.
 * Element at index `i` ALWAYS represents race lap `i + 1`.
 */
export function buildContinuousLapRecords(
  totalLaps: number,
  rawLaps: RawLapItem[],
  driverId: string,
  pitStopLaps: number[] = [],
  outlierThresholdSec: number | null = null
): LapRecord[] {
  const safeTotalLaps = Math.max(1, totalLaps);
  const records: LapRecord[] = [];

  // Build a lookup map of lap number -> timing
  const lapMap = new Map<number, { timeStr: string; position?: number }>();

  rawLaps.forEach((l) => {
    const lapNum = typeof l.number === 'number' ? l.number : parseInt(l.number, 10);
    if (isNaN(lapNum) || lapNum < 1) return;

    const t = l.Timings?.find((tm) => tm.driverId === driverId);
    if (t?.time) {
      lapMap.set(lapNum, {
        timeStr: t.time,
        position: t.position ? parseInt(t.position, 10) : undefined
      });
    }
  });

  // Populate strictly 1 .. safeTotalLaps
  for (let lap = 1; lap <= safeTotalLaps; lap++) {
    const entry = lapMap.get(lap);
    const isPitStop = pitStopLaps.includes(lap);

    if (!entry) {
      records.push({
        lapNumber: lap,
        time: null,
        rawTime: undefined,
        position: undefined,
        isPitStop,
        isOutlier: true
      });
      continue;
    }

    const parsedSec = parseLapTime(entry.timeStr);
    const isOutlier =
      parsedSec === null ||
      parsedSec < 30 ||
      (outlierThresholdSec !== null && parsedSec > outlierThresholdSec);

    records.push({
      lapNumber: lap,
      time: parsedSec,
      rawTime: entry.timeStr,
      position: entry.position,
      isPitStop,
      isOutlier
    });
  }

  return records;
}

/**
 * Calculates head-to-head lap time deltas (Driver A minus Driver B)
 * strictly aligning matching lap numbers.
 *
 * Missing or excluded laps output null, preserving exact array alignment.
 */
export function computePaceDeltaArray(
  lapsA: LapRecord[],
  lapsB: LapRecord[],
  excludeOutliers: boolean = true
): (number | null)[] {
  const maxLaps = Math.max(lapsA.length, lapsB.length);
  const deltas: (number | null)[] = [];

  for (let i = 0; i < maxLaps; i++) {
    const recordA = lapsA[i];
    const recordB = lapsB[i];

    if (!recordA || !recordB) {
      deltas.push(null);
      continue;
    }

    if (excludeOutliers && (recordA.isOutlier || recordB.isOutlier)) {
      deltas.push(null);
      continue;
    }

    if (recordA.time !== null && recordB.time !== null) {
      // Positive delta means Driver A was slower than Driver B
      deltas.push(recordA.time - recordB.time);
    } else {
      deltas.push(null);
    }
  }

  return deltas;
}

/**
 * Derives statistical summary metrics from clean representative laps
 */
export function calculatePaceStatistics(
  laps: LapRecord[],
  excludeOutliers: boolean = true
): {
  cleanLapsCount: number;
  bestLapSec: number | null;
  avgCleanPaceSec: number | null;
  stdDevSec: number | null;
  consistencyScore: number | null;
} {
  const eligibleLaps = laps.filter((r) => {
    if (r.time === null || r.time <= 30) return false;
    if (excludeOutliers && (r.isOutlier || r.isPitStop)) return false;
    return true;
  });

  if (eligibleLaps.length === 0) {
    return {
      cleanLapsCount: 0,
      bestLapSec: null,
      avgCleanPaceSec: null,
      stdDevSec: null,
      consistencyScore: null
    };
  }

  const times = eligibleLaps.map((r) => r.time!);
  const bestLapSec = Math.min(...times);
  const avgCleanPaceSec = times.reduce((sum, t) => sum + t, 0) / times.length;

  // Standard deviation
  const variance =
    times.reduce((acc, t) => acc + Math.pow(t - avgCleanPaceSec, 2), 0) /
    times.length;
  const stdDevSec = Math.sqrt(variance);

  // Consistency score: higher is more consistent (lower coefficient of variation)
  const cvPct = (stdDevSec / avgCleanPaceSec) * 100;
  const consistencyScore = Math.max(0, Math.min(100, 100 - cvPct));

  return {
    cleanLapsCount: eligibleLaps.length,
    bestLapSec,
    avgCleanPaceSec,
    stdDevSec,
    consistencyScore
  };
}

/**
 * Calculates fuel-corrected lap time based on standard F1 engineering burnoff (~0.055s/lap)
 */
export function computeFuelCorrectedPace(
  lapTime: number,
  lapNumber: number,
  totalRaceLaps: number,
  fuelBurnRateSecPerLap: number = 0.055
): number {
  // At lap 1, fuel penalty is maximum. At final lap, car is at empty minimum weight.
  // Correction normalizes every lap to an empty tank baseline.
  const remainingLaps = Math.max(0, totalRaceLaps - lapNumber);
  const weightPenalty = remainingLaps * fuelBurnRateSecPerLap;
  return lapTime - weightPenalty;
}

/**
 * Parses and maps raw pit stops into typed PitStopItem models
 */
export function parsePitStops(
  rawPitStops: Array<{
    driverId: string;
    lap: string;
    stop: string;
    duration?: string;
    time?: string;
  }>,
  driversList: Array<{
    driverId: string;
    code: string;
    givenName: string;
    familyName: string;
    constructorName: string;
    constructorId?: string;
  }>
): PitStopItem[] {
  const driverLookup = new Map(driversList.map((d) => [d.driverId, d]));

  return rawPitStops
    .map((p) => {
      const driver = driverLookup.get(p.driverId);
      const lapNum = parseInt(p.lap, 10) || 0;
      const stopNum = parseInt(p.stop, 10) || 1;
      const rawDur = p.duration || '';

      let durationSec: number | null = null;
      if (rawDur) {
        const parsed = parseFloat(rawDur);
        if (!isNaN(parsed) && parsed > 0) {
          durationSec = parsed;
        } else {
          const match = rawDur.match(/^(\d+):(\d+(?:\.\d+)?)$/);
          if (match) {
            durationSec = parseInt(match[1], 10) * 60 + parseFloat(match[2]);
          }
        }
      }

      return {
        driverId: p.driverId,
        driverCode: driver?.code || p.driverId.slice(0, 3).toUpperCase(),
        driverName: driver ? `${driver.givenName} ${driver.familyName}` : p.driverId,
        constructorName: driver?.constructorName || 'Constructor',
        constructorId: driver?.constructorId || 'unknown',
        lap: lapNum,
        stopNumber: stopNum,
        durationSec,
        rawDuration: rawDur,
        timeOfDay: p.time
      };
    })
    .sort((a, b) => a.lap - b.lap);
}
