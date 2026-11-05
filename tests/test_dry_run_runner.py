"""
Unit and Integration Tests for Phase 3C.4B — Dry-Run Inference Runner.

Covers all 18 mandated validation, contract, and safety checks:
1. Valid historical race.
2. Unknown race ID.
3. Malformed race ID.
4. Unsupported stage.
5. Missing baseline data.
6. Missing or unexpected model features.
7. Invalid probabilities.
8. Probability sum outside tolerance.
9. Duplicate or missing drivers.
10. Missing provenance.
11. Invalid timestamps.
12. Deterministic input hashing.
13. Existing output-file collision.
14. Atomic output behavior.
15. 2026 regulation warning.
16. No network access or Supabase writes.
17. Model artifact remains unchanged.
18. Failed validation produces no final snapshot artifact.
"""

import os
import sys
import json
import socket
import hashlib
from unittest.mock import patch, MagicMock
import pytest
import numpy as np
import pandas as pd

from scripts.predictor_pipeline.run_inference_snapshot import (
    run_dry_run_inference,
    parse_race_id,
    compute_input_hash,
    validate_dry_run_snapshot,
    RunnerError,
    SnapshotValidationError,
    REGULATION_ERA_WARNING_2026
)
from scripts.predictor_model.config import (
    MODEL_VERSION,
    FEATURE_SCHEMA_VERSION,
    MODELS_ROOT_DIR,
    PROJECT_ROOT
)
from scripts.predictor_model.features import ALL_MODEL_FEATURES

EXPECTED_FROZEN_MODEL_HASH = "D8244024E6B7F0F31912EFE80B35652EF228461955232DDE7E4D65ECCC5779CD"


def _compute_file_sha256(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest().upper()


# ==========================================
# Test 1: Valid Historical Race
# ==========================================
def test_valid_historical_race(tmp_path):
    res = run_dry_run_inference(
        race_id="2025_1",
        stage="provisional",
        output_dir=str(tmp_path),
        dry_run=True
    )
    assert res["status"] == "success"
    assert os.path.exists(res["artifact_path"])

    with open(res["artifact_path"], "r", encoding="utf-8") as f:
        snap = json.load(f)

    assert snap["season"] == 2025
    assert snap["round"] == 1
    assert snap["circuitId"] == "albert_park"
    assert snap["stage"] == "provisional"
    assert snap["predictionStage"] == "after_qualifying"
    assert snap["modelVersion"] == "v1.0.0"
    assert snap["featureSchemaVersion"] == "1.0.0"
    assert snap["dryRun"] is True
    assert snap["qualifyingStatus"]["hasPenaltiesApplied"] is False
    assert len(snap["predictions"]) == 20
    assert snap["predictedWinner"]["driverId"] == snap["predictions"][0]["driverId"]
    assert np.isclose(sum(d["winProbability"] for d in snap["predictions"]), 1.0, atol=0.005)


# ==========================================
# Test 2: Unknown Race ID
# ==========================================
def test_unknown_race_id(tmp_path):
    with pytest.raises(RunnerError) as exc_info:
        run_dry_run_inference(
            race_id="2025_30",
            stage="provisional",
            output_dir=str(tmp_path),
            dry_run=True
        )
    assert exc_info.value.error_type == "TARGET_RACE_NOT_FOUND"


# ==========================================
# Test 3: Malformed Race ID
# ==========================================
@pytest.mark.parametrize("bad_id, expected_err", [
    ("invalid_race", "INVALID_RACE_ID_FORMAT"),
    ("2025", "INVALID_RACE_ID_FORMAT"),
    ("1940_1", "INVALID_SEASON"),
    ("2025_99", "INVALID_ROUND"),
    ("", "INVALID_RACE_ID")
])
def test_malformed_race_id(tmp_path, bad_id, expected_err):
    with pytest.raises(RunnerError) as exc_info:
        run_dry_run_inference(
            race_id=bad_id,
            stage="provisional",
            output_dir=str(tmp_path),
            dry_run=True
        )
    assert exc_info.value.error_type == expected_err


# ==========================================
# Test 4: Unsupported Stage
# ==========================================
@pytest.mark.parametrize("bad_stage", ["official_grid", "live", "unknown", ""])
def test_unsupported_stage(tmp_path, bad_stage):
    with pytest.raises(RunnerError) as exc_info:
        run_dry_run_inference(
            race_id="2025_1",
            stage=bad_stage,
            output_dir=str(tmp_path),
            dry_run=True
        )
    assert exc_info.value.error_type == "UNSUPPORTED_STAGE"


# ==========================================
# Test 5: Missing Baseline Data
# ==========================================
def test_missing_baseline_data(tmp_path):
    nonexistent = str(tmp_path / "nonexistent_baseline.json")
    with pytest.raises(RunnerError) as exc_info:
        run_dry_run_inference(
            race_id="2025_1",
            stage="provisional",
            output_dir=str(tmp_path),
            baseline_path=nonexistent,
            dry_run=True
        )
    assert exc_info.value.error_type == "BASELINE_FILE_MISSING"


# ==========================================
# Test 6: Missing or Unexpected Model Features
# ==========================================
def test_missing_or_unexpected_model_features(tmp_path):
    with patch("scripts.predictor_pipeline.live_feature_builder.LiveFeatureBuilder.build_features_for_race") as mock_build:
        # Create a mock with missing features
        bad_df = pd.DataFrame({"grid_position": [1, 2]})
        mock_build.return_value = MagicMock(
            features_df=bad_df,
            metadata_df=pd.DataFrame({"driver_id": ["norris", "piastri"]}),
            diagnostics={}
        )

        with pytest.raises(RunnerError) as exc_info:
            run_dry_run_inference(
                race_id="2025_1",
                stage="provisional",
                output_dir=str(tmp_path),
                dry_run=True
            )
        assert exc_info.value.error_type == "FEATURE_CONTRACT_VIOLATION"


# ==========================================
# Test 7: Invalid Probabilities
# ==========================================
def test_invalid_probabilities(tmp_path):
    with patch("scripts.predictor_pipeline.run_inference_snapshot.load_and_verify_model_bundle") as mock_load:
        mock_lgb = MagicMock()
        mock_lgb.predict_race_probabilities.return_value = np.array([np.nan] * 20)
        mock_load.return_value = (mock_lgb, {"explainability_summary": {}})

        with pytest.raises(RunnerError) as exc_info:
            run_dry_run_inference(
                race_id="2025_1",
                stage="provisional",
                output_dir=str(tmp_path),
                dry_run=True
            )
        assert exc_info.value.error_type == "NON_FINITE_PROBABILITIES"


# ==========================================
# Test 8: Probability Sum Outside Tolerance
# ==========================================
def test_probability_sum_outside_tolerance():
    template = {
        "status": "success",
        "season": 2025,
        "round": 1,
        "circuitId": "bahrain",
        "stage": "provisional",
        "qualifyingStatus": {"hasPenaltiesApplied": False},
        "modelVersion": "v1.0.0",
        "featureSchemaVersion": "1.0.0",
        "generatedAtUtc": "2025-03-01T17:00:00Z",
        "provenance": {"qualifyingSource": "test", "baselineVersion": "1.3.1"},
        "expectedRoster": ["norris", "piastri"],
        "predictions": [
            {"driverId": "norris", "winProbability": 0.9},
            {"driverId": "piastri", "winProbability": 0.9} # sum = 1.8
        ],
        "predictedWinner": {"driverId": "norris", "winProbability": 0.9}
    }
    with pytest.raises(SnapshotValidationError) as exc_info:
        validate_dry_run_snapshot(template)
    assert exc_info.value.error_type == "PROBABILITY_SUM_OUT_OF_BOUNDS"


# ==========================================
# Test 9: Duplicate or Missing Drivers
# ==========================================
def test_duplicate_or_missing_drivers():
    base = {
        "status": "success",
        "season": 2025,
        "round": 1,
        "circuitId": "bahrain",
        "stage": "provisional",
        "qualifyingStatus": {"hasPenaltiesApplied": False},
        "modelVersion": "v1.0.0",
        "featureSchemaVersion": "1.0.0",
        "generatedAtUtc": "2025-03-01T17:00:00Z",
        "provenance": {"qualifyingSource": "test", "baselineVersion": "1.3.1"},
        "expectedRoster": ["norris", "piastri"]
    }

    # Duplicate driver
    dup = {
        **base,
        "predictions": [
            {"driverId": "norris", "winProbability": 0.6},
            {"driverId": "norris", "winProbability": 0.4}
        ],
        "predictedWinner": {"driverId": "norris", "winProbability": 0.6}
    }
    with pytest.raises(SnapshotValidationError) as exc1:
        validate_dry_run_snapshot(dup)
    assert exc1.value.error_type == "DUPLICATE_DRIVER_ID"

    # Missing driver
    missing = {
        **base,
        "predictions": [
            {"driverId": "norris", "winProbability": 1.0}
        ],
        "predictedWinner": {"driverId": "norris", "winProbability": 1.0}
    }
    with pytest.raises(SnapshotValidationError) as exc2:
        validate_dry_run_snapshot(missing)
    assert exc2.value.error_type == "MISSING_DRIVER"


# ==========================================
# Test 10: Missing Provenance
# ==========================================
def test_missing_provenance():
    base_payload = {
        "status": "success",
        "season": 2025,
        "round": 1,
        "circuitId": "bahrain",
        "stage": "provisional",
        "qualifyingStatus": {"hasPenaltiesApplied": False},
        "modelVersion": "v1.0.0",
        "featureSchemaVersion": "1.0.0",
        "generatedAtUtc": "2025-03-01T17:00:00Z",
        "expectedRoster": ["norris"],
        "predictions": [{"driverId": "norris", "winProbability": 1.0}],
        "predictedWinner": {"driverId": "norris", "winProbability": 1.0}
    }

    # Empty provenance raises MISSING_PROVENANCE
    empty_payload = {**base_payload, "provenance": {}}
    with pytest.raises(SnapshotValidationError) as exc1:
        validate_dry_run_snapshot(empty_payload)
    assert exc1.value.error_type == "MISSING_PROVENANCE"

    # Provenance without source raises INSUFFICIENT_PROVENANCE
    bad_payload = {**base_payload, "provenance": {"irrelevant": "source"}}
    with pytest.raises(SnapshotValidationError) as exc2:
        validate_dry_run_snapshot(bad_payload)
    assert exc2.value.error_type == "INSUFFICIENT_PROVENANCE"


# ==========================================
# Test 11: Invalid Timestamps
# ==========================================
@pytest.mark.parametrize("bad_ts, expected_err", [
    ("not-a-date", "INVALID_TIMESTAMP_FORMAT"),
    ("2099-01-01T00:00:00Z", "TIMESTAMP_OUT_OF_BOUNDS"),
    ("", "MISSING_TIMESTAMP")
])
def test_invalid_timestamps(bad_ts, expected_err):
    payload = {
        "status": "success",
        "season": 2025,
        "round": 1,
        "circuitId": "bahrain",
        "stage": "provisional",
        "qualifyingStatus": {"hasPenaltiesApplied": False},
        "modelVersion": "v1.0.0",
        "featureSchemaVersion": "1.0.0",
        "generatedAtUtc": bad_ts,
        "provenance": {"qualifyingSource": "test", "baselineVersion": "1.3.1"},
        "expectedRoster": ["norris"],
        "predictions": [{"driverId": "norris", "winProbability": 1.0}],
        "predictedWinner": {"driverId": "norris", "winProbability": 1.0}
    }
    with pytest.raises(SnapshotValidationError) as exc_info:
        validate_dry_run_snapshot(payload)
    assert exc_info.value.error_type == expected_err


# ==========================================
# Test 12: Deterministic Input Hashing & Sensitivity Audit
# ==========================================
def test_deterministic_input_hashing():
    rows1 = [
        {"driverId": "norris", "gridPosition": 1, "qualiPosition": 1},
        {"driverId": "verstappen", "gridPosition": 2, "qualiPosition": 2}
    ]
    rows2 = [
        {"driverId": "verstappen", "gridPosition": 2, "qualiPosition": 2},
        {"driverId": "norris", "gridPosition": 1, "qualiPosition": 1}
    ]
    # Order independence through internal sorting
    hash1 = compute_input_hash(rows1)
    hash2 = compute_input_hash(rows2)
    assert hash1 == hash2
    assert len(hash1) == 16

    # Delta changes hash
    rows3 = [
        {"driverId": "norris", "gridPosition": 2, "qualiPosition": 1},
        {"driverId": "verstappen", "gridPosition": 1, "qualiPosition": 2}
    ]
    hash3 = compute_input_hash(rows3)
    assert hash3 != hash1


def test_hash_identical_inputs_reproducibility():
    """Condition 1: Identical inputs produce identical hashes."""
    driver_features = [
        {"driver_id": "norris", "features": {"grid_position": 1.0, "rolling_points": 18.0, "teammate_qualifying_h2h_advantage": 1.0}},
        {"driver_id": "piastri", "features": {"grid_position": 2.0, "rolling_points": 12.0, "teammate_qualifying_h2h_advantage": 0.0}}
    ]
    h1 = compute_input_hash(
        race_id="2025_1", circuit_id="albert_park", stage="provisional",
        model_version="v1.0.0", feature_schema_version="1.0.0",
        baseline_version="1.3.1", feature_builder_version="3C.3B-live-1.0.0",
        inference_config={"temperature": 1.85}, driver_features=driver_features
    )
    h2 = compute_input_hash(
        race_id="2025_1", circuit_id="albert_park", stage="provisional",
        model_version="v1.0.0", feature_schema_version="1.0.0",
        baseline_version="1.3.1", feature_builder_version="3C.3B-live-1.0.0",
        inference_config={"temperature": 1.85}, driver_features=driver_features
    )
    assert h1 == h2
    assert len(h1) == 16


def test_hash_sensitivity_individual_features():
    """Condition 2: Changing any individual material feature changes the hash."""
    base_features = [
        {"driver_id": "norris", "features": {"grid_position": 1.0, "rolling_points": 18.0}},
        {"driver_id": "piastri", "features": {"grid_position": 2.0, "rolling_points": 12.0}}
    ]
    base_hash = compute_input_hash(
        race_id="2025_1", circuit_id="albert_park", stage="provisional",
        driver_features=base_features
    )
    # Alter rolling_points
    mod_features1 = [
        {"driver_id": "norris", "features": {"grid_position": 1.0, "rolling_points": 19.0}},
        {"driver_id": "piastri", "features": {"grid_position": 2.0, "rolling_points": 12.0}}
    ]
    h_mod1 = compute_input_hash(race_id="2025_1", circuit_id="albert_park", stage="provisional", driver_features=mod_features1)
    assert h_mod1 != base_hash

    # Alter grid_position
    mod_features2 = [
        {"driver_id": "norris", "features": {"grid_position": 2.0, "rolling_points": 18.0}},
        {"driver_id": "piastri", "features": {"grid_position": 1.0, "rolling_points": 12.0}}
    ]
    h_mod2 = compute_input_hash(race_id="2025_1", circuit_id="albert_park", stage="provisional", driver_features=mod_features2)
    assert h_mod2 != base_hash


def test_hash_sensitivity_driver_identity():
    """Condition 3: Changing driver identity changes the hash."""
    base_features = [
        {"driver_id": "norris", "features": {"grid_position": 1.0}},
        {"driver_id": "piastri", "features": {"grid_position": 2.0}}
    ]
    h_base = compute_input_hash(driver_features=base_features)

    # Change driver identity
    mod_features = [
        {"driver_id": "norris", "features": {"grid_position": 1.0}},
        {"driver_id": "russell", "features": {"grid_position": 2.0}}
    ]
    h_mod = compute_input_hash(driver_features=mod_features)
    assert h_mod != h_base


def test_hash_sensitivity_stage():
    """Condition 4: Changing stage changes the hash."""
    base_features = [
        {"driver_id": "norris", "features": {"grid_position": 1.0}}
    ]
    h_prov = compute_input_hash(stage="provisional", driver_features=base_features)
    h_off = compute_input_hash(stage="official_grid", driver_features=base_features)
    assert h_prov != h_off


def test_hash_sensitivity_versions():
    """Condition 5: Changing model or schema version changes the hash."""
    base_features = [{"driver_id": "norris", "features": {"grid_position": 1.0}}]
    h_base = compute_input_hash(model_version="v1.0.0", feature_schema_version="1.0.0", baseline_version="1.3.1", driver_features=base_features)

    h_mod_model = compute_input_hash(model_version="v2.0.0", feature_schema_version="1.0.0", baseline_version="1.3.1", driver_features=base_features)
    assert h_mod_model != h_base

    h_mod_feat = compute_input_hash(model_version="v1.0.0", feature_schema_version="2.0.0", baseline_version="1.3.1", driver_features=base_features)
    assert h_mod_feat != h_base

    h_mod_base = compute_input_hash(model_version="v1.0.0", feature_schema_version="1.0.0", baseline_version="1.4.0", driver_features=base_features)
    assert h_mod_base != h_base

    h_mod_builder = compute_input_hash(feature_builder_version="3C.4C-live", driver_features=base_features)
    assert h_mod_builder != h_base


def test_hash_driver_input_ordering_invariance():
    """Condition 6: Driver input ordering does not create accidental differences."""
    drivers_order_a = [
        {"driver_id": "norris", "features": {"grid_position": 1.0, "rolling_points": 18.0}},
        {"driver_id": "piastri", "features": {"grid_position": 2.0, "rolling_points": 12.0}},
        {"driver_id": "verstappen", "features": {"grid_position": 3.0, "rolling_points": 25.0}}
    ]
    drivers_order_b = [
        {"driver_id": "verstappen", "features": {"grid_position": 3.0, "rolling_points": 25.0}},
        {"driver_id": "norris", "features": {"grid_position": 1.0, "rolling_points": 18.0}},
        {"driver_id": "piastri", "features": {"grid_position": 2.0, "rolling_points": 12.0}}
    ]
    h_a = compute_input_hash(driver_features=drivers_order_a)
    h_b = compute_input_hash(driver_features=drivers_order_b)
    assert h_a == h_b


def test_hash_sensitivity_inference_config():
    """Changing inference configuration changes the hash."""
    base_features = [{"driver_id": "norris", "features": {"grid_position": 1.0}}]
    h_t1 = compute_input_hash(inference_config={"temperature": 1.85}, driver_features=base_features)
    h_t2 = compute_input_hash(inference_config={"temperature": 1.50}, driver_features=base_features)
    assert h_t1 != h_t2


def test_snapshot_validation_edge_cases():
    """Task 4: Edge cases for fail-closed snapshot validation."""
    valid_base = {
        "status": "success",
        "raceId": "2025_1_albert_park",
        "season": 2025,
        "round": 1,
        "circuitId": "albert_park",
        "circuitName": "Albert Park Grand Prix Circuit",
        "country": "Australia",
        "stage": "provisional",
        "predictionStage": "after_qualifying",
        "modelVersion": "v1.0.0",
        "featureSchemaVersion": "1.0.0",
        "inputHash": "78814a3e6ed7cff2",
        "generatedAtUtc": "2025-03-15T18:00:00Z",
        "qualifyingStatus": {"hasPenaltiesApplied": False},
        "provenance": {"qualifyingSource": "test", "baselineVersion": "1.3.1"},
        "expectedRoster": ["norris", "piastri"],
        "predictions": [
            {"driverId": "norris", "winProbability": 0.6},
            {"driverId": "piastri", "winProbability": 0.4}
        ],
        "predictedWinner": {"driverId": "norris", "winProbability": 0.6}
    }
    # Base passes
    validate_dry_run_snapshot(valid_base, require_all_fields=True)

    # 1. Missing required field
    missing_rf = {k: v for k, v in valid_base.items() if k != "circuitId"}
    with pytest.raises(SnapshotValidationError) as exc:
        validate_dry_run_snapshot(missing_rf, require_all_fields=True)
    assert exc.value.error_type == "MISSING_REQUIRED_FIELD"

    # 2. Probability bounds: negative
    neg_prob = {
        **valid_base,
        "predictions": [
            {"driverId": "norris", "winProbability": -0.1},
            {"driverId": "piastri", "winProbability": 1.1}
        ]
    }
    with pytest.raises(SnapshotValidationError) as exc:
        validate_dry_run_snapshot(neg_prob)
    assert exc.value.error_type == "PROBABILITY_OUT_OF_BOUNDS"

    # 3. Probability bounds: infinite
    inf_prob = {
        **valid_base,
        "predictions": [
            {"driverId": "norris", "winProbability": float("inf")},
            {"driverId": "piastri", "winProbability": 0.4}
        ]
    }
    with pytest.raises(SnapshotValidationError) as exc:
        validate_dry_run_snapshot(inf_prob)
    assert exc.value.error_type == "NON_FINITE_PROBABILITY"

    # 4. Incorrect winner
    bad_winner = {
        **valid_base,
        "predictedWinner": {"driverId": "piastri", "winProbability": 0.4}
    }
    with pytest.raises(SnapshotValidationError) as exc:
        validate_dry_run_snapshot(bad_winner)
    assert exc.value.error_type == "WINNER_MISMATCH"

    # 5. Contradictory stage and penalty
    bad_stage_penalty = {
        **valid_base,
        "stage": "provisional",
        "qualifyingStatus": {"hasPenaltiesApplied": True}
    }
    with pytest.raises(SnapshotValidationError) as exc:
        validate_dry_run_snapshot(bad_stage_penalty)
    assert exc.value.error_type == "CONTRADICTORY_STAGE_METADATA"

    # 6. Invalid inputHash (non-hex)
    bad_hash = {
        **valid_base,
        "inputHash": "not_a_valid_hex_hash_xyz"
    }
    with pytest.raises(SnapshotValidationError) as exc:
        validate_dry_run_snapshot(bad_hash)
    assert exc.value.error_type == "INVALID_INPUT_HASH"


# ==========================================
# Test 13: Existing Output-File Collision
# ==========================================
def test_existing_output_file_collision(tmp_path):
    # First run succeeds
    res1 = run_dry_run_inference("2025_1", stage="provisional", output_dir=str(tmp_path), dry_run=True)
    assert os.path.exists(res1["artifact_path"])

    # Second run without overwrite must raise collision error
    with pytest.raises(RunnerError) as exc_info:
        run_dry_run_inference("2025_1", stage="provisional", output_dir=str(tmp_path), dry_run=True)
    assert exc_info.value.error_type == "OUTPUT_FILE_COLLISION"


# ==========================================
# Test 14: Atomic Output Behavior
# ==========================================
def test_atomic_output_behavior(tmp_path):
    # If os.replace fails, temp file is cleaned up and dest does not exist
    dest_path = tmp_path / "test_artifact.json"
    temp_path = str(dest_path) + f".tmp.{os.getpid()}"

    with patch("os.replace", side_effect=OSError("Disk write simulated failure")):
        with pytest.raises(RunnerError) as exc_info:
            run_dry_run_inference("2025_1", stage="provisional", output_dir=str(tmp_path), dry_run=True)
        assert exc_info.value.error_type == "OUTPUT_WRITE_FAILED"

    # Temporary file must be removed and final file must not exist
    assert not os.path.exists(temp_path)
    assert not os.path.exists(str(dest_path))


# ==========================================
# Test 15: 2026 Regulation Warning
# ==========================================
def test_2026_regulation_warning(tmp_path):
    res = run_dry_run_inference("2026_1", stage="provisional", output_dir=str(tmp_path), dry_run=True)
    snap = res["snapshot"]

    assert snap["season"] == 2026
    reg_warn = snap["regulationEraWarning"]
    assert reg_warn["isUnknownRegulationEra"] is True
    assert reg_warn["warningCode"] == "UNVALIDATED_2026_REGULATIONS"
    assert "2026 active aerodynamics" in reg_warn["disclaimer"]

    # Reject attempt to claim HISTORICAL_VALIDATED for 2026
    false_claim = {
        **snap,
        "regulationEraWarning": {
            "isUnknownRegulationEra": False,
            "warningCode": "HISTORICAL_VALIDATED",
            "disclaimer": "False"
        }
    }
    with pytest.raises(SnapshotValidationError) as exc_info:
        validate_dry_run_snapshot(false_claim)
    assert exc_info.value.error_type == "INVALID_2026_REGULATION_WARNING"


# ==========================================
# Test 16: No Network Access or Supabase Writes
# ==========================================
def test_no_network_access_or_supabase_writes(tmp_path):
    # Intercept all socket connections: any network attempt will raise an immediate assertion error
    def guarded_socket(*args, **kwargs):
        raise AssertionError("Network access attempted during dry-run runner execution!")

    with patch.object(socket, "socket", side_effect=guarded_socket):
        res = run_dry_run_inference("2025_1", stage="provisional", output_dir=str(tmp_path), dry_run=True)
        assert res["status"] == "success"
        assert os.path.exists(res["artifact_path"])


# ==========================================
# Test 17: Model Artifact Remains Unchanged
# ==========================================
def test_model_artifact_remains_unchanged(tmp_path):
    bundle_path = os.path.join(MODELS_ROOT_DIR, MODEL_VERSION, "trained_models.joblib")
    hash_before = _compute_file_sha256(bundle_path)
    assert hash_before == EXPECTED_FROZEN_MODEL_HASH

    # Run inference
    run_dry_run_inference("2025_1", stage="provisional", output_dir=str(tmp_path), dry_run=True)

    hash_after = _compute_file_sha256(bundle_path)
    assert hash_after == EXPECTED_FROZEN_MODEL_HASH
    assert hash_before == hash_after


# ==========================================
# Test 18: Failed Validation Produces No Final Snapshot Artifact
# ==========================================
def test_failed_validation_produces_no_final_snapshot_artifact(tmp_path):
    with patch("scripts.predictor_pipeline.run_inference_snapshot.validate_dry_run_snapshot", side_effect=SnapshotValidationError("TEST_INJECTED_FAILURE", "Injected failure")):
        with pytest.raises(SnapshotValidationError):
            run_dry_run_inference("2025_1", stage="provisional", output_dir=str(tmp_path), dry_run=True)

    # Output directory must be completely empty
    files = list(tmp_path.glob("*.json"))
    assert len(files) == 0
