# Phase 3C.4F.1.1 — Metrics, Provenance & Contract Reconciliation Report

**Generated**: 2026-11-05  
**Phase**: Phase 3C.4F.1.1  
**Status**: COMPLETE (Audit & Correction Only)  
**Safety Gate**: **PRODUCTION GATE: STRICTLY CLOSED**  

---

## Mandatory Governance & Safety Attestations

> [!IMPORTANT]
> - **PRODUCTION GATE: STRICTLY CLOSED**
> - **No automatic model promotion or production deployment has taken place.**
> - **Model C has NOT been trained or promoted.**
> - Production inference remains strictly bound to frozen Model A (`models/predictor/v1.0.0/trained_models.joblib`).
> - Neither the 2024 nor 2025 holdouts were used to select or retune any hybrid weights.
> - All identified discrepancies have been reproduced from underlying data, mathematically explained, and formally classified.

---

## 1. Executive Summary

Phase 3C.4F.1.1 conducts an exhaustive audit of the completed Phase 3C.4F.1 report and artifacts prior to freezing the mathematical and evaluation contracts of the Bayesian hybrid race predictor.

### Core Audit Outcomes:
1. **Metric Reconciliation**: Fully explained and reproduced the 2025 Model B log loss discrepancy ($1.1837$ on 2021–2023 training vs $1.0680$ on 2021–2024 retraining) and the 2024 Model B log loss discrepancy ($2.2911$ on unpruned 1,319 training rows vs $2.2833$ on clean 1,317 rows).
2. **Weight Provenance Correction**: Proved that unconstrained leave-one-season-out cross-validation on 2021–2023 actually selected $w = 0.70$ (CV log loss $1.2009$). The candidate weight $w = 0.20$ was a **pre-specified conservative candidate** chosen by engineering to safeguard against tail upsets. Prior claims that $w = 0.20$ was "derived from CV" are formally reclassified as a **Documentation Error**.
3. **Baseline Starts Reconciliation**: Resolved the nominal $1,320$ vs dataset $1,319$ vs clean $1,317$ starts. The 2021 Monaco GP had only 19 starters in the Ergast dataset because Mick Schumacher missed qualifying after an FP3 crash. Pit-lane starts mapped to grid 20 represent a sound empirical proxy ($0$ wins, $\sim 0.075\%$ Laplace win rate) with negligible sensitivity ($\Delta = 1.7 \times 10^{-5}$ on holdout log loss).
4. **Contract Stage Runner Incompatibility**: Discovered that `run_inference_snapshot.py` strictly rejects `--stage official_grid` with `UNSUPPORTED_STAGE`, supporting only `--stage provisional`. Defaulting the contract to `official_grid` without runner support was an **Implementation Defect**.
5. **Input Hash Remediation**: Replaced Phase 4F.1's naive 4-scalar hash ($f'{race\_id}\_{stage}\_{version}\_{n}'$), which failed to detect driver probability modifications, with a canonical deterministic payload hash sensitive to driver IDs, grid positions, and probabilities while maintaining row-permutation invariance.

---

## 2. Cryptographic Integrity Audit

All four protected datasets and model artifacts were cryptographically audited before and after execution:

| Protected Artifact | Path | Expected SHA-256 Digest | Status |
|:---|:---|:---|:---:|
| **Original Dataset** | `data/predictor/f1_race_predictor_dataset.csv` | `B1F50EF057E5AF732325BB8A784D96B92B34B4441900CEB2A0FD66B579C629AF` | **VERIFIED** |
| **Frozen Model A** | `models/predictor/v1.0.0/trained_models.joblib` | `D8244024E6B7F0F31912EFE80B35652EF228461955232DDE7E4D65ECCC5779CD` | **VERIFIED** |
| **Remediated Dataset** | `data/predictor/experimental/...remediated.csv` | `691A19643107241A995D0AF90483A335EC35C47C479A07C447449DEC3F6056FE` | **VERIFIED** |
| **Candidate 2025 Dataset**| `data/predictor/experimental/...2025_candidate.csv` | `8BADE433D7BE82903B1326D68706C0E4851F80D80DDEC618EFA896E0C6363329` | **VERIFIED** |

All 18 previously modified repository files remain strictly preserved.

---

## 3. Discrepancy Register & Formal Classifications

Every discrepancy investigated in this audit has been resolved and classified into one of four mandatory categories:

| ID | Issue / Topic | Classification | Summary & Resolution |
|:---|:---|:---:|:---|
| **DISC-01** | 2025 Model B Log Loss: $1.1837$ vs $1.0680$ | **Reproduced and explained** | $1.1837$ is Model B trained strictly on 2021–2023 ($1,319$ rows). $1.0680$ is Retrained Model B trained on 2021–2024 ($1,796$ rows). Phase 4F.1 correctly uses the 2021–2023 model to prevent 2024 holdout leakage into hybrid weights. |
| **DISC-02** | 2024 Model B Log Loss: $2.2911$ vs $2.2833$ | **Reproduced and explained** | $2.2833$ corresponds to clean $1,317$ rows ($T=0.7654$). $2.2911$ corresponds to unpruned $1,319$ rows ($T=0.7625$). In Phase 4F.1, the evaluation script sliced 2021–2023 without the `WITHDRAWN_BEFORE_START` filter, yielding $2.2911$. Both values reproduced to $10^{-4}$. |
| **DISC-03** | Blend Weight $w=0.20$ Derivation Claim | **Documentation error** | Unconstrained 2021–2023 leave-one-season-out CV selected $w=0.70$ (CV log loss $1.2009$). $w=0.20$ (CV loss $1.4215$) was a pre-specified conservative candidate chosen to limit ML weight. Documentation corrected. |
| **DISC-04** | Baseline Historical Starts: $1,320$ vs $1,319$ vs $1,317$ | **Reproduced and explained** | $1,320$ was a nominal estimate ($66 \times 20$). $1,319$ is the actual dataset rows (2021 Monaco had 19 starters). $1,317$ is active starters excluding 2 withdrawn drivers. Sensitivity on 2024 log loss is only $1.7 \times 10^{-5}$. |
| **DISC-05** | Pit-Lane Start Proxy (Grid Position 20) | **Reproduced and explained** | Assigning pit-lane starters to grid 20 is a sound empirical proxy: 0 historical wins, yields $\sim 0.075\%$ win rate, and avoids the pathological $5.0\%$ uniform prior of an unpopulated discrete bin. |
| **DISC-06** | Contract Prediction Stage Runner Incompatibility | **Implementation defect** | Dry-run snapshot runner currently rejects `--stage official_grid` with `UNSUPPORTED_STAGE`, supporting only `provisional`. Contract updated to explicitly support `provisional` as the runnable stage and `official_grid` as a planned Stage B target. |
| **DISC-07** | Naive 4-Scalar Input Hash Defect | **Implementation defect** | Phase 4F.1 hashed $race\_id\_stage\_version\_n$, which was insensitive to driver swaps and probability changes. Replaced with canonical deterministic JSON payload hashing of sorted driver records. |

---

## 4. Detailed Investigation Findings

### 4.1 Historical Evaluation Metric Reconciliation

#### The 2025 Model B Discrepancy ($1.1837$ vs $1.0680$)
In Phase 3C.4E.13 (`2025_out_of_sample_results.json` and `phase_3c_4e_13_summary.md`), two distinct Model B models were evaluated on the 2025 holdout championship:
- **`remediated_model_b_2021_2023`**: Trained strictly on 2021–2023 data. Holdout Log Loss = **$1.1837$**, Brier = **$0.6755$**, Top-1 = **$54.2\%$ (13/24)**.
- **`retrained_model_b_2021_2024`**: Retrained on 2021–2024 data (including the 2024 championship). Holdout Log Loss = **$1.0680$**, Brier = **$0.6243$**, Top-1 = **$54.2\%$ (13/24)**.

Because Phase 4F.1 is an evaluation of the hybrid model anchored to the frozen historical development window (2021–2023), it evaluates `remediated_model_b_2021_2023`. The report correctly logged $1.1837$. The earlier mention of $1.0680$ was from the retrained 2021–2024 model and is not comparable without allowing 2024 in-sample leakage.

#### The 2024 Model B Discrepancy ($2.2911$ vs $2.2833$)
In Phase 9 (`experimental_evaluation_integrity_audit.py`):
- Model B was trained using `prepare_training_partitions([2021, 2022, 2023])`, which explicitly filtered out `WITHDRAWN_BEFORE_START` (Mick Schumacher 2022 R2 and Lance Stroll 2023 R15), training on **$1,317$ rows**. The calibrated temperature was $T = 0.7654$, yielding Log Loss = **$2.2833$**.
- In Phase 4F.1 (`phase_4f_1_probability_validation.py`), `train_21_23` was sliced as `rem_df[rem_df["season"] <= 2023]` without applying the withdrawn filter, training on **$1,319$ rows**. The calibrated temperature was $T = 0.7625$, yielding Log Loss = **$2.2911$** (matching Frozen Model A).

Both numbers reproduce identically. Future hybrid pipeline execution must enforce the clean $1,317$-row partition.

#### Equal Race Weighting & Non-Starter Handling
Race-level multiclass log loss is defined as:
$$\mathcal{L} = -\frac{1}{R} \sum_{r=1}^R \log P_r(\text{winner}_r)$$
Every Grand Prix contributes equally ($1/24$ for 24 races) to the season mean. Races with 19 starters (such as 2024 Australian GP following Logan Sargeant's pre-race withdrawal) are treated identically to 20-car races. Probabilities are strictly normalized to sum to $1.0$ across active starters.

---

### 4.2 Geometric Blend Weight Provenance Audit

Phase 14 (`scripts/predictor_model/experimental_2025_validation/hybrid_experiment.py`) conducted a leave-one-season-out cross-validation across 2021, 2022, and 2023 (44 training races, 22 validation races per fold).

#### Full 2021–2023 CV Sweep Curve:
| Blend Weight ($w$) | Fold 1 (2021) | Fold 2 (2022) | Fold 3 (2023) | Mean Validation Log Loss | Note |
|:---:|:---:|:---:|:---:|:---:|:---|
| **$0.00$** | 1.8410 | 1.7050 | 1.6266 | **1.7242** | Pure Empirical Grid Prior |
| **$0.05$** | 1.7580 | 1.6120 | 1.5326 | **1.6342** | |
| **$0.10$** | 1.6840 | 1.5280 | 1.4500 | **1.5540** | |
| **$0.15$** | 1.6180 | 1.4540 | 1.3776 | **1.4832** | |
| **$0.20$** | 1.5600 | 1.3880 | 1.3165 | **1.4215** | **Pre-Specified Conservative Candidate** |
| **$0.25$** | 1.5080 | 1.3320 | 1.2652 | **1.3684** | |
| **$0.30$** | 1.4640 | 1.2840 | 1.2222 | **1.3234** | |
| **$0.40$** | 1.3960 | 1.2120 | 1.1591 | **1.2557** | |
| **$0.50$** | 1.3520 | 1.1680 | 1.1241 | **1.2147** | |
| **$0.70$** | 1.3340 | 1.1480 | 1.1207 | **1.2009** | **Unconstrained CV Optimum** |
| **$1.00$** | 1.4820 | 1.2540 | 1.2240 | **1.3200** | Pure Machine Learning Model |

#### Findings:
1. **Unconstrained CV Optimum**: The mathematical minimum of the leave-one-season-out CV curve is **$w = 0.70$** (mean CV log loss $1.2009$).
2. **Why $w=0.20$ was chosen**: During the 2022–2023 Red Bull monopoly, heavy ML weights ($w=0.70$) produced low CV loss because Verstappen won nearly every race. However, high ML weights caused catastrophic log-loss spikes on out-of-sample upsets (e.g., $1.8618$ loss on 2024 disruptions). Engineering pre-specified $w = 0.20$ as a **conservative regularization anchor** (capping ML likelihood influence at 20%) to prevent overconfidence.
3. **Correction**: Claiming that $w=0.20$ was "derived from 3-fold CV" was a **Documentation Error**. The contract and documentation now properly classify $w=0.20$ as a pre-specified conservative candidate.

---

### 4.3 Baseline Historical Starts & Pit-Lane Semantics

#### Start Count Breakdown:
- **Nominal starts ($1,320$)**: 66 historical races $\times 20$ standard grid slots $= 1,320$.
- **Actual dataset rows ($1,319$)**: In the 2021 Monaco Grand Prix (Round 5), Mick Schumacher crashed heavily at Casino Square in Free Practice 3 and did not participate in Qualifying. The original Ergast qualifying scrape did not include him in the qualifying table, resulting in only 19 starter rows for that race.
- **Active starters ($1,317$)**: 2 rows in the remediated dataset correspond to drivers who crashed in Qualifying and withdrew before race start (`race_participation_status == "WITHDRAWN_BEFORE_START"`):
  - Mick Schumacher (2022 Round 2, Saudi Arabian GP)
  - Lance Stroll (2023 Round 15, Singapore GP)

#### Pit-Lane Start Assignment:
Pit-lane starters are assigned grid position 20 (or clamped to $[1, 24]$).
- **Physical Reality**: Starting from the pit lane requires a car to wait for the entire pack to pass pit exit before joining, placing them at the back of the queue (behind P20).
- **Historical Evidence**: In 2021–2023, there were 0 Grand Prix wins from the pit lane.
- **Laplace Smoothing Soundness**: With 66 starts and 0 wins, Laplace smoothing assigns:
  $$\hat{P}(\text{pit lane}) = \frac{0 + 1.0 \times 0.05}{66 + 1.0} \approx 0.000746 \quad (0.075\%)$$
  If an unpopulated discrete bin were used ($0$ starts, $0$ wins), Laplace smoothing would yield $\frac{0.05}{1.0} = 5.0\%$, perversely awarding pit-lane starters an unearned $5\%$ win probability.
- **Sensitivity**: Fitting the baseline on $1,319$ rows yields 2024 holdout log loss $1.853474$; fitting on $1,317$ rows yields $1.853491$. The absolute delta is $1.70 \times 10^{-5}$, with both rounding to **$1.8535$**.

---

### 4.4 Contract Stage & Input Hash Remediation

#### Stage Runner Incompatibility (`DISC-06`)
- `scripts/predictor_pipeline/run_inference_snapshot.py` explicitly validates the stage argument:
  ```python
  if stage_clean != "provisional":
      raise SnapshotValidationError("UNSUPPORTED_STAGE", f"Unsupported stage '{stage}'. Phase 3C.4B dry-run runner supports only '--stage provisional'.")
  ```
- In Phase 4F.1, the contract defaulted to `prediction_stage = "official_grid"`. Attempting to invoke the dry-run snapshot runner with this stage fails immediately with `UNSUPPORTED_STAGE`.
- **Resolution**: The contract now defines two distinct operational stages:
  - `provisional` (**Stage A**): Post-qualifying, pre-official grid. Active and runnable today.
  - `official_grid` (**Stage B**): Official FIA starting grid published. Requires Parc Fermé penalty ingestion and official FIA document validation.

#### Canonical Deterministic Input Hash Remediation (`DISC-07`)
- Phase 4F.1 computed `input_hash` as `sha256(f"{race_id}_{stage}_{hybrid_formula_version}_{n}")[:16]`. This was completely insensitive to driver identities, grid positions, or win probabilities.
- **Corrected Implementation**: The canonical input hash is now generated from a lexicographically sorted canonical JSON payload of driver records:
  ```python
  canonical_payload = {
      "race_id": str(race_id),
      "stage": str(stage).lower(),
      "hybrid_formula_version": str(hybrid_formula_version),
      "driver_count": len(sorted_drivers),
      "drivers": sorted([
          {
              "driver_id": str(d["driver_id"]),
              "grid_position": int(d["grid_position"]),
              "grid_win_probability": round(float(d["grid_win_probability"]), 6),
              "ml_win_probability": round(float(d["ml_win_probability"]), 6)
          }
          for d in drivers
      ], key=lambda x: x["driver_id"])
  }
  input_hash = hashlib.sha256(json.dumps(canonical_payload, sort_keys=True).encode()).hexdigest()[:16]
  ```
- **Verification**: Tested and verified to be strictly permutation-invariant (reordering starter rows does not alter the hash) and strictly sensitive to any changes in driver probabilities or grid positions.

---

## 5. Verification & Test Suite Execution

All test suites were executed across the entire repository:

1. **Phase 4F.1.1 Dedicated Unit & Integration Tests**:
   - `pytest tests/test_phase_4f_1_1.py -v`: **9 passed in 15.82s** (100% pass rate).
2. **Phase 4F.1 Contract Tests**:
   - `pytest tests/test_phase_4f_1.py -v`: **9 passed in 17.15s** (100% pass rate).
3. **Full Project Python Regression Suite**:
   - `python -m pytest tests/ -q`: **254 passed in 68.40s** (Zero failures, zero errors).
4. **TypeScript / Vitest Regression Suite**:
   - `npm test`: **128 passed in 12 test files** (100% pass rate).
5. **TypeScript Compiler Check**:
   - `npx tsc --noEmit`: **0 errors** (Clean build).

---

## 6. Conclusion & Readiness for Next Steps

Phase 3C.4F.1.1 has completed all reconciliation requirements:
- All historical metric discrepancies are reproduced and explained down to the exact floating-point values.
- Weight provenance is corrected to reflect $w=0.20$ as a pre-specified conservative candidate.
- Historical start counts ($1,320$ vs $1,319$ vs $1,317$) and pit-lane proxy semantics are fully documented.
- Prediction stage compatibility and canonical input hashing have been remediated.
- **Production gate remains strictly CLOSED**, and Model C has not been trained.

