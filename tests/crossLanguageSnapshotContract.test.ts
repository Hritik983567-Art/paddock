import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  validateSnapshot,
  compareSnapshotPrecedence,
  RacePredictionResponse
} from '../app/lib/racePredictorService';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DRY_RUN_DIR = path.join(PROJECT_ROOT, 'artifacts', 'dry_run_snapshots');

describe('Phase 3C.4C — Cross-Language Snapshot Contract Parity', () => {
  const artifact2025Path = path.join(DRY_RUN_DIR, '2025_1_albert_park_provisional_v1.0.0_78814a3e6ed7cff2.json');
  const artifact2026Path = path.join(DRY_RUN_DIR, '2026_1_albert_park_provisional_v1.0.0_7a4f33c7b2fe0d91.json');

  it('verifies the 2025 Python dry-run snapshot artifact passes TypeScript validateSnapshot', () => {
    expect(fs.existsSync(artifact2025Path)).toBe(true);
    const content = JSON.parse(fs.readFileSync(artifact2025Path, 'utf-8'));

    const validation = validateSnapshot(content, 2025, 1, 'albert_park');
    expect(validation.valid).toBe(true);
    expect(validation.stage).toBe('provisional');
    expect(validation.validationStatus).toBe('provisional');

    // Structural checks on Python artifact
    expect(content.inputHash).toMatch(/^[a-f0-9]{16}$/);
    expect(content.modelVersion).toBe('v1.0.0');
    expect(content.featureSchemaVersion).toBe('1.0.0');
    expect(content.provenance?.baselineVersion).toBe('1.3.1');
    expect(content.predictions.length).toBe(20);
    expect(content.expectedRoster.length).toBe(20);
    expect(content.predictedWinner.driverId).toBe('norris');
    expect(content.predictedWinner.winProbability).toBe(0.1486);
  });

  it('verifies the 2026 Python dry-run snapshot artifact passes TypeScript validateSnapshot', () => {
    expect(fs.existsSync(artifact2026Path)).toBe(true);
    const content = JSON.parse(fs.readFileSync(artifact2026Path, 'utf-8'));

    const validation = validateSnapshot(content, 2026, 1, 'albert_park');
    expect(validation.valid).toBe(true);
    expect(validation.stage).toBe('provisional');
    expect(validation.validationStatus).toBe('provisional');

    // Structural checks on 2026 Python artifact
    expect(content.inputHash).toMatch(/^[a-f0-9]{16}$/);
    expect(content.modelVersion).toBe('v1.0.0');
    expect(content.featureSchemaVersion).toBe('1.0.0');
    expect(content.regulationEraWarning?.warningCode).toBe('UNVALIDATED_2026_REGULATIONS');
    expect(content.regulationEraWarning?.isUnknownRegulationEra).toBe(true);
  });

  describe('Phase 3C.4F.3 — Hybrid Inference Snapshot Parity', () => {
    const hybrid2025Path = path.join(DRY_RUN_DIR, '2025_1_albert_park_provisional_v1.0.0_hybrid_56947b913051836c.json');
    const hybrid2026Path = path.join(DRY_RUN_DIR, '2026_1_albert_park_provisional_v1.0.0_hybrid_74bd99dca49ce975.json');

    it('verifies the 2025 hybrid snapshot artifact passes TypeScript validateSnapshot', () => {
      expect(fs.existsSync(hybrid2025Path)).toBe(true);
      const content = JSON.parse(fs.readFileSync(hybrid2025Path, 'utf-8'));

      const validation = validateSnapshot(content, 2025, 1, 'albert_park');
      expect(validation.valid).toBe(true);
      expect(validation.stage).toBe('provisional');

      // Hybrid specific metadata checks
      expect(content.modelVersion).toBe('v1.0.0');
      expect(content.featureSchemaVersion).toBe('1.0.0');
      expect(content.baselineVersion).toBe('grid-empirical-laplace-a1');
      expect(content.hybridFormulaVersion).toBe('geometric-w0.20-v1');
      expect(content.experimentalStatus).toBe('EXPERIMENTAL_NON_PRODUCTION');
      expect(content.rankingOrderSemantic).toBe('Predicted Win Probability Order');

      // Dual hashes
      expect(content.inputHash).toMatch(/^[a-f0-9]{16}$/);
      expect(content.inferenceInputHash).toMatch(/^[a-f0-9]{64}$/);
      expect(content.predictionOutputHash).toMatch(/^[a-f0-9]{64}$/);

      // Three probabilities preserved
      expect(content.predictions.length).toBe(20);
      for (const p of content.predictions) {
        expect(p.grid_baseline_probability).toBeDefined();
        expect(p.ml_win_probability).toBeDefined();
        expect(p.hybrid_win_probability).toBeDefined();
        expect(p.winProbability).toBe(p.hybrid_win_probability);
      }

      // Predicted winner matches top probability
      expect(content.predictedWinner.driverId).toBe('norris');
      expect(content.predictedWinner.winProbability).toBe(0.4937);
      expect(content.predictions[0].driverId).toBe('norris');
      expect(content.predictions[0].winProbability).toBe(0.4937);
    });

    it('verifies the 2026 hybrid snapshot artifact passes TypeScript validateSnapshot with regulation era warning', () => {
      expect(fs.existsSync(hybrid2026Path)).toBe(true);
      const content = JSON.parse(fs.readFileSync(hybrid2026Path, 'utf-8'));

      const validation = validateSnapshot(content, 2026, 1, 'albert_park');
      expect(validation.valid).toBe(true);
      expect(content.regulationEraWarning?.warningCode).toBe('UNVALIDATED_2026_REGULATIONS');
      expect(content.regulationEraWarning?.isUnknownRegulationEra).toBe(true);
      expect(content.predictions.length).toBe(19);
      expect(content.predictedWinner.driverId).toBe('russell');
      expect(content.predictedWinner.winProbability).toBe(0.5025);
    });
  });

  describe('Negative Contract Cases — TypeScript Validator Fails Closed', () => {
    function getValidBase(): RacePredictionResponse {
      return JSON.parse(fs.readFileSync(artifact2025Path, 'utf-8'));
    }

    it('rejects season mismatch', () => {
      const snap = getValidBase();
      const res = validateSnapshot(snap, 2024, 1, 'albert_park');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('Snapshot season (2025) does not match requested season (2024)');
    });

    it('rejects round mismatch', () => {
      const snap = getValidBase();
      const res = validateSnapshot(snap, 2025, 2, 'albert_park');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('Snapshot round (1) does not match requested round (2)');
    });

    it('rejects circuit mismatch', () => {
      const snap = getValidBase();
      const res = validateSnapshot(snap, 2025, 1, 'bahrain');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain("does not match expected calendar circuit ('bahrain')");
    });

    it('rejects modelVersion mismatch', () => {
      const snap = getValidBase();
      snap.modelVersion = 'v2.0.0';
      const res = validateSnapshot(snap, 2025, 1, 'albert_park');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain("does not match system model version ('v1.0.0')");
    });

    it('rejects featureSchemaVersion mismatch', () => {
      const snap = getValidBase();
      snap.featureSchemaVersion = '2.0.0';
      const res = validateSnapshot(snap, 2025, 1, 'albert_park');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain("does not match system feature schema version ('1.0.0')");
    });

    it('rejects unsupported stage', () => {
      const snap = getValidBase();
      (snap as any).stage = 'live';
      const res = validateSnapshot(snap, 2025, 1, 'albert_park');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain("Snapshot stage 'live' is invalid");
    });

    it('rejects contradictory stage and penalty combination (provisional with penalties)', () => {
      const snap = getValidBase();
      snap.stage = 'provisional';
      snap.qualifyingStatus.hasPenaltiesApplied = true;
      const res = validateSnapshot(snap, 2025, 1, 'albert_park');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain("Contradictory stage metadata: stage 'provisional' requires hasPenaltiesApplied to be false");
    });

    it('rejects contradictory stage and penalty combination (official_grid without penalties)', () => {
      const snap = getValidBase();
      snap.stage = 'official_grid';
      snap.qualifyingStatus.hasPenaltiesApplied = false;
      const res = validateSnapshot(snap, 2025, 1, 'albert_park');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain("Contradictory stage metadata: stage 'official_grid' requires hasPenaltiesApplied to be true");
    });

    it('rejects missing or empty provenance in modern snapshots', () => {
      const snap = getValidBase();
      (snap as any).provenance = {};
      const res = validateSnapshot(snap, 2025, 1, 'albert_park');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('Snapshot provenance must specify at least one valid source or baseline reference');
    });

    it('rejects duplicate driverId in predictions', () => {
      const snap = getValidBase();
      snap.predictions[1].driverId = snap.predictions[0].driverId;
      const res = validateSnapshot(snap, 2025, 1, 'albert_park');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('Duplicate driverId');
    });

    it('rejects missing driver from expected roster', () => {
      const snap = getValidBase();
      const removed = snap.predictions.pop()!;
      // Compensate probability to Norris (the winner) so invariants remain intact
      snap.predictions[0].winProbability = Number((snap.predictions[0].winProbability + removed.winProbability).toFixed(4));
      if (snap.predictedWinner) {
        snap.predictedWinner.winProbability = snap.predictions[0].winProbability;
      }
      const res = validateSnapshot(snap, 2025, 1, 'albert_park');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('Missing driver');
    });

    it('rejects non-finite probability (NaN)', () => {
      const snap = getValidBase();
      snap.predictions[0].winProbability = NaN;
      const res = validateSnapshot(snap, 2025, 1, 'albert_park');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('Non-finite probability');
    });

    it('rejects probability out of bounds (< 0.0 or > 1.0)', () => {
      const snap = getValidBase();
      snap.predictions[0].winProbability = 1.5;
      const res = validateSnapshot(snap, 2025, 1, 'albert_park');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('out of bounds [0, 1]');
    });

    it('rejects probability sum outside tolerance', () => {
      const snap = getValidBase();
      snap.predictions.forEach(p => { p.winProbability = 0.01; });
      const res = validateSnapshot(snap, 2025, 1, 'albert_park');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('Field probabilities sum to 0.2000, expected 1.0');
    });

    it('rejects mismatched predicted winner', () => {
      const snap = getValidBase();
      if (snap.predictedWinner) {
        snap.predictedWinner.driverId = 'leclerc';
      }
      const res = validateSnapshot(snap, 2025, 1, 'albert_park');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain("Predicted winner 'leclerc' does not match highest probability driver 'norris'");
    });

    it('rejects invalid timestamp format', () => {
      const snap = getValidBase();
      snap.generatedAtUtc = 'not-a-timestamp';
      const res = validateSnapshot(snap, 2025, 1, 'albert_park');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('not a valid ISO 8601 UTC timestamp');
    });

    it('rejects timestamp outside physical bounds (year 2099)', () => {
      const snap = getValidBase();
      snap.generatedAtUtc = '2099-01-01T00:00:00Z';
      const res = validateSnapshot(snap, 2025, 1, 'albert_park');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('is outside valid range [2000, 2050]');
    });

    it('rejects 2026 predictions claiming HISTORICAL_VALIDATED status', () => {
      const snap2026 = JSON.parse(fs.readFileSync(artifact2026Path, 'utf-8'));
      snap2026.regulationEraWarning = {
        isUnknownRegulationEra: false,
        regulationEra: 'ground_effect_gen2',
        warningCode: 'HISTORICAL_VALIDATED',
        disclaimer: 'Invalid claim'
      };
      const res = validateSnapshot(snap2026, 2026, 1, 'albert_park');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('2026 predictions cannot claim HISTORICAL_VALIDATED status');
    });
  });

  describe('Precedence & Revision Identity', () => {
    it('ranks official_grid strictly above provisional regardless of generation timestamp', () => {
      const provSnap: RacePredictionResponse = JSON.parse(fs.readFileSync(artifact2025Path, 'utf-8'));
      provSnap.stage = 'provisional';
      provSnap.generatedAtUtc = '2025-03-15T18:00:00Z';

      const officialSnap: RacePredictionResponse = JSON.parse(fs.readFileSync(artifact2025Path, 'utf-8'));
      officialSnap.stage = 'official_grid';
      officialSnap.qualifyingStatus.hasPenaltiesApplied = true;
      officialSnap.generatedAtUtc = '2025-03-15T12:00:00Z'; // older timestamp!

      // official_grid beats provisional even if older
      expect(compareSnapshotPrecedence(officialSnap, provSnap)).toBe(1);
      expect(compareSnapshotPrecedence(provSnap, officialSnap)).toBe(-1);
    });

    it('prefers newer timestamp when stage is identical', () => {
      const snapA: RacePredictionResponse = JSON.parse(fs.readFileSync(artifact2025Path, 'utf-8'));
      snapA.generatedAtUtc = '2025-03-15T12:00:00Z';

      const snapB: RacePredictionResponse = JSON.parse(fs.readFileSync(artifact2025Path, 'utf-8'));
      snapB.generatedAtUtc = '2025-03-15T16:00:00Z';

      expect(compareSnapshotPrecedence(snapB, snapA)).toBe(1);
      expect(compareSnapshotPrecedence(snapA, snapB)).toBe(-1);
    });

    it('uses deterministic inputHash tiebreak when stage and timestamps are identical', () => {
      const snapA: RacePredictionResponse = JSON.parse(fs.readFileSync(artifact2025Path, 'utf-8'));
      snapA.inputHash = 'aaaa111122223333';

      const snapB: RacePredictionResponse = JSON.parse(fs.readFileSync(artifact2025Path, 'utf-8'));
      snapB.inputHash = 'bbbb111122223333';

      expect(compareSnapshotPrecedence(snapB, snapA)).toBeGreaterThan(0);
      expect(compareSnapshotPrecedence(snapA, snapB)).toBeLessThan(0);
    });
  });
});
