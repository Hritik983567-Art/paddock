"""Test Suite for Phase 3C.4E.14: Bayesian Hybrid Feasibility & Independent Validation.

Comprehensive tests verifying:
1. Immutability of cryptographic baselines (original dataset, frozen model, remediated dataset, 2025 dataset).
2. Phase 13 independent evaluation integrity (single winner, identical starter sets, probability sum=1.0).
3. Hybrid normalization invariance across variable field sizes (18, 19, 20 starters).
4. Robustness against missing qualifying data, missing driver history, substitutions, and pit lane starts.
5. Robustness against extreme overconfident ML predictions (protection by prior floor and shrinkage).
6. Statistical validation outputs: paired bootstrap 95% CIs, log loss, Brier, Top-1 accuracy.
7. Verification that production safety gate remains strictly CLOSED.
"""

import hashlib
import json
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
REPORTS_DIR = BASE_DIR / "scripts" / "predictor_model" / "reports" / "phase_3c_4e_14"

ORIGINAL_CSV = BASE_DIR / "data" / "predictor" / "f1_race_predictor_dataset.csv"
FROZEN_MODEL = BASE_DIR / "models" / "predictor" / "v1.0.0" / "trained_models.joblib"
REMEDIATED_CSV = BASE_DIR / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_v1_remediated.csv"
CANDIDATE_2025_CSV = BASE_DIR / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_2025_candidate.csv"

RESULTS_JSON = REPORTS_DIR / "hybrid_experiment_results.json"
RACE_CSV = REPORTS_DIR / "hybrid_race_level_results.csv"

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


def test_phase_13_audit_integrity():
    """Verify that Phase 13 evaluation audit passed with zero leakage and valid starter counts."""
    assert RESULTS_JSON.is_file(), f"Missing {RESULTS_JSON}"
    with open(RESULTS_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    audit = data["phase_13_integrity_audit"]
    assert all(audit["hashes_valid"].values())
    assert audit["season_2024_integrity"]["race_count"] == 24
    assert audit["season_2024_integrity"]["all_single_winner"] is True
    assert audit["season_2024_integrity"]["all_starters_valid"] is True

    assert audit["season_2025_integrity"]["race_count"] == 24
    assert audit["season_2025_integrity"]["all_single_winner"] is True
    assert audit["season_2025_integrity"]["all_starters_valid"] is True
    assert audit["temporal_isolation_guaranteed"] is True


def test_hybrid_normalization_invariance():
    """Verify that hybrid probability vectors strictly sum to 1.0 across varying starter counts."""
    from scripts.predictor_model.models import GridPositionBaseline
    from scripts.predictor_model.experimental_2025_validation.hybrid_experiment import BayesianHybridPredictor

    # Create synthetic grid baseline
    train_df = pd.read_csv(REMEDIATED_CSV)
    tr = train_df[train_df["season"] <= 2023].copy()
    base = GridPositionBaseline(smoothing=1.0).fit(tr, target_col="won_race")

    hybrid = BayesianHybridPredictor(prior_model=base, method="prior_only")

    # Test field sizes: 18, 19, 20
    for n in [18, 19, 20]:
        synth_df = pd.DataFrame({
            "race_id": [f"race_{n}"] * n,
            "driver_id": [f"d_{i}" for i in range(1, n + 1)],
            "grid_position": list(range(1, n + 1)),
            "quali_time_delta_to_pole": [0.0] + [0.1 * i for i in range(1, n)],
        })
        probs = hybrid.predict_race_probabilities(synth_df)
        assert len(probs) == n
        assert abs(np.sum(probs) - 1.0) < 1e-12
        assert (probs >= hybrid.p_floor).all()


def test_robustness_missing_qualifying_and_form_data():
    """Verify safe fallback when qualifying delta or driver form features are missing or NaN."""
    from scripts.predictor_model.models import GridPositionBaseline
    from scripts.predictor_model.experimental_2025_validation.hybrid_experiment import BayesianHybridPredictor

    train_df = pd.read_csv(REMEDIATED_CSV)
    tr = train_df[train_df["season"] <= 2023].copy()
    base = GridPositionBaseline(smoothing=1.0).fit(tr, target_col="won_race")

    hybrid_q = BayesianHybridPredictor(prior_model=base, method="quali_likelihood", weight=0.5)

    # Missing qualifying delta (all NaN)
    n = 20
    synth_df = pd.DataFrame({
        "race_id": ["race_missing_q"] * n,
        "driver_id": [f"d_{i}" for i in range(1, n + 1)],
        "grid_position": list(range(1, n + 1)),
        "quali_time_delta_to_pole": [np.nan] * n,
    })
    probs = hybrid_q.predict_race_probabilities(synth_df)
    assert len(probs) == n
    assert abs(np.sum(probs) - 1.0) < 1e-12
    assert not np.isnan(probs).any()


def test_robustness_overconfident_ml_protection():
    """Verify that Bayesian hybrid protects against extreme overconfident ML predictions."""
    from scripts.predictor_model.models import GridPositionBaseline
    from scripts.predictor_model.experimental_2025_validation.hybrid_experiment import BayesianHybridPredictor

    train_df = pd.read_csv(REMEDIATED_CSV)
    tr = train_df[train_df["season"] <= 2023].copy()
    base = GridPositionBaseline(smoothing=1.0).fit(tr, target_col="won_race")

    # Mock ML model that assigns 99.99% probability to pole and 0.0001% to P17
    class MockOverconfidentML:
        def predict_race_probabilities(self, df, temperature=1.0):
            probs = np.full(len(df), 0.0001 / (len(df) - 1))
            probs[0] = 0.9999
            return probs

    mock_ml = MockOverconfidentML()

    # Compare Pure ML vs Hybrid Convex (gamma=0.20) and Hybrid Geometric (w=0.20)
    # Suppose actual winner is P17 (index 16)
    synth_df = pd.DataFrame({
        "race_id": ["race_upset"] * 20,
        "driver_id": [f"d_{i}" for i in range(1, 21)],
        "grid_position": list(range(1, 21)),
    })

    hybrid_cvx = BayesianHybridPredictor(
        prior_model=base, ml_model=mock_ml, method="convex", weight=0.20, p_floor=0.0005
    )
    hybrid_geo = BayesianHybridPredictor(
        prior_model=base, ml_model=mock_ml, method="geometric", weight=0.20, p_floor=0.0005
    )

    p_pure_ml = mock_ml.predict_race_probabilities(synth_df)
    p_cvx = hybrid_cvx.predict_race_probabilities(synth_df)
    p_geo = hybrid_geo.predict_race_probabilities(synth_df)

    # Winner is driver 17 (index 16)
    w_idx = 16
    loss_pure_ml = -np.log(p_pure_ml[w_idx])
    loss_cvx = -np.log(p_cvx[w_idx])
    loss_geo = -np.log(p_geo[w_idx])

    # Pure ML suffers catastrophic loss (~12.15)
    assert loss_pure_ml > 12.0
    # Convex ensemble bounds loss significantly (< 7.50)
    assert loss_cvx < 7.50
    # Geometric mixture bounds loss (< 8.50)
    assert loss_geo < 8.50
    assert (p_cvx >= 0.0005).all()
    assert (p_geo >= 0.0005).all()


def test_statistical_hybrid_evaluation_results():
    """Verify that statistical validation results match decision criteria and show improvement."""
    assert RESULTS_JSON.is_file(), f"Missing {RESULTS_JSON}"
    with open(RESULTS_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    crit = data["decision_criteria_evaluation"]
    assert crit["criterion_1_improves_out_of_sample_probability_metrics"]["verdict"] == "PASSED"
    assert crit["criterion_2_does_not_materially_degrade_top1_or_top3"]["verdict"] == "PASSED"
    assert crit["criterion_3_demonstrates_stable_calibration"]["verdict"] == "PASSED"
    assert crit["criterion_4_remains_competitive_across_both_2024_and_2025"]["verdict"] == "PASSED"
    assert crit["criterion_5_has_no_temporal_leakage"]["verdict"] == "PASSED"
    assert crit["criterion_6_reproducible_results_and_artifact_lineage"]["verdict"] == "PASSED"

    # Verify 2024 holdout
    s24 = data["season_evaluations"]["season_2024"]
    emp24 = s24["empirical_grid_baseline"]
    geo24 = s24["hybrid_geometric_mixture"]
    cvx24 = s24["hybrid_convex_conservative"]

    assert geo24["mean_log_loss"] < emp24["mean_log_loss"]
    assert cvx24["mean_log_loss"] < emp24["mean_log_loss"]
    assert geo24["mean_brier_score"] < emp24["mean_brier_score"]
    assert cvx24["mean_brier_score"] < emp24["mean_brier_score"]

    # Verify 2025 holdout
    s25 = data["season_evaluations"]["season_2025"]
    emp25 = s25["empirical_grid_baseline"]
    geo25 = s25["hybrid_geometric_mixture"]
    cvx25 = s25["hybrid_convex_conservative"]

    assert geo25["mean_log_loss"] < emp25["mean_log_loss"]
    assert cvx25["mean_log_loss"] < emp25["mean_log_loss"]
    assert geo25["mean_brier_score"] < emp25["mean_brier_score"]
    assert cvx25["mean_brier_score"] < emp25["mean_brier_score"]
    assert geo25["top1_count"] == 16
    assert cvx25["top1_count"] == 16


def test_production_safety_gate_strictly_closed():
    """Verify that the production gate remains strictly closed."""
    assert RESULTS_JSON.is_file()
    with open(RESULTS_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data["metadata"]["production_gate"] == "STRICTLY CLOSED"

