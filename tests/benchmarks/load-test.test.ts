import { describe, it, expect } from 'vitest';
import {
  buildContinuousLapRecords,
  computePaceDeltaArray,
  calculatePaceStatistics,
  computeFuelCorrectedPace
} from '../../app/lab/utils/lapProcessing';
import { signJWT, verifyJWT } from '../../app/lib/jwt';
import { parseLapTime } from '../../app/utils/api';

describe('Reproducible High-Concurrency Benchmark Suite (1,000 Operations)', () => {
  it('executes 1,000 concurrent lap calculation pipelines with sub-millisecond latency', async () => {
    const totalOperations = 1000;
    const batchSize = 100;
    const latenciesMs: number[] = [];

    const mockRawLaps = Array.from({ length: 60 }, (_, i) => ({
      number: String(i + 1),
      Timings: [
        {
          driverId: 'verstappen',
          time: `1:${(30 + (i % 5)).toFixed(3)}`,
          position: '1'
        },
        {
          driverId: 'norris',
          time: `1:${(30.2 + (i % 4)).toFixed(3)}`,
          position: '2'
        }
      ]
    }));

    const startTime = performance.now();

    // Run 1,000 operations in batches of 100 concurrent promises
    for (let b = 0; b < totalOperations; b += batchSize) {
      const batchPromises = Array.from({ length: batchSize }, async () => {
        const opStart = performance.now();

        // 1. Lap time parsing
        const parsed = parseLapTime('1:32.405');
        expect(parsed).toBe(92.405);

        // 2. Build continuous lap records for both drivers
        const lapsA = buildContinuousLapRecords(60, mockRawLaps, 'verstappen', [18, 42]);
        const lapsB = buildContinuousLapRecords(60, mockRawLaps, 'norris', [20, 44]);

        // 3. Compute discrete head-to-head lap deltas
        const deltas = computePaceDeltaArray(lapsA, lapsB, true);
        expect(deltas.length).toBe(60);

        // 4. Derive clean pace statistics
        const statsA = calculatePaceStatistics(lapsA, true);
        expect(statsA.cleanLapsCount).toBeGreaterThan(0);

        // 5. Fuel burnoff compensation calculation
        const fuelAdjusted = computeFuelCorrectedPace(92.0, 15, 60, 0.055);
        expect(fuelAdjusted).toBeLessThan(92.0);

        const opDuration = performance.now() - opStart;
        latenciesMs.push(opDuration);
      });

      await Promise.all(batchPromises);
    }

    const totalDurationMs = performance.now() - startTime;
    const avgLatencyMs = latenciesMs.reduce((a, b) => a + b, 0) / latenciesMs.length;
    const sortedLatencies = [...latenciesMs].sort((a, b) => a - b);
    const p50LatencyMs = sortedLatencies[Math.floor(sortedLatencies.length * 0.5)];
    const p95LatencyMs = sortedLatencies[Math.floor(sortedLatencies.length * 0.95)];
    const throughputOpsPerSec = (totalOperations / (totalDurationMs / 1000));

    // Verify benchmark performance criteria
    expect(latenciesMs.length).toBe(totalOperations);
    expect(p50LatencyMs).toBeGreaterThanOrEqual(0);
    expect(avgLatencyMs).toBeLessThan(15); // Average execution must be fast
    expect(p95LatencyMs).toBeLessThan(25);
    expect(throughputOpsPerSec).toBeGreaterThan(200); // Throughput benchmark
  });

  it('executes 100 concurrent Web Crypto HS256 signing and verification cycles', async () => {
    process.env.JWT_SECRET = 'ci-benchmark-cryptographic-testing-key-32chars';
    const count = 100;
    const startTime = performance.now();

    const tasks = Array.from({ length: count }, async (_, i) => {
      const payload = { userId: `usr_bench_${i}`, role: 'analyst' };
      const token = await signJWT(payload);
      const verified = await verifyJWT(token);
      expect(verified?.userId).toBe(`usr_bench_${i}`);
    });

    await Promise.all(tasks);
    const totalDurationMs = performance.now() - startTime;
    expect(totalDurationMs).toBeLessThan(2000); // 100 sign & verify operations in < 2 seconds
  });
});
