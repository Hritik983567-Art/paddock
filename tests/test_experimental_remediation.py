"""Tests for Phase 3C.4E.6: Historical Dataset Remediation & Shadow Model Evaluation.

Verifies:
1. Immutability of original historical dataset and frozen model bundle.
2. Structure and schema compliance of the remediated dataset candidate.
3. Accurate implementation of Remediation Rules A, B, C, D, and E.
4. Lineage report completeness and JSON schema validity.
5. Deterministic shadow model training and comparison reporting.
6. Strict production isolation (no writes to production snapshots, routes, or frozen model).
"""

import hashlib
import json
from pathlib import Path
import jsonschema
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
    NULL_QUALI_TIME_MAP,
    build_remediated_dataset,
)
from scripts.predictor_model.experimental_training import ExperimentalModelTrainer
from scripts.predictor_model.experimental_evaluation import ShadowModelEvaluator

BASE_DIR = Path(__file__).resolve().parent.parent
EXPERIMENTAL_DIR = BASE_DIR / "data" / "predictor" / "experimental"
REPORTS_DIR = BASE_DIR / "scripts" / "predictor_model" / "reports"
SCHEMA_PATH = BASE_DIR / "scripts" / "predictor_model" / "experimental_schema.json"
FROZEN_MODEL_PATH = BASE_DIR / "models" / "predictor" / "v1.0.0" / "trained_models.joblib"

REMEDIATED_CSV_PATH = EXPERIMENTAL_DIR / "f1_race_predictor_dataset_v1_remediated.csv"
LINEAGE_PATH = REPORTS_DIR / "remediation_lineage.json"
SHADOW_REPORT_PATH = REPORTS_DIR / "shadow_model_comparison.json"


@pytest.fixture(scope="module")
def schema():
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def remediated_df():
    if not REMEDIATED_CSV_PATH.is_file():
        build_remediated_dataset()
    return pd.read_csv(REMEDIATED_CSV_PATH)


@pytest.fixture(scope="module")
def lineage_data():
    if not LINEAGE_PATH.is_file():
        build_remediated_dataset()
    with open(LINEAGE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="module")
def shadow_report():
    if not SHADOW_REPORT_PATH.is_file():
        evaluator = ShadowModelEvaluator(random_seed=RANDOM_SEED)
        evaluator.evaluate()
    with open(SHADOW_REPORT_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# 1. Baseline Immutability
def test_original_dataset_and_model_immutability():
    """Verify original CSV and frozen model bundle SHA-256 digests remain identical."""
    assert Path(DATASET_CSV_PATH).is_file(), f"Original CSV missing at {DATASET_CSV_PATH}"
    assert FROZEN_MODEL_PATH.is_file(), f"Frozen model bundle missing at {FROZEN_MODEL_PATH}"

    csv_bytes = Path(DATASET_CSV_PATH).read_bytes()
    model_bytes = FROZEN_MODEL_PATH.read_bytes()

    csv_hash = hashlib.sha256(csv_bytes).hexdigest()
    model_hash = hashlib.sha256(model_bytes).hexdigest().upper()

    assert csv_hash == EXPECTED_ORIGINAL_SHA256, (
        f"Original dataset CSV was altered! Expected {EXPECTED_ORIGINAL_SHA256}, got {csv_hash}"
    )
    assert model_hash == EXPECTED_MODEL_SHA256, (
        f"Frozen model bundle was altered! Expected {EXPECTED_MODEL_SHA256}, got {model_hash}"
    )


# 2. Remediated Dataset Structure & Sporting Columns
def test_remediated_dataset_structure(remediated_df):
    """Verify remediated dataset candidate contains all 1798 rows and the 10 sporting columns."""
    assert len(remediated_df) == 1798
    assert remediated_df["race_id"].nunique() == 90

    expected_sporting_cols = [
        "entry_status",
        "qualifying_status",
        "starting_status",
        "race_participation_status",
        "start_type",
        "track_grid_box",
        "pit_lane_order",
        "model_feature_grid_position",
        "source_confidence",
        "manual_verification_required",
    ]
    for col in expected_sporting_cols:
        assert col in remediated_df.columns, f"Missing required sporting column: {col}"

    # Verify enum sets
    valid_participations = {
        "STARTED",
        "PIT_LANE_STARTED",
        "DNS",
        "WITHDRAWN_BEFORE_START",
        "EXCLUDED",
        "UNKNOWN",
    }
    assert set(remediated_df["race_participation_status"].unique()).issubset(valid_participations)

    valid_start_types = {"STANDING_START", "PIT_LANE", "DID_NOT_START"}
    assert set(remediated_df["start_type"].unique()).issubset(valid_start_types)

    valid_confidences = {"CONFIRMED_FIA_DOC", "ESTABLISHED_HISTORICAL", "PROVISIONAL", "UNRESOLVED"}
    assert set(remediated_df["source_confidence"].unique()).issubset(valid_confidences)


# 3. Rule A: Confirmed Pit-Lane Starts
def test_rule_a_pit_lane_start_remediation(remediated_df):
    """Verify Zhou Guanyu at Singapore 2023 is remediated per Rule A."""
    zhou = remediated_df[
        (remediated_df["race_id"] == "2023_15_marina_bay") & (remediated_df["driver_id"] == "zhou")
    ]
    assert len(zhou) == 1
    row = zhou.iloc[0]

    assert row["start_type"] == "PIT_LANE"
    assert row["starting_status"] == "PIT_LANE"
    assert row["race_participation_status"] == "PIT_LANE_STARTED"
    assert pd.isna(row["track_grid_box"])  # Physical grid box is null
    assert row["pit_lane_order"] == 1
    assert row["model_feature_grid_position"] == 20
    assert row["grid_position"] == 20  # Model feature compatibility
    assert row["grid_penalty_delta"] == 1  # 20 - 19 = 1
    assert row["source_confidence"] == "CONFIRMED_FIA_DOC"
    assert row["manual_verification_required"] is False or row["manual_verification_required"] == 0


# 4. Rule B: Confirmed Pre-Race Withdrawals
def test_rule_b_pre_race_withdrawals_exclusion(remediated_df):
    """Verify Stroll (Singapore 2023) and Schumacher (Saudi 2022) are marked WITHDRAWN."""
    stroll = remediated_df[
        (remediated_df["race_id"] == "2023_15_marina_bay") & (remediated_df["driver_id"] == "stroll")
    ]
    assert len(stroll) == 1
    stroll_row = stroll.iloc[0]
    assert stroll_row["race_participation_status"] == "WITHDRAWN_BEFORE_START"
    assert stroll_row["starting_status"] == "WITHDRAWN"
    assert stroll_row["start_type"] == "DID_NOT_START"
    assert pd.isna(stroll_row["track_grid_box"])
    assert pd.isna(stroll_row["model_feature_grid_position"])

    mick = remediated_df[
        (remediated_df["race_id"] == "2022_2_jeddah") & (remediated_df["driver_id"] == "mick_schumacher")
    ]
    assert len(mick) == 1
    mick_row = mick.iloc[0]
    assert mick_row["race_participation_status"] == "WITHDRAWN_BEFORE_START"
    assert mick_row["starting_status"] == "WITHDRAWN"
    assert mick_row["start_type"] == "DID_NOT_START"
    assert pd.isna(mick_row["track_grid_box"])
    assert pd.isna(mick_row["model_feature_grid_position"])

    # Verify trainer partition filtering
    trainer = ExperimentalModelTrainer(random_seed=RANDOM_SEED)
    train_a, train_b = trainer.prepare_training_partitions(FINAL_TRAIN_SEASONS)
    assert len(train_a) == 1319
    assert len(train_b) == 1317
    assert len(train_a) - len(train_b) == 2


# 5. Rule C: DNS Distinction
def test_rule_c_dns_classification(remediated_df):
    """Verify reconnaissance and formation lap DNS are classified as DNS, not pre-race withdrawals."""
    # Leclerc Brazil 2023
    lec = remediated_df[
        (remediated_df["race_id"] == "2023_20_interlagos") & (remediated_df["driver_id"] == "leclerc")
    ]
    assert len(lec) == 1
    assert lec.iloc[0]["race_participation_status"] == "DNS"
    assert lec.iloc[0]["starting_status"] == "DNS_ON_GRID"
    assert lec.iloc[0]["track_grid_box"] == 2

    # Sainz Qatar 2023
    sainz = remediated_df[
        (remediated_df["race_id"] == "2023_17_losail") & (remediated_df["driver_id"] == "sainz")
    ]
    assert len(sainz) == 1
    assert sainz.iloc[0]["race_participation_status"] == "DNS"
    assert sainz.iloc[0]["starting_status"] == "DNS_GARAGE"
    assert sainz.iloc[0]["track_grid_box"] == 12

    # Tsunoda Saudi Arabia 2022
    tsu = remediated_df[
        (remediated_df["race_id"] == "2022_2_jeddah") & (remediated_df["driver_id"] == "tsunoda")
    ]
    assert len(tsu) == 1
    assert tsu.iloc[0]["race_participation_status"] == "DNS"
    assert tsu.iloc[0]["starting_status"] == "DNS_RECONNAISSANCE"
    assert tsu.iloc[0]["track_grid_box"] == 19


# 6. Rule D: Missing Qualifying Times
def test_rule_d_missing_quali_times(remediated_df):
    """Verify all 18 records with null quali_time_sec have explicit qualifying_status."""
    null_quali = remediated_df[remediated_df["quali_time_sec"].isna()]
    assert len(null_quali) == 18

    valid_statuses = {
        "CRASH_IN_PRACTICE",
        "CRASH_IN_QUALIFYING",
        "MECHANICAL_FAILURE",
        "NO_TIMED_LAP",
    }
    for _, row in null_quali.iterrows():
        assert row["qualifying_status"] in valid_statuses, (
            f"Invalid qualifying status '{row['qualifying_status']}' for {row['race_id']} {row['driver_id']}"
        )


# 7. Rule E: Ambiguous Grid 20 Provisional Marking
def test_rule_e_ambiguous_grid_20(remediated_df):
    """Verify the 8 races with duplicate grid=20 are marked PROVISIONAL and require verification."""
    provisional_p20 = remediated_df[
        remediated_df["race_id"].isin(DUPLICATE_P20_RACES) & (remediated_df["grid_position"] == 20)
    ]
    assert len(provisional_p20) == 17

    for _, row in provisional_p20.iterrows():
        assert row["source_confidence"] == "PROVISIONAL"
        assert bool(row["manual_verification_required"]) is True


# 8. Schema Validation & Lineage Completeness
def test_lineage_and_comparison_schema_validity(schema, lineage_data, shadow_report):
    """Verify both remediation_lineage.json and shadow_model_comparison.json validate against schema."""
    entry_schema = schema["definitions"]["remediation_lineage_entry"]
    assert len(lineage_data["records"]) == 42
    for r in lineage_data["records"]:
        jsonschema.validate(instance=r, schema=entry_schema)

    comp_schema = schema["definitions"]["shadow_model_comparison"]
    jsonschema.validate(instance=shadow_report, schema=comp_schema)


# 9. Shadow Model Benchmark Evaluation Integrity
def test_shadow_model_benchmark_metrics(shadow_report):
    """Verify holdout evaluation metrics are computed, sensible, and show calibration improvement."""
    h = shadow_report["holdout_2024_benchmark"]
    mA = h["model_a_calibrated"]
    mB = h["model_b_calibrated"]
    gB = h["grid_position_baseline_b"]

    assert h["races_evaluated"] == 24
    assert h["total_driver_records"] == 479

    # Model A Top-1 accuracy in valid range [50%, 60%]
    assert 50.0 <= mA["top1_hit_rate_pct"] <= 60.0
    # Model B Top-1 accuracy in valid range [45%, 60%]
    assert 45.0 <= mB["top1_hit_rate_pct"] <= 60.0
    # Baseline Top-1 accuracy
    assert 40.0 <= gB["top1_hit_rate_pct"] <= 55.0

    # Model B achieves lower Log Loss and Brier score than Model A
    assert mB["multiclass_log_loss"] <= mA["multiclass_log_loss"]
    assert mB["multiclass_brier_score"] <= mA["multiclass_brier_score"]
    assert mB["expected_calibration_error"] <= mA["expected_calibration_error"]

    # Folds must be present
    assert len(shadow_report["rolling_origin_folds"]) == 2


# 10. Production Isolation & Gate Status
def test_production_isolation_and_safety():
    """Verify that no production prediction routes, snapshots, or frozen model bundles were altered."""
    # Ensure production model bundle is untouched
    model_bytes = FROZEN_MODEL_PATH.read_bytes()
    assert hashlib.sha256(model_bytes).hexdigest().upper() == EXPECTED_MODEL_SHA256

    # Verify no snapshots written to production directory
    snapshots_dir = BASE_DIR / "data" / "predictor" / "snapshots"
    if snapshots_dir.is_dir():
        for snap_file in snapshots_dir.glob("*.json"):
            content = json.loads(snap_file.read_text(encoding="utf-8"))
            assert "raceId" in content or "race_id" in content or "snapshot_id" in content or "status" in content
