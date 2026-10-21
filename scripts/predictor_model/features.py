from typing import List, Tuple
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

# Continuous and discrete numerical features
NUMERICAL_FEATURES: List[str] = [
    # Grid & Qualifying
    "grid_position",
    "quali_position",
    "grid_penalty_delta",
    "quali_time_delta_to_pole",
    "quali_time_ratio_to_pole",
    "reached_q3",
    "front_row",
    # Driver Rolling Form
    "driver_prev_race_position",
    "driver_prev_race_points",
    "driver_rolling_3_avg_finish",
    "driver_rolling_5_avg_finish",
    "driver_rolling_5_win_rate",
    "driver_rolling_5_podium_rate",
    "driver_rolling_5_pts_per_race",
    "driver_rolling_5_dnf_rate",
    "driver_rolling_10_avg_finish",
    "driver_rolling_10_win_rate",
    "driver_season_points_before_gp",
    "driver_season_standing_before_gp",
    # Constructor Rolling Form
    "constructor_prev_race_points",
    "constructor_rolling_3_avg_points",
    "constructor_rolling_5_win_rate",
    "constructor_rolling_5_podium_rate",
    "constructor_rolling_3_avg_grid",
    "constructor_season_points_before_gp",
    "constructor_season_standing_before_gp",
    "constructor_best_quali_delta_to_pole",
    # Teammate Dynamics
    "outqualified_teammate",
    "teammate_rolling_5_quali_h2h",
    # Circuit Demands & Heritage
    "driver_circuit_starts",
    "driver_circuit_wins",
    "driver_circuit_win_rate",
    "driver_circuit_podiums",
    "driver_circuit_avg_finish",
    "constructor_circuit_wins",
    "circuit_historical_pole_win_rate",
    # Context & Environmental
    "is_sprint_weekend",
    "quali_air_temp_c",
    "quali_track_temp_c",
    "quali_humidity_pct",
    "quali_rainfall",
]

CATEGORICAL_FEATURES: List[str] = [
    "regulation_era"
]

ALL_MODEL_FEATURES: List[str] = NUMERICAL_FEATURES + CATEGORICAL_FEATURES

TARGET_COLUMN: str = "won_race"

METADATA_COLUMNS: List[str] = [
    "race_id",
    "season",
    "round",
    "circuit_id",
    "circuit_name",
    "country",
    "race_date",
    "race_timestamp_utc",
    "driver_id",
    "driver_code",
    "driver_number",
    "constructor_id",
    "constructor_name",
    "data_provenance",
    "feature_timestamp_utc"
]

def build_linear_preprocessor() -> ColumnTransformer:
    """
    Builds a robust scikit-learn ColumnTransformer for linear models (Logistic Regression).
    Uses median imputation for numerical features and OneHotEncoding for categoricals.
    """
    num_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median', add_indicator=True)),
        ('scaler', StandardScaler())
    ])

    cat_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_pipeline, NUMERICAL_FEATURES),
            ('cat', cat_pipeline, CATEGORICAL_FEATURES)
        ],
        remainder='drop'
    )
    return preprocessor

def build_tree_preprocessor() -> ColumnTransformer:
    """
    Builds a ColumnTransformer for tree-based models (LightGBM).
    Preserves missing values natively or uses standard imputation for non-native inputs.
    """
    num_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median'))
    ])

    cat_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_pipeline, NUMERICAL_FEATURES),
            ('cat', cat_pipeline, CATEGORICAL_FEATURES)
        ],
        remainder='drop'
    )
    return preprocessor
