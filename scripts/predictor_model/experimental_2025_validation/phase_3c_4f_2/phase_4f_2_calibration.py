#!/usr/bin/env python3
"""
Phase 3C.4F.2: Chronological Walk-Forward Calibration & Sensitivity Audit

Performs in-depth probabilistic calibration and distribution audits on chronological
walk-forward predictions (44 unseen races, 878 driver starts across 2022 and 2023).

Evaluations:
1. Expected Calibration Error (ECE) and Maximum Calibration Error (MCE) using 10 equal-width bins.
2. Full reliability diagram binning data (confidence, empirical win rate, sample count, calibration gap).
3. Distribution dispersion metrics: Shannon entropy, Interquartile Range (IQR), min/max/percentiles.
4. Extreme probability & tail-risk checks:
   - High confidence instances (P > 0.50, P > 0.70) and false-positive upset rates.
   - Low probability instances on actual winners (P < 0.05, P < 0.01) causing severe log loss spikes.
5. Sliced calibration by race type (Pole-Won vs. Non-Pole Upset races).
6. Export to scripts/predictor_model/reports/phase_3c_4f_2/phase_4f_2_calibration.json

Governance Attestation:
PRODUCTION GATE: STRICTLY CLOSED
No automatic model promotion or production deployment has taken place.
Model C has NOT been trained or promoted.
"""

import sys
import json
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Tuple
import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from scripts.predictor_model.experimental_training import ExperimentalModelTrainer
from scripts.predictor_model.experimental_2025_validation.phase_3c_4f_1.phase_4f_1_hybrid_contract import (
    EmpiricalGridBaselineReference,
    GeometricHybridEngine
)

REPORTS_DIR = PROJECT_ROOT / "scripts" / "predictor_model" / "reports" / "phase_3c_4f_2"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)
REMEDIATED_CSV_PATH = PROJECT_ROOT / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_v1_remediated.csv"
CALIBRATION_JSON = REPORTS_DIR / "phase_4f_2_calibration.json"

EVAL_WEIGHTS = [0.0, 0.10, 0.20, 0.30, 0.50, 0.60, 0.70, 1.0]


def compute_ece_and_reliability(
    probs: np.ndarray,
    labels: np.ndarray,
    n_bins: int = 10
) -> Dict[str, Any]:
    """
    Computes Expected Calibration Error (ECE) and reliability bin statistics
    using equal-width bins across [0.0, 1.0].
    """
    bin_edges = np.linspace(0.0, 1.0, n_bins + 1)
    bin_data = []
    total_samples = len(probs)
    weighted_ece = 0.0
    max_gap = 0.0

    for b in range(n_bins):
        low, high = bin_edges[b], bin_edges[b + 1]
        if b == n_bins - 1:
            mask = (probs >= low) & (probs <= high)
        else:
            mask = (probs >= low) & (probs < high)

        count = int(np.sum(mask))
        if count > 0:
            mean_conf = float(np.mean(probs[mask]))
            emp_acc = float(np.mean(labels[mask]))
            gap = float(abs(emp_acc - mean_conf))
            weighted_ece += (count / total_samples) * gap
            max_gap = max(max_gap, gap)
        else:
            mean_conf = float((low + high) / 2.0)
            emp_acc = 0.0
            gap = 0.0

        bin_data.append({
            "bin_index": b + 1,
            "range": [round(float(low), 2), round(float(high), 2)],
            "count": count,
            "mean_confidence": mean_conf,
            "empirical_accuracy": emp_acc,
            "calibration_gap": gap
        })

    return {
        "ece": float(weighted_ece),
        "mce": float(max_gap),
        "num_bins": n_bins,
        "total_samples": total_samples,
        "bins": bin_data
    }


def compute_dispersion_metrics(race_probs: List[np.ndarray], labels_list: List[np.ndarray]) -> Dict[str, Any]:
    """
    Computes Shannon entropy across races, and distribution percentiles for winner and non-winner probabilities.
    """
    # 1. Shannon Entropy per race: H = -sum(p * ln(p))
    entropies = []
    for p in race_probs:
        p_clipped = np.clip(p, 1e-15, 1.0)
        h = -float(np.sum(p_clipped * np.log(p_clipped)))
        entropies.append(h)

    # 2. Flattened arrays for winner and all runner probabilities
    all_p = np.concatenate(race_probs)
    all_y = np.concatenate(labels_list)

    winner_p = all_p[all_y == 1]
    non_winner_p = all_p[all_y == 0]

    def get_percentiles(arr: np.ndarray) -> Dict[str, float]:
        q25, q75 = float(np.percentile(arr, 25)), float(np.percentile(arr, 75))
        return {
            "mean": float(np.mean(arr)),
            "std": float(np.std(arr)),
            "min": float(np.min(arr)),
            "p25": q25,
            "median": float(np.median(arr)),
            "p75": q75,
            "p90": float(np.percentile(arr, 90)),
            "max": float(np.max(arr)),
            "iqr": float(q75 - q25)
        }

    return {
        "mean_shannon_entropy": float(np.mean(entropies)),
        "std_shannon_entropy": float(np.std(entropies)),
        "min_shannon_entropy": float(np.min(entropies)),
        "max_shannon_entropy": float(np.max(entropies)),
        "winner_probabilities": get_percentiles(winner_p),
        "non_winner_probabilities": get_percentiles(non_winner_p)
    }


def compute_extreme_tail_risk(all_p: np.ndarray, all_y: np.ndarray) -> Dict[str, Any]:
    """
    Evaluates overconfidence risk and catastrophic upset loss risks.
    """
    # Overconfidence: Assigned P > 0.50
    high_50_mask = all_p >= 0.50
    high_50_count = int(np.sum(high_50_mask))
    high_50_wins = int(np.sum(all_y[high_50_mask]))
    high_50_losses = high_50_count - high_50_wins

    # Extreme confidence: Assigned P > 0.70
    high_70_mask = all_p >= 0.70
    high_70_count = int(np.sum(high_70_mask))
    high_70_wins = int(np.sum(all_y[high_70_mask]))
    high_70_losses = high_70_count - high_70_wins

    # Extreme low probability on actual winners: P < 0.05, P < 0.01
    winner_p = all_p[all_y == 1]
    low_05_count = int(np.sum(winner_p < 0.05))
    low_01_count = int(np.sum(winner_p < 0.01))
    min_winner_p = float(np.min(winner_p))

    return {
        "high_confidence_p50": {
            "total_instances": high_50_count,
            "correct_winner_instances": high_50_wins,
            "false_positive_losses": high_50_losses,
            "empirical_accuracy": float(high_50_wins / high_50_count) if high_50_count > 0 else 0.0
        },
        "extreme_confidence_p70": {
            "total_instances": high_70_count,
            "correct_winner_instances": high_70_wins,
            "false_positive_losses": high_70_losses,
            "empirical_accuracy": float(high_70_wins / high_70_count) if high_70_count > 0 else 0.0
        },
        "winner_underconfidence_risk": {
            "winners_with_p_below_0.05": low_05_count,
            "winners_with_p_below_0.01": low_01_count,
            "minimum_probability_assigned_to_winner": min_winner_p,
            "maximum_single_race_log_loss": float(-np.log(max(min_winner_p, 1e-15)))
        }
    }


def run_calibration_pipeline() -> Dict[str, Any]:
    print("=" * 80)
    print("PHASE 3C.4F.2: CHRONOLOGICAL WALK-FORWARD CALIBRATION & SENSITIVITY AUDIT")
    print("=" * 80)

    # 1. Load Clean Remediated Dataset
    rem_df = pd.read_csv(REMEDIATED_CSV_PATH)
    clean_df = rem_df[rem_df["race_participation_status"] != "WITHDRAWN_BEFORE_START"].copy().reset_index(drop=True)

    df_2021 = clean_df[clean_df["season"] == 2021].copy().reset_index(drop=True)
    df_2022 = clean_df[clean_df["season"] == 2022].copy().reset_index(drop=True)
    df_2023 = clean_df[clean_df["season"] == 2023].copy().reset_index(drop=True)
    df_21_22 = clean_df[clean_df["season"].isin([2021, 2022])].copy().reset_index(drop=True)

    # 2. Train Models for Fold 1 and Fold 2
    print("\n[1/3] Training Fold 1 models (Train: 2021)...")
    base_m1 = EmpiricalGridBaselineReference(smoothing=1.0).fit(df_2021)
    trainer1 = ExperimentalModelTrainer(random_seed=42)
    lgb_m1, _, calib_t1 = trainer1.train_model_b(df_2021)

    print("[2/3] Training Fold 2 models (Train: 2021-2022)...")
    base_m2 = EmpiricalGridBaselineReference(smoothing=1.0).fit(df_21_22)
    trainer2 = ExperimentalModelTrainer(random_seed=42)
    lgb_m2, _, calib_t2 = trainer2.train_model_b(df_21_22)

    # 3. Predict full probability arrays across both validation seasons
    print("[3/3] Generating predictions for 44 chronological validation races (878 starts)...")

    # Store race-level data: list of dicts with {race_id, season, pole_won, y_true, probs_by_weight}
    all_validation_races = []

    # Evaluate Fold 1 (2022)
    for _, grp in df_2022.groupby("race_id", sort=False):
        grp = grp.reset_index(drop=True)
        y_true = grp["won_race"].values
        winner_idx = int(np.argmax(y_true))
        pole_won = (int(grp.iloc[winner_idx]["grid_position"]) == 1)

        p_grid = base_m1.predict_race_probabilities(grp)
        p_ml = lgb_m1.predict_race_probabilities(grp, temperature=calib_t1)
        p_ml = p_ml / np.sum(p_ml)

        race_entry = {
            "race_id": str(grp["race_id"].iloc[0]),
            "season": 2022,
            "pole_won": pole_won,
            "y_true": y_true,
            "probs": {}
        }
        for w in EVAL_WEIGHTS:
            engine = GeometricHybridEngine(weight=w)
            p_h = engine.combine_probabilities(p_grid, p_ml, method="geometric")
            race_entry["probs"][f"w_{w:.2f}"] = p_h

        all_validation_races.append(race_entry)

    # Evaluate Fold 2 (2023)
    for _, grp in df_2023.groupby("race_id", sort=False):
        grp = grp.reset_index(drop=True)
        y_true = grp["won_race"].values
        winner_idx = int(np.argmax(y_true))
        pole_won = (int(grp.iloc[winner_idx]["grid_position"]) == 1)

        p_grid = base_m2.predict_race_probabilities(grp)
        p_ml = lgb_m2.predict_race_probabilities(grp, temperature=calib_t2)
        p_ml = p_ml / np.sum(p_ml)

        race_entry = {
            "race_id": str(grp["race_id"].iloc[0]),
            "season": 2023,
            "pole_won": pole_won,
            "y_true": y_true,
            "probs": {}
        }
        for w in EVAL_WEIGHTS:
            engine = GeometricHybridEngine(weight=w)
            p_h = engine.combine_probabilities(p_grid, p_ml, method="geometric")
            race_entry["probs"][f"w_{w:.2f}"] = p_h

        all_validation_races.append(race_entry)

    # 4. Compute Calibration & Sensitivity Metrics for each evaluated weight
    calibration_by_weight = {}

    for w in EVAL_WEIGHTS:
        w_key = f"w_{w:.2f}"
        race_probs = [r["probs"][w_key] for r in all_validation_races]
        labels_list = [r["y_true"] for r in all_validation_races]

        flat_p = np.concatenate(race_probs)
        flat_y = np.concatenate(labels_list)

        ece_stats = compute_ece_and_reliability(flat_p, flat_y, n_bins=10)
        dispersion = compute_dispersion_metrics(race_probs, labels_list)
        tail_risk = compute_extreme_tail_risk(flat_p, flat_y)

        # Upset slice vs Pole slice calibration
        pole_races = [r for r in all_validation_races if r["pole_won"]]
        upset_races = [r for r in all_validation_races if not r["pole_won"]]

        p_pole = np.concatenate([r["probs"][w_key] for r in pole_races])
        y_pole = np.concatenate([r["y_true"] for r in pole_races])
        ece_pole = compute_ece_and_reliability(p_pole, y_pole, n_bins=10)

        p_upset = np.concatenate([r["probs"][w_key] for r in upset_races])
        y_upset = np.concatenate([r["y_true"] for r in upset_races])
        ece_upset = compute_ece_and_reliability(p_upset, y_upset, n_bins=10)

        calibration_by_weight[w_key] = {
            "weight": w,
            "ece_overall": ece_stats["ece"],
            "mce_overall": ece_stats["mce"],
            "reliability_bins": ece_stats["bins"],
            "dispersion_metrics": dispersion,
            "tail_risk_audit": tail_risk,
            "subsets": {
                "pole_won_races": {
                    "count": len(pole_races),
                    "ece": ece_pole["ece"],
                    "mce": ece_pole["mce"]
                },
                "non_pole_upset_races": {
                    "count": len(upset_races),
                    "ece": ece_upset["ece"],
                    "mce": ece_upset["mce"]
                }
            }
        }

        print(f"  {w_key}: ECE={ece_stats['ece']:.4f}, MCE={ece_stats['mce']:.4f}, MeanEntropy={dispersion['mean_shannon_entropy']:.4f}, MaxLogLoss={tail_risk['winner_underconfidence_risk']['maximum_single_race_log_loss']:.4f}")

    master_payload = {
        "metadata": {
            "phase": "Phase 3C.4F.2",
            "title": "Chronological Walk-Forward Calibration & Sensitivity Audit",
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "production_gate": "STRICTLY CLOSED",
            "model_c_trained": False,
            "sample_counts": {
                "total_validation_races": len(all_validation_races),
                "total_driver_starts": sum(len(r["y_true"]) for r in all_validation_races),
                "pole_won_races": sum(1 for r in all_validation_races if r["pole_won"]),
                "non_pole_upset_races": sum(1 for r in all_validation_races if not r["pole_won"])
            },
            "evaluated_weights": EVAL_WEIGHTS
        },
        "calibration_by_weight": calibration_by_weight
    }

    with open(CALIBRATION_JSON, "w", encoding="utf-8") as f:
        json.dump(master_payload, f, indent=2)

    print(f"\n[DONE] Calibration audit exported to:\n  {CALIBRATION_JSON}")
    return master_payload


if __name__ == "__main__":
    run_calibration_pipeline()

