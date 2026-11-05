"""
Historical Baseline Schema Definitions and Validation (Version 1.3.1).

This module defines the contract for historical baseline data (2025 and 2026)
used to seed the rolling state for live next-race inference.

Key Architectural Guarantees (Schema v1.3.1):
1. Raw Classifications Preserved: Non-numeric results ('R', 'D', 'DSQ', 'NC') are preserved
   in `raw_position` alongside normalized `model_finish_position`.
2. Multi-Session Revision History: Every session block (qualifying, starting_grid,
   sprint_shootout, sprint_race, grand_prix) explicitly tracks active revision number,
   publication timestamp, provenance, and an optional `revision_history` array recording
   superseded revisions, timestamps, and steward decision reasons without affecting active reads.
3. Model DNF Separation: Official participation status is decoupled from the model-derived
   DNF flag (`not status.lower().startswith('finish') and not status.startswith('+')`).
4. Hardened Semantic Integrity: Strictly asserts absence of duplicate drivers within a session,
   duplicate rounds within a season, and flags contradictory participation/points states.
5. Sprint Isolation: Dedicated `sprint_race` block. Sprint points are strictly segregated from
   Sunday `gp_points` to mirror training data semantics (feature_pipeline.py:320-343).
6. Authentic Regulation Era: 2026 is authentically labeled 'active_aero_sustainable_fuel_gen3'.
7. Legacy Training Denominators:
   - Constructor podium rate: `max(1, len(last_5_c) * 2)` (feature_pipeline.py:225).
     This legacy convention assumes 2 cars per constructor event, regardless of actual starters.
   - Constructor rolling 3 grid: Flattened arithmetic mean across all available driver grids in the
     last 3 constructor events (feature_pipeline.py:227-228).
   - Driver rolling windows: Count actual driver starts (`d_hist[-N:]`), bridging missed events.
"""

from typing import Dict, Any, List, Tuple, Optional
import re
from datetime import datetime

CURRENT_CONTRACT_VERSION = "1.3.1"

VALID_REGULATION_ERAS = [
    "v6_turbo_hybrid_gen1",
    "ground_effect_gen2",
    "active_aero_sustainable_fuel_gen3"
]

VALID_PARTICIPATION_STATUSES = [
    "started",
    "dns",
    "withdrawn",
    "dsq",
    "dnf",
    "classified_retirement"
]

VALID_SESSION_STATUSES = [
    "completed",
    "upcoming",
    "cancelled"
]


def derive_model_dnf(status_str: str) -> int:
    """
    Computes the exact model DNF flag matching training pipeline logic
    (feature_pipeline.py:212).
    Returns 1 if status is considered a DNF; 0 if considered a finish.
    """
    if not status_str:
        return 1
    s_clean = status_str.strip()
    if s_clean.lower().startswith("finish") or s_clean.startswith("+"):
        return 0
    return 1


def normalize_model_finish_position(raw_pos: Any, status_str: str) -> int:
    """
    Normalizes official finishing position to model format:
    - Numeric string/int <= 20 -> numeric integer (even if classified retirement)
    - Unclassified, non-numeric (R, D, DSQ, NC), or > 20 -> 99
    Matches feature_pipeline.py:324-325.
    """
    if raw_pos is None:
        return 99
    raw_str = str(raw_pos).strip()
    if raw_str.isdigit():
        val = int(raw_str)
        return val if val <= 20 else 99
    return 99


def _validate_iso8601_order(earlier_ts: str, later_ts: str) -> bool:
    """Checks if later_ts is chronologically >= earlier_ts."""
    try:
        t_early = datetime.fromisoformat(earlier_ts.replace("Z", "+00:00"))
        t_late = datetime.fromisoformat(later_ts.replace("Z", "+00:00"))
        return t_late >= t_early
    except Exception:
        # Fallback to string comparison if ISO format is standard
        return later_ts >= earlier_ts


def _validate_session_revision_block(
    session_name: str,
    session_obj: Dict[str, Any],
    r_path: str,
    entries_key: str,
    errors: List[str]
):
    """Validates revision and revision_history fields for any session block."""
    active_rev = session_obj.get("revision")
    if not isinstance(active_rev, int) or active_rev < 1:
        errors.append(f"{r_path}.sessions.{session_name}: 'revision' must be an integer >= 1, got {active_rev}")

    pub_ts = session_obj.get("publication_timestamp_utc")
    if not pub_ts or not isinstance(pub_ts, str):
        errors.append(f"{r_path}.sessions.{session_name}: missing or invalid 'publication_timestamp_utc'")

    prov = session_obj.get("provenance")
    if not prov or not isinstance(prov, str):
        errors.append(f"{r_path}.sessions.{session_name}: missing or invalid 'provenance'")

    # Validate optional revision_history
    if "revision_history" in session_obj:
        rev_history = session_obj["revision_history"]
        if not isinstance(rev_history, list):
            errors.append(f"{r_path}.sessions.{session_name}.revision_history must be a list")
        else:
            seen_revisions = set()
            for h_idx, rev_entry in enumerate(rev_history):
                h_path = f"{r_path}.sessions.{session_name}.revision_history[{h_idx}]"
                if not isinstance(rev_entry, dict):
                    errors.append(f"{h_path} must be an object")
                    continue

                h_rev = rev_entry.get("revision")
                if not isinstance(h_rev, int) or h_rev < 1:
                    errors.append(f"{h_path}: 'revision' must be an integer >= 1")
                elif active_rev is not None and h_rev >= active_rev:
                    errors.append(f"{h_path}: superseded revision ({h_rev}) must be strictly less than active revision ({active_rev})")

                if h_rev in seen_revisions:
                    errors.append(f"{h_path}: duplicate superseded revision number ({h_rev})")
                seen_revisions.add(h_rev)

                h_pub = rev_entry.get("publication_timestamp_utc")
                h_sup = rev_entry.get("superseded_at_utc")
                if not h_pub or not isinstance(h_pub, str):
                    errors.append(f"{h_path}: missing or invalid 'publication_timestamp_utc'")
                if not h_sup or not isinstance(h_sup, str):
                    errors.append(f"{h_path}: missing or invalid 'superseded_at_utc'")
                elif h_pub and not _validate_iso8601_order(h_pub, h_sup):
                    errors.append(f"{h_path}: 'superseded_at_utc' ({h_sup}) cannot precede 'publication_timestamp_utc' ({h_pub})")

                if not rev_entry.get("change_reason") or not isinstance(rev_entry.get("change_reason"), str):
                    errors.append(f"{h_path}: missing required 'change_reason'")

                if not rev_entry.get("provenance") or not isinstance(rev_entry.get("provenance"), str):
                    errors.append(f"{h_path}: missing required 'provenance'")

                if entries_key not in rev_entry or not isinstance(rev_entry[entries_key], list):
                    errors.append(f"{h_path}: missing required '{entries_key}' snapshot list")


def validate_baseline_schema(data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validates a historical baseline dictionary against Schema v1.3.1.
    Returns (is_valid, list_of_error_messages).
    """
    errors: List[str] = []

    if not isinstance(data, dict):
        return False, ["Root object must be a dictionary"]

    # Top-level required fields (Note: offline_replay_certified is NOT required)
    if data.get("contract_version") != CURRENT_CONTRACT_VERSION:
        errors.append(f"Invalid contract_version: expected '{CURRENT_CONTRACT_VERSION}', got '{data.get('contract_version')}'")

    gen_time = data.get("generated_at_utc")
    if not gen_time or not isinstance(gen_time, str):
        errors.append("Missing or invalid 'generated_at_utc'")

    seasons = data.get("seasons")
    if not isinstance(seasons, list) or len(seasons) == 0:
        errors.append("'seasons' must be a non-empty list")
        return False, errors

    for s_idx, season_obj in enumerate(seasons):
        s_path = f"seasons[{s_idx}]"
        if not isinstance(season_obj, dict):
            errors.append(f"{s_path} must be a dictionary")
            continue

        season_num = season_obj.get("season")
        if not isinstance(season_num, int) or season_num < 2021:
            errors.append(f"{s_path}.season must be an integer >= 2021")

        reg_era = season_obj.get("regulation_era")
        if reg_era not in VALID_REGULATION_ERAS:
            errors.append(f"{s_path}.regulation_era must be one of {VALID_REGULATION_ERAS}, got '{reg_era}'")
        elif season_num == 2026 and reg_era != "active_aero_sustainable_fuel_gen3":
            errors.append(f"{s_path}: Season 2026 regulation_era must be 'active_aero_sustainable_fuel_gen3', got '{reg_era}'")

        rounds = season_obj.get("rounds")
        if not isinstance(rounds, list):
            errors.append(f"{s_path}.rounds must be a list")
            continue

        # Check for duplicate round numbers and race IDs within season
        seen_rounds = set()
        seen_race_ids = set()

        for r_idx, r_obj in enumerate(rounds):
            r_path = f"{s_path}.rounds[{r_idx}]"
            required_round_keys = ["round", "race_id", "circuit_id", "circuit_name", "country", "race_date", "is_sprint_weekend", "sessions"]
            for rk in required_round_keys:
                if rk not in r_obj:
                    errors.append(f"{r_path} missing required key '{rk}'")

            round_val = r_obj.get("round")
            if round_val in seen_rounds:
                errors.append(f"{r_path}: duplicate round number ({round_val}) in season {season_num}")
            seen_rounds.add(round_val)

            race_id_val = r_obj.get("race_id")
            if race_id_val in seen_race_ids:
                errors.append(f"{r_path}: duplicate race_id ('{race_id_val}') in season {season_num}")
            seen_race_ids.add(race_id_val)

            sessions = r_obj.get("sessions", {})
            if not isinstance(sessions, dict):
                errors.append(f"{r_path}.sessions must be a dictionary")
                continue

            # -------------------------------------------------------------
            # Check qualifying
            # -------------------------------------------------------------
            q_sess = sessions.get("qualifying")
            if not isinstance(q_sess, dict):
                errors.append(f"{r_path}.sessions.qualifying is required")
            else:
                for qk in ["session_status", "pole_time_sec", "results"]:
                    if qk not in q_sess:
                        errors.append(f"{r_path}.sessions.qualifying missing key '{qk}'")

                _validate_session_revision_block("qualifying", q_sess, r_path, "results", errors)

                q_results = q_sess.get("results", [])
                q_drivers = set()
                for qres in q_results:
                    for qrk in ["driver_id", "constructor_id", "quali_position", "raw_position", "reached_q3"]:
                        if qrk not in qres:
                            errors.append(f"{r_path}.sessions.qualifying.results item missing key '{qrk}'")

                    d_id = qres.get("driver_id")
                    if d_id in q_drivers:
                        errors.append(f"{r_path}.sessions.qualifying duplicate driver_id ('{d_id}')")
                    q_drivers.add(d_id)

                    if qres.get("reached_q3") not in (0, 1):
                        errors.append(f"{r_path}.sessions.qualifying.results reached_q3 must be 0 or 1")

                    q_pos = qres.get("quali_position")
                    if not isinstance(q_pos, int) or not (1 <= q_pos <= 30):
                        errors.append(f"{r_path}.sessions.qualifying.results invalid quali_position: {q_pos}")

            # -------------------------------------------------------------
            # Check starting_grid
            # -------------------------------------------------------------
            grid_sess = sessions.get("starting_grid")
            if not isinstance(grid_sess, dict):
                errors.append(f"{r_path}.sessions.starting_grid is required")
            else:
                for gk in ["is_official", "entries"]:
                    if gk not in grid_sess:
                        errors.append(f"{r_path}.sessions.starting_grid missing key '{gk}'")

                _validate_session_revision_block("starting_grid", grid_sess, r_path, "entries", errors)

                grid_entries = grid_sess.get("entries", [])
                grid_drivers = set()
                for gent in grid_entries:
                    for gek in ["driver_id", "constructor_id", "raw_grid_position", "grid_position", "is_pit_lane_start", "grid_penalty_delta"]:
                        if gek not in gent:
                            errors.append(f"{r_path}.sessions.starting_grid.entries item missing key '{gek}'")

                    d_id = gent.get("driver_id")
                    if d_id in grid_drivers:
                        errors.append(f"{r_path}.sessions.starting_grid duplicate driver_id ('{d_id}')")
                    grid_drivers.add(d_id)

                    g_pos = gent.get("grid_position")
                    if not isinstance(g_pos, int) or not (1 <= g_pos <= 30):
                        errors.append(f"{r_path}.sessions.starting_grid.entries invalid grid_position: {g_pos}")

                    # Verify pit lane standardization
                    if gent.get("is_pit_lane_start") and g_pos != 20:
                        errors.append(f"{r_path}.sessions.starting_grid: pit-lane start for '{d_id}' must be standardized to grid_position=20, got {g_pos}")

            # -------------------------------------------------------------
            # Check sprint_race if sprint weekend
            # -------------------------------------------------------------
            if r_obj.get("is_sprint_weekend"):
                sprint_sess = sessions.get("sprint_race")
                if sprint_sess and isinstance(sprint_sess, dict):
                    _validate_session_revision_block("sprint_race", sprint_sess, r_path, "results", errors)

                    s_results = sprint_sess.get("results", [])
                    s_drivers = set()
                    for sres in s_results:
                        d_id = sres.get("driver_id")
                        if d_id in s_drivers:
                            errors.append(f"{r_path}.sessions.sprint_race duplicate driver_id ('{d_id}')")
                        s_drivers.add(d_id)

                        if "sprint_points" not in sres:
                            errors.append(f"{r_path}.sessions.sprint_race item missing 'sprint_points'")
                        elif not (0.0 <= float(sres["sprint_points"]) <= 8.0):
                            errors.append(f"{r_path}.sessions.sprint_race sprint_points must be between 0.0 and 8.0, got {sres['sprint_points']}")

            # -------------------------------------------------------------
            # Check grand_prix
            # -------------------------------------------------------------
            gp_sess = sessions.get("grand_prix")
            if not isinstance(gp_sess, dict):
                errors.append(f"{r_path}.sessions.grand_prix is required")
            else:
                for gpk in ["session_status", "results"]:
                    if gpk not in gp_sess:
                        errors.append(f"{r_path}.sessions.grand_prix missing key '{gpk}'")

                _validate_session_revision_block("grand_prix", gp_sess, r_path, "results", errors)

                gp_results = gp_sess.get("results", [])
                gp_drivers = set()
                for gres in gp_results:
                    for grk in ["driver_id", "constructor_id", "raw_position", "model_finish_position", "gp_points", "raw_status", "official_participation_status", "model_dnf", "is_classified"]:
                        if grk not in gres:
                            errors.append(f"{r_path}.sessions.grand_prix.results item missing key '{grk}'")

                    d_id = gres.get("driver_id")
                    if d_id in gp_drivers:
                        errors.append(f"{r_path}.sessions.grand_prix duplicate driver_id ('{d_id}')")
                    gp_drivers.add(d_id)

                    part_status = gres.get("official_participation_status")
                    if part_status not in VALID_PARTICIPATION_STATUSES:
                        errors.append(f"{r_path} invalid participation status '{part_status}'")

                    m_dnf = gres.get("model_dnf")
                    if m_dnf not in (0, 1):
                        errors.append(f"{r_path} model_dnf must be 0 or 1")

                    gp_pts = gres.get("gp_points")
                    if gp_pts is not None and not (0.0 <= float(gp_pts) <= 26.0):
                        errors.append(f"{r_path} gp_points must be between 0.0 and 26.0, got {gp_pts}")

                    m_pos = gres.get("model_finish_position")
                    is_class = gres.get("is_classified")

                    # Hardened Semantic Contradiction Checks:
                    if part_status in ("dns", "withdrawn"):
                        if gp_pts != 0.0:
                            errors.append(f"{r_path}.sessions.grand_prix: driver '{d_id}' with status '{part_status}' cannot have gp_points > 0 (got {gp_pts})")
                        if m_pos != 99:
                            errors.append(f"{r_path}.sessions.grand_prix: driver '{d_id}' with status '{part_status}' must have model_finish_position=99 (got {m_pos})")
                        if is_class is not False:
                            errors.append(f"{r_path}.sessions.grand_prix: driver '{d_id}' with status '{part_status}' must have is_classified=False")
                        if m_dnf != 1:
                            errors.append(f"{r_path}.sessions.grand_prix: driver '{d_id}' with status '{part_status}' must have model_dnf=1")

                    elif part_status == "dsq":
                        if gp_pts != 0.0:
                            errors.append(f"{r_path}.sessions.grand_prix: driver '{d_id}' with status 'dsq' cannot have gp_points > 0 (got {gp_pts})")
                        if m_pos != 99:
                            errors.append(f"{r_path}.sessions.grand_prix: driver '{d_id}' with status 'dsq' must have model_finish_position=99 (got {m_pos})")
                        if is_class is not False:
                            errors.append(f"{r_path}.sessions.grand_prix: driver '{d_id}' with status 'dsq' must have is_classified=False")
                        if m_dnf != 1:
                            errors.append(f"{r_path}.sessions.grand_prix: driver '{d_id}' with status 'dsq' must have model_dnf=1")

                    elif part_status == "classified_retirement":
                        if is_class is not True:
                            errors.append(f"{r_path}.sessions.grand_prix: driver '{d_id}' classified_retirement must have is_classified=True")
                        if m_dnf != 1:
                            errors.append(f"{r_path}.sessions.grand_prix: driver '{d_id}' classified_retirement must have model_dnf=1")
                        if not isinstance(m_pos, int) or not (1 <= m_pos <= 20):
                            errors.append(f"{r_path}.sessions.grand_prix: driver '{d_id}' classified_retirement must have 1 <= model_finish_position <= 20 (got {m_pos})")

                    elif part_status == "dnf":
                        if is_class is not False:
                            errors.append(f"{r_path}.sessions.grand_prix: driver '{d_id}' unclassified dnf must have is_classified=False")
                        if m_dnf != 1:
                            errors.append(f"{r_path}.sessions.grand_prix: driver '{d_id}' unclassified dnf must have model_dnf=1")
                        if m_pos != 99:
                            errors.append(f"{r_path}.sessions.grand_prix: driver '{d_id}' unclassified dnf must have model_finish_position=99 (got {m_pos})")
                        if gp_pts != 0.0:
                            errors.append(f"{r_path}.sessions.grand_prix: driver '{d_id}' unclassified dnf cannot have gp_points > 0 (got {gp_pts})")

                    elif part_status == "started" and is_class is True:
                        if not isinstance(m_pos, int) or not (1 <= m_pos <= 20):
                            errors.append(f"{r_path}.sessions.grand_prix: classified finisher '{d_id}' must have 1 <= model_finish_position <= 20 (got {m_pos})")

    return len(errors) == 0, errors
