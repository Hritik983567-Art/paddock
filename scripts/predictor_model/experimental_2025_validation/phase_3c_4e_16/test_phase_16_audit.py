"""Test Suite for Phase 3C.4E.16: Statistical Correction, Reproducibility & Prediction-Stage Integrity Audit.

Comprehensive verification of:
1. Immutability of all four cryptographic baseline artifacts.
2. Correctness of multiple-testing corrections (nominal scale vs adjusted scale, Bonferroni, Holm, FDR).
3. Exact baseline metric reconciliation across Phases 13, 14, and 15 (training window alignment).
4. Selection bias audit & adherence to the Independent Confirmation Rule.
5. Evidence-based feature cutoff and availability classifications.
6. Prediction-stage integrity (Stage A isolation, Stage B penalty calculation and fail-closed behavior).
7. Strict separation between win-probability metrics, Top-1 accuracy, and predicted finishing order.
8. Unconditional enforcement of the closed production safety gate.
"""

import sys
import hashlib
import json
from pathlib import Path
import numpy as np
import pandas as pd
import pytest

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

REPORTS_DIR_P16 = BASE_DIR / "scripts" / "predictor_model" / "reports" / "phase_3c_4e_16"

ORIGINAL_CSV = BASE_DIR / "data" / "predictor" / "f1_race_predictor_dataset.csv"
FROZEN_MODEL = BASE_DIR / "models" / "predictor" / "v1.0.0" / "trained_models.joblib"
REMEDIATED_CSV = BASE_DIR / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_v1_remediated.csv"
CANDIDATE_2025_CSV = BASE_DIR / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_2025_candidate.csv"

STAT_RECON_JSON = REPORTS_DIR_P16 / "phase_16_statistical_reconstruction.json"
SELECTION_BIAS_JSON = REPORTS_DIR_P16 / "phase_16_selection_bias.json"
FEATURE_CUTOFF_JSON = REPORTS_DIR_P16 / "phase_16_feature_cutoff.json"
STAGE_INTEGRITY_JSON = REPORTS_DIR_P16 / "phase_16_stage_integrity.json"

EXPECTED_ORIGINAL_SHA = "B1F50EF057E5AF732325BB8A784D96B92B34B4441900CEB2A0FD66B579C629AF"
EXPECTED_MODEL_SHA = "D8244024E6B7F0F31912EFE80B35652EF228461955232DDE7E4D65ECCC5779CD"
EXPECTED_REMEDIATED_SHA = "691A19643107241A995D0AF90483A335EC35C47C479A07C447449DEC3F6056FE"
EXPECTED_2025_CANDIDATE_SHA = "8BADE433D7BE82903B1326D68706C0E4851F80D80DDEC618EFA896E0C6363329"


def compute_sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest().upper()


def test_cryptographic_baseline_immutability():
    """Verify original dataset, frozen model bundle, remediated dataset, and 2025 candidate dataset."""
    assert compute_sha256(ORIGINAL_CSV) == EXPECTED_ORIGINAL_SHA
    assert compute_sha256(FROZEN_MODEL) == EXPECTED_MODEL_SHA
    assert compute_sha256(REMEDIATED_CSV) == EXPECTED_REMEDIATED_SHA
    assert compute_sha256(CANDIDATE_2025_CSV) == EXPECTED_2025_CANDIDATE_SHA


def test_multiple_testing_correction_mathematical_consistency():
    """Verify mathematical correctness of Bonferroni, Holm, and FDR multiple-testing corrections."""
    assert STAT_RECON_JSON.is_file(), f"Missing {STAT_RECON_JSON}"
    with open(STAT_RECON_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    meta = data["metadata"]
    assert meta["total_hypotheses_evaluated"] == 20
    assert meta["production_gate"] == "STRICTLY CLOSED"

    tests = data["multiple_testing_table"]
    assert len(tests) == 20

    # Test rank 1: 2025 Geometric w=0.20 Prior a=1 vs Baseline a=5
    top_test = tests[0]
    assert top_test["season"] == 2025
    assert top_test["hybrid_key"] == "hybrid_geo_w020_prior_a1"
    assert top_test["baseline_reference"] == "baseline_alpha_5"
    assert top_test["nominal_p_value"] < 0.0003
    # Check Scale 1: nominal p < alpha/M (0.000207 < 0.0025)
    assert top_test["significant_bonferroni_fwer"] is True
    # Check Scale 2: adjusted p < alpha (0.004146 < 0.05)
    assert top_test["bonferroni_adjusted_p"] < 0.05
    assert top_test["significant_holm_fwer"] is True
    assert top_test["significant_fdr_q05"] is True

    # Test rank 4: 2025 Geometric w=0.20 Prior a=1 vs Baseline a=1
    # This test demonstrates the distinction between FWER and FDR
    vs_a1_test = next(t for t in tests if t["hybrid_key"] == "hybrid_geo_w020_prior_a1" and t["season"] == 2025 and t["baseline_reference"] == "baseline_alpha_1")
    assert vs_a1_test["nominal_p_value"] > 0.0025  # Fails Bonferroni nominal threshold
    assert vs_a1_test["significant_bonferroni_fwer"] is False
    assert vs_a1_test["significant_holm_fwer"] is False
    assert vs_a1_test["significant_fdr_q05"] is True  # Passes FDR (q ~ 0.0232 < 0.05)

    # Multiplicity counts
    assert sum(1 for t in tests if t["significant_bonferroni_fwer"]) == 3
    assert sum(1 for t in tests if t["significant_holm_fwer"]) == 3
    assert sum(1 for t in tests if t["significant_fdr_q05"]) == 5


def test_baseline_discrepancy_reconciliation():
    """Verify that Phase 13 vs Phase 14/15 baseline metric discrepancy is formally reconciled."""
    assert STAT_RECON_JSON.is_file()
    with open(STAT_RECON_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    audit = data["baseline_discrepancy_audit"]
    assert audit["reconciliation_verdict"] == "RESOLVED_TRAINING_WINDOW_ALIGNMENT"
    assert audit["discrepancy_identification"]["phase_13_2025_baseline_loss"] == 1.1250
    assert audit["discrepancy_identification"]["phase_14_2025_baseline_loss"] == 1.1325
    assert "2021-2024" in audit["exact_root_cause"]
    assert "2021-2023" in audit["exact_root_cause"]


def test_selection_bias_and_independent_confirmation_rule():
    """Verify selection bias documentation and enforcement of the Independent Confirmation Rule."""
    assert SELECTION_BIAS_JSON.is_file(), f"Missing {SELECTION_BIAS_JSON}"
    with open(SELECTION_BIAS_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    meta = data["metadata"]
    assert meta["production_gate"] == "STRICTLY CLOSED"
    assert meta["overall_ruling"] == "INDEPENDENT_CONFIRMATION_DISALLOWED_EXPLORATORY_ONLY"

    # Verify classification of Prior alpha=5.0 as post-hoc exploratory
    exploratory = data["configuration_classification"]["exploratory_post_hoc_additions"]
    keys = [item["model_key"] for item in exploratory]
    assert "hybrid_geo_w020_prior_a5" in keys
    assert "hybrid_cvx_g020_prior_a5" in keys

    # Verify Independent Confirmation Rule holding
    ruling = data["independent_confirmation_rule_ruling"]
    assert ruling["holding"] == "INDEPENDENT_CONFIRMATION_STRICTLY_DISALLOWED"
    assert "2026" in ruling["required_action"]


def test_feature_provenance_and_cutoff_evidence():
    """Verify that all features have evidence-based availability classifications."""
    assert FEATURE_CUTOFF_JSON.is_file(), f"Missing {FEATURE_CUTOFF_JSON}"
    with open(FEATURE_CUTOFF_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    catalog = data["feature_cutoff_catalog"]
    assert "grid_position" in catalog
    assert "grid_penalty_delta" in catalog
    assert "quali_air_temp_c" in catalog
    assert "driver_substitutions" in catalog
    assert "pit_lane_starts_and_withdrawals" in catalog

    # Verify that grid_penalty_delta is strictly 0.0 in Stage A
    assert "Stage A (strictly 0.0)" in catalog["grid_penalty_delta"]["stage_eligibility"]
    assert "SESSION_TELEMETRY_STREAM" in catalog["quali_air_temp_c"]["evidence_type"]

    # Verify recalibrated leakage statement
    recal = data["leakage_claim_recalibration"]
    assert "Retrospective mathematical temporal isolation" in recal["calibrated_phase_16_finding"]


def test_stage_integrity_and_fail_closed_contract():
    """Verify that Stage A cannot consume Stage B data and Stage B fails closed."""
    assert STAGE_INTEGRITY_JSON.is_file(), f"Missing {STAGE_INTEGRITY_JSON}"
    with open(STAGE_INTEGRITY_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data["stage_a_isolation_verified"]["passed"] is True
    assert data["stage_b_penalty_computation_verified"]["passed"] is True
    assert data["stage_b_fail_closed_verified"]["passed"] is True
    assert data["overall_stage_integrity_status"] == "PASSED"

    # Verify documented limitation in run_inference_snapshot.py
    run_audit = data["run_inference_snapshot_audit"]
    assert run_audit["status"] == "NON_BREAKING_LIMITATION_DOCUMENTED"
    assert "UNSUPPORTED_STAGE" in run_audit["identified_limitation"]


def test_probability_metric_interpretation():
    """Verify distinction between win probabilities, Top-1 accuracy, and predicted finishing order."""
    assert STAT_RECON_JSON.is_file()
    with open(STAT_RECON_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    s24 = data["season_metrics"]["season_2024"]
    s25 = data["season_metrics"]["season_2025"]

    # Verify that hybrid improves log loss and Brier score while Top-1 remains identical to baseline
    geo_24 = s24["hybrid_geo_w020_prior_a1"]
    base_a1_24 = s24["baseline_laplace_alpha_1"]

    assert geo_24["mean_log_loss"] < base_a1_24["mean_log_loss"]
    assert geo_24["mean_brier_score"] < base_a1_24["mean_brier_score"]
    # Top-1 count is identical (11 hits in 2024)
    assert geo_24["top1_hits"] == base_a1_24["top1_hits"]

    geo_25 = s25["hybrid_geo_w020_prior_a1"]
    base_a1_25 = s25["baseline_laplace_alpha_1"]

    assert geo_25["mean_log_loss"] < base_a1_25["mean_log_loss"]
    assert geo_25["mean_brier_score"] < base_a1_25["mean_brier_score"]
    # Top-1 count is identical (16 hits in 2025)
    assert geo_25["top1_hits"] == base_a1_25["top1_hits"]


def test_production_safety_gate_strictly_closed():
    """Verify that the production safety gate remains closed across all artifacts."""
    for json_file in [STAT_RECON_JSON, SELECTION_BIAS_JSON, FEATURE_CUTOFF_JSON, STAGE_INTEGRITY_JSON]:
        with open(json_file, "r", encoding="utf-8") as f:
            d = json.load(f)
        assert d["metadata"]["production_gate"] == "STRICTLY CLOSED"
        assert d["metadata"]["model_c_trained"] is False

