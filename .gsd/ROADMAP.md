---
milestone: v1.0
version: 0.2.0
updated: 2026-10-13T01:50:00Z
---

# ROADMAP.md

> **Current Phase:** Phase 4: Strategy Lab, Telemetry Analytics & Replay Suite
> **Status:** 🔄 Executing
> **Milestone Target:** v1.0 (Paddock Telemetry Command Center)

---

## Must-Haves (from SPEC)

- [x] Official Competitive Sessions Telemetry (SQ, Sprint, Quali, Race)
- [x] Authentic Live Timing Tower & Clean FIA Race Control Log (no simulation engine)
- [x] 78-Circuit Interactive Vector Radar with 4,348 Calibrated Corners
- [x] 10 Constructor Themes with High-Res Wallpapers & Checkered Flag Mode
- [x] Secure Supabase PKCE Auth with Server-Side HS256 JWT HttpOnly Cookies
- [x] Comprehensive F1 Strategy Lab Suite (`/lab`): Circuit DNA Empirical Matrix, Tactical Strategy Duel & Pirelli C1–C5 Tyre Lab
- [ ] Comprehensive Telemetry Delta Comparison Matrix (`/compare`)
- [ ] 60fps GPU-Accelerated Canvas Race Replay for Historic & Modern Laps (`/replay`)

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

### Phase 4: Strategy Lab, Telemetry Analytics & Replay Suite
**Status:** 🔄 In Progress  
**Objective:** Deliver the F1 Strategy Lab suite (`/lab`), head-to-head telemetry analysis (`/compare`), teammate delta benchmarking (`/teammates`), and GPU-accelerated 60fps canvas replay (`/replay`) across all 2026 and legacy rounds.  
**Deliverables:**
- [x] Plan 4.1: Teammate head-to-head qualifying and race pace delta service (`app/lib/teammateDataService.ts`).
- [x] Plan 4.2: F1 Strategy Lab Suite (`app/lab/`):
  - **Circuit DNA & Sector Domination Matrix (`CircuitDNASectorMatrix.tsx`)**: 100% empirical session timing & speed trap telemetry (S1 high-speed aero, S2 technical mechanical grip, S3 power unit / DRS top speed), Theoretical Ultimate Lap benchmark, constructor aero dominance mapping, and sector-by-sector head-to-head duels.
  - **Head-to-Head Tactical Strategy Duel (`TacticalStrategyDuel.tsx`)**: Real race pace delta battle engine merged with 1-stop vs 2-stop undercut simulation, live gap evolution trajectory chart, and SC / VSC scenario injection.
  - **Tyre Degradation & Stint Whisperer Lab (`TyreDegradationLab.tsx`)**: Official track-specific Pirelli C1–C5 compound allocations, 3-phase non-linear thermal cliff model (Scrub-in Peak, Plateau, Exponential Cliff), dynamic crossover lap detection, fuel-burnoff compensation ($+0.055\text{s/lap}$), and driver Tyre Whisperer Index.
- [ ] Plan 4.3: Driver telemetry trace comparison (speed, throttle, brake, gear) with Chart.js overlays (`/compare`).
- [ ] Plan 4.4: 60fps canvas race replay with multi-car positioning and speed slider controls (`/replay`).

---

### Phase 5: Production Hardening, CI/CD & Cloud Deployment
**Status:** ⬜ Not Started  
**Objective:** Finalize automated end-to-end testing, bundle size optimization, Vercel production deployment, and cloud-hosted SignalR telemetry relay daemon.  
**Deliverables:**
- [ ] Plan 5.1: End-to-end Playwright workflow testing for authentication, circuit switching, and live timing.
- [ ] Plan 5.2: Cloud container deployment for `f1-proxy.js` with auto-reconnection watchdogs.
- [ ] Plan 5.3: Production bundle audit and cache headers optimization.

---

## Progress Summary

| Phase | Description | Status | Plans Completed | Progress |
| :---: | :--- | :---: | :---: | :---: |
| **1** | Core Architecture, Auth & Data Pipeline | ✅ Complete | 3 / 3 | 100% |
| **2** | 78-Circuit Vector Geometry & Corner Telemetry | ✅ Complete | 3 / 3 | 100% |
| **3** | Live Pit-Wall Telemetry & Competitive Radar | ✅ Complete | 4 / 4 | 100% |
| **4** | Strategy Lab, Telemetry Analytics & Replay | 🔄 In Progress | 2 / 4 | 50% |
| **5** | Production Hardening, CI/CD & Deployment | ⬜ Not Started | 0 / 3 | 0% |
| **Total** | **Milestone v1.0 Baseline** | 🔄 | **12 / 17** | **70.6%** |

---

*Last updated: 2026-10-13*
