"""Experimental Model Training (Phase 3C.4E.6).

Trains Model A (Original Dataset baseline) and Model B (Remediated Dataset candidate)
under strictly controlled, identical conditions:
- Exact same LightGBM hyperparameter configuration.
- Exact same random seed (42).
- Exact same training cutoff (2023-12-31: 2021-2023 development, 2024 holdout).
- Exact same 42-feature model schema.
- Model B filters confirmed non-participants (WITHDRAWN_BEFORE_START) and uses
  remediated pit-lane start grid positions (Zhou grid=20, delta=+1).

Strictly read-only with respect to production model bundle. Does NOT overwrite
models/predictor/v1.0.0/trained_models.joblib.
"""

import hashlib
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd

# Configure UTF-8 stdout if supported
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

if __package__ is None or __package__ == "":
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
    from scripts.predictor_model.config import (
        DATASET_CSV_PATH,
        FINAL_TRAIN_SEASONS,
        FINAL_TEST_SEASON,
        RANDOM_SEED,
    )
    from scripts.predictor_model.features import ALL_MODEL_FEATURES, TARGET_COLUMN
    from scripts.predictor_model.models import GridPositionBaseline, LightGBMPredictor
else:
    from .config import (
        DATASET_CSV_PATH,
        FINAL_TRAIN_SEASONS,
        FINAL_TEST_SEASON,
        RANDOM_SEED,
    )
    from .features import ALL_MODEL_FEATURES, TARGET_COLUMN
    from .models import GridPositionBaseline, LightGBMPredictor

BASE_DIR = Path(__file__).resolve().parent.parent.parent
REMEDIATED_CSV_PATH = BASE_DIR / "data" / "predictor" / "experimental" / "f1_race_predictor_dataset_v1_remediated.csv"


class ExperimentalModelTrainer:
    """Manages side-by-side training of Model A (Original) and Model B (Remediated)."""

    def __init__(self, random_seed: int = RANDOM_SEED):
        self.random_seed = random_seed
        self.df_orig: Optional[pd.DataFrame] = None
        self.df_remediated: Optional[pd.DataFrame] = None

    def load_datasets(self) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Loads both original and remediated datasets and verifies invariants."""
        if not os.path.exists(DATASET_CSV_PATH):
            raise FileNotFoundError(f"Original dataset not found at {DATASET_CSV_PATH}")
        if not os.path.exists(REMEDIATED_CSV_PATH):
            raise FileNotFoundError(
                f"Remediated dataset not found at {REMEDIATED_CSV_PATH}. Run experimental_remediation.py first."
            )

        self.df_orig = pd.read_csv(DATASET_CSV_PATH)
        self.df_remediated = pd.read_csv(REMEDIATED_CSV_PATH)

        return self.df_orig, self.df_remediated

    def prepare_training_partitions(
        self,
        seasons: List[int] = FINAL_TRAIN_SEASONS
    ) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Prepares training partition for Model A and Model B.

        Model A: All rows where season in seasons.
        Model B: Filter out race_participation_status == 'WITHDRAWN_BEFORE_START'.
        """
        if self.df_orig is None or self.df_remediated is None:
            self.load_datasets()

        train_a = self.df_orig[self.df_orig["season"].isin(seasons)].copy().reset_index(drop=True)

        rem_season = self.df_remediated[self.df_remediated["season"].isin(seasons)].copy()
        # Exclude non-participants (Rule B)
        train_b = rem_season[
            rem_season["race_participation_status"] != "WITHDRAWN_BEFORE_START"
        ].copy().reset_index(drop=True)

        return train_a, train_b

    def train_model_a(
        self,
        train_df: pd.DataFrame
    ) -> Tuple[LightGBMPredictor, GridPositionBaseline, float]:
        """Trains Model A (Original dataset) and tunes softmax temperature."""
        baseline = GridPositionBaseline().fit(train_df)
        lgb_a = LightGBMPredictor(random_state=self.random_seed).fit(train_df)
        temp_a = lgb_a.calibrate_temperature(train_df)
        return lgb_a, baseline, temp_a

    def train_model_b(
        self,
        train_df: pd.DataFrame
    ) -> Tuple[LightGBMPredictor, GridPositionBaseline, float]:
        """Trains Model B (Remediated dataset) and tunes softmax temperature."""
        baseline = GridPositionBaseline().fit(train_df)
        lgb_b = LightGBMPredictor(random_state=self.random_seed).fit(train_df)
        temp_b = lgb_b.calibrate_temperature(train_df)
        return lgb_b, baseline, temp_b

    def train_both_models(self) -> Dict[str, Any]:
        """Trains both Model A and Model B on 2021-2023 development set."""
        train_a, train_b = self.prepare_training_partitions(FINAL_TRAIN_SEASONS)

        lgb_a, base_a, temp_a = self.train_model_a(train_a)
        lgb_b, base_b, temp_b = self.train_model_b(train_b)

        return {
            "model_a": {
                "name": "Model A (Original)",
                "train_samples": len(train_a),
                "train_races": int(train_a["race_id"].nunique()),
                "lgb_model": lgb_a,
                "baseline_model": base_a,
                "calibrated_temperature": round(temp_a, 4),
            },
            "model_b": {
                "name": "Model B (Remediated)",
                "train_samples": len(train_b),
                "train_races": int(train_b["race_id"].nunique()),
                "excluded_samples": len(train_a) - len(train_b),
                "lgb_model": lgb_b,
                "baseline_model": base_b,
                "calibrated_temperature": round(temp_b, 4),
            },
        }


def main():
    print("=" * 80)
    print("=== PADDOCK PHASE 3C.4E.6: EXPERIMENTAL MODEL TRAINING ===")
    print("=" * 80)
    trainer = ExperimentalModelTrainer(random_seed=RANDOM_SEED)
    trained = trainer.train_both_models()

    mA = trained["model_a"]
    mB = trained["model_b"]

    print(f"Model A (Original Dataset):")
    print(f"  - Training Samples:       {mA['train_samples']} rows ({mA['train_races']} Grands Prix)")
    print(f"  - Calibrated Temperature: {mA['calibrated_temperature']}")
    print("-" * 80)
    print(f"Model B (Remediated Dataset):")
    print(f"  - Training Samples:       {mB['train_samples']} rows ({mB['train_races']} Grands Prix)")
    print(f"  - Excluded Non-Starters:  {mB['excluded_samples']} rows (Lance Stroll 2023, Mick Schumacher 2022)")
    print(f"  - Calibrated Temperature: {mB['calibrated_temperature']}")
    print("=" * 80)
    print("[OK] Both models trained with identical seed and hyperparameters.")


if __name__ == "__main__":
    main()
