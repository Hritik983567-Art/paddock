"""Test suite for Phase 3C.4E.13 in root tests directory.

Redirects to scripts.predictor_model.experimental_2025_validation.test_2025_validation.
"""

from scripts.predictor_model.experimental_2025_validation.test_2025_validation import (
    test_cryptographic_baseline_immutability,
    test_loro_jackknife_mathematical_identity,
    test_upset_classification_primary_benchmark,
    test_empirical_grid_reconstruction_all_variants,
    test_2025_candidate_dataset_validation,
    test_2025_out_of_sample_evaluation,
)

__all__ = [
    "test_cryptographic_baseline_immutability",
    "test_loro_jackknife_mathematical_identity",
    "test_upset_classification_primary_benchmark",
    "test_empirical_grid_reconstruction_all_variants",
    "test_2025_candidate_dataset_validation",
    "test_2025_out_of_sample_evaluation",
]

