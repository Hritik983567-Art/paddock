# Phase 3C.4F.6 — Final Prediction Tab Visual and Functional QA Report

**Date**: 2026-11-05  
**Environment**: Python 3.10.11 / Node.js v24.19.0 / Vitest 2.1.9 / TypeScript 5.8 / React 19.2.4 / Next.js 16.2.10  
**Repository Working Tree**: `c:\Users\Lenovo\OneDrive\Desktop\Projects\paddock` (Preserved Working Tree)  
**Execution Context**: Phase 3C.4F.6 Final Prediction Tab Visual & Functional QA Review  

---

## 1. Executive Summary

Phase 3C.4F.6 has completed the final comprehensive visual, functional, and architectural QA review of the Paddock Prediction tab following Phase 3C.4F.5. 

The primary objective was to confirm that the existing prediction implementation functions reliably and renders cleanly from an end-user's perspective across desktop (1280px) and mobile (390px) viewports without altering the underlying ML model, geometric hybrid formula ($w=0.20$, Laplace $\alpha=1.0$), or prediction subsystem architecture.

### Key Deliverables & Outcomes
1. **Targeted Technical Audit Completed**:
   - Re-aligned model binary SHA-256 verification: Confirmed that physical model binary SHA-256 verification (`D8244024E6B7...`) belongs authoritatively to the Python inference runner (`scripts/predictor_pipeline/run_inference_snapshot.py`). Corrected the TypeScript service (`app/lib/racePredictorService.ts`) so that snapshot delivery is not blocked by a synchronous read of an 80MB Python binary that TypeScript cannot execute.
   - Confirmed snapshot precedence strictly decouples stage priority (`official_grid` $\succ$ `provisional`) from timestamp freshness.
   - Empirically proved driver roster validation is race-specific (e.g. 19 classified entrants validated for 2026 R1), not permanently fixed at 20.
   - Clarified that Phase F.5 only tested data contracts, runner logic, and API endpoints; Phase F.6 actually rendered and visually inspected the complete React component tree.
2. **Desktop UI Verification (1280px)**:
   - Rendered and inspected the complete desktop view: Predicted Winner Banner, Field Probability Rankings, Model Fusion 3-probability view, Explanations Panel (SHAP factors + venue history), Experimental Hybrid Model Notice, and 2026 Regulation Era Warning.
   - Generated static HTML artifact: [`desktop_prediction_view.html`](file:///c:/Users/Lenovo/OneDrive/Desktop/Projects/paddock/artifacts/visual_qa/desktop_prediction_view.html).
3. **Mobile UI Verification (390px)**:
   - Rendered and inspected the mobile responsive layout: Verified horizontal containment (`overflow-x-auto`, `w-full`), responsive flex direction (`flex-col sm:flex-row`), readable typography, and non-breaking expandable driver cards.
   - Generated static HTML artifact: [`mobile_prediction_view.html`](file:///c:/Users/Lenovo/OneDrive/Desktop/Projects/paddock/artifacts/visual_qa/mobile_prediction_view.html).
4. **Full Test Suite Verification**:
   - Vitest: **173 passed** across 14 test files (0 failures).
   - TypeScript Typecheck: **0 compilation errors** (`tsc --noEmit`).
   - Python Pytest Suite: **318 passed** across all test files (0 failures).

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

## 3. Targeted Technical Audit Findings & Remediation

### 3.1 Point 1: Physical Model Artifact SHA-256 Verification Ownership
- **Audit Finding**: In Phase F.5, `getRacePrediction` in `app/lib/racePredictorService.ts` was modified to execute `fs.readFileSync(MODEL_BUNDLE_PATH)` and calculate its SHA-256 synchronously at the very entry of the function.
- **Architectural Flaw**:
  1. `trained_models.joblib` is an 80MB Python binary containing serialized scikit-learn / LightGBM objects. The Node.js / TypeScript runtime cannot deserialize or execute this binary.
  2. Gating `getRacePrediction` on `fs.existsSync(MODEL_BUNDLE_PATH)` caused snapshot retrieval to fail if the web server was deployed without the local Python model file, even when valid, cryptographically signed JSON snapshots were available on disk or in the database.
  3. Reading an 80MB file synchronously on every web request causes severe event-loop blocking.
- **Remediation**:
  1. Affirmed that physical model binary SHA-256 verification belongs authoritatively to the Python inference runner (`scripts/predictor_pipeline/run_inference_snapshot.py`), where `load_and_verify_model_bundle` verifies `D8244024E6B7...` before unpickling.
  2. Removed the blocking synchronous file read from the TypeScript snapshot serving path in `app/lib/racePredictorService.ts`.
  3. The TypeScript service now focuses on verifying snapshot schema invariants and cryptographic hashes (`inferenceInputHash`, `predictionOutputHash`, `inputHash`).

### 3.2 Point 2: Snapshot Precedence Decouples Stage Priority from Freshness
- **Audit Finding**: In `compareSnapshotPrecedence`, candidate snapshots are compared across a strict hierarchy:
  1. **Rule 1 (Stage Precedence)**: `official_grid` strictly beats `provisional`. If snapshot A is `official_grid` and snapshot B is `provisional`, snapshot A wins regardless of generated timestamps.
  2. **Rule 2 & 3 (Timestamp Freshness)**: Timestamp comparison (`tsA > tsB`) is only evaluated *between snapshots of the same stage*.
  3. **Rule 4 (Candidate Preference)**: On timestamp tie, hybrid candidate models are preferred over legacy standard forecasts.
  4. **Rule 5 (Deterministic Tiebreak)**: Lexical sorting on `inputHash`.
- **Verdict**: Stage priority and timestamp freshness are completely separated and evaluated hierarchically.

### 3.3 Point 3: Expected Driver Roster Validation is Race-Specific
- **Audit Finding**: In both Python (`validate_dry_run_snapshot`) and TypeScript (`validateSnapshot`), roster validation compares `predictions.length` directly against `snapshot.expectedRoster.length` (or `qualifyingStatus.totalClassified`).
- **Empirical Evidence**: The real 2026 R1 candidate snapshot (`2026_1_albert_park_provisional_v1.0.0_hybrid_74bd99dca49ce975.json`) contains **19 classified entrants** (due to a late driver withdrawal scenario). Both Python and TypeScript validators pass this snapshot with `valid: true`. Neither code path permanently fixes the roster at 20.

### 3.4 Point 4: F.5 Verification Scope vs. F.6 Visual Rendering
- **Audit Finding**: Phase F.5 executed unit and integration test suites (`vitest` and `pytest`) asserting JSON structures, hash lengths, API HTTP response codes, and mathematical invariants. It did not render the React component tree to inspect styling, visual hierarchy, layout responsiveness, or overflow behavior.
- **Phase F.6 Action**: Rendered all components into full static HTML documents with complete Tailwind CSS and Paddock styling to visually inspect desktop (1280px) and mobile (390px) viewports.

---

## 4. Desktop UI Review (1280px Resolution)

The desktop layout was rendered to [`desktop_prediction_view.html`](file:///c:/Users/Lenovo/OneDrive/Desktop/Projects/paddock/artifacts/visual_qa/desktop_prediction_view.html) and inspected across all primary components:

### 4.1 Predicted Winner Banner
- **Header**: Features a pulsing cyan status dot, `"Projected Race Winner"` badge, and venue chip (`"Albert Park Grand Prix Circuit"`).
- **Driver Card**: High-contrast driver portrait with McLaren orange border (`#FF8000`), starting grid badge (`P1`), driver code (`NOR`), driver number (`#4`), and national flag (`🇬🇧`).
- **Probability Display**: Bold cyan probability forecast (`49.4%`) with gradient probability bar (`#00FF9C` $\to$ `#FF8000`), accompanied by statistical context text.
- **Visual Balance**: Zero overlapping elements; cleanly separated into driver identity (left) and forecast metric (right).

### 4.2 Probability Rankings Table
- **Header**: Section title `"Official Field Win Probability Rankings"` with explanatory subtitle.
- **View Mode Switcher**: Tab pills for `"All Overview"`, `"Quali Scenario"`, `"Track Heritage"`, and `"Model Fusion"`.
- **Search Bar**: Monospace input with inner search icon for driver/team filtering.
- **Table Grid**: Sticky headers, crisp borders (`border-white/10`), team color accents, and responsive layout.
- **Sorting**: Monospace probability values with directional sort indicators (`↓` / `↑`).

### 4.3 Model Fusion Breakdown
- **Tab Activation**: Selecting the `"Model Fusion"` tab reveals three dedicated probability columns:
  - `Grid Base (80%)` in amber (`text-amber-300`).
  - `ML Model (20%)` in cyan (`text-cyan-300`).
  - `Hybrid Win %` in neon green (`text-[#00FF9C]`).
- **Row Expansion**: Clicking any driver expands a dedicated `"Model Fusion Breakdown"` card with interactive comparison bars illustrating how the baseline and ML model combined to form the final prediction.

### 4.4 Disclosures & Regulation Warnings
- **Experimental Notice**: Amber-bordered card (`border-amber-500/40`) declaring `"Experimental Hybrid Model (Non-Production)"` with formula version badge `geometric-w0.20-v1` and semantic label `Predicted Win Probability Order`.
- **2026 Warning**: Prominent notice on 2026 races displaying `UNVALIDATED_2026_REGULATIONS` and full active aero/sustainable fuel disclaimer.

---

## 5. Mobile UI Review (390px Viewport)

The mobile layout was rendered to [`mobile_prediction_view.html`](file:///c:/Users/Lenovo/OneDrive/Desktop/Projects/paddock/artifacts/visual_qa/mobile_prediction_view.html) and verified for iPhone 12/13/14-class viewports (~390px):

### 5.1 Viewport Containment & Flow
- **Horizontal Overflow**: Verified that table containers incorporate `overflow-x-auto` while parent cards use `w-full max-w-full`. No horizontal window blowout occurs.
- **Responsive Stacking**: Notice banners automatically adapt from row to column layout via `flex flex-col sm:flex-row gap-2`, ensuring text and badges stack comfortably without clipping.
- **Compact Badges**: Badges scale gracefully using `text-[9px]` and `text-[10px]` with reduced padding (`px-2 py-0.5`).

### 5.2 Mobile Driver Cards
- Each entrant is rendered as a clean mobile card with driver code, team color dot, starting grid (`P#`), qualifying position (`Q: P#`), and prominent win probability (`0.1%` – `49.4%`).
- Progress bars scale to `w-full` with fixed height (`h-2`).
- Compact 3-column fusion summary grid displays `Grid Base (80%)`, `ML Model (20%)`, and `Hybrid Win` directly on mobile.
- Expand button (`▼ Expand Telemetry & Track Heritage`) is touch-friendly ($>44\text{px}$ touch target).

---

## 6. Functional Verification Invariants

All functional invariants were empirically tested via [`tests/phase_4f_6_visual_functional_qa.test.tsx`](file:///c:/Users/Lenovo/OneDrive/Desktop/Projects/paddock/tests/phase_4f_6_visual_functional_qa.test.tsx):

| Functional Check | Test Scenario | Verified Behavior | Status |
|---|---|---|---|
| **Winner Matching** | Compare `predictedWinner.driverId` to top array entrant | Exactly matches `norris` (`49.4%`) | **PASSED** |
| **Probability Ordering** | Verify array sorting | Strictly descending: $P_i \ge P_{i+1}$ for all $i \in [0, N-1]$ | **PASSED** |
| **Probability Bounds** | Invariant check on $P_{\text{grid}}$, $P_{\text{ML}}$, $P_{\text{hybrid}}$ | All values finite, $\in [0, 1]$, and sum to $1.0 \pm 0.005$ | **PASSED** |
| **Stage Fail-Closed** | Request `stage=official_grid` on 2025 R1 (provisional only) | Returns `null` / `OFFICIAL_GRID_SNAPSHOT_NOT_FOUND`; never falls back to provisional | **PASSED** |
| **Missing Snapshot** | Request nonexistent race `9999_99` | Returns `null` / `status: 'unavailable'` cleanly | **PASSED** |
| **Roster Dynamic Size** | Validate 2026 R1 with 19 entrants | Evaluates against `expectedRoster.length == 19`; returns `valid: true` | **PASSED** |

---

## 7. Verification Metrics & Summary

### 7.1 Automated Test Suite Results
- **Vitest Suite**: 14 test files, **173 tests passed**, 0 failed.
  - Includes 18 visual and functional QA tests in `tests/phase_4f_6_visual_functional_qa.test.tsx`.
- **TypeScript Typecheck**: `tsc --noEmit` exited with code 0 (**zero compilation errors**).
- **Python Pytest Suite**: **318 tests passed**, 0 failed.

### 7.2 Rendered Visual Artifacts
The following full HTML documents are generated in [`artifacts/visual_qa/`](file:///c:/Users/Lenovo/OneDrive/Desktop/Projects/paddock/artifacts/visual_qa/):
1. [`desktop_prediction_view.html`](file:///c:/Users/Lenovo/OneDrive/Desktop/Projects/paddock/artifacts/visual_qa/desktop_prediction_view.html) (114 KB) — Full desktop layout with experimental banner, winner banner, table, and SHAP explanations.
2. [`mobile_prediction_view.html`](file:///c:/Users/Lenovo/OneDrive/Desktop/Projects/paddock/artifacts/visual_qa/mobile_prediction_view.html) (100 KB) — Mobile 390px viewport container with responsive cards and fusion chips.
3. [`model_fusion_view.html`](file:///c:/Users/Lenovo/OneDrive/Desktop/Projects/paddock/artifacts/visual_qa/model_fusion_view.html) (96 KB) — Model Fusion view exposing grid baseline (80%) and ML likelihood (20%).
4. [`regulation_era_warning_view.html`](file:///c:/Users/Lenovo/OneDrive/Desktop/Projects/paddock/artifacts/visual_qa/regulation_era_warning_view.html) (92 KB) — 2026 unvalidated regulation era warning layout.

---

## 8. Remaining Limitations

1. **Static Pre-Rendering Boundary**: While the complete React component tree was rendered to HTML and verified, native WebGL telemetry canvas components (e.g. 3D satellite circuit visualizers) require an interactive browser canvas context to initialize WebGL shaders.
2. **Offline Experimental Model**: The geometric hybrid ($w=0.20$, $\alpha=1.0$) is strictly validated for offline research and candidate staging. It remains non-production software until formal governance approval.

---

## 9. Conclusion

Phase 3C.4F.6 has fully verified that the Paddock Prediction tab is visually polished, functionally sound, and architecturally robust across desktop and mobile form factors. All data contracts, cryptographic hash identities, stage fail-closed policies, and multi-probability visual representations operate seamlessly from the end user's perspective.

