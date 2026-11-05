"""Test suite for Phase 3C.4E.15 in root tests directory.

Redirects to scripts.predictor_model.experimental_2025_validation.test_hybrid_confirmation.
"""

from scripts.predictor_model.experimental_2025_validation.test_hybrid_confirmation import (
    test_cryptographic_baseline_immutability,
    test_baseline_reconstruction_and_fairness_resolution,
    test_multiple_testing_audit,
    test_feature_provenance_and_temporal_isolation,
    test_hybrid_weight_robustness_sweep,
    test_edge_case_robustness,
    test_independent_confirmation_rule_and_gate_status,
)

__all__ = [
    "test_cryptographic_baseline_immutability",
    "test_baseline_reconstruction_and_fairness_resolution",
    "test_multiple_testing_audit",
    "test_feature_provenance_and_temporal_isolation",
    "test_hybrid_weight_robustness_sweep",
    "test_edge_case_robustness",
    "test_independent_confirmation_rule_and_gate_status",
]

