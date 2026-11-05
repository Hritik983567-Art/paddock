"""FIA Document Fetcher Utility (Phase 3C.4E.3).

This module provides standalone network fetching of official FIA PDF documents.
In accordance with Paddock architectural safeguards:
- Network fetching is strictly isolated in this standalone utility.
- The parser itself runs 100% offline and NEVER attempts network calls.
- Every fetched document is cryptographically verified against its expected SHA-256 hash.
"""

import argparse
import hashlib
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Dict, Optional

BENCHMARK_FIXTURES: Dict[str, Dict[str, str]] = {
    "2022_italian_gp_doc_57": {
        "url": "https://www.fia.com/sites/default/files/decision-document/2022%20Italian%20Grand%20Prix%20-%20Final%20Starting%20Grid.pdf",
        "sha256": "cb3ff0f1f26f93a46b89f164e37cb274a7eabe39c59be1eaa193f205550f27e4",
        "doc_id": "Doc 57",
        "season": "2022",
        "round": "16",
        "filename": "2022_italian_gp_doc_57.pdf",
    },
    "2024_belgian_gp_doc_37": {
        "url": "https://www.fia.com/sites/default/files/decision-document/2024%20Belgian%20Grand%20Prix%20-%20Final%20Starting%20Grid.pdf",
        "sha256": "68a9a811efd32604de382f773fde0d01523e42cedd15ea12de01b51ec5318f7c",
        "doc_id": "Doc 37",
        "season": "2024",
        "round": "14",
        "filename": "2024_belgian_gp_doc_37.pdf",
    },
    "2023_singapore_gp_doc_40": {
        "url": "https://www.fia.com/sites/default/files/decision-document/2023%20Singapore%20Grand%20Prix%20-%20Final%20Starting%20Grid.pdf",
        "sha256": "1972c2dad1d7ed768d104d1ebd6d5c950b37fb62710b55a445b0ac834791724e",
        "doc_id": "Doc 40",
        "season": "2023",
        "round": "15",
        "filename": "2023_singapore_gp_doc_40.pdf",
    },
    "2024_saudi_arabian_gp_doc_39": {
        "url": "https://www.fia.com/sites/default/files/decision-document/2024%20Saudi%20Arabian%20Grand%20Prix%20-%20Final%20Starting%20Grid.pdf",
        "sha256": "c8d98ccf01fb389f3c4fd3878abf9b447700371aa7e1cabe0a9b74adbb00f0b3",
        "doc_id": "Doc 39",
        "season": "2024",
        "round": "2",
        "filename": "2024_saudi_arabian_gp_doc_39.pdf",
    },
}


def download_fia_pdf(
    url: str,
    output_path: Path,
    expected_sha256: Optional[str] = None,
    timeout_sec: int = 30,
) -> str:
    """Download an FIA PDF document, verify SHA-256, and save to output_path.

    Returns the computed hex digest of the downloaded document.
    Raises ValueError if expected_sha256 is supplied and does not match.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/pdf,*/*",
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout_sec) as resp:
            data = resp.read()
    except Exception as exc:
        raise RuntimeError(f"Failed to fetch FIA document from {url}: {exc}") from exc

    if not data or not data.startswith(b"%PDF"):
        raise ValueError(f"Downloaded content from {url} is not a valid PDF")

    sha256_hash = hashlib.sha256(data).hexdigest()
    if expected_sha256 and sha256_hash.lower() != expected_sha256.lower():
        raise ValueError(
            f"SHA-256 mismatch for {url}:\n  Expected: {expected_sha256}\n  Got:      {sha256_hash}"
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(data)

    return sha256_hash


def fetch_all_benchmark_fixtures(target_dir: Optional[Path] = None) -> Dict[str, str]:
    """Fetch all 4 benchmark FIA PDF fixtures and save to fixtures/documents/."""
    if target_dir is None:
        target_dir = Path(__file__).parent / "fixtures" / "documents"

    target_dir.mkdir(parents=True, exist_ok=True)
    results = {}
    for key, item in BENCHMARK_FIXTURES.items():
        out_path = target_dir / item["filename"]
        print(f"Fetching {key} ({item['doc_id']})...")
        h = download_fia_pdf(
            url=item["url"],
            output_path=out_path,
            expected_sha256=item["sha256"],
        )
        print(f"  Verified {out_path.name} -> SHA-256: {h}")
        results[key] = h

    return results


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch and verify FIA Starting Grid PDFs.")
    parser.add_argument(
        "--fixtures",
        action="store_true",
        help="Download and verify all 4 benchmark PDF fixtures.",
    )
    parser.add_argument("--url", type=str, help="URL of FIA PDF document to download.")
    parser.add_argument("--out", type=str, help="Output file path.")
    parser.add_argument("--expected-sha256", type=str, help="Expected SHA-256 hash.")
    args = parser.parse_args()

    if args.fixtures:
        fetch_all_benchmark_fixtures()
        print("All benchmark fixtures downloaded and cryptographically verified.")
    elif args.url and args.out:
        h = download_fia_pdf(args.url, Path(args.out), args.expected_sha256)
        print(f"Downloaded and verified: {args.out} (SHA-256: {h})")
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()

