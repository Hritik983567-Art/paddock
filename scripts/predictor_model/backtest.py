import os
import json
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional, Tuple

from .config import (
    ROLLING_BACKTEST_FOLDS,
    FINAL_TRAIN_SEASONS,
    FINAL_TEST_SEASON,
    RANDOM_SEED
)
from .features import TARGET_COLUMN
from .models import GridPositionBaseline, LogisticRegressionPredictor, LightGBMPredictor
from .metrics import RaceEvaluationMetrics
from .normalizer import RaceProbabilityNormalizer


class RollingOriginBacktester:
    """
    Executes chronological rolling-origin backtesting across Formula 1 seasons.
    Ensures zero temporal leakage: models are only trained on past historical races
    and evaluated on strictly future, unseen races.
    """

    def __init__(self, dataset_df: pd.DataFrame):
        self.df = dataset_df.sort_values(by=["season", "round", "grid_position"]).reset_index(drop=True)

    def run_backtesting(self) -> Dict[str, Any]:
        """
        Runs the chronological rolling-origin evaluation across defined folds.
        Evaluates Grid Baseline, Logistic Regression, and LightGBM across:
        - Fold 1: Train 2021 -> Val 2022
        - Fold 2: Train 2021-2022 -> Val 2023
        """
        fold_results = []

        for fold_cfg in ROLLING_BACKTEST_FOLDS:
            fold_id = fold_cfg["fold_id"]
            train_seasons = fold_cfg["train_seasons"]
            val_season = fold_cfg["val_season"]

            train_df = self.df[self.df["season"].isin(train_seasons)].copy()
            val_df = self.df[self.df["season"] == val_season].copy()

            fold_summary = {
                "fold_id": fold_id,
                "train_seasons": train_seasons,
                "val_season": val_season,
                "train_races": int(train_df["race_id"].nunique()),
                "val_races": int(val_df["race_id"].nunique()),
                "train_samples": len(train_df),
                "val_samples": len(val_df),
                "models": {}
            }

            # 1. Grid Baseline
            baseline = GridPositionBaseline().fit(train_df)
            val_base_ratio = baseline.predict_df(val_df, prob_col="prob_base_ratio", method="ratio")
            val_base_softmax = baseline.predict_df(val_df, prob_col="prob_base_softmax", method="softmax")

            fold_summary["models"]["grid_baseline_ratio"] = RaceEvaluationMetrics.evaluate_predictions(
                val_base_ratio, prob_col="prob_base_ratio"
            )
            fold_summary["models"]["grid_baseline_softmax"] = RaceEvaluationMetrics.evaluate_predictions(
                val_base_softmax, prob_col="prob_base_softmax"
            )

            # 2. Logistic Regression
            lr = LogisticRegressionPredictor(random_state=RANDOM_SEED).fit(train_df)
            # Calibrate temperature on training data (or leave unscaled)
            t_lr = lr.calibrate_temperature(train_df)
            val_lr_calibrated = lr.predict_df(val_df, prob_col="prob_lr_calibrated", temperature=t_lr)
            val_lr_unscaled = lr.predict_df(val_df, prob_col="prob_lr_unscaled", temperature=1.0)

            fold_summary["models"]["logistic_regression_calibrated"] = {
                **RaceEvaluationMetrics.evaluate_predictions(val_lr_calibrated, prob_col="prob_lr_calibrated"),
                "optimal_temperature": round(t_lr, 3)
            }
            fold_summary["models"]["logistic_regression_unscaled"] = RaceEvaluationMetrics.evaluate_predictions(
                val_lr_unscaled, prob_col="prob_lr_unscaled"
            )

            # 3. LightGBM
            lgb = LightGBMPredictor(random_state=RANDOM_SEED).fit(train_df)
            t_lgb = lgb.calibrate_temperature(train_df)
            val_lgb_calibrated = lgb.predict_df(val_df, prob_col="prob_lgb_calibrated", temperature=t_lgb)
            val_lgb_unscaled = lgb.predict_df(val_df, prob_col="prob_lgb_unscaled", temperature=1.0)

            fold_summary["models"]["lightgbm_calibrated"] = {
                **RaceEvaluationMetrics.evaluate_predictions(val_lgb_calibrated, prob_col="prob_lgb_calibrated"),
                "optimal_temperature": round(t_lgb, 3)
            }
            fold_summary["models"]["lightgbm_unscaled"] = RaceEvaluationMetrics.evaluate_predictions(
                val_lgb_unscaled, prob_col="prob_lgb_unscaled"
            )

            fold_results.append(fold_summary)

        return {"folds": fold_results}

    def run_final_holdout_evaluation(self) -> Dict[str, Any]:
        """
        Trains models on 2021-2023 (90-race development set) and evaluates on
        the completely held-out 2024 season.
        Computes overall metrics and subgroup breakdowns.
        """
        train_df = self.df[self.df["season"].isin(FINAL_TRAIN_SEASONS)].copy()
        test_df = self.df[self.df["season"] == FINAL_TEST_SEASON].copy()

        train_races = int(train_df["race_id"].nunique())
        test_races = int(test_df["race_id"].nunique())

        # Fit all three candidates
        baseline = GridPositionBaseline().fit(train_df)
        lr = LogisticRegressionPredictor(random_state=RANDOM_SEED).fit(train_df)
        t_lr = lr.calibrate_temperature(train_df)

        lgb = LightGBMPredictor(random_state=RANDOM_SEED).fit(train_df)
        t_lgb = lgb.calibrate_temperature(train_df)

        # Generate test predictions
        test_eval_df = test_df.copy()
        test_eval_df = baseline.predict_df(test_eval_df, prob_col="prob_grid_baseline", method="ratio")
        test_eval_df = lr.predict_df(test_eval_df, prob_col="prob_logistic_regression", temperature=t_lr)
        test_eval_df = lgb.predict_df(test_eval_df, prob_col="prob_lightgbm", temperature=t_lgb)

        # Also evaluate normalization alternatives for LightGBM
        # 1. Softmax uncalibrated (T=1.0)
        test_eval_df = lgb.predict_df(test_eval_df, prob_col="prob_lgb_uncalibrated", temperature=1.0)
        # 2. Ratio normalizer on sigmoid outputs
        raw_lgb_scores = lgb.predict_scores(test_eval_df)
        test_eval_df["_lgb_raw"] = raw_lgb_scores
        test_eval_df["prob_lgb_sigmoid_norm"] = 0.0
        for _, group in test_eval_df.groupby("race_id"):
            test_eval_df.loc[group.index, "prob_lgb_sigmoid_norm"] = RaceProbabilityNormalizer.sigmoid_normalize(group["_lgb_raw"].values)

        # Overall Metrics
        metrics_baseline = RaceEvaluationMetrics.evaluate_predictions(test_eval_df, prob_col="prob_grid_baseline")
        metrics_lr = RaceEvaluationMetrics.evaluate_predictions(test_eval_df, prob_col="prob_logistic_regression")
        metrics_lgb = RaceEvaluationMetrics.evaluate_predictions(test_eval_df, prob_col="prob_lightgbm")
        metrics_lgb_uncal = RaceEvaluationMetrics.evaluate_predictions(test_eval_df, prob_col="prob_lgb_uncalibrated")
        metrics_lgb_sig = RaceEvaluationMetrics.evaluate_predictions(test_eval_df, prob_col="prob_lgb_sigmoid_norm")

        # Subgroup Analyses on Test Set (2024)
        subgroups = self._compute_subgroup_breakdowns(test_eval_df)

        return {
            "dataset_summary": {
                "train_seasons": FINAL_TRAIN_SEASONS,
                "test_season": FINAL_TEST_SEASON,
                "train_races": train_races,
                "test_races": test_races,
                "train_samples": len(train_df),
                "test_samples": len(test_df),
                "drivers_in_test": int(test_df["driver_id"].nunique()),
                "circuits_in_test": int(test_df["circuit_id"].nunique())
            },
            "models_comparison": {
                "grid_position_baseline": metrics_baseline,
                "logistic_regression": {
                    **metrics_lr,
                    "calibrated_temperature": round(t_lr, 3)
                },
                "lightgbm_calibrated": {
                    **metrics_lgb,
                    "calibrated_temperature": round(t_lgb, 3)
                },
                "lightgbm_uncalibrated_t1": metrics_lgb_uncal,
                "lightgbm_sigmoid_norm": metrics_lgb_sig
            },
            "subgroup_breakdowns": subgroups,
            "test_predictions_df": test_eval_df,
            "trained_models": {
                "baseline": baseline,
                "logistic_regression": lr,
                "lightgbm": lgb
            }
        }

    def _compute_subgroup_breakdowns(self, test_df: pd.DataFrame) -> Dict[str, Any]:
        """
        Break down test performance by:
        1. Circuit
        2. Regulation Era
        3. Weather condition (Dry vs Wet/Changing)
        4. Winner Starting Position (Pole vs Non-Pole win)
        """
        results = {}

        # 1. Weather Category (Wet if quali_rainfall > 0 or humidity > 85%, else Dry)
        test_df["weather_category"] = test_df.apply(
            lambda r: "Wet / Rain" if r.get("quali_rainfall", 0) > 0 else "Dry", axis=1
        )
        weather_breakdown = {}
        for w_cat, group in test_df.groupby("weather_category"):
            weather_breakdown[w_cat] = {
                "races": int(group["race_id"].nunique()),
                "baseline_top1": RaceEvaluationMetrics.evaluate_predictions(group, prob_col="prob_grid_baseline")["top1_hit_rate_pct"],
                "lr_top1": RaceEvaluationMetrics.evaluate_predictions(group, prob_col="prob_logistic_regression")["top1_hit_rate_pct"],
                "lgb_top1": RaceEvaluationMetrics.evaluate_predictions(group, prob_col="prob_lightgbm")["top1_hit_rate_pct"],
                "lgb_log_loss": RaceEvaluationMetrics.evaluate_predictions(group, prob_col="prob_lightgbm")["multiclass_log_loss"],
                "lgb_brier": RaceEvaluationMetrics.evaluate_predictions(group, prob_col="prob_lightgbm")["multiclass_brier_score"]
            }
        results["weather"] = weather_breakdown

        # 2. Regulation Era
        era_breakdown = {}
        for era, group in test_df.groupby("regulation_era"):
            era_breakdown[era] = {
                "races": int(group["race_id"].nunique()),
                "baseline_top1": RaceEvaluationMetrics.evaluate_predictions(group, prob_col="prob_grid_baseline")["top1_hit_rate_pct"],
                "lr_top1": RaceEvaluationMetrics.evaluate_predictions(group, prob_col="prob_logistic_regression")["top1_hit_rate_pct"],
                "lgb_top1": RaceEvaluationMetrics.evaluate_predictions(group, prob_col="prob_lightgbm")["top1_hit_rate_pct"]
            }
        results["regulation_era"] = era_breakdown

        # 3. Race-by-Race Test Performance Details
        race_breakdown = []
        for race_id, group in test_df.groupby("race_id"):
            winner_row = group[group[TARGET_COLUMN] == 1].iloc[0]
            winner_code = winner_row["driver_code"]
            winner_grid = int(winner_row["grid_position"])
            circuit_name = winner_row["circuit_name"]
            race_round = int(winner_row["round"])

            # Find top predicted driver for each model
            base_top = group.sort_values(by="prob_grid_baseline", ascending=False).iloc[0]
            lr_top = group.sort_values(by="prob_logistic_regression", ascending=False).iloc[0]
            lgb_top = group.sort_values(by="prob_lightgbm", ascending=False).iloc[0]

            race_breakdown.append({
                "round": race_round,
                "race_id": race_id,
                "circuit": circuit_name,
                "actual_winner": winner_code,
                "winner_grid": winner_grid,
                "grid_baseline_pick": base_top["driver_code"],
                "grid_baseline_prob": round(float(base_top["prob_grid_baseline"]), 3),
                "grid_baseline_correct": bool(base_top["driver_code"] == winner_code),
                "lr_pick": lr_top["driver_code"],
                "lr_prob": round(float(lr_top["prob_logistic_regression"]), 3),
                "lr_correct": bool(lr_top["driver_code"] == winner_code),
                "lgb_pick": lgb_top["driver_code"],
                "lgb_prob": round(float(lgb_top["prob_lightgbm"]), 3),
                "lgb_correct": bool(lgb_top["driver_code"] == winner_code)
            })

        results["race_by_race_test"] = sorted(race_breakdown, key=lambda x: x["round"])
        return results
