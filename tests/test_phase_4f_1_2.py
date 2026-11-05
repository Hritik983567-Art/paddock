#!/usr/bin/env python3
"""
Root test runner mirror for Phase 3C.4F.1.2
Mirrors scripts/predictor_model/experimental_2025_validation/phase_3c_4f_1_2/test_phase_4f_1_2.py
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from scripts.predictor_model.experimental_2025_validation.phase_3c_4f_1_2.test_phase_4f_1_2 import (
    test_cryptographic_baseline_immutability,
    test_1_identical_inputs_produce_identical_hashes,
    test_2_order_invariance,
    test_3_all_42_features_sensitive,
    test_4_driver_id_sensitivity,
    test_5_race_identity_sensitivity,
    test_6_stage_sensitivity,
    test_7_metadata_and_weight_sensitivity,
    test_8_output_probability_sensitivity,
    test_9_feature_mutation_decoupled_from_output_hash,
    test_10_deterministic_repeatability,
    test_full_response_contract_fields_and_stage_enforcement,
    sample_test_fixtures,
)

__all__ = [
    "test_cryptographic_baseline_immutability",
    "test_1_identical_inputs_produce_identical_hashes",
    "test_2_order_invariance",
    "test_3_all_42_features_sensitive",
    "test_4_driver_id_sensitivity",
    "test_5_race_identity_sensitivity",
    "test_6_stage_sensitivity",
    "test_7_metadata_and_weight_sensitivity",
    "test_8_output_probability_sensitivity",
    "test_9_feature_mutation_decoupled_from_output_hash",
    "test_10_deterministic_repeatability",
    "test_full_response_contract_fields_and_stage_enforcement",
    "sample_test_fixtures",
]

