#!/usr/bin/env python3
"""
Root test runner mirror for Phase 3C.4F.2.2
Mirrors scripts/predictor_model/experimental_2025_validation/phase_3c_4f_2_2/test_phase_4f_2_2.py
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from scripts.predictor_model.experimental_2025_validation.phase_3c_4f_2_2.test_phase_4f_2_2 import (
    test_cryptographic_baseline_immutability,
    test_oof_metric_reconstruction_and_regime_separation,
    test_pooled_metric_calculation_and_mathematical_consistency,
    test_race_level_paired_differences_and_multiplicity_corrections,
    test_no_reuse_of_original_in_sample_p_values,
    test_jackknife_temperature_sensitivity_diagnostics,
    test_stage_semantics_audit,
    test_governance_and_closed_production_gate,
)

__all__ = [
    "test_cryptographic_baseline_immutability",
    "test_oof_metric_reconstruction_and_regime_separation",
    "test_pooled_metric_calculation_and_mathematical_consistency",
    "test_race_level_paired_differences_and_multiplicity_corrections",
    "test_no_reuse_of_original_in_sample_p_values",
    "test_jackknife_temperature_sensitivity_diagnostics",
    "test_stage_semantics_audit",
    "test_governance_and_closed_production_gate",
]

