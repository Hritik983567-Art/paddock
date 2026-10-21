---
milestone: v1.1
version: 0.3.0
updated: 2026-10-21T16:35:00Z
---

# ROADMAP.md

> **Current Phase:** Phase 6: Post-Qualifying ML Predictor, Design System & Telemetry HUD Overhaul
> **Status:** ✅ Complete
> **Milestone Target:** v1.1 (Paddock Race Predictor & Telemetry Design Polish)

---

## Must-Haves (from SPEC)

- [x] Official Competitive Sessions Telemetry (SQ, Sprint, Quali, Race)
- [x] Authentic Live Timing Tower & Clean FIA Race Control Log (no simulation engine)
- [x] 78-Circuit Interactive Vector Radar with 4,348 Calibrated Corners
- [x] 10 Constructor Themes with High-Res Wallpapers & Checkered Flag Mode
- [x] Secure Supabase PKCE Auth with Server-Side HS256 JWT HttpOnly Cookies
- [x] Comprehensive F1 Strategy Lab Suite (`/lab`): Circuit DNA Empirical Matrix, Tactical Strategy Duel & Pirelli C1–C5 Tyre Lab
- [x] Post-Qualifying AI Race Prediction Engine (`/predictor`) with 2026 Grid Calibration
- [x] Historical Accuracy Ledger & Model Calibration Auditing
- [x] Platform-Wide Elimination of Developer Annotations (`[TEL_01]`, `//`) for Broadcast Aesthetics
- [x] Translucent Glassmorphic Pit-Wall Authentication Portal (`AuthGate.tsx`)
- [x] 68 Unit, Integration & Benchmark Tests Passing (10 Vitest Suites)

---

## Phases

### Phase 1: Core Architecture, Auth & Data Pipeline
**Status:** ✅ Complete  
**Objective:** Establish Next.js 16 App Router foundation, Tailwind CSS v4 design system, Supabase PKCE authentication, HS256 JWT cookie middleware, and Jolpica F1 API client.  
**Deliverables:**
- [x] Plan 1.1: Next.js 16 + React 19 scaffold with dark pit-wall HUD typography and layout wrappers.
- [x] Plan 1.2: Server-side JWT authentication (`app/lib/jwt.ts`) and Supabase PKCE AuthGate (`app/components/AuthGate.tsx`).
- [x] Plan 1.3: Jolpica F1 API client and route handlers (`/api/circuits`, `/api/news`, `/api/weather`).

---

### Phase 2: 78-Circuit Vector Geometry & Corner Telemetry
**Status:** ✅ Complete  
**Objective:** Map, calibrate, and render vector SVG splines for 78 circuits (25 modern + 53 classic) with 4,348 corners, physics telemetry, chicane collision relaxation, and corner gallery modals.  
**Deliverables:**
- [x] Plan 2.1: `TRACKS_REGISTRY` & `circuitCornersData` catalog covering 78 venues with entry/apex/exit speeds and gears.
- [x] Plan 2.2: 5-pass iterative chicane collision relaxation (`circuitTransform.ts`) and auto-settle 90° orientation.
- [x] Plan 2.3: Interactive `CircuitMap.tsx` with corner selection, drag threshold, and modal gallery routing.

---

### Phase 3: Live Pit-Wall Telemetry & Competitive Session Radar
**Status:** ✅ Complete  
**Objective:** Replace artificial simulation engines with an authentic F1 SignalR pass-through proxy, active strictly during the 4 competitive sessions (Sprint Qualifying, Sprint Race, Qualifying, and Grand Prix), backed by clean Mission Control logging.  
**Deliverables:**
- [x] Plan 3.1: Clean SignalR proxy daemon (`scripts/f1-proxy.js`) streaming decompressed F1 timing data on port 8080.
- [x] Plan 3.2: 4-session timetable cards with live status, date formatting, and real-time start countdowns.
- [x] Plan 3.3: Removal of simulation tick loops, fake overtakes, and synthetic radio messages in `app/live/page.tsx`.
- [x] Plan 3.4: Authentic FIA Pit-Wall Telemetry Standby state, complete removal of `INITIAL_DRIVERS` and synthetic anchor lap noise, and genuine FIA Race Control event logging.

---

### Phase 4: Strategy Lab & Telemetry Analytics Suite
**Status:** ✅ Complete  
**Objective:** Deliver the F1 Strategy Lab suite (`/lab`), head-to-head telemetry analysis (`/compare`), teammate delta benchmarking (`/teammates`), and GPU-accelerated canvas replay (`/replay`) across all 2026 and legacy rounds.  
**Deliverables:**
- [x] Plan 4.1: Teammate head-to-head qualifying and race pace delta service (`app/lib/teammateDataService.ts`).
- [x] Plan 4.2: F1 Strategy Lab Suite (`app/lab/`):
  - **Circuit DNA & Sector Domination Matrix (`CircuitDNASectorMatrix.tsx`)**: 100% empirical session timing & speed trap telemetry, Theoretical Ultimate Lap benchmark, and constructor aero dominance mapping.
  - **Head-to-Head Tactical Strategy Duel (`TacticalStrategyDuel.tsx`)**: Real race pace delta battle engine merged with 1-stop vs 2-stop undercut simulation, live gap evolution trajectory chart, and SC / VSC scenario injection.
  - **Tyre Degradation & Stint Whisperer Lab (`TyreDegradationLab.tsx`)**: Official track-specific Pirelli C1–C5 compound allocations, 3-phase non-linear thermal cliff model, dynamic crossover lap detection, fuel-burnoff compensation ($+0.055\text{s/lap}$), and driver Tyre Whisperer Index.
- [x] Plan 4.3: Driver telemetry trace comparison (speed, throttle, brake, gear) with Chart.js overlays (`/compare`).
- [x] Plan 4.4: Canvas race replay with multi-car positioning and speed slider controls (`/replay`).

---

### Phase 5: Post-Qualifying ML Predictor & Historical Accuracy Ledger
**Status:** ✅ Complete  
**Objective:** Construct a calibrated Machine Learning predictor for race finishing distributions active strictly after Saturday Qualifying, supported by an immutable historical accuracy ledger and 2026 driver/team alignments.  
**Deliverables:**
- [x] Plan 5.1: Probabilistic ML model (`racePredictorService.ts`) with Saturday Qualifying state gating.
- [x] Plan 5.2: 2026 grid calibration (Hamilton at Ferrari, Sainz at Williams, Hulkenberg/Bortoleto at Sauber).
- [x] Plan 5.3: Interactive Predictor Workstation (`/predictor`) with winner projection, driver win probabilities, key determinants, and stochastic dynamic indicators.
- [x] Plan 5.4: Empirical Accuracy Ledger matching post-qualifying predictions with actual classified finishes.

---

### Phase 6: Design System Overhaul, Authentic Typography & Clean UI
**Status:** ✅ Complete  
**Objective:** Purge all developer code tags and comment slashes across the platform, restore official Formula 1 typography, deliver an unobstructed translucent glassmorphic authentication experience, and calibrate circuit replay geometry and starting grid staging.  
**Deliverables:**
- [x] Plan 6.1: Full elimination of bracketed developer tags (`[TEL_01]`, `[MAP_GPS]`, `[USR_AUTH]`, `[CAL_STREAM]`, etc.) and comment slashes (`//`) in visible UI labels.
- [x] Plan 6.2: Restored authentic Formula 1 typography (`Titillium Web`, `Roboto Condensed`, `Inter`), completely removing legacy `Times New Roman` serif overrides.
- [x] Plan 6.3: Translucent Glassmorphic Pit-Wall Authentication Portal (`AuthGate.tsx`) with seamless full-car background visibility, uncluttered credentials focus, and zero opaque slicing.
- [x] Plan 6.4: Race Replay Circuit Geometry & Grid Staging Overhaul (`CircuitReplay.tsx` & `circuitTransform.ts`): high-density centerline track coordinates, `invertY` coordinate check, opt-in auto-settle, upright gate split labels, and 2x2 tangent starting grid boxes.

---

## Progress Summary

| Phase | Description | Status | Plans Completed | Progress |
| :---: | :--- | :---: | :---: | :---: |
| **1** | Core Architecture, Auth & Data Pipeline | ✅ Complete | 3 / 3 | 100% |
| **2** | 78-Circuit Vector Geometry & Corner Telemetry | ✅ Complete | 3 / 3 | 100% |
| **3** | Live Pit-Wall Telemetry & Competitive Radar | ✅ Complete | 4 / 4 | 100% |
| **4** | Strategy Lab & Telemetry Analytics Suite | ✅ Complete | 4 / 4 | 100% |
| **5** | Post-Qualifying ML Predictor & Accuracy Ledger | ✅ Complete | 4 / 4 | 100% |
| **6** | Design System Overhaul & Glassmorphic HUD | ✅ Complete | 4 / 4 | 100% |
| **Total** | **Milestone v1.1 Baseline** | ✅ | **22 / 22** | **100%** |

---

*Last updated: 2026-10-21*
