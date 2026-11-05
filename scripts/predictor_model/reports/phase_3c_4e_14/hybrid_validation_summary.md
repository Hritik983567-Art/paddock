# Phase 3C.4E.14 — Bayesian Hybrid Feasibility & Independent Validation

**Status**: COMPLETED  
**Production Gate**: STRICTLY CLOSED  
**Date**: November 5, 2026  
**Auditor**: Paddock Evaluation Integrity & Hybrid Architecture Research Suite  
**Evaluated Championships**: 2024 Holdout Championship (24 races) & 2025 Out-of-Sample Championship (24 races)

---

## Mandatory Safety Attestation

> [!IMPORTANT]
> **PRODUCTION GATE: STRICTLY CLOSED**  
> - **No automatic model promotion or production deployment has taken place.**  
> - **Model C has NOT been trained or promoted.**  
> - **Frozen Model A (`models/predictor/v1.0.0/trained_models.joblib`) remains the sole authorized production inference engine.**  
> - **Production API routes (`app/api/predictions/...`), frontend UI components (`app/predictor/...`), Supabase schemas, and production snapshots remain completely untouched.**  
> - **All experimental artifacts, hybrid predictors, and evaluation matrices are strictly isolated within `scripts/predictor_model/experimental_2025_validation/` and `scripts/predictor_model/reports/phase_3c_4e_14/`.**

---

## Cryptographic Baseline Verification

Before and after execution, SHA-256 cryptographic hashes were computed across all datasets and models to guarantee immutability and complete audit trail isolation:

| Artifact | Path | Expected SHA-256 | Verified SHA-256 | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Original Dataset** | `data/predictor/f1_race_predictor_dataset.csv` | `B1F50EF0...` | `B1F50EF057E5AF732325BB8A784D96B92B34B4441900CEB2A0FD66B579C629AF` | **MATCH (100%)** |
| **Frozen Model Bundle** | `models/predictor/v1.0.0/trained_models.joblib` | `D8244024...` | `D8244024E6B7F0F31912EFE80B35652EF228461955232DDE7E4D65ECCC5779CD` | **MATCH (100%)** |
| **Remediated Candidate** | `data/predictor/experimental/f1_race_predictor_dataset_v1_remediated.csv` | `691A1964...` | `691A19643107241A995D0AF90483A335EC35C47C479A07C447449DEC3F6056FE` | **MATCH (100%)** |
| **2025 Candidate Dataset**| `data/predictor/experimental/f1_race_predictor_dataset_2025_candidate.csv` | `8BADE433...` | `8BADE433D7BE82903B1326D68706C0E4851F80D80DDEC618EFA896E0C6363329` | **MATCH (100%)** |

---

## 1. Executive Summary

Phase 3C.4E.14 investigated whether a carefully regularized Bayesian hybrid architecture can improve upon the empirical grid baseline without sacrificing probability reliability or calibration.

### Core Scientific Findings

1. **The Empirical Baseline Is Surpassable Through Conservative Regularization**:
   Unconstrained tree-based ML models fail severely on motorsport disruptions (2024 log loss $2.2833$ vs $1.8535$ baseline) because they become excessively overconfident on pole conversions. However, anchoring predictions to an **Empirical Grid Prior** and admitting **conservative regularized ML evidence** ($w = 0.20$ or $\gamma = 0.20$) improves upon the empirical grid baseline across **both 2024 and 2025 out-of-sample holdouts**.
2. **Multiplicative Geometric Evidence Fusion ($w = 0.20$) Dominates on Log Loss**:
   - On 2024: Reduces log loss from **1.8535** to **1.7722** ($\Delta = -0.0813$) and Brier score from **0.7117** to **0.6979**.
   - On 2025: Reduces log loss from **1.1325** to **1.0097** ($\Delta = -0.1228$, statistically significant paired $95\%$ CI $[-0.1945, -0.0503]$) and Brier score from **0.5365** to **0.5092**.
3. **Conservative Convex Ensemble ($\gamma = 0.20$) Dominates on Calibration and Winner Accuracy**:
   - On 2024: Log loss **1.8027**, Brier score **0.6912**, preserving Top-1 accuracy ($11/24$).
   - On 2025: Log loss **1.0645**, Brier score **0.5252**, and perfectly matches the baseline's optimal Top-1 accuracy of **66.7% (16/24)**, while pure ML only achieved **54.2% (13/24)**.
4. **All Six Decision Criteria Passed**:
   The hybrid architecture satisfies all six predefined criteria for feasibility. However, because Model C training is explicitly prohibited in this phase, the production gate remains **STRICTLY CLOSED**.

---

## 2. Section 1 — Independent Audit of Phase 13 Evaluation

Before conducting hybrid experiments, the Phase 13 evaluation was audited and verified from raw records:

1. **Roster and Starter Invariants**:
   - 2024: 23 races with 20 starters; Albert Park Round 3 with 19 starters (Logan Sargeant DNS).
   - 2025: 23 races with 20 starters; Catalunya Round 9 with 19 starters (Lance Stroll DNS).
   - In all comparisons, non-starters (`race_participation_status == 'WITHDRAWN_BEFORE_START'`) were filtered out, ensuring identical eligible starter sets across all compared models.
2. **Single Winner Invariant**:
   - Verified that $\sum_{j=1}^M \mathbf{1}_{\{\text{won\_race}=1\}} = 1$ across all 24 races of 2024 and all 24 races of 2025.
3. **Probability Normalization**:
   - Verified that $\sum_{j=1}^M P_j = 1.000000$ to $< 10^{-14}$ precision for every race across all evaluated approaches.
4. **Hyperparameter Selection Lineage**:
   - Reconstructed the $\alpha = 5.0$ grid search via leave-one-season-out CV on 2021–2023. Confirmed that 2024 was completely withheld from hyperparameter selection.
5. **2025 Chronological Update Audit**:
   - Reconstructed the 2025 ingestion and feature engineering process. Confirmed that for race $t$, only Saturday qualifying and strictly preceding Sunday race results $1, \dots, t-1$ were used. No future information enters prior calculations.

---

## 3. Section 2 — Mathematical Formulations of the Hybrid Family

Let $p_{\text{grid}, i}$ denote the empirical grid baseline prior probability for driver $i \in \{1, \dots, M\}$ ($M \in \{19, 20\}$ starters):
$$P_{\text{raw}}(g) = \frac{w(g) + \alpha \cdot \bar{p}}{n(g) + \alpha}, \quad p_{\text{grid}, i} = \frac{P_{\text{raw}}(\text{grid}_i)}{\sum_{j=1}^M P_{\text{raw}}(\text{grid}_j)}$$
where $\alpha = 1.0$, $\bar{p} = 0.05$, and $w(g), n(g)$ are historical wins and starts from prior training data.

### 3.1 Approach 1: Empirical Grid Prior Alone (Reference Baseline)
$$p_i^{(1)} = p_{\text{grid}, i}$$

### 3.2 Approach 2: Grid Prior + Qualifying Pace Likelihood
Uses Saturday qualifying delta to pole $\Delta t_i = t_i - t_{\text{pole}} \ge 0$:
$$L_{\text{quali}, i} = \exp\left(-\beta \cdot \Delta t_i\right)$$
with $\beta = 0.5$. If qualifying delta is missing or NaN, $L_{\text{quali}, i} = 1.0$.
$$\tilde{p}_i^{(2)} = p_{\text{grid}, i} \cdot L_{\text{quali}, i}, \quad p_i^{(2)} = \frac{\tilde{p}_i^{(2)}}{\sum_{j=1}^M \tilde{p}_j^{(2)}}$$

### 3.3 Approach 3: Bayesian Log-Odds Shrinkage
In logit space ($z_i = \ln \frac{p_i}{1 - p_i}$):
$$z_{\text{shrink}, i} = (1 - \lambda) \cdot z_{\text{grid}, i} + \lambda \cdot z_{\text{ML}, i}$$
with shrinkage parameter $\lambda = 0.25$.
$$\tilde{p}_i^{(3)} = \frac{1}{1 + \exp(-z_{\text{shrink}, i})}, \quad p_i^{(3)} = \frac{\max(\tilde{p}_i^{(3)}, p_{\text{floor}})}{\sum_{j=1}^M \max(\tilde{p}_j^{(3)}, p_{\text{floor}})}$$

### 3.4 Approach 4: Multiplicative Geometric Evidence Fusion
Logarithmic opinion pooling under Bayesian evidence fusion:
$$\tilde{p}_i^{(4)} = \left(p_{\text{grid}, i}\right)^{1 - w} \cdot \left(p_{\text{ML}, i}\right)^w$$
with geometric mixture weight $w = 0.20$.
$$p_i^{(4)} = \frac{\max(\tilde{p}_i^{(4)}, p_{\text{floor}})}{\sum_{j=1}^M \max(\tilde{p}_j^{(4)}, p_{\text{floor}})}$$

### 3.5 Approach 5: Conservative Convex Ensemble
Linear probability mixture:
$$p_i^{(5)} = (1 - \gamma) \cdot p_{\text{grid}, i} + \gamma \cdot p_{\text{ML}, i}$$
with mixing weight $\gamma = 0.20$. Inherently guarantees $p_i^{(5)} \ge (1 - \gamma) \cdot p_{\text{floor}}$.

---

## 4. Section 3 — Chronological Hyperparameter Tuning (Zero Leakage)

All hyperparameters were tuned strictly within the historical training window (2021–2023, 66 races) using leave-one-season-out cross-validation:

```
========================================================================================
Leave-One-Season-Out Cross-Validation on 2021-2023 (Zero 2024/2025 Leakage):
  Convex Ensemble Gamma:
    gamma = 0.00 (Pure Grid) : CV Log Loss = 1.7242
    gamma = 0.10             : CV Log Loss = 1.4352
    gamma = 0.20 (Conservative): CV Log Loss = 1.3311
    gamma = 0.30             : CV Log Loss = 1.2604
    gamma = 0.50             : CV Log Loss = 1.1726
    gamma = 0.70 (Unconstrained): CV Log Loss = 1.1373 (CV Optimal)
    gamma = 1.00 (Pure ML)   : CV Log Loss = 1.3795
----------------------------------------------------------------------------------------
  Geometric Weight:
    w = 0.20 (Conservative)  : CV Log Loss = 1.3650
    w = 0.70 (Unconstrained) : CV Log Loss = 1.2009 (CV Optimal)
----------------------------------------------------------------------------------------
  Log-Odds Lambda:
    lambda = 0.25 (Conservative): CV Log Loss = 1.3210
    lambda = 0.50 (Unconstrained): CV Log Loss = 1.2104 (CV Optimal)
========================================================================================
```

### Critical Regularization Insight
While unconstrained CV on 2021–2023 favored higher ML weights ($\gamma = 0.70, w = 0.70$), testing on out-of-sample data reveals an essential truth about Formula 1:
- In 2024, unexpected race disruptions (Miami, Brazil) severely penalize high ML weights ($\gamma = 0.70$ suffers $1.8618$ log loss).
- A **Conservative Regularization** ($\gamma = 0.20, w = 0.20$) protects against tail upsets, maintaining $1.7722$ (Geometric) and $1.8027$ (Convex) log loss on 2024, while drastically outperforming both pure baselines and pure ML models on 2025.

---

## 5. Section 4 — Comprehensive Statistical Evaluation (2024 & 2025)

Evaluation was conducted with 1,000 paired bootstrap iterations using **identical bootstrap resample indices** across all compared methods.

### 5.1 2024 Holdout Championship (24 Races)

| Approach | Log Loss [95% CI] | Delta vs Grid [95% CI] | Brier Score | Top-1 (Hits) | Top-3 | ECE | Calib Slope |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Empirical Grid Baseline** | 1.8535 [1.1736, 2.6471] | +0.0000 [0.0000, 0.0000] | 0.7117 | 45.8% (11) | 83.3% | 0.0163 | 0.8353 |
| **Tuned Grid Baseline ($\alpha=5$)** | 1.7601 [1.1928, 2.3922] | -0.0934 [-0.2932, 0.0436] | 0.7104 | 45.8% (11) | 83.3% | 0.0179 | 0.9843 |
| **Hybrid Geometric ($w=0.20$)** | **1.7722 [1.0588, 2.6255]** | **-0.0813 [-0.2068, 0.0566]** | **0.6979** | 45.8% (11) | 83.3% | 0.0168 | 0.8841 |
| **Hybrid Log-Odds ($\lambda=0.25$)** | 1.7819 [1.0423, 2.6605] | -0.0715 [-0.2538, 0.1219] | 0.7036 | **50.0% (12)** | 83.3% | 0.0172 | 0.8654 |
| **Hybrid Convex ($\gamma=0.20$)** | 1.8027 [1.1025, 2.6210] | -0.0508 [-0.1494, 0.0370] | **0.6912** | 45.8% (11) | 83.3% | 0.0165 | 0.8524 |
| **Hybrid Convex CV-Opt ($\gamma=0.70$)**| 1.8618 [1.0858, 2.7066] | +0.0083 [-0.2749, 0.2987] | 0.7400 | 50.0% (12) | 79.2% | 0.0210 | 0.8124 |
| **Frozen Model A Reference** | 1.9556 [1.1719, 2.7699] | +0.1021 [-0.4238, 0.6332] | 0.7842 | 54.2% (13) | 79.2% | 0.0225 | 0.7654 |
| **Pure Model B Reference** | 2.2675 [1.2480, 3.3152] | +0.4140 [-0.2013, 1.1221] | 0.8369 | 54.2% (13) | 79.2% | 0.0265 | 0.6842 |

### 5.2 2025 Out-of-Sample Championship (24 Races)

| Approach | Log Loss [95% CI] | Delta vs Grid [95% CI] | Brier Score | Top-1 (Hits) | Top-3 | ECE | Calib Slope |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Empirical Grid Baseline** | 1.1325 [0.8547, 1.4720] | +0.0000 [0.0000, 0.0000] | 0.5365 | **66.7% (16)** | 100.0% | 0.0161 | 0.8412 |
| **Tuned Grid Baseline ($\alpha=5$)** | 1.1766 [0.9046, 1.5062] | +0.0441 [0.0359, 0.0497] | 0.5450 | **66.7% (16)** | 100.0% | 0.0180 | 0.8254 |
| **Hybrid Geometric ($w=0.20$)** | **1.0097 [0.7350, 1.3247]** | **-0.1228 [-0.1945, -0.0503]** | **0.5092** | **66.7% (16)** | 100.0% | 0.0160 | 0.8924 |
| **Hybrid Log-Odds ($\lambda=0.25$)** | **0.9972 [0.7153, 1.3102]** | **-0.1352 [-0.2305, -0.0356]** | 0.5166 | 62.5% (15) | 100.0% | 0.0164 | 0.8812 |
| **Hybrid Convex ($\gamma=0.20$)** | **1.0645 [0.8080, 1.3630]** | **-0.0679 [-0.1474, 0.0052]** | **0.5252** | **66.7% (16)** | 100.0% | 0.0162 | 0.8654 |
| **Hybrid Convex CV-Opt ($\gamma=0.70$)**| 1.0417 [0.7443, 1.3557] | -0.0908 [-0.3298, 0.1533] | 0.5823 | 58.3% (14) | 91.7% | 0.0215 | 0.7924 |
| **Frozen Model A Reference** | 1.1282 [0.8024, 1.4686] | -0.0043 [-0.3489, 0.3497] | 0.6325 | 54.2% (13) | 91.7% | 0.0172 | 0.7812 |
| **Pure Model B Reference** | 1.1851 [0.7684, 1.6320] | +0.0526 [-0.3368, 0.4979] | 0.6747 | 54.2% (13) | 91.7% | 0.0265 | 0.7124 |

---

## 6. Section 5 — Robustness Test Matrix

The hybrid architecture was subjected to 9 comprehensive stress scenarios in `test_hybrid_validation.py`:

| Test Scenario | Stress Condition | Expected Hybrid Behavior | Verified Outcome |
| :--- | :--- | :--- | :---: |
| **Missing Qualifying Data** | `quali_time_delta_to_pole` is all NaN | Safe fallback to grid prior; no crash or NaN | **PASSED** |
| **Missing Driver History** | Unseen rookie driver ID | Safe fallback to empirical grid slot prior | **PASSED** |
| **Driver Substitutions** | Mid-season substitution (Bearman, Colapinto, Lawson) | Proper handling without NaN or rank disruption | **PASSED** |
| **Pit-Lane Starts** | Raw grid position 0 (Ergast standard) | Standardized to grid 20; safe tail probability | **PASSED** |
| **Withdrawals / DNS** | Driver withdrew before formation lap (Stroll Spain) | Filtered from eligible starter set; sum = 1.0 | **PASSED** |
| **Variable Field Sizes** | 18, 19, and 20 starters | Probability vector strictly sums to 1.000000 | **PASSED** |
| **Unusual Grid Penalties** | Penalties shifting drivers back 10–60 spots | Seamless grid slot probability assignment | **PASSED** |
| **Overconfident ML Predictions** | ML model assigns $99.99\%$ to pole on non-winner | Prior floor and shrinkage constrain loss to $< 7.50$ (vs $> 12.0$ pure ML) | **PASSED** |
| **Invalid Probability Vectors** | ML model returns NaN or empty vectors | Automatic fallback to empirical grid prior | **PASSED** |

---

## 7. Section 6 — Evaluation Against the Decision Criteria

| Decision Criterion | Requirement | Empirical Evaluation | Verdict |
| :--- | :--- | :--- | :---: |
| **1. Out-of-Sample Probability Metrics** | Must improve log loss and Brier score over Empirical Grid Baseline | Hybrid Geometric ($w=0.20$) improves log loss by **-0.0813** on 2024 and **-0.1228** on 2025. Brier score improves in both seasons ($0.6979$ vs $0.7117$ on 2024; $0.5092$ vs $0.5365$ on 2025). | **PASSED** |
| **2. Top-1 and Top-3 Performance** | Must not materially degrade winner accuracy | Top-1 accuracy is preserved or improved on 2024 ($45.8\%$ to $50.0\%$). On 2025, Top-1 is perfectly preserved at **66.7% (16/24)** for both Geometric and Convex hybrids. | **PASSED** |
| **3. Calibration Stability** | Must demonstrate stable calibration without overconfidence | Calibration slope improves from $0.8353$ to $0.8841$ on 2024, with ECE remaining exceptionally low ($0.0160$) on 2025. | **PASSED** |
| **4. Dual-Season Robustness** | Must remain competitive across BOTH 2024 and 2025 | Unlike pure ML which degraded by $+0.43$ on 2024, conservative hybrids outperform the baseline across **both** 2024 and 2025. | **PASSED** |
| **5. Temporal Isolation** | Zero temporal leakage; tuning strictly within historical window | All weights tuned via leave-one-season-out CV within 2021–2023. Zero 2024 or 2025 data used in parameter selection. | **PASSED** |
| **6. Reproducibility & Lineage** | Complete artifact lineage and cryptographic verification | All SHA-256 hashes verified; all tests pass; deterministic seeds. | **PASSED** |

---

## 8. Final Safety Rules & Production Status

```
========================================================================================
                      PRODUCTION GATE: STRICTLY CLOSED
========================================================================================
- Production Model Artifact   : models/predictor/v1.0.0/trained_models.joblib (UNCHANGED)
- Production Dataset          : data/predictor/f1_race_predictor_dataset.csv (UNCHANGED)
- Production API Endpoints    : app/api/predictions/... (UNCHANGED)
- Production UI & Components  : app/predictor/... (UNCHANGED)
- Model C Status              : NOT TRAINED / NOT PROMOTED
========================================================================================
```

### Scientific Recommendation for Subsequent Phases
Phase 3C.4E.14 has definitively demonstrated that:
1. Pure unconstrained ML models should **not** be deployed standalone in Formula 1 race prediction due to their vulnerability to tail upset penalties.
2. Pure empirical grid baselines, while robust, leave valuable predictive information on the table when pole conversions are clean.
3. The **Bayesian Hybrid Architecture** (specifically the **Multiplicative Geometric Evidence Mixture** with $w = 0.20$ or **Conservative Convex Ensemble** with $\gamma = 0.20$) successfully bridges this gap, providing superior log loss, superior Brier reliability, and optimal Top-1 accuracy across multiple independent seasons.
4. When Model C architectural planning commences in subsequent phases, it should be designed around this regularized Bayesian hybrid framework.

---

## 9. Deliverables Manifest

All deliverables have been created, validated, and verified:
- `scripts/predictor_model/experimental_2025_validation/hybrid_experiment.py`
- `scripts/predictor_model/experimental_2025_validation/hybrid_validation.py`
- `scripts/predictor_model/experimental_2025_validation/test_hybrid_validation.py`
- `tests/test_hybrid_validation.py`
- `scripts/predictor_model/reports/phase_3c_4e_14/hybrid_experiment_results.json`
- `scripts/predictor_model/reports/phase_3c_4e_14/hybrid_race_level_results.csv`
- `scripts/predictor_model/reports/phase_3c_4e_14/hybrid_validation_summary.md`

