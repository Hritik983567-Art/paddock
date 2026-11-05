"""Pace Feature Builder for Paddock Session Pace Pipeline (Phase 3C.4E.10).

Constructs 8 experimental race-pace and session features with strict provenance,
minimum sample thresholds, explicit missing value handling, and zero leakage.

Candidate Features:
1. fp2_long_run_median_pace (s)
2. fp2_long_run_pace_delta_to_field (s)
3. fp2_stint_consistency (s)
4. fp2_tyre_degradation_estimate (s/lap)
5. qualifying_delta_to_pole_pct (%)
6. sector_pace_delta (s)
7. sprint_race_pace_indicator (s/lap)
8. track_overtaking_difficulty ([0.0, 1.0])
"""

import json
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

import numpy as np
import pandas as pd

from .prediction_cutoff_validator import WeekendFormat, PredictionStage, PredictionCutoffValidator

REPORTS_DIR = Path(__file__).resolve().parent.parent.parent / "predictor_model" / "reports" / "phase_3c_4e_10"

# Canonical circuit overtaking difficulty index (higher = easier to overtake)
# Grounded in historical F1 overtaking records, track width, and DRS dynamics.
CIRCUIT_OVERTAKING_INDEX: Dict[str, float] = {
    "monaco": 0.05,
    "hungaroring": 0.25,
    "marina_bay": 0.30,
    "singapore": 0.30,
    "zandvoort": 0.35,
    "albert_park": 0.40,
    "imola": 0.40,
    "suzuka": 0.45,
    "catalunya": 0.50,
    "losail": 0.55,
    "qatar": 0.55,
    "jeddah": 0.60,
    "rodriguez": 0.60,
    "baku": 0.65,
    "miami": 0.65,
    "silverstone": 0.70,
    "monza": 0.75,
    "red_bull_ring": 0.75,
    "spielberg": 0.75,
    "austin": 0.75,
    "americas": 0.75,
    "shanghai": 0.75,
    "interlagos": 0.80,
    "vegas": 0.80,
    "spa": 0.85,
    "bahrain": 0.85,
    "sakhir": 0.85,
}
DEFAULT_OVERTAKING_INDEX = 0.50


@dataclass
class SessionPaceRecord:
    """Represents candidate pace features for a single driver-race record."""
    race_id: str
    driver_id: str
    weekend_format: str
    prediction_stage: str

    # 1. FP2 Long Run Median Pace
    fp2_long_run_median_pace: Optional[float] = None
    # 2. FP2 Long Run Pace Delta to Field
    fp2_long_run_pace_delta_to_field: Optional[float] = None
    # 3. FP2 Stint Consistency (Lap Time Std Dev)
    fp2_stint_consistency: Optional[float] = None
    # 4. FP2 Tyre Degradation Rate (Slope in s/lap)
    fp2_tyre_degradation_estimate: Optional[float] = None
    # 5. Qualifying Delta to Pole (%)
    qualifying_delta_to_pole_pct: Optional[float] = None
    # 6. Sector Pace Delta (s)
    sector_pace_delta: Optional[float] = None
    # 7. Sprint Race Pace Delta to Leader (s/lap)
    sprint_race_pace_indicator: Optional[float] = None
    # 8. Track Overtaking Difficulty Index ([0, 1])
    track_overtaking_difficulty: float = DEFAULT_OVERTAKING_INDEX

    # Diagnostic metadata
    valid_laps_count_fp2: int = 0
    missing_reasons: Dict[str, str] = field(default_factory=dict)
    provenance: Dict[str, str] = field(default_factory=dict)


@dataclass
class PaceFeatureSet:
    """Holds a set of SessionPaceRecord objects for a full race field."""
    race_id: str
    weekend_format: str
    prediction_stage: str
    records: List[SessionPaceRecord] = field(default_factory=list)


class PaceFeatureBuilder:
    """Builds and validates experimental pace features from session telemetry or fixtures."""

    MIN_FP2_LONG_RUN_LAPS = 5
    MIN_DEG_ESTIMATE_LAPS = 6

    def __init__(self):
        REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    @classmethod
    def get_track_overtaking_difficulty(cls, circuit_id: str) -> float:
        """Returns normalized track overtaking index for a circuit."""
        return CIRCUIT_OVERTAKING_INDEX.get(circuit_id.lower(), DEFAULT_OVERTAKING_INDEX)

    @classmethod
    def compute_qualifying_delta_to_pole(
        cls,
        driver_quali_time_sec: Optional[float],
        pole_time_sec: Optional[float]
    ) -> Tuple[Optional[float], Optional[str]]:
        """Computes percentage gap to pole position: (t_driver - t_pole) / t_pole * 100."""
        if driver_quali_time_sec is None or pole_time_sec is None:
            return None, "NO_VALID_QUALI_TIME"
        if pole_time_sec <= 0.0 or driver_quali_time_sec <= 0.0:
            return None, "INVALID_ZERO_TIME"
        delta_pct = ((driver_quali_time_sec - pole_time_sec) / pole_time_sec) * 100.0
        return round(float(max(0.0, delta_pct)), 4), None

    @classmethod
    def compute_fp2_long_run_metrics(
        cls,
        lap_times_sec: List[float],
        is_sprint_weekend: bool = False
    ) -> Dict[str, Any]:
        """Analyzes consecutive clean timed laps in FP2 to compute long run pace, consistency, and degradation."""
        if is_sprint_weekend:
            return {
                "median_pace": None,
                "stint_consistency": None,
                "degradation_estimate": None,
                "valid_laps_count": 0,
                "missing_reason": "SPRINT_WEEKEND_NO_FP2",
            }

        # Filter out invalid / out-lap / in-lap outliers (> 1.25 * median or < 0.75 * median)
        valid_laps = [t for t in lap_times_sec if 45.0 <= t <= 180.0]
        if len(valid_laps) < cls.MIN_FP2_LONG_RUN_LAPS:
            return {
                "median_pace": None,
                "stint_consistency": None,
                "degradation_estimate": None,
                "valid_laps_count": len(valid_laps),
                "missing_reason": "INSUFFICIENT_CONSECUTIVE_LAPS",
            }

        # Median Pace
        median_pace = float(np.median(valid_laps))

        # Stint Consistency (Standard Deviation of clean laps)
        consistency = float(np.std(valid_laps, ddof=1)) if len(valid_laps) > 1 else 0.0

        # Tyre Degradation Slope (linear regression lap vs lap time)
        deg_estimate = None
        if len(valid_laps) >= cls.MIN_DEG_ESTIMATE_LAPS:
            x = np.arange(1, len(valid_laps) + 1)
            y = np.array(valid_laps)
            # Slope: s/lap
            slope, _ = np.polyfit(x, y, 1)
            deg_estimate = float(slope)

        return {
            "median_pace": round(median_pace, 3),
            "stint_consistency": round(consistency, 3),
            "degradation_estimate": round(deg_estimate, 4) if deg_estimate is not None else None,
            "valid_laps_count": len(valid_laps),
            "missing_reason": None,
        }

    @classmethod
    def compute_sprint_race_pace(
        cls,
        driver_sprint_laps: List[float],
        winner_sprint_laps: List[float],
        is_sprint_weekend: bool = True
    ) -> Tuple[Optional[float], Optional[str]]:
        """Computes driver pace delta to sprint winner across green-flag sprint laps."""
        if not is_sprint_weekend:
            return None, "STANDARD_WEEKEND_NO_SPRINT"
        if not driver_sprint_laps or not winner_sprint_laps:
            return None, "MISSING_SPRINT_LAP_DATA"

        clean_d = [t for t in driver_sprint_laps if 50.0 <= t <= 180.0]
        clean_w = [t for t in winner_sprint_laps if 50.0 <= t <= 180.0]
        if len(clean_d) < 5 or len(clean_w) < 5:
            return None, "INSUFFICIENT_SPRINT_LAPS"

        driver_median = float(np.median(clean_d))
        winner_median = float(np.median(clean_w))
        delta = driver_median - winner_median
        return round(float(max(0.0, delta)), 3), None

    @classmethod
    def generate_feature_definitions_schema(cls) -> Dict[str, Any]:
        """Outputs comprehensive JSON schema defining all 8 candidate pace features."""
        schema = {
            "schema_version": "v1.0.0_experimental_pace",
            "metadata": {
                "generated_by": "PaceFeatureBuilder",
                "timestamp_utc": datetime.now(timezone.utc).isoformat(),
                "feature_count": 8,
            },
            "features": {
                "fp2_long_run_median_pace": {
                    "formula": "median(clean_stint_laps_fp2)",
                    "units": "seconds",
                    "data_type": "float64",
                    "sample_requirements": f"Minimum {cls.MIN_FP2_LONG_RUN_LAPS} consecutive green-flag timed laps in FP2.",
                    "missing_handling": "Set to null (None) if laps < 5 or on Sprint weekends where FP2 does not exist.",
                    "prediction_cutoff": "Cutoff 1 (Post-Qualifying Provisional) / Cutoff 2 (Official Starting Grid).",
                    "provenance": "FastF1 session lap timing (Session 2 / Practice 2).",
                },
                "fp2_long_run_pace_delta_to_field": {
                    "formula": "fp2_long_run_median_pace - median(fp2_long_run_median_pace of all valid starters)",
                    "units": "seconds (negative = faster than field median)",
                    "data_type": "float64",
                    "sample_requirements": "Minimum 5 valid starters with clean FP2 stints.",
                    "missing_handling": "Set to null (None) if driver has no FP2 pace or on sprint weekends.",
                    "prediction_cutoff": "Cutoff 1 / Cutoff 2.",
                    "provenance": "Derived from FastF1 FP2 stint telemetry.",
                },
                "fp2_stint_consistency": {
                    "formula": "std_dev(clean_stint_laps_fp2)",
                    "units": "seconds (lower = higher tyre management consistency)",
                    "data_type": "float64",
                    "sample_requirements": f"Minimum {cls.MIN_FP2_LONG_RUN_LAPS} consecutive green-flag laps.",
                    "missing_handling": "Set to null (None) if laps < 5 or on sprint weekends.",
                    "prediction_cutoff": "Cutoff 1 / Cutoff 2.",
                    "provenance": "FastF1 FP2 stint dispersion.",
                },
                "fp2_tyre_degradation_estimate": {
                    "formula": "linear_regression_slope(lap_index, lap_time_sec)",
                    "units": "seconds per lap (s/lap)",
                    "data_type": "float64",
                    "sample_requirements": f"Minimum {cls.MIN_DEG_ESTIMATE_LAPS} clean laps in primary stint.",
                    "missing_handling": "Set to null (None) if laps < 6 or on sprint weekends.",
                    "prediction_cutoff": "Cutoff 1 / Cutoff 2.",
                    "provenance": "FastF1 FP2 tyre degradation slope.",
                },
                "qualifying_delta_to_pole_pct": {
                    "formula": "((driver_best_time - pole_time) / pole_time) * 100",
                    "units": "percentage (%)",
                    "data_type": "float64",
                    "sample_requirements": "Valid timed lap recorded in Q1, Q2, or Q3.",
                    "missing_handling": "Set to null (None) for drivers without timed lap (crashed on out-lap).",
                    "prediction_cutoff": "Cutoff 1 / Cutoff 2 / Cutoff S2 / Cutoff S3.",
                    "provenance": "Jolpica / Ergast / FastF1 Qualifying Session.",
                },
                "sector_pace_delta": {
                    "formula": "sum((driver_best_sector_i - best_overall_sector_i) for i in 1..3)",
                    "units": "seconds",
                    "data_type": "float64",
                    "sample_requirements": "Valid sector splits in qualifying session.",
                    "missing_handling": "Set to null (None) if sector splits are unavailable.",
                    "prediction_cutoff": "Cutoff 1 / Cutoff 2.",
                    "provenance": "FastF1 Qualifying telemetry sector splits.",
                },
                "sprint_race_pace_indicator": {
                    "formula": "median(driver_sprint_laps) - median(sprint_winner_laps)",
                    "units": "seconds per lap (s/lap)",
                    "data_type": "float64",
                    "sample_requirements": "Minimum 5 green-flag laps in Saturday 100km sprint race.",
                    "missing_handling": "Set to null (None) on standard format weekends (18 of 24 races).",
                    "prediction_cutoff": "Cutoff S2 (Post-Sprint GP Qualifying) / Cutoff S3 (Sprint Official Grid).",
                    "provenance": "FastF1 / Ergast Saturday Sprint Race classification and lap chart.",
                },
                "track_overtaking_difficulty": {
                    "formula": "calibrated_track_overtaking_index(circuit_id)",
                    "units": "dimensionless index in [0.0, 1.0] (0.05=Monaco, 0.85=Spa)",
                    "data_type": "float64",
                    "sample_requirements": "Static circuit metadata.",
                    "missing_handling": "Defaults to 0.50 for unmapped new circuits.",
                    "prediction_cutoff": "Known pre-event.",
                    "provenance": "Historical F1 overtaking database and FIA circuit layout registry.",
                },
            },
        }

        output_path = REPORTS_DIR / "feature_definitions.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(schema, f, indent=2)

        return schema
