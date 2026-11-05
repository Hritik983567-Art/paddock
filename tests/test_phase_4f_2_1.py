#!/usr/bin/env python3
"""
Root test runner mirror for Phase 3C.4F.2.1
Mirrors scripts/predictor_model/experimental_2025_validation/phase_3c_4f_2_1/test_phase_4f_2_1.py
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from scripts.predictor_model.experimental_2025_validation.phase_3c_4f_2_1.test_phase_4f_2_1 import (
    test_cryptographic_baseline_immutability,
    test_chronological_separation_and_identity_isolation,
    test_feature_temporal_availability_and_zero_leakage,
    test_2023_performance_investigation,
    test_training_only_preprocessing_encapsulation,
    test_temperature_calibration_audit,
    test_statistical_multiplicity_and_race_level_tests,
    test_observed_tail_risk_qualification,
    test_governance_and_closed_production_gate,
)

__all__ = [
    "test_cryptographic_baseline_immutability",
    "test_chronological_separation_and_identity_isolation",
    "test_feature_temporal_availability_and_zero_leakage",
    "test_2023_performance_investigation",
    "test_training_only_preprocessing_encapsulation",
    "test_temperature_calibration_audit",
    "test_statistical_multiplicity_and_race_level_tests",
    "test_observed_tail_risk_qualification",
    "test_governance_and_closed_production_gate",
]

