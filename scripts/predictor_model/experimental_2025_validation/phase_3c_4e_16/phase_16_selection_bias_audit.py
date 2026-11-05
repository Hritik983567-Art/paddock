#!/usr/bin/env python3
"""
Phase 3C.4E.16: Selection Bias, Hyperparameter Lineage & Preregistration Audit

Audit Objectives:
1. Reconstruct the full chronological timeline of when each hybrid architecture,
   prior configuration, and blending weight was proposed and evaluated.
2. Differentiate between:
   - Genuinely pre-specified configurations (selected strictly via 2021-2023 training cross-validation).
   - Exploratory post-hoc additions (prompted by inspecting 2024/2025 holdout performance).
3. Audit the completeness of the M=20 hypothesis testing family:
   - Document whether the 20 hypotheses encompass all tested variations or whether additional
     parameter sweeps (e.g. w in [0.05..0.50], lambda in [0.05..0.40], quali_likelihood) were explored.
4. Provide a formal, binding assessment under the Independent Confirmation Rule:
   - Explain why neither 2024 nor 2025 can serve as an untouched confirmatory benchmark.
   - Prohibit claiming out-of-sample independent confirmation.
5. Export full audit results to phase_16_selection_bias.json.
"""

import sys
import os
import json
from pathlib import Path
from typing import Dict, List, Any
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent
REPORTS_DIR = PROJECT_ROOT / "scripts" / "predictor_model" / "reports" / "phase_3c_4e_16"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


def build_selection_bias_audit() -> Dict[str, Any]:
    print("=" * 80)
    print("PHASE 3C.4E.16: SELECTION BIAS & HYPERPARAMETER LINEAGE AUDIT")
    print("=" * 80)

    # 1. Chronological Timeline of Model Prototyping
    timeline = [
        {
            "phase": "Phase 3C.4E.13",
            "date": "2026-11-05",
            "scope": "Independent 2025 Out-of-Sample Evaluation",
            "models_evaluated": [
                "frozen_model_a (2021-2023)",
                "remediated_model_b (2021-2023)",
                "retrained_model_b (2021-2024)",
                "reciprocal_grid_baseline",
                "empirical_grid_baseline (fitted on 2021-2024)",
                "tuned_grid_baseline (alpha=5.0, fitted on 2021-2024)"
            ],
            "key_finding": (
                "Empirical grid baseline (1.1250 log loss) outperformed Model B (1.1837 log loss) on 2025. "
                "The ML model added variance without improving probability calibration on pole sitters."
            ),
            "selection_bias_impact": "Disclosed 2025 out-of-sample metrics to engineering team."
        },
        {
            "phase": "Phase 3C.4E.14",
            "date": "2026-11-05",
            "scope": "Bayesian Hybrid Feasibility & Independent Validation",
            "models_evaluated": [
                "Prior-only empirical baseline (Laplace alpha=1.0 fitted on 2021-2023)",
                "Geometric mixture w in [0.05, 0.10, 0.20, 0.30, 0.50]",
                "Convex ensemble gamma in [0.05, 0.10, 0.20, 0.30, 0.50]",
                "Log-odds shrinkage lambda in [0.05, 0.10, 0.25, 0.40]",
                "Qualifying pace likelihood beta in [0.25, 0.50, 1.00]"
            ],
            "hyperparameter_selection_method": (
                "3-fold cross-validation strictly on 2021-2023 training data selected w=0.20 (geometric) "
                "and gamma=0.20 (convex). However, multiple candidate weights were simultaneously evaluated "
                "on 2024 and 2025 holdout sets."
            ),
            "selection_bias_impact": (
                "Evaluated multiple candidate blends on 2024 and 2025 holdouts. Although w=0.20 was derived from CV, "
                "the holdout performance of all alternatives was directly observed."
            )
        },
        {
            "phase": "Phase 3C.4E.15",
            "date": "2026-11-05",
            "scope": "Independent Hybrid Confirmation & Baseline Fairness Audit",
            "models_evaluated": [
                "Baseline Laplace alpha=1.0 (2021-2023)",
                "Baseline Tuned alpha=5.0 (2021-2023)",
                "Baseline Expanding Walk-Forward",
                "Baseline Reciprocal",
                "Geometric Hybrid (w=0.20, Prior alpha=1.0)",
                "Geometric Hybrid (w=0.20, Prior alpha=5.0) [NEW POST-HOC ADDITION]",
                "Convex Hybrid (gamma=0.20, Prior alpha=1.0)",
                "Convex Hybrid (gamma=0.20, Prior alpha=5.0) [NEW POST-HOC ADDITION]",
                "Log-Odds Shrinkage (lambda=0.25, Prior alpha=1.0)"
            ],
            "hyperparameter_selection_method": (
                "Prompted by observing that Baseline alpha=5.0 outperformed Baseline alpha=1.0 on the 2024 holdout "
                "(1.7601 vs 1.8535), new hybrid variants anchoring to Prior alpha=5.0 were formulated and evaluated "
                "specifically to test whether the hybrid still dominated the stronger baseline."
            ),
            "selection_bias_impact": (
                "Direct post-hoc adaptation: Prior alpha=5.0 was introduced into the hybrid family after inspecting "
                "2024 holdout results. This confirmed robustness, but means Prior alpha=5.0 hybrids were post-hoc "
                "rather than pre-specified."
            )
        }
    ]

    # 2. Classification of Evaluated Configurations
    configuration_classification = {
        "genuinely_prespecified": [
            {
                "model_key": "hybrid_geo_w020_prior_a1",
                "label": "Geometric Mixture (w=0.20, Prior alpha=1.0)",
                "selection_origin": "Selected strictly via 3-fold cross-validation on 2021-2023 training data in Phase 14",
                "prespecified_status": "PRE_SPECIFIED"
            },
            {
                "model_key": "hybrid_cvx_g020_prior_a1",
                "label": "Convex Ensemble (gamma=0.20, Prior alpha=1.0)",
                "selection_origin": "Selected strictly via 3-fold cross-validation on 2021-2023 training data in Phase 14",
                "prespecified_status": "PRE_SPECIFIED"
            },
            {
                "model_key": "baseline_laplace_alpha_1",
                "label": "Empirical Grid Baseline (Laplace alpha=1.0)",
                "selection_origin": "Standard benchmark established in Phase 8/9",
                "prespecified_status": "PRE_SPECIFIED"
            }
        ],
        "exploratory_post_hoc_additions": [
            {
                "model_key": "hybrid_geo_w020_prior_a5",
                "label": "Geometric Mixture (w=0.20, Prior alpha=5.0)",
                "selection_origin": (
                    "Formulated in Phase 15 specifically to address the challenge that Baseline alpha=5.0 was stronger "
                    "than Baseline alpha=1.0 in 2024. Not part of the original Phase 14 pre-specified CV tuning."
                ),
                "prespecified_status": "POST_HOC_EXPLORATORY"
            },
            {
                "model_key": "hybrid_cvx_g020_prior_a5",
                "label": "Convex Ensemble (gamma=0.20, Prior alpha=5.0)",
                "selection_origin": "Formulated in Phase 15 as an exploratory variant under Prior alpha=5.0.",
                "prespecified_status": "POST_HOC_EXPLORATORY"
            },
            {
                "model_key": "hybrid_log_odds_lam025_prior_a1",
                "label": "Log-Odds Shrinkage (lambda=0.25, Prior alpha=1.0)",
                "selection_origin": "Exploratory candidate in Phase 14 grid sweep; lambda=0.25 selected after inspecting holdouts.",
                "prespecified_status": "POST_HOC_EXPLORATORY"
            },
            {
                "model_key": "weight_grid_sweeps",
                "label": "Parametric Sensitivity Sweeps (w in [0.05..0.50], gamma in [0.05..0.50])",
                "selection_origin": "Evaluated in Phase 14 and Phase 15 robustness sections across both holdouts.",
                "prespecified_status": "EXPLORATORY_SENSITIVITY"
            }
        ]
    }

    # 3. Scope of the Evaluated Search Space
    hypothesis_space_audit = {
        "primary_reported_family_size": 20,
        "primary_family_composition": "5 hybrid variants x 2 holdout seasons (2024, 2025) x 2 baseline references (alpha=1, alpha=5)",
        "total_exploratory_variants_tested_in_pipeline": 46,
        "breakdown_of_all_evaluated_configurations": {
            "primary_hybrid_candidates": 5,
            "alternative_weights_tested_in_phase_14_sweeps": 15,
            "quali_likelihood_variants_tested": 3,
            "baseline_variants_evaluated": 4,
            "seasons_evaluated_across": 2,
            "total_configuration_evaluations": (5 + 15 + 3) * 2  # 46 total evaluated across 2 seasons
        },
        "risk_assessment": (
            "While the M=20 family captures all formal primary comparisons presented in Phase 15, an additional "
            "~26 exploratory configurations were evaluated across Phase 14 and Phase 15 sensitivity analyses. "
            "Reporting M=20 is appropriate for the primary model portfolio, but selection bias cannot be ruled out "
            "when reporting holdout results."
        )
    }

    # 4. Formal Ruling under the Independent Confirmation Rule
    independent_confirmation_rule_ruling = {
        "rule_title": "Independent Confirmation Rule (Phase 3C.4E.15 & 16)",
        "holding": "INDEPENDENT_CONFIRMATION_STRICTLY_DISALLOWED",
        "rationale": (
            "1. Both the 2024 historical dataset and 2025 candidate dataset were repeatedly inspected during "
            "Phases 13, 14, and 15.\n"
            "2. The choice of Prior alpha=5.0 for the hybrid was explicitly prompted by observing 2024 holdout results.\n"
            "3. Multi-weight sensitivity grids were examined across both holdout seasons.\n"
            "4. In statistical learning theory, once a dataset informs model formulation or hyperparameter choice, "
            "it ceases to be an untouched confirmatory test set.\n"
            "5. Consequently, all reported log loss, Brier score, and accuracy metrics for 2024 and 2025 must be "
            "classified as PROMISING EXPLORATORY EVIDENCE, not independent confirmation."
        ),
        "required_action": "True independent confirmation requires prospective validation on upcoming untouched 2026 race data."
    }

    audit_payload = {
        "metadata": {
            "phase": "Phase 3C.4E.16",
            "audit_title": "Selection Bias, Hyperparameter Lineage & Preregistration Audit",
            "timestamp_utc": pd.Timestamp.now(tz="UTC").isoformat(),
            "production_gate": "STRICTLY CLOSED",
            "model_c_trained": False,
            "overall_ruling": "INDEPENDENT_CONFIRMATION_DISALLOWED_EXPLORATORY_ONLY"
        },
        "prototyping_timeline": timeline,
        "configuration_classification": configuration_classification,
        "hypothesis_space_audit": hypothesis_space_audit,
        "independent_confirmation_rule_ruling": independent_confirmation_rule_ruling
    }

    out_file = REPORTS_DIR / "phase_16_selection_bias.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(audit_payload, f, indent=2)

    print(f"\n[DONE] Selection Bias Audit exported to:\n  {out_file}")
    print(f"  Pre-Specified Configurations:  {len(configuration_classification['genuinely_prespecified'])}")
    print(f"  Post-Hoc Exploratory Additions: {len(configuration_classification['exploratory_post_hoc_additions'])}")
    print(f"  Ruling:                        {independent_confirmation_rule_ruling['holding']}")
    print("=" * 80)
    return audit_payload


if __name__ == "__main__":
    build_selection_bias_audit()
