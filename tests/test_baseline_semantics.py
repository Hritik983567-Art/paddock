"""
Executable Feature-Parity and Baseline Schema Tests for Paddock Predictor.

Phase: 3C.2A.5 (Schema v1.3.1 Finalization & Validator Hardening)
Verifies:
1. Baseline Schema v1.3.1 contract, validation, multi-session revision history, and fixture compliance.
2. Hardened semantic integrity: duplicate driver/round prevention, contradiction detection, point bounds.
3. The 15 synthetic feature-parity scenarios directly exercised against FeaturePipeline.
4. The fitted LightGBM artifact (trained_models.joblib) and ColumnTransformer imputation/encoding.
5. Exact feature ordering (42 features) and regression safety.
"""

import pytest
import numpy as np
import pandas as pd
import math
import os
import joblib
from unittest.mock import MagicMock
from typing import Dict, Any, List, Optional, Tuple

from scripts.predictor_pipeline.baseline_schema import (
    validate_baseline_schema,
    derive_model_dnf,
    normalize_model_finish_position,
    CURRENT_CONTRACT_VERSION,
    VALID_REGULATION_ERAS,
    VALID_PARTICIPATION_STATUSES
)
from scripts.predictor_pipeline.feature_pipeline import FeaturePipeline
from scripts.predictor_model.features import (
    ALL_MODEL_FEATURES,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES
)
from scripts.predictor_model.config import MODELS_ROOT_DIR, MODEL_VERSION


@pytest.fixture(scope="module")
def fitted_artifact():
    """Loads the frozen v1.0.0 LightGBM artifact."""
    artifact_path = os.path.join(MODELS_ROOT_DIR, MODEL_VERSION, "trained_models.joblib")
    assert os.path.exists(artifact_path), f"Model artifact not found at {artifact_path}"
    return joblib.load(artifact_path)


@pytest.fixture(scope="module")
def fitted_preprocessor(fitted_artifact):
    """Extracts the fitted ColumnTransformer from the LightGBM candidate."""
    return fitted_artifact["lightgbm"].preprocessor


def run_synthetic_pipeline_rounds(
    rounds_data: List[Dict[str, Any]],
    season: int = 2024
) -> Tuple[FeaturePipeline, List[Dict[str, Any]]]:
    """
    Helper to run the real FeaturePipeline over a synthetic multi-round season.
    Each item in rounds_data contains:
      - 'calendar': dict
      - 'quali': list of dicts
      - 'race': list of dicts
      - 'weather': optional dict
    """
    mock_jolpica = MagicMock()
    mock_fastf1 = MagicMock()

    calendar_list = [r["calendar"] for r in rounds_data]
    mock_jolpica.get_season_calendar.return_value = calendar_list

    def get_quali(s, rnd):
        for r in rounds_data:
            if int(r["calendar"]["round"]) == rnd:
                return r["quali"]
        return []

    def get_race(s, rnd):
        for r in rounds_data:
            if int(r["calendar"]["round"]) == rnd:
                return r["race"]
        return []

    def get_weather(s, rnd):
        for r in rounds_data:
            if int(r["calendar"]["round"]) == rnd:
                return r.get("weather", {
                    "quali_air_temp_c": None,
                    "quali_track_temp_c": None,
                    "quali_humidity_pct": None,
                    "quali_rainfall": None,
                    "fastf1_available": False
                })
        return {"fastf1_available": False}

    mock_jolpica.get_qualifying_results.side_effect = get_quali
    mock_jolpica.get_race_results.side_effect = get_race
    mock_fastf1.get_qualifying_weather.side_effect = get_weather

    pipeline = FeaturePipeline(mock_jolpica, mock_fastf1, enable_fastf1=True)
    generated_rows = pipeline._process_season(season, record_dataset=True)
    return pipeline, generated_rows


# =============================================================================
# PART 1: BASELINE SCHEMA v1.3.1 VALIDATION & HARDENING TESTS
# =============================================================================

@pytest.fixture
def base_valid_fixture() -> Dict[str, Any]:
    """Provides a valid Schema v1.3.1 template with active revisions and revision history."""
    return {
        "contract_version": "1.3.1",
        "generated_at_utc": "2026-10-31T20:50:00Z",
        "seasons": [
            {
                "season": 2025,
                "regulation_era": "ground_effect_gen2",
                "rounds": [
                    {
                        "round": 1,
                        "race_id": "2025_1_albert_park",
                        "circuit_id": "albert_park",
                        "circuit_name": "Albert Park Circuit",
                        "country": "Australia",
                        "race_date": "2025-03-16",
                        "is_sprint_weekend": False,
                        "sessions": {
                            "qualifying": {
                                "session_status": "completed",
                                "revision": 1,
                                "publication_timestamp_utc": "2025-03-15T06:00:00Z",
                                "provenance": "jolpica",
                                "pole_time_sec": 76.543,
                                "weather": {
                                    "air_temp_c": 22.5,
                                    "track_temp_c": 31.0,
                                    "humidity_pct": 60.0,
                                    "rainfall": 0.0,
                                    "provenance": "fastf1"
                                },
                                "results": [
                                    {
                                        "driver_id": "norris",
                                        "driver_code": "NOR",
                                        "driver_number": "4",
                                        "constructor_id": "mclaren",
                                        "raw_position": 1,
                                        "quali_position": 1,
                                        "q1_time_sec": 77.100,
                                        "q2_time_sec": 76.800,
                                        "q3_time_sec": 76.543,
                                        "best_time_sec": 76.543,
                                        "reached_q3": 1
                                    }
                                ]
                            },
                            "starting_grid": {
                                "is_official": True,
                                "revision": 2,
                                "publication_timestamp_utc": "2025-03-16T04:00:00Z",
                                "provenance": "fia_stewards",
                                "entries": [
                                    {
                                        "driver_id": "norris",
                                        "constructor_id": "mclaren",
                                        "raw_grid_position": 1,
                                        "grid_position": 1,
                                        "is_pit_lane_start": False,
                                        "grid_penalty_delta": 0,
                                        "penalty_reason": None
                                    }
                                ],
                                "revision_history": [
                                    {
                                        "revision": 1,
                                        "publication_timestamp_utc": "2025-03-15T18:00:00Z",
                                        "superseded_at_utc": "2025-03-16T04:00:00Z",
                                        "provenance": "timing_provisional",
                                        "change_reason": "Provisional post-qualifying grid",
                                        "entries": [
                                            {
                                                "driver_id": "norris",
                                                "constructor_id": "mclaren",
                                                "raw_grid_position": 1,
                                                "grid_position": 1,
                                                "is_pit_lane_start": False,
                                                "grid_penalty_delta": 0,
                                                "penalty_reason": None
                                            }
                                        ]
                                    }
                                ]
                            },
                            "grand_prix": {
                                "session_status": "completed",
                                "revision": 1,
                                "publication_timestamp_utc": "2025-03-16T08:00:00Z",
                                "provenance": "jolpica",
                                "results": [
                                    {
                                        "driver_id": "norris",
                                        "constructor_id": "mclaren",
                                        "raw_position": 1,
                                        "model_finish_position": 1,
                                        "gp_points": 25.0,
                                        "raw_status": "Finished",
                                        "official_participation_status": "started",
                                        "model_dnf": 0,
                                        "is_classified": True
                                    }
                                ]
                            }
                        }
                    }
                ]
            },
            {
                "season": 2026,
                "regulation_era": "active_aero_sustainable_fuel_gen3",
                "rounds": [
                    {
                        "round": 1,
                        "race_id": "2026_1_bahrain",
                        "circuit_id": "bahrain",
                        "circuit_name": "Bahrain International Circuit",
                        "country": "Bahrain",
                        "race_date": "2026-03-01",
                        "is_sprint_weekend": True,
                        "sessions": {
                            "qualifying": {
                                "session_status": "completed",
                                "revision": 1,
                                "publication_timestamp_utc": "2026-02-28T16:00:00Z",
                                "provenance": "jolpica",
                                "pole_time_sec": 89.123,
                                "results": [
                                    {
                                        "driver_id": "antonelli",
                                        "driver_code": "ANT",
                                        "driver_number": "12",
                                        "constructor_id": "mercedes",
                                        "raw_position": "NC",
                                        "quali_position": 20,
                                        "reached_q3": 0
                                    }
                                ]
                            },
                            "starting_grid": {
                                "is_official": True,
                                "revision": 1,
                                "publication_timestamp_utc": "2026-03-01T13:00:00Z",
                                "provenance": "fia_stewards",
                                "entries": [
                                    {
                                        "driver_id": "antonelli",
                                        "constructor_id": "mercedes",
                                        "raw_grid_position": "PL",
                                        "grid_position": 20,
                                        "is_pit_lane_start": True,
                                        "grid_penalty_delta": 0,
                                        "penalty_reason": "Parc Ferme setup changes"
                                    }
                                ]
                            },
                            "sprint_race": {
                                "session_status": "completed",
                                "revision": 1,
                                "publication_timestamp_utc": "2026-02-28T14:00:00Z",
                                "provenance": "jolpica",
                                "results": [
                                    {
                                        "driver_id": "antonelli",
                                        "constructor_id": "mercedes",
                                        "raw_position": 8,
                                        "finish_position": 8,
                                        "sprint_points": 1.0,
                                        "official_status": "Finished",
                                        "participation_status": "started",
                                        "is_classified": True
                                    }
                                ]
                            },
                            "grand_prix": {
                                "session_status": "completed",
                                "revision": 1,
                                "publication_timestamp_utc": "2026-03-01T17:00:00Z",
                                "provenance": "jolpica",
                                "results": [
                                    {
                                        "driver_id": "antonelli",
                                        "constructor_id": "mercedes",
                                        "raw_position": "R",
                                        "model_finish_position": 99,
                                        "gp_points": 0.0,
                                        "raw_status": "Collision",
                                        "official_participation_status": "dnf",
                                        "model_dnf": 1,
                                        "is_classified": False
                                    }
                                ]
                            }
                        }
                    }
                ]
            }
        ]
    }


def test_baseline_schema_valid_fixture(base_valid_fixture):
    """Validates that a comprehensive Schema v1.3.1 fixture passes validation without errors."""
    is_valid, errors = validate_baseline_schema(base_valid_fixture)
    assert is_valid, f"Expected valid fixture to pass, but got errors: {errors}"
    assert len(errors) == 0


def test_validator_duplicate_driver_prevention(base_valid_fixture):
    """Validates that duplicate driver IDs within any session are caught and rejected."""
    # Add duplicate driver to qualifying results
    q_results = base_valid_fixture["seasons"][0]["rounds"][0]["sessions"]["qualifying"]["results"]
    q_results.append(dict(q_results[0]))  # duplicate norris

    is_valid, errors = validate_baseline_schema(base_valid_fixture)
    assert not is_valid
    assert any("duplicate driver_id ('norris')" in e for e in errors)


def test_validator_duplicate_round_and_race_prevention(base_valid_fixture):
    """Validates that duplicate round numbers or duplicate race IDs within a season are rejected."""
    rounds = base_valid_fixture["seasons"][0]["rounds"]
    dup_round = dict(rounds[0])
    rounds.append(dup_round)

    is_valid, errors = validate_baseline_schema(base_valid_fixture)
    assert not is_valid
    assert any("duplicate round number (1)" in e for e in errors)
    assert any("duplicate race_id ('2025_1_albert_park')" in e for e in errors)


def test_validator_session_revision_ordering_and_timestamps(base_valid_fixture):
    """Validates revision history constraints: revision numbers and timestamps."""
    grid_sess = base_valid_fixture["seasons"][0]["rounds"][0]["sessions"]["starting_grid"]

    # 1. Superseded revision number >= active revision number (e.g. 2 >= 2)
    grid_sess["revision_history"][0]["revision"] = 2
    is_valid, errors = validate_baseline_schema(base_valid_fixture)
    assert not is_valid
    assert any("superseded revision (2) must be strictly less than active revision (2)" in e for e in errors)

    # 2. Superseded timestamp preceding publication timestamp
    grid_sess["revision_history"][0]["revision"] = 1
    grid_sess["revision_history"][0]["publication_timestamp_utc"] = "2025-03-16T12:00:00Z"
    grid_sess["revision_history"][0]["superseded_at_utc"] = "2025-03-15T12:00:00Z"  # Precedes publication!
    is_valid, errors = validate_baseline_schema(base_valid_fixture)
    assert not is_valid
    assert any("cannot precede 'publication_timestamp_utc'" in e for e in errors)


def test_validator_contradictory_dns_and_withdrawal_states(base_valid_fixture):
    """Validates that DNS or withdrawn drivers with points, classified status, or non-99 position fail validation."""
    gp_res = base_valid_fixture["seasons"][0]["rounds"][0]["sessions"]["grand_prix"]["results"][0]

    # Set participation status to 'dns' with points > 0
    gp_res["official_participation_status"] = "dns"
    gp_res["gp_points"] = 12.0
    gp_res["model_finish_position"] = 4
    gp_res["is_classified"] = True

    is_valid, errors = validate_baseline_schema(base_valid_fixture)
    assert not is_valid
    assert any("cannot have gp_points > 0" in e for e in errors)
    assert any("must have model_finish_position=99" in e for e in errors)
    assert any("must have is_classified=False" in e for e in errors)


def test_validator_dsq_and_classified_retirement_rules(base_valid_fixture):
    """Validates DSQ constraints and classified retirement rules."""
    gp_res = base_valid_fixture["seasons"][0]["rounds"][0]["sessions"]["grand_prix"]["results"][0]

    # 1. DSQ driver with points
    gp_res["official_participation_status"] = "dsq"
    gp_res["gp_points"] = 18.0
    gp_res["model_finish_position"] = 99
    gp_res["is_classified"] = False
    gp_res["model_dnf"] = 1

    is_valid, errors = validate_baseline_schema(base_valid_fixture)
    assert not is_valid
    assert any("status 'dsq' cannot have gp_points > 0" in e for e in errors)

    # 2. Classified retirement with position > 20
    gp_res["official_participation_status"] = "classified_retirement"
    gp_res["gp_points"] = 0.0
    gp_res["is_classified"] = True
    gp_res["model_dnf"] = 1
    gp_res["model_finish_position"] = 99  # Invalid: must be <= 20!

    is_valid, errors = validate_baseline_schema(base_valid_fixture)
    assert not is_valid
    assert any("must have 1 <= model_finish_position <= 20" in e for e in errors)


def test_validator_sprint_points_separation(base_valid_fixture):
    """Validates that sprint points are strictly constrained between 0.0 and 8.0 and not mixed into GP points."""
    sprint_res = base_valid_fixture["seasons"][1]["rounds"][0]["sessions"]["sprint_race"]["results"][0]
    sprint_res["sprint_points"] = 15.0  # Invalid for sprint (max is 8.0)

    is_valid, errors = validate_baseline_schema(base_valid_fixture)
    assert not is_valid
    assert any("sprint_points must be between 0.0 and 8.0" in e for e in errors)

    # GP points > 26.0 (e.g. accidentally summed with sprint points)
    sprint_res["sprint_points"] = 8.0
    gp_res = base_valid_fixture["seasons"][0]["rounds"][0]["sessions"]["grand_prix"]["results"][0]
    gp_res["gp_points"] = 33.0  # 25 + 8 (illegal!)

    is_valid, errors = validate_baseline_schema(base_valid_fixture)
    assert not is_valid
    assert any("gp_points must be between 0.0 and 26.0" in e for e in errors)


def test_validator_pit_lane_start_standardization(base_valid_fixture):
    """Validates that pit-lane starts must be standardized to grid_position=20."""
    grid_entry = base_valid_fixture["seasons"][1]["rounds"][0]["sessions"]["starting_grid"]["entries"][0]
    assert grid_entry["is_pit_lane_start"] is True
    grid_entry["grid_position"] = 0  # Not standardized!

    is_valid, errors = validate_baseline_schema(base_valid_fixture)
    assert not is_valid
    assert any("must be standardized to grid_position=20" in e for e in errors)


def test_baseline_schema_non_numeric_positions_and_dnf_helpers():
    """Tests helper functions for raw position preservation and model DNF derivation."""
    # Official status derivation
    assert derive_model_dnf("Finished") == 0
    assert derive_model_dnf("+1 Lap") == 0
    assert derive_model_dnf("+2 Laps") == 0
    assert derive_model_dnf("Engine") == 1
    assert derive_model_dnf("Collision") == 1
    assert derive_model_dnf("Disqualified") == 1
    assert derive_model_dnf("Did not start") == 1

    # Position normalization
    assert normalize_model_finish_position(1, "Finished") == 1
    assert normalize_model_finish_position("16", "Engine") == 16
    assert normalize_model_finish_position("R", "Collision") == 99
    assert normalize_model_finish_position("D", "Disqualified") == 99
    assert normalize_model_finish_position("DSQ", "Disqualified") == 99
    assert normalize_model_finish_position("NC", "Not Classified") == 99
    assert normalize_model_finish_position(None, "Did not start") == 99


# =============================================================================
# PART 2: 15 EXECUTABLE SYNTHETIC FEATURE-PARITY SCENARIOS
# =============================================================================

def test_scenario_1_driver_misses_one_gp_and_returns():
    """Scenario 1: Driver A competes in R1, is absent in R2, and returns in R3."""
    rounds = [
        {
            "calendar": {"round": "1", "Circuit": {"circuitId": "bahrain"}},
            "quali": [
                {"position": "3", "Driver": {"driverId": "driver_a"}, "Constructor": {"constructorId": "team_a"}, "Q3": "1:30.000"}
            ],
            "race": [
                {"position": "3", "grid": "3", "points": "15.0", "status": "Finished", "Driver": {"driverId": "driver_a"}, "Constructor": {"constructorId": "team_a"}}
            ]
        },
        {
            "calendar": {"round": "2", "Circuit": {"circuitId": "jeddah"}},
            "quali": [
                {"position": "7", "Driver": {"driverId": "driver_sub"}, "Constructor": {"constructorId": "team_a"}, "Q3": "1:29.000"}
            ],
            "race": [
                {"position": "7", "grid": "7", "points": "6.0", "status": "Finished", "Driver": {"driverId": "driver_sub"}, "Constructor": {"constructorId": "team_a"}}
            ]
        },
        {
            "calendar": {"round": "3", "Circuit": {"circuitId": "albert_park"}},
            "quali": [
                {"position": "4", "Driver": {"driverId": "driver_a"}, "Constructor": {"constructorId": "team_a"}, "Q3": "1:18.000"}
            ],
            "race": [
                {"position": "1", "grid": "4", "points": "25.0", "status": "Finished", "Driver": {"driverId": "driver_a"}, "Constructor": {"constructorId": "team_a"}}
            ]
        }
    ]

    pipeline, rows = run_synthetic_pipeline_rounds(rounds)
    r3_a = [r for r in rows if r["round"] == 3 and r["driver_id"] == "driver_a"][0]

    assert len(pipeline.driver_race_history["driver_a"]) == 2
    assert r3_a["driver_prev_race_position"] == 3.0
    assert r3_a["driver_prev_race_points"] == 15.0
    assert r3_a["driver_rolling_3_avg_finish"] == 3.0
    assert r3_a["driver_rolling_5_avg_finish"] == 3.0
    assert r3_a["driver_rolling_5_win_rate"] == 0.0
    assert r3_a["driver_rolling_5_pts_per_race"] == 15.0
    assert r3_a["driver_rolling_5_dnf_rate"] == 0.0
    assert r3_a["driver_season_points_before_gp"] == 15.0


def test_scenario_2_rookie_no_previous_starts(fitted_preprocessor):
    """Scenario 2: Rookie with no previous career starts entering Round 1."""
    rounds = [
        {
            "calendar": {"round": "1", "Circuit": {"circuitId": "bahrain"}},
            "quali": [
                {"position": "12", "Driver": {"driverId": "rookie"}, "Constructor": {"constructorId": "team_b"}, "Q2": "1:31.000"}
            ],
            "race": [
                {"position": "10", "grid": "12", "points": "1.0", "status": "Finished", "Driver": {"driverId": "rookie"}, "Constructor": {"constructorId": "team_b"}}
            ]
        }
    ]

    pipeline, rows = run_synthetic_pipeline_rounds(rounds)
    r1_rookie = rows[0]

    assert math.isnan(r1_rookie["driver_prev_race_position"])
    assert r1_rookie["driver_prev_race_points"] == 0.0
    assert math.isnan(r1_rookie["driver_rolling_3_avg_finish"])
    assert math.isnan(r1_rookie["driver_rolling_5_avg_finish"])
    assert math.isnan(r1_rookie["driver_rolling_10_avg_finish"])
    assert r1_rookie["driver_rolling_5_win_rate"] == 0.0
    assert r1_rookie["driver_rolling_5_podium_rate"] == 0.0
    assert r1_rookie["driver_rolling_5_pts_per_race"] == 0.0
    assert r1_rookie["driver_rolling_5_dnf_rate"] == 0.0
    assert r1_rookie["driver_season_points_before_gp"] == 0.0
    assert r1_rookie["driver_season_standing_before_gp"] == 20
    assert r1_rookie["driver_circuit_starts"] == 0
    assert math.isnan(r1_rookie["driver_circuit_avg_finish"])

    df_raw = pd.DataFrame([r1_rookie])
    transformed = fitted_preprocessor.transform(df_raw)[0]
    col_idx = {name: i for i, name in enumerate(NUMERICAL_FEATURES)}
    assert transformed[col_idx["driver_prev_race_position"]] == 10.0
    assert transformed[col_idx["driver_rolling_3_avg_finish"]] == pytest.approx(10.67, abs=0.01)
    assert transformed[col_idx["driver_rolling_5_avg_finish"]] == pytest.approx(10.80, abs=0.01)
    assert transformed[col_idx["driver_rolling_10_avg_finish"]] == pytest.approx(11.00, abs=0.01)
    assert transformed[col_idx["driver_circuit_avg_finish"]] == 9.5


def test_scenario_3_driver_changes_constructor_mid_season():
    """Scenario 3: Driver changes teams mid-season."""
    rounds = [
        {
            "calendar": {"round": "1", "Circuit": {"circuitId": "bahrain"}},
            "quali": [
                {"position": "2", "Driver": {"driverId": "driver_x"}, "Constructor": {"constructorId": "team_red"}, "Q3": "1:29.500"},
                {"position": "10", "Driver": {"driverId": "driver_y"}, "Constructor": {"constructorId": "team_blue"}, "Q3": "1:31.000"}
            ],
            "race": [
                {"position": "1", "grid": "2", "points": "25.0", "status": "Finished", "Driver": {"driverId": "driver_x"}, "Constructor": {"constructorId": "team_red"}},
                {"position": "10", "grid": "10", "points": "1.0", "status": "Finished", "Driver": {"driverId": "driver_y"}, "Constructor": {"constructorId": "team_blue"}}
            ]
        },
        {
            "calendar": {"round": "2", "Circuit": {"circuitId": "jeddah"}},
            "quali": [
                {"position": "4", "Driver": {"driverId": "driver_x"}, "Constructor": {"constructorId": "team_blue"}, "Q3": "1:28.500"},
                {"position": "8", "Driver": {"driverId": "driver_y"}, "Constructor": {"constructorId": "team_blue"}, "Q3": "1:29.000"}
            ],
            "race": [
                {"position": "3", "grid": "4", "points": "15.0", "status": "Finished", "Driver": {"driverId": "driver_x"}, "Constructor": {"constructorId": "team_blue"}},
                {"position": "8", "grid": "8", "points": "4.0", "status": "Finished", "Driver": {"driverId": "driver_y"}, "Constructor": {"constructorId": "team_blue"}}
            ]
        }
    ]

    pipeline, rows = run_synthetic_pipeline_rounds(rounds)
    r2_x = [r for r in rows if r["round"] == 2 and r["driver_id"] == "driver_x"][0]

    assert r2_x["driver_prev_race_position"] == 1.0
    assert r2_x["driver_rolling_5_win_rate"] == 1.0
    assert r2_x["constructor_prev_race_points"] == 1.0
    assert r2_x["constructor_rolling_3_avg_points"] == 1.0
    assert r2_x["teammate_rolling_5_quali_h2h"] == 0.50
    assert r2_x["outqualified_teammate"] == 1


def test_scenario_4_classified_retirement_position_16_status_engine():
    """Scenario 4: Classified retirement (P16, status 'Engine')."""
    rounds = [
        {
            "calendar": {"round": "1", "Circuit": {"circuitId": "bahrain"}},
            "quali": [
                {"position": "10", "Driver": {"driverId": "driver_dnf"}, "Constructor": {"constructorId": "team_c"}, "Q3": "1:30.500"}
            ],
            "race": [
                {"position": "16", "grid": "10", "points": "0.0", "status": "Engine", "Driver": {"driverId": "driver_dnf"}, "Constructor": {"constructorId": "team_c"}}
            ]
        },
        {
            "calendar": {"round": "2", "Circuit": {"circuitId": "jeddah"}},
            "quali": [
                {"position": "10", "Driver": {"driverId": "driver_dnf"}, "Constructor": {"constructorId": "team_c"}, "Q3": "1:29.500"}
            ],
            "race": [
                {"position": "5", "grid": "10", "points": "10.0", "status": "Finished", "Driver": {"driverId": "driver_dnf"}, "Constructor": {"constructorId": "team_c"}}
            ]
        }
    ]

    pipeline, rows = run_synthetic_pipeline_rounds(rounds)
    r2_dnf = [r for r in rows if r["round"] == 2 and r["driver_id"] == "driver_dnf"][0]

    assert r2_dnf["driver_prev_race_position"] == 16.0
    assert r2_dnf["driver_rolling_3_avg_finish"] == 16.0
    assert r2_dnf["driver_rolling_5_avg_finish"] == 16.0
    assert r2_dnf["driver_rolling_5_dnf_rate"] == 1.00


def test_scenario_5_unclassified_dnf_status_collision(fitted_preprocessor):
    """Scenario 5: Unclassified DNF (lap 1 crash, position 99, status 'Collision')."""
    rounds = [
        {
            "calendar": {"round": "1", "Circuit": {"circuitId": "bahrain"}},
            "quali": [
                {"position": "5", "Driver": {"driverId": "driver_crash"}, "Constructor": {"constructorId": "team_d"}, "Q3": "1:29.800"}
            ],
            "race": [
                {"position": "99", "grid": "5", "points": "0.0", "status": "Collision", "Driver": {"driverId": "driver_crash"}, "Constructor": {"constructorId": "team_d"}}
            ]
        },
        {
            "calendar": {"round": "2", "Circuit": {"circuitId": "jeddah"}},
            "quali": [
                {"position": "6", "Driver": {"driverId": "driver_crash"}, "Constructor": {"constructorId": "team_d"}, "Q3": "1:29.200"}
            ],
            "race": [
                {"position": "6", "grid": "6", "points": "8.0", "status": "Finished", "Driver": {"driverId": "driver_crash"}, "Constructor": {"constructorId": "team_d"}}
            ]
        }
    ]

    pipeline, rows = run_synthetic_pipeline_rounds(rounds)
    r2_crash = [r for r in rows if r["round"] == 2 and r["driver_id"] == "driver_crash"][0]

    assert math.isnan(r2_crash["driver_prev_race_position"])
    assert math.isnan(r2_crash["driver_rolling_3_avg_finish"])
    assert math.isnan(r2_crash["driver_rolling_5_avg_finish"])
    assert r2_crash["driver_rolling_5_dnf_rate"] == 1.00

    df_raw = pd.DataFrame([r2_crash])
    col_idx = {name: i for i, name in enumerate(NUMERICAL_FEATURES)}
    transformed = fitted_preprocessor.transform(df_raw)[0]
    assert transformed[col_idx["driver_prev_race_position"]] == 10.0


def test_scenario_6_disqualification():
    """Scenario 6: Disqualification (status 'Disqualified', position 99)."""
    rounds = [
        {
            "calendar": {"round": "1", "Circuit": {"circuitId": "cota"}},
            "quali": [
                {"position": "2", "Driver": {"driverId": "driver_dsq"}, "Constructor": {"constructorId": "team_e"}, "Q3": "1:34.000"}
            ],
            "race": [
                {"position": "99", "grid": "2", "points": "0.0", "status": "Disqualified", "Driver": {"driverId": "driver_dsq"}, "Constructor": {"constructorId": "team_e"}}
            ]
        },
        {
            "calendar": {"round": "2", "Circuit": {"circuitId": "mexico"}},
            "quali": [
                {"position": "3", "Driver": {"driverId": "driver_dsq"}, "Constructor": {"constructorId": "team_e"}, "Q3": "1:17.000"}
            ],
            "race": [
                {"position": "2", "grid": "3", "points": "18.0", "status": "Finished", "Driver": {"driverId": "driver_dsq"}, "Constructor": {"constructorId": "team_e"}}
            ]
        }
    ]

    pipeline, rows = run_synthetic_pipeline_rounds(rounds)
    r2_dsq = [r for r in rows if r["round"] == 2 and r["driver_id"] == "driver_dsq"][0]

    assert math.isnan(r2_dsq["driver_prev_race_position"])
    assert r2_dsq["driver_prev_race_points"] == 0.0
    assert r2_dsq["driver_rolling_5_podium_rate"] == 0.0
    assert r2_dsq["driver_rolling_5_dnf_rate"] == 1.0


def test_scenario_7_dns_handling_and_integration_requirement():
    """Scenario 7: Driver qualifies but does not start (DNS) on Sunday."""
    rounds = [
        {
            "calendar": {"round": "1", "Circuit": {"circuitId": "monaco"}},
            "quali": [
                {"position": "1", "Driver": {"driverId": "driver_pole"}, "Constructor": {"constructorId": "team_f"}, "Q3": "1:11.000"},
                {"position": "2", "Driver": {"driverId": "driver_dns"}, "Constructor": {"constructorId": "team_f"}, "Q3": "1:11.200"}
            ],
            "race": [
                {"position": "1", "grid": "1", "points": "25.0", "status": "Finished", "Driver": {"driverId": "driver_pole"}, "Constructor": {"constructorId": "team_f"}}
            ]
        },
        {
            "calendar": {"round": "2", "Circuit": {"circuitId": "baku"}},
            "quali": [
                {"position": "5", "Driver": {"driverId": "driver_dns"}, "Constructor": {"constructorId": "team_f"}, "Q3": "1:41.000"}
            ],
            "race": [
                {"position": "4", "grid": "5", "points": "12.0", "status": "Finished", "Driver": {"driverId": "driver_dns"}, "Constructor": {"constructorId": "team_f"}}
            ]
        }
    ]

    pipeline, rows = run_synthetic_pipeline_rounds(rounds)

    r1_drivers = [r["driver_id"] for r in rows if r["round"] == 1]
    assert "driver_pole" in r1_drivers
    assert "driver_dns" not in r1_drivers

    r2_dns = [r for r in rows if r["round"] == 2 and r["driver_id"] == "driver_dns"][0]
    assert math.isnan(r2_dns["driver_prev_race_position"])
    assert r2_dns["driver_rolling_5_win_rate"] == 0.0


def test_scenario_8_pit_lane_start_normalization():
    """Scenario 8: Pit-lane start (grid=0 in Jolpica/Ergast API)."""
    rounds = [
        {
            "calendar": {"round": "1", "Circuit": {"circuitId": "silverstone"}},
            "quali": [
                {"position": "4", "Driver": {"driverId": "driver_pl"}, "Constructor": {"constructorId": "team_g"}, "Q3": "1:26.500"}
            ],
            "race": [
                {"position": "6", "grid": "0", "points": "8.0", "status": "Finished", "Driver": {"driverId": "driver_pl"}, "Constructor": {"constructorId": "team_g"}}
            ]
        }
    ]

    pipeline, rows = run_synthetic_pipeline_rounds(rounds)
    r1_pl = rows[0]

    assert r1_pl["grid_position"] == 20
    assert r1_pl["quali_position"] == 4
    assert r1_pl["grid_penalty_delta"] == 16
    assert r1_pl["front_row"] == 0
    assert pipeline.constructor_race_history["team_g"][0]["grids"] == [20]


def test_scenario_9_constructor_single_car_legacy_podium_denominator():
    """Scenario 9: Constructor enters only 1 car."""
    rounds = [
        {
            "calendar": {"round": "1", "Circuit": {"circuitId": "bahrain"}},
            "quali": [
                {"position": "8", "Driver": {"driverId": "d1"}, "Constructor": {"constructorId": "team_w"}, "Q3": "1:30.800"},
                {"position": "10", "Driver": {"driverId": "d2"}, "Constructor": {"constructorId": "team_w"}, "Q3": "1:31.000"}
            ],
            "race": [
                {"position": "8", "grid": "8", "points": "4.0", "status": "Finished", "Driver": {"driverId": "d1"}, "Constructor": {"constructorId": "team_w"}},
                {"position": "10", "grid": "10", "points": "1.0", "status": "Finished", "Driver": {"driverId": "d2"}, "Constructor": {"constructorId": "team_w"}}
            ]
        },
        {
            "calendar": {"round": "2", "Circuit": {"circuitId": "albert_park"}},
            "quali": [
                {"position": "12", "Driver": {"driverId": "d1"}, "Constructor": {"constructorId": "team_w"}, "Q2": "1:18.500"}
            ],
            "race": [
                {"position": "11", "grid": "12", "points": "0.0", "status": "Finished", "Driver": {"driverId": "d1"}, "Constructor": {"constructorId": "team_w"}}
            ]
        },
        {
            "calendar": {"round": "3", "Circuit": {"circuitId": "suzuka"}},
            "quali": [
                {"position": "9", "Driver": {"driverId": "d1"}, "Constructor": {"constructorId": "team_w"}, "Q3": "1:29.900"}
            ],
            "race": [
                {"position": "9", "grid": "9", "points": "2.0", "status": "Finished", "Driver": {"driverId": "d1"}, "Constructor": {"constructorId": "team_w"}}
            ]
        }
    ]

    pipeline, rows = run_synthetic_pipeline_rounds(rounds)
    r3_w = [r for r in rows if r["round"] == 3 and r["driver_id"] == "d1"][0]

    assert r3_w["constructor_rolling_3_avg_grid"] == 10.00
    assert r3_w["constructor_rolling_5_podium_rate"] == 0.0


def test_scenario_10_new_teammate_pairing():
    """Scenario 10: New teammate pairing."""
    rounds = [
        {
            "calendar": {"round": "1", "Circuit": {"circuitId": "monza"}},
            "quali": [
                {"position": "2", "Driver": {"driverId": "leclerc"}, "Constructor": {"constructorId": "ferrari"}, "Q3": "1:20.100"},
                {"position": "3", "Driver": {"driverId": "hamilton"}, "Constructor": {"constructorId": "ferrari"}, "Q3": "1:20.200"}
            ],
            "race": [
                {"position": "2", "grid": "2", "points": "18.0", "status": "Finished", "Driver": {"driverId": "leclerc"}, "Constructor": {"constructorId": "ferrari"}},
                {"position": "3", "grid": "3", "points": "15.0", "status": "Finished", "Driver": {"driverId": "hamilton"}, "Constructor": {"constructorId": "ferrari"}}
            ]
        }
    ]

    pipeline, rows = run_synthetic_pipeline_rounds(rounds)
    lec = [r for r in rows if r["driver_id"] == "leclerc"][0]
    ham = [r for r in rows if r["driver_id"] == "hamilton"][0]

    assert lec["teammate_rolling_5_quali_h2h"] == 0.50
    assert ham["teammate_rolling_5_quali_h2h"] == 0.50
    assert lec["outqualified_teammate"] == 1
    assert ham["outqualified_teammate"] == 0


def test_scenario_11_sprint_points_exclusion_from_gp_rolling_form():
    """Scenario 11: Sprint weekend exclusion from GP rolling points."""
    rounds = [
        {
            "calendar": {
                "round": "1",
                "raceName": "Miami Grand Prix Sprint",
                "Sprint": {"date": "2024-05-04"},
                "Circuit": {"circuitId": "miami"}
            },
            "quali": [
                {"position": "1", "Driver": {"driverId": "verstappen"}, "Constructor": {"constructorId": "red_bull"}, "Q3": "1:27.241"}
            ],
            "race": [
                {"position": "1", "grid": "1", "points": "25.0", "status": "Finished", "Driver": {"driverId": "verstappen"}, "Constructor": {"constructorId": "red_bull"}}
            ]
        },
        {
            "calendar": {
                "round": "2",
                "raceName": "Emilia Romagna Grand Prix",
                "Circuit": {"circuitId": "imola"}
            },
            "quali": [
                {"position": "1", "Driver": {"driverId": "verstappen"}, "Constructor": {"constructorId": "red_bull"}, "Q3": "1:14.746"}
            ],
            "race": [
                {"position": "1", "grid": "1", "points": "25.0", "status": "Finished", "Driver": {"driverId": "verstappen"}, "Constructor": {"constructorId": "red_bull"}}
            ]
        }
    ]

    pipeline, rows = run_synthetic_pipeline_rounds(rounds)
    r1 = rows[0]
    r2 = rows[1]

    assert r1["is_sprint_weekend"] == 1
    assert r2["is_sprint_weekend"] == 0
    assert r2["driver_season_points_before_gp"] == 25.0
    assert r2["driver_prev_race_points"] == 25.0


def test_scenario_12_unvisited_circuit_heritage(fitted_preprocessor):
    """Scenario 12: Driver visits a circuit for the first time."""
    rounds = [
        {
            "calendar": {"round": "1", "Circuit": {"circuitId": "madrid"}},
            "quali": [
                {"position": "5", "Driver": {"driverId": "driver_new_track"}, "Constructor": {"constructorId": "team_h"}, "Q3": "1:22.000"}
            ],
            "race": [
                {"position": "5", "grid": "5", "points": "10.0", "status": "Finished", "Driver": {"driverId": "driver_new_track"}, "Constructor": {"constructorId": "team_h"}}
            ]
        }
    ]

    pipeline, rows = run_synthetic_pipeline_rounds(rounds)
    r1 = rows[0]

    assert r1["driver_circuit_starts"] == 0
    assert r1["driver_circuit_wins"] == 0
    assert r1["driver_circuit_win_rate"] == 0.0
    assert r1["driver_circuit_podiums"] == 0
    assert math.isnan(r1["driver_circuit_avg_finish"])
    assert r1["circuit_historical_pole_win_rate"] == 0.45

    df_raw = pd.DataFrame([r1])
    col_idx = {name: i for i, name in enumerate(NUMERICAL_FEATURES)}
    transformed = fitted_preprocessor.transform(df_raw)[0]
    assert transformed[col_idx["driver_circuit_avg_finish"]] == 9.5


def test_scenario_13_missing_weather_telemetry_imputation(fitted_preprocessor):
    """Scenario 13: FastF1 weather telemetry missing."""
    rounds = [
        {
            "calendar": {"round": "1", "Circuit": {"circuitId": "spa"}},
            "quali": [
                {"position": "1", "Driver": {"driverId": "norris"}, "Constructor": {"constructorId": "mclaren"}, "Q3": "1:45.000"}
            ],
            "race": [
                {"position": "1", "grid": "1", "points": "25.0", "status": "Finished", "Driver": {"driverId": "norris"}, "Constructor": {"constructorId": "mclaren"}}
            ],
            "weather": {
                "quali_air_temp_c": None,
                "quali_track_temp_c": None,
                "quali_humidity_pct": None,
                "quali_rainfall": None,
                "fastf1_available": False
            }
        }
    ]

    pipeline, rows = run_synthetic_pipeline_rounds(rounds)
    r1 = rows[0]

    assert r1["quali_air_temp_c"] is None
    assert r1["quali_track_temp_c"] is None
    assert r1["quali_humidity_pct"] is None
    assert r1["quali_rainfall"] is None

    df_raw = pd.DataFrame([r1])
    col_idx = {name: i for i, name in enumerate(NUMERICAL_FEATURES)}
    transformed = fitted_preprocessor.transform(df_raw)[0]

    assert transformed[col_idx["quali_air_temp_c"]] == pytest.approx(25.1, abs=0.1)
    assert transformed[col_idx["quali_track_temp_c"]] == pytest.approx(33.9, abs=0.1)
    assert transformed[col_idx["quali_humidity_pct"]] == pytest.approx(55.3, abs=0.1)
    assert transformed[col_idx["quali_rainfall"]] == 0.0


def test_scenario_14_missing_qualifying_q3_data(fitted_preprocessor):
    """Scenario 14: Driver eliminated before Q3, or set no time in Q3."""
    rounds = [
        {
            "calendar": {"round": "1", "Circuit": {"circuitId": "monza"}},
            "quali": [
                {"position": "1", "Driver": {"driverId": "pole_man"}, "Constructor": {"constructorId": "team_top"}, "Q3": "1:20.000"},
                {"position": "12", "Driver": {"driverId": "q2_out"}, "Constructor": {"constructorId": "team_mid"}, "Q1": "1:21.500", "Q2": "1:21.000", "Q3": None},
                {"position": "10", "Driver": {"driverId": "q3_no_time"}, "Constructor": {"constructorId": "team_top"}, "Q1": "1:21.000", "Q2": "1:20.500", "Q3": ""},
                {"position": "20", "Driver": {"driverId": "no_times"}, "Constructor": {"constructorId": "team_back"}}
            ],
            "race": [
                {"position": "1", "grid": "1", "points": "25.0", "status": "Finished", "Driver": {"driverId": "pole_man"}, "Constructor": {"constructorId": "team_top"}},
                {"position": "12", "grid": "12", "points": "0.0", "status": "Finished", "Driver": {"driverId": "q2_out"}, "Constructor": {"constructorId": "team_mid"}},
                {"position": "10", "grid": "10", "points": "1.0", "status": "Finished", "Driver": {"driverId": "q3_no_time"}, "Constructor": {"constructorId": "team_top"}},
                {"position": "20", "grid": "20", "points": "0.0", "status": "Finished", "Driver": {"driverId": "no_times"}, "Constructor": {"constructorId": "team_back"}}
            ]
        }
    ]

    pipeline, rows = run_synthetic_pipeline_rounds(rounds)
    q2_row = [r for r in rows if r["driver_id"] == "q2_out"][0]
    q3_row = [r for r in rows if r["driver_id"] == "q3_no_time"][0]
    no_time_row = [r for r in rows if r["driver_id"] == "no_times"][0]

    assert q2_row["reached_q3"] == 0
    assert q2_row["quali_time_sec"] == 81.0
    assert q2_row["quali_time_delta_to_pole"] == 1.0

    assert q3_row["reached_q3"] == 0
    assert q3_row["quali_time_sec"] == 80.5

    assert no_time_row["reached_q3"] == 0
    assert no_time_row["quali_time_sec"] is None
    assert no_time_row["quali_time_delta_to_pole"] is None

    df_raw = pd.DataFrame([no_time_row])
    col_idx = {name: i for i, name in enumerate(NUMERICAL_FEATURES)}
    transformed = fitted_preprocessor.transform(df_raw)[0]
    assert transformed[col_idx["quali_time_delta_to_pole"]] == pytest.approx(1.355, abs=0.01)


def test_scenario_15_driver_fewer_than_five_starts_denominators():
    """Scenario 15: Driver with fewer than 5 starts (e.g. 2 starts)."""
    rounds = [
        {
            "calendar": {"round": "1", "Circuit": {"circuitId": "monza"}},
            "quali": [
                {"position": "8", "Driver": {"driverId": "colapinto"}, "Constructor": {"constructorId": "williams"}, "Q3": "1:20.500"}
            ],
            "race": [
                {"position": "8", "grid": "8", "points": "4.0", "status": "Finished", "Driver": {"driverId": "colapinto"}, "Constructor": {"constructorId": "williams"}}
            ]
        },
        {
            "calendar": {"round": "2", "Circuit": {"circuitId": "baku"}},
            "quali": [
                {"position": "9", "Driver": {"driverId": "colapinto"}, "Constructor": {"constructorId": "williams"}, "Q3": "1:41.500"}
            ],
            "race": [
                {"position": "99", "grid": "9", "points": "0.0", "status": "Collision", "Driver": {"driverId": "colapinto"}, "Constructor": {"constructorId": "williams"}}
            ]
        },
        {
            "calendar": {"round": "3", "Circuit": {"circuitId": "singapore"}},
            "quali": [
                {"position": "11", "Driver": {"driverId": "colapinto"}, "Constructor": {"constructorId": "williams"}, "Q2": "1:31.000"}
            ],
            "race": [
                {"position": "11", "grid": "11", "points": "0.0", "status": "Finished", "Driver": {"driverId": "colapinto"}, "Constructor": {"constructorId": "williams"}}
            ]
        }
    ]

    pipeline, rows = run_synthetic_pipeline_rounds(rounds)
    r3 = [r for r in rows if r["round"] == 3 and r["driver_id"] == "colapinto"][0]

    assert r3["driver_rolling_3_avg_finish"] == 8.00
    assert r3["driver_rolling_5_avg_finish"] == 8.00
    assert r3["driver_rolling_5_dnf_rate"] == 0.50
    assert r3["driver_rolling_5_pts_per_race"] == 2.00
    assert r3["driver_rolling_5_win_rate"] == 0.00


# =============================================================================
# PART 3: REGULATION ERA, FITTED ARTIFACT & FEATURE ORDER TESTS
# =============================================================================

def test_2026_regulation_era_fitted_artifact_compatibility(fitted_artifact, fitted_preprocessor):
    """Verifies that 'active_aero_sustainable_fuel_gen3' produces valid probabilities."""
    lgb_candidate = fitted_artifact["lightgbm"]

    drivers_data = []
    for i in range(20):
        pos = i + 1
        d_row = {feat: 0.0 for feat in NUMERICAL_FEATURES}
        d_row["grid_position"] = pos
        d_row["quali_position"] = pos
        d_row["driver_id"] = f"driver_{i+1}"
        d_row["constructor_id"] = f"team_{i//2}"
        d_row["regulation_era"] = "active_aero_sustainable_fuel_gen3"
        drivers_data.append(d_row)

    df_2026 = pd.DataFrame(drivers_data)

    transformed = fitted_preprocessor.transform(df_2026)
    assert transformed.shape == (20, 43)

    cat_columns = transformed[:, -2:]
    np.testing.assert_array_equal(cat_columns, np.zeros((20, 2)))

    probs = lgb_candidate.predict_race_probabilities(df_2026, temperature=1.85)

    assert len(probs) == 20
    assert np.all(np.isfinite(probs))
    assert np.all(probs >= 0.0)
    assert np.isclose(np.sum(probs), 1.0, atol=1e-5)
    assert probs[0] == np.max(probs)


def test_feature_order_and_count_integrity():
    """Verifies that the exact 42 feature names and order remain completely unchanged."""
    assert len(ALL_MODEL_FEATURES) == 42
    assert len(NUMERICAL_FEATURES) == 41
    assert len(CATEGORICAL_FEATURES) == 1
    assert CATEGORICAL_FEATURES[0] == "regulation_era"

    expected_feature_order = [
        "grid_position",
        "quali_position",
        "grid_penalty_delta",
        "quali_time_delta_to_pole",
        "quali_time_ratio_to_pole",
        "reached_q3",
        "front_row",
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
        "constructor_prev_race_points",
        "constructor_rolling_3_avg_points",
        "constructor_rolling_5_win_rate",
        "constructor_rolling_5_podium_rate",
        "constructor_rolling_3_avg_grid",
        "constructor_season_points_before_gp",
        "constructor_season_standing_before_gp",
        "constructor_best_quali_delta_to_pole",
        "outqualified_teammate",
        "teammate_rolling_5_quali_h2h",
        "driver_circuit_starts",
        "driver_circuit_wins",
        "driver_circuit_win_rate",
        "driver_circuit_podiums",
        "driver_circuit_avg_finish",
        "constructor_circuit_wins",
        "circuit_historical_pole_win_rate",
        "is_sprint_weekend",
        "quali_air_temp_c",
        "quali_track_temp_c",
        "quali_humidity_pct",
        "quali_rainfall",
        "regulation_era"
    ]

    assert ALL_MODEL_FEATURES == expected_feature_order
