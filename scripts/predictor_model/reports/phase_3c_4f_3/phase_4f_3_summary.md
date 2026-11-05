# Phase 3C.4F.3 — Experimental Hybrid Inference Integration Summary

## Executive Summary

Phase 3C.4F.3 successfully integrates the experimentally verified geometric hybrid prediction method ($w=0.20$) into the existing Paddock prediction inference pipeline. The integration establishes a clean, modular, and mathematically rigorous connection between:
1. **`LiveFeatureBuilder`**: Real-time assembly of the exact 42-feature input matrix conforming to `FEATURE_SCHEMA_VERSION '1.0.0'`.
2. **Frozen LightGBM Model B**: Executing uncalibrated probability inference ($T=1.0$) from `models/predictor/v1.0.0/trained_models.joblib`.
3. **`EmpiricalGridBaseline`**: Reference baseline trained strictly on 2021–2023 historical data (66 races) with Bayesian Laplace smoothing ($\alpha=1.0$) and prior $p_0 = 1/20 = 0.05$.
4. **`GeometricHybridEngine`**: Log-space geometric probability fusion with floor protection ($p_{\text{floor}} = 0.0005$) and unit simplex normalization.
5. **Decoupled Canonical Dual Hashing**: 64-hex `inference_input_hash` (Hash A) and 64-hex `prediction_output_hash` (Hash B) with strict permutation invariance.
6. **Cross-Language Snapshot Contract Parity**: Generated hybrid snapshots pass both Python `validate_dry_run_snapshot` and TypeScript `validateSnapshot`.

---

## 1. Fixed Mathematical Formula

The pure hybrid inference engine implements the pre-specified log-space geometric combination:

$$P_{\text{hybrid}}(i) = \frac{P_{\text{grid}}(i)^{0.80} \cdot P_{\text{ML}}(i)^{0.20}}{\sum_j P_{\text{grid}}(j)^{0.80} \cdot P_{\text{ML}}(j)^{0.20}}$$

Implemented stably in log-space:
$$\log \tilde{P}(i) = 0.80 \cdot \log P_{\text{grid}}(i) + 0.20 \cdot \log P_{\text{ML}}(i)$$
$$\log Z = \text{logsumexp}(\log \tilde{P})$$
$$P_{\text{hybrid}}(i) = \exp(\log \tilde{P}(i) - \log Z)$$

### Fixed Configuration
- **ML Blend Weight ($w$)**: $0.20$
- **Grid Baseline Weight ($1 - w$)**: $0.80$
- **Empirical Baseline**: Laplace smoothing $\alpha = 1.0$, prior $p_0 = 0.05$ (fitted on 2021–2023 historical GP data)
- **ML Temperature**: $1.0$ (uncalibrated experimental baseline path)
- **Probability Floor ($p_{\text{floor}}$)**: $0.0005$
- **Hybrid Formula Version**: `geometric-w0.20-v1`
- **Baseline Version**: `grid-empirical-laplace-a1`
- **Model Version**: `v1.0.0`
- **Experimental Status**: `EXPERIMENTAL_NON_PRODUCTION`
- **Ranking Order Semantic**: `Predicted Win Probability Order`

---

## 2. Architecture & Pure Hybrid Module

The hybrid inference logic is isolated in `scripts/predictor_model/hybrid_inference.py`:
- **`HybridInferenceError`**: Structured exception for all contract, dimension, and probability failures.
- **`EmpiricalGridBaseline`**: Reference baseline model with historical grid win frequency lookup, bounds clamping $[1, 24]$, fallback to grid 20 for missing positions, floor protection, and field normalization.
- **`GeometricHybridEngine`**: Numerically stable log-space probability combination using `scipy.special.logsumexp`.
- **`HybridRaceInferenceEngine`**: Pure inference orchestrator that validates inputs, coordinates ML and baseline predictions, applies hybrid fusion, computes canonical dual hashes, and assembles the canonical response.
- **`run_hybrid_inference_for_race`**: Offline runner function that loads `LiveFeatureBuilder`, invokes the engine, validates snapshot invariants, and emits snapshot JSON artifacts atomically.

### Fail-Closed Validation Guarantees
The engine strictly fails closed (raising `HybridInferenceError`) when:
1. LightGBM model bundle or output is missing/None (`MODEL_MISSING`, `ML_OUTPUT_MISSING`).
2. Driver IDs do not match between feature rows and metadata (`ROSTER_COUNT_MISMATCH`).
3. Duplicate driver IDs are detected (`DUPLICATE_DRIVER_ID`).
4. Probabilities are negative or non-finite (`NON_FINITE_PROBABILITY`, `PROBABILITY_OUT_OF_BOUNDS`).
5. Roster contains fewer than 2 entrants (`INCOMPLETE_ROSTER`).
6. Feature contract is violated: columns != exact 42 features in `ALL_MODEL_FEATURES` (`FEATURE_CONTRACT_VIOLATION`).
7. Unsupported inference stage is supplied: only `provisional` is currently runnable; `official_grid` and `live` are rejected (`UNSUPPORTED_STAGE`).
8. Probability normalization fails or sums outside $[0.995, 1.005]$ (`NORMALIZATION_FAILED`).

---

## 3. Preserved Probability Outputs

Every driver entry in the hybrid prediction output preserves three distinct probability values:
- `grid_baseline_probability` (and `gridBaselineProbability`): Pure historical starting-grid empirical probability.
- `ml_win_probability` (and `mlWinProbability`): Pure 42-feature LightGBM model probability ($T=1.0$).
- `hybrid_win_probability` (and `hybridWinProbability`): Calibrated geometric blend probability ($w=0.20$).
- `winProbability`: Set to `hybrid_win_probability`.
- `winProbabilityPct`: Set to `round(hybrid_win_probability * 100.0, 2)`.

Primary sorting is strictly identified as:
$$\textbf{Predicted Win Probability Order}$$
(Probabilities represent statistical win likelihood after qualifying; they do not predict race finishing positions.)

---

## 4. Canonical Dual Hashing & Permutation Invariance

Phase 3C.4F.1.2 established the separation between Inference Input Identity (Hash A) and Prediction Output Identity (Hash B). Phase 3C.4F.3 embeds both hashes deterministically:

1. **Inference Input Hash (`inference_input_hash`)**:
   - 64 hex characters (SHA-256).
   - Captures race identity (`race_id`, `season`, `round`, `circuit_id`, `stage`).
   - Captures version metadata (`model_version`, `feature_schema_version`, `baseline_version`, `hybrid_formula_version`, `baseline_alpha`, `hybrid_blend_weight`, config).
   - Captures exact 42 ordered features for every driver in the roster.
   - Permutation invariant: Roster is sorted lexicographically by `driver_id` prior to canonical JSON serialization.
   - Sensitive to single-feature modifications.
   - Truncated 16-hex prefix preserved as `inputHash` for backwards compatibility.

2. **Prediction Output Hash (`prediction_output_hash`)**:
   - 64 hex characters (SHA-256).
   - Captures race identity and prediction stage.
   - Captures version identifiers.
   - Captures driver roster, grid positions, and computed probabilities (`grid_baseline_probability`, `ml_win_probability`, `hybrid_win_probability`).
   - Permutation invariant: Sorted lexicographically by `driver_id`.
   - Decoupled: Sensitive to output probability shifts, independent of internal intermediate features.

---

## 5. Historical Replay Verification Fixtures

Inference was executed on three integration fixtures (saved to `artifacts/dry_run_snapshots/` and `scripts/predictor_model/reports/phase_3c_4f_3/historical_replays/`):

### Fixture 1: 2025 Round 1 — Australian GP (Albert Park)
- **Artifact**: `2025_1_albert_park_provisional_v1.0.0_hybrid_56947b913051836c.json`
- **Entrants**: 20 drivers
- **Predicted Winner**: Lando Norris (`norris`, McLaren) from Grid 1
- **Probability Sum**: $0.9998$ (within unit simplex tolerance)
- **Input Hash (16-char)**: `56947b913051836c`
- **Inference Input Hash (64-char)**: `56947b913051836cf128d3f871cbf46bdbdf5a8f58518685c4507583fb16e7e3`
- **Prediction Output Hash (64-char)**: `6cff56139ae556dd215e5c0a272e9492d7be694b2380d8b1a2d1a06fd0ce2ec6`
- **Top Drivers**:
  | Driver | Grid Pos | $P_{\text{grid}}$ | $P_{\text{ML}}$ | $P_{\text{hybrid}}$ | Hybrid Pct |
  | :--- | :---: | :---: | :---: | :---: | :---: |
  | **Lando Norris** | 1 | 0.5225 | 0.2973 | **0.4937** | 49.37% |
  | **Oscar Piastri** | 2 | 0.1946 | 0.2111 | **0.2092** | 20.92% |
  | **Max Verstappen** | 3 | 0.1051 | 0.0418 | **0.0925** | 9.25% |
  | **George Russell** | 4 | 0.0306 | 0.0381 | **0.0338** | 3.38% |
  | **Alexander Albon** | 6 | 0.0455 | 0.0350 | **0.0456** | 4.56% |

### Fixture 2: 2025 Round 2 — Chinese GP (Shanghai)
- **Artifact**: `2025_2_shanghai_provisional_v1.0.0_hybrid_26e728be8d8a7492.json`
- **Entrants**: 20 drivers
- **Predicted Winner**: Oscar Piastri (`piastri`, McLaren) from Grid 1
- **Probability Sum**: $0.9999$
- **Input Hash (16-char)**: `26e728be8d8a7492`
- **Inference Input Hash (64-char)**: `26e728be8d8a749226527925b931bca4f7710a51bd11667dc6b16b4120f84fea`
- **Prediction Output Hash (64-char)**: `14fe16cb4310537c199c7af08621f2eaf69727f8fa65ca04d7211f91be21b7aa`
- **Top Drivers**:
  | Driver | Grid Pos | $P_{\text{grid}}$ | $P_{\text{ML}}$ | $P_{\text{hybrid}}$ | Hybrid Pct |
  | :--- | :---: | :---: | :---: | :---: | :---: |
  | **Oscar Piastri** | 1 | 0.5225 | 0.0865 | **0.4428** | 44.28% |
  | **George Russell** | 2 | 0.1946 | 0.0710 | **0.1931** | 19.31% |
  | **Lando Norris** | 3 | 0.1051 | 0.7381 | **0.1884** | 18.84% |
  | **Lewis Hamilton** | 5 | 0.0007 | 0.0205 | **0.0016** | 0.16% |

### Fixture 3: 2026 Round 1 — Australian GP (Albert Park)
- **Artifact**: `2026_1_albert_park_provisional_v1.0.0_hybrid_74bd99dca49ce975.json`
- **Entrants**: 19 drivers (2026 pre-season entry baseline)
- **Predicted Winner**: George Russell (`russell`, Mercedes) from Grid 1
- **Probability Sum**: $1.0002$
- **Input Hash (16-char)**: `74bd99dca49ce975`
- **Inference Input Hash (64-char)**: `74bd99dca49ce975f3b727ddee81c617f161e057c3acfdf6554e22e2c3c7d56c`
- **Prediction Output Hash (64-char)**: `af98bffd13c7271987673f55ffc455716283ea826e9bef807ac06e4cd65b975e`
- **Regulation Warning**:
  ```json
  {
    "isUnknownRegulationEra": true,
    "regulationEra": "active_aero_sustainable_fuel_gen3",
    "warningCode": "UNVALIDATED_2026_REGULATIONS",
    "disclaimer": "Statistical forecast generated by model trained on 2021-2024 regulations. 2026 active aerodynamics and sustainable fuel regulations are unvalidated in training data; probabilities represent historical baseline extrapolation."
  }
  ```
- **Top Drivers**:
  | Driver | Grid Pos | $P_{\text{grid}}$ | $P_{\text{ML}}$ | $P_{\text{hybrid}}$ | Hybrid Pct |
  | :--- | :---: | :---: | :---: | :---: | :---: |
  | **George Russell** | 1 | 0.5229 | 0.3214 | **0.5025** | 50.25% |
  | **Kimi Antonelli** | 2 | 0.1947 | 0.1326 | **0.1910** | 19.10% |
  | **Isack Hadjar** | 3 | 0.1052 | 0.0425 | **0.0929** | 9.29% |

---

## 6. Runner Integration

`scripts/predictor_pipeline/run_inference_snapshot.py` was updated with full backwards compatibility:
- `run_dry_run_hybrid_inference`: Directly runs the hybrid pipeline.
- `run_dry_run_inference(..., mode="standard")`: Retains exact backwards compatibility with Phase 3C.4B test suites.
- `run_dry_run_inference(..., mode="hybrid")`: Invokes the geometric hybrid pipeline.
- CLI argument `--hybrid`: Added to `main()` to allow running the hybrid pipeline from the terminal.

---

## 7. Verification Results & Test Status

| Suite | Scope | Tests | Result | Duration |
| :--- | :--- | :---: | :---: | :---: |
| **Python Focused Suite** | `tests/test_hybrid_inference.py` | 17 | **17 PASSED** | 24.7s |
| **Python Dry-Run Runner** | `tests/test_dry_run_runner.py` | 35 | **35 PASSED** | 22.8s |
| **Full Python Suite** | `tests/` | 307 | **307 PASSED** | 58.0s |
| **Cross-Language Vitest** | `tests/crossLanguageSnapshotContract.test.ts` | 25 | **25 PASSED** | 0.3s |
| **Full Vitest Suite** | `tests/` (12 test files) | 130 | **130 PASSED** | 37.1s |
| **TypeScript Compiler** | `tsc --noEmit` | N/A | **0 ERRORS** | 9.2s |

---

## 8. Cryptographic Baseline & Dataset Integrity

All four protected SHA-256 hashes were re-verified and remain 100% bit-for-bit identical:

| Artifact | Relative Path | Expected SHA-256 | Verified Status |
| :--- | :--- | :--- | :---: |
| **Original Dataset** | `data/predictor/f1_race_predictor_dataset.csv` | `B1F50EF057E5AF732325BB8A784D96B92B34B4441900CEB2A0FD66B579C629AF` | **MATCH (100%)** |
| **Frozen Model Bundle** | `models/predictor/v1.0.0/trained_models.joblib` | `D8244024E6B7F0F31912EFE80B35652EF228461955232DDE7E4D65ECCC5779CD` | **MATCH (100%)** |
| **Remediated Dataset** | `data/predictor/experimental/f1_race_predictor_dataset_v1_remediated.csv` | `691A19643107241A995D0AF90483A335EC35C47C479A07C447449DEC3F6056FE` | **MATCH (100%)** |
| **2025 Candidate Dataset**| `data/predictor/experimental/f1_race_predictor_dataset_2025_candidate.csv` | `8BADE433D7BE82903B1326D68706C0E4851F80D80DDEC618EFA896E0C6363329` | **MATCH (100%)** |

---

## 9. Attestation of Constraints & Scope Adherence

1. **Model Promotion Gate: STRICTLY CLOSED.**
   - Model C has NOT been trained, serialized, or promoted.
   - Frozen Model A (`v1.0.0`) and Model B artifacts remain untouched.
2. **Formula Integrity**:
   - The hybrid blend weight was strictly fixed at $w=0.20$ (Grid weight $0.80$). No parameter tuning or search was performed.
   - ML temperature was fixed at $1.0$ (uncalibrated experimental baseline).
3. **Paddock Application Safety**:
   - Zero live API network calls were executed.
   - Zero writes were performed to Supabase, production DB, or production snapshot directories (`data/predictor/snapshots/`).
   - The Prediction UI and unrelated application components were NOT redesigned or altered.
4. **Preservation**:
   - All modified and untracked user files were strictly preserved. No `git reset`, `git clean`, or `git checkout` commands were run.

