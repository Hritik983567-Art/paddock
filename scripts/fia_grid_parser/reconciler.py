"""FIA Starting Grid Reconciler (Phase 3C.4E.4).

Compares official FIA Final Starting Grid fixtures against historical qualifying
and race-result datasets to identify discrepancies, establish traceable grid provenance,
and validate data integrity before live inference or production persistence.

Strictly offline. Does not modify model artifacts, production routes, or database schemas.
"""

import json
from dataclasses import asdict, dataclass
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import jsonschema
import pandas as pd

RECONCILER_VERSION = "1.0.0"

SCHEMA_PATH = Path(__file__).parent / "reconciliation_schema.json"
DEFAULT_HISTORICAL_DATASET = Path(__file__).parent.parent.parent / "data" / "predictor" / "f1_race_predictor_dataset.csv"
REPORTS_DIR = Path(__file__).parent / "reports"


class ReconciliationOutcome(str, Enum):
    """Explicit reconciliation outcomes for starting grid comparisons."""
    MATCH = "MATCH"
    MATCH_WITH_MODEL_ENCODING_DIFFERENCE = "MATCH_WITH_MODEL_ENCODING_DIFFERENCE"
    PIT_LANE_ENCODING_MATCH = "PIT_LANE_ENCODING_MATCH"
    QUALIFYING_POSITION_DIFFERENCE = "QUALIFYING_POSITION_DIFFERENCE"
    RACE_RESULT_GRID_DIFFERENCE = "RACE_RESULT_GRID_DIFFERENCE"
    DRIVER_IDENTITY_MISMATCH = "DRIVER_IDENTITY_MISMATCH"
    MISSING_HISTORICAL_RECORD = "MISSING_HISTORICAL_RECORD"
    MISSING_FIA_RECORD = "MISSING_FIA_RECORD"
    WITHDRAWAL_OR_DNS_DIFFERENCE = "WITHDRAWAL_OR_DNS_DIFFERENCE"
    AMBIGUOUS_REQUIRES_MANUAL_REVIEW = "AMBIGUOUS_REQUIRES_MANUAL_REVIEW"


# Mapping from official FIA constructor strings to canonical constructor_ids
FIA_TEAM_TO_CONSTRUCTOR_ID: Dict[str, str] = {
    "scuderia ferrari": "ferrari",
    "mercedes-amg petronas f1 team": "mercedes",
    "mercedes-amg petronas formula one team": "mercedes",
    "mclaren f1 team": "mclaren",
    "mclaren formula 1 team": "mclaren",
    "bwt alpine f1 team": "alpine",
    "alpine f1 team": "alpine",
    "oracle red bull racing": "red_bull",
    "red bull racing": "red_bull",
    "scuderia alphatauri": "alphatauri",
    "visa cash app rb f1 team": "rb",
    "alfa romeo f1 team orlen": "alfa",
    "alfa romeo f1 team stake": "alfa",
    "alfa romeo racing orlen": "alfa",
    "kick sauber f1 team": "sauber",
    "stake f1 team kick sauber": "sauber",
    "aston martin aramco cognizant f1 team": "aston_martin",
    "aston martin aramco f1 team": "aston_martin",
    "aston martin cognizant f1 team": "aston_martin",
    "williams racing": "williams",
    "haas f1 team": "haas",
    "moneygram haas f1 team": "haas",
    "uralkali haas f1 team": "haas",
}


def normalize_constructor_id(team_name: Optional[str]) -> Optional[str]:
    """Map raw team name to canonical constructor_id."""
    if not team_name:
        return None
    cleaned = team_name.strip().lower()
    return FIA_TEAM_TO_CONSTRUCTOR_ID.get(cleaned, cleaned)


def load_reconciliation_schema() -> Dict[str, Any]:
    """Load the JSON Schema for reconciliation reports."""
    if not SCHEMA_PATH.is_file():
        raise FileNotFoundError(f"Reconciliation schema not found: {SCHEMA_PATH}")
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def validate_reconciliation_report(report_data: Dict[str, Any]) -> None:
    """Validate a reconciliation report dictionary against reconciliation_schema.json."""
    schema = load_reconciliation_schema()
    jsonschema.validate(instance=report_data, schema=schema)


def reconcile_driver(
    fia_rec: Optional[Dict[str, Any]],
    hist_rec: Optional[Dict[str, Any]],
    driver_id: str,
) -> Dict[str, Any]:
    """Compare a single driver's starting grid records between FIA official source and historical data.

    Returns a structured dictionary matching reconciliation_schema.json driver_reconciliations items.
    """
    # Case 1: Driver present in FIA but missing from historical data
    if fia_rec is not None and hist_rec is None:
        car_num = fia_rec.get("car_number")
        driver_name = fia_rec.get("driver_name", driver_id)
        team_name = fia_rec.get("team_name", "Unknown")
        c_id = normalize_constructor_id(team_name) or "unknown"
        return {
            "driver_id": driver_id,
            "car_number": car_num,
            "driver_name": driver_name,
            "constructor_id": c_id,
            "outcome": ReconciliationOutcome.MISSING_HISTORICAL_RECORD.value,
            "fia_values": {
                "start_type": fia_rec.get("start_type"),
                "track_grid_box": fia_rec.get("track_grid_box"),
                "pit_lane_order": fia_rec.get("pit_lane_order"),
                "model_feature_grid_position": fia_rec.get("model_feature_grid_position"),
                "status": fia_rec.get("status"),
                "dispensation_doc": fia_rec.get("dispensation_doc"),
                "penalty_details": fia_rec.get("penalty_details"),
            },
            "historical_values": None,
            "explanation": f"Driver {driver_id} is present in official FIA Starting Grid but has no record in the historical dataset.",
        }

    # Case 2: Driver present in historical data but missing from FIA Starting Grid
    if fia_rec is None and hist_rec is not None:
        car_num = int(hist_rec.get("driver_number")) if pd.notnull(hist_rec.get("driver_number")) else None
        driver_name = str(hist_rec.get("driver_code", driver_id))
        c_id = str(hist_rec.get("constructor_id", "unknown"))
        return {
            "driver_id": driver_id,
            "car_number": car_num,
            "driver_name": driver_name,
            "constructor_id": c_id,
            "outcome": ReconciliationOutcome.MISSING_FIA_RECORD.value,
            "fia_values": None,
            "historical_values": {
                "grid_position": int(hist_rec["grid_position"]) if pd.notnull(hist_rec.get("grid_position")) else None,
                "quali_position": int(hist_rec["quali_position"]) if pd.notnull(hist_rec.get("quali_position")) else None,
                "grid_penalty_delta": int(hist_rec["grid_penalty_delta"]) if pd.notnull(hist_rec.get("grid_penalty_delta")) else None,
                "constructor_id": c_id,
            },
            "explanation": f"Driver {driver_id} is present in historical dataset but missing from official FIA Starting Grid document.",
        }

    # Case 3: Both present -> Perform comprehensive cross-comparison
    assert fia_rec is not None and hist_rec is not None

    car_num = fia_rec.get("car_number")
    driver_name = fia_rec.get("driver_name", driver_id)
    fia_team = fia_rec.get("team_name", "")
    fia_cid = normalize_constructor_id(fia_team)
    hist_cid = str(hist_rec.get("constructor_id", ""))

    fia_start_type = fia_rec.get("start_type")
    fia_track_box = fia_rec.get("track_grid_box")
    fia_model_pos = fia_rec.get("model_feature_grid_position")
    fia_status = fia_rec.get("status")

    hist_grid = int(hist_rec["grid_position"]) if pd.notnull(hist_rec.get("grid_position")) else None
    hist_quali = int(hist_rec["quali_position"]) if pd.notnull(hist_rec.get("quali_position")) else None
    hist_delta = int(hist_rec["grid_penalty_delta"]) if pd.notnull(hist_rec.get("grid_penalty_delta")) else None

    fia_vals = {
        "start_type": fia_start_type,
        "track_grid_box": fia_track_box,
        "pit_lane_order": fia_rec.get("pit_lane_order"),
        "model_feature_grid_position": fia_model_pos,
        "status": fia_status,
        "dispensation_doc": fia_rec.get("dispensation_doc"),
        "penalty_details": fia_rec.get("penalty_details"),
    }
    hist_vals = {
        "grid_position": hist_grid,
        "quali_position": hist_quali,
        "grid_penalty_delta": hist_delta,
        "constructor_id": hist_cid,
    }

    # 1. Sub-check: Withdrawal / DNS handling
    if fia_status == "WITHDRAWN" or fia_start_type == "WITHDRAWN":
        # Official document states driver was withdrawn before race start
        return {
            "driver_id": driver_id,
            "car_number": car_num,
            "driver_name": driver_name,
            "constructor_id": hist_cid or fia_cid or "unknown",
            "outcome": ReconciliationOutcome.WITHDRAWAL_OR_DNS_DIFFERENCE.value,
            "fia_values": fia_vals,
            "historical_values": hist_vals,
            "explanation": (
                f"Driver {driver_id} was officially withdrawn before race start per FIA document (status=WITHDRAWN). "
                f"Historical dataset recorded grid={hist_grid}, quali={hist_quali}."
            ),
        }

    # 2. Sub-check: Driver / Constructor identity mismatch
    # Allow equivalent mappings (e.g. sauber and alfa across rebrandings)
    equivalent_constructors = [
        {"sauber", "alfa"},
        {"alphatauri", "rb"},
        {"red_bull"},
        {"ferrari"},
        {"mercedes"},
        {"mclaren"},
        {"alpine"},
        {"aston_martin"},
        {"williams"},
        {"haas"},
    ]
    constructor_matches = (fia_cid == hist_cid) or any(
        fia_cid in eq and hist_cid in eq for eq in equivalent_constructors
    )
    if fia_cid and hist_cid and not constructor_matches:
        return {
            "driver_id": driver_id,
            "car_number": car_num,
            "driver_name": driver_name,
            "constructor_id": hist_cid,
            "outcome": ReconciliationOutcome.DRIVER_IDENTITY_MISMATCH.value,
            "fia_values": fia_vals,
            "historical_values": hist_vals,
            "explanation": f"Constructor mismatch: FIA document states '{fia_team}' ({fia_cid}), but historical dataset has '{hist_cid}'.",
        }

    # Sub-check: Pit Lane Starts
    if fia_start_type == "PIT_LANE":
        # In historical Paddock/Ergast pipeline, pit-lane starts are encoded as grid=20 (raw grid=0)
        if hist_grid in (20, 0):
            return {
                "driver_id": driver_id,
                "car_number": car_num,
                "driver_name": driver_name,
                "constructor_id": hist_cid or fia_cid or "unknown",
                "outcome": ReconciliationOutcome.PIT_LANE_ENCODING_MATCH.value,
                "fia_values": fia_vals,
                "historical_values": hist_vals,
                "explanation": (
                    f"Driver {driver_id} started from the pit lane per FIA document. "
                    f"Historical dataset correctly encodes pit lane start as grid={hist_grid}."
                ),
            }
        else:
            # Historical dataset failed to record pit lane start and assigned an arbitrary grid box
            return {
                "driver_id": driver_id,
                "car_number": car_num,
                "driver_name": driver_name,
                "constructor_id": hist_cid or fia_cid or "unknown",
                "outcome": ReconciliationOutcome.RACE_RESULT_GRID_DIFFERENCE.value,
                "fia_values": fia_vals,
                "historical_values": hist_vals,
                "explanation": (
                    f"Discrepancy: FIA document mandates PIT_LANE start (model pos 20), "
                    f"but historical dataset recorded grid={hist_grid}."
                ),
            }

    # Sub-check: Track Grid Starts
    if fia_start_type == "TRACK_GRID":
        # Compare physical grid box with historical race-result grid value
        if fia_track_box != hist_grid:
            return {
                "driver_id": driver_id,
                "car_number": car_num,
                "driver_name": driver_name,
                "constructor_id": hist_cid or fia_cid or "unknown",
                "outcome": ReconciliationOutcome.RACE_RESULT_GRID_DIFFERENCE.value,
                "fia_values": fia_vals,
                "historical_values": hist_vals,
                "explanation": (
                    f"Starting grid position mismatch: Official FIA track grid box is P{fia_track_box}, "
                    f"but historical race results recorded grid={hist_grid}."
                ),
            }

        # Physical grid matches historical grid -> Check qualifying position
        if hist_quali is not None and hist_quali != fia_track_box:
            return {
                "driver_id": driver_id,
                "car_number": car_num,
                "driver_name": driver_name,
                "constructor_id": hist_cid or fia_cid or "unknown",
                "outcome": ReconciliationOutcome.QUALIFYING_POSITION_DIFFERENCE.value,
                "fia_values": fia_vals,
                "historical_values": hist_vals,
                "explanation": (
                    f"Official starting grid box P{fia_track_box} matches historical race results, "
                    f"but differs from qualifying position P{hist_quali} due to steward penalties or grid adjustments (delta={hist_delta})."
                ),
            }

        # Check if model feature encoding differs from physical grid box
        if fia_model_pos is not None and fia_model_pos != fia_track_box:
            return {
                "driver_id": driver_id,
                "car_number": car_num,
                "driver_name": driver_name,
                "constructor_id": hist_cid or fia_cid or "unknown",
                "outcome": ReconciliationOutcome.MATCH_WITH_MODEL_ENCODING_DIFFERENCE.value,
                "fia_values": fia_vals,
                "historical_values": hist_vals,
                "explanation": (
                    f"Official track grid box P{fia_track_box} matches historical grid, "
                    f"but model feature representation is encoded as {fia_model_pos}."
                ),
            }

        # Exact clean match
        return {
            "driver_id": driver_id,
            "car_number": car_num,
            "driver_name": driver_name,
            "constructor_id": hist_cid or fia_cid or "unknown",
            "outcome": ReconciliationOutcome.MATCH.value,
            "fia_values": fia_vals,
            "historical_values": hist_vals,
            "explanation": f"Full match: Official track grid box P{fia_track_box} matches historical race-result grid P{hist_grid} and qualifying P{hist_quali}.",
        }

    # Fallback for ambiguous or unhandled states
    return {
        "driver_id": driver_id,
        "car_number": car_num,
        "driver_name": driver_name,
        "constructor_id": hist_cid or fia_cid or "unknown",
        "outcome": ReconciliationOutcome.AMBIGUOUS_REQUIRES_MANUAL_REVIEW.value,
        "fia_values": fia_vals,
        "historical_values": hist_vals,
        "explanation": f"Ambiguous record requiring manual review for driver {driver_id}.",
    }


def reconcile_starting_grid_event(
    fia_fixture_data: Dict[str, Any],
    historical_race_records: Union[pd.DataFrame, List[Dict[str, Any]]],
    race_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Reconcile an event's official FIA Starting Grid fixture against historical dataset records.

    Produces a complete, deterministic, schema-valid reconciliation report.
    """
    event_meta = fia_fixture_data.get("event_metadata", {})
    doc_meta = fia_fixture_data.get("document_metadata", {})
    fia_records = fia_fixture_data.get("grid_records", [])

    if race_id is None:
        race_id = event_meta.get("race_id", f"{event_meta.get('season')}_{event_meta.get('round')}")

    # Index historical records by driver_id
    if isinstance(historical_race_records, pd.DataFrame):
        hist_records_list = historical_race_records.to_dict(orient="records")
    else:
        hist_records_list = historical_race_records

    hist_by_driver: Dict[str, Dict[str, Any]] = {
        r["driver_id"]: r for r in hist_records_list if "driver_id" in r
    }
    fia_by_driver: Dict[str, Dict[str, Any]] = {
        r["driver_id"]: r for r in fia_records if "driver_id" in r
    }

    # All unique drivers across both datasets
    all_driver_ids = sorted(set(fia_by_driver.keys()) | set(hist_by_driver.keys()))

    driver_reconciliations: List[Dict[str, Any]] = []
    outcome_counts: Dict[str, int] = {e.value: 0 for e in ReconciliationOutcome}

    for d_id in all_driver_ids:
        fia_r = fia_by_driver.get(d_id)
        hist_r = hist_by_driver.get(d_id)
        rec_res = reconcile_driver(fia_r, hist_r, d_id)
        outcome = rec_res["outcome"]
        outcome_counts[outcome] += 1
        driver_reconciliations.append(rec_res)

    has_discrepancies = (
        outcome_counts[ReconciliationOutcome.RACE_RESULT_GRID_DIFFERENCE.value] > 0
        or outcome_counts[ReconciliationOutcome.DRIVER_IDENTITY_MISMATCH.value] > 0
        or outcome_counts[ReconciliationOutcome.MISSING_HISTORICAL_RECORD.value] > 0
        or outcome_counts[ReconciliationOutcome.MISSING_FIA_RECORD.value] > 0
        or outcome_counts[ReconciliationOutcome.WITHDRAWAL_OR_DNS_DIFFERENCE.value] > 0
        or outcome_counts[ReconciliationOutcome.AMBIGUOUS_REQUIRES_MANUAL_REVIEW.value] > 0
    )

    report = {
        "event_metadata": {
            "season": event_meta.get("season", 0),
            "round": event_meta.get("round", 0),
            "race_id": race_id,
            "race_name": event_meta.get("race_name", "Unknown"),
            "circuit_id": event_meta.get("circuit_id", "unknown"),
        },
        "document_metadata": {
            "official_doc_id": doc_meta.get("official_doc_id", "Unknown"),
            "pdf_sha256": doc_meta.get("pdf_sha256", "0" * 64),
            "page_count": 2,
            "grid_page": 2,
        },
        "reconciliation_summary": {
            "total_drivers_reconciled": len(driver_reconciliations),
            "outcome_counts": outcome_counts,
            "has_discrepancies": has_discrepancies,
        },
        "driver_reconciliations": driver_reconciliations,
    }

    validate_reconciliation_report(report)
    return report


def generate_all_benchmark_reports(
    dataset_path: Optional[Path] = None,
    output_dir: Optional[Path] = None,
) -> Dict[str, Any]:
    """Generate deterministic reconciliation reports for all 4 benchmark events and summary.json."""
    if dataset_path is None:
        dataset_path = DEFAULT_HISTORICAL_DATASET
    if output_dir is None:
        output_dir = REPORTS_DIR

    output_dir.mkdir(parents=True, exist_ok=True)
    df = pd.read_csv(dataset_path)

    fixtures_dir = Path(__file__).parent / "fixtures" / "expected"

    benchmarks = {
        "2022_italian_gp_doc_57": {
            "race_id": "2022_16_monza",
            "fixture_file": "2022_italian_gp_doc_57.json",
        },
        "2024_belgian_gp_doc_37": {
            "race_id": "2024_14_spa",
            "fixture_file": "2024_belgian_gp_doc_37.json",
        },
        "2023_singapore_gp_doc_40": {
            "race_id": "2023_15_marina_bay",
            "fixture_file": "2023_singapore_gp_doc_40.json",
        },
        "2024_saudi_arabian_gp_doc_39": {
            "race_id": "2024_2_jeddah",
            "fixture_file": "2024_saudi_arabian_gp_doc_39.json",
        },
    }

    event_summaries: Dict[str, Any] = {}
    overall_outcome_counts = {e.value: 0 for e in ReconciliationOutcome}
    unresolved_discrepancies: List[Dict[str, Any]] = []

    for key, info in benchmarks.items():
        race_id = info["race_id"]
        fixture_path = fixtures_dir / info["fixture_file"]
        with open(fixture_path, "r", encoding="utf-8") as f:
            fia_data = json.load(f)

        hist_sub = df[df["race_id"] == race_id]
        report = reconcile_starting_grid_event(fia_data, hist_sub, race_id=race_id)

        # Write event report
        out_file = output_dir / f"{key}.json"
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        # Accumulate totals
        counts = report["reconciliation_summary"]["outcome_counts"]
        for k, v in counts.items():
            overall_outcome_counts[k] += v

        # Collect discrepancies
        for d in report["driver_reconciliations"]:
            if d["outcome"] in [
                ReconciliationOutcome.RACE_RESULT_GRID_DIFFERENCE.value,
                ReconciliationOutcome.DRIVER_IDENTITY_MISMATCH.value,
                ReconciliationOutcome.MISSING_HISTORICAL_RECORD.value,
                ReconciliationOutcome.MISSING_FIA_RECORD.value,
                ReconciliationOutcome.WITHDRAWAL_OR_DNS_DIFFERENCE.value,
                ReconciliationOutcome.AMBIGUOUS_REQUIRES_MANUAL_REVIEW.value,
            ]:
                unresolved_discrepancies.append(
                    {
                        "fixture_key": key,
                        "race_id": race_id,
                        "driver_id": d["driver_id"],
                        "outcome": d["outcome"],
                        "explanation": d["explanation"],
                    }
                )

        event_summaries[key] = {
            "race_id": race_id,
            "race_name": report["event_metadata"]["race_name"],
            "official_doc_id": report["document_metadata"]["official_doc_id"],
            "pdf_sha256": report["document_metadata"]["pdf_sha256"],
            "total_drivers": report["reconciliation_summary"]["total_drivers_reconciled"],
            "has_discrepancies": report["reconciliation_summary"]["has_discrepancies"],
            "outcome_counts": counts,
        }

    summary = {
        "summary_schema_version": "1.0.0",
        "reconciler_version": RECONCILER_VERSION,
        "total_events_reconciled": len(benchmarks),
        "overall_outcome_counts": overall_outcome_counts,
        "events": event_summaries,
        "unresolved_discrepancies_count": len(unresolved_discrepancies),
        "unresolved_discrepancies": unresolved_discrepancies,
    }

    summary_file = output_dir / "summary.json"
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    return summary


if __name__ == "__main__":
    summary = generate_all_benchmark_reports()
    print("Generated all benchmark reconciliation reports:")
    print(f"Total events: {summary['total_events_reconciled']}")
    print(f"Overall outcome counts: {summary['overall_outcome_counts']}")
    print(f"Unresolved discrepancies: {summary['unresolved_discrepancies_count']}")
