import { describe, it, expect, beforeAll } from 'vitest';
import { NextRequest } from 'next/server';
import {
  getRacePrediction,
  parseAndValidateRaceId,
  validatePredictionInvariants,
  RacePredictionResponse
} from '../app/lib/racePredictorService';
import { GET } from '../app/api/predictions/race/[raceId]/route';
import { signJWT } from '../app/lib/jwt';

describe('Paddock Race Predictor — Backend and API Integration', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-paddock-super-secure-key-32chars';
  });

  it('parses and standardizes raceId formats correctly', () => {
    expect(parseAndValidateRaceId('2024_1')).toEqual({ canonicalRaceId: '2024_1', season: 2024, round: 1 });
    expect(parseAndValidateRaceId('2024-5')).toEqual({ canonicalRaceId: '2024_5', season: 2024, round: 5 });
    expect(parseAndValidateRaceId('2024/12')).toEqual({ canonicalRaceId: '2024_12', season: 2024, round: 12 });
    expect(() => parseAndValidateRaceId('invalid')).toThrow();
  });

  // 1. Valid Race Requests
  it('handles valid race requests and returns complete post-qualifying predictions', async () => {
    const res = await getRacePrediction('2024_1');

    expect(res.status).toBe('success');
    expect(res.predictionStage).toBe('after_qualifying');
    expect(res.season).toBe(2024);
    expect(res.round).toBe(1);
    expect(res.circuitId).toBe('bahrain');
    expect(res.modelVersion).toBe('v1.0.0');
    expect(res.featureSchemaVersion).toBe('1.0.0');

    // Winner prediction
    expect(res.predictedWinner).not.toBeNull();
    expect(res.predictedWinner?.driverCode).toBe('VER');
    expect(res.predictedWinner?.winProbability).toBeGreaterThan(0.5);

    // Driver field
    expect(res.predictions.length).toBe(20);
    expect(res.predictions[0].predictedRank).toBe(1);
    expect(res.predictions[19].predictedRank).toBe(20);

    // Explanatory factors
    expect(res.topExplanatoryFactors.length).toBeGreaterThan(0);
    expect(res.topExplanatoryFactors[0].feature).toBe('grid_position');
    expect(res.causalDisclaimer).toContain('statistical associations');
  });

  // 2. Unknown Races
  it('returns unavailable status for unknown or unrecorded races', async () => {
    const res = await getRacePrediction('1950_99');

    expect(res.status).toBe('unavailable');
    expect(res.error).toBe('RACE_NOT_FOUND');
    expect(res.predictedWinner).toBeNull();
    expect(res.predictions.length).toBe(0);
  });

  // 3. Qualifying Not Completed
  it('safely handles upcoming / unheld races where qualifying is not completed', async () => {
    const res = await getRacePrediction('2026_99');

    expect(res.status).toBe('unavailable');
    expect(res.qualifyingStatus.isCompleted).toBe(false);
    expect(res.qualifyingStatus.freshness).toBe('not_started');
    expect(res.message).toBeDefined();
  });

  // 4. Stale or Incomplete Data Detection
  it('rejects incomplete fields without fabricating confident forecasts', () => {
    const invalidPayload: RacePredictionResponse = {
      status: 'success',
      raceId: '2024_1',
      season: 2024,
      round: 1,
      circuitId: 'bahrain',
      circuitName: 'Bahrain',
      predictionStage: 'after_qualifying',
      generatedAtUtc: new Date().toISOString(),
      modelVersion: 'v1.0.0',
      featureSchemaVersion: '1.0.0',
      inputHash: 'abc',
      qualifyingStatus: {
        isCompleted: true,
        freshness: 'historical',
        totalClassified: 0,
        hasPenaltiesApplied: false,
        dataCompletenessPct: 0
      },
      predictedWinner: null,
      predictions: [],
      topExplanatoryFactors: [],
      cached: false,
      causalDisclaimer: ''
    };

    expect(() => validatePredictionInvariants(invalidPayload)).toThrow('No driver predictions found');
  });

  // 5. Grid Penalties and Driver Substitutions
  it('captures grid penalties and driver substitutions in verified fields', async () => {
    // Round 2 (Saudi Arabia 2024): Bearman substituted for Sainz at Ferrari
    const res = await getRacePrediction('2024_2');

    expect(res.status).toBe('success');
    const bearman = res.predictions.find(d => d.driverCode === 'BEA');
    expect(bearman).toBeDefined();
    expect(bearman?.constructorId).toBe('ferrari');
    expect(bearman?.gridPosition).toBe(11);
  });

  // 6. Probability Normalization Invariants
  it('enforces that probabilities strictly sum to 1.0 and are finite [0, 1]', async () => {
    const res = await getRacePrediction('2024_1');

    const totalProbability = res.predictions.reduce((acc, d) => acc + d.winProbability, 0);
    expect(Math.abs(totalProbability - 1.0)).toBeLessThan(0.005);

    for (const d of res.predictions) {
      expect(d.winProbability).toBeGreaterThanOrEqual(0.0);
      expect(d.winProbability).toBeLessThanOrEqual(1.0);
      expect(isFinite(d.winProbability)).toBe(true);
    }
  });

  it('detects unnormalized or non-finite probabilities during validation', () => {
    const corruptResponse: RacePredictionResponse = {
      status: 'success',
      raceId: '2024_1',
      season: 2024,
      round: 1,
      circuitId: 'bahrain',
      circuitName: 'Bahrain',
      predictionStage: 'after_qualifying',
      generatedAtUtc: new Date().toISOString(),
      modelVersion: 'v1.0.0',
      featureSchemaVersion: '1.0.0',
      inputHash: 'abc',
      qualifyingStatus: {
        isCompleted: true,
        freshness: 'historical',
        totalClassified: 2,
        hasPenaltiesApplied: false,
        dataCompletenessPct: 100
      },
      predictedWinner: {
        driverId: 'verstappen',
        driverCode: 'VER',
        winProbability: 0.9,
        winProbabilityPct: 90,
        constructorName: 'Red Bull',
        gridPosition: 1
      },
      predictions: [
        {
          driverId: 'verstappen',
          driverCode: 'VER',
          driverNumber: '1',
          constructorId: 'red_bull',
          constructorName: 'Red Bull',
          gridPosition: 1,
          qualiPosition: 1,
          gridPenaltyDelta: 0,
          winProbability: 0.9,
          winProbabilityPct: 90,
          predictedRank: 1
        },
        {
          driverId: 'norris',
          driverCode: 'NOR',
          driverNumber: '4',
          constructorId: 'mclaren',
          constructorName: 'McLaren',
          gridPosition: 2,
          qualiPosition: 2,
          gridPenaltyDelta: 0,
          winProbability: 0.4, // Total is 1.3 != 1.0
          winProbabilityPct: 40,
          predictedRank: 2
        }
      ],
      topExplanatoryFactors: [],
      cached: false,
      causalDisclaimer: ''
    };

    expect(() => validatePredictionInvariants(corruptResponse)).toThrow('expected 1.0');
  });

  // 7. Authorization & Invalid Input Testing on API Route
  it('rejects tampered or invalid JWT tokens with HTTP 401', async () => {
    const req = new NextRequest('http://localhost:3000/api/predictions/race/2024_1', {
      headers: {
        authorization: 'Bearer bad.token.signature'
      }
    });

    const response = await GET(req, { params: Promise.resolve({ raceId: '2024_1' }) });
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('INVALID_TOKEN');
  });

  it('accepts valid authenticated engineer tokens', async () => {
    const validToken = await signJWT({
      sub: 'usr_f1_engineer',
      role: 'engineer',
      name: 'Trackside Aerodynamicist'
    });

    const req = new NextRequest('http://localhost:3000/api/predictions/race/2024_1', {
      headers: {
        authorization: `Bearer ${validToken}`
      }
    });

    const response = await GET(req, { params: Promise.resolve({ raceId: '2024_1' }) });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('success');
  });

  it('rejects invalid or malformed race IDs with HTTP 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/predictions/race/invalid-id');
    const response = await GET(req, { params: Promise.resolve({ raceId: 'invalid-id' }) });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('INVALID_RACE_ID');
  });

  // 8. Caching and Snapshot Immutability
  it('returns cached prediction on subsequent requests', async () => {
    // First call (populates cache)
    const first = await getRacePrediction('2024_1');
    expect(first.status).toBe('success');

    // Second call (hits cache)
    const second = await getRacePrediction('2024_1');
    expect(second.cached).toBe(true);
    expect(second.inputHash).toBe(first.inputHash);
    expect(second.predictedWinner?.driverId).toBe(first.predictedWinner?.driverId);
  });

  // 9. Cache Invalidation via ?refresh=true
  it('forces re-evaluation when forceRefresh is requested', async () => {
    const refreshed = await getRacePrediction('2024_1', { forceRefresh: true });
    expect(refreshed.status).toBe('success');
    expect(refreshed.cached).toBe(false);
  });

  // 10. Concurrency Deduplication Guard
  it('prevents duplicate concurrent prediction runs for the same race', async () => {
    const p1 = getRacePrediction('2024_3');
    const p2 = getRacePrediction('2024_3');

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1.raceId).toBe(r2.raceId);
    expect(r1.predictedWinner?.driverId).toBe(r2.predictedWinner?.driverId);
  });

  // 11. Modern 2026 Active Championship Pre-Qualifying Holding State
  it('holds 2026 upcoming Austin (R18) and Mexico (R19) races strictly in authentic pre-qualifying state', async () => {
    const req18 = new NextRequest('http://localhost:3000/api/predictions/race/2026_18');
    const response18 = await GET(req18, { params: Promise.resolve({ raceId: '2026_18' }) });
    expect(response18.status).toBe(200);
    const body18 = await response18.json();
    expect(body18.status).toBe('unavailable');
    expect(body18.error).toBe('QUALIFYING_NOT_COMPLETED');
    expect(body18.circuitId).toBe('americas');
    expect(body18.qualifyingStatus.isCompleted).toBe(false);

    const req19 = new NextRequest('http://localhost:3000/api/predictions/race/2026_19');
    const response19 = await GET(req19, { params: Promise.resolve({ raceId: '2026_19' }) });
    expect(response19.status).toBe(200);
    const body19 = await response19.json();
    expect(body19.status).toBe('unavailable');
    expect(body19.error).toBe('QUALIFYING_NOT_COMPLETED');
    expect(body19.circuitId).toBe('rodriguez');
    expect(body19.qualifyingStatus.isCompleted).toBe(false);
  });

  // 12. Accuracy Matching with Official Actual Race Results
  it('matches calibrated post-qualifying predictions with actual race finishes for completed rounds', async () => {
    const { getOfficialRaceResults } = await import('../app/lib/raceResultsService');
    const results = await getOfficialRaceResults('2024', '1');

    expect(results.actualWinnerCode).toBe('VER');
    expect(results.actualResults['VER']).toBe(1);
    expect(results.actualResults['PER']).toBe(2);
    expect(results.actualResults['SAI']).toBe(3);

    // Verify prediction matching
    const prediction = await getRacePrediction('2024_1');
    expect(prediction.status).toBe('success');
    expect(prediction.predictedWinner?.driverCode).toBe(results.actualWinnerCode);
    expect(prediction.predictedWinner?.driverCode).toBe('VER');
  });

  // 13. Historical Circuit Heritage Leakage Prevention
  it('strictly excludes target race outcome and future years from historical circuit heritage', async () => {
    // 2024 Round 1 (Bahrain): 2024 winner must NOT appear in pastWinners
    const pred2024 = await getRacePrediction('2024_1');
    expect(pred2024.status).toBe('success');
    const pastWinners2024 = pred2024.circuitHeritage?.pastWinners || [];
    for (const w of pastWinners2024) {
      expect(w.year).toBeLessThan(2024);
    }

    // 2021 Round 1 (Bahrain - earliest season in dataset): zero prior winners should be found
    const pred2021 = await getRacePrediction('2021_1');
    expect(pred2021.status).toBe('success');
    const pastWinners2021 = pred2021.circuitHeritage?.pastWinners || [];
    expect(pastWinners2021.length).toBe(0);
  });

  // 14. Fallback Behavior When Python Executable Is Unavailable
  it('reliably falls back to disk snapshot or calibrated engine when python execution is unavailable', async () => {
    const originalBin = process.env.PYTHON_BIN;
    try {
      // Point to an invalid executable path
      process.env.PYTHON_BIN = 'C:\\non_existent_python_path\\python.exe';
      const fallbackPred = await getRacePrediction('2024_1', { forceRefresh: true });

      // Must not crash or throw; should recover with a valid, compliant prediction
      expect(fallbackPred).toBeDefined();
      expect(['success', 'unavailable']).toContain(fallbackPred.status);
      if (fallbackPred.status === 'success') {
        const sumProb = fallbackPred.predictions.reduce((acc, d) => acc + d.winProbability, 0);
        expect(Math.abs(sumProb - 1.0)).toBeLessThan(0.005);
      }
    } finally {
      process.env.PYTHON_BIN = originalBin;
    }
  });

  // 15. Phase 3C.4F.4 Hybrid Snapshot Discovery & API Contract
  it('discovers and validates 2025 Round 1 hybrid snapshot with 3-probability breakdown and dual hashes', async () => {
    const res = await getRacePrediction('2025_1');

    expect(res.status).toBe('success');
    expect(res.season).toBe(2025);
    expect(res.round).toBe(1);
    expect(res.circuitId).toBe('albert_park');
    expect(res.modelVersion).toBe('v1.0.0');
    expect(res.hybridFormulaVersion).toBe('geometric-w0.20-v1');
    expect(res.baselineVersion).toBe('grid-empirical-laplace-a1');
    expect(res.experimentalStatus).toBe('EXPERIMENTAL_NON_PRODUCTION');
    expect(res.rankingOrderSemantic).toBe('Predicted Win Probability Order');

    // Dual hashes
    expect(res.inferenceInputHash).toBeDefined();
    expect(res.inferenceInputHash?.length).toBe(64);
    expect(res.predictionOutputHash).toBeDefined();
    expect(res.predictionOutputHash?.length).toBe(64);
    expect(res.inputHash).toBe(res.inferenceInputHash?.slice(0, 16));

    // Winner prediction matching
    expect(res.predictedWinner).not.toBeNull();
    expect(res.predictedWinner?.driverId).toBe('norris');
    expect(res.predictedWinner?.driverCode).toBe('NOR');
    expect(res.predictions[0].driverId).toBe('norris');
    expect(res.predictedWinner?.winProbability).toBe(res.predictions[0].winProbability);

    // Predictions array with 3 probabilities
    expect(res.predictions.length).toBe(20);
    for (const p of res.predictions) {
      // 3 probabilities present
      expect(p.grid_baseline_probability).toBeDefined();
      expect(p.gridBaselineProbability).toBeDefined();
      expect(p.ml_win_probability).toBeDefined();
      expect(p.mlWinProbability).toBeDefined();
      expect(p.hybrid_win_probability).toBeDefined();
      expect(p.hybridWinProbability).toBeDefined();

      // winProbability matches hybrid probability
      expect(p.winProbability).toBe(p.hybrid_win_probability);

      // Value bounds
      expect(p.grid_baseline_probability!).toBeGreaterThanOrEqual(0.0005);
      expect(p.ml_win_probability!).toBeGreaterThanOrEqual(0.0);
      expect(p.hybrid_win_probability!).toBeGreaterThanOrEqual(0.0005);
    }

    // Probability sums
    const sumGrid = res.predictions.reduce((acc, p) => acc + (p.grid_baseline_probability || 0), 0);
    const sumMl = res.predictions.reduce((acc, p) => acc + (p.ml_win_probability || 0), 0);
    const sumHybrid = res.predictions.reduce((acc, p) => acc + p.winProbability, 0);

    expect(Math.abs(sumGrid - 1.0)).toBeLessThan(0.005);
    expect(Math.abs(sumMl - 1.0)).toBeLessThan(0.005);
    expect(Math.abs(sumHybrid - 1.0)).toBeLessThan(0.005);
  });

  it('discovers and validates 2025 Round 2 Shanghai hybrid snapshot', async () => {
    const res = await getRacePrediction('2025_2');

    expect(res.status).toBe('success');
    expect(res.season).toBe(2025);
    expect(res.round).toBe(2);
    expect(res.circuitId).toBe('shanghai');
    expect(res.hybridFormulaVersion).toBe('geometric-w0.20-v1');
    expect(res.predictions.length).toBe(20);
  });

  it('preserves 2026 Round 1 regulation era warning on hybrid snapshot', async () => {
    const res = await getRacePrediction('2026_1');

    expect(res.status).toBe('success');
    expect(res.season).toBe(2026);
    expect(res.round).toBe(1);
    expect(res.circuitId).toBe('albert_park');
    expect(res.hybridFormulaVersion).toBe('geometric-w0.20-v1');
    expect(res.regulationEraWarning).toBeDefined();
    expect(res.regulationEraWarning?.warningCode).toBe('UNVALIDATED_2026_REGULATIONS');
    expect(res.regulationEraWarning?.disclaimer).toContain('2026 active aerodynamics');
  });

  it('serves hybrid snapshot through NextRequest GET route with stage filter', async () => {
    const req = new NextRequest('http://localhost:3000/api/predictions/race/2025_1?stage=provisional');
    const response = await GET(req, { params: Promise.resolve({ raceId: '2025_1' }) });

    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body.status).toBe('success');
    expect(body.hybridFormulaVersion).toBe('geometric-w0.20-v1');
    expect(body.experimentalStatus).toBe('EXPERIMENTAL_NON_PRODUCTION');
    expect(body.rankingOrderSemantic).toBe('Predicted Win Probability Order');
    expect(body.predictions[0].grid_baseline_probability).toBeDefined();
    expect(body.predictions[0].ml_win_probability).toBeDefined();
    expect(body.predictions[0].hybrid_win_probability).toBeDefined();
  });
}, 30000);
