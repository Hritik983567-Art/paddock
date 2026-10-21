import os
import sys

# Configure UTF-8 stdout if supported
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import pandas as pd
import numpy as np

from .config import (
    DATASET_CSV_PATH,
    MODEL_VERSION,
    RANDOM_SEED
)
from .features import TARGET_COLUMN, ALL_MODEL_FEATURES
from .backtest import RollingOriginBacktester
from .explainability import ModelExplainabilityManager
from .artifact_manager import PredictorArtifactManager


def run_training_and_evaluation():
    print("=" * 80)
    print("=== PADDOCK RACE PREDICTOR -- MODEL TRAINING & BENCHMARK EVALUATION ===")
    print("=" * 80)
    print(f"Model Version: {MODEL_VERSION}")
    print(f"Dataset Path:  {DATASET_CSV_PATH}")
    print(f"Random Seed:   {RANDOM_SEED}")
    print("-" * 80)

    # 1. Load Dataset
    if not os.path.exists(DATASET_CSV_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATASET_CSV_PATH}. Run historical pipeline first.")

    df = pd.read_csv(DATASET_CSV_PATH)
    print(f"Loaded dataset: {len(df):,} driver-race records across {df['race_id'].nunique()} Grands Prix.")

    # 2. Verify Invariants
    assert TARGET_COLUMN in df.columns, f"Target column '{TARGET_COLUMN}' missing."
    winners_per_race = df.groupby("race_id")[TARGET_COLUMN].sum()
    invalid_races = winners_per_race[winners_per_race != 1]
    if not invalid_races.empty:
        print(f"[!] Warning: Found {len(invalid_races)} races with non-single winner: {invalid_races.to_dict()}")
    else:
        print("[OK] Data Invariant Verified: Exactly 1 winner per race across all evaluated Grands Prix.")

    # 3. Chronological Rolling-Origin Backtesting
    print("\n[Step 1/4] Running Chronological Rolling-Origin Backtesting...")
    backtester = RollingOriginBacktester(df)
    backtest_results = backtester.run_backtesting()

    for fold in backtest_results["folds"]:
        print(f"\n--- Fold {fold['fold_id']}: Train {fold['train_seasons']} ({fold['train_races']} races) -> Val {fold['val_season']} ({fold['val_races']} races) ---")
        for m_name, m_stats in fold["models"].items():
            top1 = m_stats.get("top1_hit_rate_pct", 0)
            log_loss = m_stats.get("multiclass_log_loss", 0)
            brier = m_stats.get("multiclass_brier_score", 0)
            print(f"  * {m_name:<30}: Top-1={top1:.1f}% | LogLoss={log_loss:.3f} | Brier={brier:.3f}")

    # 4. Out-of-Time Holdout Evaluation (2024 Season)
    print("\n[Step 2/4] Evaluating on Completely Held-Out 2024 Season...")
    holdout_results = backtester.run_final_holdout_evaluation()
    cmp = holdout_results["models_comparison"]

    print("\n" + "=" * 80)
    print("=== FINAL HOLDOUT BENCHMARK (2024 SEASON -- 24 RACES) ===")
    print("=" * 80)
    header = f"{'Model':<35} | {'Top-1 Acc':<10} | {'Top-3 Cov':<10} | {'Log Loss':<10} | {'Brier':<10} | {'ECE':<8}"
    print(header)
    print("-" * len(header))
    for m_key, m_metrics in cmp.items():
        top1_str = f"{m_metrics['top1_hit_rate_pct']:.1f}%"
        top3_str = f"{m_metrics['top3_hit_rate_pct']:.1f}%"
        ll_str = f"{m_metrics['multiclass_log_loss']:.3f}"
        brier_str = f"{m_metrics['multiclass_brier_score']:.3f}"
        ece_str = f"{m_metrics['expected_calibration_error']:.3f}"
        print(f"{m_key:<35} | {top1_str:<10} | {top3_str:<10} | {ll_str:<10} | {brier_str:<10} | {ece_str:<8}")
    print("=" * 80)

    # 5. Explainability & SHAP
    print("\n[Step 3/4] Computing Model Explainability (TreeSHAP & Regression Weights)...")
    trained_lgb = holdout_results["trained_models"]["lightgbm"]
    trained_lr = holdout_results["trained_models"]["logistic_regression"]
    train_df = df[df["season"].isin([2021, 2022, 2023])]

    lgb_explanations = ModelExplainabilityManager.compute_lightgbm_explanations(
        trained_lgb, background_df=train_df
    )
    lr_explanations = ModelExplainabilityManager.compute_logistic_regression_explanations(
        trained_lr
    )
    explainability_results = {
        "lgb_explanations": lgb_explanations,
        "lr_explanations": lr_explanations
    }

    print("\nTop 5 Most Influential Features (LightGBM TreeSHAP):")
    for f in lgb_explanations["top_shap_features"][:5]:
        print(f"  {f['rank']}. {f['feature']:<30} (Mean |SHAP| = {f['mean_abs_shap']:.4f}) - {f['description']}")

    # 6. Save Versioned Artifacts
    print("\n[Step 4/4] Serializing Artifacts & Generating Evaluation Report...")
    artifact_manager = PredictorArtifactManager(version=MODEL_VERSION)
    saved_paths = artifact_manager.save_artifacts(
        trained_models=holdout_results["trained_models"],
        backtest_results=backtest_results,
        holdout_results=holdout_results,
        explainability_results=explainability_results,
        dataset_df=df
    )

    print("\n[OK] Artifacts successfully created:")
    for k, p in saved_paths.items():
        print(f"  - {k}: {p}")

    print("\n=== Model Training & Evaluation Complete ===")
    return holdout_results
    return holdout_results


if __name__ == "__main__":
    run_training_and_evaluation()
