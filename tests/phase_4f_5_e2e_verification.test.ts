import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { NextRequest } from 'next/server';
import {
  getRacePrediction,
  loadAndValidateDiskSnapshot,
  validateSnapshot,
  validatePredictionInvariants,
  compareSnapshotPrecedence,
  RacePredictionResponse,
  FROZEN_MODEL_BUNDLE_SHA256,
  MODEL_VERSION
} from '../app/lib/racePredictorService';
import { GET } from '../app/api/predictions/race/[raceId]/route';

describe('Phase 3C.4F.5 — End-to-End Local Prediction Verification', () => {
  const projectRoot = process.cwd();
  const dryRunFixturePath = path.join(
    projectRoot,
    'artifacts',
    'dry_run_snapshots',
    '2025_1_albert_park_provisional_v1.0.0_hybrid_56947b913051836c.json'
  );

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-paddock-super-secure-key-32chars';
    expect(fs.existsSync(dryRunFixturePath)).toBe(true);
  });

  // --------------------------------------------------------------------------
  // 1. Full 10-Step Local End-to-End Pipeline Verification
  // --------------------------------------------------------------------------
  it('executes the full 10-step end-to-end prediction flow from disk fixture to API route and client data contract', async () => {
    // Step 1: Read raw generated snapshot artifact from disk
    const rawContent = fs.readFileSync(dryRunFixturePath, 'utf-8');
    const rawJson = JSON.parse(rawContent);

    expect(rawJson.status).toBe('success');
    expect(rawJson.raceId).toBe('2025_1_albert_park');
    expect(rawJson.season).toBe(2025);
    expect(rawJson.round).toBe(1);
    expect(rawJson.circuitId).toBe('albert_park');
    expect(rawJson.hybridFormulaVersion).toBe('geometric-w0.20-v1');

    // Step 2: Validate snapshot using TypeScript validateSnapshot
    const valResult = validateSnapshot(rawJson, 2025, 1, 'albert_park');
    expect(valResult.valid).toBe(true);
    expect(valResult.stage).toBe('provisional');

    // Step 3: Validate snapshot invariants (probabilities sum to 1.0, winner matches)
    expect(() => validatePredictionInvariants(rawJson as RacePredictionResponse)).not.toThrow();

    // Step 4: Load snapshot via loadAndValidateDiskSnapshot
    const diskLoaded = loadAndValidateDiskSnapshot('2025_1', 2025, 1, 'albert_park');
    expect(diskLoaded).not.toBeNull();
    expect(diskLoaded?.response.raceId).toBe('2025_1_albert_park');
    expect(diskLoaded?.path).toBe(dryRunFixturePath);

    // Step 5: Call getRacePrediction through prediction service
    const servicePrediction = await getRacePrediction('2025_1');
    expect(servicePrediction.status).toBe('success');
    expect(servicePrediction.season).toBe(2025);
    expect(servicePrediction.round).toBe(1);
    expect(servicePrediction.circuitId).toBe('albert_park');

    // Step 6: Invoke Next.js API Route GET /api/predictions/race/2025_1
    const req = new NextRequest('http://localhost:3000/api/predictions/race/2025_1');
    const apiRes = await GET(req, { params: Promise.resolve({ raceId: '2025_1' }) });
    expect(apiRes.status).toBe(200);

    const apiBody: RacePredictionResponse = await apiRes.json();
    expect(apiBody.status).toBe('success');
    expect(apiBody.modelVersion).toBe(MODEL_VERSION);
    expect(apiBody.hybridFormulaVersion).toBe('geometric-w0.20-v1');
    expect(apiBody.baselineVersion).toBe('grid-empirical-laplace-a1');
    expect(apiBody.experimentalStatus).toBe('EXPERIMENTAL_NON_PRODUCTION');
    expect(apiBody.rankingOrderSemantic).toBe('Predicted Win Probability Order');

    // Step 7: Verify predicted winner matches top hybrid probability driver
    expect(apiBody.predictedWinner).not.toBeNull();
    expect(apiBody.predictedWinner?.driverId).toBe('norris');
    expect(apiBody.predictedWinner?.driverCode).toBe('NOR');
    expect(apiBody.predictedWinner?.gridPosition).toBe(1);
    expect(apiBody.predictedWinner?.winProbability).toBe(0.4937);
    expect(apiBody.predictions[0].driverId).toBe('norris');
    expect(apiBody.predictedWinner?.winProbability).toBe(apiBody.predictions[0].winProbability);

    // Step 8: Verify table ordering is strictly descending by hybrid probability
    for (let i = 0; i < apiBody.predictions.length - 1; i++) {
      const curr = apiBody.predictions[i];
      const next = apiBody.predictions[i + 1];
      expect(curr.predictedRank).toBe(i + 1);
      expect(curr.winProbability).toBeGreaterThanOrEqual(next.winProbability);
      expect(curr.winProbability).toBe(curr.hybrid_win_probability);
    }

    // Step 9: Verify all three probabilities exist and are consistent across file, service, and API
    expect(apiBody.predictions.length).toBe(20);
    for (let i = 0; i < 20; i++) {
      const fileP = rawJson.predictions[i];
      const apiP = apiBody.predictions[i];

      expect(apiP.driverId).toBe(fileP.driverId);
      expect(apiP.gridPosition).toBe(fileP.gridPosition);

      // Verify Grid Baseline
      expect(apiP.grid_baseline_probability).toBe(fileP.grid_baseline_probability);
      expect(apiP.gridBaselineProbability).toBe(fileP.grid_baseline_probability);

      // Verify ML Win Probability
      expect(apiP.ml_win_probability).toBe(fileP.ml_win_probability);
      expect(apiP.mlWinProbability).toBe(fileP.ml_win_probability);

      // Verify Hybrid Win Probability
      expect(apiP.hybrid_win_probability).toBe(fileP.hybrid_win_probability);
      expect(apiP.hybridWinProbability).toBe(fileP.hybrid_win_probability);
      expect(apiP.winProbability).toBe(fileP.hybrid_win_probability);
    }

    // Step 10: Verify dual 64-character hash identity consistency
    expect(apiBody.inferenceInputHash).toBe(rawJson.inferenceInputHash);
    expect(apiBody.inferenceInputHash?.length).toBe(64);
    expect(apiBody.predictionOutputHash).toBe(rawJson.predictionOutputHash);
    expect(apiBody.predictionOutputHash?.length).toBe(64);
    expect(apiBody.inputHash).toBe(rawJson.inferenceInputHash.slice(0, 16));
  });

  // --------------------------------------------------------------------------
  // 2. Snapshot-Source Audit & Historical Replay Isolation
  // --------------------------------------------------------------------------
  it('strictly excludes historical replay artifacts from ordinary snapshot discovery', () => {
    // Normal call does NOT pass includeHistoricalReplays
    const standardLoad = loadAndValidateDiskSnapshot('2025_1', 2025, 1, 'albert_park');
    expect(standardLoad).not.toBeNull();
    // Must come from artifacts/dry_run_snapshots, NOT reports/.../historical_replays
    expect(standardLoad?.path).toContain('artifacts');
    expect(standardLoad?.path).not.toContain('historical_replays');
  });

  it('determines deterministic snapshot precedence by stage, timestamp, and hybrid presence', () => {
    const olderProvisional: RacePredictionResponse = {
      status: 'provisional',
      raceId: '2025_1',
      season: 2025,
      round: 1,
      circuitId: 'albert_park',
      circuitName: 'Albert Park',
      stage: 'provisional',
      predictionStage: 'provisional',
      generatedAtUtc: '2026-11-01T10:00:00Z',
      modelVersion: 'v1.0.0',
      featureSchemaVersion: '1.0.0',
      inputHash: '1111111111111111',
      qualifyingStatus: { isCompleted: true, freshness: 'historical', totalClassified: 20, hasPenaltiesApplied: false, dataCompletenessPct: 100 },
      predictions: [],
      topExplanatoryFactors: [],
      predictedWinner: null,
      cached: false,
      causalDisclaimer: ''
    };

    const newerProvisionalHybrid: RacePredictionResponse = {
      ...olderProvisional,
      generatedAtUtc: '2026-11-05T10:00:00Z',
      hybridFormulaVersion: 'geometric-w0.20-v1',
      inputHash: '2222222222222222'
    };

    const officialGrid: RacePredictionResponse = {
      ...olderProvisional,
      stage: 'official_grid',
      predictionStage: 'official_grid',
      generatedAtUtc: '2026-11-05T12:00:00Z',
      qualifyingStatus: { isCompleted: true, freshness: 'live', totalClassified: 20, hasPenaltiesApplied: true, dataCompletenessPct: 100 },
      inputHash: '3333333333333333'
    };

    // Rule 1: official_grid beats provisional regardless of timestamp
    expect(compareSnapshotPrecedence(officialGrid, newerProvisionalHybrid)).toBeGreaterThan(0);
    expect(compareSnapshotPrecedence(newerProvisionalHybrid, officialGrid)).toBeLessThan(0);

    // Rule 2: newer provisional beats older provisional
    expect(compareSnapshotPrecedence(newerProvisionalHybrid, olderProvisional)).toBeGreaterThan(0);

    // Rule 3: on timestamp tie, hybrid beats non-hybrid
    const sameTimestampNonHybrid: RacePredictionResponse = {
      ...newerProvisionalHybrid,
      hybridFormulaVersion: undefined,
      inputHash: '4444444444444444'
    };
    expect(compareSnapshotPrecedence(newerProvisionalHybrid, sameTimestampNonHybrid)).toBeGreaterThan(0);
  });

  // --------------------------------------------------------------------------
  // 3. Stage Handling Audit & Non-Fabrication
  // --------------------------------------------------------------------------
  it('returns provisional snapshot when stage=provisional is explicitly requested', async () => {
    const req = new NextRequest('http://localhost:3000/api/predictions/race/2025_1?stage=provisional');
    const res = await GET(req, { params: Promise.resolve({ raceId: '2025_1' }) });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('success');
    expect(body.stage).toBe('provisional');
    expect(body.qualifyingStatus.hasPenaltiesApplied).toBe(false);
  });

  it('fails closed with OFFICIAL_GRID_SNAPSHOT_NOT_FOUND when stage=official_grid is requested but missing', async () => {
    // 2025 Round 1 only has a provisional snapshot on disk
    const req = new NextRequest('http://localhost:3000/api/predictions/race/2025_1?stage=official_grid');
    const res = await GET(req, { params: Promise.resolve({ raceId: '2025_1' }) });

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.status).toBe('unavailable');
    expect(body.error).toBe('OFFICIAL_GRID_SNAPSHOT_NOT_FOUND');
    expect(body.stage).toBe('official_grid');
    expect(body.predictions.length).toBe(0);
    expect(body.predictedWinner).toBeNull();
    expect(body.message).toContain('Official starting grid snapshot for 2025 Round 1 is not available');
  });

  // --------------------------------------------------------------------------
  // 4. Hash Identity & Prefix Collision Rejection
  // --------------------------------------------------------------------------
  it('accepts valid 64-character inferenceInputHash and predictionOutputHash', () => {
    const validRaw = JSON.parse(fs.readFileSync(dryRunFixturePath, 'utf-8'));
    const val = validateSnapshot(validRaw, 2025, 1, 'albert_park');
    expect(val.valid).toBe(true);
  });

  it('rejects candidate snapshot with prefix collision (inputHash != inferenceInputHash[:16])', () => {
    const raw = JSON.parse(fs.readFileSync(dryRunFixturePath, 'utf-8'));
    // Deliberately tamper with inputHash to simulate prefix collision
    raw.inputHash = '0123456789abcdef';

    const val = validateSnapshot(raw, 2025, 1, 'albert_park');
    expect(val.valid).toBe(false);
    expect(val.reason).toContain('Prefix collision / identity mismatch');
  });

  it('rejects candidate snapshot with non-64-hex inferenceInputHash', () => {
    const raw = JSON.parse(fs.readFileSync(dryRunFixturePath, 'utf-8'));
    raw.inferenceInputHash = 'short_hash_123';

    const val = validateSnapshot(raw, 2025, 1, 'albert_park');
    expect(val.valid).toBe(false);
    expect(val.reason).toContain('not a valid 64-character hex string');
  });

  it('rejects candidate snapshot with non-64-hex predictionOutputHash', () => {
    const raw = JSON.parse(fs.readFileSync(dryRunFixturePath, 'utf-8'));
    raw.predictionOutputHash = 'short_output_hash';

    const val = validateSnapshot(raw, 2025, 1, 'albert_park');
    expect(val.valid).toBe(false);
    expect(val.reason).toContain('not a valid 64-character hex string');
  });

  // --------------------------------------------------------------------------
  // 5. Edge Cases Suite
  // --------------------------------------------------------------------------
  it('rejects snapshot with wrong season or round', () => {
    const raw = JSON.parse(fs.readFileSync(dryRunFixturePath, 'utf-8'));
    raw.season = 2024; // requested 2025

    const val = validateSnapshot(raw, 2025, 1, 'albert_park');
    expect(val.valid).toBe(false);
    expect(val.reason).toContain('Snapshot season (2024) does not match requested season (2025)');
  });

  it('rejects snapshot with wrong circuitId', () => {
    const raw = JSON.parse(fs.readFileSync(dryRunFixturePath, 'utf-8'));
    raw.circuitId = 'monaco'; // expected albert_park

    const val = validateSnapshot(raw, 2025, 1, 'albert_park');
    expect(val.valid).toBe(false);
    expect(val.reason).toContain("does not match expected calendar circuit ('albert_park')");
  });

  it('rejects snapshot with wrong modelVersion', () => {
    const raw = JSON.parse(fs.readFileSync(dryRunFixturePath, 'utf-8'));
    raw.modelVersion = 'v2.0.0-unapproved';

    const val = validateSnapshot(raw, 2025, 1, 'albert_park');
    expect(val.valid).toBe(false);
    expect(val.reason).toContain("does not match system model version ('v1.0.0')");
  });

  it('rejects snapshot with duplicate driver IDs', () => {
    const raw = JSON.parse(fs.readFileSync(dryRunFixturePath, 'utf-8'));
    raw.predictions[1].driverId = raw.predictions[0].driverId; // Duplicate 'norris'

    const val = validateSnapshot(raw, 2025, 1, 'albert_park');
    expect(val.valid).toBe(false);
    expect(val.reason).toContain("Duplicate driverId 'norris'");
  });

  it('rejects snapshot with non-finite probability', () => {
    const raw = JSON.parse(fs.readFileSync(dryRunFixturePath, 'utf-8'));
    raw.predictions[0].winProbability = NaN;

    expect(() => validatePredictionInvariants(raw as RacePredictionResponse)).toThrow(
      'Non-finite probability'
    );
  });

  it('rejects snapshot with probability out of [0, 1] bounds', () => {
    const raw = JSON.parse(fs.readFileSync(dryRunFixturePath, 'utf-8'));
    raw.predictions[0].winProbability = 1.45;

    expect(() => validatePredictionInvariants(raw as RacePredictionResponse)).toThrow(
      'out of bounds [0, 1]'
    );
  });

  it('rejects snapshot with probability sum violating tolerance', () => {
    const raw = JSON.parse(fs.readFileSync(dryRunFixturePath, 'utf-8'));
    raw.predictions[0].winProbability = 0.80; // Total sum exceeds 1.005

    expect(() => validatePredictionInvariants(raw as RacePredictionResponse)).toThrow(
      'expected 1.0'
    );
  });

  it('rejects 2026 snapshot claiming HISTORICAL_VALIDATED', () => {
    const raw = JSON.parse(fs.readFileSync(dryRunFixturePath, 'utf-8'));
    raw.season = 2026;
    raw.regulationEraWarning = {
      isUnknownRegulationEra: false,
      regulationEra: 'ground_effect_gen2',
      warningCode: 'HISTORICAL_VALIDATED',
      disclaimer: 'Invalid claim'
    };

    const val = validateSnapshot(raw, 2026, 1, 'albert_park');
    expect(val.valid).toBe(false);
    expect(val.reason).toContain('2026 predictions cannot claim HISTORICAL_VALIDATED status');
  });

  it('preserves frozen model binary integrity check constant matching known SHA-256', () => {
    expect(FROZEN_MODEL_BUNDLE_SHA256).toBe(
      'D8244024E6B7F0F31912EFE80B35652EF228461955232DDE7E4D65ECCC5779CD'
    );
  });
});

