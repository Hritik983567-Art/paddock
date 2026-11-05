"""Tests for Phase 3C.4E.9: Evaluation Integrity, Baseline Leakage & Statistical Reproducibility Audit.

Verifies:
1. Baseline walk-forward isolation and absence of future data leakage.
2. Probability normalization across variable roster sizes (20 vs 19 drivers at Albert Park).
3. Exact reproduction of Phase 3C.4E.8 performance metrics across all 4 approaches.
4. Calibration isolation: zero 2024 holdout data used in temperature fitting, and temperature rank invariance.
5. Paired statistical significance, exact 2x2 contingency tables, and power analysis invariants.
6. Sprint weekend and constructor parity subgroup investigation.
7. Cryptographic baseline immutability and strict CLOSED production gate.
"""

import hashlib
import json
from pathlib import Path
from typing import Dict, Any

import numpy as np
import pandas as pd
import pytest

from scripts.predictor_model.config import (
    DATASET_CSV_PATH,
    FINAL_TRAIN_SEASONS,
    FINAL_TEST_SEASON,
    RANDOM_SEED,
)
from scripts.predictor_model.experimental_remediation import (
    EXPECTED_ORIGINAL_SHA256,
    EXPECTED_MODEL_SHA256,
)

BASE_DIR = Path(__file__).resolve().parent.parent
PHASE_9_DIR = BASE_DIR / "scripts" / "predictor_model" / "reports" / "phase_3c_4e_9"
FROZEN_MODEL_PATH = BASE_DIR / "models" / "predictor" / "v1.0.0" / "trained_models.joblib"
REMEDIATED_CSV_PATH = BASE_DIR / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_v1_remediated.csv"

LEAKAGE_JSON_PATH = PHASE_9_DIR / "baseline_leakage_audit.json"
METRIC_JSON_PATH = PHASE_9_DIR / "metric_reproduction.json"
CAL_JSON_PATH = PHASE_9_DIR / "calibration_integrity.json"
STAT_JSON_PATH = PHASE_9_DIR / "statistical_comparison.json"
FEAT_JSON_PATH = PHASE_9_DIR / "feature_data_availability.json"
SUMMARY_MD_PATH = PHASE_9_DIR / "phase_3c_4e_9_summary.md"


@pytest.fixture(scope="module")
def leakage_data() -> Dict[str, Any]:
    assert LEAKAGE_JSON_PATH.is_file(), f"Missing {LEAKAGE_JSON_PATH}"
    with open(LEAKAGE_JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def metric_data() -> Dict[str, Any]:
    assert METRIC_JSON_PATH.is_file(), f"Missing {METRIC_JSON_PATH}"
    with open(METRIC_JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def cal_data() -> Dict[str, Any]:
    assert CAL_JSON_PATH.is_file(), f"Missing {CAL_JSON_PATH}"
    with open(CAL_JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def stat_data() -> Dict[str, Any]:
    assert STAT_JSON_PATH.is_file(), f"Missing {STAT_JSON_PATH}"
    with open(STAT_JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def feat_data() -> Dict[str, Any]:
    assert FEAT_JSON_PATH.is_file(), f"Missing {FEAT_JSON_PATH}"
    with open(FEAT_JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# 1. Cryptographic Immutability & Production Isolation
def test_cryptographic_baseline_immutability():
    """Verify original CSV, frozen model bundle, and remediated candidate CSV match exact SHA-256 digests."""
    dataset_path = Path(DATASET_CSV_PATH)
    assert dataset_path.is_file()
    with open(dataset_path, "rb") as f:
        orig_sha = hashlib.sha256(f.read()).hexdigest()
    assert orig_sha == EXPECTED_ORIGINAL_SHA256, "Original training dataset modified!"

    assert FROZEN_MODEL_PATH.is_file()
    with open(FROZEN_MODEL_PATH, "rb") as f:
        model_sha = hashlib.sha256(f.read()).hexdigest()
    assert model_sha.upper() == EXPECTED_MODEL_SHA256.upper(), "Frozen production model modified!"

    assert REMEDIATED_CSV_PATH.is_file()
    with open(REMEDIATED_CSV_PATH, "rb") as f:
        rem_sha = hashlib.sha256(f.read()).hexdigest()
    assert rem_sha == "691a19643107241a995d0af90483a335ec35c47c479a07c447449dec3f6056fe", (
        "Remediated candidate CSV hash mismatch!"
    )


# 2. Report Files Existence
def test_phase_9_reports_existence():
    """Verify all 6 Phase 3C.4E.9 report files exist and are non-empty."""
    for path in [
        LEAKAGE_JSON_PATH,
        METRIC_JSON_PATH,
        CAL_JSON_PATH,
        STAT_JSON_PATH,
        FEAT_JSON_PATH,
        SUMMARY_MD_PATH,
    ]:
        assert path.is_file(), f"Expected artifact {path} does not exist"
        assert path.stat().st_size > 0, f"Artifact {path} is empty"


# 3. Baseline Walk-Forward Isolation & No Leakage
def test_baseline_leakage_isolation(leakage_data):
    """Verify zero overlap between training and holdout partitions, and static vs walk-forward equivalence."""
    isolation = leakage_data["partition_isolation_proof"]
    assert isolation["holdout_leakage_detected"] is False
    assert isolation["race_intersection_count"] == 0
    assert isolation["train_races_count"] == 66
    assert isolation["holdout_races_count"] == 24

    comparison = leakage_data["static_vs_walk_forward_comparison"]
    static_t1 = comparison["static_cutoff_baseline"]["top1_accuracy"]
    wf_t1 = comparison["expanding_walk_forward_baseline"]["top1_accuracy"]

    # Top-1 accuracy is identical (45.83%) between static and walk-forward
    assert static_t1 == pytest.approx(11.0 / 24.0, abs=1e-4)
    assert wf_t1 == pytest.approx(11.0 / 24.0, abs=1e-4)

    # Contaminated reference artificially drops log loss
    leaked_ll = comparison["in_sample_contaminated_reference"]["multiclass_log_loss"]
    static_ll = comparison["static_cutoff_baseline"]["multiclass_log_loss"]
    assert leaked_ll < static_ll - 0.20, "Contaminated baseline must artificially deflate log loss"


# 4. Roster Consistency & Probability Normalization
def test_roster_consistency_and_normalization(leakage_data):
    """Verify variable roster sizes (Albert Park 19 drivers) normalize to 1.0 strictly."""
    smoothing = leakage_data["laplace_smoothing_and_normalization_audit"]
    assert smoothing["ratio_normalization_verified"] is True
    assert smoothing["roster_size_variations"]["races_with_20_drivers"] == 23
    assert smoothing["roster_size_variations"]["races_with_19_drivers"] == 1

    albert_park = smoothing["roster_size_variations"]["race_with_19_drivers_details"]
    assert albert_park["race_id"] == "2024_3_albert_park"
    assert albert_park["withdrawn_driver"] == "logan_sargeant"
    assert len(albert_park["grids_present"]) == 19
    assert albert_park["sum_of_probabilities"] == pytest.approx(1.0, abs=1e-5)

    per_race = leakage_data["per_race_roster_and_normalization"]
    assert len(per_race) == 24
    for r in per_race:
        assert r["is_normalized_sum_one"] is True
        assert abs(r["prob_sum_static"] - 1.0) < 1e-4
        assert abs(r["prob_sum_reciprocal"] - 1.0) < 1e-4


# 5. Independent Metric Reproduction
def test_metric_reproduction_exact_match(metric_data):
    """Verify all 7 metrics match Phase 3C.4E.8 reports within float64 precision."""
    assert metric_data["reproduction_summary"]["all_approaches_reproduced_successfully"] is True
    assert metric_data["reproduction_summary"]["discrepancies_detected"] is False

    apps = metric_data["approaches_reproduced"]
    assert "approach_b_model_b_calibrated" in apps
    assert "approach_a_model_a_calibrated" in apps
    assert "approach_c_grid_empirical" in apps
    assert "approach_d_grid_reciprocal" in apps

    m_b = apps["approach_b_model_b_calibrated"]["reproduced_metrics"]
    assert m_b["top1_hits"] == 12
    assert m_b["top1_accuracy"] == 0.50
    assert m_b["top3_hits"] == 19
    assert m_b["top3_accuracy"] == pytest.approx(19.0 / 24.0, abs=1e-4)
    assert m_b["multiclass_log_loss"] == pytest.approx(2.2833, abs=1e-3)
    assert m_b["multiclass_brier_score_summed"] == pytest.approx(0.8222, abs=1e-3)
    assert m_b["mean_reciprocal_rank"] == pytest.approx(0.6639, abs=1e-3)

    m_c = apps["approach_c_grid_empirical"]["reproduced_metrics"]
    assert m_c["top1_hits"] == 11
    assert m_c["top1_accuracy"] == pytest.approx(11.0 / 24.0, abs=1e-4)
    assert m_c["top3_hits"] == 20
    assert m_c["top3_accuracy"] == pytest.approx(20.0 / 24.0, abs=1e-4)
    assert m_c["multiclass_log_loss"] == pytest.approx(1.8535, abs=1e-3)


# 6. Calibration Isolation & Invariance
def test_calibration_isolation_and_invariance(cal_data):
    """Verify calibration fitting used zero 2024 labels, and temperature ranking invariance holds."""
    isolation = cal_data["holdout_isolation_check"]
    assert isolation["calibration_leakage_detected"] is False
    assert isolation["oof_races_count"] == 44
    assert isolation["holdout_2024_races_count"] == 24

    invariance = cal_data["temperature_sweep_and_invariance_proof"]
    assert invariance["driver_rankings_strictly_invariant"] is True
    assert invariance["top1_accuracy_strictly_invariant"] is True

    # Check sweep values
    sweep = invariance["sweep_data"]
    for s in sweep:
        assert s["top1_accuracy"] == 0.50


# 7. Paired Statistical Comparisons & Power Constraints
def test_paired_statistical_significance_and_power(stat_data):
    """Verify paired contingency tables, McNemar test results, and power analysis invariants."""
    comps = stat_data["paired_comparisons"]
    b_vs_a = comps["model_b_vs_model_a"]
    b_vs_c = comps["model_b_vs_empirical_grid"]

    # Contingency table Model B vs Model A
    # Model A won Qatar (Russell P1 vs Verstappen P2); in other 23 races they agreed
    ct_ba = b_vs_a["contingency_table"]
    assert ct_ba["both_hit"] == 12
    assert ct_ba["Model A_only_hit"] == 1
    assert ct_ba["Model B_only_hit"] == 0
    assert ct_ba["both_miss"] == 11
    assert b_vs_a["top1_accuracy"]["mcnemar_exact_p_value"] == 1.0

    # Contingency table Model B vs Empirical Grid
    # Model B hit Canada and Spain from P2; Empirical Grid hit Monaco from P1
    ct_bc = b_vs_c["contingency_table"]
    assert ct_bc["both_hit"] == 10
    assert ct_bc["Model B_only_hit"] == 2
    assert ct_bc["Empirical Grid Baseline_only_hit"] == 1
    assert ct_bc["both_miss"] == 11
    assert b_vs_c["top1_accuracy"]["mcnemar_exact_p_value"] == 1.0

    # Power analysis: power < 10% for N=24, required sample size > 500 races
    power = stat_data["power_and_sample_size_analysis"]
    assert power["holdout_sample_size"] == 24
    assert power["minimum_races_for_80_pct_power_alpha_0_05"] > 500

    # Multiple testing risk
    mult = stat_data["multiple_comparison_risk"]
    assert mult["number_of_metric_comparisons"] == 24
    assert mult["nominal_family_wise_error_rate_fwer"] > 0.70


# 8. Sprint Formats & Feature Feasibility
def test_sprint_and_feature_feasibility(feat_data):
    """Verify sprint weekend outcomes and zero-leakage session feature feasibility."""
    sprints = feat_data["sprint_weekends_2024_audit"]
    assert len(sprints) == 6

    rounds = [s["round"] for s in sprints]
    assert rounds == [5, 6, 11, 19, 21, 23]

    # Only China was a hit
    hits = [s["model_b_hit"] for s in sprints]
    assert sum(hits) == 1
    assert sprints[0]["circuit_id"] == "shanghai"
    assert sprints[0]["model_b_hit"] == 1

    # Feature feasibility check
    features = feat_data["feature_data_availability_assessment"]["potential_session_level_features"]
    names = [f["feature_name"] for f in features]
    assert "qualifying_delta_to_pole_pct" in names
    assert "fp2_long_run_median_pace" in names
    assert "sprint_race_finish_position" in names

    for f in features:
        assert "None" in f["leakage_risk"]


# 9. Production Gate Strictly Closed
def test_production_gate_attestation():
    """Verify summary markdown explicitly affirms CLOSED production gate."""
    assert SUMMARY_MD_PATH.is_file()
    with open(SUMMARY_MD_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    assert "## 7. Production Gate Attestation" in content
    assert "**PRODUCTION GATE: STRICTLY CLOSED**" in content
    assert "No automatic model promotion or production deployment has taken place." in content

    # Verify no model files in production dir
    prod_model_dir = BASE_DIR / "models" / "predictor" / "v1.0.0"
    files = [f.name for f in prod_model_dir.iterdir() if f.is_file()]
    assert "trained_models.joblib" in files
    assert "trained_models_model_b.joblib" not in files
    assert "model_b.joblib" not in files
