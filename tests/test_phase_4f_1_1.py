#!/usr/bin/env python3
"""
Root test runner mirror for Phase 3C.4F.1.1
Mirrors scripts/predictor_model/experimental_2025_validation/phase_3c_4f_1_1/test_phase_4f_1_1.py
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from scripts.predictor_model.experimental_2025_validation.phase_3c_4f_1_1.test_phase_4f_1_1 import (
    test_cryptographic_baseline_immutability,
    test_model_b_2025_reconciliation_values,
    test_model_b_2024_reconciliation_values,
    test_geometric_weight_provenance_and_cv_minimum,
    test_baseline_starts_and_monaco_2021,
    test_pit_lane_proxy_sensitivity,
    test_snapshot_runner_stage_rejection_of_official_grid,
    test_canonical_input_hash_invariance_and_sensitivity,
    test_production_gate_strictly_closed,
)

__all__ = [
    "test_cryptographic_baseline_immutability",
    "test_model_b_2025_reconciliation_values",
    "test_model_b_2024_reconciliation_values",
    "test_geometric_weight_provenance_and_cv_minimum",
    "test_baseline_starts_and_monaco_2021",
    "test_pit_lane_proxy_sensitivity",
    "test_snapshot_runner_stage_rejection_of_official_grid",
    "test_canonical_input_hash_invariance_and_sensitivity",
    "test_production_gate_strictly_closed",
]

