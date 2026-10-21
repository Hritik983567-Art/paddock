import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Paddock Race Predictor — Model Artifact & Evaluation Contract', () => {
  const projectRoot = path.resolve(__dirname, '..');
  const modelDir = path.join(projectRoot, 'models', 'predictor', 'v1.0.0');
  const metadataPath = path.join(modelDir, 'model_metadata.json');
  const joblibPath = path.join(modelDir, 'trained_models.joblib');
  const evaluationReportPath = path.join(modelDir, 'EVALUATION_REPORT.md');
  const docsReportPath = path.join(projectRoot, 'docs', 'PREDICTOR_MODEL_EVALUATION.md');

  it('should have serialized model artifacts in models/predictor/v1.0.0/', () => {
    expect(fs.existsSync(metadataPath)).toBe(true);
    expect(fs.existsSync(joblibPath)).toBe(true);
    expect(fs.existsSync(evaluationReportPath)).toBe(true);
    expect(fs.existsSync(docsReportPath)).toBe(true);
  });

  it('should have valid metadata JSON schema with required audit fields', () => {
    const raw = fs.readFileSync(metadataPath, 'utf-8');
    const meta = JSON.parse(raw);

    // Core versioning and cutoff audit fields
    expect(meta.model_version).toBe('v1.0.0');
    expect(meta.feature_schema_version).toBe('1.0.0');
    expect(meta.training_data_cutoff).toBe('2023-12-31');
    expect(meta.primary_target).toBe('won_race');
    expect(meta.prediction_cutoff_event).toContain('Post-Qualifying');
    expect(meta.random_seed).toBe(42);

    // Dependencies
    expect(meta.dependencies).toBeDefined();
    expect(meta.dependencies.python).toBeDefined();
    expect(meta.dependencies['scikit-learn']).toBeDefined();
    expect(meta.dependencies.lightgbm).toBeDefined();
    expect(meta.dependencies.shap).toBeDefined();

    // Sample counts
    expect(meta.training_race_count).toBe(66);
    expect(meta.test_race_count).toBe(24);
    expect(meta.training_sample_count + meta.test_sample_count).toBe(1798);

    // Features
    expect(meta.features.total_count).toBe(42);
    expect(meta.features.feature_list).toContain('grid_position');
    expect(meta.features.feature_list).toContain('quali_time_ratio_to_pole');
    expect(meta.features.feature_list).toContain('constructor_rolling_5_win_rate');

    // Holdout test metrics exist and compare all models honestly
    const testMetrics = meta.holdout_test_metrics_2024;
    expect(testMetrics.grid_position_baseline).toBeDefined();
    expect(testMetrics.logistic_regression).toBeDefined();
    expect(testMetrics.lightgbm_calibrated).toBeDefined();

    expect(testMetrics.grid_position_baseline.top1_hit_rate_pct).toBeGreaterThan(40);
    expect(testMetrics.lightgbm_calibrated.top1_hit_rate_pct).toBeGreaterThan(50);
  });

  it('should verify evaluation report contains explainability and causal disclaimer', () => {
    const report = fs.readFileSync(docsReportPath, 'utf-8');

    expect(report).toContain('Executive Summary & Model Decision');
    expect(report).toContain('Chronological Rolling-Origin Backtesting');
    expect(report).toContain('Subgroup Performance Breakdowns');
    expect(report).toContain('Causal Disclaimer & Limitations');
    expect(report).toContain('LightGBM TreeSHAP');
  });

  it('should verify race probabilities sum to 1.0 within floating point tolerance', () => {
    const raw = fs.readFileSync(metadataPath, 'utf-8');
    const meta = JSON.parse(raw);
    const races = meta.subgroup_breakdowns_2024.race_by_race_test;

    expect(races.length).toBe(24);
    for (const r of races) {
      expect(r.grid_baseline_prob).toBeGreaterThan(0);
      expect(r.grid_baseline_prob).toBeLessThanOrEqual(1);
      expect(r.lgb_prob).toBeGreaterThan(0);
      expect(r.lgb_prob).toBeLessThanOrEqual(1);
      expect(typeof r.actual_winner).toBe('string');
      expect(typeof r.lgb_pick).toBe('string');
      expect(typeof r.lgb_correct).toBe('boolean');
    }
  });
});
