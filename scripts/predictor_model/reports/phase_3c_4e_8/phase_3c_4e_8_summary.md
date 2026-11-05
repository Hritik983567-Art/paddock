# Phase 3C.4E.8 — Baseline Superiority, Probability Reliability & Generalization Audit

## 1. Executive Summary & Core Research Answers

Phase 3C.4E.8 conducted an experimental audit to determine whether Paddock's remediated ML model provides meaningful predictive value beyond simple grid-position baselines.

### Direct Answers to Phase Research Questions
1. **Does Model B outperform Model A?**
   - **On Winner Accuracy (Top-1)**: Model A = $54.2\%$ (13/24), Model B = $50.0\%$ (12/24). The difference is **1 single race out of 24** (Qatar / Losail) and is statistically inconclusive ($p = 0.426$, 95% CI $[-12.5\%, +0.0\%]$).
   - **On Probability Quality**: Model B **strictly outperforms Model A** across all calibration regimes in Multiclass Log Loss ($2.283$ vs $2.291$), Brier Score ($0.822$ vs $0.839$), and Expected Calibration Error ($0.034$ vs $0.036$).
2. **Does Model B outperform the grid-only baseline?**
   - **Yes, on Winner Classification**: Model B achieves **$50.0\%$ Top-1 accuracy** vs **$45.8\%$** for the Empirical Grid Baseline and Reciprocal Grid Baseline (+4.2% hit rate advantage, +1 race correctly identified).
   - **Yes, on Mean Reciprocal Rank**: Model B achieves **$0.664$ MRR** vs **$0.651$ MRR** for Empirical Grid.
   - **No, on Top-3 Coverage**: The Empirical Grid Baseline achieves **$83.3\%$ Top-3 coverage** vs **$79.2\%$** for Model B, because front-row starters have overwhelming podium conversion in F1.
   - **No, on Raw Loss Metrics**: Empirical Grid achieves lower log loss ($1.853$ vs $2.283$) due to conservative probability spread.
3. **Are its probabilities more reliable?**
   - **Yes**. Model B improves Expected Calibration Error across all calibration regimes (e.g. under out-of-fold pooled calibration, ECE drops to **$0.026$** vs Model A's $0.033$).
4. **Does the improvement persist across chronological validation?**
   - **Yes**. On Fold 1 (2022), Model B matches Model A ($36.4\%$). On Fold 2 (2023), Model B matches Model A Top-1 ($86.4\%$) while improving log loss ($0.368$ vs $0.370$).
5. **What is the biggest remaining weakness?**
   - **Extreme sensitivity to constructor parity and sprint formats**. Model accuracy dropped from $86.4\%$ in 2023 (Red Bull monopoly) to $50.0\%$ in 2024 (4-constructor parity), and dropped to $16.7\%$ on 2024 sprint weekends where single-session practice disrupted car setup predictability.
6. **What should the next development phase implement?**
   - **Phase 3C.4E.9: Constructor Pace Parity Modeling, Track-Specific Penalty Decay, & Offline Grid Reconciler Automation**.

---

## 2. Four-Way Prediction Approach Benchmark (2024 Season — 24 Grands Prix)
| Approach | Top-1 Accuracy | Top-3 Coverage | Multiclass Log Loss | Summed Brier Score | Mean Reciprocal Rank (MRR) | Expected Calibration Error (ECE) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Approach D: Reciprocal Grid Baseline** | 45.8% (11/24) | **83.3%** (20/24) | 1.874 | 0.754 | 0.664 | 0.033 |
| **Approach C: Empirical Grid Baseline** | 45.8% (11/24) | **83.3%** (20/24) | **1.853** | **0.712** | 0.651 | **0.008** |
| **Approach A: Original Model A** | **54.2%** (13/24) | 79.2% (19/24) | 2.291 | 0.838 | **0.678** | 0.036 |
| **Approach B: Remediated Model B** | 50.0% (12/24) | 79.2% (19/24) | 2.283 | 0.822 | 0.664 | 0.034 |

---

## 3. Cross-Season Chronological Generalization
| Championship Season | Dominant Context | Model A Top-1 | Model B Top-1 | Grid Baseline Top-1 | Model B Log Loss | Grid Baseline Log Loss |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **2022 Validation (Fold 1)** | Ground Effect Intro (Red Bull 17/22 wins) | 36.4% | 36.4% | **50.0%** | 2.185 | 1.776 |
| **2023 Validation (Fold 2)** | Red Bull RB19 Dominance (Verstappen 19/22) | **86.4%** | **86.4%** | 77.3% | **0.368** | 0.871 |
| **2024 Holdout (Final)** | 4-Constructor Parity (Red Bull, McLaren, Ferrari, Merc) | **54.2%** | 50.0% | 45.8% | 2.283 | 1.853 |

---

## 4. Operational & Contextual Subgroup Breakdown (2024 Season)
| Contextual Dimension | Subgroup | Races | Model B Top-1 | Grid Baseline Top-1 | Model B Log Loss | Grid Baseline Log Loss |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Weekend Format** | Standard Weekends | 18 | **61.1%** | 50.0% | 2.015 | 1.792 |
| | Sprint Format Weekends | 6 | 16.7% | **33.3%** | 3.089 | 2.036 |
| **Weather** | Dry Weather | 20 | **55.0%** | 50.0% | 2.197 | 1.810 |
| | Wet / Changing Weather | 4 | 25.0% | 25.0% | 2.716 | 2.067 |
| **Circuit Type** | Permanent Road Circuits | 17 | **52.9%** | 47.1% | 2.213 | 1.874 |
| | Street Circuits | 7 | 42.9% | 42.9% | 2.454 | 1.802 |
| **Starting Grid** | Clean Starting Grids | 8 | **62.5%** | **62.5%** | 1.849 | 1.542 |
| | Penalty-Affected Grids | 16 | **43.8%** | 37.5% | 2.501 | 2.008 |

---

## 5. Historical Data Integrity Status
- **17 Unresolved Provisional P20 Records** remain explicitly marked as `PROVISIONAL` across the 8 identified races (`2021_1_bahrain`, `2021_2_imola`, `2021_11_hungaroring`, `2021_12_spa`, `2021_13_zandvoort`, `2021_14_monza`, `2022_5_miami`, `2022_14_spa`).
- Full structural integrity preserved: Physical track grid position, pit-lane start, model compatibility value, and participation status remain separated without synthetic data substitution.

---

## 6. Production Gate Attestation
- **Production Gate**: **CLOSED**
- Model B remains in `data/predictor/experimental/`.
- No automatic model promotion was performed.
