#!/usr/bin/env python3
"""
Phase 3C.4F.2: Chronological Walk-Forward Hybrid Validation

Methodology:
1. Strictly chronological walk-forward folds within the historical development dataset (2021-2023):
   - Fold 1: Train strictly on 2021 (22 races, 439 valid starts), Validate on 2022 (22 races, 439 valid starts).
   - Fold 2: Train strictly on 2021-2022 (44 races, 878 valid starts), Validate on 2023 (22 races, 439 valid starts).
   - Pooled Chronological Validation: 44 unseen future Grands Prix (2022 + 2023).
   - Zero future data leakage: all training data, feature calculations, baseline priors, and temperature calibrations strictly precede validation races.

2. Comprehensive Model & Hybrid Weight Comparison:
   - Evaluated weights: w in [0.00, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 1.00]
   - Compares: Empirical Grid Baseline (w=0.00), Standalone ML Model (w=1.00), and all geometric blends.
   - Metrics: Multiclass Log Loss, Multiclass Brier Score, Top-1 Winner Accuracy, Top-3 Coverage, MRR.
   - Slicing: By season, by starting grid group (P1, P2-P3, P4-P10, P11-P20), and non-pole upset races.

3. Model Artifact Provenance:
   - Exact training ranges, row counts, model types, calibrated temperatures, and cryptographic hashes.

4. Output Deliverable:
   - scripts/predictor_model/reports/phase_3c_4f_2/phase_4f_2_walk_forward.json

Governance Attestation:
PRODUCTION GATE: STRICTLY CLOSED
No automatic model promotion or production deployment has taken place.
Model C has NOT been trained or promoted.
"""

import sys
import os
import json
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Tuple
import numpy as np
import pandas as pd
from scipy import stats

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from scripts.predictor_model.features import ALL_MODEL_FEATURES
from scripts.predictor_model.experimental_training import ExperimentalModelTrainer
from scripts.predictor_model.experimental_2025_validation.phase_3c_4f_1.phase_4f_1_hybrid_contract import (
    EmpiricalGridBaselineReference,
    GeometricHybridEngine
)

REPORTS_DIR = PROJECT_ROOT / "scripts" / "predictor_model" / "reports" / "phase_3c_4f_2"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

REMEDIATED_CSV_PATH = PROJECT_ROOT / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_v1_remediated.csv"
CANDIDATE_2025_PATH = PROJECT_ROOT / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_2025_candidate.csv"
FROZEN_MODEL_PATH = PROJECT_ROOT / "models" / "predictor" / "v1.0.0" / "trained_models.joblib"

CANDIDATE_WEIGHTS = [0.0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 1.0]


def compute_race_metrics(y_true: np.ndarray, probs: np.ndarray) -> Dict[str, Any]:
    """Computes race-level log loss, Brier score, Top-1 hit, and Top-3 inclusion."""
    winner_idx = int(np.argmax(y_true))
    p_winner = float(np.clip(probs[winner_idx], 1e-15, 1.0))
    log_loss = -float(np.log(p_winner))
    brier = float(np.sum((probs - y_true) ** 2))

    pred_winner_idx = int(np.argmax(probs))
    top1 = 1 if pred_winner_idx == winner_idx else 0

    top3_indices = np.argsort(probs)[-3:]
    top3 = 1 if winner_idx in top3_indices else 0

    # Reciprocal rank
    rank = int(np.where(np.argsort(probs)[::-1] == winner_idx)[0][0]) + 1
    mrr = float(1.0 / rank)

    return {
        "log_loss": log_loss,
        "brier": brier,
        "top1": top1,
        "top3": top3,
        "mrr": mrr,
        "winner_grid": int(winner_idx + 1)
    }


def compute_paired_stats(model_losses: List[float], baseline_losses: List[float]) -> Dict[str, Any]:
    """Computes paired t-test, delta, standard error, and 95% CI."""
    deltas = np.array(model_losses) - np.array(baseline_losses)
    n = len(deltas)
    delta_mean = float(np.mean(deltas))
    delta_std = float(np.std(deltas, ddof=1)) if n > 1 else 0.0
    delta_se = float(delta_std / np.sqrt(n)) if n > 0 else 0.0

    t_stat, p_val = stats.ttest_rel(model_losses, baseline_losses) if n > 1 else (0.0, 1.0)
    t_crit = stats.t.ppf(0.975, df=n - 1) if n > 1 else 0.0
    ci_lower = float(delta_mean - t_crit * delta_se)
    ci_upper = float(delta_mean + t_crit * delta_se)

    return {
        "delta_mean_log_loss": delta_mean,
        "delta_se_log_loss": delta_se,
        "t_statistic": float(t_stat) if not np.isnan(t_stat) else 0.0,
        "nominal_p_value": float(p_val) if not np.isnan(p_val) else 1.0,
        "ci_95": [ci_lower, ci_upper],
        "sample_size": n
    }


def evaluate_fold(
    fold_name: str,
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    weights: List[float] = CANDIDATE_WEIGHTS
) -> Dict[str, Any]:
    """
    Executes training and evaluation for a single strictly chronological fold.
    """
    print(f"\n--- Running {fold_name} ---")
    print(f"  Training Set:   Seasons {sorted(train_df['season'].unique())} ({train_df['race_id'].nunique()} races, {len(train_df)} starts)")
    print(f"  Validation Set: Season {sorted(val_df['season'].unique())} ({val_df['race_id'].nunique()} races, {len(val_df)} starts)")

    # 1. Fit Prior Baseline strictly on training data
    base_model = EmpiricalGridBaselineReference(smoothing=1.0).fit(train_df)

    # 2. Train ML Model strictly on training data
    trainer = ExperimentalModelTrainer(random_seed=42)
    lgb_model, _, calib_temp = trainer.train_model_b(train_df)
    print(f"  Calibrated Temperature (in-sample train): {calib_temp:.4f}")

    # Compute training data hash
    train_hash = hashlib.sha256(
        train_df.to_csv(index=False).encode("utf-8")
    ).hexdigest()

    n_races = val_df["race_id"].nunique()
    weight_metrics: Dict[str, Any] = {f"w_{w:.2f}": {"log_loss": [], "brier": [], "top1": 0, "top3": 0, "mrr": []} for w in weights}

    # Tracking for breakdowns
    race_records = []

    for _, grp in val_df.groupby("race_id", sort=False):
        grp = grp.reset_index(drop=True)
        y_true = grp["won_race"].values
        winner_idx = int(np.argmax(y_true))
        winner_row = grp.iloc[winner_idx]
        pole_won = (int(winner_row["grid_position"]) == 1)

        # Baseline probabilities
        p_grid = base_model.predict_race_probabilities(grp)

        # ML probabilities
        p_ml = lgb_model.predict_race_probabilities(grp, temperature=calib_temp)
        p_ml = p_ml / np.sum(p_ml)

        race_eval = {
            "race_id": str(grp["race_id"].iloc[0]),
            "round": int(grp["round"].iloc[0]),
            "circuit_id": str(grp["circuit_id"].iloc[0]),
            "actual_winner": str(winner_row["driver_id"]),
            "winner_grid": int(winner_row["grid_position"]),
            "pole_sitter_won": pole_won,
            "predictions_by_weight": {}
        }

        for w in weights:
            w_key = f"w_{w:.2f}"
            engine = GeometricHybridEngine(weight=w)
            p_h = engine.combine_probabilities(p_grid, p_ml, method="geometric")

            m = compute_race_metrics(y_true, p_h)
            weight_metrics[w_key]["log_loss"].append(m["log_loss"])
            weight_metrics[w_key]["brier"].append(m["brier"])
            weight_metrics[w_key]["top1"] += m["top1"]
            weight_metrics[w_key]["top3"] += m["top3"]
            weight_metrics[w_key]["mrr"].append(m["mrr"])

            race_eval["predictions_by_weight"][w_key] = {
                "winner_probability": float(p_h[winner_idx]),
                "log_loss": m["log_loss"],
                "brier": m["brier"],
                "top1_hit": m["top1"],
                "top3_hit": m["top3"],
                "predicted_winner": str(grp.iloc[int(np.argmax(p_h))]["driver_id"])
            }

        race_records.append(race_eval)

    # Compute aggregate summary by weight
    base_ll = weight_metrics["w_0.00"]["log_loss"]
    weight_summary = {}

    for w in weights:
        w_key = f"w_{w:.2f}"
        data = weight_metrics[w_key]
        paired = compute_paired_stats(data["log_loss"], base_ll)

        weight_summary[w_key] = {
            "weight": w,
            "mean_log_loss": float(np.mean(data["log_loss"])),
            "std_log_loss": float(np.std(data["log_loss"], ddof=1)),
            "mean_brier_score": float(np.mean(data["brier"])),
            "top1_accuracy": float(data["top1"] / n_races),
            "top1_hits": int(data["top1"]),
            "top3_coverage": float(data["top3"] / n_races),
            "top3_hits": int(data["top3"]),
            "mean_mrr": float(np.mean(data["mrr"])),
            "delta_vs_grid_baseline": paired
        }

    # Slicing: Pole Winner vs Non-Pole Upset races
    pole_won_races = [r for r in race_records if r["pole_sitter_won"]]
    upset_races = [r for r in race_records if not r["pole_sitter_won"]]

    def summarize_subset(subset_races: List[Dict[str, Any]]) -> Dict[str, Any]:
        sub_summary = {}
        n_sub = len(subset_races)
        if n_sub == 0:
            return sub_summary
        for w in weights:
            w_key = f"w_{w:.2f}"
            ll_sub = [r["predictions_by_weight"][w_key]["log_loss"] for r in subset_races]
            br_sub = [r["predictions_by_weight"][w_key]["brier"] for r in subset_races]
            t1_sub = sum(r["predictions_by_weight"][w_key]["top1_hit"] for r in subset_races)
            sub_summary[w_key] = {
                "mean_log_loss": float(np.mean(ll_sub)),
                "mean_brier": float(np.mean(br_sub)),
                "top1_accuracy": float(t1_sub / n_sub),
                "top1_hits": int(t1_sub),
                "races_count": n_sub
            }
        return sub_summary

    pole_summary = summarize_subset(pole_won_races)
    upset_summary = summarize_subset(upset_races)

    print(f"  Summary ({n_races} races):")
    print(f"    w=0.00 (Pure Grid):     LogLoss={weight_summary['w_0.00']['mean_log_loss']:.4f}, Brier={weight_summary['w_0.00']['mean_brier_score']:.4f}, Top-1={weight_summary['w_0.00']['top1_hits']}/{n_races}")
    print(f"    w=0.20 (Conservative):  LogLoss={weight_summary['w_0.20']['mean_log_loss']:.4f}, Brier={weight_summary['w_0.20']['mean_brier_score']:.4f}, Top-1={weight_summary['w_0.20']['top1_hits']}/{n_races}")
    print(f"    w=1.00 (Standalone ML): LogLoss={weight_summary['w_1.00']['mean_log_loss']:.4f}, Brier={weight_summary['w_1.00']['mean_brier_score']:.4f}, Top-1={weight_summary['w_1.00']['top1_hits']}/{n_races}")

    return {
        "fold_name": fold_name,
        "provenance": {
            "train_seasons": sorted(train_df["season"].unique().tolist()),
            "train_races": int(train_df["race_id"].nunique()),
            "train_starts": len(train_df),
            "train_data_sha256": train_hash,
            "calibrated_temperature": float(calib_temp),
            "val_season": sorted(val_df["season"].unique().tolist()),
            "val_races": n_races,
            "val_starts": len(val_df)
        },
        "weights_summary": weight_summary,
        "subsets_breakdown": {
            "pole_winner_races": {
                "races_count": len(pole_won_races),
                "weights": pole_summary
            },
            "non_pole_upset_races": {
                "races_count": len(upset_races),
                "weights": upset_summary
            }
        },
        "race_level_predictions": race_records
    }


def run_chronological_walk_forward_pipeline() -> Dict[str, Any]:
    print("=" * 80)
    print("PHASE 3C.4F.2: CHRONOLOGICAL WALK-FORWARD HYBRID VALIDATION")
    print("=" * 80)

    # 1. Load Clean Remediated Dataset
    rem_df = pd.read_csv(REMEDIATED_CSV_PATH)
    clean_df = rem_df[rem_df["race_participation_status"] != "WITHDRAWN_BEFORE_START"].copy().reset_index(drop=True)

    df_2021 = clean_df[clean_df["season"] == 2021].copy().reset_index(drop=True)
    df_2022 = clean_df[clean_df["season"] == 2022].copy().reset_index(drop=True)
    df_2023 = clean_df[clean_df["season"] == 2023].copy().reset_index(drop=True)
    df_21_22 = clean_df[clean_df["season"].isin([2021, 2022])].copy().reset_index(drop=True)

    # 2. Run Fold 1: Train 2021, Val 2022
    fold_1_res = evaluate_fold(
        fold_name="Fold_1_Val_2022",
        train_df=df_2021,
        val_df=df_2022
    )

    # 3. Run Fold 2: Train 2021-2022, Val 2023
    fold_2_res = evaluate_fold(
        fold_name="Fold_2_Val_2023",
        train_df=df_21_22,
        val_df=df_2023
    )

    # 4. Compute Pooled Chronological Walk-Forward Metrics (2022 + 2023: 44 unseen races)
    print("\n--- Computing Pooled Chronological Walk-Forward Validation (44 Races) ---")
    pooled_summary = {}
    pooled_races = fold_1_res["race_level_predictions"] + fold_2_res["race_level_predictions"]
    total_val_races = len(pooled_races)

    base_pooled_ll = [
        r["predictions_by_weight"]["w_0.00"]["log_loss"] for r in pooled_races
    ]

    for w in CANDIDATE_WEIGHTS:
        w_key = f"w_{w:.2f}"
        ll_list = [r["predictions_by_weight"][w_key]["log_loss"] for r in pooled_races]
        br_list = [r["predictions_by_weight"][w_key]["brier"] for r in pooled_races]
        t1_hits = sum(r["predictions_by_weight"][w_key]["top1_hit"] for r in pooled_races)
        t3_hits = sum(r["predictions_by_weight"][w_key]["top3_hit"] for r in pooled_races)

        paired = compute_paired_stats(ll_list, base_pooled_ll)

        pooled_summary[w_key] = {
            "weight": w,
            "mean_log_loss": float(np.mean(ll_list)),
            "std_log_loss": float(np.std(ll_list, ddof=1)),
            "mean_brier_score": float(np.mean(br_list)),
            "top1_accuracy": float(t1_hits / total_val_races),
            "top1_hits": int(t1_hits),
            "top3_coverage": float(t3_hits / total_val_races),
            "top3_hits": int(t3_hits),
            "delta_vs_grid_baseline": paired
        }

    # Identify optimal weights on pooled chronological validation
    best_ll_w = min(pooled_summary.values(), key=lambda x: x["mean_log_loss"])
    best_br_w = min(pooled_summary.values(), key=lambda x: x["mean_brier_score"])
    conservative_w = pooled_summary["w_0.20"]

    print(f"  Pooled Walk-Forward Baseline (w=0.00):      LogLoss={pooled_summary['w_0.00']['mean_log_loss']:.4f}, Brier={pooled_summary['w_0.00']['mean_brier_score']:.4f}, Top-1={pooled_summary['w_0.00']['top1_hits']}/{total_val_races}")
    print(f"  Pooled Walk-Forward Conservative (w=0.20):  LogLoss={conservative_w['mean_log_loss']:.4f}, Brier={conservative_w['mean_brier_score']:.4f}, Top-1={conservative_w['top1_hits']}/{total_val_races} (Delta LL: {conservative_w['delta_vs_grid_baseline']['delta_mean_log_loss']:.4f})")
    print(f"  Pooled Walk-Forward LogLoss Optimal (w={best_ll_w['weight']:.2f}): LogLoss={best_ll_w['mean_log_loss']:.4f}, Brier={best_ll_w['mean_brier_score']:.4f}, Top-1={best_ll_w['top1_hits']}/{total_val_races}")
    print(f"  Pooled Walk-Forward Standalone ML (w=1.00): LogLoss={pooled_summary['w_1.00']['mean_log_loss']:.4f}, Brier={pooled_summary['w_1.00']['mean_brier_score']:.4f}, Top-1={pooled_summary['w_1.00']['top1_hits']}/{total_val_races}")

    # 5. Slicing by Grid Position Group across all 44 pooled races
    # (Evaluate probability calibration for P1, P2-P3, P4-P10, P11-P20)
    grid_group_summary = {}
    for group_name, (g_min, g_max) in [("P1_Pole", (1, 1)), ("P2_P3_Front", (2, 3)), ("P4_P10_Points", (4, 10)), ("P11_P20_Back", (11, 24))]:
        group_races = [r for r in pooled_races if g_min <= r["winner_grid"] <= g_max]
        n_grp = len(group_races)
        grp_dict = {}
        for w in [0.0, 0.20, 0.50, 0.60, 1.0]:
            w_key = f"w_{w:.2f}"
            ll_grp = [r["predictions_by_weight"][w_key]["log_loss"] for r in group_races]
            grp_dict[w_key] = {
                "mean_log_loss": float(np.mean(ll_grp)) if n_grp > 0 else 0.0,
                "winner_count": n_grp
            }
        grid_group_summary[group_name] = {
            "winner_count": n_grp,
            "weights": grp_dict
        }

    # 6. Slicing by Non-Pole Upset races across all 44 pooled races
    upset_pooled = [r for r in pooled_races if not r["pole_sitter_won"]]
    n_upsets = len(upset_pooled)
    upset_summary_pooled = {}
    for w in CANDIDATE_WEIGHTS:
        w_key = f"w_{w:.2f}"
        ll_up = [r["predictions_by_weight"][w_key]["log_loss"] for r in upset_pooled]
        br_up = [r["predictions_by_weight"][w_key]["brier"] for r in upset_pooled]
        t1_up = sum(r["predictions_by_weight"][w_key]["top1_hit"] for r in upset_pooled)
        upset_summary_pooled[w_key] = {
            "mean_log_loss": float(np.mean(ll_up)),
            "mean_brier": float(np.mean(br_up)),
            "top1_accuracy": float(t1_up / n_upsets),
            "top1_hits": int(t1_up)
        }

    master_output = {
        "metadata": {
            "phase": "Phase 3C.4F.2",
            "title": "Chronological Walk-Forward Hybrid Validation",
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "production_gate": "STRICTLY CLOSED",
            "model_c_trained": False,
            "candidate_weights_evaluated": CANDIDATE_WEIGHTS,
            "methodology": "Strictly chronological walk-forward (zero temporal leakage)"
        },
        "pooled_chronological_validation": {
            "total_val_races": total_val_races,
            "val_seasons": [2022, 2023],
            "weights_summary": pooled_summary,
            "optimal_weight_by_log_loss": best_ll_w["weight"],
            "optimal_weight_by_brier": best_br_w["weight"],
            "conservative_candidate_weight": 0.20,
            "grid_position_group_analysis": grid_group_summary,
            "non_pole_upset_analysis": {
                "upset_races_count": n_upsets,
                "weights_summary": upset_summary_pooled
            }
        },
        "folds": {
            "fold_1": fold_1_res,
            "fold_2": fold_2_res
        }
    }

    out_file = REPORTS_DIR / "phase_4f_2_walk_forward.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(master_output, f, indent=2)

    print(f"\n[DONE] Walk-forward results exported to:\n  {out_file}")
    return master_output


if __name__ == "__main__":
    run_chronological_walk_forward_pipeline()

