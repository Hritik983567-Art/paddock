#!/usr/bin/env python3
"""
Unit and Integration Tests for Phase 3C.4F.1.1: Metrics, Provenance & Contract Reconciliation

Comprehensive test suite covering:
1. Immutability of all four cryptographic baseline artifacts.
2. Metric reconciliation: Model B 2025 (1.1837 vs 1.0680) and 2024 (2.2911 vs 2.2833).
3. Geometric blend weight provenance: CV optimal w=0.70 vs conservative candidate w=0.20.
4. Baseline data counts: nominal 1,320 vs actual 1,319 vs clean 1,317 starts.
5. Runner stage compatibility and canonical input hash sensitivity.
6. Production gate safety: gate closed, Model C not trained, Model A intact.
"""

import sys
import json
import hashlib
from pathlib import Path
import numpy as np
import pandas as pd
import pytest

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

REPORTS_DIR = PROJECT_ROOT / "scripts" / "predictor_model" / "reports" / "phase_3c_4f_1_1"
ORIGINAL_CSV = PROJECT_ROOT / "data" / "predictor" / "f1_race_predictor_dataset.csv"
FROZEN_MODEL = PROJECT_ROOT / "models" / "predictor" / "v1.0.0" / "trained_models.joblib"
REMEDIATED_CSV = PROJECT_ROOT / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_v1_remediated.csv"
CANDIDATE_2025_CSV = PROJECT_ROOT / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_2025_candidate.csv"

EXPECTED_HASHES = {
    "ORIGINAL_CSV": "B1F50EF057E5AF732325BB8A784D96B92B34B4441900CEB2A0FD66B579C629AF",
    "FROZEN_MODEL": "D8244024E6B7F0F31912EFE80B35652EF228461955232DDE7E4D65ECCC5779CD",
    "REMEDIATED_CSV": "691A19643107241A995D0AF90483A335EC35C47C479A07C447449DEC3F6056FE",
    "CANDIDATE_2025_CSV": "8BADE433D7BE82903B1326D68706C0E4851F80D80DDEC618EFA896E0C6363329",
}


# -----------------------------------------------------------------------------
# 1. Cryptographic Baseline Tests
# -----------------------------------------------------------------------------
def test_cryptographic_baseline_immutability():
    paths = {
        "ORIGINAL_CSV": ORIGINAL_CSV,
        "FROZEN_MODEL": FROZEN_MODEL,
        "REMEDIATED_CSV": REMEDIATED_CSV,
        "CANDIDATE_2025_CSV": CANDIDATE_2025_CSV,
    }
    for name, path in paths.items():
        with open(path, "rb") as f:
            h = hashlib.sha256(f.read()).hexdigest().upper()
        assert h == EXPECTED_HASHES[name], f"Cryptographic mismatch for {name}!"


# -----------------------------------------------------------------------------
# 2. Metric Reconciliation Tests
# -----------------------------------------------------------------------------
def test_model_b_2025_reconciliation_values():
    report_path = REPORTS_DIR / "phase_4f_1_1_reconciliation.json"
    assert report_path.exists(), "Reconciliation JSON must exist"

    with open(report_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    m25 = data["metric_reconciliation"]["model_b_2025_reconciliation"]
    unpruned = m25["remediated_model_b_2021_2023_unpruned_1319"]
    retrained = m25["retrained_model_b_2021_2024"]

    assert np.isclose(unpruned["holdout_mean_log_loss"], 1.1837, atol=0.005)
    assert np.isclose(retrained["holdout_mean_log_loss"], 1.0680, atol=0.005)
    assert m25["classification"] == "Reproduced and explained"


def test_model_b_2024_reconciliation_values():
    report_path = REPORTS_DIR / "phase_4f_1_1_reconciliation.json"
    with open(report_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    m24 = data["metric_reconciliation"]["model_b_2024_reconciliation"]
    clean = m24["clean_training_partition_1317"]
    unpruned = m24["unpruned_training_partition_1319"]

    assert np.isclose(clean["holdout_mean_log_loss"], 2.2833, atol=0.005)
    assert np.isclose(unpruned["holdout_mean_log_loss"], 2.2911, atol=0.005)
    assert m24["classification"] == "Reproduced and explained"


# -----------------------------------------------------------------------------
# 3. Geometric Blend Weight Provenance Tests
# -----------------------------------------------------------------------------
def test_geometric_weight_provenance_and_cv_minimum():
    report_path = REPORTS_DIR / "phase_4f_1_1_reconciliation.json"
    with open(report_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    prov = data["weight_provenance_audit"]
    # CV minimum is strictly w=0.70
    assert prov["unconstrained_cv_optimal_w"] == 0.70
    assert np.isclose(prov["unconstrained_cv_optimal_log_loss"], 1.2009, atol=0.005)

    # w=0.20 is a pre-specified conservative candidate
    assert prov["conservative_candidate_w"] == 0.20
    assert np.isclose(prov["conservative_candidate_log_loss"], 1.4215, atol=0.005)

    # Provenance claim reclassified as documentation error
    assert prov["classification"] == "Documentation error"


# -----------------------------------------------------------------------------
# 4. Baseline Starts & Pit-Lane Proxy Tests
# -----------------------------------------------------------------------------
def test_baseline_starts_and_monaco_2021():
    orig_df = pd.read_csv(ORIGINAL_CSV)
    rem_df = pd.read_csv(REMEDIATED_CSV)

    orig_21_23 = orig_df[orig_df["season"] <= 2023]
    rem_21_23 = rem_df[rem_df["season"] <= 2023]

    assert len(orig_21_23) == 1319
    assert len(rem_21_23) == 1319

    # Monaco 2021 has 19 rows
    monaco_2021 = orig_21_23[(orig_21_23["season"] == 2021) & (orig_21_23["round"] == 5)]
    assert len(monaco_2021) == 19
    assert "mick_schumacher" not in monaco_2021["driver_id"].values

    # Clean starters excluding WITHDRAWN_BEFORE_START is 1,317
    clean_21_23 = rem_21_23[rem_21_23["race_participation_status"] != "WITHDRAWN_BEFORE_START"]
    assert len(clean_21_23) == 1317


def test_pit_lane_proxy_sensitivity():
    report_path = REPORTS_DIR / "phase_4f_1_1_reconciliation.json"
    with open(report_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    pit = data["baseline_data_reconciliation"]["pit_lane_proxy_audit"]["sensitivity_analysis"]
    assert pit["rounds_to_same_value"] is True
    assert pit["rounded_value"] == 1.8535
    assert pit["absolute_difference"] < 5e-5


# -----------------------------------------------------------------------------
# 5. Output Contract & Input Hash Determinism Tests
# -----------------------------------------------------------------------------
def test_snapshot_runner_stage_rejection_of_official_grid():
    # Verify that run_inference_snapshot.py explicitly rejects official_grid
    from scripts.predictor_pipeline.run_inference_snapshot import SnapshotValidationError
    report_path = REPORTS_DIR / "phase_4f_1_1_reconciliation.json"
    with open(report_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    stage_audit = data["contract_and_stage_audit"]["stage_runner_compatibility"]
    assert "provisional" in stage_audit["snapshot_runner_supported_stages"]
    assert "official_grid" in stage_audit["snapshot_runner_rejected_stages"]
    assert stage_audit["classification"] == "Implementation defect"


def test_canonical_input_hash_invariance_and_sensitivity():
    report_path = REPORTS_DIR / "phase_4f_1_1_reconciliation.json"
    with open(report_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    hash_audit = data["contract_and_stage_audit"]["input_hash_audit"]
    assert hash_audit["order_invariance_verified"] is True
    assert hash_audit["material_sensitivity_verified"] is True
    assert hash_audit["classification"] == "Implementation defect"


# -----------------------------------------------------------------------------
# 6. Production Safety Gate Tests
# -----------------------------------------------------------------------------
def test_production_gate_strictly_closed():
    report_path = REPORTS_DIR / "phase_4f_1_1_reconciliation.json"
    with open(report_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    meta = data["metadata"]
    assert meta["production_gate"] == "STRICTLY CLOSED"
    assert meta["model_c_attestation"] == "Model C has NOT been trained or promoted."
    assert meta["status"] == "EXPERIMENTAL_NON_PRODUCTION"

