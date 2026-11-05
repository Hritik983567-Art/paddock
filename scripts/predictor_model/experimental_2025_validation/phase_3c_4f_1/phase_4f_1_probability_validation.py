#!/usr/bin/env python3
"""
Phase 3C.4F.1: Probability Validation & Numerical Safety Suite

Objectives:
1. Reconstruct historical holdout evaluations for 2024 and 2025 using the authoritative
   EmpiricalGridBaselineReference and GeometricHybridEngine.
2. Label all 2024 and 2025 holdout metrics strictly as exploratory historical evaluations.
3. Validate numerical safety under extreme stress conditions:
   - Log-Sum-Exp stability under extreme likelihood ratios.
   - Exact unit simplex normalization (|1.0 - sum(P)| < 1e-12).
   - Strictly positive probability floor (P_i >= 0.0005).
   - Degenerate/zero/NaN input handling.
   - Variable roster size invariance (N in [18, 19, 20, 21, 22]).
   - Driver ID order permutation invariance.
4. Verify the 16-field prediction output contract.
5. Export results to scripts/predictor_model/reports/phase_3c_4f_1/phase_4f_1_evaluation.json.

Attestation:
PRODUCTION GATE: STRICTLY CLOSED
No automatic model promotion or production deployment has taken place.
Model C has NOT been trained or promoted.
"""

import sys
import os
import json
import hashlib
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, List, Any, Tuple
import numpy as np
import pandas as pd
from scipy import stats

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from scripts.predictor_model.experimental_2025_validation.phase_3c_4f_1.phase_4f_1_hybrid_contract import (
    EmpiricalGridBaselineReference,
    GeometricHybridEngine,
    HybridDriverPrediction,
    HybridRacePredictionResponse,
    MODEL_VERSION_TAG,
    BASELINE_VERSION_TAG,
    HYBRID_FORMULA_VERSION_TAG,
    EXPERIMENTAL_STATUS_TAG
)
from scripts.predictor_model.experimental_training import ExperimentalModelTrainer

REPORTS_DIR = PROJECT_ROOT / "scripts" / "predictor_model" / "reports" / "phase_3c_4f_1"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

REMEDIATED_DATASET_PATH = PROJECT_ROOT / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_v1_remediated.csv"
CANDIDATE_2025_PATH = PROJECT_ROOT / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_2025_candidate.csv"


def evaluate_single_race(
    y_true: np.ndarray,
    probs: np.ndarray
) -> Dict[str, Any]:
    """Computes race-level log loss, Brier score, top-1 and top-3 accuracy."""
    winner_idx = int(np.argmax(y_true))
    p_winner = float(np.clip(probs[winner_idx], 1e-15, 1.0))
    log_loss = -float(np.log(p_winner))
    brier = float(np.sum((probs - y_true) ** 2))
    
    predicted_winner_idx = int(np.argmax(probs))
    top1 = 1 if predicted_winner_idx == winner_idx else 0
    
    top3_indices = np.argsort(probs)[-3:]
    top3 = 1 if winner_idx in top3_indices else 0
    
    return {
        "log_loss": log_loss,
        "brier": brier,
        "top1": top1,
        "top3": top3
    }


def compute_paired_comparison(
    model_losses: List[float],
    baseline_losses: List[float]
) -> Dict[str, Any]:
    """Computes paired t-test, delta, standard error, and 95% CI."""
    deltas = np.array(model_losses) - np.array(baseline_losses)
    n = len(deltas)
    delta_mean = float(np.mean(deltas))
    delta_std = float(np.std(deltas, ddof=1))
    delta_se = float(delta_std / np.sqrt(n)) if n > 0 else 0.0
    
    t_stat, p_val = stats.ttest_rel(model_losses, baseline_losses)
    
    t_crit = stats.t.ppf(0.975, df=n - 1) if n > 1 else 0.0
    ci_lower = float(delta_mean - t_crit * delta_se)
    ci_upper = float(delta_mean + t_crit * delta_se)
    
    return {
        "delta_mean": delta_mean,
        "delta_se": delta_se,
        "t_statistic": float(t_stat) if not np.isnan(t_stat) else 0.0,
        "nominal_p_value": float(p_val) if not np.isnan(p_val) else 1.0,
        "ci_95": [ci_lower, ci_upper],
        "sample_size": n
    }


def run_numerical_stress_tests() -> Dict[str, Any]:
    """
    Executes comprehensive numerical stability and invariance checks.
    """
    engine = GeometricHybridEngine(weight=0.20, p_floor=0.0005)
    stress_results = {}
    
    # 1. Extreme Likelihood Ratio Stress Test
    # One driver has massive ML probability, baseline has flat or opposite
    n_starters = 20
    p_grid_extreme = np.full(n_starters, 0.0005)
    p_grid_extreme[0] = 1.0 - 19 * 0.0005  # ~0.9905
    
    p_ml_opposite = np.full(n_starters, 0.0005)
    p_ml_opposite[-1] = 1.0 - 19 * 0.0005
    
    p_fused = engine.combine_probabilities(p_grid_extreme, p_ml_opposite, method="geometric")
    
    no_nan_inf = bool(not np.isnan(p_fused).any() and not np.isinf(p_fused).any())
    simplex_err = float(abs(1.0 - np.sum(p_fused)))
    unit_simplex_valid = bool(simplex_err < 1e-12)
    floor_satisfied = bool((p_fused >= engine.p_floor).all())
    
    stress_results["extreme_ratio_test"] = {
        "passed": no_nan_inf and unit_simplex_valid and floor_satisfied,
        "no_nan_or_inf": no_nan_inf,
        "simplex_error": simplex_err,
        "floor_satisfied": floor_satisfied,
        "min_probability": float(np.min(p_fused)),
        "max_probability": float(np.max(p_fused))
    }
    
    # 2. Degenerate Input Fallback Stress Test (all zeros or negative inputs)
    p_zeros = np.zeros(n_starters)
    p_ml_normal = np.full(n_starters, 1.0 / n_starters)
    p_fused_zeros = engine.combine_probabilities(p_zeros, p_ml_normal, method="geometric")
    
    stress_results["degenerate_zero_input_test"] = {
        "passed": bool(not np.isnan(p_fused_zeros).any() and abs(1.0 - np.sum(p_fused_zeros)) < 1e-12),
        "simplex_error": float(abs(1.0 - np.sum(p_fused_zeros))),
        "is_uniform_fallback": bool(np.allclose(p_fused_zeros, 1.0 / n_starters, atol=1e-8))
    }
    
    # 3. Variable Roster Size Invariance Test (N in 18..22)
    roster_tests = {}
    all_rosters_passed = True
    for n in [18, 19, 20, 21, 22]:
        p_g = np.full(n, 1.0 / n)
        p_m = np.random.RandomState(n).dirichlet(np.ones(n))
        p_comb = engine.combine_probabilities(p_g, p_m, method="geometric")
        err = float(abs(1.0 - np.sum(p_comb)))
        passed = bool(err < 1e-12 and len(p_comb) == n and (p_comb >= engine.p_floor).all())
        roster_tests[f"N_{n}"] = {
            "roster_size": n,
            "simplex_error": err,
            "floor_satisfied": bool((p_comb >= engine.p_floor).all()),
            "passed": passed
        }
        if not passed:
            all_rosters_passed = False
            
    stress_results["variable_roster_test"] = {
        "passed": all_rosters_passed,
        "sizes_tested": [18, 19, 20, 21, 22],
        "details": roster_tests
    }
    
    # 4. Driver ID Permutation / Order Invariance Test
    # Verify that shuffling starter rows does not change assigned driver probabilities
    np.random.seed(42)
    p_g_orig = np.random.dirichlet(np.ones(20))
    p_m_orig = np.random.dirichlet(np.ones(20))
    p_fused_orig = engine.combine_probabilities(p_g_orig, p_m_orig, method="geometric")
    
    perm = np.random.permutation(20)
    p_g_perm = p_g_orig[perm]
    p_m_perm = p_m_orig[perm]
    p_fused_perm = engine.combine_probabilities(p_g_perm, p_m_perm, method="geometric")
    
    # Inverse permute to compare
    inv_perm = np.empty_like(perm)
    inv_perm[perm] = np.arange(len(perm))
    p_fused_reordered = p_fused_perm[inv_perm]
    
    max_permutation_diff = float(np.max(np.abs(p_fused_orig - p_fused_reordered)))
    order_invariance_passed = bool(max_permutation_diff < 1e-14)
    
    stress_results["permutation_invariance_test"] = {
        "passed": order_invariance_passed,
        "max_absolute_difference": max_permutation_diff,
        "order_invariant": order_invariance_passed
    }
    
    all_passed = all(t.get("passed", False) for t in stress_results.values())
    stress_results["all_stress_tests_passed"] = all_passed
    return stress_results


def evaluate_season(
    df_season: pd.DataFrame,
    season_year: int,
    base_a1: EmpiricalGridBaselineReference,
    base_a5: EmpiricalGridBaselineReference,
    model_b: Any,
    temp_b: float,
    engine_geo: GeometricHybridEngine,
    engine_cvx: GeometricHybridEngine,
    engine_lo: GeometricHybridEngine
) -> Dict[str, Any]:
    """Runs evaluation across all races of a season."""
    race_groups = df_season.groupby("race_id", sort=False)
    n_races = len(race_groups)
    
    models = {
        "baseline_a1": {"log_loss": [], "brier": [], "top1": 0, "top3": 0},
        "baseline_a5": {"log_loss": [], "brier": [], "top1": 0, "top3": 0},
        "model_b":     {"log_loss": [], "brier": [], "top1": 0, "top3": 0},
        "hybrid_geo_w020": {"log_loss": [], "brier": [], "top1": 0, "top3": 0},
        "hybrid_cvx_g020": {"log_loss": [], "brier": [], "top1": 0, "top3": 0},
        "hybrid_lo_l025":  {"log_loss": [], "brier": [], "top1": 0, "top3": 0}
    }
    
    sample_race_response: Optional[Dict[str, Any]] = None
    
    for r_idx, (race_id, grp) in enumerate(race_groups):
        grp = grp.reset_index(drop=True)
        y_true = grp["won_race"].values
        
        # Grid baseline probabilities
        p_a1 = base_a1.predict_race_probabilities(grp)
        p_a5 = base_a5.predict_race_probabilities(grp)
        
        # ML model probabilities
        p_mb = model_b.predict_race_probabilities(grp, temperature=temp_b)
        p_mb = p_mb / np.sum(p_mb)
        
        # Hybrids
        p_geo = engine_geo.combine_probabilities(p_a1, p_mb, method="geometric")
        p_cvx = engine_cvx.combine_probabilities(p_a1, p_mb, method="convex")
        p_lo = engine_lo.combine_probabilities(p_a1, p_mb, method="log_odds")
        
        # Capture first race as sample response
        if r_idx == 0:
            sample_resp = engine_geo.build_race_prediction_response(
                race_df=grp,
                p_grid=p_a1,
                p_ml=p_mb,
                stage="official_grid",
                method="geometric"
            )
            sample_race_response = sample_resp.to_dict()
            
        m_evals = {
            "baseline_a1": evaluate_single_race(y_true, p_a1),
            "baseline_a5": evaluate_single_race(y_true, p_a5),
            "model_b":     evaluate_single_race(y_true, p_mb),
            "hybrid_geo_w020": evaluate_single_race(y_true, p_geo),
            "hybrid_cvx_g020": evaluate_single_race(y_true, p_cvx),
            "hybrid_lo_l025":  evaluate_single_race(y_true, p_lo)
        }
        
        for m_name, res in m_evals.items():
            models[m_name]["log_loss"].append(res["log_loss"])
            models[m_name]["brier"].append(res["brier"])
            models[m_name]["top1"] += res["top1"]
            models[m_name]["top3"] += res["top3"]
            
    # Aggregate summary
    summary = {}
    base_ll = models["baseline_a1"]["log_loss"]
    base_br = models["baseline_a1"]["brier"]
    
    for m_name, data in models.items():
        m_ll = data["log_loss"]
        m_br = data["brier"]
        paired_stats = compute_paired_comparison(m_ll, base_ll)
        
        summary[m_name] = {
            "mean_log_loss": float(np.mean(m_ll)),
            "mean_brier_score": float(np.mean(m_br)),
            "top1_accuracy": float(data["top1"] / n_races),
            "top1_hits": int(data["top1"]),
            "top3_accuracy": float(data["top3"] / n_races),
            "top3_hits": int(data["top3"]),
            "total_races": n_races,
            "delta_vs_reference_baseline_a1": {
                "delta_mean_log_loss": paired_stats["delta_mean"],
                "delta_se_log_loss": paired_stats["delta_se"],
                "t_statistic": paired_stats["t_statistic"],
                "nominal_p_value": paired_stats["nominal_p_value"],
                "ci_95": paired_stats["ci_95"]
            }
        }
        
    return {
        "season": season_year,
        "evaluation_type": "EXPLORATORY_HISTORICAL_EVALUATION",
        "total_races": n_races,
        "models": summary,
        "sample_race_response": sample_race_response
    }


def run_full_validation_suite() -> Dict[str, Any]:
    print("=" * 80)
    print("PHASE 3C.4F.1: PROBABILITY VALIDATION & NUMERICAL SAFETY AUDIT")
    print("=" * 80)
    
    # 1. Load Data
    print("\n[STEP 1] Loading historical and candidate datasets...")
    rem_df = pd.read_csv(REMEDIATED_DATASET_PATH)
    cand_2025 = pd.read_csv(CANDIDATE_2025_PATH)
    
    train_21_23 = rem_df[rem_df["season"] <= 2023].copy().reset_index(drop=True)
    df_2024 = rem_df[
        (rem_df["season"] == 2024) & 
        (rem_df["race_participation_status"] != "WITHDRAWN_BEFORE_START")
    ].copy().reset_index(drop=True)
    df_2025 = cand_2025[
        cand_2025["race_participation_status"] != "WITHDRAWN_BEFORE_START"
    ].copy().reset_index(drop=True)
    
    print(f"  Training set (2021-2023): {train_21_23['race_id'].nunique()} races, {len(train_21_23)} driver rows")
    print(f"  2024 holdout set:        {df_2024['race_id'].nunique()} races, {len(df_2024)} starters")
    print(f"  2025 holdout set:        {df_2025['race_id'].nunique()} races, {len(df_2025)} starters")
    
    # 2. Fit Authoritative Reference Baseline
    print("\n[STEP 2] Fitting reference empirical grid baselines (2021-2023)...")
    base_a1 = EmpiricalGridBaselineReference(smoothing=1.0, version_tag="grid-empirical-laplace-a1").fit(train_21_23)
    base_a5 = EmpiricalGridBaselineReference(smoothing=5.0, version_tag="grid-empirical-laplace-a5").fit(train_21_23)
    print(f"  Reference Baseline (alpha=1.0) fit across {base_a1.total_races} races.")
    print(f"  Exploratory Baseline (alpha=5.0) fit across {base_a5.total_races} races.")
    
    # 3. Train Model B
    print("\n[STEP 3] Rebuilding Remediated Model B (LightGBM)...")
    trainer = ExperimentalModelTrainer(random_seed=42)
    model_b, _, temp_b = trainer.train_model_b(train_21_23)
    print(f"  Model B trained. Temperature: {temp_b:.4f}")
    
    # 4. Initialize Hybrid Engines
    engine_geo = GeometricHybridEngine(weight=0.20, hybrid_formula_version="geometric-w0.20-v1")
    engine_cvx = GeometricHybridEngine(weight=0.20, hybrid_formula_version="convex-g0.20-v1")
    engine_lo = GeometricHybridEngine(weight=0.25, hybrid_formula_version="logodds-l0.25-v1")
    
    # 5. Numerical Stress Testing Suite
    print("\n[STEP 4] Executing numerical safety & invariance stress testing...")
    stress_results = run_numerical_stress_tests()
    print(f"  Extreme ratio test:         {'PASS' if stress_results['extreme_ratio_test']['passed'] else 'FAIL'}")
    print(f"  Degenerate zero-input test: {'PASS' if stress_results['degenerate_zero_input_test']['passed'] else 'FAIL'}")
    print(f"  Variable roster test:       {'PASS' if stress_results['variable_roster_test']['passed'] else 'FAIL'}")
    print(f"  Permutation invariance test:{'PASS' if stress_results['permutation_invariance_test']['passed'] else 'FAIL'}")
    
    # 6. Historical Evaluations (2024 and 2025)
    print("\n[STEP 5] Reconstructing 2024 holdout evaluation (Exploratory)...")
    eval_2024 = evaluate_season(
        df_season=df_2024,
        season_year=2024,
        base_a1=base_a1,
        base_a5=base_a5,
        model_b=model_b,
        temp_b=temp_b,
        engine_geo=engine_geo,
        engine_cvx=engine_cvx,
        engine_lo=engine_lo
    )
    print(f"  2024 Baseline a1:  LogLoss={eval_2024['models']['baseline_a1']['mean_log_loss']:.4f}, Brier={eval_2024['models']['baseline_a1']['mean_brier_score']:.4f}, Top-1={eval_2024['models']['baseline_a1']['top1_hits']}/24")
    print(f"  2024 Baseline a5:  LogLoss={eval_2024['models']['baseline_a5']['mean_log_loss']:.4f}, Brier={eval_2024['models']['baseline_a5']['mean_brier_score']:.4f}")
    print(f"  2024 Model B:      LogLoss={eval_2024['models']['model_b']['mean_log_loss']:.4f}, Brier={eval_2024['models']['model_b']['mean_brier_score']:.4f}")
    print(f"  2024 Geometric:    LogLoss={eval_2024['models']['hybrid_geo_w020']['mean_log_loss']:.4f}, Brier={eval_2024['models']['hybrid_geo_w020']['mean_brier_score']:.4f}, Top-1={eval_2024['models']['hybrid_geo_w020']['top1_hits']}/24")
    
    print("\n[STEP 6] Reconstructing 2025 holdout evaluation (Exploratory)...")
    eval_2025 = evaluate_season(
        df_season=df_2025,
        season_year=2025,
        base_a1=base_a1,
        base_a5=base_a5,
        model_b=model_b,
        temp_b=temp_b,
        engine_geo=engine_geo,
        engine_cvx=engine_cvx,
        engine_lo=engine_lo
    )
    print(f"  2025 Baseline a1:  LogLoss={eval_2025['models']['baseline_a1']['mean_log_loss']:.4f}, Brier={eval_2025['models']['baseline_a1']['mean_brier_score']:.4f}, Top-1={eval_2025['models']['baseline_a1']['top1_hits']}/24")
    print(f"  2025 Baseline a5:  LogLoss={eval_2025['models']['baseline_a5']['mean_log_loss']:.4f}, Brier={eval_2025['models']['baseline_a5']['mean_brier_score']:.4f}")
    print(f"  2025 Model B:      LogLoss={eval_2025['models']['model_b']['mean_log_loss']:.4f}, Brier={eval_2025['models']['model_b']['mean_brier_score']:.4f}")
    print(f"  2025 Geometric:    LogLoss={eval_2025['models']['hybrid_geo_w020']['mean_log_loss']:.4f}, Brier={eval_2025['models']['hybrid_geo_w020']['mean_brier_score']:.4f}, Top-1={eval_2025['models']['hybrid_geo_w020']['top1_hits']}/24")
    
    # 7. Verification of Contract Schema on Sample Responses
    print("\n[STEP 7] Verifying prediction output contract fields...")
    sample_preds = eval_2024["sample_race_response"]["predictions"]
    expected_fields = [
        "race_id", "season", "round", "driver_id", "driver_name",
        "grid_position", "grid_win_probability", "ml_win_probability",
        "hybrid_win_probability", "model_version", "baseline_version",
        "hybrid_formula_version", "prediction_stage", "input_hash",
        "generated_at", "experimental_status"
    ]
    contract_fields_verified = True
    for p in sample_preds:
        for f in expected_fields:
            if f not in p:
                contract_fields_verified = False
                break
        if p["experimental_status"] != EXPERIMENTAL_STATUS_TAG:
            contract_fields_verified = False
            
    print(f"  All 16 contract fields verified: {'YES' if contract_fields_verified else 'NO'}")
    
    # 8. Assemble Full Validation JSON
    full_report = {
        "report_metadata": {
            "phase": "Phase 3C.4F.1",
            "title": "Hybrid Formula & Baseline Finalization Evaluation",
            "production_gate": "STRICTLY CLOSED",
            "no_promotion_attestation": "No automatic model promotion or production deployment has taken place.",
            "model_c_attestation": "Model C has NOT been trained or promoted.",
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "status": EXPERIMENTAL_STATUS_TAG,
            "disclaimer": "All 2024 and 2025 evaluations are exploratory historical analyses and must not be used for online hyperparameter tuning."
        },
        "reference_baseline_summary": {
            "name": "Empirical Grid Baseline (Reference)",
            "version": BASELINE_VERSION_TAG,
            "smoothing": 1.0,
            "p_floor": 0.0005,
            "training_window": "2021-2023 (66 races, 1,319 valid starts)",
            "grid_wins_distribution": base_a1.grid_wins,
            "grid_starts_distribution": base_a1.grid_starts
        },
        "candidate_hybrid_summary": {
            "name": "Geometric Hybrid (Primary Candidate)",
            "version": HYBRID_FORMULA_VERSION_TAG,
            "weight_w": 0.20,
            "formula": "log(P_tilde_i) = (1-w)*log(P_grid_i) + w*log(P_ML_i) - logsumexp(log(P_tilde))",
            "ml_model": "Remediated LightGBM Model B (2021-2023)",
            "ml_temperature": temp_b
        },
        "numerical_stress_tests": stress_results,
        "contract_verification": {
            "expected_fields_count": len(expected_fields),
            "expected_fields": expected_fields,
            "contract_conformance_verified": contract_fields_verified
        },
        "evaluations": {
            "season_2024": eval_2024,
            "season_2025": eval_2025
        }
    }
    
    out_file = REPORTS_DIR / "phase_4f_1_evaluation.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(full_report, f, indent=2)
    print(f"\n[DONE] Full evaluation exported to:\n  {out_file}")
    
    return full_report


if __name__ == "__main__":
    run_full_validation_suite()

