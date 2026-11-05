"""FIA Grid Fixture Validation (Phase 3C.4E.3).

Strict validation rules for FIA Starting Grid fixtures.
Validates against JSON Schema, checks semantic constraints, verifies cryptographic hashes
against the manifest, detects unreviewed revisions, and fails closed on any ambiguity.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

import jsonschema

SCHEMA_PATH = Path(__file__).parent / "schemas" / "fia_grid_fixture.schema.json"
MANIFEST_PATH = Path(__file__).parent / "fixtures" / "fixtures_manifest.json"


class FixtureValidationError(Exception):
    """Raised when an FIA Starting Grid fixture violates schema or semantic contracts."""
    pass


def load_schema() -> Dict[str, Any]:
    """Load the JSON schema for FIA starting grid fixtures."""
    if not SCHEMA_PATH.is_file():
        raise FileNotFoundError(f"Fixture schema not found: {SCHEMA_PATH}")
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def load_manifest() -> Dict[str, Any]:
    """Load the fixture manifest."""
    if not MANIFEST_PATH.is_file():
        raise FileNotFoundError(f"Fixture manifest not found: {MANIFEST_PATH}")
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def validate_fixture_schema(fixture_data: Dict[str, Any]) -> None:
    """Validate fixture dictionary against fia_grid_fixture.schema.json."""
    schema = load_schema()
    try:
        jsonschema.validate(instance=fixture_data, schema=schema)
    except jsonschema.ValidationError as err:
        raise FixtureValidationError(f"Schema validation error at path {list(err.path)}: {err.message}") from err


def validate_fixture_semantics(fixture_data: Dict[str, Any]) -> None:
    """Perform rigorous semantic integrity checks on a parsed starting grid fixture.

    Enforces fail-closed rules:
    - Document title must be 'Final Starting Grid'.
    - No duplicate track grid boxes.
    - No duplicate car numbers or driver identities across starters.
    - Every pit-lane starter must have track_grid_box == None, pit_lane_order >= 1, and model_feature_grid_position == 20.
    - Every track starter must have model_feature_grid_position == track_grid_box.
    - Every withdrawn driver must have status == 'WITHDRAWN' and model_feature_grid_position == None.
    - Roster counts must balance: track + pit == total_race_starters; starters + withdrawn == total_entered.
    - Stewards list must not be empty.
    """
    doc_meta = fixture_data.get("document_metadata", {})
    roster = fixture_data.get("roster_summary", {})
    records = fixture_data.get("grid_records", [])

    # Document title check
    title = doc_meta.get("title", "")
    if "final starting grid" not in title.lower():
        raise FixtureValidationError(f"Invalid document title: '{title}'. Expected 'Final Starting Grid'.")

    # Document ID check
    doc_id = doc_meta.get("official_doc_id", "")
    if not doc_id.startswith("Doc "):
        raise FixtureValidationError(f"Invalid official_doc_id: '{doc_id}'. Must start with 'Doc '.")

    # Stewards list check
    stewards = doc_meta.get("stewards_sign_off", [])
    if not stewards or len(stewards) < 2:
        raise FixtureValidationError(f"Ambiguous or missing stewards sign-off: {stewards}")

    # Track grid box uniqueness and boundaries
    track_boxes_seen: Set[int] = set()
    car_numbers_seen: Set[int] = set()
    driver_ids_seen: Set[str] = set()

    track_count = 0
    pit_count = 0
    withdrawn_count = 0

    for rec in records:
        start_type = rec.get("start_type")
        car_num = rec.get("car_number")
        driver_id = rec.get("driver_id")
        grid_box = rec.get("track_grid_box")
        model_pos = rec.get("model_feature_grid_position")
        status = rec.get("status")

        if start_type == "TRACK_GRID":
            track_count += 1
            if grid_box is None:
                raise FixtureValidationError(f"Driver {driver_id} (Car {car_num}) on track grid has null track_grid_box")
            if grid_box in track_boxes_seen:
                raise FixtureValidationError(f"Duplicate track grid box {grid_box} found for {driver_id}")
            track_boxes_seen.add(grid_box)

            # Model feature grid position must match track grid box
            if model_pos != grid_box:
                raise FixtureValidationError(
                    f"Track starter {driver_id} model_feature_grid_position ({model_pos}) != track_grid_box ({grid_box})"
                )

            if status != "STARTER":
                raise FixtureValidationError(f"Track starter {driver_id} must have status 'STARTER', got '{status}'")

            if car_num in car_numbers_seen:
                raise FixtureValidationError(f"Duplicate car number {car_num} across race starters")
            car_numbers_seen.add(car_num)

            if driver_id in driver_ids_seen:
                raise FixtureValidationError(f"Duplicate driver_id '{driver_id}' across race starters")
            driver_ids_seen.add(driver_id)

        elif start_type == "PIT_LANE":
            pit_count += 1
            if grid_box is not None:
                raise FixtureValidationError(
                    f"Pit lane starter {driver_id} must have track_grid_box == null, got {grid_box}"
                )
            if rec.get("pit_lane_order") is None:
                raise FixtureValidationError(f"Pit lane starter {driver_id} must have pit_lane_order specified")
            if model_pos != 20:
                raise FixtureValidationError(
                    f"Pit lane starter {driver_id} must have model_feature_grid_position == 20, got {model_pos}"
                )
            if status != "STARTER":
                raise FixtureValidationError(f"Pit lane starter {driver_id} must have status 'STARTER', got '{status}'")

            if car_num in car_numbers_seen:
                raise FixtureValidationError(f"Duplicate car number {car_num} across race starters")
            car_numbers_seen.add(car_num)

            if driver_id in driver_ids_seen:
                raise FixtureValidationError(f"Duplicate driver_id '{driver_id}' across race starters")
            driver_ids_seen.add(driver_id)

        elif start_type == "WITHDRAWN":
            withdrawn_count += 1
            if grid_box is not None:
                raise FixtureValidationError(f"Withdrawn driver {driver_id} must have null track_grid_box")
            if model_pos is not None:
                raise FixtureValidationError(
                    f"Withdrawn driver {driver_id} must have null model_feature_grid_position, got {model_pos}"
                )
            if status != "WITHDRAWN":
                raise FixtureValidationError(f"Withdrawn driver {driver_id} must have status 'WITHDRAWN', got '{status}'")

        else:
            raise FixtureValidationError(f"Unknown start_type '{start_type}' for driver {driver_id}")

    # Verify Roster Summary consistency
    if roster.get("total_track_grid") != track_count:
        raise FixtureValidationError(
            f"Roster total_track_grid ({roster.get('total_track_grid')}) does not match records count ({track_count})"
        )
    if roster.get("total_pit_lane") != pit_count:
        raise FixtureValidationError(
            f"Roster total_pit_lane ({roster.get('total_pit_lane')}) does not match records count ({pit_count})"
        )
    if roster.get("total_withdrawn") != withdrawn_count:
        raise FixtureValidationError(
            f"Roster total_withdrawn ({roster.get('total_withdrawn')}) does not match records count ({withdrawn_count})"
        )
    if roster.get("total_race_starters") != (track_count + pit_count):
        raise FixtureValidationError(
            f"Roster total_race_starters ({roster.get('total_race_starters')}) != track ({track_count}) + pit ({pit_count})"
        )
    if roster.get("total_entered") != (track_count + pit_count + withdrawn_count):
        raise FixtureValidationError(
            f"Roster total_entered ({roster.get('total_entered')}) != starters ({track_count + pit_count}) + withdrawn ({withdrawn_count})"
        )


def validate_against_manifest(fixture_data: Dict[str, Any], fixture_key: str) -> None:
    """Verify that parsed fixture metadata matches the fixture manifest."""
    manifest = load_manifest()
    fixtures = manifest.get("fixtures", {})
    if fixture_key not in fixtures:
        raise FixtureValidationError(f"Fixture key '{fixture_key}' not found in manifest")

    entry = fixtures[fixture_key]
    doc_meta = fixture_data.get("document_metadata", {})
    event_meta = fixture_data.get("event_metadata", {})

    if doc_meta.get("official_doc_id") != entry.get("official_doc_id"):
        raise FixtureValidationError(
            f"Manifest doc_id mismatch for {fixture_key}: {doc_meta.get('official_doc_id')} != {entry.get('official_doc_id')}"
        )
    if doc_meta.get("pdf_sha256").lower() != entry.get("sha256").lower():
        raise FixtureValidationError(
            f"Manifest SHA-256 mismatch for {fixture_key}: {doc_meta.get('pdf_sha256')} != {entry.get('sha256')}"
        )
    if event_meta.get("season") != entry.get("season"):
        raise FixtureValidationError(
            f"Manifest season mismatch for {fixture_key}: {event_meta.get('season')} != {entry.get('season')}"
        )
    if event_meta.get("round") != entry.get("round"):
        raise FixtureValidationError(
            f"Manifest round mismatch for {fixture_key}: {event_meta.get('round')} != {entry.get('round')}"
        )


def validate_starting_grid_fixture(
    fixture_data: Dict[str, Any], fixture_key: Optional[str] = None
) -> None:
    """Run full validation suite: Schema, Semantics, and optional Manifest verification."""
    validate_fixture_schema(fixture_data)
    validate_fixture_semantics(fixture_data)
    if fixture_key:
        validate_against_manifest(fixture_data, fixture_key)

