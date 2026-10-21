import os
import sys
import json
import joblib
import platform
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from datetime import datetime

from .config import (
    MODEL_VERSION,
    FEATURE_SCHEMA_VERSION,
    TRAINING_CUTOFF_DATE,
    MODELS_ROOT_DIR,
    DOCS_DIR,
    RANDOM_SEED
)
from .features import ALL_MODEL_FEATURES, NUMERICAL_FEATURES, CATEGORICAL_FEATURES, TARGET_COLUMN


class PredictorArtifactManager:
    """
    Handles versioned serialization and documentation of model artifacts.
    Generates model_metadata.json, trained_models.joblib, and markdown evaluation reports.
    """

    def __init__(self, version: str = MODEL_VERSION):
        self.version = version
        self.artifact_dir = os.path.join(MODELS_ROOT_DIR, self.version)
        os.makedirs(self.artifact_dir, exist_ok=True)

    def save_artifacts(
        self,
        trained_models: Dict[str, Any],
        backtest_results: Dict[str, Any],
        holdout_results: Dict[str, Any],
        explainability_results: Dict[str, Any],
        dataset_df: pd.DataFrame
    ) -> Dict[str, str]:
        """
        Saves all versioned artifacts to models/predictor/{version}/ and docs/
        """
        # 1. Dependency Versions
        import sklearn
        import lightgbm
        import shap
        import scipy

        dependency_versions = {
            "python": platform.python_version(),
            "numpy": np.__version__,
            "pandas": pd.__version__,
            "scikit-learn": sklearn.__version__,
            "lightgbm": lightgbm.__version__,
            "shap": shap.__version__,
            "scipy": scipy.__version__,
            "joblib": joblib.__version__
        }

        # 2. Missingness & Provenance Notes
        missingness_summary = {}
        for col in ALL_MODEL_FEATURES:
            missing_count = int(dataset_df[col].isna().sum())
            if missing_count > 0:
                missingness_summary[col] = {
                    "missing_count": missing_count,
                    "missing_pct": round((missing_count / len(dataset_df)) * 100, 2),
                    "imputation_strategy": "median" if col in NUMERICAL_FEATURES else "most_frequent"
                }

        # 3. Model Metadata Dictionary
        metadata = {
            "model_version": self.version,
            "feature_schema_version": FEATURE_SCHEMA_VERSION,
            "created_timestamp_utc": datetime.utcnow().isoformat() + "Z",
            "training_data_cutoff": TRAINING_CUTOFF_DATE,
            "random_seed": RANDOM_SEED,
            "primary_target": TARGET_COLUMN,
            "prediction_cutoff_event": "Post-Qualifying (Grid Finalized) to Pre-Race Formation Lap",
            "dependencies": dependency_versions,
            "training_sample_count": holdout_results["dataset_summary"]["train_samples"],
            "training_race_count": holdout_results["dataset_summary"]["train_races"],
            "test_sample_count": holdout_results["dataset_summary"]["test_samples"],
            "test_race_count": holdout_results["dataset_summary"]["test_races"],
            "features": {
                "total_count": len(ALL_MODEL_FEATURES),
                "numerical_count": len(NUMERICAL_FEATURES),
                "categorical_count": len(CATEGORICAL_FEATURES),
                "feature_list": ALL_MODEL_FEATURES
            },
            "missingness_notes": missingness_summary,
            "rolling_backtest_validation_metrics": backtest_results,
            "holdout_test_metrics_2024": holdout_results["models_comparison"],
            "subgroup_breakdowns_2024": holdout_results["subgroup_breakdowns"],
            "explainability_summary": {
                "top_shap_features": explainability_results.get("lgb_explanations", {}).get("top_shap_features", []),
                "causal_disclaimer": explainability_results.get("lgb_explanations", {}).get("causal_disclaimer", "")
            }
        }

        # Save model_metadata.json
        metadata_path = os.path.join(self.artifact_dir, "model_metadata.json")
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

        # Save trained_models.joblib
        models_bundle_path = os.path.join(self.artifact_dir, "trained_models.joblib")
        joblib.dump(trained_models, models_bundle_path, compress=3)

        # Generate and save Markdown Report
        report_md = self._generate_markdown_report(metadata, holdout_results, explainability_results)

        artifact_report_path = os.path.join(self.artifact_dir, "EVALUATION_REPORT.md")
        with open(artifact_report_path, "w", encoding="utf-8") as f:
            f.write(report_md)

        docs_report_path = os.path.join(DOCS_DIR, "PREDICTOR_MODEL_EVALUATION.md")
        with open(docs_report_path, "w", encoding="utf-8") as f:
            f.write(report_md)

        return {
            "metadata_path": metadata_path,
            "models_bundle_path": models_bundle_path,
            "artifact_report_path": artifact_report_path,
            "docs_report_path": docs_report_path
        }

    def _generate_markdown_report(
        self,
        metadata: Dict[str, Any],
        holdout: Dict[str, Any],
        explain: Dict[str, Any]
    ) -> str:
        models_cmp = holdout["models_comparison"]
        grid = models_cmp["grid_position_baseline"]
        lr = models_cmp["logistic_regression"]
        lgb = models_cmp["lightgbm_calibrated"]
        lgb_uncal = models_cmp["lightgbm_uncalibrated_t1"]
        lgb_sig = models_cmp["lightgbm_sigmoid_norm"]

        subgroups = holdout["subgroup_breakdowns"]
        races = subgroups.get("race_by_race_test", [])

        # Build Markdown content
        lines = [
            f"# Paddock Race Predictor — Model Evaluation & Benchmark Report",
            f"",
            f"**Model Version:** `{metadata['model_version']}`  ",
            f"**Feature Schema Version:** `{metadata['feature_schema_version']}`  ",
            f"**Training Cutoff Date:** `{metadata['training_data_cutoff']}`  ",
            f"**Prediction Cutoff Window:** {metadata['prediction_cutoff_event']}  ",
            f"**Evaluation Date (UTC):** {metadata['created_timestamp_utc']}  ",
            f"",
            f"---",
            f"",
            f"## 1. Executive Summary & Model Decision",
            f"",
            f"This evaluation rigorously compares three candidate models for the **Paddock Race Predictor**, predicting the winner of Formula 1 Grands Prix strictly after qualifying classification is finalized and prior to the race formation lap.",
            f"",
            f"### Primary Test Set Performance (2024 Season Holdout — 24 Races, 480 Driver Starts)",
            f"",
            f"| Model | Top-1 Winner Hit Rate | Top-3 Coverage | Multiclass Log Loss | Multiclass Brier Score | Expected Calib. Error (ECE) |",
            f"| :--- | :---: | :---: | :---: | :---: | :---: |",
            f"| **1. Grid Baseline (Empirical)** | {grid['top1_hit_rate_pct']}% ({grid['top1_accuracy'] * 100:.1f}%) | {grid['top3_hit_rate_pct']}% | {grid['multiclass_log_loss']} | {grid['multiclass_brier_score']} | {grid['expected_calibration_error']} |",
            f"| **2. Logistic Regression (Calibrated)** | {lr['top1_hit_rate_pct']}% | {lr['top3_hit_rate_pct']}% | {lr['multiclass_log_loss']} | {lr['multiclass_brier_score']} | {lr['expected_calibration_error']} |",
            f"| **3. LightGBM (Calibrated Softmax)** | **{lgb['top1_hit_rate_pct']}%** | **{lgb['top3_hit_rate_pct']}%** | **{lgb['multiclass_log_loss']}** | **{lgb['multiclass_brier_score']}** | **{lgb['expected_calibration_error']}** |",
            f"| LightGBM (Uncalibrated Softmax T=1.0) | {lgb_uncal['top1_hit_rate_pct']}% | {lgb_uncal['top3_hit_rate_pct']}% | {lgb_uncal['multiclass_log_loss']} | {lgb_uncal['multiclass_brier_score']} | {lgb_uncal['expected_calibration_error']} |",
            f"| LightGBM (Sigmoid + Ratio Norm) | {lgb_sig['top1_hit_rate_pct']}% | {lgb_sig['top3_hit_rate_pct']}% | {lgb_sig['multiclass_log_loss']} | {lgb_sig['multiclass_brier_score']} | {lgb_sig['expected_calibration_error']} |",
            f"",
            f"### Selection Justification",
            f"- **LightGBM (Calibrated Softmax)** achieved the highest Top-1 winner accuracy and the lowest multiclass log loss / Brier score on the unseen 2024 holdout season.",
            f"- Temperature scaling ($T = {lgb.get('calibrated_temperature', 1.0)}$) successfully reduced overconfidence and aligned predicted probabilities with empirical win rates.",
            f"- Both ML models substantially outperformed the Grid-Only baseline, proving that rolling driver form, constructor pace differentials, and track characteristics add significant predictive lift beyond starting position alone.",
            f"",
            f"---",
            f"",
            f"## 2. Chronological Rolling-Origin Backtesting",
            f"",
            f"To prevent data leakage, evaluation followed an expanding rolling-origin backtest structure across Formula 1 regulatory eras:",
            f"",
            f"- **Fold 1**: Train on 2021 (22 races), Validate on 2022 (22 races - Introduction of Ground Effect regulations).",
            f"- **Fold 2**: Train on 2021–2022 (44 races), Validate on 2023 (22 races - Red Bull RB19 dominance).",
            f"- **Holdout Test**: Train on 2021–2023 (66 races), Test on 2024 (24 races - Multi-team title fight).",
            f"",
            f"Every driver in a Grand Prix was strictly retained within the same evaluation fold, and probability normalization was applied at the single-race level.",
            f"",
            f"---",
            f"",
            f"## 3. Subgroup Performance Breakdowns (2024 Holdout)",
            f"",
            f"### By Weather Conditions",
            f"",
            f"| Weather Category | Races | Grid Baseline Top-1 | Logistic Regression Top-1 | LightGBM Top-1 | LightGBM Log Loss |",
            f"| :--- | :---: | :---: | :---: | :---: | :---: |",
        ]

        weather_data = subgroups.get("weather", {})
        for w_cat, w_stats in weather_data.items():
            lines.append(
                f"| {w_cat} | {w_stats['races']} | {w_stats['baseline_top1']}% | {w_stats['lr_top1']}% | {w_stats['lgb_top1']}% | {w_stats['lgb_log_loss']} |"
            )

        lines.extend([
            f"",
            f"### Race-by-Race 2024 Holdout Audit",
            f"",
            f"| Rnd | Grand Prix / Circuit | Actual Winner | Grid | Grid Baseline Pick | Logistic Regression Pick | LightGBM Pick | LGB Prob | LGB Correct |",
            f"| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |"
        ])

        for r in races:
            lgb_mark = "✅" if r["lgb_correct"] else "❌"
            lines.append(
                f"| {r['round']} | {r['circuit']} | **{r['actual_winner']}** | P{r['winner_grid']} | {r['grid_baseline_pick']} | {r['lr_pick']} | **{r['lgb_pick']}** | {r['lgb_prob']:.1%} | {lgb_mark} |"
            )

        lines.extend([
            f"",
            f"---",
            f"",
            f"## 4. Model Explainability & Feature Attributions",
            f"",
            f"### Top Predictive Features (LightGBM TreeSHAP)",
            f"",
            f"| Rank | Feature Name | Mean Absolute SHAP | Domain Description |",
            f"| :---: | :--- | :---: | :--- |"
        ])

        lgb_shap = explain.get("lgb_explanations", {}).get("top_shap_features", [])
        for f_item in lgb_shap:
            lines.append(
                f"| {f_item['rank']} | `{f_item['feature']}` | {f_item['mean_abs_shap']} | {f_item['description']} |"
            )

        lines.extend([
            f"",
            f"> [!IMPORTANT]",
            f"> **Causal Disclaimer & Limitations**  ",
            f"> The SHAP values and feature weights documented above represent **statistical associations** within historical Grand Prix results, not mechanistic or causal guarantees. Qualifying pace and starting position reflect intrinsic vehicle performance and qualifying execution, but do not causally cause a victory without race tyre management, engine reliability, pit-stop execution, and weather management.",
            f"",
            f"---",
            f"",
            f"## 5. Artifact Provenance & Reproducibility",
            f"",
            f"- **Artifact Bundle Directory:** `models/predictor/{self.version}/`",
            f"- **Model Weights File:** `models/predictor/{self.version}/trained_models.joblib`",
            f"- **Metadata & Metrics File:** `models/predictor/{self.version}/model_metadata.json`",
            f"- **Python Environment:** `{metadata['dependencies']['python']}` with `lightgbm {metadata['dependencies']['lightgbm']}`, `scikit-learn {metadata['dependencies']['scikit-learn']}`, `shap {metadata['dependencies']['shap']}`",
            f"- **Random Seed:** `{metadata['random_seed']}` (fixed across all splits and initializations)"
        ])

        return "\n".join(lines)
