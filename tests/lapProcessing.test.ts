import { describe, it, expect } from 'vitest';
import {
  buildContinuousLapRecords,
  computePaceDeltaArray,
  calculatePaceStatistics,
  computeFuelCorrectedPace,
  parsePitStops,
  calculateMedianPitDuration,
  calculateStintWearSlope,
  calculateAdaptiveOutlierThreshold,
  qualifyStintCompound
} from '../app/lab/utils/lapProcessing';

describe('lapProcessing — P0 Lap Index Integrity & Correctness', () => {
  it('strictly preserves lap numbers from 1 to totalLaps without index shifting', () => {
    // Simulate raw laps where Lap 2 and Lap 4 are missing from API or filtered
    const rawLaps = [
      { number: '1', Timings: [{ driverId: 'norris', time: '1:30.000', position: '1' }] },
      { number: '3', Timings: [{ driverId: 'norris', time: '1:30.500', position: '1' }] },
      { number: '5', Timings: [{ driverId: 'norris', time: '1:31.000', position: '1' }] },
    ];

    const records = buildContinuousLapRecords(5, rawLaps, 'norris', [3]);

    // Array length must match total race laps exactly
    expect(records.length).toBe(5);

    // Each element at index i must have lapNumber === i + 1
    records.forEach((rec, idx) => {
      expect(rec.lapNumber).toBe(idx + 1);
    });

    // Lap 1: present
    expect(records[0].time).toBe(90.0);
    expect(records[0].isPitStop).toBe(false);
    expect(records[0].isOutlier).toBe(false);

    // Lap 2: missing from feed, must be null, NOT shift Lap 3 to index 1!
    expect(records[1].time).toBeNull();
    expect(records[1].isOutlier).toBe(true);

    // Lap 3: present, is a pit stop
    expect(records[2].time).toBe(90.5);
    expect(records[2].isPitStop).toBe(true);

    // Lap 4: missing
    expect(records[3].time).toBeNull();

    // Lap 5: present at index 4, NOT at index 2
    expect(records[4].time).toBe(91.0);
    expect(records[4].lapNumber).toBe(5);
  });

  it('correctly calculates head-to-head lap deltas without comparing mismatched laps', () => {
    // Driver A has Laps 1, 2, 3
    const lapsA = [
      { lapNumber: 1, time: 90.0, isOutlier: false },
      { lapNumber: 2, time: null, isOutlier: true }, // Driver A pit / missing
      { lapNumber: 3, time: 91.0, isOutlier: false },
    ];

    // Driver B has Laps 1, 2, 3
    const lapsB = [
      { lapNumber: 1, time: 89.5, isOutlier: false },
      { lapNumber: 2, time: 90.0, isOutlier: false },
      { lapNumber: 3, time: 91.5, isOutlier: false },
    ];

    const deltas = computePaceDeltaArray(lapsA, lapsB, true);

    expect(deltas.length).toBe(3);
    // Lap 1: 90.0 - 89.5 = +0.5 (A is 0.5s slower)
    expect(deltas[0]).toBeCloseTo(0.5, 3);
    // Lap 2: A is null / outlier, delta must be null, NOT comparing A's Lap 3 with B's Lap 2!
    expect(deltas[1]).toBeNull();
    // Lap 3: 91.0 - 91.5 = -0.5 (A is 0.5s faster)
    expect(deltas[2]).toBeCloseTo(-0.5, 3);
  });

  it('derives accurate statistical summary metrics from clean representative laps', () => {
    const laps = [
      { lapNumber: 1, time: 92.0, isOutlier: false, isPitStop: false },
      { lapNumber: 2, time: 90.0, isOutlier: false, isPitStop: false },
      { lapNumber: 3, time: 135.0, isOutlier: true, isPitStop: false }, // Red flag / slow lap
      { lapNumber: 4, time: 115.0, isOutlier: false, isPitStop: true }, // Pit stop
      { lapNumber: 5, time: 91.0, isOutlier: false, isPitStop: false },
    ];

    const stats = calculatePaceStatistics(laps, true);

    // Eligible laps are 1, 2, 5 (times: 92.0, 90.0, 91.0)
    expect(stats.cleanLapsCount).toBe(3);
    expect(stats.bestLapSec).toBe(90.0);
    expect(stats.avgCleanPaceSec).toBeCloseTo(91.0, 3);
    expect(stats.stdDevSec).toBeCloseTo(0.816, 2);
    expect(stats.consistencyScore).toBeGreaterThan(95);
  });

  it('applies fuel burnoff compensation correctly', () => {
    // Lap 10 of a 50-lap race: 40 laps of fuel remaining (40 * 0.055 = 2.2s penalty)
    const rawTime = 95.0;
    const corrected = computeFuelCorrectedPace(rawTime, 10, 50, 0.055);
    expect(corrected).toBeCloseTo(95.0 - 2.2, 3);

    // Final lap (50 of 50): 0 laps of fuel remaining
    const finalLapCorrected = computeFuelCorrectedPace(rawTime, 50, 50, 0.055);
    expect(finalLapCorrected).toBe(rawTime);
  });

  it('parses raw pit stops into sorted structured models', () => {
    const rawPitStops = [
      { driverId: 'verstappen', lap: '32', stop: '2', duration: '2.40' },
      { driverId: 'verstappen', lap: '15', stop: '1', duration: '2.31' },
      { driverId: 'norris', lap: '16', stop: '1', duration: '2.19' },
    ];
    const drivers = [
      { driverId: 'verstappen', code: 'VER', givenName: 'Max', familyName: 'Verstappen', constructorName: 'Red Bull' },
      { driverId: 'norris', code: 'NOR', givenName: 'Lando', familyName: 'Norris', constructorName: 'McLaren' },
    ];

    const parsed = parsePitStops(rawPitStops, drivers);

    expect(parsed.length).toBe(3);
    // Must be sorted by lap number ascending
    expect(parsed[0].lap).toBe(15);
    expect(parsed[0].driverCode).toBe('VER');
    expect(parsed[0].durationSec).toBe(2.31);

    expect(parsed[1].lap).toBe(16);
    expect(parsed[1].driverCode).toBe('NOR');
    expect(parsed[1].durationSec).toBe(2.19);

    expect(parsed[2].lap).toBe(32);
    expect(parsed[2].stopNumber).toBe(2);
  });

  it('calculates true mathematical median for odd and even sample sizes without synthetic defaults', () => {
    // Odd sample: [2.10, 2.40, 2.90] -> 2.40
    const oddStops: any[] = [
      { durationSec: 2.90 },
      { durationSec: 2.10 },
      { durationSec: 2.40 },
    ];
    expect(calculateMedianPitDuration(oddStops)).toBe(2.40);

    // Even sample: [2.10, 2.30, 2.50, 3.10] -> (2.30 + 2.50)/2 = 2.40
    const evenStops: any[] = [
      { durationSec: 3.10 },
      { durationSec: 2.10 },
      { durationSec: 2.50 },
      { durationSec: 2.30 },
    ];
    expect(calculateMedianPitDuration(evenStops)).toBe(2.40);

    // Null and missing durations must be excluded, never replaced with 2.8s
    const mixedStops: any[] = [
      { durationSec: null },
      { durationSec: 2.20 },
      { durationSec: null },
      { durationSec: 2.60 },
    ];
    expect(calculateMedianPitDuration(mixedStops)).toBe(2.40);

    // All null returns null, NOT 2.80
    const emptyStops: any[] = [{ durationSec: null }, { durationSec: undefined }];
    expect(calculateMedianPitDuration(emptyStops)).toBeNull();
  });

  it('calculates stint wear slope using true race lap coordinates without gap distortion', () => {
    // 3 clean laps: Lap 10 @ 90.0, Lap 15 @ 90.5, Lap 20 @ 91.0 (gap of 5 laps each)
    // Rate of degradation: (91.0 - 90.0) / (20 - 10) = 0.10 s/lap
    const cleanLaps = [
      { lapNumber: 10, time: 90.0 },
      { lapNumber: 15, time: 90.5 },
      { lapNumber: 20, time: 91.0 },
    ];

    const result = calculateStintWearSlope(cleanLaps, 0.055);
    expect(result.rawSlope).toBeCloseTo(0.10, 3);
    // Fuel corrected: 0.10 + 0.055 = 0.155 s/lap
    expect(result.fuelCorrectedSlope).toBeCloseTo(0.155, 3);
  });

  it('calculates adaptive outlier threshold without hardcoded floor distortion', () => {
    // Short track scenario (e.g. Red Bull Ring ~65s): median pace 65s
    const shortTrackLaps: any[] = [
      { time: 64.8 },
      { time: 65.0 },
      { time: 65.2 },
    ];
    const threshold = calculateAdaptiveOutlierThreshold(shortTrackLaps, 1.07);
    // Threshold should be max(65 * 1.07 = 69.55, 65 + 7 = 72.0) = 72.0s
    expect(threshold).toBe(72.0);
    // Must NOT enforce an arbitrary 92.0s floor that would allow 27s slow laps!
    expect(threshold).toBeLessThan(80);
  });

  it('qualifies stint compound provenance accurately', () => {
    // Official allocation provided
    const official = qualifyStintCompound(20, 'SOFT');
    expect(official.compound).toBe('SOFT');
    expect(official.isEstimated).toBe(false);
    expect(official.provenance).toContain('Official');

    // Unverified length heuristic
    const heuristic = qualifyStintCompound(12, undefined);
    expect(heuristic.compound).toBe('SOFT');
    expect(heuristic.isEstimated).toBe(true);
    expect(heuristic.provenance).toContain('Estimated');
  });
});
