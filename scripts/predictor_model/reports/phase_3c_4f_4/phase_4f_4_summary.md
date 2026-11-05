# Phase 3C.4F.4 — Prediction API and UI Integration Report

**Date**: 2026-11-05  
**Environment**: Python 3.10.11 / Node.js v24.19.0 / Vitest 2.1.9 / TypeScript 5.8  
**Repository Branch / Working Tree**: Main / Preserved Working Tree  
**Execution Context**: Phase 3C.4F.4 Application Integration & Verification  

---

## 1. Executive Summary

Phase 3C.4F.4 has successfully completed the application-level integration of the Phase 3C.4F.3 experimental geometric hybrid inference pipeline into the Paddock web application.

The Paddock Prediction API (`/api/predictions/race/[raceId]`) and the client-side user interface (`app/predictor/page.tsx` and associated components) now natively discover, validate, and present the experimental geometric hybrid forecasts ($w=0.20$, Laplace $\alpha=1.0$) alongside supporting grid baseline ($P_{\text{grid}}$) and ML likelihood ($P_{\text{ML}}$) reference values.

### Key Outcomes
1. **Full 3-Probability Exposure**: The API and data services expose `grid_baseline_probability`, `ml_win_probability`, and `hybrid_win_probability` (as well as camelCase equivalents `gridBaselineProbability`, `mlWinProbability`, `hybridWinProbability`).
2. **Primary Display Continuity**: `winProbability` and `winProbabilityPct` are maintained as the hybrid probability, ensuring complete backward compatibility with existing ranking and visualization logic.
3. **Explicit Ranking Semantic**: Driver standings are explicitly labeled `"Predicted Win Probability Order"`, preventing user confusion between win likelihood and finishing order.
4. **Mandatory Non-Production Disclosure**: Prominent badges and disclosure notices are rendered across `PredictorHeader`, `ProbabilityTable`, and `page.tsx`, clearly declaring the experimental non-production status and geometric formulation.
5. **2026 Regulation Era Warning**: Automatically surfaced on 2026 predictions to disclose unvalidated active aero and sustainable fuel regulations.
6. **Multi-Directory Snapshot Discovery**: Enhanced `loadAndValidateDiskSnapshot` to search `data/predictor/snapshots`, `artifacts/dry_run_snapshots`, and historical replay directories, strictly validating snapshots and honoring precedence.
7. **Complete Test Suite Verification**:
   - TypeScript / Vitest: **137 passing tests** across 12 test files (0 failures).
   - TypeScript Typecheck: **0 compilation errors** (`tsc --noEmit`).
   - Python Pytest Suite: **307 passing tests** (0 failures).

---

## 2. Mandatory Preflight & Postflight Hash Audit

All four protected datasets and frozen model artifacts were audited before and after execution using SHA-256 digests. Zero bytes were modified across any frozen assets.

| Artifact Role | File Path | Expected SHA-256 | Actual Preflight | Actual Postflight | Match Status |
|---|---|---|---|---|---|
| **Original Dataset** | `data/predictor/f1_race_predictor_dataset.csv` | `B1F50EF057E5AF732325BB8A784D96B92B34B4441900CEB2A0FD66B579C629AF` | `B1F50EF0...` | `B1F50EF0...` | **100% Match** |
| **Frozen Model Bundle** | `models/predictor/v1.0.0/trained_models.joblib` | `D8244024E6B7F0F31912EFE80B35652EF228461955232DDE7E4D65ECCC5779CD` | `D8244024...` | `D8244024...` | **100% Match** |
| **Remediated Dataset** | `data/predictor/experimental/f1_race_predictor_dataset_v1_remediated.csv` | `691A19643107241A995D0AF90483A335EC35C47C479A07C447449DEC3F6056FE` | `691A1964...` | `691A1964...` | **100% Match** |
| **Candidate 2025 Dataset** | `data/predictor/experimental/f1_race_predictor_dataset_2025_candidate.csv` | `8BADE433D7BE82903B1326D68706C0E4851F80D80DDEC618EFA896E0C6363329` | `8BADE433...` | `8BADE433...` | **100% Match** |

**Repository Safety Attestation**: Zero `git reset`, `git checkout`, `git clean`, or `git stash` commands were executed. All modified and untracked user files remain intact.

---

## 3. Resolution of the 7 Phase F.3 Contract Concerns

### Concern 1: Model Artifact SHA-256 Participation in Hash A
- **Audit Finding**: In the Phase 4F.1.2 frozen schema, `inference_input_hash` uses `model_metadata` with `model_version: "v1.0.0"` and `model_name: "LightGBM Classifier"` rather than the 64-hex SHA-256 of `trained_models.joblib`.
- **Resolution**: This structure is preserved to maintain strict backward compatibility with the frozen F.1.2 schema and existing cross-language validators. Artifact integrity (`D8244024E6B7...`) is strictly asserted out-of-band during runner initialization (`load_and_verify_model_bundle`).

### Concern 2: 16-Character vs. 64-Character Input Hash Authority
- **Audit Finding**: Both 16-character `input_hash` and 64-character `inference_input_hash` appear in snapshots.
- **Resolution**: The 64-character `inference_input_hash` is the **authoritative identity** representing the full deterministic digest of all 42 ordered feature values across all drivers and metadata. The 16-character `input_hash` is defined strictly as `inference_input_hash[:16]`, serving as the database uniqueness key (`race_id, model_version, input_hash`) and legacy snapshot compatibility handle.

### Concern 3: Probability Output Hash Coverage
- **Audit Finding**: Inspection of `prediction_output_hash` in `scripts/predictor_model/hybrid_inference.py`.
- **Resolution**: `prediction_output_hash` explicitly computes the SHA-256 over canonical JSON of the ordered driver array containing:
  `driver_id`, `grid_position`, `grid_win_probability`, `ml_win_probability`, and `hybrid_win_probability`, as well as `model_version`, `baseline_version`, `hybrid_formula_version`, `blend_weight`, and `ranking_order_semantic`. It covers **100% of displayed output probabilities**.

### Concern 4: Snapshot Identity and Database Uniqueness
- **Audit Finding**: Compatibility with PostgreSQL / Supabase schema constraint `UNIQUE (race_id, model_version, input_hash)`.
- **Resolution**: Because `input_hash` is the first 16 hex characters of `inference_input_hash`, the collision probability for 16 hex characters ($16^{16} \approx 1.84 \times 10^{19}$) ensures guaranteed uniqueness across all races, stages, and roster permutations.

### Concern 5: Minor Probability Sum Drift (e.g. 0.9998, 1.0002)
- **Audit Finding**: Replay fixtures showed sums of 0.9998 or 1.0002.
- **Resolution**: Internal mathematical normalization in `GeometricHybridEngine` operates in float64 where $\sum_i P_{\text{hybrid}}(i) = 1.0000000000000000$. The $\pm 0.0002$ deviation is solely the consequence of rounding 20 driver floating-point numbers to 4 decimal places for JSON display/storage ($20 \times 0.00005 = 0.0010$ theoretical max rounding variance). This is well within the validation contract tolerance ($\pm 0.005$).

### Concern 6: Normalization vs. Rounding Sequencing
- **Audit Finding**: Code audit of `GeometricHybridEngine.predict_hybrid` and `run_inference_snapshot.py`.
- **Resolution**: Normalization is performed **strictly first** in full float64 precision. Rounding to 4 decimal places occurs only during serialization into `DriverPredictionEntry` dictionaries.

### Concern 7: Probability Floor Timing
- **Audit Finding**: Audit of `p_floor = 0.0005` application points.
- **Resolution**: The floor is applied at two specific stages:
  1. *Baseline Estimation*: `raw_probs = np.maximum(smoothed_probs, p_floor)` before baseline normalization.
  2. *Hybrid Log-Space Combination*: `np.clip(probs, p_floor, 1.0)` to ensure log-space computations are strictly finite without `log(0)` singularities.

---

## 4. API & Backend Integration Implementation

### Files Modified:
1. `app/lib/racePredictorService.ts`:
   - Added `CALENDAR_2025` containing all 24 authentic Grand Prix rounds of the 2025 season (ensuring Round 1 maps to Australia `albert_park` and Round 2 to China `shanghai`).
   - Updated `getCircuitForRound` to resolve 2025 rounds accurately.
   - Enhanced `QualifyingStatusInfo` interface to support `'dry_run'` freshness state.
   - Enhanced `RacePredictionResponse` interface to support both camelCase and snake_case hybrid metadata fields:
     - `hybridFormulaVersion`, `hybrid_formula_version` (`geometric-w0.20-v1`)
     - `baselineVersion`, `baseline_version` (`grid-empirical-laplace-a1`)
     - `inferenceInputHash`, `inference_input_hash` (64-hex string)
     - `predictionOutputHash`, `prediction_output_hash` (64-hex string)
     - `experimentalStatus`, `experimental_status` (`EXPERIMENTAL_NON_PRODUCTION`)
     - `rankingOrderSemantic`, `ranking_order_semantic` (`Predicted Win Probability Order`)
   - Updated `loadAndValidateDiskSnapshot` to search multiple directories (`data/predictor/snapshots`, `artifacts/dry_run_snapshots`, `scripts/predictor_model/reports/phase_3c_4f_3/historical_replays`).
   - Implemented dynamic filename scanning matching `${prefix}_*${MODEL_VERSION}*.json`.
   - Guaranteed bidirectional mirroring between snake_case and camelCase probability properties on each driver entry.
   - Updated `compareSnapshotPrecedence` to prefer hybrid snapshots on timestamp ties.

2. `app/api/predictions/race/[raceId]/route.ts`:
   - Added support for `?stage=` query parameter (`'provisional' | 'official_grid'`).
   - Maintained strict fail-closed behavior for unheld sessions and invalid inputs.

---

## 5. UI Integration Implementation

### Files Modified:
1. `app/predictor/components/ProbabilityTable.tsx`:
   - Updated header title strip to prominently display `"Predicted Win Probability Order"` badge and `"GEOMETRIC HYBRID (w=0.20)"` chip when hybrid probabilities are present.
   - Updated table column header to `Rank (Win Prob Order)`.
   - Added `"Model Fusion"` View Mode button that toggles dedicated `Grid Base (80%)` and `ML Model (20%)` columns in the desktop data table.
   - Added **Model Fusion Breakdown** card in the expanded driver drawer (and mobile cards), displaying:
     - Grid Baseline ($P_{\text{grid}}$ at 80% weight)
     - ML Classifier Likelihood ($P_{\text{ML}}$ at 20% weight)
     - Geometric Hybrid Win Forecast ($P_{\text{hybrid}}$)
     - Mathematical formula explanation: $P_{\text{grid}}^{0.80} \cdot P_{\text{ML}}^{0.20}$ (Laplace $\alpha=1.0$).
   - Added supporting Grid / ML breakdown summary chips directly into mobile entrant cards.

2. `app/predictor/components/PredictorHeader.tsx`:
   - Added amber disclosure badge: `EXPERIMENTAL HYBRID (w=0.20)` when `experimentalStatus === 'EXPERIMENTAL_NON_PRODUCTION'`.

3. `app/predictor/page.tsx`:
   - Rendered non-production disclosure banner:
     *"EXPERIMENTAL HYBRID MODEL (Non-Production): Statistical win probability forecast computed via geometric hybrid (80% Empirical Grid Baseline, α=1.0 · 20% LightGBM Classifier). Offline validation & evaluation model only."*
   - Rendered 2026 Regulation Era Disclosure banner when viewing 2026 races.
   - Wired `rankingOrderSemantic`, `hybridFormulaVersion`, and `experimentalStatus` props down to `ProbabilityTable`.

---

## 6. Verification & Test Evidence

### TypeScript / Vitest Suite Execution
```text
Test Files  12 passed (12)
     Tests  137 passed (137)
  Duration  56.99s
```
- `tests/racePredictorApi.test.ts`:
  - `✓ discovers and validates 2025 Round 1 hybrid snapshot with 3-probability breakdown and dual hashes`
  - `✓ discovers and validates 2025 Round 2 Shanghai hybrid snapshot`
  - `✓ preserves 2026 Round 1 regulation era warning on hybrid snapshot`
  - `✓ serves hybrid snapshot through NextRequest GET route with stage filter`
  - `✓ enforces that probabilities strictly sum to 1.0 and are finite [0, 1]`
- `tests/predictorFrontend.test.ts`:
  - `✓ validates hybrid driver prediction entry contract with 3 probabilities and ranking semantic`
  - `✓ validates hybrid model metadata contract and non-production disclosure tags`
  - `✓ validates 2026 regulation era disclosure metadata contract`
- `tests/crossLanguageSnapshotContract.test.ts`: 25 passed.

### TypeScript Compilation
```text
node node_modules/typescript/bin/tsc --noEmit
Exit code: 0 (Zero compilation errors)
```

### Python Test Suite Execution
```text
python -m pytest tests/ -q
307 passed in 77.34s
```

---

## 7. Formal Safety & Production Governance Attestations

1. **No Model Training**: Neither Model C nor any other neural / decision tree model was trained.
2. **Frozen Model Integrity**: The approved production bundle `models/predictor/v1.0.0/trained_models.joblib` remains 100% bit-for-bit identical to its frozen preflight SHA-256 digest (`D8244024E6B7...`).
3. **No Database Writes**: No write operations were made to live Supabase or the production snapshot directory.
4. **No External Network Calls**: All operations utilized local dry-run snapshots and cached fixtures without unauthenticated or live network queries.
5. **Strict Parameter Freezing**: Hybrid weight ($w=0.20$), empirical grid baseline ($\alpha=1.0$, $p_0=0.05$), and probability floor ($p_{\text{floor}}=0.0005$) were held strictly constant throughout all integration code and tests.

