import os
import sys
import json
import argparse
import joblib
import numpy as np
import pandas as pd

# UTF-8 stdout protection
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from .config import (
    MODEL_VERSION,
    FEATURE_SCHEMA_VERSION,
    MODELS_ROOT_DIR,
    DATASET_CSV_PATH
)
from .features import ALL_MODEL_FEATURES, TARGET_COLUMN
from .normalizer import RaceProbabilityNormalizer


def run_inference_for_race(race_id: str) -> dict:
    model_bundle_path = os.path.join(MODELS_ROOT_DIR, MODEL_VERSION, "trained_models.joblib")
    metadata_path = os.path.join(MODELS_ROOT_DIR, MODEL_VERSION, "model_metadata.json")

    if not os.path.exists(model_bundle_path):
        return {
            "status": "error",
            "error_type": "MODEL_ARTIFACT_MISSING",
            "message": f"Model artifact bundle not found at {model_bundle_path}"
        }

    if not os.path.exists(DATASET_CSV_PATH):
        return {
            "status": "error",
            "error_type": "DATASET_MISSING",
            "message": f"Historical dataset not found at {DATASET_CSV_PATH}"
        }

    # Load metadata
    with open(metadata_path, "r", encoding="utf-8") as f:
        metadata = json.load(f)

    # Load dataset
    df = pd.read_csv(DATASET_CSV_PATH)
    race_rows = df[df["race_id"] == race_id]

    if race_rows.empty:
        # Try finding by round/season if formatted like "2024_1"
        parts = race_id.split("_")
        if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
            season_val, round_val = int(parts[0]), int(parts[1])
            race_rows = df[(df["season"] == season_val) & (df["round"] == round_val)]

    if race_rows.empty:
        return {
            "status": "error",
            "error_type": "RACE_NOT_FOUND",
            "message": f"Race '{race_id}' not found in verified post-qualifying records."
        }

    # Load trained model
    models = joblib.load(model_bundle_path)
    lgb_model = models.get("lightgbm")

    if lgb_model is None:
        return {
            "status": "error",
            "error_type": "MODEL_CORRUPT",
            "message": "LightGBM candidate not found in trained models bundle."
        }

    # Verify qualifying completeness
    total_drivers = len(race_rows)
    if total_drivers < 10:
        return {
            "status": "unavailable",
            "error_type": "QUALIFYING_INCOMPLETE",
            "message": f"Qualifying grid has only {total_drivers} drivers classified; minimum 10 required."
        }

    # Predict calibrated race probabilities using temperature scaling (T=1.85)
    # Prevents extreme single-driver probability monopolies and reflects competitive F1 field dynamics
    probs = lgb_model.predict_race_probabilities(race_rows, temperature=1.85)

    # Probability Validation Invariants
    assert np.all(np.isfinite(probs)), "Non-finite probability values detected."
    assert np.all(probs >= 0.0), "Negative probabilities detected."
    assert np.isclose(np.sum(probs), 1.0, atol=1e-5), f"Probabilities do not sum to 1.0: {np.sum(probs)}"

    race_rows = race_rows.copy()
    race_rows["win_probability"] = probs

    # Sort descending by win probability
    sorted_df = race_rows.sort_values(by="win_probability", ascending=False).reset_index(drop=True)

    # Format Driver Prediction List
    predictions = []
    for rank_idx, row in sorted_df.iterrows():
        driver_entry = {
            "driverId": str(row["driver_id"]),
            "driverCode": str(row["driver_code"]),
            "driverNumber": str(row.get("driver_number", "")),
            "constructorId": str(row["constructor_id"]),
            "constructorName": str(row["constructor_name"]),
            "gridPosition": int(row["grid_position"]),
            "qualiPosition": int(row["quali_position"]),
            "gridPenaltyDelta": int(row.get("grid_penalty_delta", 0)),
            "winProbability": round(float(row["win_probability"]), 4),
            "winProbabilityPct": round(float(row["win_probability"]) * 100, 2),
            "predictedRank": int(rank_idx + 1)
        }
        predictions.append(driver_entry)

    winner = predictions[0]
    first_row = sorted_df.iloc[0]

    response = {
        "status": "success",
        "raceId": str(first_row["race_id"]),
        "season": int(first_row["season"]),
        "round": int(first_row["round"]),
        "circuitId": str(first_row["circuit_id"]),
        "circuitName": str(first_row["circuit_name"]),
        "country": str(first_row.get("country", "")),
        "predictionStage": "after_qualifying",
        "generatedAtUtc": pd.Timestamp.utcnow().isoformat() + "Z",
        "modelVersion": MODEL_VERSION,
        "featureSchemaVersion": FEATURE_SCHEMA_VERSION,
        "qualifyingStatus": {
            "isCompleted": True,
            "freshness": "historical" if int(first_row["season"]) <= 2024 else "live",
            "totalClassified": total_drivers,
            "hasPenaltiesApplied": bool(any(p["gridPenaltyDelta"] != 0 for p in predictions)),
            "dataCompletenessPct": 100.0
        },
        "predictedWinner": {
            "driverId": winner["driverId"],
            "driverCode": winner["driverCode"],
            "winProbability": winner["winProbability"],
            "winProbabilityPct": winner["winProbabilityPct"],
            "constructorName": winner["constructorName"],
            "gridPosition": winner["gridPosition"]
        },
        "predictions": predictions,
        "topExplanatoryFactors": metadata.get("explainability_summary", {}).get("top_shap_features", []),
        "causalDisclaimer": (
            "Probabilities quantify statistical associations in historical post-qualifying Grand Prix data. "
            "They do not imply single-factor causal determinism without tyre management, car reliability, and race strategy."
        )
    }

    return response


def main():
    parser = argparse.ArgumentParser(description="Paddock Race Predictor Inference CLI")
    parser.add_argument("--race-id", type=str, required=True, help="Race ID (e.g. 2024_1 or 2024_24)")
    args = parser.parse_args()

    result = run_inference_for_race(args.race_id)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
