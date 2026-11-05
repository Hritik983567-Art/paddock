"""FIA Starting Grid Parser & Reconciler Package (Phase 3C.4E.4).

Provides offline parsing, validation, and historical reconciliation of official FIA Starting Grid documents.
"""

from scripts.fia_grid_parser.pdf_extractor import (
    EXTRACTOR_LIBRARY,
    ExtractedPDFDocument,
    PageProvenance,
    PDFExtractionError,
    extract_pdf_document,
)
from scripts.fia_grid_parser.grid_parser import (
    CANONICAL_CAR_DRIVERS,
    PARSER_VERSION,
    GridParsingError,
    RevisionDetectedError,
    parse_fia_grid_document,
)
from scripts.fia_grid_parser.validation import (
    FixtureValidationError,
    validate_against_manifest,
    validate_fixture_schema,
    validate_fixture_semantics,
    validate_starting_grid_fixture,
)
from scripts.fia_grid_parser.reconciler import (
    RECONCILER_VERSION,
    ReconciliationOutcome,
    generate_all_benchmark_reports,
    reconcile_driver,
    reconcile_starting_grid_event,
    validate_reconciliation_report,
)

__all__ = [
    "EXTRACTOR_LIBRARY",
    "PARSER_VERSION",
    "RECONCILER_VERSION",
    "CANONICAL_CAR_DRIVERS",
    "ExtractedPDFDocument",
    "PageProvenance",
    "PDFExtractionError",
    "GridParsingError",
    "RevisionDetectedError",
    "FixtureValidationError",
    "ReconciliationOutcome",
    "extract_pdf_document",
    "parse_fia_grid_document",
    "validate_fixture_schema",
    "validate_fixture_semantics",
    "validate_against_manifest",
    "validate_starting_grid_fixture",
    "reconcile_driver",
    "reconcile_starting_grid_event",
    "generate_all_benchmark_reports",
    "validate_reconciliation_report",
]
