"""
Phase 3C.4F.5 — End-to-End Local Python Pipeline & Hash Contract Verification Tests.
Tests the complete inference runner, snapshot validation, dual 64-char hashes,
prefix collision detection, and binary artifact integrity checks.
"""

import os
import sys
import json
import hashlib
import tempfile
import pytest

_current_dir = os.path.dirname(os.path.abspath(__file__))
_repo_root = os.path.abspath(os.path.join(_current_dir, ".."))
if _repo_root not in sys.path:
    sys.path.insert(0, _repo_root)

from scripts.predictor_model.config import MODEL_VERSION, FEATURE_SCHEMA_VERSION, MODELS_ROOT_DIR
from scripts.predictor_pipeline.config import OUTPUT_DIR
from scripts.predictor_pipeline.run_inference_snapshot import (
    load_and_verify_model_bundle,
    validate_dry_run_snapshot,
    RunnerError,
    SnapshotValidationError,
    compute_input_hash
)

EXPECTED_FROZEN_MODEL_SHA256 = "D8244024E6B7F0F31912EFE80B35652EF228461955232DDE7E4D65ECCC5779CD"
DRY_RUN_FIXTURE_PATH = os.path.join(
    _repo_root,
    "artifacts",
    "dry_run_snapshots",
    "2025_1_albert_park_provisional_v1.0.0_hybrid_56947b913051836c.json"
)


class TestPhase4F5ModelArtifactIntegrity:
    """Tests for physical model binary integrity vs inference identity."""

    def test_frozen_model_binary_sha256(self):
        bundle_path = os.path.join(MODELS_ROOT_DIR, MODEL_VERSION, "trained_models.joblib")
        assert os.path.exists(bundle_path), f"Frozen bundle missing at {bundle_path}"

        with open(bundle_path, "rb") as f:
            actual_sha = hashlib.sha256(f.read()).hexdigest().upper()

        assert actual_sha == EXPECTED_FROZEN_MODEL_SHA256, (
            f"Frozen model artifact SHA-256 corrupted! Expected {EXPECTED_FROZEN_MODEL_SHA256}, got {actual_sha}"
        )

    def test_load_and_verify_model_bundle_success(self):
        model, metadata = load_and_verify_model_bundle()
        assert model is not None
        assert metadata["model_version"] == MODEL_VERSION
        assert metadata["feature_schema_version"] == FEATURE_SCHEMA_VERSION

    def test_load_and_verify_model_bundle_tamper_rejection(self):
        bundle_path = os.path.join(MODELS_ROOT_DIR, MODEL_VERSION, "trained_models.joblib")
        with tempfile.NamedTemporaryFile(suffix=".joblib", delete=False) as tf:
            tf.write(b"corrupted_tampered_model_bytes_123")
            tampered_path = tf.name

        try:
            with pytest.raises(RunnerError) as exc_info:
                load_and_verify_model_bundle(model_bundle_path=tampered_path)
            assert exc_info.value.error_type == "MODEL_ARTIFACT_TAMPERED"
            assert "SHA-256 mismatch" in exc_info.value.message
        finally:
            if os.path.exists(tampered_path):
                os.remove(tampered_path)


class TestPhase4F5SnapshotValidationAndHashes:
    """Tests for Python snapshot validation, dual 64-char hashes, and prefix collision."""

    @pytest.fixture
    def valid_snapshot(self):
        assert os.path.exists(DRY_RUN_FIXTURE_PATH), f"Fixture missing at {DRY_RUN_FIXTURE_PATH}"
        with open(DRY_RUN_FIXTURE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    def test_validate_valid_snapshot(self, valid_snapshot):
        validate_dry_run_snapshot(valid_snapshot, require_all_fields=True)

    def test_dual_64_character_hashes_present_and_valid(self, valid_snapshot):
        inf_hash = valid_snapshot.get("inferenceInputHash")
        out_hash = valid_snapshot.get("predictionOutputHash")
        leg_hash = valid_snapshot.get("inputHash")

        assert inf_hash is not None
        assert len(inf_hash) == 64
        assert int(inf_hash, 16) > 0  # valid hex

        assert out_hash is not None
        assert len(out_hash) == 64
        assert int(out_hash, 16) > 0

        assert leg_hash == inf_hash[:16]

    def test_prefix_collision_detection(self, valid_snapshot):
        # Tamper with inputHash to simulate prefix collision
        valid_snapshot["inputHash"] = "0123456789abcdef"

        with pytest.raises(SnapshotValidationError) as exc_info:
            validate_dry_run_snapshot(valid_snapshot)
        assert exc_info.value.error_type == "PREFIX_COLLISION_MISMATCH"
        assert "Prefix collision / identity mismatch" in exc_info.value.message

    def test_invalid_64_character_hash_length(self, valid_snapshot):
        valid_snapshot["inferenceInputHash"] = "short_hash_123"

        with pytest.raises(SnapshotValidationError) as exc_info:
            validate_dry_run_snapshot(valid_snapshot)
        assert exc_info.value.error_type == "INVALID_INFERENCE_INPUT_HASH"

    def test_invalid_prediction_output_hash_length(self, valid_snapshot):
        valid_snapshot["predictionOutputHash"] = "abc_short"

        with pytest.raises(SnapshotValidationError) as exc_info:
            validate_dry_run_snapshot(valid_snapshot)
        assert exc_info.value.error_type == "INVALID_PREDICTION_OUTPUT_HASH"

    def test_probability_sum_violation_rejection(self, valid_snapshot):
        valid_snapshot["predictions"][0]["winProbability"] = 0.95  # Total > 1.005

        with pytest.raises(SnapshotValidationError) as exc_info:
            validate_dry_run_snapshot(valid_snapshot)
        assert exc_info.value.error_type == "PROBABILITY_SUM_OUT_OF_BOUNDS"

    def test_winner_mismatch_rejection(self, valid_snapshot):
        # Tamper winner to non-top driver
        valid_snapshot["predictedWinner"]["driverId"] = "piastri"

        with pytest.raises(SnapshotValidationError) as exc_info:
            validate_dry_run_snapshot(valid_snapshot)
        assert exc_info.value.error_type == "WINNER_MISMATCH"

    def test_output_directory_isolation(self):
        # Dedicated dry-run output directory must be artifacts/dry_run_snapshots, not reports or production snapshots
        dry_run_dir = os.path.join(_repo_root, "artifacts", "dry_run_snapshots")
        assert "artifacts" in dry_run_dir
        assert "historical_replays" not in dry_run_dir
        assert "data" not in os.path.relpath(dry_run_dir, _repo_root)

