"""Test suite for Phase 3C.4E.16 in root tests directory.

Redirects to scripts.predictor_model.experimental_2025_validation.phase_3c_4e_16.test_phase_16_audit.
"""

from scripts.predictor_model.experimental_2025_validation.phase_3c_4e_16.test_phase_16_audit import (
    test_cryptographic_baseline_immutability,
    test_multiple_testing_correction_mathematical_consistency,
    test_baseline_discrepancy_reconciliation,
    test_selection_bias_and_independent_confirmation_rule,
    test_feature_provenance_and_cutoff_evidence,
    test_stage_integrity_and_fail_closed_contract,
    test_probability_metric_interpretation,
    test_production_safety_gate_strictly_closed,
)

__all__ = [
    "test_cryptographic_baseline_immutability",
    "test_multiple_testing_correction_mathematical_consistency",
    "test_baseline_discrepancy_reconciliation",
    "test_selection_bias_and_independent_confirmation_rule",
    "test_feature_provenance_and_cutoff_evidence",
    "test_stage_integrity_and_fail_closed_contract",
    "test_probability_metric_interpretation",
    "test_production_safety_gate_strictly_closed",
]

