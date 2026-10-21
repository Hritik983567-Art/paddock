import os
import math
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
import numpy as np

from .config import get_regulation_era
from .jolpica_extractor import JolpicaExtractor, parse_lap_time_str
from .fastf1_extractor import FastF1Extractor

class FeaturePipeline:
    def __init__(self, jolpica: JolpicaExtractor, fastf1: FastF1Extractor, enable_fastf1: bool = True):
        self.jolpica = jolpica
        self.fastf1 = fastf1
        self.enable_fastf1 = enable_fastf1

        # Historical state accumulators (Strictly prior races)
        # driver_id -> list of {'season': int, 'round': int, 'date': str, 'grid': int, 'position': int, 'points': float, 'status': str, 'circuit_id': str}
        self.driver_race_history: Dict[str, List[Dict[str, Any]]] = {}
        # constructor_id -> list of {'season': int, 'round': int, 'points': float, 'wins': int, 'podiums': int, 'grids': List[int], 'circuit_id': str}
        self.constructor_race_history: Dict[str, List[Dict[str, Any]]] = {}
        # (driver_a, driver_b) sorted -> list of bool (True if driver_a qualified ahead of driver_b)
        self.teammate_quali_history: Dict[Tuple[str, str], List[bool]] = {}
        # circuit_id -> list of {'pole_won': bool, 'winner_driver_id': str, 'winner_constructor_id': str}
        self.circuit_history: Dict[str, List[Dict[str, Any]]] = {}

    def _get_teammate_pair_key(self, driver_a: str, driver_b: str) -> Tuple[str, str]:
        return (driver_a, driver_b) if driver_a < driver_b else (driver_b, driver_a)

    def build_dataset(self, start_season: int, end_season: int) -> pd.DataFrame:
        """
        Orchestrates chronological ingestion and feature engineering across specified seasons.
        Strictly guarantees qualifying-only prediction contract and zero data leakage.
        """
        all_rows: List[Dict[str, Any]] = []

        print(f"[FeaturePipeline] Starting extraction and feature engineering from {start_season} to {end_season}...")

        # Warm up historical state from prior seasons if starting after 2014 to ensure
        # early rounds in start_season have non-empty rolling windows
        warmup_seasons = range(max(2014, start_season - 2), start_season)
        for s in warmup_seasons:
            print(f"[FeaturePipeline] Warming up rolling history for {s}...")
            self._process_season(s, record_dataset=False)

        # Process target evaluation seasons
        for season in range(start_season, end_season + 1):
            print(f"[FeaturePipeline] Processing season {season}...")
            season_rows = self._process_season(season, record_dataset=True)
            all_rows.extend(season_rows)

        df = pd.DataFrame(all_rows)
        print(f"[FeaturePipeline] Generated {len(df)} total driver-race records across {df['race_id'].nunique() if not df.empty else 0} Grand Prix.")
        return df

    def _process_season(self, season: int, record_dataset: bool = True) -> List[Dict[str, Any]]:
        calendar = self.jolpica.get_season_calendar(season)
        if not calendar:
            print(f"[FeaturePipeline] Warning: No calendar races returned for season {season}")
            return []

        # Sort races chronologically by round
        calendar.sort(key=lambda r: int(r.get('round', 0)))
        season_dataset_rows: List[Dict[str, Any]] = []

        # Track season-to-date points entering each round (driver_id -> points, constructor_id -> points)
        driver_season_points: Dict[str, float] = {}
        constructor_season_points: Dict[str, float] = {}

        for race_meta in calendar:
            round_num = int(race_meta['round'])
            circuit = race_meta.get('Circuit', {})
            circuit_id = circuit.get('circuitId', 'unknown_circuit')
            circuit_name = circuit.get('circuitName', circuit_id)
            country = circuit.get('Location', {}).get('country', '')
            race_name = race_meta.get('raceName', f"Grand Prix Round {round_num}")
            race_date = race_meta.get('date', f"{season}-01-01")
            race_time = race_meta.get('time', '12:00:00Z')
            race_timestamp_utc = f"{race_date}T{race_time}"
            race_id = f"{season}_{round_num}_{circuit_id}"
            reg_era = get_regulation_era(season)

            # Check if event has a Sprint session in calendar
            is_sprint = 1 if ('Sprint' in race_meta or 'sprint' in str(race_meta).lower()) else 0

            # 1. Ingest Qualifying Results (Saturday)
            quali_results = self.jolpica.get_qualifying_results(season, round_num)

            # 2. Ingest Race Results (Sunday)
            race_results = self.jolpica.get_race_results(season, round_num)

            if not quali_results or not race_results:
                # Incomplete or cancelled session (e.g. Emilia Romagna 2023 flood cancellation)
                continue

            # Ingest FastF1 Qualifying Weather (Saturday) only when recording dataset and enabled
            if record_dataset and self.enable_fastf1:
                weather_info = self.fastf1.get_qualifying_weather(season, round_num)
                provenance = "jolpica+fastf1" if weather_info.get("fastf1_available") else "jolpica"
            else:
                weather_info = {"quali_air_temp_c": None, "quali_track_temp_c": None, "quali_humidity_pct": None, "quali_rainfall": None, "fastf1_available": False}
                provenance = "jolpica"

            # Index race results by driverId for fast matching
            race_res_by_driver: Dict[str, Dict[str, Any]] = {
                r['Driver']['driverId']: r for r in race_results if 'Driver' in r and 'driverId' in r['Driver']
            }

            # Find Pole Position lap time in qualifying
            valid_quali_times: List[float] = []
            quali_times_by_driver: Dict[str, float] = {}
            for q in quali_results:
                d_id = q['Driver']['driverId']
                best_t = parse_lap_time_str(q.get('Q3')) or parse_lap_time_str(q.get('Q2')) or parse_lap_time_str(q.get('Q1'))
                if best_t is not None:
                    valid_quali_times.append(best_t)
                    quali_times_by_driver[d_id] = best_t

            pole_time = min(valid_quali_times) if valid_quali_times else None

            # Calculate constructor best qualifying delta for this session
            constructor_best_deltas: Dict[str, float] = {}
            for q in quali_results:
                c_id = q.get('Constructor', {}).get('constructorId', '')
                d_id = q['Driver']['driverId']
                d_time = quali_times_by_driver.get(d_id)
                if d_time and pole_time:
                    delta = d_time - pole_time
                    if c_id not in constructor_best_deltas or delta < constructor_best_deltas[c_id]:
                        constructor_best_deltas[c_id] = delta

            # Calculate current driver/constructor standings rankings entering this round
            sorted_driver_standings = sorted(driver_season_points.items(), key=lambda x: x[1], reverse=True)
            driver_standing_ranks = {d_id: rank + 1 for rank, (d_id, _) in enumerate(sorted_driver_standings)}

            sorted_constructor_standings = sorted(constructor_season_points.items(), key=lambda x: x[1], reverse=True)
            constructor_standing_ranks = {c_id: rank + 1 for rank, (c_id, _) in enumerate(sorted_constructor_standings)}

            # Group drivers by constructor for intra-team head-to-head in this qualifying
            constructor_drivers_in_session: Dict[str, List[Dict[str, Any]]] = {}
            for q in quali_results:
                c_id = q.get('Constructor', {}).get('constructorId', '')
                constructor_drivers_in_session.setdefault(c_id, []).append(q)

            # Generate row for each driver participating in Qualifying
            current_race_records: List[Dict[str, Any]] = []

            for q in quali_results:
                driver_obj = q.get('Driver', {})
                driver_id = driver_obj.get('driverId', '')
                driver_code = driver_obj.get('code', driver_id[:3].upper())
                driver_num = driver_obj.get('permanentNumber', q.get('number', ''))
                constructor_obj = q.get('Constructor', {})
                constructor_id = constructor_obj.get('constructorId', '')
                constructor_name = constructor_obj.get('name', constructor_id)

                # Qualifying position
                quali_pos = int(q.get('position', 20))
                has_q3 = 1 if (q.get('Q3') and q.get('Q3').strip()) else 0

                # Match with starting grid from race results
                race_res = race_res_by_driver.get(driver_id)
                if not race_res:
                    # Driver qualified but DNS (did not start race, e.g. crash on recon lap)
                    continue

                raw_grid = int(race_res.get('grid', 0))
                # Pit-lane starts are recorded as grid=0 in Ergast/Jolpica.
                # Standardize pit-lane starts to position 20
                grid_pos = 20 if raw_grid == 0 else raw_grid
                grid_penalty = grid_pos - quali_pos
                front_row = 1 if grid_pos <= 2 else 0

                # Lap Pace deltas
                driver_best_time = quali_times_by_driver.get(driver_id)
                delta_to_pole = round(driver_best_time - pole_time, 3) if (driver_best_time and pole_time) else None
                ratio_to_pole = round(driver_best_time / pole_time, 5) if (driver_best_time and pole_time and pole_time > 0) else None

                # Teammate Head-to-Head
                teammates = [t for t in constructor_drivers_in_session.get(constructor_id, []) if t['Driver']['driverId'] != driver_id]
                outqualified_teammate = 0
                teammate_rolling_5_h2h = 0.5  # Neutral default
                if teammates:
                    teammate_q = teammates[0]
                    teammate_pos = int(teammate_q.get('position', 20))
                    outqualified_teammate = 1 if quali_pos < teammate_pos else 0
                    teammate_id = teammate_q['Driver']['driverId']

                    pair_key = self._get_teammate_pair_key(driver_id, teammate_id)
                    h2h_list = self.teammate_quali_history.get(pair_key, [])
                    if h2h_list:
                        recent_h2h = h2h_list[-5:]
                        # If driver_id is first in pair_key, True means driver_id won
                        driver_wins = sum(1 for val in recent_h2h if (val if driver_id == pair_key[0] else not val))
                        teammate_rolling_5_h2h = round(driver_wins / len(recent_h2h), 2)

                # Driver Historical Form (Strictly from prior races)
                d_hist = self.driver_race_history.get(driver_id, [])
                driver_prev_pos = float(d_hist[-1]['position']) if (d_hist and d_hist[-1]['position'] <= 20) else np.nan
                driver_prev_pts = float(d_hist[-1]['points']) if d_hist else 0.0

                valid_finishes = [h['position'] for h in d_hist if h['position'] <= 20]
                d_roll_3_finish = round(float(np.mean(valid_finishes[-3:])), 2) if len(valid_finishes) >= 1 else np.nan
                d_roll_5_finish = round(float(np.mean(valid_finishes[-5:])), 2) if len(valid_finishes) >= 1 else np.nan
                d_roll_10_finish = round(float(np.mean(valid_finishes[-10:])), 2) if len(valid_finishes) >= 1 else np.nan

                last_5_starts = d_hist[-5:] if d_hist else []
                d_roll_5_wins = round(sum(1 for h in last_5_starts if h['position'] == 1) / max(1, len(last_5_starts)), 2) if last_5_starts else 0.0
                d_roll_5_podiums = round(sum(1 for h in last_5_starts if h['position'] <= 3) / max(1, len(last_5_starts)), 2) if last_5_starts else 0.0
                d_roll_5_pts = round(sum(h['points'] for h in last_5_starts) / max(1, len(last_5_starts)), 2) if last_5_starts else 0.0
                d_roll_5_dnf = round(sum(1 for h in last_5_starts if not h['status'].lower().startswith('finish') and not h['status'].startswith('+')) / max(1, len(last_5_starts)), 2) if last_5_starts else 0.0

                last_10_starts = d_hist[-10:] if d_hist else []
                d_roll_10_wins = round(sum(1 for h in last_10_starts if h['position'] == 1) / max(1, len(last_10_starts)), 2) if last_10_starts else 0.0

                # Constructor Historical Form (Strictly from prior races)
                c_hist = self.constructor_race_history.get(constructor_id, [])
                c_prev_pts = float(c_hist[-1]['points']) if c_hist else 0.0
                last_3_c = c_hist[-3:] if c_hist else []
                c_roll_3_pts = round(float(np.mean([h['points'] for h in last_3_c])), 2) if last_3_c else 0.0

                last_5_c = c_hist[-5:] if c_hist else []
                c_roll_5_wins = round(sum(h['wins'] for h in last_5_c) / max(1, len(last_5_c)), 2) if last_5_c else 0.0
                c_roll_5_podiums = round(sum(h['podiums'] for h in last_5_c) / max(1, len(last_5_c) * 2), 2) if last_5_c else 0.0

                all_c_grids = [g for h in last_3_c for g in h.get('grids', [])]
                c_roll_3_grid = round(float(np.mean(all_c_grids)), 2) if all_c_grids else np.nan

                # Circuit Heritage
                circuit_d_starts = [h for h in d_hist if h['circuit_id'] == circuit_id]
                d_circ_starts = len(circuit_d_starts)
                d_circ_wins = sum(1 for h in circuit_d_starts if h['position'] == 1)
                d_circ_win_rate = round(d_circ_wins / d_circ_starts, 3) if d_circ_starts > 0 else 0.0
                d_circ_podiums = sum(1 for h in circuit_d_starts if h['position'] <= 3)
                d_circ_valid_finishes = [h['position'] for h in circuit_d_starts if h['position'] <= 20]
                d_circ_avg_finish = round(float(np.mean(d_circ_valid_finishes)), 2) if d_circ_valid_finishes else np.nan

                circuit_c_starts = [h for h in c_hist if h['circuit_id'] == circuit_id]
                c_circ_wins = sum(h['wins'] for h in circuit_c_starts)

                circ_races = self.circuit_history.get(circuit_id, [])
                circ_pole_win_rate = round(sum(1 for r in circ_races if r['pole_won']) / max(1, len(circ_races)), 2) if circ_races else 0.45

                # Ground Truth Target from Sunday Race Result
                finish_pos = int(race_res.get('position', 99))
                won_race = 1 if finish_pos == 1 else 0

                feature_row = {
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
                    "grid_position": grid_pos,
                    "quali_position": quali_pos,
                    "grid_penalty_delta": grid_penalty,
                    "quali_time_sec": driver_best_time,
                    "pole_time_sec": pole_time,
                    "quali_time_delta_to_pole": delta_to_pole,
                    "quali_time_ratio_to_pole": ratio_to_pole,
                    "reached_q3": has_q3,
                    "front_row": front_row,
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
                    "driver_season_points_before_gp": driver_season_points.get(driver_id, 0.0),
                    "driver_season_standing_before_gp": driver_standing_ranks.get(driver_id, 20),
                    "constructor_prev_race_points": c_prev_pts,
                    "constructor_rolling_3_avg_points": c_roll_3_pts,
                    "constructor_rolling_5_win_rate": c_roll_5_wins,
                    "constructor_rolling_5_podium_rate": c_roll_5_podiums,
                    "constructor_rolling_3_avg_grid": c_roll_3_grid,
                    "constructor_season_points_before_gp": constructor_season_points.get(constructor_id, 0.0),
                    "constructor_season_standing_before_gp": constructor_standing_ranks.get(constructor_id, 10),
                    "constructor_best_quali_delta_to_pole": constructor_best_deltas.get(constructor_id, delta_to_pole),
                    "outqualified_teammate": outqualified_teammate,
                    "teammate_rolling_5_quali_h2h": teammate_rolling_5_h2h,
                    "driver_circuit_starts": d_circ_starts,
                    "driver_circuit_wins": d_circ_wins,
                    "driver_circuit_win_rate": d_circ_win_rate,
                    "driver_circuit_podiums": d_circ_podiums,
                    "driver_circuit_avg_finish": d_circ_avg_finish,
                    "constructor_circuit_wins": c_circ_wins,
                    "circuit_historical_pole_win_rate": circ_pole_win_rate,
                    "is_sprint_weekend": is_sprint,
                    "regulation_era": reg_era,
                    "quali_air_temp_c": weather_info.get("quali_air_temp_c"),
                    "quali_track_temp_c": weather_info.get("quali_track_temp_c"),
                    "quali_humidity_pct": weather_info.get("quali_humidity_pct"),
                    "quali_rainfall": weather_info.get("quali_rainfall"),
                    "data_provenance": provenance,
                    "feature_timestamp_utc": datetime.now(timezone.utc).isoformat(),
                    "won_race": won_race
                }
                current_race_records.append(feature_row)

            if record_dataset:
                season_dataset_rows.extend(current_race_records)

            # =========================================================================
            # STATE UPDATE STEP: STRICTLY AFTER FEATURES HAVE BEEN GENERATED FOR THIS GP
            # =========================================================================
            # Update driver history
            for r in race_results:
                d_id = r.get('Driver', {}).get('driverId')
                if not d_id:
                    continue
                pos_str = r.get('position', '99')
                pos = int(pos_str) if pos_str.isdigit() else 99
                pts = float(r.get('points', 0.0))
                g_str = r.get('grid', '20')
                g = int(g_str) if g_str.isdigit() and int(g_str) > 0 else 20
                status = r.get('status', 'Unknown')

                self.driver_race_history.setdefault(d_id, []).append({
                    'season': season,
                    'round': round_num,
                    'date': race_date,
                    'grid': g,
                    'position': pos,
                    'points': pts,
                    'status': status,
                    'circuit_id': circuit_id
                })

                # Cumulative season points
                driver_season_points[d_id] = driver_season_points.get(d_id, 0.0) + pts

            # Update constructor history
            constructor_race_stats: Dict[str, Dict[str, Any]] = {}
            for r in race_results:
                c_id = r.get('Constructor', {}).get('constructorId')
                if not c_id:
                    continue
                pos_str = r.get('position', '99')
                pos = int(pos_str) if pos_str.isdigit() else 99
                pts = float(r.get('points', 0.0))
                g_str = r.get('grid', '20')
                g = int(g_str) if g_str.isdigit() and int(g_str) > 0 else 20

                c_stat = constructor_race_stats.setdefault(c_id, {'points': 0.0, 'wins': 0, 'podiums': 0, 'grids': []})
                c_stat['points'] += pts
                if pos == 1:
                    c_stat['wins'] += 1
                if pos <= 3:
                    c_stat['podiums'] += 1
                c_stat['grids'].append(g)

            for c_id, stats in constructor_race_stats.items():
                self.constructor_race_history.setdefault(c_id, []).append({
                    'season': season,
                    'round': round_num,
                    'points': stats['points'],
                    'wins': stats['wins'],
                    'podiums': stats['podiums'],
                    'grids': stats['grids'],
                    'circuit_id': circuit_id
                })
                constructor_season_points[c_id] = constructor_season_points.get(c_id, 0.0) + stats['points']

            # Update teammate qualifying history
            for c_id, q_drivers in constructor_drivers_in_session.items():
                if len(q_drivers) == 2:
                    d1_id = q_drivers[0]['Driver']['driverId']
                    d2_id = q_drivers[1]['Driver']['driverId']
                    pos1 = int(q_drivers[0].get('position', 20))
                    pos2 = int(q_drivers[1].get('position', 20))
                    pair_key = self._get_teammate_pair_key(d1_id, d2_id)
                    # Value is True if pair_key[0] finished ahead of pair_key[1]
                    winner_is_first = (pos1 < pos2) if d1_id == pair_key[0] else (pos2 < pos1)
                    self.teammate_quali_history.setdefault(pair_key, []).append(winner_is_first)

            # Update circuit history
            winner_res = [r for r in race_results if r.get('position') == '1']
            pole_res = [r for r in race_results if r.get('grid') == '1']
            if winner_res:
                winner_d = winner_res[0].get('Driver', {}).get('driverId', '')
                winner_c = winner_res[0].get('Constructor', {}).get('constructorId', '')
                pole_d = pole_res[0].get('Driver', {}).get('driverId', '') if pole_res else ''
                pole_won = (winner_d == pole_d) if pole_d else False

                self.circuit_history.setdefault(circuit_id, []).append({
                    'pole_won': pole_won,
                    'winner_driver_id': winner_d,
                    'winner_constructor_id': winner_c
                })

        return season_dataset_rows
