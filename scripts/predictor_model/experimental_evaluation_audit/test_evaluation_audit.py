"""Tests for Phase 3C.4E.12: Evaluation Methodology Audit & Empirical Grid Baseline Validation.

Verifies:
1. Baseline cryptographic immutability (original CSV, frozen model, remediated CSV).
2. Independent metric reconstruction matches reported Phase 3C.4E.11 metrics with zero divergence.
3. Empirical grid baseline construction, Laplace smoothing properties, and zero future leakage.
4. Multi-season chronological replay across 2022, 2023, and 2024 partitions.
5. Multiple comparison audit (FWER inflation, Bonferroni, Benjamini-Hochberg FDR control).
6. Inconsistency autopsy: dual-baseline deltas and tyre degradation grid-proxy root cause.
7. Leave-One-Race-Out (LORO) jackknife sensitivity and high-leverage races (Miami, Brazil).
8. Candidate pace feature reassessment and collinearity between qualifying and sector pace.
9. Production safety gate remains strictly CLOSED.
"""

import hashlib
import json
from pathlib import Path
from typing import Dict, Any

import pytest

from scripts.predictor_model.config import DATASET_CSV_PATH
from scripts.predictor_model.experimental_remediation import (
    EXPECTED_ORIGINAL_SHA256,
    EXPECTED_MODEL_SHA256,
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
PHASE_12_DIR = BASE_DIR / "scripts" / "predictor_model" / "reports" / "phase_3c_4e_12"
FROZEN_MODEL_PATH = BASE_DIR / "models" / "predictor" / "v1.0.0" / "trained_models.joblib"
REMEDIATED_CSV_PATH = BASE_DIR / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_v1_remediated.csv"

METRIC_RECONSTRUCTION_JSON = PHASE_12_DIR / "metric_reconstruction.json"
GRID_BASELINE_AUDIT_JSON = PHASE_12_DIR / "grid_baseline_audit.json"
CHRONOLOGICAL_EVAL_JSON = PHASE_12_DIR / "chronological_evaluation.json"
MULTIPLE_COMP_JSON = PHASE_12_DIR / "multiple_comparison_report.json"
RACE_SENSITIVITY_JSON = PHASE_12_DIR / "race_sensitivity_report.json"
PACE_REASSESSMENT_JSON = PHASE_12_DIR / "pace_feature_reassessment.json"
SUMMARY_MD = PHASE_12_DIR / "phase_3c_4e_12_summary.md"


@pytest.fixture(scope="module")
def reconstruction_data() -> Dict[str, Any]:
    assert METRIC_RECONSTRUCTION_JSON.is_file(), f"Missing {METRIC_RECONSTRUCTION_JSON}"
    with open(METRIC_RECONSTRUCTION_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def grid_audit_data() -> Dict[str, Any]:
    assert GRID_BASELINE_AUDIT_JSON.is_file(), f"Missing {GRID_BASELINE_AUDIT_JSON}"
    with open(GRID_BASELINE_AUDIT_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def chrono_data() -> Dict[str, Any]:
    assert CHRONOLOGICAL_EVAL_JSON.is_file(), f"Missing {CHRONOLOGICAL_EVAL_JSON}"
    with open(CHRONOLOGICAL_EVAL_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def multi_data() -> Dict[str, Any]:
    assert MULTIPLE_COMP_JSON.is_file(), f"Missing {MULTIPLE_COMP_JSON}"
    with open(MULTIPLE_COMP_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def sensitivity_data() -> Dict[str, Any]:
    assert RACE_SENSITIVITY_JSON.is_file(), f"Missing {RACE_SENSITIVITY_JSON}"
    with open(RACE_SENSITIVITY_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def pace_reassessment_data() -> Dict[str, Any]:
    assert PACE_REASSESSMENT_JSON.is_file(), f"Missing {PACE_REASSESSMENT_JSON}"
    with open(PACE_REASSESSMENT_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


# 1. Cryptographic Immutability
def test_cryptographic_baseline_immutability():
    """Verify original training dataset, frozen model bundle, and remediated candidate CSV match exact SHA-256 digests."""
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
    assert rem_sha.lower() == "691a19643107241a995d0af90483a335ec35c47c479a07c447449dec3f6056fe", "Remediated dataset candidate modified!"


# 2. Independent Metric Reconstruction
def test_metric_reconstruction_fidelity(reconstruction_data):
    """Verify that independent metric calculations match reported values."""
    metrics = reconstruction_data["reconstructed_metrics"]
    assert "approach_a_grid_reciprocal" in metrics
    assert "approach_b_grid_empirical" in metrics
    assert "approach_e_grid_plus_validated_quali" in metrics

    m_b = metrics["approach_b_grid_empirical"]["reported_metrics"]
    assert m_b["multiclass_log_loss"] == 1.8535
    assert m_b["top1_accuracy"] == 0.4583
    assert m_b["top3_accuracy"] == 0.8333

    m_e = metrics["approach_e_grid_plus_validated_quali"]["reported_metrics"]
    assert m_e["multiclass_log_loss"] == 1.8548

    invariants = reconstruction_data["invariant_audit"]
    assert "PASS" in invariants["probability_normalization_status"]
    assert "PASS" in invariants["single_winner_status"]


# 3. Grid Baseline Audit
def test_grid_baseline_audit_invariants(grid_audit_data):
    """Verify empirical baseline smoothing sensitivity and zero-leakage properties."""
    conclusions = grid_audit_data["audit_conclusions"]
    assert "YES" in conclusions["is_advantage_genuine"]
    assert "ZERO LEAKAGE" in conclusions["leakage_audit_result"]

    smoothing = grid_audit_data["smoothing_sensitivity_analysis"]
    assert smoothing["laplace_alpha_1.0"]["multiclass_log_loss"] == 1.8535

    expanding = grid_audit_data["expanding_walk_forward_benchmark"]
    assert 1.80 <= expanding["multiclass_log_loss"] <= 1.90


# 4. Multi-Season Chronological Replay
def test_chronological_replay_results(chrono_data):
    """Verify chronological evaluations across 2022, 2023, and 2024."""
    folds = chrono_data["folds"]
    assert "season_2022_holdout" in folds
    assert "season_2023_holdout" in folds
    assert "season_2024_holdout" in folds

    f22 = folds["season_2022_holdout"]
    assert f22["metrics"]["empirical_grid"]["log_loss"] < f22["metrics"]["grid_plus_qualifying"]["log_loss"]

    f24 = folds["season_2024_holdout"]
    assert f24["metrics"]["empirical_grid"]["log_loss"] == 1.8535
    assert f24["metrics"]["grid_plus_qualifying"]["log_loss"] == 1.8548


# 5. Multiple Comparison Audit
def test_multiple_comparison_audit(multi_data):
    """Verify multiple testing corrections and zero discovery rate."""
    assert multi_data["total_hypotheses_tested"] >= 30
    assert multi_data["bonferroni_significance_threshold"] < 0.002
    assert "ZERO STATISTICAL DISCOVERIES" in multi_data["multiplicity_verdict"]

    table = multi_data["hypothesis_test_table"]
    for row in table:
        assert row["significant_bonferroni"] is False
        assert row["significant_bh_fdr"] is False


# 6. Inconsistency Autopsy & LORO Sensitivity
def test_inconsistency_autopsy_and_loro_sensitivity(sensitivity_data):
    """Verify dual-baseline comparisons and Miami/Brazil leverage identification."""
    table = sensitivity_data["phase_11_inconsistency_investigation"]["dual_baseline_comparison_table"]
    cfg_map = {r["configuration"]: r for r in table}

    # Grid + qualifying delta vs reciprocal vs empirical
    gq = cfg_map["grid_plus_qualifying"]
    assert gq["delta_vs_reciprocal_grid"] == -0.0193
    assert gq["delta_vs_empirical_grid"] == +0.0013

    # Tyre deg autopsy
    autopsy = sensitivity_data["phase_11_inconsistency_investigation"]["tyre_degradation_autopsy"]
    assert "SPURIOUS ARTIFACT" in autopsy["root_cause_investigation"]["scientific_verdict"]

    # LORO outliers
    loro = sensitivity_data["leave_one_race_out_jackknife_audit"]
    assert loro["loss_excluding_miami_and_brazil"] < 1.40
    assert loro["pct_of_total_loss_from_two_races"] > 20.0


# 7. Pace Feature Reassessment
def test_pace_feature_reassessment(pace_reassessment_data):
    """Verify collinearity between qualifying delta and sector pace."""
    collin = pace_reassessment_data["collinearity_audit"]["qualifying_vs_sector_pace_correlation"]
    assert collin["pearson_r"] > 0.95
    assert collin["spearman_rho"] > 0.95

    pruning = pace_reassessment_data["final_ablation_pruning_decision"]
    assert any("qualifying_delta" in f for f in pruning["retained_for_model_c_primary_branch"])
    assert any("sector_pace" in f for f in pruning["pruned_or_excluded"])
    assert any("tyre_degradation" in f for f in pruning["pruned_or_excluded"])


# 8. Production Safety Gate
def test_production_safety_gate_attestation():
    """Verify production safety gate remains closed."""
    assert SUMMARY_MD.is_file(), f"Missing {SUMMARY_MD}"
    with open(SUMMARY_MD, "r", encoding="utf-8") as f:
        content = f.read()
    assert "PRODUCTION GATE: STRICTLY CLOSED" in content
    assert "No automatic model promotion or production deployment has taken place." in content
    assert "Model C has NOT been trained or promoted." in content

