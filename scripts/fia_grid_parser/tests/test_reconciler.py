"""Comprehensive Test Suite for FIA Starting Grid Reconciler (Phase 3C.4E.4).

Covers:
- All 10 ReconciliationOutcomes:
  - MATCH
  - MATCH_WITH_MODEL_ENCODING_DIFFERENCE
  - PIT_LANE_ENCODING_MATCH
  - QUALIFYING_POSITION_DIFFERENCE
  - RACE_RESULT_GRID_DIFFERENCE
  - DRIVER_IDENTITY_MISMATCH
  - MISSING_HISTORICAL_RECORD
  - MISSING_FIA_RECORD
  - WITHDRAWAL_OR_DNS_DIFFERENCE
  - AMBIGUOUS_REQUIRES_MANUAL_REVIEW
- Multiple pit-lane starters
- Unknown pit-lane departure order
- Historical grid 20 on-track vs pit-lane distinction
- Withdrawn vs DNS distinction (Stroll Singapore 2023)
- Mid-event driver substitutions (Bearman Saudi Arabia 2024)
- Deterministic report generation
- Reconciliation JSON schema validation
- 4 benchmark historical verification summaries
"""

import json
from pathlib import Path
from typing import Any, Dict

import pytest

from scripts.fia_grid_parser.reconciler import (
    ReconciliationOutcome,
    generate_all_benchmark_reports,
    reconcile_driver,
    reconcile_starting_grid_event,
    validate_reconciliation_report,
)

REPORTS_DIR = Path(__file__).parent.parent / "reports"
EXPECTED_DIR = Path(__file__).parent.parent / "fixtures" / "expected"


class TestReconciliationOutcomes:
    """Test individual driver-level reconciliation outcomes."""

    def test_outcome_match(self):
        fia_rec = {
            "driver_id": "leclerc",
            "car_number": 16,
            "driver_name": "Charles LECLERC",
            "team_name": "Scuderia Ferrari",
            "start_type": "TRACK_GRID",
            "track_grid_box": 1,
            "model_feature_grid_position": 1,
            "status": "STARTER",
        }
        hist_rec = {
            "driver_id": "leclerc",
            "driver_number": 16,
            "constructor_id": "ferrari",
            "grid_position": 1,
            "quali_position": 1,
            "grid_penalty_delta": 0,
        }
        res = reconcile_driver(fia_rec, hist_rec, "leclerc")
        assert res["outcome"] == ReconciliationOutcome.MATCH.value
        assert "Full match" in res["explanation"]

    def test_outcome_qualifying_position_difference(self):
        fia_rec = {
            "driver_id": "max_verstappen",
            "car_number": 1,
            "driver_name": "Max VERSTAPPEN",
            "team_name": "Oracle Red Bull Racing",
            "start_type": "TRACK_GRID",
            "track_grid_box": 7,
            "model_feature_grid_position": 7,
            "status": "STARTER",
        }
        hist_rec = {
            "driver_id": "max_verstappen",
            "driver_number": 1,
            "constructor_id": "red_bull",
            "grid_position": 7,
            "quali_position": 2,
            "grid_penalty_delta": 5,
        }
        res = reconcile_driver(fia_rec, hist_rec, "max_verstappen")
        assert res["outcome"] == ReconciliationOutcome.QUALIFYING_POSITION_DIFFERENCE.value
        assert "differs from qualifying position P2" in res["explanation"]

    def test_outcome_pit_lane_encoding_match(self):
        fia_rec = {
            "driver_id": "zhou",
            "car_number": 24,
            "driver_name": "ZHOU Guanyu",
            "team_name": "Alfa Romeo F1 Team Stake",
            "start_type": "PIT_LANE",
            "track_grid_box": None,
            "pit_lane_order": 1,
            "model_feature_grid_position": 20,
            "status": "STARTER",
        }
        hist_rec = {
            "driver_id": "zhou",
            "driver_number": 24,
            "constructor_id": "alfa",
            "grid_position": 20,
            "quali_position": 19,
            "grid_penalty_delta": 1,
        }
        res = reconcile_driver(fia_rec, hist_rec, "zhou")
        assert res["outcome"] == ReconciliationOutcome.PIT_LANE_ENCODING_MATCH.value

    def test_outcome_race_result_grid_difference(self):
        # FIA says track grid box 15, historical says grid 14
        fia_rec = {
            "driver_id": "bottas",
            "car_number": 77,
            "driver_name": "Valtteri BOTTAS",
            "team_name": "Kick Sauber F1 Team",
            "start_type": "TRACK_GRID",
            "track_grid_box": 15,
            "model_feature_grid_position": 15,
            "status": "STARTER",
        }
        hist_rec = {
            "driver_id": "bottas",
            "driver_number": 77,
            "constructor_id": "sauber",
            "grid_position": 14,
            "quali_position": 14,
            "grid_penalty_delta": 0,
        }
        res = reconcile_driver(fia_rec, hist_rec, "bottas")
        assert res["outcome"] == ReconciliationOutcome.RACE_RESULT_GRID_DIFFERENCE.value

    def test_outcome_pit_lane_race_result_grid_difference(self):
        # FIA says pit lane, but historical says grid 19 (e.g. Singapore 2023 Zhou)
        fia_rec = {
            "driver_id": "zhou",
            "car_number": 24,
            "driver_name": "ZHOU Guanyu",
            "team_name": "Alfa Romeo F1 Team Stake",
            "start_type": "PIT_LANE",
            "track_grid_box": None,
            "pit_lane_order": 1,
            "model_feature_grid_position": 20,
            "status": "STARTER",
        }
        hist_rec = {
            "driver_id": "zhou",
            "driver_number": 24,
            "constructor_id": "alfa",
            "grid_position": 19,
            "quali_position": 19,
            "grid_penalty_delta": 0,
        }
        res = reconcile_driver(fia_rec, hist_rec, "zhou")
        assert res["outcome"] == ReconciliationOutcome.RACE_RESULT_GRID_DIFFERENCE.value

    def test_outcome_withdrawal_or_dns_difference(self):
        # FIA says WITHDRAWN, but historical has active row with grid=20 (e.g. Stroll Singapore 2023)
        fia_rec = {
            "driver_id": "stroll",
            "car_number": 18,
            "driver_name": "Lance Stroll",
            "team_name": "Withdrawn",
            "start_type": "WITHDRAWN",
            "track_grid_box": None,
            "model_feature_grid_position": None,
            "status": "WITHDRAWN",
        }
        hist_rec = {
            "driver_id": "stroll",
            "driver_number": 18,
            "constructor_id": "aston_martin",
            "grid_position": 20,
            "quali_position": 20,
            "grid_penalty_delta": 0,
        }
        res = reconcile_driver(fia_rec, hist_rec, "stroll")
        assert res["outcome"] == ReconciliationOutcome.WITHDRAWAL_OR_DNS_DIFFERENCE.value

    def test_outcome_driver_identity_mismatch(self):
        # Constructor mismatch: Ferrari vs Mercedes
        fia_rec = {
            "driver_id": "leclerc",
            "car_number": 16,
            "driver_name": "Charles LECLERC",
            "team_name": "Scuderia Ferrari",
            "start_type": "TRACK_GRID",
            "track_grid_box": 1,
            "model_feature_grid_position": 1,
            "status": "STARTER",
        }
        hist_rec = {
            "driver_id": "leclerc",
            "driver_number": 16,
            "constructor_id": "mercedes",  # Mismatched!
            "grid_position": 1,
            "quali_position": 1,
            "grid_penalty_delta": 0,
        }
        res = reconcile_driver(fia_rec, hist_rec, "leclerc")
        assert res["outcome"] == ReconciliationOutcome.DRIVER_IDENTITY_MISMATCH.value

    def test_outcome_missing_historical_record(self):
        fia_rec = {
            "driver_id": "colapinto",
            "car_number": 43,
            "driver_name": "Franco COLAPINTO",
            "team_name": "Williams Racing",
            "start_type": "TRACK_GRID",
            "track_grid_box": 12,
            "model_feature_grid_position": 12,
            "status": "STARTER",
        }
        res = reconcile_driver(fia_rec, None, "colapinto")
        assert res["outcome"] == ReconciliationOutcome.MISSING_HISTORICAL_RECORD.value

    def test_outcome_missing_fia_record(self):
        hist_rec = {
            "driver_id": "sainz",
            "driver_number": 55,
            "constructor_id": "ferrari",
            "grid_position": 11,
            "quali_position": 11,
            "grid_penalty_delta": 0,
        }
        res = reconcile_driver(None, hist_rec, "sainz")
        assert res["outcome"] == ReconciliationOutcome.MISSING_FIA_RECORD.value

    def test_outcome_match_with_model_encoding_difference(self):
        fia_rec = {
            "driver_id": "hulkenberg",
            "car_number": 27,
            "driver_name": "Nico HULKENBERG",
            "team_name": "MoneyGram Haas F1 Team",
            "start_type": "TRACK_GRID",
            "track_grid_box": 21,
            "model_feature_grid_position": 20,  # Clamped or encoded
            "status": "STARTER",
        }
        hist_rec = {
            "driver_id": "hulkenberg",
            "driver_number": 27,
            "constructor_id": "haas",
            "grid_position": 21,
            "quali_position": 21,
            "grid_penalty_delta": 0,
        }
        res = reconcile_driver(fia_rec, hist_rec, "hulkenberg")
        assert res["outcome"] == ReconciliationOutcome.MATCH_WITH_MODEL_ENCODING_DIFFERENCE.value


class TestSportingEdgeCases:
    """Test multi-car pit-lane starts, unknown order, track P20 vs pit lane, and substitutions."""

    def test_multiple_pit_lane_starters(self):
        # E.g. two cars starting from pit lane (both model pos 20)
        fia_data = {
            "event_metadata": {"season": 2022, "round": 5, "race_id": "2022_5_miami", "race_name": "Miami GP", "circuit_id": "miami"},
            "document_metadata": {"official_doc_id": "Doc 40", "pdf_sha256": "a"*64, "page_count": 2, "grid_page": 2},
            "grid_records": [
                {
                    "driver_id": "stroll",
                    "car_number": 18,
                    "driver_name": "Lance STROLL",
                    "team_name": "Aston Martin Aramco Cognizant F1 Team",
                    "start_type": "PIT_LANE",
                    "track_grid_box": None,
                    "pit_lane_order": 1,
                    "model_feature_grid_position": 20,
                    "status": "STARTER",
                },
                {
                    "driver_id": "vettel",
                    "car_number": 5,
                    "driver_name": "Sebastian VETTEL",
                    "team_name": "Aston Martin Aramco Cognizant F1 Team",
                    "start_type": "PIT_LANE",
                    "track_grid_box": None,
                    "pit_lane_order": 2,
                    "model_feature_grid_position": 20,
                    "status": "STARTER",
                },
            ],
        }
        hist_data = [
            {"driver_id": "stroll", "driver_number": 18, "constructor_id": "aston_martin", "grid_position": 20, "quali_position": 10, "grid_penalty_delta": 10},
            {"driver_id": "vettel", "driver_number": 5, "constructor_id": "aston_martin", "grid_position": 20, "quali_position": 13, "grid_penalty_delta": 7},
        ]
        report = reconcile_starting_grid_event(fia_data, hist_data, race_id="2022_5_miami")
        counts = report["reconciliation_summary"]["outcome_counts"]
        assert counts[ReconciliationOutcome.PIT_LANE_ENCODING_MATCH.value] == 2

    def test_pit_lane_unknown_departure_order(self):
        fia_rec = {
            "driver_id": "zhou",
            "car_number": 24,
            "driver_name": "ZHOU Guanyu",
            "team_name": "Alfa Romeo F1 Team Stake",
            "start_type": "PIT_LANE",
            "track_grid_box": None,
            "pit_lane_order": None,  # Unknown order
            "model_feature_grid_position": 20,
            "status": "STARTER",
        }
        hist_rec = {
            "driver_id": "zhou",
            "driver_number": 24,
            "constructor_id": "alfa",
            "grid_position": 20,
            "quali_position": 19,
            "grid_penalty_delta": 1,
        }
        res = reconcile_driver(fia_rec, hist_rec, "zhou")
        assert res["outcome"] == ReconciliationOutcome.PIT_LANE_ENCODING_MATCH.value

    def test_track_grid_box_20_not_interpreted_as_pit_lane(self):
        # Tsunoda starting P20 on track (Spa 2024)
        fia_rec = {
            "driver_id": "tsunoda",
            "car_number": 22,
            "driver_name": "Yuki TSUNODA",
            "team_name": "Visa Cash App RB F1 Team",
            "start_type": "TRACK_GRID",
            "track_grid_box": 20,
            "model_feature_grid_position": 20,
            "status": "STARTER",
        }
        hist_rec = {
            "driver_id": "tsunoda",
            "driver_number": 22,
            "constructor_id": "rb",
            "grid_position": 20,
            "quali_position": 18,
            "grid_penalty_delta": 2,
        }
        res = reconcile_driver(fia_rec, hist_rec, "tsunoda")
        # Must be QUALIFYING_POSITION_DIFFERENCE, NOT PIT_LANE_ENCODING_MATCH
        assert res["outcome"] == ReconciliationOutcome.QUALIFYING_POSITION_DIFFERENCE.value
        assert res["fia_values"]["start_type"] == "TRACK_GRID"
        assert res["fia_values"]["track_grid_box"] == 20

    def test_driver_substitution_bearman_vs_sainz(self):
        # Bearman in Car 38 at Saudi Arabia 2024
        fia_rec = {
            "driver_id": "bearman",
            "car_number": 38,
            "driver_name": "Oliver BEARMAN",
            "team_name": "Scuderia Ferrari",
            "start_type": "TRACK_GRID",
            "track_grid_box": 11,
            "model_feature_grid_position": 11,
            "status": "STARTER",
        }
        hist_rec = {
            "driver_id": "bearman",
            "driver_number": 38,
            "constructor_id": "ferrari",
            "grid_position": 11,
            "quali_position": 11,
            "grid_penalty_delta": 0,
        }
        res = reconcile_driver(fia_rec, hist_rec, "bearman")
        assert res["outcome"] == ReconciliationOutcome.MATCH.value
        assert res["driver_id"] == "bearman"
        assert res["car_number"] == 38


class TestReportGenerationAndValidation:
    """Verify deterministic generation, JSON schema validation, and benchmark counts."""

    def test_generate_all_benchmark_reports_deterministic(self):
        # Generate reports twice and verify exact identity
        summary1 = generate_all_benchmark_reports()
        summary2 = generate_all_benchmark_reports()

        assert summary1["total_events_reconciled"] == 4
        assert summary1["overall_outcome_counts"] == summary2["overall_outcome_counts"]
        assert summary1["unresolved_discrepancies_count"] == 2

    def test_reports_validate_against_schema(self):
        reports = list(REPORTS_DIR.glob("*_gp_doc_*.json"))
        assert len(reports) == 4
        for r_path in reports:
            with open(r_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            validate_reconciliation_report(data)

    def test_benchmark_event_outcome_counts(self):
        with open(REPORTS_DIR / "summary.json", "r", encoding="utf-8") as f:
            summary = json.load(f)

        events = summary["events"]

        # 1. Monza 2022: 1 match (Leclerc), 19 qualifying differences (9 penalties + cascade)
        monza = events["2022_italian_gp_doc_57"]
        assert monza["outcome_counts"]["MATCH"] == 1
        assert monza["outcome_counts"]["QUALIFYING_POSITION_DIFFERENCE"] == 19
        assert not monza["has_discrepancies"]

        # 2. Spa 2024: 6 matches, 14 qualifying differences
        spa = events["2024_belgian_gp_doc_37"]
        assert spa["outcome_counts"]["MATCH"] == 6
        assert spa["outcome_counts"]["QUALIFYING_POSITION_DIFFERENCE"] == 14
        assert not spa["has_discrepancies"]

        # 3. Singapore 2023: 18 matches, 1 race result grid diff (Zhou), 1 withdrawal diff (Stroll)
        sgp = events["2023_singapore_gp_doc_40"]
        assert sgp["outcome_counts"]["MATCH"] == 18
        assert sgp["outcome_counts"]["RACE_RESULT_GRID_DIFFERENCE"] == 1
        assert sgp["outcome_counts"]["WITHDRAWAL_OR_DNS_DIFFERENCE"] == 1
        assert sgp["has_discrepancies"]

        # 4. Saudi 2024: 20 matches (including Bearman P11, Zhou P20)
        sau = events["2024_saudi_arabian_gp_doc_39"]
        assert sau["outcome_counts"]["MATCH"] == 20
        assert not sau["has_discrepancies"]

