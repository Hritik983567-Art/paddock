"""Test suite for Phase 3C.4E.14 in root tests directory.

Redirects to scripts.predictor_model.experimental_2025_validation.test_hybrid_validation.
"""

from scripts.predictor_model.experimental_2025_validation.test_hybrid_validation import (
    test_cryptographic_baseline_immutability,
    test_phase_13_audit_integrity,
    test_hybrid_normalization_invariance,
    test_robustness_missing_qualifying_and_form_data,
    test_robustness_overconfident_ml_protection,
    test_statistical_hybrid_evaluation_results,
    test_production_safety_gate_strictly_closed,
)

__all__ = [
    "test_cryptographic_baseline_immutability",
    "test_phase_13_audit_integrity",
    "test_hybrid_normalization_invariance",
    "test_robustness_missing_qualifying_and_form_data",
    "test_robustness_overconfident_ml_protection",
    "test_statistical_hybrid_evaluation_results",
    "test_production_safety_gate_strictly_closed",
]

