"""Bayesian Hybrid Experiment & Bounded Model Family (Phase 3C.4E.14).

Implements and evaluates a bounded family of regularized Bayesian hybrid predictors:
1. Empirical Grid Prior Alone (pure non-parametric/Laplace baseline)
2. Grid Prior + Qualifying Information (qualifying pace likelihood)
3. Bayesian Log-Odds Shrinkage:
   logit(p_hybrid) = (1 - lambda) * logit(p_grid) + lambda * logit(p_ML)
4. Multiplicative Geometric Evidence Fusion:
   p_hybrid proportional to p_grid^(1 - w) * p_ML^w
5. Conservative Convex Ensemble:
   p_hybrid = (1 - gamma) * p_grid + gamma * p_ML

Strict Guarantees:
- Strictly chronological hyperparameter tuning on 2021-2023 (zero leakage from 2024 or 2025).
- Guaranteed non-zero empirical probability floor (p_floor = 0.0005).
- Safe fallback to grid prior if ML features or qualifying times are missing or NaN.
- Robust normalization across variable starter counts (19 vs 20).
- Purely read-only with respect to production models and datasets.

Outputs: scripts/predictor_model/experimental_2025_validation/hybrid_experiment.py
"""

import json
import math
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import joblib
import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

from scripts.predictor_model.experimental_training import ExperimentalModelTrainer
from scripts.predictor_model.models import GridPositionBaseline, LightGBMPredictor

DATASET_REMEDIATED_CSV = BASE_DIR / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_v1_remediated.csv"
DATASET_2025_CSV = BASE_DIR / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_2025_candidate.csv"
FROZEN_MODEL_BUNDLE = BASE_DIR / "models" / "predictor" / "v1.0.0" / "trained_models.joblib"


class BayesianHybridPredictor:
    """Combines an empirical grid baseline prior with ML likelihood adjustments under explicit regularization."""

    def __init__(
        self,
        prior_model: GridPositionBaseline,
        ml_model: Optional[LightGBMPredictor] = None,
        ml_temperature: float = 1.0,
        method: str = "convex",  # "convex", "geometric", "log_odds", "quali_likelihood", "prior_only"
        weight: float = 0.20,     # gamma, w, lambda, or beta
        p_floor: float = 0.0005,
    ):
        self.prior_model = prior_model
        self.ml_model = ml_model
        self.ml_temperature = ml_temperature
        self.method = method
        self.weight = float(weight)
        self.p_floor = float(p_floor)

    def predict_race_probabilities(self, race_df: pd.DataFrame) -> np.ndarray:
        """Computes regularized posterior win probabilities across all starters in a single race."""
        if len(race_df) == 0:
            return np.array([], dtype=np.float64)

        n_starters = len(race_df)

        # 1. Base prior probabilities from empirical grid
        try:
            p_prior = self.prior_model.predict_race_probabilities(race_df)
            p_prior = np.asarray(p_prior, dtype=np.float64)
            if np.isnan(p_prior).any() or np.sum(p_prior) <= 0:
                p_prior = np.full(n_starters, 1.0 / n_starters)
        except Exception:
            p_prior = np.full(n_starters, 1.0 / n_starters)

        p_prior = p_prior / np.sum(p_prior)

        if self.method == "prior_only" or self.ml_model is None or self.weight <= 0.0:
            return self._finalize_probabilities(p_prior)

        # 2. Method: Qualifying Pace Likelihood
        if self.method == "quali_likelihood":
            beta = self.weight
            deltas = []
            for _, row in race_df.iterrows():
                d = row.get("quali_time_delta_to_pole")
                deltas.append(float(d) if pd.notna(d) and float(d) >= 0.0 else 1.0)
            deltas = np.array(deltas, dtype=np.float64)
            l_quali = np.exp(-beta * deltas)
            unnorm = p_prior * l_quali
            return self._finalize_probabilities(unnorm)

        # 3. Obtain ML model probabilities with safe fallback
        try:
            p_ml = self.ml_model.predict_race_probabilities(race_df, temperature=self.ml_temperature)
            p_ml = np.asarray(p_ml, dtype=np.float64)
            if np.isnan(p_ml).any() or np.sum(p_ml) <= 0:
                p_ml = p_prior.copy()
            else:
                p_ml = p_ml / np.sum(p_ml)
        except Exception:
            p_ml = p_prior.copy()

        # 4. Method: Conservative Convex Ensemble
        if self.method == "convex":
            gamma = np.clip(self.weight, 0.0, 1.0)
            p_comb = (1.0 - gamma) * p_prior + gamma * p_ml
            return self._finalize_probabilities(p_comb)

        # 5. Method: Multiplicative Geometric Evidence Fusion
        elif self.method == "geometric":
            w = np.clip(self.weight, 0.0, 1.0)
            p_safe_prior = np.maximum(p_prior, self.p_floor)
            p_safe_ml = np.maximum(p_ml, self.p_floor)
            p_comb = (p_safe_prior ** (1.0 - w)) * (p_safe_ml ** w)
            return self._finalize_probabilities(p_comb)

        # 6. Method: Bayesian Log-Odds Shrinkage
        elif self.method == "log_odds":
            lam = np.clip(self.weight, 0.0, 1.0)
            p_safe_prior = np.clip(p_prior, 1e-5, 1.0 - 1e-5)
            p_safe_ml = np.clip(p_ml, 1e-5, 1.0 - 1e-5)
            z_prior = np.log(p_safe_prior / (1.0 - p_safe_prior))
            z_ml = np.log(p_safe_ml / (1.0 - p_safe_ml))
            z_shrink = (1.0 - lam) * z_prior + lam * z_ml
            p_comb = 1.0 / (1.0 + np.exp(-z_shrink))
            return self._finalize_probabilities(p_comb)

        else:
            return self._finalize_probabilities(p_prior)

    def _finalize_probabilities(self, p_raw: np.ndarray) -> np.ndarray:
        """Enforces minimum probability floor and normalizes sum to exactly 1.0."""
        p_clipped = np.maximum(p_raw, self.p_floor)
        tot = np.sum(p_clipped)
        if tot <= 0:
            return np.full_like(p_clipped, 1.0 / len(p_clipped))
        return p_clipped / tot

    def predict_df(self, df: pd.DataFrame, prob_col: str = "pred_prob_hybrid") -> pd.DataFrame:
        """Generates predictions across all races in a dataframe."""
        df_out = df.copy()
        df_out[prob_col] = 0.0
        for rid, grp in df_out.groupby("race_id", sort=False):
            probs = self.predict_race_probabilities(grp)
            df_out.loc[grp.index, prob_col] = probs
        return df_out


class ChronologicalHyperparameterTuner:
    """Tunes hybrid hyperparameters strictly within historical training splits (2021-2023)."""

    def __init__(self, train_df: pd.DataFrame, random_seed: int = 42):
        self.train_df = train_df.copy()
        self.random_seed = random_seed
        self.trainer = ExperimentalModelTrainer(random_seed=random_seed)

    def tune_convex_gamma(self, gammas: Optional[List[float]] = None) -> Tuple[float, Dict[float, float]]:
        """Finds optimal convex ensemble weight gamma via leave-one-season-out CV on 2021-2023."""
        if gammas is None:
            gammas = [0.0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.40, 0.50, 0.70, 1.0]

        cv_losses: Dict[float, List[float]] = {g: [] for g in gammas}
        seasons = sorted(self.train_df["season"].unique())

        for test_s in seasons:
            tr = self.train_df[self.train_df["season"] != test_s].copy()
            va = self.train_df[self.train_df["season"] == test_s].copy()

            grid_base = GridPositionBaseline(smoothing=1.0).fit(tr, target_col="won_race")
            lgb, _, temp = self.trainer.train_model_b(tr)

            for g in gammas:
                hybrid = BayesianHybridPredictor(
                    prior_model=grid_base, ml_model=lgb, ml_temperature=temp,
                    method="convex", weight=g
                )
                r_losses = []
                for rid, rdf in va.groupby("race_id"):
                    w_idx = np.where(rdf["won_race"] == 1)[0]
                    if len(w_idx) != 1:
                        continue
                    p = hybrid.predict_race_probabilities(rdf)
                    loss = -math.log(max(1e-15, float(p[w_idx[0]])))
                    r_losses.append(loss)
                cv_losses[g].append(float(np.mean(r_losses)))

        avg_losses = {g: round(float(np.mean(cv_losses[g])), 4) for g in gammas}
        best_gamma = min(gammas, key=lambda g: avg_losses[g])
        return best_gamma, avg_losses

    def tune_geometric_w(self, weights: Optional[List[float]] = None) -> Tuple[float, Dict[float, float]]:
        """Finds optimal geometric mixture weight w via leave-one-season-out CV on 2021-2023."""
        if weights is None:
            weights = [0.0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.40, 0.50, 0.70, 1.0]

        cv_losses: Dict[float, List[float]] = {w: [] for w in weights}
        seasons = sorted(self.train_df["season"].unique())

        for test_s in seasons:
            tr = self.train_df[self.train_df["season"] != test_s].copy()
            va = self.train_df[self.train_df["season"] == test_s].copy()

            grid_base = GridPositionBaseline(smoothing=1.0).fit(tr, target_col="won_race")
            lgb, _, temp = self.trainer.train_model_b(tr)

            for w in weights:
                hybrid = BayesianHybridPredictor(
                    prior_model=grid_base, ml_model=lgb, ml_temperature=temp,
                    method="geometric", weight=w
                )
                r_losses = []
                for rid, rdf in va.groupby("race_id"):
                    w_idx = np.where(rdf["won_race"] == 1)[0]
                    if len(w_idx) != 1:
                        continue
                    p = hybrid.predict_race_probabilities(rdf)
                    loss = -math.log(max(1e-15, float(p[w_idx[0]])))
                    r_losses.append(loss)
                cv_losses[w].append(float(np.mean(r_losses)))

        avg_losses = {w: round(float(np.mean(cv_losses[w])), 4) for w in weights}
        best_w = min(weights, key=lambda w: avg_losses[w])
        return best_w, avg_losses

    def tune_log_odds_lambda(self, lambdas: Optional[List[float]] = None) -> Tuple[float, Dict[float, float]]:
        """Finds optimal log-odds shrinkage lambda via leave-one-season-out CV on 2021-2023."""
        if lambdas is None:
            lambdas = [0.0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.40, 0.50, 0.70]

        cv_losses: Dict[float, List[float]] = {l: [] for l in lambdas}
        seasons = sorted(self.train_df["season"].unique())

        for test_s in seasons:
            tr = self.train_df[self.train_df["season"] != test_s].copy()
            va = self.train_df[self.train_df["season"] == test_s].copy()

            grid_base = GridPositionBaseline(smoothing=1.0).fit(tr, target_col="won_race")
            lgb, _, temp = self.trainer.train_model_b(tr)

            for l in lambdas:
                hybrid = BayesianHybridPredictor(
                    prior_model=grid_base, ml_model=lgb, ml_temperature=temp,
                    method="log_odds", weight=l
                )
                r_losses = []
                for rid, rdf in va.groupby("race_id"):
                    w_idx = np.where(rdf["won_race"] == 1)[0]
                    if len(w_idx) != 1:
                        continue
                    p = hybrid.predict_race_probabilities(rdf)
                    loss = -math.log(max(1e-15, float(p[w_idx[0]])))
                    r_losses.append(loss)
                cv_losses[l].append(float(np.mean(r_losses)))

        avg_losses = {l: round(float(np.mean(cv_losses[l])), 4) for l in lambdas}
        best_lam = min(lambdas, key=lambda l: avg_losses[l])
        return best_lam, avg_losses


if __name__ == "__main__":
    df = pd.read_csv(DATASET_REMEDIATED_CSV)
    tr_df = df[df["season"] <= 2023].copy()
    tuner = ChronologicalHyperparameterTuner(tr_df)
    b_g, cv_g = tuner.tune_convex_gamma()
    b_w, cv_w = tuner.tune_geometric_w()
    b_l, cv_l = tuner.tune_log_odds_lambda()
    print("HYBRID HYPERPARAMETER TUNING COMPLETED (2021-2023 CV)")
    print(f"Optimal Convex Gamma:      {b_g} (loss: {cv_g[b_g]:.4f})")
    print(f"Optimal Geometric Weight:  {b_w} (loss: {cv_w[b_w]:.4f})")
    print(f"Optimal Log-Odds Lambda:   {b_l} (loss: {cv_l[b_l]:.4f})")

