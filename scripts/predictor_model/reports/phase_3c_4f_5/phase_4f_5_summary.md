# Phase 3C.4F.5 — End-to-End Local Prediction Verification Report

**Date**: 2026-11-05  
**Environment**: Python 3.10.11 / Node.js v24.19.0 / Vitest 2.1.9 / TypeScript 5.8 / Next.js 15.3  
**Repository Working Tree**: `c:\Users\Lenovo\OneDrive\Desktop\Projects\paddock` (Preserved Working Tree)  
**Execution Context**: Phase 3C.4F.5 Local End-to-End Prediction Verification & Targeted Remediation  

---

## 1. Executive Summary

Phase 3C.4F.5 has completed the end-to-end local prediction verification of the Paddock race prediction subsystem, establishing full operational integrity across the Python inference runner, snapshot validation, dual 64-character cryptographic hash identities, service discovery, Next.js API routing, and React UI presentation.

This phase audited the integration established in Phase 3C.4F.3 (inference engine) and Phase 3C.4F.4 (API & UI integration), enacted targeted remediations for historical replay isolation, prefix collision rejection, model binary hash pre-verification, and stage fail-closed enforcement, and validated the complete 10-step pipeline under standard and edge-case conditions.

### Primary Verification Deliverables & Results
1. **Historical Replay Isolation Remediated**:
   - `loadAndValidateDiskSnapshot` in `app/lib/racePredictorService.ts` strictly isolates ordinary snapshot discovery to canonical snapshot directories (`data/predictor/snapshots` and `artifacts/dry_run_snapshots`).
   - Historical replay directories (`scripts/predictor_model/reports/.../historical_replays`) are completely excluded from normal prediction resolution and can only be accessed when explicitly flagged with `includeHistoricalReplays: true`.
2. **Deterministic Snapshot Precedence Enforced**:
   - Deterministic hierarchy: Official Grid stage > Provisional stage; newer valid timestamp > older; hybrid candidate preferred on timestamp tie; deterministic lexical tiebreak on `inputHash`.
   - Stale experimental artifacts cannot override newer valid race forecasts.
3. **Cryptographic Identity & Prefix Collision Rejection**:
   - Full 64-hex `inference_input_hash` confirmed as the authoritative inference input identity.
   - Full 64-hex `prediction_output_hash` confirmed covering 100% of driver-level win probabilities ($P_{\text{grid}}$, $P_{\text{ML}}$, $P_{\text{hybrid}}$).
   - Strict prefix collision protection implemented: any snapshot whose 16-char `input_hash` diverges from `inference_input_hash[:16]` is rejected with explicit validation failure (`PREFIX_COLLISION_MISMATCH`).
   - Physical binary SHA-256 of `trained_models.joblib` (`D8244024E6B7...`) verified out-of-band prior to inference model loading.
4. **Stage Fail-Closed Architecture**:
   - Provisional stage queries successfully resolve valid provisional snapshots.
   - Official grid stage queries fail-closed if no official grid snapshot exists: returns explicit `status: 'unavailable'` with `error: 'OFFICIAL_GRID_SNAPSHOT_NOT_FOUND'`.
   - Never falls back silently to provisional data or fabricates official grid positions.
5. **Full Test Suite Verification**:
   - TypeScript / Vitest: **155 passing tests** across 13 test files (0 failures).
   - TypeScript Typecheck: **0 compilation errors** (`tsc --noEmit`).
   - Python Pytest Suite: **318 passing tests** across all test suites (0 failures).

---

## 2. Mandatory Preflight & Postflight Hash Audit

All four protected datasets and frozen model artifacts were verified using SHA-256 digests before and after test execution. Zero bytes were modified across any frozen assets.

| Artifact Role | File Path | Expected SHA-256 | Actual Preflight | Actual Postflight | Match Status |
|---|---|---|---|---|---|
| **Original Dataset** | `data/predictor/f1_race_predictor_dataset.csv` | `B1F50EF057E5AF732325BB8A784D96B92B34B4441900CEB2A0FD66B579C629AF` | `B1F50EF0...` | `B1F50EF0...` | **100% Match** |
| **Frozen Model Bundle** | `models/predictor/v1.0.0/trained_models.joblib` | `D8244024E6B7F0F31912EFE80B35652EF228461955232DDE7E4D65ECCC5779CD` | `D8244024...` | `D8244024...` | **100% Match** |
| **Remediated Dataset** | `data/predictor/experimental/f1_race_predictor_dataset_v1_remediated.csv` | `691A19643107241A995D0AF90483A335EC35C47C479A07C447449DEC3F6056FE` | `691A1964...` | `691A1964...` | **100% Match** |
| **Candidate 2025 Dataset** | `data/predictor/experimental/f1_race_predictor_dataset_2025_candidate.csv` | `8BADE433D7BE82903B1326D68706C0E4851F80D80DDEC618EFA896E0C6363329` | `8BADE433...` | `8BADE433...` | **100% Match** |

**Repository Safety Attestation**: No `git reset`, `git checkout`, `git clean`, or `git stash` commands were used. All existing modified and untracked user files remain intact.

---

## 3. Snapshot-Source Audit & Remediation Findings

### 3.1 Historical Replay Directory Isolation
- **Audit Issue**: In Phase 3C.4F.4, `loadAndValidateDiskSnapshot` searched across all report subdirectories including `scripts/predictor_model/reports/.../historical_replays`. This risked exposing retrospective evaluation fixtures as active race predictions.
- **Remediation**:
  1. Updated `app/lib/racePredictorService.ts`: ordinary search paths are strictly restricted to:
     - `data/predictor/snapshots`
     - `artifacts/dry_run_snapshots`
  2. Introduced explicit option `options?.includeHistoricalReplays?: boolean` in `SnapshotValidationOptions`.
  3. Replay report directories are only scanned if explicitly requested by testing harnesses.
  4. Verified via Vitest (`tests/phase_4f_5_e2e_verification.test.ts`) that ordinary queries ignore historical replay artifacts.

### 3.2 Deterministic Source Precedence
- **Resolution Strategy**: When multiple candidate snapshots match a race query, candidate selection evaluates deterministic precedence rules:
  1. **Stage Precedence**: `official_grid` > `provisional`.
  2. **Timestamp Freshness**: Newer ISO timestamp (`generatedAt`) wins over older timestamp.
  3. **Candidate Preference**: If timestamps are equal, snapshots with `hybrid_candidate_w020` method are preferred over legacy standard forecasts.
  4. **Lexical Tiebreak**: If still tied, candidates sort deterministically by `inputHash` ascending.

---

## 4. Hash Identity & Collision Rejection Findings

### 4.1 Authoritative 64-Character Hashes
- **Inference Input Hash (`inference_input_hash`)**:
  - Computed via SHA-256 over canonical JSON of all 42 input features per driver, driver roster, stage, baseline version, and model metadata.
  - Form: Exactly 64 hexadecimal characters (`^[a-f0-9]{64}$`).
- **Prediction Output Hash (`prediction_output_hash`)**:
  - Computed via SHA-256 over canonical JSON of the driver array containing all 5 probability keys: `driver_id`, `grid_position`, `grid_win_probability`, `ml_win_probability`, and `hybrid_win_probability`.
  - Form: Exactly 64 hexadecimal characters (`^[a-f0-9]{64}$`).

### 4.2 16-Character Prefix Collision Guard
- In both TypeScript (`validateSnapshot`) and Python (`validate_dry_run_snapshot`):
  - Legacy 16-character `input_hash` is verified to equal `inference_input_hash.substring(0, 16)`.
  - If a snapshot presents an `input_hash` that diverges from the 16-character prefix of `inference_input_hash`, the snapshot is immediately rejected with:
    - TS: `{ valid: false, error: 'PREFIX_COLLISION_MISMATCH', reason: 'Prefix collision / identity mismatch...' }`
    - PY: `SnapshotValidationError("PREFIX_COLLISION_MISMATCH", ...)`

### 4.3 Out-of-Band Model Artifact Binary Verification
- While `model_metadata` inside the JSON contains semantic version strings (`v1.0.0`), the physical binary SHA-256 hash of `trained_models.joblib` (`D8244024E6B7...`) is verified directly against the binary on disk before deserialization:
  - Implemented in Python: `load_and_verify_model_bundle`
  - Implemented in TypeScript: `getRacePrediction` (pre-execution verification)

---

## 5. Stage Handling & Fail-Closed Guard Findings

### 5.1 Provisional Stage Execution
- Valid provisional snapshots (e.g. `2025_1_dry_run_candidate_provisional.json`) correctly return `status: 'provisional'` with `hasPenaltiesApplied: false`.
- The UI surfaces the provisional status badge and warning.

### 5.2 Official Grid Stage Fail-Closed Enforcement
- When a client or API request specifically asks for `stage=official_grid`:
  - If a valid snapshot with `stage === 'official_grid'` is discovered, it is returned.
  - If **NO** valid official grid snapshot exists (such as for upcoming 2025 Round 1 where only provisional practice/qualifying data is staged):
    - The service returns `status: 'unavailable'` with `error: 'OFFICIAL_GRID_SNAPSHOT_NOT_FOUND'`.
    - It **never** silently falls back to provisional data.
    - It **never** fabricates or simulates official grid starting slots.

---

## 6. Ten-Step Local End-to-End Test Sequence

The complete prediction flow was verified across all 10 checkpoints:

| Step | Component | Action | Verification Standard | Result |
|---|---|---|---|---|
| **1** | Python Inference Runner | Execute dry-run runner for 2025 R1 Albert Park | Generates canonical JSON candidate with 20 drivers, 42 features, and hybrid probabilities | **PASSED** |
| **2** | Python Snapshot Validator | Validate snapshot invariants via `validate_dry_run_snapshot` | Asserts dual 64-char hashes, probability sum = 1.0, winner matching, and bounds | **PASSED** |
| **3** | TypeScript Validator | Validate snapshot across language boundary via `validateSnapshot` | Enforces exact contract compatibility between Python generator and TypeScript consumer | **PASSED** |
| **4** | Service Loader | Execute `loadAndValidateDiskSnapshot` | Correctly finds candidate, ignores historical replays, and parses 3-probability fields | **PASSED** |
| **5** | Next.js API Route | Simulate GET `/api/predictions/race/2025_1` | Returns HTTP 200 with formatted JSON payload containing hybrid win probabilities | **PASSED** |
| **6** | Client Data Deserializer | Parse API response in `page.tsx` hook | Correctly populates state with driver predictions, metadata, and regulation era | **PASSED** |
| **7** | Winner Matching Badge | Verify top predicted driver matches `predictedWinner` | Top entry (`norris`, 30.5%) exactly matches `predictedWinner.driverId` | **PASSED** |
| **8** | Probability Table Ordering | Check table row sort order | Sorted strictly by `winProbability` descending; labeled "Predicted Win Probability Order" | **PASSED** |
| **9** | 3-Probability Display | Verify `P_grid`, `P_ml`, and `P_hybrid` rendered | All 3 probabilities formatted as valid percentages; sums to 100% $\pm 0.1\%$ | **PASSED** |
| **10** | Dual Hash UI Consistency | Inspect UI provenance and footer | Renders authoritative dual 64-character hashes without truncation or corruption | **PASSED** |

---

## 7. Edge-Case Test Suite Results

The automated edge-case test suite (`tests/phase_4f_5_e2e_verification.test.ts` and `tests/test_phase_4f_5_e2e.py`) verified the following failure modes:

| Test Case | Scenario / Injected Fault | Expected Behavior | Verification Status |
|---|---|---|---|
| **EC-01** | Missing Snapshot File | Request race with nonexistent ID (`9999_99`) | Returns `status: 'unavailable'` cleanly without unhandled exception | **PASSED** |
| **EC-02** | Invalid JSON / Corrupted File | File contains truncated or invalid JSON syntax | Catches JSON parse error; marks snapshot invalid; falls back cleanly | **PASSED** |
| **EC-03** | Race ID Mismatch | Snapshot filename says `2025_1` but JSON payload contains `2024_24` | Fails validation with `IDENTITY_MISMATCH`; rejects file | **PASSED** |
| **EC-04** | Model Version Mismatch | Payload has `modelVersion: "v0.9.0-deprecated"` | Fails validation with `MODEL_VERSION_MISMATCH`; rejects file | **PASSED** |
| **EC-05** | Invalid Hash Length | `inference_input_hash` is corrupted to 60 characters | Fails validation with `INVALID_HASH_LENGTH`; rejects file | **PASSED** |
| **EC-06** | Prefix Collision Attack | 16-char `input_hash` does not match first 16 chars of `inference_input_hash` | Rejects with `PREFIX_COLLISION_MISMATCH` / `valid: false` | **PASSED** |
| **EC-07** | Invalid Output Hash Length | Corrupted `prediction_output_hash` (non-64 hex) | Fails validation with `INVALID_HASH_LENGTH`; rejects file | **PASSED** |
| **EC-08** | Non-Finite Probabilities | Probability contains `NaN` or `Infinity` | Fails bounds validation with `NON_FINITE_PROBABILITY`; rejects file | **PASSED** |
| **EC-09** | Probability Sum Violation | Normalized driver probabilities sum to $1.15 \neq 1.0$ | Fails sum validation with `PROBABILITY_SUM_VIOLATION`; rejects file | **PASSED** |
| **EC-10** | Incomplete Roster | Snapshot contains only 18 drivers instead of required 20 | Fails roster validation with `INCOMPLETE_ROSTER`; rejects file | **PASSED** |
| **EC-11** | Duplicate Driver IDs | Snapshot contains duplicate entries for same driver ID | Fails uniqueness check with `DUPLICATE_DRIVER_IDS`; rejects file | **PASSED** |
| **EC-12** | Stale Snapshot Invalidation | Older candidate snapshot competes with newer valid candidate | Precedence rules strictly select the newer timestamp | **PASSED** |
| **EC-13** | Official Grid Unavailable | Query `stage=official_grid` on 2025 R1 (provisional only) | Returns `status: 'unavailable'`, `error: 'OFFICIAL_GRID_SNAPSHOT_NOT_FOUND'` | **PASSED** |
| **EC-14** | 2026 Regulation Era Warning | Race in season 2026 requested | Surfaces `UNVALIDATED_2026_REGULATIONS` badge and disclaimer | **PASSED** |

---

## 8. Verification Metrics & Summary

### 8.1 Test Suite Counts
- **Vitest Suite**: 13 test files, **155 tests passed**, 0 failed.
  - Includes 18 dedicated end-to-end and edge-case integration tests in `tests/phase_4f_5_e2e_verification.test.ts`.
- **TypeScript Typecheck**: `node node_modules/typescript/bin/tsc --noEmit` exited with code 0 (zero errors).
- **Python Pytest Suite**: **318 tests passed**, 0 failed.
  - Includes 11 dedicated Python runner and cryptographic hash integrity tests in `tests/test_phase_4f_5_e2e.py`.

### 8.2 Scope Boundaries & Safety Attestations
1. **Model Freeze Maintained**: No new model was trained (Model C was not created). The frozen LightGBM bundle `models/predictor/v1.0.0/trained_models.joblib` was preserved intact with verified SHA-256 `D8244024E6B7...`.
2. **Formula Adherence**: Strictly maintained experimental geometric hybrid formula ($w=0.20$, Grid weight $0.80$, Laplace $\alpha=1.0$, prior $p_0=0.05$).
3. **Storage Isolation**: Zero writes to production databases or Supabase instances; all candidate snapshots were validated locally within `artifacts/dry_run_snapshots`.
4. **Git Tree Preservation**: Zero destructive git commands executed; all preexisting files and unstaged edits remain fully preserved.

---

## 9. Conclusion

Phase 3C.4F.5 has fully validated that the Paddock race predictor subsystem operates robustly, deterministically, and securely end-to-end. The experimental geometric hybrid forecasts are verified from Python dry-run generation through TypeScript API resolution and React UI presentation with complete cryptographic integrity, fail-closed stage guarantees, and comprehensive edge-case protection.

