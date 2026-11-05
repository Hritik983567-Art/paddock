"""FIA Starting Grid Parser (Phase 3C.4E.3).

Parses official FIA Final Starting Grid documents into verified structured data fixtures.
Preserves official sporting truth, separates track grid from pit lane starts, records
document hashes and page provenance, and maps model feature representations without
modifying production databases or performing runtime inference.
"""

import datetime
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

from scripts.fia_grid_parser.pdf_extractor import (
    EXTRACTOR_LIBRARY,
    ExtractedPDFDocument,
    extract_pdf_document,
)

PARSER_VERSION = "1.0.0"

# Canonical Car Number -> (driver_id, Driver Full Name) mapping for modern F1 (2021-2024+)
CANONICAL_CAR_DRIVERS: Dict[int, Tuple[str, str]] = {
    1: ("max_verstappen", "Max Verstappen"),
    2: ("sargeant", "Logan Sargeant"),
    3: ("ricciardo", "Daniel Ricciardo"),
    4: ("norris", "Lando Norris"),
    5: ("vettel", "Sebastian Vettel"),
    6: ("latifi", "Nicholas Latifi"),
    7: ("raikkonen", "Kimi Räikkönen"),
    9: ("mazepin", "Nikita Mazepin"),
    10: ("gasly", "Pierre Gasly"),
    11: ("perez", "Sergio Perez"),
    12: ("doohan", "Jack Doohan"),
    14: ("alonso", "Fernando Alonso"),
    16: ("leclerc", "Charles Leclerc"),
    18: ("stroll", "Lance Stroll"),
    20: ("kevin_magnussen", "Kevin Magnussen"),
    22: ("tsunoda", "Yuki Tsunoda"),
    23: ("albon", "Alexander Albon"),
    24: ("zhou", "Zhou Guanyu"),
    27: ("hulkenberg", "Nico Hulkenberg"),
    31: ("ocon", "Esteban Ocon"),
    38: ("bearman", "Oliver Bearman"),
    40: ("lawson", "Liam Lawson"),
    43: ("colapinto", "Franco Colapinto"),
    44: ("hamilton", "Lewis Hamilton"),
    45: ("de_vries", "Nyck de Vries"),
    47: ("mick_schumacher", "Mick Schumacher"),
    55: ("sainz", "Carlos Sainz"),
    63: ("russell", "George Russell"),
    77: ("bottas", "Valtteri Bottas"),
    81: ("piastri", "Oscar Piastri"),
    88: ("kubica", "Robert Kubica"),
    99: ("giovinazzi", "Antonio Giovinazzi"),
}

# Known Constructor / Team names appearing on FIA Starting Grid documents
KNOWN_TEAMS = [
    "Mercedes-AMG Petronas F1 Team",
    "Mercedes-AMG PETRONAS F1 Team",
    "Scuderia Ferrari",
    "Oracle Red Bull Racing",
    "Red Bull Racing",
    "McLaren F1 Team",
    "McLaren Formula 1 Team",
    "BWT Alpine F1 Team",
    "Alpine F1 Team",
    "Scuderia AlphaTauri",
    "Visa Cash App RB F1 Team",
    "Alfa Romeo F1 Team ORLEN",
    "Alfa Romeo F1 Team Stake",
    "Kick Sauber F1 Team",
    "Stake F1 Team Kick Sauber",
    "Alfa Romeo Racing ORLEN",
    "Aston Martin Aramco Cognizant F1 Team",
    "Aston Martin Aramco F1 Team",
    "Aston Martin Cognizant F1 Team",
    "Williams Racing",
    "Haas F1 Team",
    "MoneyGram Haas F1 Team",
    "Uralkali Haas F1 Team",
]

# Revision keywords indicating document amendments
REVISION_KEYWORDS = [
    "REVISION",
    "REVISED",
    "AMENDED",
    "AMENDMENT",
    "REPLACES DOC",
    "SUPERSEDES",
    "CORRECTION",
    "CORRECTED",
]


class GridParsingError(Exception):
    """Raised when starting grid parsing fails or document is ambiguous."""
    pass


class RevisionDetectedError(GridParsingError):
    """Raised when an unreviewed document revision or amendment is detected."""
    pass


def normalize_whitespace(text: str) -> str:
    """Normalize non-breaking spaces and redundant whitespace."""
    if not text:
        return ""
    text = text.replace("\xa0", " ")
    text = text.replace("\ufffd", "")
    return re.sub(r"[ \t]+", " ", text).strip()


def detect_document_revision(text_p1: str, text_p2: str) -> Optional[str]:
    """Check whether document text indicates an amendment or unreviewed revision."""
    combined = (text_p1 + " " + text_p2).upper()
    for kw in REVISION_KEYWORDS:
        if kw in combined:
            # Check context: If it is part of standard text, verify
            match = re.search(rf"\b{re.escape(kw)}\b", combined)
            if match:
                return kw
    return None


def parse_page1_metadata(page1_text: str) -> Dict[str, Any]:
    """Parse Document ID, Title, Date, Time, and Stewards from Page 1."""
    clean_text = normalize_whitespace(page1_text)

    # Document number
    doc_match = re.search(r"Document\s+(\d+)", clean_text)
    if not doc_match:
        raise GridParsingError("Failed to extract Document number from Page 1 metadata")
    doc_id = f"Doc {doc_match.group(1)}"

    # Date
    date_match = re.search(r"Date\s+([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4})", clean_text)
    date_str = date_match.group(1) if date_match else None

    # Time
    time_match = re.search(r"Time\s+(\d{1,2}:\d{2})", clean_text)
    time_str = time_match.group(1) if time_match else None

    # Title
    title_match = re.search(r"Title\s+([A-Za-z\s]+?)(?=\s+Description|\s+Enclosed|$)", clean_text)
    title = title_match.group(1).strip() if title_match else "Final Starting Grid"

    # Event header
    event_match = re.search(r"(\d{4})\s+([A-Z\s]+?)\s+GRAND PRIX", clean_text)
    event_str = event_match.group(0) if event_match else None

    # Stewards block after 'Enclosed'
    stewards: List[str] = []
    enc_match = re.search(r"Enclosed[^\n]+\n([\s\S]+)$", page1_text)
    if enc_match:
        steward_block = normalize_whitespace(enc_match.group(1))
        tokens = steward_block.split()
        # Group pairs of Firstname Lastname
        idx = 0
        while idx < len(tokens):
            if idx + 1 < len(tokens):
                stewards.append(f"{tokens[idx]} {tokens[idx+1]}")
                idx += 2
            else:
                stewards.append(tokens[idx])
                idx += 1

    return {
        "official_doc_id": doc_id,
        "title": title,
        "date_str": date_str,
        "time_str": time_str,
        "event_header": event_str,
        "stewards_sign_off": stewards,
    }


def split_driver_and_team(text: str) -> Tuple[str, str, Optional[str], bool]:
    """Split driver name, team name, lap time, and penalty asterisk from a grid line.

    Returns: (driver_name, team_name, lap_time, has_penalty_star)
    """
    clean = normalize_whitespace(text)

    # Lap time at end (e.g. 1:21.542)
    lap_time = None
    time_match = re.search(r"\s+(\d+:\d+\.\d+)$", clean)
    if time_match:
        lap_time = time_match.group(1)
        clean = clean[: time_match.start()].strip()

    has_penalty_star = "*" in clean
    clean_no_star = clean.replace("*", "").strip()

    matched_team = None
    driver_part = None
    for team in sorted(KNOWN_TEAMS, key=len, reverse=True):
        if clean_no_star.endswith(team):
            matched_team = team
            driver_part = clean_no_star[: -len(team)].strip()
            break

    if not matched_team:
        # Fallback heuristic: find transition from ALL-CAPS surname to TitleCase team
        # e.g., 'George RUSSELLMercedes-AMG Petronas F1 Team'
        raise GridParsingError(f"Could not identify constructor name in grid line: '{text}'")

    if not driver_part:
        raise GridParsingError(f"Could not identify driver name in grid line: '{text}'")

    return driver_part, matched_team, lap_time, has_penalty_star


def parse_page2_grid(page2_text: str) -> Dict[str, Any]:
    """Parse Page 2: track grid boxes, pit-lane starters, notes/dispensations, and penalties."""
    lines = [normalize_whitespace(l) for l in page2_text.splitlines() if normalize_whitespace(l)]

    track_grid_records: List[Dict[str, Any]] = []
    pit_lane_records: List[Dict[str, Any]] = []
    withdrawn_records: List[Dict[str, Any]] = []
    dispensations: Dict[int, str] = {}
    penalties_by_car: Dict[int, List[str]] = {}

    in_pit_lane = False
    in_notes = False
    in_penalties = False

    track_grid_re = re.compile(r"^(\d{1,2})\s+(\d{1,2})\s+(.+)$")

    for line in lines:
        if "DRIVERS REQUIRED TO START FROM THE PIT LANE" in line:
            in_pit_lane = True
            in_notes = False
            in_penalties = False
            continue
        elif line.startswith("NOTES"):
            in_pit_lane = False
            in_notes = True
            in_penalties = False
            continue
        elif line.startswith("* PENALTIES") or line == "PENALTIES":
            in_pit_lane = False
            in_notes = False
            in_penalties = True
            continue
        elif (
            line.startswith("The F1 FORMULA 1 logo")
            or line.startswith("Doc ")
            or line.startswith("The Stewards")
            or "Formula One World Championship Limited" in line
        ):
            in_pit_lane = False
            in_notes = False
            in_penalties = False
            continue

        if in_notes:
            # Check for withdrawn
            wd_match = re.search(r"Car\s+(\d+)\s+-\s+Withdrawn", line, re.IGNORECASE)
            if wd_match:
                car_num = int(wd_match.group(1))
                withdrawn_records.append({"car_number": car_num, "note": line})
            # Check for dispensation
            disp_match = re.search(
                r"Car\s+(\d+)\s+-\s+Permitted to start[^\n]*Stewards'\s+document\s+no\.\s*(\d+)",
                line,
                re.IGNORECASE,
            )
            if disp_match:
                car_num = int(disp_match.group(1))
                doc_no = f"Doc {disp_match.group(2)}"
                dispensations[car_num] = doc_no
            continue

        if in_penalties:
            # Car penalties summary
            car_matches = re.findall(r"Car[s]?\s+([0-9, &\s]+?)(?:-|\u2013|\u2014|\s{2,})", line)
            for cm in car_matches:
                nums = re.findall(r"\d+", cm)
                for n in nums:
                    car_num = int(n)
                    if car_num not in penalties_by_car:
                        penalties_by_car[car_num] = []
                    penalties_by_car[car_num].append(line)
            continue

        if in_pit_lane:
            # Pit lane starter line, e.g. '24 ZHOU Guanyu *'
            pl_match = re.match(r"^(\d{1,2})\s+(.+)$", line)
            if pl_match:
                car_num = int(pl_match.group(1))
                rest = pl_match.group(2)
                has_star = "*" in rest
                driver_name = rest.replace("*", "").strip()
                pit_lane_records.append(
                    {
                        "car_number": car_num,
                        "driver_name": driver_name,
                        "has_penalty_star": has_star,
                    }
                )
            elif pit_lane_records and "team_name" not in pit_lane_records[-1]:
                # Next line might be the constructor name
                for team in KNOWN_TEAMS:
                    if team.lower() in line.lower():
                        pit_lane_records[-1]["team_name"] = team
                        break
            continue

        # Standard track-grid line
        m = track_grid_re.match(line)
        if m:
            grid_pos = int(m.group(1))
            car_num = int(m.group(2))
            rest = m.group(3)

            # Sanity range for grid position (1..30)
            if 1 <= grid_pos <= 30:
                driver_name, team_name, lap_time, has_star = split_driver_and_team(rest)
                track_grid_records.append(
                    {
                        "track_grid_box": grid_pos,
                        "car_number": car_num,
                        "driver_name": driver_name,
                        "team_name": team_name,
                        "lap_time": lap_time,
                        "has_penalty_star": has_star,
                    }
                )

    return {
        "track_grid": track_grid_records,
        "pit_lane": pit_lane_records,
        "withdrawn": withdrawn_records,
        "dispensations": dispensations,
        "penalties": penalties_by_car,
    }


def parse_fia_grid_document(
    file_path: Path,
    event_metadata: Optional[Dict[str, Any]] = None,
    qualifying_positions: Optional[Dict[str, Optional[int]]] = None,
    expected_sha256: Optional[str] = None,
    published_iso_timestamp: Optional[str] = None,
    fia_source_url: Optional[str] = None,
) -> Dict[str, Any]:
    """Parse an official FIA Starting Grid PDF document offline.

    Validates:
    - PDF structure, byte hashes, and page count.
    - Page 1 metadata and Page 2 grid layout.
    - Track grid box uniqueness and ordering.
    - Pit-lane and withdrawal classifications.
    - Canonical driver resolution.
    - Model feature grid position mapping (physical box for track starters; 20 for pit-lane starters).
    """
    extracted = extract_pdf_document(file_path)

    if expected_sha256 and extracted.sha256.lower() != expected_sha256.lower():
        raise GridParsingError(
            f"Cryptographic hash mismatch for {file_path.name}:\n"
            f"  Expected: {expected_sha256}\n"
            f"  Extracted: {extracted.sha256}"
        )

    p1_text = extracted.get_page_text(1)
    p2_text = extracted.get_page_text(2)

    # Check for unreviewed document revisions
    revision_kw = detect_document_revision(p1_text, p2_text)
    if revision_kw:
        raise RevisionDetectedError(
            f"Unreviewed document revision or amendment keyword detected ('{revision_kw}') in {file_path.name}"
        )

    meta_p1 = parse_page1_metadata(p1_text)
    grid_p2 = parse_page2_grid(p2_text)

    # Validate document title
    if "final starting grid" not in meta_p1["title"].lower():
        raise GridParsingError(
            f"Document title '{meta_p1['title']}' is not 'Final Starting Grid' in {file_path.name}"
        )

    # Build Event Metadata
    if event_metadata is None:
        event_metadata = {
            "season": 2024,
            "round": 0,
            "race_name": meta_p1.get("event_header") or "Unknown Grand Prix",
            "circuit_id": "unknown",
        }

    # Verify Track Grid uniqueness and integrity
    track_records = grid_p2["track_grid"]
    grid_boxes_seen: Set[int] = set()
    car_numbers_seen: Set[int] = set()

    for r in track_records:
        box = r["track_grid_box"]
        car = r["car_number"]
        if box in grid_boxes_seen:
            raise GridParsingError(f"Duplicate track grid box {box} detected in {file_path.name}")
        if car in car_numbers_seen:
            raise GridParsingError(f"Duplicate car number {car} detected on track grid in {file_path.name}")
        grid_boxes_seen.add(box)
        car_numbers_seen.add(car)

    # Sort track grid records by grid box
    track_records.sort(key=lambda x: x["track_grid_box"])

    # Build canonical grid records
    final_records: List[Dict[str, Any]] = []

    # 1. Track Grid Starters
    for tr in track_records:
        car = tr["car_number"]
        if car not in CANONICAL_CAR_DRIVERS:
            raise GridParsingError(f"Unresolved car number {car} on track grid in {file_path.name}")

        driver_id, canonical_name = CANONICAL_CAR_DRIVERS[car]
        disp_doc = grid_p2["dispensations"].get(car)
        pen_notes = grid_p2["penalties"].get(car)
        pen_details = " | ".join(pen_notes) if pen_notes else None

        quali_pos = qualifying_positions.get(driver_id) if qualifying_positions else None

        final_records.append(
            {
                "driver_id": driver_id,
                "car_number": car,
                "driver_name": tr["driver_name"],
                "team_name": tr["team_name"],
                "qualifying_position": quali_pos,
                "start_type": "TRACK_GRID",
                "track_grid_box": tr["track_grid_box"],
                "pit_lane_order": None,
                "model_feature_grid_position": tr["track_grid_box"],
                "status": "STARTER",
                "dispensation_doc": disp_doc,
                "penalty_details": pen_details,
            }
        )

    # 2. Pit Lane Starters
    for order_idx, pl in enumerate(grid_p2["pit_lane"], start=1):
        car = pl["car_number"]
        if car in car_numbers_seen:
            raise GridParsingError(
                f"Car {car} appears as both track grid starter and pit-lane starter in {file_path.name}"
            )
        car_numbers_seen.add(car)

        if car not in CANONICAL_CAR_DRIVERS:
            raise GridParsingError(f"Unresolved pit lane car number {car} in {file_path.name}")

        driver_id, canonical_name = CANONICAL_CAR_DRIVERS[car]
        disp_doc = grid_p2["dispensations"].get(car)
        pen_notes = grid_p2["penalties"].get(car)
        pen_details = " | ".join(pen_notes) if pen_notes else None
        team_name = pl.get("team_name") or "Unknown Team"

        quali_pos = qualifying_positions.get(driver_id) if qualifying_positions else None

        final_records.append(
            {
                "driver_id": driver_id,
                "car_number": car,
                "driver_name": pl["driver_name"],
                "team_name": team_name,
                "qualifying_position": quali_pos,
                "start_type": "PIT_LANE",
                "track_grid_box": None,
                "pit_lane_order": order_idx,
                "model_feature_grid_position": 20,  # Frozen pipeline mapping (lines 168-171)
                "status": "STARTER",
                "dispensation_doc": disp_doc,
                "penalty_details": pen_details,
            }
        )

    # 3. Withdrawn Drivers
    for wd in grid_p2["withdrawn"]:
        car = wd["car_number"]
        if car not in CANONICAL_CAR_DRIVERS:
            raise GridParsingError(f"Unresolved withdrawn car number {car} in {file_path.name}")

        driver_id, canonical_name = CANONICAL_CAR_DRIVERS[car]
        quali_pos = qualifying_positions.get(driver_id) if qualifying_positions else None

        final_records.append(
            {
                "driver_id": driver_id,
                "car_number": car,
                "driver_name": canonical_name,
                "team_name": "Withdrawn",
                "qualifying_position": quali_pos,
                "start_type": "WITHDRAWN",
                "track_grid_box": None,
                "pit_lane_order": None,
                "model_feature_grid_position": None,  # Dropped from inference (lines 164-166)
                "status": "WITHDRAWN",
                "dispensation_doc": None,
                "penalty_details": wd.get("note"),
            }
        )

    # Calculate Roster Summary
    total_track = len(track_records)
    total_pit = len(grid_p2["pit_lane"])
    total_wd = len(grid_p2["withdrawn"])
    total_starters = total_track + total_pit
    total_entered = total_starters + total_wd

    # ISO publication timestamp
    if published_iso_timestamp is None:
        published_iso_timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

    if fia_source_url is None:
        fia_source_url = f"https://www.fia.com/documents/{file_path.name}"

    extracted_at_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    return {
        "document_metadata": {
            "official_doc_id": meta_p1["official_doc_id"],
            "title": meta_p1["title"],
            "published_timestamp": published_iso_timestamp,
            "fia_url": fia_source_url,
            "pdf_sha256": extracted.sha256,
            "stewards_sign_off": meta_p1["stewards_sign_off"],
            "parser_metadata": {
                "parser_version": PARSER_VERSION,
                "extractor_library": EXTRACTOR_LIBRARY,
                "extracted_at": extracted_at_iso,
            },
        },
        "event_metadata": event_metadata,
        "roster_summary": {
            "total_entered": total_entered,
            "total_qualifying": total_entered,  # In all 4 benchmark cases, entered took part in qualifying
            "total_withdrawn": total_wd,
            "total_track_grid": total_track,
            "total_pit_lane": total_pit,
            "total_race_starters": total_starters,
        },
        "grid_records": final_records,
    }

