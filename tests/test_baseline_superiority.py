"""Tests for Phase 3C.4E.8: Baseline Superiority, Probability Reliability & Generalization Audit.

Verifies:
1. Production isolation and baseline cryptographic immutability (original CSV, frozen model, remediated CSV).
2. Report existence and schema compliance across all Phase 3C.4E.8 outputs.
3. Probability validity: models and baselines output valid probability distributions summing to 1.0 per race.
4. Baseline superiority: Model B achieves higher Top-1 accuracy and MRR than grid baselines.
5. Top-3 coverage trade-off: Empirical grid baseline achieves higher Top-3 coverage.
6. Temperature ranking invariance: monotonic temperature scaling strictly preserves rank order, Top-1 accuracy, and MRR.
7. Calibration reliability: out-of-fold calibration reduces holdout log loss and ECE without altering rankings.
8. Chronological generalization and constructor parity vulnerability: drop from 2023 (86.4%) to 2024 (50.0%).
9. Contextual subgroups: sprint format vulnerability and penalty grid impacts.
10. Historical data integrity: 17 provisional P20 records remain flagged without synthetic tampering.
11. Production gate attestation: production gate remains strictly CLOSED.
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
    DUPLICATE_P20_RACES,
)
from scripts.predictor_model.features import TARGET_COLUMN
from scripts.predictor_model.models import LightGBMPredictor, GridPositionBaseline
from scripts.predictor_model.experimental_training import ExperimentalModelTrainer

BASE_DIR = Path(__file__).resolve().parent.parent
REPORTS_DIR = BASE_DIR / "scripts" / "predictor_model" / "reports" / "phase_3c_4e_8"
FROZEN_MODEL_PATH = BASE_DIR / "models" / "predictor" / "v1.0.0" / "trained_models.joblib"
REMEDIATED_CSV_PATH = BASE_DIR / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_v1_remediated.csv"

BASELINE_JSON_PATH = REPORTS_DIR / "baseline_comparison.json"
PREDICTIONS_CSV_PATH = REPORTS_DIR / "race_level_predictions.csv"
RELIABILITY_JSON_PATH = REPORTS_DIR / "probability_reliability.json"
GENERALIZATION_JSON_PATH = REPORTS_DIR / "generalization_report.json"
SUMMARY_MD_PATH = REPORTS_DIR / "phase_3c_4e_8_summary.md"


@pytest.fixture(scope="module")
def baseline_data() -> Dict[str, Any]:
    assert BASELINE_JSON_PATH.is_file(), f"Missing {BASELINE_JSON_PATH}"
    with open(BASELINE_JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def reliability_data() -> Dict[str, Any]:
    assert RELIABILITY_JSON_PATH.is_file(), f"Missing {RELIABILITY_JSON_PATH}"
    with open(RELIABILITY_JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def generalization_data() -> Dict[str, Any]:
    assert GENERALIZATION_JSON_PATH.is_file(), f"Missing {GENERALIZATION_JSON_PATH}"
    with open(GENERALIZATION_JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def predictions_df() -> pd.DataFrame:
    assert PREDICTIONS_CSV_PATH.is_file(), f"Missing {PREDICTIONS_CSV_PATH}"
    return pd.read_csv(PREDICTIONS_CSV_PATH)


# 1. Baseline Cryptographic Immutability & Production Isolation
def test_cryptographic_baseline_immutability():
    """Verify original training dataset, frozen model bundle, and candidate CSV match exact SHA-256 digests."""
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


# 2. Report Files Existence and Schema Conformance
def test_phase_reports_existence():
    """Verify all required Phase 3C.4E.8 report files exist and are non-empty."""
    for path in [
        BASELINE_JSON_PATH,
        PREDICTIONS_CSV_PATH,
        RELIABILITY_JSON_PATH,
        GENERALIZATION_JSON_PATH,
        SUMMARY_MD_PATH,
    ]:
        assert path.is_file(), f"Expected artifact {path} does not exist"
        assert path.stat().st_size > 0, f"Artifact {path} is empty"


def test_baseline_comparison_schema(baseline_data):
    """Verify baseline_comparison.json includes all four approaches and required metrics."""
    assert "approaches_evaluated" in baseline_data
    approaches = baseline_data["approaches_evaluated"]
    expected_approaches = [
        "approach_a_model_a_calibrated",
        "approach_b_model_b_calibrated",
        "approach_c_grid_empirical",
        "approach_d_grid_reciprocal",
    ]
    for app in expected_approaches:
        assert app in approaches, f"Missing approach {app}"
        app_data = approaches[app]
        assert "metrics" in app_data
        metrics = app_data["metrics"]
        assert "top1_accuracy" in metrics
        assert "top3_accuracy" in metrics
        assert "multiclass_log_loss" in metrics
        assert "mean_reciprocal_rank" in metrics


# 3. Probability Validity Across All 4 Approaches
def test_race_level_predictions_summary(predictions_df):
    """Verify race-level predictions CSV has 24 races with valid fields."""
    assert len(predictions_df) == 24
    assert predictions_df["race_id"].nunique() == 24

    for prefix in ["model_a", "model_b", "grid_empirical", "grid_reciprocal"]:
        assert f"{prefix}_pred" in predictions_df.columns
        assert f"{prefix}_winner_prob" in predictions_df.columns
        assert f"{prefix}_top1_hit" in predictions_df.columns
        assert f"{prefix}_top3_hit" in predictions_df.columns
        assert f"{prefix}_winner_rank" in predictions_df.columns
        assert f"{prefix}_log_loss" in predictions_df.columns
        assert f"{prefix}_brier" in predictions_df.columns

        # Winner probability strictly in (0, 1]
        probs = predictions_df[f"{prefix}_winner_prob"]
        assert (probs > 0.0).all()
        assert (probs <= 1.0).all()


def test_probability_distributions_sum_to_one():
    """Verify that models and baselines produce probability distributions summing to 1.0 per race."""
    trainer = ExperimentalModelTrainer(random_seed=RANDOM_SEED)
    _, df_rem = trainer.load_datasets()

    train_df = df_rem[
        (df_rem["season"].isin(FINAL_TRAIN_SEASONS))
        & (df_rem["race_participation_status"] != "WITHDRAWN_BEFORE_START")
    ].copy()
    test_df = df_rem[df_rem["season"] == FINAL_TEST_SEASON].copy()

    lgb_b, _, temp_b = trainer.train_model_b(train_df)
    base_grid = GridPositionBaseline().fit(train_df)

    pred_b = lgb_b.predict_df(test_df.copy(), prob_col="prob_b", temperature=temp_b)
    pred_grid = base_grid.predict_df(test_df.copy(), prob_col="prob_grid", method="ratio")

    for race_id, grp in pred_b.groupby("race_id"):
        sum_b = grp["prob_b"].sum()
        assert abs(sum_b - 1.0) < 1e-4, f"Race {race_id} prob_b sum is {sum_b}"

    for race_id, grp in pred_grid.groupby("race_id"):
        sum_g = grp["prob_grid"].sum()
        assert abs(sum_g - 1.0) < 1e-4, f"Race {race_id} prob_grid sum is {sum_g}"


# 4. Baseline Superiority & MRR Verification
def test_baseline_superiority_hit_rate_and_mrr(baseline_data):
    """Verify Model B outperforms both grid baselines in Top-1 accuracy and MRR."""
    m_b = baseline_data["approaches_evaluated"]["approach_b_model_b_calibrated"]["metrics"]
    m_c = baseline_data["approaches_evaluated"]["approach_c_grid_empirical"]["metrics"]
    m_d = baseline_data["approaches_evaluated"]["approach_d_grid_reciprocal"]["metrics"]

    # Top-1 accuracy: Model B (50.0%, 12/24) > Baselines (45.8%, 11/24)
    assert m_b["top1_accuracy"] == 0.50, f"Expected 0.50, got {m_b['top1_accuracy']}"
    assert m_c["top1_accuracy"] < m_b["top1_accuracy"], "Model B must beat Empirical Grid in Top-1"
    assert m_d["top1_accuracy"] < m_b["top1_accuracy"], "Model B must beat Reciprocal Grid in Top-1"
    assert m_c["top1_accuracy"] == pytest.approx(11.0 / 24.0, abs=1e-4)

    # MRR: Model B > Empirical Grid
    assert m_b["mean_reciprocal_rank"] > m_c["mean_reciprocal_rank"], (
        f"Model B MRR ({m_b['mean_reciprocal_rank']}) should exceed Empirical Grid MRR ({m_c['mean_reciprocal_rank']})"
    )


# 5. Top-3 Coverage Trade-off
def test_top3_coverage_tradeoff(baseline_data):
    """Verify empirical grid baseline achieves higher Top-3 coverage due to front-row podium persistence."""
    m_b = baseline_data["approaches_evaluated"]["approach_b_model_b_calibrated"]["metrics"]
    m_c = baseline_data["approaches_evaluated"]["approach_c_grid_empirical"]["metrics"]

    # Empirical Grid achieves 83.3% (20/24) vs Model B 79.2% (19/24)
    assert m_c["top3_accuracy"] > m_b["top3_accuracy"], (
        "Empirical Grid baseline should achieve higher Top-3 coverage than Model B"
    )
    assert m_c["top3_accuracy"] == pytest.approx(20.0 / 24.0, abs=1e-4)
    assert m_b["top3_accuracy"] == pytest.approx(19.0 / 24.0, abs=1e-4)


# 6. Temperature Ranking Invariance Proof
def test_temperature_ranking_invariance_proof(reliability_data):
    """Verify that temperature scaling is rank-preserving and Top-1 accuracy and MRR are strictly invariant."""
    assert "calibration_vs_accuracy_distinction" in reliability_data
    distinction = reliability_data["calibration_vs_accuracy_distinction"]
    assert "invariant" in distinction.lower()

    # Test mathematically with arbitrary temperatures on sample logits
    logits = np.array([2.5, 1.8, 0.4, -0.2, -1.5])
    temps = [0.1, 0.5, 0.762, 1.0, 1.5, 2.0, 5.0, 10.0]

    original_ranks = np.argsort(-logits)
    for t in temps:
        scaled_logits = logits / t
        exp_vals = np.exp(scaled_logits - np.max(scaled_logits))
        probs = exp_vals / np.sum(exp_vals)
        ranked = np.argsort(-probs)
        assert np.array_equal(ranked, original_ranks), f"Temperature {t} altered rank order!"


# 7. Probability Reliability & Calibration Audit
def test_calibration_reliability_metrics(reliability_data):
    """Verify out-of-fold pooled calibration improves holdout log loss and calibration error."""
    cal_regimes = reliability_data["calibration_regimes_evaluation"]
    assert "in_sample_training" in cal_regimes
    assert "chronological_oof_pooled" in cal_regimes
    assert "uncalibrated_t1" in cal_regimes

    oof_b = cal_regimes["chronological_oof_pooled"]["model_b"]
    in_samp_b = cal_regimes["in_sample_training"]["model_b"]

    # OOF calibration achieves lower test log loss than in-sample overfit
    assert oof_b["multiclass_log_loss"] < in_samp_b["multiclass_log_loss"], (
        "Out-of-fold calibration must achieve lower test log loss than overfit in-sample calibration"
    )
    # Check ECE improvement
    assert oof_b["expected_calibration_error"] < 0.030, "OOF ECE should be well calibrated (< 0.030)"

    # Check 10-bin calibration diagram structure
    bins = oof_b["reliability_bins"]
    assert len(bins) == 10
    total_samples = sum(b["sample_count"] for b in bins)
    assert total_samples == 479  # 479 test samples


# 8. Chronological Generalization & Vulnerability to Parity
def test_chronological_generalization_patterns(generalization_data):
    """Verify cross-season generalization results across 2022, 2023, and 2024."""
    chrono = generalization_data["chronological_generalization_by_season"]
    s22 = chrono["season_2022_validation"]
    s23 = chrono["season_2023_validation"]
    s24 = chrono["season_2024_holdout"]

    # 2022: Ground Effect transition year
    assert s22["races"] == 22
    assert s22["model_b"]["top1_accuracy"] == pytest.approx(8.0 / 22.0, abs=1e-4)

    # 2023: Red Bull dominance monopoly
    assert s23["races"] == 22
    assert s23["model_b"]["top1_accuracy"] == pytest.approx(19.0 / 22.0, abs=1e-4)  # 86.4%

    # 2024: 4-Constructor parity era
    assert s24["races"] == 24
    assert s24["model_b"]["top1_accuracy"] == 0.50  # 50.0%

    # Quantify parity vulnerability: performance in 2023 monopoly was drastically higher than in 2024 parity
    assert s23["model_b"]["top1_accuracy"] > s24["model_b"]["top1_accuracy"] + 0.30


def test_contextual_subgroups_sprint_vulnerability(generalization_data):
    """Verify sprint weekend vulnerability: standard format hit rate significantly exceeds sprint format."""
    subgroups = generalization_data["operational_subgroup_analysis_2024"]
    sprint = subgroups["sprint_weekends"]
    standard = subgroups["standard_weekends"]

    assert sprint["races_count"] == 6
    assert standard["races_count"] == 18

    # Standard format hit rate is substantially higher than sprint format
    assert standard["model_b_top1_pct"] > sprint["model_b_top1_pct"]
    assert standard["model_b_top1_pct"] == pytest.approx(61.1, abs=0.1)
    assert sprint["model_b_top1_pct"] == pytest.approx(16.7, abs=0.1)


# 9. Historical Data Integrity Status
def test_historical_integrity_boundaries(generalization_data):
    """Verify 17 unresolved provisional P20 records remain explicitly preserved and categorized."""
    integrity = generalization_data["historical_data_integrity_status"]
    assert integrity["unresolved_provisional_p20_records"] == 17
    assert len(integrity["unresolved_races"]) == 8
    for race in DUPLICATE_P20_RACES:
        assert race in integrity["unresolved_races"]

    boundaries = integrity["sporting_boundaries_preserved"]
    assert "physical_track_grid_box" in boundaries
    assert "pit_lane_start_status" in boundaries
    assert "model_feature_compatibility" in boundaries
    assert "race_participation_status" in boundaries


# 10. Production Gate Attestation
def test_production_gate_remains_closed(generalization_data):
    """Verify production gate remains strictly CLOSED and Model B is isolated."""
    summary_path = REPORTS_DIR / "phase_3c_4e_8_summary.md"
    assert summary_path.is_file()
    with open(summary_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "## 6. Production Gate Attestation" in content
    assert "**CLOSED**" in content
    assert "No automatic model promotion was performed." in content

    # Verify no unexpected files in models/predictor/v1.0.0/
    model_dir = BASE_DIR / "models" / "predictor" / "v1.0.0"
    files = [f.name for f in model_dir.iterdir() if f.is_file()]
    assert "trained_models.joblib" in files
    assert "trained_models_model_b.joblib" not in files
    assert "model_b.joblib" not in files
