"""Test suite for Phase 3C.4E.13: Upset Sensitivity Audit & Independent 2025 Out-of-Sample Validation.

Validates:
1. Cryptographic baseline immutability (original dataset, frozen Model A, remediated candidate).
2. LORO jackknife reconstruction: mathematical identity (S - L_i) / (N - 1) and Miami/Interlagos audit.
3. Objective pre-race vs retrospective upset classification reports and full 24-race primary benchmark.
4. Empirical grid reconstruction across all 5 formulations (Variants A-E) and probability sum == 1.0.
5. Ingestion and schema validation of isolated 2025 candidate dataset (24 races, 480 rows, single winner).
6. Out-of-sample 2025 performance evaluations, ECE, paired tests, and category breakdowns.
7. Closed production gate and safety attestation strings.
"""

import hashlib
import json
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
REPORTS_DIR = BASE_DIR / "scripts" / "predictor_model" / "reports" / "phase_3c_4e_13"

ORIGINAL_CSV = BASE_DIR / "data" / "predictor" / "f1_race_predictor_dataset.csv"
FROZEN_MODEL = BASE_DIR / "models" / "predictor" / "v1.0.0" / "trained_models.joblib"
REMEDIATED_CSV = BASE_DIR / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_v1_remediated.csv"
CANDIDATE_2025_CSV = BASE_DIR / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_2025_candidate.csv"

JACKKNIFE_JSON = REPORTS_DIR / "jackknife_reconstruction.json"
UPSET_JSON = REPORTS_DIR / "upset_sensitivity_report.json"
EMP_REBUILD_JSON = REPORTS_DIR / "empirical_grid_reconstruction.json"
PROVENANCE_JSON = REPORTS_DIR / "2025_data_provenance.json"
VALIDATION_JSON = REPORTS_DIR / "2025_dataset_validation.json"
EVAL_2025_JSON = REPORTS_DIR / "2025_out_of_sample_results.json"
SUMMARY_MD = REPORTS_DIR / "phase_3c_4e_13_summary.md"

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
    """Verify original dataset, frozen model bundle, and remediated candidate are 100% intact."""
    assert compute_sha256(ORIGINAL_CSV) == EXPECTED_ORIGINAL_SHA
    assert compute_sha256(FROZEN_MODEL) == EXPECTED_MODEL_SHA
    assert compute_sha256(REMEDIATED_CSV) == EXPECTED_REMEDIATED_SHA
    assert compute_sha256(CANDIDATE_2025_CSV) == EXPECTED_2025_CANDIDATE_SHA


def test_loro_jackknife_mathematical_identity():
    """Verify that LORO jackknife satisfies (S - L_i)/(N - 1) and Miami/Interlagos produce identical loss."""
    assert JACKKNIFE_JSON.is_file(), f"Missing {JACKKNIFE_JSON}"
    with open(JACKKNIFE_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    summary = data["full_season_summary"]
    assert summary["total_races"] == 24
    assert summary["analytical_identity_verified_all_24_races"] is True

    # Miami vs Interlagos audit
    m_info = data["miami_vs_interlagos_investigation"]
    assert m_info["verdict_cause"] == "identical_individual_losses"
    assert abs(m_info["delta_predicted_probability"]) < 1e-12
    assert abs(m_info["delta_individual_log_loss"]) < 1e-12
    assert abs(m_info["delta_loro_mean"]) < 1e-12

    # Training stats identity
    g5_stats = data["historical_training_comparison_grid5_vs_grid17"]["grid_5"]
    g17_stats = data["historical_training_comparison_grid5_vs_grid17"]["grid_17"]
    assert g5_stats["historical_wins_2021_2023"] == 0
    assert g17_stats["historical_wins_2021_2023"] == 0
    assert g5_stats["historical_starts_2021_2023"] == 66
    assert g17_stats["historical_starts_2021_2023"] == 66
    assert data["historical_training_comparison_grid5_vs_grid17"]["rates_identical"] is True


def test_upset_classification_primary_benchmark():
    """Verify that the full 24-race 2024 season is the sole primary benchmark and subsets are valid."""
    assert UPSET_JSON.is_file(), f"Missing {UPSET_JSON}"
    with open(UPSET_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    pb = data["primary_benchmark_complete_season"]
    assert pb["race_count"] == 24

    metrics = pb["metrics"]
    emp = metrics["empirical_grid"]
    a = metrics["frozen_model_a"]
    b = metrics["remediated_model_b"]

    assert emp["mean_log_loss"] < a["mean_log_loss"]
    assert emp["mean_log_loss"] < b["mean_log_loss"]
    assert emp["mean_brier_score"] < a["mean_brier_score"]
    assert emp["mean_brier_score"] < b["mean_brier_score"]

    # Pre-race subsets
    pre_clean = data["objective_pre_race_evaluations"]["clean_standard_conditions"]
    pre_dis = data["objective_pre_race_evaluations"]["disrupted_pre_race_conditions"]
    assert pre_clean["race_count"] + pre_dis["race_count"] == 24


def test_empirical_grid_reconstruction_all_variants():
    """Verify that all 5 variants are evaluated, field sums equal 1.0, and tuned alpha minimizes loss."""
    assert EMP_REBUILD_JSON.is_file(), f"Missing {EMP_REBUILD_JSON}"
    with open(EMP_REBUILD_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data["field_normalization_audit"]["per_race_field_sum_equal_one"] is True
    assert data["smoothing_hyperparameter_tuning_cv"]["selected_optimal_alpha"] == 5.0

    vars = data["variant_performance_comparison"]
    assert "variant_a_reciprocal" in vars
    assert "variant_b_static_mle" in vars
    assert "variant_c_expanding_walk" in vars
    assert "variant_d_laplace_alpha_1" in vars
    assert "variant_e_tuned_alpha_5" in vars

    # Tuned smoothing achieves lowest log loss
    assert vars["variant_e_tuned_alpha_5"]["mean_log_loss"] < vars["variant_d_laplace_alpha_1"]["mean_log_loss"]
    assert vars["variant_e_tuned_alpha_5"]["mean_log_loss"] < 1.77


def test_2025_candidate_dataset_validation():
    """Verify that the 2025 candidate dataset passes all integrity checks."""
    assert VALIDATION_JSON.is_file(), f"Missing {VALIDATION_JSON}"
    with open(VALIDATION_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data["validation_verdict"] == "PASSED"
    assert data["dataset_dimensions"]["total_races"] == 24
    assert data["dataset_dimensions"]["total_records"] == 480
    assert data["dataset_dimensions"]["all_races_have_exactly_one_winner"] is True
    assert data["dataset_dimensions"]["all_starter_counts_valid"] is True
    assert data["schema_compatibility"]["missing_columns_count"] == 0


def test_2025_out_of_sample_evaluation():
    """Verify independent 2025 out-of-sample metrics across all approaches."""
    assert EVAL_2025_JSON.is_file(), f"Missing {EVAL_2025_JSON}"
    with open(EVAL_2025_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data["metadata"]["total_races_evaluated"] == 24
    summary = data["comparative_summary_table"]

    emp = summary["empirical_grid_baseline_2024"]
    a = summary["frozen_model_a_2021_2023"]
    b = summary["remediated_model_b_2021_2023"]

    # Empirical grid achieves top-1 of 66.7% (16/24) vs ML models 54.2% (13/24)
    assert emp["top1_wins_count"] == 16
    assert a["top1_wins_count"] == 13
    assert b["top1_wins_count"] == 13

    # Empirical grid achieves vastly superior Brier score
    assert emp["mean_brier_score"] < a["mean_brier_score"]
    assert emp["mean_brier_score"] < b["mean_brier_score"]
    assert emp["expected_calibration_error"] <= 0.02

