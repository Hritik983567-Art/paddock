# Phase 3C.4F.1.2 — Complete Inference Hash & Contract Freeze Report

**Execution Timestamp**: 2026-11-05  
**Phase**: Phase 3C.4F.1.2  
**Status**: COMPLETE (Contract Freeze & Identity Decoupling)  
**Safety Gate**: **PRODUCTION GATE: STRICTLY CLOSED**  

---

## Mandatory Governance & Safety Attestations

> [!IMPORTANT]
> - **PRODUCTION GATE: STRICTLY CLOSED**
> - **No automatic model promotion or production deployment has taken place.**
> - **Model C has NOT been trained or promoted.**
> - Production prediction inference remains strictly bound to frozen Model A (`models/predictor/v1.0.0/trained_models.joblib`).
> - The two distinct SHA-256 hashes (Inference Input Hash and Prediction Output Hash) are independently verifiable and decoupled.
> - All ten verification criteria have been tested and verified to pass 100%.

---

## 1. Executive Summary

Phase 3C.4F.1.2 finalizes the hybrid prediction identity contract by establishing a strict architectural decoupling between:
1. **The Complete Inference Input Identity** (Hash A): Captures the complete experimental configuration, feature schema, model artifact version, baseline version/alpha, hybrid formula version, conservative blend weight ($w=0.20$), and the exact 42 ordered feature values for every driver in the roster.
2. **The Prediction Output Identity** (Hash B): Captures the resulting posterior probability distribution over active starters, independent of the underlying feature representations.

This decoupling guarantees that changes to feature values (even those that might leave final output probabilities largely unchanged) are deterministically detected in Hash A, while changes to output probabilities (e.g. from future calibration shifts) are reflected in Hash B.

---

## 2. Cryptographic Baseline Verification

All four protected historical datasets and frozen model artifacts were audited via SHA-256:

| Protected Artifact | Path | Expected SHA-256 Digest | Status |
|:---|:---|:---|:---:|
| **Original Dataset** | `data/predictor/f1_race_predictor_dataset.csv` | `B1F50EF057E5AF732325BB8A784D96B92B34B4441900CEB2A0FD66B579C629AF` | **VERIFIED (100% Match)** |
| **Frozen Model A** | `models/predictor/v1.0.0/trained_models.joblib` | `D8244024E6B7F0F31912EFE80B35652EF228461955232DDE7E4D65ECCC5779CD` | **VERIFIED (100% Match)** |
| **Remediated Dataset** | `data/predictor/experimental/...remediated.csv` | `691A19643107241A995D0AF90483A335EC35C47C479A07C447449DEC3F6056FE` | **VERIFIED (100% Match)** |
| **Candidate 2025 Dataset**| `data/predictor/experimental/...2025_candidate.csv` | `8BADE433D7BE82903B1326D68706C0E4851F80D80DDEC618EFA896E0C6363329` | **VERIFIED (100% Match)** |

All 18 previously modified repository files remain preserved without resets, stashes, or alterations.

---

## 3. Dual Hash Architecture Specification

### A. Inference Input Hash (Hash A)
- **Algorithm**: Standard SHA-256 (64 hexadecimal characters).
- **Serialization Policy**: Deterministic canonical JSON with lexicographical key sorting (`sort_keys=True`) and compact separators (`separators=(',', ':')`).
- **Precision Preservation**: Floating-point values are serialized directly without lossy rounding or quantization, preserving complete precision.
- **Order Independence**: Driver records are sorted lexicographically by `driver_id`, guaranteeing complete invariance to row permutations in the input matrix.
- **Included Elements**:
  1. `race_identity`: `race_id`, `season`, `round`, `circuit_id`, `prediction_stage`.
  2. `model_metadata`:
     - `model_version`: `"v1.0.0-remediated-b"`
     - `feature_schema_version`: `"1.0.0"`
     - `baseline_version`: `"grid-empirical-laplace-a1"`
     - `baseline_alpha`: `1.0`
     - `hybrid_formula_version`: `"geometric-w0.20-v1"`
     - `hybrid_blend_weight`: `0.20`
     - `inference_config`: `p_floor=0.0005`, `ml_temperature=0.7654`, `combination_method="geometric"`.
  3. `roster_identity`: `driver_count`, sorted list of `driver_ids`.
  4. `drivers`: Full list of sorted driver objects, each containing their `driver_id` and all 42 ordered feature name-value pairs as defined in `ALL_MODEL_FEATURES`.

### B. Prediction Output Hash (Hash B)
- **Algorithm**: Standard SHA-256 (64 hexadecimal characters).
- **Serialization Policy**: Deterministic canonical JSON with lexicographical key sorting.
- **Order Independence**: Prediction entries are sorted lexicographically by `driver_id`.
- **Included Elements**:
  1. `race_identity`: `race_id`, `season`, `round`, `circuit_id`, `prediction_stage`.
  2. `model_metadata`: `model_version`, `baseline_version`, `hybrid_formula_version`.
  3. `roster_identity`: `driver_count`, sorted list of `driver_ids`.
  4. `predictions`: Lexicographically sorted list of driver predictions, each containing:
     - `driver_id`
     - `grid_position`
     - `grid_win_probability`
     - `ml_win_probability`
     - `hybrid_win_probability`

---

## 4. Ten-Point Verification Suite Results

The comprehensive test suite in [`phase_4f_1_2_hash_contract.py`](file:///c:/Users/Lenovo/OneDrive/Desktop/Projects/paddock/scripts/predictor_model/experimental_2025_validation/phase_3c_4f_1_2/phase_4f_1_2_hash_contract.py) evaluated all ten requirements:

| Test ID | Verification Requirement | Expected Behavior | Measured Result | Status |
|:---|:---|:---|:---|:---:|
| **Test 1** | Identical Inputs | Identical inputs produce identical hashes for both Hash A and Hash B | Exact 64-char match on repeated evaluations | **PASS** |
| **Test 2** | Permutation Invariance | Shuffling driver rows produces identical hashes | Hash A and Hash B invariant to row order | **PASS** |
| **Test 3** | All 42 Features Sensitive | Mutating any single feature in `ALL_MODEL_FEATURES` changes Hash A | 42 of 42 individual feature mutations alter Hash A | **PASS** |
| **Test 4** | Driver ID Sensitivity | Modifying a driver ID changes both Hash A and Hash B | Both hashes completely change | **PASS** |
| **Test 5** | Race Identity Sensitivity | Modifying `race_id`, `season`, or `round` changes both hashes | Both hashes completely change | **PASS** |
| **Test 6** | Prediction Stage Sensitivity | Changing stage (`provisional` vs `official_grid`) changes both hashes | Both hashes completely change | **PASS** |
| **Test 7** | Metadata & Weight Sensitivity | Modifying model version, schema, baseline, alpha, formula, or $w$ changes Hash A | All 6 metadata modifications alter Hash A | **PASS** |
| **Test 8** | Output Probability Sensitivity | Changing output probabilities changes Hash B while keeping Hash A constant | Hash B changes; Hash A remains untouched | **PASS** |
| **Test 9** | Feature Decoupling | Mutating underlying feature while keeping probabilities constant alters Hash A only | Hash A changes; Hash B remains untouched | **PASS** |
| **Test 10** | Deterministic Repeatability | Repeated serialization over 100 runs produces zero variance | 100/100 unique hash counts $= 1$ | **PASS** |

---

## 5. Contract Consistency & Freeze Rules

1. **Stage Support Enforcements**:
   - `provisional` (**Stage A**): Strictly designated as the **ONLY** currently runnable dry-run stage in `run_inference_snapshot.py` (post-qualifying, pre-official grid).
   - `official_grid` (**Stage B**): Marked explicitly as **`PLANNED_STAGE_B`** in contract diagnostics. Not currently executable in the dry-run snapshot runner until official FIA starting grid document ingestion and Parc Fermé penalty pipelines are activated.
2. **Model Version & Lineage Separation**:
   - **Model A**: Frozen LightGBM (`models/predictor/v1.0.0/trained_models.joblib`).
   - **Model B**: Remediated LightGBM (`v1.0.0-remediated-b`, trained on 2021–2023 clean partition).
   - **Reference Baseline**: `grid-empirical-laplace-a1` (Laplace smoothed grid prior, $\alpha = 1.0$).
   - **Experimental Hybrid**: `geometric-w0.20-v1` (Bayesian geometric evidence fusion with conservative weight $w = 0.20$).
3. **Weight Provenance Contract**:
   - $w = 0.20$ is strictly documented as a **pre-specified conservative regularization candidate**, not the unconstrained cross-validation minimum ($w = 0.70$).
4. **Historical Holdout Status**:
   - All 2024 and 2025 evaluations are permanently categorized as **exploratory historical analyses** under the Independent Confirmation Rule.

---

## 6. Test Suite Execution & Code Artifacts

1. **Phase 4F.1.2 Dedicated Unit & Integration Tests**:
   - Command: `pytest tests/test_phase_4f_1_2.py -v`
   - Results: **12 passed in 10.46s** (100% pass rate).
2. **Full Project Python Regression Suite**:
   - Command: `python -m pytest tests/ -q`
   - Results: **266 passed in 58.10s** (Zero failures, zero errors).
3. **TypeScript / Vitest Regression Suite**:
   - Command: `npm test`
   - Results: **128 passed in 12 test files** (100% pass rate).
4. **TypeScript Compiler Check**:
   - Command: `npx tsc --noEmit`
   - Results: **0 errors** (Clean build).

### Created Deliverables

1. [`phase_4f_1_2_hash_contract.py`](file:///c:/Users/Lenovo/OneDrive/Desktop/Projects/paddock/scripts/predictor_model/experimental_2025_validation/phase_3c_4f_1_2/phase_4f_1_2_hash_contract.py): Dual canonical hashing engine, frozen dataclass models, and ten-point verification runner.
2. [`test_phase_4f_1_2.py`](file:///c:/Users/Lenovo/OneDrive/Desktop/Projects/paddock/scripts/predictor_model/experimental_2025_validation/phase_3c_4f_1_2/test_phase_4f_1_2.py) & [`tests/test_phase_4f_1_2.py`](file:///c:/Users/Lenovo/OneDrive/Desktop/Projects/paddock/tests/test_phase_4f_1_2.py): Dedicated test suite validating all 10 hash criteria, stage restrictions, and gate status.
3. [`phase_4f_1_2_hash_audit.json`](file:///c:/Users/Lenovo/OneDrive/Desktop/Projects/paddock/scripts/predictor_model/reports/phase_3c_4f_1_2/phase_4f_1_2_hash_audit.json): Machine-readable verification audit report.
4. [`phase_4f_1_2_summary.md`](file:///c:/Users/Lenovo/OneDrive/Desktop/Projects/paddock/scripts/predictor_model/reports/phase_3c_4f_1_2/phase_4f_1_2_summary.md): Comprehensive executive summary.

