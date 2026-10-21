import pytest
import numpy as np
import pandas as pd
import os
import joblib

from scripts.predictor_model.config import (
    MODEL_VERSION,
    MODELS_ROOT_DIR,
    RANDOM_SEED
)
from scripts.predictor_model.features import (
    ALL_MODEL_FEATURES,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    TARGET_COLUMN
)
from scripts.predictor_model.models import (
    GridPositionBaseline,
    LogisticRegressionPredictor,
    LightGBMPredictor
)
from scripts.predictor_model.normalizer import (
    RaceProbabilityNormalizer,
    TemperatureCalibrator
)
from scripts.predictor_model.metrics import RaceEvaluationMetrics


@pytest.fixture
def sample_training_data():
    """Generates synthetic minimal multi-race training data."""
    rows = []
    np.random.seed(42)
    for r_idx in range(5):
        race_id = f"2023_{r_idx+1}"
        for d_idx in range(20):
            grid = d_idx + 1
            won = 1 if grid == 1 else 0
            row = {
                "race_id": race_id,
                "season": 2023,
                "round": r_idx + 1,
                "driver_id": f"driver_{d_idx}",
                "driver_code": f"D{d_idx:02d}",
                "grid_position": grid,
                "quali_position": grid,
                "grid_penalty_delta": 0,
                "quali_time_delta_to_pole": float(grid * 0.1),
                "quali_time_ratio_to_pole": 1.0 + (grid * 0.002),
                "reached_q3": 1 if grid <= 10 else 0,
                "front_row": 1 if grid <= 2 else 0,
                "driver_prev_race_position": grid,
                "driver_prev_race_points": 25 if grid == 1 else 0,
                "driver_rolling_3_avg_finish": float(grid),
                "driver_rolling_5_avg_finish": float(grid),
                "driver_rolling_5_win_rate": 0.8 if grid == 1 else 0.0,
                "driver_rolling_5_podium_rate": 1.0 if grid <= 3 else 0.0,
                "driver_rolling_5_pts_per_race": 25.0 if grid == 1 else 0.0,
                "driver_rolling_5_dnf_rate": 0.0,
                "driver_rolling_10_avg_finish": float(grid),
                "driver_rolling_10_win_rate": 0.8 if grid == 1 else 0.0,
                "driver_season_points_before_gp": 100 if grid == 1 else 10,
                "driver_season_standing_before_gp": grid,
                "constructor_prev_race_points": 25 if grid <= 2 else 0,
                "constructor_rolling_3_avg_points": 25.0 if grid <= 2 else 0,
                "constructor_rolling_5_win_rate": 0.8 if grid <= 2 else 0.0,
                "constructor_rolling_5_podium_rate": 1.0 if grid <= 2 else 0.0,
                "constructor_rolling_3_avg_grid": float(grid),
                "constructor_season_points_before_gp": 200 if grid <= 2 else 20,
                "constructor_season_standing_before_gp": 1 if grid <= 2 else 5,
                "constructor_best_quali_delta_to_pole": 0.0 if grid <= 2 else 0.5,
                "outqualified_teammate": 1 if d_idx % 2 == 0 else 0,
                "teammate_rolling_5_quali_h2h": 4.0 if d_idx % 2 == 0 else 1.0,
                "driver_circuit_starts": 5,
                "driver_circuit_wins": 2 if grid == 1 else 0,
                "driver_circuit_win_rate": 0.4 if grid == 1 else 0.0,
                "driver_circuit_podiums": 4 if grid <= 3 else 0,
                "driver_circuit_avg_finish": float(grid),
                "constructor_circuit_wins": 5 if grid <= 2 else 0,
                "circuit_historical_pole_win_rate": 0.6,
                "is_sprint_weekend": 0,
                "quali_air_temp_c": 25.0,
                "quali_track_temp_c": 35.0,
                "quali_humidity_pct": 50.0,
                "quali_rainfall": 0,
                "regulation_era": "ground_effect_2022_2025",
                TARGET_COLUMN: won
            }
            rows.append(row)
    return pd.DataFrame(rows)


def test_probability_normalization_sum_to_one():
    """Verify that all normalizers return probabilities summing to exactly 1.0."""
    scores = np.array([2.5, 1.2, 0.4, -0.5, -1.8, -3.0])

    p_softmax = RaceProbabilityNormalizer.softmax_normalize(scores, temperature=1.0)
    assert np.isclose(np.sum(p_softmax), 1.0, atol=1e-6)
    assert np.all(p_softmax >= 0.0)

    p_ratio = RaceProbabilityNormalizer.ratio_normalize(scores)
    assert np.isclose(np.sum(p_ratio), 1.0, atol=1e-6)
    assert np.all(p_ratio >= 0.0)

    p_sigmoid = RaceProbabilityNormalizer.sigmoid_normalize(scores)
    assert np.isclose(np.sum(p_sigmoid), 1.0, atol=1e-6)
    assert np.all(p_sigmoid >= 0.0)


def test_temperature_calibration_scaling():
    """Higher temperature should smooth probabilities, lower temperature should sharpen."""
    scores = np.array([5.0, 2.0, 0.0, -2.0])
    p_sharp = RaceProbabilityNormalizer.softmax_normalize(scores, temperature=0.5)
    p_smooth = RaceProbabilityNormalizer.softmax_normalize(scores, temperature=3.0)

    assert p_sharp[0] > p_smooth[0]
    assert np.isclose(np.sum(p_sharp), 1.0, atol=1e-6)
    assert np.isclose(np.sum(p_smooth), 1.0, atol=1e-6)


def test_models_handle_small_race_fields(sample_training_data):
    """Verify models handle reduced grid size (e.g. 12 cars instead of 20)."""
    # Fit models on sample data
    grid_base = GridPositionBaseline().fit(sample_training_data)
    lr = LogisticRegressionPredictor(random_state=RANDOM_SEED).fit(sample_training_data)
    lgb = LightGBMPredictor(random_state=RANDOM_SEED).fit(sample_training_data)

    small_field = sample_training_data[sample_training_data["race_id"] == "2023_1"].iloc[:12].copy()
    assert len(small_field) == 12

    p_base = grid_base.predict_race_probabilities(small_field)
    assert len(p_base) == 12
    assert np.isclose(np.sum(p_base), 1.0, atol=1e-6)

    p_lr = lr.predict_race_probabilities(small_field)
    assert len(p_lr) == 12
    assert np.isclose(np.sum(p_lr), 1.0, atol=1e-6)

    p_lgb = lgb.predict_race_probabilities(small_field)
    assert len(p_lgb) == 12
    assert np.isclose(np.sum(p_lgb), 1.0, atol=1e-6)


def test_models_handle_missing_features(sample_training_data):
    """Verify pipeline handles NaN in features gracefully using imputation."""
    lr = LogisticRegressionPredictor(random_state=RANDOM_SEED).fit(sample_training_data)
    lgb = LightGBMPredictor(random_state=RANDOM_SEED).fit(sample_training_data)

    test_field = sample_training_data[sample_training_data["race_id"] == "2023_1"].copy()
    # Inject missing values
    test_field.loc[test_field.index[0], "driver_circuit_avg_finish"] = np.nan
    test_field.loc[test_field.index[1], "quali_air_temp_c"] = np.nan
    test_field.loc[test_field.index[2], "constructor_rolling_5_win_rate"] = np.nan

    p_lr = lr.predict_race_probabilities(test_field)
    assert len(p_lr) == len(test_field)
    assert np.isclose(np.sum(p_lr), 1.0, atol=1e-6)
    assert not np.isnan(p_lr).any()

    p_lgb = lgb.predict_race_probabilities(test_field)
    assert len(p_lgb) == len(test_field)
    assert np.isclose(np.sum(p_lgb), 1.0, atol=1e-6)
    assert not np.isnan(p_lgb).any()


def test_models_handle_unseen_drivers_and_teams(sample_training_data):
    """Verify models make valid predictions for completely unseen rookie drivers and new teams."""
    lgb = LightGBMPredictor(random_state=RANDOM_SEED).fit(sample_training_data)

    test_field = sample_training_data[sample_training_data["race_id"] == "2023_1"].copy()
    test_field.loc[test_field.index[0], "driver_id"] = "rookie_antonelli"
    test_field.loc[test_field.index[0], "driver_code"] = "ANT"
    test_field.loc[test_field.index[0], "driver_circuit_starts"] = 0
    test_field.loc[test_field.index[0], "driver_circuit_wins"] = 0
    test_field.loc[test_field.index[0], "driver_circuit_avg_finish"] = np.nan

    p_lgb = lgb.predict_race_probabilities(test_field)
    assert len(p_lgb) == len(test_field)
    assert np.isclose(np.sum(p_lgb), 1.0, atol=1e-6)
    assert p_lgb[0] > 0.0


def test_race_evaluation_metrics():
    """Verify accuracy, log loss, and Brier score computations on test field."""
    df_pred = pd.DataFrame({
        "race_id": ["R1", "R1", "R2", "R2"],
        "driver_id": ["D1", "D2", "D3", "D4"],
        "predicted_prob": [0.8, 0.2, 0.4, 0.6],
        "won_race": [1, 0, 0, 1]
    })

    metrics = RaceEvaluationMetrics.evaluate_predictions(df_pred)
    assert metrics["races_evaluated"] == 2
    assert metrics["top1_accuracy"] == 1.0
    assert metrics["top3_accuracy"] == 1.0
    assert metrics["multiclass_log_loss"] > 0.0
    assert metrics["multiclass_brier_score"] > 0.0
