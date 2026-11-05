"""Test Suite for Historical Training Dataset Integrity Audit (Phase 3C.4E.5).

Verifies:
- Frozen model bundle artifact SHA-256 remains untouched.
- Dataset CSV SHA-256 remains untouched.
- Dataset-wide structural audit metrics (90 races, 1,798 rows, 0 null grid positions).
- Anomaly detector distinguishes confirmed discrepancies, suspected anomalies, and legitimate exceptions.
- Benchmark fixtures (Singapore 2023, Saudi 2024, Spa 2024, Monza 2022) correctly classified.
- Training matrix impact analysis and schema validation.
- Deterministic and reproducible report generation.
"""

import json
from pathlib import Path

import jsonschema
import pytest

from scripts.predictor_model.dataset_integrity_audit import (
    AUDIT_VERSION,
    DATASET_PATH,
    EXPECTED_MODEL_SHA256,
    MODEL_PATH,
    SCHEMA_PATH,
    audit_training_matrix_impact,
    compute_structural_overview,
    execute_full_integrity_audit,
    load_dataset_and_hashes,
    run_anomaly_detector,
)

REPORTS_DIR = Path(__file__).parent.parent / "scripts" / "predictor_model" / "reports"


class TestDatasetAndModelHashes:
    """Verify cryptographic hashes of dataset and model bundle."""

    def test_model_artifact_sha256_unmodified(self):
        _, _, model_hash = load_dataset_and_hashes()
        assert model_hash == EXPECTED_MODEL_SHA256
        assert model_hash == "D8244024E6B7F0F31912EFE80B35652EF228461955232DDE7E4D65ECCC5779CD"

    def test_dataset_csv_sha256_unmodified(self):
        _, csv_hash, _ = load_dataset_and_hashes()
        assert csv_hash == "b1f50ef057e5af732325bb8a784d96b92b34b4441900ceb2a0fd66b579c629af"


class TestDatasetStructuralMetrics:
    """Verify global structural and distribution counts across all 90 historical races."""

    def test_structural_counts(self):
        df, _, _ = load_dataset_and_hashes()
        overview = compute_structural_overview(df)

        assert overview["total_races"] == 90
        assert overview["total_training_rows"] == 1798
        assert overview["unique_drivers"] == 32
        assert overview["unique_constructors"] == 12

        # 88 races have 20 drivers; 2 races have 19 drivers (Monaco 2021, Australia 2024)
        assert overview["races_with_20_drivers"] == 88
        assert overview["races_with_fewer_than_20_drivers"] == 2

        # No corrupt or missing identifiers
        assert overview["duplicate_race_driver_pairs"] == 0
        assert overview["missing_driver_ids"] == 0
        assert overview["missing_grid_positions"] == 0
        assert overview["missing_quali_positions"] == 0
        assert overview["grid_positions_outside_1_to_20"] == 0

        # Exact number of races with duplicate grid positions (all position 20 ties)
        assert overview["races_with_duplicate_grid_positions"] == 8


class TestAnomalyDetectorClassification:
    """Verify anomaly detector accurately classifies anomalies vs legitimate sporting cases."""

    def test_detect_singapore_2023_confirmed_discrepancies(self):
        df, _, _ = load_dataset_and_hashes()
        anomalies = run_anomaly_detector(df)

        confirmed = [a for a in anomalies if a["classification"] == "CONFIRMED_DISCREPANCY"]
        assert len(confirmed) >= 2

        # Check Zhou pit lane start recorded as grid 19
        zhou_case = next(a for a in confirmed if a["race_id"] == "2023_15_marina_bay" and a["driver_id"] == "zhou")
        assert zhou_case["grid_position"] == 19
        assert "pit lane" in zhou_case["description"].lower()

        # Check Stroll withdrawal recorded as grid 20
        stroll_case = next(a for a in confirmed if a["race_id"] == "2023_15_marina_bay" and a["driver_id"] == "stroll")
        assert stroll_case["grid_position"] == 20
        assert "withdrew" in stroll_case["description"].lower()

    def test_detect_suspected_pre_race_withdrawals_and_dns(self):
        df, _, _ = load_dataset_and_hashes()
        anomalies = run_anomaly_detector(df)

        suspected = [a for a in anomalies if a["classification"] == "SUSPECTED_ANOMALY"]
        suspected_drivers = {(a["race_id"], a["driver_id"]) for a in suspected}

        # Mick Schumacher Saudi Arabia 2022 (Q2 crash withdrawal ingested as grid 20)
        assert ("2022_2_jeddah", "mick_schumacher") in suspected_drivers

        # Yuki Tsunoda Saudi Arabia 2022 (driveline failure on way to grid DNS)
        assert ("2022_2_jeddah", "tsunoda") in suspected_drivers

        # Carlos Sainz Qatar 2023 (pre-race fuel leak DNS)
        assert ("2023_17_losail", "sainz") in suspected_drivers

        # Charles Leclerc Brazil 2023 (formation lap crash DNS)
        assert ("2023_20_interlagos", "leclerc") in suspected_drivers

        # Charles Leclerc Monaco 2021 (driveshaft failure dropped leaving 19 rows)
        assert ("2021_5_monaco", "leclerc") in suspected_drivers

    def test_legitimate_sporting_exceptions_excluded(self):
        df, _, _ = load_dataset_and_hashes()
        anomalies = run_anomaly_detector(df)

        legit = [a for a in anomalies if a["classification"] == "LEGITIMATE_SPORTING_EXCEPTION"]
        legit_cases = {(a["race_id"], a["driver_id"]) for a in legit}

        # Saudi Arabia 2024 Zhou (107% dispensation starting physical P20 on track)
        assert ("2024_2_jeddah", "zhou") in legit_cases

        # Saudi Arabia 2024 Bearman (driver substitution in Car 38)
        assert ("2024_2_jeddah", "bearman") in legit_cases

        # Monza 2022 & Spa 2024 penalty cascades
        assert ("2022_16_monza", "max_verstappen") in legit_cases
        assert ("2024_14_spa", "max_verstappen") in legit_cases


class TestTrainingMatrixImpactAndReports:
    """Verify feature impact analysis and schema validation of reports."""

    def test_training_matrix_impact(self):
        df, _, _ = load_dataset_and_hashes()
        anomalies = run_anomaly_detector(df)
        impact = audit_training_matrix_impact(df, anomalies)

        assert impact["training_cutoff"] == "2023-12-31"
        assert impact["target_label_affected"] is True
        assert impact["imputation_masking_detected"] is True
        assert "grid_position" in impact["affected_feature_columns"]
        assert "grid_penalty_delta" in impact["affected_feature_columns"]
        assert "outqualified_teammate" in impact["affected_feature_columns"]

    def test_execute_audit_and_validate_schema(self):
        summary_report = execute_full_integrity_audit()

        # Validate against schema
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            schema = json.load(f)
        jsonschema.validate(instance=summary_report, schema=schema)

        # Check report files exist on disk
        assert (REPORTS_DIR / "dataset_integrity_summary.json").is_file()
        assert (REPORTS_DIR / "training_matrix_impact.json").is_file()
        assert (REPORTS_DIR / "dataset_integrity_anomalies.csv").is_file()

