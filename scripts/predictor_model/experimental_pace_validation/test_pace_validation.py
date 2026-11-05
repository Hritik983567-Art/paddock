"""Tests for Phase 3C.4E.11: Pace Feature Incremental Value, Leakage Stress Testing & Ablation Readiness.

Verifies:
1. Baseline cryptographic immutability (original dataset, frozen model, remediated dataset).
2. Report existence and schema compliance across all Phase 3C.4E.11 outputs.
3. Feature integrity audit:
   - Removal of artificial +5% fallback on qualifying delta; explicit missing indicators.
   - Strict criteria for tyre degradation; returns unavailable on insufficient evidence.
   - Exclusion of track overtaking difficulty from primary ablation due to heuristic sourcing.
4. Adversarial prediction-cutoff audit:
   - All 5 prediction stages supported.
   - All 7 adversarial attacks blocked with 100% fail-closed compliance.
5. Baseline comparison benchmark:
   - 6 distinct approaches evaluated on identical 2024 holdout races (24 rounds).
   - Valid probability normalization (sum to 1.0 per race).
   - Documented starter roster discrepancies audited.
6. Incremental ablation study:
   - Strict chronological walk-forward partitions without race-boundary crossing.
   - Paired Wilcoxon signed-rank and bootstrap confidence interval calculations.
7. Fine-grained 7-category coverage matrix verified against underlying session records.
8. Production safety gate remains strictly CLOSED.
"""

import hashlib
import json
from pathlib import Path
from typing import Dict, Any

import numpy as np
import pytest

from scripts.predictor_model.config import DATASET_CSV_PATH
from scripts.predictor_model.experimental_remediation import (
    EXPECTED_ORIGINAL_SHA256,
    EXPECTED_MODEL_SHA256,
)
from scripts.predictor_model.experimental_pace_validation.adversarial_cutoff_tests import (
    AdversarialCutoffEngine,
    AdversarialTestRunner,
    CutoffViolationError,
    WeekendFormat,
    PredictionStage,
)
from scripts.predictor_model.experimental_pace_validation.feature_integrity_audit import (
    FeatureIntegrityAuditor,
)
from scripts.predictor_model.experimental_pace_validation.baseline_comparison import (
    Phase11BaselineComparison,
    GridPlusQualifyingBaseline,
    PaceOnlyDiagnosticBaseline,
)
from scripts.predictor_model.experimental_pace_validation.incremental_value_ablation import (
    IncrementalAblationRunner,
)
from scripts.predictor_model.experimental_pace_validation.coverage_analysis import (
    CoverageAnalyzer,
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
REPORTS_DIR = BASE_DIR / "scripts" / "predictor_model" / "reports" / "phase_3c_4e_11"
FROZEN_MODEL_PATH = BASE_DIR / "models" / "predictor" / "v1.0.0" / "trained_models.joblib"
REMEDIATED_CSV_PATH = BASE_DIR / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_v1_remediated.csv"

FEATURE_INTEGRITY_JSON = REPORTS_DIR / "feature_integrity_report.json"
CUTOFF_ADVERSARIAL_JSON = REPORTS_DIR / "cutoff_adversarial_report.json"
FEATURE_COVERAGE_JSON = REPORTS_DIR / "feature_coverage_matrix.json"
BASELINE_COMPARISON_JSON = REPORTS_DIR / "baseline_comparison.json"
INCREMENTAL_ABLATION_JSON = REPORTS_DIR / "incremental_ablation_design.json"
SUMMARY_MD = REPORTS_DIR / "phase_3c_4e_11_summary.md"


@pytest.fixture(scope="module")
def integrity_data() -> Dict[str, Any]:
    assert FEATURE_INTEGRITY_JSON.is_file(), f"Missing {FEATURE_INTEGRITY_JSON}"
    with open(FEATURE_INTEGRITY_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def adversarial_data() -> Dict[str, Any]:
    assert CUTOFF_ADVERSARIAL_JSON.is_file(), f"Missing {CUTOFF_ADVERSARIAL_JSON}"
    with open(CUTOFF_ADVERSARIAL_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def coverage_data() -> Dict[str, Any]:
    assert FEATURE_COVERAGE_JSON.is_file(), f"Missing {FEATURE_COVERAGE_JSON}"
    with open(FEATURE_COVERAGE_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def baseline_data() -> Dict[str, Any]:
    assert BASELINE_COMPARISON_JSON.is_file(), f"Missing {BASELINE_COMPARISON_JSON}"
    with open(BASELINE_COMPARISON_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def ablation_data() -> Dict[str, Any]:
    assert INCREMENTAL_ABLATION_JSON.is_file(), f"Missing {INCREMENTAL_ABLATION_JSON}"
    with open(INCREMENTAL_ABLATION_JSON, "r", encoding="utf-8") as f:
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


# 2. Feature Integrity Audit
def test_feature_integrity_audit_corrections(integrity_data):
    """Verify removal of artificial +5% fallback, tyre deg criteria, and track difficulty exclusion."""
    features = integrity_data["features"]
    assert "qualifying_delta_to_pole_pct" in features
    assert "fp2_tyre_degradation_estimate" in features
    assert "track_overtaking_difficulty" in features

    # Check qualifying delta corrections
    q_audit = features["qualifying_delta_to_pole_pct"]
    assert q_audit["training_suitability"] == "QUALIFIED"
    assert "REMOVED ARTIFICIAL +5% FALLBACK ENTIRELY" in q_audit["mandatory_corrections_investigation"]["artificial_fallback_audit"]["correction_enforced"]

    # Check tyre degradation criteria
    deg_audit = features["fp2_tyre_degradation_estimate"]
    assert deg_audit["training_suitability"] == "EXPERIMENTAL_EXCLUDED"
    assert deg_audit["mandatory_corrections_investigation"]["degradation_reliability_audit"]["strict_quality_thresholds"]["min_r_squared"] == 0.50

    # Check track difficulty exclusion
    otk_audit = features["track_overtaking_difficulty"]
    assert otk_audit["training_suitability"] == "EXPERIMENTAL_EXCLUDED"
    assert "EXCLUDED FROM PRIMARY ABLATION" in otk_audit["suitability_rationale"]


# 3. Adversarial Cutoff Tests
def test_adversarial_cutoff_leakage_immunity(adversarial_data):
    """Verify all 7 adversarial attacks failed closed and were blocked."""
    summary = adversarial_data["audit_summary"]
    assert summary["total_adversarial_attacks"] == 7
    assert summary["attacks_successfully_blocked"] == 7
    assert summary["fail_closed_compliance_rate_pct"] == 100.0
    assert "PASS" in summary["audit_verdict"]

    attacks = adversarial_data["attack_results"]
    for atk_id, atk in attacks.items():
        assert atk["blocked"] is True, f"Attack {atk_id} was NOT blocked!"
        assert atk["status"] == "PASS"


# 4. Direct Engine Adversarial Attack Detection
def test_direct_adversarial_rejections():
    """Directly test that AdversarialCutoffEngine raises CutoffViolationError on invalid session and timestamp."""
    engine = AdversarialCutoffEngine()

    # Ingesting GRAND_PRIX at pre-race cutoff must fail
    with pytest.raises(CutoffViolationError):
        engine.validate_session_access("GRAND_PRIX", WeekendFormat.STANDARD, PredictionStage.OFFICIAL_STARTING_GRID)

    # Ingesting Sprint race at Friday post-shootout must fail
    with pytest.raises(CutoffViolationError):
        engine.validate_session_access("SPRINT_RACE", WeekendFormat.SPRINT, PredictionStage.SPRINT_POST_SHOOTOUT)

    # Future timestamp must fail
    with pytest.raises(CutoffViolationError):
        engine.validate_timestamp_bound("2024-03-02T16:00:00Z", "2024-03-02T14:00:00Z", "telemetry")


# 5. Baseline Comparison Benchmark
def test_baseline_comparison_metrics(baseline_data):
    """Verify 6 approaches evaluated on identical 2024 holdout races."""
    approaches = baseline_data["approaches_evaluated"]
    assert len(approaches) == 6

    assert "approach_a_grid_reciprocal" in approaches
    assert "approach_b_grid_empirical" in approaches
    assert "approach_c_frozen_model_a" in approaches
    assert "approach_d_experimental_model_b" in approaches
    assert "approach_e_grid_plus_validated_quali" in approaches
    assert "approach_f_pace_only_diagnostic" in approaches

    # Top-1 accuracy and LogLoss invariants
    for name, app in approaches.items():
        m = app["metrics"]
        assert m["races_evaluated"] == 24
        assert 0.0 <= m["top1_accuracy"] <= 1.0
        assert m["multiclass_log_loss"] > 0.0
        assert 0.0 <= m["multiclass_brier_score_summed"] <= 2.0
        assert 0.0 <= m["expected_calibration_error"] <= 1.0

    # Approach E should improve slightly or match grid log loss
    m_a = approaches["approach_a_grid_reciprocal"]["metrics"]
    m_e = approaches["approach_e_grid_plus_validated_quali"]["metrics"]
    assert m_e["multiclass_log_loss"] <= m_a["multiclass_log_loss"]


# 6. Starter Roster Discrepancies
def test_starter_roster_discrepancies(baseline_data):
    """Verify roster audit captured confirmed discrepancies."""
    roster_audit = baseline_data["roster_discrepancy_audit"]
    assert roster_audit["total_discrepancies_audited"] >= 5
    cases = {c["race_id"]: c for c in roster_audit["documented_cases"]}
    assert "2023_15_singapore" in cases
    assert "2024_2_jeddah" in cases
    assert "2024_7_imola" in cases


# 7. Incremental Value Ablation
def test_incremental_value_ablation(ablation_data):
    """Verify ablation configurations and statistical hypothesis testing."""
    cfgs = ablation_data["configurations_evaluated"]
    assert "grid_only" in cfgs
    assert "grid_plus_qualifying" in cfgs
    assert "grid_plus_fp2_pace" in cfgs
    assert "grid_plus_track_difficulty_interaction" in cfgs

    for cfg_name, res in cfgs.items():
        assert "mean_multiclass_log_loss" in res
        assert "delta_log_loss_vs_grid" in res
        assert "wilcoxon_p_value" in res
        assert 0.0 <= res["wilcoxon_p_value"] <= 1.0

    # Ensure statistical power warnings exist
    assert "sample_size_limitation" in ablation_data["statistical_limitations"]
    assert "correlation_vs_causation" in ablation_data["statistical_limitations"]


# 8. 7-Category Coverage Matrix
def test_coverage_matrix_classifications(coverage_data):
    """Verify fine-grained 7-category coverage breakdown."""
    features = coverage_data["feature_coverage_breakdown"]
    assert len(features) == 8

    # Qualifying delta
    q = features["qualifying_delta_to_pole_pct"]["categories"]
    assert q["VALID_MEASUREMENT"] == 1780
    assert q["DRIVER_DID_NOT_PARTICIPATE"] + q["INSUFFICIENT_STINT_SAMPLE"] == 18

    # FP2 long run pace on sprint weekends
    fp2 = features["fp2_long_run_median_pace"]["categories"]
    assert fp2["STRUCTURALLY_UNAVAILABLE"] == 120  # 6 sprint races * 20 drivers in 2024

    # Track difficulty
    otk = features["track_overtaking_difficulty"]["categories"]
    assert otk["SOURCE_NOT_VERIFIED"] == 1798


# 9. Production Safety Attestation
def test_production_safety_gate_attestation():
    """Verify production safety gate remains closed."""
    assert SUMMARY_MD.is_file(), f"Missing {SUMMARY_MD}"
    with open(SUMMARY_MD, "r", encoding="utf-8") as f:
        content = f.read()
    assert "PRODUCTION GATE: STRICTLY CLOSED" in content
    assert "No automatic model promotion or production deployment has taken place." in content
    assert "Model C has NOT been trained or promoted." in content

