import os
from typing import Dict, Any, List

# Project Root Directories
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
SCRIPTS_DIR = os.path.dirname(MODEL_DIR)
PROJECT_ROOT = os.path.dirname(SCRIPTS_DIR)

DATASET_CSV_PATH = os.path.join(PROJECT_ROOT, 'data', 'predictor', 'f1_race_predictor_dataset.csv')
DATASET_PARQUET_PATH = os.path.join(PROJECT_ROOT, 'data', 'predictor', 'f1_race_predictor_dataset.parquet')
MODELS_ROOT_DIR = os.path.join(PROJECT_ROOT, 'models', 'predictor')
DOCS_DIR = os.path.join(PROJECT_ROOT, 'docs')

# Ensure output directories exist
os.makedirs(MODELS_ROOT_DIR, exist_ok=True)
os.makedirs(DOCS_DIR, exist_ok=True)

# Model Versioning & Cutoff
MODEL_VERSION = "v1.0.0"
FEATURE_SCHEMA_VERSION = "1.0.0"
RANDOM_SEED = 42

# Chronological Split Configurations
# 2021-2023: Training and rolling-origin backtesting
# 2024: Out-of-time holdout test championship
HOLDOUT_TEST_SEASON = 2024
TRAINING_CUTOFF_DATE = "2023-12-31"

# Rolling-origin evaluation folds (chronological expanding windows)
ROLLING_BACKTEST_FOLDS = [
    {
        "fold_id": 1,
        "train_seasons": [2021],
        "val_season": 2022,
        "description": "Train on 2021 (V6 Turbo Hybrid), Validate on 2022 (Ground Effect Intro)"
    },
    {
        "fold_id": 2,
        "train_seasons": [2021, 2022],
        "val_season": 2023,
        "description": "Train on 2021-2022, Validate on 2023 (Red Bull RB19 Dominance)"
    }
]

# Final Model Retraining Configuration
FINAL_TRAIN_SEASONS = [2021, 2022, 2023]
FINAL_TEST_SEASON = 2024
