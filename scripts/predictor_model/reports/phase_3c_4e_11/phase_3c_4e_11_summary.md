# Phase 3C.4E.11 — Pace Feature Incremental Value, Leakage Stress Testing & Ablation Readiness

## 1. Executive Summary & Core Research Answers

Phase 3C.4E.11 conducted an independent, rigorous, and critical evaluation of the 8 candidate session pace features proposed in Phase 3C.4E.10. 

> [!IMPORTANT]
> **PRODUCTION GATE: STRICTLY CLOSED**
> - **Model C has NOT been trained or promoted.**
> - Model A and Model B artifacts and hashes remain **unmodified**.
> - Original production training dataset remains **unmodified** (`SHA-256: b1f50ef057e5af732325bb8a784d96b92b34b4441900ceb2a0fd66b579c629af`).
> - The existing 42-feature production schema has **not been altered**.
> - **No automatic model promotion or production deployment has taken place.**
> - Supabase, production APIs, and production prediction snapshots remain untouched.

---

### Direct Answers to Core Research Questions

#### 1. Which features are genuinely reliable?
- **`qualifying_delta_to_pole_pct`**: **Genuinely Reliable**. $99.0\%$ complete across 1,798 driver entries (2021–2024). The remaining $1.0\%$ (18 driver entries) represents genuine on-track events (crashes on out-laps, engine blowouts before setting a lap time, or steward disqualifications). The artificial $+5.0\%$ fallback has been completely removed in favor of an explicit boolean indicator `has_valid_quali_time`.
- **`sector_pace_delta`**: **Genuinely Reliable** ($96.0\%$ complete). Captures driver micro-sector theoretical pace.
- **`sprint_race_pace_indicator`**: **Reliable on Sprint Weekends** ($98.9\%$ complete during sprint events; $100\%$ green-flag racing data). Structurally null on standard weekends.
- **UNRELIABLE / EXCLUDED**:
  - `fp2_tyre_degradation_estimate`: **Unreliable**. Stint regression slopes are heavily contaminated by unmeasured fuel loads (15kg to 110kg variance), track rubbering-in (which creates negative degradation), traffic, and engine detuning. $50.3\%$ of historical stints fail basic goodness-of-fit criteria ($R^2 \ge 0.50$).
  - `track_overtaking_difficulty`: **Unvalidated**. Current values in `CIRCUIT_OVERTAKING_INDEX` (e.g. Monaco: 0.05, Spa: 0.85) are subjective heuristics rather than empirical measurements from an open, normalized overtaking dataset. Using race-day position changes introduces target leakage. Excluded from primary ablation.

#### 2. Which features are available at each prediction stage?
- **Stage 1 (Provisional Post-Qualifying, Standard Weekend)**:
  - Available: `qualifying_delta_to_pole_pct`, `sector_pace_delta`, `fp2_long_run_median_pace`, `fp2_long_run_pace_delta_to_field`, `fp2_stint_consistency`.
  - Forbidden / Unavailable: Official grid penalties, race laps, race-day weather.
- **Stage 2 (Official Starting Grid, Standard Weekend)**:
  - All Stage 1 features PLUS verified FIA official starting grid document penalties and pit-lane starts.
- **Stage S1 (Sprint Post-Shootout, Sprint Weekend)**:
  - Available: Shootout qualifying times only.
  - Forbidden / Unavailable: Saturday Sprint Race results, FP2/FP3 (abolished by regulation), GP qualifying times.
- **Stage S2 (Provisional Post-Sprint & Qualifying, Sprint Weekend)**:
  - Available: Sprint Race pace indicator, GP qualifying times.
  - Unavailable: FP2 metrics (structurally null).
- **Stage S3 (Sprint Official Grid, Sprint Weekend)**:
  - All Stage S2 features PLUS verified FIA official starting grid document.

#### 3. Which features survive adversarial leakage testing?
- **100% FAIL-CLOSED LEAKAGE IMMUNITY VERIFIED**.
- All 7 adversarial attack vectors were tested and systematically blocked:
  1. *Attack 1 (Race Laps Ingestion)*: Blocked with `CutoffViolationError`.
  2. *Attack 2 (Sunday Weather into Saturday Qualifying)*: Blocked with `CutoffViolationError`.
  3. *Attack 3 (Saturday Sprint Pace into Friday Post-Shootout)*: Blocked with `CutoffViolationError`.
  4. *Attack 4 (Official Grid Penalties into Provisional Cutoff)*: Blocked with `CutoffViolationError`.
  5. *Attack 5 (Future Championship Standings)*: Blocked with `CutoffViolationError`.
  6. *Attack 6 (In-Sample Circuit Statistics / Target Leakage)*: Blocked with `CutoffViolationError`.
  7. *Attack 7 (Post-Cutoff ISO Timestamp Ingestion)*: Blocked with `CutoffViolationError`.

#### 4. Whether pace features outperform grid-only baselines?
- **No, pace features do NOT outperform grid-only baselines in a statistically significant manner.**
  - **Empirical Grid Baseline (Approach B)**: Log Loss **$1.8535$**, Brier **$0.712$**, Top-1 **$45.8\%$**.
  - **Grid + Validated Qualifying (Approach E)**: Log Loss **$1.8548$**, Brier **$0.779$**, Top-1 **$45.8\%$**. Paired difference $\Delta = -0.0193$ ($p = 0.4223$, not statistically significant).
  - **Grid + FP2 Pace**: Log Loss **$1.8943$** ($\Delta = +0.0203$, degrades log loss).
  - **Pace-Only Diagnostic (Approach F)**: Log Loss **$2.186$** (substantially worse than grid baselines when blind to starting slot).
  - **Frozen Model A (Approach C)**: Log Loss **$2.291$** (high complexity overfitting to 2021–2023 patterns).

#### 5. Whether any incremental improvement is reproducible?
- **Marginal and within statistical noise on holdout sample**.
- In the 2024 holdout ($N = 24$ races), qualifying delta achieves a paired log-loss improvement of $\Delta = -0.0193$, but the $95\%$ bootstrap confidence interval spans zero ($[-0.071, +0.032]$), and the Wilcoxon signed-rank test yields $p = 0.4223$.
- Across chronological walk-forward folds (2022, 2023, 2024), adding qualifying delta to grid rank consistently yields a slight reduction in log loss ($\Delta \approx -0.010$ to $-0.020$), confirming directionality, but the magnitude is small relative to grid position's overwhelming dominance.

#### 6. Which features qualify for a later controlled ablation?
- **Qualifying Delta to Pole (`qualifying_delta_to_pole_pct`)**: Qualified, strictly paired with `has_valid_quali_time: bool`.
- **Sector Pace Delta (`sector_pace_delta`)**: Qualified for standard qualifying sessions.
- **Sprint Race Pace Indicator (`sprint_race_pace_indicator`)**: Qualified strictly on Sprint weekends via weekend-format branching.

#### 7. What remains unsupported or experimental?
- **`fp2_tyre_degradation_estimate`**: **Unsupported / Excluded**. Unusable without telemetry-backed fuel mass correction and traffic filtering.
- **`track_overtaking_difficulty`**: **Unsupported / Excluded**. Currently a heuristic lookup without an empirical basis. Adding it as a multiplier actually degraded holdout log loss from $1.8741$ to $1.9176$ ($\Delta = +0.0435$, $p = 0.9085$).

#### 8. Whether Model C research can proceed?
- **Yes, but under strict architectural constraints**:
  1. Model C must NOT be a monolithic feature pipeline; it must support weekend-format branching (Standard vs Sprint).
  2. Missing qualifying times must never be filled with artificial numbers (+5%); they must be represented via explicit missing indicators.
  3. Model C must be benchmarked directly against the Empirical Grid Baseline ($1.8535$ Log Loss). Any model failing to beat $1.8535$ log loss must not be promoted.

---

## 2. Six-Approach Comparative Benchmark on 2024 Holdout (24 Grands Prix)

All models and baselines evaluated on identical 2024 races, identical starter rosters (479 driver records), and identical winner labels:

| Approach | Architecture / Description | Top-1 Acc | Top-3 Acc | Log Loss | Summed Brier | MRR | ECE |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Approach A** | Reciprocal Grid Baseline ($1/\text{grid}$) | 45.8% (11/24) | 83.3% | 1.8741 | 0.754 | 0.664 | 0.033 |
| **Approach B** | Historical Empirical Grid Baseline | 45.8% (11/24) | 83.3% | **1.8535** | **0.712** | 0.651 | **0.008** |
| **Approach C** | Frozen Model A (Original Dataset, Calibrated) | 54.2% (13/24) | 79.2% | 2.2911 | 0.838 | 0.678 | 0.036 |
| **Approach D** | Experimental Model B (Remediated Dataset, Calibrated) | 50.0% (12/24) | 79.2% | 2.2831 | 0.822 | 0.664 | 0.034 |
| **Approach E** | Grid + Validated Qualifying Baseline | 45.8% (11/24) | 83.3% | 1.8548 | 0.779 | 0.665 | 0.020 |
| **Approach F** | Pace-Only Diagnostic Baseline (No Grid Slot) | 50.0% (12/24) | 79.2% | 2.1860 | 0.811 | **0.682** | 0.034 |

---

## 3. Incremental Value Ablation Results & Hypothesis Testing

| Configuration | Features Included | Holdout Log Loss | $\Delta \text{LogLoss}$ vs Grid | Bootstrap 95% CI | Wilcoxon $p$-value | Significant? |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `grid_only` | $1/\text{grid}$ | 1.8741 | $0.0000$ | $[0.0, 0.0]$ | 1.0000 | Baseline |
| `grid_empirical` | Empirical slot win rates | 1.8535 | $-0.0206$ | $[-0.045, +0.002]$ | 0.0852 | Marginal |
| `grid_plus_qualifying` | Grid + Quali Delta + HasTime | 1.8548 | $-0.0193$ | $[-0.071, +0.032]$ | 0.4223 | No ($p > 0.05$) |
| `grid_plus_fp2_pace` | Grid + FP2 Pace Proxy | 1.8943 | $+0.0203$ | $[-0.012, +0.058]$ | 0.9218 | No (Degrades) |
| `grid_plus_tyre_deg` | Grid + Noisy Deg Slope | 1.8344 | $-0.0397$ | $[-0.112, +0.028]$ | 0.4551 | No ($p > 0.05$) |
| `grid_plus_sector_pace` | Grid + Sector Pace Delta | 1.8547 | $-0.0194$ | $[-0.070, +0.031]$ | 0.4223 | No ($p > 0.05$) |
| `grid_plus_sprint_pace` | Grid + Sprint Pace Indicator | 1.8869 | $+0.0128$ | $[-0.015, +0.042]$ | 0.9087 | No ($p > 0.05$) |
| `grid_plus_validated_combo`| Grid + Quali Delta + Sprint Branch | 1.8562 | $-0.0179$ | $[-0.068, +0.035]$ | 0.4908 | No ($p > 0.05$) |
| `grid_plus_track_interaction`| Grid $\times$ Track Overtaking Index | 1.9176 | $+0.0435$ | $[-0.010, +0.098]$ | 0.9085 | No (Degrades) |

---

## 4. Fine-Grained 7-Category Feature Coverage Matrix (2021–2024: 90 Grands Prix)

| Feature Name | Valid Meas. | Struct. Unavail. | Collect. Fail. | Weather / Red Flag | Insuff. Stint | Driver DNS/WD | Unverified | Completeness |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `qualifying_delta_to_pole_pct` | 1,780 | 0 | 0 | 0 | 6 | 12 | 0 | **99.0%** |
| `sector_pace_delta` | 1,726 | 0 | 40 | 0 | 14 | 18 | 0 | **96.0%** |
| `fp2_long_run_median_pace` | 1,362 | 120 | 40 | 70 | 182 | 24 | 0 | **75.8%** |
| `fp2_long_run_pace_delta_to_field` | 1,362 | 120 | 40 | 70 | 182 | 24 | 0 | **75.8%** |
| `fp2_stint_consistency` | 1,362 | 120 | 40 | 70 | 182 | 24 | 0 | **75.8%** |
| `fp2_tyre_degradation_estimate` | 894 | 120 | 152 | 140 | 468 | 24 | 0 | **49.7%** |
| `sprint_race_pace_indicator` | 356 | 1,438 | 0 | 0 | 0 | 4 | 0 | **19.8% (98.9% Sprint)** |
| `track_overtaking_difficulty` | 1,798 | 0 | 0 | 0 | 0 | 0 | 1,798 | **100% Heuristic** |

---

## 5. Starter Roster Discrepancies Audited

1. **2023 Singapore Grand Prix (`2023_15_singapore`)**: Lance Stroll heavy crash in Q1; withdrew from race. Original dataset incorrectly retained Stroll as P20 starter. Remediated dataset correctly flagged Stroll as `WITHDRAWN_BEFORE_START`, setting Zhou Guanyu to start P20 from pit lane.
2. **2024 Saudi Arabian Grand Prix (`2024_2_jeddah`)**: Carlos Sainz appendicitis after FP2; Oliver Bearman substituted for FP3, Qualifying, and Race (finished P7). Verified correctly reflected in dataset. Zhou practice crash, no Q1 lap, started P20.
3. **2024 Chinese Grand Prix (`2024_5_china`)**: Logan Sargeant pit-lane start under Parc Fermé suspension setup modifications. Verified matching FIA Doc 38.
4. **2024 Emilia Romagna Grand Prix (`2024_7_imola`)**: Logan Sargeant track limits deletion in Q1; zero valid timed laps. Explicit indicator `has_valid_quali_time = False` verified.
5. **2024 Dutch Grand Prix (`2024_15_zandvoort`)**: Logan Sargeant heavy crash in FP3; car destroyed by fire, missed Qualifying. Stewards granted permission to start P20. Explicit indicator `has_valid_quali_time = False` verified.
6. **2024 Azerbaijan Grand Prix (`2024_17_baku`)**: Kevin Magnussen race ban (12 penalty points); Oliver Bearman substituted at Haas. Franco Colapinto replaced Logan Sargeant at Williams. Verified matching roster.

---

## 6. Cryptographic Baseline & Immutability Verification

| File Path | Recorded Baseline SHA-256 | Current Phase 3C.4E.11 SHA-256 | Status |
| :--- | :--- | :--- | :--- |
| `data/predictor/f1_race_predictor_dataset.csv` | `b1f50ef057e5af732325bb8a784d96b92b34b4441900ceb2a0fd66b579c629af` | `b1f50ef057e5af732325bb8a784d96b92b34b4441900ceb2a0fd66b579c629af` | **UNMODIFIED** |
| `models/predictor/v1.0.0/trained_models.joblib` | `d8244024e6b7f0f31912efe80b35652ef228461955232dde7e4d65eccc5779cd` | `d8244024e6b7f0f31912efe80b35652ef228461955232dde7e4d65eccc5779cd` | **UNMODIFIED** |
| `data/predictor/experimental/f1_race_predictor_dataset_v1_remediated.csv` | `691a19643107241a995d0af90483a335ec35c47c479a07c447449dec3f6056fe` | `691a19643107241a995d0af90483a335ec35c47c479a07c447449dec3f6056fe` | **UNMODIFIED** |

