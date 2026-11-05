#!/usr/bin/env python3
"""
Unit Test Suite for Phase 3C.4F.2.1: Walk-Forward Validation Integrity Audit

Validates:
1. Cryptographic immutability of protected artifacts.
2. Chronological separation and identity isolation across folds.
3. Feature temporal availability and zero post-race leakage across all 42 features.
4. Training-only preprocessing encapsulation (no validation contamination).
5. Training-only calibration audit (in-sample vs chronological out-of-fold).
6. Probability normalization and race target conservation.
7. Statistical multiplicity corrections (Bonferroni, Holm) and metric reproducibility.
8. Observed tail-risk maximum qualification and worst-case error bounds.
9. Governance invariant: Production gate closed and Model C non-promotion.
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

REPORTS_DIR = PROJECT_ROOT / "scripts" / "predictor_model" / "reports" / "phase_3c_4f_2_1"
INTEGRITY_JSON = REPORTS_DIR / "phase_4f_2_1_integrity_audit.json"
FEATURE_JSON = REPORTS_DIR / "phase_4f_2_1_feature_leakage_audit.json"
CALIBRATION_JSON = REPORTS_DIR / "phase_4f_2_1_calibration_audit.json"

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
    """Verify that protected files match their expected cryptographic hashes."""
    for name, (path, expected_hash) in PROTECTED_HASHES.items():
        assert path.exists(), f"Protected file missing: {path}"
        actual = hashlib.sha256(path.read_bytes()).hexdigest().upper()
        assert actual == expected_hash, f"Hash mismatch for {name}: expected {expected_hash}, got {actual}"


def test_chronological_separation_and_identity_isolation():
    """Verify temporal separation, zero overlap, and driver record integrity across folds."""
    assert INTEGRITY_JSON.exists(), f"Missing {INTEGRITY_JSON}"
    with open(INTEGRITY_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    folds = data["folds"]

    # Fold 1
    f1 = folds["fold_1"]
    assert f1["train"]["row_count"] == 439
    assert f1["val"]["row_count"] == 439
    assert f1["train"]["race_count"] == 22
    assert f1["val"]["race_count"] == 22
    assert f1["train"]["duplicates_count"] == 0
    assert f1["val"]["duplicates_count"] == 0
    assert f1["isolation"]["zero_race_overlap"] is True
    assert f1["isolation"]["strictly_chronological"] is True
    assert f1["isolation"]["days_between_train_and_val"] > 0
    assert f1["isolation"]["leakage_verdict"] == "VERIFIED_ZERO_LEAKAGE"

    # Fold 2
    f2 = folds["fold_2"]
    assert f2["train"]["row_count"] == 878
    assert f2["val"]["row_count"] == 439
    assert f2["train"]["race_count"] == 44
    assert f2["val"]["race_count"] == 22
    assert f2["train"]["duplicates_count"] == 0
    assert f2["val"]["duplicates_count"] == 0
    assert f2["isolation"]["zero_race_overlap"] is True
    assert f2["isolation"]["strictly_chronological"] is True
    assert f2["isolation"]["days_between_train_and_val"] > 0
    assert f2["isolation"]["leakage_verdict"] == "VERIFIED_ZERO_LEAKAGE"


def test_feature_temporal_availability_and_zero_leakage():
    """Verify that all 42 features are pre-race with zero post-race information."""
    assert FEATURE_JSON.exists(), f"Missing {FEATURE_JSON}"
    with open(FEATURE_JSON, "r", encoding="utf-8") as f:
        feat_data = json.load(f)

    audit = feat_data["feature_temporal_audit"]
    assert audit["total_features_audited"] == 42
    assert audit["features_with_post_race_leakage"] == 0
    assert audit["zero_leakage_stage_a_eligible"] == 40
    assert audit["zero_leakage_stage_b_dependent"] == 2  # grid_position, grid_penalty_delta
    assert feat_data["overall_leakage_verdict"] == "VERIFIED_ZERO_LEAKAGE"


def test_2023_performance_investigation():
    """Verify the explanation and findings for Fold 2 (2023) standalone ML performance."""
    with open(FEATURE_JSON, "r", encoding="utf-8") as f:
        feat_data = json.load(f)

    investigation = feat_data["investigation_2023_ml_performance"]
    assert investigation["finding"] == "GENUINE_MONOPOLY_PREDICTABILITY_CONFIRMED"
    ctx = investigation["season_context"]
    assert ctx["total_races"] == 22
    assert ctx["verstappen_wins"] == 19
    assert ctx["red_bull_total_wins"] == 21
    assert round(ctx["red_bull_win_pct"], 1) == 95.5
    assert round(investigation["mean_ml_log_loss"], 4) == 0.3720


def test_training_only_preprocessing_encapsulation():
    """Verify that imputer and scaler statistics are fitted strictly on in-sample training data."""
    with open(INTEGRITY_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    prep_audit = data["preprocessing_isolation_audit"]
    assert prep_audit["pipeline_encapsulation"] == "VERIFIED_STRICT_TRAINING_FIT"
    assert prep_audit["num_imputer_medians_fitted_on_train_only"] is True
    assert prep_audit["categorical_encoder_fitted_on_train_only"] is True
    assert prep_audit["zero_validation_leakage_in_transform"] is True


def test_temperature_calibration_audit():
    """Verify in-sample vs out-of-fold calibration diagnostics and performance."""
    assert CALIBRATION_JSON.exists(), f"Missing {CALIBRATION_JSON}"
    with open(CALIBRATION_JSON, "r", encoding="utf-8") as f:
        calib_data = json.load(f)

    temp_audit = calib_data["temperature_calibration_audit"]

    # Fold 1
    f1 = temp_audit["fold_1"]
    assert f1["in_sample_temperature"]["temperature"] < 1.0
    assert f1["in_sample_temperature"]["verdict"] == "OPTIMISTIC_IN_SAMPLE_OVERFITTING"
    assert f1["out_of_fold_temperature"]["temperature"] > 0.90
    assert f1["out_of_fold_temperature"]["verdict"] == "RIGOROUS_TRAINING_ONLY_CHRONOLOGICAL_OOF"

    # Fold 2
    f2 = temp_audit["fold_2"]
    assert f2["in_sample_temperature"]["temperature"] < 1.0
    assert f2["in_sample_temperature"]["verdict"] == "OPTIMISTIC_IN_SAMPLE_OVERFITTING"
    assert f2["out_of_fold_temperature"]["temperature"] > 1.0
    assert f2["out_of_fold_temperature"]["verdict"] == "RIGOROUS_TRAINING_ONLY_CHRONOLOGICAL_OOF"

    # Candidate w=0.20 beats baseline under both regimes
    base_ll_f1 = f1["in_sample_temperature"]["metrics"]["w_0.00"]["mean_log_loss"]
    w20_ll_f1_in = f1["in_sample_temperature"]["metrics"]["w_0.20"]["mean_log_loss"]
    w20_ll_f1_oof = f1["out_of_fold_temperature"]["metrics"]["w_0.20"]["mean_log_loss"]
    assert w20_ll_f1_in < base_ll_f1
    assert w20_ll_f1_oof < base_ll_f1


def test_statistical_multiplicity_and_race_level_tests():
    """Verify paired tests, sample size (N=44 races), and Bonferroni/Holm corrections."""
    with open(CALIBRATION_JSON, "r", encoding="utf-8") as f:
        calib_data = json.load(f)

    stat_audit = calib_data["statistical_multiplicity_audit"]
    assert stat_audit["sample_size_races"] == 44
    assert stat_audit["total_candidate_hypotheses"] == 12

    # Verify w=0.20 passes multiple testing corrections
    w20_res = [r for r in stat_audit["results_by_weight"] if r["weight"] == 0.20][0]
    assert w20_res["passes_bonferroni"] is True
    assert w20_res["passes_holm_bonferroni"] is True
    assert w20_res["adjusted_p_value"] < 0.05
    assert w20_res["delta_mean"] < -0.30

    # Verify standalone ML (w=1.00) fails multiple testing corrections
    w100_res = [r for r in stat_audit["results_by_weight"] if r["weight"] == 1.00][0]
    assert w100_res["passes_bonferroni"] is False
    assert w100_res["passes_holm_bonferroni"] is False
    assert w100_res["nominal_p_value_ttest"] > 0.10


def test_observed_tail_risk_qualification():
    """Verify that maximum race-level log loss is properly qualified as an observed sample maximum."""
    with open(CALIBRATION_JSON, "r", encoding="utf-8") as f:
        calib_data = json.load(f)

    tail = calib_data["calibration_and_tail_risk_audit"]["tail_risk_observed_worst_races"]

    for w_name in ["w_0.00_baseline", "w_0.20_candidate", "w_1.00_standalone_ml"]:
        entry = tail[w_name]
        assert entry["qualification"] == "OBSERVED_SAMPLE_MAXIMUM_NOT_GUARANTEED_BOUND"
        assert len(entry["worst_5_races"]) == 5
        assert entry["observed_max_log_loss"] > 0.0


def test_governance_and_closed_production_gate():
    """Verify that all audit JSON deliverables affirm strict production gate closure."""
    for json_path in [INTEGRITY_JSON, FEATURE_JSON, CALIBRATION_JSON]:
        with open(json_path, "r", encoding="utf-8") as f:
            d = json.load(f)
        assert d["metadata"]["production_gate"] == "STRICTLY CLOSED"
        assert d["metadata"]["model_c_trained"] is False

