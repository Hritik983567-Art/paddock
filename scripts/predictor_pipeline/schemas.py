"""
Feature Schema Definitions and Data Dictionary for Paddock Race Predictor.
Every feature's type, provenance source, and strict leakage rule is documented here.
"""

FEATURE_SCHEMA = {
    # 1. Identifiers & Metadata
    "race_id": {
        "type": "string",
        "source": "derived",
        "description": "Unique stable identifier for the Grand Prix ({season}_{round}_{circuit_id})",
        "leakage_rule": "Deterministic session identifier. Pre-race available."
    },
    "season": {
        "type": "int",
        "source": "jolpica",
        "description": "Championship season year",
        "leakage_rule": "Pre-race available."
    },
    "round": {
        "type": "int",
        "source": "jolpica",
        "description": "Championship round number within the season",
        "leakage_rule": "Pre-race available."
    },
    "circuit_id": {
        "type": "string",
        "source": "jolpica",
        "description": "Canonical circuit identifier slug (e.g. 'americas', 'monaco')",
        "leakage_rule": "Pre-race available."
    },
    "circuit_name": {
        "type": "string",
        "source": "jolpica",
        "description": "Official circuit venue name",
        "leakage_rule": "Pre-race available."
    },
    "country": {
        "type": "string",
        "source": "jolpica",
        "description": "Host country of the Grand Prix",
        "leakage_rule": "Pre-race available."
    },
    "race_date": {
        "type": "string",
        "source": "jolpica",
        "description": "Local calendar date of Sunday Grand Prix (YYYY-MM-DD)",
        "leakage_rule": "Pre-race available."
    },
    "race_timestamp_utc": {
        "type": "string",
        "source": "jolpica",
        "description": "Official ISO-8601 UTC timestamp of scheduled race lights out",
        "leakage_rule": "Pre-race available."
    },
    "driver_id": {
        "type": "string",
        "source": "jolpica",
        "description": "Canonical driver identifier slug (e.g. 'max_verstappen')",
        "leakage_rule": "Pre-race available."
    },
    "driver_code": {
        "type": "string",
        "source": "jolpica",
        "description": "Official 3-letter FIA timing code (e.g. 'VER')",
        "leakage_rule": "Pre-race available."
    },
    "driver_number": {
        "type": "string",
        "source": "jolpica",
        "description": "Driver car number",
        "leakage_rule": "Pre-race available."
    },
    "constructor_id": {
        "type": "string",
        "source": "jolpica",
        "description": "Canonical constructor identifier slug (e.g. 'red_bull')",
        "leakage_rule": "Pre-race available."
    },
    "constructor_name": {
        "type": "string",
        "source": "jolpica",
        "description": "Official constructor team name",
        "leakage_rule": "Pre-race available."
    },

    # 2. Qualifying & Starting Grid Features
    "grid_position": {
        "type": "int",
        "source": "jolpica_results_grid",
        "description": "Official final starting grid position for Sunday race start post-penalties",
        "leakage_rule": "Issued by FIA Stewards post-qualifying prior to race start."
    },
    "quali_position": {
        "type": "int",
        "source": "jolpica_qualifying",
        "description": "Classification position achieved in Saturday Qualifying session",
        "leakage_rule": "Calculated upon conclusion of Saturday qualifying."
    },
    "grid_penalty_delta": {
        "type": "int",
        "source": "derived",
        "description": "grid_position - quali_position (>0 indicates grid drop, <0 indicates promotion)",
        "leakage_rule": "Derived solely from Saturday qualifying and published starting grid."
    },
    "quali_time_sec": {
        "type": "float",
        "source": "jolpica_qualifying",
        "description": "Driver's best lap time in qualifying in seconds (from Q3, Q2, or Q1)",
        "leakage_rule": "Recorded Saturday."
    },
    "pole_time_sec": {
        "type": "float",
        "source": "jolpica_qualifying",
        "description": "Benchmark Pole Position lap time in seconds",
        "leakage_rule": "Recorded Saturday."
    },
    "quali_time_delta_to_pole": {
        "type": "float",
        "source": "derived",
        "description": "Difference in seconds between driver's best time and Pole (0.000 for Pole)",
        "leakage_rule": "Derived solely from Saturday qualifying lap times."
    },
    "quali_time_ratio_to_pole": {
        "type": "float",
        "source": "derived",
        "description": "driver_best_time / pole_time (scale-invariant relative pace ratio)",
        "leakage_rule": "Derived solely from Saturday qualifying lap times."
    },
    "reached_q3": {
        "type": "int",
        "source": "jolpica_qualifying",
        "description": "Binary flag (1 if driver set a Q3 time, 0 otherwise)",
        "leakage_rule": "Known Saturday."
    },
    "front_row": {
        "type": "int",
        "source": "derived",
        "description": "Binary flag (1 if starting P1 or P2 on the grid, 0 otherwise)",
        "leakage_rule": "Derived from starting grid."
    },

    # 3. Driver Historical Form (Strictly Prior Races t < Current Race)
    "driver_prev_race_position": {
        "type": "float",
        "source": "rolling_history",
        "description": "Driver finish position in immediate previous completed GP (NaN if DNF or absent)",
        "leakage_rule": "Strictly uses races before current GP date."
    },
    "driver_prev_race_points": {
        "type": "float",
        "source": "rolling_history",
        "description": "Driver points scored in immediate previous completed GP",
        "leakage_rule": "Strictly uses races before current GP date."
    },
    "driver_rolling_3_avg_finish": {
        "type": "float",
        "source": "rolling_history",
        "description": "Mean finish position across driver's last 3 completed race starts",
        "leakage_rule": "Strictly uses races before current GP date."
    },
    "driver_rolling_5_avg_finish": {
        "type": "float",
        "source": "rolling_history",
        "description": "Mean finish position across driver's last 5 completed race starts",
        "leakage_rule": "Strictly uses races before current GP date."
    },
    "driver_rolling_5_win_rate": {
        "type": "float",
        "source": "rolling_history",
        "description": "Wins in last 5 starts divided by 5 (0.0 to 1.0)",
        "leakage_rule": "Strictly uses races before current GP date."
    },
    "driver_rolling_5_podium_rate": {
        "type": "float",
        "source": "rolling_history",
        "description": "Podiums (P1-P3) in last 5 starts divided by 5",
        "leakage_rule": "Strictly uses races before current GP date."
    },
    "driver_rolling_5_pts_per_race": {
        "type": "float",
        "source": "rolling_history",
        "description": "Average points scored per race over last 5 starts",
        "leakage_rule": "Strictly uses races before current GP date."
    },
    "driver_rolling_5_dnf_rate": {
        "type": "float",
        "source": "rolling_history",
        "description": "Unclassified / DNF rate across last 5 starts",
        "leakage_rule": "Strictly uses races before current GP date."
    },
    "driver_rolling_10_avg_finish": {
        "type": "float",
        "source": "rolling_history",
        "description": "Mean finish position across driver's last 10 completed race starts",
        "leakage_rule": "Strictly uses races before current GP date."
    },
    "driver_rolling_10_win_rate": {
        "type": "float",
        "source": "rolling_history",
        "description": "Wins in last 10 starts divided by 10",
        "leakage_rule": "Strictly uses races before current GP date."
    },
    "driver_season_points_before_gp": {
        "type": "float",
        "source": "rolling_history",
        "description": "Cumulative points scored by driver in current season prior to this round",
        "leakage_rule": "Strictly sums rounds 1..(round-1)."
    },
    "driver_season_standing_before_gp": {
        "type": "int",
        "source": "rolling_history",
        "description": "Driver championship rank entering this Grand Prix",
        "leakage_rule": "Calculated on standings prior to this GP."
    },

    # 4. Constructor Historical Form (Strictly Prior Races t < Current Race)
    "constructor_prev_race_points": {
        "type": "float",
        "source": "rolling_history",
        "description": "Total points scored by constructor in previous GP",
        "leakage_rule": "Strictly uses races before current GP date."
    },
    "constructor_rolling_3_avg_points": {
        "type": "float",
        "source": "rolling_history",
        "description": "Mean points per GP scored by constructor in last 3 rounds",
        "leakage_rule": "Strictly uses races before current GP date."
    },
    "constructor_rolling_5_win_rate": {
        "type": "float",
        "source": "rolling_history",
        "description": "Constructor wins in last 5 rounds divided by 5",
        "leakage_rule": "Strictly uses races before current GP date."
    },
    "constructor_rolling_5_podium_rate": {
        "type": "float",
        "source": "rolling_history",
        "description": "Constructor podium finishes divided by 10 (2 cars x 5 races)",
        "leakage_rule": "Strictly uses races before current GP date."
    },
    "constructor_rolling_3_avg_grid": {
        "type": "float",
        "source": "rolling_history",
        "description": "Mean starting grid position of both team cars in last 3 rounds",
        "leakage_rule": "Strictly uses races before current GP date."
    },
    "constructor_season_points_before_gp": {
        "type": "float",
        "source": "rolling_history",
        "description": "Cumulative constructor points in current season prior to this round",
        "leakage_rule": "Strictly sums rounds 1..(round-1)."
    },
    "constructor_season_standing_before_gp": {
        "type": "int",
        "source": "rolling_history",
        "description": "Constructor championship rank entering this Grand Prix",
        "leakage_rule": "Calculated on standings prior to this GP."
    },
    "constructor_best_quali_delta_to_pole": {
        "type": "float",
        "source": "derived",
        "description": "Best qualifying delta to pole between the team's two drivers in this session",
        "leakage_rule": "Derived from Saturday qualifying."
    },

    # 5. Teammate Head-to-Head & Intra-Team Dynamics
    "outqualified_teammate": {
        "type": "int",
        "source": "derived",
        "description": "Binary flag (1 if driver qualified ahead of teammate in this session, 0 otherwise)",
        "leakage_rule": "Derived from Saturday qualifying."
    },
    "teammate_rolling_5_quali_h2h": {
        "type": "float",
        "source": "rolling_history",
        "description": "Share of last 5 qualifying sessions where driver out-qualified teammate",
        "leakage_rule": "Strictly uses sessions before current GP."
    },

    # 6. Circuit Demands & Venue Heritage
    "driver_circuit_starts": {
        "type": "int",
        "source": "rolling_history",
        "description": "Career race starts by driver at this specific circuit prior to this GP",
        "leakage_rule": "Strictly counts past editions."
    },
    "driver_circuit_wins": {
        "type": "int",
        "source": "rolling_history",
        "description": "Career race wins by driver at this specific circuit prior to this GP",
        "leakage_rule": "Strictly counts past editions."
    },
    "driver_circuit_win_rate": {
        "type": "float",
        "source": "derived",
        "description": "Career wins at circuit / career starts at circuit (0.0 if starts == 0)",
        "leakage_rule": "Derived from past editions."
    },
    "driver_circuit_podiums": {
        "type": "int",
        "source": "rolling_history",
        "description": "Career podium finishes at this circuit prior to this GP",
        "leakage_rule": "Strictly counts past editions."
    },
    "driver_circuit_avg_finish": {
        "type": "float",
        "source": "rolling_history",
        "description": "Career mean finish position at this circuit (NaN if 0 starts)",
        "leakage_rule": "Strictly counts past editions."
    },
    "constructor_circuit_wins": {
        "type": "int",
        "source": "rolling_history",
        "description": "Career team wins at this circuit prior to this GP",
        "leakage_rule": "Strictly counts past editions."
    },
    "circuit_historical_pole_win_rate": {
        "type": "float",
        "source": "rolling_history",
        "description": "Historical percentage of Grand Prix at this circuit won from Pole (P1 on grid)",
        "leakage_rule": "Strictly counts past editions."
    },

    # 7. Session, Environmental & Regulatory Context
    "is_sprint_weekend": {
        "type": "int",
        "source": "jolpica",
        "description": "Binary flag (1 if event weekend features an official Sprint session, 0 otherwise)",
        "leakage_rule": "Calendar metadata."
    },
    "regulation_era": {
        "type": "string",
        "source": "derived",
        "description": "Aerodynamic & engine regulatory era (e.g. 'v6_turbo_hybrid_gen1', 'ground_effect_gen2')",
        "leakage_rule": "Known prior."
    },
    "quali_air_temp_c": {
        "type": "float",
        "source": "fastf1",
        "description": "Mean ambient air temperature recorded during Saturday qualifying (°C)",
        "leakage_rule": "Recorded Saturday."
    },
    "quali_track_temp_c": {
        "type": "float",
        "source": "fastf1",
        "description": "Mean asphalt track temperature recorded during Saturday qualifying (°C)",
        "leakage_rule": "Recorded Saturday."
    },
    "quali_humidity_pct": {
        "type": "float",
        "source": "fastf1",
        "description": "Mean relative humidity recorded during Saturday qualifying (%)",
        "leakage_rule": "Recorded Saturday."
    },
    "quali_rainfall": {
        "type": "float",
        "source": "fastf1",
        "description": "Rainfall occurrence flag during qualifying (1.0 = wet session, 0.0 = dry, NaN = unavailable)",
        "leakage_rule": "Recorded Saturday."
    },

    # 8. Provenance & Execution Auditing
    "data_provenance": {
        "type": "string",
        "source": "metadata",
        "description": "Data sources merged for this record (e.g. 'jolpica', 'jolpica+fastf1')",
        "leakage_rule": "Audit metadata."
    },
    "feature_timestamp_utc": {
        "type": "string",
        "source": "metadata",
        "description": "ISO-8601 UTC timestamp of feature extraction/pipeline execution",
        "leakage_rule": "Audit metadata."
    },

    # 9. Supervised Binary Target
    "won_race": {
        "type": "int",
        "source": "jolpica_results_position",
        "description": "Ground Truth Binary Target: 1 if driver finished P1 in official race classification, 0 otherwise",
        "leakage_rule": "Derived exclusively from final Sunday race result for supervised training."
    }
}
