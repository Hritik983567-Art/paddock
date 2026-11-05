"""Chronological Replay & Multi-Season Holdout Audit (Phase 3C.4E.12).

Reconstructs strict walk-forward chronological evaluation across all three holdout seasons:
- Season 2022: Trained on 2021 (22 development races).
- Season 2023: Trained on 2021-2022 (44 development races).
- Season 2024: Trained on 2021-2023 (66 development races).

Enforces strict temporal invariants:
- Zero race boundary crossing: all drivers from a race are evaluated together.
- Training strictly precedes evaluation: zero future data leakage.
- No tuning on evaluation partitions.

Compares:
- Reciprocal Grid Baseline (1 / grid).
- Empirical Grid Baseline (Laplace smoothed on historical training partition).
- Grid + Validated Qualifying Baseline.
- Pace-Only Diagnostic Baseline.

Outputs: scripts/predictor_model/reports/phase_3c_4e_12/chronological_evaluation.json
"""

import json
import math
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from scripts.predictor_model.config import RANDOM_SEED
from scripts.predictor_model.features import TARGET_COLUMN
from scripts.predictor_model.experimental_baseline_comparison import SimpleReciprocalGridBaseline

REPORTS_DIR = BASE_DIR / "scripts" / "predictor_model" / "reports" / "phase_3c_4e_12"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)
REMEDIATED_CSV = BASE_DIR / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_v1_remediated.csv"


class ChronologicalReplayEngine:
    """Executes multi-season walk-forward chronological evaluations."""

    def __init__(self, random_seed: int = RANDOM_SEED):
        self.random_seed = random_seed
        self.df = pd.read_csv(REMEDIATED_CSV)
        self.clean_df = self.df[self.df["race_participation_status"] != "WITHDRAWN_BEFORE_START"].copy().reset_index(drop=True)

    def evaluate_season(
        self,
        train_seasons: List[int],
        eval_season: int
    ) -> Dict[str, Any]:
        """Evaluates a single chronological fold."""
        train_df = self.clean_df[self.clean_df["season"].isin(train_seasons)].copy().reset_index(drop=True)
        eval_df = self.clean_df[self.clean_df["season"] == eval_season].copy().reset_index(drop=True)

        n_train_races = train_df["race_id"].nunique()
        n_eval_races = eval_df["race_id"].nunique()

        # 1. Reciprocal Grid Baseline
        recip_base = SimpleReciprocalGridBaseline()
        eval_df = recip_base.predict_df(eval_df, prob_col="prob_recip")

        # 2. Empirical Grid Baseline (fitted strictly on train_df)
        w = train_df.groupby("grid_position")[TARGET_COLUMN].sum().to_dict()
        s = train_df.groupby("grid_position")[TARGET_COLUMN].count().to_dict()
        overall_rate = 1.0 / max(1, train_df.groupby("race_id")["driver_id"].count().median())

        grid_rates = {}
        for pos in range(1, 25):
            p = (w.get(pos, 0) + 1.0 * overall_rate) / (s.get(pos, 0) + 1.0)
            grid_rates[pos] = float(p)

        # 3. Grid + Qualifying Logistic Model
        def get_X_y(d: pd.DataFrame):
            X_list = []
            y_list = []
            for _, r in d.iterrows():
                g = max(1.0, float(r.get("grid_position", 20)))
                inv_g = 1.0 / g
                dt = r.get("quali_time_delta_to_pole")
                if pd.isna(dt) or dt is None or float(dt) < 0:
                    d_val = 3.0
                    has_t = 0.0
                else:
                    d_val = float(dt)
                    has_t = 1.0
                X_list.append([inv_g, d_val, has_t])
                if TARGET_COLUMN in r:
                    y_list.append(int(r[TARGET_COLUMN]))
            return np.array(X_list), np.array(y_list)

        X_tr, y_tr = get_X_y(train_df)
        clf_grid_quali = LogisticRegression(random_state=self.random_seed, max_iter=1000).fit(X_tr, y_tr)

        # 4. Pace-Only Diagnostic Model (Quali delta alone)
        def get_X_pace(d: pd.DataFrame):
            X_list = []
            y_list = []
            for _, r in d.iterrows():
                dt = r.get("quali_time_delta_to_pole")
                d_val = float(dt) if not pd.isna(dt) and dt is not None and float(dt) >= 0 else 3.0
                has_t = 0.0 if pd.isna(dt) or dt is None or float(dt) < 0 else 1.0
                X_list.append([d_val, has_t])
                if TARGET_COLUMN in r:
                    y_list.append(int(r[TARGET_COLUMN]))
            return np.array(X_list), np.array(y_list)

        X_tr_pace, y_tr_pace = get_X_pace(train_df)
        clf_pace_only = LogisticRegression(random_state=self.random_seed, max_iter=1000).fit(X_tr_pace, y_tr_pace)

        # Evaluate race-by-race
        losses_recip = []
        losses_empirical = []
        losses_grid_quali = []
        losses_pace_only = []

        top1_recip = 0
        top1_empirical = 0
        top1_grid_quali = 0
        top1_pace_only = 0

        for race_id, grp in eval_df.groupby("race_id"):
            labels = grp[TARGET_COLUMN].values.astype(int)
            win_idx = int(np.argmax(labels))

            # Reciprocal
            p_rec = grp["prob_recip"].values
            if int(np.argmax(p_rec)) == win_idx:
                top1_recip += 1
            losses_recip.append(-math.log(max(1e-15, float(p_rec[win_idx]))))

            # Empirical Grid
            raw_emp = np.array([grid_rates.get(int(r.get("grid_position", 20)), 1e-4) for _, r in grp.iterrows()])
            p_emp = raw_emp / np.sum(raw_emp)
            if int(np.argmax(p_emp)) == win_idx:
                top1_empirical += 1
            losses_empirical.append(-math.log(max(1e-15, float(p_emp[win_idx]))))

            # Grid + Quali
            X_eval_gq, _ = get_X_y(grp)
            scores_gq = clf_grid_quali.decision_function(X_eval_gq)
            exp_gq = np.exp(scores_gq - np.max(scores_gq))
            p_gq = exp_gq / np.sum(exp_gq)
            if int(np.argmax(p_gq)) == win_idx:
                top1_grid_quali += 1
            losses_grid_quali.append(-math.log(max(1e-15, float(p_gq[win_idx]))))

            # Pace Only
            X_eval_p, _ = get_X_pace(grp)
            scores_p = clf_pace_only.decision_function(X_eval_p)
            exp_p = np.exp(scores_p - np.max(scores_p))
            p_p = exp_p / np.sum(exp_p)
            if int(np.argmax(p_p)) == win_idx:
                top1_pace_only += 1
            losses_pace_only.append(-math.log(max(1e-15, float(p_p[win_idx]))))

        return {
            "eval_season": eval_season,
            "train_seasons": train_seasons,
            "train_races_count": n_train_races,
            "eval_races_count": n_eval_races,
            "metrics": {
                "reciprocal_grid": {
                    "log_loss": round(float(np.mean(losses_recip)), 4),
                    "top1_acc": round(top1_recip / n_eval_races, 4),
                },
                "empirical_grid": {
                    "log_loss": round(float(np.mean(losses_empirical)), 4),
                    "top1_acc": round(top1_empirical / n_eval_races, 4),
                },
                "grid_plus_qualifying": {
                    "log_loss": round(float(np.mean(losses_grid_quali)), 4),
                    "top1_acc": round(top1_grid_quali / n_eval_races, 4),
                },
                "pace_only_diagnostic": {
                    "log_loss": round(float(np.mean(losses_pace_only)), 4),
                    "top1_acc": round(top1_pace_only / n_eval_races, 4),
                },
            },
            "deltas_vs_reciprocal_grid": {
                "empirical_grid_delta": round(float(np.mean(losses_empirical)) - float(np.mean(losses_recip)), 4),
                "grid_plus_quali_delta": round(float(np.mean(losses_grid_quali)) - float(np.mean(losses_recip)), 4),
            },
            "deltas_vs_empirical_grid": {
                "grid_plus_quali_delta": round(float(np.mean(losses_grid_quali)) - float(np.mean(losses_empirical)), 4),
            },
        }

    def run_all_chronological_folds(self) -> Dict[str, Any]:
        """Runs chronological replay across 2022, 2023, and 2024."""
        fold_2022 = self.evaluate_season(train_seasons=[2021], eval_season=2022)
        fold_2023 = self.evaluate_season(train_seasons=[2021, 2022], eval_season=2023)
        fold_2024 = self.evaluate_season(train_seasons=[2021, 2022, 2023], eval_season=2024)

        report = {
            "metadata": {
                "audit_name": "Phase 3C.4E.12 Multi-Season Chronological Replay",
                "timestamp_utc": datetime.now(timezone.utc).isoformat(),
                "folds_evaluated": [2022, 2023, 2024],
            },
            "folds": {
                "season_2022_holdout": fold_2022,
                "season_2023_holdout": fold_2023,
                "season_2024_holdout": fold_2024,
            },
            "multi_season_summary_table": {
                "columns": ["Season", "Train_Races", "Eval_Races", "Recip_Grid_Loss", "Emp_Grid_Loss", "Grid_Plus_Quali_Loss", "Delta_vs_Empirical"],
                "rows": [
                    ["2022", fold_2022["train_races_count"], fold_2022["eval_races_count"], fold_2022["metrics"]["reciprocal_grid"]["log_loss"], fold_2022["metrics"]["empirical_grid"]["log_loss"], fold_2022["metrics"]["grid_plus_qualifying"]["log_loss"], fold_2022["deltas_vs_empirical_grid"]["grid_plus_quali_delta"]],
                    ["2023", fold_2023["train_races_count"], fold_2023["eval_races_count"], fold_2023["metrics"]["reciprocal_grid"]["log_loss"], fold_2023["metrics"]["empirical_grid"]["log_loss"], fold_2023["metrics"]["grid_plus_qualifying"]["log_loss"], fold_2023["deltas_vs_empirical_grid"]["grid_plus_quali_delta"]],
                    ["2024", fold_2024["train_races_count"], fold_2024["eval_races_count"], fold_2024["metrics"]["reciprocal_grid"]["log_loss"], fold_2024["metrics"]["empirical_grid"]["log_loss"], fold_2024["metrics"]["grid_plus_qualifying"]["log_loss"], fold_2024["deltas_vs_empirical_grid"]["grid_plus_quali_delta"]],
                ]
            },
            "era_specific_limitations": {
                "season_2022": "Ground-effect technical regulation overhaul. Ferrari/Red Bull duopoly. Red Bull won 17 of 22 races.",
                "season_2023": "Historical extreme dominance: Red Bull won 21 of 22 races (Verstappen 19 wins). Unprecedented pole/front-row win concentration.",
                "season_2024": "Multi-team competitive convergence (McLaren, Ferrari, Mercedes, Red Bull each winning >= 3 races). Lower pole win rate (45.8%), leading to slightly higher overall log loss across all models.",
            },
        }

        output_path = REPORTS_DIR / "chronological_evaluation.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)

        return report


if __name__ == "__main__":
    replay = ChronologicalReplayEngine()
    res = replay.run_all_chronological_folds()
    print(f"Chronological replay completed. Output written to {REPORTS_DIR / 'chronological_evaluation.json'}")
    for row in res["multi_season_summary_table"]["rows"]:
        print(f"Season {row[0]}: Recip={row[3]} | Emp={row[4]} | Grid+Quali={row[5]} | Delta_vs_Emp={row[6]:+.4f}")
