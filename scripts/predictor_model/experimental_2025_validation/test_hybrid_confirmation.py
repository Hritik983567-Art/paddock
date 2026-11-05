"""Test Suite for Phase 3C.4E.15: Independent Hybrid Confirmation, Baseline Fairness & Feature Provenance Audit.

Comprehensive verification of:
1. Immutability of cryptographic baselines (original dataset, frozen model, remediated candidate, 2025 candidate).
2. Independent baseline reconstruction & resolution of the alpha=1 vs alpha=5 baseline fairness question.
3. Multiple-testing audit validation (Bonferroni, Holm-Bonferroni, Benjamini-Hochberg FDR across M=20 hypotheses).
4. Feature provenance & temporal leakage audit (pre-race availability cutoff, zero post-race contamination).
5. Robustness & sensitivity weight sweeps (geometric w, convex gamma, log-odds lambda) across edge cases.
6. Adherence to the Independent Confirmation Rule (2024/2025 are exploratory holdouts, 2026 untouched data needed).
7. Verification that the production safety gate remains strictly CLOSED and Model C was not trained.
"""

import sys
import hashlib
import json
from pathlib import Path
import numpy as np
import pandas as pd
import pytest

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

REPORTS_DIR_P15 = BASE_DIR / "scripts" / "predictor_model" / "reports" / "phase_3c_4e_15"

ORIGINAL_CSV = BASE_DIR / "data" / "predictor" / "f1_race_predictor_dataset.csv"
FROZEN_MODEL = BASE_DIR / "models" / "predictor" / "v1.0.0" / "trained_models.joblib"
REMEDIATED_CSV = BASE_DIR / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_v1_remediated.csv"
CANDIDATE_2025_CSV = BASE_DIR / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_2025_candidate.csv"

FAIRNESS_JSON = REPORTS_DIR_P15 / "hybrid_baseline_fairness.json"
MULTIPLE_TESTING_JSON = REPORTS_DIR_P15 / "hybrid_multiple_testing.json"
PROVENANCE_JSON = REPORTS_DIR_P15 / "hybrid_feature_provenance.json"
RACE_LEVEL_CSV = REPORTS_DIR_P15 / "hybrid_race_level_comparison.csv"

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


def test_baseline_reconstruction_and_fairness_resolution():
    """Verify that all baselines were reconstructed independently and alpha=1 vs alpha=5 is resolved."""
    assert FAIRNESS_JSON.is_file(), f"Missing {FAIRNESS_JSON}"
    with open(FAIRNESS_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    meta = data["metadata"]
    assert meta["production_gate"] == "STRICTLY CLOSED"
    assert meta["model_c_trained"] is False

    evals = data["season_fairness_evaluations"]
    s24 = evals["season_2024"]["head_to_head_table"]
    s25 = evals["season_2025"]["head_to_head_table"]

    # In 2024: Baseline alpha=5 achieved lower log loss than alpha=1 due to tail smoothing on upset races
    assert s24["baseline_a5"]["mean_log_loss"] < s24["baseline_a1"]["mean_log_loss"]

    # In 2025: Baseline alpha=1 achieved lower log loss than alpha=5 due to high pole conversion (16/24)
    assert s25["baseline_a1"]["mean_log_loss"] < s25["baseline_a5"]["mean_log_loss"]

    # Key Resolution: Geometric hybrid outperforms BOTH baselines when compared fairly
    # 1. Geometric Prior alpha=1 vs Baseline alpha=1:
    assert s24["hybrid_geo_w020_prior_a1"]["mean_log_loss"] < s24["baseline_a1"]["mean_log_loss"]
    assert s25["hybrid_geo_w020_prior_a1"]["mean_log_loss"] < s25["baseline_a1"]["mean_log_loss"]

    # 2. Geometric Prior alpha=5 vs Baseline alpha=5:
    assert s24["hybrid_geo_w020_prior_a5"]["mean_log_loss"] < s24["baseline_a5"]["mean_log_loss"]
    assert s25["hybrid_geo_w020_prior_a5"]["mean_log_loss"] < s25["baseline_a5"]["mean_log_loss"]

    # 3. Geometric Prior alpha=5 also beats Baseline alpha=1 in both seasons:
    assert s24["hybrid_geo_w020_prior_a5"]["mean_log_loss"] < s24["baseline_a1"]["mean_log_loss"]
    assert s25["hybrid_geo_w020_prior_a5"]["mean_log_loss"] < s25["baseline_a1"]["mean_log_loss"]


def test_multiple_testing_audit():
    """Verify multiple-testing audit: M=20 hypotheses, Bonferroni, Holm, and FDR Benjamini-Hochberg."""
    assert MULTIPLE_TESTING_JSON.is_file(), f"Missing {MULTIPLE_TESTING_JSON}"
    with open(MULTIPLE_TESTING_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    meta = data["metadata"]
    assert meta["total_hypothesis_tests"] == 20
    assert abs(meta["bonferroni_adjusted_threshold"] - (0.05 / 20)) < 1e-6

    # Verify FDR significance for top 2025 hybrid improvements
    tests = data["all_evaluated_statistical_tests"]
    geo_2025_vs_a1 = next(
        t for t in tests
        if t["hybrid_key"] == "hybrid_geo_w020_prior_a1" and t["season"] == 2025 and t["baseline_reference"] == "baseline_alpha_1"
    )
    assert geo_2025_vs_a1["nominal_p_value"] < 0.01
    assert geo_2025_vs_a1["significant_fdr_q05"] is True

    cvx_2025_vs_a5 = next(
        t for t in tests
        if t["hybrid_key"] == "hybrid_cvx_g020_prior_a1" and t["season"] == 2025 and t["baseline_reference"] == "baseline_alpha_5"
    )
    assert cvx_2025_vs_a5["significant_fdr_q05"] is True


def test_feature_provenance_and_temporal_isolation():
    """Verify that all features are known pre-race with zero temporal leakage."""
    assert PROVENANCE_JSON.is_file(), f"Missing {PROVENANCE_JSON}"
    with open(PROVENANCE_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    meta = data["audit_metadata"]
    assert meta["all_features_known_pre_race"] is True
    assert meta["overall_audit_status"] == "PASSED"

    empirical = data["empirical_leakage_audit"]
    assert empirical["round_1_points_reset_verified"]["passed"] is True
    assert empirical["target_excluded_from_features"]["passed"] is True
    assert empirical["weather_provenance_verified"]["passed"] is True
    assert empirical["candidate_2025_r1_points_reset"]["passed"] is True

    # Check that every single cataloged feature is pre-race
    for feat_name, feat_info in data["feature_catalog"].items():
        assert feat_info["known_pre_race"] is True, f"{feat_name} is not known pre-race!"
        assert feat_info["post_race_leakage_risk"].startswith("Verified Zero"), f"{feat_name} leakage risk not verified!"


def test_hybrid_weight_robustness_sweep():
    """Test bounded weight sweeps around Phase 14 candidates across varying starter counts."""
    from scripts.predictor_model.models import GridPositionBaseline
    from scripts.predictor_model.experimental_2025_validation.hybrid_experiment import BayesianHybridPredictor

    train_df = pd.read_csv(REMEDIATED_CSV)
    tr = train_df[train_df["season"] <= 2023].copy()
    base = GridPositionBaseline(smoothing=1.0).fit(tr, target_col="won_race")

    # Bounded sweeps
    geom_weights = [0.05, 0.10, 0.20, 0.30, 0.50]
    conv_gammas = [0.05, 0.10, 0.20, 0.30, 0.50]
    log_lambdas = [0.05, 0.10, 0.25, 0.40]

    for n in [18, 19, 20]:
        synth_df = pd.DataFrame({
            "race_id": [f"race_{n}"] * n,
            "driver_id": [f"d_{i}" for i in range(1, n + 1)],
            "grid_position": list(range(1, n + 1)),
            "quali_time_delta_to_pole": [0.0] + [0.1 * i for i in range(1, n)],
        })

        # Test Geometric weights
        for w in geom_weights:
            h = BayesianHybridPredictor(prior_model=base, method="geometric", weight=w)
            probs = h.predict_race_probabilities(synth_df)
            assert len(probs) == n
            assert abs(np.sum(probs) - 1.0) < 1e-12
            assert (probs >= h.p_floor).all()

        # Test Convex gammas
        for g in conv_gammas:
            h = BayesianHybridPredictor(prior_model=base, method="convex", weight=g)
            probs = h.predict_race_probabilities(synth_df)
            assert len(probs) == n
            assert abs(np.sum(probs) - 1.0) < 1e-12
            assert (probs >= h.p_floor).all()

        # Test Log-odds lambdas
        for lmb in log_lambdas:
            h = BayesianHybridPredictor(prior_model=base, method="shrinkage", weight=lmb)
            probs = h.predict_race_probabilities(synth_df)
            assert len(probs) == n
            assert abs(np.sum(probs) - 1.0) < 1e-12
            assert (probs >= h.p_floor).all()


def test_edge_case_robustness():
    """Verify hybrid handles pit lane starts, missing features, and extreme values."""
    from scripts.predictor_model.models import GridPositionBaseline
    from scripts.predictor_model.experimental_2025_validation.hybrid_experiment import BayesianHybridPredictor

    train_df = pd.read_csv(REMEDIATED_CSV)
    tr = train_df[train_df["season"] <= 2023].copy()
    base = GridPositionBaseline(smoothing=1.0).fit(tr, target_col="won_race")

    # Race with pit lane starter (grid 20) and extreme gap (10 seconds behind)
    synth_df = pd.DataFrame({
        "race_id": ["race_extreme"] * 20,
        "driver_id": [f"d_{i}" for i in range(1, 21)],
        "grid_position": list(range(1, 21)),
        "quali_time_delta_to_pole": [0.0] + [0.2 * i for i in range(1, 19)] + [10.0],
    })

    hybrid = BayesianHybridPredictor(prior_model=base, method="geometric", weight=0.20)
    probs = hybrid.predict_race_probabilities(synth_df)
    assert len(probs) == 20
    assert abs(np.sum(probs) - 1.0) < 1e-12
    assert not np.isnan(probs).any()
    # Driver 20 should have small but non-zero probability (>= p_floor)
    assert probs[-1] >= hybrid.p_floor


def test_independent_confirmation_rule_and_gate_status():
    """Verify that the Independent Confirmation Rule is upheld and the production gate is strictly closed."""
    assert FAIRNESS_JSON.is_file()
    with open(FAIRNESS_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    meta = data["metadata"]
    assert meta["production_gate"] == "STRICTLY CLOSED"
    assert meta["model_c_trained"] is False

    # Check Independent Confirmation Rule assertion
    rule = data.get("independent_confirmation_rule")
    assert rule is not None
    assert rule["confirmation_status"] == "EXPLORATORY_EVIDENCE_ONLY"
    assert rule["untouched_future_holdout_required"] is True
    assert "2026" in rule["recommended_validation_season"]
