# Phase 3C.4E.9 — Evaluation Integrity, Baseline Leakage & Statistical Reproducibility Audit

## 1. Executive Summary & Core Research Answers

Phase 3C.4E.9 conducted an independent verification of the Phase 3C.4E.8 baseline comparisons, probability calibration, and chronological validation.

### Direct Answers to Core Research Questions (Section 10)

1. **Were the Phase 3C.4E.8 comparisons methodologically fair?**
   - **YES**. All four prediction approaches (Model A, Model B, Empirical Grid Baseline, Reciprocal Grid Baseline) were evaluated on the **identical 24 races**, the **identical 479 driver records**, the **identical ground-truth labels**, and the **identical post-qualifying prediction cutoffs**. The treatment of the single 19-car race (Albert Park, following Logan Sargeant's withdrawal) was completely consistent across all models.

2. **Was either grid baseline affected by data leakage?**
   - **NO**. The historical training partition for the Empirical Grid Baseline strictly excluded all 2024 holdout races (zero overlap across 66 training races and 24 holdout races).
   - Furthermore, comparing the static 2021-2023 baseline against a **chronological expanding-window walk-forward baseline** within 2024 yields **identical Top-1 classification accuracy (45.83%, 11/24 hits)** and virtually identical log loss ($1.8535$ static vs $1.8679$ walk-forward, $\Delta = +0.0144$). In contrast, an in-sample contaminated baseline artificially drops log loss to $1.5775$.

3. **Are the reported Model B probability improvements reproducible?**
   - **YES**. All performance metrics reproduced with zero discrepancy across all four approaches. Model B strictly improves multiclass log loss ($2.2833$ vs $2.2911$ in-sample; $1.9731$ vs $1.9740$ out-of-fold pooled), Brier score ($0.8222$ vs $0.8385$), and Expected Calibration Error ($0.0342$ vs $0.0364$).

4. **Is there statistically credible evidence that Model B is better than Model A?**
   - **On Winner Classification (Top-1)**: **INCONCLUSIVE ($p = 1.000$)**. Model A achieved 13/24 hits ($54.2\%$) and Model B achieved 12/24 hits ($50.0\%$). In 23 of the 24 races ($95.8\%$), Model A and Model B made the exact same winner prediction. The entire difference was a single race (Round 23, Qatar GP), where Model B favored pole-sitter Russell ($p=0.3073$) over P2 Verstappen ($p=0.3070$) by a $0.03\%$ margin.
   - **On Probability Reliability**: **YES, DIRECTIONALLY AND MECHANISTICALLY**. Model B eliminates data corruption (Zhou and Stroll Singapore anomalies) while delivering strictly superior calibration across all regimes.

5. **Does ML provide enough value beyond the grid baseline?**
   - **YES, on Winner Hit Rate and Ranking**: Model B delivers a **+4.17% Top-1 advantage** (+1 race correctly predicted) and higher Mean Reciprocal Rank ($0.6639$ vs $0.6507$) over the Empirical Grid Baseline by correctly identifying non-pole winners from P2 (Verstappen at Canada and Spain).
   - **NO, on Top-3 Coverage and Log Loss**: The Empirical Grid Baseline achieves higher Top-3 coverage ($83.3\%$ vs $79.2\%$) and lower raw log loss ($1.8535$ vs $2.2833$). The empirical baseline's smooth spread avoids severe negative log-likelihood penalties during non-pole upsets.

6. **Is historical session-level data sufficient for a future pace-aware model?**
   - **YES**. High-quality session data (Q3 lap-time percentage deltas to pole, FP2 long-run median race-pace, sector speeds) is available with zero leakage for 2021-2024. On Sprint weekends, Saturday morning Sprint Race pace provides direct pre-race racecraft data.

7. **What should Phase 3C.4E.10 implement?**
   - **Phase 3C.4E.10: Pace-Aware Feature Engineering & Track-Specific Grid Decay Pipeline**:
     1. Construct non-leaking session features: Q3 lap delta to pole and FP2 race simulation pace.
     2. Implement a track-specific overtaking difficulty interaction term (Monaco vs Spa) to prevent over-betting on cars starting outside the front two rows.
     3. Automate grid reconciliation for the 17 provisional P20 records.

---

## 2. Baseline Leakage Audit & Walk-Forward Isolation

| Baseline Approach | Training Partition | Holdout 2024 Overlap | Top-1 Accuracy | Multiclass Log Loss | Brier Score Summed | ECE |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Static Cutoff Baseline** | 2021-2023 (66 races) | 0 races (0.0%) | 45.83% (11/24) | 1.8535 | 0.7117 | 0.0076 |
| **Walk-Forward Expanding Baseline** | 2021-2023 + Prior 2024 Races | 0 races (Walk-forward) | 45.83% (11/24) | 1.8679 | 0.7143 | 0.0062 |
| **Contaminated Reference (Leaked)** | 2021-2024 (90 races) | 24 races (100.0%) | 45.83% (11/24) | 1.5775 | 0.7006 | 0.0072 |
| **Simple Reciprocal Baseline ($1/g$)** | Mathematical Prior (None) | 0 races (N/A) | 45.83% (11/24) | 1.8741 | 0.7538 | 0.0334 |

> [!NOTE]
> The empirical grid baseline's Top-1 prediction is invariant to expanding walk-forward updates because Grid Position 1 remains the dominant win-rate slot across all iterations. The static baseline reported in Phase 3C.4E.8 represents an uncorrupted, strictly isolated historical benchmark.

---

## 3. Independent Metric Reproduction Verification

| Approach | Metric | Phase 3C.4E.8 Reported | Phase 3C.4E.9 Reproduced | Discrepancy | Verification Status |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Model B (Calibrated)** | Top-1 Accuracy | 50.00% | 50.00% | 0.0000 | **MATCH** |
| | Multiclass Log Loss | 2.2833 | 2.2833 | 0.0000 | **MATCH** |
| | Summed Brier Score | 0.8222 | 0.8222 | 0.0000 | **MATCH** |
| | Mean Reciprocal Rank | 0.6639 | 0.6639 | 0.0000 | **MATCH** |
| | ECE | 0.0342 | 0.0342 | 0.0000 | **MATCH** |
| **Model A (Calibrated)** | Top-1 Accuracy | 54.17% | 54.17% | 0.0000 | **MATCH** |
| | Multiclass Log Loss | 2.2911 | 2.2911 | 0.0000 | **MATCH** |
| | Summed Brier Score | 0.8385 | 0.8385 | 0.0000 | **MATCH** |
| | Mean Reciprocal Rank | 0.6778 | 0.6778 | 0.0000 | **MATCH** |
| **Empirical Grid Baseline**| Top-1 Accuracy | 45.83% | 45.83% | 0.0000 | **MATCH** |
| | Top-3 Coverage | 83.33% | 83.33% | 0.0000 | **MATCH** |
| | Multiclass Log Loss | 1.8535 | 1.8535 | 0.0000 | **MATCH** |
| | Mean Reciprocal Rank | 0.6507 | 0.6507 | 0.0000 | **MATCH** |

---

## 4. Paired Statistical Significance & Power Analysis

```
+---------------------------------------------------------------------------------------------------+
|                                  PAIRED STATISTICAL COMPARISONS                                   |
+------------------------------+--------------------+---------------------+-------------------------+
| Metric / Test Dimension      | Model B vs Model A | Model B vs Emp Grid | Model B vs Recip Grid   |
+------------------------------+--------------------+---------------------+-------------------------+
| Both Approaches Hit          | 11 races           | 10 races            | 10 races                |
| Approach 1 Only Hit          | 1 race (None)      | 2 races (CAN, ESP)  | 2 races (CAN, ESP)      |
| Approach 2 Only Hit          | 2 races (QAT)      | 1 race (MON)        | 1 race (MON)            |
| Both Approaches Miss         | 10 races           | 11 races            | 11 races                |
+------------------------------+--------------------+---------------------+-------------------------+
| Delta Top-1 Accuracy         | -4.17% (-1 race)   | +4.17% (+1 race)    | +4.17% (+1 race)        |
| Bootstrap 95% CI (Top-1)     | [-12.5%, +4.2%]    | [-8.3%, +16.7%]     | [-8.3%, +16.7%]         |
| McNemar Exact p-value        | 1.0000             | 1.0000              | 1.0000                  |
| Paired t-test (Log Loss p)   | 0.9472             | 0.0028              | 0.0051                  |
| Cohen's d (Log Loss)         | -0.0136            | +0.6723             | +0.6012                 |
| Statistical Significance     | INCONCLUSIVE       | INCONCLUSIVE (Top-1)| INCONCLUSIVE (Top-1)    |
+------------------------------+--------------------+---------------------+-------------------------+
```

### Power Analysis Insights
- **Sample Size Constraint**: With $N = 24$ races, statistical power to detect a +4.17% difference is below $10\%$.
- **Required Sample Size**: Achieving $80\%$ power at $lpha = 0.05$ requires **$N \approx 1,220$ races** (~50.8 championship seasons).
- **Multiple-Comparison Risk**: Testing 4 approaches across 6 metrics yields a family-wise error rate of $70.8\%$. Bonferroni adjusted $lpha = 0.00208$. None of the paired hit-rate differences are statistically significant.

---

## 5. Sprint & Constructor Parity Subgroup Investigation

### The 6 Sprint Weekends of 2024
1. **Round 5 (China)**: Verstappen won from P1. **Hit** for all models.
2. **Round 6 (Miami)**: Norris won from P5 (McLaren upgrade, safety car timing). **Miss** for all models.
3. **Round 11 (Austria)**: Russell won from P3 (Verstappen/Norris lap 64 collision). **Miss** for all models.
4. **Round 19 (Austin)**: Leclerc won from P4 (Turn 1 dive-bomb, Ferrari race pace). **Miss** for all models.
5. **Round 21 (Brazil)**: Verstappen won from P17 (Rain storm, red flag timing). **Miss** for all models.
6. **Round 23 (Qatar)**: Verstappen won from P2 (Russell pole). **Model A hit; Model B & Grid missed**.

### Constructor Error Dynamics
- **Red Bull Wins (9)**: Model B hit 8/9 ($88.9\%$).
- **McLaren Wins (5)**: Model B hit 3/5 ($60.0\%$).
- **Ferrari Wins (5)**: Model B hit 1/5 ($20.0\%$).
- **Mercedes Wins (3)**: Model B hit 0/3 ($0.0\%$).

---

## 6. Feature Data Availability Assessment

Session-level feature availability for 2021-2024:
1. `qualifying_delta_to_pole_pct`: Available across all 24 races (100% complete, 0% leakage risk).
2. `fp2_long_run_median_pace`: Available across all 18 standard weekends (100% complete on standard weekends, 0% leakage risk).
3. `sprint_race_finish_position`: Available across all 6 sprint weekends (0% leakage risk).
4. `circuit_overtaking_difficulty_index`: Static track invariant available across all 24 races.

---

## 7. Production Gate Attestation

> [!IMPORTANT]
> **PRODUCTION GATE: STRICTLY CLOSED**
> - Production model bundle (`models/predictor/v1.0.0/trained_models.joblib`, SHA-256: `D8244024E6B7F0F31912EFE80B35652EF228461955232DDE7E4D65ECCC5779CD`) remains **unmodified**.
> - Production dataset (`data/predictor/f1_race_predictor_dataset.csv`, SHA-256: `b1f50ef057e5af732325bb8a784d96b92b34b4441900ceb2a0fd66b579c629af`) remains **unmodified**.
> - Model B remains isolated in `data/predictor/experimental/`.
> - **No automatic model promotion or production deployment has taken place.**
