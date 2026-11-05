#!/usr/bin/env python3
"""
Root test runner mirror for Phase 3C.4F.2
Mirrors scripts/predictor_model/experimental_2025_validation/phase_3c_4f_2/test_phase_4f_2.py
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from scripts.predictor_model.experimental_2025_validation.phase_3c_4f_2.test_phase_4f_2 import (
    test_cryptographic_baseline_immutability,
    test_walk_forward_temporal_integrity,
    test_walk_forward_baseline_and_hybrid_metrics,
    test_loss_surface_convexity_and_regime_tension,
    test_slicing_and_upset_race_robustness,
    test_probabilistic_calibration_and_tail_risk,
    test_governance_and_production_gate,
)

__all__ = [
    "test_cryptographic_baseline_immutability",
    "test_walk_forward_temporal_integrity",
    "test_walk_forward_baseline_and_hybrid_metrics",
    "test_loss_surface_convexity_and_regime_tension",
    "test_slicing_and_upset_race_robustness",
    "test_probabilistic_calibration_and_tail_risk",
    "test_governance_and_production_gate",
]

