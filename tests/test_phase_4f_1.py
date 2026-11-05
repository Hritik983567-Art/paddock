#!/usr/bin/env python3
"""
Root test runner mirror for Phase 3C.4F.1
Mirrors scripts/predictor_model/experimental_2025_validation/phase_3c_4f_1/test_phase_4f_1.py
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from scripts.predictor_model.experimental_2025_validation.phase_3c_4f_1.test_phase_4f_1 import (
    test_empirical_grid_baseline_reference_fit_and_normalize,
    test_empirical_grid_baseline_clamping_and_missing_grid,
    test_geometric_hybrid_log_space_numerical_stability,
    test_geometric_hybrid_variable_roster_sizes,
    test_geometric_hybrid_driver_order_invariance,
    test_alternative_combination_methods_supported,
    test_hybrid_prediction_contract_16_fields,
    test_statistical_reproducibility_2024_and_2025,
    test_production_gate_strictly_closed_and_model_c_not_trained,
)

__all__ = [
    "test_empirical_grid_baseline_reference_fit_and_normalize",
    "test_empirical_grid_baseline_clamping_and_missing_grid",
    "test_geometric_hybrid_log_space_numerical_stability",
    "test_geometric_hybrid_variable_roster_sizes",
    "test_geometric_hybrid_driver_order_invariance",
    "test_alternative_combination_methods_supported",
    "test_hybrid_prediction_contract_16_fields",
    "test_statistical_reproducibility_2024_and_2025",
    "test_production_gate_strictly_closed_and_model_c_not_trained",
]
