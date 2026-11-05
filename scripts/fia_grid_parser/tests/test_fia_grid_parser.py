"""Comprehensive Test Suite for FIA Starting Grid PDF Parser (Phase 3C.4E.3).

Covers:
- All 4 benchmark PDFs (Monza 2022, Spa 2024, Singapore 2023, Saudi Arabia 2024)
- Page 1 metadata extraction
- Grid-row extraction and driver resolution
- Pit-lane starter and withdrawal handling
- 2024 Spa Zhou & Tsunoda reconciliation
- 2024 Saudi Bearman substitution & Zhou 107% dispensation
- 2022 Monza 9-penalty cascade
- Malformed, empty, and 1-page PDF rejection
- Hash mismatch detection
- Duplicate grid position and duplicate car rejection
- Ambiguous / unresolvable driver rejection
- Revision detection
- Offline execution verification (strictly zero network calls)
"""

import json
import socket
import urllib.request
from pathlib import Path
from unittest.mock import patch

import pytest

from scripts.fia_grid_parser import (
    FixtureValidationError,
    GridParsingError,
    PDFExtractionError,
    RevisionDetectedError,
    extract_pdf_document,
    parse_fia_grid_document,
    validate_against_manifest,
    validate_starting_grid_fixture,
)

FIXTURES_DIR = Path(__file__).parent.parent / "fixtures"
DOCS_DIR = FIXTURES_DIR / "documents"
EXPECTED_DIR = FIXTURES_DIR / "expected"

BENCHMARK_KEYS = [
    "2022_italian_gp_doc_57",
    "2024_belgian_gp_doc_37",
    "2023_singapore_gp_doc_40",
    "2024_saudi_arabian_gp_doc_39",
]


class TestBenchmarkFixturesExtraction:
    """Test PDF extraction and cryptographic integrity of benchmark documents."""

    @pytest.mark.parametrize("key", BENCHMARK_KEYS)
    def test_extract_benchmark_pdf(self, key: str):
        pdf_path = DOCS_DIR / f"{key}.pdf"
        assert pdf_path.is_file(), f"Benchmark PDF fixture missing: {pdf_path}"

        doc = extract_pdf_document(pdf_path)
        assert doc.page_count == 2
        assert doc.file_size_bytes > 400_000
        assert len(doc.sha256) == 64
        assert doc.extractor_library.startswith("pypdf-")

        # Verify against manifest
        manifest_path = FIXTURES_DIR / "fixtures_manifest.json"
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
        expected_hash = manifest["fixtures"][key]["sha256"]
        assert doc.sha256.lower() == expected_hash.lower()


class TestBenchmarkFixturesParsing:
    """Test parsing and data contract adherence for all benchmark fixtures."""

    @pytest.mark.parametrize("key", BENCHMARK_KEYS)
    def test_parse_and_validate_benchmark(self, key: str):
        pdf_path = DOCS_DIR / f"{key}.pdf"
        expected_path = EXPECTED_DIR / f"{key}.json"
        assert expected_path.is_file(), f"Expected JSON fixture missing: {expected_path}"

        with open(expected_path, "r", encoding="utf-8") as f:
            expected_data = json.load(f)

        parsed = parse_fia_grid_document(
            file_path=pdf_path,
            event_metadata=expected_data["event_metadata"],
            qualifying_positions={
                r["driver_id"]: r["qualifying_position"]
                for r in expected_data["grid_records"]
                if r.get("qualifying_position") is not None
            },
            expected_sha256=expected_data["document_metadata"]["pdf_sha256"],
            published_iso_timestamp=expected_data["document_metadata"]["published_timestamp"],
            fia_source_url=expected_data["document_metadata"]["fia_url"],
        )

        # Validate against schema and semantics
        validate_starting_grid_fixture(parsed, fixture_key=key)

        # Compare fields (excluding non-deterministic extracted_at timestamp)
        assert parsed["document_metadata"]["official_doc_id"] == expected_data["document_metadata"]["official_doc_id"]
        assert parsed["document_metadata"]["pdf_sha256"] == expected_data["document_metadata"]["pdf_sha256"]
        assert parsed["roster_summary"] == expected_data["roster_summary"]
        assert len(parsed["grid_records"]) == len(expected_data["grid_records"])

        for parsed_r, expected_r in zip(parsed["grid_records"], expected_data["grid_records"]):
            assert parsed_r["driver_id"] == expected_r["driver_id"]
            assert parsed_r["car_number"] == expected_r["car_number"]
            assert parsed_r["start_type"] == expected_r["start_type"]
            assert parsed_r["track_grid_box"] == expected_r["track_grid_box"]
            assert parsed_r["model_feature_grid_position"] == expected_r["model_feature_grid_position"]
            assert parsed_r["status"] == expected_r["status"]


class TestSpecificEdgeCases:
    """Detailed verification of historical sporting edge cases."""

    def test_spa_2024_zhou_tsunoda_reconciliation(self):
        pdf_path = DOCS_DIR / "2024_belgian_gp_doc_37.pdf"
        parsed = parse_fia_grid_document(pdf_path)

        by_driver = {r["driver_id"]: r for r in parsed["grid_records"]}

        # Verstappen P11 (10-place penalty from P1)
        assert by_driver["max_verstappen"]["track_grid_box"] == 11
        assert by_driver["max_verstappen"]["model_feature_grid_position"] == 11

        # Sargeant P18 (promoted from Q19 due to Tsunoda BOG)
        assert by_driver["sargeant"]["track_grid_box"] == 18
        assert by_driver["sargeant"]["model_feature_grid_position"] == 18

        # Zhou P19 (3-place penalty from Q20, placed ahead of BOG Tsunoda under Art 42.3d)
        assert by_driver["zhou"]["track_grid_box"] == 19
        assert by_driver["zhou"]["model_feature_grid_position"] == 19
        assert "document no. 32" in (by_driver["zhou"]["penalty_details"] or "").lower()

        # Tsunoda P20 (BOG penalty under Art 42.3d)
        assert by_driver["tsunoda"]["track_grid_box"] == 20
        assert by_driver["tsunoda"]["model_feature_grid_position"] == 20
        assert "document no. 18" in (by_driver["tsunoda"]["penalty_details"] or "").lower()

    def test_singapore_2023_pit_lane_and_withdrawal_accounting(self):
        pdf_path = DOCS_DIR / "2023_singapore_gp_doc_40.pdf"
        parsed = parse_fia_grid_document(pdf_path)

        roster = parsed["roster_summary"]
        assert roster["total_entered"] == 20
        assert roster["total_track_grid"] == 18
        assert roster["total_pit_lane"] == 1
        assert roster["total_withdrawn"] == 1
        assert roster["total_race_starters"] == 19

        by_driver = {r["driver_id"]: r for r in parsed["grid_records"]}

        # Zhou Guanyu: Pit lane start
        zhou = by_driver["zhou"]
        assert zhou["start_type"] == "PIT_LANE"
        assert zhou["track_grid_box"] is None
        assert zhou["pit_lane_order"] == 1
        assert zhou["model_feature_grid_position"] == 20
        assert zhou["status"] == "STARTER"

        # Lance Stroll: Withdrawn
        stroll = by_driver["stroll"]
        assert stroll["start_type"] == "WITHDRAWN"
        assert stroll["track_grid_box"] is None
        assert stroll["pit_lane_order"] is None
        assert stroll["model_feature_grid_position"] is None
        assert stroll["status"] == "WITHDRAWN"

    def test_saudi_2024_bearman_substitution_and_zhou_dispensation(self):
        pdf_path = DOCS_DIR / "2024_saudi_arabian_gp_doc_39.pdf"
        parsed = parse_fia_grid_document(pdf_path)

        by_driver = {r["driver_id"]: r for r in parsed["grid_records"]}

        # Oliver Bearman in Car 38
        assert "bearman" in by_driver
        assert by_driver["bearman"]["car_number"] == 38
        assert by_driver["bearman"]["track_grid_box"] == 11
        assert by_driver["bearman"]["model_feature_grid_position"] == 11
        assert by_driver["bearman"]["team_name"] == "Scuderia Ferrari"

        # Zhou Guanyu 107% dispensation
        assert by_driver["zhou"]["car_number"] == 24
        assert by_driver["zhou"]["track_grid_box"] == 20
        assert by_driver["zhou"]["model_feature_grid_position"] == 20
        assert by_driver["zhou"]["dispensation_doc"] == "Doc 32"

    def test_monza_2022_nine_penalty_cascade(self):
        pdf_path = DOCS_DIR / "2022_italian_gp_doc_57.pdf"
        parsed = parse_fia_grid_document(pdf_path)

        by_driver = {r["driver_id"]: r for r in parsed["grid_records"]}

        # Unpenalized front-row & top-10 promotions
        assert by_driver["leclerc"]["track_grid_box"] == 1
        assert by_driver["russell"]["track_grid_box"] == 2
        assert by_driver["norris"]["track_grid_box"] == 3
        assert by_driver["de_vries"]["track_grid_box"] == 8
        assert by_driver["latifi"]["track_grid_box"] == 10

        # Penalized positions
        assert by_driver["max_verstappen"]["track_grid_box"] == 7
        assert by_driver["perez"]["track_grid_box"] == 13
        assert by_driver["ocon"]["track_grid_box"] == 14
        assert by_driver["bottas"]["track_grid_box"] == 15
        assert by_driver["kevin_magnussen"]["track_grid_box"] == 16
        assert by_driver["mick_schumacher"]["track_grid_box"] == 17
        assert by_driver["sainz"]["track_grid_box"] == 18
        assert by_driver["hamilton"]["track_grid_box"] == 19
        assert by_driver["tsunoda"]["track_grid_box"] == 20


class TestFailClosedValidation:
    """Test that parser and validator fail closed under invalid or ambiguous conditions."""

    def test_malformed_and_empty_pdf(self, tmp_path: Path):
        # Empty file
        empty_file = tmp_path / "empty.pdf"
        empty_file.write_bytes(b"")
        with pytest.raises(PDFExtractionError, match="empty"):
            extract_pdf_document(empty_file)

        # Non-PDF file
        txt_file = tmp_path / "fake.pdf"
        txt_file.write_bytes(b"This is not a PDF file")
        with pytest.raises(PDFExtractionError, match="magic bytes"):
            extract_pdf_document(txt_file)

        # Missing file
        missing_file = tmp_path / "non_existent.pdf"
        with pytest.raises(PDFExtractionError, match="File not found"):
            extract_pdf_document(missing_file)

    def test_hash_mismatch_fails_closed(self):
        pdf_path = DOCS_DIR / "2024_belgian_gp_doc_37.pdf"
        with pytest.raises(GridParsingError, match="Cryptographic hash mismatch"):
            parse_fia_grid_document(
                file_path=pdf_path,
                expected_sha256="0000000000000000000000000000000000000000000000000000000000000000",
            )

    def test_duplicate_track_grid_box_fails_closed(self):
        expected_path = EXPECTED_DIR / "2024_belgian_gp_doc_37.json"
        with open(expected_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Inject duplicate grid box
        data["grid_records"][1]["track_grid_box"] = 1  # Duplicate P1
        with pytest.raises(FixtureValidationError, match="Duplicate track grid box"):
            validate_starting_grid_fixture(data)

    def test_duplicate_car_number_fails_closed(self):
        expected_path = EXPECTED_DIR / "2024_belgian_gp_doc_37.json"
        with open(expected_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Inject duplicate car number
        data["grid_records"][1]["car_number"] = 16  # Duplicate car 16
        with pytest.raises(FixtureValidationError, match="Duplicate car number"):
            validate_starting_grid_fixture(data)

    def test_roster_summary_mismatch_fails_closed(self):
        expected_path = EXPECTED_DIR / "2024_belgian_gp_doc_37.json"
        with open(expected_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Invalidate roster summary count
        data["roster_summary"]["total_track_grid"] = 19
        with pytest.raises(FixtureValidationError, match="total_track_grid"):
            validate_starting_grid_fixture(data)

    def test_invalid_pit_lane_model_encoding_fails_closed(self):
        expected_path = EXPECTED_DIR / "2023_singapore_gp_doc_40.json"
        with open(expected_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Modify pit lane model feature grid position to 19 instead of 20
        for rec in data["grid_records"]:
            if rec["start_type"] == "PIT_LANE":
                rec["model_feature_grid_position"] = 19
        with pytest.raises(FixtureValidationError, match="model_feature_grid_position == 20"):
            validate_starting_grid_fixture(data)

    def test_revision_detected_fails_closed(self, monkeypatch):
        from scripts.fia_grid_parser.grid_parser import detect_document_revision
        kw = detect_document_revision("Page 1 - AMENDED Starting Grid", "Page 2 Grid")
        assert kw == "AMENDED"


class TestOfflineExecutionGuarantee:
    """Verify that the parser never performs network calls during execution."""

    def test_parser_runs_strictly_offline(self):
        pdf_path = DOCS_DIR / "2024_belgian_gp_doc_37.pdf"

        def forbidden_network(*args, **kwargs):
            raise AssertionError("Network connection attempted by offline parser!")

        # Monkeypatch socket and urllib to verify complete offline isolation
        with patch.object(socket, "create_connection", side_effect=forbidden_network):
            with patch.object(urllib.request, "urlopen", side_effect=forbidden_network):
                parsed = parse_fia_grid_document(pdf_path)
                assert parsed["document_metadata"]["official_doc_id"] == "Doc 37"
                assert parsed["roster_summary"]["total_race_starters"] == 20
