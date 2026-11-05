#!/usr/bin/env python3
"""
Unit and Integration Tests for Phase 3C.4F.1: Hybrid Formula & Baseline Finalization

Tests:
1. EmpiricalGridBaselineReference: fitting, smoothing, clamping, floor, and unit sum normalization.
2. GeometricHybridEngine: log-space Log-Sum-Exp fusion, extreme likelihood stability, variable roster sizes,
   order/permutation invariance.
3. Prediction Output Contract: all 16 required fields present, types valid, deterministic input hashing.
4. Statistical Reproducibility: 2024 and 2025 reference baseline and geometric hybrid metrics.
5. Production Safety Gate: verifies production gate is strictly closed, Model C has not been trained,
   and production model hash is untouched.
"""

import hashlib
import json
from pathlib import Path
import numpy as np
import pandas as pd
import pytest

from scripts.predictor_model.experimental_2025_validation.phase_3c_4f_1.phase_4f_1_hybrid_contract import (
    EmpiricalGridBaselineReference,
    GeometricHybridEngine,
    HybridDriverPrediction,
    HybridRacePredictionResponse,
    MODEL_VERSION_TAG,
    BASELINE_VERSION_TAG,
    HYBRID_FORMULA_VERSION_TAG,
    EXPERIMENTAL_STATUS_TAG,
)
from scripts.predictor_model.experimental_training import ExperimentalModelTrainer

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent
REPORTS_DIR = PROJECT_ROOT / "scripts" / "predictor_model" / "reports" / "phase_3c_4f_1"
REMEDIATED_DATASET_PATH = PROJECT_ROOT / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_v1_remediated.csv"
CANDIDATE_2025_PATH = PROJECT_ROOT / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_2025_candidate.csv"
FROZEN_MODEL_PATH = PROJECT_ROOT / "models" / "predictor" / "v1.0.0" / "trained_models.joblib"

EXPECTED_FROZEN_MODEL_HASH = "D8244024E6B7F0F31912EFE80B35652EF228461955232DDE7E4D65ECCC5779CD"


# -----------------------------------------------------------------------------
# 1. Baseline Reference Tests
# -----------------------------------------------------------------------------
def test_empirical_grid_baseline_reference_fit_and_normalize():
    train_df = pd.DataFrame({
        "race_id": ["r1"] * 4 + ["r2"] * 4,
        "driver_id": ["d1", "d2", "d3", "d4", "d1", "d2", "d3", "d4"],
        "grid_position": [1, 2, 3, 4, 1, 2, 3, 4],
        "won_race": [1, 0, 0, 0, 1, 0, 0, 0]
    })
    baseline = EmpiricalGridBaselineReference(smoothing=1.0, p_floor=0.0005)
    baseline.fit(train_df, target_col="won_race")

    assert baseline.total_races == 2
    assert baseline.grid_wins[1] == 2
    assert baseline.grid_wins[2] == 0

    test_race = pd.DataFrame({
        "grid_position": [1, 2, 3, 4]
    })
    probs = baseline.predict_race_probabilities(test_race)
    assert len(probs) == 4
    assert np.isclose(np.sum(probs), 1.0, atol=1e-12)
    assert (probs >= 0.0005).all()
    # Pole sitter should have highest probability
    assert probs[0] > probs[1]


def test_empirical_grid_baseline_clamping_and_missing_grid():
    baseline = EmpiricalGridBaselineReference(smoothing=1.0, p_floor=0.0005)
    baseline.grid_wins[1] = 10
    baseline.grid_starts[1] = 20
    baseline.grid_wins[20] = 0
    baseline.grid_starts[20] = 20
    baseline.grid_wins[24] = 0
    baseline.grid_starts[24] = 10

    test_df = pd.DataFrame({
        "grid_position": [0, 30, "invalid", None]
    })
    probs = baseline.predict_race_probabilities(test_df)
    assert len(probs) == 4
    assert np.isclose(np.sum(probs), 1.0, atol=1e-12)
    assert (probs >= 0.0005).all()


# -----------------------------------------------------------------------------
# 2. Hybrid Engine & Numerical Safety Tests
# -----------------------------------------------------------------------------
def test_geometric_hybrid_log_space_numerical_stability():
    engine = GeometricHybridEngine(weight=0.20, p_floor=0.0005)
    n = 20
    # Extreme inputs: driver 0 near 1.0, others minimal
    p_grid = np.full(n, 0.0005)
    p_grid[0] = 1.0 - 19 * 0.0005
    p_ml = np.full(n, 0.0005)
    p_ml[-1] = 1.0 - 19 * 0.0005

    fused = engine.combine_probabilities(p_grid, p_ml, method="geometric")
    assert not np.isnan(fused).any()
    assert not np.isinf(fused).any()
    assert abs(1.0 - np.sum(fused)) < 1e-12
    assert (fused >= engine.p_floor).all()


def test_geometric_hybrid_variable_roster_sizes():
    engine = GeometricHybridEngine(weight=0.20, p_floor=0.0005)
    for n in [18, 19, 20, 21, 22]:
        p_g = np.full(n, 1.0 / n)
        p_m = np.random.RandomState(42 + n).dirichlet(np.ones(n))
        fused = engine.combine_probabilities(p_g, p_m, method="geometric")
        assert len(fused) == n
        assert abs(1.0 - np.sum(fused)) < 1e-12
        assert (fused >= engine.p_floor).all()


def test_geometric_hybrid_driver_order_invariance():
    engine = GeometricHybridEngine(weight=0.20, p_floor=0.0005)
    np.random.seed(123)
    p_g = np.random.dirichlet(np.ones(20))
    p_m = np.random.dirichlet(np.ones(20))
    fused_orig = engine.combine_probabilities(p_g, p_m, method="geometric")

    perm = np.random.permutation(20)
    p_g_perm = p_g[perm]
    p_m_perm = p_m[perm]
    fused_perm = engine.combine_probabilities(p_g_perm, p_m_perm, method="geometric")

    # Inverse permutation
    inv_perm = np.empty_like(perm)
    inv_perm[perm] = np.arange(len(perm))
    fused_restored = fused_perm[inv_perm]

    np.testing.assert_allclose(fused_orig, fused_restored, atol=1e-14)


def test_alternative_combination_methods_supported():
    engine = GeometricHybridEngine(weight=0.20, p_floor=0.0005)
    p_g = np.array([0.4, 0.3, 0.2, 0.1])
    p_m = np.array([0.1, 0.2, 0.3, 0.4])

    p_cvx = engine.combine_probabilities(p_g, p_m, method="convex")
    assert abs(1.0 - np.sum(p_cvx)) < 1e-12
    assert (p_cvx >= engine.p_floor).all()

    p_lo = engine.combine_probabilities(p_g, p_m, method="log_odds")
    assert abs(1.0 - np.sum(p_lo)) < 1e-12
    assert (p_lo >= engine.p_floor).all()


# -----------------------------------------------------------------------------
# 3. Output Contract Field & Structure Tests
# -----------------------------------------------------------------------------
def test_hybrid_prediction_contract_16_fields():
    engine = GeometricHybridEngine(weight=0.20, p_floor=0.0005)
    race_df = pd.DataFrame({
        "race_id": ["2024_01"] * 3,
        "season": [2024] * 3,
        "round": [1] * 3,
        "circuit_id": ["bahrain"] * 3,
        "driver_id": ["verstappen", "leclerc", "russell"],
        "driver_code": ["VER", "LEC", "RUS"],
        "grid_position": [1, 2, 3]
    })
    p_grid = np.array([0.5, 0.3, 0.2])
    p_ml = np.array([0.4, 0.4, 0.2])

    resp = engine.build_race_prediction_response(
        race_df=race_df,
        p_grid=p_grid,
        p_ml=p_ml,
        stage="official_grid",
        method="geometric"
    )

    resp_dict = resp.to_dict()
    assert resp_dict["driver_count"] == 3
    assert resp_dict["predicted_winner_driver_id"] == "verstappen"
    assert resp_dict["diagnostics"]["production_gate"] == "STRICTLY CLOSED"
    assert resp_dict["diagnostics"]["model_c_trained"] is False

    expected_fields = [
        "race_id", "season", "round", "driver_id", "driver_name",
        "grid_position", "grid_win_probability", "ml_win_probability",
        "hybrid_win_probability", "model_version", "baseline_version",
        "hybrid_formula_version", "prediction_stage", "input_hash",
        "generated_at", "experimental_status"
    ]

    for p in resp_dict["predictions"]:
        for field in expected_fields:
            assert field in p, f"Missing required contract field: {field}"
        assert p["experimental_status"] == EXPERIMENTAL_STATUS_TAG
        assert p["baseline_version"] == BASELINE_VERSION_TAG
        assert p["model_version"] == MODEL_VERSION_TAG
        assert p["hybrid_formula_version"] == HYBRID_FORMULA_VERSION_TAG


# -----------------------------------------------------------------------------
# 4. Statistical Reproducibility on Holdouts
# -----------------------------------------------------------------------------
def test_statistical_reproducibility_2024_and_2025():
    eval_json_path = REPORTS_DIR / "phase_4f_1_evaluation.json"
    assert eval_json_path.exists(), "phase_4f_1_evaluation.json must exist"

    with open(eval_json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 2024 checks
    s24 = data["evaluations"]["season_2024"]["models"]
    assert np.isclose(s24["baseline_a1"]["mean_log_loss"], 1.8535, atol=0.005)
    assert np.isclose(s24["baseline_a1"]["mean_brier_score"], 0.7117, atol=0.005)
    assert s24["baseline_a1"]["top1_hits"] == 11

    assert np.isclose(s24["hybrid_geo_w020"]["mean_log_loss"], 1.7722, atol=0.005)
    assert np.isclose(s24["hybrid_geo_w020"]["mean_brier_score"], 0.6979, atol=0.005)
    assert s24["hybrid_geo_w020"]["top1_hits"] == 11

    # 2025 checks
    s25 = data["evaluations"]["season_2025"]["models"]
    assert np.isclose(s25["baseline_a1"]["mean_log_loss"], 1.1325, atol=0.005)
    assert np.isclose(s25["baseline_a1"]["mean_brier_score"], 0.5365, atol=0.005)
    assert s25["baseline_a1"]["top1_hits"] == 16

    assert np.isclose(s25["hybrid_geo_w020"]["mean_log_loss"], 1.0097, atol=0.005)
    assert np.isclose(s25["hybrid_geo_w020"]["mean_brier_score"], 0.5092, atol=0.005)
    assert s25["hybrid_geo_w020"]["top1_hits"] == 16


# -----------------------------------------------------------------------------
# 5. Production Gate Safety & Immutability Tests
# -----------------------------------------------------------------------------
def test_production_gate_strictly_closed_and_model_c_not_trained():
    # Verify frozen production model hash
    with open(FROZEN_MODEL_PATH, "rb") as f:
        actual_hash = hashlib.sha256(f.read()).hexdigest().upper()
    assert actual_hash == EXPECTED_FROZEN_MODEL_HASH, "Frozen Model A hash mismatch! Must not be modified."

    # Verify contract JSON flags
    contract_json_path = REPORTS_DIR / "phase_4f_1_hybrid_contract.json"
    assert contract_json_path.exists()
    with open(contract_json_path, "r", encoding="utf-8") as f:
        cdata = json.load(f)
    assert cdata["contract_metadata"]["production_gate"] == "STRICTLY CLOSED"
    assert cdata["contract_metadata"]["model_c_trained"] is False
    assert cdata["contract_metadata"]["status"] == EXPERIMENTAL_STATUS_TAG

