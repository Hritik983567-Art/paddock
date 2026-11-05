#!/usr/bin/env python3
"""
Unit and Integration Tests for Phase 3C.4F.1.2: Complete Inference Hash & Contract Freeze

Tests:
1. Cryptographic Baseline Immutability.
2. Ten-Point Hash Verification Suite (Decoupled Hash A & Hash B).
3. Contract Consistency & Production Safety Gate.
"""

import sys
import json
import hashlib
from pathlib import Path
import numpy as np
import pandas as pd
import pytest

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from scripts.predictor_model.features import ALL_MODEL_FEATURES
from scripts.predictor_model.experimental_2025_validation.phase_3c_4f_1_2.phase_4f_1_2_hash_contract import (
    compute_canonical_inference_input_hash,
    compute_canonical_prediction_output_hash,
    build_frozen_hybrid_prediction_response,
    STAGE_PROVISIONAL,
    STAGE_OFFICIAL_GRID,
    MODEL_VERSION_TAG,
    FEATURE_SCHEMA_VERSION,
    BASELINE_VERSION_TAG,
    BASELINE_ALPHA,
    HYBRID_FORMULA_VERSION_TAG,
    HYBRID_BLEND_WEIGHT,
    EXPERIMENTAL_STATUS_TAG
)

REPORTS_DIR = PROJECT_ROOT / "scripts" / "predictor_model" / "reports" / "phase_3c_4f_1_2"
ORIGINAL_CSV = PROJECT_ROOT / "data" / "predictor" / "f1_race_predictor_dataset.csv"
FROZEN_MODEL = PROJECT_ROOT / "models" / "predictor" / "v1.0.0" / "trained_models.joblib"
REMEDIATED_CSV = PROJECT_ROOT / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_v1_remediated.csv"
CANDIDATE_2025_CSV = PROJECT_ROOT / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_2025_candidate.csv"

EXPECTED_HASHES = {
    "ORIGINAL_CSV": "B1F50EF057E5AF732325BB8A784D96B92B34B4441900CEB2A0FD66B579C629AF",
    "FROZEN_MODEL": "D8244024E6B7F0F31912EFE80B35652EF228461955232DDE7E4D65ECCC5779CD",
    "REMEDIATED_CSV": "691A19643107241A995D0AF90483A335EC35C47C479A07C447449DEC3F6056FE",
    "CANDIDATE_2025_CSV": "8BADE433D7BE82903B1326D68706C0E4851F80D80DDEC618EFA896E0C6363329",
}


# -----------------------------------------------------------------------------
# 1. Cryptographic Baseline Tests
# -----------------------------------------------------------------------------
def test_cryptographic_baseline_immutability():
    paths = {
        "ORIGINAL_CSV": ORIGINAL_CSV,
        "FROZEN_MODEL": FROZEN_MODEL,
        "REMEDIATED_CSV": REMEDIATED_CSV,
        "CANDIDATE_2025_CSV": CANDIDATE_2025_CSV,
    }
    for name, path in paths.items():
        with open(path, "rb") as f:
            h = hashlib.sha256(f.read()).hexdigest().upper()
        assert h == EXPECTED_HASHES[name], f"Cryptographic mismatch for {name}!"


# -----------------------------------------------------------------------------
# 2. Ten-Point Hash Verification Suite Tests
# -----------------------------------------------------------------------------
@pytest.fixture
def sample_test_fixtures():
    def make_driver(d_id: str, grid: int, pts: float):
        feats = {f: 0.0 for f in ALL_MODEL_FEATURES}
        feats["grid_position"] = grid
        feats["quali_position"] = grid
        feats["driver_season_points_before_gp"] = pts
        return {"driver_id": d_id, "features": feats}

    drivers = [
        make_driver("verstappen", 1, 0.0),
        make_driver("leclerc", 2, 0.0),
        make_driver("norris", 3, 0.0),
    ]
    preds = [
        {"driver_id": "verstappen", "grid_position": 1, "grid_win_probability": 0.50, "ml_win_probability": 0.45, "hybrid_win_probability": 0.49},
        {"driver_id": "leclerc", "grid_position": 2, "grid_win_probability": 0.20, "ml_win_probability": 0.25, "hybrid_win_probability": 0.21},
        {"driver_id": "norris", "grid_position": 3, "grid_win_probability": 0.15, "ml_win_probability": 0.15, "hybrid_win_probability": 0.15},
    ]
    return drivers, preds


def test_1_identical_inputs_produce_identical_hashes(sample_test_fixtures):
    drivers, preds = sample_test_fixtures
    h_in_1, _ = compute_canonical_inference_input_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, drivers)
    h_in_2, _ = compute_canonical_inference_input_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, drivers)
    h_out_1, _ = compute_canonical_prediction_output_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, preds)
    h_out_2, _ = compute_canonical_prediction_output_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, preds)

    assert h_in_1 == h_in_2
    assert h_out_1 == h_out_2
    assert len(h_in_1) == 64
    assert len(h_out_1) == 64


def test_2_order_invariance(sample_test_fixtures):
    drivers, preds = sample_test_fixtures
    h_in_orig, _ = compute_canonical_inference_input_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, drivers)
    h_out_orig, _ = compute_canonical_prediction_output_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, preds)

    # Permuted row orders
    drivers_perm = [drivers[2], drivers[0], drivers[1]]
    preds_perm = [preds[2], preds[0], preds[1]]

    h_in_perm, _ = compute_canonical_inference_input_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, drivers_perm)
    h_out_perm, _ = compute_canonical_prediction_output_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, preds_perm)

    assert h_in_orig == h_in_perm
    assert h_out_orig == h_out_perm


def test_3_all_42_features_sensitive():
    base_feats = {f: 0.0 for f in ALL_MODEL_FEATURES}
    base_driver = {"driver_id": "verstappen", "features": base_feats}
    base_hash, _ = compute_canonical_inference_input_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, [base_driver])

    for feat in ALL_MODEL_FEATURES:
        mut_feats = dict(base_feats)
        mut_feats[feat] = 1.0  # modify single feature
        mut_driver = {"driver_id": "verstappen", "features": mut_feats}
        mut_hash, _ = compute_canonical_inference_input_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, [mut_driver])
        assert mut_hash != base_hash, f"Inference input hash was insensitive to feature '{feat}'!"


def test_4_driver_id_sensitivity(sample_test_fixtures):
    drivers, preds = sample_test_fixtures
    h_in_orig, _ = compute_canonical_inference_input_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, drivers)
    h_out_orig, _ = compute_canonical_prediction_output_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, preds)

    mut_drivers = [
        {"driver_id": "piastri", "features": drivers[0]["features"]},
        drivers[1],
        drivers[2]
    ]
    mut_preds = [
        {"driver_id": "piastri", "grid_position": 1, "grid_win_probability": 0.50, "ml_win_probability": 0.45, "hybrid_win_probability": 0.49},
        preds[1],
        preds[2]
    ]

    h_in_mut, _ = compute_canonical_inference_input_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, mut_drivers)
    h_out_mut, _ = compute_canonical_prediction_output_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, mut_preds)

    assert h_in_mut != h_in_orig
    assert h_out_mut != h_out_orig


def test_5_race_identity_sensitivity(sample_test_fixtures):
    drivers, preds = sample_test_fixtures
    h_in_orig, _ = compute_canonical_inference_input_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, drivers)
    h_out_orig, _ = compute_canonical_prediction_output_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, preds)

    h_in_mut, _ = compute_canonical_inference_input_hash("2024_02", 2024, 2, "jeddah", STAGE_PROVISIONAL, drivers)
    h_out_mut, _ = compute_canonical_prediction_output_hash("2024_02", 2024, 2, "jeddah", STAGE_PROVISIONAL, preds)

    assert h_in_mut != h_in_orig
    assert h_out_mut != h_out_orig


def test_6_stage_sensitivity(sample_test_fixtures):
    drivers, preds = sample_test_fixtures
    h_in_orig, _ = compute_canonical_inference_input_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, drivers)
    h_out_orig, _ = compute_canonical_prediction_output_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, preds)

    h_in_mut, _ = compute_canonical_inference_input_hash("2024_01", 2024, 1, "bahrain", STAGE_OFFICIAL_GRID, drivers)
    h_out_mut, _ = compute_canonical_prediction_output_hash("2024_01", 2024, 1, "bahrain", STAGE_OFFICIAL_GRID, preds)

    assert h_in_mut != h_in_orig
    assert h_out_mut != h_out_orig


def test_7_metadata_and_weight_sensitivity(sample_test_fixtures):
    drivers, _ = sample_test_fixtures
    base_h, _ = compute_canonical_inference_input_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, drivers)

    # Change blend weight
    h_w, _ = compute_canonical_inference_input_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, drivers, blend_weight=0.30)
    assert h_w != base_h

    # Change baseline alpha
    h_a, _ = compute_canonical_inference_input_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, drivers, baseline_alpha=5.0)
    assert h_a != base_h

    # Change model version
    h_m, _ = compute_canonical_inference_input_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, drivers, model_version="v2.0.0")
    assert h_m != base_h

    # Change feature schema version
    h_s, _ = compute_canonical_inference_input_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, drivers, feature_schema_version="2.0.0")
    assert h_s != base_h


def test_8_output_probability_sensitivity(sample_test_fixtures):
    drivers, preds = sample_test_fixtures
    h_in_orig, _ = compute_canonical_inference_input_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, drivers)
    h_out_orig, _ = compute_canonical_prediction_output_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, preds)

    preds_mut = [
        {"driver_id": "verstappen", "grid_position": 1, "grid_win_probability": 0.55, "ml_win_probability": 0.45, "hybrid_win_probability": 0.52},
        preds[1],
        preds[2]
    ]
    h_in_after, _ = compute_canonical_inference_input_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, drivers)
    h_out_after, _ = compute_canonical_prediction_output_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, preds_mut)

    # Output hash MUST change, input hash MUST NOT change
    assert h_out_after != h_out_orig
    assert h_in_after == h_in_orig


def test_9_feature_mutation_decoupled_from_output_hash(sample_test_fixtures):
    drivers, preds = sample_test_fixtures
    h_in_orig, _ = compute_canonical_inference_input_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, drivers)
    h_out_orig, _ = compute_canonical_prediction_output_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, preds)

    # Mutate feature on driver
    drivers_mut = [
        {"driver_id": "verstappen", "features": dict(drivers[0]["features"], driver_season_points_before_gp=100.0)},
        drivers[1],
        drivers[2]
    ]

    h_in_mut, _ = compute_canonical_inference_input_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, drivers_mut)
    h_out_preserved, _ = compute_canonical_prediction_output_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, preds)

    # Input hash MUST change, output hash MUST remain identical
    assert h_in_mut != h_in_orig
    assert h_out_preserved == h_out_orig


def test_10_deterministic_repeatability(sample_test_fixtures):
    drivers, preds = sample_test_fixtures
    in_hashes = {compute_canonical_inference_input_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, drivers)[0] for _ in range(50)}
    out_hashes = {compute_canonical_prediction_output_hash("2024_01", 2024, 1, "bahrain", STAGE_PROVISIONAL, preds)[0] for _ in range(50)}
    assert len(in_hashes) == 1
    assert len(out_hashes) == 1


# -----------------------------------------------------------------------------
# 3. Contract Consistency & Response Builder Tests
# -----------------------------------------------------------------------------
def test_full_response_contract_fields_and_stage_enforcement():
    race_df = pd.DataFrame({
        "race_id": ["2024_01"] * 2,
        "season": [2024] * 2,
        "round": [1] * 2,
        "circuit_id": ["bahrain"] * 2,
        "driver_id": ["verstappen", "leclerc"],
        "driver_code": ["VER", "LEC"],
        "grid_position": [1, 2]
    })
    for feat in ALL_MODEL_FEATURES:
        if feat not in race_df:
            race_df[feat] = 0.0

    p_grid = np.array([0.6, 0.4])
    p_ml = np.array([0.5, 0.5])
    p_hybrid = np.array([0.58, 0.42])

    resp = build_frozen_hybrid_prediction_response(
        race_df=race_df,
        p_grid=p_grid,
        p_ml=p_ml,
        p_hybrid=p_hybrid,
        stage=STAGE_PROVISIONAL
    )

    resp_dict = resp.to_dict()
    assert resp_dict["prediction_stage"] == STAGE_PROVISIONAL
    assert resp_dict["diagnostics"]["stage_status"] == "RUNNABLE"
    assert resp_dict["diagnostics"]["production_gate"] == "STRICTLY CLOSED"
    assert resp_dict["diagnostics"]["model_c_trained"] is False
    assert len(resp_dict["inference_input_hash"]) == 64
    assert len(resp_dict["prediction_output_hash"]) == 64

    for pred in resp_dict["predictions"]:
        assert len(pred["inference_input_hash"]) == 64
        assert len(pred["prediction_output_hash"]) == 64
        assert pred["experimental_status"] == EXPERIMENTAL_STATUS_TAG
        assert pred["model_version"] == MODEL_VERSION_TAG
        assert pred["hybrid_formula_version"] == HYBRID_FORMULA_VERSION_TAG

