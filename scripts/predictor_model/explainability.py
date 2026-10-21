import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
import shap

from .features import ALL_MODEL_FEATURES, TARGET_COLUMN
from .models import LightGBMPredictor, LogisticRegressionPredictor


class ModelExplainabilityManager:
    """
    Computes global feature importances, SHAP values, and local race attributions.
    Enforces clear distinctions between statistical associations and causal mechanisms.
    """

    @staticmethod
    def compute_lightgbm_explanations(
        lgb_predictor: LightGBMPredictor,
        background_df: pd.DataFrame,
        explain_df: Optional[pd.DataFrame] = None,
        max_samples: int = 300
    ) -> Dict[str, Any]:
        """
        Extracts LightGBM gain/split importance and calculates global TreeSHAP values.
        """
        if lgb_predictor.pipeline is None:
            raise RuntimeError("LightGBMPredictor must be fitted before computing explanations.")

        classifier = lgb_predictor.pipeline.named_steps['classifier']
        preprocessor = lgb_predictor.pipeline.named_steps['preprocessor']
        feature_names = list(preprocessor.get_feature_names_out())

        # 1. Standard Tree Feature Importance (Split & Gain)
        df_imp = lgb_predictor.get_feature_importances()

        # 2. SHAP TreeExplainer
        X_bg = background_df[ALL_MODEL_FEATURES]
        X_bg_trans = preprocessor.transform(X_bg)

        # Subsample background if needed for fast computation
        if len(X_bg_trans) > max_samples:
            idx = np.random.RandomState(42).choice(len(X_bg_trans), max_samples, replace=False)
            X_eval = X_bg_trans[idx]
            eval_source_df = background_df.iloc[idx]
        else:
            X_eval = X_bg_trans
            eval_source_df = background_df

        explainer = shap.TreeExplainer(classifier.booster_)
        shap_values = explainer.shap_values(X_eval)

        # For binary classification, shap_values might be a list [class 0, class 1] or an array for class 1
        if isinstance(shap_values, list) and len(shap_values) == 2:
            shap_matrix = shap_values[1]
        else:
            shap_matrix = shap_values

        mean_abs_shap = np.mean(np.abs(shap_matrix), axis=0)

        shap_df = pd.DataFrame({
            "feature": feature_names,
            "mean_abs_shap": mean_abs_shap
        }).sort_values(by="mean_abs_shap", ascending=False).reset_index(drop=True)

        # Format Top 15 Features
        top_features = []
        for i, row in shap_df.head(15).iterrows():
            clean_name = row["feature"].replace("num__", "").replace("cat__", "")
            top_features.append({
                "rank": i + 1,
                "feature": clean_name,
                "mean_abs_shap": round(float(row["mean_abs_shap"]), 4),
                "description": ModelExplainabilityManager._get_feature_description(clean_name)
            })

        return {
            "top_shap_features": top_features,
            "feature_importance_table": df_imp.head(15).to_dict(orient="records"),
            "causal_disclaimer": (
                "IMPORTANT CAUSAL DISCLAIMER: The SHAP attributions and feature weights reflect "
                "pure statistical associations in historical post-qualifying Grand Prix data. They do NOT "
                "represent causal mechanisms. For instance, high 'quali_time_ratio_to_pole' and low 'grid_position' "
                "are predictive signals of car pace and starting track position, but do not imply that starting position "
                "alone is the sole mechanical cause of victory without underlying tyre management, race strategy, and reliability."
            )
        }

    @staticmethod
    def compute_logistic_regression_explanations(lr_predictor: LogisticRegressionPredictor) -> Dict[str, Any]:
        """
        Extracts standardized regression weights and odds ratios from Logistic Regression.
        """
        df_coef = lr_predictor.get_feature_coefficients()
        top_positive = df_coef[df_coef["coefficient"] > 0].head(10)
        top_negative = df_coef[df_coef["coefficient"] < 0].tail(10)

        formatted_coefs = []
        for _, row in df_coef.head(15).iterrows():
            clean_name = row["feature"].replace("num__", "").replace("cat__", "")
            formatted_coefs.append({
                "feature": clean_name,
                "coefficient": round(float(row["coefficient"]), 4),
                "odds_ratio": round(float(row["odds_ratio"]), 4),
                "abs_impact": round(float(row["abs_impact"]), 4)
            })

        return {
            "top_coefficients": formatted_coefs,
            "interpretation_note": (
                "Standardized logistic regression coefficients quantify the change in log-odds of winning "
                "per 1 standard deviation increase in the standardized feature, holding all other features fixed."
            )
        }

    @staticmethod
    def _get_feature_description(feature_name: str) -> str:
        descriptions = {
            "grid_position": "Final official starting grid position after qualifying penalties",
            "quali_position": "Driver's ranking achieved in Q3/Q2/Q1 qualifying session",
            "quali_time_delta_to_pole": "Qualifying gap in seconds behind the pole position time",
            "quali_time_ratio_to_pole": "Normalized percentage ratio of lap time compared to pole lap",
            "front_row": "Binary indicator for starting in P1 or P2 on the front row",
            "constructor_season_points_before_gp": "Cumulative team championship points before this Grand Prix",
            "constructor_rolling_5_win_rate": "Constructor win rate across the preceding 5 completed Grands Prix",
            "driver_season_points_before_gp": "Cumulative driver championship points before this Grand Prix",
            "driver_rolling_3_avg_finish": "Driver average finishing position across past 3 races",
            "driver_rolling_5_pts_per_race": "Driver average points scored per race over past 5 events",
            "constructor_best_quali_delta_to_pole": "Fastest car pace for constructor relative to pole in qualifying",
            "circuit_historical_pole_win_rate": "Empirical pole position conversion rate at this specific circuit",
            "driver_circuit_wins": "Historical wins achieved by this driver at this circuit",
            "outqualified_teammate": "Binary flag indicating whether driver outperformed teammate in qualifying"
        }
        for k, v in descriptions.items():
            if k in feature_name:
                return v
        return "Statistical feature measuring historical performance or environmental condition."
