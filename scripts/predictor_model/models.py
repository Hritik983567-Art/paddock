import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional, Tuple
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import lightgbm as lgb

from .config import RANDOM_SEED
from .features import (
    ALL_MODEL_FEATURES,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    TARGET_COLUMN,
    build_linear_preprocessor,
    build_tree_preprocessor
)
from .normalizer import RaceProbabilityNormalizer, TemperatureCalibrator


class GridPositionBaseline:
    """
    Grid-position-only empirical baseline model.
    Learns the empirical historical win rate for each starting grid position from training data.
    Applies Laplace smoothing for rare/unseen grid positions and normalizes probabilities per race.
    """
    def __init__(self, smoothing: float = 1.0):
        self.smoothing = smoothing
        self.grid_win_rates: Dict[int, float] = {}
        self.overall_win_rate: float = 0.05  # 1/20 default

    def fit(self, train_df: pd.DataFrame, target_col: str = TARGET_COLUMN) -> "GridPositionBaseline":
        total_races = train_df["race_id"].nunique()
        if total_races == 0:
            return self

        # Calculate wins per grid position
        wins_by_grid = train_df.groupby("grid_position")[target_col].sum().to_dict()
        starts_by_grid = train_df.groupby("grid_position")[target_col].count().to_dict()

        self.overall_win_rate = 1.0 / max(1, train_df.groupby("race_id")["driver_id"].count().median())

        # Empirical Bayesian / Laplace smoothed win rates
        all_positions = range(1, 25)
        for pos in all_positions:
            w = wins_by_grid.get(pos, 0)
            n = starts_by_grid.get(pos, 0)
            # Smoothed probability
            p = (w + self.smoothing * self.overall_win_rate) / (n + self.smoothing)
            self.grid_win_rates[pos] = float(p)

        return self

    def predict_race_scores(self, race_df: pd.DataFrame) -> np.ndarray:
        """Returns log-odds of empirical win rate as scores."""
        scores = []
        for _, row in race_df.iterrows():
            grid = int(row.get("grid_position", 20))
            p = self.grid_win_rates.get(grid, 1e-4)
            p = np.clip(p, 1e-5, 0.999)
            score = np.log(p / (1.0 - p))
            scores.append(score)
        return np.array(scores, dtype=np.float64)

    def predict_race_probabilities(
        self,
        race_df: pd.DataFrame,
        temperature: float = 1.0,
        method: str = "ratio"
    ) -> np.ndarray:
        """
        Calculates empirical win probability per driver and normalizes across the race field.
        """
        raw_probs = []
        for _, row in race_df.iterrows():
            grid = int(row.get("grid_position", 20))
            p = self.grid_win_rates.get(grid, 1e-4)
            raw_probs.append(p)
        raw_probs = np.array(raw_probs, dtype=np.float64)

        if method == "softmax":
            scores = self.predict_race_scores(race_df)
            return RaceProbabilityNormalizer.softmax_normalize(scores, temperature=temperature)
        else:
            return RaceProbabilityNormalizer.ratio_normalize(raw_probs)

    def predict_df(
        self,
        df: pd.DataFrame,
        prob_col: str = "pred_prob_grid",
        temperature: float = 1.0,
        method: str = "ratio"
    ) -> pd.DataFrame:
        df_out = df.copy()
        df_out[prob_col] = 0.0

        for race_id, group in df_out.groupby("race_id"):
            race_probs = self.predict_race_probabilities(group, temperature=temperature, method=method)
            df_out.loc[group.index, prob_col] = race_probs

        return df_out


class LogisticRegressionPredictor:
    """
    Interpretable linear baseline model using scikit-learn pipeline with L2 regularization.
    Converts raw linear margins (logits) into race-level probabilities via calibrated softmax.
    """
    def __init__(self, C: float = 0.1, max_iter: int = 1000, random_state: int = RANDOM_SEED):
        self.C = C
        self.max_iter = max_iter
        self.random_state = random_state
        self.preprocessor = build_linear_preprocessor()
        self.model = LogisticRegression(
            C=self.C,
            max_iter=self.max_iter,
            random_state=self.random_state,
            class_weight="balanced",
            solver="lbfgs"
        )
        self.pipeline: Optional[Pipeline] = None
        self.temperature: float = 1.0

    def fit(self, train_df: pd.DataFrame, target_col: str = TARGET_COLUMN) -> "LogisticRegressionPredictor":
        X = train_df[ALL_MODEL_FEATURES]
        y = train_df[target_col].astype(int)

        self.pipeline = Pipeline([
            ('preprocessor', self.preprocessor),
            ('classifier', self.model)
        ])
        self.pipeline.fit(X, y)
        return self

    def calibrate_temperature(self, val_df: pd.DataFrame, target_col: str = TARGET_COLUMN) -> float:
        """Tunes softmax temperature on validation data."""
        val_copy = val_df.copy()
        scores = self.predict_scores(val_copy)
        val_copy["_raw_score"] = scores
        calibrator = TemperatureCalibrator(initial_temp=1.0)
        self.temperature = calibrator.fit(val_copy, score_col="_raw_score", target_col=target_col)
        return self.temperature

    def predict_scores(self, df: pd.DataFrame) -> np.ndarray:
        if self.pipeline is None:
            raise RuntimeError("LogisticRegressionPredictor must be fitted before predict.")
        X = df[ALL_MODEL_FEATURES]
        # decision_function gives distance to margin (log-odds score)
        return self.pipeline.decision_function(X)

    def predict_race_probabilities(
        self,
        race_df: pd.DataFrame,
        temperature: Optional[float] = None
    ) -> np.ndarray:
        t = temperature if temperature is not None else self.temperature
        scores = self.predict_scores(race_df)
        return RaceProbabilityNormalizer.softmax_normalize(scores, temperature=t)

    def predict_df(
        self,
        df: pd.DataFrame,
        prob_col: str = "pred_prob_lr",
        temperature: Optional[float] = None
    ) -> pd.DataFrame:
        df_out = df.copy()
        t = temperature if temperature is not None else self.temperature
        df_out[prob_col] = 0.0

        for race_id, group in df_out.groupby("race_id"):
            race_probs = self.predict_race_probabilities(group, temperature=t)
            df_out.loc[group.index, prob_col] = race_probs

        return df_out

    def get_feature_coefficients(self) -> pd.DataFrame:
        """Extracts learned feature weights and odds ratios."""
        if self.pipeline is None:
            raise RuntimeError("Model not fitted.")
        classifier: LogisticRegression = self.pipeline.named_steps['classifier']
        prep = self.pipeline.named_steps['preprocessor']

        # Get feature names after transformation
        feature_names = prep.get_feature_names_out()
        coefficients = classifier.coef_[0]

        df_coef = pd.DataFrame({
            "feature": feature_names,
            "coefficient": coefficients,
            "odds_ratio": np.exp(coefficients),
            "abs_impact": np.abs(coefficients)
        }).sort_values(by="abs_impact", ascending=False).reset_index(drop=True)
        return df_coef


class LightGBMPredictor:
    """
    LightGBM gradient boosting model as the primary candidate.
    Employs shallow trees, leaf regularization, and early stopping on validation sets
    to avoid overfitting on small F1 sample counts.
    """
    def __init__(
        self,
        n_estimators: int = 100,
        learning_rate: float = 0.03,
        num_leaves: int = 7,
        max_depth: int = 3,
        min_child_samples: int = 15,
        subsample: float = 0.8,
        colsample_bytree: float = 0.8,
        reg_alpha: float = 0.1,
        reg_lambda: float = 1.0,
        random_state: int = RANDOM_SEED
    ):
        self.params = {
            "objective": "binary",
            "metric": "binary_logloss",
            "boosting_type": "gbdt",
            "n_estimators": n_estimators,
            "learning_rate": learning_rate,
            "num_leaves": num_leaves,
            "max_depth": max_depth,
            "min_child_samples": min_child_samples,
            "subsample": subsample,
            "colsample_bytree": colsample_bytree,
            "reg_alpha": reg_alpha,
            "reg_lambda": reg_lambda,
            "random_state": random_state,
            "verbose": -1,
            "n_jobs": -1
        }
        self.preprocessor = build_tree_preprocessor()
        self.model = lgb.LGBMClassifier(**self.params)
        self.pipeline: Optional[Pipeline] = None
        self.temperature: float = 1.0

    def fit(self, train_df: pd.DataFrame, target_col: str = TARGET_COLUMN) -> "LightGBMPredictor":
        X = train_df[ALL_MODEL_FEATURES]
        y = train_df[target_col].astype(int)

        self.pipeline = Pipeline([
            ('preprocessor', self.preprocessor),
            ('classifier', self.model)
        ])
        self.pipeline.fit(X, y)
        return self

    def calibrate_temperature(self, val_df: pd.DataFrame, target_col: str = TARGET_COLUMN) -> float:
        """Tunes softmax temperature on validation data."""
        val_copy = val_df.copy()
        scores = self.predict_scores(val_copy)
        val_copy["_raw_score"] = scores
        calibrator = TemperatureCalibrator(initial_temp=1.0)
        self.temperature = calibrator.fit(val_copy, score_col="_raw_score", target_col=target_col)
        return self.temperature

    def predict_scores(self, df: pd.DataFrame) -> np.ndarray:
        """Predicts raw margin / logit scores prior to sigmoid."""
        if self.pipeline is None:
            raise RuntimeError("LightGBMPredictor must be fitted before predict.")
        X = df[ALL_MODEL_FEATURES]
        classifier: lgb.LGBMClassifier = self.pipeline.named_steps['classifier']
        prep = self.pipeline.named_steps['preprocessor']
        X_trans = prep.transform(X)
        # raw_score=True outputs the unconstrained margin (logits)
        raw_scores = classifier.predict(X_trans, raw_score=True)
        return raw_scores

    def predict_race_probabilities(
        self,
        race_df: pd.DataFrame,
        temperature: Optional[float] = None
    ) -> np.ndarray:
        t = temperature if temperature is not None else self.temperature
        scores = self.predict_scores(race_df)
        return RaceProbabilityNormalizer.softmax_normalize(scores, temperature=t)

    def predict_df(
        self,
        df: pd.DataFrame,
        prob_col: str = "pred_prob_lgb",
        temperature: Optional[float] = None
    ) -> pd.DataFrame:
        df_out = df.copy()
        t = temperature if temperature is not None else self.temperature
        df_out[prob_col] = 0.0

        for race_id, group in df_out.groupby("race_id"):
            race_probs = self.predict_race_probabilities(group, temperature=t)
            df_out.loc[group.index, prob_col] = race_probs

        return df_out

    def get_feature_importances(self) -> pd.DataFrame:
        """Returns split and gain feature importances."""
        if self.pipeline is None:
            raise RuntimeError("Model not fitted.")
        classifier: lgb.LGBMClassifier = self.pipeline.named_steps['classifier']
        prep = self.pipeline.named_steps['preprocessor']
        feature_names = prep.get_feature_names_out()

        split_imp = classifier.booster_.feature_importance(importance_type="split")
        gain_imp = classifier.booster_.feature_importance(importance_type="gain")

        df_imp = pd.DataFrame({
            "feature": feature_names,
            "split_importance": split_imp,
            "gain_importance": gain_imp
        }).sort_values(by="gain_importance", ascending=False).reset_index(drop=True)
        return df_imp
