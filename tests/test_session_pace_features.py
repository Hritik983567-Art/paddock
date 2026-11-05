"""Tests for Phase 3C.4E.10: Historical Session Data Validation & Pace Feature Prototype.

Verifies:
1. Baseline cryptographic immutability (original CSV, frozen model, remediated CSV).
2. Report existence and schema compliance across all Phase 3C.4E.10 outputs.
3. Historical session data coverage and availability invariants (2021-2024).
4. Prediction cutoff validator: temporal isolation, allowed sessions, and forbidden leakage prevention.
5. PaceFeatureBuilder calculation contracts, units, and explicit missing-data handling.
6. Historical replay determinism and 6-archetype execution.
7. Track overtaking penalty dynamics.
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
from scripts.predictor_pipeline.session_pace.prediction_cutoff_validator import (
    PredictionCutoffValidator,
    WeekendFormat,
    PredictionStage,
    CutoffViolationError,
)
from scripts.predictor_pipeline.session_pace.pace_feature_builder import (
    PaceFeatureBuilder,
    CIRCUIT_OVERTAKING_INDEX,
)
from scripts.predictor_pipeline.session_pace.historical_replay import HistoricalReplayEngine

BASE_DIR = Path(__file__).resolve().parent.parent
PHASE_10_DIR = BASE_DIR / "scripts" / "predictor_model" / "reports" / "phase_3c_4e_10"
FROZEN_MODEL_PATH = BASE_DIR / "models" / "predictor" / "v1.0.0" / "trained_models.joblib"
REMEDIATED_CSV_PATH = BASE_DIR / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_v1_remediated.csv"

COVERAGE_JSON = PHASE_10_DIR / "session_data_coverage.json"
DEFINITIONS_JSON = PHASE_10_DIR / "feature_definitions.json"
CUTOFF_JSON = PHASE_10_DIR / "prediction_cutoff_audit.json"
REPLAY_JSON = PHASE_10_DIR / "historical_replay_results.json"
QUALITY_JSON = PHASE_10_DIR / "feature_quality_report.json"
SUMMARY_MD = PHASE_10_DIR / "phase_3c_4e_10_summary.md"


@pytest.fixture(scope="module")
def coverage_data() -> Dict[str, Any]:
    assert COVERAGE_JSON.is_file(), f"Missing {COVERAGE_JSON}"
    with open(COVERAGE_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def definitions_data() -> Dict[str, Any]:
    assert DEFINITIONS_JSON.is_file(), f"Missing {DEFINITIONS_JSON}"
    with open(DEFINITIONS_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def cutoff_data() -> Dict[str, Any]:
    assert CUTOFF_JSON.is_file(), f"Missing {CUTOFF_JSON}"
    with open(CUTOFF_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def replay_data() -> Dict[str, Any]:
    assert REPLAY_JSON.is_file(), f"Missing {REPLAY_JSON}"
    with open(REPLAY_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def quality_data() -> Dict[str, Any]:
    assert QUALITY_JSON.is_file(), f"Missing {QUALITY_JSON}"
    with open(QUALITY_JSON, "r", encoding="utf-8") as f:
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
    assert rem_sha == "691a19643107241a995d0af90483a335ec35c47c479a07c447449dec3f6056fe", (
        "Remediated candidate CSV hash mismatch!"
    )


# 2. Report Files Existence
def test_phase_10_reports_existence():
    """Verify all 6 Phase 3C.4E.10 report files exist and are non-empty."""
    for path in [
        COVERAGE_JSON,
        DEFINITIONS_JSON,
        CUTOFF_JSON,
        REPLAY_JSON,
        QUALITY_JSON,
        SUMMARY_MD,
    ]:
        assert path.is_file(), f"Expected artifact {path} does not exist"
        assert path.stat().st_size > 0, f"Artifact {path} is empty"


# 3. Session Data Coverage Invariants
def test_session_data_coverage_invariants(coverage_data):
    """Verify 90 total races audited, sprint count, and seasonal weather characteristics."""
    meta = coverage_data["metadata"]
    assert meta["total_races_evaluated"] == 90
    assert meta["total_driver_records"] == 1798

    cal = coverage_data["championship_calendar_breakdown"]
    assert cal["races_by_season"]["2021"] == 22
    assert cal["races_by_season"]["2022"] == 22
    assert cal["races_by_season"]["2023"] == 22
    assert cal["races_by_season"]["2024"] == 24

    # Sprint races: 3 in 2021, 3 in 2022, 6 in 2023, 6 in 2024 -> 18 total
    sprints = cal["sprint_races_by_season"]
    assert sprints["2021"] == 3
    assert sprints["2022"] == 3
    assert sprints["2023"] == 6
    assert sprints["2024"] == 6

    # Weather missing rate ~51.1%
    weather = coverage_data["weather_data_audit"]
    assert weather["aggregate_missing_rate_pct"] == pytest.approx(51.1, abs=0.5)
    assert weather["by_season"]["2021"]["air_temp_available_pct"] == 100.0
    assert weather["by_season"]["2022"]["air_temp_available_pct"] == 100.0
    assert weather["by_season"]["2023"]["air_temp_available_pct"] == 0.0
    assert weather["by_season"]["2024"]["air_temp_available_pct"] == 0.0


# 4. Prediction Cutoff Validator & Temporal Isolation
def test_prediction_cutoff_temporal_isolation():
    """Verify cutoff validation rejects forbidden future sessions and timestamps."""
    # Standard weekend provisional stage allows FP1, FP2, FP3, Qualifying
    assert PredictionCutoffValidator.validate_session_allowed(
        "FP2", WeekendFormat.STANDARD, PredictionStage.PROVISIONAL_POST_QUALIFYING
    ) is True
    assert PredictionCutoffValidator.validate_session_allowed(
        "QUALIFYING", WeekendFormat.STANDARD, PredictionStage.PROVISIONAL_POST_QUALIFYING
    ) is True

    # Reject RACE during provisional stage
    with pytest.raises(CutoffViolationError):
        PredictionCutoffValidator.validate_session_allowed(
            "RACE", WeekendFormat.STANDARD, PredictionStage.PROVISIONAL_POST_QUALIFYING
        )

    # Reject OFFICIAL_GRID_DOC during provisional stage
    with pytest.raises(CutoffViolationError):
        PredictionCutoffValidator.validate_session_allowed(
            "OFFICIAL_GRID_DOC", WeekendFormat.STANDARD, PredictionStage.PROVISIONAL_POST_QUALIFYING
        )

    # Sprint weekend rejects FP2 on 2024 format
    with pytest.raises(CutoffViolationError):
        PredictionCutoffValidator.validate_session_allowed(
            "FP2", WeekendFormat.SPRINT, PredictionStage.PROVISIONAL_POST_SPRINT_AND_QUALIFYING
        )

    # Timestamp isolation: valid vs leaking
    valid_ts = "2024-05-04T17:00:00Z"
    cutoff_ts = "2024-05-04T17:30:00Z"
    future_ts = "2024-05-04T18:00:00Z"

    assert PredictionCutoffValidator.validate_timestamp_isolation(valid_ts, cutoff_ts, "fp2_pace") is True
    with pytest.raises(CutoffViolationError):
        PredictionCutoffValidator.validate_timestamp_isolation(future_ts, cutoff_ts, "leaking_feature")


# 5. PaceFeatureBuilder Calculation Contracts
def test_pace_feature_builder_calculations():
    """Verify feature formulas, unit conversions, and explicit null handling."""
    # 1. Qualifying delta to pole %
    pole_t = 89.179
    driver_t = 89.407
    delta_pct, err = PaceFeatureBuilder.compute_qualifying_delta_to_pole(driver_t, pole_t)
    assert err is None
    expected_pct = ((driver_t - pole_t) / pole_t) * 100.0
    assert delta_pct == pytest.approx(expected_pct, abs=1e-3)
    assert delta_pct == pytest.approx(0.2557, abs=1e-3)

    # Missing qualifying lap handling
    d_none, err_none = PaceFeatureBuilder.compute_qualifying_delta_to_pole(None, pole_t)
    assert d_none is None
    assert err_none == "NO_VALID_QUALI_TIME"

    # 2. FP2 long run pace on standard weekend
    laps = [97.10, 97.15, 97.20, 97.28, 97.35, 97.42, 97.50]
    res_std = PaceFeatureBuilder.compute_fp2_long_run_metrics(laps, is_sprint_weekend=False)
    assert res_std["missing_reason"] is None
    assert res_std["median_pace"] == pytest.approx(97.28, abs=0.01)
    assert res_std["valid_laps_count"] == 7
    assert res_std["stint_consistency"] > 0.0
    assert res_std["degradation_estimate"] > 0.0

    # FP2 on sprint weekend returns None
    res_sprint = PaceFeatureBuilder.compute_fp2_long_run_metrics(laps, is_sprint_weekend=True)
    assert res_sprint["median_pace"] is None
    assert res_sprint["missing_reason"] == "SPRINT_WEEKEND_NO_FP2"

    # 3. Track overtaking index
    assert PaceFeatureBuilder.get_track_overtaking_difficulty("monaco") == 0.05
    assert PaceFeatureBuilder.get_track_overtaking_difficulty("spa") == 0.85
    assert PaceFeatureBuilder.get_track_overtaking_difficulty("unknown_circuit") == 0.50

    # 4. Sprint race pace delta
    d_laps = [92.0, 92.1, 92.2, 92.3, 92.4, 92.5]
    w_laps = [91.5, 91.6, 91.7, 91.8, 91.9, 92.0]
    s_delta, s_err = PaceFeatureBuilder.compute_sprint_race_pace(d_laps, w_laps, is_sprint_weekend=True)
    assert s_err is None
    assert s_delta == pytest.approx(0.50, abs=0.01)

    s_delta_std, s_err_std = PaceFeatureBuilder.compute_sprint_race_pace(d_laps, w_laps, is_sprint_weekend=False)
    assert s_delta_std is None
    assert s_err_std == "STANDARD_WEEKEND_NO_SPRINT"


# 6. Historical Replay Determinism & 6 Archetypes
def test_historical_replay_results(replay_data):
    """Verify replay determinism and archetype evaluations."""
    meta = replay_data["metadata"]
    assert meta["determinism_verified"] is True
    assert meta["archetypes_count"] == 6

    replays = replay_data["archetype_replays"]
    expected_keys = [
        "high_tyre_degradation_standard",
        "constructor_performance_shift_sprint",
        "street_circuit_low_overtaking",
        "wet_changing_conditions",
        "standard_weekend_high_aero",
        "sprint_weekend_collision_attrition",
    ]
    for k in expected_keys:
        assert k in replays, f"Missing archetype {k}"

    # Verify Sprint Archetype (Miami 2024) has null FP2 pace and valid sprint pace
    miami = replays["constructor_performance_shift_sprint"]
    assert miami["metadata"]["race_id"] == "2024_6_miami"
    assert miami["metadata"]["weekend_format"] == "sprint"
    for d in miami["features"]:
        assert d["fp2_long_run_median_pace"] is None
        assert d["missing_reasons"]["fp2_features"] == "SPRINT_WEEKEND_NO_FP2"
        # Sprint pace is available
        assert d["sprint_race_pace_indicator"] is not None

    # Verify Street Circuit Archetype (Monaco 2024) has overtaking index 0.05
    monaco = replays["street_circuit_low_overtaking"]
    assert monaco["metadata"]["race_id"] == "2024_8_monaco"
    for d in monaco["features"]:
        assert d["track_overtaking_difficulty"] == 0.05


# 7. Feature Quality & Track Penalty Research
def test_feature_quality_and_penalty_research(quality_data):
    """Verify feature quality classification and causal penalty research conclusions."""
    metrics = quality_data["feature_quality_metrics"]
    assert metrics["qualifying_delta_to_pole_pct"]["readiness_status"] == "READY FOR ABLATION"
    assert metrics["track_overtaking_difficulty"]["readiness_status"] == "READY FOR ABLATION"
    assert "CONDITIONALLY READY" in metrics["fp2_long_run_median_pace"]["readiness_status"]

    penalty = quality_data["track_penalty_research"]
    assert len(penalty["empirical_archetype_evidence"]) == 3
    circuits = [e["circuit"] for e in penalty["empirical_archetype_evidence"]]
    assert any("Monaco" in c for c in circuits)
    assert any("Spa" in c for c in circuits)


# 8. Production Gate Attestation
def test_production_gate_attestation():
    """Verify summary markdown explicitly affirms CLOSED production gate."""
    assert SUMMARY_MD.is_file()
    with open(SUMMARY_MD, "r", encoding="utf-8") as f:
        content = f.read()

    assert "## 6. Production Safety & Boundary Attestation" in content
    assert "**PRODUCTION GATE: STRICTLY CLOSED**" in content
    assert "No automatic model promotion or production deployment has taken place." in content

    # Verify no unexpected files in models/predictor/v1.0.0/
    prod_model_dir = BASE_DIR / "models" / "predictor" / "v1.0.0"
    files = [f.name for f in prod_model_dir.iterdir() if f.is_file()]
    assert "trained_models.joblib" in files
    assert "trained_models_model_b.joblib" not in files
    assert "model_b.joblib" not in files

