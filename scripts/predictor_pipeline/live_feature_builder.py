"""
LiveFeatureBuilder for Paddock Predictor.

Standalone, testable module that assembles the model's exact 42-feature input contract
for a single upcoming Grand Prix after qualifying data becomes available.

Key Guarantees:
1. Exact Contract Parity: Assembles all 42 features in the exact order and types
   expected by the frozen LightGBM pipeline artifact (v1.0.0).
2. Two Explicit Prediction Stages:
   - Stage A ('provisional'): Post-qualifying provisional prediction.
     Uses qualifying positions as provisional grid, grid_penalty_delta = 0.0,
     records hasPenaltiesApplied: False.
   - Stage B ('official_grid'): Authoritative starting grid prediction.
     Requires verified official grid session, computes grid_penalty_delta,
     records hasPenaltiesApplied: True.
3. Strict Temporal Isolation:
   - Excludes target race Sunday GP results, future races, and future seasons.
   - Teammate qualifying H2H strictly reflects prior qualifying sessions.
   - Constructor and driver standings strictly reflect completed rounds prior to target GP.
   - Circuit heritage strictly excludes the target event.
4. Schema v1.3.1 Compliance:
   - Validates baseline datasets using `baseline_schema.validate_baseline_schema`.
   - Recognizes authentic 2026 regulation era ('active_aero_sustainable_fuel_gen3'),
     diagnosing that it maps to unknown category in the fitted encoder.
   - Distinguishes missing weather telemetry (None / NaN) from observed zero.
5. Determinism & Safety:
   - Rejects duplicate drivers, missing qualifying sessions, or malformed inputs.
   - Does NOT invoke production APIs, mutate DB/snapshots, or retrain models.
"""

from typing import Dict, Any, List, Optional, Tuple, Union
from dataclasses import dataclass
from datetime import datetime, timezone
import json
import os
import math
import logging
import numpy as np
import pandas as pd

from scripts.predictor_model.features import (
    ALL_MODEL_FEATURES,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    METADATA_COLUMNS
)
from scripts.predictor_pipeline.baseline_schema import (
    validate_baseline_schema,
    derive_model_dnf,
    normalize_model_finish_position
)
from scripts.predictor_pipeline.config import OUTPUT_DIR, get_regulation_era
from scripts.predictor_pipeline.jolpica_extractor import parse_lap_time_str

logger = logging.getLogger("LiveFeatureBuilder")


class LiveFeatureBuilderError(Exception):
    """Structured exception for LiveFeatureBuilder failures."""
    def __init__(self, error_type: str, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(f"[{error_type}] {message}")
        self.error_type = error_type
        self.message = message
        self.details = details or {}


@dataclass
class LiveFeatureResult:
    """Encapsulates the output of a live feature assembly run."""
    features_df: pd.DataFrame
    metadata_df: pd.DataFrame
    combined_df: pd.DataFrame
    diagnostics: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "status": "success",
            "diagnostics": self.diagnostics,
            "drivers": self.combined_df.to_dict(orient="records"),
            "driver_count": len(self.combined_df)
        }


class LiveFeatureBuilder:
    """
    Builds the model's exact 42-feature vector for a single target Grand Prix.
    """
    def __init__(
        self,
        baseline_path: Optional[str] = None,
        baseline_data: Optional[Dict[str, Any]] = None,
        validate_schema: bool = True
    ):
        """
        Initializes the builder with historical baseline data.

        Args:
            baseline_path: Path to baseline JSON file. If None and baseline_data is None,
                           defaults to data/predictor/historical_baseline_2025_2026.json.
            baseline_data: Raw baseline dictionary. Takes precedence over baseline_path.
            validate_schema: If True, validates baseline_data against Schema v1.3.1.
        """
        if baseline_data is not None:
            self.baseline_data = baseline_data
            self.baseline_path = baseline_path or "<in-memory>"
        else:
            default_path = os.path.join(OUTPUT_DIR, "historical_baseline_2025_2026.json")
            target_path = baseline_path or default_path
            if not os.path.exists(target_path):
                raise LiveFeatureBuilderError(
                    "BASELINE_NOT_FOUND",
                    f"Baseline dataset file not found at: {target_path}"
                )
            with open(target_path, "r", encoding="utf-8") as f:
                self.baseline_data = json.load(f)
            self.baseline_path = target_path

        if validate_schema:
            is_valid, validation_errors = validate_baseline_schema(self.baseline_data)
            if not is_valid:
                raise LiveFeatureBuilderError(
                    "BASELINE_INVALID",
                    f"Baseline dataset failed Schema v1.3.1 validation ({len(validation_errors)} errors)",
                    details={"errors": validation_errors[:10]}
                )

    def _find_target_round(
        self,
        season: int,
        round_num: int,
        override_data: Optional[Dict[str, Any]] = None
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Locates the target season object and round object in baseline or override.
        Returns (season_obj, round_obj).
        """
        # Look for target season in baseline
        target_season_obj = None
        for s_obj in self.baseline_data.get("seasons", []):
            if s_obj.get("season") == season:
                target_season_obj = s_obj
                break

        target_round_obj = None
        if target_season_obj is not None:
            for r_obj in target_season_obj.get("rounds", []):
                if r_obj.get("round") == round_num:
                    target_round_obj = r_obj
                    break

        # If override data is provided, merge or use it
        if override_data is not None:
            if target_round_obj is None:
                target_round_obj = override_data
            else:
                # Merge: override takes precedence for sessions and metadata
                merged_round = dict(target_round_obj)
                for k, v in override_data.items():
                    if k == "sessions" and isinstance(v, dict):
                        merged_sessions = dict(merged_round.get("sessions", {}))
                        merged_sessions.update(v)
                        merged_round["sessions"] = merged_sessions
                    else:
                        merged_round[k] = v
                target_round_obj = merged_round

        if target_round_obj is None:
            raise LiveFeatureBuilderError(
                "TARGET_RACE_NOT_FOUND",
                f"Target race for season {season} round {round_num} not found in baseline or override."
            )

        # If season object was not in baseline, synthesize a season container
        if target_season_obj is None:
            reg_era = target_round_obj.get("regulation_era") or get_regulation_era(season)
            target_season_obj = {
                "season": season,
                "regulation_era": reg_era,
                "rounds": [target_round_obj]
            }

        return target_season_obj, target_round_obj

    def _extract_prior_history(
        self,
        target_season: int,
        target_round_num: int
    ) -> Tuple[
        Dict[str, List[Dict[str, Any]]],   # driver_race_history
        Dict[str, List[Dict[str, Any]]],   # constructor_race_history
        Dict[Tuple[str, str], List[bool]], # teammate_quali_history
        Dict[str, List[Dict[str, Any]]],   # circuit_history
        Dict[str, float],                  # driver_season_points
        Dict[str, float]                   # constructor_season_points
    ]:
        """
        Chronologically accumulates rolling state strictly prior to (target_season, target_round_num).
        Guarantees 100% isolation from target race and future races.
        """
        driver_race_history: Dict[str, List[Dict[str, Any]]] = {}
        constructor_race_history: Dict[str, List[Dict[str, Any]]] = {}
        teammate_quali_history: Dict[Tuple[str, str], List[bool]] = {}
        circuit_history: Dict[str, List[Dict[str, Any]]] = {}
        driver_season_points: Dict[str, float] = {}
        constructor_season_points: Dict[str, float] = {}

        # 1. Collect all completed prior rounds across all baseline seasons
        prior_rounds: List[Tuple[int, int, Dict[str, Any]]] = []
        for s_obj in self.baseline_data.get("seasons", []):
            s_val = s_obj.get("season", 0)
            for r_obj in s_obj.get("rounds", []):
                r_val = r_obj.get("round", 0)
                # Strict chronological filter:
                if s_val < target_season or (s_val == target_season and r_val < target_round_num):
                    # Only include completed Grand Prix events
                    gp_sess = r_obj.get("sessions", {}).get("grand_prix", {})
                    if gp_sess.get("session_status") == "completed":
                        prior_rounds.append((s_val, r_val, r_obj))

        # Sort chronologically by (season, round)
        prior_rounds.sort(key=lambda x: (x[0], x[1]))

        # 2. Sequential rolling state accumulation
        for s_val, r_val, r_obj in prior_rounds:
            sessions = r_obj.get("sessions", {})
            circuit_id = r_obj.get("circuit_id", "")
            race_date = r_obj.get("race_date", "")

            # A. Process Qualifying for Teammate H2H history
            q_sess = sessions.get("qualifying", {})
            if q_sess.get("session_status") == "completed":
                q_results = q_sess.get("results", [])
                c_drivers: Dict[str, List[Dict[str, Any]]] = {}
                for q in q_results:
                    c_id = q.get("constructor_id", "")
                    c_drivers.setdefault(c_id, []).append(q)

                for c_id, drivers in c_drivers.items():
                    if len(drivers) == 2:
                        d1_id = drivers[0].get("driver_id", "")
                        d2_id = drivers[1].get("driver_id", "")
                        pos1 = int(drivers[0].get("quali_position", 20))
                        pos2 = int(drivers[1].get("quali_position", 20))
                        pair_key = tuple(sorted([d1_id, d2_id]))
                        winner_is_first = (pos1 < pos2) if d1_id == pair_key[0] else (pos2 < pos1)
                        teammate_quali_history.setdefault(pair_key, []).append(winner_is_first)

            # B. Starting Grid for prior race grid positions
            grid_sess = sessions.get("starting_grid", {})
            grid_by_driver: Dict[str, int] = {}
            if grid_sess:
                for entry in grid_sess.get("entries", []):
                    d_id = entry.get("driver_id", "")
                    g_pos = entry.get("grid_position", 20)
                    grid_by_driver[d_id] = 20 if (g_pos == 0 or entry.get("is_pit_lane_start")) else int(g_pos)

            # C. Grand Prix Results for Driver & Constructor form
            gp_sess = sessions.get("grand_prix", {})
            gp_results = gp_sess.get("results", [])

            # Reset season points when entering a new season
            if s_val == target_season:
                # Accumulate within target season
                pass

            c_stats: Dict[str, Dict[str, Any]] = {}

            for r in gp_results:
                d_id = r.get("driver_id", "")
                c_id = r.get("constructor_id", "")
                m_pos = r.get("model_finish_position", 99)
                pts = float(r.get("gp_points", 0.0))
                status = r.get("raw_status", "Unknown")
                m_dnf = r.get("model_dnf", derive_model_dnf(status))
                g_pos = grid_by_driver.get(d_id, 20)

                # Driver race history
                driver_race_history.setdefault(d_id, []).append({
                    "season": s_val,
                    "round": r_val,
                    "date": race_date,
                    "grid": g_pos,
                    "position": m_pos,
                    "points": pts,
                    "status": status,
                    "circuit_id": circuit_id,
                    "model_dnf": m_dnf
                })

                # Target-season driver points
                if s_val == target_season:
                    driver_season_points[d_id] = driver_season_points.get(d_id, 0.0) + pts

                # Constructor event stats accumulation
                c_entry = c_stats.setdefault(c_id, {
                    "points": 0.0,
                    "wins": 0,
                    "podiums": 0,
                    "grids": []
                })
                c_entry["points"] += pts
                if m_pos == 1:
                    c_entry["wins"] += 1
                if m_pos <= 3:
                    c_entry["podiums"] += 1
                c_entry["grids"].append(g_pos)

            # Update constructor race history
            for c_id, stats in c_stats.items():
                constructor_race_history.setdefault(c_id, []).append({
                    "season": s_val,
                    "round": r_val,
                    "points": stats["points"],
                    "wins": stats["wins"],
                    "podiums": stats["podiums"],
                    "grids": stats["grids"],
                    "circuit_id": circuit_id
                })
                if s_val == target_season:
                    constructor_season_points[c_id] = constructor_season_points.get(c_id, 0.0) + stats["points"]

            # Circuit heritage history
            winner_res = [r for r in gp_results if r.get("model_finish_position") == 1]
            if winner_res:
                winner_d = winner_res[0].get("driver_id", "")
                winner_c = winner_res[0].get("constructor_id", "")
                pole_d = next((d for d, g in grid_by_driver.items() if g == 1), "")
                pole_won = bool(pole_d and winner_d == pole_d)
                circuit_history.setdefault(circuit_id, []).append({
                    "pole_won": pole_won,
                    "winner_driver_id": winner_d,
                    "winner_constructor_id": winner_c
                })

        return (
            driver_race_history,
            constructor_race_history,
            teammate_quali_history,
            circuit_history,
            driver_season_points,
            constructor_season_points
        )

    def build_features_for_race(
        self,
        season: int,
        round_num: int,
        stage: str = "provisional",
        session_data_override: Optional[Dict[str, Any]] = None
    ) -> LiveFeatureResult:
        """
        Assembles the exact 42-feature contract for a single upcoming Grand Prix.

        Args:
            season: Target championship season (e.g. 2026).
            round_num: Target championship round number (e.g. 19).
            stage: 'provisional' (Stage A: post-qualifying, pre-official grid) or
                   'official_grid' (Stage B: official starting grid published).
            session_data_override: Optional live/mock round object to merge or override.

        Returns:
            LiveFeatureResult containing features_df, metadata_df, combined_df, diagnostics.
        """
        # Validate stage
        stage_clean = stage.strip().lower()
        if stage_clean not in ("provisional", "official_grid"):
            raise LiveFeatureBuilderError(
                "INVALID_STAGE",
                f"Prediction stage '{stage}' is invalid; must be 'provisional' or 'official_grid'."
            )
        has_penalties_applied = (stage_clean == "official_grid")

        # Locate target race
        season_obj, round_obj = self._find_target_round(season, round_num, session_data_override)

        race_id = round_obj.get("race_id", f"{season}_{round_num:02d}")
        circuit_id = round_obj.get("circuit_id", "")
        circuit_name = round_obj.get("circuit_name", circuit_id)
        country = round_obj.get("country", "")
        race_date = round_obj.get("race_date", "")
        race_timestamp_utc = round_obj.get("race_timestamp_utc", f"{race_date}T14:00:00Z")

        # Verify qualifying session
        sessions = round_obj.get("sessions", {})
        quali_sess = sessions.get("qualifying")
        if not quali_sess or not isinstance(quali_sess, dict):
            raise LiveFeatureBuilderError(
                "QUALIFYING_DATA_UNAVAILABLE",
                f"Target race '{race_id}' has no qualifying session block."
            )

        q_status = quali_sess.get("session_status")
        q_results = quali_sess.get("results", [])
        if q_status != "completed" and not session_data_override:
            raise LiveFeatureBuilderError(
                "QUALIFYING_DATA_UNAVAILABLE",
                f"Qualifying session for '{race_id}' is '{q_status}', not 'completed'."
            )

        if not q_results:
            raise LiveFeatureBuilderError(
                "QUALIFYING_DATA_UNAVAILABLE",
                f"Qualifying session for '{race_id}' has empty results."
            )

        if len(q_results) < 10:
            raise LiveFeatureBuilderError(
                "QUALIFYING_INCOMPLETE",
                f"Qualifying session for '{race_id}' has only {len(q_results)} drivers; minimum 10 required."
            )

        # Check for duplicate drivers in qualifying
        seen_driver_ids = set()
        for q in q_results:
            d_id = q.get("driver_id")
            if not d_id or d_id in seen_driver_ids:
                raise LiveFeatureBuilderError(
                    "DUPLICATE_DRIVER_DETECTED",
                    f"Duplicate or empty driver_id ('{d_id}') detected in qualifying results for '{race_id}'."
                )
            seen_driver_ids.add(d_id)

        # Check official grid if stage B requested
        grid_by_driver: Dict[str, Dict[str, Any]] = {}
        if stage_clean == "official_grid":
            grid_sess = sessions.get("starting_grid")
            if not grid_sess or not isinstance(grid_sess, dict):
                raise LiveFeatureBuilderError(
                    "OFFICIAL_GRID_UNAVAILABLE",
                    f"Stage B requires 'starting_grid' session block for '{race_id}', which is missing."
                )
            if not grid_sess.get("is_official", False):
                raise LiveFeatureBuilderError(
                    "OFFICIAL_GRID_UNAVAILABLE",
                    f"Starting grid for '{race_id}' is not marked official (is_official=False)."
                )
            grid_prov = grid_sess.get("provenance")
            if not grid_prov or not isinstance(grid_prov, str) or not grid_prov.strip():
                raise LiveFeatureBuilderError(
                    "OFFICIAL_GRID_UNAVAILABLE",
                    f"Starting grid for '{race_id}' lacks reliable provenance."
                )
            grid_entries = grid_sess.get("entries", [])
            if not grid_entries:
                raise LiveFeatureBuilderError(
                    "OFFICIAL_GRID_UNAVAILABLE",
                    f"Starting grid for '{race_id}' contains no entries."
                )
            if len(grid_entries) < 10:
                raise LiveFeatureBuilderError(
                    "OFFICIAL_GRID_UNAVAILABLE",
                    f"Starting grid for '{race_id}' has only {len(grid_entries)} entries; minimum 10 required."
                )
            seen_grid_drivers = set()
            for entry in grid_entries:
                d_id = entry.get("driver_id")
                if not d_id or d_id in seen_grid_drivers:
                    raise LiveFeatureBuilderError(
                        "OFFICIAL_GRID_UNAVAILABLE",
                        f"Duplicate or empty driver_id ('{d_id}') in starting grid for '{race_id}'."
                    )
                seen_grid_drivers.add(d_id)
                grid_by_driver[d_id] = entry

        # Extract strictly prior history (enforces chronological cutoff)
        (
            driver_race_history,
            constructor_race_history,
            teammate_quali_history,
            circuit_history,
            driver_season_points,
            constructor_season_points
        ) = self._extract_prior_history(season, round_num)

        # Standings entering this GP (deterministic tie-breaking: -points, id)
        sorted_d_standings = sorted(driver_season_points.items(), key=lambda x: (-x[1], x[0]))
        driver_standing_ranks = {d_id: rank + 1 for rank, (d_id, _) in enumerate(sorted_d_standings)}

        sorted_c_standings = sorted(constructor_season_points.items(), key=lambda x: (-x[1], x[0]))
        constructor_standing_ranks = {c_id: rank + 1 for rank, (c_id, _) in enumerate(sorted_c_standings)}

        # Helper to robustly extract lap time from baseline or raw sessions
        def _get_best_time(q_item: Dict[str, Any]) -> Optional[float]:
            if q_item.get("best_time_sec") is not None:
                try:
                    return float(q_item["best_time_sec"])
                except (ValueError, TypeError):
                    pass
            # Fallback to numeric segment times
            cand = []
            for k in ("q3_time_sec", "q2_time_sec", "q1_time_sec"):
                v = q_item.get(k)
                if v is not None:
                    try:
                        cand.append(float(v))
                    except (ValueError, TypeError):
                        pass
            # Fallback to string segment times
            for k in ("Q3", "Q2", "Q1"):
                v = q_item.get(k)
                if isinstance(v, str):
                    pv = parse_lap_time_str(v)
                    if pv is not None:
                        cand.append(pv)
            return min(cand) if cand else None

        # Qualifying session calculations
        driver_best_times: Dict[str, Optional[float]] = {}
        valid_times: List[float] = []
        for q in q_results:
            d_id = q.get("driver_id", "")
            bt = _get_best_time(q)
            driver_best_times[d_id] = bt
            if bt is not None:
                valid_times.append(bt)

        if not valid_times:
            raise LiveFeatureBuilderError(
                "QUALIFYING_INCOMPLETE",
                f"Qualifying session for '{race_id}' contains no valid lap times; pole time cannot be determined."
            )

        pole_time = min(valid_times)

        # Group qualifying drivers by constructor for intra-team metrics
        constructor_drivers: Dict[str, List[Dict[str, Any]]] = {}
        constructor_best_deltas: Dict[str, float] = {}

        for q in q_results:
            c_id = q.get("constructor_id", "")
            d_id = q.get("driver_id", "")
            constructor_drivers.setdefault(c_id, []).append(q)
            d_time = driver_best_times.get(d_id)
            if d_time is not None:
                delta = round(float(d_time) - pole_time, 3)
                if c_id not in constructor_best_deltas or delta < constructor_best_deltas[c_id]:
                    constructor_best_deltas[c_id] = delta

        # Weather telemetry extraction
        weather_info = quali_sess.get("weather") or {}
        raw_air_temp = weather_info.get("air_temp_c")
        raw_track_temp = weather_info.get("track_temp_c")
        raw_humidity = weather_info.get("humidity_pct")
        raw_rainfall = weather_info.get("rainfall")

        quali_air_temp_c = float(raw_air_temp) if raw_air_temp is not None else np.nan
        quali_track_temp_c = float(raw_track_temp) if raw_track_temp is not None else np.nan
        quali_humidity_pct = float(raw_humidity) if raw_humidity is not None else np.nan
        quali_rainfall = float(raw_rainfall) if raw_rainfall is not None else np.nan

        # Context metrics
        reg_era = round_obj.get("regulation_era") or season_obj.get("regulation_era") or get_regulation_era(season)
        is_sprint = 1 if (round_obj.get("is_sprint_weekend") or "sprint_race" in sessions) else 0

        # Assemble features per driver
        feature_rows: List[Dict[str, Any]] = []
        metadata_rows: List[Dict[str, Any]] = []
        gen_timestamp = datetime.now(timezone.utc).isoformat()

        # Sort qualifying results by quali_position for deterministic ordering
        sorted_q_results = sorted(q_results, key=lambda x: int(x.get("quali_position", 20)))

        for q in sorted_q_results:
            driver_id = q.get("driver_id", "")
            driver_code = q.get("driver_code", driver_id[:3].upper())
            driver_num = q.get("driver_number", "")
            constructor_id = q.get("constructor_id", "")
            constructor_name = q.get("constructor_name", constructor_id)

            quali_pos = int(q.get("quali_position", 20))
            best_time = driver_best_times.get(driver_id)

            # Pace deltas
            delta_to_pole = round(best_time - pole_time, 3) if (best_time is not None and pole_time is not None) else np.nan
            ratio_to_pole = round(best_time / pole_time, 5) if (best_time is not None and pole_time is not None and pole_time > 0) else np.nan
            # Q3 participation strictly reproduces training semantics (feature_pipeline.py:160)
            if q.get("reached_q3") is not None:
                reached_q3 = int(q["reached_q3"])
            else:
                q3_val = q.get("q3_time_sec") or q.get("Q3")
                reached_q3 = 1 if (q3_val is not None and str(q3_val).strip()) else 0

            # Grid position & penalty delta based on stage
            if stage_clean == "provisional":
                grid_pos = float(quali_pos)
                grid_penalty_delta = 0.0
                front_row = 1 if grid_pos <= 2 else 0
            else:  # official_grid
                grid_entry = grid_by_driver.get(driver_id)
                if grid_entry:
                    raw_g = grid_entry.get("grid_position", 20)
                    is_pl = grid_entry.get("is_pit_lane_start", False)
                    grid_pos = 20.0 if (raw_g == 0 or is_pl) else float(raw_g)
                else:
                    grid_pos = 20.0
                grid_penalty_delta = float(grid_pos - quali_pos)
                front_row = 1 if grid_pos <= 2 else 0

            # Teammate Dynamics
            teammates = [t for t in constructor_drivers.get(constructor_id, []) if t.get("driver_id") != driver_id]
            outqualified_teammate = 0
            teammate_rolling_5_h2h = 0.5  # Neutral default

            if teammates:
                teammate_q = teammates[0]
                teammate_pos = int(teammate_q.get("quali_position", 20))
                outqualified_teammate = 1 if quali_pos < teammate_pos else 0
                teammate_id = teammate_q.get("driver_id", "")

                pair_key = tuple(sorted([driver_id, teammate_id]))
                h2h_list = teammate_quali_history.get(pair_key, [])
                if h2h_list:
                    recent_h2h = h2h_list[-5:]
                    driver_wins = sum(1 for val in recent_h2h if (val if driver_id == pair_key[0] else not val))
                    teammate_rolling_5_h2h = round(float(driver_wins / len(recent_h2h)), 2)

            # Driver Rolling Form (Strictly from prior completed races)
            d_hist = driver_race_history.get(driver_id, [])
            driver_prev_pos = float(d_hist[-1]["position"]) if (d_hist and d_hist[-1]["position"] <= 20) else np.nan
            driver_prev_pts = float(d_hist[-1]["points"]) if d_hist else 0.0

            valid_finishes = [h["position"] for h in d_hist if h["position"] <= 20]
            d_roll_3_finish = round(float(np.mean(valid_finishes[-3:])), 2) if len(valid_finishes) >= 1 else np.nan
            d_roll_5_finish = round(float(np.mean(valid_finishes[-5:])), 2) if len(valid_finishes) >= 1 else np.nan
            d_roll_10_finish = round(float(np.mean(valid_finishes[-10:])), 2) if len(valid_finishes) >= 1 else np.nan

            last_5_starts = d_hist[-5:] if d_hist else []
            d_roll_5_wins = round(float(sum(1 for h in last_5_starts if h["position"] == 1) / max(1, len(last_5_starts))), 2) if last_5_starts else 0.0
            d_roll_5_podiums = round(float(sum(1 for h in last_5_starts if h["position"] <= 3) / max(1, len(last_5_starts))), 2) if last_5_starts else 0.0
            d_roll_5_pts = round(float(sum(h["points"] for h in last_5_starts) / max(1, len(last_5_starts))), 2) if last_5_starts else 0.0
            d_roll_5_dnf = round(float(sum(1 for h in last_5_starts if h.get("model_dnf", derive_model_dnf(h["status"])) == 1) / max(1, len(last_5_starts))), 2) if last_5_starts else 0.0

            last_10_starts = d_hist[-10:] if d_hist else []
            d_roll_10_wins = round(float(sum(1 for h in last_10_starts if h["position"] == 1) / max(1, len(last_10_starts))), 2) if last_10_starts else 0.0

            driver_season_pts_before = float(driver_season_points.get(driver_id, 0.0))
            driver_standing_before = float(driver_standing_ranks.get(driver_id, 20))

            # Constructor Rolling Form (Strictly from prior completed races)
            c_hist = constructor_race_history.get(constructor_id, [])
            c_prev_pts = float(c_hist[-1]["points"]) if c_hist else 0.0

            last_3_c = c_hist[-3:] if c_hist else []
            c_roll_3_pts = round(float(np.mean([h["points"] for h in last_3_c])), 2) if last_3_c else 0.0

            last_5_c = c_hist[-5:] if c_hist else []
            c_roll_5_wins = round(float(sum(h["wins"] for h in last_5_c) / max(1, len(last_5_c))), 2) if last_5_c else 0.0
            # Legacy training denominator: 2 cars per event
            c_roll_5_podiums = round(float(sum(h["podiums"] for h in last_5_c) / max(1, len(last_5_c) * 2)), 2) if last_5_c else 0.0

            all_c_grids = [g for h in last_3_c for g in h.get("grids", [])]
            c_roll_3_grid = round(float(np.mean(all_c_grids)), 2) if all_c_grids else np.nan

            constructor_season_pts_before = float(constructor_season_points.get(constructor_id, 0.0))
            constructor_standing_before = float(constructor_standing_ranks.get(constructor_id, 10))
            constructor_best_delta = float(constructor_best_deltas.get(constructor_id, delta_to_pole)) if pd.notna(constructor_best_deltas.get(constructor_id, delta_to_pole)) else np.nan

            # Circuit Demands & Heritage (Strictly prior races at this circuit)
            circuit_d_starts = [h for h in d_hist if h["circuit_id"] == circuit_id]
            d_circ_starts = len(circuit_d_starts)
            d_circ_wins = sum(1 for h in circuit_d_starts if h["position"] == 1)
            d_circ_win_rate = round(float(d_circ_wins / d_circ_starts), 3) if d_circ_starts > 0 else 0.0
            d_circ_podiums = sum(1 for h in circuit_d_starts if h["position"] <= 3)
            d_circ_valid_finishes = [h["position"] for h in circuit_d_starts if h["position"] <= 20]
            d_circ_avg_finish = round(float(np.mean(d_circ_valid_finishes)), 2) if d_circ_valid_finishes else np.nan

            circuit_c_starts = [h for h in c_hist if h["circuit_id"] == circuit_id]
            c_circ_wins = sum(h["wins"] for h in circuit_c_starts)

            circ_races = circuit_history.get(circuit_id, [])
            circ_pole_win_rate = round(float(sum(1 for r in circ_races if r["pole_won"]) / max(1, len(circ_races))), 2) if circ_races else 0.45

            # Assemble Exact 42 Feature Dictionary
            feature_row = {
                "grid_position": grid_pos,
                "quali_position": float(quali_pos),
                "grid_penalty_delta": grid_penalty_delta,
                "quali_time_delta_to_pole": delta_to_pole,
                "quali_time_ratio_to_pole": ratio_to_pole,
                "reached_q3": float(reached_q3),
                "front_row": float(front_row),
                "driver_prev_race_position": driver_prev_pos,
                "driver_prev_race_points": driver_prev_pts,
                "driver_rolling_3_avg_finish": d_roll_3_finish,
                "driver_rolling_5_avg_finish": d_roll_5_finish,
                "driver_rolling_5_win_rate": d_roll_5_wins,
                "driver_rolling_5_podium_rate": d_roll_5_podiums,
                "driver_rolling_5_pts_per_race": d_roll_5_pts,
                "driver_rolling_5_dnf_rate": d_roll_5_dnf,
                "driver_rolling_10_avg_finish": d_roll_10_finish,
                "driver_rolling_10_win_rate": d_roll_10_wins,
                "driver_season_points_before_gp": driver_season_pts_before,
                "driver_season_standing_before_gp": driver_standing_before,
                "constructor_prev_race_points": c_prev_pts,
                "constructor_rolling_3_avg_points": c_roll_3_pts,
                "constructor_rolling_5_win_rate": c_roll_5_wins,
                "constructor_rolling_5_podium_rate": c_roll_5_podiums,
                "constructor_rolling_3_avg_grid": c_roll_3_grid,
                "constructor_season_points_before_gp": constructor_season_pts_before,
                "constructor_season_standing_before_gp": constructor_standing_before,
                "constructor_best_quali_delta_to_pole": constructor_best_delta,
                "outqualified_teammate": float(outqualified_teammate),
                "teammate_rolling_5_quali_h2h": float(teammate_rolling_5_h2h),
                "driver_circuit_starts": float(d_circ_starts),
                "driver_circuit_wins": float(d_circ_wins),
                "driver_circuit_win_rate": float(d_circ_win_rate),
                "driver_circuit_podiums": float(d_circ_podiums),
                "driver_circuit_avg_finish": d_circ_avg_finish,
                "constructor_circuit_wins": float(c_circ_wins),
                "circuit_historical_pole_win_rate": float(circ_pole_win_rate),
                "is_sprint_weekend": float(is_sprint),
                "quali_air_temp_c": quali_air_temp_c,
                "quali_track_temp_c": quali_track_temp_c,
                "quali_humidity_pct": quali_humidity_pct,
                "quali_rainfall": quali_rainfall,
                "regulation_era": str(reg_era)
            }
            feature_rows.append(feature_row)

            # Metadata Row
            metadata_row = {
                "race_id": race_id,
                "season": season,
                "round": round_num,
                "circuit_id": circuit_id,
                "circuit_name": circuit_name,
                "country": country,
                "race_date": race_date,
                "race_timestamp_utc": race_timestamp_utc,
                "driver_id": driver_id,
                "driver_code": driver_code,
                "driver_number": driver_num,
                "constructor_id": constructor_id,
                "constructor_name": constructor_name,
                "data_provenance": quali_sess.get("provenance", "baseline_v1.3.1"),
                "feature_timestamp_utc": gen_timestamp
            }
            metadata_rows.append(metadata_row)

        features_df = pd.DataFrame(feature_rows)[ALL_MODEL_FEATURES]
        metadata_df = pd.DataFrame(metadata_rows)[METADATA_COLUMNS]
        combined_df = pd.concat([metadata_df, features_df], axis=1)

        # Operational Diagnostics
        is_unknown_reg = (reg_era not in ("v6_turbo_hybrid_gen1", "ground_effect_gen2"))
        weather_present = bool(
            raw_air_temp is not None or
            raw_track_temp is not None or
            raw_humidity is not None or
            raw_rainfall is not None
        )

        diagnostics: Dict[str, Any] = {
            "target_race_id": race_id,
            "season": season,
            "round": round_num,
            "circuit_id": circuit_id,
            "stage": stage_clean,
            "has_penalties_applied": has_penalties_applied,
            "driver_count": len(features_df),
            "regulation_era": reg_era,
            "is_unknown_regulation_era": is_unknown_reg,
            "unknown_regulation_note": (
                f"Model preprocessor OneHotEncoder was fitted on 2021-2023 regulations and ignores "
                f"'{reg_era}', transforming it to all zeros. Model has no learned weights for 2026 active aero / sustainable fuel."
                if is_unknown_reg else None
            ),
            "weather_status": "present" if weather_present else "missing",
            "weather_imputation_note": (
                "Qualifying weather telemetry is missing or incomplete; the trained preprocessing pipeline "
                "will apply median imputation." if not weather_present else None
            ),
            "historical_cutoff_applied": True,
            "prior_races_count": len([
                r for s in self.baseline_data.get("seasons", [])
                for r in s.get("rounds", [])
                if (s.get("season", 0) < season or (s.get("season", 0) == season and r.get("round", 0) < round_num))
                and r.get("sessions", {}).get("grand_prix", {}).get("session_status") == "completed"
            ]),
            "cutoff_timestamp_utc": quali_sess.get("publication_timestamp_utc") or gen_timestamp,
            "qualifying_provenance": quali_sess.get("provenance", "unknown"),
            "grid_provenance": sessions.get("starting_grid", {}).get("provenance") if stage_clean == "official_grid" else "provisional_from_qualifying",
            "generated_timestamp_utc": gen_timestamp
        }

        return LiveFeatureResult(
            features_df=features_df,
            metadata_df=metadata_df,
            combined_df=combined_df,
            diagnostics=diagnostics
        )

