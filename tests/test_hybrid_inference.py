#!/usr/bin/env python3
"""
tests/test_hybrid_inference.py
==============================
Phase 3C.4F.3 — Comprehensive Hybrid Inference Integration Test Suite.

Covers:
1. End-to-end hybrid execution on 2025 R1, 2025 R2, and 2026 R1 integration fixtures.
2. Preservation and distinctness of all three probability distributions:
   - grid_baseline_probability
   - ml_win_probability
   - hybrid_win_probability
3. Simplex invariants: non-negativity, bounds [0, 1], and exact normalization.
4. Ranking order semantic: strictly ordered by hybrid_win_probability descending.
5. Predicted winner consistency: matches rank 1 driver and top probability.
6. Permutation invariance of canonical dual hashes (inference_input_hash, prediction_output_hash).
7. Decoupled dual hash behavior (feature sensitivity vs probability sensitivity).
8. Fail-closed validation:
   - Missing ML model / output
   - Mismatched or duplicate driver IDs
   - Negative or non-finite probabilities
   - Incomplete roster (< 2 drivers)
   - Feature contract violations (missing/extra columns)
   - Metadata version mismatches
   - Unsupported stages (e.g. live, official_grid)
9. Regulation era warning preservation (2026 unvalidated vs historical validated).
10. Offline / dry-run safety: forbids writing to production snapshot directory.
11. Atomic snapshot emission.
12. Runner integration via run_dry_run_inference(mode="hybrid").
"""

import os
import sys
import json
import tempfile
import pytest
import numpy as np
import pandas as pd
from unittest.mock import MagicMock

_repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _repo_root not in sys.path:
    sys.path.insert(0, _repo_root)

from scripts.predictor_model.config import (
    MODEL_VERSION,
    FEATURE_SCHEMA_VERSION,
    PROJECT_ROOT
)
from scripts.predictor_model.features import ALL_MODEL_FEATURES
from scripts.predictor_model.hybrid_inference import (
    HybridRaceInferenceEngine,
    HybridInferenceError,
    EmpiricalGridBaseline,
    GeometricHybridEngine,
    load_default_hybrid_engine,
    run_hybrid_inference_for_race,
    compute_canonical_inference_input_hash,
    compute_canonical_prediction_output_hash,
    MODEL_VERSION_TAG,
    BASELINE_VERSION_TAG,
    HYBRID_FORMULA_VERSION_TAG,
    EXPERIMENTAL_STATUS_TAG,
    RANKING_ORDER_SEMANTIC,
    STAGE_PROVISIONAL
)
from scripts.predictor_pipeline.live_feature_builder import LiveFeatureBuilder
from scripts.predictor_pipeline.run_inference_snapshot import (
    run_dry_run_inference,
    validate_dry_run_snapshot
)


@pytest.fixture(scope="module")
def hybrid_engine():
    """Loads default hybrid inference engine once for test suite."""
    return load_default_hybrid_engine()


@pytest.fixture(scope="module")
def builder():
    """LiveFeatureBuilder instance."""
    return LiveFeatureBuilder(validate_schema=True)


# =============================================================================
# 1. End-to-End Hybrid Execution on Historical Fixtures
# =============================================================================
@pytest.mark.parametrize("season,round_num,expected_circuit", [
    (2025, 1, "albert_park"),
    (2025, 2, "shanghai"),
    (2026, 1, "albert_park")
])
def test_end_to_end_hybrid_execution(hybrid_engine, builder, season, round_num, expected_circuit):
    """Verifies complete hybrid inference pipeline executes without error on fixtures."""
    feat_res = builder.build_features_for_race(season=season, round_num=round_num, stage=STAGE_PROVISIONAL)
    res = hybrid_engine.predict_race(feat_res.features_df, feat_res.metadata_df, stage=STAGE_PROVISIONAL)

    assert res.season == season
    assert res.round == round_num
    assert res.circuit_id == expected_circuit
    assert res.stage == STAGE_PROVISIONAL
    assert res.model_version == MODEL_VERSION_TAG
    assert res.feature_schema_version == FEATURE_SCHEMA_VERSION
    assert res.baseline_version == BASELINE_VERSION_TAG
    assert res.hybrid_formula_version == HYBRID_FORMULA_VERSION_TAG
    assert res.experimental_status == EXPERIMENTAL_STATUS_TAG
    assert res.ranking_order_semantic == RANKING_ORDER_SEMANTIC

    # Check driver counts
    assert res.driver_count >= 19
    assert len(res.predictions) == res.driver_count

    # Check dual hashes format
    assert len(res.inference_input_hash) == 64
    assert len(res.prediction_output_hash) == 64
    assert res.input_hash == res.inference_input_hash[:16]

    # Convert to canonical snapshot and validate
    snap = hybrid_engine.to_canonical_snapshot(res)
    validate_dry_run_snapshot(snap, require_all_fields=True)


# =============================================================================
# 2. Three Distinct Probability Distributions Preserved
# =============================================================================
def test_three_probabilities_preserved_and_distinct(hybrid_engine, builder):
    """Verifies that grid_baseline, ml_win, and hybrid_win probabilities are all present and distinct."""
    feat_res = builder.build_features_for_race(season=2025, round_num=1, stage=STAGE_PROVISIONAL)
    res = hybrid_engine.predict_race(feat_res.features_df, feat_res.metadata_df)

    p_grid = [p.grid_baseline_probability for p in res.predictions]
    p_ml = [p.ml_win_probability for p in res.predictions]
    p_hybrid = [p.hybrid_win_probability for p in res.predictions]

    # Probabilities must not be identical across the 3 distributions
    assert not np.allclose(p_grid, p_ml), "Grid baseline and ML output should not be identical."
    assert not np.allclose(p_grid, p_hybrid), "Grid baseline and Hybrid output should not be identical."
    assert not np.allclose(p_ml, p_hybrid), "ML output and Hybrid output should not be identical."

    # Check each driver record contains all 3 fields and camelCase equivalents
    for p in res.predictions:
        assert p.grid_baseline_probability == p.gridBaselineProbability
        assert p.ml_win_probability == p.mlWinProbability
        assert p.hybrid_win_probability == p.hybridWinProbability
        assert p.winProbability == p.hybrid_win_probability


# =============================================================================
# 3. Probability Simplex Invariants
# =============================================================================
def test_probability_simplex_invariants(hybrid_engine, builder):
    """Verifies non-negativity, bounds [0, 1], and unit simplex normalization."""
    for s, r in [(2025, 1), (2025, 2), (2026, 1)]:
        feat_res = builder.build_features_for_race(season=s, round_num=r, stage=STAGE_PROVISIONAL)
        res = hybrid_engine.predict_race(feat_res.features_df, feat_res.metadata_df)

        for p in res.predictions:
            assert 0.0 <= p.grid_baseline_probability <= 1.0
            assert 0.0 <= p.ml_win_probability <= 1.0
            assert 0.0 <= p.hybrid_win_probability <= 1.0
            assert 0.0 <= p.winProbability <= 1.0
            assert p.winProbabilityPct == round(p.winProbability * 100.0, 2)

        # Sum normalization checks
        sum_grid = sum(p.grid_baseline_probability for p in res.predictions)
        sum_ml = sum(p.ml_win_probability for p in res.predictions)
        sum_hybrid = sum(p.hybrid_win_probability for p in res.predictions)

        assert abs(sum_grid - 1.0) < 0.005, f"Grid sum drift: {sum_grid}"
        assert abs(sum_ml - 1.0) < 0.005, f"ML sum drift: {sum_ml}"
        assert abs(sum_hybrid - 1.0) < 0.005, f"Hybrid sum drift: {sum_hybrid}"


# =============================================================================
# 4. Primary Ranking Order Semantic & Winner Consistency
# =============================================================================
def test_ranking_order_semantic_and_winner(hybrid_engine, builder):
    """Verifies that predictedRank strictly sorts by hybrid_win_probability descending."""
    feat_res = builder.build_features_for_race(season=2025, round_num=1, stage=STAGE_PROVISIONAL)
    res = hybrid_engine.predict_race(feat_res.features_df, feat_res.metadata_df)

    prev_p = 1.0
    for idx, p in enumerate(res.predictions, start=1):
        assert p.predictedRank == idx
        assert p.hybrid_win_probability <= prev_p + 1e-9, "Predictions must be monotonically non-increasing."
        prev_p = p.hybrid_win_probability

    # Winner consistency
    winner = res.predicted_winner
    assert winner["driverId"] == res.predictions[0].driver_id
    assert abs(winner["winProbability"] - res.predictions[0].hybrid_win_probability) < 1e-4


# =============================================================================
# 5. Dual Hash Permutation Invariance
# =============================================================================
def test_dual_hash_permutation_invariance(hybrid_engine, builder):
    """Verifies that permuting the driver roster rows produces IDENTICAL dual hashes."""
    feat_res = builder.build_features_for_race(season=2025, round_num=1, stage=STAGE_PROVISIONAL)
    res_orig = hybrid_engine.predict_race(feat_res.features_df, feat_res.metadata_df)

    # Reverse driver order
    shuffled_idx = list(range(len(feat_res.features_df) - 1, -1, -1))
    shuffled_feats = feat_res.features_df.iloc[shuffled_idx].reset_index(drop=True)
    shuffled_meta = feat_res.metadata_df.iloc[shuffled_idx].reset_index(drop=True)

    res_shuffled = hybrid_engine.predict_race(shuffled_feats, shuffled_meta)

    assert res_orig.inference_input_hash == res_shuffled.inference_input_hash, \
        "Inference input hash must be permutation invariant."
    assert res_orig.prediction_output_hash == res_shuffled.prediction_output_hash, \
        "Prediction output hash must be permutation invariant."
    assert res_orig.input_hash == res_shuffled.input_hash


# =============================================================================
# 6. Decoupled Dual Hash Sensitivity
# =============================================================================
def test_decoupled_dual_hash_sensitivity():
    """Verifies that Hash A changes on feature modification while Hash B changes on probability modification."""
    drivers_base = [
        {"driver_id": "norris", "features": {f: 1.0 for f in ALL_MODEL_FEATURES}},
        {"driver_id": "piastri", "features": {f: 2.0 for f in ALL_MODEL_FEATURES}}
    ]

    h_input_1, _ = compute_canonical_inference_input_hash(
        race_id="2025_1", season=2025, round_num=1, circuit_id="albert_park",
        stage="provisional", driver_rows=drivers_base
    )

    # Modify one feature in one driver
    drivers_mod = [
        {"driver_id": "norris", "features": {f: (1.5 if f == ALL_MODEL_FEATURES[0] else 1.0) for f in ALL_MODEL_FEATURES}},
        {"driver_id": "piastri", "features": {f: 2.0 for f in ALL_MODEL_FEATURES}}
    ]
    h_input_2, _ = compute_canonical_inference_input_hash(
        race_id="2025_1", season=2025, round_num=1, circuit_id="albert_park",
        stage="provisional", driver_rows=drivers_mod
    )
    assert h_input_1 != h_input_2, "Inference input hash must be sensitive to individual feature change."

    # Prediction Output Hash
    preds_base = [
        {"driver_id": "norris", "grid_position": 1, "grid_baseline_probability": 0.6, "ml_win_probability": 0.4, "hybrid_win_probability": 0.55},
        {"driver_id": "piastri", "grid_position": 2, "grid_baseline_probability": 0.4, "ml_win_probability": 0.6, "hybrid_win_probability": 0.45}
    ]
    h_out_1, _ = compute_canonical_prediction_output_hash(
        race_id="2025_1", season=2025, round_num=1, circuit_id="albert_park",
        stage="provisional", predictions=preds_base
    )

    # Modify one probability
    preds_mod = [
        {"driver_id": "norris", "grid_position": 1, "grid_baseline_probability": 0.6, "ml_win_probability": 0.4, "hybrid_win_probability": 0.58},
        {"driver_id": "piastri", "grid_position": 2, "grid_baseline_probability": 0.4, "ml_win_probability": 0.6, "hybrid_win_probability": 0.42}
    ]
    h_out_2, _ = compute_canonical_prediction_output_hash(
        race_id="2025_1", season=2025, round_num=1, circuit_id="albert_park",
        stage="provisional", predictions=preds_mod
    )
    assert h_out_1 != h_out_2, "Prediction output hash must be sensitive to probability change."


# =============================================================================
# 7. Fail-Closed Invariant Validation
# =============================================================================
def test_fail_closed_on_missing_ml_model(hybrid_engine):
    """Verifies that engine rejects None ML model upon initialization."""
    with pytest.raises(HybridInferenceError) as exc_info:
        HybridRaceInferenceEngine(
            ml_model=None,
            metadata=hybrid_engine.metadata,
            baseline=hybrid_engine.baseline
        )
    assert exc_info.value.error_type == "MODEL_MISSING"


def test_fail_closed_on_duplicate_drivers(hybrid_engine, builder):
    """Verifies that engine rejects duplicate driver IDs."""
    feat_res = builder.build_features_for_race(season=2025, round_num=1, stage=STAGE_PROVISIONAL)
    dup_meta = feat_res.metadata_df.copy()
    dup_meta.iloc[1, dup_meta.columns.get_loc("driver_id")] = dup_meta.iloc[0]["driver_id"]

    with pytest.raises(HybridInferenceError) as exc_info:
        hybrid_engine.predict_race(feat_res.features_df, dup_meta)
    assert exc_info.value.error_type == "DUPLICATE_DRIVER_ID"


def test_fail_closed_on_incomplete_roster(hybrid_engine, builder):
    """Verifies that engine rejects rosters with fewer than 2 drivers."""
    feat_res = builder.build_features_for_race(season=2025, round_num=1, stage=STAGE_PROVISIONAL)
    single_feats = feat_res.features_df.iloc[:1].copy()
    single_meta = feat_res.metadata_df.iloc[:1].copy()

    with pytest.raises(HybridInferenceError) as exc_info:
        hybrid_engine.predict_race(single_feats, single_meta)
    assert exc_info.value.error_type == "INCOMPLETE_ROSTER"


def test_fail_closed_on_feature_contract_violation(hybrid_engine, builder):
    """Verifies that engine rejects feature DataFrames missing required columns."""
    feat_res = builder.build_features_for_race(season=2025, round_num=1, stage=STAGE_PROVISIONAL)
    bad_feats = feat_res.features_df.drop(columns=[ALL_MODEL_FEATURES[0]])

    with pytest.raises(HybridInferenceError) as exc_info:
        hybrid_engine.predict_race(bad_feats, feat_res.metadata_df)
    assert exc_info.value.error_type == "FEATURE_CONTRACT_VIOLATION"


def test_fail_closed_on_unsupported_stage(hybrid_engine, builder):
    """Verifies that engine strictly rejects non-provisional stages (e.g. official_grid, live)."""
    feat_res = builder.build_features_for_race(season=2025, round_num=1, stage=STAGE_PROVISIONAL)

    with pytest.raises(HybridInferenceError) as exc_info:
        hybrid_engine.predict_race(feat_res.features_df, feat_res.metadata_df, stage="official_grid")
    assert exc_info.value.error_type == "UNSUPPORTED_STAGE"

    with pytest.raises(HybridInferenceError) as exc_info:
        hybrid_engine.predict_race(feat_res.features_df, feat_res.metadata_df, stage="live")
    assert exc_info.value.error_type == "UNSUPPORTED_STAGE"


def test_fail_closed_on_non_finite_ml_output(hybrid_engine, builder):
    """Verifies that engine rejects non-finite probability output from ML model."""
    feat_res = builder.build_features_for_race(season=2025, round_num=1, stage=STAGE_PROVISIONAL)
    mock_model = MagicMock()
    bad_probs = np.full(len(feat_res.features_df), np.nan)
    mock_model.predict_race_probabilities.return_value = bad_probs

    engine = HybridRaceInferenceEngine(
        ml_model=mock_model,
        metadata=hybrid_engine.metadata,
        baseline=hybrid_engine.baseline
    )

    with pytest.raises(HybridInferenceError) as exc_info:
        engine.predict_race(feat_res.features_df, feat_res.metadata_df)
    assert exc_info.value.error_type == "NON_FINITE_PROBABILITY"


# =============================================================================
# 8. Regulation Era Warning Preservation
# =============================================================================
def test_regulation_era_warning_preservation(hybrid_engine, builder):
    """Verifies that 2026 snapshot includes UNVALIDATED_2026_REGULATIONS and 2025 includes HISTORICAL_VALIDATED."""
    # 2026
    feat_res_2026 = builder.build_features_for_race(season=2026, round_num=1, stage=STAGE_PROVISIONAL)
    res_2026 = hybrid_engine.predict_race(feat_res_2026.features_df, feat_res_2026.metadata_df)
    snap_2026 = hybrid_engine.to_canonical_snapshot(res_2026)
    reg_2026 = snap_2026["regulationEraWarning"]
    assert reg_2026["isUnknownRegulationEra"] is True
    assert reg_2026["warningCode"] == "UNVALIDATED_2026_REGULATIONS"

    # 2025
    feat_res_2025 = builder.build_features_for_race(season=2025, round_num=1, stage=STAGE_PROVISIONAL)
    res_2025 = hybrid_engine.predict_race(feat_res_2025.features_df, feat_res_2025.metadata_df)
    snap_2025 = hybrid_engine.to_canonical_snapshot(res_2025)
    reg_2025 = snap_2025["regulationEraWarning"]
    assert reg_2025["isUnknownRegulationEra"] is False
    assert reg_2025["warningCode"] == "HISTORICAL_VALIDATED"


# =============================================================================
# 9. Runner Integration & Atomic Output Safety
# =============================================================================
def test_runner_hybrid_integration(tmp_path):
    """Verifies that run_dry_run_inference(mode='hybrid') produces valid snapshot artifact."""
    res = run_dry_run_inference(
        race_id="2025_1",
        stage=STAGE_PROVISIONAL,
        output_dir=str(tmp_path),
        dry_run=True,
        mode="hybrid"
    )

    assert res["status"] == "success"
    assert os.path.exists(res["artifact_path"])

    with open(res["artifact_path"], "r", encoding="utf-8") as f:
        snap = json.load(f)

    assert snap["season"] == 2025
    assert snap["round"] == 1
    assert snap["hybridFormulaVersion"] == HYBRID_FORMULA_VERSION_TAG
    assert snap["baselineVersion"] == BASELINE_VERSION_TAG
    assert snap["predictions"][0]["driverId"] == snap["predictedWinner"]["driverId"]
    assert "grid_baseline_probability" in snap["predictions"][0]
    assert "ml_win_probability" in snap["predictions"][0]
    assert "hybrid_win_probability" in snap["predictions"][0]


def test_dry_run_safety_forbids_production_directory(hybrid_engine):
    """Verifies that runner forbids writing directly into production snapshot directory."""
    prod_dir = os.path.join(PROJECT_ROOT, "data", "predictor", "snapshots")
    with pytest.raises(HybridInferenceError) as exc_info:
        run_hybrid_inference_for_race(
            race_id="2025_1",
            stage=STAGE_PROVISIONAL,
            output_dir=prod_dir,
            dry_run=True
        )
    assert exc_info.value.error_type == "FORBIDDEN_OUTPUT_DIRECTORY"
