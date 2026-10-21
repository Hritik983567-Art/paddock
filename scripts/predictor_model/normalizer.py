import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from scipy.optimize import minimize

class RaceProbabilityNormalizer:
    """
    Converts raw model outputs (logits, margins, or scores) for drivers in a Grand Prix
    into a valid probability distribution that strictly sums to 1.0 across the race field.
    """

    @staticmethod
    def softmax_normalize(scores: np.ndarray, temperature: float = 1.0) -> np.ndarray:
        """
        Numerically stable race-level softmax with temperature scaling.
        p_i = exp((s_i - max(s)) / T) / sum(exp((s_j - max(s)) / T))
        """
        scores = np.asarray(scores, dtype=np.float64)
        if len(scores) == 0:
            return np.array([])
        t = max(1e-4, float(temperature))
        shifted = (scores - np.max(scores)) / t
        exp_scores = np.exp(shifted)
        total = np.sum(exp_scores)
        if total <= 0 or not np.isfinite(total):
            return np.full_like(scores, 1.0 / len(scores))
        return exp_scores / total

    @staticmethod
    def ratio_normalize(scores: np.ndarray) -> np.ndarray:
        """
        Linear/proportional normalization. Shifts scores to non-negative range and normalizes.
        """
        scores = np.asarray(scores, dtype=np.float64)
        if len(scores) == 0:
            return np.array([])
        min_s = np.min(scores)
        shifted = scores - min_s if min_s < 0 else scores
        shifted = np.maximum(shifted, 1e-6)
        total = np.sum(shifted)
        if total <= 0:
            return np.full_like(scores, 1.0 / len(scores))
        return shifted / total

    @staticmethod
    def sigmoid_normalize(scores: np.ndarray) -> np.ndarray:
        """
        Sigmoid probability mapping followed by race field normalization.
        """
        scores = np.asarray(scores, dtype=np.float64)
        if len(scores) == 0:
            return np.array([])
        sig = 1.0 / (1.0 + np.exp(-np.clip(scores, -30.0, 30.0)))
        total = np.sum(sig)
        if total <= 0:
            return np.full_like(scores, 1.0 / len(scores))
        return sig / total

class TemperatureCalibrator:
    """
    Fits an optimal global temperature parameter T to calibrate race-level softmax logits
    by minimizing multiclass cross-entropy loss across validation races.
    """
    def __init__(self, initial_temp: float = 1.0):
        self.temperature = initial_temp

    def fit(self, val_df: pd.DataFrame, score_col: str, target_col: str = "won_race") -> float:
        """
        Optimizes temperature T using L-BFGS-B on race-level log-loss.
        val_df must contain ['race_id', score_col, target_col].
        """
        races = []
        for _, group in val_df.groupby("race_id"):
            scores = group[score_col].values.astype(np.float64)
            labels = group[target_col].values.astype(np.float64)
            if np.sum(labels) == 1:
                races.append((scores, labels))

        if not races:
            return self.temperature

        def loss_fn(t_arr):
            t = float(t_arr[0])
            total_loss = 0.0
            for scores, labels in races:
                probs = RaceProbabilityNormalizer.softmax_normalize(scores, temperature=t)
                win_idx = np.argmax(labels)
                p_win = max(1e-15, float(probs[win_idx]))
                total_loss -= np.log(p_win)
            return total_loss / len(races)

        res = minimize(loss_fn, [self.temperature], bounds=[(0.05, 10.0)], method="L-BFGS-B")
        if res.success:
            self.temperature = float(res.x[0])
        return self.temperature
