# Phase 3C.4E.16 — Statistical Correction, Reproducibility & Prediction-Stage Integrity Audit

## Executive Summary & Audit Verdict

**PRODUCTION GATE: STRICTLY CLOSED**  
**No automatic model promotion or production deployment has taken place.**  
**Model C has NOT been trained or promoted.**

Phase 3C.4E.16 conducted an independent statistical correction, reproducibility audit, feature availability verification, and prediction-stage integrity review of all conclusions, metrics, and contracts produced in Phase 15.

---

## 1. Master Correction Log (Phase 15 -> Phase 16)

The following log details every major conclusion, metric, and contract claim from Phase 15 that has been **RETAINED**, **NARROWED**, or **CORRECTED**:

| Domain | Phase 15 Claim / Reporting | Phase 16 Audit Verdict | Nature of Correction |
| :--- | :--- | :--- | :--- |
| **Multiple Testing (Bonferroni Scale)** | Reported $M=20$ and $\alpha_{\text{Bonf}} = 0.0025$, but in prose called an adjusted $p$-value of $0.0042$ *"significant under Bonferroni $\alpha = 0.0025$"*. | **CORRECTED** | Conflated the adjusted $p$-value scale with the unadjusted threshold scale. On the nominal scale, $p = 0.000207 < 0.0025$. On the adjusted scale, $p_{\text{adj}} = 0.004146 < 0.05$. Both are mathematically equivalent, but comparing $0.0042$ directly to $0.0025$ was invalid. |
| **Multiplicity Significance Counts** | Vaguely claimed Bonferroni & FDR significance without reporting exact counts per test. | **CORRECTED** | Exactly **3 out of 20 tests** achieve Bonferroni and Holm-Bonferroni FWER significance; exactly **5 out of 20 tests** achieve Benjamini-Hochberg FDR significance ($q < 0.05$). |
| **Baseline Discrepancy (Phase 13 vs 14/15)** | Phase 13 reported 2025 baseline log loss of $1.1250$; Phase 14 and 15 reported $1.1325$ without documenting the source of the $0.0075$ difference. | **CORRECTED & RECONCILED** | Fully resolved: Phase 13 fitted the Laplace baseline on 2021–2024 (90 races, 1,800 starts); Phases 14–16 strictly fitted on 2021–2023 (66 races, 1,320 starts) to guarantee zero leakage against Model B. |
| **Temporal Leakage Claims** | Claimed *"Zero temporal leakage verified across all inputs"*. | **NARROWED** | Retrospective mathematical isolation across historical round indices ($R_{\text{prior}} < R$) was verified; however, retrospective CSV extraction from Jolpica/FastF1 does not prove live API latency. Calibrated claim to reflect what was actually tested. |
| **Selection Bias & Prior Selection** | Evaluated Prior $\alpha=5.0$ hybrids alongside Prior $\alpha=1.0$ without noting that Prior $\alpha=5.0$ was introduced post-hoc. | **NARROWED & CLARIFIED** | Formally documented that Prior $\alpha=5.0$ was prompted by inspecting 2024 holdout results. Classified as an exploratory post-hoc refinement; pre-specified status retained only for Prior $\alpha=1.0$ variants ($w=0.20, \gamma=0.20$). |
| **Independent Confirmation Rule** | Acknowledged need for 2026 data, but still referred to results as "confirmed" in section headers. | **CORRECTED** | Under statistical learning theory, holdout-guided exploration disallows claiming independent confirmation. The 2024 and 2025 holdouts represent **promising exploratory evidence**, not an unpolluted confirmation. |
| **Stage A / Stage B CLI Runner** | Implied full dual-stage generation capability across the entire pipeline. | **NARROWED & DEFECT NOTED** | Discovered and documented that while `LiveFeatureBuilder` fully supports both stages, `run_inference_snapshot.py` line 316 rejects `--stage official_grid` with `UNSUPPORTED_STAGE`. |
| **Probability vs Finish Order** | Discussed win-probability ordering as if it represented predicted finishing order. | **CORRECTED** | Re-asserted that win-probability distribution strictly models $P(Y_i = 1)$; it does not model second through twentieth positions, conditional DNF distributions, or race finish order. |
| **Hybrid Baseline Superiority** | Geometric Hybrid ($w=0.20$) achieves lower log loss and Brier score than standalone baselines across 2024 and 2025. | **RETAINED** | Verified 100% reproducible: 2024 Geometric loss $1.7722$ vs $1.8535$ ($\alpha=1$); 2025 Geometric loss $1.0097$ vs $1.1325$ ($\alpha=1$). Under Prior $\alpha=5$, 2024 loss $1.6945$ vs $1.7601$; 2025 loss $1.0399$ vs $1.1766$. |
| **Top-1 Winner Invariance** | Predicted winner is preserved (11/24 in 2024, 16/24 in 2025) with zero flip penalties. | **RETAINED** | Confirmed 100% identical Top-1 accuracy and identical hit counts between baseline and hybrid across all 48 holdout races. |

---

## 2. Protected Cryptographic Baseline Artifacts

All four protected datasets and model bundles were verified via SHA-256 (100% cryptographic match):

| Artifact Path | Expected SHA-256 Hash | Status |
| :--- | :--- | :--- |
| `data/predictor/f1_race_predictor_dataset.csv` | `B1F50EF057E5AF732325BB8A784D96B92B34B4441900CEB2A0FD66B579C629AF` | IMMUTABLE |
| `models/predictor/v1.0.0/trained_models.joblib` | `D8244024E6B7F0F31912EFE80B35652EF228461955232DDE7E4D65ECCC5779CD` | IMMUTABLE |
| `data/predictor/experimental/f1_race_predictor_dataset_v1_remediated.csv` | `691A19643107241A995D0AF90483A335EC35C47C479A07C447449DEC3F6056FE` | IMMUTABLE |
| `data/predictor/experimental/f1_race_predictor_dataset_2025_candidate.csv` | `8BADE433D7BE82903B1326D68706C0E4851F80D80DDEC618EFA896E0C6363329` | IMMUTABLE |

---

## 3. Rigorous Multiple-Testing & Multiplicity Correction ($M = 20$)

### Unravelling the Bonferroni Reporting Ambiguity

In hypothesis testing with family size $M = 20$ and significance level $\alpha = 0.05$:
- **Scale 1 (Nominal Threshold)**: The critical threshold is $\alpha_{\text{adjusted}} = \frac{\alpha}{M} = \frac{0.05}{20} = 0.0025$. A test is significant if nominal $p < 0.0025$.
- **Scale 2 (Adjusted $p$-value)**: The Bonferroni adjusted $p$-value is $p_{\text{adj}} = \min(1.0, M \times p_{\text{nominal}})$. A test is significant if $p_{\text{adj}} < 0.05$.

Phase 15 mistakenly compared the adjusted $p$-value ($0.004146$) to the adjusted threshold ($0.0025$). Phase 16 corrects this mathematically:
- For $H_{2025, \text{geom}, \text{Prior } a=1 \text{ vs } a=5}$:
  - Nominal $p = 0.000207 < 0.0025$ $\implies$ **Significant on Scale 1**.
  - Adjusted $p_{\text{adj}} = 20 \times 0.000207 = 0.004146 < 0.05$ $\implies$ **Significant on Scale 2**.
  - Both scales confirm strict Bonferroni FWER significance.

### Comprehensive 20-Hypothesis Multiplicity Table

| Rank | Hypothesis ID | Season | Hybrid Variant | Baseline Reference | Paired $\Delta$ (Loss) | Nominal $p$ | Bonferroni $p_{\text{adj}}$ | Holm $p_{\text{adj}}$ | BH FDR $q$ | Significant? |
| :---: | :--- | :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **1** | `H_2025_geo_a1_vs_a5` | 2025 | Geometric ($w=0.20$, Prior a=1) | Baseline $\alpha=5$ | -0.1669 | **0.000207** | **0.004146** | **0.004146** | **0.004146** | **Bonferroni, Holm, FDR** |
| **2** | `H_2025_geo_a5_vs_a5` | 2025 | Geometric ($w=0.20$, Prior a=5) | Baseline $\alpha=5$ | -0.1367 | **0.001889** | **0.037790** | **0.035900** | **0.012711** | **Bonferroni, Holm, FDR** |
| **3** | `H_2025_log_a1_vs_a5` | 2025 | Log-Odds ($\lambda=0.25$, Prior a=1)| Baseline $\alpha=5$ | -0.1794 | **0.001907** | **0.038132** | **0.035900** | **0.012711** | **Bonferroni, Holm, FDR** |
| **4** | `H_2025_geo_a1_vs_a1` | 2025 | Geometric ($w=0.20$, Prior a=1) | Baseline $\alpha=1$ | -0.1228 | **0.004644** | 0.092879 | 0.078947 | **0.023220** | **FDR Significant ($q < 0.05$)** |
| **5** | `H_2025_cvx_a1_vs_a5` | 2025 | Convex ($\gamma=0.20$, Prior a=1) | Baseline $\alpha=5$ | -0.1121 | **0.008689** | 0.173776 | 0.139021 | **0.034755** | **FDR Significant ($q < 0.05$)** |
| **6** | `H_2025_log_a1_vs_a1` | 2025 | Log-Odds ($\lambda=0.25$, Prior a=1)| Baseline $\alpha=1$ | -0.1352 | **0.016540** | 0.330797 | 0.248098 | 0.055133 | Nominal only |
| **7** | `H_2025_geo_a5_vs_a1` | 2025 | Geometric ($w=0.20$, Prior a=5) | Baseline $\alpha=1$ | -0.0925 | **0.031586** | 0.631716 | 0.442201 | 0.090245 | Nominal only |
| **8** | `H_2025_cvx_a5_vs_a5` | 2025 | Convex ($\gamma=0.20$, Prior a=5) | Baseline $\alpha=5$ | -0.0772 | 0.075804 | 1.000000 | 0.985458 | 0.189511 | Not significant |
| **9** | `H_2024_cvx_a5_vs_a1` | 2024 | Convex ($\gamma=0.20$, Prior a=5) | Baseline $\alpha=1$ | -0.1237 | 0.081775 | 1.000000 | 0.985458 | 0.189511 | Not significant |
| **10** | `H_2025_cvx_a1_vs_a1` | 2025 | Convex ($\gamma=0.20$, Prior a=1) | Baseline $\alpha=1$ | -0.0679 | 0.093410 | 1.000000 | 1.000000 | 0.189511 | Not significant |
| **11** | `H_2024_geo_a5_vs_a1` | 2024 | Geometric ($w=0.20$, Prior a=5) | Baseline $\alpha=1$ | -0.1590 | 0.104231 | 1.000000 | 1.000000 | 0.189511 | Not significant |
| **12** | `H_2024_cvx_a1_vs_a1` | 2024 | Convex ($\gamma=0.20$, Prior a=1) | Baseline $\alpha=1$ | -0.0508 | 0.126588 | 1.000000 | 1.000000 | 0.210980 | Not significant |
| **13** | `H_2024_geo_a5_vs_a5` | 2024 | Geometric ($w=0.20$, Prior a=5) | Baseline $\alpha=5$ | -0.0656 | 0.143216 | 1.000000 | 1.000000 | 0.220332 | Not significant |
| **14** | `H_2024_log_a1_vs_a1` | 2024 | Log-Odds ($\lambda=0.25$, Prior a=1)| Baseline $\alpha=1$ | -0.0715 | 0.186532 | 1.000000 | 1.000000 | 0.266474 | Not significant |
| **15** | `H_2024_geo_a1_vs_a1` | 2024 | Geometric ($w=0.20$, Prior a=1) | Baseline $\alpha=1$ | -0.0813 | 0.254684 | 1.000000 | 1.000000 | 0.339578 | Not significant |
| **16** | `H_2024_cvx_a5_vs_a5` | 2024 | Convex ($\gamma=0.20$, Prior a=5) | Baseline $\alpha=5$ | -0.0303 | 0.354129 | 1.000000 | 1.000000 | 0.442661 | Not significant |
| **17** | `H_2024_cvx_a1_vs_a5` | 2024 | Convex ($\gamma=0.20$, Prior a=1) | Baseline $\alpha=5$ | +0.0427 | 0.465123 | 1.000000 | 1.000000 | 0.547204 | Not significant |
| **18** | `H_2025_cvx_a5_vs_a1` | 2025 | Convex ($\gamma=0.20$, Prior a=5) | Baseline $\alpha=1$ | -0.0331 | 0.512349 | 1.000000 | 1.000000 | 0.569277 | Not significant |
| **19** | `H_2024_log_a1_vs_a5` | 2024 | Log-Odds ($\lambda=0.25$, Prior a=1)| Baseline $\alpha=5$ | +0.0219 | 0.741289 | 1.000000 | 1.000000 | 0.780304 | Not significant |
| **20** | `H_2024_geo_a1_vs_a5` | 2024 | Geometric ($w=0.20$, Prior a=1) | Baseline $\alpha=5$ | +0.0121 | 0.909624 | 1.000000 | 1.000000 | 0.909624 | Not significant |

### Key Multiplicity Insights

1. **FWER Strict Control (Bonferroni & Holm)**: Exactly **3 tests** pass family-wise error rate control ($p_{\text{adj}} < 0.05$). All three represent 2025 hybrid improvements over Baseline $\alpha=5$.
2. **FDR Positive Regression Control (Benjamini-Hochberg)**: Under PRDS (Positive Regression Dependency on Subsets), which is satisfied because the hybrid models share underlying LightGBM predictions and common races, exactly **5 tests** achieve FDR significance at $q < 0.05$. Crucially, this includes `H_2025_geo_a1_vs_a1` ($q = 0.023220$).
3. **2024 Significance Status**: In 2024, despite directionally consistent improvements (e.g. Geometric $\Delta = -0.0813$ vs $\alpha=1$, and $\Delta = -0.0656$ vs $\alpha=5$), higher race-level variance from extreme upsets prevents achieving formal statistical significance on $N=24$ races.

---

## 4. Reconciled Baseline Metrics & Training Window Lineage

A lingering question across recent phases was the slight metric shift observed for empirical baselines between Phase 13, Phase 14, and Phase 15. The exact root cause has been established:

```
+-------------------------------------------------------------------------------------------------------+
| PHASE 13 vs PHASE 14/15/16 BASELINE RECONCILIATION TABLE                                               |
+-------------------+----------------------------+-----------------------+-------------+----------------+
| Phase             | Baseline Model Name        | Training Window       | 2025 Loss   | 2025 Brier     |
+-------------------+----------------------------+-----------------------+-------------+----------------+
| Phase 13          | empirical_grid_baseline_24 | 2021-2024 (90 races)  | 1.1250      | 0.5423         |
| Phase 14          | empirical_grid_baseline    | 2021-2023 (66 races)  | 1.1325      | 0.5365         |
| Phase 15          | baseline_laplace_alpha_1   | 2021-2023 (66 races)  | 1.1325      | 0.5365         |
| Phase 16 (Audit)  | baseline_laplace_alpha_1   | 2021-2023 (66 races)  | 1.1325      | 0.5365         |
+-------------------+----------------------------+-----------------------+-------------+----------------+
```

### Mathematical Explanation

- In **Phase 13**, the objective was to evaluate whether Model B retrained on 2021–2024 could beat a baseline that also had access to 2021–2024. The baseline trained on 90 races (50 pole wins, $55.56\%$), producing a 2025 log loss of **1.1250**.
- In **Phase 14 and Phase 15**, the objective shifted to evaluating candidate hybrids against Model B trained strictly on 2021–2023. To prevent baseline data leakage, the baseline was frozen to 2021–2023 (66 races, 36 pole wins, $54.55\%$), yielding a 2025 log loss of **1.1325**.
- **Conclusion**: There is zero contradiction or numerical error. Both calculations are 100% mathematically correct under their respective specified training windows.

---

## 5. Selection Bias & Independent Confirmation Rule Audit

### Pre-Specified vs Post-Hoc Exploratory Configurations

1. **Pre-Specified (Phase 14 2021–2023 CV-Derived)**:
   - `hybrid_geo_w020_prior_a1` ($w=0.20$ chosen from training CV loss curve).
   - `hybrid_cvx_g020_prior_a1` ($\gamma=0.20$ chosen from training CV loss curve).
   - `baseline_laplace_alpha_1` (standard Phase 8/9 reference).
2. **Post-Hoc Exploratory Additions (Prompted by Holdout Inspections)**:
   - `hybrid_geo_w020_prior_a5` (introduced in Phase 15 after observing that Baseline $\alpha=5$ outperformed $\alpha=1$ in 2024).
   - `hybrid_cvx_g020_prior_a5` (introduced in Phase 15 for fairness parity).
   - `hybrid_log_odds_lam025_prior_a1` ($\lambda=0.25$ selected after holdout review).
   - Bounded weight sweeps ($w \in \{0.05, 0.10, 0.30, 0.50\}$).

### Binding Ruling under the Independent Confirmation Rule

> **RULING**: Independent Confirmation is **STRICTLY DISALLOWED** for both the 2024 and 2025 datasets.
>
> **Rationale**: Because both datasets were examined repeatedly in earlier phases, and because the formulation of Prior $\alpha=5.0$ hybrids was prompted by holdout performance, these seasons have lost pristine out-of-sample status.
>
> All reported log loss, Brier score, and accuracy metrics for 2024 and 2025 must be formally classified as **PROMISING EXPLORATORY EVIDENCE**. Genuinely independent out-of-sample confirmation requires untouched prospective 2026 Grand Prix data.

---

## 6. Prediction-Stage Integrity & Snapshot Contract Audit

`LiveFeatureBuilder` and `racePredictorService.ts` were audited across Stage A (Saturday provisional) and Stage B (Sunday pre-race):

### Stage Verification Results

1. **Stage A Isolation**:
   - `LiveFeatureBuilder` called with `stage="provisional"` strictly ignores the `starting_grid` session block.
   - For all drivers, `grid_position = quali_position`, `grid_penalty_delta = 0.0`, and `has_penalties_applied = False`.
   - **Verdict**: **PASSED** (zero Stage B data consumed).
2. **Stage B Authoritative Grid & Penalties**:
   - `LiveFeatureBuilder` called with `stage="official_grid"` requires verified starting grid entries marked `is_official: True`.
   - Engine penalties (e.g. Hamilton +5 places $\implies$ P10) and pit lane starts (e.g. Doohan P0 $\implies$ P20) are computed correctly.
   - **Verdict**: **PASSED**.
3. **Stage B Fail-Closed Guarantee**:
   - When `stage="official_grid"` is requested on a race lacking an authoritative starting grid block, `LiveFeatureBuilder` raises `LiveFeatureBuilderError("OFFICIAL_GRID_UNAVAILABLE")`.
   - It strictly does **NOT** silently fall back to provisional qualifying data.
   - **Verdict**: **PASSED**.
4. **Deterministic Snapshot Precedence**:
   - In `racePredictorService.ts`, `compareSnapshotPrecedence` deterministically sorts `official_grid` ahead of `provisional`.
   - **Verdict**: **PASSED**.

### Identified Pipeline Defect & Proposed Fix

- **Component**: `scripts/predictor_pipeline/run_inference_snapshot.py`
- **Defect**: Line 316 rejects `--stage official_grid` with `SnapshotValidationError("UNSUPPORTED_STAGE")`. As a result, the CLI snapshot generator can currently only emit Stage A provisional snapshots.
- **Proposed Minimal Fix**: Update argument validation in `run_inference_snapshot.py` to allow `--stage official_grid`, wire it to Stage B `LiveFeatureBuilder`, and validate `hasPenaltiesApplied: True`. *(Note: In accordance with Phase 16 restrictions, this change is documented for future implementation and was not applied to production code).*

---

## 7. Probability Metric Interpretation

To prevent misinterpretation in governance reviews, Phase 16 enforces the following definitions:

1. **Log Loss Improvement ($\Delta < 0$)**: Measures superior calibrated probability mass assigned to the true winning driver. It does **not** imply that more race winners were correctly identified in rank 1.
2. **Brier Score Improvement ($\Delta < 0$)**: Measures reduced squared probability error across all $K$ starters on the probability simplex.
3. **Top-1 Winner Accuracy**: The proportion of races where $\arg\max_i P_i$ won. The hybrid maintains identical Top-1 accuracy to the baseline (11/24 in 2024, 16/24 in 2025). The hybrid's advantage lies in probability refinement, not Top-1 classification accuracy.
4. **Win-Probability Ranking vs Finishing Order**: A win probability vector $(P_1, \dots, P_K)$ represents the likelihood of finishing P1. It does **not** predict P2 through P20 finish positions, which require a joint multi-position or Plackett-Luce ranking model.

---

## 8. Verification & Regression Test Status

- **Phase 16 Unit & Contract Test Suite**: **8 passed** in 7.38s (`pytest tests/test_phase_16_audit.py`).
- **Full Python Pytest Suite**: **236 passed** in 56.12s (`pytest tests/ -q`).
- **Full Vitest TypeScript Suite**: **128 passed** in 41.80s (`npm test`).
- **TypeScript Compiler Check**: **0 errors** (`npx tsc --noEmit`).
- **Protected SHA-256 Hashes**: 100% match across all 4 datasets and frozen model files.
- **Git Status**: All 18 pre-existing user-modified files preserved untouched.

---

## 9. Final Recommendation & Architecture Outlook

1. **Model C Status**: Model C has **NOT** been trained, promoted, or deployed.
2. **Production Gate**: **STRICTLY CLOSED**. Production inference remains wired to frozen Model A (`models/predictor/v1.0.0/trained_models.joblib`).
3. **Recommended Next Step**:
   - Do **NOT** promote any hybrid model based on 2024/2025 retrospective results.
   - Maintain the experimental Bayesian Geometric Hybrid ($w = 0.20$, Prior $\alpha = 5.0$ or walk-forward) as the primary candidate architecture.
   - Establish a pristine, prospective shadow pipeline to evaluate 2026 Grand Prix events in real time under true untouched out-of-sample conditions.

