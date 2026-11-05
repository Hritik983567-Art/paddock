# Phase 3C.4F.1 — Hybrid Formula & Baseline Finalization Audit Report

**Generated**: 2026-11-05  
**Phase**: Phase 3C.4F.1  
**Status**: COMPLETE (Experimental / Verification Only)  
**Safety Gate**: **PRODUCTION GATE: STRICTLY CLOSED**  

---

## Mandatory Safety & Governance Attestations

> [!IMPORTANT]
> - **PRODUCTION GATE: STRICTLY CLOSED**
> - **No automatic model promotion or production deployment has taken place.**
> - **Model C has NOT been trained or promoted.**
> - Production inference remains strictly bound to frozen Model A (`models/predictor/v1.0.0/trained_models.joblib`).
> - All 2024 and 2025 evaluations are exploratory historical analyses and must not be used for post-hoc hyperparameter optimization.

---

## 1. Executive Summary

Phase 3C.4F.1 establishes the formal mathematical contract, baseline reference standard, and numerical implementation for the experimental hybrid F1 race prediction model based on the empirical findings of Phases 3C.4E.13 through 3C.4E.16.

This phase achieves three core goals:
1. **Reference Baseline Finalization**: Establishes the authoritative reference baseline as the Empirical Grid Baseline trained strictly on 2021–2023 data with Bayesian Laplace smoothing ($\alpha = 1.0$), while retaining the tuned $\alpha = 5.0$ baseline exclusively as an exploratory comparator.
2. **Candidate Hybrid Formula Finalization**: Standardizes on the Bayesian Geometric Evidence Fusion hybrid with blending weight $w = 0.20$, computed strictly in log-space via Log-Sum-Exp normalization to guarantee numerical stability across extreme probability ratios.
3. **Prediction Output Contract**: Formalizes a 16-field machine-readable schema for all future hybrid prediction outputs, verified with complete permutation invariance, variable roster sizing ($N \in [18, 22]$), and fail-safe floor protection ($p_{\text{floor}} = 0.0005$).

---

## 2. Cryptographic Integrity & Working Tree Verification

All four protected historical datasets and frozen model artifacts were cryptographically audited via SHA-256 before and after execution:

| Artifact Name | Expected SHA-256 Digest | Status |
|:---|:---|:---:|
| **Original Dataset** (`data/predictor/f1_race_predictor_dataset.csv`) | `B1F50EF057E5AF732325BB8A784D96B92B34B4441900CEB2A0FD66B579C629AF` | **VERIFIED** |
| **Frozen Model A** (`models/predictor/v1.0.0/trained_models.joblib`) | `D8244024E6B7F0F31912EFE80B35652EF228461955232DDE7E4D65ECCC5779CD` | **VERIFIED** |
| **Remediated Dataset** (`data/predictor/experimental/...remediated.csv`) | `691A19643107241A995D0AF90483A335EC35C47C479A07C447449DEC3F6056FE` | **VERIFIED** |
| **Candidate 2025 Dataset** (`data/predictor/experimental/...2025_candidate.csv`) | `8BADE433D7BE82903B1326D68706C0E4851F80D80DDEC618EFA896E0C6363329` | **VERIFIED** |

All 18 previously modified repository files remain preserved without resets, stashes, or unapproved alterations.

---

## 3. Authoritative Reference Baseline Specification

The reference baseline serves as the benchmark against which all ML models and hybrid combinations are evaluated.

- **Name**: Empirical Grid Baseline (Reference)
- **Version Tag**: `grid-empirical-laplace-a1`
- **Training Window**: Strictly 2021–2023 historical dataset (66 Grand Prix races, 1,319 valid driver starts after filtering `WITHDRAWN_BEFORE_START`).
- **Mathematical Formulation**:
  $$\hat{P}_{\text{raw}}(g) = \frac{\text{wins}(g) + \alpha \cdot p_0}{\text{starts}(g) + \alpha}$$
  where $\alpha = 1.0$ (standard Laplace smoothing) and $p_0 = \frac{1}{\text{median starters}} = \frac{1}{20} = 0.05$.
- **Edge-Case Protections**:
  - Grid positions clamped to physical bounds $[1, 24]$.
  - Pit lane starts assigned default grid position 20.
  - Probability floor: $P(i) \ge 0.0005$.
  - Exact unit simplex normalization: $\sum_{i=1}^N P_i = 1.0$ ($|1.0 - \sum P_i| < 10^{-12}$).
- **Exploratory Alternative**: Tuned Laplace baseline ($\alpha = 5.0$) is retained strictly as an exploratory comparator to assess prior shrinkage sensitivity; it is not the default reference.

---

## 4. Candidate Hybrid Formula & Mathematical Contract

### Primary Candidate: Bayesian Geometric Evidence Fusion
The primary candidate hybrid combines empirical grid prior evidence with machine-learning likelihood:

$$P_{\text{hybrid}}(i) \propto P_{\text{grid}}(i)^{1 - w} \cdot P_{\text{ML}}(i)^w$$

- **Primary Blend Weight**: $w = 0.20$ (derived from 2021–2023 3-fold cross-validation in Phase 14).
- **Log-Space Implementation (Log-Sum-Exp)**:
  To eliminate underflow and overflow when combining probabilities across wide dynamic ranges:
  $$\log \tilde{P}_i = (1 - w) \log P_{\text{grid}}(i) + w \log P_{\text{ML}}(i)$$
  $$\log Z = \operatorname{logsumexp}\left(\{\log \tilde{P}_j\}_{j=1}^N\right)$$
  $$P_{\text{hybrid}}(i) = \exp\left(\log \tilde{P}_i - \log Z\right)$$
- **Exploratory Comparators**:
  - **Convex Linear Ensemble** ($\gamma = 0.20$): $P_{\text{conv}}(i) = (1 - \gamma) P_{\text{grid}}(i) + \gamma P_{\text{ML}}(i)$.
  - **Log-Odds Shrinkage** ($\lambda = 0.25$): $\operatorname{logit}(P_{\text{lo}}(i)) = (1 - \lambda) \operatorname{logit}(P_{\text{grid}}(i)) + \lambda \operatorname{logit}(P_{\text{ML}}(i))$.

---

## 5. Numerical Safety & Invariance Validation

The numerical validation suite in `phase_4f_1_probability_validation.py` subjected `GeometricHybridEngine` to severe adversarial conditions:

| Stress Test | Adversarial Condition | Expected Behavior | Measured Result | Status |
|:---|:---|:---|:---|:---:|
| **Extreme Likelihood Ratio** | $P_{\text{grid}} = 0.9905$ vs $P_{\text{ML}} = 0.0005$ | Zero NaN/Inf, unit simplex error $< 10^{-12}$ | Simplex error $= 0.0$, no NaN/Inf | **PASS** |
| **Degenerate Zero Input** | All zeros passed for input vectors | Graceful fallback to floor and normalization | Simplex error $= 0.0$, uniform fallback | **PASS** |
| **Variable Roster Sizes** | $N \in \{18, 19, 20, 21, 22\}$ starters | Exact unit sum and floor preservation | Simplex error $< 10^{-15}$ across all sizes | **PASS** |
| **Permutation Invariance** | Randomly shuffled driver input rows | Output probabilities invariant to order | Max absolute diff $< 10^{-14}$ | **PASS** |
| **Floor Enforcement** | Severe tail probability dampening | Strictly non-zero probabilities | $\min(P_i) \ge 0.0005$ strictly held | **PASS** |

---

## 6. Prediction Output Contract Specification

All hybrid prediction outputs are guaranteed to follow a strict 16-field contract:

```json
{
  "race_id": "2024_01",
  "season": 2024,
  "round": 1,
  "driver_id": "max_verstappen",
  "driver_name": "VER",
  "grid_position": 1,
  "grid_win_probability": 0.5074,
  "ml_win_probability": 0.4482,
  "hybrid_win_probability": 0.4981,
  "model_version": "v1.0.0-remediated-b",
  "baseline_version": "grid-empirical-laplace-a1",
  "hybrid_formula_version": "geometric-w0.20-v1",
  "prediction_stage": "official_grid",
  "input_hash": "a1b2c3d4e5f67890",
  "generated_at": "2026-11-05T12:50:00.659492+00:00",
  "experimental_status": "EXPERIMENTAL_NON_PRODUCTION"
}
```

Every race prediction response includes top-level diagnostics with explicit attestation tags:
- `diagnostics.production_gate: "STRICTLY CLOSED"`
- `diagnostics.model_c_trained: false`

---

## 7. Historical Holdout Evaluations (Exploratory Only)

> [!NOTE]
> Under the Independent Confirmation Rule, evaluations on the 2024 and 2025 holdouts are strictly exploratory historical comparisons. Because their results were observed during prior research phases, they cannot serve as untouched out-of-sample confirmation or justify post-hoc tuning of $w$.

### 2024 Holdout Season (24 Races, 479 Starters)
*Trained on 2021–2023.*

| Model Configuration | Mean Log Loss | Mean Brier Score | Top-1 Accuracy | Top-1 Hits | Delta vs Ref Baseline (Log Loss) |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Baseline ($\alpha = 1.0$) [REF]** | **1.8535** | **0.7117** | **45.8%** | **11 / 24** | — |
| Baseline ($\alpha = 5.0$) [Exploratory] | 1.7601 | 0.7104 | 45.8% | 11 / 24 | -0.0934 |
| Model B (Remediated Standalone ML) | 2.2911 | 0.8385 | 41.7% | 10 / 24 | +0.4376 |
| **Candidate Geometric Hybrid ($w = 0.20$)** | **1.7722** | **0.6979** | **45.8%** | **11 / 24** | **-0.0813** |
| Convex Ensemble ($\gamma = 0.20$) | 1.8011 | 0.6912 | 45.8% | 11 / 24 | -0.0524 |
| Log-Odds Shrinkage ($\lambda = 0.25$) | 1.7800 | 0.7015 | 45.8% | 11 / 24 | -0.0735 |

### 2025 Holdout Season (24 Races, 480 Starters)
*Trained on 2021–2023.*

| Model Configuration | Mean Log Loss | Mean Brier Score | Top-1 Accuracy | Top-1 Hits | Delta vs Ref Baseline (Log Loss) |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Baseline ($\alpha = 1.0$) [REF]** | **1.1325** | **0.5365** | **66.7%** | **16 / 24** | — |
| Baseline ($\alpha = 5.0$) [Exploratory] | 1.1766 | 0.5450 | 66.7% | 16 / 24 | +0.0441 |
| Model B (Remediated Standalone ML) | 1.1837 | 0.6755 | 66.7% | 16 / 24 | +0.0512 |
| **Candidate Geometric Hybrid ($w = 0.20$)** | **1.0097** | **0.5092** | **66.7%** | **16 / 24** | **-0.1228** |
| Convex Ensemble ($\gamma = 0.20$) | 1.0648 | 0.5252 | 66.7% | 16 / 24 | -0.0677 |
| Log-Odds Shrinkage ($\lambda = 0.25$) | 0.9995 | 0.5162 | 66.7% | 16 / 24 | -0.1330 |

### Key Observations:
1. On both 2024 and 2025 seasons, the **Candidate Geometric Hybrid ($w = 0.20$)** consistently achieves lower Log Loss and lower Brier score than both the Reference Baseline ($\alpha = 1.0$) and standalone Model B.
2. In 2025, the Geometric Hybrid improves log loss by $-0.1228$ and Brier score by $-0.0273$ while maintaining identical Top-1 accuracy ($16/24$).
3. The Geometric Hybrid demonstrates superior tail-risk regularization compared to standalone Model B (avoiding extreme probability penalties).

---

## 8. Verification & Test Suite Execution

The Phase 4F.1 test suite and the entire project regression suite were executed:

1. **Phase 4F.1 Dedicated Unit & Integration Tests**:
   - Command: `pytest tests/test_phase_4f_1.py -v`
   - Results: **9 passed in 17.15s** (100% pass rate).
2. **Full Python Test Suite**:
   - Command: `python -m pytest tests/ -q`
   - Results: **245 passed in 57.16s** (Zero failures, zero errors).
3. **TypeScript / Vitest Regression Suite**:
   - Command: `npm test`
   - Results: **128 passed in 12 test files** (100% pass rate).
4. **TypeScript Compiler Check**:
   - Command: `npx tsc --noEmit`
   - Results: **0 errors** (Clean build).

---

## 9. Recommendation for Phase 3C.4F.2

With the formula contract, reference baseline, numerical safety guarantees, and output schema finalized and frozen:

1. **Advance to Phase 3C.4F.2**: Focus on offline validation, sensitivity sweep documentation across weights $w \in [0.05, 0.35]$, and calibration curve plotting.
2. **Maintain Strict Production Isolation**:
   - Keep the production gate closed (`PRODUCTION GATE: STRICTLY CLOSED`).
   - Do not train Model C or modify the production API routes until all offline validation gates are met.
   - Do not alter the 42-feature production schema or write to Supabase.

