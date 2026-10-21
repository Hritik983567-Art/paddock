import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple

class RaceEvaluationMetrics:
    """
    Computes race-level evaluation metrics for F1 Grand Prix winner predictions.
    Enforces that predictions are evaluated as complete race fields.
    """

    @staticmethod
    def evaluate_predictions(
        df: pd.DataFrame,
        prob_col: str = "predicted_prob",
        target_col: str = "won_race",
        race_id_col: str = "race_id"
    ) -> Dict[str, Any]:
        """
        Evaluates a DataFrame containing predictions across multiple races.
        Returns dictionary with top-1 accuracy, top-3 accuracy, log loss, Brier score, ECE,
        and calibration curve data.
        """
        if df.empty:
            return {
                "races_evaluated": 0,
                "top1_accuracy": 0.0,
                "top3_accuracy": 0.0,
                "log_loss": 0.0,
                "brier_score": 0.0,
                "ece": 0.0
            }

        total_races = 0
        top1_hits = 0
        top3_hits = 0
        total_log_loss = 0.0
        total_brier_sum = 0.0

        all_probs: List[float] = []
        all_labels: List[int] = []

        for _, race_group in df.groupby(race_id_col):
            probs = race_group[prob_col].values.astype(np.float64)
            labels = race_group[target_col].values.astype(int)

            if len(labels) == 0 or np.sum(labels) == 0:
                continue

            total_races += 1
            win_idx = int(np.argmax(labels))

            # 1. Top-1 Hit
            pred_top1_idx = int(np.argmax(probs))
            if pred_top1_idx == win_idx:
                top1_hits += 1

            # 2. Top-3 Hit
            top3_indices = np.argsort(probs)[-3:]
            if win_idx in top3_indices:
                top3_hits += 1

            # 3. Multiclass Log Loss (NLL for winner)
            p_win = max(1e-15, float(probs[win_idx]))
            total_log_loss += -np.log(p_win)

            # 4. Multiclass Brier Score for race
            brier_race = float(np.sum((probs - labels) ** 2))
            total_brier_sum += brier_race

            all_probs.extend(probs.tolist())
            all_labels.extend(labels.tolist())

        if total_races == 0:
            return {"error": "No valid races found with an official winner."}

        top1_acc = round(top1_hits / total_races, 4)
        top3_acc = round(top3_hits / total_races, 4)
        avg_log_loss = round(total_log_loss / total_races, 4)
        avg_brier = round(total_brier_sum / total_races, 4)

        # 5. Expected Calibration Error (ECE) & Reliability Curve
        ece, cal_curve = RaceEvaluationMetrics.compute_ece(np.array(all_probs), np.array(all_labels), n_bins=10)

        return {
            "races_evaluated": total_races,
            "total_driver_records": len(df),
            "top1_accuracy": top1_acc,
            "top1_hit_rate_pct": round(top1_acc * 100, 2),
            "top3_accuracy": top3_acc,
            "top3_hit_rate_pct": round(top3_acc * 100, 2),
            "multiclass_log_loss": avg_log_loss,
            "multiclass_brier_score": avg_brier,
            "expected_calibration_error": round(ece, 4),
            "calibration_curve": cal_curve
        }

    @staticmethod
    def compute_ece(probs: np.ndarray, labels: np.ndarray, n_bins: int = 10) -> Tuple[float, List[Dict[str, Any]]]:
        """
        Computes Expected Calibration Error and binned reliability table.
        """
        bin_edges = np.linspace(0.0, 1.0, n_bins + 1)
        ece = 0.0
        n_total = len(probs)
        curve = []

        for i in range(n_bins):
            b_min, b_max = bin_edges[i], bin_edges[i + 1]
            if i == n_bins - 1:
                mask = (probs >= b_min) & (probs <= b_max)
            else:
                mask = (probs >= b_min) & (probs < b_max)

            bin_count = int(np.sum(mask))
            if bin_count > 0:
                bin_acc = float(np.mean(labels[mask]))
                bin_conf = float(np.mean(probs[mask]))
                ece += (bin_count / n_total) * abs(bin_acc - bin_conf)
                curve.append({
                    "bin_range": f"[{b_min:.1f}, {b_max:.1f}]",
                    "count": bin_count,
                    "avg_confidence": round(bin_conf, 3),
                    "empirical_win_rate": round(bin_acc, 3),
                    "abs_gap": round(abs(bin_acc - bin_conf), 3)
                })
            else:
                curve.append({
                    "bin_range": f"[{b_min:.1f}, {b_max:.1f}]",
                    "count": 0,
                    "avg_confidence": None,
                    "empirical_win_rate": None,
                    "abs_gap": 0.0
                })

        return float(ece), curve
