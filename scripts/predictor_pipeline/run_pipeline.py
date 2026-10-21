import os
import sys
import json
import argparse
import pandas as pd

from .config import (
    DEFAULT_START_SEASON,
    DEFAULT_END_SEASON,
    OUTPUT_DIR,
    PROJECT_ROOT
)
from .schemas import FEATURE_SCHEMA
from .jolpica_extractor import JolpicaExtractor
from .fastf1_extractor import FastF1Extractor
from .feature_pipeline import FeaturePipeline
from .validator import DatasetValidator

def main():
    parser = argparse.ArgumentParser(description="Paddock Race Predictor — Historical Data Pipeline")
    parser.add_argument("--start-season", type=int, default=DEFAULT_START_SEASON, help="Starting season year (e.g. 2018)")
    parser.add_argument("--end-season", type=int, default=DEFAULT_END_SEASON, help="Ending season year (e.g. 2024)")
    parser.add_argument("--enable-fastf1", dest="enable_fastf1", action="store_true", default=True, help="Enable FastF1 weather extraction (default: True)")
    parser.add_argument("--no-fastf1", dest="enable_fastf1", action="store_false", help="Disable FastF1 weather extraction (fallback to Jolpica provenance)")
    args = parser.parse_args()

    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding='utf-8', errors='replace')
            sys.stderr.reconfigure(encoding='utf-8', errors='replace')
        except AttributeError:
            pass

    print("================================================================================")
    print("PADDOCK RACE PREDICTOR — HISTORICAL DATA ENGINEERING PIPELINE")
    print(f"Target Championship Eras: {args.start_season} to {args.end_season} (FastF1: {args.enable_fastf1})")
    print("================================================================================")

    jolpica = JolpicaExtractor()
    fastf1 = FastF1Extractor()
    pipeline = FeaturePipeline(jolpica=jolpica, fastf1=fastf1, enable_fastf1=args.enable_fastf1)

    # 1. Extract & Engineer Features
    df = pipeline.build_dataset(start_season=args.start_season, end_season=args.end_season)

    if df.empty:
        print("[Error] No dataset rows produced. Exiting.")
        sys.exit(1)

    # 2. Export Feature Dictionary
    dict_path = os.path.join(OUTPUT_DIR, "feature_dictionary.json")
    with open(dict_path, "w", encoding="utf-8") as f:
        json.dump(FEATURE_SCHEMA, f, indent=2)
    print(f"[Export] Saved feature dictionary: {dict_path}")

    # 3. Export Datasets
    csv_path = os.path.join(OUTPUT_DIR, "f1_race_predictor_dataset.csv")
    parquet_path = os.path.join(OUTPUT_DIR, "f1_race_predictor_dataset.parquet")

    df.to_csv(csv_path, index=False)
    print(f"[Export] Saved CSV dataset ({len(df)} rows): {csv_path}")

    try:
        df.to_parquet(parquet_path, index=False)
        print(f"[Export] Saved Parquet dataset: {parquet_path}")
    except Exception as e:
        print(f"[Notice] Parquet export skipped ({e}). CSV preserved as primary ground truth.")

    # 4. Run Comprehensive Validation Suite
    print("\n[Validation] Running 7-point dataset integrity and leakage audit...")
    validator = DatasetValidator(df)
    results = validator.run_all_checks()

    # 5. Export Quality Reports
    report_output_path = os.path.join(OUTPUT_DIR, "DATA_QUALITY_REPORT.md")
    docs_report_path = os.path.join(PROJECT_ROOT, "docs", "PREDICTOR_DATA_QUALITY_REPORT.md")

    validator.save_report(report_output_path)
    validator.save_report(docs_report_path)
    print(f"[Export] Saved validation reports:\n  - {report_output_path}\n  - {docs_report_path}")

    print("\n--------------------------------------------------------------------------------")
    print("AUDIT SUMMARY:")
    for k, v in results.get("metrics", {}).items():
        print(f"  {k}: {v}")
    print(f"  Validation Status: {'PASSED [OK]' if results['passed'] else 'FAILED [ERROR]'}")
    print("--------------------------------------------------------------------------------")

    if not results['passed']:
        sys.exit(1)

if __name__ == "__main__":
    main()
