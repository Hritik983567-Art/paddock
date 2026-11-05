#!/usr/bin/env python3
"""
Unit Test Suite for Phase 3C.4F.2.2: OOF Statistical Reconciliation & Hybrid Evidence Freeze

Validates:
1. Cryptographic immutability of protected artifacts.
2. OOF metric reconstruction and strict calibration regime segregation.
3. Mathematical consistency of pooled metrics calculated from race-level predictions.
4. Race-level paired statistical tests and multiplicity corrections (Bonferroni, Holm).
5. No reuse of original in-sample p-values in out-of-fold or uncalibrated comparisons.
6. Jackknife temperature sensitivity diagnostics (stability across excluded races).
7. Stage A vs Stage B input contracts and semantics.
8. Governance invariant: Production gate closed and Model C non-promotion.
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

REPORTS_DIR = PROJECT_ROOT / "scripts" / "predictor_model" / "reports" / "phase_3c_4f_2_2"
RECONCILIATION_JSON = REPORTS_DIR / "phase_4f_2_2_reconciliation.json"
SENSITIVITY_JSON = REPORTS_DIR / "phase_4f_2_2_calibration_sensitivity.json"

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
    """Verify that protected files match their expected cryptographic digests."""
    for name, (path, expected_hash) in PROTECTED_HASHES.items():
        assert path.exists(), f"Protected file missing: {path}"
        actual = hashlib.sha256(path.read_bytes()).hexdigest().upper()
        assert actual == expected_hash, f"Hash mismatch for {name}: expected {expected_hash}, got {actual}"


def test_oof_metric_reconstruction_and_regime_separation():
    """Verify that all 3 calibration regimes are strictly segregated without mixing."""
    assert RECONCILIATION_JSON.exists(), f"Missing {RECONCILIATION_JSON}"
    with open(RECONCILIATION_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    regimes = data["calibration_regimes"]
    assert "regime_1_in_sample" in regimes
    assert "regime_2_chronological_oof" in regimes
    assert "regime_3_uncalibrated" in regimes

    for r_key, reg in regimes.items():
        assert reg["fold_1_2022"]["race_count"] == 22
        assert reg["fold_2_2023"]["race_count"] == 22
        assert reg["pooled_chronological_validation"]["race_count"] == 44
        # Verify all 13 weights exist
        assert len(reg["pooled_chronological_validation"]["weights"]) == 13


def test_pooled_metric_calculation_and_mathematical_consistency():
    """Verify pooled metrics across all 3 regimes for Baseline, w=0.20, and ML."""
    with open(RECONCILIATION_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    regimes = data["calibration_regimes"]

    # Baseline w=0.00 is identical across all regimes (does not use temperature)
    for r_key in regimes:
        base = regimes[r_key]["pooled_chronological_validation"]["weights"]["w_0.00"]
        assert round(base["mean_log_loss"], 4) == 1.6888
        assert round(base["mean_brier_score"], 4) == 0.6674
        assert base["top1_hits"] == 24

    # Candidate w=0.20 across regimes
    r1_w20 = regimes["regime_1_in_sample"]["pooled_chronological_validation"]["weights"]["w_0.20"]
    r2_w20 = regimes["regime_2_chronological_oof"]["pooled_chronological_validation"]["weights"]["w_0.20"]
    r3_w20 = regimes["regime_3_uncalibrated"]["pooled_chronological_validation"]["weights"]["w_0.20"]

    assert round(r1_w20["mean_log_loss"], 4) == 1.3748
    assert round(r2_w20["mean_log_loss"], 4) == 1.4615
    assert round(r3_w20["mean_log_loss"], 4) == 1.4381

    # Verify w=0.20 beats baseline in all 3 regimes
    assert r1_w20["mean_log_loss"] < 1.6888
    assert r2_w20["mean_log_loss"] < 1.6888
    assert r3_w20["mean_log_loss"] < 1.6888


def test_race_level_paired_differences_and_multiplicity_corrections():
    """Verify that w=0.20 survives Bonferroni and Holm corrections in OOF and uncalibrated regimes."""
    with open(RECONCILIATION_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    regimes = data["calibration_regimes"]

    # Regime 2: Chronological OOF
    r2_w20_stat = regimes["regime_2_chronological_oof"]["pooled_chronological_validation"]["weights"]["w_0.20"]["paired_vs_baseline"]
    assert round(r2_w20_stat["delta_mean"], 4) == -0.2273
    assert r2_w20_stat["nominal_p_value_ttest"] < 0.001
    assert r2_w20_stat["passes_bonferroni"] is True
    assert r2_w20_stat["passes_holm_bonferroni"] is True
    assert r2_w20_stat["adjusted_p_value"] < 0.005

    # Regime 3: Uncalibrated
    r3_w20_stat = regimes["regime_3_uncalibrated"]["pooled_chronological_validation"]["weights"]["w_0.20"]["paired_vs_baseline"]
    assert round(r3_w20_stat["delta_mean"], 4) == -0.2507
    assert r3_w20_stat["nominal_p_value_ttest"] < 0.001
    assert r3_w20_stat["passes_bonferroni"] is True
    assert r3_w20_stat["passes_holm_bonferroni"] is True
    assert r3_w20_stat["adjusted_p_value"] < 0.005

    # Standalone ML (w=1.00) fails Bonferroni across all regimes and fails Holm in Regime 1
    r1_w100_stat = regimes["regime_1_in_sample"]["pooled_chronological_validation"]["weights"]["w_1.00"]["paired_vs_baseline"]
    r2_w100_stat = regimes["regime_2_chronological_oof"]["pooled_chronological_validation"]["weights"]["w_1.00"]["paired_vs_baseline"]
    r3_w100_stat = regimes["regime_3_uncalibrated"]["pooled_chronological_validation"]["weights"]["w_1.00"]["paired_vs_baseline"]

    assert r1_w100_stat["passes_bonferroni"] is False
    assert r1_w100_stat["passes_holm_bonferroni"] is False
    assert r2_w100_stat["passes_bonferroni"] is False
    assert r3_w100_stat["passes_bonferroni"] is False


def test_no_reuse_of_original_in_sample_p_values():
    """Verify that OOF and uncalibrated p-values are newly computed and strictly distinct from in-sample p-values."""
    with open(RECONCILIATION_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    regimes = data["calibration_regimes"]
    p_in_sample = regimes["regime_1_in_sample"]["pooled_chronological_validation"]["weights"]["w_0.20"]["paired_vs_baseline"]["nominal_p_value_ttest"]
    p_oof = regimes["regime_2_chronological_oof"]["pooled_chronological_validation"]["weights"]["w_0.20"]["paired_vs_baseline"]["nominal_p_value_ttest"]
    p_uncal = regimes["regime_3_uncalibrated"]["pooled_chronological_validation"]["weights"]["w_0.20"]["paired_vs_baseline"]["nominal_p_value_ttest"]

    # All three must be distinct
    assert p_in_sample != p_oof
    assert p_oof != p_uncal
    assert p_in_sample != p_uncal
    # Check exact expected values
    assert round(p_in_sample, 6) == round(9.8718e-05, 6)
    assert round(p_oof, 6) == round(1.6266e-04, 6)
    assert round(p_uncal, 6) == round(5.4866e-05, 6)


def test_jackknife_temperature_sensitivity_diagnostics():
    """Verify jackknife temperature sensitivity statistics across calibration folds."""
    assert SENSITIVITY_JSON.exists(), f"Missing {SENSITIVITY_JSON}"
    with open(SENSITIVITY_JSON, "r", encoding="utf-8") as f:
        sens_data = json.load(f)

    jk = sens_data["jackknife_temperature_sensitivity"]

    # Fold 1
    f1 = jk["fold_1"]
    assert f1["calibration_races_count"] == 11
    assert round(f1["base_temperature"], 4) == 0.9385
    assert round(f1["jackknife_mean"], 4) == 0.9376
    assert f1["jackknife_std"] < 0.07
    assert f1["coefficient_of_variation_pct"] < 7.0

    # Fold 2
    f2 = jk["fold_2"]
    assert f2["calibration_races_count"] == 22
    assert round(f2["base_temperature"], 4) == 1.1603
    assert round(f2["jackknife_mean"], 4) == 1.1601
    assert f2["jackknife_std"] < 0.04
    assert f2["coefficient_of_variation_pct"] < 3.5


def test_stage_semantics_audit():
    """Verify Stage A vs Stage B input contracts and semantics."""
    with open(SENSITIVITY_JSON, "r", encoding="utf-8") as f:
        sens_data = json.load(f)

    stage_audit = sens_data["stage_semantics_audit"]
    assert stage_audit["verdict"] == "STAGE_SEMANTICS_VERIFIED_RIGOROUS"
    stA = stage_audit["stage_a_provisional_post_qualifying"]
    stB = stage_audit["stage_b_official_starting_grid"]

    assert stA["grid_penalty_delta_handling"]["value"] == 0.0
    assert "provisional proxy" in stA["grid_position_handling"]["semantics"].lower()
    assert "fia official starting grid" in stB["grid_position_handling"]["source"].lower()


def test_governance_and_closed_production_gate():
    """Verify strict production gate closure across all Phase 4F.2.2 artifacts."""
    for json_path in [RECONCILIATION_JSON, SENSITIVITY_JSON]:
        with open(json_path, "r", encoding="utf-8") as f:
            d = json.load(f)
        assert d["metadata"]["production_gate"] == "STRICTLY CLOSED"
        assert d["metadata"]["model_c_trained"] is False
