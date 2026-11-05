"""Prediction Cutoff Validator for Paddock Session Pace Pipeline (Phase 3C.4E.10).

Formalizes strict temporal isolation and data availability rules for standard and sprint weekends.
Guarantees that no feature uses information generated after its designated prediction cutoff.
"""

from enum import Enum
from typing import Dict, Any, List, Optional, Tuple, Set
from datetime import datetime, timezone
import json
from pathlib import Path


class WeekendFormat(str, Enum):
    STANDARD = "standard"
    SPRINT = "sprint"


class PredictionStage(str, Enum):
    # Standard Weekend Stages
    PROVISIONAL_POST_QUALIFYING = "provisional_post_qualifying"  # Cutoff 1: After Saturday Q3
    OFFICIAL_STARTING_GRID = "official_starting_grid"            # Cutoff 2: Sunday ~13:00 Local

    # Sprint Weekend Stages (2024 Format)
    SPRINT_POST_SHOOTOUT = "sprint_post_shootout"                # Cutoff S1: After Friday Sprint Qualifying
    PROVISIONAL_POST_SPRINT_AND_QUALIFYING = "provisional_post_sprint_and_qualifying" # Cutoff S2: After Sat Q3
    SPRINT_OFFICIAL_GRID = "sprint_official_grid"                # Cutoff S3: Sunday ~13:00 Local


class CutoffViolationError(ValueError):
    """Raised when a feature or session violates temporal cutoff rules."""
    pass


class PredictionCutoffValidator:
    """Validates session eligibility and timestamps against formal prediction cutoffs."""

    # Explicit mapping of allowed sessions per weekend format and prediction stage
    ALLOWED_SESSIONS: Dict[Tuple[WeekendFormat, PredictionStage], Set[str]] = {
        # Standard Weekend
        (WeekendFormat.STANDARD, PredictionStage.PROVISIONAL_POST_QUALIFYING): {
            "FP1", "FP2", "FP3", "QUALIFYING"
        },
        (WeekendFormat.STANDARD, PredictionStage.OFFICIAL_STARTING_GRID): {
            "FP1", "FP2", "FP3", "QUALIFYING", "OFFICIAL_GRID_DOC"
        },
        # Sprint Weekend (2024 Format: FP1 -> Sprint Shootout -> Sprint Race -> GP Qualifying -> GP)
        (WeekendFormat.SPRINT, PredictionStage.SPRINT_POST_SHOOTOUT): {
            "FP1", "SPRINT_SHOOTOUT"
        },
        (WeekendFormat.SPRINT, PredictionStage.PROVISIONAL_POST_SPRINT_AND_QUALIFYING): {
            "FP1", "SPRINT_SHOOTOUT", "SPRINT_RACE", "QUALIFYING"
        },
        (WeekendFormat.SPRINT, PredictionStage.SPRINT_OFFICIAL_GRID): {
            "FP1", "SPRINT_SHOOTOUT", "SPRINT_RACE", "QUALIFYING", "OFFICIAL_GRID_DOC"
        },
    }

    # Explicitly forbidden data sources per stage (leakage protection)
    FORBIDDEN_SOURCES: Dict[PredictionStage, List[str]] = {
        PredictionStage.PROVISIONAL_POST_QUALIFYING: [
            "OFFICIAL_GRID_DOC", "RACE_RESULT", "RACE_FASTEST_LAP", "RACE_TELEMETRY", "SUNDAY_WEATHER"
        ],
        PredictionStage.OFFICIAL_STARTING_GRID: [
            "RACE_RESULT", "RACE_FASTEST_LAP", "RACE_TELEMETRY", "RACE_PIT_STOPS", "POST_RACE_SCRUTINEERING"
        ],
        PredictionStage.SPRINT_POST_SHOOTOUT: [
            "SPRINT_RACE_RESULT", "MAIN_QUALIFYING", "OFFICIAL_GRID_DOC", "RACE_RESULT"
        ],
        PredictionStage.PROVISIONAL_POST_SPRINT_AND_QUALIFYING: [
            "OFFICIAL_GRID_DOC", "RACE_RESULT", "SUNDAY_WEATHER", "RACE_TELEMETRY"
        ],
        PredictionStage.SPRINT_OFFICIAL_GRID: [
            "RACE_RESULT", "RACE_FASTEST_LAP", "RACE_TELEMETRY", "RACE_PIT_STOPS"
        ],
    }

    @classmethod
    def validate_session_allowed(
        cls,
        session_name: str,
        weekend_format: WeekendFormat,
        stage: PredictionStage
    ) -> bool:
        """Verifies if a session is permitted for a given weekend format and stage."""
        key = (weekend_format, stage)
        allowed = cls.ALLOWED_SESSIONS.get(key, set())
        if session_name.upper() not in allowed:
            raise CutoffViolationError(
                f"Session '{session_name}' is NOT permitted for {weekend_format.value} "
                f"weekend at stage '{stage.value}'. Allowed: {sorted(list(allowed))}"
            )
        return True

    @classmethod
    def validate_timestamp_isolation(
        cls,
        feature_timestamp_utc: str,
        cutoff_timestamp_utc: str,
        feature_name: str
    ) -> bool:
        """Validates that a feature timestamp strictly precedes or matches the cutoff timestamp."""
        try:
            feat_dt = datetime.fromisoformat(feature_timestamp_utc.replace("Z", "+00:00"))
            cutoff_dt = datetime.fromisoformat(cutoff_timestamp_utc.replace("Z", "+00:00"))
        except Exception as e:
            raise ValueError(f"Malformed ISO timestamp: {e}")

        if feat_dt > cutoff_dt:
            raise CutoffViolationError(
                f"Temporal Leakage Detected! Feature '{feature_name}' timestamp ({feature_timestamp_utc}) "
                f"is strictly after prediction cutoff ({cutoff_timestamp_utc}). Delta: {feat_dt - cutoff_dt}"
            )
        return True

    @classmethod
    def generate_cutoff_specification(cls) -> Dict[str, Any]:
        """Generates comprehensive cutoff definition report."""
        spec = {
            "metadata": {
                "validator": "PredictionCutoffValidator",
                "timestamp_utc": datetime.now(timezone.utc).isoformat(),
                "f1_regulations_supported": ["2021-2025 V6 Turbo Hybrid / Ground Effect"],
            },
            "weekend_formats": {
                "standard_weekend": {
                    "total_practice_sessions": 3,
                    "session_sequence": ["FP1", "FP2", "FP3", "Qualifying", "Grand Prix"],
                    "stages": {
                        "provisional_post_qualifying": {
                            "cutoff_description": "Immediately following Qualifying Q3 Chequered Flag (Saturday evening).",
                            "allowed_sessions": list(cls.ALLOWED_SESSIONS[(WeekendFormat.STANDARD, PredictionStage.PROVISIONAL_POST_QUALIFYING)]),
                            "forbidden_sources": cls.FORBIDDEN_SOURCES[PredictionStage.PROVISIONAL_POST_QUALIFYING],
                            "intended_use": "Provisional model inference prior to overnight penalties and starting grid confirmation.",
                        },
                        "official_starting_grid": {
                            "cutoff_description": "Following publication of FIA Final Starting Grid Document (Sunday ~2h before lights out).",
                            "allowed_sessions": list(cls.ALLOWED_SESSIONS[(WeekendFormat.STANDARD, PredictionStage.OFFICIAL_STARTING_GRID)]),
                            "forbidden_sources": cls.FORBIDDEN_SOURCES[PredictionStage.OFFICIAL_STARTING_GRID],
                            "intended_use": "Authoritative starting grid model inference incorporating verified steward penalties.",
                        },
                    },
                },
                "sprint_weekend_2024": {
                    "total_practice_sessions": 1,
                    "session_sequence": ["FP1", "Sprint Shootout (SQ)", "Sprint Race (100km)", "GP Qualifying", "Grand Prix"],
                    "critical_sporting_rule": "FP2 and FP3 DO NOT EXIST on 2024 sprint weekends. FP2 features MUST be flagged as missing.",
                    "stages": {
                        "sprint_post_shootout": {
                            "cutoff_description": "Following Friday Sprint Qualifying (Shootout).",
                            "allowed_sessions": list(cls.ALLOWED_SESSIONS[(WeekendFormat.SPRINT, PredictionStage.SPRINT_POST_SHOOTOUT)]),
                            "forbidden_sources": cls.FORBIDDEN_SOURCES[PredictionStage.SPRINT_POST_SHOOTOUT],
                        },
                        "provisional_post_sprint_and_qualifying": {
                            "cutoff_description": "Following Saturday main Grand Prix Qualifying (Saturday evening).",
                            "allowed_sessions": list(cls.ALLOWED_SESSIONS[(WeekendFormat.SPRINT, PredictionStage.PROVISIONAL_POST_SPRINT_AND_QUALIFYING)]),
                            "forbidden_sources": cls.FORBIDDEN_SOURCES[PredictionStage.PROVISIONAL_POST_SPRINT_AND_QUALIFYING],
                            "pace_advantage": "Saturday 100km Sprint Race pace is available as genuine pre-race green-flag racecraft evidence.",
                        },
                        "sprint_official_grid": {
                            "cutoff_description": "Following publication of FIA Final Starting Grid Document for Sunday GP.",
                            "allowed_sessions": list(cls.ALLOWED_SESSIONS[(WeekendFormat.SPRINT, PredictionStage.SPRINT_OFFICIAL_GRID)]),
                            "forbidden_sources": cls.FORBIDDEN_SOURCES[PredictionStage.SPRINT_OFFICIAL_GRID],
                        },
                    },
                },
            },
        }
        return spec

