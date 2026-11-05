#!/usr/bin/env python3
"""
Unit Test Suite for Phase 3C.4F.2: Chronological Walk-Forward Hybrid Validation

Validates:
1. Cryptographic immutability of protected artifacts.
2. Temporal integrity and zero data leakage across chronological folds.
3. Metric reproducibility for Grid Baseline, Conservative Candidate (w=0.20), and Standalone ML.
4. Loss surface convexity, numerical curvature, and regime tension between 2022 and 2023.
5. Slicing by starting grid group and non-pole upset robustness.
6. Probabilistic calibration (ECE, MCE, reliability bins, Shannon entropy, tail-risk).
7. Strict production gate closure and Model C non-promotion attestations.
"""

import sys
import json
import hashlib
from pathlib import Path
import pytest
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

REPORTS_DIR = PROJECT_ROOT / "scripts" / "predictor_model" / "reports" / "phase_3c_4f_2"
WALK_FORWARD_JSON = REPORTS_DIR / "phase_4f_2_walk_forward.json"
WEIGHT_SWEEP_JSON = REPORTS_DIR / "phase_4f_2_weight_sweep.json"
CALIBRATION_JSON = REPORTS_DIR / "phase_4f_2_calibration.json"

PROTECTED_HASHES = {
    "ORIGINAL_CSV": (
        PROJECT_ROOT / "data" / "predictor" / "f1_race_predictor_dataset.csv",
        "B1F50EF057E5AF732325BB8A784D96B92B34B4441900CEB2A0FD66B579C629AF"
    ),
    "FROZEN_MODEL": (
        PROJECT_ROOT / "models" / "predictor" / "v1.0.0" / "trained_models.joblib",
        "D8244024E6B7F0F31912EFE80B35652EF228461955232DDE7E4D65ECCC5779CD"
    ),
    "REMEDIATED_CSV": (
        PROJECT_ROOT / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_v1_remediated.csv",
        "691A19643107241A995D0AF90483A335EC35C47C479A07C447449DEC3F6056FE"
    ),
    "CANDIDATE_2025_CSV": (
        PROJECT_ROOT / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_2025_candidate.csv",
        "8BADE433D7BE82903B1326D68706C0E4851F80D80DDEC618EFA896E0C6363329"
    )
}


def test_cryptographic_baseline_immutability():
    """Verify that all 4 protected artifacts maintain strict cryptographic integrity."""
    for name, (path, expected_hash) in PROTECTED_HASHES.items():
        assert path.exists(), f"Protected file missing: {path}"
        actual_hash = hashlib.sha256(path.read_bytes()).hexdigest().upper()
        assert actual_hash == expected_hash, (
            f"Cryptographic hash mismatch for {name}!\n"
            f"Expected: {expected_hash}\n"
            f"Actual:   {actual_hash}"
        )


def test_walk_forward_temporal_integrity():
    """Verify zero future data leakage and strict chronological ordering across folds."""
    assert WALK_FORWARD_JSON.exists(), f"Missing {WALK_FORWARD_JSON}"
    with open(WALK_FORWARD_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    folds = data["folds"]
    assert "fold_1" in folds
    assert "fold_2" in folds

    # Fold 1: Train strictly on 2021, validate strictly on 2022
    f1 = folds["fold_1"]["provenance"]
    assert f1["train_seasons"] == [2021]
    assert f1["val_season"] == [2022]
    assert f1["train_races"] == 22
    assert f1["val_races"] == 22
    assert f1["train_starts"] == 439
    assert f1["val_starts"] == 439

    # Fold 2: Train strictly on 2021-2022, validate strictly on 2023
    f2 = folds["fold_2"]["provenance"]
    assert f2["train_seasons"] == [2021, 2022]
    assert f2["val_season"] == [2023]
    assert f2["train_races"] == 44
    assert f2["val_races"] == 22
    assert f2["train_starts"] == 878
    assert f2["val_starts"] == 439

    # Check pooled validation consistency (44 total unseen races)
    pooled = data["pooled_chronological_validation"]
    assert pooled["total_val_races"] == 44
    assert pooled["val_seasons"] == [2022, 2023]


def test_walk_forward_baseline_and_hybrid_metrics():
    """Verify reproducible performance metrics for Grid Baseline, w=0.20, and Standalone ML."""
    with open(WALK_FORWARD_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    pooled_weights = data["pooled_chronological_validation"]["weights_summary"]

    # Baseline w=0.00
    base = pooled_weights["w_0.00"]
    assert round(base["mean_log_loss"], 4) == 1.6888
    assert round(base["mean_brier_score"], 4) == 0.6674
    assert base["top1_hits"] == 24
    assert round(base["top1_accuracy"], 4) == round(24 / 44, 4)

    # Conservative Candidate w=0.20
    w20 = pooled_weights["w_0.20"]
    assert round(w20["mean_log_loss"], 4) == 1.3748
    assert round(w20["mean_brier_score"], 4) == 0.5944
    assert w20["top1_hits"] == 26
    assert round(w20["top1_accuracy"], 4) == round(26 / 44, 4)
    assert round(w20["delta_vs_grid_baseline"]["delta_mean_log_loss"], 4) == -0.3140
    assert w20["delta_vs_grid_baseline"]["nominal_p_value"] < 0.001

    # Standalone ML w=1.00
    ml = pooled_weights["w_1.00"]
    assert round(ml["mean_log_loss"], 4) == 1.2787
    assert round(ml["mean_brier_score"], 4) == 0.5923
    assert ml["top1_hits"] == 27


def test_loss_surface_convexity_and_regime_tension():
    """Verify surface convexity, minimum locations, and regime tension dynamics."""
    assert WEIGHT_SWEEP_JSON.exists(), f"Missing {WEIGHT_SWEEP_JSON}"
    with open(WEIGHT_SWEEP_JSON, "r", encoding="utf-8") as f:
        sweep = json.load(f)

    curv = sweep["surface_curvature"]

    # Fold 1 (2022 Val): Minimum at w=0.30
    assert curv["fold_1_2022"]["min_weight"] == 0.30
    assert round(curv["fold_1_2022"]["min_loss"], 4) == 1.7196

    # Fold 2 (2023 Val): Minimum at w=1.00
    assert curv["fold_2_2023"]["min_weight"] == 1.00
    assert round(curv["fold_2_2023"]["min_loss"], 4) == 0.3720

    # Pooled Validation: Minimum at w=0.60
    assert curv["pooled_validation"]["min_weight"] == 0.60
    assert round(curv["pooled_validation"]["min_loss"], 4) == 1.1634

    # Check local convexity around pooled minimum (second derivative > 0)
    pooled_sec = {item["weight"]: item["curvature_d2L_dw2"] for item in curv["pooled_validation"]["second_derivatives"]}
    assert 0.60 in pooled_sec
    assert pooled_sec[0.60] > 0.0, "Pooled loss surface must be convex around w=0.60"

    # Verify gain capture ratios for conservative candidate w=0.20
    gain_ratios = sweep["regime_tension_synthesis"]["gain_capture_ratios"]
    assert gain_ratios["2022_w020_capture_pct"] > 90.0, "w=0.20 must capture over 90% of achievable 2022 gain"
    assert gain_ratios["2023_w020_capture_pct"] > 40.0, "w=0.20 must capture over 40% of achievable 2023 gain"


def test_slicing_and_upset_race_robustness():
    """Verify grid group slicing and upset race performance across pooled races."""
    with open(WALK_FORWARD_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    pooled = data["pooled_chronological_validation"]

    # Grid group slicing
    grid_groups = pooled["grid_position_group_analysis"]
    assert "P1_Pole" in grid_groups
    assert "P2_P3_Front" in grid_groups
    assert "P4_P10_Points" in grid_groups
    assert "P11_P20_Back" in grid_groups

    # Non-pole upset slicing: exactly 20 upset races out of 44 (12 in 2022, 8 in 2023)
    upsets = pooled["non_pole_upset_analysis"]
    assert upsets["upset_races_count"] == 20
    # Baseline vs w=0.20 on upset races
    base_upset_ll = upsets["weights_summary"]["w_0.00"]["mean_log_loss"]
    w20_upset_ll = upsets["weights_summary"]["w_0.20"]["mean_log_loss"]
    assert base_upset_ll > 2.0
    assert w20_upset_ll > 2.0


def test_probabilistic_calibration_and_tail_risk():
    """Verify Expected Calibration Error (ECE), entropy dispersion, and tail-risk bounds."""
    assert CALIBRATION_JSON.exists(), f"Missing {CALIBRATION_JSON}"
    with open(CALIBRATION_JSON, "r", encoding="utf-8") as f:
        calib = json.load(f)

    calib_weights = calib["calibration_by_weight"]

    # Baseline calibration
    w0_calib = calib_weights["w_0.00"]
    assert w0_calib["ece_overall"] < 0.015

    # w=0.20 calibration
    w20_calib = calib_weights["w_0.20"]
    assert w20_calib["ece_overall"] < 0.020  # Well within 2% ECE
    assert w20_calib["mce_overall"] < 0.40

    # Shannon Entropy decreases monotonically with higher ML weight
    entropy_00 = calib_weights["w_0.00"]["dispersion_metrics"]["mean_shannon_entropy"]
    entropy_20 = calib_weights["w_0.20"]["dispersion_metrics"]["mean_shannon_entropy"]
    entropy_60 = calib_weights["w_0.60"]["dispersion_metrics"]["mean_shannon_entropy"]
    entropy_100 = calib_weights["w_1.00"]["dispersion_metrics"]["mean_shannon_entropy"]

    assert entropy_00 > entropy_20 > entropy_60 > entropy_100
    assert round(entropy_00, 2) == 1.64
    assert round(entropy_20, 2) == 1.35
    assert round(entropy_100, 2) == 0.47

    # Tail-risk: Max single-race log loss for w=0.20 is bounded vs pure ML
    max_ll_20 = w20_calib["tail_risk_audit"]["winner_underconfidence_risk"]["maximum_single_race_log_loss"]
    max_ll_100 = calib_weights["w_1.00"]["tail_risk_audit"]["winner_underconfidence_risk"]["maximum_single_race_log_loss"]
    assert max_ll_20 < 6.0
    assert max_ll_100 > 7.0


def test_governance_and_production_gate():
    """Verify that all artifacts strictly enforce production gate closure."""
    for json_file in [WALK_FORWARD_JSON, WEIGHT_SWEEP_JSON, CALIBRATION_JSON]:
        with open(json_file, "r", encoding="utf-8") as f:
            d = json.load(f)
        meta = d["metadata"]
        assert meta["production_gate"] == "STRICTLY CLOSED"
        assert meta["model_c_trained"] is False
