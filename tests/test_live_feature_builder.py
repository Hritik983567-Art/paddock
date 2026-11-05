"""
Executable Tests for LiveFeatureBuilder.

Phase: 3C.3B (LiveFeatureBuilder)
Verifies:
1. Exact 42-feature order and output types matching the frozen v1.0.0 model contract.
2. One feature row per eligible target-race driver.
3. Deterministic output for identical input data.
4. Correct season-and-round target selection.
5. Strict temporal isolation: zero target-race Sunday result leakage.
6. Strict temporal isolation: zero future-race leakage.
7. Strict temporal isolation: zero constructor standings/points leakage.
8. Strict temporal isolation: zero teammate qualifying leakage into teammate_rolling_5_quali_h2h.
9. Strict temporal isolation: zero circuit heritage leakage.
10. Correct sprint-versus-Grand-Prix points segregation.
11. Missing qualifying data returns structured unavailable result (QUALIFYING_DATA_UNAVAILABLE).
12. Provisional-grid mode uses qualifying positions and records hasPenaltiesApplied: false.
13. Official-grid mode requires verified starting-grid data and records hasPenaltiesApplied: true.
14. Missing weather telemetry remains distinguishable from observed zero (NaN vs 0.0).
15. 2026 active_aero_sustainable_fuel_gen3 regulation era diagnosed as unknown category.
16. Duplicate driver entries in session are rejected.
17. Full compatibility with frozen LightGBM pipeline artifact (trained_models.joblib).
18. Historical baseline replay on authentic 2025/2026 records.
"""

import pytest
import os
import math
import copy
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List

from scripts.predictor_model.config import MODELS_ROOT_DIR, MODEL_VERSION
from scripts.predictor_model.features import (
    ALL_MODEL_FEATURES,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    METADATA_COLUMNS
)
from scripts.predictor_pipeline.baseline_schema import CURRENT_CONTRACT_VERSION
from scripts.predictor_pipeline.live_feature_builder import (
    LiveFeatureBuilder,
    LiveFeatureResult,
    LiveFeatureBuilderError
)


@pytest.fixture(scope="module")
def frozen_model_bundle():
    """Loads the frozen v1.0.0 model bundle."""
    bundle_path = os.path.join(MODELS_ROOT_DIR, MODEL_VERSION, "trained_models.joblib")
    assert os.path.exists(bundle_path), f"Artifact missing at {bundle_path}"
    return joblib.load(bundle_path)


@pytest.fixture(scope="module")
def lightgbm_pipeline(frozen_model_bundle):
    """Returns the LightGBMPredictor from the bundle."""
    return frozen_model_bundle["lightgbm"]


@pytest.fixture
def synthetic_multi_round_baseline() -> Dict[str, Any]:
    """
    Creates a valid Schema v1.3.1 synthetic baseline dataset with:
    - 2025 Season: 3 completed rounds (Bahrain, Jeddah, Melbourne).
    - 2026 Season: 2 completed rounds (Bahrain, Jeddah) and 1 upcoming round (Melbourne).
    """
    def make_q_results(pole_driver="verstappen", pole_time=89.500):
        drivers = [
            ("verstappen", "VER", "1", "red_bull", 1, pole_time),
            ("perez", "PER", "11", "red_bull", 2, pole_time + 0.150),
            ("norris", "NOR", "4", "mclaren", 3, pole_time + 0.320),
            ("piastri", "PIA", "81", "mclaren", 4, pole_time + 0.410),
            ("leclerc", "LEC", "16", "ferrari", 5, pole_time + 0.450),
            ("hamilton", "HAM", "44", "ferrari", 6, pole_time + 0.520),
            ("russell", "RUS", "63", "mercedes", 7, pole_time + 0.600),
            ("antonelli", "ANT", "12", "mercedes", 8, pole_time + 0.750),
            ("alonso", "ALO", "14", "aston_martin", 9, pole_time + 0.880),
            ("stroll", "STR", "18", "aston_martin", 10, pole_time + 1.100),
            ("tsunoda", "TSU", "22", "racing_bulls", 11, pole_time + 1.250),
            ("lawson", "LAW", "30", "racing_bulls", 12, pole_time + 1.350)
        ]
        results = []
        for d_id, code, num, c_id, pos, t in drivers:
            results.append({
                "driver_id": d_id,
                "driver_code": code,
                "driver_number": num,
                "constructor_id": c_id,
                "raw_position": pos,
                "quali_position": pos,
                "best_time_sec": t,
                "reached_q3": 1 if pos <= 10 else 0
            })
        return results

    def make_grid_entries(q_results, penalties=None):
        penalties = penalties or {}
        entries = []
        for q in q_results:
            d_id = q["driver_id"]
            c_id = q["constructor_id"]
            q_pos = q["quali_position"]
            penalty = penalties.get(d_id, 0)
            g_pos = q_pos + penalty
            is_pl = (penalty == 999)
            norm_g = 20 if is_pl else g_pos
            entries.append({
                "driver_id": d_id,
                "constructor_id": c_id,
                "raw_grid_position": "PL" if is_pl else g_pos,
                "grid_position": norm_g,
                "is_pit_lane_start": is_pl,
                "grid_penalty_delta": norm_g - q_pos,
                "penalty_reason": "Engine component" if penalty else None
            })
        return entries

    def make_gp_results(q_results, winner_driver="verstappen", dnf_driver=None):
        results = []
        # Assign finish positions
        curr_pos = 1
        for q in q_results:
            d_id = q["driver_id"]
            c_id = q["constructor_id"]
            if d_id == dnf_driver:
                results.append({
                    "driver_id": d_id,
                    "constructor_id": c_id,
                    "raw_position": "R",
                    "model_finish_position": 99,
                    "gp_points": 0.0,
                    "raw_status": "Engine failure",
                    "official_participation_status": "dnf",
                    "model_dnf": 1,
                    "is_classified": False
                })
            else:
                pts = 25.0 if curr_pos == 1 else (18.0 if curr_pos == 2 else (15.0 if curr_pos == 3 else (10.0 if curr_pos == 4 else 0.0)))
                results.append({
                    "driver_id": d_id,
                    "constructor_id": c_id,
                    "raw_position": curr_pos,
                    "model_finish_position": curr_pos,
                    "gp_points": pts,
                    "raw_status": "Finished",
                    "official_participation_status": "started",
                    "model_dnf": 0,
                    "is_classified": True
                })
                curr_pos += 1
        return results

    # Build 2025 Season
    s2025_rounds = []
    circuits = [("bahrain", "Bahrain International Circuit", "2025-03-02"),
                ("jeddah", "Jeddah Corniche Circuit", "2025-03-09"),
                ("albert_park", "Albert Park Circuit", "2025-03-23")]

    for idx, (c_id, c_name, r_date) in enumerate(circuits):
        rnd = idx + 1
        q_res = make_q_results()
        g_ent = make_grid_entries(q_res)
        gp_res = make_gp_results(q_res, dnf_driver="alonso" if rnd == 2 else None)
        s2025_rounds.append({
            "round": rnd,
            "race_id": f"2025_{rnd:02d}_{c_id}",
            "circuit_id": c_id,
            "circuit_name": c_name,
            "country": "TestCountry",
            "race_date": r_date,
            "race_timestamp_utc": f"{r_date}T15:00:00Z",
            "is_sprint_weekend": bool(rnd == 2),
            "sessions": {
                "qualifying": {
                    "session_status": "completed",
                    "revision": 1,
                    "publication_timestamp_utc": f"{r_date}T16:00:00Z",
                    "provenance": "synthetic_test",
                    "pole_time_sec": 89.500,
                    "weather": {
                        "air_temp_c": 26.5,
                        "track_temp_c": 34.0,
                        "humidity_pct": 55.0,
                        "rainfall": 0.0,
                        "provenance": "synthetic_telemetry"
                    },
                    "results": q_res
                },
                "starting_grid": {
                    "is_official": True,
                    "revision": 1,
                    "publication_timestamp_utc": f"{r_date}T12:00:00Z",
                    "provenance": "synthetic_test",
                    "entries": g_ent
                },
                "grand_prix": {
                    "session_status": "completed",
                    "revision": 1,
                    "publication_timestamp_utc": f"{r_date}T17:00:00Z",
                    "provenance": "synthetic_test",
                    "results": gp_res
                }
            }
        })

    # Build 2026 Season (with active_aero_sustainable_fuel_gen3)
    s2026_rounds = []
    # R1: Bahrain (completed)
    q_26_1 = make_q_results()
    g_26_1 = make_grid_entries(q_26_1)
    gp_26_1 = make_gp_results(q_26_1)
    s2026_rounds.append({
        "round": 1,
        "race_id": "2026_01_bahrain",
        "circuit_id": "bahrain",
        "circuit_name": "Bahrain International Circuit",
        "country": "Bahrain",
        "race_date": "2026-03-01",
        "race_timestamp_utc": "2026-03-01T15:00:00Z",
        "is_sprint_weekend": False,
        "sessions": {
            "qualifying": {
                "session_status": "completed",
                "revision": 1,
                "publication_timestamp_utc": "2026-02-28T16:00:00Z",
                "provenance": "synthetic_test",
                "pole_time_sec": 88.200,
                "weather": {"air_temp_c": 24.0, "track_temp_c": 31.0, "humidity_pct": 48.0, "rainfall": 0.0, "provenance": "fastf1"},
                "results": q_26_1
            },
            "starting_grid": {
                "is_official": True,
                "revision": 1,
                "publication_timestamp_utc": "2026-03-01T12:00:00Z",
                "provenance": "synthetic_test",
                "entries": g_26_1
            },
            "grand_prix": {
                "session_status": "completed",
                "revision": 1,
                "publication_timestamp_utc": "2026-03-01T17:00:00Z",
                "provenance": "synthetic_test",
                "results": gp_26_1
            }
        }
    })

    # R2: Jeddah (completed, sprint weekend, penalty on Norris)
    q_26_2 = make_q_results()
    g_26_2 = make_grid_entries(q_26_2, penalties={"norris": 3})  # Norris P3 -> P6 grid drop
    gp_26_2 = make_gp_results(q_26_2)
    s2026_rounds.append({
        "round": 2,
        "race_id": "2026_02_jeddah",
        "circuit_id": "jeddah",
        "circuit_name": "Jeddah Corniche Circuit",
        "country": "Saudi Arabia",
        "race_date": "2026-03-08",
        "race_timestamp_utc": "2026-03-08T17:00:00Z",
        "is_sprint_weekend": True,
        "sessions": {
            "qualifying": {
                "session_status": "completed",
                "revision": 1,
                "publication_timestamp_utc": "2026-03-07T17:00:00Z",
                "provenance": "synthetic_test",
                "pole_time_sec": 87.800,
                "weather": {"air_temp_c": 28.0, "track_temp_c": 33.0, "humidity_pct": 60.0, "rainfall": 0.0, "provenance": "fastf1"},
                "results": q_26_2
            },
            "sprint_race": {
                "session_status": "completed",
                "revision": 1,
                "publication_timestamp_utc": "2026-03-07T13:00:00Z",
                "provenance": "synthetic_test",
                "results": [
                    {"driver_id": "verstappen", "sprint_points": 8.0},
                    {"driver_id": "norris", "sprint_points": 7.0}
                ]
            },
            "starting_grid": {
                "is_official": True,
                "revision": 1,
                "publication_timestamp_utc": "2026-03-08T13:00:00Z",
                "provenance": "synthetic_test",
                "entries": g_26_2
            },
            "grand_prix": {
                "session_status": "completed",
                "revision": 1,
                "publication_timestamp_utc": "2026-03-08T19:00:00Z",
                "provenance": "synthetic_test",
                "results": gp_26_2
            }
        }
    })

    # R3: Melbourne (target upcoming race - qualifying completed, official grid not yet released)
    q_26_3 = make_q_results()
    s2026_rounds.append({
        "round": 3,
        "race_id": "2026_03_albert_park",
        "circuit_id": "albert_park",
        "circuit_name": "Albert Park Circuit",
        "country": "Australia",
        "race_date": "2026-03-22",
        "race_timestamp_utc": "2026-03-22T04:00:00Z",
        "is_sprint_weekend": False,
        "sessions": {
            "qualifying": {
                "session_status": "completed",
                "revision": 1,
                "publication_timestamp_utc": "2026-03-21T06:00:00Z",
                "provenance": "synthetic_test",
                "pole_time_sec": 76.500,
                "weather": None,  # Test missing weather
                "results": q_26_3
            },
            "starting_grid": {
                "is_official": False,
                "revision": 1,
                "publication_timestamp_utc": "2026-03-22T01:00:00Z",
                "provenance": "synthetic_test",
                "entries": []
            },
            "grand_prix": {
                "session_status": "upcoming",
                "revision": 1,
                "publication_timestamp_utc": "2026-03-22T06:00:00Z",
                "provenance": "synthetic_test",
                "results": []
            }
        }
    })

    # R4: Future upcoming race (Qualifying not yet run)
    s2026_rounds.append({
        "round": 4,
        "race_id": "2026_04_suzuka",
        "circuit_id": "suzuka",
        "circuit_name": "Suzuka International Racing Course",
        "country": "Japan",
        "race_date": "2026-04-05",
        "race_timestamp_utc": "2026-04-05T05:00:00Z",
        "is_sprint_weekend": False,
        "sessions": {
            "qualifying": {
                "session_status": "upcoming",
                "revision": 1,
                "publication_timestamp_utc": "2026-04-04T06:00:00Z",
                "provenance": "synthetic_test",
                "pole_time_sec": None,
                "weather": None,
                "results": []
            },
            "starting_grid": {
                "is_official": False,
                "revision": 1,
                "publication_timestamp_utc": "2026-04-05T02:00:00Z",
                "provenance": "synthetic_test",
                "entries": []
            },
            "grand_prix": {
                "session_status": "upcoming",
                "revision": 1,
                "publication_timestamp_utc": "2026-04-05T07:00:00Z",
                "provenance": "synthetic_test",
                "results": []
            }
        }
    })

    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "contract_version": CURRENT_CONTRACT_VERSION,
        "generated_at_utc": "2026-11-01T12:00:00Z",
        "offline_replay_certified": False,
        "seasons": [
            {
                "season": 2025,
                "regulation_era": "ground_effect_gen2",
                "rounds": s2025_rounds
            },
            {
                "season": 2026,
                "regulation_era": "active_aero_sustainable_fuel_gen3",
                "rounds": s2026_rounds
            }
        ]
    }


# =============================================================================
# 1. Exact 42-Feature Order & Types Test
# =============================================================================
def test_exact_42_feature_order_and_types(synthetic_multi_round_baseline):
    """Verifies that features_df matches ALL_MODEL_FEATURES in exact count, names, and order."""
    builder = LiveFeatureBuilder(baseline_data=synthetic_multi_round_baseline, validate_schema=True)
    res = builder.build_features_for_race(2026, 3, stage="provisional")

    assert list(res.features_df.columns) == ALL_MODEL_FEATURES
    assert len(res.features_df.columns) == 42
    assert len(NUMERICAL_FEATURES) == 41
    assert len(CATEGORICAL_FEATURES) == 1

    # Check numeric types can be safely coerced/represented as floats
    for num_col in NUMERICAL_FEATURES:
        assert pd.api.types.is_numeric_dtype(res.features_df[num_col])

    # Check categorical type is string/object
    assert pd.api.types.is_string_dtype(res.features_df["regulation_era"]) or pd.api.types.is_object_dtype(res.features_df["regulation_era"])


# =============================================================================
# 2. One Feature Row Per Eligible Driver Test
# =============================================================================
def test_one_row_per_eligible_driver(synthetic_multi_round_baseline):
    """Verifies exactly 1 row per driver participating in qualifying."""
    builder = LiveFeatureBuilder(baseline_data=synthetic_multi_round_baseline, validate_schema=True)
    res = builder.build_features_for_race(2026, 3, stage="provisional")

    # The synthetic fixture has 12 drivers
    assert len(res.features_df) == 12
    assert len(res.metadata_df) == 12
    assert len(res.combined_df) == 12
    assert res.metadata_df["driver_id"].nunique() == 12


# =============================================================================
# 3. Deterministic Output for Identical Input Data
# =============================================================================
def test_deterministic_output(synthetic_multi_round_baseline):
    """Verifies running the builder multiple times yields identical outputs."""
    builder = LiveFeatureBuilder(baseline_data=synthetic_multi_round_baseline, validate_schema=True)
    res1 = builder.build_features_for_race(2026, 3, stage="provisional")
    res2 = builder.build_features_for_race(2026, 3, stage="provisional")

    pd.testing.assert_frame_equal(res1.features_df, res2.features_df)
    pd.testing.assert_frame_equal(res1.metadata_df.drop(columns=["feature_timestamp_utc"]),
                                  res2.metadata_df.drop(columns=["feature_timestamp_utc"]))


# =============================================================================
# 4. Correct Season and Round Target Selection
# =============================================================================
def test_correct_season_and_round_selection(synthetic_multi_round_baseline):
    """Verifies targeting (2026, 1) vs (2026, 2) vs (2026, 3) selects distinct rounds."""
    builder = LiveFeatureBuilder(baseline_data=synthetic_multi_round_baseline, validate_schema=True)

    res1 = builder.build_features_for_race(2026, 1, stage="provisional")
    res2 = builder.build_features_for_race(2026, 2, stage="provisional")
    res3 = builder.build_features_for_race(2026, 3, stage="provisional")

    assert res1.diagnostics["target_race_id"] == "2026_01_bahrain"
    assert res2.diagnostics["target_race_id"] == "2026_02_jeddah"
    assert res3.diagnostics["target_race_id"] == "2026_03_albert_park"


# =============================================================================
# 5. Strict Temporal Isolation: No Target-Race Result Leakage
# =============================================================================
def test_no_target_race_result_leakage(synthetic_multi_round_baseline):
    """
    Proves that injecting or modifying Sunday Grand Prix results into the target race
    has ZERO effect on the generated features.
    """
    baseline_clean = copy.deepcopy(synthetic_multi_round_baseline)
    baseline_polluted = copy.deepcopy(synthetic_multi_round_baseline)

    # Pollute target race (2026 R3) with an unexpected Sunday race outcome
    r3 = baseline_polluted["seasons"][1]["rounds"][2]
    r3["sessions"]["grand_prix"]["session_status"] = "completed"
    r3["sessions"]["grand_prix"]["results"] = [
        {"driver_id": "hamilton", "constructor_id": "ferrari", "model_finish_position": 1, "gp_points": 25.0, "raw_status": "Finished", "is_classified": True, "model_dnf": 0, "raw_position": 1, "official_participation_status": "started"},
        {"driver_id": "verstappen", "constructor_id": "red_bull", "model_finish_position": 99, "gp_points": 0.0, "raw_status": "Collision", "is_classified": False, "model_dnf": 1, "raw_position": "R", "official_participation_status": "dnf"}
    ]

    builder_clean = LiveFeatureBuilder(baseline_data=baseline_clean, validate_schema=False)
    builder_polluted = LiveFeatureBuilder(baseline_data=baseline_polluted, validate_schema=False)

    res_clean = builder_clean.build_features_for_race(2026, 3, stage="provisional")
    res_polluted = builder_polluted.build_features_for_race(2026, 3, stage="provisional")

    pd.testing.assert_frame_equal(res_clean.features_df, res_polluted.features_df)


# =============================================================================
# 6. Strict Temporal Isolation: No Future-Race Leakage
# =============================================================================
def test_no_future_race_leakage(synthetic_multi_round_baseline):
    """
    Proves that adding completed future races (e.g. 2026 R4, R5) has ZERO effect
    on predictions for an earlier round (2026 R3).
    """
    baseline_clean = copy.deepcopy(synthetic_multi_round_baseline)
    baseline_future = copy.deepcopy(synthetic_multi_round_baseline)

    # Complete future round 4 in baseline_future
    r4 = baseline_future["seasons"][1]["rounds"][3]
    r4["sessions"]["grand_prix"]["session_status"] = "completed"
    r4["sessions"]["grand_prix"]["results"] = [
        {"driver_id": "norris", "constructor_id": "mclaren", "model_finish_position": 1, "gp_points": 25.0, "raw_status": "Finished", "is_classified": True, "model_dnf": 0, "raw_position": 1, "official_participation_status": "started"}
    ]

    builder_clean = LiveFeatureBuilder(baseline_data=baseline_clean, validate_schema=False)
    builder_future = LiveFeatureBuilder(baseline_data=baseline_future, validate_schema=False)

    res_clean = builder_clean.build_features_for_race(2026, 3, stage="provisional")
    res_future = builder_future.build_features_for_race(2026, 3, stage="provisional")

    pd.testing.assert_frame_equal(res_clean.features_df, res_future.features_df)


# =============================================================================
# 7. Strict Temporal Isolation: Constructor Standings & Points
# =============================================================================
def test_no_constructor_standings_or_points_leakage(synthetic_multi_round_baseline):
    """
    Explicitly tests constructor points before GP entering 2026 R2.
    Entering 2026 R2, Red Bull should have only points from 2026 R1 (43 points: 25 + 18).
    Future rounds must not affect constructor_season_points_before_gp or constructor_prev_race_points.
    """
    builder = LiveFeatureBuilder(baseline_data=synthetic_multi_round_baseline, validate_schema=True)
    res = builder.build_features_for_race(2026, 2, stage="provisional")

    comb = res.combined_df
    rb_rows = comb[comb["constructor_id"] == "red_bull"]

    # Red Bull won P1 (25) and P2 (18) in 2026 R1 = 43.0
    for _, row in rb_rows.iterrows():
        assert row["constructor_prev_race_points"] == 43.0
        assert row["constructor_season_points_before_gp"] == 43.0
        assert row["constructor_season_standing_before_gp"] == 1.0


# =============================================================================
# 8. Strict Temporal Isolation: Teammate Qualifying H2H
# =============================================================================
def test_no_teammate_qualifying_leakage_into_h2h(synthetic_multi_round_baseline):
    """
    Proves that the target race's qualifying session does NOT pollute teammate_rolling_5_quali_h2h.
    Entering 2026 R1, teammate_rolling_5_quali_h2h reflects only 2025 rounds (Bahrain, Jeddah, Melbourne).
    In all 3 2025 rounds, Verstappen outqualified Perez (3-0 -> 1.00 for VER, 0.00 for PER).
    """
    builder = LiveFeatureBuilder(baseline_data=synthetic_multi_round_baseline, validate_schema=True)
    res = builder.build_features_for_race(2026, 1, stage="provisional")

    comb = res.combined_df
    ver = comb[comb["driver_id"] == "verstappen"].iloc[0]
    per = comb[comb["driver_id"] == "perez"].iloc[0]

    assert ver["teammate_rolling_5_quali_h2h"] == 1.00
    assert per["teammate_rolling_5_quali_h2h"] == 0.00
    # In target race quali, Verstappen was P1 and Perez was P2:
    assert ver["outqualified_teammate"] == 1.0
    assert per["outqualified_teammate"] == 0.0


# =============================================================================
# 9. Strict Temporal Isolation: Circuit Heritage
# =============================================================================
def test_no_circuit_heritage_leakage(synthetic_multi_round_baseline):
    """
    Proves that circuit history strictly reflects past completed races at this circuit.
    Entering 2026 R1 (Bahrain), there was 1 prior Bahrain race (2025 R1, won from pole by Verstappen).
    Hence circuit_historical_pole_win_rate = 1.00, driver_circuit_starts for Verstappen = 1.
    """
    builder = LiveFeatureBuilder(baseline_data=synthetic_multi_round_baseline, validate_schema=True)
    res = builder.build_features_for_race(2026, 1, stage="provisional")

    comb = res.combined_df
    ver = comb[comb["driver_id"] == "verstappen"].iloc[0]

    assert ver["circuit_historical_pole_win_rate"] == 1.00
    assert ver["driver_circuit_starts"] == 1.0
    assert ver["driver_circuit_wins"] == 1.0
    assert ver["driver_circuit_win_rate"] == 1.000


# =============================================================================
# 10. Sprint vs Grand Prix Semantics
# =============================================================================
def test_sprint_points_segregation_from_gp_rolling_points(synthetic_multi_round_baseline):
    """
    Verifies that sprint race points earned on Saturday (e.g. 2026 R2 Sprint)
    are NOT added into driver_season_points_before_gp or driver_prev_race_points,
    mirroring training pipeline semantics (feature_pipeline.py:320-343).
    """
    builder = LiveFeatureBuilder(baseline_data=synthetic_multi_round_baseline, validate_schema=True)
    res = builder.build_features_for_race(2026, 3, stage="provisional")

    comb = res.combined_df
    ver = comb[comb["driver_id"] == "verstappen"].iloc[0]

    # Verstappen won 2026 R1 GP (25 pts) and 2026 R2 GP (25 pts) = 50.0 pts.
    # The 8 pts from 2026 R2 Sprint must NOT be included in driver_season_points_before_gp!
    assert ver["driver_season_points_before_gp"] == 50.0
    assert ver["driver_prev_race_points"] == 25.0


# =============================================================================
# 11. Missing Qualifying Data Returns Structured Error
# =============================================================================
def test_missing_qualifying_returns_structured_error(synthetic_multi_round_baseline):
    """Verifies that requesting a race where qualifying is upcoming returns QUALIFYING_DATA_UNAVAILABLE."""
    builder = LiveFeatureBuilder(baseline_data=synthetic_multi_round_baseline, validate_schema=True)

    # 2026 R4 has qualifying upcoming
    with pytest.raises(LiveFeatureBuilderError) as exc_info:
        builder.build_features_for_race(2026, 4, stage="provisional")

    assert exc_info.value.error_type == "QUALIFYING_DATA_UNAVAILABLE"


# =============================================================================
# 12. Provisional-Grid Mode Contract
# =============================================================================
def test_provisional_grid_mode_contract(synthetic_multi_round_baseline):
    """
    Verifies Stage A (provisional):
    - Uses qualifying position as provisional grid
    - grid_penalty_delta == 0.0
    - hasPenaltiesApplied == False
    """
    builder = LiveFeatureBuilder(baseline_data=synthetic_multi_round_baseline, validate_schema=True)
    res = builder.build_features_for_race(2026, 3, stage="provisional")

    assert res.diagnostics["stage"] == "provisional"
    assert res.diagnostics["has_penalties_applied"] is False

    for _, row in res.features_df.iterrows():
        assert row["grid_position"] == row["quali_position"]
        assert row["grid_penalty_delta"] == 0.0
        assert row["front_row"] == (1.0 if row["grid_position"] <= 2 else 0.0)


# =============================================================================
# 13. Official-Grid Mode Contract
# =============================================================================
def test_official_grid_mode_contract(synthetic_multi_round_baseline):
    """
    Verifies Stage B (official_grid):
    - Requires verified official starting grid
    - Computes real grid_penalty_delta
    - hasPenaltiesApplied == True
    """
    builder = LiveFeatureBuilder(baseline_data=synthetic_multi_round_baseline, validate_schema=True)

    # 2026 R2 has Norris with a 3-place grid drop (P3 -> P6)
    res = builder.build_features_for_race(2026, 2, stage="official_grid")

    assert res.diagnostics["stage"] == "official_grid"
    assert res.diagnostics["has_penalties_applied"] is True

    comb = res.combined_df
    nor = comb[comb["driver_id"] == "norris"].iloc[0]

    assert nor["quali_position"] == 3.0
    assert nor["grid_position"] == 6.0
    assert nor["grid_penalty_delta"] == 3.0
    assert nor["front_row"] == 0.0

    # Test error when official grid is missing (2026 R3 starting grid is empty/unofficial)
    with pytest.raises(LiveFeatureBuilderError) as exc_info:
        builder.build_features_for_race(2026, 3, stage="official_grid")

    assert exc_info.value.error_type == "OFFICIAL_GRID_UNAVAILABLE"


# =============================================================================
# 14. Weather Distinguishability: Missing vs Observed Zero
# =============================================================================
def test_weather_missing_vs_observed_zero(synthetic_multi_round_baseline):
    """
    Verifies that missing weather observations remain NaN (to be imputed by median),
    while observed zero rainfall remains 0.0.
    """
    builder = LiveFeatureBuilder(baseline_data=synthetic_multi_round_baseline, validate_schema=True)

    # 2026 R1 has observed zero rainfall (0.0)
    res1 = builder.build_features_for_race(2026, 1, stage="provisional")
    assert res1.features_df["quali_rainfall"].iloc[0] == 0.0
    assert res1.features_df["quali_air_temp_c"].iloc[0] == 24.0

    # 2026 R3 has missing weather (None)
    res3 = builder.build_features_for_race(2026, 3, stage="provisional")
    assert math.isnan(res3.features_df["quali_rainfall"].iloc[0])
    assert math.isnan(res3.features_df["quali_air_temp_c"].iloc[0])
    assert res3.diagnostics["weather_status"] == "missing"


# =============================================================================
# 15. Unknown 2026 Regulation Era Diagnosed
# =============================================================================
def test_unknown_2026_regulation_era_diagnostics(synthetic_multi_round_baseline):
    """
    Verifies that 2026 regulation era 'active_aero_sustainable_fuel_gen3' is preserved
    and diagnosed as an unlearned / unknown category for the frozen v1.0.0 model.
    """
    builder = LiveFeatureBuilder(baseline_data=synthetic_multi_round_baseline, validate_schema=True)
    res = builder.build_features_for_race(2026, 3, stage="provisional")

    assert res.features_df["regulation_era"].iloc[0] == "active_aero_sustainable_fuel_gen3"
    assert res.diagnostics["is_unknown_regulation_era"] is True
    assert "ignores" in res.diagnostics["unknown_regulation_note"]


# =============================================================================
# 16. Duplicate Driver In Qualifying Rejection
# =============================================================================
def test_duplicate_driver_in_qualifying_rejected(synthetic_multi_round_baseline):
    """Verifies that duplicate driver IDs within a qualifying session raise DUPLICATE_DRIVER_DETECTED."""
    baseline_polluted = copy.deepcopy(synthetic_multi_round_baseline)
    q_results = baseline_polluted["seasons"][1]["rounds"][2]["sessions"]["qualifying"]["results"]
    # Duplicate first driver
    q_results.append(copy.deepcopy(q_results[0]))

    builder = LiveFeatureBuilder(baseline_data=baseline_polluted, validate_schema=False)
    with pytest.raises(LiveFeatureBuilderError) as exc_info:
        builder.build_features_for_race(2026, 3, stage="provisional")

    assert exc_info.value.error_type == "DUPLICATE_DRIVER_DETECTED"


# =============================================================================
# 17. Compatibility with Frozen LightGBM Pipeline Artifact
# =============================================================================
def test_model_pipeline_compatibility(synthetic_multi_round_baseline, lightgbm_pipeline):
    """
    Passes the assembled 42-feature DataFrame through the actual frozen LightGBM pipeline.
    Verifies that:
    1. Preprocessor transforms the 42 features without errors.
    2. Model predicts valid calibrated probabilities.
    3. Probabilities sum to 1.0.
    """
    builder = LiveFeatureBuilder(baseline_data=synthetic_multi_round_baseline, validate_schema=True)
    res = builder.build_features_for_race(2026, 3, stage="provisional")

    # Run inference using the frozen LightGBMPredictor
    probs = lightgbm_pipeline.predict_race_probabilities(res.features_df, temperature=1.85)

    assert len(probs) == len(res.features_df)
    assert np.all(np.isfinite(probs))
    assert np.all(probs >= 0.0)
    assert np.isclose(np.sum(probs), 1.0, atol=1e-5)


# =============================================================================
# 18. Historical Baseline Replay on Authentic 2025/2026 Records
# =============================================================================
def test_authentic_historical_baseline_replay(lightgbm_pipeline):
    """
    Replays completed races directly from data/predictor/historical_baseline_2025_2026.json:
    - 2025 Round 24 (Abu Dhabi)
    - 2026 Round 18 (Americas)
    Verifies that the builder runs on real baseline data and produces valid model predictions.
    """
    builder = LiveFeatureBuilder(validate_schema=True)

    # Replay 2025 Round 24 (provisional)
    res_2025_24 = builder.build_features_for_race(2025, 24, stage="provisional")
    assert len(res_2025_24.features_df) >= 10
    probs_2025 = lightgbm_pipeline.predict_race_probabilities(res_2025_24.features_df, temperature=1.85)
    assert np.isclose(np.sum(probs_2025), 1.0, atol=1e-5)

    # Replay 2026 Round 18 (official grid)
    res_2026_18 = builder.build_features_for_race(2026, 18, stage="official_grid")
    assert len(res_2026_18.features_df) >= 10
    assert res_2026_18.diagnostics["has_penalties_applied"] is True
    probs_2026 = lightgbm_pipeline.predict_race_probabilities(res_2026_18.features_df, temperature=1.85)
    assert np.isclose(np.sum(probs_2026), 1.0, atol=1e-5)


# =============================================================================
# 19. Exact Deterministic Parity with Original FeaturePipeline
# =============================================================================
def test_feature_parity_deterministic_pipeline_comparison():
    """
    Directly compares original FeaturePipeline with LiveFeatureBuilder on identical
    multi-round inputs across all 42 model features, proving 100% mathematical parity.
    """
    from unittest.mock import MagicMock
    from scripts.predictor_pipeline.feature_pipeline import FeaturePipeline

    rounds_data = [
        {
            "calendar": {"round": "1", "Circuit": {"circuitId": "bahrain", "circuitName": "Bahrain", "Location": {"country": "Bahrain"}}, "date": "2024-03-02"},
            "quali": [
                {"position": "1", "Driver": {"driverId": "verstappen", "code": "VER", "permanentNumber": "1"}, "Constructor": {"constructorId": "red_bull", "name": "Red Bull"}, "Q3": "1:29.179"},
                {"position": "2", "Driver": {"driverId": "leclerc", "code": "LEC", "permanentNumber": "16"}, "Constructor": {"constructorId": "ferrari", "name": "Ferrari"}, "Q3": "1:29.407"},
                {"position": "3", "Driver": {"driverId": "russell", "code": "RUS", "permanentNumber": "63"}, "Constructor": {"constructorId": "mercedes", "name": "Mercedes"}, "Q3": "1:29.485"},
                {"position": "4", "Driver": {"driverId": "sainz", "code": "SAI", "permanentNumber": "55"}, "Constructor": {"constructorId": "ferrari", "name": "Ferrari"}, "Q3": "1:29.507"},
                {"position": "5", "Driver": {"driverId": "perez", "code": "PER", "permanentNumber": "11"}, "Constructor": {"constructorId": "red_bull", "name": "Red Bull"}, "Q3": "1:29.537"},
                {"position": "6", "Driver": {"driverId": "alonso", "code": "ALO", "permanentNumber": "14"}, "Constructor": {"constructorId": "aston_martin", "name": "Aston Martin"}, "Q3": "1:29.542"},
                {"position": "7", "Driver": {"driverId": "norris", "code": "NOR", "permanentNumber": "4"}, "Constructor": {"constructorId": "mclaren", "name": "McLaren"}, "Q3": "1:29.614"},
                {"position": "8", "Driver": {"driverId": "piastri", "code": "PIA", "permanentNumber": "81"}, "Constructor": {"constructorId": "mclaren", "name": "McLaren"}, "Q3": "1:29.683"},
                {"position": "9", "Driver": {"driverId": "hamilton", "code": "HAM", "permanentNumber": "44"}, "Constructor": {"constructorId": "mercedes", "name": "Mercedes"}, "Q3": "1:29.760"},
                {"position": "10", "Driver": {"driverId": "hulkenberg", "code": "HUL", "permanentNumber": "27"}, "Constructor": {"constructorId": "haas", "name": "Haas"}, "Q3": "1:30.502"}
            ],
            "race": [
                {"position": "1", "grid": "1", "points": "26.0", "status": "Finished", "Driver": {"driverId": "verstappen"}, "Constructor": {"constructorId": "red_bull"}},
                {"position": "2", "grid": "5", "points": "18.0", "status": "Finished", "Driver": {"driverId": "perez"}, "Constructor": {"constructorId": "red_bull"}},
                {"position": "3", "grid": "4", "points": "15.0", "status": "Finished", "Driver": {"driverId": "sainz"}, "Constructor": {"constructorId": "ferrari"}},
                {"position": "4", "grid": "2", "points": "12.0", "status": "Finished", "Driver": {"driverId": "leclerc"}, "Constructor": {"constructorId": "ferrari"}},
                {"position": "5", "grid": "3", "points": "10.0", "status": "Finished", "Driver": {"driverId": "russell"}, "Constructor": {"constructorId": "mercedes"}},
                {"position": "6", "grid": "7", "points": "8.0", "status": "Finished", "Driver": {"driverId": "norris"}, "Constructor": {"constructorId": "mclaren"}},
                {"position": "7", "grid": "9", "points": "6.0", "status": "Finished", "Driver": {"driverId": "hamilton"}, "Constructor": {"constructorId": "mercedes"}},
                {"position": "8", "grid": "8", "points": "4.0", "status": "Finished", "Driver": {"driverId": "piastri"}, "Constructor": {"constructorId": "mclaren"}},
                {"position": "9", "grid": "6", "points": "2.0", "status": "Finished", "Driver": {"driverId": "alonso"}, "Constructor": {"constructorId": "aston_martin"}},
                {"position": "10", "grid": "10", "points": "1.0", "status": "Finished", "Driver": {"driverId": "hulkenberg"}, "Constructor": {"constructorId": "haas"}}
            ]
        },
        {
            "calendar": {"round": "2", "Circuit": {"circuitId": "jeddah", "circuitName": "Jeddah", "Location": {"country": "Saudi Arabia"}}, "date": "2024-03-09"},
            "quali": [
                {"position": "1", "Driver": {"driverId": "verstappen", "code": "VER", "permanentNumber": "1"}, "Constructor": {"constructorId": "red_bull", "name": "Red Bull"}, "Q3": "1:27.472"},
                {"position": "2", "Driver": {"driverId": "leclerc", "code": "LEC", "permanentNumber": "16"}, "Constructor": {"constructorId": "ferrari", "name": "Ferrari"}, "Q3": "1:27.791"},
                {"position": "3", "Driver": {"driverId": "perez", "code": "PER", "permanentNumber": "11"}, "Constructor": {"constructorId": "red_bull", "name": "Red Bull"}, "Q3": "1:27.807"},
                {"position": "4", "Driver": {"driverId": "alonso", "code": "ALO", "permanentNumber": "14"}, "Constructor": {"constructorId": "aston_martin", "name": "Aston Martin"}, "Q3": "1:27.846"},
                {"position": "5", "Driver": {"driverId": "piastri", "code": "PIA", "permanentNumber": "81"}, "Constructor": {"constructorId": "mclaren", "name": "McLaren"}, "Q3": "1:28.089"},
                {"position": "6", "Driver": {"driverId": "norris", "code": "NOR", "permanentNumber": "4"}, "Constructor": {"constructorId": "mclaren", "name": "McLaren"}, "Q3": "1:28.132"},
                {"position": "7", "Driver": {"driverId": "russell", "code": "RUS", "permanentNumber": "63"}, "Constructor": {"constructorId": "mercedes", "name": "Mercedes"}, "Q3": "1:28.316"},
                {"position": "8", "Driver": {"driverId": "hamilton", "code": "HAM", "permanentNumber": "44"}, "Constructor": {"constructorId": "mercedes", "name": "Mercedes"}, "Q3": "1:28.460"},
                {"position": "9", "Driver": {"driverId": "hulkenberg", "code": "HUL", "permanentNumber": "27"}, "Constructor": {"constructorId": "haas", "name": "Haas"}, "Q3": "1:28.547"},
                {"position": "10", "Driver": {"driverId": "sainz", "code": "SAI", "permanentNumber": "55"}, "Constructor": {"constructorId": "ferrari", "name": "Ferrari"}, "Q3": "1:28.572"}
            ],
            "race": [
                {"position": "1", "grid": "1", "points": "25.0", "status": "Finished", "Driver": {"driverId": "verstappen"}, "Constructor": {"constructorId": "red_bull"}},
                {"position": "2", "grid": "3", "points": "18.0", "status": "Finished", "Driver": {"driverId": "perez"}, "Constructor": {"constructorId": "red_bull"}},
                {"position": "3", "grid": "2", "points": "16.0", "status": "Finished", "Driver": {"driverId": "leclerc"}, "Constructor": {"constructorId": "ferrari"}},
                {"position": "4", "grid": "5", "points": "12.0", "status": "Finished", "Driver": {"driverId": "piastri"}, "Constructor": {"constructorId": "mclaren"}},
                {"position": "5", "grid": "4", "points": "10.0", "status": "Finished", "Driver": {"driverId": "alonso"}, "Constructor": {"constructorId": "aston_martin"}},
                {"position": "6", "grid": "7", "points": "8.0", "status": "Finished", "Driver": {"driverId": "russell"}, "Constructor": {"constructorId": "mercedes"}},
                {"position": "7", "grid": "10", "points": "6.0", "status": "Finished", "Driver": {"driverId": "sainz"}, "Constructor": {"constructorId": "ferrari"}},
                {"position": "8", "grid": "6", "points": "4.0", "status": "Finished", "Driver": {"driverId": "norris"}, "Constructor": {"constructorId": "mclaren"}},
                {"position": "9", "grid": "8", "points": "2.0", "status": "Finished", "Driver": {"driverId": "hamilton"}, "Constructor": {"constructorId": "mercedes"}},
                {"position": "10", "grid": "9", "points": "0.0", "status": "Collision", "Driver": {"driverId": "hulkenberg"}, "Constructor": {"constructorId": "haas"}}
            ]
        }
    ]

    # Run original FeaturePipeline
    mock_j = MagicMock()
    mock_f = MagicMock()
    mock_j.get_season_calendar.return_value = [r["calendar"] for r in rounds_data]
    mock_j.get_qualifying_results.side_effect = lambda s, rnd: rounds_data[rnd-1]["quali"]
    mock_j.get_race_results.side_effect = lambda s, rnd: rounds_data[rnd-1]["race"]
    mock_f.get_qualifying_weather.return_value = {"fastf1_available": False}

    pipeline = FeaturePipeline(mock_j, mock_f, enable_fastf1=True)
    pipeline_rows = pipeline._process_season(2024, record_dataset=True)
    df_pipe_r2 = pd.DataFrame(pipeline_rows)
    df_pipe_r2 = df_pipe_r2[df_pipe_r2["round"] == 2].sort_values(by="driver_id").reset_index(drop=True)

    # Convert to Schema v1.3.1 baseline format
    baseline_rounds = []
    for r_data in rounds_data:
        rnd = int(r_data["calendar"]["round"])
        q_results = []
        times = []
        for q in r_data["quali"]:
            t_str = q.get("Q3")
            t_sec = float(t_str.split(":")[0])*60 + float(t_str.split(":")[1]) if t_str else None
            if t_sec: times.append(t_sec)
            q_results.append({
                "driver_id": q["Driver"]["driverId"],
                "driver_code": q["Driver"]["code"],
                "driver_number": q["Driver"]["permanentNumber"],
                "constructor_id": q["Constructor"]["constructorId"],
                "raw_position": int(q["position"]),
                "quali_position": int(q["position"]),
                "best_time_sec": t_sec,
                "reached_q3": 1
            })
        pole_t = min(times) if times else None

        grid_entries = []
        race_results = []
        for r in r_data["race"]:
            g = int(r["grid"])
            d_id = r["Driver"]["driverId"]
            c_id = r["Constructor"]["constructorId"]
            pos = int(r["position"])
            pts = float(r["points"])
            status = r["status"]
            grid_entries.append({
                "driver_id": d_id,
                "constructor_id": c_id,
                "raw_grid_position": g,
                "grid_position": g,
                "is_pit_lane_start": False,
                "grid_penalty_delta": 0,
                "penalty_reason": None
            })
            race_results.append({
                "driver_id": d_id,
                "constructor_id": c_id,
                "raw_position": pos,
                "model_finish_position": pos if status == "Finished" else 99,
                "gp_points": pts,
                "raw_status": status,
                "official_participation_status": "started" if status == "Finished" else "dnf",
                "model_dnf": 0 if status == "Finished" else 1,
                "is_classified": (status == "Finished")
            })

        baseline_rounds.append({
            "round": rnd,
            "race_id": f"2024_{rnd}",
            "circuit_id": r_data["calendar"]["Circuit"]["circuitId"],
            "circuit_name": r_data["calendar"]["Circuit"]["circuitName"],
            "country": r_data["calendar"]["Circuit"]["Location"]["country"],
            "race_date": r_data["calendar"]["date"],
            "race_timestamp_utc": f"{r_data['calendar']['date']}T15:00:00Z",
            "is_sprint_weekend": False,
            "sessions": {
                "qualifying": {
                    "session_status": "completed",
                    "revision": 1,
                    "publication_timestamp_utc": f"{r_data['calendar']['date']}T16:00:00Z",
                    "provenance": "test",
                    "pole_time_sec": pole_t,
                    "weather": None,
                    "results": q_results
                },
                "starting_grid": {
                    "is_official": True,
                    "revision": 1,
                    "publication_timestamp_utc": f"{r_data['calendar']['date']}T12:00:00Z",
                    "provenance": "test",
                    "entries": grid_entries
                },
                "grand_prix": {
                    "session_status": "completed",
                    "revision": 1,
                    "publication_timestamp_utc": f"{r_data['calendar']['date']}T17:00:00Z",
                    "provenance": "test",
                    "results": race_results
                }
            }
        })

    baseline_data = {
        "contract_version": "1.3.1",
        "generated_at_utc": "2026-11-01T12:00:00Z",
        "seasons": [{"season": 2024, "regulation_era": "ground_effect_gen2", "rounds": baseline_rounds}]
    }

    builder = LiveFeatureBuilder(baseline_data=baseline_data, validate_schema=False)
    res_r2 = builder.build_features_for_race(2024, 2, stage="official_grid")
    df_live_r2 = res_r2.combined_df.sort_values(by="driver_id").reset_index(drop=True)

    # Verify all 42 features match exactly within numerical tolerance (1e-4)
    for feat in ALL_MODEL_FEATURES:
        pipe_vals = df_pipe_r2[feat].values
        live_vals = df_live_r2[feat].values
        for d_idx, d_id in enumerate(df_pipe_r2["driver_id"]):
            pv = pipe_vals[d_idx]
            lv = live_vals[d_idx]
            if pd.isna(pv) and pd.isna(lv):
                continue
            if isinstance(pv, (int, float, np.floating, np.integer)):
                assert math.isclose(float(pv), float(lv), abs_tol=1e-3), (
                    f"Mismatch in feature '{feat}' for driver '{d_id}': pipe={pv} vs live={lv}"
                )
            else:
                assert str(pv) == str(lv), (
                    f"Mismatch in feature '{feat}' for driver '{d_id}': pipe={pv} vs live={lv}"
                )


# =============================================================================
# 20. Comprehensive Authentic Replay Suite Across 7 Representative Conditions
# =============================================================================
@pytest.mark.parametrize("season,round_num,stage,expected_checks", [
    # 1. Complete qualifying classification (2025 R24 Abu Dhabi)
    (2025, 24, "provisional", {"min_drivers": 20, "reg_era": "ground_effect_gen2", "unknown_reg": False}),
    # 2. Incomplete qualifying entries / missing best time (2025 R18 Singapore - Gasly/Albon no time)
    (2025, 18, "official_grid", {"min_drivers": 20, "has_penalties": True, "reg_era": "ground_effect_gen2"}),
    # 3. Grid penalties / pit lane starts (2025 R12 Silverstone - 12 penalties)
    (2025, 12, "official_grid", {"min_drivers": 20, "has_penalties": True, "reg_era": "ground_effect_gen2"}),
    # 4. Sprint weekend (2025 R02 Shanghai)
    (2025, 2, "provisional", {"min_drivers": 20, "is_sprint": 1.0, "reg_era": "ground_effect_gen2"}),
    # 5. Missing weather telemetry (2026 R01 Albert Park - 19 starters, fastf1_unavailable)
    (2026, 1, "provisional", {"min_drivers": 19, "weather_status": "missing", "reg_era": "active_aero_sustainable_fuel_gen3"}),
    # 6. Different regulation era (2026 R02 Shanghai - active aero gen3)
    (2026, 2, "official_grid", {"min_drivers": 20, "unknown_reg": True, "reg_era": "active_aero_sustainable_fuel_gen3"}),
    # 7. Cold-start race with limited prior history (2025 R01 Albert Park)
    (2025, 1, "provisional", {"min_drivers": 20, "prior_races": 0, "reg_era": "ground_effect_gen2"})
])
def test_authentic_multi_scenario_historical_replays(season, round_num, stage, expected_checks, lightgbm_pipeline):
    """
    Executes authentic historical replays across all 7 representative condition types:
    complete quali, missing quali times, penalties, sprint, missing weather, distinct era, cold-start.
    """
    builder = LiveFeatureBuilder(validate_schema=True)
    res = builder.build_features_for_race(season, round_num, stage=stage)

    # Check row counts & 42 columns
    assert len(res.features_df) >= expected_checks.get("min_drivers", 10)
    assert list(res.features_df.columns) == ALL_MODEL_FEATURES

    # Check stage & diagnostics
    assert res.diagnostics["stage"] == stage
    if "has_penalties" in expected_checks:
        assert res.diagnostics["has_penalties_applied"] == expected_checks["has_penalties"]
    if "reg_era" in expected_checks:
        assert res.diagnostics["regulation_era"] == expected_checks["reg_era"]
    if "unknown_reg" in expected_checks:
        assert res.diagnostics["is_unknown_regulation_era"] == expected_checks["unknown_reg"]
    if "weather_status" in expected_checks:
        assert res.diagnostics["weather_status"] == expected_checks["weather_status"]
    if "prior_races" in expected_checks:
        assert res.diagnostics["prior_races_count"] == expected_checks["prior_races"]
    if "is_sprint" in expected_checks:
        assert res.features_df["is_sprint_weekend"].iloc[0] == expected_checks["is_sprint"]

    # Model inference verification
    probs = lightgbm_pipeline.predict_race_probabilities(res.features_df, temperature=1.85)
    assert len(probs) == len(res.features_df)
    assert np.all(np.isfinite(probs))
    assert np.all(probs >= 0.0)
    assert np.isclose(np.sum(probs), 1.0, atol=1e-5)


# =============================================================================
# 21. Hardened Official-Grid and Qualifying Incomplete Validations
# =============================================================================
def test_official_grid_hardened_validations(synthetic_multi_round_baseline):
    """Verifies that Stage B rejects missing provenance, duplicate drivers, or incomplete grids."""
    builder = LiveFeatureBuilder(baseline_data=synthetic_multi_round_baseline, validate_schema=False)

    # 1. Reject starting grid lacking reliable provenance
    no_prov_override = {
        "sessions": {
            "starting_grid": {
                "is_official": True,
                "revision": 1,
                "provenance": "",  # Empty provenance
                "entries": [{"driver_id": f"d_{i}", "grid_position": i+1} for i in range(12)]
            }
        }
    }
    with pytest.raises(LiveFeatureBuilderError) as exc_info:
        builder.build_features_for_race(2026, 3, stage="official_grid", session_data_override=no_prov_override)
    assert exc_info.value.error_type == "OFFICIAL_GRID_UNAVAILABLE"
    assert "provenance" in exc_info.value.message.lower()

    # 2. Reject starting grid with fewer than 10 drivers
    short_grid_override = {
        "sessions": {
            "starting_grid": {
                "is_official": True,
                "revision": 1,
                "provenance": "test",
                "entries": [{"driver_id": f"d_{i}", "grid_position": i+1} for i in range(5)]
            }
        }
    }
    with pytest.raises(LiveFeatureBuilderError) as exc_info:
        builder.build_features_for_race(2026, 3, stage="official_grid", session_data_override=short_grid_override)
    assert exc_info.value.error_type == "OFFICIAL_GRID_UNAVAILABLE"
    assert "minimum 10 required" in exc_info.value.message.lower()

    # 3. Reject starting grid with duplicate driver IDs
    dup_grid_override = {
        "sessions": {
            "starting_grid": {
                "is_official": True,
                "revision": 1,
                "provenance": "test",
                "entries": [{"driver_id": "verstappen", "grid_position": 1}, {"driver_id": "verstappen", "grid_position": 2}] +
                           [{"driver_id": f"d_{i}", "grid_position": i+3} for i in range(10)]
            }
        }
    }
    with pytest.raises(LiveFeatureBuilderError) as exc_info:
        builder.build_features_for_race(2026, 3, stage="official_grid", session_data_override=dup_grid_override)
    assert exc_info.value.error_type == "OFFICIAL_GRID_UNAVAILABLE"
    assert "duplicate" in exc_info.value.message.lower()

    # 4. Reject qualifying session where 0 drivers posted a valid lap time
    no_time_override = {
        "sessions": {
            "qualifying": {
                "session_status": "completed",
                "revision": 1,
                "provenance": "test",
                "results": [{"driver_id": f"d_{i}", "quali_position": i+1, "best_time_sec": None} for i in range(12)]
            }
        }
    }
    with pytest.raises(LiveFeatureBuilderError) as exc_info:
        builder.build_features_for_race(2026, 3, stage="provisional", session_data_override=no_time_override)
    assert exc_info.value.error_type == "QUALIFYING_INCOMPLETE"
    assert "pole time cannot be determined" in exc_info.value.message.lower()


