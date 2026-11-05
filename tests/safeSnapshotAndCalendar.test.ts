import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import {
  getRacePrediction,
  validateSnapshot,
  getCircuitForRound,
  compareSnapshotPrecedence,
  loadAndValidateDiskSnapshot,
  REGULATION_ERA_WARNING_2026,
  CURRENT_2026_GRID,
  MODEL_VERSION,
  FEATURE_SCHEMA_VERSION,
  RacePredictionResponse
} from '../app/lib/racePredictorService';
import {
  getOfficialRaceResults,
  getHistoricalAccuracyLedger,
  VERIFIED_HISTORICAL_RESULTS
} from '../app/lib/raceResultsService';
import { GET } from '../app/api/predictions/race/[raceId]/route';

describe('Phase 3C.3A — Safe Snapshot and Calendar Remediation', () => {

  // ==========================================
  // Task B: Snapshot Identity & Schema Validation
  // ==========================================
  describe('Task B: Snapshot Identity & Invariant Validation', () => {
    const validSnapshotTemplate: RacePredictionResponse = {
      status: 'success',
      raceId: '2024_1',
      season: 2024,
      round: 1,
      circuitId: 'bahrain',
      circuitName: 'Bahrain International Circuit',
      country: 'Bahrain',
      predictionStage: 'after_qualifying',
      generatedAtUtc: '2024-03-01T18:00:00Z',
      modelVersion: 'v1.0.0',
      featureSchemaVersion: '1.0.0',
      inputHash: 'hash123',
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
        winProbability: 0.6,
        winProbabilityPct: 60,
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
          winProbability: 0.6,
          winProbabilityPct: 60,
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
          winProbability: 0.4,
          winProbabilityPct: 40,
          predictedRank: 2
        }
      ],
      topExplanatoryFactors: [],
      cached: false,
      causalDisclaimer: ''
    };

    it('accepts authentic, compliant snapshots', () => {
      const result = validateSnapshot(validSnapshotTemplate, 2024, 1, 'bahrain');
      expect(result.valid).toBe(true);
    });

    it('rejects snapshots with mismatched season', () => {
      const result = validateSnapshot(validSnapshotTemplate, 2026, 1, 'bahrain');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('season');
    });

    it('rejects snapshots with mismatched round', () => {
      const result = validateSnapshot(validSnapshotTemplate, 2024, 2, 'bahrain');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('round');
    });

    it('rejects snapshots with mismatched circuitId', () => {
      const result = validateSnapshot(validSnapshotTemplate, 2024, 1, 'jeddah');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('circuitId');
    });

    it('rejects snapshots with outdated or mismatched modelVersion', () => {
      const corrupt = { ...validSnapshotTemplate, modelVersion: 'v0.9.0' };
      const result = validateSnapshot(corrupt, 2024, 1, 'bahrain');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('modelVersion');
    });

    it('rejects snapshots with broken probability invariants', () => {
      const corrupt = {
        ...validSnapshotTemplate,
        predictions: [
          { ...validSnapshotTemplate.predictions[0], winProbability: 0.9 },
          { ...validSnapshotTemplate.predictions[1], winProbability: 0.9 }
        ]
      };
      const result = validateSnapshot(corrupt, 2024, 1, 'bahrain');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Prediction invariant check failed');
    });
  });

  // ==========================================
  // Task C: Season-Aware Calendar Mappings
  // ==========================================
  describe('Task C: Season-Aware Calendar Mappings', () => {
    it('returns authentic 2026 calendar mappings for R18, R19, and R20', () => {
      const r18 = getCircuitForRound(2026, 18);
      expect(r18).toBeDefined();
      expect(r18?.circuitId).toBe('americas');
      expect(r18?.circuitName).toBe('Circuit of the Americas');
      expect(r18?.country).toBe('USA');

      const r19 = getCircuitForRound(2026, 19);
      expect(r19).toBeDefined();
      expect(r19?.circuitId).toBe('rodriguez');
      expect(r19?.circuitName).toBe('Autódromo Hermanos Rodríguez');
      expect(r19?.country).toBe('Mexico');

      const r20 = getCircuitForRound(2026, 20);
      expect(r20).toBeDefined();
      expect(r20?.circuitId).toBe('interlagos');
      expect(r20?.circuitName).toBe('Autódromo José Carlos Pace');
      expect(r20?.country).toBe('Brazil');
    });

    it('preserves historical 2024 calendar mappings where rounds differ from 2026', () => {
      const r18 = getCircuitForRound(2024, 18);
      expect(r18?.circuitId).toBe('marina_bay');

      const r19 = getCircuitForRound(2024, 19);
      expect(r19?.circuitId).toBe('americas');

      const r20 = getCircuitForRound(2024, 20);
      expect(r20?.circuitId).toBe('rodriguez');

      const r21 = getCircuitForRound(2024, 21);
      expect(r21?.circuitId).toBe('interlagos');

      // Crucial divergence: round 20 in 2026 is Interlagos, while round 20 in 2024 was Rodriguez
      expect(getCircuitForRound(2026, 20)?.circuitId).not.toBe(getCircuitForRound(2024, 20)?.circuitId);
      expect(getCircuitForRound(2026, 20)?.circuitId).toBe('interlagos');
      expect(getCircuitForRound(2024, 20)?.circuitId).toBe('rodriguez');
    });
  });

  // ==========================================
  // Task D: Removal of Hardcoded Race-Result Fallback
  // ==========================================
  describe('Task D: Official Race Results & Accuracy Ledger Isolation', () => {
    it('returns empty/unavailable results for unheld 2026 R19 and R20 without cross-season leakage', async () => {
      const r19 = await getOfficialRaceResults('2026', '19');
      expect(r19.actualWinnerCode).toBeUndefined();
      expect(Object.keys(r19.actualResults).length).toBe(0);

      const r20 = await getOfficialRaceResults('2026', '20');
      expect(r20.actualWinnerCode).toBeUndefined();
      expect(Object.keys(r20.actualResults).length).toBe(0);
    });

    it('preserves verified 2024 historical classifications when 2024 is explicitly queried', async () => {
      const r19_2024 = await getOfficialRaceResults('2024', '19');
      expect(r19_2024.actualWinnerCode).toBe('LEC');
      expect(r19_2024.actualResults['LEC']).toBe(1);

      const r20_2024 = await getOfficialRaceResults('2024', '20');
      expect(r20_2024.actualWinnerCode).toBe('SAI');
      expect(r20_2024.actualResults['SAI']).toBe(1);
    });

    it('verifies VERIFIED_HISTORICAL_RESULTS keys are strictly season-scoped', () => {
      const keys = Object.keys(VERIFIED_HISTORICAL_RESULTS);
      for (const k of keys) {
        expect(k).toMatch(/^\d{4}_\d+$/);
      }
      expect(VERIFIED_HISTORICAL_RESULTS['2026_19']).toBeUndefined();
      expect(VERIFIED_HISTORICAL_RESULTS['2026_20']).toBeUndefined();
    });

    it('returns empty audit ledger for 2026 and never leaks 2024 audits for 2026 queries', () => {
      const ledger2026 = getHistoricalAccuracyLedger('2026');
      expect(ledger2026).toEqual([]);

      const ledger2024 = getHistoricalAccuracyLedger('2024');
      expect(ledger2024.length).toBeGreaterThanOrEqual(2);
      expect(ledger2024.every(r => r.season === '2024')).toBe(true);
    });

    it('sanitizes and purges contaminated 2026 entries from browser localStorage', () => {
      // Mock window and localStorage
      const storageMock: Record<string, string> = {
        'paddock_accuracy_ledger_from_austin': JSON.stringify([
          {
            season: '2026',
            round: '20',
            raceName: 'Mexico City Grand Prix',
            circuitName: 'Autódromo Hermanos Rodríguez',
            country: 'Mexico',
            date: '2026-10-25',
            isCompleted: true,
            predictedWinner: { driverId: 'sainz', driverCode: 'SAI', winProbabilityPct: 50.9, constructorName: 'Ferrari' },
            actualWinner: { driverCode: 'SAI', driverName: 'Carlos Sainz', constructorName: 'Scuderia Ferrari' },
            accuracyVerdict: 'winner_hit',
            actualResults: { SAI: 1 },
            actualStatus: {}
          },
          {
            season: '2024',
            round: '20',
            raceName: 'Mexico City Grand Prix',
            circuitName: 'Autódromo Hermanos Rodríguez',
            country: 'Mexico',
            date: '2024-10-27',
            isCompleted: true,
            predictedWinner: { driverId: 'sainz', driverCode: 'SAI', winProbabilityPct: 50.9, constructorName: 'Ferrari' },
            actualWinner: { driverCode: 'SAI', driverName: 'Carlos Sainz', constructorName: 'Scuderia Ferrari' },
            accuracyVerdict: 'winner_hit',
            actualResults: { SAI: 1 },
            actualStatus: {}
          }
        ])
      };

      const originalWindow = (global as any).window;
      (global as any).window = {};
      (global as any).localStorage = {
        getItem: (key: string) => storageMock[key] || null,
        setItem: (key: string, val: string) => { storageMock[key] = val; },
        removeItem: (key: string) => { delete storageMock[key]; }
      };

      try {
        // Querying for 2026 must return empty, and must have purged the 2026 entry from localStorage
        const res2026 = getHistoricalAccuracyLedger('2026');
        expect(res2026).toEqual([]);

        // Stored localStorage must now ONLY have 2024 entries
        const updatedStorage = JSON.parse(storageMock['paddock_accuracy_ledger_from_austin']);
        expect(updatedStorage.length).toBe(1);
        expect(updatedStorage[0].season).toBe('2024');

        // Querying without season must also be sanitized
        const resAll = getHistoricalAccuracyLedger();
        expect(resAll.every(r => parseInt(r.season, 10) < 2026)).toBe(true);
      } finally {
        if (originalWindow === undefined) {
          delete (global as any).window;
          delete (global as any).localStorage;
        } else {
          (global as any).window = originalWindow;
        }
      }
    });
  });

  // ==========================================
  // Task E: Safe Precedence & Serving Guarantees
  // ==========================================
  describe('Task E: Safe Precedence and 2026 Pre-Qualifying Holding State', () => {
    it('holds 2026 R18, R19, and R20 strictly in authentic pre-qualifying unavailable state', async () => {
      const pred18 = await getRacePrediction('2026_18');
      expect(pred18.status).toBe('unavailable');
      expect(pred18.error).toBe('QUALIFYING_NOT_COMPLETED');
      expect(pred18.circuitId).toBe('americas');
      expect(pred18.country).toBe('USA');
      expect(pred18.predictedWinner).toBeNull();
      expect(pred18.predictions.length).toBe(0);

      const pred19 = await getRacePrediction('2026_19');
      expect(pred19.status).toBe('unavailable');
      expect(pred19.error).toBe('QUALIFYING_NOT_COMPLETED');
      expect(pred19.circuitId).toBe('rodriguez');
      expect(pred19.country).toBe('Mexico');

      const pred20 = await getRacePrediction('2026_20');
      expect(pred20.status).toBe('unavailable');
      expect(pred20.error).toBe('QUALIFYING_NOT_COMPLETED');
      expect(pred20.circuitId).toBe('interlagos');
      expect(pred20.country).toBe('Brazil');
    });

    it('ensures API route returns 2026 R20 as unavailable without returning deleted stale snapshot', async () => {
      const req = new NextRequest('http://localhost:3000/api/predictions/race/2026_20');
      const res = await GET(req, { params: Promise.resolve({ raceId: '2026_20' }) });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('unavailable');
      expect(body.error).toBe('QUALIFYING_NOT_COMPLETED');
      expect(body.circuitId).toBe('interlagos');
      expect(body.country).toBe('Brazil');
      expect(body.predictedWinner).toBeNull();
    });

    it('marks heuristic provisional simulations explicitly with provisional status and disclaimer', async () => {
      const sim = await getRacePrediction('2026_20', { simulate: true });
      expect(sim.status).toBe('provisional');
      expect(sim.circuitId).toBe('interlagos');
      expect(sim.country).toBe('Brazil');
      expect(sim.causalDisclaimer).toContain('PROVISIONAL PRE-RACE SIMULATION');
      expect(sim.predictedWinner).not.toBeNull();
      const totalProb = sim.predictions.reduce((acc, d) => acc + d.winProbability, 0);
      expect(Math.abs(totalProb - 1.0)).toBeLessThan(0.005);
    });
  });

  // ==========================================
  // Phase 3C.4A: Snapshot Contract Hardening & Stage Precedence
  // ==========================================
  describe('Phase 3C.4A: Snapshot Contract Hardening and Stage Precedence', () => {
    const compliantProvisionalSnapshot: RacePredictionResponse = {
      status: 'success',
      raceId: '2026_1',
      season: 2026,
      round: 1,
      circuitId: 'bahrain',
      circuitName: 'Bahrain International Circuit',
      country: 'Bahrain',
      stage: 'provisional',
      predictionStage: 'after_qualifying',
      generatedAtUtc: '2026-03-01T17:00:00Z',
      modelVersion: MODEL_VERSION,
      featureSchemaVersion: FEATURE_SCHEMA_VERSION,
      inputHash: 'hash_prov_123',
      qualifyingStatus: {
        isCompleted: true,
        freshness: 'live',
        totalClassified: 20,
        hasPenaltiesApplied: false,
        dataCompletenessPct: 100
      },
      provenance: {
        qualifyingSource: 'jolpica_ergast',
        baselineVersion: 'v1.3.1',
        retrievalTimestampUtc: '2026-03-01T16:55:00Z'
      },
      expectedRoster: CURRENT_2026_GRID.map(d => d.driverId),
      regulationEraWarning: REGULATION_ERA_WARNING_2026,
      predictedWinner: {
        driverId: 'norris',
        driverCode: 'NOR',
        winProbability: 0.258,
        winProbabilityPct: 25.8,
        constructorName: 'McLaren Formula 1 Team',
        gridPosition: 1
      },
      predictions: CURRENT_2026_GRID.map((d, idx) => ({
        driverId: d.driverId,
        driverCode: d.driverCode,
        driverNumber: d.driverNumber,
        constructorId: d.constructorId,
        constructorName: d.constructorName,
        gridPosition: idx + 1,
        qualiPosition: idx + 1,
        gridPenaltyDelta: 0,
        winProbability: d.prob,
        winProbabilityPct: Math.round(d.prob * 10000) / 100,
        predictedRank: idx + 1
      })),
      topExplanatoryFactors: [],
      cached: false,
      causalDisclaimer: ''
    };

    const compliantOfficialGridSnapshot: RacePredictionResponse = {
      ...compliantProvisionalSnapshot,
      stage: 'official_grid',
      generatedAtUtc: '2026-03-02T11:00:00Z',
      inputHash: 'hash_official_456',
      qualifyingStatus: {
        ...compliantProvisionalSnapshot.qualifyingStatus,
        hasPenaltiesApplied: true
      },
      provenance: {
        qualifyingSource: 'jolpica_ergast',
        gridSource: 'fia_starting_grid_doc',
        baselineVersion: 'v1.3.1',
        retrievalTimestampUtc: '2026-03-02T10:45:00Z'
      }
    };

    it('validates compliant provisional snapshot and returns verified provisional status', () => {
      const res = validateSnapshot(compliantProvisionalSnapshot, 2026, 1, 'bahrain');
      expect(res.valid).toBe(true);
      expect(res.stage).toBe('provisional');
      expect(res.validationStatus).toBe('provisional');
    });

    it('validates compliant official_grid snapshot and returns verified status', () => {
      const res = validateSnapshot(compliantOfficialGridSnapshot, 2026, 1, 'bahrain');
      expect(res.valid).toBe(true);
      expect(res.stage).toBe('official_grid');
      expect(res.validationStatus).toBe('verified');
    });

    it('rejects missing or ambiguous stage metadata in modern snapshots', () => {
      const missingStage = { ...compliantProvisionalSnapshot, stage: undefined };
      const res = validateSnapshot(missingStage, 2026, 1, 'bahrain');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('Missing required snapshot stage');
    });

    it('rejects contradictory stage and hasPenaltiesApplied metadata', () => {
      const contradictoryOfficial = {
        ...compliantOfficialGridSnapshot,
        qualifyingStatus: { ...compliantOfficialGridSnapshot.qualifyingStatus, hasPenaltiesApplied: false }
      };
      const res1 = validateSnapshot(contradictoryOfficial, 2026, 1, 'bahrain');
      expect(res1.valid).toBe(false);
      expect(res1.reason).toContain("stage 'official_grid' requires hasPenaltiesApplied to be true");

      const contradictoryProv = {
        ...compliantProvisionalSnapshot,
        qualifyingStatus: { ...compliantProvisionalSnapshot.qualifyingStatus, hasPenaltiesApplied: true }
      };
      const res2 = validateSnapshot(contradictoryProv, 2026, 1, 'bahrain');
      expect(res2.valid).toBe(false);
      expect(res2.reason).toContain("stage 'provisional' requires hasPenaltiesApplied to be false");

      const invalidStage = { ...compliantProvisionalSnapshot, stage: 'arbitrary' as any };
      const res3 = validateSnapshot(invalidStage, 2026, 1, 'bahrain');
      expect(res3.valid).toBe(false);
      expect(res3.reason).toContain("Snapshot stage 'arbitrary' is invalid");
    });

    it('rejects unsupported or mismatched feature-schema version', () => {
      const badSchema = { ...compliantProvisionalSnapshot, featureSchemaVersion: '2.0.0' };
      const res = validateSnapshot(badSchema, 2026, 1, 'bahrain');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('featureSchemaVersion');
    });

    it('rejects malformed or unparseable timestamps and future drift', () => {
      const badTs = { ...compliantProvisionalSnapshot, generatedAtUtc: 'not-a-timestamp' };
      const res1 = validateSnapshot(badTs, 2026, 1, 'bahrain');
      expect(res1.valid).toBe(false);
      expect(res1.reason).toContain('valid ISO 8601 UTC timestamp');

      const farFutureTs = { ...compliantProvisionalSnapshot, generatedAtUtc: '2099-01-01T00:00:00Z' };
      const res2 = validateSnapshot(farFutureTs, 2026, 1, 'bahrain');
      expect(res2.valid).toBe(false);
      expect(res2.reason).toContain('range [2000, 2050]');

      const pythonTs = { ...compliantProvisionalSnapshot, generatedAtUtc: '2026-03-01T17:00:00.000000+00:00Z' };
      const res3 = validateSnapshot(pythonTs, 2026, 1, 'bahrain');
      expect(res3.valid).toBe(true);
    });

    it('rejects duplicate driver IDs in predictions array', () => {
      const dup = {
        ...compliantProvisionalSnapshot,
        predictions: [
          ...compliantProvisionalSnapshot.predictions.slice(0, 19),
          { ...compliantProvisionalSnapshot.predictions[0] }
        ]
      };
      const res = validateSnapshot(dup, 2026, 1, 'bahrain');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('Duplicate driverId');
    });

    it('rejects unknown drivers and missing drivers against expected roster', () => {
      const unknownDriver = {
        ...compliantProvisionalSnapshot,
        predictions: [
          ...compliantProvisionalSnapshot.predictions.slice(0, 19),
          { ...compliantProvisionalSnapshot.predictions[19], driverId: 'unknown_ghost_driver' }
        ]
      };
      const res1 = validateSnapshot(unknownDriver, 2026, 1, 'bahrain');
      expect(res1.valid).toBe(false);
      expect(res1.reason).toContain("Unknown driver 'unknown_ghost_driver'");

      const partialRoster = {
        ...compliantProvisionalSnapshot,
        predictions: compliantProvisionalSnapshot.predictions.slice(0, 15)
      };
      const res2 = validateSnapshot(partialRoster, 2026, 1, 'bahrain');
      expect(res2.valid).toBe(false);
      expect(res2.reason).toContain('Missing driver');
    });

    it('fails closed when expected roster is completely unavailable or mismatched', () => {
      const snapshotNoRoster = {
        ...compliantProvisionalSnapshot,
        season: 2024,
        expectedRoster: undefined,
        qualifyingStatus: { ...compliantProvisionalSnapshot.qualifyingStatus, totalClassified: 25 },
        predictions: compliantProvisionalSnapshot.predictions.slice(0, 20)
      };
      const res = validateSnapshot(snapshotNoRoster, 2024, 1, 'bahrain');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('does not match classified count');
    });

    it('rejects missing or empty required provenance metadata in modern canonical snapshot', () => {
      const missingProv = { ...compliantProvisionalSnapshot, provenance: undefined };
      const res1 = validateSnapshot(missingProv, 2026, 1, 'bahrain');
      expect(res1.valid).toBe(false);
      expect(res1.reason).toContain('missing required provenance');

      const emptyProv = { ...compliantProvisionalSnapshot, provenance: {} };
      const res2 = validateSnapshot(emptyProv, 2026, 1, 'bahrain');
      expect(res2.valid).toBe(false);
      expect(res2.reason).toContain('provenance must specify at least one valid source');
    });

    it('strictly enforces stage-aware precedence where official_grid beats provisional', () => {
      // Provisional has newer timestamp (17:00 vs 11:00)
      const provisionalNewer = { ...compliantProvisionalSnapshot, generatedAtUtc: '2026-03-02T17:00:00Z' };
      const officialOlder = { ...compliantOfficialGridSnapshot, generatedAtUtc: '2026-03-02T11:00:00Z' };

      // Official grid must win
      expect(compareSnapshotPrecedence(officialOlder, provisionalNewer)).toBeGreaterThan(0);
      expect(compareSnapshotPrecedence(provisionalNewer, officialOlder)).toBeLessThan(0);

      // Between two official grid snapshots, newer timestamp wins
      const officialNewer = { ...compliantOfficialGridSnapshot, generatedAtUtc: '2026-03-02T13:00:00Z' };
      expect(compareSnapshotPrecedence(officialNewer, officialOlder)).toBeGreaterThan(0);

      // Invalid timestamp does not defeat valid timestamp
      const officialInvalidTs = { ...compliantOfficialGridSnapshot, generatedAtUtc: 'corrupt-ts' };
      expect(compareSnapshotPrecedence(officialOlder, officialInvalidTs)).toBeGreaterThan(0);
      expect(compareSnapshotPrecedence(officialInvalidTs, officialOlder)).toBeLessThan(0);
    });

    it('ensures legacy historical snapshots without stage are accepted under legacy compatibility policy', () => {
      const legacySnapshot: RacePredictionResponse = {
        ...compliantProvisionalSnapshot,
        season: 2024,
        stage: undefined,
        provenance: undefined,
        expectedRoster: undefined,
        qualifyingStatus: {
          isCompleted: true,
          freshness: 'historical',
          totalClassified: 20,
          hasPenaltiesApplied: true,
          dataCompletenessPct: 100
        }
      };

      // Default allowLegacy allows historical snapshot
      const resLegacy = validateSnapshot(legacySnapshot, 2024, 1, 'bahrain', { allowLegacy: true });
      expect(resLegacy.valid).toBe(true);
      expect(resLegacy.stage).toBe('official_grid');
      expect(resLegacy.validationStatus).toBe('legacy_compatible');

      // Strict stage mode rejects it
      const resStrict = validateSnapshot(legacySnapshot, 2024, 1, 'bahrain', { strictStage: true });
      expect(resStrict.valid).toBe(false);
      expect(resStrict.reason).toContain('Missing required snapshot stage');
    });

    it('enforces 2026 regulation-era warning and rejects ungrounded HISTORICAL_VALIDATED claims', () => {
      // 2026 snapshot claiming HISTORICAL_VALIDATED must be rejected
      const falseHistoricalClaim = {
        ...compliantProvisionalSnapshot,
        regulationEraWarning: {
          isUnknownRegulationEra: false,
          regulationEra: 'active_aero_sustainable_fuel_gen3',
          warningCode: 'HISTORICAL_VALIDATED' as any,
          disclaimer: 'False ground truth claim'
        }
      };
      const res = validateSnapshot(falseHistoricalClaim, 2026, 1, 'bahrain');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('2026 predictions cannot claim HISTORICAL_VALIDATED');
    });
  });
});

