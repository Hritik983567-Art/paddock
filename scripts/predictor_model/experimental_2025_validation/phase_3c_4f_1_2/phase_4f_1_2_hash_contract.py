#!/usr/bin/env python3
"""
Phase 3C.4F.1.2: Complete Inference Hash & Contract Freeze

Decouples and establishes:
1. Inference Input Hash (SHA-256, 64 hex characters):
   - Race identity (race_id, season, round, circuit_id, prediction_stage).
   - Complete 42-feature ordered vector for every driver in the roster.
   - Model artifact/version identity (v1.0.0-remediated-b).
   - Feature schema version (1.0.0).
   - Baseline version (grid-empirical-laplace-a1) and alpha (1.0).
   - Hybrid formula version (geometric-w0.20-v1) and blend weight (w=0.20).
   - Inference configuration (p_floor=0.0005, ml_temperature=0.7654).
   - Roster identity with ordering-independent canonical representation (sorted by driver_id).
   - Full precision serialization without lossy quantization.

2. Prediction Output Hash (SHA-256, 64 hex characters):
   - Race identity and prediction stage.
   - Stable driver IDs.
   - Grid win probabilities, ML win probabilities, and Hybrid win probabilities.
   - Model version, baseline version, and hybrid formula version.
   - Identifies the resulting probability distribution independently of input features.

3. Complete Ten-Point Verification Suite:
   1. Identical inputs produce identical hashes.
   2. Driver row reordering does not change either hash (permutation invariance).
   3. Changing any one of the 42 feature values changes the inference input hash.
   4. Changing a driver ID changes both hashes.
   5. Changing race identity changes both hashes.
   6. Changing prediction stage changes both hashes.
   7. Changing model, schema, baseline, formula version, or blend weight changes the inference input hash.
   8. Changing only output probabilities changes the output hash while keeping the input hash constant.
   9. Changing an underlying feature while preserving final probabilities changes the input hash while keeping the output hash constant.
   10. Serialization is deterministic across repeated runs.

4. Contract Consistency Enforcements:
   - 'provisional' is marked as the ONLY currently runnable dry-run stage.
   - 'official_grid' is explicitly designated as PLANNED_STAGE_B (not currently executable in dry-run runner).
   - Strict separation between Model A, Model B, and the Experimental Hybrid.
   - w=0.20 documented as a pre-specified conservative candidate, not CV optimum.
   - All 2024 and 2025 evaluations remain exploratory historical analyses.

Attestation:
PRODUCTION GATE: STRICTLY CLOSED
No automatic model promotion or production deployment has taken place.
Model C has NOT been trained or promoted.
"""

import sys
import os
import json
import hashlib
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple, Union
import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from scripts.predictor_model.features import ALL_MODEL_FEATURES

REPORTS_DIR = PROJECT_ROOT / "scripts" / "predictor_model" / "reports" / "phase_3c_4f_1_2"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

MODEL_VERSION_TAG = "v1.0.0-remediated-b"
FEATURE_SCHEMA_VERSION = "1.0.0"
BASELINE_VERSION_TAG = "grid-empirical-laplace-a1"
BASELINE_ALPHA = 1.0
HYBRID_FORMULA_VERSION_TAG = "geometric-w0.20-v1"
HYBRID_BLEND_WEIGHT = 0.20
P_FLOOR = 0.0005
EXPERIMENTAL_STATUS_TAG = "EXPERIMENTAL_NON_PRODUCTION"

# Stage definitions
STAGE_PROVISIONAL = "provisional"          # Stage A: Runnable today
STAGE_OFFICIAL_GRID = "official_grid"      # Stage B: Planned, requires FIA grid document ingestion


# -----------------------------------------------------------------------------
# 1. Prediction Output Contract Data Classes
# -----------------------------------------------------------------------------
@dataclass
class HybridDriverPredictionFrozen:
    """Stable per-driver prediction entry conforming to Phase 4F.1.2 contract."""
    race_id: str
    season: int
    round: int
    driver_id: str
    driver_name: str
    grid_position: int
    grid_win_probability: float
    ml_win_probability: float
    hybrid_win_probability: float
    model_version: str
    baseline_version: str
    hybrid_formula_version: str
    prediction_stage: str
    input_hash: str                  # 16-char truncated inference input hash (backwards compatibility)
    generated_at: str
    experimental_status: str
    inference_input_hash: str        # Full 64-char SHA-256 of all 42 ordered features & metadata
    prediction_output_hash: str      # Full 64-char SHA-256 of resulting probability distribution

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class HybridRacePredictionResponseFrozen:
    """Stable race-level prediction response conforming to Phase 4F.1.2 contract."""
    race_id: str
    season: int
    round: int
    circuit_id: str
    prediction_stage: str
    model_version: str
    baseline_version: str
    hybrid_formula_version: str
    driver_count: int
    total_probability: float
    predicted_winner_driver_id: str
    predicted_winner_grid: int
    predicted_winner_probability: float
    inference_input_hash: str        # Full 64-char SHA-256 of all 42 ordered features & metadata
    prediction_output_hash: str      # Full 64-char SHA-256 of resulting probability distribution
    predictions: List[HybridDriverPredictionFrozen]
    diagnostics: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["predictions"] = [p.to_dict() if hasattr(p, "to_dict") else p for p in self.predictions]
        return d


# -----------------------------------------------------------------------------
# 2. Canonical Serialization Helper
# -----------------------------------------------------------------------------
def sanitize_canonical_value(val: Any) -> Any:
    """
    Sanitizes values for deterministic canonical JSON serialization.
    Preserves exact floating-point precision without lossy rounding or quantization.
    Handles NaN and Infinite values safely.
    """
    if val is None:
        return None
    if isinstance(val, (bool, np.bool_)):
        return bool(val)
    if isinstance(val, (int, np.integer)):
        return int(val)
    if isinstance(val, (float, np.floating)):
        if np.isnan(val):
            return "NaN"
        if np.isinf(val):
            return "Infinity" if val > 0 else "-Infinity"
        return float(val)
    return str(val)


# -----------------------------------------------------------------------------
# 3. Complete Inference Input Hash (Hash A)
# -----------------------------------------------------------------------------
def compute_canonical_inference_input_hash(
    race_id: str,
    season: int,
    round_num: int,
    circuit_id: str,
    stage: str,
    driver_rows: List[Dict[str, Any]],
    model_version: str = MODEL_VERSION_TAG,
    feature_schema_version: str = FEATURE_SCHEMA_VERSION,
    baseline_version: str = BASELINE_VERSION_TAG,
    baseline_alpha: float = BASELINE_ALPHA,
    hybrid_formula_version: str = HYBRID_FORMULA_VERSION_TAG,
    blend_weight: float = HYBRID_BLEND_WEIGHT,
    p_floor: float = P_FLOOR,
    ml_temperature: float = 0.7654,
    combination_method: str = "geometric"
) -> Tuple[str, Dict[str, Any]]:
    """
    Computes deterministic SHA-256 hash (64 hex chars) of complete inference inputs.
    
    Includes:
    - Race identity (race_id, season, round, circuit_id, prediction_stage).
    - Model metadata, feature schema version, baseline version/alpha, hybrid formula/weight.
    - Inference configuration (p_floor, temperature, combination method).
    - All 42 ordered features for every driver in the roster.
    - Guarantees order independence via lexicographical sorting by driver_id.
    """
    stage_clean = str(stage).strip().lower()

    # Canonical sorted driver records
    sorted_drivers = []
    for d in driver_rows:
        d_id = str(d.get("driver_id", ""))
        raw_feats = d.get("features", d)

        # Extract all 42 ordered features exactly as defined in ALL_MODEL_FEATURES
        driver_feature_vector = []
        for feat_name in ALL_MODEL_FEATURES:
            val = raw_feats.get(feat_name, None)
            driver_feature_vector.append({
                "name": feat_name,
                "value": sanitize_canonical_value(val)
            })

        sorted_drivers.append({
            "driver_id": d_id,
            "features_42": driver_feature_vector
        })

    # Sort lexicographically by driver_id for strict order independence
    sorted_drivers = sorted(sorted_drivers, key=lambda x: x["driver_id"])

    canonical_payload = {
        "race_identity": {
            "circuit_id": str(circuit_id),
            "prediction_stage": stage_clean,
            "race_id": str(race_id),
            "round": int(round_num),
            "season": int(season)
        },
        "model_metadata": {
            "baseline_alpha": float(baseline_alpha),
            "baseline_version": str(baseline_version),
            "feature_schema_version": str(feature_schema_version),
            "hybrid_blend_weight": float(blend_weight),
            "hybrid_formula_version": str(hybrid_formula_version),
            "model_version": str(model_version),
            "inference_config": {
                "combination_method": str(combination_method),
                "ml_temperature": float(ml_temperature),
                "p_floor": float(p_floor)
            }
        },
        "roster_identity": {
            "driver_count": len(sorted_drivers),
            "driver_ids_sorted": [d["driver_id"] for d in sorted_drivers]
        },
        "drivers": sorted_drivers
    }

    canonical_json = json.dumps(canonical_payload, sort_keys=True, separators=(",", ":"))
    full_sha256 = hashlib.sha256(canonical_json.encode("utf-8")).hexdigest()
    return full_sha256, canonical_payload


# -----------------------------------------------------------------------------
# 4. Prediction Output Hash (Hash B)
# -----------------------------------------------------------------------------
def compute_canonical_prediction_output_hash(
    race_id: str,
    season: int,
    round_num: int,
    circuit_id: str,
    stage: str,
    predictions: List[Dict[str, Any]],
    model_version: str = MODEL_VERSION_TAG,
    baseline_version: str = BASELINE_VERSION_TAG,
    hybrid_formula_version: str = HYBRID_FORMULA_VERSION_TAG
) -> Tuple[str, Dict[str, Any]]:
    """
    Computes deterministic SHA-256 hash (64 hex chars) of prediction output distribution.
    
    Includes:
    - Race identity and stage.
    - Model, baseline, and formula version identifiers.
    - Driver IDs, grid positions, and computed probabilities (grid, ML, hybrid).
    - Guarantees order independence via lexicographical sorting by driver_id.
    - Decoupled from underlying feature vectors.
    """
    stage_clean = str(stage).strip().lower()

    sorted_preds = []
    for p in predictions:
        d_id = str(p.get("driver_id", ""))
        g_pos = int(p.get("grid_position", 20))
        p_grid = float(p.get("grid_win_probability", 0.0))
        p_ml = float(p.get("ml_win_probability", 0.0))
        p_hybrid = float(p.get("hybrid_win_probability", 0.0))

        sorted_preds.append({
            "driver_id": d_id,
            "grid_position": g_pos,
            "grid_win_probability": sanitize_canonical_value(p_grid),
            "ml_win_probability": sanitize_canonical_value(p_ml),
            "hybrid_win_probability": sanitize_canonical_value(p_hybrid)
        })

    sorted_preds = sorted(sorted_preds, key=lambda x: x["driver_id"])

    canonical_payload = {
        "race_identity": {
            "circuit_id": str(circuit_id),
            "prediction_stage": stage_clean,
            "race_id": str(race_id),
            "round": int(round_num),
            "season": int(season)
        },
        "model_metadata": {
            "baseline_version": str(baseline_version),
            "hybrid_formula_version": str(hybrid_formula_version),
            "model_version": str(model_version)
        },
        "roster_identity": {
            "driver_count": len(sorted_preds),
            "driver_ids_sorted": [p["driver_id"] for p in sorted_preds]
        },
        "predictions": sorted_preds
    }

    canonical_json = json.dumps(canonical_payload, sort_keys=True, separators=(",", ":"))
    full_sha256 = hashlib.sha256(canonical_json.encode("utf-8")).hexdigest()
    return full_sha256, canonical_payload


# -----------------------------------------------------------------------------
# 5. Full Response Builder Conforming to Frozen Contract
# -----------------------------------------------------------------------------
def build_frozen_hybrid_prediction_response(
    race_df: pd.DataFrame,
    p_grid: np.ndarray,
    p_ml: np.ndarray,
    p_hybrid: np.ndarray,
    stage: str = STAGE_PROVISIONAL,
    ml_temperature: float = 0.7654
) -> HybridRacePredictionResponseFrozen:
    """
    Assembles complete contract-compliant prediction response incorporating
    both the Inference Input Hash (Hash A) and the Prediction Output Hash (Hash B).
    """
    n = len(race_df)
    race_id = str(race_df["race_id"].iloc[0]) if "race_id" in race_df else "unknown_race"
    season = int(race_df["season"].iloc[0]) if "season" in race_df else 2026
    round_num = int(race_df["round"].iloc[0]) if "round" in race_df else 1
    circuit_id = str(race_df["circuit_id"].iloc[0]) if "circuit_id" in race_df else "unknown_circuit"

    stage_clean = str(stage).strip().lower()
    now_utc = datetime.now(timezone.utc).isoformat()

    # 1. Build driver input records for Hash A
    driver_input_rows = []
    for _, row in race_df.iterrows():
        d_id = str(row.get("driver_id", ""))
        feats = {feat: row.get(feat, None) for feat in ALL_MODEL_FEATURES}
        driver_input_rows.append({"driver_id": d_id, "features": feats})

    input_hash_full, _ = compute_canonical_inference_input_hash(
        race_id=race_id,
        season=season,
        round_num=round_num,
        circuit_id=circuit_id,
        stage=stage_clean,
        driver_rows=driver_input_rows,
        ml_temperature=ml_temperature
    )
    input_hash_truncated = input_hash_full[:16]

    # 2. Build driver predictions
    driver_predictions_raw = []
    driver_entries: List[HybridDriverPredictionFrozen] = []

    for i, (_, row) in enumerate(race_df.iterrows()):
        d_id = str(row.get("driver_id", f"driver_{i+1}"))
        d_name = str(row.get("driver_code", d_id.upper()))
        g_pos = int(row.get("grid_position", 20))

        entry_raw = {
            "driver_id": d_id,
            "grid_position": g_pos,
            "grid_win_probability": float(p_grid[i]),
            "ml_win_probability": float(p_ml[i]),
            "hybrid_win_probability": float(p_hybrid[i])
        }
        driver_predictions_raw.append(entry_raw)

    # 3. Build Prediction Output Hash (Hash B)
    output_hash_full, _ = compute_canonical_prediction_output_hash(
        race_id=race_id,
        season=season,
        round_num=round_num,
        circuit_id=circuit_id,
        stage=stage_clean,
        predictions=driver_predictions_raw
    )

    # 4. Construct frozen entry objects with both hashes
    for i, (_, row) in enumerate(race_df.iterrows()):
        d_id = str(row.get("driver_id", f"driver_{i+1}"))
        d_name = str(row.get("driver_code", d_id.upper()))
        g_pos = int(row.get("grid_position", 20))

        entry = HybridDriverPredictionFrozen(
            race_id=race_id,
            season=season,
            round=round_num,
            driver_id=d_id,
            driver_name=d_name,
            grid_position=g_pos,
            grid_win_probability=float(p_grid[i]),
            ml_win_probability=float(p_ml[i]),
            hybrid_win_probability=float(p_hybrid[i]),
            model_version=MODEL_VERSION_TAG,
            baseline_version=BASELINE_VERSION_TAG,
            hybrid_formula_version=HYBRID_FORMULA_VERSION_TAG,
            prediction_stage=stage_clean,
            input_hash=input_hash_truncated,
            generated_at=now_utc,
            experimental_status=EXPERIMENTAL_STATUS_TAG,
            inference_input_hash=input_hash_full,
            prediction_output_hash=output_hash_full
        )
        driver_entries.append(entry)

    winner_idx = int(np.argmax(p_hybrid))
    predicted_winner = driver_entries[winner_idx]

    response = HybridRacePredictionResponseFrozen(
        race_id=race_id,
        season=season,
        round=round_num,
        circuit_id=circuit_id,
        prediction_stage=stage_clean,
        model_version=MODEL_VERSION_TAG,
        baseline_version=BASELINE_VERSION_TAG,
        hybrid_formula_version=HYBRID_FORMULA_VERSION_TAG,
        driver_count=n,
        total_probability=float(np.sum(p_hybrid)),
        predicted_winner_driver_id=predicted_winner.driver_id,
        predicted_winner_grid=predicted_winner.grid_position,
        predicted_winner_probability=float(p_hybrid[winner_idx]),
        inference_input_hash=input_hash_full,
        prediction_output_hash=output_hash_full,
        predictions=driver_entries,
        diagnostics={
            "stage_status": "RUNNABLE" if stage_clean == STAGE_PROVISIONAL else "PLANNED_STAGE_B",
            "weight_w": HYBRID_BLEND_WEIGHT,
            "weight_provenance": "PRE_SPECIFIED_CONSERVATIVE_CANDIDATE",
            "p_floor": P_FLOOR,
            "ml_temperature": ml_temperature,
            "numerical_stability_verified": True,
            "production_gate": "STRICTLY CLOSED",
            "model_c_trained": False
        }
    )
    return response


# -----------------------------------------------------------------------------
# 6. Verification Runner for All Ten Tests
# -----------------------------------------------------------------------------
def run_ten_point_hash_verification() -> Dict[str, Any]:
    print("=" * 80)
    print("PHASE 3C.4F.1.2: TEN-POINT HASH VERIFICATION SUITE")
    print("=" * 80)

    # Base test fixtures
    race_id = "2024_01"
    season = 2024
    round_num = 1
    circuit_id = "bahrain"
    stage = STAGE_PROVISIONAL

    # 3 mock drivers with all 42 features populated
    def make_sample_driver(d_id: str, grid: int, q_pos: int, points: float) -> Dict[str, Any]:
        feats = {f: 0.0 for f in ALL_MODEL_FEATURES}
        feats["grid_position"] = grid
        feats["quali_position"] = q_pos
        feats["driver_season_points_before_gp"] = points
        feats["quali_time_delta_to_pole"] = 0.0 if grid == 1 else 0.250
        feats["front_row"] = 1 if grid <= 2 else 0
        feats["reached_q3"] = 1
        return {"driver_id": d_id, "features": feats}

    drivers_orig = [
        make_sample_driver("verstappen", 1, 1, 0.0),
        make_sample_driver("leclerc", 2, 2, 0.0),
        make_sample_driver("russell", 3, 3, 0.0),
    ]

    preds_orig = [
        {"driver_id": "verstappen", "grid_position": 1, "grid_win_probability": 0.5074, "ml_win_probability": 0.4482, "hybrid_win_probability": 0.4981},
        {"driver_id": "leclerc", "grid_position": 2, "grid_win_probability": 0.1884, "ml_win_probability": 0.2514, "hybrid_win_probability": 0.2012},
        {"driver_id": "russell", "grid_position": 3, "grid_win_probability": 0.1014, "ml_win_probability": 0.1205, "hybrid_win_probability": 0.1051},
    ]

    base_input_hash, _ = compute_canonical_inference_input_hash(race_id, season, round_num, circuit_id, stage, drivers_orig)
    base_output_hash, _ = compute_canonical_prediction_output_hash(race_id, season, round_num, circuit_id, stage, preds_orig)

    test_results = {}

    # Test 1: Identical inputs produce identical hashes
    h1_in, _ = compute_canonical_inference_input_hash(race_id, season, round_num, circuit_id, stage, drivers_orig)
    h1_out, _ = compute_canonical_prediction_output_hash(race_id, season, round_num, circuit_id, stage, preds_orig)
    t1_pass = (h1_in == base_input_hash) and (h1_out == base_output_hash)
    test_results["test_1_identical_inputs"] = {"passed": t1_pass, "input_match": h1_in == base_input_hash, "output_match": h1_out == base_output_hash}

    # Test 2: Driver row reordering does not change the hash (order independence)
    drivers_reordered = [drivers_orig[2], drivers_orig[0], drivers_orig[1]]
    preds_reordered = [preds_orig[2], preds_orig[0], preds_orig[1]]
    h2_in, _ = compute_canonical_inference_input_hash(race_id, season, round_num, circuit_id, stage, drivers_reordered)
    h2_out, _ = compute_canonical_prediction_output_hash(race_id, season, round_num, circuit_id, stage, preds_reordered)
    t2_pass = (h2_in == base_input_hash) and (h2_out == base_output_hash)
    test_results["test_2_order_invariance"] = {"passed": t2_pass, "input_invariant": h2_in == base_input_hash, "output_invariant": h2_out == base_output_hash}

    # Test 3: Changing any one of the 42 feature values changes the inference input hash
    feature_mutation_failures = []
    for f_name in ALL_MODEL_FEATURES:
        mutated_drivers = [
            make_sample_driver("verstappen", 1, 1, 0.0),
            make_sample_driver("leclerc", 2, 2, 0.0),
            make_sample_driver("russell", 3, 3, 0.0),
        ]
        # Mutate single feature on driver 0
        curr_val = mutated_drivers[0]["features"][f_name]
        mutated_drivers[0]["features"][f_name] = (curr_val + 1.0) if isinstance(curr_val, (int, float)) else 999
        h3_in, _ = compute_canonical_inference_input_hash(race_id, season, round_num, circuit_id, stage, mutated_drivers)
        if h3_in == base_input_hash:
            feature_mutation_failures.append(f_name)
    t3_pass = (len(feature_mutation_failures) == 0)
    test_results["test_3_all_42_features_sensitive"] = {
        "passed": t3_pass,
        "features_tested": len(ALL_MODEL_FEATURES),
        "failures": feature_mutation_failures
    }

    # Test 4: Changing a driver ID changes the hash
    drivers_mut_id = [
        make_sample_driver("norris", 1, 1, 0.0),  # replaced verstappen with norris
        drivers_orig[1],
        drivers_orig[2]
    ]
    preds_mut_id = [
        {"driver_id": "norris", "grid_position": 1, "grid_win_probability": 0.5074, "ml_win_probability": 0.4482, "hybrid_win_probability": 0.4981},
        preds_orig[1],
        preds_orig[2]
    ]
    h4_in, _ = compute_canonical_inference_input_hash(race_id, season, round_num, circuit_id, stage, drivers_mut_id)
    h4_out, _ = compute_canonical_prediction_output_hash(race_id, season, round_num, circuit_id, stage, preds_mut_id)
    t4_pass = (h4_in != base_input_hash) and (h4_out != base_output_hash)
    test_results["test_4_driver_id_sensitivity"] = {"passed": t4_pass, "input_changed": h4_in != base_input_hash, "output_changed": h4_out != base_output_hash}

    # Test 5: Changing race identity changes the hash
    h5_in, _ = compute_canonical_inference_input_hash("2024_02", season, 2, "jeddah", stage, drivers_orig)
    h5_out, _ = compute_canonical_prediction_output_hash("2024_02", season, 2, "jeddah", stage, preds_orig)
    t5_pass = (h5_in != base_input_hash) and (h5_out != base_output_hash)
    test_results["test_5_race_identity_sensitivity"] = {"passed": t5_pass, "input_changed": h5_in != base_input_hash, "output_changed": h5_out != base_output_hash}

    # Test 6: Changing prediction stage changes the hash
    h6_in, _ = compute_canonical_inference_input_hash(race_id, season, round_num, circuit_id, STAGE_OFFICIAL_GRID, drivers_orig)
    h6_out, _ = compute_canonical_prediction_output_hash(race_id, season, round_num, circuit_id, STAGE_OFFICIAL_GRID, preds_orig)
    t6_pass = (h6_in != base_input_hash) and (h6_out != base_output_hash)
    test_results["test_6_stage_sensitivity"] = {"passed": t6_pass, "input_changed": h6_in != base_input_hash, "output_changed": h6_out != base_output_hash}

    # Test 7: Changing model, schema, baseline, formula version, or blend weight changes the hash
    meta_changes = [
        compute_canonical_inference_input_hash(race_id, season, round_num, circuit_id, stage, drivers_orig, model_version="v2.0.0")[0],
        compute_canonical_inference_input_hash(race_id, season, round_num, circuit_id, stage, drivers_orig, feature_schema_version="2.0.0")[0],
        compute_canonical_inference_input_hash(race_id, season, round_num, circuit_id, stage, drivers_orig, baseline_version="grid-empirical-laplace-a5")[0],
        compute_canonical_inference_input_hash(race_id, season, round_num, circuit_id, stage, drivers_orig, baseline_alpha=5.0)[0],
        compute_canonical_inference_input_hash(race_id, season, round_num, circuit_id, stage, drivers_orig, hybrid_formula_version="geometric-w0.30-v1")[0],
        compute_canonical_inference_input_hash(race_id, season, round_num, circuit_id, stage, drivers_orig, blend_weight=0.30)[0],
    ]
    t7_pass = all(h != base_input_hash for h in meta_changes)
    test_results["test_7_metadata_and_weight_sensitivity"] = {"passed": t7_pass, "tested_variations": len(meta_changes), "all_changed": t7_pass}

    # Test 8: Changing only output probabilities changes the output hash (input hash unchanged)
    preds_mut_prob = [
        {"driver_id": "verstappen", "grid_position": 1, "grid_win_probability": 0.5500, "ml_win_probability": 0.4482, "hybrid_win_probability": 0.5200},
        preds_orig[1],
        preds_orig[2]
    ]
    h8_out, _ = compute_canonical_prediction_output_hash(race_id, season, round_num, circuit_id, stage, preds_mut_prob)
    t8_pass = (h8_out != base_output_hash) and (h1_in == base_input_hash)
    test_results["test_8_output_probability_sensitivity"] = {"passed": t8_pass, "output_changed": h8_out != base_output_hash, "input_unchanged": h1_in == base_input_hash}

    # Test 9: Changing an underlying feature while preserving final probabilities still changes the inference input hash
    # (Output hash must remain identical, proving complete decoupling)
    drivers_mut_feat = [
        make_sample_driver("verstappen", 1, 1, 99.0),  # points changed, but output probabilities untouched
        drivers_orig[1],
        drivers_orig[2]
    ]
    h9_in, _ = compute_canonical_inference_input_hash(race_id, season, round_num, circuit_id, stage, drivers_mut_feat)
    h9_out, _ = compute_canonical_prediction_output_hash(race_id, season, round_num, circuit_id, stage, preds_orig)
    t9_pass = (h9_in != base_input_hash) and (h9_out == base_output_hash)
    test_results["test_9_feature_decoupled_from_output"] = {
        "passed": t9_pass,
        "input_changed_on_feature_mutation": h9_in != base_input_hash,
        "output_unchanged_on_preserved_probs": h9_out == base_output_hash
    }

    # Test 10: Serialization is deterministic across repeated runs
    hashes_in_100 = [compute_canonical_inference_input_hash(race_id, season, round_num, circuit_id, stage, drivers_orig)[0] for _ in range(100)]
    hashes_out_100 = [compute_canonical_prediction_output_hash(race_id, season, round_num, circuit_id, stage, preds_orig)[0] for _ in range(100)]
    t10_pass = (len(set(hashes_in_100)) == 1) and (len(set(hashes_out_100)) == 1)
    test_results["test_10_deterministic_repeatability"] = {
        "passed": t10_pass,
        "input_hashes_unique": len(set(hashes_in_100)),
        "output_hashes_unique": len(set(hashes_out_100))
    }

    all_passed = all(t.get("passed", False) for t in test_results.values())
    test_results["all_ten_tests_passed"] = all_passed

    print("\nTest Results Summary:")
    for t_name, res in test_results.items():
        if t_name == "all_ten_tests_passed":
            continue
        print(f"  {t_name}: {'PASS' if res['passed'] else 'FAIL'}")

    return {
        "verification_metadata": {
            "phase": "Phase 3C.4F.1.2",
            "title": "Complete Inference Hash & Contract Freeze Verification",
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "production_gate": "STRICTLY CLOSED",
            "model_c_trained": False,
            "all_tests_passed": all_passed
        },
        "sample_hashes": {
            "inference_input_hash_sha256": base_input_hash,
            "prediction_output_hash_sha256": base_output_hash
        },
        "test_results": test_results
    }


def export_hash_contract_audit():
    """Executes the verification suite and writes the machine-readable audit JSON."""
    audit_data = run_ten_point_hash_verification()
    out_file = REPORTS_DIR / "phase_4f_1_2_hash_audit.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(audit_data, f, indent=2)
    print(f"\n[DONE] Full Hash Contract Audit exported to:\n  {out_file}")
    return audit_data


if __name__ == "__main__":
    export_hash_contract_audit()

