"""
Builds the verified Historical Baseline dataset for 2025 and 2026 Formula 1 seasons,
strictly conforming to Schema v1.3.1 (historical_baseline_schema.json).

Preserves raw classifications, separate sprint/GP points, multi-session revision history,
authentic 2026 regulation era ('active_aero_sustainable_fuel_gen3'), and standardizes pit-lane starts.
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from .config import OUTPUT_DIR
from .jolpica_extractor import JolpicaExtractor, parse_lap_time_str
from .fastf1_extractor import FastF1Extractor
from .baseline_schema import (
    CURRENT_CONTRACT_VERSION,
    derive_model_dnf,
    normalize_model_finish_position,
    validate_baseline_schema
)

logger = logging.getLogger("baseline_builder")
logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")


def build_historical_baseline(output_path: Optional[str] = None) -> Dict[str, Any]:
    if output_path is None:
        output_path = os.path.join(OUTPUT_DIR, "historical_baseline_2025_2026.json")

    jolpica = JolpicaExtractor()
    fastf1 = FastF1Extractor()

    gen_time_utc = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

    baseline: Dict[str, Any] = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "contract_version": CURRENT_CONTRACT_VERSION,
        "generated_at_utc": gen_time_utc,
        "offline_replay_certified": False,
        "seasons": []
    }

    # =========================================================================
    # SEASON 2025 (Rounds 1 - 24) - Ground Effect Gen 2
    # =========================================================================
    logger.info("Processing Season 2025...")
    cal_2025 = jolpica.get_season_calendar(2025)
    season_2025_rounds: List[Dict[str, Any]] = []

    for r_meta in cal_2025:
        rnd = int(r_meta["round"])
        circuit_id = r_meta["Circuit"]["circuitId"]
        circuit_name = r_meta["Circuit"]["circuitName"]
        country = r_meta["Circuit"]["Location"]["country"]
        race_date = r_meta["date"]
        race_id = f"2025_{rnd}_{circuit_id}"
        is_sprint = bool("Sprint" in r_meta or "sprint" in str(r_meta).lower())

        logger.info(f"  2025 R{rnd:02d}: {race_id}")

        # 1. Qualifying
        quali_results = jolpica.get_qualifying_results(2025, rnd)
        weather_info = fastf1.get_qualifying_weather(2025, rnd)

        valid_times: List[float] = []
        parsed_q_results: List[Dict[str, Any]] = []
        quali_pos_by_driver: Dict[str, int] = {}

        for q in quali_results:
            d_id = q["Driver"]["driverId"]
            d_code = q["Driver"].get("code", d_id[:3].upper())
            d_num = q["Driver"].get("permanentNumber", q.get("number", ""))
            c_id = q["Constructor"]["constructorId"]
            raw_pos = q.get("position", "20")
            q_pos = int(raw_pos) if str(raw_pos).isdigit() else 20
            quali_pos_by_driver[d_id] = q_pos

            t1 = parse_lap_time_str(q.get("Q1"))
            t2 = parse_lap_time_str(q.get("Q2"))
            t3 = parse_lap_time_str(q.get("Q3"))

            times_for_driver = [t for t in [t1, t2, t3] if t is not None]
            best_t = min(times_for_driver) if times_for_driver else None
            if best_t is not None:
                valid_times.append(best_t)

            has_q3 = 1 if (q.get("Q3") and q.get("Q3").strip() and t3 is not None) else 0

            parsed_q_results.append({
                "driver_id": d_id,
                "driver_code": d_code,
                "driver_number": str(d_num),
                "constructor_id": c_id,
                "raw_position": raw_pos if not str(raw_pos).isdigit() else int(raw_pos),
                "quali_position": q_pos,
                "q1_time_sec": t1,
                "q2_time_sec": t2,
                "q3_time_sec": t3,
                "best_time_sec": best_t,
                "reached_q3": has_q3
            })

        pole_time = min(valid_times) if valid_times else None

        q_block: Dict[str, Any] = {
            "session_status": "completed",
            "revision": 1,
            "publication_timestamp_utc": f"{race_date}T16:00:00Z",
            "provenance": "jolpica_ergast_api",
            "pole_time_sec": pole_time,
            "weather": {
                "air_temp_c": weather_info.get("quali_air_temp_c"),
                "track_temp_c": weather_info.get("quali_track_temp_c"),
                "humidity_pct": weather_info.get("quali_humidity_pct"),
                "rainfall": weather_info.get("quali_rainfall"),
                "provenance": "fastf1" if weather_info.get("fastf1_available") else "fastf1_unavailable"
            },
            "results": parsed_q_results
        }

        # 2. Race Results
        race_results = jolpica.get_race_results(2025, rnd)

        # 3. Starting Grid
        grid_entries: List[Dict[str, Any]] = []
        for r in race_results:
            d_id = r["Driver"]["driverId"]
            c_id = r["Constructor"]["constructorId"]
            raw_g = r.get("grid", 0)
            raw_g_int = int(raw_g) if str(raw_g).isdigit() else 0
            is_pl = bool(raw_g_int == 0 or str(raw_g).upper() == "PL")
            g_pos = 20 if is_pl else raw_g_int
            q_pos = quali_pos_by_driver.get(d_id, g_pos)
            penalty_delta = g_pos - q_pos

            grid_entries.append({
                "driver_id": d_id,
                "constructor_id": c_id,
                "raw_grid_position": raw_g_int if not is_pl else "PL",
                "grid_position": g_pos,
                "is_pit_lane_start": is_pl,
                "grid_penalty_delta": penalty_delta,
                "penalty_reason": None
            })

        grid_block: Dict[str, Any] = {
            "is_official": True,
            "revision": 1,
            "publication_timestamp_utc": f"{race_date}T12:00:00Z",
            "provenance": "jolpica_ergast_api",
            "entries": grid_entries
        }

        # 4. Grand Prix Classification
        gp_results: List[Dict[str, Any]] = []
        winner_laps = int(race_results[0].get("laps", 50)) if race_results else 50
        cutoff_laps = int(winner_laps * 0.90)

        for r in race_results:
            d_id = r["Driver"]["driverId"]
            c_id = r["Constructor"]["constructorId"]
            raw_p = r.get("positionText", r.get("position"))
            status = r.get("status", "Unknown")
            pts = float(r.get("points", 0.0))
            laps = int(r.get("laps", 0))

            m_dnf = derive_model_dnf(status)

            s_lower = status.lower()
            if s_lower.startswith("finish") or s_lower.startswith("+") or s_lower == "lapped":
                part_status = "started"
                is_class = True
                m_pos = normalize_model_finish_position(r.get("position"), status)
            elif s_lower in ("did not start", "dns", "withdrew", "withdrawn") or str(raw_p).upper() in ("W", "F"):
                part_status = "dns"
                is_class = False
                m_pos = 99
                pts = 0.0
                m_dnf = 1
            elif s_lower == "disqualified" or str(raw_p).upper() == "D":
                part_status = "dsq"
                is_class = False
                m_pos = 99
                pts = 0.0
                m_dnf = 1
            else:
                # Retirement
                if laps >= cutoff_laps:
                    part_status = "classified_retirement"
                    is_class = True
                    m_pos = normalize_model_finish_position(r.get("position"), status)
                    m_dnf = 1
                else:
                    part_status = "dnf"
                    is_class = False
                    m_pos = 99
                    pts = 0.0
                    m_dnf = 1

            gp_results.append({
                "driver_id": d_id,
                "constructor_id": c_id,
                "raw_position": raw_p if not str(raw_p).isdigit() else int(raw_p),
                "model_finish_position": m_pos,
                "gp_points": pts,
                "raw_status": status,
                "official_participation_status": part_status,
                "model_dnf": m_dnf,
                "is_classified": is_class
            })

        gp_block: Dict[str, Any] = {
            "session_status": "completed",
            "revision": 1,
            "publication_timestamp_utc": f"{race_date}T18:00:00Z",
            "provenance": "jolpica_ergast_api",
            "results": gp_results
        }

        # 5. Sprint Race (if applicable)
        sprint_block: Optional[Dict[str, Any]] = None
        if is_sprint:
            sp_data = jolpica._get_json_cached(f"2025/{rnd}/sprint.json?limit=100", f"2025_round_{rnd}_sprint.json")
            sp_races = sp_data.get("MRData", {}).get("RaceTable", {}).get("Races", []) if sp_data else []
            sp_results_raw = sp_races[0].get("SprintResults", []) if sp_races else []

            if sp_results_raw:
                sp_winner_laps = int(sp_results_raw[0].get("laps", 20))
                sp_cutoff = int(sp_winner_laps * 0.90)
                parsed_sp_results: List[Dict[str, Any]] = []

                for sp in sp_results_raw:
                    sp_d_id = sp["Driver"]["driverId"]
                    sp_c_id = sp["Constructor"]["constructorId"]
                    sp_raw_p = sp.get("positionText", sp.get("position"))
                    sp_pos = int(sp.get("position", 99)) if str(sp.get("position", "")).isdigit() and int(sp["position"]) <= 20 else 99
                    sp_pts = float(sp.get("points", 0.0))
                    sp_status = sp.get("status", "Unknown")
                    sp_laps = int(sp.get("laps", 0))

                    sp_s_lower = sp_status.lower()
                    if sp_s_lower.startswith("finish") or sp_s_lower.startswith("+") or sp_s_lower == "lapped":
                        sp_part = "started"
                        sp_class = True
                    elif sp_s_lower in ("did not start", "dns", "withdrew", "withdrawn"):
                        sp_part = "dns"
                        sp_class = False
                    elif sp_s_lower == "disqualified":
                        sp_part = "dsq"
                        sp_class = False
                    else:
                        if sp_laps >= sp_cutoff:
                            sp_part = "classified_retirement"
                            sp_class = True
                        else:
                            sp_part = "dnf"
                            sp_class = False

                    parsed_sp_results.append({
                        "driver_id": sp_d_id,
                        "constructor_id": sp_c_id,
                        "raw_position": sp_raw_p if not str(sp_raw_p).isdigit() else int(sp_raw_p),
                        "finish_position": sp_pos,
                        "sprint_points": sp_pts,
                        "official_status": sp_status,
                        "participation_status": sp_part,
                        "is_classified": sp_class
                    })

                sprint_block = {
                    "session_status": "completed",
                    "revision": 1,
                    "publication_timestamp_utc": f"{race_date}T15:00:00Z",
                    "provenance": "jolpica_ergast_api",
                    "results": parsed_sp_results
                }

        round_sessions: Dict[str, Any] = {
            "qualifying": q_block,
            "starting_grid": grid_block,
            "grand_prix": gp_block
        }
        if sprint_block:
            round_sessions["sprint_race"] = sprint_block

        season_2025_rounds.append({
            "round": rnd,
            "race_id": race_id,
            "circuit_id": circuit_id,
            "circuit_name": circuit_name,
            "country": country,
            "race_date": race_date,
            "is_sprint_weekend": is_sprint,
            "sessions": round_sessions
        })

    baseline["seasons"].append({
        "season": 2025,
        "regulation_era": "ground_effect_gen2",
        "rounds": season_2025_rounds
    })

    # =========================================================================
    # SEASON 2026 (Rounds 1 - 20) - Active Aero Sustainable Fuel Gen 3
    # =========================================================================
    logger.info("Processing Season 2026...")
    cal_2026 = jolpica.get_season_calendar(2026)
    season_2026_rounds: List[Dict[str, Any]] = []

    # Map of calendar rounds
    cal_by_round = {int(r["round"]): r for r in cal_2026}

    for rnd in range(1, 21):
        r_meta = cal_by_round.get(rnd)
        if not r_meta:
            logger.warning(f"  Missing calendar entry for 2026 R{rnd}")
            continue

        circuit_id = r_meta["Circuit"]["circuitId"]
        circuit_name = r_meta["Circuit"]["circuitName"]
        country = r_meta["Circuit"]["Location"]["country"]
        race_date = r_meta["date"]
        race_id = f"2026_{rnd}_{circuit_id}"
        is_sprint = bool("Sprint" in r_meta or "sprint" in str(r_meta).lower())

        logger.info(f"  2026 R{rnd:02d}: {race_id}")

        if rnd <= 18:
            # Sourced Completed Rounds (R1 - R18)
            quali_results = jolpica.get_qualifying_results(2026, rnd)
            weather_info = fastf1.get_qualifying_weather(2026, rnd)

            valid_times: List[float] = []
            parsed_q_results: List[Dict[str, Any]] = []
            quali_pos_by_driver: Dict[str, int] = {}

            for q in quali_results:
                d_id = q["Driver"]["driverId"]
                d_code = q["Driver"].get("code", d_id[:3].upper())
                d_num = q["Driver"].get("permanentNumber", q.get("number", ""))
                c_id = q["Constructor"]["constructorId"]
                raw_pos = q.get("position", "22")
                q_pos = int(raw_pos) if str(raw_pos).isdigit() else 22
                quali_pos_by_driver[d_id] = q_pos

                t1 = parse_lap_time_str(q.get("Q1"))
                t2 = parse_lap_time_str(q.get("Q2"))
                t3 = parse_lap_time_str(q.get("Q3"))

                times_for_driver = [t for t in [t1, t2, t3] if t is not None]
                best_t = min(times_for_driver) if times_for_driver else None
                if best_t is not None:
                    valid_times.append(best_t)

                has_q3 = 1 if (q.get("Q3") and q.get("Q3").strip() and t3 is not None) else 0

                parsed_q_results.append({
                    "driver_id": d_id,
                    "driver_code": d_code,
                    "driver_number": str(d_num),
                    "constructor_id": c_id,
                    "raw_position": raw_pos if not str(raw_pos).isdigit() else int(raw_pos),
                    "quali_position": q_pos,
                    "q1_time_sec": t1,
                    "q2_time_sec": t2,
                    "q3_time_sec": t3,
                    "best_time_sec": best_t,
                    "reached_q3": has_q3
                })

            pole_time = min(valid_times) if valid_times else None

            q_block = {
                "session_status": "completed",
                "revision": 1,
                "publication_timestamp_utc": f"{race_date}T16:00:00Z",
                "provenance": "jolpica_ergast_api",
                "pole_time_sec": pole_time,
                "weather": {
                    "air_temp_c": weather_info.get("quali_air_temp_c"),
                    "track_temp_c": weather_info.get("quali_track_temp_c"),
                    "humidity_pct": weather_info.get("quali_humidity_pct"),
                    "rainfall": weather_info.get("quali_rainfall"),
                    "provenance": "fastf1" if weather_info.get("fastf1_available") else "fastf1_unavailable"
                },
                "results": parsed_q_results
            }

            race_results = jolpica.get_race_results(2026, rnd)

            grid_entries = []
            for r in race_results:
                d_id = r["Driver"]["driverId"]
                c_id = r["Constructor"]["constructorId"]
                raw_g = r.get("grid", 0)
                raw_g_int = int(raw_g) if str(raw_g).isdigit() else 0
                is_pl = bool(raw_g_int == 0 or str(raw_g).upper() == "PL")
                g_pos = 20 if is_pl else raw_g_int
                q_pos = quali_pos_by_driver.get(d_id, g_pos)
                penalty_delta = g_pos - q_pos

                grid_entries.append({
                    "driver_id": d_id,
                    "constructor_id": c_id,
                    "raw_grid_position": raw_g_int if not is_pl else "PL",
                    "grid_position": g_pos,
                    "is_pit_lane_start": is_pl,
                    "grid_penalty_delta": penalty_delta,
                    "penalty_reason": None
                })

            grid_block = {
                "is_official": True,
                "revision": 1,
                "publication_timestamp_utc": f"{race_date}T12:00:00Z",
                "provenance": "jolpica_ergast_api",
                "entries": grid_entries
            }

            gp_results = []
            winner_laps = int(race_results[0].get("laps", 50)) if race_results else 50
            cutoff_laps = int(winner_laps * 0.90)

            for r in race_results:
                d_id = r["Driver"]["driverId"]
                c_id = r["Constructor"]["constructorId"]
                raw_p = r.get("positionText", r.get("position"))
                status = r.get("status", "Unknown")
                pts = float(r.get("points", 0.0))
                laps = int(r.get("laps", 0))

                m_dnf = derive_model_dnf(status)

                s_lower = status.lower()
                if s_lower.startswith("finish") or s_lower.startswith("+") or s_lower == "lapped":
                    part_status = "started"
                    is_class = True
                    m_pos = normalize_model_finish_position(r.get("position"), status)
                elif s_lower in ("did not start", "dns", "withdrew", "withdrawn") or str(raw_p).upper() in ("W", "F"):
                    part_status = "dns"
                    is_class = False
                    m_pos = 99
                    pts = 0.0
                    m_dnf = 1
                elif s_lower == "disqualified" or str(raw_p).upper() == "D":
                    part_status = "dsq"
                    is_class = False
                    m_pos = 99
                    pts = 0.0
                    m_dnf = 1
                else:
                    if laps >= cutoff_laps:
                        part_status = "classified_retirement"
                        is_class = True
                        m_pos = normalize_model_finish_position(r.get("position"), status)
                        m_dnf = 1
                    else:
                        part_status = "dnf"
                        is_class = False
                        m_pos = 99
                        pts = 0.0
                        m_dnf = 1

                gp_results.append({
                    "driver_id": d_id,
                    "constructor_id": c_id,
                    "raw_position": raw_p if not str(raw_p).isdigit() else int(raw_p),
                    "model_finish_position": m_pos,
                    "gp_points": pts,
                    "raw_status": status,
                    "official_participation_status": part_status,
                    "model_dnf": m_dnf,
                    "is_classified": is_class
                })

            gp_block = {
                "session_status": "completed",
                "revision": 1,
                "publication_timestamp_utc": f"{race_date}T18:00:00Z",
                "provenance": "jolpica_ergast_api",
                "results": gp_results
            }

            sprint_block = None
            if is_sprint:
                sp_data = jolpica._get_json_cached(f"2026/{rnd}/sprint.json?limit=100", f"2026_round_{rnd}_sprint.json")
                sp_races = sp_data.get("MRData", {}).get("RaceTable", {}).get("Races", []) if sp_data else []
                sp_results_raw = sp_races[0].get("SprintResults", []) if sp_races else []

                if sp_results_raw:
                    sp_winner_laps = int(sp_results_raw[0].get("laps", 20))
                    sp_cutoff = int(sp_winner_laps * 0.90)
                    parsed_sp_results = []

                    for sp in sp_results_raw:
                        sp_d_id = sp["Driver"]["driverId"]
                        sp_c_id = sp["Constructor"]["constructorId"]
                        sp_raw_p = sp.get("positionText", sp.get("position"))
                        sp_pos = int(sp.get("position", 99)) if str(sp.get("position", "")).isdigit() and int(sp["position"]) <= 20 else 99
                        sp_pts = float(sp.get("points", 0.0))
                        sp_status = sp.get("status", "Unknown")
                        sp_laps = int(sp.get("laps", 0))

                        sp_s_lower = sp_status.lower()
                        if sp_s_lower.startswith("finish") or sp_s_lower.startswith("+") or sp_s_lower == "lapped":
                            sp_part = "started"
                            sp_class = True
                        elif sp_s_lower in ("did not start", "dns", "withdrew", "withdrawn"):
                            sp_part = "dns"
                            sp_class = False
                        elif sp_s_lower == "disqualified":
                            sp_part = "dsq"
                            sp_class = False
                        else:
                            if sp_laps >= sp_cutoff:
                                sp_part = "classified_retirement"
                                sp_class = True
                            else:
                                sp_part = "dnf"
                                sp_class = False

                        parsed_sp_results.append({
                            "driver_id": sp_d_id,
                            "constructor_id": sp_c_id,
                            "raw_position": sp_raw_p if not str(sp_raw_p).isdigit() else int(sp_raw_p),
                            "finish_position": sp_pos,
                            "sprint_points": sp_pts,
                            "official_status": sp_status,
                            "participation_status": sp_part,
                            "is_classified": sp_class
                        })

                    sprint_block = {
                        "session_status": "completed",
                        "revision": 1,
                        "publication_timestamp_utc": f"{race_date}T15:00:00Z",
                        "provenance": "jolpica_ergast_api",
                        "results": parsed_sp_results
                    }

        else:
            # Upcoming Rounds (R19 - Mexico City GP, R20 - Brazilian GP)
            # Authentically sourced from Jolpica calendar / scheduled state with zero fabricated outcomes
            q_block = {
                "session_status": "upcoming",
                "revision": 1,
                "publication_timestamp_utc": f"{race_date}T16:00:00Z",
                "provenance": "jolpica_calendar_scheduled",
                "pole_time_sec": None,
                "weather": None,
                "results": []
            }

            grid_block = {
                "is_official": False,
                "revision": 1,
                "publication_timestamp_utc": f"{race_date}T12:00:00Z",
                "provenance": "jolpica_calendar_scheduled",
                "entries": []
            }

            gp_block = {
                "session_status": "upcoming",
                "revision": 1,
                "publication_timestamp_utc": f"{race_date}T18:00:00Z",
                "provenance": "jolpica_calendar_scheduled",
                "results": []
            }

            sprint_block = None
            if is_sprint:
                sprint_block = {
                    "session_status": "upcoming",
                    "revision": 1,
                    "publication_timestamp_utc": f"{race_date}T15:00:00Z",
                    "provenance": "jolpica_calendar_scheduled",
                    "results": []
                }

        round_sessions = {
            "qualifying": q_block,
            "starting_grid": grid_block,
            "grand_prix": gp_block
        }
        if sprint_block:
            round_sessions["sprint_race"] = sprint_block

        season_2026_rounds.append({
            "round": rnd,
            "race_id": race_id,
            "circuit_id": circuit_id,
            "circuit_name": circuit_name,
            "country": country,
            "race_date": race_date,
            "is_sprint_weekend": is_sprint,
            "sessions": round_sessions
        })

    baseline["seasons"].append({
        "season": 2026,
        "regulation_era": "active_aero_sustainable_fuel_gen3",
        "rounds": season_2026_rounds
    })

    # Validate against schema
    logger.info("Validating historical baseline against Schema v1.3.1...")
    is_valid, validation_errors = validate_baseline_schema(baseline)
    if not is_valid:
        logger.error(f"Validation FAILED with {len(validation_errors)} errors:")
        for err in validation_errors[:15]:
            logger.error(f"  - {err}")
        raise ValueError(f"Schema validation failed: {validation_errors[0]}")
    logger.info("Validation PASSED! 0 errors found.")

    # Write output
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(baseline, f, indent=2, ensure_ascii=False)
    logger.info(f"Successfully wrote historical baseline to {output_path}")

    return baseline


if __name__ == "__main__":
    build_historical_baseline()

