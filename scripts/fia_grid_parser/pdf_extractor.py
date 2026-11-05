"""FIA PDF Extractor (Phase 3C.4E.3).

Offline-first extractor that reads local FIA PDF bytes, computes cryptographic hashes,
extracts text with layout provenance using pypdf, and records library version.
Never performs network calls. Fails closed on malformed or empty documents.
"""

import hashlib
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

import pypdf

EXTRACTOR_LIBRARY = f"pypdf-{pypdf.__version__}"


class PDFExtractionError(Exception):
    """Raised when a PDF cannot be read, is malformed, or fails sanity checks."""
    pass


@dataclass(frozen=True)
class PageProvenance:
    """Provenance data for an extracted PDF page."""
    page_number: int
    raw_text: str
    line_count: int


@dataclass(frozen=True)
class ExtractedPDFDocument:
    """Raw extraction artifact from an FIA starting grid PDF."""
    file_path: Path
    sha256: str
    file_size_bytes: int
    page_count: int
    pages: List[PageProvenance]
    extractor_library: str = EXTRACTOR_LIBRARY

    def get_page_text(self, page_num: int) -> str:
        """Get raw text for 1-based page number."""
        for p in self.pages:
            if p.page_number == page_num:
                return p.raw_text
        raise IndexError(f"Page {page_num} not found in document with {self.page_count} pages")


def extract_pdf_document(file_path: Path) -> ExtractedPDFDocument:
    """Extract raw content and metadata from a local PDF document offline.

    Fails closed if the file is missing, empty, not a valid PDF, or has fewer than 2 pages.
    """
    path = Path(file_path).resolve()
    if not path.is_file():
        raise PDFExtractionError(f"File not found: {path}")

    try:
        data = path.read_bytes()
    except Exception as exc:
        raise PDFExtractionError(f"Failed to read bytes from {path}: {exc}") from exc

    if not data:
        raise PDFExtractionError(f"PDF document is empty: {path}")

    if not data.startswith(b"%PDF"):
        raise PDFExtractionError(f"File does not start with valid PDF magic bytes '%PDF': {path}")

    sha256_hash = hashlib.sha256(data).hexdigest()
    file_size = len(data)

    try:
        reader = pypdf.PdfReader(path)
        page_count = len(reader.pages)
    except Exception as exc:
        raise PDFExtractionError(f"pypdf failed to parse PDF structure: {exc}") from exc

    if page_count < 2:
        raise PDFExtractionError(
            f"FIA Starting Grid PDF must contain at least 2 pages (metadata + grid), found {page_count} pages"
        )

    pages: List[PageProvenance] = []
    for idx, page in enumerate(reader.pages, start=1):
        try:
            raw_text = page.extract_text() or ""
        except Exception as exc:
            raise PDFExtractionError(f"Failed to extract text from page {idx}: {exc}") from exc

        pages.append(
            PageProvenance(
                page_number=idx,
                raw_text=raw_text,
                line_count=len(raw_text.splitlines()),
            )
        )

    return ExtractedPDFDocument(
        file_path=path,
        sha256=sha256_hash,
        file_size_bytes=file_size,
        page_count=page_count,
        pages=pages,
        extractor_library=EXTRACTOR_LIBRARY,
    )

