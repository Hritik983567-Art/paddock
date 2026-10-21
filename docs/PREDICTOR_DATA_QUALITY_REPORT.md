# Paddock Race Predictor — Historical Dataset Quality & Validation Report

*Generated: 2026-10-20T18:28:26.301430+00:00*

**Overall Validation Status**: `PASSED`

### 1. Row Counts & Primary Key Uniqueness
- **Total Driver-Race Observations**: `1,798`
- **Distinct Grand Prix Sessions**: `90`
- **Duplicate `(season, round, driver_id)` Rows**: `0`
✅ **PASSED**: Zero duplicate driver-race primary keys detected.

---

### 2. Identifier Integrity & Physical Position Bounds
- **Invalid Grid Positions (< 1 or > 30)**: `0`
- **Invalid Qualifying Positions (< 1 or > 30)**: `0`
- **Missing Driver Identifiers**: `0`
- **Missing Constructor Identifiers**: `0`
✅ **PASSED**: All positions are strictly within physiological bounds [1, 30] and all entities identified.

---

### 3. Qualifying & Starting Grid Completeness
- **Missing Grid Positions**: `0`
- **Missing Qualifying Positions**: `0`
- **Missing Qualifying Pace Delta to Pole**: `18` (1.0%)
- **Grid Penalty Math Inconsistencies**: `0`
✅ **PASSED**: 100% complete grid and qualifying positions with verified penalty deltas.

---

### 4. Single Winner Conservation Invariant
- **Races with Exactly 1 Winner (`won_race == 1`)**: `90 / 90` (100.0%)
- **Races with 0 Winners**: `0`
- **Races with >1 Winners**: `0`
✅ **PASSED**: Exactly one driver won each and every completed Grand Prix.

---

### 5. Temporal Leakage & Rolling Window Audit
- **Round 1 Driver Season Points Leaked (> 0 prior to Round 1)**: `0`
- **Round 1 Constructor Season Points Leaked (> 0 prior to Round 1)**: `0`
- **Target Variable (`won_race`) Isolated From Pre-Race Inputs**: `YES (100% verified)`
✅ **PASSED**: Temporal boundary strictly respected. Round 1 pre-race points are exactly 0.0.

---

### 6. Schema Consistency & Feature Completeness
- **Expected Feature Columns**: `60`
- **Present Feature Columns**: `60`
- **Missing Columns**: `0`
- **Extra Columns**: `0`
✅ **PASSED**: 100% schema match with FEATURE_SCHEMA specification.

---

### 7. Season Coverage & Data Provenance Distribution
**Grand Prix Sessions Covered by Season:**
- **2021**: `22` Grand Prix
- **2022**: `22` Grand Prix
- **2023**: `22` Grand Prix
- **2024**: `24` Grand Prix

**Data Provenance Breakdown:**
- `jolpica`: `919` driver-race rows (51.1%)
- `jolpica+fastf1`: `879` driver-race rows (48.9%)

**Documented Historical Anomalies:**
- **2021 Spa-Francorchamps (Belgium)**: 1-lap rain stoppage under safety car; half-points awarded; Verstappen classified winner from Pole.
- **2023 Imola (Emilia Romagna)**: Cancelled due to catastrophic regional flooding; safely skipped in ingestion.
- **Pit-Lane Starts**: Standardized to position 20 with explicit `grid_penalty_delta = 20 - quali_position`.